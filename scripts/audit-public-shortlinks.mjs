import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import http from 'node:http';
import https from 'node:https';
import { setTimeout as delay } from 'node:timers/promises';
import { load } from 'cheerio';
import { tsImport } from 'tsx/esm/api';
import { jobAgeExclusionReason, parseJobPostingDate, MAX_JOB_AGE_DAYS } from '../src/lib/job-age-policy.mjs';
import { eventRetentionEnd, hasEventEnded } from './lib/event-dates.mjs';
import { EVENT_RETENTION_MS } from './lib/event-retention.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const HUMAN = {
  'user-agent': 'Mozilla/5.0 (compatible; PublicShortlinkAudit/1.0)',
  accept: 'text/html',
  'sec-fetch-mode': 'navigate',
  'sec-fetch-dest': 'document',
  'sec-fetch-user': '?1',
  'sec-fetch-site': 'none',
};
const CRAWLER = { 'user-agent': 'Twitterbot/1.0', accept: '*/*' };
const READER = { 'user-agent': 'PublicShortlinkAudit/1.0 (+https://hashtagweb3.com)', accept: '*/*' };
const QUERY = 'search=web3%20engineer&tag=a&tag=b&keep=a%2Bb%26c&utm_source=old&utm_medium=old&utm_campaign=kept&utm_content=card&utm_term=web3';
const HUBS = ['/', '/jobs', '/events', '/blog', '/companies', '/community', '/glossary', '/learn', '/news', '/developers', '/resources', '/popups', '/nomads', '/visas', '/citizenship', '/web3-hiring-report'];
const REDIRECTS = new Set([301, 302, 303, 307, 308]);
const REPORT_LIMIT = 28 * 1024 * 1024;
const iso = value => Number.isFinite(value) ? new Date(value).toISOString() : null;
const hash = value => createHash('sha256').update(value).digest('hex');
const normPath = value => value.replace(/\/+$/, '') || '/';
const suffixPath = (base, suffix) => `${base === '/' ? '' : base}/${suffix}`;
const jsonFile = relative => JSON.parse(fs.readFileSync(path.join(ROOT, relative), 'utf8'));

function options(argv) {
  const o = { origin: 'https://hashtagweb3.com', concurrency: 5, intervalMs: 150, timeoutMs: 30000, phase: 'baseline', matrix: false, cases: false, localRouting: false, paths: [] };
  const values = { '--origin': 'origin', '--canonical-origin': 'canonicalOrigin', '--concurrency': 'concurrency', '--interval-ms': 'intervalMs', '--timeout-ms': 'timeoutMs', '--report-dir': 'reportDir', '--phase': 'phase' };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (values[arg]) {
      if (!argv[i + 1] || argv[i + 1].startsWith('--')) throw new Error(`Missing value for ${arg}`);
      o[values[arg]] = argv[++i];
    } else if (arg === '--path') o.paths.push(argv[++i]);
    else if (arg === '--matrix') o.matrix = true;
    else if (arg === '--cases') o.cases = true;
    else if (arg === '--local-routing') o.localRouting = true;
    else if (arg === '--help') o.help = true;
    else if (arg === '--self-test') o.selfTest = true;
    else throw new Error(`Unknown option: ${arg}`);
  }
  o.origin = new URL(o.origin).origin;
  o.canonicalOrigin = new URL(o.canonicalOrigin || o.origin).origin;
  for (const key of ['concurrency', 'intervalMs', 'timeoutMs']) o[key] = Number(o[key]);
  assert.ok(Number.isInteger(o.concurrency) && o.concurrency >= 1 && o.concurrency <= 6, 'concurrency must be 1–6');
  assert.ok(o.intervalMs >= 100, 'interval-ms must be at least 100 (global request pacing)');
  assert.ok(o.timeoutMs >= 1000 && o.timeoutMs <= 120000, 'timeout-ms must be 1000–120000');
  assert.ok(['baseline', 'postdeploy'].includes(o.phase), 'phase must be baseline or postdeploy');
  assert.ok(o.paths.every(p => p?.startsWith('/') && !p.includes('?') && !p.includes('#')), '--path requires a pathname');
  o.reportDir = path.resolve(ROOT, o.reportDir || `.cache/public-shortlinks-${o.phase}-${new Date().toISOString().replace(/[:.]/g, '-')}`);
  assert.ok(o.reportDir.startsWith(path.join(ROOT, '.cache') + path.sep), 'report-dir must be inside this repository’s .cache');
  return o;
}

function publicExclusion(pathname) {
  if (/^\/(?:api|_next|data|job-catalog|job-listing-cache|job-shards|job-description-shards|articles-data|preview|og|images|logo|fonts|responsive|\.well-known)(?:\/|$)/i.test(pathname)) return 'api-asset-feed-or-internal-cache';
  if (pathname.includes('.') || pathname.includes('[')) return 'non-html-resource-or-route-template';
  return null;
}

function staticPages(directory = path.join(ROOT, 'src/app'), segments = []) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    if (entry.isDirectory()) {
      if (/^[_\.]/.test(entry.name) || entry.name.startsWith('[')) return [];
      const next = entry.name.startsWith('@') || /^\([^.)][^/]*\)$/.test(entry.name) ? segments : [...segments, entry.name];
      return staticPages(path.join(directory, entry.name), next);
    }
    return /^page\.(?:tsx?|jsx?|mdx)$/.test(entry.name) ? [`/${segments.join('/')}`] : [];
  }).filter(p => !publicExclusion(p));
}

function metadata(text) {
  const $ = load(text);
  const values = selector => $(selector).map((_, el) => $(el).attr('content') || $(el).attr('href') || '').get();
  return {
    canonical: values('link[rel="canonical"]'),
    url: values('meta[property="og:url"]'),
    title: values('meta[property="og:title"]'),
    description: values('meta[property="og:description"]'),
    images: [...new Set(values('meta[property="og:image"]'))],
    robots: values('meta[name="robots"]'),
  };
}

function canonicalKey(value) {
  try {
    const url = new URL(value);
    if (!['https:', 'http:'].includes(url.protocol) || url.search || url.hash) return null;
    return url.origin + normPath(url.pathname);
  } catch { return null; }
}

function metaIssues(meta, expected, home) {
  const issues = [];
  for (const key of ['canonical', 'url']) {
    if (!meta[key].length) issues.push(`missing_${key}`);
    else if (meta[key].some(value => canonicalKey(value) !== expected)) issues.push(`wrong_${key}`);
  }
  for (const key of ['title', 'description']) {
    if (!meta[key].some(value => value.trim())) issues.push(`missing_og_${key}`);
    else if (new URL(expected).pathname !== '/' && home?.[key]?.some(value => meta[key].includes(value))) issues.push(`generic_home_${key}`);
  }
  if (meta.robots.some(value => /noindex/i.test(value))) issues.push('noindex_preview');
  if (!meta.images.length) issues.push('missing_og_image');
  for (const image of meta.images) {
    try { if (!['http:', 'https:'].includes(new URL(image).protocol)) issues.push('invalid_og_image_url'); }
    catch { issues.push('invalid_og_image_url'); }
  }
  return [...new Set(issues)];
}

function queryIssues(url, original, attribution, extra = '') {
  const issues = [];
  const expected = new URLSearchParams(original);
  expected.set('utm_source', attribution.utm_source);
  expected.set('utm_medium', attribution.utm_medium);
  if (!expected.has('utm_campaign')) expected.set('utm_campaign', 'share');
  const additional = new URL(extra || '/', url.origin);
  for (const [key, value] of additional.searchParams) if (!expected.has(key)) expected.append(key, value);
  for (const key of new Set(expected.keys())) {
    if (JSON.stringify(url.searchParams.getAll(key)) !== JSON.stringify(expected.getAll(key))) issues.push(`query_${key}`);
  }
  if (additional.hash && url.hash !== additional.hash) issues.push('alias_fragment');
  return issues;
}

function lifetime(kind, item, now) {
  if (kind === 'job') {
    const date = parseJobPostingDate(item.date);
    return { kind, date: item.date, dateVerified: item.dateVerified, active: item.active, eligibleAtCapture: !jobAgeExclusionReason(item, now), exclusionAtCapture: jobAgeExclusionReason(item, now), retireAt: iso(date + MAX_JOB_AGE_DAYS * 86400000 + 1) };
  }
  const end = eventRetentionEnd(item);
  const retireAt = end === null ? null : end + EVENT_RETENTION_MS;
  return { kind, startDate: item.startDate, endDate: item.endDate, timezone: item.timezone || 'UTC', eventStatus: item.eventStatus, endedAtCapture: hasEventEnded(item, now), eligibleAtCapture: retireAt === null || now < retireAt, retireAt: iso(retireAt), eventEndAt: iso(end) };
}

function retiredAt(life, time) {
  return Boolean(life?.retireAt && time >= Date.parse(life.retireAt));
}

function expectedRetirement(response, life, origin) {
  if (!retiredAt(life, Date.parse(response.at))) return false;
  if ([404, 410].includes(response.status)) return true;
  if (![307, 308].includes(response.status) || !response.location) return false;
  const target = new URL(response.location, origin);
  return target.origin === origin && target.pathname === '/' && !target.search;
}

async function pool(items, concurrency, work) {
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (next < items.length) await work(items[next++]);
  }));
}

function rawHttp(url, options) {
  return new Promise((resolve, reject) => {
    const client = new URL(url).protocol === 'https:' ? https : http;
    const request = client.request(url, options, response => {
      const headers = new Headers();
      for (const [key, value] of Object.entries(response.headers)) {
        if (value !== undefined) headers.set(key, Array.isArray(value) ? value.join(', ') : value);
      }
      resolve({ status: response.statusCode, headers, body: response });
    });
    request.once('error', reject);
    request.end();
  });
}

function transport(o, stats) {
  let queue = Promise.resolve();
  let nextAt = 0;
  let blockedUntil = 0;
  let active = 0;
  const waiters = [];
  const acquire = async () => {
    if (active >= o.concurrency) await new Promise(resolve => waiters.push(resolve));
    else active++;
    stats.peakConcurrent = Math.max(stats.peakConcurrent, active);
  };
  const release = () => { if (waiters.length) waiters.shift()(); else active--; };
  const pace = () => {
    const turn = queue.then(async () => {
      await delay(Math.max(0, nextAt - Date.now(), blockedUntil - Date.now()));
      nextAt = Date.now() + o.intervalMs;
    });
    queue = turn.catch(() => {});
    return turn;
  };
  return async (url, { method = 'GET', headers = READER, body = true, maxBytes = 8 * 1024 * 1024 } = {}) => {
    await acquire();
    try {
      await pace();
      const at = new Date().toISOString();
      stats.requests++;
      stats.methods[method] = (stats.methods[method] || 0) + 1;
      const started = Date.now();
      try {
        const response = await rawHttp(url, { method, headers, signal: AbortSignal.timeout(o.timeoutMs) });
        const result = { at, status: response.status, location: response.headers.get('location'), type: response.headers.get('content-type'), date: response.headers.get('date'), age: response.headers.get('age'), etag: response.headers.get('etag'), cache: response.headers.get('cache-control'), bytes: 0 };
        stats.statuses[result.status] = (stats.statuses[result.status] || 0) + 1;
        if (response.status === 429 || (response.status === 503 && response.headers.has('retry-after'))) {
          const raw = response.headers.get('retry-after');
          const ms = /^\d+$/.test(raw || '') ? Number(raw) * 1000 : Date.parse(raw) - Date.now();
          blockedUntil = Math.max(blockedUntil, Date.now() + (Number.isFinite(ms) ? Math.max(ms, 60000) : 60000));
          stats.backoffs++;
        }
        if (body && method !== 'HEAD' && !REDIRECTS.has(response.status)) {
          const chunks = [];
          for await (const chunk of response.body || []) {
            result.bytes += chunk.length;
            if (result.bytes > maxBytes) throw new Error(`response exceeds ${maxBytes} bytes`);
            chunks.push(chunk);
          }
          result.text = Buffer.concat(chunks).toString('utf8');
          stats.bodyBytes += result.bytes;
        } else response.body?.destroy();
        result.ms = Date.now() - started;
        return result;
      } catch (error) {
        stats.errors++;
        return { at, status: 0, error: `${error.name}: ${error.message}`, ms: Date.now() - started };
      }
    } finally { release(); }
  };
}

function smallResponse(response) {
  const { text, ...small } = response;
  return small;
}

async function localEvidence(write) {
  const files = ['scripts/test-social-shortlink-routing.ts', 'src/lib/social-share.ts', 'src/middleware.ts', 'next.config.mjs'];
  const hashes = Object.fromEntries(files.map(file => [file, hash(fs.readFileSync(path.join(ROOT, file)))]));
  const args = ['--import', 'tsx', '--test', 'scripts/test-social-shortlink-routing.ts'];
  const at = new Date().toISOString();
  return new Promise(resolve => {
    let output = '';
    const child = spawn(process.execPath, args, { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] });
    for (const stream of [child.stdout, child.stderr]) stream.on('data', data => { output = (output + data).slice(-800000); });
    const timer = setTimeout(() => child.kill('SIGTERM'), 180000);
    child.on('error', error => { output += error.message; });
    child.on('close', (code, signal) => {
      clearTimeout(timer);
      const changedDuringTest = files.filter(file => hash(fs.readFileSync(path.join(ROOT, file))) !== hashes[file]);
      const evidence = { at, command: `node ${args.join(' ')}`, exitCode: code, signal, sourceSha256: hashes, changedDuringTest, output, passed: code === 0 && !changedDuringTest.length };
      write('local-routing.json', evidence);
      resolve(evidence);
    });
  });
}

async function run(o) {
  fs.mkdirSync(o.reportDir, { recursive: true });
  assert.equal(fs.readdirSync(o.reportDir).length, 0, 'Use an empty report directory; existing audit evidence is never overwritten');
  const sizes = new Map();
  const save = (name, data, append = false) => {
    const text = typeof data === 'string' ? data : JSON.stringify(data, null, 2) + '\n';
    const size = (append ? sizes.get(name) || 0 : 0) + Buffer.byteLength(text);
    const total = [...sizes.values()].reduce((a, b) => a + b, 0) - (sizes.get(name) || 0) + size;
    if (total > REPORT_LIMIT) throw new Error('Audit report size budget exceeded (28 MiB)');
    fs[append ? 'appendFileSync' : 'writeFileSync'](path.join(o.reportDir, name), text);
    sizes.set(name, size);
  };
  const append = (name, row) => save(name, JSON.stringify(row) + '\n', true);
  const stats = { requests: 0, methods: {}, statuses: {}, peakConcurrent: 0, bodyBytes: 0, errors: 0, backoffs: 0 };
  const request = transport(o, stats);
  const startedAt = new Date().toISOString();
  const rows = [], inventory = [], images = new Map(), discoveryIssues = [], sources = [];
  const state = { startedAt, helperSha256: hash(fs.readFileSync(fileURLToPath(import.meta.url))), phase: o.phase, origin: o.origin, canonicalOrigin: o.canonicalOrigin, options: o, auditComplete: false, stage: 'discovery', requestProfiles: { browser: HUMAN, crawler: CRAWLER }, network: stats };
  const checkpoint = () => save('progress.json', { ...state, updatedAt: new Date().toISOString(), completedChecks: rows.length, failuresSoFar: rows.filter(row => row.status === 'fail').length, artifactsBytes: [...sizes.values()].reduce((a, b) => a + b, 0) });
  checkpoint();
  const social = await tsImport('../src/lib/social-share.ts', import.meta.url);
  assert.equal(Object.keys(social.SOCIAL_UTM_MAP).length, 32, 'Update the audit matrix if the shared suffix map changes');
  let local;
  const localPromise = o.localRouting ? localEvidence(save).then(result => { local = result; }) : Promise.resolve();
  const sourceJson = async (pathname, required = true) => {
    const response = await request(o.origin + pathname);
    sources.push({ path: pathname, ...smallResponse(response), sha256: response.text ? hash(response.text) : null });
    try {
      assert.equal(response.status, 200);
      return JSON.parse(response.text);
    } catch {
      discoveryIssues.push({ path: pathname, reason: 'catalog_unavailable', required, status: response.status });
      return null;
    }
  };
  const [jobs, events, freshness, companies, articles, glossary] = await Promise.all([
    sourceJson('/data/jobs-runtime.json'), sourceJson('/data/events-runtime.json'), sourceJson('/data/catalog-freshness.json'),
    sourceJson('/data/companies-runtime.json', false), sourceJson('/data/articles-index.json', false), sourceJson('/data/glossary-runtime.json', false),
  ]);
  assert.ok(Array.isArray(jobs) && Array.isArray(events), 'Live jobs/events catalogs are required to determine eligibility');
  const captureAt = Date.now();
  const lives = new Map(), families = new Map();
  const types = jsonFile('content/slug-types.json');
  const familyNames = { events: 'event', companies: 'company', glossary: 'glossary-term', resources: 'pseo-resource', articles: 'article', popups: 'popup', jobs: 'job' };
  for (const [family, slugs] of Object.entries(types)) {
    if (familyNames[family]) for (const slug of slugs) families.set(`/${slug}`, familyNames[family]);
  }
  const learn = jsonFile('content/learn-routes.json');
  for (const slug of Object.values(learn.courses)) families.set(`/${slug}`, 'learn-course');
  for (const slug of Object.values(learn.lessons)) families.set(`/${slug}`, 'learn-lesson');
  for (const [catalog, family] of [[Object.values(companies || {}), 'company'], [articles || [], 'article'], [glossary || [], 'glossary-term'], [jobs, 'job'], [events, 'event']]) {
    for (const item of catalog) {
      if (!item.slug) continue;
      families.set(`/${item.slug}`, family);
      if (['job', 'event'].includes(family)) lives.set(`/${item.slug}`, lifetime(family, item, captureAt));
    }
  }
  const aliases = new Map(Object.entries(social.PUBLIC_PAGE_ALIASES));
  for (const [category, slug] of Object.entries(learn.courses)) aliases.set(`/learn/${category}`, `/${slug}`);
  for (const [lesson, slug] of Object.entries(learn.lessons)) aliases.set(`/learn/${lesson}`, `/${slug}`);
  for (const [from, to] of Object.entries(jsonFile('content/nomads/legacy-routes.json'))) aliases.set(from, to);
  for (const city of jsonFile('content/nomads/cities.json')) {
    families.set(`/${city.slug}`, 'nomad-city');
    aliases.set(`/nomads/cities/${city.slug}`, `/${city.slug}`);
  }
  for (const event of events) for (const alias of event.aliases || []) aliases.set(`/${alias}`, `/${event.slug}`);
  const candidates = new Map();
  const add = (raw, source, lastmod) => {
    let url;
    try { url = new URL(raw, o.origin); } catch { discoveryIssues.push({ path: raw, reason: 'invalid_inventory_url' }); return; }
    if (![o.origin, o.canonicalOrigin].includes(url.origin)) { inventory.push({ path: raw, exclusion: 'off-site', source }); return; }
    const pathname = normPath(url.pathname);
    if (!candidates.has(pathname)) candidates.set(pathname, { path: pathname, sources: [], lastmod });
    const candidate = candidates.get(pathname);
    if (!candidate.sources.includes(source)) candidate.sources.push(source);
  };
  const robots = await request(o.origin + '/robots.txt');
  const sitemapQueue = [o.origin + '/sitemap.xml', ...(robots.text || '').split(/\r?\n/).flatMap(line => line.match(/^Sitemap:\s*(\S+)/i)?.slice(1) || [])];
  const sitemapSeen = new Set();
  while (sitemapQueue.length) {
    const url = new URL(sitemapQueue.shift(), o.origin);
    if (url.origin === o.canonicalOrigin) url.host = new URL(o.origin).host;
    if (url.origin !== o.origin || sitemapSeen.has(url.href)) continue;
    if (/\.(?:json|txt)$/i.test(url.pathname)) {
      sources.push({ path: url.pathname, skipped: 'non-XML sitemap advertisement' });
      continue;
    }
    assert.ok(sitemapSeen.size < 100, 'Sitemap recursion exceeds 100 files');
    sitemapSeen.add(url.href);
    const response = await request(url.href, { maxBytes: 24 * 1024 * 1024 });
    if (REDIRECTS.has(response.status) && response.location) {
      sources.push({ path: url.pathname, ...smallResponse(response) });
      const target = new URL(response.location, url);
      if (target.origin !== o.origin || sitemapSeen.has(target.href)) discoveryIssues.push({ path: url.pathname, reason: 'invalid_sitemap_redirect', required: true });
      else sitemapQueue.push(target.href);
      continue;
    }
    const $ = load(response.text || '', { xmlMode: true });
    const indexed = $('sitemapindex > sitemap > loc').map((_, el) => $(el).text().trim()).get();
    const entries = $('urlset > url').map((_, el) => ({ url: $(el).find('loc').first().text().trim(), lastmod: $(el).find('lastmod').first().text().trim() })).get();
    sources.push({ path: url.pathname, ...smallResponse(response), sha256: response.text ? hash(response.text) : null, entries: entries.length, children: indexed.length });
    if (response.status !== 200 || (!entries.length && !indexed.length)) discoveryIssues.push({ path: url.pathname, reason: 'sitemap_unavailable_or_empty', required: true, status: response.status });
    for (const entry of entries) add(entry.url, 'live-sitemap', entry.lastmod);
    sitemapQueue.push(...indexed);
  }
  const appPaths = staticPages();
  for (const p of appPaths) add(p, 'static-next-page');
  for (const p of HUBS) add(p, 'known-social-hub');
  const eligibilitySnapshot = { at: iso(captureAt), freshness, policies: { jobAgeDays: MAX_JOB_AGE_DAYS, jobBoundary: 'posting time + 30 days + 1 ms', eventBoundary: 'unambiguous end + 30 days; event end alone does not retire its public page', clock: 'local UTC dispatch time; HTTP Date and Age retained for comparison' }, entries: Object.fromEntries(lives) };
  save('eligibility.json', eligibilitySnapshot);
  save('sources.json', { capturedAt: iso(captureAt), sources, discoveryIssues });
  const homeResponse = await request(o.origin + '/x', { headers: CRAWLER });
  const home = metadata(homeResponse.text || '');
  const homeGeneric = home.title.length ? home : { title: ['Web3 Jobs and Crypto Careers | Hashtag Web3'], description: ['Find verified Web3 jobs, crypto careers, salary data, and practical guides. Updated daily for builders, marketers, and product teams.'] };
  save('home-reference.json', { ...smallResponse(homeResponse), metadata: home });

  const aliasEvidence = new Map();
  await pool([...candidates.values()].filter(candidate => aliases.has(candidate.path) && !publicExclusion(candidate.path)), o.concurrency, async candidate => {
    const probe = await probeCanonical(candidate);
    const expected = new URL(aliases.get(candidate.path), o.origin).pathname;
    aliasEvidence.set(candidate.path, probe);
    if (probe.status !== 200 || normPath(probe.path || '') !== expected || probe.unexpectedHome) {
      discoveryIssues.push({ path: candidate.path, reason: 'live_canonical_alias_not_confirmed', required: true, expected, probe });
      aliases.delete(candidate.path);
    }
  });
  save('canonical-aliases.json', Object.fromEntries(aliasEvidence));
  const pages = new Map();
  for (const candidate of candidates.values()) {
    const exclusion = publicExclusion(candidate.path);
    if (exclusion) { inventory.push({ ...candidate, exclusion }); continue; }
    const alias = aliases.get(candidate.path);
    if (alias && (publicExclusion(new URL(alias, o.origin).pathname) || alias === '/')) {
      inventory.push({ ...candidate, exclusion: alias === '/' ? 'known-retired-home-alias' : 'alias-to-non-html-resource', target: alias });
      continue;
    }
    const canonical = alias ? new URL(alias, o.origin).pathname : candidate.path;
    const life = lives.get(canonical);
    if (life && !life.eligibleAtCapture) { inventory.push({ ...candidate, exclusion: life.kind === 'job' ? `job-${life.exclusionAtCapture}` : 'event-retention-due', lifetime: life }); continue; }
    const family = canonical === '/' ? 'home' : /^\/glossary\//.test(canonical) ? 'glossary-category' : appPaths.includes(canonical) ? 'static-page' : families.get(canonical) || 'unclassified-public';
    if (['job', 'event'].includes(family) && !life) discoveryIssues.push({ path: canonical, reason: 'live_clock_eligibility_missing', required: true, family });
    inventory.push({ ...candidate, canonical, family, alias: Boolean(alias) });
    const page = pages.get(canonical) || { path: canonical, family, sources: [], lifetime: life };
    page.sources = [...new Set([...page.sources, ...candidate.sources])];
    pages.set(canonical, page);
  }
  for (const entry of inventory) append('inventory.jsonl', entry);

  async function probeCanonical(page) {
    let url = new URL(page.path, o.origin);
    const chain = [];
    for (let hop = 0; hop < 6; hop++) {
      const response = await request(url.href, { headers: HUMAN });
      chain.push({ path: url.pathname + url.search, ...smallResponse(response) });
      if (!REDIRECTS.has(response.status) || !response.location) {
        const meta = metadata(response.text || '');
        return { chain, status: response.status, path: url.pathname, canonical: meta.canonical, html: /text\/html/i.test(response.type || ''), unexpectedHome: page.path !== '/' && url.pathname === '/' };
      }
      const target = new URL(response.location, url);
      if (target.origin !== o.origin || (page.path !== '/' && target.pathname === '/')) return { chain, status: response.status, path: target.pathname, unexpectedHome: target.pathname === '/', offsite: target.origin !== o.origin };
      url = target;
    }
    return { chain, error: 'redirect_loop' };
  }

  const supplemental = [...pages.values()].filter(page => !page.sources.includes('live-sitemap'));
  await pool(supplemental, o.concurrency, async page => {
    page.liveProbe = await probeCanonical(page);
    if (page.liveProbe.status !== 200 || !page.liveProbe.html || page.liveProbe.unexpectedHome) {
      discoveryIssues.push({ path: page.path, reason: 'supplemental_public_page_not_live', required: true, probe: page.liveProbe });
    }
  });
  let selected = [...pages.values()].sort((a, b) => a.path.localeCompare(b.path));
  if (o.paths.length) {
    const wanted = new Set(o.paths.map(normPath));
    selected = selected.filter(page => wanted.has(page.path));
    for (const p of wanted) assert.ok(selected.some(page => page.path === p), `${p} is not in the current public inventory`);
  }
  state.scope = { sitemapFiles: sitemapSeen.size, sitemapEntries: sources.reduce((n, source) => n + (source.entries || 0), 0), candidates: candidates.size, canonicalPages: pages.size, selectedPages: selected.length, staticNextPages: appPaths.length, supplementalPages: supplemental.map(page => page.path), excluded: inventory.filter(item => item.exclusion).length, sampleOnly: Boolean(o.paths.length) };
  console.log(JSON.stringify({ stage: 'discovered', ...state.scope, reportDir: o.reportDir }));
  state.stage = 'all-pages';
  checkpoint();

  async function crawler(page, suffix, { input = page.path, allowRedirects = false, headers = CRAWLER } = {}) {
    let url = new URL(suffixPath(input, suffix), o.origin);
    const chain = [];
    for (let hop = 0; hop < 7; hop++) {
      const response = await request(url.href, { headers });
      chain.push({ path: url.pathname, ...smallResponse(response) });
      if (expectedRetirement(response, page.lifetime, o.origin)) return { status: 'retired', chain, issues: [] };
      if (allowRedirects && [307, 308].includes(response.status) && response.location) {
        const target = new URL(response.location, url);
        if (target.origin !== o.origin || (page.path !== '/' && target.pathname === '/')) return { status: 'fail', chain, issues: ['unexpected_redirect'] };
        url = target;
        continue;
      }
      const meta = metadata(response.text || '');
      const issues = [];
      if (response.status !== 200) issues.push(response.status ? `crawler_http_${response.status}` : 'crawler_network_error');
      if (!/text\/html/i.test(response.type || '')) issues.push('crawler_not_html');
      issues.push(...metaIssues(meta, o.canonicalOrigin + page.path, homeGeneric));
      return { status: issues.length ? 'fail' : 'pass', chain, meta, issues };
    }
    return { status: 'fail', chain, issues: ['crawler_redirect_loop'] };
  }

  async function browser(page, suffix, { input = page.path, query = QUERY, headers = HUMAN, expectedAlias = '' } = {}) {
    let url = new URL(suffixPath(input, suffix), o.origin);
    url.search = query;
    const chain = [];
    for (let hop = 0; hop < 7; hop++) {
      const response = await request(url.href, { headers, body: false });
      chain.push({ path: url.pathname + url.search, ...smallResponse(response) });
      if (expectedRetirement(response, page.lifetime, o.origin)) return { status: 'retired', chain, issues: [] };
      if (![307, 308].includes(response.status) || !response.location) return { status: 'fail', chain, issues: [response.status ? `browser_http_${response.status}` : 'browser_network_error'] };
      const target = new URL(response.location, url);
      if (!target.hash) target.hash = url.hash;
      if (target.origin !== o.origin) return { status: 'fail', chain, issues: ['offsite_redirect'] };
      if (page.path !== '/' && target.pathname === '/') return { status: 'fail', chain, issues: ['unexpected_home_redirect'] };
      if (normPath(target.pathname) === page.path) {
        const issues = queryIssues(target, query, social.SOCIAL_UTM_MAP[suffix.toLowerCase().replace(/\/+$/, '')], expectedAlias);
        return { status: issues.length ? 'fail' : 'pass', chain, target: target.href, issues };
      }
      const stripped = social.stripSocialPathSuffix(normPath(target.pathname)).toLowerCase();
      const knownTarget = aliases.get(stripped);
      const aliasPath = knownTarget && new URL(knownTarget, o.origin).pathname;
      if (stripped !== page.path && aliasPath !== page.path && stripped !== normPath(input).toLowerCase()) return { status: 'fail', chain, issues: ['wrong_redirect_path'], target: target.href };
      url = target;
    }
    return { status: 'fail', chain, issues: ['browser_redirect_loop'] };
  }

  async function check(page, suffixes, config = {}) {
    const row = { path: page.path, family: page.family, suite: config.suite || 'all-pages', case: config.name, input: config.input, crawlerSuffix: suffixes[0], browserSuffix: suffixes[1], at: new Date().toISOString(), lifetime: page.lifetime };
    if (retiredAt(page.lifetime, Date.now())) {
      row.status = 'retired';
      row.reason = 'clock-retirement-before-request';
    } else {
      row.crawler = await crawler(page, suffixes[0], config);
      row.browser = config.crawlerOnly ? undefined : await browser(page, suffixes[1], config);
      const checks = [row.crawler, row.browser].filter(Boolean);
      row.status = checks.some(result => result.status === 'fail') ? 'fail' : checks.some(result => result.status === 'retired') ? 'retired' : 'pass';
      if (row.crawler.meta) for (const image of row.crawler.meta.images) {
        try {
          if (!['https:', 'http:'].includes(new URL(image).protocol)) continue;
          if (!images.has(image)) images.set(image, { url: image, rows: [] });
          images.get(image).rows.push(row);
        } catch {}
      }
      if (row.status === 'fail' && row.suite === 'all-pages') row.canonicalProbe = await probeCanonical(page);
    }
    rows.push(row);
    append('results.jsonl', row);
    if (rows.length % 100 === 0) {
      checkpoint();
      console.log(JSON.stringify({ stage: state.stage, completed: rows.length, failures: rows.filter(r => r.status === 'fail').length, requests: stats.requests }));
    }
  }
  await pool(selected, o.concurrency, page => check(page, ['x', 'li']));

  const representatives = new Map();
  for (const p of HUBS) if (pages.has(p)) representatives.set(`hub:${p}`, pages.get(p));
  for (const page of [...pages.values()].sort((a, b) => (Date.parse(b.lifetime?.retireAt) || 0) - (Date.parse(a.lifetime?.retireAt) || 0))) {
    if (!representatives.has(`family:${page.family}`) && !retiredAt(page.lifetime, Date.now())) representatives.set(`family:${page.family}`, page);
  }
  for (const p of ['/about', '/privacy', '/salary-calculator', '/invoice-generator']) if (pages.has(p)) representatives.set(`static:${p}`, pages.get(p));
  const reps = [...new Map([...representatives.values()].map(page => [page.path, page])).values()];
  save('representatives.json', { selectors: Object.fromEntries([...representatives].map(([key, page]) => [key, page.path])), paths: reps.map(page => ({ path: page.path, family: page.family })), suffixes: social.SOCIAL_UTM_MAP, plannedMatrixPairs: reps.length * 32 });
  if (o.matrix) {
    state.stage = '32-suffix-matrix';
    await pool(reps.flatMap(page => Object.keys(social.SOCIAL_UTM_MAP).map(suffix => ({ page, suffix }))), o.concurrency, ({ page, suffix }) => check(page, [suffix, suffix], { suite: 'matrix' }));
  }
  if (o.cases) {
    state.stage = 'edge-cases';
    const cases = reps.flatMap(page => [
      { page, suffixes: ['X/', 'LI/'], config: { suite: 'cases', name: 'uppercase-trailing', input: page.path.toUpperCase(), allowRedirects: true } },
      { page, suffixes: ['x', 'li'], config: { suite: 'cases', name: 'default-campaign', query: 'tag=a&tag=b' } },
      { page, suffixes: ['x', 'li'], config: { suite: 'cases', name: 'empty-campaign', query: 'utm_campaign=&tag=a&tag=b' } },
      { page, suffixes: ['x', 'li'], config: { suite: 'cases', name: 'ua-only-is-headless', crawlerOnly: true, headers: { 'user-agent': HUMAN['user-agent'], accept: 'text/html' } } },
    ]);
    const aliasCases = [
      ['/docs', '/developers'], ['/api-docs', '/developers'], ['/blog/shape-of-ethereum', '/shape-of-ethereum'],
      ['/companies/offchain-labs', '/offchain-labs'], ['/glossary/bitcoin', '/bitcoin'], ['/popups/ns', '/ns'],
      ['/learn/marketing/twitter', '/twitter-marketing'], ['/nomads/cities/lisbon', '/lisbon'], ['/cost-of-living', '/nomads?category=cost'], ['/citizenship/dominica', '/citizenship#dominica'],
    ];
    for (const [input, target] of aliasCases) {
      const page = pages.get(new URL(target, o.origin).pathname);
      if (!page) { discoveryIssues.push({ path: input, reason: 'alias_representative_target_not_in_inventory' }); continue; }
      aliases.set(input, target);
      for (const suffix of Object.keys(social.SOCIAL_UTM_MAP)) cases.push({ page, suffixes: [suffix, suffix], config: { suite: 'cases', name: 'canonical-alias', input, expectedAlias: target, allowRedirects: true } });
    }
    await pool(cases, o.concurrency, ({ page, suffixes, config }) => check(page, suffixes, config));
  }

  state.stage = 'deduplicated-image-head';
  checkpoint();
  await pool([...images.values()], o.concurrency, async image => {
    let url = image.url;
    const chain = [];
    let response;
    for (let hop = 0; hop < 6; hop++) {
      response = await request(url, { method: 'HEAD', body: false });
      chain.push({ url, ...smallResponse(response) });
      if (!REDIRECTS.has(response.status) || !response.location) break;
      const target = new URL(response.location, url);
      if (!['https:', 'http:'].includes(target.protocol)) break;
      url = target.href;
    }
    if ([405, 501].includes(response.status)) {
      response = await request(url, { body: false });
      chain.push({ url, method: 'GET-headers-only', ...smallResponse(response) });
    }
    image.status = response.status === 200 && /^image\//i.test(response.type || '') ? 'pass' : 'fail';
    image.chain = chain;
    if (image.status === 'fail') for (const row of image.rows) {
      if (retiredAt(row.lifetime, Date.parse(response.at)) && [404, 410].includes(response.status)) {
        (row.retiredImages ||= []).push(image.url);
        if (row.status === 'pass') row.status = 'retired';
      } else {
        (row.imageFailures ||= []).push(image.url);
        row.status = 'fail';
      }
    }
    append('images.jsonl', { url: image.url, status: image.status, references: image.rows.length, chain });
  });

  const [endJobs, endEvents, endFreshness] = await Promise.all([sourceJson('/data/jobs-runtime.json'), sourceJson('/data/events-runtime.json'), sourceJson('/data/catalog-freshness.json')]);
  const endAt = Date.now();
  const endSlugs = new Set((endJobs || []).map(job => `/${job.slug}`));
  save('end-clock.json', { at: iso(endAt), freshness: endFreshness, snapshotChanged: freshness?.snapshotId !== endFreshness?.snapshotId, jobsCount: endJobs?.length, eventsCount: endEvents?.length, jobsNoLongerInLiveCatalog: [...lives].filter(([p, life]) => life.kind === 'job' && !endSlugs.has(p)).map(([p, life]) => ({ path: p, retireAt: life.retireAt, expiredByClock: retiredAt(life, endAt) })), eventEligibility: (endEvents || []).map(event => ({ path: `/${event.slug}`, ...lifetime('event', event, endAt) })) });
  await localPromise;
  save('results.jsonl', rows.map(row => JSON.stringify(row)).join('\n') + '\n');
  const failures = rows.filter(row => row.status === 'fail');
  const tsv = value => String(value ?? '').replace(/[\t\r\n]/g, ' ');
  const failLines = [['suite', 'case', 'path', 'input', 'crawler_suffix', 'browser_suffix', 'issues', 'crawler_http', 'browser_http', 'browser_location', 'image_failures'].join('\t')];
  for (const row of failures) failLines.push([row.suite, row.case, row.path, row.input, row.crawlerSuffix, row.browserSuffix, [...(row.crawler?.issues || []), ...(row.browser?.issues || []), ...(row.imageFailures ? ['og_image_unavailable'] : [])].join(','), row.crawler?.chain?.map(r => r.status).join('>'), row.browser?.chain?.map(r => r.status).join('>'), row.browser?.target || row.browser?.chain?.at(-1)?.location, row.imageFailures?.join(' ')].map(tsv).join('\t'));
  for (const issue of discoveryIssues.filter(issue => issue.required)) failLines.push(['inventory', '', issue.path, issue.expected, '', '', issue.reason, '', issue.probe?.chain?.map(response => response.status).join('>') || issue.status, issue.probe?.path, ''].map(tsv).join('\t'));
  save('fail-paths.tsv', failLines.join('\n') + '\n');
  const counts = group => ({ total: group.length, pass: group.filter(r => r.status === 'pass').length, fail: group.filter(r => r.status === 'fail').length, retired: group.filter(r => r.status === 'retired').length });
  const issueCounts = {};
  for (const row of failures) for (const issue of [...(row.crawler?.issues || []), ...(row.browser?.issues || []), ...(row.imageFailures ? ['og_image_unavailable'] : [])]) issueCounts[issue] = (issueCounts[issue] || 0) + 1;
  const exclusions = {};
  for (const item of inventory) if (item.exclusion) exclusions[item.exclusion] = (exclusions[item.exclusion] || 0) + 1;
  state.auditComplete = !o.paths.length && rows.filter(row => row.suite === 'all-pages').length === pages.size && !discoveryIssues.some(issue => issue.required);
  state.stage = 'finished';
  const summary = {
    ...state, endedAt: iso(endAt), elapsedSeconds: Math.round((endAt - Date.parse(startedAt)) / 1000),
    liveChecksPass: state.auditComplete && !failures.length && (!o.localRouting || local?.passed),
    result: o.phase === 'baseline' ? 'Baseline evidence only; deployment verification remains required.' : 'Post-deployment observation; see liveChecksPass and auditComplete.',
    counts: { allPages: counts(rows.filter(r => r.suite === 'all-pages')), matrix: counts(rows.filter(r => r.suite === 'matrix')), cases: counts(rows.filter(r => r.suite === 'cases')), crawler: counts(rows.flatMap(r => r.crawler ? [r.crawler] : [])), browser: counts(rows.flatMap(r => r.browser ? [r.browser] : [])), images: counts([...images.values()]) },
    byFamily: Object.fromEntries([...new Set(selected.map(page => page.family))].sort().map(family => [family, counts(rows.filter(r => r.suite === 'all-pages' && r.family === family))])),
    exclusions, issueCounts, discoveryIssues, localRouting: local ? { passed: local.passed, exitCode: local.exitCode, file: 'local-routing.json' } : { ran: false },
    scopeNotes: ['Live XML sitemap(s), recursive static Next pages, and known social hubs; canonical aliases deduplicated.', 'Every selected canonical page: Twitterbot GET /x without Sec-Fetch, browser GET /li with navigation Sec-Fetch headers and manual 307/308 validation.', 'Browser checks validate Location and query preservation; canonical destination GETs are performed for supplemental pages and failures, not every successful redirect.', 'API, assets, feeds, route templates, internal caches, non-HTML aliases and clock-ineligible jobs/events excluded.', 'HTTP bodies are parsed in memory and never saved. OG image HEADs are deduplicated by full URL; 405/501 permits one GET with body cancelled.', 'No request retries, cache busters, forwarded-IP rotation, or rate-limit bypass. 429/Retry-After pauses the entire request queue.', 'Event end and 30-day retention deadlines are distinct; unexpected home recovery is a failure without observed clock eligibility evidence.', 'Local catalogs provide family/alias hints; current alias destinations are live-probed. Eligibility uses live jobs/events catalogs and retained HTTP Date/Age evidence.', 'The 32-suffix network matrix is representative-only; the shared local routing suite supplies exhaustive GET/HEAD and browser/crawler evidence when enabled.'],
    files: { failures: 'fail-paths.tsv', results: 'results.jsonl', inventory: 'inventory.jsonl', eligibility: 'eligibility.json', images: 'images.jsonl', representatives: 'representatives.json' },
    postdeployCommand: 'node scripts/audit-public-shortlinks.mjs --phase postdeploy --concurrency 5 --matrix --cases --local-routing',
  };
  save('sources.json', { capturedAt: iso(captureAt), sources, discoveryIssues });
  save('summary.json', summary);
  save('summary.md', `# Public shortlink ${o.phase} audit\n\n${summary.result}\n\n- Window: ${startedAt} to ${summary.endedAt}\n- Audit complete: ${summary.auditComplete}; live checks pass: ${summary.liveChecksPass}\n- Canonical pages: ${JSON.stringify(summary.counts.allPages)}\n- Matrix: ${JSON.stringify(summary.counts.matrix)}\n- Cases: ${JSON.stringify(summary.counts.cases)}\n- Images: ${JSON.stringify(summary.counts.images)}\n- Requests: ${stats.requests}; peak concurrency: ${stats.peakConcurrent}\n- Local routing evidence: ${JSON.stringify(summary.localRouting)}\n- Failures: [fail-paths.tsv](fail-paths.tsv)\n- Inventory: [inventory.jsonl](inventory.jsonl)\n- Clock evidence: [eligibility.json](eligibility.json), [end-clock.json](end-clock.json)\n\n## Scope and exclusions\n\n${summary.scopeNotes.map(note => `- ${note}`).join('\n')}\n\nExclusion counts: ${JSON.stringify(exclusions)}\n\n## Post-deployment rerun\n\n\`\`\`bash\n${summary.postdeployCommand}\n\`\`\`\n`);
  if (discoveryIssues.length) save('summary.md', `\n## Inventory issues\n\nThese are separate from the per-page shortlink totals. Required inventory issues also appear as \`inventory\` rows in the failure TSV and keep \`auditComplete\` false.\n\n${discoveryIssues.map(issue => `- ${issue.path}: ${issue.reason}${issue.expected ? ` (expected ${issue.expected})` : ''}`).join('\n')}\n`, true);
  checkpoint();
  console.log(JSON.stringify({ ...summary, byFamily: undefined, options: undefined, requestProfiles: undefined, scopeNotes: undefined }, null, 2));
  console.log(`Report: ${o.reportDir} (${[...sizes.values()].reduce((a, b) => a + b, 0)} bytes)`);
  process.exitCode = summary.liveChecksPass ? 0 : 1;
}

async function selfTest() {
  const expected = 'https://hashtagweb3.com/events';
  const good = metadata(`<link rel="canonical" href="${expected}"><meta property="og:url" content="${expected}"><meta property="og:title" content="Events"><meta property="og:description" content="A &amp; B"><meta property="og:image" content="https://hashtagweb3.com/events.png">`);
  assert.deepEqual(metaIssues(good, expected), []);
  assert.equal(good.description[0], 'A & B');
  assert.ok(metaIssues({ ...good, canonical: ['https://hashtagweb3.com/'] }, expected).includes('wrong_canonical'));
  assert.ok(metaIssues({ ...good, url: ['https://hashtagweb3.com/events?utm_source=x'] }, expected).includes('wrong_url'));
  assert.ok(metaIssues(good, expected, { title: ['Events'] }).includes('generic_home_title'));
  const attr = { utm_source: 'linkedin', utm_medium: 'social' };
  const target = new URL(expected + '?' + QUERY);
  target.searchParams.set('utm_source', attr.utm_source);
  target.searchParams.set('utm_medium', attr.utm_medium);
  assert.deepEqual(queryIssues(target, QUERY, attr), []);
  target.searchParams.delete('tag');
  assert.ok(queryIssues(target, QUERY, attr).includes('query_tag'));
  assert.ok(queryIssues(new URL(expected + '?utm_source=linkedin&utm_medium=social'), '', attr).includes('query_utm_campaign'));
  const now = Date.parse('2026-10-17T00:00:00Z');
  const life = lifetime('job', { date: '2026-09-17T00:00:00Z', active: true }, now);
  assert.equal(life.eligibleAtCapture, true);
  assert.equal(retiredAt(life, now), false);
  assert.equal(retiredAt(life, now + 1), true);
  assert.equal(expectedRetirement({ at: iso(now + 1), status: 307, location: '/' }, life, 'https://hashtagweb3.com'), true);
  assert.equal(expectedRetirement({ at: iso(now), status: 307, location: '/' }, life, 'https://hashtagweb3.com'), false);
  assert.equal(expectedRetirement({ at: iso(now + 1), status: 200 }, life, 'https://hashtagweb3.com'), false);
  const event = lifetime('event', { startDate: '2026-10-16', endDate: '2026-10-16' }, now);
  assert.equal(event.eligibleAtCapture, true);
  assert.equal(retiredAt(event, now), false);
  assert.ok(publicExclusion('/job-listing-cache/123/jobs'));
  assert.ok(publicExclusion('/jobs/feed.xml'));
  assert.equal(publicExclusion('/api-docs'), null);
  assert.equal(HUMAN['sec-fetch-mode'], 'navigate');
  assert.ok(!Object.keys(CRAWLER).some(key => key.startsWith('sec-fetch')));
  const received = [];
  const server = http.createServer((request, response) => {
    received.push({ headers: request.headers, method: request.method });
    response.writeHead(200, { 'content-type': 'text/html' });
    response.end('ok');
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    const stats = { requests: 0, methods: {}, statuses: {}, peakConcurrent: 0, bodyBytes: 0, errors: 0, backoffs: 0 };
    const request = transport({ concurrency: 2, intervalMs: 100, timeoutMs: 2000 }, stats);
    const origin = `http://127.0.0.1:${server.address().port}`;
    const responses = await Promise.all([request(origin, { headers: CRAWLER }), request(origin, { headers: HUMAN }), request(origin, { method: 'HEAD' })]);
    assert.ok(responses.every(response => response.status === 200));
    assert.ok(!Object.keys(received[0].headers).some(key => key.startsWith('sec-fetch')), 'Crawler must have no Sec-Fetch headers on the wire');
    assert.equal(received[1].headers['sec-fetch-mode'], 'navigate');
    assert.equal(received[2].method, 'HEAD');
    assert.equal(stats.peakConcurrent, 2);
  } finally { await new Promise(resolve => server.close(resolve)); }
  console.log('Audit self-test passed: metadata identity, generic-home rejection, repeated/encoded queries, clock boundaries, retirement, exclusions, actual HTTP request profiles, and bounded concurrency.');
}

const o = options(process.argv.slice(2));
if (o.help) console.log(`Read-only public shortlink HTTP audit (Node 22+, installed repository dependencies).

  node scripts/audit-public-shortlinks.mjs --phase baseline --local-routing
  node scripts/audit-public-shortlinks.mjs --phase postdeploy --matrix --cases --local-routing
  node scripts/audit-public-shortlinks.mjs --path /events --path /glossary/technical
  node scripts/audit-public-shortlinks.mjs --self-test

--origin URL             HTTP target (default https://hashtagweb3.com)
--canonical-origin URL   Expected OG/canonical origin (defaults to target)
--concurrency N          1–6; default 5, global cap including image requests
--interval-ms N          Global request start spacing; default 150, minimum 100
--timeout-ms N           Per-request timeout; default 30000
--report-dir PATH        Empty directory under .cache; default timestamped
--matrix                 All 32 shared suffixes on representative route families/hubs
--cases                  Casing, trailing slash, campaign, UA-only, canonical alias cases
--local-routing          Run existing exhaustive shared routing tests; save provenance
--path /PATH             Repeatable diagnostic subset; explicitly NOT full coverage

No HTML or image bodies are written to disk. Report budget: 28 MiB.
Exit 0: complete passing live audit; 1: failures or incomplete/sample audit; 2: fatal error.`);
else if (o.selfTest) await selfTest();
else run(o).catch(error => { console.error(error.stack || error); process.exitCode = 2; });
