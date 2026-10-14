import assert from 'node:assert/strict';
import { test } from 'node:test';
import { NextRequest } from 'next/server';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import slugTypes from '../content/slug-types.json';
import jobDates from '../content/job-age-paths.json';
import tombstones from '../content/event-tombstones.json';
import { middleware } from '../src/middleware';
import { PageRecovery } from '../src/components/page-recovery';
import { isMissingRootPagePath } from '../src/lib/root-page-path';
import { isExpiredJobPath } from '../src/lib/job-age-path';
import { jobAgePageCache } from '../src/lib/job-age-page-cache';
import { isRemovedJobPath } from '../src/lib/removed-job-path';
import { SOCIAL_UTM_MAP } from '../src/lib/social-share';
import { missingMachinePaths, retiredResourcePaths } from './lib/page-recovery-cases';

const origin = 'https://hashtagweb3.com';
const html = { accept: 'text/html', 'sec-fetch-mode': 'navigate', 'sec-fetch-dest': 'document' };
const request = (path: string, method = 'GET', headers: Record<string, string> = html) => middleware(new NextRequest(origin + path, { method, headers }));

test('unknown root HTML GET/HEAD/RSC navigations redirect directly home without carrying input', async () => {
  for (const method of ['GET', 'HEAD']) for (const headers of [html, { accept: 'text/html' }, { rsc: '1' }, { 'sec-fetch-mode': 'navigate' }]) {
    for (const path of ['/missing-recovery-test', '/%6dissing-recovery-test', '/missing-recovery-test/tg', '/constructor', '/__proto__', '/learn/missing/lesson']) {
      const response = await request(`${path}?token=private#fragment`, method, headers);
      assert.equal(response.status, 307, path);
      assert.equal(response.headers.get('location'), origin + '/');
      assert.equal(response.headers.get('cache-control'), 'no-store');
      assert.equal(response.headers.get('x-robots-tag'), 'noindex');
      assert.equal(response.headers.get('x-middleware-rewrite'), null);
    }
  }
});

test('all published root identities, including public files, are recognized without defaulting unknown slugs to jobs', t => {
  for (const slug of Object.values(slugTypes).flat()) {
    assert.equal(isMissingRootPagePath(`/${slug}`), false, slug);
    assert.equal(isMissingRootPagePath(`/${slug}/tg`), false, slug);
  }
  for (const slug of Object.keys(jobDates)) assert.equal(isMissingRootPagePath(`/${slug}`), false, slug);
  assert.equal(isMissingRootPagePath('/missing-recovery-test'), true);
  assert.equal(isMissingRootPagePath('/'), false);
  assert.equal(isMissingRootPagePath('/unmatched/nested'), false, 'Nested routes belong to Next, not the root classifier');
  t.diagnostic(`${slugTypes.pages.length} app/learn/city identities, ${slugTypes.publicFiles.length} public root files and ${slugTypes.aliases.length} root redirect sources, plus all existing content and job identities`);
});

test('known pages, live jobs and all social suffixes preserve queries and cache routing', async () => {
  const liveJob = Object.keys(jobDates).find(slug => !isExpiredJobPath(`/${slug}`) && !isRemovedJobPath(`/${slug}`));
  assert.ok(liveJob);
  for (const path of ['/', '/jobs', '/events', '/companies', '/news', '/citizenship', '/lisbon', '/web3-fundamentals', `/${liveJob}`]) {
    const response = await request(path + '?search=engineer');
    assert.equal(response.status, 200, path);
    assert.equal(response.headers.get('location'), null, path);
    if (jobAgePageCache(path)) assert.ok(response.headers.get('x-middleware-request-x-hw3-job-cache-window'), path);
  }
  for (const [suffix, utm] of Object.entries(SOCIAL_UTM_MAP)) {
    const response = await request(`/jobs/${suffix}?search=engineer&utm_campaign=kept`);
    const target = new URL(response.headers.get('location')!);
    assert.equal(response.status, 307);
    assert.equal(target.pathname, '/jobs');
    assert.equal(target.searchParams.get('search'), 'engineer');
    assert.equal(target.searchParams.get('utm_campaign'), 'kept');
    assert.equal(target.searchParams.get('utm_source'), utm.utm_source);
    assert.equal(target.searchParams.get('utm_medium'), utm.utm_medium);
    const alias = await request(`/docs/${suffix}?q=engineer&utm_campaign=kept`);
    assert.equal(alias.status, 307);
    const aliasTarget = new URL(alias.headers.get('location')!);
    assert.equal(aliasTarget.pathname, '/docs', 'Keep the source alias for the configured canonical redirect');
    assert.equal(aliasTarget.searchParams.get('q'), 'engineer');
    assert.equal(aliasTarget.searchParams.get('utm_campaign'), 'kept');
    assert.equal(aliasTarget.searchParams.get('utm_source'), utm.utm_source);
  }
});

test('jobs and events redirect browsers but preserve retirement and exact job-age boundaries for machines', async () => {
  const snapshot = JSON.stringify(jobDates);
  const originalNow = Date.now;
  const event = Object.values(tombstones).find(entry => Date.parse(entry.until) > Date.now())!;
  const live = Object.entries(jobDates).find(([slug, date]) => date && !isExpiredJobPath(`/${slug}`) && !isRemovedJobPath(`/${slug}`))!;
  assert.ok(event && live);
  try {
    for (const path of ['/marketing4', '/jobs/marketing4', '/marketing4/tg', '/%6darketing4', `/${event.slugs[0]}`, '/job-listing-cache', '/job-listing-cache/999999999999999/jobs']) {
      assert.equal((await request(path)).headers.get('location'), origin + '/', path);
      const machine = await request(path, 'GET', { accept: 'application/json' });
      assert.equal(machine.status, 410, path);
      assert.equal(machine.headers.get('location'), null);
      assert.match(machine.headers.get('vary') || '', /Accept.*Sec-Fetch-Mode.*RSC/, 'Cached machine errors must vary from browser navigation');
      assert.doesNotMatch(await machine.text(), /<meta|<script|JobPosting|Apply/i);
      const post = await request(path, 'POST');
      assert.equal(post.status, 410, path);
      assert.equal(post.headers.get('location'), null);
      assert.doesNotMatch(await post.text(), /<meta|<script/i);
    }
    const boundary = Date.parse(live[1]!) + 30 * 86400000;
    Date.now = () => boundary;
    assert.equal((await request(`/${live[0]}`)).status, 200, 'Exact 30 days stays eligible');
    Date.now = () => boundary + 1;
    assert.equal((await request(`/${live[0]}`)).status, 307);
    assert.equal((await request(`/${live[0]}`, 'GET', { accept: 'application/json' })).status, 410);
    Date.now = () => Date.parse(event.until);
    assert.equal((await request(`/${event.slugs[0]}`)).status, 307);
    assert.equal((await request(`/${event.slugs[0]}`, 'GET', { accept: 'application/json' })).status, 404);
  } finally { Date.now = originalNow; }
  assert.equal(JSON.stringify(jobDates), snapshot, 'Request routing must not rewrite source dates');
});

test('API, JSON, preview, image and unsafe-method requests never receive home HTML or browser redirect markup', async () => {
  for (const path of missingMachinePaths) for (const method of ['GET', 'HEAD', 'POST']) {
    const response = await request(path, method, { accept: 'application/json' });
    assert.equal(response.status, 404, `${method} ${path}`);
    assert.equal(response.headers.get('location'), null);
    assert.doesNotMatch(await response.text(), /<meta|<script|<html/i);
  }
  for (const path of missingMachinePaths.filter(path => path.startsWith('/api/') || path.includes('.json') || path.includes('mode=agent'))) {
    assert.equal((await request(path)).status, 404, path);
  }
  for (const path of retiredResourcePaths) for (const method of ['GET', 'HEAD', 'POST']) {
    const response = await request(path, method);
    assert.equal(response.status, 410, `${method} ${path}`);
    assert.equal(response.headers.get('location'), null);
    assert.doesNotMatch(await response.text(), /<meta|<script|<html/i);
  }
  for (const method of ['POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']) for (const path of ['/missing-recovery-test', '/unmatched/nested', '/events/missing-recovery-test', '/preview/missing-recovery-test.html']) {
    const response = await request(path, method);
    assert.equal(response.status, 404);
    assert.equal(response.headers.get('location'), null);
    assert.doesNotMatch(await response.text(), /<meta|<script/i);
  }
  for (const path of ['/api/openapi.json', '/api/openapi.yaml', '/api/llms.txt', '/api/email/unsubscribe']) {
    assert.equal((await request(path)).status, 200, `${path} must reach its existing handler`);
  }
});

test('unmatched nested-page fallback has an immediate no-JS refresh and no recovery grid', () => {
  assert.equal(renderToStaticMarkup(createElement(PageRecovery)), '<noscript><meta http-equiv="refresh" content="0;url=/"></noscript><script>window.location.replace(\'/\');</script>');
});
