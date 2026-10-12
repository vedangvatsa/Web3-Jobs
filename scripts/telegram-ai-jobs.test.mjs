import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchGreenhouse, fetchAshby, sendToTelegram } from './telegram-ai-jobs.mjs';

const fresh = () => ({ id: 'id-1', title: 'AI Research Engineer', company: 'Example', link: 'https://careers.example.com/roles/id-1', date: new Date(Date.now() - 86400000).toISOString() });

test('AI job feeds never substitute updated_at or fetch time for a missing original posting date', async t => {
  const job = fresh();
  t.mock.method(globalThis, 'fetch', async url => String(url).includes('greenhouse')
    ? Response.json({ jobs: [{ id: job.id, title: job.title, absolute_url: job.link, updated_at: new Date().toISOString() }] })
    : Response.json({ jobs: [{ id: job.id, title: job.title, jobUrl: job.link }] }));
  assert.equal((await fetchGreenhouse('example', 'Example'))[0].date, '');
  assert.equal((await fetchAshby('example', 'Example'))[0].date, '');
});

test('AI job transport blocks unknown or stale dates before requests, and dead links before Telegram', async t => {
  let calls = 0;
  t.mock.method(globalThis, 'fetch', async (url, init) => {
    calls++;
    assert.equal(String(url), fresh().link); assert.equal(init.method, 'GET');
    return new Response('Not found', { status: 404 });
  });
  for (const date of ['', 'invalid', '2024-03-09T05:33:00.298Z', new Date(Date.now() + 86400000).toISOString()]) {
    await assert.rejects(sendToTelegram([{ ...fresh(), date }]), /publication blocked/);
  }
  assert.equal(calls, 0);
  await assert.rejects(sendToTelegram([fresh()]), /application closed: HTTP 404/);
  assert.equal(calls, 1);
});

test('fresh AI delivery checks the employer and sends the verified role body', async t => {
  const job = fresh();
  let gets = 0, sends = 0;
  t.mock.method(globalThis, 'fetch', async (url, init) => {
    if (String(url) === job.link) {
      gets++; assert.equal(init.method, 'GET');
      return new Response('<html><body><h1>AI Research Engineer</h1><p>Research inference systems at Example.</p><a href="apply">Apply now</a></body></html>', { headers: { 'content-type': 'text/html' } });
    }
    sends++; assert.equal(gets, 1); assert.match(String(url), /api.telegram.org\/bot.*\/sendMessage/);
    const body = JSON.parse(init.body);
    assert.equal(body.parse_mode, 'HTML'); assert.equal(body.disable_web_page_preview, true);
    assert.match(body.text, /Example is hiring/); assert.match(body.text, /AI Research Engineer/); assert.ok(body.text.includes(job.link));
    return Response.json({ ok: true, result: { message_id: 301 } });
  });
  await sendToTelegram([job]); assert.equal(sends, 1);
});
