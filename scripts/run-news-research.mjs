import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { currentRun, loadResearch, writeReport } from './news-research.mjs';
import { researchReport, RESEARCH_DIR } from './lib/news-research.mjs';
import { validateNewsRun } from './validate-news-run.mjs';
import { requireFreeNewsModel } from './check-news-writer.mjs';

export async function runResearchRounds({ remaining, reviewed = () => 0, write, log = console.log, idleLimit = 2 }) {
  let idle = 0;
  for (let round = 1; ; round++) {
    const before = remaining(), reviewedBefore = reviewed();
    if (before === 0) return;
    log(`Research round ${round}: ${before} candidates still need outcomes.`);
    try { await write(round, { idle }); } catch { log('Writer stopped; checking its persisted research progress.'); }
    const after = remaining();
    if (after === 0) return;
    idle = after < before || reviewed() > reviewedBefore ? 0 : idle + 1;
    if (idle >= idleLimit) throw new Error(`${after} candidates remain unreviewed after ${idle} attempts without progress`);
  }
}

export function researchAssignment(ledger, day, { round, idle = 0, batchSize = 8 } = {}) {
  if (!Number.isInteger(batchSize) || batchSize < 1 || batchSize > 32) throw new Error('News research batch size must be between 1 and 32');
  const run = ledger.runs[day];
  if (!run || run.status === 'completed') throw new Error('Assignment needs an open news research run');
  const pending = run.candidateIds.filter(id => !run.outcomes[id]).map(id => ledger.candidates[id]);
  pending.sort((a, b) => Number(Boolean(b.manual)) - Number(Boolean(a.manual))
    || (b.sources?.length || 0) - (a.sources?.length || 0) || (b.score || 0) - (a.score || 0));
  return { day, round, totalPending: pending.length, retryingWithoutProgress: idle > 0, candidates: pending.slice(0, idle > 0 ? 1 : batchSize) };
}

export function newsWriterRuntime({ cwd = process.cwd(), env = process.env, model } = {}) {
  model = requireFreeNewsModel(model || env.NEWS_MODEL || 'opencode/deepseek-v4.1-flash-free');
  const root = fs.realpathSync(cwd);
  const scratch = path.join(root, RESEARCH_DIR, 'scratch');
  fs.mkdirSync(scratch, { recursive: true });
  if (!fs.realpathSync(scratch).startsWith(`${root}${path.sep}`)) throw new Error('News scratch directory must stay inside the repository');
  const config = { ...JSON.parse(env.OPENCODE_CONFIG_CONTENT || '{}'), small_model: model, autoupdate: false, share: 'disabled' };
  return {
    cwd: root,
    env: { ...env, TMPDIR: scratch, TMP: scratch, TEMP: scratch, NEWS_WORKSPACE_ROOT: root, NEWS_SCRATCH_DIR: scratch, OPENCODE_CONFIG_CONTENT: JSON.stringify(config) },
    instructions: `Repository root: ${root}\nScratch directory: ${scratch}\nKeep every shell command's working directory at the repository root. Put downloads, temporary scripts and source extracts in the scratch directory. Use repository-relative script paths from the root. Do not write to /tmp or change into a scratch directory to run repository scripts. Antislop DURING is already approved; this is an unattended run.\n\n`,
  };
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
  const recovery = fs.existsSync('.cache/news-research/restored.json')
    ? 'Saved unpublished drafts and images were restored. Read .cache/news-research/restored.json for their previous source checks. Re-review them against the current queue and editorial guide before recording ready outcomes. They are not published or approved. Repair noncompliant slugs and content; reuse verified work instead of drafting it again.\n\n'
    : '';
  const brief = recovery + fs.readFileSync('scripts/news-agent-brief.md', 'utf8').replaceAll('$TODAY', day).replaceAll('$DRY_RUN', process.env.NEWS_DRY_RUN || 'false');
  const binary = process.env.OPENCODE_BIN || path.join(os.homedir(), '.opencode/bin/opencode');
  const model = requireFreeNewsModel(process.env.NEWS_MODEL || 'opencode/deepseek-v4.1-flash-free');
  const runtime = newsWriterRuntime({ model });
  const invoke = prompt => execFileSync(binary, ['--print-logs', '--log-level', 'WARN', 'run', '--model', model, runtime.instructions + prompt], {
    stdio: 'inherit', cwd: runtime.cwd, env: runtime.env,
  });
  await runValidatedResearch({
    remaining: () => writeReport(loadResearch(), day).counts.unreviewed,
    reviewed: () => { const report = researchReport(loadResearch(), day); return report.candidates - report.counts.unreviewed; },
    write: (round, { idle }) => {
      const assignment = researchAssignment(loadResearch(), day, { round, idle });
      fs.writeFileSync(path.join(RESEARCH_DIR, 'assignment.json'), JSON.stringify(assignment, null, 2) + '\n');
      const prompt = `This is research round ${round} of the single daily batch. Your assigned ${assignment.candidates.length} candidates are in .cache/news-research/assignment.json. Use node scripts/news-research.mjs queue --assigned for their current state. Review these candidates one at a time and checkpoint each outcome immediately; stop when this assignment is covered. The coordinator will assign the remaining ${assignment.totalPending} pending candidates in later rounds, so this is not an article-count cap. ${idle ? 'The previous invocation made no persisted progress. This retry assigns one candidate: finish its source checks and record its actual outcome before doing anything else. ' : ''}Do not reopen completed reviews. Reuse restored drafts when available and recheck their sources. Do not invent URLs or mark sources read from headlines alone. Apply the no-slop rules during writing. Do not ask interactive questions: record specific source blockers for retry. Do not launch the site, signal processes, edit existing articles, commit or push. CI owns publication.\n\n${brief}`;
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
