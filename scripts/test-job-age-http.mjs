import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createServer } from 'node:net';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { isJobAgeEligible } from '../src/lib/job-age-policy.mjs';
import { verifyCatalogFreshness } from './lib/catalog-freshness.mjs';
import { jobExpiryTime } from '../src/lib/job-age-cache.mjs';

const standalone = path.resolve('.next/standalone');
const builtAt = process.env.DEPLOY_STARTED_AT || JSON.parse(fs.readFileSync(path.join(standalone, 'public/data/catalog-freshness.json'), 'utf8')).builtAt;
let origin = process.env.SITE_ORIGIN;
let server;
let logs = '';
const browserHeaders = { 'user-agent': 'Mozilla/5.0', 'sec-fetch-mode': 'navigate', 'sec-fetch-dest': 'document', 'sec-fetch-site': 'none' };
const request = (pathname, headers = {}, options = {}) => fetch(`${origin}${pathname}`, { headers, signal: AbortSignal.timeout(30000), ...options });
function firebaseMiddlewareCacheOverride(response, unrelatedPage = false) {
  return Boolean(process.env.SITE_ORIGIN && response.headers.get('x-fah-middleware') === 'true'
    && /^nextjs-/.test(response.headers.get('x-fah-adapter') || '')
    && (/^(?:no-store|max-age=0, must-revalidate, private)$/.test(response.headers.get('cache-control') || '')
      || (unrelatedPage && response.headers.get('cache-control') === 'max-age=0, stale-while-revalidate=86400, private')));
}
async function assertWarmPage(pathname) {
  for (let attempt = 0; attempt < 10; attempt++) {
    const warm = await request(pathname, browserHeaders);
    assert.equal(warm.status, 200, pathname);
    await warm.text();
    if (warm.headers.get('x-nextjs-cache') === 'HIT') return;
    await delay(200);
  }
  assert.fail(`${pathname}: production ISR lost`);
}
function bounded(response, deadline = Infinity) {
  const control = response.headers.get('cache-control') || '';
  assert.match(control, /^public, max-age=0, s-maxage=\d+, must-revalidate$|^no-store$/);
  assert.doesNotMatch(control, /stale/);
  const ttl = Number(control.match(/s-maxage=(\d+)/)?.[1] || 0);
  assert.ok(ttl <= 3600);
  if (ttl) assert.ok(Date.parse(response.headers.get('date')) + ttl * 1000 < deadline, 'Cache extends past posting expiry');
  return control;
}
try {
  if (!origin) {
    for (const name of ['jobs-runtime', 'homepage-jobs', 'job-date-history', 'job-date-provenance', 'job-age-paths', 'job-age-page-scopes', 'removed-job-listings', 'removed-job-paths', 'recovered-job-redirects']) {
      const relative = `content/${name}.json`;
      assert.deepEqual(fs.readFileSync(path.join(standalone, relative)), fs.readFileSync(relative), `Standalone missing or stale ${relative}`);
    }
    const socket = createServer();
    await new Promise(resolve => socket.listen(0, '127.0.0.1', resolve));
    const port = socket.address().port;
    await new Promise(resolve => socket.close(resolve));
    origin = `http://localhost:${port}`;
    server = spawn(process.execPath, ['server.js'], { cwd: standalone, env: { ...process.env, HOSTNAME: '127.0.0.1', PORT: String(port) }, stdio: ['ignore', 'pipe', 'pipe'] });
    server.stdout.on('data', data => { logs += data; });
    server.stderr.on('data', data => { logs += data; });
    for (let attempt = 0; attempt < 100 && !logs.includes('Ready'); attempt++) {
      if (server.exitCode !== null) throw new Error(logs);
      await delay(100);
    }
    assert.match(logs, /Ready/);
  }
  const reportPath = 'content/job-application-cleanup-report.json';
  const harmonySlugs = JSON.parse(fs.readFileSync('content/job-age-cleanup-report.json', 'utf8')).removed.filter(record => record.link.startsWith('https://jobs.lever.co/harmony/')).map(record => record.slug);
  assert.equal(harmonySlugs.length, 9);
  const retiredSlugs = [...new Set([...harmonySlugs, ...JSON.parse(fs.readFileSync(reportPath, 'utf8')).removed.map(record => record.slug).filter(Boolean)])];
  const paths = process.env.SITE_ORIGIN
    ? [...retiredSlugs.map(slug => `/${slug}`), '/marketing4/tg', '/marketing4/li', '/jobs/marketing4', '/preview/marketing4.html', '/preview/jobs/marketing4.html', '/og/jobs/marketing4.png']
    : retiredSlugs.flatMap(slug => [`/${slug}`, `/jobs/${slug}`, `/${slug}/tg`, `/${slug}/li`, `/preview/${slug}.html`, `/preview/jobs/${slug}.html`, `/og/jobs/${slug}.png`]);
  for (const path of paths) {
    for (const headers of [browserHeaders, { 'user-agent': 'LinkedInBot' }]) {
      const response = await request(path, headers, { redirect: 'manual' });
      const redirectHome = headers === browserHeaders && !path.startsWith('/preview/') && !path.startsWith('/og/');
      assert.equal(response.status, redirectHome ? 307 : 410, path);
      assert.equal(response.headers.get('location'), redirectHome ? `${origin}/` : null, path);
      if (redirectHome) assert.equal(response.headers.get('cache-control'), 'no-store');
      else if (!firebaseMiddlewareCacheOverride(response)) assert.match(response.headers.get('cache-control'), /s-maxage=300, must-revalidate/);
      assert.doesNotMatch(response.headers.get('cache-control'), /stale/);
      assert.equal(response.headers.get('x-robots-tag'), 'noindex');
      assert.doesNotMatch(await response.text(), /JobPosting|Marketing Lead|Apply now/i);
    }
  }
  const response = await request('/data/jobs-runtime.json');
  assert.equal(response.status, 200);
  assert.match(response.headers.get('cache-control'), /public, max-age=0, s-maxage=\d+, must-revalidate|no-store/);
  const jobs = await response.json();
  assert.ok(jobs.length > 0);
  assert.ok(jobs.every(job => isJobAgeEligible(job)));
  assert.ok(jobs.every(job => !retiredSlugs.includes(job.slug) && job.company !== 'Harmony'));
  const deadline = Math.min(...jobs.map(jobExpiryTime));
  const cache = { jobs: bounded(response, deadline) };
  for (const pathname of ['/', '/jobs', '/companies']) {
    const page = await request(pathname, browserHeaders);
    assert.equal(page.status, 200, pathname);
    cache[pathname] = firebaseMiddlewareCacheOverride(page) ? page.headers.get('cache-control') : bounded(page);
    assert.doesNotMatch(await page.text(), /\/marketing4["/]/);
    await assertWarmPage(pathname);
  }
  const live = await request(`/${jobs[0].slug}`, browserHeaders);
  assert.equal(live.status, 200);
  const html = await live.text();
  assert.match(html, /JobPosting/);
  assert.match(html, /validThrough/);
  await assertWarmPage(`/${jobs[0].slug}`);
  for (const path of ['/data/companies-runtime.json', '/job-shards/job-shard-00.json', '/job-description-shards/job-descriptions-00.json', '/sitemap.xml', '/.well-known/sitemap.json']) {
    const response = await request(path);
    assert.equal(response.status, 200, path);
    assert.match(response.headers.get('cache-control'), /public, max-age=0, s-maxage=\d+, must-revalidate|no-store/, path);
    const body = await response.text();
    assert.doesNotMatch(body, /hashtagweb3\.com\/marketing4(?:<|"|\/)/);
    if (path.includes('job-descriptions')) assert.equal(JSON.parse(body).version, 1);
    if (path.includes('companies-runtime')) {
      const companies = Object.values(JSON.parse(body));
      const jobIds = new Set(jobs.map(job => job.id));
      assert.equal(companies.reduce((total, company) => total + company.jobCount, 0), jobs.length);
      for (const company of companies) {
        assert.equal(company.jobCount, company.jobIds.length);
        assert.ok(company.jobIds.every(id => jobIds.has(id)));
      }
      cache.companies = companies.length;
    }
    if (path.includes('sitemap')) for (const slug of retiredSlugs) assert.doesNotMatch(body, new RegExp(`hashtagweb3\\.com/${slug}(?:<|"|/)`));
  }
  for (const pathname of ['/jobs/feed.json', '/jobs/feed.xml']) {
    const feed = await request(pathname);
    assert.equal(feed.status, 200);
    bounded(feed);
    const body = await feed.text();
    for (const slug of retiredSlugs) assert.doesNotMatch(body, new RegExp(`hashtagweb3\\.com/${slug}(?:<|"|/)`));
  }
  const articles = JSON.parse(fs.readFileSync('content/articles-index.json', 'utf8'));
  for (const pathname of ['/news', `/${articles[0].slug}`, '/web3-fundamentals']) {
    const page = await request(pathname, browserHeaders);
    assert.equal(page.status, 200, pathname);
    if (!firebaseMiddlewareCacheOverride(page, true)) assert.doesNotMatch(page.headers.get('cache-control') || '', /no-store|private/);
    assert.match(await page.text(), /<h1/);
    await assertWarmPage(pathname);
  }
  const manifest = await verifyCatalogFreshness({ origin, since: builtAt });
  console.log(JSON.stringify({ verifiedAt: new Date().toISOString(), origin, retiredSlugs: retiredSlugs.length, harmonySlugs, checkedGoneRequests: paths.length * 2, eligibleJobs: jobs.length, invalidAges: 0, cache, manifestBuiltAt: manifest.builtAt, snapshotId: manifest.snapshotId }, null, 2));
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  if (server && server.exitCode === null) {
    server.kill('SIGTERM');
    await new Promise(resolve => server.once('exit', resolve));
  }
}
