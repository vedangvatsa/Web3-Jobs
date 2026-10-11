import assert from 'node:assert/strict';
import { test } from 'node:test';
import { runResearchRounds, runValidatedResearch } from './run-news-research.mjs';

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
