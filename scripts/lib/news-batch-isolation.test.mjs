import assert from 'node:assert/strict';
import test from 'node:test';
import { isolateFailedNewsDrafts } from './news-batch-isolation.mjs';
import { runValidatedResearch } from '../run-news-research.mjs';

function fixture() {
  const day = new Date().toISOString().slice(0, 10);
  const sourceChecks = [{ url: 'https://primary.example/filing', outcome: 'read' }, { url: 'https://independent.example/report', outcome: 'read' }];
  const outcome = slug => ({ status: 'ready', articleSlug: slug, note: 'Read the filing and independent report about the concrete event.', sourceChecks, reviewedAt: `${day}T00:00:00.000Z` });
  const ledger = {
    version: 1,
    candidates: {
      good: { id: 'good', title: 'Good story', ...outcome('goodstory') },
      bad: { id: 'bad', title: 'Bad story', ...outcome('badstory') },
      pending: { id: 'pending', status: 'pending' },
    },
    runs: { [day]: {
      day, status: 'incomplete', candidateIds: ['good', 'bad', 'pending'], baselineSlugs: [],
      discovery: { feeds: [{ ok: true }] }, outcomes: { good: outcome('goodstory'), bad: outcome('badstory') },
    } },
  };
  const feedback = { day, audited: true, draftsValid: false, discoveryHealthy: true, fatalErrors: [], readySlugs: ['goodstory', 'badstory'], validationErrors: ['badstory.md: under 600 words'], articleErrors: { badstory: ['badstory.md: under 600 words'] }, counts: { unreviewed: 1 } };
  return { ledger, day, feedback };
}

test('only identified audit failures are deferred, keeping prior review evidence and all pending work', () => {
  const { ledger, day, feedback } = fixture(), before = structuredClone(ledger);
  const result = isolateFailedNewsDrafts(ledger, day, feedback);
  assert.deepEqual(ledger, before);
  assert.deepEqual(result.deferredSlugs, ['badstory']);
  const next = result.ledger;
  assert.deepEqual(next.runs[day].outcomes.good, before.runs[day].outcomes.good);
  assert.deepEqual(next.candidates.pending, before.candidates.pending);
  assert.equal(next.runs[day].outcomes.pending, undefined);
  assert.equal(next.runs[day].outcomes.bad.status, 'deferred');
  assert.equal(next.runs[day].outcomes.bad.reason, 'quality-gate');
  assert.deepEqual(next.runs[day].outcomes.bad.qualityIsolation.previousReview, before.runs[day].outcomes.bad);
  assert.deepEqual(next.runs[day].outcomes.bad.sourceChecks, before.runs[day].outcomes.bad.sourceChecks);
});

test('unclassified, stale, fatal, skipped, all-failed and malformed audits can never authorize isolation', () => {
  for (const change of [
    { audited: false }, { discoveryHealthy: false }, { day: '2000-01-01' },
    { fatalErrors: ['Typecheck failed'] }, { readySlugs: ['badstory'] },
    { validationErrors: ['Unknown global error'] }, { articleErrors: undefined },
    { articleErrors: { missing: ['badstory.md: under 600 words'] } },
    { articleErrors: { goodstory: ['badstory.md: under 600 words'], badstory: ['badstory.md: under 600 words'] } },
    { articleErrors: { badstory: ['Invented error'] } },
  ]) {
    const { ledger, day, feedback } = fixture();
    const before = structuredClone(ledger);
    assert.equal(isolateFailedNewsDrafts(ledger, day, { ...feedback, ...change }), null);
    assert.deepEqual(ledger, before);
  }
});

test('repair exhaustion isolates once and requires a new passing audit rather than treating filtering as success', async () => {
  const { feedback } = fixture();
  let isolated = false, checks = 0;
  const result = await runValidatedResearch({ allowBacklogPublication: true, shouldContinue: () => false, remaining: () => 1, maxRepairRounds: 0, log: () => {},
    validate: () => { checks++; return isolated ? { ...feedback, readySlugs: ['goodstory'], validationErrors: [], articleErrors: {}, draftsValid: true } : feedback; },
    isolate: () => { isolated = true; return true; }, repair: () => assert.fail('No repair budget'), write: () => assert.fail('Research paused'),
  });
  assert.equal(checks, 2); assert.equal(result.draftsValid, true);
  let attempts = 0;
  await assert.rejects(runValidatedResearch({ allowBacklogPublication: true, shouldContinue: () => false, remaining: () => 1, maxRepairRounds: 0, log: () => {},
    validate: () => feedback, isolate: () => { attempts++; return true; }, repair: () => assert.fail('No repair budget'),
  }), /remains incomplete/);
  assert.equal(attempts, 1);
});
