import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { deliverJobsOnce, mergeJobsState, readJobsState, writeJobsState, formatJobsMessage, verifyJobsDigest } from './telegram-jobs-delivery.mjs';
import { postingSlot } from './posting-slot.mjs';

function fixture(t) {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'jobs-delivery-'));
  t.after(() => fs.rmSync(cwd, { recursive: true, force: true }));
  const slot = postingSlot('afternoon', '2026-09-29');
  t.mock.method(Date, 'now', () => slot.start + 60000);
  const snapshot = { id: 'job-123', slug: 'engineer-test', company: 'Example', title: 'Engineer', date: new Date(slot.start - 86400000).toISOString(), link: 'https://careers.example.com/engineer-test' };
  const jobs = [{ ...snapshot, snapshot, key: snapshot.id, url: 'https://hashtagweb3.com/engineer-test' }];
  const options = {
    jobs, message: formatJobsMessage(jobs), chatIds: ['@primary', '@mirror'], slot,
    preflight: (batch, message) => verifyJobsDigest(batch, message, { loadJobs: async () => [snapshot], request: async () => new Response('<html><body><h1>Engineer</h1><p>Build distributed systems at Example.</p><a href="/engineer-test/apply">Apply now</a></body></html>', { headers: { 'content-type': 'text/html' } }) }),
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

test('stale and incomplete stored retry digests never reach any destination or alter prior receipts', async t => {
  const f = fixture(t);
  await deliverJobsOnce({ ...f, chatIds: ['@primary'], send: async () => ({ ok: true, result: { message_id: 901 } }) });
  const previous = readJobsState(f.ledgerFile, {});
  for (const date of [undefined, '', 'invalid', '2024-03-09T05:33:00.298Z']) {
    const jobs = f.jobs.map(job => ({ ...job, snapshot: { ...job.snapshot, date } }));
    await assert.rejects(deliverJobsOnce({ ...f, jobs, send: async () => assert.fail('Stale mirror must not send') }), /publication blocked/);
    assert.deepEqual(readJobsState(f.ledgerFile, {}), previous);
  }
});

test('employer failure on the second destination keeps the first success and performs no mirror send', async t => {
  const f = fixture(t);
  let sends = 0, gets = 0;
  const preflight = (jobs, message) => verifyJobsDigest(jobs, message, { loadJobs: async () => [f.jobs[0].snapshot], request: async () => {
    gets++;
    return gets > 2 ? new Response('Gone', { status: 410 }) : new Response('<h1>Engineer</h1><a href="apply">Apply now</a>', { headers: { 'content-type': 'text/html' } });
  } });
  await assert.rejects(deliverJobsOnce({ ...f, preflight, send: async () => { sends++; return { ok: true, result: { message_id: 902 } }; } }), /closed: HTTP 410/);
  assert.equal(sends, 1);
  const receipts = Object.values(readJobsState(f.ledgerFile, {}));
  assert.equal(receipts.length, 1); assert.equal(receipts[0].status, 'sent'); assert.equal(receipts[0].messageId, 902);
});

test('age is checked after durable reservation and arbitrary stored message bodies are refused', async t => {
  const f = fixture(t);
  await assert.rejects(deliverJobsOnce({ ...f, message: `${f.message}\nOld role https://hashtagweb3.com/marketing4`, send: async () => assert.fail('Unknown stored job') }), /does not match/);
  const forged = f.jobs.map(job => ({ ...job, company: 'Harmony', title: 'Marketing Lead' }));
  await assert.rejects(deliverJobsOnce({ ...f, jobs: forged, message: '- Harmony is hiring <a href="https://hashtagweb3.com/engineer-test">Marketing Lead</a>', send: async () => assert.fail('Unknown stored caption') }), /does not match/);
  assert.deepEqual(readJobsState(f.ledgerFile, {}), {});
  const persist = options => { f.persist(options); f.jobs[0].snapshot.date = '2024-03-09T05:33:00.298Z'; };
  await assert.rejects(deliverJobsOnce({ ...f, persist, send: async () => assert.fail('Expired after reservation') }), /expired/);
  assert.equal(Object.values(readJobsState(f.ledgerFile, {}))[0].status, 'reserved');
});
