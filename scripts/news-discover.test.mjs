import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { canonicalNewsUrl, coveredByArticle, discoverNews, parseFeed, readNewsArticles, sameNewsStory } from './news-discover.mjs';

const now = Date.parse('2026-10-04T12:00:00Z');
const feed = { name: 'Outlet', url: 'https://outlet.example/rss' };
const item = (title, url, date = '2026-10-04T08:00:00Z') => `<item><title>${title}</title><link>${url}</link><pubDate>${date}</pubDate></item>`;
const rss = items => `<rss><channel>${items.join('')}</channel></rss>`;

test('common archive vocabulary and different events do not suppress a new story', () => {
  const candidate = { title: 'Chainalysis Used AI to Trace the $387M Bitget Hack Back to North Korea', link: 'https://outlet.example/new-tracing', published: '2026-10-03' };
  const articles = [
    { title: 'NEAR Intents Says It Froze $503,000 Linked to Bitget Hack', slug: 'near-bitget', published: '2026-09-29' },
    { title: 'Bitget confirms wallet breach and suspends withdrawals', slug: 'bitget-breach', published: '2026-09-24' },
  ];
  assert.equal(coveredByArticle(candidate, articles), undefined);
  assert.equal(sameNewsStory('Ethereum approves EIP-1000 staking upgrade', 'Ethereum approves EIP-2000 staking upgrade'), false);
  assert.equal(sameNewsStory('Circle applies for national bank charter', 'Circle receives approval for national bank charter'), false);
  assert.equal(sameNewsStory('Ethereum core developers approve proposal to increase staking rewards', 'Ethereum core developers reject proposal to increase staking rewards'), false);
  assert.equal(sameNewsStory('NEAR Intents loses funds in smart contract exploit', 'NEAR Intents recovers funds from smart contract exploit'), false);
});

test('individual story titles and cited source URLs still identify covered reporting', () => {
  const article = { title: 'Circle launches euro stablecoin in France', slug: 'circle-euro', published: '2026-10-04', sourceUrls: ['source.example/report?id=123'] };
  assert.equal(coveredByArticle({ title: 'Circle launches euro stablecoin in France', link: 'https://other.example/story', published: '2026-10-04' }, [article]), article);
  assert.equal(coveredByArticle({ title: 'A differently worded report', link: 'https://source.example/report?id=123&utm_source=rss' }, [article]), article);
  assert.equal(canonicalNewsUrl('https://source.example/report?id=123&utm_source=rss#section'), 'source.example/report?id=123');
  assert.notEqual(canonicalNewsUrl('https://source.example/report?id=123'), canonicalNewsUrl('https://source.example/report?id=456'));
  assert.notEqual(canonicalNewsUrl('https://source.example/report?ref=123'), canonicalNewsUrl('https://source.example/report?ref=456'));
});

test('RSS entities and Atom alternate links keep the real article destination', () => {
  assert.equal(parseFeed(rss([item('Company&#039;s vote', 'https://example.com/a')]))[0].title, "Company's vote");
  const atom = '<feed><entry><title>Protocol upgrade vote</title><link rel="self" href="https://example.com/api/1"/><link rel="alternate" href="https://example.com/story"/><updated>2026-10-04T08:00:00Z</updated></entry></feed>';
  assert.equal(parseFeed(atom)[0].link, 'https://example.com/story');
});

test('discovery retains every fresh candidate, groups outlets and excludes future/invalid dates', async () => {
  const feeds = [feed, { name: 'Second', url: 'https://second.example/rss' }];
  const result = await discoverNews({ articles: [], now, feeds, request: async url => Response.json({}, { status: 503 }) });
  assert.equal(result.feeds.every(feed => !feed.ok), true);
  const data = await discoverNews({ articles: [], now, feeds, request: async url => new Response(rss(url === feed.url ? [
    item('Circle launches euro stablecoin in France', 'https://outlet.example/a'),
    item('Protocol votes on fee distribution plan', 'https://outlet.example/b'),
    item('Future event', 'https://outlet.example/future', '2026-10-05T00:00:00Z'),
    item('Undated event', 'https://outlet.example/undated', 'bad-date'),
  ] : [item('Circle launches euro stablecoin in France', 'https://second.example/a')])) });
  assert.equal(data.candidates.length, 2);
  const circle = data.candidates.find(candidate => candidate.title.startsWith('Circle'));
  assert.equal(circle.sources.length, 2);
  assert.deepEqual(circle.alsoCoveredBy, ['Second']);
});

test('guides and job resources are not part of the news duplicate corpus', t => {
  fs.mkdirSync('.cache', { recursive: true });
  const cwd = fs.mkdtempSync(path.resolve('.cache/news-discovery-test-'));
  t.after(() => fs.rmSync(cwd, { recursive: true, force: true }));
  fs.mkdirSync(path.join(cwd, 'content/articles'), { recursive: true });
  fs.writeFileSync(path.join(cwd, 'content/articles/guide.md'), '---\ntitle: How stablecoin companies raise funding\ncategory: Guides\n---\nGuide');
  fs.writeFileSync(path.join(cwd, 'content/articles/report.md'), '---\ntitle: Circle files application\ncategory: "News"\npublishedDate: "2026-10-04"\n---\n[Source](https://example.com/filing?id=2&utm_source=test)');
  const articles = readNewsArticles(cwd);
  assert.equal(articles.length, 1);
  assert.equal(articles[0].slug, 'report');
  assert.deepEqual(articles[0].sourceUrls, ['example.com/filing?id=2']);
});
