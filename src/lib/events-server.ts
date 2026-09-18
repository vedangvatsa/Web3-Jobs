import { Web3Event, getEventEcosystems, getEventSlug, getEventType } from './events';
import { WASET_ICBT_SERIES_ID } from './waset-icbt';
import eventsRuntimeJson from '../../content/events-runtime.json';

const allEventsList: Web3Event[] = (eventsRuntimeJson as Web3Event[]) || [];
const eventBySlugMap = new Map<string, Web3Event>();

for (const event of allEventsList) {
  const s = getEventSlug(event);
  if (s) eventBySlugMap.set(s.toLowerCase().trim(), event);
  if (event.id) {
    const id = event.id.toLowerCase().trim();
    eventBySlugMap.set(id, event);
    eventBySlugMap.set(id.replace(/^(premier|side)-/, ''), event);
  }
}

export async function getEvents(): Promise<Web3Event[]> {
  return allEventsList;
}

export async function getEventBySlug(slug: string): Promise<Web3Event | null> {
  const normalized = slug.toLowerCase().trim();
  const direct = eventBySlugMap.get(normalized);
  if (direct) return direct;

  const LEGACY_SLUG_ALIASES: Record<string, string> = {
    pbw: 'signal-week',
    'paris-blockchain-week': 'signal-week',
    icbti: 'waset-icbt',
  };
  const aliased = LEGACY_SLUG_ALIASES[normalized];
  if (aliased) {
    const found = eventBySlugMap.get(aliased) || allEventsList.find((e) => e.id === WASET_ICBT_SERIES_ID);
    if (found) return found;
  }

  if (/-\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    const baseSlug = normalized.replace(/-\d{4}-\d{2}-\d{2}$/, '');
    const found = eventBySlugMap.get(baseSlug);
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
