import { getEventBaseSlug, type Web3Event } from './events';
import migrations from '../../content/events/slug-migrations.json';
import identityMerges from '../../content/events/identity-merges.json';

export type EventSlugHistory = Record<string, { slug: string; aliases?: string[]; canonicalId?: string }>;
export const isEventRootSlug = (value: string): boolean => /^[a-z0-9][a-z0-9_-]*$/i.test(value);

/** Published URLs belong to their event identity, regardless of source order or new arrivals. */
export function assignStableEventSlugs(events: Web3Event[], reservedRoots: Set<string>, history: EventSlugHistory): Web3Event[] {
  history = Object.fromEntries(Object.entries(history).map(([id, record]) => {
    const canonicalId = (identityMerges as Record<string, string>)[id];
    if (canonicalId) return [id, { ...record, canonicalId }];
    const slug = (migrations as Record<string, string>)[record.slug];
    return [id, slug ? { ...record, slug, aliases: [...new Set([record.slug, ...(record.aliases || [])])].filter(alias => alias !== slug) } : record];
  }));
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
    const readable = getEventBaseSlug(event);
    const opaqueCode = explicit && /^[a-z0-9]{8}$/.test(explicit) && !readable.split('-').includes(explicit);
    const base = explicit && !opaqueCode && isEventRootSlug(explicit) && readable.split('-').some(word => word.length > 2 && explicit.includes(word)) ? explicit : readable;
    const city = event.city ? getEventBaseSlug({ name: event.city }) : '';
    const alternatives = [city && !base.includes(city) ? `${base}-${city}` : '', `${base}-${event.startDate.slice(0, 4)}`, `${base}-${event.startDate.slice(0, 10)}`].filter(Boolean);
    let slug = base, suffix = 2;
    while (reservedRoots.has(slug) || owners.has(slug) || aliasOwners.has(slug)) slug = alternatives.shift() || `${base}-${suffix++}`;
    owners.set(slug, event.id);
    allocated.set(event.id, slug);
  }
  return events.map(event => {
    const slug = allocated.get(event.id)!;
    const mergedOwner = (owner?: string) => Boolean(owner && history[owner]?.canonicalId === event.id && !allocated.has(owner));
    const mergedAliases = Object.values(history).filter(record => record.canonicalId === event.id).flatMap(record => [record.slug, ...(record.aliases || [])]);
    const aliases = [...new Set([...(history[event.id]?.aliases || []), ...mergedAliases, ...(event.aliases || []), event.slug || ''])]
      .map(alias => alias.toLowerCase().trim())
      .filter(alias => isEventRootSlug(alias) && alias !== slug && !reservedRoots.has(alias)
        && (!owners.has(alias) || owners.get(alias) === event.id || mergedOwner(owners.get(alias)))
        && (!aliasOwners.has(alias) || aliasOwners.get(alias) === event.id || mergedOwner(aliasOwners.get(alias))));
    return { ...event, slug, aliases };
  });
}
