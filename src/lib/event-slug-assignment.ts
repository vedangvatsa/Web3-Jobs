import { getEventBaseSlug, type Web3Event } from './events';

export type EventSlugHistory = Record<string, { slug: string; aliases?: string[] }>;
export const isEventRootSlug = (value: string): boolean => /^[a-z0-9][a-z0-9_-]*$/i.test(value);

/** Published URLs belong to their event identity, regardless of source order or new arrivals. */
export function assignStableEventSlugs(events: Web3Event[], reservedRoots: Set<string>, history: EventSlugHistory): Web3Event[] {
  const owners = new Map<string, string>();
  for (const [id, record] of Object.entries(history)) {
    const slug = record.slug.toLowerCase();
    if (!isEventRootSlug(slug)) throw new Error(`Invalid published event slug: ${slug}`);
    if (owners.has(slug) && owners.get(slug) !== id) throw new Error(`Published event slug has multiple owners: /${slug}`);
    owners.set(slug, id);
  }
  const aliasOwners = new Map<string, string>();
  for (const [id, record] of Object.entries(history)) {
    for (const alias of record.aliases || []) {
      if (isEventRootSlug(alias) && !owners.has(alias) && !aliasOwners.has(alias)) aliasOwners.set(alias, id);
    }
  }
  const allocated = new Map<string, string>();
  for (const event of events) {
    const published = history[event.id]?.slug;
    if (!published) continue;
    if (reservedRoots.has(published)) throw new Error(`Published event /${published} collides with other site content; fix the competing URL instead of renaming ${event.id}`);
    allocated.set(event.id, published);
  }
  for (const event of [...events].filter(event => !allocated.has(event.id)).sort((a, b) => a.id.localeCompare(b.id))) {
    const explicit = event.slug?.toLowerCase().trim();
    const base = explicit && isEventRootSlug(explicit) ? explicit : getEventBaseSlug(event);
    let slug = base, suffix = 2;
    while (reservedRoots.has(slug) || owners.has(slug) || aliasOwners.has(slug)) slug = `${base}${suffix++}`;
    owners.set(slug, event.id);
    allocated.set(event.id, slug);
  }
  return events.map(event => {
    const slug = allocated.get(event.id)!;
    const aliases = [...new Set([...(history[event.id]?.aliases || []), ...(event.aliases || []), event.slug || ''])]
      .map(alias => alias.toLowerCase().trim())
      .filter(alias => isEventRootSlug(alias) && alias !== slug && !reservedRoots.has(alias)
        && (!owners.has(alias) || owners.get(alias) === event.id)
        && (!aliasOwners.has(alias) || aliasOwners.get(alias) === event.id));
    return { ...event, slug, aliases };
  });
}
