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
