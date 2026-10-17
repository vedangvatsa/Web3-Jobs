import test from 'node:test';
import assert from 'node:assert/strict';
import { durableReceipt, mergeReceipts, receiptPath } from './newknowledge-state.mjs';

const encode = state => JSON.stringify(state, null, 2) + '\n';
function memory(options = {}) {
  let state = options.initial || null, revision = 0;
  const writes = [], records = [], stale = [];
  const io = {
    read: async () => stale.length ? stale.shift() : ({ state: structuredClone(state), text: state ? encode(state) : null, sha: state ? String(revision) : null }),
    write: async ({ sha, text }) => {
      writes.push({ sha, text });
      if (options.write) return options.write({ sha, text });
      if (sha !== (state ? String(revision) : null)) return { ok: false, status: 409, message: 'sha conflict' };
      state = JSON.parse(text); revision++; return { ok: true };
    },
    record: async value => records.push(structuredClone(value)), wait: async () => {},
  };
  return { io, writes, records, stale, state: () => state, store: () => durableReceipt(io) };
}

test('acknowledged stale GETs and 404s never erase a saved ID', async () => {
  const db = memory(), store = db.store();
  await store.load();
  let state = await store.save({ claimId: 'owner', status: 'claimed' });
  const claim = structuredClone(state);
  db.stale.push({ state: null, text: null, sha: null });
  state = await store.save({ ...state, status: 'accepted', postId: 'provider-id' });
  db.stale.push({ state: claim, text: encode(claim), sha: '1' }, { state: null, text: null, sha: null });
  await store.save({ ...state, status: 'verified' });
  assert.equal(db.writes.length, 3);
  assert.equal(db.state().postId, 'provider-id');
  assert.equal(db.state().status, 'verified');
});

test('merges preserve unrelated receipt evidence and status never moves backward', () => {
  const remote = { claimId: 'same', status: 'verified', platforms: { x: { postId: 'x1' } }, steps: { 0: { containerId: 'c1', postId: 'p1', status: 'verified' } } };
  const local = { claimId: 'same', status: 'claimed', platforms: { threads: { postId: 't1' } }, steps: { 0: { containerId: 'c1', status: 'container-created' }, 1: { createClaim: 'second', status: 'claimed' } } };
  const merged = mergeReceipts(remote, local);
  assert.equal(merged.status, 'verified');
  assert.equal(merged.steps[0].postId, 'p1');
  assert.equal(merged.steps[0].status, 'verified');
  assert.equal(merged.steps[1].createClaim, 'second');
  assert.deepEqual(merged.platforms, { x: { postId: 'x1' }, threads: { postId: 't1' } });
  for (const change of [{ claimId: 'other' }, { steps: { 0: { postId: 'other' } } }, { steps: { 0: { containerId: 'other' } } }]) assert.throws(() => mergeReceipts(remote, change), /Conflicting receipt/);
});

test('concurrent creators cannot both acquire a date/platform claim', async () => {
  const db = memory(), a = db.store(), b = db.store();
  await Promise.all([a.load(), b.load()]);
  const results = await Promise.allSettled([
    a.save({ claimId: 'a', status: 'claimed' }), b.save({ claimId: 'b', status: 'claimed' }),
  ]);
  assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
  assert.equal(results.filter(result => result.status === 'rejected').length, 1);
  assert.notEqual(receiptPath('2026-10-18', 'x'), receiptPath('2026-10-18', 'threads'));
  assert.notEqual(receiptPath('2026-10-18', 'x'), receiptPath('2026-10-19', 'x'));
});

test('eight CAS races stop with local journal evidence; non-conflict failures do not retry', async () => {
  for (const status of [409, 422, 403]) {
    const db = memory({ write: async () => ({ ok: false, status, message: 'sha conflict' }) });
    const store = db.store(); await store.load();
    await assert.rejects(store.save({ claimId: 'a', postId: 'saved-locally', status: 'accepted' }), /publishing stopped/);
    assert.equal(db.writes.length, status === 403 ? 1 : 8);
    assert.ok(db.records.some(value => value.postId === 'saved-locally'));
  }
});

test('unknown write acknowledgement stops before a caller can mutate a provider', async () => {
  const db = memory({ write: async () => { throw new Error('socket closed after PUT'); } });
  let providerCalls = 0;
  await assert.rejects(async () => {
    await db.store().save({ claimId: 'a', status: 'claimed' });
    providerCalls++;
  }, /socket closed/);
  assert.equal(providerCalls, 0);
  assert.equal(db.writes.length, 1);
});
