import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { Web3Event } from '../src/lib/events';
import { hasEventEnded } from './lib/event-dates.mjs';
import { assertToken2049CatalogPublication, type Token2049CatalogReview } from './lib/token2049-catalog-assertions';
import { TOKEN2049_MIGRATION_INCIDENTS } from './fixtures/token2049-migration-incidents';

function fixture() {
  const now = Date.now();
  const source: Web3Event = {
    id: 'token2049-fixture',
    slug: 'old-yacht',
    name: 'Yacht fireside',
    startDate: new Date(now - 60_000).toISOString(),
    endDate: new Date(now + 60_000).toISOString(),
    description: 'Organizer-verified event description.',
    location: 'Singapore',
    url: 'https://example.com/yacht',
    coverImage: null,
  };
  const published: Web3Event = { ...source, slug: 'yacht-fireside', aliases: ['old-yacht'] };
  const review: Token2049CatalogReview = {
    migrations: { 'old-yacht': 'yacht-fireside' },
    history: { [source.id]: { slug: 'yacht-fireside', aliases: ['old-yacht'] } },
    identityMerges: {},
  };
  return { imported: [source], catalog: [published], review, now };
}

type Fixture = ReturnType<typeof fixture>;
const check = ({ imported, catalog, review, now }: Fixture) => assertToken2049CatalogPublication(imported, catalog, review, now);

test('accepts an exact declared migration with identity-bound history and the old alias', () => {
  assert.equal(check(fixture()), 1);
});

test('accepts an unchanged source slug without requiring a migration', () => {
  const f = fixture();
  f.catalog = [{ ...f.imported[0] }];
  f.review = { migrations: {}, history: {}, identityMerges: {} };
  assert.equal(check(f), 1);
});

const invalidCases: Array<[string, (f: Fixture) => void, RegExp]> = [
  ['unreviewed rename even with history and an alias', f => { f.review.migrations = {}; }, /Canonical URL changed/],
  ['wrong migration source', f => { f.review.migrations = { unrelated: 'yacht-fireside' }; }, /Canonical URL changed/],
  ['wrong migration destination', f => { f.review.migrations['old-yacht'] = 'another-yacht'; }, /Canonical URL changed/],
  ['declared migration not applied', f => { f.catalog[0].slug = 'old-yacht'; }, /Canonical URL changed/],
  ['missing published old alias', f => { f.catalog[0].aliases = []; }, /Published source alias lost/],
  ['missing historical old alias', f => { f.review.history['token2049-fixture'].aliases = []; }, /Historical source URL lost/],
  ['missing identity-bound history', f => { f.review.history = {}; }, /Missing historical event identity/],
  ['wrong historical canonical target', f => { f.review.history['token2049-fixture'].slug = 'another-yacht'; }, /Historical canonical URL changed/],
  ['history belongs to a different identity', f => {
    f.review.history = { unrelated: f.review.history['token2049-fixture'] };
  }, /Historical event URL reused/],
  ['duplicate historical ownership', f => {
    f.review.history.unrelated = { slug: 'unrelated', aliases: ['old-yacht'] };
  }, /Conflicting historical event identity/],
  ['old URL reused as another canonical', f => {
    f.catalog.push({ ...f.catalog[0], id: 'unrelated', slug: 'old-yacht', aliases: [] });
  }, /Duplicate published event URL|Historical event URL reused/],
  ['old URL reused as another alias', f => {
    f.catalog.push({ ...f.catalog[0], id: 'unrelated', slug: 'unrelated', aliases: ['old-yacht'] });
  }, /Duplicate published event URL|Historical event URL reused/],
  ['case-folded historical URL reuse', f => {
    f.catalog.push({ ...f.catalog[0], id: 'unrelated', slug: 'OLD-YACHT', aliases: [] });
  }, /Duplicate published event URL|Historical event URL reused/],
  ['historical alias shadowed by an unrelated event ID', f => {
    f.catalog.push({ ...f.catalog[0], id: 'old-yacht', slug: 'unrelated', aliases: [] });
  }, /Historical event URL resolves to another identity/],
  ['historical alias shadowed by a shortened event ID', f => {
    f.catalog.push({ ...f.catalog[0], id: 'premier-old-yacht', slug: 'unrelated', aliases: [] });
  }, /Historical event URL resolves to another identity/],
  ['duplicate imported slug', f => {
    f.imported.push({ ...f.imported[0], id: 'another-import' });
  }, /Duplicate imported slug/],
  ['duplicate imported identity', f => {
    f.imported.push({ ...f.imported[0], slug: 'another-import' });
  }, /Duplicate imported event ID/],
  ['duplicate published identity', f => {
    f.catalog.push({ ...f.catalog[0], slug: 'another-published', aliases: [] });
  }, /Duplicate published event ID/],
  ['duplicate published canonical URL', f => {
    f.catalog.push({ ...f.catalog[0], id: 'another-published', aliases: [] });
  }, /Duplicate published event URL/],
  ['missing live event', f => { f.catalog = []; }, /Verified imported events are missing/],
  ['unreviewed identity substitution via source slug alias', f => {
    f.review = { migrations: {}, history: {}, identityMerges: {} };
    f.catalog[0].id = 'unrelated';
  }, /Verified imported events are missing/],
  ['unreviewed identity substitution via source ID alias', f => {
    f.review = { migrations: {}, history: {}, identityMerges: {} };
    f.catalog[0].id = 'unrelated';
    f.catalog[0].aliases = [f.imported[0].id];
  }, /Verified imported events are missing/],
];

for (const [name, change, error] of invalidCases) {
  test(`rejects ${name}`, () => {
    const f = fixture();
    change(f);
    assert.throws(() => check(f), error);
  });
}

function mergedFixture() {
  const f = fixture();
  f.catalog[0].id = 'canonical-yacht';
  f.review.history['canonical-yacht'] = f.review.history['token2049-fixture'];
  f.review.history['token2049-fixture'] = { slug: 'old-yacht', canonicalId: 'canonical-yacht' };
  f.review.identityMerges['token2049-fixture'] = 'canonical-yacht';
  return f;
}

test('preserves the explicitly declared identity-merge exception', () => {
  const f = mergedFixture();
  assert.equal(check(f), 0);
  f.review.migrations = {};
  assert.equal(check(f), 0);
  f.review.identityMerges = {};
  assert.equal(check(f), 0);
});

test('rejects conflicting merge identities', () => {
  const f = mergedFixture();
  f.review.identityMerges['token2049-fixture'] = 'unrelated';
  assert.throws(() => check(f), /Conflicting event identity/);
});

test('rejects a merge without its old URL alias', () => {
  const f = mergedFixture();
  f.catalog[0].aliases = [];
  assert.throws(() => check(f), /Published source alias lost/);
});

test('rejects a missing merged event', () => {
  const f = mergedFixture();
  f.catalog = [];
  assert.throws(() => check(f), /Verified imported events are missing/);
});

test('ended source records may be absent; the same missing event fails while live', () => {
  const f = fixture();
  f.catalog = [];
  const end = Date.parse(f.imported[0].endDate!);
  f.now = end;
  assert.throws(() => check(f), /Verified imported events are missing/);
  f.now = end + 1;
  assert.equal(check(f), 0);
});

test('an ended event URL cannot be recycled for a new event', () => {
  const f = fixture();
  f.now = Date.parse(f.imported[0].endDate!) + 1;
  f.catalog = [{ ...f.catalog[0], id: 'new-yacht', slug: 'old-yacht', aliases: [] }];
  assert.throws(() => check(f), /Historical event URL reused/);
});

test('duplicate archived source slugs still fail', () => {
  const f = fixture();
  f.now = Date.parse(f.imported[0].endDate!) + 1;
  f.catalog = [];
  f.imported.push({ ...f.imported[0], id: 'another-import' });
  assert.throws(() => check(f), /Duplicate imported slug/);
});

for (const incident of TOKEN2049_MIGRATION_INCIDENTS) {
  test(`replays the frozen ${incident.source.slug} incident before and after retention`, () => {
    const source: Web3Event = {
      ...incident.source,
      description: '',
      location: '',
      url: 'https://example.com/token2049-regression',
      coverImage: null,
    };
    const catalog = [{ ...source, slug: incident.history.slug, aliases: [...incident.history.aliases] }];
    const review: Token2049CatalogReview = {
      migrations: { [incident.migration.from]: incident.migration.to },
      history: { [incident.history.id]: { slug: incident.history.slug, aliases: [...incident.history.aliases] } },
      identityMerges: {},
    };
    assert.equal(source.slug, incident.migration.from);
    assert.equal(source.id, incident.history.id);
    const now = Date.parse(source.startDate) - 1;
    assert.equal(hasEventEnded(source, now), false);
    assert.equal(assertToken2049CatalogPublication([source], catalog, review, now), 1);
    assert.throws(() => assert.equal(catalog[0].slug, source.slug), /Expected values to be strictly equal/);
    assert.throws(
      () => assertToken2049CatalogPublication([source], catalog, { ...review, migrations: {} }, now),
      /Canonical URL changed/,
    );

    const afterRetention = Date.parse(source.endDate!) + 31 * 86_400_000;
    const prunedReview = { migrations: {}, history: {}, identityMerges: {} };
    assert.equal(hasEventEnded(source, afterRetention), true);
    assert.equal(assertToken2049CatalogPublication([source], [], prunedReview, afterRetention), 0);
    assert.equal(assertToken2049CatalogPublication([], [], prunedReview, afterRetention), 0);
    assert.throws(
      () => assertToken2049CatalogPublication([source], catalog, prunedReview, now),
      /Canonical URL changed/,
    );
  });
}
