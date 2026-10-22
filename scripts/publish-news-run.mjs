import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { currentRun, loadResearch, writeReport, writeResearch } from './news-research.mjs';
import { LEDGER_PATH, RESEARCH_DIR, finalizeResearch, researchReport, reportMarkdown } from './lib/news-research.mjs';
import { pushNewsFiles } from './lib/news-publish.mjs';
import { validateNewsDrafts } from './lib/news-validation.mjs';

function output(name, value) { if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `${name}=${value}\n`); }

export function publishNewsRun({ cwd = process.cwd(), dryRun = false, validate = validateNewsDrafts, publish = pushNewsFiles, now = Date.now, env = process.env } = {}) {
  if (!dryRun && env.GITHUB_ACTIONS !== 'true') throw new Error('Live news publishing requires GitHub Actions; use --dry-run locally');
  const context = currentRun(cwd), { day, baseSha, checkpointSha, persist } = context, ledger = loadResearch(cwd), run = ledger.runs[day];
  if (!dryRun && (env.NEWS_DRY_RUN === 'true' || !persist)) throw new Error('A dry-run research queue cannot be published');
  const before = researchReport(ledger, day);
  if (before.publicationComplete) {
    return { report: writeReport(ledger, day, cwd), complete: true, articlesChanged: false, publishedSha: context.publishedSha || checkpointSha || baseSha, alreadyPublished: true };
  }
  if (before.counts.published || before.status === 'completed') throw new Error('Daily news publication has no valid completion receipt');
  const result = validate({ context, ledger, cwd, publishReadyBatch: true });
  const publicationTime = typeof now === 'function' ? now() : now;
  const { ready, draftPaths, draftsValid } = result, validationErrors = [...result.validationErrors];
  if (ready.length && draftsValid !== true && !validationErrors.length) validationErrors.push('Ready batch did not pass the article validator');
  if (new Date(publicationTime).toISOString().slice(0, 10) !== day) validationErrors.push('Research day changed during publication');
  if (result.fatalErrors.length) {
    run.validationErrors = validationErrors;
    return { report: researchReport(ledger, day), complete: false, articlesChanged: false };
  }
  const publicationReady = before.discoveryHealthy && !validationErrors.length && (draftsValid === true || (!ready.length && before.counts.unreviewed === 0));
  if (dryRun) {
    run.validationErrors = validationErrors;
    return { report: writeReport(ledger, day, cwd), complete: publicationReady, publicationReady, articlesChanged: false };
  }
  const unpublished = structuredClone(ledger);
  const report = finalizeResearch(ledger, day, { validationErrors, allowBacklogPublication: publicationReady && ready.length > 0, now: publicationTime });
  const articlesChanged = report.publicationComplete && ready.length > 0;
  const files = [LEDGER_PATH, ...(articlesChanged ? draftPaths : [])];
  let sha;
  try {
    writeResearch(ledger, cwd); writeReport(ledger, day, cwd);
    sha = publish({ cwd, baseSha, expectedBaseSha: checkpointSha || baseSha, files: [...new Set(files)], day,
      message: articlesChanged ? `news: publish reviewed daily batch for ${day}` : `news: record ${report.complete ? 'completed' : 'incomplete'} research for ${day} [skip ci]` });
    if (!/^[a-f0-9]{40}$/.test(sha || '')) throw new Error('News publication returned no confirmed commit');
  } catch (error) {
    const retry = unpublished.runs[day];
    retry.status = 'incomplete'; delete retry.completedAt; delete retry.publication;
    retry.validationErrors = [...validationErrors, `Publication not confirmed: ${error.message}`];
    writeResearch(unpublished, cwd); writeReport(unpublished, day, cwd);
    throw error;
  }
  context.checkpointSha = sha;
  if (report.publicationComplete) context.publishedSha = sha;
  fs.writeFileSync(path.join(cwd, RESEARCH_DIR, 'current.json'), JSON.stringify(context, null, 2) + '\n');
  return { report, complete: report.publicationComplete, articlesChanged, publishedSha: sha };
}

function main() {
  const dryRun = process.argv.includes('--dry-run');
  const { report, complete, articlesChanged, publishedSha, alreadyPublished, publicationReady } = publishNewsRun({ dryRun });
  output('articles_changed', articlesChanged); output('complete', complete); output('coverage_complete', report.complete); output('publication_complete', report.publicationComplete);
  if (publishedSha) output('published_sha', publishedSha);
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, reportMarkdown(report));
  console.log(JSON.stringify({ day: report.day, dryRun, alreadyPublished: Boolean(alreadyPublished), ...report.counts, complete,
    publicationComplete: report.publicationComplete, coverageComplete: report.complete, ...(dryRun ? { publicationReady } : {}), validationErrors: report.validationErrors }, null, 2));
  if (!complete) throw new Error('Daily news publication is incomplete. Check the ready-draft audit, feed health and pending research report.');
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try { main(); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
