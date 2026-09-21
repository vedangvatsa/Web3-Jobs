#!/usr/bin/env tsx
import { execSync } from 'node:child_process';

function run(cmd: string): void {
  execSync(cmd, { stdio: 'inherit', cwd: process.cwd(), env: process.env });
}

function main(): void {
  if (process.env.OG_PRECOMPUTE === '1') {
    run('npm run precompute:og-incremental');
    return;
  }

  if (process.env.OG_FILL_MISSING === '1') {
    run('npx tsx scripts/precompute-og-images.ts --if-missing');
    if (process.env.FAH_FAST_PREBUILD === '1') {
      console.log('[prebuild-og] FAH_FAST_PREBUILD — skip preview regen (previews in git)');
      return;
    }
    run('npx tsx scripts/precompute-og-previews.ts');
    return;
  }

  console.log('[prebuild-og] skipped (incremental assets from git; CI runs precompute:og-incremental)');
}

main();
