import assert from 'node:assert/strict';
import { test } from 'node:test';
import { runResearchRounds } from './run-news-research.mjs';

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
