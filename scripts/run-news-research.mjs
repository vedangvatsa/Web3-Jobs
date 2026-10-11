import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { currentRun, loadResearch, writeReport } from './news-research.mjs';
import { researchReport } from './lib/news-research.mjs';
import { validateNewsRun } from './validate-news-run.mjs';

export async function runResearchRounds({ remaining, reviewed = () => 0, write, log = console.log, idleLimit = 2 }) {
  let idle = 0;
  for (let round = 1; ; round++) {
    const before = remaining(), reviewedBefore = reviewed();
    if (before === 0) return;
    log(`Research round ${round}: ${before} candidates still need outcomes.`);
    try { await write(round); } catch { log('Writer stopped; checking its persisted research progress.'); }
    const after = remaining();
    if (after === 0) return;
    idle = after < before || reviewed() > reviewedBefore ? 0 : idle + 1;
    if (idle >= idleLimit) throw new Error(`${after} candidates remain unreviewed after ${idle} attempts without progress`);
  }
}

export async function runValidatedResearch({ remaining, reviewed, write, validate, repair, log = console.log, maxRepairRounds = 3 }) {
  if (!Number.isInteger(maxRepairRounds) || maxRepairRounds < 0) throw new Error('Invalid validation-repair limit');
  let repairs = 0;
  while (true) {
    await runResearchRounds({ remaining, reviewed, write, log });
    const feedback = await validate();
    if (feedback.complete && feedback.validationErrors.length === 0 && feedback.counts.unreviewed === 0) return feedback;
    if (feedback.fatalErrors.length) throw new Error(`News validation needs an operator: ${feedback.fatalErrors.join('; ')}`);
    if (!feedback.discoveryHealthy) throw new Error('News discovery failed; a writer cannot repair unavailable feeds');
    if (repairs >= maxRepairRounds) throw new Error(`News validation remains incomplete after ${repairs} repair rounds: ${feedback.validationErrors.join('; ')}`);
    repairs++;
    log(`Validation repair ${repairs}/${maxRepairRounds}: ${feedback.validationErrors.join('; ')}`);
    try { await repair(feedback, repairs); } catch { log('Repair writer stopped; rechecking the saved drafts and review outcomes.'); }
  }
}

async function main() {
  const { day } = currentRun();
  if (researchReport(loadResearch(), day).status === 'completed') return;
  const brief = fs.readFileSync('scripts/news-agent-brief.md', 'utf8').replaceAll('$TODAY', day).replaceAll('$DRY_RUN', process.env.NEWS_DRY_RUN || 'false');
  const binary = process.env.OPENCODE_BIN || path.join(os.homedir(), '.opencode/bin/opencode');
  const invoke = prompt => execFileSync(binary, ['run', '--model', process.env.NEWS_MODEL || 'opencode/muse-spark-1.3-contributor-free', prompt], { stdio: 'inherit' });
  await runValidatedResearch({
    remaining: () => writeReport(loadResearch(), day).counts.unreviewed,
    reviewed: () => { const report = researchReport(loadResearch(), day); return report.candidates - report.counts.unreviewed; },
    write: round => {
      const prompt = `This is research round ${round} of the single daily batch. Read the current queue; earlier rounds may already have completed some candidates. Continue every remaining candidate. Apply the no-slop rules during writing. Do not ask interactive questions: record specific source blockers for retry. Do not launch the site, signal processes, edit existing articles, commit or push. CI owns publication.\n\n${brief}`;
      invoke(prompt);
    },
    validate: () => validateNewsRun({ persist: true }),
    repair: (feedback, round) => {
      const prompt = `This is validation repair ${round} of the same daily news batch. The coordinator's actual validator found the following errors; a previous writer's success claim is not a passing result. Read .cache/news-research/validation.json and repair the unpublished drafts, then run node scripts/validate-news-run.mjs. Add only facts verified in opened sources, never padding for a word count. For unavailable sources, research readable primary and independent alternatives; if the story cannot pass, record a specific quality-gate/source deferral and move only your unpublished files to recovery. Keep every assigned candidate accounted for. Do not alter validators, thresholds, workflows, code, generated catalogues, published articles or Git history. Do not commit, push, deploy or launch servers. CI independently revalidates before publication.\n\n${JSON.stringify(feedback, null, 2)}\n\n${brief}`;
      invoke(prompt);
    },
  });
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) main().catch(error => { console.error(error.message); process.exitCode = 1; });
