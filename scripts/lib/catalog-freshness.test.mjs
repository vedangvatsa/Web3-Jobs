import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { FRESHNESS_CATALOGS, writeCatalogFreshness, verifyCatalogFreshness } from './catalog-freshness.mjs';

test('live verification rejects stale deployments and mismatched catalogue bodies', async t => {
  fs.mkdirSync('.cache', { recursive: true });
  const root = fs.mkdtempSync(path.resolve('.cache/catalog-freshness-test-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.mkdirSync(path.join(root, 'public/data'), { recursive: true });
  for (const url of Object.values(FRESHNESS_CATALOGS)) fs.writeFileSync(path.join(root, 'public', url), '[{"id":"one","date":"2026-10-07"}]\n');
  const since = new Date(Date.now() - 1000).toISOString();
  let manifest = writeCatalogFreshness(root), corrupt = false;
  const fetchFn = async url => {
    if (url.pathname.endsWith('catalog-freshness.json')) return Response.json(manifest);
    return new Response(corrupt ? '[]' : fs.readFileSync(path.join(root, 'public', url.pathname)));
  };
  assert.equal((await verifyCatalogFreshness({ origin: 'https://example.com', since, fetchFn })).catalogs.jobs.count, 1);
  corrupt = true;
  await assert.rejects(verifyCatalogFreshness({ origin: 'https://example.com', since, fetchFn }), /does not match/);
  corrupt = false; manifest = { ...manifest, builtAt: '2026-01-01T00:00:00Z' };
  await assert.rejects(verifyCatalogFreshness({ origin: 'https://example.com', since, fetchFn }), /stale/);
});
