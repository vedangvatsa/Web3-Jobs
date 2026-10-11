import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

export const FRESHNESS_CATALOGS = {
  jobs: '/data/jobs-runtime.json', events: '/data/events-runtime.json', news: '/data/news-cache.json',
  articles: '/data/articles-index.json', companies: '/data/companies-runtime.json',
};
export const catalogHash = body => createHash('sha256').update(body).digest('hex');

export function writeCatalogFreshness(root) {
  const catalogs = {};
  for (const [name, url] of Object.entries(FRESHNESS_CATALOGS)) {
    const raw = fs.readFileSync(path.join(root, 'public', url));
    const data = JSON.parse(raw.toString());
    const rows = Array.isArray(data) ? data : data.items || data.articles || [];
    const dates = rows.map(row => row.publishedDate || row.pubDate || row.date).filter(value => typeof value === 'string' && Number.isFinite(Date.parse(value))).sort((a, b) => Date.parse(b) - Date.parse(a));
    catalogs[name] = { path: url, sha256: catalogHash(raw), count: rows.length, newestSourceDate: dates[0] || null };
  }
  const receipt = path.join(root, 'content/catalog-refresh-state.json');
  const manifest = { version: 1, builtAt: new Date().toISOString(), snapshotId: catalogHash(JSON.stringify(catalogs)).slice(0, 24), catalogs,
    refreshes: fs.existsSync(receipt) ? JSON.parse(fs.readFileSync(receipt, 'utf8')).catalogs : {} };
  fs.writeFileSync(path.join(root, 'public/data/catalog-freshness.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  return manifest;
}

export async function verifyCatalogFreshness({ origin, since, fetchFn = fetch }) {
  const base = new URL(origin);
  const minimum = Date.parse(since);
  if (!Number.isFinite(minimum)) throw new Error('A deployment start time is required');
  const response = await fetchFn(new URL(`/data/catalog-freshness.json?verify=${Date.now()}`, base), { cache: 'no-cache', signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`Freshness manifest HTTP ${response.status}`);
  const manifest = await response.json();
  const built = Date.parse(manifest.builtAt);
  if (manifest.version !== 1 || !manifest.snapshotId || !Number.isFinite(built) || built < minimum || built > Date.now() + 300000) throw new Error('The live catalogue manifest is stale or invalid');
  for (const [name, expectedPath] of Object.entries(FRESHNESS_CATALOGS)) {
    const entry = manifest.catalogs?.[name];
    if (entry?.path !== expectedPath || !/^[a-f0-9]{64}$/.test(entry.sha256 || '')) throw new Error(`Invalid ${name} catalogue manifest entry`);
    const live = await fetchFn(new URL(`${expectedPath}?snapshot=${encodeURIComponent(manifest.snapshotId)}`, base), { cache: 'no-cache', signal: AbortSignal.timeout(30000) });
    if (!live.ok) throw new Error(`${name} catalogue HTTP ${live.status}`);
    if (catalogHash(Buffer.from(await live.arrayBuffer())) !== entry.sha256) throw new Error(`${name} catalogue does not match the deployed build`);
  }
  return manifest;
}
