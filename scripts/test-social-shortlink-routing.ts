import assert from 'node:assert/strict';
import fs from 'node:fs';
import { test } from 'node:test';
import { format } from 'node:url';
import { parse as parseQuery } from 'node:querystring';
import { NextRequest, NextResponse } from 'next/server';
import { unstable_doesMiddlewareMatch } from 'next/experimental/testing/server';
import loadCustomRoutes from 'next/dist/lib/load-custom-routes';
import { getPathMatch } from 'next/dist/shared/lib/router/utils/path-match';
import { matchHas, prepareDestination } from 'next/dist/shared/lib/router/utils/prepare-destination';
import { constructRequest } from 'next/dist/experimental/testing/server/utils';
import nextConfig from '../next.config.mjs';
import { config, middleware } from '../src/middleware';
import { isExpiredJobPath } from '../src/lib/job-age-path';
import { isRemovedJobPath } from '../src/lib/removed-job-path';
import { isLinkPreviewCrawlerRequest, linkPreviewPreviewPath, PUBLIC_PAGE_ALIASES, SOCIAL_UTM_MAP } from '../src/lib/social-share';
import { GLOSSARY_CATEGORIES } from '../src/types/glossary';
import jobDates from '../content/job-age-paths.json';
import events from '../content/events-runtime.json';
import eventTombstones from '../content/event-tombstones.json';

const origin = 'https://hashtagweb3.com';
const browserHeaders = { 'user-agent': 'Mozilla/5.0', accept: 'text/html', 'sec-fetch-mode': 'navigate', 'sec-fetch-dest': 'document' };
const crawlerAgents = ['Twitterbot/1.0', 'LinkedInBot/1.0', 'facebookexternalhit/1.1', 'Meta-ExternalAgent/1.1', 'node-fetch/1.0'];
const suffixes = Object.entries(SOCIAL_UTM_MAP);
const attributionQuery = '?search=engineer&utm_source=old&utm_medium=old&utm_campaign=kept&utm_content=card&utm_term=web3&tag=a&tag=b';

// Next applies redirects before middleware. Use its runtime matcher here because
// the experimental config tester loses the case-insensitive RegExp flag.
const redirects = loadCustomRoutes({ ...nextConfig, headers: async () => [], rewrites: async () => [] }).then(routes =>
  routes.redirects.map(route => ({ ...route, match: getPathMatch(route.source, { strict: true }) })));

async function configuredRedirect(input: string, headers: Record<string, string>) {
  const parsed = new URL(input);
  const query = parseQuery(parsed.search.slice(1));
  const request = constructRequest({ url: input, headers });
  for (const route of await redirects) {
    const params = route.match(parsed.pathname || '/');
    if (!params) continue;
    const conditions = matchHas(request, query, route.has, route.missing);
    if (!conditions) continue;
    const { parsedDestination } = prepareDestination({
      destination: route.destination, params: { ...params, ...conditions }, query, appendParamsToQuery: false,
    });
    const destination = new URL(format({ ...parsedDestination, search: undefined }), input);
    return NextResponse.redirect(destination, route.statusCode || (route.permanent ? 308 : 307));
  }
  return null;
}

async function routeRequest(path: string, method = 'GET', headers: Record<string, string> = browserHeaders) {
  const requestUrl = new URL(path, origin);
  requestUrl.hash = '';
  const url = requestUrl.href;
  const requestHeaders = { ...headers, host: requestUrl.host };
  const redirect = await configuredRedirect(url, requestHeaders);
  if (redirect) return redirect;
  if (!unstable_doesMiddlewareMatch({ config, nextConfig, url, headers: requestHeaders })) return NextResponse.next();
  return middleware(new NextRequest(url, { method, headers: requestHeaders }));
}

async function follow(path: string, method = 'GET', headers: Record<string, string> = browserHeaders) {
  let url = new URL(path, origin);
  for (let hop = 0; hop < 8; hop++) {
    const response = await routeRequest(url.href, method, headers);
    const location = response.headers.get('location');
    if (!location) return { response, url };
    const target = new URL(location, url);
    assert.equal(target.origin, origin, path);
    if (!target.hash) target.hash = url.hash;
    url = target;
  }
  assert.fail(`Redirect loop: ${path}`);
}

function assertAttribution(url: URL, path: string, attribution: { utm_source: string; utm_medium: string }) {
  assert.equal(url.pathname, path);
  assert.equal(url.searchParams.get('search'), 'engineer');
  assert.equal(url.searchParams.get('utm_source'), attribution.utm_source);
  assert.equal(url.searchParams.get('utm_medium'), attribution.utm_medium);
  assert.equal(url.searchParams.get('utm_campaign'), 'kept');
  assert.equal(url.searchParams.get('utm_content'), 'card');
  assert.equal(url.searchParams.get('utm_term'), 'web3');
  assert.deepEqual(url.searchParams.getAll('tag'), ['a', 'b']);
}

test('all public app pages, nested glossary categories and content types accept all 32 suffixes for GET and HEAD', async t => {
  assert.equal(suffixes.length, 32);
  const liveJob = Object.keys(jobDates).find(slug => !isExpiredJobPath(`/${slug}`) && !isRemovedJobPath(`/${slug}`));
  assert.ok(liveJob);
  const appPages = fs.readdirSync('src/app', { withFileTypes: true })
    .filter(entry => entry.isDirectory() && !entry.name.startsWith('[') && fs.existsSync(`src/app/${entry.name}/page.tsx`))
    .map(entry => `/${entry.name}`);
  const pages = [...new Set([
    '/', ...appPages, ...GLOSSARY_CATEGORIES.map(category => `/glossary/${category.slug}`),
    '/bitcoin', '/offchain-labs', '/shape-of-ethereum', '/lisbon', '/web3-fundamentals', '/ns', `/${liveJob}`, `/${events[0].slug}`,
  ])];
  let checked = 0;
  for (const page of pages) for (const [suffix, attribution] of suffixes) for (const method of ['GET', 'HEAD']) {
    const path = `${page === '/' ? '' : page}/${suffix}${attributionQuery}`;
    const browser = await routeRequest(path, method);
    assert.equal(browser.status, 307, `${method} ${path}`);
    assertAttribution(new URL(browser.headers.get('location')!), page, attribution);
    assert.equal(browser.headers.get('x-middleware-rewrite'), null);
    for (const userAgent of crawlerAgents) {
      const crawler = await routeRequest(path, method, { 'user-agent': userAgent });
      assert.equal(crawler.status, 200, `${userAgent} ${method} ${path}`);
      assert.equal(crawler.headers.get('location'), null);
      assert.equal(crawler.headers.get('x-middleware-rewrite'), `${origin}/preview${page === '/' ? '/index' : page}.html`, path);
      checked++;
    }
    checked++;
  }
  t.diagnostic(`${pages.length} public paths, ${suffixes.length} suffixes, GET/HEAD, browser and five crawler profiles: ${checked} requests`);
});

test('suffix and page casing, trailing slashes, campaign defaults and RSC navigations preserve attribution', async () => {
  for (const [suffix, attribution] of suffixes) for (const method of ['GET', 'HEAD']) {
    for (const [base, canonical] of [
      ['/EVENTS', '/events'], ['/BLOG', '/blog'], ['/COMPANIES', '/companies'], ['/GLOSSARY', '/glossary'],
      ['/GLOSSARY/TECHNICAL', '/glossary/technical'], ['/DOCS', '/developers'],
      ['/LEARN/MARKETING/TWITTER', '/twitter-marketing'], ['/POPUPS/LOGOS', '/logos-society'],
    ]) {
      const input = `${base}/${suffix.toUpperCase()}/${attributionQuery}`;
      const browser = await follow(input, method);
      assertAttribution(browser.url, canonical, attribution);
      const crawler = await follow(input, method, { 'user-agent': 'LinkedInBot/1.0' });
      assert.equal(crawler.response.headers.get('x-middleware-rewrite'), `${origin}/preview${canonical}.html`);
    }
    const rsc = await routeRequest(`/events/${suffix}${attributionQuery}`, method, { rsc: '1' });
    assert.equal(rsc.status, 307);
    assertAttribution(new URL(rsc.headers.get('location')!), '/events', attribution);
    const headless = await routeRequest(`/events/${suffix}${attributionQuery}`, method, {});
    assert.equal(headless.headers.get('x-middleware-rewrite'), `${origin}/preview/events.html`);
    const www = await follow(`https://www.hashtagweb3.com/events/${suffix}${attributionQuery}`, method);
    assertAttribution(www.url, '/events', attribution);
    for (const campaign of ['', '?utm_campaign=']) {
      const response = await routeRequest(`/events/${suffix}${campaign}`, method);
      assert.equal(new URL(response.headers.get('location')!).searchParams.get('utm_campaign'), campaign ? '' : 'share');
    }
  }
});

test('public aliases use their canonical preview without requiring alias HTML shells', async () => {
  const aliases = [
    ...Object.entries(PUBLIC_PAGE_ALIASES).filter(([alias, target]) => !target.includes('.') && !isExpiredJobPath(alias) && !isRemovedJobPath(alias)),
    ['/popups/4seas', '/4seas'],
    ['/blog/shape-of-ethereum', '/shape-of-ethereum'],
    ['/companies/offchain-labs', '/offchain-labs'],
    ['/glossary/bitcoin', '/bitcoin'],
    ['/glossary/defi-composability', '/defi-composability'],
    ['/learn/marketing/twitter', '/twitter-marketing'],
    ['/learn/marketing/discord', '/discord-community'],
    ['/nomads/cities/lisbon', '/lisbon'],
    ['/cost-of-living', '/nomads'],
    ['/citizenship/dominica', '/citizenship'],
  ];
  for (const [alias, canonical] of aliases) for (const [suffix, attribution] of suffixes) {
    const input = `${alias}/${suffix}${attributionQuery}`;
    const browser = await follow(input);
    assert.equal(browser.url.searchParams.get('search'), 'engineer', `${input} -> ${browser.url.href}`);
    assertAttribution(browser.url, canonical, attribution);
    if (alias === '/cost-of-living') assert.equal(browser.url.searchParams.get('category'), 'cost');
    if (alias === '/citizenship/dominica') assert.equal(browser.url.hash, '#dominica');
    for (const userAgent of ['Twitterbot/1.0', 'LinkedInBot/1.0', 'Meta-ExternalAgent/1.1']) {
      const crawler = await follow(input, 'HEAD', { 'user-agent': userAgent });
      assert.equal(crawler.response.headers.get('x-middleware-rewrite'), `${origin}/preview${canonical === '/' ? '/index' : canonical}.html`, input);
    }
  }
});

test('static assets, API paths and feed suffixes stay outside social routing', async () => {
  const resources = [
    '/events/cover.webp', '/events/missing-cover.png', '/events/feed.xml', '/events/feed.xml/tg',
    '/jobs/feed.json/tg', '/jobs/feed.xml/li', '/jobs/private.xml/x',
    '/blog/llms.txt', '/companies/llms.txt', '/data/jobs-runtime.json', '/data/jobs-runtime.json/tg',
    '/preview/events.html', '/og/pages/events.png', '/responsive/sample/image.webp', '/fonts/missing/x',
    '/popups/cover.webp/x', '/popups/%63over.webp/x', '/events/%63over.webp/x',
    '/api/openapi.json', '/api/email/unsubscribe', '/_next/static/chunk.js',
  ];
  for (const path of resources) for (const method of ['GET', 'HEAD']) for (const headers of [browserHeaders, { 'user-agent': 'LinkedInBot/1.0' }]) {
    const response = await routeRequest(path, method, headers);
    assert.equal(response.headers.get('location'), null, path);
    assert.equal(response.headers.get('x-middleware-rewrite'), null, path);
    assert.equal(linkPreviewPreviewPath(path, 'LinkedInBot/1.0', true), null, path);
  }
  for (const path of ['/events', '/events/feed.xml', '/events/cover.webp', '/jobs/feed.json', '/jobs/feed.xml', '/data/events-runtime.json']) {
    assert.equal(unstable_doesMiddlewareMatch({ config, nextConfig, url: origin + path }), false, path);
  }
  for (const path of ['/events/x', '/events/LINKEDIN/', '/glossary/technical/tg', '/jobs/feed.json/tg']) {
    assert.equal(unstable_doesMiddlewareMatch({ config, nextConfig, url: origin + path }), true, path);
  }
  const legacyIndex = await routeRequest('/glossary/llms.txt');
  assert.equal(legacyIndex.headers.get('location'), `${origin}/llms.txt`);
});

test('api-docs shortlinks do not consume the API rate limit', async () => {
  const headers = { ...browserHeaders, 'x-forwarded-for': '192.0.2.250' };
  for (let request = 0; request < 301; request++) {
    const response = await routeRequest('/api-docs/li', 'GET', headers);
    assert.equal(response.status, 307);
    assert.equal(new URL(response.headers.get('location')!).pathname, '/api-docs');
  }
  assert.equal((await routeRequest('/api/openapi.json', 'GET', headers)).status, 200);
});

test('missing pages and retired jobs/events retain machine errors, browser home recovery and unsafe-method errors', async () => {
  const expired = Object.keys(jobDates).find(slug => isExpiredJobPath(`/${slug}`));
  const event = Object.values(eventTombstones).find(entry => Date.parse(entry.until) > Date.now());
  assert.ok(expired && event);
  const missingPages: Array<[string, 404 | 410]> = [
    ['/missing-social-routing-test', 404], ['/popups/missing-social-routing-test', 404],
    ['/marketing4', 410], ['/tools', 410], [`/${expired}`, 410], [`/${event.slugs[0]}`, 410],
  ];
  const machines: Record<string, string>[] = [{ accept: 'application/json' }, { 'user-agent': 'Twitterbot/1.0' }];
  for (const [suffix] of suffixes) for (const [base, status] of missingPages) {
    const path = `${base}/${suffix}?token=private`;
    for (const method of ['GET', 'HEAD']) {
      const browser = await routeRequest(path, method);
      assert.equal(browser.status, 307, path);
      assert.equal(browser.headers.get('location'), `${origin}/`);
      assert.equal(browser.headers.get('cache-control'), 'no-store');
      for (const headers of machines) {
        const machine = await routeRequest(path, method, headers);
        assert.equal(machine.status, status, path);
        assert.equal(machine.headers.get('location'), null);
        assert.equal(machine.headers.get('x-middleware-rewrite'), null);
        if (method === 'HEAD') assert.equal(await machine.text(), '');
      }
    }
    const post = await routeRequest(path, 'POST');
    assert.equal(post.status, status, path);
    assert.equal(post.headers.get('location'), null);
    assert.equal(post.headers.get('x-middleware-rewrite'), null);
  }
  for (const method of ['POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']) for (const path of ['/events/x', '/blog/li', '/companies/tg', '/glossary/technical/x', '/docs/li', '/popups/logos/li']) {
    const response = await routeRequest(path, method);
    assert.equal(response.status, 404, `${method} ${path}`);
    assert.equal(response.headers.get('location'), null);
    assert.equal(response.headers.get('x-middleware-rewrite'), null);
    assert.equal(isLinkPreviewCrawlerRequest({ method, headers: new Headers({ 'user-agent': 'Twitterbot/1.0' }) }), false);
  }
});
