import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { deliverJobsOnce, mergeJobsState, readJobsState, writeJobsState } from './telegram-jobs-delivery.mjs';
import { postingSlot } from './posting-slot.mjs';

function fixture(t) {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'jobs-delivery-'));
  t.after(() => fs.rmSync(cwd, { recursive: true, force: true }));
  const slot = postingSlot('afternoon', '2026-09-29');
  t.mock.method(Date, 'now', () => slot.start + 60000);
  const options = {
    jobs: [{ key: 'job-123', slug: 'engineer-test', company: 'Example', title: 'Engineer', url: 'https://hashtagweb3.com/engineer-test' }], message: 'The same five-job digest', chatIds: ['@primary', '@mirror'], slot,
    postedFile: path.join(cwd, '.telegram-posted-primary.json'), lastFile: path.join(cwd, '.telegram-posted-last-primary.json'),
    urlFile: path.join(cwd, '.telegram-job-urls-primary.json'), ledgerFile: path.join(cwd, '.telegram-jobs-deliveries-primary.json'),
  };
  const remote = new Map();
  const persist = ({ validateRemote } = {}) => {
    validateRemote?.(remote);
    for (const file of [options.postedFile, options.lastFile, options.urlFile, options.ledgerFile]) if (fs.existsSync(file)) {
      const name = path.basename(file);
      const merged = mergeJobsState(name, JSON.parse(fs.readFileSync(file, 'utf8')), remote.get(name));
      remote.set(name, structuredClone(merged)); writeJobsState(file, merged);
    }
  };
  return { ...options, remote, persist };
}

test('partial channel failure retries only the missing destination with the same digest', async t => {
  const f = fixture(t), calls = [];
  await assert.rejects(deliverJobsOnce({ ...f, send: async (chat, message) => {
    calls.push(chat); assert.equal(message, f.message);
    assert.ok(Object.values(f.remote.get(path.basename(f.ledgerFile))).some(receipt => receipt.chatId === chat && receipt.status === 'reserved'));
    return chat === '@primary' ? { ok: true, result: { message_id: 101 } } : { ok: false };
  } }), /rejected/);
  assert.deepEqual(readJobsState(f.postedFile, []), ['job-123']);
  await deliverJobsOnce({ ...f, send: async (chat, message) => { calls.push(chat); assert.equal(message, f.message); return { ok: true, result: { message_id: 102 } }; } });
  assert.deepEqual(calls, ['@primary', '@mirror', '@mirror']);
  await deliverJobsOnce({ ...f, send: async () => assert.fail('Completed slot must not resend') });
  assert.deepEqual(readJobsState(f.urlFile, {})['job-123'].slugs, ['engineer-test']);
});

test('failed reservation persistence and ambiguous Telegram responses never cause automatic resends', async t => {
  const f = fixture(t);
  await assert.rejects(deliverJobsOnce({ ...f, persist: () => { throw new Error('push failed'); }, send: async () => assert.fail() }), /push failed/);
  assert.deepEqual(readJobsState(f.ledgerFile, {}), {});
  await assert.rejects(deliverJobsOnce({ ...f, send: async () => { throw new Error('connection lost'); } }), /connection lost/);
  await assert.rejects(deliverJobsOnce({ ...f, send: async () => assert.fail('Unconfirmed delivery') }), /Unconfirmed/);
});

test('fresh remote slot receipts block stale runners, and only confirmed sends enter job history', async t => {
  const f = fixture(t);
  await assert.rejects(deliverJobsOnce({ ...f, send: async () => ({ ok: false }) }), /rejected/);
  assert.deepEqual(readJobsState(f.postedFile, []), []);
  await deliverJobsOnce({ ...f, send: async () => ({ ok: true, result: { message_id: 555 } }) });
  writeJobsState(f.ledgerFile, {});
  await assert.rejects(deliverJobsOnce({ ...f, send: async () => assert.fail('Concurrent receipt') }), /already completed/);
});

test('merging jobs state preserves old identities, URL aliases, and sent receipts', () => {
  assert.equal(mergeJobsState('.telegram-posted-test.json', ['new'], Array.from({ length: 600 }, (_, i) => `old-${i}`)).length, 601);
  const local = { a: { slugs: ['new-url'], lastSlug: 'new-url', updatedAt: '2026-09-29T00:00:00Z' } };
  const remote = { a: { slugs: ['old-url'], lastSlug: 'old-url', updatedAt: '2026-09-28T00:00:00Z' } };
  assert.deepEqual(mergeJobsState('.telegram-job-urls-test.json', local, remote).a.slugs, ['old-url', 'new-url']);
  assert.throws(() => mergeJobsState('.telegram-posted-test.json', {}, undefined), /Invalid/);
});
