import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fetchLumaCalendarEntries, lumaEventUrl } from './luma-calendar.mjs';

test('reads every calendar page, including external events, and deduplicates repeated entries', async () => {
  const requests = [];
  const result = await fetchLumaCalendarEntries('cal-example', { fetchImpl: async url => {
    requests.push(new URL(url));
    return Response.json(requests.length === 1
      ? { entries: [{ api_id: 'one', event: { url: 'abc' } }], has_more: true, next_cursor: 'next/+=' }
      : { entries: [{ api_id: 'one', event: { url: 'abc' } }, { api_id: 'two', event: { url: 'https://organizer.example/event' } }], has_more: false });
  } });
  assert.equal(result.pages, 2);
  assert.equal(result.entries.length, 2);
  assert.equal(result.complete, true);
  assert.equal(result.receipts.reduce((n, page) => n + page.rawCount, 0), 3);
  assert.deepEqual(result.receipts[1].repeatedEntryIds, ['one']);
  assert.equal(requests[0].searchParams.get('period'), 'future');
  assert.equal(requests[1].searchParams.get('pagination_cursor'), 'next/+=');
  assert.equal(lumaEventUrl('https://organizer.example/event'), 'https://organizer.example/event');
  assert.equal(lumaEventUrl('abc'), 'https://luma.com/abc');
  assert.equal(lumaEventUrl('https://lu.ma/abc'), 'https://luma.com/abc');
});

test('audits the past view explicitly and requires an explicit terminal has_more', async () => {
  const result = await fetchLumaCalendarEntries('cal-example', { period: 'past', fetchImpl: async url => {
    assert.equal(new URL(url).searchParams.get('period'), 'past');
    return Response.json({ entries: [], has_more: false });
  } });
  assert.equal(result.complete, true);
  assert.equal(result.receipts[0].hasMore, false);
  await assert.rejects(fetchLumaCalendarEntries('cal-example', { fetchImpl: async () => Response.json({ entries: [] }) }), /missing has_more/);
  await assert.rejects(fetchLumaCalendarEntries('cal-example', { period: 'all' }), /Unsupported/);
});

test('never returns a partial calendar after an error or a repeated cursor', async () => {
  await assert.rejects(fetchLumaCalendarEntries('cal-example', { fetchImpl: async () => new Response('', { status: 429 }) }), /HTTP 429/);
  await assert.rejects(fetchLumaCalendarEntries('cal-example', { fetchImpl: async () => Response.json({ entries: [], has_more: true, next_cursor: 'same' }) }), /did not advance/);
  await assert.rejects(fetchLumaCalendarEntries('cal-example', { pageLimit: 1, fetchImpl: async () => Response.json({ entries: [], has_more: true, next_cursor: 'next' }) }), /limit reached/);
});
