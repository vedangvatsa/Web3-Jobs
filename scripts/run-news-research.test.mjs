import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { runResearchRounds, runValidatedResearch, researchAssignment, newsWriterRuntime } from './run-news-research.mjs';
import { assignedResearchQueue } from './news-research.mjs';

function pendingLedger(count = 21) {
  const candidates = Object.fromEntries(Array.from({ length: count }, (_, i) => [String(i), { id: String(i), title: `Candidate ${i}`, sources: [{ url: `https://example.com/${i}` }] }]));
  return { candidates, runs: { '2026-10-22': { status: 'prepared', candidateIds: Object.keys(candidates), outcomes: {} } } };
}

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

const feedback = (errors = [], extras = {}) => ({ complete: errors.length === 0, discoveryHealthy: true, counts: { unreviewed: 0 }, validationErrors: errors, fatalErrors: [], readySlugs: ['new-story'], ...extras });

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
