import { getEventSlug, type Web3Event } from './events';

export function buildEventSlugIndex(events: Web3Event[]): Map<string, Web3Event> {
  const index = new Map<string, Web3Event>();
  for (const event of events) {
    const slug = getEventSlug(event);
    if (slug) index.set(slug.toLowerCase().trim(), event);
    if (event.id) {
      const id = event.id.toLowerCase().trim();
      index.set(id, event);
      index.set(id.replace(/^(premier|side)-/, ''), event);
    }
  }
  for (const event of events) {
    for (const alias of event.aliases || []) {
      const key = alias.toLowerCase().trim();
      if (/^[a-z0-9-]+$/.test(key) && !index.has(key)) index.set(key, event);
    }
  }
  return index;
}
