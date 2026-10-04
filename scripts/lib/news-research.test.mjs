import assert from 'node:assert/strict';
import { test } from 'node:test';
import { addResearchCandidate, finalizeResearch, prepareResearch, readTips, researchReport, reviewCandidate, retryUnpublishedDrafts, validateLedger } from './news-research.mjs';

const day = '2026-10-04', now = Date.parse(`${day}T03:30:00Z`);
const candidate = { title: 'Protocol approves new fee schedule', link: 'https://outlet.example/fees', source: 'Outlet', published: '2026-10-03T20:00:00Z', sources: [{ name: 'Outlet', url: 'https://outlet.example/fees' }] };
const discovery = candidates => ({ candidates, total: candidates.length, feeds: [{ source: 'Outlet', ok: true, items: candidates.length }] });
function fixture(candidates = [candidate]) {
  const ledger = { version: 1, candidates: {}, runs: {} };
  prepareResearch({ ledger, discovery: discovery(candidates), articles: [], day, now });
  return { ledger, id: ledger.runs[day].candidateIds[0] };
}
const ready = id => ({ id, status: 'ready', articleSlug: 'fee-vote', note: 'Read the primary proposal and independent reporting confirming the vote.', sourceChecks: [{ url: 'https://protocol.example/proposal', outcome: 'read' }, { url: candidate.link, outcome: 'read' }] });
const deferred = id => ({ id, status: 'deferred', reason: 'source-blocked', note: 'The independent report returned HTTP 403; the proposal was readable.', sourceChecks: [{ url: candidate.link, outcome: 'blocked' }], retrySearches: ['Find another independent report confirming the fee vote'] });

test('publishing one article cannot hide an unreviewed candidate', () => {
  const { ledger, id } = fixture([candidate, { ...candidate, title: 'Exchange announces corporate acquisition', link: 'https://outlet.example/acquisition' }]);
  reviewCandidate(ledger, day, ready(id), { articles: [{ slug: 'fee-vote' }], now });
  const report = finalizeResearch(ledger, day, { now });
  assert.equal(report.complete, false);
  assert.equal(report.counts.unreviewed, 1);
  assert.equal(report.counts.published, 0);
  assert.equal(ledger.candidates[id].status, 'ready');
});

test('source blockers survive a completed day and return in the next daily batch', () => {
  const { ledger, id } = fixture();
  reviewCandidate(ledger, day, deferred(id), { articles: [], now });
  assert.equal(finalizeResearch(ledger, day, { now }).complete, true);
  const persisted = JSON.parse(JSON.stringify(ledger));
  prepareResearch({ ledger: persisted, discovery: discovery([]), articles: [], day: '2026-10-05', now: now + 86400000 });
  assert.deepEqual(persisted.runs['2026-10-05'].candidateIds, [id]);
  assert.equal(researchReport(persisted, '2026-10-05').counts.unreviewed, 1);
  assert.match(persisted.candidates[id].retrySearches[0], /independent/);
});

test('deferred leads expire explicitly rather than disappearing or getting redated', () => {
  const { ledger, id } = fixture(); reviewCandidate(ledger, day, deferred(id), { articles: [], now }); finalizeResearch(ledger, day, { now });
  prepareResearch({ ledger, discovery: discovery([]), articles: [], day: '2026-10-08', now: now + 4 * 86400000 });
  const outcome = ledger.runs['2026-10-08'].outcomes[id];
  assert.equal(outcome.reason, 'stale');
  assert.equal(ledger.candidates[id].published, candidate.published);
});

test('a failed source fetch is not a successful zero-news day', () => {
  const ledger = { version: 1, candidates: {}, runs: {} };
  prepareResearch({ ledger, discovery: { candidates: [], total: 0, feeds: [{ ok: false, source: 'Outlet', error: 'HTTP 503' }] }, articles: [], day, now });
  assert.equal(finalizeResearch(ledger, day, { now }).complete, false);
});

test('source failures require a documented deferral and ready drafts need independent sources', () => {
  const { ledger, id } = fixture();
  assert.throws(() => reviewCandidate(ledger, day, { ...deferred(id), status: 'rejected' }, { articles: [], now }), /must be deferred/);
  assert.throws(() => reviewCandidate(ledger, day, { ...deferred(id), retrySearches: [] }, { articles: [], now }), /research next/);
  assert.throws(() => reviewCandidate(ledger, day, { ...ready(id), sourceChecks: [ready(id).sourceChecks[0]] }, { articles: [{ slug: 'fee-vote' }], now }), /two independent/);
  assert.throws(() => reviewCandidate(ledger, day, { ...ready(id), articleSlug: '../../secret' }, { articles: [], now }), /article slug/);
});

test('a complete audited batch finalizes once and same-day retries are idempotent', () => {
  const { ledger, id } = fixture(); reviewCandidate(ledger, day, ready(id), { articles: [{ slug: 'fee-vote' }], now });
  assert.equal(finalizeResearch(ledger, day, { now }).counts.published, 1);
  const snapshot = JSON.stringify(ledger);
  prepareResearch({ ledger, discovery: discovery([candidate]), articles: [], day, now: now + 1000 });
  finalizeResearch(ledger, day, { now: now + 1000 });
  assert.equal(JSON.stringify(ledger), snapshot);
});

test('failed quality gates retain drafts as unpublished and require review on retry', () => {
  const { ledger, id } = fixture(); reviewCandidate(ledger, day, ready(id), { articles: [{ slug: 'fee-vote' }], now });
  assert.equal(finalizeResearch(ledger, day, { validationErrors: ['Missing image credit'], now }).complete, false);
  retryUnpublishedDrafts(ledger, day);
  assert.equal(researchReport(ledger, day).counts.unreviewed, 1);
  assert.deepEqual(ledger.candidates[id].lastValidationErrors, ['Missing image credit']);
});

test('manual tips enter the auditable queue and exact covered stories have recorded outcomes', () => {
  const tips = readTips('- https://primary.example/filing - A new filing to check\nA plain note');
  const ledger = { version: 1, candidates: {}, runs: {} };
  prepareResearch({ ledger, discovery: discovery([candidate]), articles: [{ slug: 'old-vote', title: candidate.title }], tips, day, now });
  const report = researchReport(ledger, day);
  assert.equal(report.counts.rejected, 1);
  assert.equal(report.counts.unreviewed, 1);
  assert.equal(report.outcomes.find(item => item.status === 'rejected').duplicateOf, 'old-vote');
});

test('a corrupt outcome cannot satisfy the daily coverage gate', () => {
  const { ledger, id } = fixture();
  ledger.runs[day].outcomes[id] = { status: 'made-up', note: 'This must never count as a completed research outcome.' };
  assert.throws(() => validateLedger(ledger), /Invalid research outcome/);
});

test('a genuine quiet day completes without an article quota', () => {
  const { ledger } = fixture([]);
  const report = finalizeResearch(ledger, day, { now });
  assert.equal(report.complete, true);
  assert.equal(report.counts.published, 0);
});

test('a duplicate of an unpublished draft is reopened when that batch fails', () => {
  const { ledger, id } = fixture([candidate, { ...candidate, title: 'Fee revenue goes to network users after governance approval', link: 'https://second.example/fees' }]);
  const duplicateId = ledger.runs[day].candidateIds[1];
  const articles = [{ slug: 'fee-vote' }];
  assert.throws(() => reviewCandidate(ledger, day, { id: duplicateId, status: 'rejected', reason: 'duplicate', duplicateOf: 'fee-vote', note: 'Another draft covers the same event but it is not ready yet.' }, { articles, now }), /another ready candidate/);
  reviewCandidate(ledger, day, ready(id), { articles, now });
  reviewCandidate(ledger, day, { id: duplicateId, status: 'rejected', reason: 'duplicate', duplicateOf: 'fee-vote', note: 'This is another source for the same fee vote covered in the ready draft.' }, { articles, now });
  finalizeResearch(ledger, day, { validationErrors: ['Invalid image'], now });
  retryUnpublishedDrafts(ledger, day);
  assert.equal(researchReport(ledger, day).counts.unreviewed, 2);
});

test('an explicitly resubmitted manual tip is not lost to an older rejection', () => {
  const { ledger, id } = fixture();
  reviewCandidate(ledger, day, { id, status: 'rejected', reason: 'opinion', note: 'The original piece only offered analysis without a concrete new event.' }, { articles: [], now });
  finalizeResearch(ledger, day, { now });
  prepareResearch({ ledger, day: '2026-10-05', now: now + 86400000, discovery: discovery([]), articles: [], tips: readTips(`- ${candidate.link} - New filing added to this source today`) });
  assert.equal(researchReport(ledger, '2026-10-05').counts.unreviewed, 1);
  assert.equal(ledger.candidates[id].manual, true);
});

test('extra fresh research leads enter the same daily coverage gate', () => {
  const { ledger } = fixture([]);
  addResearchCandidate(ledger, day, candidate, now);
  assert.equal(researchReport(ledger, day).counts.unreviewed, 1);
  addResearchCandidate(ledger, day, candidate, now);
  assert.equal(researchReport(ledger, day).candidates, 1);
  assert.throws(() => addResearchCandidate(ledger, day, { ...candidate, published: '2026-09-01' }, now), /fresh source/);
});
