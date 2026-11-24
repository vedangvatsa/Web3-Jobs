import assert from 'node:assert/strict';
import {
  buildArticleBreadcrumbStructuredData,
  buildArticleStructuredData,
  getArticleSchemaIssues,
} from '../src/lib/article-structured-data';

const siteUrl = 'https://hashtagweb3.com';
const base = {
  slug: 'example-post',
  title: 'Example Web3 Post',
  description: 'A verified summary of the article topic.',
  category: 'News',
  image: 'https://hashtagweb3.com/og-news.png',
  publishedDate: '2026-01-15T12:00:00.000Z',
  lastUpdated: '2026-01-16T08:00:00.000Z',
};

assert.deepEqual(getArticleSchemaIssues(base), []);
const news = buildArticleStructuredData(base, siteUrl);
assert.ok(news);
assert.equal(news['@type'], 'NewsArticle');
assert.equal(news.headline, base.title);
assert.equal(news.dateModified, base.lastUpdated);

const scholarly = buildArticleStructuredData({ ...base, category: 'Web3 Career Guides', slug: 'career-guide' }, siteUrl);
assert.equal(scholarly?.['@type'], 'ScholarlyArticle');

const blog = buildArticleStructuredData({ ...base, category: 'Guides', slug: 'guide' }, siteUrl);
assert.equal(blog?.['@type'], 'Article');

assert.deepEqual(getArticleSchemaIssues({ ...base, description: 'No description provided.' }), ['missing-description']);
assert.deepEqual(getArticleSchemaIssues({ ...base, publishedDate: undefined, lastUpdated: undefined }), ['missing-date-published']);

const crumbs = buildArticleBreadcrumbStructuredData(base, siteUrl);
assert.equal(crumbs.itemListElement?.length, 3);
assert.equal(crumbs.itemListElement?.[1]?.name, 'News');

console.log('Article schema tests passed.');