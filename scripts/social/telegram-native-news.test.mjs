import assert from 'node:assert/strict';
import { test } from 'node:test';
import { collectNativeSummaries, loadPublishedNativeArticles } from './telegram-native-news.mjs';

const article = { category: 'News', slug: 'new-filing', title: 'Bank files custody application', description: 'The regulator published the application on Friday.', publishedDate: '2026-10-04' };
test('native selection reads the deployed catalog instead of the workflow checkout', async () => {
  const rows = await loadPublishedNativeArticles({ now: Date.parse('2026-10-04T12:00:00Z'), request: async (url, options) => {
    assert.equal(url, 'https://hashtagweb3.com/data/articles-index.json');
    assert.equal(options.headers['cache-control'], 'no-cache');
    return Response.json([article, { ...article, slug: 'tomorrow', publishedDate: '2026-10-05' }, { ...article, category: 'Guides' }]);
  } });
  assert.equal(rows.length, 1);
  assert.equal(rows[0].slug, 'new-filing');
  assert.match(rows[0].link, /^https:\/\/hashtagweb3.com\/new-filing\?/);
});
test('a broken native catalog cannot silently turn the digest into RSS-only news', async () => {
  await assert.rejects(loadPublishedNativeArticles({ request: async () => Response.json({}, { status: 503 }) }), /HTTP 503/);
  await assert.rejects(loadPublishedNativeArticles({ request: async () => Response.json({}) }), /Invalid/);
  await assert.rejects(loadPublishedNativeArticles({ request: async () => Response.json([]) }), /no news/);
  await assert.rejects(loadPublishedNativeArticles({ request: async () => Response.json([{ ...article, slug: '../bad' }]) }), /Invalid/);
});
test('rejected first candidates do not prevent later native stories from filling the digest', async () => {
  const calls = [];
  const stories = await collectNativeSummaries([0, 1, 2, 3, 4, 5, 6], async item => { calls.push(item); return item < 3 ? null : { id: item }; });
  assert.deepEqual(stories, [{ id: 3 }, { id: 4 }, { id: 5 }]);
  assert.deepEqual(calls, [0, 1, 2, 3, 4, 5]);
  let attempted = 0;
  await collectNativeSummaries(Array.from({ length: 100 }, (_, id) => id), async () => { attempted++; return null; });
  assert.equal(attempted, 12);
});
