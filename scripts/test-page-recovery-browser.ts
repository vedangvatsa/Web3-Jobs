import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { chromium } from 'playwright';
import puppeteer from 'puppeteer';
import nextConfig from '../next.config.mjs';
import slugTypes from '../content/slug-types.json';
import jobs from '../content/jobs-runtime.json';
import latestArticles from '../content/latest-articles.json';
import { isExpiredJobPath } from '../src/lib/job-age-path';
import { isRemovedJobPath } from '../src/lib/removed-job-path';
import { SOCIAL_UTM_MAP } from '../src/lib/social-share';
import { recoveryPaths, retiredResourcePaths, missingMachinePaths } from './lib/page-recovery-cases';

const origin = (process.env.PAGE_RECOVERY_BASE_URL || 'http://localhost:3185').replace('http://127.0.0.1:', 'http://localhost:');
const output = '.cache/page-recovery';
const humanHeaders = { 'User-Agent': 'Mozilla/5.0', Accept: 'text/html', 'Sec-Fetch-Mode': 'navigate', 'Sec-Fetch-Dest': 'document' };
const request = (href: string, options: RequestInit = {}) => fetch(origin + href, { redirect: 'manual', signal: AbortSignal.timeout(60000), ...options });

async function main() {
  fs.mkdirSync(output, { recursive: true });
  fs.writeFileSync(`${output}/.gitignore`, '*\n');
  const standalone = path.resolve('.next/standalone');
  const server = process.env.PAGE_RECOVERY_BASE_URL ? undefined : spawn(process.execPath, [path.join(standalone, 'server.js')], {
    cwd: standalone, env: { ...process.env, HOSTNAME: '127.0.0.1', PORT: '3185' }, stdio: ['ignore', 'pipe', 'pipe'],
  });
  let logs = '';
  server?.stdout?.on('data', chunk => logs += chunk);
  server?.stderr?.on('data', chunk => logs += chunk);
  let browser;
  let diagnostics: Record<string, unknown> = { status: 'running', origin, stage: 'HTTP contracts' };
  try {
    if (server) {
      assert.deepEqual(JSON.parse(fs.readFileSync(path.join(standalone, 'content/slug-types.json'), 'utf8')), slugTypes, 'Rebuild/package the current route index before browser verification');
      let ready = false;
      for (let attempt = 0; attempt < 100; attempt++) {
        if (server.exitCode !== null) throw new Error(logs);
        try { ready = (await request('/icon.png')).ok; } catch {}
        if (ready) break;
        await delay(250);
      }
      assert.ok(ready, logs);
    }

    const liveJob = jobs.find(job => !isExpiredJobPath(`/${job.slug}`) && !isRemovedJobPath(`/${job.slug}`))?.slug;
    assert.ok(liveJob, 'An active job is needed to prove that recovery does not retire live detail pages');
    const destinations = new Set(['/', ...slugTypes.pages.map(slug => `/${slug}`),
      ...['companies', 'glossary', 'resources', 'popups', 'events'].map(type => `/${slugTypes[type as keyof typeof slugTypes][0]}`), `/${latestArticles[0].slug}`, `/${liveJob}`]);
    for (const href of destinations) {
      const response = await request(href, { headers: humanHeaders });
      assert.equal(response.status, 200, `Live destination ${href}`);
      assert.equal(response.headers.get('location'), null, href);
      await response.arrayBuffer();
    }

    const redirects = await nextConfig.redirects!();
    let aliases = 0;
    for (const redirect of redirects) {
      if ('has' in redirect && redirect.has) continue;
      if (redirect.source.includes('.')) continue;
      const variants = redirect.source.endsWith('/:suffix*') ? ['', '/tg']
        : redirect.source.includes('/:platform(') ? ['/tg'] : [''];
      for (const suffix of variants) {
        const from = redirect.source.replace(/\/:suffix\*$/, suffix).replace(/\/:platform\([^)]*\)$/, suffix);
        if (/[:*()]/.test(from)) continue;
        const to = redirect.destination.replace(/\/:suffix\*/g, suffix).replace(/\/:platform/g, suffix);
        const expected = new URL(to, origin);
        expected.searchParams.set('from', 'saved');
        const response = await request(`${from}?from=saved`, { headers: humanHeaders });
        assert.equal(response.status, redirect.permanent ? 308 : 307, from);
        const actual = new URL(response.headers.get('location')!, origin);
        assert.equal(actual.origin, origin, from);
        assert.equal(actual.pathname, expected.pathname, from);
        assert.equal(actual.hash, expected.hash, from);
        assert.deepEqual([...actual.searchParams].sort(), [...expected.searchParams].sort(), from);
        await response.arrayBuffer();
        aliases++;
      }
    }
    for (const [suffix, utm] of Object.entries(SOCIAL_UTM_MAP)) {
      const response = await request(`/jobs/${suffix}?q=engineer&utm_campaign=saved`, { headers: humanHeaders });
      assert.equal(response.status, 307);
      const target = new URL(response.headers.get('location')!);
      assert.equal(target.pathname, '/jobs');
      assert.equal(target.searchParams.get('q'), 'engineer');
      assert.equal(target.searchParams.get('utm_campaign'), 'saved');
      assert.equal(target.searchParams.get('utm_source'), utm.utm_source);
      assert.equal(target.searchParams.get('utm_medium'), utm.utm_medium);
    }
    for (const href of ['/missing-recovery-test?token=private', '/missing-recovery-test/tg', '/marketing4', '/jobs/marketing4', '/job-listing-cache', '/job-listing-cache/999999999999999/jobs']) {
      for (const method of ['GET', 'HEAD']) {
        const response = await request(href, { method, headers: humanHeaders });
        assert.equal(response.status, 307, `${method} ${href}`);
        assert.equal(response.headers.get('location'), origin + '/');
        assert.equal(response.headers.get('cache-control'), 'no-store');
      }
    }
    for (const href of missingMachinePaths) for (const method of ['GET', 'HEAD', 'POST']) {
      const response = await request(href, { method, headers: { Accept: 'application/json' } });
      assert.equal(response.status, 404, `${method} ${href}`);
      assert.equal(response.headers.get('location'), null);
      assert.doesNotMatch(await response.text(), /<meta|<script|<html/i);
    }
    for (const href of [...retiredResourcePaths, '/marketing4?mode=agent']) for (const method of ['GET', 'HEAD', 'POST']) {
      const response = await request(href, { method, headers: humanHeaders });
      assert.equal(response.status, 410, `${method} ${href}`);
      assert.equal(response.headers.get('location'), null);
      assert.doesNotMatch(await response.text(), /<meta|<script|<html/i);
    }
    for (const [href, status] of [['/missing-recovery-test', 404], ['/unmatched/nested', 404], ['/marketing4', 410]] as const) {
      const response = await request(href, { method: 'POST', headers: humanHeaders });
      assert.equal(response.status, status);
      assert.equal(response.headers.get('location'), null);
      assert.doesNotMatch(await response.text(), /<meta|<script/i);
    }
    const fallback = await request('/unmatched/nested', { headers: humanHeaders });
    assert.equal(fallback.status, 404);
    const fallbackHtml = await fallback.text();
    assert.match(fallbackHtml, /<noscript><meta http-equiv="refresh" content="0;url=\/"><\/noscript>/);
    assert.match(fallbackHtml, /<script>window\.location\.replace\('\/'\);<\/script>/, 'The JS fallback must run before React hydration');
    assert.doesNotMatch(fallbackHtml.replace(/<noscript>[\s\S]*?<\/noscript>/g, ''), /<meta[^>]+http-equiv="refresh"/, 'JS navigation must not race a native meta refresh');
    const freshnessResponse = await request('/data/catalog-freshness.json');
    assert.equal(freshnessResponse.status, 200);
    const freshness = await freshnessResponse.json() as { builtAt: string; snapshotId: string; catalogs: Record<string, { count: number }> };
    const catalogSnapshot = { builtAt: freshness.builtAt, snapshotId: freshness.snapshotId, jobs: freshness.catalogs.jobs.count, companies: freshness.catalogs.companies.count, events: freshness.catalogs.events.count };

    browser = await chromium.launch({ executablePath: process.env.CHROME_BIN || await puppeteer.executablePath(), headless: true });
    const errors: { href: string; url: string; javaScriptEnabled: boolean; source: string; message: string; stack?: string }[] = [];
    const resourceFailures: string[] = [], consoleMessages: string[] = [];
    const successfulScripts = new Set<string>();
    const expectedNavigationErrors = new Set<string>();
    const clientRecoveryPaths = ['/missing-recovery-client-test', '/not/a/client-route', '/marketing4'];
    const clientNavigations: { href: string; to: string; flightResponses: { url: string; status: number }[] }[] = [];
    const navigations: { javaScriptEnabled: boolean; from: string; to: string; responses: { url: string; status: number }[] }[] = [];
    diagnostics = { status: 'running', origin, stage: 'browser navigation', catalogSnapshot, destinations: destinations.size, aliases, socialSuffixes: Object.keys(SOCIAL_UTM_MAP).length, recoveryCasesPerMode: recoveryPaths.length, resourceFailures, browserErrors: errors, consoleMessages, navigations, clientNavigations };
    assert.equal(recoveryPaths.length, 47);
    for (const javaScriptEnabled of [true, false]) {
      const context = await browser.newContext({ javaScriptEnabled, viewport: { width: 1440, height: 1000 } });
      await context.route('**/*', route => route.request().url().startsWith(origin) ? route.continue() : route.fulfill({ status: 204, body: '' }));
      await context.addInitScript(() => localStorage.setItem('hw3_popup_dismissed', 'true'));
      const page = await context.newPage();
      let activeHref = '(initial document)';
      page.on('pageerror', error => errors.push({ href: activeHref, url: page.url(), javaScriptEnabled, source: 'pageerror', message: error.message, stack: error.stack }));
      page.on('console', message => {
        if (message.type() !== 'error') return;
        consoleMessages.push(`${javaScriptEnabled ? 'JS' : 'NoJS'} ${activeHref} -> ${page.url()}: ${message.text()} ${message.location().url}`);
        if (message.text().startsWith('Failed to load resource:') && expectedNavigationErrors.has(message.location().url)) return;
        errors.push({ href: activeHref, url: page.url(), javaScriptEnabled, source: 'console', message: `${message.text()} ${message.location().url}` });
      });
      let documentResponses: { url: string; status: number }[] = [];
      let flightResponses: { url: string; status: number }[] = [];
      page.on('response', response => {
        const req = response.request();
        if (req.isNavigationRequest()) {
          documentResponses.push({ url: response.url(), status: response.status() });
          if (response.status() === 404) expectedNavigationErrors.add(response.url());
        }
        if (req.headers().rsc === '1') {
          flightResponses.push({ url: response.url(), status: response.status() });
          // Next retries failed RSC requests as document navigations, retaining the protocol error.
          if ([404, 410].includes(response.status()) && clientRecoveryPaths.includes(new URL(response.url()).pathname)) expectedNavigationErrors.add(response.url());
        }
        if (response.url().startsWith(origin) && ['script', 'stylesheet', 'font'].includes(req.resourceType())) {
          if (!response.ok()) resourceFailures.push(`${response.status()} ${response.url()}`);
          else if (req.resourceType() === 'script') {
            if (!/javascript/.test(response.headers()['content-type'] || '')) resourceFailures.push(`Non-JS script response: ${response.url()}`);
            successfulScripts.add(response.url());
          }
        }
      });
      page.on('requestfailed', req => {
        if (!javaScriptEnabled && req.resourceType() === 'script') return;
        if (req.url().startsWith(origin) && ['script', 'stylesheet', 'font'].includes(req.resourceType()) && req.failure()?.errorText !== 'net::ERR_ABORTED') {
          resourceFailures.push(`${req.failure()?.errorText} ${req.url()}`);
        }
      });
      for (const href of recoveryPaths) {
        activeHref = href;
        documentResponses = [];
        await page.goto(origin + href, { waitUntil: 'load', timeout: 60000 });
        await page.waitForURL(url => url.origin === origin && url.pathname === '/' && !url.search, { waitUntil: 'load', timeout: 60000 });
        const finalUrl = new URL(page.url());
        assert.equal(finalUrl.origin + finalUrl.pathname + finalUrl.search, origin + '/', `${javaScriptEnabled ? 'JS' : 'NoJS'} ${href}`);
        await page.locator('main').waitFor();
        assert.equal(await page.locator('header [data-header-cta="job"]').count(), 1);
        assert.doesNotMatch(await page.title(), /Page not found/i);
        assert.equal(documentResponses.at(-1)?.status, 200, href);
        if (javaScriptEnabled) {
          await page.waitForFunction(() => Object.keys(document.querySelector('header button') || {}).some(key => key.startsWith('__reactProps$')));
        }
        navigations.push({ javaScriptEnabled, from: href, to: page.url(), responses: [...documentResponses] });
      }
      if (javaScriptEnabled) {
        assert.ok(successfulScripts.size > 0, 'A page with missing JS must never pass as hydrated');
        await page.getByRole('button', { name: 'Toggle resources menu' }).click();
        await page.getByRole('menu').waitFor();
        await page.keyboard.press('Escape');
        await page.getByRole('menu').waitFor({ state: 'hidden' });
        for (const href of clientRecoveryPaths) {
          activeHref = `/about -> client:${href}`;
          await page.goto(origin + '/about', { waitUntil: 'load' });
          await page.waitForFunction(() => typeof (window as typeof window & { next?: { router?: { push?: unknown } } }).next?.router?.push === 'function');
          flightResponses = [];
          await page.evaluate(target => (window as typeof window & { next: { router: { push: (href: string) => void } } }).next.router.push(target), href);
          await page.waitForURL(origin + '/', { waitUntil: 'load' });
          await page.getByRole('heading', { name: 'Web3 Jobs', exact: true }).waitFor();
          await page.locator('header [data-header-cta="job"]').waitFor();
          const flight = flightResponses.find(response => new URL(response.url).pathname === href);
          assert.ok(flight, `${href}: exercise a real client-router RSC request`);
          assert.equal(flight.status, href === '/marketing4' ? 410 : 404, 'RSC errors must retain their protocol status before document recovery');
          clientNavigations.push({ href, to: page.url(), flightResponses: [...flightResponses] });
        }
      }
      await context.close();
    }
    diagnostics.successfulScripts = successfulScripts.size;
    fs.writeFileSync(`${output}/results.json`, JSON.stringify(diagnostics, null, 2) + '\n');
    assert.deepEqual(resourceFailures, [], 'Standalone hydration resources');
    assert.deepEqual(errors, [], 'Browser console/page errors, including React hydration errors');
    const result = { status: 'passed', catalogSnapshot, destinations: destinations.size, aliases, socialSuffixes: Object.keys(SOCIAL_UTM_MAP).length, recoveryCasesPerMode: recoveryPaths.length, successfulScripts: successfulScripts.size, resourceFailures, browserErrors: errors, consoleMessages, navigations, clientNavigations };
    diagnostics = result;
    console.log(JSON.stringify({ ...result, navigations: navigations.length, consoleMessages: consoleMessages.length }, null, 2));
  } catch (error) {
    diagnostics.status = 'failed';
    diagnostics.failure = error instanceof Error ? error.stack : String(error);
    throw error;
  } finally {
    fs.writeFileSync(`${output}/results.json`, JSON.stringify(diagnostics, null, 2) + '\n');
    await browser?.close();
    server?.kill('SIGTERM');
    fs.writeFileSync(`${output}/server.log`, logs);
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
