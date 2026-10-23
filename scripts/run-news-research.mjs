import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { currentRun, loadResearch, writeReport } from './news-research.mjs';
import { researchReport, RESEARCH_DIR } from './lib/news-research.mjs';
import { validateNewsRun } from './validate-news-run.mjs';
import { requireFreeNewsModel } from './check-news-writer.mjs';
import { runNewsWriterProcess } from './news-writer-process.mjs';

const fatalWriterError = error => error?.fatal || ['EACCES', 'EPERM', 'EROFS', 'ENOSPC'].includes(error?.code);

export function newsResearchBudget({ env = process.env, now = Date.now } = {}) {
  const minutes = Number(env.NEWS_RESEARCH_BUDGET_MINUTES ?? 75);
  if (!Number.isInteger(minutes) || minutes < 1 || minutes > 90) throw new Error('NEWS_RESEARCH_BUDGET_MINUTES must be an integer between 1 and 90');
  return { researchMs: minutes * 60_000, deadline: now() + minutes * 60_000, writerTimeoutMs: 15 * 60_000, repairTimeoutMs: 10 * 60_000, maxRepairRounds: 3 };
}

export async function runResearchRounds({ remaining, reviewed = () => 0, write, log = console.log, idleLimit = 2, shouldContinue = () => true, deadline = Infinity, now = Date.now }) {
  let idle = 0;
  const canContinue = () => now() < deadline && shouldContinue();
  for (let round = 1; ; round++) {
    if (!canContinue()) return;
    const before = remaining(), reviewedBefore = reviewed();
    if (before === 0) return;
    log(`Research round ${round}: ${before} candidates still need outcomes.`);
    try { await write(round, { idle }); }
    catch (error) {
      if (fatalWriterError(error)) throw error;
      log('Writer stopped; checking its persisted research progress.');
    }
    const after = remaining();
    if (after === 0 || !canContinue()) return;
    idle = after < before || reviewed() > reviewedBefore ? 0 : idle + 1;
    if (idle >= idleLimit) throw Object.assign(new Error(`${after} candidates remain unreviewed after ${idle} attempts without progress`), { code: 'NEWS_RESEARCH_STALLED' });
  }
}

export function researchAssignment(ledger, day, { round, idle = 0, batchSize = 8, restored = null } = {}) {
  if (!Number.isInteger(batchSize) || batchSize < 1 || batchSize > 32) throw new Error('News research batch size must be between 1 and 32');
  const run = ledger.runs[day];
  if (!run || run.status === 'completed' || researchReport(ledger, day).publicationComplete) throw new Error('Assignment needs an open news research run');
  if (restored && (restored.day !== day || !Array.isArray(restored.drafts))) throw new Error('Restored drafts must match the assignment date');
  const drafts = new Map((restored?.drafts || []).map(draft => [draft.id, draft]));
  const pending = run.candidateIds.filter(id => !run.outcomes[id]).map(id => ledger.candidates[id]);
  pending.sort((a, b) => Number(Boolean(b.manual)) - Number(Boolean(a.manual))
     || Number(drafts.has(b.id)) - Number(drafts.has(a.id))
     || Number(b.draftProgress?.day === day) - Number(a.draftProgress?.day === day)
    || (b.sources?.length || 0) - (a.sources?.length || 0) || (b.score || 0) - (a.score || 0));
  return { day, round, totalPending: pending.length, retryingWithoutProgress: idle > 0,
    candidates: pending.slice(0, idle > 0 ? 1 : batchSize).map(candidate => drafts.has(candidate.id)
      ? { ...candidate, restoredDraft: drafts.get(candidate.id) } : candidate) };
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

export async function runValidatedResearch({ remaining, reviewed, write, validate, repair, log = console.log, maxRepairRounds = 3,
  allowBacklogPublication = false, shouldContinue = () => true, deadline = Infinity, now = Date.now, publicationComplete = () => false,
}) {
  if (!Number.isInteger(maxRepairRounds) || maxRepairRounds < 0 || maxRepairRounds > 3) throw new Error('Invalid validation-repair limit (maximum 3)');
  let repairs = 0, stalled = false;
  while (true) {
    if (publicationComplete()) return { publicationComplete: true };
    try {
      await runResearchRounds({ remaining, reviewed, write, log, deadline, now,
        shouldContinue: () => !publicationComplete() && !stalled && shouldContinue(),
      });
    } catch (error) {
      if (!allowBacklogPublication || error.code !== 'NEWS_RESEARCH_STALLED') throw error;
      stalled = true;
      log(`${error.message}; validating the saved drafts with pending coverage intact.`);
    }
    if (publicationComplete()) return { publicationComplete: true };
    const feedback = await validate();
    if (feedback.fatalErrors.length) throw new Error(`News validation needs an operator: ${feedback.fatalErrors.join('; ')}`);
    if (!feedback.discoveryHealthy) throw new Error('News discovery failed; a writer cannot repair unavailable feeds');
    if (publicationComplete()) return { publicationComplete: true };
    const hasReady = Array.isArray(feedback.readySlugs) && feedback.readySlugs.length > 0;
    const auditedReady = feedback.draftsValid === true && hasReady && feedback.validationErrors.length === 0;
    if (auditedReady && (allowBacklogPublication || (feedback.complete && feedback.counts.unreviewed === 0))) return feedback;
    const errors = [...feedback.validationErrors];
    if (!hasReady) errors.push('At least one audited ready article is required for publication');
    else if (!feedback.draftsValid) errors.push('Ready drafts have not passed all actual audits');
    if (!allowBacklogPublication && feedback.counts.unreviewed) errors.push(`${feedback.counts.unreviewed} candidates remain unreviewed`);
    if (repairs >= maxRepairRounds) throw new Error(`News validation remains incomplete after ${repairs} repair rounds: ${errors.join('; ')}`);
    repairs++;
    log(`Validation repair ${repairs}/${maxRepairRounds}: ${errors.join('; ')}`);
    try { await repair(feedback, repairs); }
    catch (error) {
      if (fatalWriterError(error)) throw error;
      log('Repair writer stopped; rechecking the saved drafts and review outcomes.');
    }
  }
}

export async function runNewsResearch({ cwd = process.cwd(), env = process.env, now = Date.now, invoke = runNewsWriterProcess, validate = validateNewsRun, log = console.log } = {}) {
  const { day } = currentRun(cwd);
  const report = () => researchReport(loadResearch(cwd), day);
  const publicationComplete = () => report().publicationComplete === true;
  if (publicationComplete()) return { publicationComplete: true };
  const validationOnly = env.NEWS_VALIDATE_RESTORED_ONLY === 'true';
  if (validationOnly) {
    const ready = report().outcomes.filter(item => item.status === 'ready');
    if (!ready.length || ready.some(item => !item.reusedFrom?.artifactId || !item.reusedFrom?.runId)) {
      throw new Error('Validation-only recovery requires unchanged same-day reviews from a trusted artifact');
    }
    log(`Validating ${ready.length} restored ready reviews; original review times and pending research are preserved.`);
  }
  const budget = newsResearchBudget({ env, now });
  const recovery = fs.existsSync(path.join(cwd, RESEARCH_DIR, 'restored.json'))
    ? 'Saved unpublished drafts and images were restored. Read .cache/news-research/restored.json for their previous source checks. Re-review them against the current queue and editorial guide before recording ready outcomes. They are not published or approved. Repair noncompliant slugs and content; reuse verified work instead of drafting it again.\n\n'
    : '';
  const brief = recovery + fs.readFileSync(path.join(cwd, 'scripts/news-agent-brief.md'), 'utf8').replaceAll('$TODAY', day).replaceAll('$DRY_RUN', env.NEWS_DRY_RUN || 'false');
  const binary = env.OPENCODE_BIN || path.join(os.homedir(), '.opencode/bin/opencode');
  const model = requireFreeNewsModel(env.NEWS_MODEL || 'opencode/deepseek-v4.1-flash-free');
  const runtime = newsWriterRuntime({ cwd, env, model });
  const write = async (prompt, timeoutMs) => {
    const marker = { version: 1, day, state: 'running', startedAt: new Date(now()).toISOString() };
    const markerPath = path.join(cwd, RESEARCH_DIR, 'writer-state.json');
    const persistMarker = () => {
      fs.writeFileSync(`${markerPath}.tmp`, JSON.stringify(marker, null, 2) + '\n');
      fs.renameSync(`${markerPath}.tmp`, markerPath);
    };
    persistMarker();
    try {
      const result = await invoke(binary, ['--print-logs', '--log-level', 'WARN', 'run', '--model', model, runtime.instructions + prompt], {
        cwd: runtime.cwd, env: runtime.env, timeoutMs,
      });
      marker.state = 'stopped'; marker.stoppedAt = new Date(now()).toISOString(); persistMarker();
      return result;
    } catch (error) {
      marker.state = error.writerStopped ? 'stopped' : 'unsafe';
      if (error.writerStopped) marker.stoppedAt = new Date(now()).toISOString();
      persistMarker();
      if (!error.writerStopped) error.fatal = true;
      throw error;
    }
  };
  log(`Research budget: ${budget.researchMs / 60_000} minutes; up to ${budget.maxRepairRounds} repairs of ${budget.repairTimeoutMs / 60_000} minutes. Unreviewed candidates stay pending.`);
  return runValidatedResearch({
    allowBacklogPublication: true, publicationComplete, shouldContinue: () => !validationOnly, deadline: budget.deadline, now, log, maxRepairRounds: budget.maxRepairRounds,
    remaining: () => writeReport(loadResearch(cwd), day, cwd).counts.unreviewed,
    reviewed: () => { const current = report(); return current.candidates - current.counts.unreviewed; },
    write: (round, { idle }) => {
      if (publicationComplete()) return;
      const timeoutMs = Math.min(budget.writerTimeoutMs, budget.deadline - now());
      if (timeoutMs <= 0) return;
      const restoredFile = path.join(cwd, RESEARCH_DIR, 'restored.json');
      const restored = fs.existsSync(restoredFile) ? JSON.parse(fs.readFileSync(restoredFile, 'utf8')) : null;
      const assignment = researchAssignment(loadResearch(cwd), day, { round, idle, restored });
      fs.writeFileSync(path.join(cwd, RESEARCH_DIR, 'assignment.json'), JSON.stringify(assignment, null, 2) + '\n');
      const prompt = `This is research round ${round} of the single daily batch. This invocation has at most ${Math.ceil(timeoutMs / 60_000)} minutes. Your assigned ${assignment.candidates.length} candidates are in .cache/news-research/assignment.json. Use node scripts/news-research.mjs queue --assigned for their current state. Review these candidates one at a time and checkpoint each outcome immediately; stop when this assignment is covered or time runs out. The coordinator assigns the remaining ${assignment.totalPending} pending candidates as the research budget permits, so this is not an article-count cap. At the deadline leave unfinished reviews genuinely pending; never blanket-defer them or invent outcomes. ${idle ? 'The previous invocation made no persisted progress. This retry assigns one candidate: finish its source checks and record its actual outcome before doing anything else. ' : ''}Do not reopen completed reviews. Reuse restored drafts when available and recheck their sources. Do not invent URLs or mark sources read from headlines alone. Apply the no-slop rules during writing. Do not ask interactive questions: record specific source blockers for retry. Do not launch the site, background or detach commands, signal processes, edit existing articles, commit or push. CI owns publication.\n\n${brief}`;
      return write(`${prompt}\n\nAssignment completion boundary: record real outcomes for reviewed IDs in assignment.json, then return. Do not run the whole-batch validator during research. Restored drafts outside this assignment are awaiting their own reviews; leave them intact. The coordinator stops writer tools before validating and repairing the ready batch when research ends, including at the time budget.`, timeoutMs);
    },
    validate: () => validate({ cwd, persist: true, publishReadyBatch: true }),
    repair: (feedback, round) => {
      if (publicationComplete()) return;
      const prompt = `This is validation repair ${round} of the same daily news batch, with at most ${budget.repairTimeoutMs / 60_000} minutes. The coordinator's actual validator found the following errors; a previous writer's success claim is not a passing result. Read .cache/news-research/validation.json and repair the unpublished ready drafts. If there are no ready drafts, finish verifying a preserved draft or a pending candidate; publication requires at least one genuinely audited ready article. Checkpoint every actual outcome immediately. Add only facts verified in opened sources, never padding for a word count. For unavailable sources, research readable primary and independent alternatives; if the story cannot pass, record a specific quality-gate/source deferral and move only your unpublished files to recovery. Unreviewed backlog is not a validation error: leave it pending, never manufacture reviews or bulk deferrals. Do not alter validators, thresholds, workflows, code, generated catalogues, published articles or Git history. Do not commit, push, deploy, launch servers, background or detach commands, or signal processes. Return after saving the repairs; the coordinator stops writer tools and independently revalidates before publication.\n\n${JSON.stringify(feedback, null, 2)}\n\n${brief}`;
      return write(`${prompt}\n\nRead .cache/news-research/recovery/staging.json if present. It lists exact preserved pending draft/image paths; entries are NOT approved. Restore only the selected draft and matching image to their original paths for repair, identify the correct pending candidate from real sources, then record its genuine review outcome. Images marked orphanImage have no completed draft and must not enter the publishable batch. Leave other retained outputs untouched.`, budget.repairTimeoutMs);
    },
  });
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) runNewsResearch().catch(error => { console.error(error.message); process.exitCode = 1; });
