#!/usr/bin/env tsx
import { execSync } from 'node:child_process';
import {
  loadManifest,
  recordStep,
  refreshAllHashes,
  saveManifest,
  shouldRunStep,
} from './lib/prebuild-manifest';
import { PREBUILD_DATA_STEPS, SITEMAP_STEP } from './lib/prebuild-steps';
import { assignJobSlugsInCacheFile } from './lib/job-slug-assignment';
import { retireRejectedJobSources } from './lib/retire-rejected-job-sources';

const fast = process.env.FAH_FAST_PREBUILD === '1';

function run(cmd: string): void {
  execSync(cmd, { stdio: 'inherit', cwd: process.cwd(), env: process.env });
}

function syncPublicAssets(): void {
  run('npx tsx scripts/sync-public-catalog-assets.ts');
}

function main(): void {
  // The optimizer's content hashes avoid repeated lossy encoding, including on fast builds.
  run('npx tsx scripts/optimize-static-images.ts');
  const manifest = loadManifest();
  let ran = 0;

  const dirtyOutputs = new Set<string>();
  const retired = retireRejectedJobSources();
  if (retired.removedJobs) dirtyOutputs.add('content/jobs-cache.json');
  const jobSlugs = assignJobSlugsInCacheFile('content/jobs-cache.json');
  if (jobSlugs.wrote) dirtyOutputs.add('content/jobs-cache.json');
  for (const step of PREBUILD_DATA_STEPS) {
    if (!shouldRunStep(step, manifest, fast, dirtyOutputs)) continue;
    run(step.command);
    recordStep(manifest, step);
    for (const output of step.outputs) dirtyOutputs.add(output);
    ran += 1;
  }

  // Sitemap validation runs in the next prebuild stage, so refresh it first.
  if (shouldRunStep(SITEMAP_STEP, manifest, fast, dirtyOutputs)) {
    run(SITEMAP_STEP.command);
    recordStep(manifest, SITEMAP_STEP);
    ran += 1;
  }

  saveManifest(manifest);
  if (fast) {
    refreshAllHashes(manifest);
    saveManifest(manifest);
  }
  syncPublicAssets();
  run('npx tsx scripts/generate-responsive-images.ts');
  run('npx tsx scripts/precompute-og-previews.ts');
  run('npx tsx scripts/prune-responsive-images.ts --apply');
  console.log(`[prebuild-data-prep] finished (${ran} step(s) executed, FAH_FAST=${fast})`);
}

main();
