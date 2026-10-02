import assert from 'node:assert/strict';
import { gzipSync } from 'node:zlib';
import { getAllTerms, getTerm } from '../src/lib/glossary';
import { getGlossaryListItem } from '../src/lib/glossary-listing';
import { unstable_doesMiddlewareMatch } from 'next/experimental/testing/server';
import { config } from '../src/middleware';

async function main() {
  const terms = await getAllTerms();
  const before = JSON.stringify(terms);
  const listing = terms.map(getGlossaryListItem);
  const matches = (term: typeof listing[number], query: string) => [term.term, term.description, term.category, ...(term.synonyms || [])].some(value => value.toLowerCase().includes(query.toLowerCase().trim()));
  for (const term of terms) {
    for (const query of [term.term, term.category, ...term.description.split(/\s+/).filter(word => word.length > 5).slice(0, 3), ...(term.synonyms || [])]) {
      assert.deepEqual(listing.filter(term => matches(term, query)).map(term => term.slug), terms.filter(term => matches(term, query)).map(term => term.slug), `Search changed: ${query}`);
    }
    for (const letter of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') {
      assert.deepEqual(listing.filter(item => item.term.toUpperCase().startsWith(letter)).map(item => item.slug), terms.filter(item => item.term.toUpperCase().startsWith(letter)).map(item => item.slug));
    }
    const publicTerm = listing.find(item => item.slug === term.slug)!;
    assert.equal(publicTerm.description, term.description);
    assert.equal(publicTerm.difficulty, term.difficulty);
    assert.deepEqual(publicTerm.synonyms, term.synonyms);
    assert.equal('content' in publicTerm, false);
    assert.equal((await getTerm(term.slug))?.content, term.content);
  }
  assert.equal(JSON.stringify(terms), before, 'Full glossary data must remain intact');
  const originalBytes = gzipSync(before).length;
  const listingBytes = gzipSync(JSON.stringify(listing)).length;
  assert.ok(listingBytes < originalBytes * 0.1, 'Glossary payload must be at least 90% smaller');
  for (const pathname of ['/jobs/feed.xml', '/jobs/feed.json', '/jobs/adzuna.xml', '/jobs/jora.xml', '/jobs/feed-aggregator-us.xml', '/adzuna.xml', '/jooble.xml', '/myjobhelper.xml', '/events/feed.xml', '/sitemap.xml']) {
    assert.equal(unstable_doesMiddlewareMatch({ config, nextConfig: {}, url: `${pathname}?source=test` }), false, pathname);
  }
  for (const pathname of ['/glossary', '/glossary/tg', '/glossary?mode=agent', '/jobs/feed.json/tg', '/api/email/unsubscribe', '/api/example.json', '/api/openapi.json', '/jobs/private.xml', '/jobs']) {
    assert.equal(unstable_doesMiddlewareMatch({ config, nextConfig: {}, url: pathname }), true, pathname);
  }
  console.log(JSON.stringify({ terms: terms.length, originalGzipBytes: originalBytes, listingGzipBytes: listingBytes, savedPercent: 100 * (1 - listingBytes / originalBytes), fullDescriptionsAndSearchPreserved: true, feedCachePathsAndMiddlewareBoundaries: 'passed' }, null, 2));
}
main().catch(error => { console.error(error); process.exitCode = 1; });
