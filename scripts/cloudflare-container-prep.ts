#!/usr/bin/env tsx
import { execSync } from 'node:child_process';

function run(cmd: string): void {
  execSync(cmd, { stdio: 'inherit', cwd: process.cwd(), env: process.env });
}

/** Populate gitignored public/ assets required before run-production-build. */
function main(): void {
  run('npx tsx scripts/sync-public-catalog-assets.ts');
  run('npx tsx scripts/materialize-job-shards-from-runtime.ts');
  run('npx tsx scripts/precompute-og-previews.ts');
  console.log('[cloudflare-container-prep] done');
}

main();