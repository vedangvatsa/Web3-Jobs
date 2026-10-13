import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createServer } from 'node:net';
import { spawn, execFileSync } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { config as middlewareConfig } from '../src/middleware.ts';
import { getJobContentKey } from '../src/lib/job-slugs.ts';
import { getJobDescriptionShardFilename, getJobDescriptionShardIndex } from '../src/lib/job-description-shards.ts';
import { getJobShardFilename, getJobSlugShardIndex } from '../src/lib/job-shards.ts';
import { jobExpiryTime } from '../src/lib/job-age-cache.mjs';

// This fixture compiles only test pages, using the real middleware, cache router and catalog handler.
const project = process.cwd();
const root = fs.mkdtempSync(path.join(project, '.cache/job-age-http-'));
const base = Math.floor(Date.now() / 1000) * 1000;
const jobs = [
  { id: 'near', slug: 'near', title: 'Near expiry role', company: 'Fixture Employer', date: new Date(base - 30 * 86400000 + 600000).toISOString(), source: 'fixture', link: 'https://example.com/jobs/near' },
  { id: 'later', slug: 'later', title: 'Later role', company: 'Later Employer', date: new Date(base - 86400000).toISOString(), source: 'fixture', link: 'https://example.com/jobs/later' },
];
const expiry = jobExpiryTime(jobs[0]);
const write = (file, data) => { const target = path.join(root, file); fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, data); };
const json = (file, data) => write(file, JSON.stringify(data));
const copy = (source, target = source) => write(target, fs.readFileSync(path.join(project, source)));
let child;
let serverLog = '';
try {
  fs.symlinkSync(path.join(project, 'node_modules'), path.join(root, 'node_modules'), 'dir');
  fs.cpSync(path.join(project, 'src/lib'), path.join(root, 'src/lib'), { recursive: true });
  copy('src/types/index.ts');
  copy('src/middleware.ts', 'src/core-middleware.ts');
  copy('scripts/lib/event-retention.mjs');
  copy('scripts/lib/event-dates.mjs');
  copy('next.config.mjs', 'base-next.config.mjs');
  write('next.config.mjs', `import config from './base-next.config.mjs'; export default { ...config, output: undefined, outputFileTracingIncludes: {}, typescript: { ignoreBuildErrors: true }, eslint: { ignoreDuringBuilds: true }, experimental: { cpus: 1 } };`);
  json('package.json', { private: true, type: 'module', dependencies: { next: '15.5.25', react: '^18', 'react-dom': '^18' } });
  json('tsconfig.json', { compilerOptions: { target: 'ES2022', module: 'esnext', moduleResolution: 'bundler', jsx: 'preserve', allowJs: true, resolveJsonModule: true, esModuleInterop: true, skipLibCheck: true, paths: { '@/*': ['./src/*'] } } });
  for (const file of ['removed-job-listings', 'removed-job-paths', 'recovered-job-redirects', 'rejected-ats-boards', 'legacy-slugs-archive', 'event-tombstones', 'image-redirects', 'company-profiles-runtime', 'company-socials']) json(`content/${file}.json`, file === 'removed-job-paths' ? [] : {});
  json('content/learn-routes.json', { courses: {}, lessons: {} });
  json('content/events/redirects.json', {});
  for (const file of ['tool-paths', 'legacy-routes', 'cities']) json(`content/nomads/${file}.json`, file === 'cities' ? [] : {});
  json('content/jobs-runtime.json', jobs);
  json('content/job-age-paths.json', Object.fromEntries(jobs.map(job => [job.slug, job.date])));
  json('content/job-age-page-scopes.json', { '/': 'catalog', '/jobs': 'catalog', '/companies': 'catalog', '/community': [expiry], '/fixture-employer': [expiry], '/later-employer': [jobExpiryTime(jobs[1])] });
  json('content/sitemap-routes.json', [...jobs.map(job => ({ url: `https://hashtagweb3.com/${job.slug}` })), { url: 'https://hashtagweb3.com/lesson' }]);
  json('public/data/catalog-freshness.json', { version: 1, builtAt: new Date(base).toISOString(), snapshotId: 'fixture', catalogs: { jobs: { path: '/data/jobs-runtime.json' }, companies: { path: '/data/companies-runtime.json' } } });
  json('public/data/jobs-runtime.json', jobs); // Proves beforeFiles rewrites do not leak the stale public snapshot.
  for (const job of jobs) {
    const name = getJobDescriptionShardFilename(getJobDescriptionShardIndex(job));
    const file = `content/job-description-shards/${name}`;
    const shard = fs.existsSync(path.join(root, file)) ? JSON.parse(fs.readFileSync(path.join(root, file), 'utf8')) : { version: 1, descriptions: {}, aliases: {} };
    shard.descriptions[getJobContentKey(job)] = `<p>${job.title}. ${'This test fixture describes engineering responsibilities and required experience. '.repeat(20)}</p>`;
    shard.aliases[job.slug] = getJobContentKey(job);
    json(file, shard);
    write(`public/preview/${job.slug}.html`, `<title>${job.title}</title>`);
    write(`public/og/jobs/${job.slug}.png`, 'fixture-image');
  }
  write('src/middleware.ts', `import { middleware as core } from './core-middleware'; export async function middleware(request) { Date.now = () => Number(request.headers.get('x-fixture-clock') || ${base}); return core(request); } export const config = ${JSON.stringify(middlewareConfig)};`);
  copy('src/app/job-catalog/[...parts]/route.ts', 'src/app/job-catalog/[...parts]/core-route.ts');
  write('src/app/job-catalog/[...parts]/route.ts', `import { GET as core } from './core-route'; export const dynamic = 'force-dynamic'; export async function GET(request, context) { Date.now = () => Number(request.headers.get('x-fixture-clock') || ${base}); return core(request, context); }`);
  for (const format of ['json', 'xml']) {
    copy(`src/app/jobs/feed.${format}/route.ts`, `src/app/jobs/feed.${format}/core-route.ts`);
    write(`src/app/jobs/feed.${format}/route.ts`, `import { GET as core } from './core-route'; export const dynamic = 'force-dynamic'; export async function GET(request) { Date.now = () => Number(request.headers.get('x-fixture-clock') || ${base}); return core(); }`);
  }
  write('src/app/layout.tsx', `export default function Layout({children}) { return <html><body>{children}</body></html>; }`);
  const listing = `import { getJobs } from '@/lib/jobs'; export const dynamic = 'force-static'; export const revalidate = 3600; export const metadata = { title: 'Fixture listing' }; export default async function Page() { const jobs = await getJobs(); return <main>{jobs.map(job => <p key={job.id}>{job.title}</p>)}</main>; }`;
  for (const page of ['', 'jobs/', 'companies/', 'community/']) write(`src/app/${page}page.tsx`, listing);
  write('src/app/[slug]/page.tsx', `import { getJobs } from '@/lib/jobs'; import { notFound } from 'next/navigation'; export const dynamic = 'force-static'; export const revalidate = 3600; export const dynamicParams = true; export function generateStaticParams() { return [{slug:'lesson'}, {slug:'article'}]; } export async function generateMetadata() { return {title:'Fixture detail'}; } export default async function Detail({params}) { const {slug} = await params; if (slug === 'lesson' || slug === 'article') return <h1>Unrelated static content</h1>; const jobs = await getJobs(); if (slug.endsWith('-employer')) return <main>{jobs.filter(job => job.company.toLowerCase().replace(' ', '-') === slug).map(job => <p key={job.id}>{job.title}</p>)}</main>; const job = jobs.find(job => job.slug === slug); if (!job) notFound(); return <main><h1>{job.title}</h1><script type="application/ld+json">{JSON.stringify({'@type':'JobPosting', title:job.title})}</script></main>; }`);
  copy('src/app/job-listing-cache/[epoch]/[[...path]]/page.tsx');
  assert.match(fs.readFileSync('src/app/[slug]/page.tsx', 'utf8'), /dynamic = 'force-static'/, 'Real root details must retain ISR');

  const nextBin = path.join(project, 'node_modules/next/dist/bin/next');
  console.log('Building isolated cache fixture (not the project production build)...');
  try { execFileSync(process.execPath, [nextBin, 'build'], { cwd: root, env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' }, timeout: 120000, stdio: 'pipe' }); }
  catch (error) { console.error(error.stdout?.toString(), error.stderr?.toString()); throw error; }
  const socket = createServer();
  await new Promise(resolve => socket.listen(0, '127.0.0.1', resolve));
  const port = socket.address().port;
  await new Promise(resolve => socket.close(resolve));
  child = spawn(process.execPath, [nextBin, 'start', '-p', String(port), '-H', '127.0.0.1'], { cwd: root, env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' }, stdio: ['ignore', 'pipe', 'pipe'] });
  child.stdout.on('data', data => { serverLog += data; });
  child.stderr.on('data', data => { serverLog += data; });
  const origin = `http://127.0.0.1:${port}`;
  for (let i = 0; i < 100 && !serverLog.includes('Ready'); i++) { if (child.exitCode !== null) throw new Error(serverLog); await delay(100); }
  assert.match(serverLog, /Ready/);
  const browser = { 'user-agent': 'Mozilla/5.0', 'sec-fetch-mode': 'navigate', 'sec-fetch-dest': 'document' };
  const request = async (url, now = base, headers = browser) => {
    const response = await fetch(origin + url, { headers: { ...headers, 'x-fixture-clock': String(now) } });
    return { status: response.status, headers: response.headers, body: await response.text() };
  };
  const ttl = result => Number(result.headers.get('cache-control')?.match(/s-maxage=(\d+)/)?.[1] || 0);
  const assertBounded = (result, deadline, label) => {
    assert.match(result.headers.get('cache-control') || '', /^public, max-age=0, s-maxage=\d+, must-revalidate$/, label);
    assert.ok(ttl(result) <= 3600 && ttl(result) > 0, label);
    assert.ok(Date.parse(result.headers.get('date')) + ttl(result) * 1000 < deadline, label);
    assert.doesNotMatch(result.headers.get('cache-control'), /stale/);
    console.log(`${label}: ${result.headers.get('cache-control')}; Date=${result.headers.get('date')}`);
  };
  const catalogPaths = ['/data/jobs-runtime.json', '/data/%6aobs-runtime.json', '/data/companies-runtime.json', '/data/catalog-freshness.json', '/sitemap.xml', '/sitemap.json', '/.well-known/sitemap.json', '/jobs/feed.json', '/jobs/feed.xml', `/job-shards/${getJobShardFilename(getJobSlugShardIndex('near'))}`, `/job-description-shards/${getJobDescriptionShardFilename(getJobDescriptionShardIndex(jobs[0]))}`];
  const shared = new Map();
  let originCalls = 0;
  const throughSharedCache = async (url, now) => {
    const cached = shared.get(url);
    if (cached && now < cached.until) return cached.result;
    const result = await request(url, now);
    originCalls++;
    shared.delete(url);
    if (ttl(result) > 0) shared.set(url, { result, until: Date.parse(result.headers.get('date')) + ttl(result) * 1000 });
    return result;
  };
  for (const url of catalogPaths) {
    const result = await throughSharedCache(url, base);
    assertBounded(result, expiry, url);
    if (/feed\.|job-shards|job-description-shards/.test(url)) assert.match(result.body, /Near expiry role/, `${url}: fixture must initially contain the expiring job`);
  }
  const initialCalls = originCalls;
  for (const url of catalogPaths) await throughSharedCache(url, base + 300000);
  assert.equal(originCalls, initialCalls, 'Fresh shared-cache reads should require no origin render');
  for (const url of ['/', '/jobs', '/fixture-employer', '/near', '/lesson', '/article']) {
    await request(url);
    const result = await request(url);
    assert.equal(result.headers.get('x-nextjs-cache'), 'HIT', `${url}: warm ISR cache`);
    if (url !== '/lesson' && url !== '/article') assertBounded(result, expiry, `${url} ISR HIT`);
  }
  const spoofed = await request('/', base, { ...browser, 'x-hw3-job-cache-window': '999999' });
  assert.equal(spoofed.status, 200, 'Middleware must replace a caller-supplied window');
  assert.match(spoofed.body, /Near expiry role/);
  await request('/later-employer');
  assert.equal((await request('/later-employer')).headers.get('x-nextjs-cache'), 'HIT');
  for (const url of ['/preview/near.html', '/og/jobs/near.png']) assertBounded(await request(url), expiry, url);
  const boundary = await request('/data/jobs-runtime.json', expiry - 1);
  assert.equal(boundary.headers.get('cache-control'), 'no-store');
  assert.ok(JSON.parse(boundary.body).some(job => job.id === 'near'), 'Exact 30 days is still eligible');
  for (const url of catalogPaths) {
    const result = await throughSharedCache(url, expiry);
    assert.equal(result.status, 200);
    assert.ok(!result.body.includes('Near expiry role'), `${url}: expired content escaped`);
    if (url.endsWith('sitemap.xml')) assert.ok(!result.body.includes('/near</loc>'));
    if (url.includes('jobs-runtime')) assert.ok(!JSON.parse(result.body).some(job => job.id === 'near'));
    assert.equal(ttl(result), 3600, `${url}: cache lifetime should recover after removing the expiring record`);
  }
  for (const url of ['/', '/jobs', '/fixture-employer', '/%66ixture-employer']) {
    const result = await request(url, expiry);
    assert.equal(result.status, 200);
    assert.ok(!result.body.includes('Near expiry role'), `${url}: expired ISR HTML`);
    const warm = await request(url, expiry);
    assert.equal(warm.headers.get('x-nextjs-cache'), 'HIT', `${url}: next expiry window should cache`);
    console.log(`${url}: next window excludes expired job and returns ISR HIT`);
  }
  const staleHeader = await request('/jobs', expiry, { ...browser, 'x-hw3-job-cache-window': '0' });
  assert.equal(staleHeader.status, 200);
  assert.doesNotMatch(staleHeader.body, /Near expiry role/);
  const unrelatedHeader = await request('/article', expiry, { ...browser, 'x-hw3-job-cache-window': '999999' });
  assert.equal(unrelatedHeader.headers.get('x-nextjs-cache'), 'HIT', 'Window headers cannot reroute unrelated pages');
  for (const url of ['/near', '/%6eear', '/near/li', '/preview/near.html', '/og/jobs/near.png', '/job-listing-cache/0', '/%6aob-listing-cache/0']) {
    for (const headers of [browser, { 'user-agent': 'LinkedInBot' }]) {
      const result = await request(url, expiry, headers);
      assert.equal(result.status, 410, url);
      assert.doesNotMatch(result.body, /Near expiry role|JobPosting|Apply/);
    }
  }
  for (const url of ['/lesson', '/article', '/later-employer']) assert.equal((await request(url, expiry)).headers.get('x-nextjs-cache'), 'HIT', `${url}: unrelated ISR was lost`);
  console.log('PASS: bounded shared caching, zero stale allowance, exact-boundary filtering, warm ISR rollover, old snapshot/detail/bot 410s, unrelated article/course ISR HIT.');
} catch (error) {
  console.error(serverLog);
  throw error;
} finally {
  if (child && child.exitCode === null) { child.kill('SIGTERM'); await new Promise(resolve => child.once('exit', resolve)); }
  fs.rmSync(root, { recursive: true, force: true });
}
