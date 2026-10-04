import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import matter from 'gray-matter';
import { currentRun, loadResearch, writeReport, writeResearch } from './news-research.mjs';
import { LEDGER_PATH, RESEARCH_DIR, finalizeResearch, researchReport } from './lib/news-research.mjs';
import { pushNewsFiles } from './lib/news-publish.mjs';
import { canonicalNewsUrl } from './news-discover.mjs';

const dryRun = process.argv.includes('--dry-run');
function output(name, value) { if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `${name}=${value}\n`); }

async function main() {
  if (!dryRun && process.env.GITHUB_ACTIONS !== 'true') throw new Error('Live news publishing requires GitHub Actions; use --dry-run locally');
  const { day, baseSha, checkpointSha, persist } = currentRun(), ledger = loadResearch(), run = ledger.runs[day];
  if (!dryRun && (process.env.NEWS_DRY_RUN === 'true' || !persist)) throw new Error('A dry-run research queue cannot be published');
  const before = researchReport(ledger, day);
  if (before.status === 'completed') {
    writeReport(ledger, day); output('articles_changed', false); output('complete', true); output('published_sha', baseSha);
    console.log(`News research for ${day} is already complete.`);
    return;
  }
  const ready = before.outcomes.filter(item => item.status === 'ready');
  const draftPaths = [], validationErrors = [];
  for (const item of ready) {
    const file = `content/articles/${item.articleSlug}.md`;
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)?$/.test(item.articleSlug || '') || !fs.existsSync(file)) { validationErrors.push(`Missing draft for ${item.title}`); continue; }
    if (fs.lstatSync(file).isSymbolicLink()) { validationErrors.push(`Symlink in draft output: ${file}`); continue; }
    draftPaths.push(file);
    const { data } = matter(fs.readFileSync(file, 'utf8'));
    if (typeof data.image === 'string' && new RegExp(`^/images/news/${item.articleSlug}\\.(jpg|jpeg|png|webp)$`).test(data.image) && fs.existsSync(`public${data.image}`)) draftPaths.push(`public${data.image}`);
    else validationErrors.push(`Missing article-specific image: ${item.articleSlug}`);
  }
  const recovery = path.join(RESEARCH_DIR, 'recovery');
  const gitPaths = args => execFileSync('git', args, { encoding: 'utf8' }).split('\0').filter(Boolean);
  const protectedChanges = gitPaths(['diff', '--name-only', '-z', baseSha]).filter(file => ![LEDGER_PATH, 'content/news-tips.md', ...draftPaths].includes(file));
  for (const file of protectedChanges) validationErrors.push(`Drafter changed a protected or generated file: ${file}`);
  const changed = [...new Set([
    ...gitPaths(['diff', '--name-only', '-z', baseSha, '--', 'content/articles', 'public/images/news']),
    ...gitPaths(['ls-files', '--others', '--exclude-standard', '-z', '--', 'content/articles', 'public/images/news']),
  ])];
  for (const file of [...new Set([...changed, ...draftPaths])]) {
    if (!fs.existsSync(file)) { validationErrors.push(`Drafter deleted an existing file: ${file}`); continue; }
    if (fs.lstatSync(file).isSymbolicLink()) { validationErrors.push(`Symlink in draft output: ${file}`); continue; }
    const target = path.join(recovery, file); fs.mkdirSync(path.dirname(target), { recursive: true }); fs.copyFileSync(file, target);
    if (file.startsWith('content/articles/') && !draftPaths.includes(file)) validationErrors.push(`Draft has no ready review outcome: ${file}`);
  }
  if (before.discoveryHealthy && before.counts.unreviewed === 0 && ready.length && !validationErrors.length) {
    try {
      const validation = JSON.parse(execFileSync(process.execPath, ['--import', 'tsx', 'scripts/validate-news-drafts.ts', ...ready.map(item => item.articleSlug)], { encoding: 'utf8', env: { ...process.env, NEWS_DATE: day }, maxBuffer: 16 * 1024 * 1024 }));
      validationErrors.push(...validation.errors);
    } catch (error) { validationErrors.push(`Article validation could not finish: ${error.message}`); }
  }
  if (process.env.NEWS_DATE && process.env.NEWS_DATE !== day) validationErrors.push('Research day changed during publication');
  let report;
  if (dryRun) {
    run.validationErrors = validationErrors;
    report = writeReport(ledger, day);
    output('articles_changed', false); output('complete', report.complete);
  } else {
    report = finalizeResearch(ledger, day, { validationErrors });
    const files = [LEDGER_PATH];
    if (report.complete && ready.length) files.push(...draftPaths);
    const resolvedTips = new Set(report.outcomes.filter(item => ['published', 'rejected'].includes(item.status)).map(item => canonicalNewsUrl(item.link)));
    const tipsFile = 'content/news-tips.md', tips = fs.readFileSync(tipsFile, 'utf8');
    const updatedTips = tips.split('\n').filter(line => !resolvedTips.has(canonicalNewsUrl(line.match(/^\s*-\s+(https?:\/\/\S+)/)?.[1]))).join('\n');
    if (tips !== updatedTips) { fs.writeFileSync(tipsFile, updatedTips); files.push(tipsFile); }
    writeResearch(ledger); writeReport(ledger, day);
    let sha;
    try {
      sha = pushNewsFiles({ baseSha, expectedBaseSha: checkpointSha || baseSha, files: [...new Set(files)], day, message: report.complete && ready.length ? `news: publish reviewed daily batch for ${day}` : `news: record ${report.complete ? 'completed' : 'incomplete'} research for ${day} [skip ci]` });
    } catch (error) {
      for (const item of ready) {
        run.outcomes[item.id].status = 'ready'; delete run.outcomes[item.id].publishedAt;
        ledger.candidates[item.id].status = 'ready'; delete ledger.candidates[item.id].publishedAt;
      }
      run.status = 'incomplete'; delete run.completedAt;
      run.validationErrors.push(`Publication not confirmed: ${error.message}`);
      writeResearch(ledger); writeReport(ledger, day);
      throw error;
    }
    output('published_sha', sha); output('articles_changed', report.complete && ready.length > 0); output('complete', report.complete);
  }
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, fs.readFileSync(path.join(RESEARCH_DIR, 'report.md'), 'utf8'));
  console.log(JSON.stringify({ day, dryRun, ...report.counts, complete: report.complete, validationErrors }, null, 2));
  if (!report.complete) throw new Error('Daily news coverage is incomplete. Review the unreviewed candidates, feed errors and validation report.');
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
