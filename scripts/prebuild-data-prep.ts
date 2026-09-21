#!/usr/bin/env tsx
import { execSync } from 'node:child_process';
import {
  loadManifest,
  recordStep,
  refreshAllHashes,
  saveManifest,
  shouldRunStep,
} from './lib/prebuild-manifest';
import { PREBUILD_DATA_STEPS } from './lib/prebuild-steps';

const fast = process.env.FAH_FAST_PREBUILD === '1';

function run(cmd: string): void {
  execSync(cmd, { stdio: 'inherit', cwd: process.cwd(), env: process.env });
}

function syncPublicAssets(): void {
  run(
    'mkdir -p public/data public/job-description-shards public/job-shards && ' +
      'cp content/jobs-runtime.json content/events-runtime.json content/glossary-runtime.json content/companies-runtime.json content/company-profiles-runtime.json content/articles-index.json content/news-cache.json public/data/ 2>/dev/null || true && ' +
      'cp -r content/job-description-shards/. public/job-description-shards/ 2>/dev/null || true && ' +
      'cp -r content/job-shards/. public/job-shards/ 2>/dev/null || true',
  );
}

function main(): void {
  const manifest = loadManifest();
  let ran = 0;

  for (const step of PREBUILD_DATA_STEPS) {
    if (!shouldRunStep(step, manifest, fast)) continue;
    run(step.command);
    recordStep(manifest, step);
    ran += 1;
  }

  saveManifest(manifest);
  if (fast) {
    refreshAllHashes(manifest);
    saveManifest(manifest);
  }
  syncPublicAssets();
  console.log(`[prebuild-data-prep] finished (${ran} step(s) executed, FAH_FAST=${fast})`);
}

main();
