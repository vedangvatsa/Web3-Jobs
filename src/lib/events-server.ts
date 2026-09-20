import { Web3Event, getEventEcosystems, getEventSlug, getEventType } from './events';
import { WASET_ICBT_SERIES_ID } from './waset-icbt';
import { loadStaticJson } from './load-static-json';

type EventsIndex = {
  list: Web3Event[];
  bySlug: Map<string, Web3Event>;
};

let eventsIndex: EventsIndex | null = null;
let eventsLoad: Promise<EventsIndex> | null = null;

async function ensureEventsIndex(): Promise<EventsIndex> {
  if (eventsIndex) return eventsIndex;
  if (!eventsLoad) {
    eventsLoad = loadStaticJson<Web3Event[]>('events-runtime.json', value => Array.isArray(value) && value.every((event: unknown) =>
      !!event && typeof event === 'object' && 'id' in event && typeof event.id === 'string' && 'name' in event && typeof event.name === 'string'
    )).then((allEventsList) => {
      const list = Array.isArray(allEventsList) ? allEventsList : [];
      const bySlug = new Map<string, Web3Event>();
      for (const event of list) {
        const s = getEventSlug(event);
        if (s) bySlug.set(s.toLowerCase().trim(), event);
        if (event.id) {
          const id = event.id.toLowerCase().trim();
          bySlug.set(id, event);
          bySlug.set(id.replace(/^(premier|side)-/, ''), event);
        }
      }
      eventsIndex = { list, bySlug };
      return eventsIndex;
    }).finally(() => { eventsLoad = null; });
  }
  return eventsLoad;
}

export async function getEvents(): Promise<Web3Event[]> {
  return (await ensureEventsIndex()).list;
}

export async function getEventBySlug(slug: string): Promise<Web3Event | null> {
  const { list, bySlug } = await ensureEventsIndex();
  const normalized = slug.toLowerCase().trim();
  const direct = bySlug.get(normalized);
  if (direct) return direct;

  const LEGACY_SLUG_ALIASES: Record<string, string> = {
    pbw: 'signal-week',
    'paris-blockchain-week': 'signal-week',
    icbti: 'waset-icbt',
  };
  const aliased = LEGACY_SLUG_ALIASES[normalized];
  if (aliased) {
    const found = bySlug.get(aliased) || (aliased === 'waset-icbt' ? list.find((e) => e.id === WASET_ICBT_SERIES_ID) : undefined);
    if (found) return found;
  }

  if (/-\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    const baseSlug = normalized.replace(/-\d{4}-\d{2}-\d{2}$/, '');
    const found = bySlug.get(baseSlug);
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
