import assert from 'node:assert/strict';
import type { Web3Event } from '../../src/lib/events';
import type { EventSlugHistory } from '../../src/lib/event-slug-assignment';
import { buildEventSlugIndex } from '../../src/lib/event-slug-index';
import { hasEventEnded } from './event-dates.mjs';

export type Token2049CatalogReview = {
  migrations: Record<string, string>;
  history: EventSlugHistory;
  identityMerges: Record<string, string>;
};

export function assertToken2049CatalogPublication(
  imported: Web3Event[],
  catalog: Web3Event[],
  { migrations, history, identityMerges }: Token2049CatalogReview,
  now = Date.now(),
): number {
  const canonicalId = (id: string): string => {
    const historicalId = history[id]?.canonicalId;
    if (historicalId && identityMerges[id]) {
      assert.equal(identityMerges[id], historicalId, `Conflicting event identity: ${id}`);
    }
    return identityMerges[id] || historicalId || id;
  };
  const historicalOwners = new Map<string, string>();
  const key = (slug: string) => slug.toLowerCase().trim();
  for (const [id, record] of Object.entries(history)) {
    const owner = canonicalId(id);
    for (const slug of [record.slug, ...(record.aliases || [])]) {
      const previous = historicalOwners.get(key(slug));
      assert.ok(!previous || previous === owner, `Conflicting historical event identity for /${slug}`);
      historicalOwners.set(key(slug), owner);
    }
  }

  const publishedById = new Map<string, Web3Event>();
  const publishedOwners = new Map<string, string>();
  for (const event of catalog) {
    assert.ok(!publishedById.has(event.id), `Duplicate published event ID: ${event.id}`);
    publishedById.set(event.id, event);
    assert.ok(event.slug, `Missing published slug: ${event.id}`);
    for (const slug of [event.slug, ...(event.aliases || [])]) {
      const previous = publishedOwners.get(key(slug));
      assert.ok(!previous || previous === event.id, `Duplicate published event URL: /${slug}`);
      const historicalOwner = historicalOwners.get(key(slug));
      assert.ok(!historicalOwner || historicalOwner === event.id, `Historical event URL reused by ${event.id}: /${slug}`);
      publishedOwners.set(key(slug), event.id);
    }
  }
  const slugIndex = buildEventSlugIndex(catalog);
  for (const [slug, owner] of historicalOwners) {
    const resolved = slugIndex.get(slug);
    assert.ok(!resolved || resolved.id === owner, `Historical event URL resolves to another identity: /${slug}`);
  }

  const missing: { name: string; id: string; slug?: string }[] = [];
  const ids = new Set<string>();
  const slugs = new Set<string>();
  let published = 0;
  for (const event of imported) {
    assert.ok(!ids.has(event.id), `Duplicate imported event ID: ${event.id}`);
    ids.add(event.id);
    assert.ok(event.slug && !slugs.has(event.slug), `Duplicate imported slug: ${event.slug}`);
    slugs.add(event.slug);
    if (hasEventEnded(event, now)) continue;

    const owner = canonicalId(event.id);
    const direct = publishedById.get(event.id);
    const publishedEvent = direct || publishedById.get(owner);
    if (!publishedEvent) {
      missing.push({ name: event.name, id: event.id, slug: event.slug });
      continue;
    }
    assert.equal(publishedEvent.id, owner, `Conflicting published event identity: ${event.id}`);
    const merged = owner !== event.id;
    const expectedSlug = migrations[event.slug] || (merged ? history[owner]?.slug : event.slug);
    assert.equal(publishedEvent.slug, expectedSlug, `Canonical URL changed for ${event.name}`);
    if (publishedEvent.slug !== event.slug || merged) {
      const sourceHistory = history[event.id];
      assert.ok(sourceHistory, `Missing historical event identity: ${event.id}`);
      assert.ok(
        [sourceHistory.slug, ...(sourceHistory.aliases || [])].includes(event.slug),
        `Historical source URL lost for ${event.id}: /${event.slug}`,
      );
      assert.equal(history[owner]?.slug, publishedEvent.slug, `Historical canonical URL changed for ${event.id}`);
      if (publishedEvent.slug !== event.slug) {
        assert.ok(publishedEvent.aliases?.includes(event.slug), `Published source alias lost for ${event.id}: /${event.slug}`);
      }
    }
    if (direct) published++;
  }
  assert.deepEqual(missing, [], 'Verified imported events are missing from the listing');
  return published;
}
