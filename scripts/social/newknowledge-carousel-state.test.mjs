import test from 'node:test';
import assert from 'node:assert/strict';
import { receiptPath, mergeReceipts } from './newknowledge-state.mjs';
import { carouselReceiptPath, githubCarouselReceipt } from './newknowledge-carousel-state.mjs';

test('carousel receipt namespace cannot overlap X/Threads or another platform/date', () => {
  const paths = ['linkedin', 'instagram'].flatMap(platform => ['2026-10-21', '2026-10-22'].map(date => carouselReceiptPath(date, platform)));
  assert.equal(new Set(paths).size, 4);
  for (const file of paths) {
    assert.match(file, /^scripts\/social\/newknowledge-carousel-receipts\//);
    assert.notEqual(file, receiptPath('2026-10-21', 'x'));
    assert.notEqual(file, receiptPath('2026-10-21', 'threads'));
  }
  for (const platform of ['x', 'threads', '../linkedin']) assert.throws(() => carouselReceiptPath('2026-10-21', platform));
  for (const date of ['2026-10-18', '../2026-10-21', '2026-11-17', '2026-10-32']) assert.throws(() => carouselReceiptPath(date, 'linkedin'));
});

test('GitHub receipt adapter defaults to read-only and uses only its own path', async () => {
  const requests = [];
  const store = githubCarouselReceipt({ date: '2026-10-21', platform: 'linkedin', token: 'mock-token', record: async () => {}, fetcher: async (url, init) => {
    requests.push({ url, init }); return new Response('', { status: 404 });
  } });
  assert.equal(await store.load(), null);
  assert.throws(() => store.save({ claimId: 'a', status: 'claimed' }), /Read-only/);
  assert.equal(requests.length, 1);
  assert.ok(requests[0].url.includes(carouselReceiptPath('2026-10-21', 'linkedin')));
  assert.equal(requests[0].init.method, undefined);
});

test('receipt writes require acknowledged commits and journal proposed known IDs first', async () => {
  const records = [], requests = [];
  const store = githubCarouselReceipt({ date: '2026-10-21', platform: 'instagram', token: 'mock-token', readOnly: false, record: async value => records.push(value), fetcher: async (url, init) => {
    requests.push({ url, init });
    if (init.method !== 'PUT') return new Response('', { status: 404 });
    assert.ok(records.some(record => record.postId === 'known-id'));
    return new Response(JSON.stringify({ content: { sha: 'written' } }), { status: 200 });
  } });
  await store.load();
  await assert.rejects(store.save({ claimId: 'a', status: 'accepted', postId: 'known-id' }), /acknowledgement/);
  assert.equal(requests.filter(request => request.init.method === 'PUT').length, 1);
  const body = JSON.parse(requests.at(-1).init.body);
  assert.equal(body.branch, 'main');
  assert.equal(JSON.parse(Buffer.from(body.content, 'base64')).postId, 'known-id');
});

test('shared receipt merge preserves carousel IDs, account and assets without status regression', () => {
  const remote = { claimId: 'owner', status: 'verified', postId: 'known-id', account: { serviceId: '89714573' }, spec: { caption: 'approved', images: [{ sha256: 'one' }, { sha256: 'two' }] } };
  assert.equal(mergeReceipts(remote, { ...remote, status: 'claimed' }).status, 'verified');
  for (const proposed of [{ claimId: 'other' }, { postId: 'new-id' }, { account: { serviceId: 'other' } }, { spec: { images: [...remote.spec.images].reverse() } }]) assert.throws(() => mergeReceipts(remote, proposed), /Conflicting receipt/);
});
