import test from 'node:test';
import type { TestContext } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { runDailyBroadcast } from '../src/lib/resend-daily';
import type { Job } from '../src/types';

function harness(t: TestContext, jobs: Job[]) {
  const env = { ...process.env };
  Object.assign(process.env, { RESEND_API_KEY: 'offline-test-key', RESEND_SEGMENT_ID: 'offline-segment', RESEND_MIN_SEGMENT_CONTACTS: '1' });
  t.after(() => { process.env = env; });
  const read = fs.readFileSync;
  const writes: string[] = [];
  const states = new Map<string, string>();
  t.mock.method(fs, 'readFileSync', ((file: fs.PathOrFileDescriptor, ...args: unknown[]) => {
    if (/\.resend-broadcast-(?:sent|last)\.json$/.test(String(file))) return states.get(String(file)) || (String(file).includes('-sent.') ? '[]' : 'null');
    return Reflect.apply(read, fs, [file, ...args]);
  }) as typeof fs.readFileSync);
  t.mock.method(fs, 'writeFileSync', ((file: fs.PathOrFileDescriptor, data: string) => {
    assert.match(String(file), /\.resend-broadcast-(?:sent|last)\.json$/);
    writes.push(String(file)); states.set(String(file), data);
  }) as typeof fs.writeFileSync);
  const bodies: Record<string, unknown>[] = [];
  const h = { jobs, bodies, writes, employerStatus: 200, employerGets: 0, disappearBeforeSend: false };
  t.mock.method(globalThis, 'fetch', async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input);
    if (url === 'https://hashtagweb3.com/data/jobs-runtime.json') return Response.json(h.disappearBeforeSend && h.employerGets > 0 ? [] : h.jobs);
    if (url.startsWith('https://careers.example.com/roles/')) {
      h.employerGets++;
      assert.equal(init?.method, 'GET');
      return new Response('<html><head><title>Software Engineer at Example</title></head><body><h1>Software Engineer</h1><p>Build distributed systems at Example. Work with the infrastructure team.</p><a href="apply">Apply now</a></body></html>', { status: h.employerStatus, headers: { 'content-type': 'text/html' } });
    }
    if (url.startsWith('https://api.resend.com/broadcasts?')) return Response.json({ data: [] });
    if (url.startsWith('https://api.resend.com/segments/offline-segment/contacts')) return Response.json({ data: [{ id: 'test-contact', unsubscribed: false }], has_more: false });
    assert.equal(url, 'https://api.resend.com/broadcasts');
    assert.equal(init?.method, 'POST');
    bodies.push(JSON.parse(String(init.body)));
    return Response.json({ id: 'test-broadcast-id' });
  });
  return h;
}

const fresh = (): Job => ({ id: 'source-1', slug: 'engineer1', title: 'Software Engineer', company: 'Example', source: 'Employer', date: new Date(Date.now() - 3600000).toISOString(), active: true, link: 'https://careers.example.com/roles/engineer1' });

test('forced email broadcasts do not send expired, unknown, invalid, future or inactive jobs', async t => {
  const job = fresh();
  const h = harness(t, [{ ...job, date: '2024-03-09T05:33:00.298Z' }, { ...job, date: '' }, { ...job, date: 'bad-date' },
    { ...job, date: new Date(Date.now() + 86400000).toISOString() }, { ...job, active: false }, { ...job, dateVerified: false }]);
  assert.equal((await runDailyBroadcast({ forceSend: true })).status, 'empty');
  assert.equal(h.bodies.length, 0); assert.equal(h.writes.length, 0); assert.equal(h.employerGets, 0);
});

test('email selection refuses dead applications and final send rechecks removal from the live catalog', async t => {
  const h = harness(t, [fresh()]);
  for (const status of [404, 410, 403, 503]) {
    h.employerStatus = status;
    assert.equal((await runDailyBroadcast({ forceSend: true })).status, 'empty');
  }
  h.employerStatus = 200; h.employerGets = 0; h.disappearBeforeSend = true;
  await assert.rejects(runDailyBroadcast({ forceSend: true }), /absent from the live catalog/);
  assert.equal(h.bodies.length, 0); assert.equal(h.writes.length, 0);
});

test('fresh email has complete role bodies, a fresh employer GET before delivery and deduplicated receipts', async t => {
  const h = harness(t, [fresh(), { ...fresh(), id: 'stale', slug: 'marketing4', date: '2024-03-09T05:33:00.298Z' }]);
  const result = await runDailyBroadcast({ forceSend: true });
  assert.equal(result.status, 'sent'); assert.equal(result.broadcastId, 'test-broadcast-id');
  assert.equal(h.employerGets, 2); assert.equal(h.bodies.length, 1);
  const body = h.bodies[0];
  assert.equal(body.subject, '1 new Web3 roles today'); assert.equal(body.send, true);
  assert.equal(body.segment_id, 'offline-segment');
  for (const value of [body.html, body.text]) {
    assert.match(String(value), /Software Engineer/); assert.match(String(value), /Example/);
    assert.match(String(value), /https:\/\/hashtagweb3.com\/engineer1\?utm_source=newsletter/);
    assert.match(String(value), /RESEND_UNSUBSCRIBE_URL/); assert.doesNotMatch(String(value), /marketing4/);
  }
  assert.equal(h.writes.length, 2);
  assert.equal((await runDailyBroadcast({ forceSend: true })).status, 'empty');
  assert.equal(h.bodies.length, 1);
});

test('email dry runs do not create or delete provider drafts', async t => {
  const h = harness(t, [fresh()]);
  assert.equal((await runDailyBroadcast({ dryRun: true })).status, 'dry-run');
  assert.equal(h.bodies.length, 0); assert.equal(h.writes.length, 0);
});
