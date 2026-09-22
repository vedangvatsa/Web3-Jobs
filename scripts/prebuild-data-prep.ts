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
  run('npx tsx scripts/sync-public-catalog-assets.ts');
}

function main(): void {
  const manifest = loadManifest();
  let ran = 0;

  const dirtyOutputs = new Set<string>();
  for (const step of PREBUILD_DATA_STEPS) {
    if (!shouldRunStep(step, manifest, fast, dirtyOutputs)) continue;
    run(step.command);
    recordStep(manifest, step);
    for (const output of step.outputs) dirtyOutputs.add(output);
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
