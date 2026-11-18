#!/usr/bin/env tsx
import { execSync } from 'node:child_process';

function run(cmd: string): void {
  execSync(cmd, { stdio: 'inherit', cwd: process.cwd(), env: process.env });
}

/** Gitignored public/ assets + Next production build for OpenNext (no npm prebuild hook). */
function main(): void {
  process.env.OPENNEXT_CLOUDFLARE ??= '1';
  process.env.FAH_FAST_PREBUILD ??= '1';
  process.env.CF_CONTAINER_BUILD ??= '1';
  run('npx tsx scripts/sync-public-catalog-assets.ts');
  run('npx tsx scripts/materialize-job-shards-from-runtime.ts');
  run('npx tsx scripts/precompute-nomads.ts');
  run('npx tsx scripts/precompute-og-previews.ts');
  run('npx tsx scripts/run-production-build.ts');
  console.log('[cf-opennext-prep] done');
}

main();