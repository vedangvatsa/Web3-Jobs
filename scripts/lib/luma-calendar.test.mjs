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
  assert.equal(requests[1].searchParams.get('pagination_cursor'), 'next/+=');
  assert.equal(lumaEventUrl('https://organizer.example/event'), 'https://organizer.example/event');
  assert.equal(lumaEventUrl('abc'), 'https://luma.com/abc');
  assert.equal(lumaEventUrl('https://lu.ma/abc'), 'https://luma.com/abc');
});

test('never returns a partial calendar after an error or a repeated cursor', async () => {
  await assert.rejects(fetchLumaCalendarEntries('cal-example', { fetchImpl: async () => new Response('', { status: 429 }) }), /HTTP 429/);
  await assert.rejects(fetchLumaCalendarEntries('cal-example', { fetchImpl: async () => Response.json({ entries: [], has_more: true, next_cursor: 'same' }) }), /did not advance/);
  await assert.rejects(fetchLumaCalendarEntries('cal-example', { pageLimit: 1, fetchImpl: async () => Response.json({ entries: [], has_more: true, next_cursor: 'next' }) }), /limit reached/);
});
