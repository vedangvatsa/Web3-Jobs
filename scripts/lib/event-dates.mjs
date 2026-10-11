// Destructive retention requires a valid, unambiguous end; listing filters may be stricter.
function eventDateEnd(event) {
  if (event.eventStatus === 'EventPostponed') return null;
  const value = event.endDate || event.startDate;
  if (typeof value !== 'string') return null;
  const day = value.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || !Number.isFinite(Date.parse(day)) || new Date(day).toISOString().slice(0, 10) !== day) return null;
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: event.timezone || 'UTC', year: 'numeric', month: '2-digit', day: '2-digit' });
    if (value === day) {
      const localDay = time => {
        const parts = formatter.formatToParts(new Date(time));
        return ['year', 'month', 'day'].map(type => parts.find(part => part.type === type).value).join('-');
      };
      // Find the first instant after the inclusive local end date, including DST transitions.
      let low = Date.parse(day) - 86400000, high = Date.parse(day) + 3 * 86400000;
      while (high - low > 1) {
        const middle = Math.floor((low + high) / 2);
        if (localDay(middle) <= day) low = middle; else high = middle;
      }
      return high;
    }
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:\d{2})$/.test(value)) return null;
    const end = Date.parse(value);
    return Number.isFinite(end) ? end : null;
  } catch { return null; }
}

export function eventRetentionEnd(event) {
  const end = eventDateEnd(event);
  if (end === null || !event.startDate || !event.endDate) return end;
  let start = eventDateEnd({ startDate: event.startDate, timezone: event.timezone });
  if (start === null) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(event.startDate)) {
    const previousDay = new Date(Date.parse(event.startDate) - 86400000).toISOString().slice(0, 10);
    start = eventDateEnd({ startDate: previousDay, timezone: event.timezone });
  }
  return start !== null && start <= end ? end : null;
}

export function hasEventEnded(event, now = Date.now()) {
  const value = event.endDate || event.startDate;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value || '')) {
    if (!Number.isFinite(Date.parse(value))) return true;
    let today;
    try {
      const parts = new Intl.DateTimeFormat('en-CA', { timeZone: event.timezone || 'UTC', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date(now));
      today = ['year', 'month', 'day'].map(type => parts.find(part => part.type === type).value).join('-');
    } catch { today = new Date(now).toISOString().slice(0, 10); }
    return value < today;
  }
  const end = Date.parse(value);
  return !Number.isFinite(end) || end < now;
}
