#!/usr/bin/env tsx
/**
 * Copy runtime catalogs + shards into public/ (CDN). Skips when inputs unchanged
 * and outputs exist (local rebuilds). FAH fresh checkouts still copy (outputs missing).
 */
import { execSync } from 'node:child_process';
import { hashPaths, outputsReady } from './lib/hash-files';
import { loadManifest, saveManifest } from './lib/prebuild-manifest';

const ROOT = process.cwd();
const STEP_ID = 'public-catalog-sync';

const INPUTS = [
  'content/jobs-runtime.json',
  'content/events-runtime.json',
  'content/glossary-runtime.json',
  'content/companies-runtime.json',
  'content/company-profiles-runtime.json',
  'content/company-socials.json',
  'content/articles-index.json',
  'content/news-cache.json',
  'content/job-description-shards',
  'content/job-shards',
];

const OUTPUTS = [
  'public/data/jobs-runtime.json',
  'public/job-description-shards',
  'public/job-shards',
];

function main(): void {
  const manifest = loadManifest();
  const current = hashPaths(ROOT, INPUTS);
  const stored = manifest.steps[STEP_ID]?.inputHash;
  const ready = outputsReady(ROOT, OUTPUTS);

  if (ready && stored === current) {
    console.log('[sync-public-catalog-assets] up to date → skip');
    return;
  }

  execSync('sh scripts/sync-public-catalog-assets.sh', { stdio: 'inherit', cwd: ROOT });
  manifest.steps[STEP_ID] = { inputHash: current };
  saveManifest(manifest);
  console.log('[sync-public-catalog-assets] copied catalogs + shards to public/');
}

main();
