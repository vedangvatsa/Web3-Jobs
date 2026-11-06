#!/usr/bin/env tsx
import { execSync } from 'node:child_process';

function run(cmd: string): void {
  execSync(cmd, { stdio: 'inherit', cwd: process.cwd(), env: process.env });
}

function main(): void {
  const fast = process.env.FAH_FAST_PREBUILD === '1';

  if (fast) {
    console.log('[production-build] FAH_FAST_PREBUILD — catalog smoke tests + next build');
    run('npx tsx scripts/generate-articles-index.ts');
    run('npx tsx scripts/generate-latest-articles.ts');
    run('npx tsx scripts/generate-articles-data.ts');
    run('npx tsx scripts/generate-slug-types.ts');
    run('npx tsx scripts/precompute-companies-runtime.ts');
    run('npm run test:catalog-recovery');
    run('npm run test:jobs-catalog');
    run('npm run test:company-jobs');
    run('next build');
    run('tsx scripts/copy-standalone-catalogs.ts');
    run('tsx scripts/test-standalone-public-assets.ts');
    return;
  }

  run('npm run test:catalog-recovery');
  run('npm run test:jobs-catalog');
  run('npm run test:company-jobs');
  run('npm run test:detail-formatting');
  // The full prebuild gate already audits every job and event description.
  run('next build');
  run('tsx scripts/copy-standalone-catalogs.ts');
  run('tsx scripts/test-standalone-public-assets.ts');
}

main();
