export function lumaEventUrl(value, eventId) {
  const candidate = value || eventId;
  if (!candidate) return null;
  try {
    const url = new URL(candidate.startsWith('http') ? candidate : `https://luma.com/${candidate}`);
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    if (url.hostname === 'lu.ma') url.hostname = 'luma.com';
    return url.href;
  } catch { return null; }
}

export async function fetchLumaCalendarEntries(calendarId, { fetchImpl = fetch, headers = {}, pageLimit = 100 } = {}) {
  const entries = new Map();
  const cursors = new Set();
  let cursor = '';
  for (let page = 0; page < pageLimit; page++) {
    const url = new URL('https://api.lu.ma/calendar/get-items');
    url.searchParams.set('calendar_api_id', calendarId);
    url.searchParams.set('period', 'future');
    url.searchParams.set('pagination_limit', '50');
    if (cursor) url.searchParams.set('pagination_cursor', cursor);
    const response = await fetchImpl(url, { headers, signal: AbortSignal.timeout(30000) });
    if (!response.ok) throw new Error(`Luma calendar ${calendarId}: HTTP ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data.entries)) throw new Error(`Luma calendar ${calendarId}: missing entries`);
    for (const entry of data.entries) {
      if (!entry.api_id || !entry.event) throw new Error(`Luma calendar ${calendarId}: invalid entry`);
      entries.set(entry.api_id, entry);
    }
    if (!data.has_more) return { entries: [...entries.values()], pages: page + 1 };
    if (!data.next_cursor || cursors.has(data.next_cursor)) throw new Error(`Luma calendar ${calendarId}: pagination did not advance`);
    cursors.add(data.next_cursor);
    cursor = data.next_cursor;
  }
  throw new Error(`Luma calendar ${calendarId}: pagination limit reached before completion`);
}
