import { eventRetentionEnd } from './event-dates.mjs';

export const EVENT_RETENTION_MS = 30 * 86400000;
export const isRootSlug = value => typeof value === 'string' && /^[a-z0-9][a-z0-9_-]*$/i.test(value);

export function isEventRetentionDue(event, now = Date.now()) {
  const end = eventRetentionEnd(event);
  return end !== null && now >= end + EVENT_RETENTION_MS;
}

export function tombstoneExpiry(now) {
  const expiry = new Date(now);
  const day = expiry.getUTCDate();
  expiry.setUTCDate(1);
  expiry.setUTCFullYear(expiry.getUTCFullYear() + 1);
  const lastDay = new Date(Date.UTC(expiry.getUTCFullYear(), expiry.getUTCMonth() + 1, 0)).getUTCDate();
  expiry.setUTCDate(Math.min(day, lastDay));
  return expiry.toISOString();
}

export function activeEventTombstones(tombstones, now = Date.now()) {
  return Object.fromEntries(Object.entries(tombstones).filter(([, entry]) => Date.parse(entry.until) > now));
}

export function tombstoneSlugs(tombstones, now = Date.now()) {
  return new Set(Object.values(activeEventTombstones(tombstones, now)).flatMap(entry => entry.slugs));
}

export function canImportEvent(event, tombstones = {}, now = Date.now()) {
  if (isEventRetentionDue(event, now)) return false;
  const active = activeEventTombstones(tombstones, now);
  return !Object.hasOwn(active, event.id || '') && !Object.hasOwn(active, event.sourceVerification?.eventId || '');
}

export function removedEventStatus(pathname, tombstones, now = Date.now()) {
  const normalized = pathname.replace(/\/+$/, '').toLowerCase();
  const slug = normalized.startsWith('/preview/') && normalized.endsWith('.html')
    ? normalized.slice(9, -5) : normalized.replace(/^\//, '');
  if (!isRootSlug(slug)) return null;
  for (const entry of Object.values(tombstones)) {
    if (entry.slugs.includes(slug)) return Date.parse(entry.until) > now ? 410 : 404;
  }
  return null;
}
