import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { EventEmitter } from 'node:events';
import { runResearchRounds, runValidatedResearch, researchAssignment, newsWriterRuntime, newsResearchBudget, runNewsResearch } from './run-news-research.mjs';
import { runNewsWriterProcess } from './news-writer-process.mjs';
import { assignedResearchQueue, prepareDailyResearch, loadResearch, writeResearch } from './news-research.mjs';
import { finalizeResearch, researchReport } from './lib/news-research.mjs';

function pendingLedger(count = 21) {
  const candidates = Object.fromEntries(Array.from({ length: count }, (_, i) => [String(i), { id: String(i), title: `Candidate ${i}`, sources: [{ url: `https://example.com/${i}` }] }]));
  return { candidates, runs: { '2026-10-22': { status: 'prepared', candidateIds: Object.keys(candidates), outcomes: {} } } };
}

test('same-day recovery resumes its queue instead of repeatedly adding fresh RSS, while the next day discovers again', async () => {
  const ledger = { version: 1, candidates: {}, runs: {} }, articles = [], day = '2026-10-22';
  let calls = 0;
  const discover = async () => ({ feeds: [{ ok: true }], total: 1, candidates: [{
    title: `Protocol announces release number ${++calls}`, link: `https://source.example/release-${calls}`, source: 'Source', published: `${calls === 1 ? day : '2026-10-23'}T03:00:00Z`,
  }] });
  await prepareDailyResearch({ ledger, articles, day, now: Date.parse(`${day}T03:30:00Z`), discover });
  const ids = [...ledger.runs[day].candidateIds], discovery = structuredClone(ledger.runs[day].discovery);
  await prepareDailyResearch({ ledger, articles, day, now: Date.parse(`${day}T08:00:00Z`), discover });
  assert.equal(calls, 1);
  assert.deepEqual(ledger.runs[day].candidateIds, ids);
  assert.deepEqual(ledger.runs[day].discovery, discovery);
  await prepareDailyResearch({ ledger, articles, day: '2026-10-23', now: Date.parse('2026-10-23T03:30:00Z'), discover });
  assert.equal(calls, 2);
  assert.ok(ledger.runs['2026-10-23'].candidateIds.length > ids.length);
});

test('failed feed discovery is retried and explicit manual tips can join an unfinished daily queue', async () => {
  const ledger = { version: 1, candidates: {}, runs: {} }, day = '2026-10-22', now = Date.parse(`${day}T03:30:00Z`), articles = [];
  await prepareDailyResearch({ ledger, articles, day, now, discover: async () => ({ feeds: [{ ok: false }], total: 0, candidates: [] }) });
  let calls = 0;
  await prepareDailyResearch({ ledger, articles, day, now, discover: async () => { calls++; return { feeds: [{ ok: true }], total: 0, candidates: [] }; } });
  await prepareDailyResearch({ ledger, articles, day, now, discover: () => assert.fail('Healthy daily discovery stays fixed'), tips: [
    { manual: true, title: 'A specific manually requested new filing', link: 'https://source.example/manual-filing', source: 'Manual tip' },
  ] });
  assert.equal(calls, 1);
  assert.equal(ledger.runs[day].candidateIds.length, 1);
  assert.equal(ledger.candidates[ledger.runs[day].candidateIds[0]].manual, true);
});

test('focused assignments cover the full queue, preserve outcomes and include newly discovered leads', async () => {
  const ledger = pendingLedger(), day = '2026-10-22', seen = [];
  ledger.runs[day].outcomes['0'] = { status: 'rejected' };
  await runResearchRounds({ remaining: () => ledger.runs[day].candidateIds.filter(id => !ledger.runs[day].outcomes[id]).length, log: () => {},
    write: (round, context) => {
      const assignment = researchAssignment(ledger, day, { round, ...context });
      assert.ok(assignment.candidates.length <= 8);
      for (const candidate of assignment.candidates) {
        assert.ok(!seen.includes(candidate.id)); seen.push(candidate.id);
        ledger.runs[day].outcomes[candidate.id] = { status: 'deferred' };
      }
      if (round === 1) { ledger.candidates.new = { id: 'new', title: 'Discovered event' }; ledger.runs[day].candidateIds.push('new'); }
    },
  });
  assert.equal(seen.length, 21); assert.ok(seen.includes('new')); assert.ok(!seen.includes('0'));
});

test('an idle batch retries one candidate and still stops if no real outcome is persisted', async () => {
  const ledger = pendingLedger(), assigned = [];
  await assert.rejects(runResearchRounds({ remaining: () => 21, log: () => {}, write: (round, context) => {
    assigned.push(researchAssignment(ledger, '2026-10-22', { round, ...context }).candidates.length);
  } }), /21 candidates remain unreviewed/);
  assert.deepEqual(assigned, [8, 1]);
});

test('recovery reviews preserved drafts before fresh leads without approving or rewriting them', () => {
  const ledger = pendingLedger(), day = '2026-10-22';
  const draft = { id: '20', articleSlug: 'savedstory', approved: false, mustReview: true, originalDate: '2026-10-21', reviewReasons: ['publication-date-needs-review'] };
  const before = JSON.stringify(ledger);
  const assignment = researchAssignment(ledger, day, { round: 1, restored: { day, drafts: [draft] } });
  assert.equal(assignment.candidates[0].id, '20');
  assert.deepEqual(assignment.candidates[0].restoredDraft, draft);
  assert.equal(JSON.stringify(ledger), before);
  assert.throws(() => researchAssignment(ledger, day, { restored: { day: '2026-10-21', drafts: [draft] } }), /assignment date/);
});

test('assigned queue reads current ledger state and refuses foreign, duplicate or wrong-day assignments', () => {
  const ledger = pendingLedger(), day = '2026-10-22';
  ledger.candidates['20'].manual = true;
  const assignment = researchAssignment(ledger, day, { round: 1 });
  assert.equal(assignment.candidates[0].id, '20');
  ledger.runs[day].outcomes['20'] = { status: 'ready' };
  assert.equal(assignedResearchQueue(ledger, day, assignment).remaining, 7);
  assert.ok(!assignedResearchQueue(ledger, day, assignment).candidates.some(item => item.id === '20'));
  for (const value of [{ ...assignment, day: '2026-10-21' }, { ...assignment, candidates: [{ id: 'missing' }] }, { ...assignment, candidates: [{ id: '1' }, { id: '1' }] }]) {
    assert.throws(() => assignedResearchQueue(ledger, day, value));
  }
  for (const batchSize of [0, -1, 33, 1.5]) assert.throws(() => researchAssignment(ledger, day, { batchSize }));
});

test('writer subprocesses keep root cwd and workspace-owned temp paths without broad permission overrides', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'news-writer-runtime-'));
  try {
    const permission = { external_directory: 'ask', read: { '*.env': 'deny' } };
    const env = { NEWS_MODEL: 'opencode/mimo-v2.6-flash-free', TMPDIR: '/tmp', OPENCODE_CONFIG_CONTENT: JSON.stringify({ permission }) };
    const runtime = newsWriterRuntime({ cwd: root, env });
    assert.equal(runtime.cwd, fs.realpathSync(root));
    for (const key of ['TMPDIR', 'TMP', 'TEMP', 'NEWS_SCRATCH_DIR']) {
      assert.equal(runtime.env[key], path.join(fs.realpathSync(root), '.cache/news-research/scratch'));
      assert.ok(fs.statSync(runtime.env[key]).isDirectory());
    }
    assert.equal(env.TMPDIR, '/tmp');
    assert.deepEqual(JSON.parse(runtime.env.OPENCODE_CONFIG_CONTENT).permission, permission);
    assert.equal(JSON.parse(runtime.env.OPENCODE_CONFIG_CONTENT).small_model, env.NEWS_MODEL);
    assert.match(runtime.instructions, /working directory at the repository root/);
    assert.throws(() => newsWriterRuntime({ cwd: root, env: { NEWS_MODEL: 'paid-model' } }), /free/i);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('a scratch symlink outside the checkout is refused', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'news-writer-symlink-'));
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'news-writer-external-'));
  try {
    fs.mkdirSync(path.join(root, '.cache/news-research'), { recursive: true });
    fs.symlinkSync(outside, path.join(root, '.cache/news-research/scratch'));
    assert.throws(() => newsWriterRuntime({ cwd: root, env: {} }), /inside the repository/);
  } finally { fs.rmSync(root, { recursive: true, force: true }); fs.rmSync(outside, { recursive: true, force: true }); }
});

test('a writer that stops after three stories is continued inside the same daily batch', async () => {
  let remaining = 10, calls = 0;
  await runResearchRounds({ remaining: () => remaining, write: async () => { calls++; remaining = Math.max(0, remaining - 3); }, log: () => {} });
  assert.equal(calls, 4);
  assert.equal(remaining, 0);
});
test('persisted progress survives a failed writer invocation', async () => {
  let remaining = 4, calls = 0;
  await runResearchRounds({ remaining: () => remaining, write: async () => { calls++; remaining -= 2; if (calls === 1) throw new Error('Provider disconnected after recording outcomes'); }, log: () => {} });
  assert.equal(calls, 2);
});
test('no-progress loops fail visibly instead of declaring success or running forever', async () => {
  let calls = 0;
  await assert.rejects(runResearchRounds({ remaining: () => 10, write: async () => { calls++; }, log: () => {} }), /10 candidates remain unreviewed/);
  assert.equal(calls, 2);
});
test('a completed daily queue does not invoke the model again', async () => {
  await runResearchRounds({ remaining: () => 0, write: () => assert.fail('Must not write'), log: () => {} });
});
test('new leads found during research are completed in the same batch without a round-count quota', async () => {
  let remaining = 1, reviewed = 0, calls = 0;
  await runResearchRounds({ remaining: () => remaining, reviewed: () => reviewed, write: async () => {
    calls++;
    if (calls === 1) { remaining = 30; reviewed++; }
    else { const completed = Math.min(3, remaining); remaining -= completed; reviewed += completed; }
  }, log: () => {} });
  assert.equal(remaining, 0);
  assert.equal(reviewed, 31);
  assert.equal(calls, 11);
});

const feedback = (errors = [], extras = {}) => ({ complete: errors.length === 0, draftsValid: errors.length === 0, discoveryHealthy: true, counts: { unreviewed: 0 }, validationErrors: errors, fatalErrors: [], readySlugs: ['new-story'], ...extras });

test('a fully reviewed queue is repaired against actual validator errors before it can finish', async () => {
  let repaired = false, checks = 0;
  const errors = ['ledger-implant.md: under 600 words', 'uk-sanctions.md: news template phrasing'];
  const result = await runValidatedResearch({
    remaining: () => 0, write: () => assert.fail('Research is already covered'), log: () => {},
    validate: () => { checks++; return feedback(repaired ? [] : errors); },
    repair: (result, round) => { assert.deepEqual(result.validationErrors, errors); assert.equal(round, 1); repaired = true; },
  });
  assert.equal(checks, 2);
  assert.equal(result.complete, true);
});

test('persisted draft repairs are revalidated even if the writer disconnects', async () => {
  let fixed = false;
  const result = await runValidatedResearch({ remaining: () => 0, write: () => {}, log: () => {},
    validate: () => feedback(fixed ? [] : ['Source link HTTP 403: https://example.com/news']),
    repair: () => { fixed = true; throw new Error('Writer disconnected after saving verified replacement'); },
  });
  assert.equal(result.complete, true);
});

test('persistent validation failures stop at the repair limit without claiming success', async () => {
  let repairs = 0, checks = 0;
  await assert.rejects(runValidatedResearch({ remaining: () => 0, write: () => {}, log: () => {}, maxRepairRounds: 2,
    validate: () => { checks++; return feedback(['new-story.md: under 600 words']); }, repair: () => { repairs++; },
  }), /after 2 repair rounds/);
  assert.equal(repairs, 2); assert.equal(checks, 3);
});

test('protected-file failures and feed outages are not assigned to a draft-repair writer', async () => {
  for (const result of [
    feedback(['Typecheck failed; no articles may publish on a red tree'], { fatalErrors: ['Typecheck failed; no articles may publish on a red tree'] }),
    feedback([], { complete: false, discoveryHealthy: false }),
  ]) {
    await assert.rejects(runValidatedResearch({ remaining: () => 0, write: () => {}, validate: () => result,
      repair: () => assert.fail('The draft writer must not repair infrastructure'), log: () => {},
    }));
  }
});

test('candidates reopened by repair must receive outcomes before the next validation', async () => {
  let remaining = 0, repaired = false, reviews = 0;
  const result = await runValidatedResearch({ remaining: () => remaining, write: () => { reviews++; remaining = 0; }, log: () => {},
    validate: () => { assert.equal(remaining, 0); return feedback(repaired ? [] : ['Duplicate reporting']); },
    repair: () => { repaired = true; remaining = 1; },
  });
  assert.equal(reviews, 1); assert.equal(result.complete, true);
});

test('the research deadline preserves real progress and leaves unfinished outcomes untouched', async () => {
  const ledger = pendingLedger(219), day = '2026-10-22';
  let time = 0, calls = 0;
  await runResearchRounds({ deadline: 75 * 60_000, now: () => time, log: () => {},
    remaining: () => ledger.runs[day].candidateIds.filter(id => !ledger.runs[day].outcomes[id]).length,
    write: () => {
      calls++;
      for (let i = 0; i < 20; i++) ledger.runs[day].outcomes[String(i)] = { status: 'ready', articleSlug: `saved${i}` };
      time = 75 * 60_000;
      throw Object.assign(new Error('Writer timed out after saving drafts'), { code: 'NEWS_WRITER_TIMEOUT' });
    },
  });
  assert.equal(calls, 1);
  assert.equal(Object.keys(ledger.runs[day].outcomes).length, 20);
  assert.equal(ledger.runs[day].candidateIds.filter(id => !ledger.runs[day].outcomes[id]).length, 199);
  assert.ok(Object.values(ledger.runs[day].outcomes).every(outcome => outcome.status === 'ready'));
});

test('an expired deadline or stop callback prevents new research, even without progress', async () => {
  await runResearchRounds({ remaining: () => 10, deadline: 10, now: () => 10, write: () => assert.fail('Deadline expired'), log: () => {} });
  await runResearchRounds({ remaining: () => 10, shouldContinue: () => false, write: () => assert.fail('Research stopped'), log: () => {} });
  let proceed = true, calls = 0;
  await runResearchRounds({ remaining: () => 10, shouldContinue: () => proceed, idleLimit: 1,
    write: () => { calls++; proceed = false; }, log: () => {},
  });
  assert.equal(calls, 1);
});

test('an audited partial batch can finish without declaring pending coverage complete', async () => {
  const result = feedback([], { complete: false, counts: { ready: 20, unreviewed: 199 }, readySlugs: Array.from({ length: 20 }, (_, i) => `saved${i}`) });
  const snapshot = structuredClone(result);
  const options = { remaining: () => 199, shouldContinue: () => false, write: () => assert.fail('Research is paused'),
    validate: () => result, repair: () => assert.fail('Passing drafts need no repair'), log: () => {}, maxRepairRounds: 0,
  };
  assert.equal(await runValidatedResearch({ ...options, allowBacklogPublication: true }), result);
  assert.deepEqual(result, snapshot);
  await assert.rejects(runValidatedResearch(options), /remains incomplete/);
});

test('zero ready articles, skipped audits, and any audit or fatal failure cannot finish in either mode', async () => {
  for (const allowBacklogPublication of [false, true]) {
    for (const result of [
      feedback([], { readySlugs: [], counts: { ready: 0, unreviewed: 0 } }),
      feedback([], { readySlugs: 'not-an-audit-response' }),
      feedback([], { draftsValid: false }),
      feedback([], { draftsValid: undefined }),
      feedback(['Image audit failed'], { complete: true, draftsValid: true }),
      feedback([], { fatalErrors: ['Drafter changed a protected or generated file: scripts/audit.ts'] }),
      feedback([], { fatalErrors: ['Typecheck failed; no articles may publish on a red tree'] }),
      feedback([], { discoveryHealthy: false }),
    ]) {
      await assert.rejects(runValidatedResearch({ allowBacklogPublication, remaining: () => 0, write: () => {}, log: () => {},
        validate: () => result, maxRepairRounds: 0, repair: () => assert.fail('No repair budget'),
      }));
    }
  }
});

test('backlog mode validates saved drafts when research stalls, without fabricating outcomes', async () => {
  let calls = 0;
  const result = await runValidatedResearch({ allowBacklogPublication: true, remaining: () => 199,
    write: () => { calls++; }, validate: () => feedback([], { complete: false, counts: { unreviewed: 199 } }),
    repair: () => assert.fail('The ready draft passes'), log: () => {},
  });
  assert.equal(calls, 2);
  assert.equal(result.counts.unreviewed, 199);
  assert.equal(result.complete, false);
});

test('publicationComplete stops retries before research, validation or repair', async () => {
  const never = () => assert.fail('The daily publication is already complete');
  assert.deepEqual(await runValidatedResearch({ publicationComplete: () => true, remaining: never, write: never, validate: never, repair: never }), { publicationComplete: true });
  let published = false;
  assert.deepEqual(await runValidatedResearch({ publicationComplete: () => published, remaining: () => 199,
    write: () => { published = true; }, validate: never, repair: never, log: () => {},
  }), { publicationComplete: true });
  published = false;
  assert.deepEqual(await runValidatedResearch({ publicationComplete: () => published, remaining: () => 0, write: never,
    validate: () => feedback(['Repair needed']), repair: () => { published = true; }, log: () => {},
  }), { publicationComplete: true });
});

test('read-only infrastructure and failed process cleanup stay fatal in research and repair', async () => {
  for (const error of [Object.assign(new Error('read-only filesystem'), { code: 'EROFS' }), Object.assign(new Error('tools still running'), { fatal: true })]) {
    await assert.rejects(runValidatedResearch({ allowBacklogPublication: true, remaining: () => 1, write: () => { throw error; },
      validate: () => assert.fail('Unsafe to audit'), repair: () => assert.fail('Unsafe to repair'), log: () => {},
    }), candidate => candidate === error);
    await assert.rejects(runValidatedResearch({ allowBacklogPublication: true, remaining: () => 0, write: () => {},
      validate: () => feedback(['Article needs repair']), repair: () => { throw error; }, log: () => {},
    }), candidate => candidate === error);
  }
});

test('research budgets reserve audit and repair time and cannot exceed the configured ceiling', async () => {
  const defaults = newsResearchBudget({ env: {}, now: () => 100 });
  assert.equal(defaults.researchMs, 75 * 60_000);
  assert.equal(defaults.deadline, 100 + defaults.researchMs);
  assert.equal(defaults.writerTimeoutMs, 15 * 60_000);
  assert.equal(defaults.repairTimeoutMs * defaults.maxRepairRounds, 30 * 60_000);
  assert.equal(newsResearchBudget({ env: { NEWS_RESEARCH_BUDGET_MINUTES: '90' } }).researchMs + defaults.repairTimeoutMs * defaults.maxRepairRounds, 120 * 60_000);
  for (const value of ['0', '-1', '91', '1.5', '', 'NaN', 'Infinity']) {
    assert.throws(() => newsResearchBudget({ env: { NEWS_RESEARCH_BUDGET_MINUTES: value } }), /between 1 and 90/);
  }
  for (const maxRepairRounds of [4, -1, 1.5, Infinity]) await assert.rejects(runValidatedResearch({ maxRepairRounds }), /validation-repair limit/);
});

test('repair timeouts are revalidated but never restart the research budget or exceed three attempts', async () => {
  let time = 0, writes = 0, repairs = 0, checks = 0;
  await assert.rejects(runValidatedResearch({ allowBacklogPublication: true, deadline: 75 * 60_000, now: () => time,
    remaining: () => 199, write: () => { writes++; time = 75 * 60_000; }, log: () => {},
    validate: () => { checks++; return feedback(['Story still fails the audit'], { counts: { unreviewed: 199 } }); },
    repair: () => { repairs++; time += 10 * 60_000; throw Object.assign(new Error('Repair timeout'), { code: 'NEWS_WRITER_TIMEOUT' }); },
  }), /after 3 repair rounds/);
  assert.equal(writes, 1); assert.equal(repairs, 3); assert.equal(checks, 4);
  assert.equal(time, 105 * 60_000);
});

function writerFixture() {
  const child = new EventEmitter(), signals = new EventEmitter(), calls = [], spawned = [];
  child.pid = 765432;
  const fixture = { child, signals, calls, spawned, alive: true, onSignal: () => {},
    close: (code = 0, signal = null) => { child.emit('exit', code, signal); child.emit('close', code, signal); },
  };
  fixture.options = { timeoutMs: 1_000, graceMs: 100, killWaitMs: 100, signals, platform: 'linux',
    spawnProcess: (...args) => { spawned.push(args); return child; },
    kill: (pid, signal) => {
      assert.equal(pid, -child.pid, 'Only this detached writer group may be signalled');
      calls.push({ pid, signal });
      if (!fixture.alive) throw Object.assign(new Error('No such process group'), { code: 'ESRCH' });
      if (signal !== 0) fixture.onSignal(signal);
      return true;
    },
  };
  return fixture;
}

async function tick(t, milliseconds) {
  t.mock.timers.tick(milliseconds);
  await Promise.resolve();
  await Promise.resolve();
}

test('a timed-out writer stops its own group before audits and preserves checkpoints for partial publication', async t => {
  t.mock.timers.enable({ apis: ['Date', 'setTimeout'], now: 0 });
  const fixture = writerFixture();
  const ledger = pendingLedger(3), day = '2026-10-22';
  let checks = 0;
  fixture.onSignal = signal => {
    if (signal === 'SIGKILL') { fixture.alive = false; fixture.close(null, signal); }
  };
  const resultPromise = runValidatedResearch({ allowBacklogPublication: true, deadline: 1_000, now: Date.now, log: () => {},
    remaining: () => ledger.runs[day].candidateIds.filter(id => !ledger.runs[day].outcomes[id]).length,
    write: () => {
      ledger.runs[day].outcomes['0'] = { status: 'ready', articleSlug: 'saved' };
      return runNewsWriterProcess('writer', ['run'], fixture.options);
    },
    validate: () => {
      checks++;
      assert.equal(fixture.alive, false, 'Audit must wait for all owned writer tools');
      assert.deepEqual(ledger.runs[day].outcomes, { '0': { status: 'ready', articleSlug: 'saved' } });
      return feedback([], { complete: false, counts: { ready: 1, unreviewed: 2 }, readySlugs: ['saved'] });
    }, repair: () => assert.fail('The saved article passes'),
  });
  await tick(t, 1_000);
  assert.equal(checks, 0);
  assert.equal(fixture.alive, true);
  await tick(t, 100);
  const result = await resultPromise;
  assert.equal(checks, 1);
  assert.equal(result.counts.unreviewed, 2);
  assert.deepEqual(fixture.calls.filter(call => call.signal !== 0).map(call => call.signal), ['SIGTERM', 'SIGKILL']);
  assert.equal(fixture.spawned[0][2].detached, true);
  assert.equal(fixture.spawned[0][2].shell, false);
  assert.equal(fixture.signals.listenerCount('SIGTERM'), 0);
  assert.equal(fixture.signals.listenerCount('SIGINT'), 0);
});

test('even a successful writer exit waits for background tools to stop on Linux and macOS', async t => {
  t.mock.timers.enable({ apis: ['Date', 'setTimeout'], now: 0 });
  for (const platform of ['linux', 'darwin']) {
    const fixture = writerFixture();
    let finished = false;
    fixture.onSignal = signal => { if (signal === 'SIGKILL') fixture.alive = false; };
    const promise = runNewsWriterProcess('writer', ['run'], { ...fixture.options, platform }).then(result => { finished = true; return result; });
    fixture.close(0);
    await tick(t, 0);
    assert.equal(finished, false);
    await tick(t, 100);
    assert.deepEqual(await promise, { code: 0, writerStopped: true });
    assert.equal(fixture.alive, false);
  }
});

test('graceful group shutdown does not send SIGKILL or leave stale timers', async t => {
  t.mock.timers.enable({ apis: ['Date', 'setTimeout'], now: 0 });
  const fixture = writerFixture();
  fixture.onSignal = signal => { assert.equal(signal, 'SIGTERM'); fixture.alive = false; fixture.close(null, signal); };
  const rejection = assert.rejects(runNewsWriterProcess('writer', ['run'], fixture.options), { code: 'NEWS_WRITER_TIMEOUT', fatal: false });
  await tick(t, 1_000);
  await rejection;
  const calls = fixture.calls.length;
  await tick(t, 10_000);
  assert.equal(fixture.calls.length, calls);
});

test('failed cleanup is fatal instead of handing still-running tools to the validator', async t => {
  t.mock.timers.enable({ apis: ['Date', 'setTimeout'], now: 0 });
  const fixture = writerFixture();
  const rejection = assert.rejects(runNewsWriterProcess('writer', ['run'], fixture.options), { code: 'NEWS_WRITER_CLEANUP', fatal: true });
  fixture.close(0);
  await tick(t, 0);
  await tick(t, 100);
  await tick(t, 100);
  await rejection;
  assert.deepEqual(fixture.calls.filter(call => call.signal !== 0).map(call => call.signal), ['SIGTERM', 'SIGKILL']);
});

test('coordinator interruptions stop only the owned group and stay fatal after cleanup', async t => {
  t.mock.timers.enable({ apis: ['Date', 'setTimeout'], now: 0 });
  for (const signal of ['SIGTERM', 'SIGINT']) {
    const fixture = writerFixture();
    fixture.onSignal = () => { fixture.alive = false; fixture.close(null, 'SIGTERM'); };
    const rejection = assert.rejects(runNewsWriterProcess('writer', ['run'], fixture.options), { code: 'NEWS_WRITER_INTERRUPTED', fatal: true });
    fixture.signals.emit(signal);
    if (signal === 'SIGTERM') t.mock.timers.tick(1_000);
    await rejection;
    assert.equal(fixture.alive, false);
    assert.equal(fixture.signals.listenerCount(signal), 0);
  }
});

test('spawn failures and unsafe process IDs never signal an unrelated process', async () => {
  const fixture = writerFixture();
  fixture.child.pid = undefined;
  const rejection = assert.rejects(runNewsWriterProcess('missing', [], fixture.options), { code: 'NEWS_WRITER_PROCESS', fatal: true });
  fixture.child.emit('error', Object.assign(new Error('ENOENT'), { code: 'ENOENT' }));
  await rejection;
  assert.deepEqual(fixture.calls, []);
  for (const pid of [0, -12, 1, process.pid]) {
    const unsafe = writerFixture(); unsafe.child.pid = pid;
    const rejected = assert.rejects(runNewsWriterProcess('writer', [], unsafe.options), { code: 'NEWS_WRITER_GROUP', fatal: true });
    unsafe.close(pid === 0 ? 1 : 0);
    await rejected;
    assert.deepEqual(unsafe.calls, []);
  }
  await assert.rejects(runNewsWriterProcess('writer', [], { ...fixture.options, platform: 'win32' }), /Linux or macOS/);
  for (const timeoutMs of [undefined, 0, -1, Infinity, 91 * 60_000]) await assert.rejects(runNewsWriterProcess('writer', [], { ...fixture.options, timeoutMs }), /timeoutMs/);
  assert.equal(fixture.spawned.length, 1);
});

function researchFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'bounded-news-research-')), day = '2026-10-22';
  for (const directory of ['content/articles', 'scripts', '.cache/news-research', 'src', '.github/workflows']) fs.mkdirSync(path.join(root, directory), { recursive: true });
  const ids = Array.from({ length: 3 }, (_, i) => String(i + 1).padStart(20, '0'));
  const ledger = { version: 1,
    candidates: Object.fromEntries(ids.map(id => [id, { id, title: `Verified event candidate ${id}`, link: `https://source.example/${id}`, sources: [{ url: `https://source.example/${id}` }], status: 'pending' }])),
    runs: { [day]: { day, status: 'prepared', candidateIds: ids, outcomes: {}, baselineSlugs: ['existing'], discovery: { feeds: [{ ok: true }] } } },
  };
  writeResearch(ledger, root);
  fs.writeFileSync(path.join(root, '.cache/news-research/current.json'), JSON.stringify({ day }));
  fs.writeFileSync(path.join(root, '.cache/news-research/restored.json'), JSON.stringify({ day, drafts: [{ id: ids[2], articleSlug: 'saved', approved: false, mustReview: true }] }));
  fs.writeFileSync(path.join(root, 'scripts/news-agent-brief.md'), 'Research today $TODAY, dry run $DRY_RUN.');
  const protectedFiles = { 'src/app.ts': 'export const intact = true;', '.github/workflows/daily.yml': 'name: existing', 'content/articles/existing.md': 'An existing published article.' };
  for (const [file, content] of Object.entries(protectedFiles)) fs.writeFileSync(path.join(root, file), content);
  return { root, day, ids, protectedFiles };
}

test('the real runner reuses restored work, clips the last invocation, and requests actual partial-batch validation', async () => {
  const { root, day, ids, protectedFiles } = researchFixture();
  let time = 0, calls = 0, audits = 0;
  try {
    const permission = { external_directory: 'ask', read: { '*.env': 'deny' }, bash: { 'git push *': 'deny' } };
    const result = await runNewsResearch({ cwd: root, now: () => time, log: () => {},
      env: { NEWS_RESEARCH_BUDGET_MINUTES: '1', NEWS_MODEL: 'opencode/mimo-v2.6-flash-free', OPENCODE_CONFIG_CONTENT: JSON.stringify({ permission }) },
      invoke: (_binary, args, options) => {
        calls++;
        assert.equal(options.timeoutMs, 60_000);
        assert.equal(options.cwd, fs.realpathSync(root));
        assert.deepEqual(JSON.parse(options.env.OPENCODE_CONFIG_CONTENT).permission, permission);
        assert.match(args.at(-1), /Saved unpublished drafts and images were restored/);
        const assignment = JSON.parse(fs.readFileSync(path.join(root, '.cache/news-research/assignment.json'), 'utf8'));
        assert.equal(assignment.candidates[0].id, ids[2]);
        assert.equal(assignment.candidates[0].restoredDraft.approved, false);
        const ledger = loadResearch(root);
        ledger.runs[day].outcomes[ids[2]] = { status: 'ready', articleSlug: 'saved', note: 'Rechecked the preserved draft against two opened independent sources.' };
        writeResearch(ledger, root);
        time = 60_000;
        throw Object.assign(new Error('Writer invocation timed out'), { code: 'NEWS_WRITER_TIMEOUT', writerStopped: true });
      },
      validate: options => {
        audits++;
        assert.deepEqual(options, { cwd: root, persist: true, publishReadyBatch: true });
        assert.equal(JSON.parse(fs.readFileSync(path.join(root, '.cache/news-research/writer-state.json'), 'utf8')).state, 'stopped');
        const ledger = loadResearch(root);
        assert.equal(Object.keys(ledger.runs[day].outcomes).length, 1);
        return feedback([], { complete: false, counts: { ready: 1, unreviewed: 2 }, readySlugs: ['saved'] });
      },
    });
    assert.equal(calls, 1); assert.equal(audits, 1);
    assert.equal(result.complete, false);
    assert.equal(result.draftsValid, true);
    const ledger = loadResearch(root);
    assert.equal(ledger.runs[day].outcomes[ids[0]], undefined);
    assert.equal(ledger.runs[day].outcomes[ids[1]], undefined);
    for (const [file, content] of Object.entries(protectedFiles)) assert.equal(fs.readFileSync(path.join(root, file), 'utf8'), content);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('the real runner limits each repair to ten minutes and reaudits saved repairs after timeout', async () => {
  const { root } = researchFixture();
  let time = 0, writes = 0, audits = 0;
  try {
    const result = await runNewsResearch({ cwd: root, env: {}, now: () => time, log: () => {},
      invoke: (_binary, _args, options) => {
        writes++;
        assert.equal(options.timeoutMs, (writes === 1 ? 15 : 10) * 60_000);
        time = writes === 1 ? 75 * 60_000 : time + options.timeoutMs;
        throw Object.assign(new Error('Writer stopped after checkpoint'), { code: 'NEWS_WRITER_TIMEOUT', writerStopped: true });
      },
      validate: () => { audits++; return feedback(audits === 4 ? [] : ['Source-backed repair required'], { complete: false, counts: { unreviewed: 2 } }); },
    });
    assert.equal(result.draftsValid, true);
    assert.equal(writes, 4); assert.equal(audits, 4);
    assert.equal(time, 105 * 60_000);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('unconfirmed child cleanup leaves a durable barrier against the independent final publisher', async () => {
  const { root } = researchFixture();
  try {
    await assert.rejects(runNewsResearch({ cwd: root, env: {}, log: () => {},
      invoke: () => { throw Object.assign(new Error('Child shutdown unknown'), { code: 'NEWS_WRITER_CLEANUP', fatal: true }); },
      validate: () => assert.fail('Unsafe writer cannot be audited'),
    }), /shutdown unknown/);
    assert.equal(JSON.parse(fs.readFileSync(path.join(root, '.cache/news-research/writer-state.json'), 'utf8')).state, 'unsafe');
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('a same-day partial publication receipt stops the real runner without touching preserved work', async () => {
  const { root, day, ids } = researchFixture();
  try {
    const ledger = loadResearch(root);
    ledger.runs[day].outcomes[ids[2]] = { status: 'ready', articleSlug: 'saved', note: 'Verified this event using the filing and two independent reports.' };
    finalizeResearch(ledger, day, { allowBacklogPublication: true, now: Date.parse(`${day}T08:00:00Z`) });
    writeResearch(ledger, root);
    assert.equal(researchReport(ledger, day).publicationComplete, true);
    assert.equal(researchReport(ledger, day).complete, false);
    assert.throws(() => researchAssignment(ledger, day), /open news research run/);
    const before = fs.readFileSync(path.join(root, 'content/news-research.json'), 'utf8');
    const preserved = fs.readFileSync(path.join(root, '.cache/news-research/restored.json'), 'utf8');
    const result = await runNewsResearch({ cwd: root, env: { NEWS_MODEL: 'paid-model', NEWS_RESEARCH_BUDGET_MINUTES: '999' },
      invoke: () => assert.fail('No more writers for the published day'), validate: () => assert.fail('Do not revalidate published articles'),
    });
    assert.deepEqual(result, { publicationComplete: true });
    assert.equal(fs.readFileSync(path.join(root, 'content/news-research.json'), 'utf8'), before);
    assert.equal(fs.readFileSync(path.join(root, '.cache/news-research/restored.json'), 'utf8'), preserved);
    assert.equal(fs.existsSync(path.join(root, '.cache/news-research/assignment.json')), false);
    assert.equal(fs.existsSync(path.join(root, '.cache/news-research/scratch')), false);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('explicit validation-only recovery audits reused reviews without researching or relabeling the backlog', async () => {
  const { root, day, ids } = researchFixture();
  try {
    const ledger = loadResearch(root);
    ledger.runs[day].outcomes[ids[2]] = { status: 'ready', articleSlug: 'saved', note: 'Original same-day source review retained from its authenticated recovery artifact.', reviewedAt: `${day}T08:00:00Z`, reusedFrom: { artifactId: '123', runId: '456' } };
    writeResearch(ledger, root);
    let audits = 0;
    const result = await runNewsResearch({ cwd: root, env: { NEWS_VALIDATE_RESTORED_ONLY: 'true' }, log: () => {},
      invoke: () => assert.fail('Passing restored articles need no new writing-model invocation'),
      validate: options => { audits++; assert.equal(options.publishReadyBatch, true); return feedback([], { complete: false, counts: { ready: 1, unreviewed: 2 }, readySlugs: ['saved'] }); },
    });
    assert.equal(result.draftsValid, true); assert.equal(audits, 1);
    assert.deepEqual(loadResearch(root), ledger);
    delete ledger.runs[day].outcomes[ids[2]].reusedFrom;
    writeResearch(ledger, root);
    await assert.rejects(runNewsResearch({ cwd: root, env: { NEWS_VALIDATE_RESTORED_ONLY: 'true' },
      invoke: () => assert.fail('No trusted reused review'), validate: () => assert.fail('No trusted reused review'),
    }), /trusted artifact/);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
