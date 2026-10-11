import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { currentRun, loadResearch, writeReport, writeResearch } from './news-research.mjs';
import { RESEARCH_DIR } from './lib/news-research.mjs';
import { validateNewsDrafts } from './lib/news-validation.mjs';

export function validateNewsRun({ cwd = process.cwd(), persist = false, audit } = {}) {
  const context = currentRun(cwd), ledger = loadResearch(cwd);
  const result = validateNewsDrafts({ context, ledger, cwd, audit });
  ledger.runs[context.day].validationErrors = result.validationErrors;
  if (persist) writeResearch(ledger, cwd);
  const report = writeReport(ledger, context.day, cwd);
  const feedback = {
    day: context.day, complete: report.complete, discoveryHealthy: report.discoveryHealthy,
    counts: report.counts, readySlugs: result.ready.map(item => item.articleSlug),
    validationErrors: result.validationErrors, fatalErrors: result.fatalErrors,
  };
  fs.writeFileSync(path.join(cwd, RESEARCH_DIR, 'validation.json'), `${JSON.stringify(feedback, null, 2)}\n`);
  return feedback;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const feedback = validateNewsRun();
    console.log(JSON.stringify(feedback, null, 2));
    if (!feedback.complete) process.exitCode = 1;
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
