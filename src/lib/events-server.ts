import { Web3Event, getEventEcosystems, getEventSlug, getEventType } from './events';
import { loadStaticJson } from './load-static-json';
import { WASET_ICBT_SERIES_ID } from './waset-icbt';

function getLegacyEventSlugFromName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function getLegacyEventSlug(event: Web3Event): string {
  return getLegacyEventSlugFromName(event.name);
}

function getReadableLegacyEventSlug(event: Web3Event): string {
  const name = event.name.replace(/\s+\[\d+\]$/g, '').trim();
  return getLegacyEventSlugFromName(name);
}

const EVENTS_CACHE_TTL_MS = 5 * 60 * 1000;
let eventsCache: { value: Web3Event[]; expiresAt: number } | null = null;

export async function getEvents(): Promise<Web3Event[]> {
  if (eventsCache && eventsCache.expiresAt > Date.now()) return eventsCache.value;

  const events = await loadStaticJson<Web3Event[]>('events-runtime.json');
  eventsCache = { value: events, expiresAt: Date.now() + EVENTS_CACHE_TTL_MS };
  return events;
}

export async function getEventBySlug(slug: string): Promise<Web3Event | null> {
  const events = await getEvents();
  const normalized = slug.toLowerCase().trim();

  let found = events.find((e) => getEventSlug(e) === normalized);
  if (found) return found;

  const LEGACY_SLUG_ALIASES: Record<string, string> = {
    pbw: 'signal-week',
    'paris-blockchain-week': 'signal-week',
    icbti: 'waset-icbt',
  };
  const aliased = LEGACY_SLUG_ALIASES[normalized];
  if (aliased) {
    found = events.find((e) => getEventSlug(e) === aliased || e.id === WASET_ICBT_SERIES_ID);
    if (found) return found;
  }

  const legacyMatches = events.filter(
    (event) =>
      getLegacyEventSlug(event) === normalized || getReadableLegacyEventSlug(event) === normalized,
  );
  if (legacyMatches.length === 1) return legacyMatches[0];

  found = events.find(
    (e) =>
      e.id.toLowerCase() === normalized
      || e.id.replace(/^(premier|side)-/, '').toLowerCase() === normalized,
  );
  if (found) return found;

  if (/-\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    const baseSlug = normalized.replace(/-\d{4}-\d{2}-\d{2}$/, '');
    found = events.find((e) => getEventSlug(e) === baseSlug);
    if (found) return found;
  }

  return null;
}

export async function getRelatedEvents(
  currentEvent: Web3Event,
  limit: number = 3,
  allEvents?: Web3Event[],
): Promise<Web3Event[]> {
  const events = allEvents ?? (await getEvents());
  const currentEcosystems = getEventEcosystems(currentEvent);
  const currentType = getEventType(currentEvent);

  return events
    .filter((e) => e.id !== currentEvent.id && new Date(e.startDate) >= new Date())
    .map((e) => {
      let score = 0;
      if (e.city && currentEvent.city && e.city.toLowerCase() === currentEvent.city.toLowerCase()) score += 4;
      if (e.country && currentEvent.country && e.country.toLowerCase() === currentEvent.country.toLowerCase()) score += 2;
      if (getEventType(e) === currentType) score += 2;
      const otherEcosystems = getEventEcosystems(e);
      const shared = otherEcosystems.filter((tag) => currentEcosystems.includes(tag));
      score += shared.length * 3;
      return { event: e, score };
    })
    .sort(
      (a, b) =>
        b.score - a.score
        || new Date(a.event.startDate).getTime() - new Date(b.event.startDate).getTime(),
    )
    .slice(0, limit)
    .map((item) => item.event);
}
