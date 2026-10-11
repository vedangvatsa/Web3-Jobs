import fs from 'node:fs';
import path from 'node:path';
import { currentRun, loadResearch, writeReport, writeResearch } from './news-research.mjs';
import { LEDGER_PATH, RESEARCH_DIR, finalizeResearch, researchReport } from './lib/news-research.mjs';
import { pushNewsFiles } from './lib/news-publish.mjs';
import { canonicalNewsUrl } from './news-discover.mjs';
import { validateNewsDrafts } from './lib/news-validation.mjs';

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
  const { ready, draftPaths, validationErrors } = validateNewsDrafts({ context: { day, baseSha }, ledger });
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
