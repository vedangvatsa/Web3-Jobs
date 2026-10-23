import assert from 'node:assert/strict';
import test from 'node:test';
import Parser from 'rss-parser';
import { buildNewsRss } from '../src/lib/news-rss';
import { buildNewsSitemap } from '../src/lib/news-sitemap';
import { load } from 'cheerio';

const now = new Date('2026-10-23T12:00:00Z');
const article = {
  slug: 'news-test', title: 'A & B <update>', description: 'Quotes " and ]]> & details',
  category: 'News', publishedDate: '2026-10-22T10:00:00Z', image: '/news/test.png',
};

test('RSS parses with escaped text, canonical identity, original date and absolute image', async () => {
  const xml = buildNewsRss([article], now);
  const feed = await new Parser().parseString(xml);
  assert.equal(feed.items.length, 1);
  assert.equal(feed.items[0].title, article.title);
  assert.equal(feed.items[0].content, article.description);
  assert.equal(feed.items[0].link, 'https://hashtagweb3.com/news-test');
  assert.equal(feed.items[0].guid, feed.items[0].link);
  assert.equal(feed.items[0].isoDate, '2026-10-22T10:00:00.000Z');
  assert.match(xml, /url="https:\/\/hashtagweb3.com\/news\/test.png"/);
});

test('RSS excludes non-news, invalid dates and future articles, sorts and caps entries', async () => {
  const articles = Array.from({ length: 105 }, (_, i) => ({
    ...article, slug: `story-${i}`, publishedDate: new Date(now.getTime() - (i + 1) * 60_000).toISOString(),
  })).reverse();
  const xml = buildNewsRss([...articles,
    { ...article, slug: 'guide', category: 'Guide' },
    { ...article, slug: 'invalid', publishedDate: 'invalid' },
    { ...article, slug: 'undated', publishedDate: undefined },
    { ...article, slug: 'future', publishedDate: '2027-01-01' },
  ], now);
  const feed = await new Parser().parseString(xml);
  assert.equal(feed.items.length, 100);
  assert.equal(feed.items[0].link, 'https://hashtagweb3.com/story-0');
  assert.equal(feed.items[99].link, 'https://hashtagweb3.com/story-99');
  assert.equal((await new Parser().parseString(buildNewsRss([], now))).items.length, 0);
});

test('news sitemap preserves original dates and only includes the last 48 hours', () => {
  const xml = buildNewsSitemap([
    article,
    { ...article, slug: 'boundary', publishedDate: '2026-10-21T12:00:00Z' },
    { ...article, slug: 'old', publishedDate: '2026-10-21T11:59:59Z', lastUpdated: now.toISOString() },
    { ...article, slug: 'future', publishedDate: '2026-10-24T12:00:00Z' },
    { ...article, slug: 'guide', category: 'Guide' },
  ], now);
  const $ = load(xml, { xml: true });
  assert.equal($('url').length, 2);
  assert.equal($('news\\:title').first().text(), article.title);
  assert.equal($('news\\:publication_date').first().text(), article.publishedDate);
  assert.equal($('loc').last().text(), 'https://hashtagweb3.com/boundary');
  assert.equal(load(buildNewsSitemap([], now), { xml: true })('url').length, 0);
  assert.throws(() => buildNewsSitemap(Array.from({ length: 1001 }, () => article), now), /1,000/);
});
