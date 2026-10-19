import assert from 'node:assert/strict';
import { test } from 'node:test';
import { prepareResearch } from './lib/news-research.mjs';
import { recordResearchBatch } from './news-research.mjs';

function fixture() {
  const ledger = { version: 1, candidates: {}, runs: {} }, day = '2026-10-19';
  prepareResearch({ ledger, day, articles: [], discovery: { total: 2, feeds: [{ ok: true }], candidates: [
    { title: 'An issuer files audited financial statements', link: 'https://one.example/filing', source: 'One', published: day },
    { title: 'A separate exchange announces an acquisition', link: 'https://two.example/acquisition', source: 'Two', published: day },
  ] }, now: Date.parse(`${day}T12:00:00Z`) });
  const id = ledger.runs[day].candidateIds[0];
  const review = { id, status: 'ready', articleSlug: 'filing', note: 'The issuer\'s filing says "$5M"; the amount and date match both opened reports.', sourceChecks: [{ url: 'https://one.example/filing', outcome: 'read' }, { url: 'https://two.example/report', outcome: 'read' }] };
  return { ledger, day, review, articles: [{ slug: 'filing' }] };
}

test('JSON review batches preserve quotes, currency signs, and source checks exactly', () => {
  const { ledger, day, review, articles } = fixture();
  const next = recordResearchBatch(ledger, day, JSON.parse(JSON.stringify([review])), articles);
  assert.equal(next.runs[day].outcomes[review.id].note, review.note);
  assert.deepEqual(next.runs[day].outcomes[review.id].sourceChecks, review.sourceChecks);
  assert.equal(ledger.runs[day].outcomes[review.id], undefined);
});

test('an invalid batch outcome leaves every original candidate untouched', () => {
  const { ledger, day, review, articles } = fixture();
  const before = JSON.stringify(ledger);
  assert.throws(() => recordResearchBatch(ledger, day, [review, { ...review, id: 'missing' }], articles), /Review missing: Candidate/);
  assert.equal(JSON.stringify(ledger), before);
  assert.throws(() => recordResearchBatch(ledger, day, [{ ...review, note: 'too short' }], articles), /specific research outcome/);
  assert.throws(() => recordResearchBatch(ledger, day, [{ ...review, sourceChecks: [] }], articles), /two independent/);
});
