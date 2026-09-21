#!/usr/bin/env tsx
import { execSync } from 'node:child_process';
import {
  loadManifest,
  recordStep,
  saveManifest,
  shouldRunStep,
} from './lib/prebuild-manifest';
import { SITEMAP_STEP } from './lib/prebuild-steps';

const fast = process.env.FAH_FAST_PREBUILD === '1';

function main(): void {
  if (fast) {
    console.log('[prebuild-sitemap] FAH_FAST_PREBUILD — skip (ingest commits sitemap artifacts)');
    return;
  }

  const manifest = loadManifest();
  if (!shouldRunStep(SITEMAP_STEP, manifest, false)) return;

  execSync(SITEMAP_STEP.command, { stdio: 'inherit', cwd: process.cwd(), env: process.env });
  recordStep(manifest, SITEMAP_STEP);
  saveManifest(manifest);
}

main();
