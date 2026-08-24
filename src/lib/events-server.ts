import fs from 'fs';
import path from 'path';
import { Web3Event, normalizeCountry, getEventSlug, getEventEcosystems, getEventType } from './events';

export async function getEvents(): Promise<Web3Event[]> {
  try {
    const cwd = process.cwd();
    const curatedPath = path.join(cwd, 'content', 'curated-events.json');
    const cachePath = path.join(cwd, 'content', 'events-cache.json');

    let curatedEvents: Web3Event[] = [];
    let cachedEvents: Web3Event[] = [];

    if (fs.existsSync(curatedPath)) {
      try {
        curatedEvents = JSON.parse(fs.readFileSync(curatedPath, 'utf8'));
      } catch (err) {
        console.error('Failed to read curated-events.json:', err);
      }
    }

    if (fs.existsSync(cachePath)) {
      try {
        cachedEvents = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
      } catch (err) {
        console.error('Failed to read events-cache.json:', err);
      }
    }

    // Combine all events
    const rawAll = [...curatedEvents, ...cachedEvents];

    // Clean & normalize
    const seen = new Set<string>();
    const cleaned: Web3Event[] = [];

    for (const e of rawAll) {
      if (!e.name || !e.startDate) continue;

      // Normalization key for deduplication
      const cleanName = e.name.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
      const datePart = e.startDate.slice(0, 10);
      const key = `${cleanName}|${datePart}`;

      if (seen.has(key)) continue;
      seen.add(key);

      const d = new Date(e.startDate);
      const monthStr = !isNaN(d.getTime())
        ? d.toLocaleString('en-US', { month: 'long', year: 'numeric' })
        : e.month || 'Upcoming';

      cleaned.push({
        ...e,
        month: monthStr,
        city: e.city || '',
        country: normalizeCountry(e.country),
        location: e.location || (e.city && e.country ? `${e.city}, ${e.country}` : 'Virtual / TBA'),
        url: e.url || e.website || 'https://hashtagweb3.com/events',
      });
    }

    // Sort chronologically:
    cleaned.sort((a, b) => {
      const timeA = new Date(a.startDate).getTime();
      const timeB = new Date(b.startDate).getTime();
      if (timeA !== timeB) return timeA - timeB;

      const prioA = a.source === 'curated-premier' ? 0 : 1;
      const prioB = b.source === 'curated-premier' ? 0 : 1;
      return prioA - prioB;
    });

    // Only return future/ongoing events
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const upcoming = cleaned.filter(e => {
      const endDate = e.endDate ? new Date(e.endDate) : new Date(e.startDate);
      return isNaN(endDate.getTime()) || endDate >= today;
    });

    return upcoming;
  } catch (error) {
    console.error('Error reading events:', error);
    return [];
  }
}

export async function getEventBySlug(slug: string): Promise<Web3Event | null> {
  const events = await getEvents();
  const normalized = slug.toLowerCase().trim();

  // Try exact slug match
  let found = events.find(e => getEventSlug(e) === normalized);
  if (found) return found;

  // Try ID match
  found = events.find(e => e.id.toLowerCase() === normalized || e.id.replace(/^premier-/, '').toLowerCase() === normalized);
  if (found) return found;

  // Fallback: prefix match
  found = events.find(e => getEventSlug(e).startsWith(normalized) || normalized.startsWith(getEventSlug(e)));
  return found || null;
}

export async function getRelatedEvents(currentEvent: Web3Event, limit: number = 3): Promise<Web3Event[]> {
  const allEvents = await getEvents();
  const currentEcosystems = getEventEcosystems(currentEvent);
  const currentType = getEventType(currentEvent);

  return allEvents
    .filter(e => e.id !== currentEvent.id && new Date(e.startDate) >= new Date())
    .map(e => {
      let score = 0;
      if (e.city && currentEvent.city && e.city.toLowerCase() === currentEvent.city.toLowerCase()) score += 4;
      if (e.country && currentEvent.country && e.country.toLowerCase() === currentEvent.country.toLowerCase()) score += 2;
      if (getEventType(e) === currentType) score += 2;
      const otherEcosystems = getEventEcosystems(e);
      const shared = otherEcosystems.filter(tag => currentEcosystems.includes(tag));
      score += shared.length * 3;
      return { event: e, score };
    })
    .sort((a, b) => b.score - a.score || new Date(a.event.startDate).getTime() - new Date(b.event.startDate).getTime())
    .slice(0, limit)
    .map(item => item.event);
}
