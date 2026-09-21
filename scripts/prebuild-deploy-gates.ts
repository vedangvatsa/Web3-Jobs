#!/usr/bin/env tsx
import { execSync } from 'node:child_process';

const fast = process.env.FAH_FAST_PREBUILD === '1';

function run(cmd: string): void {
  execSync(cmd, { stdio: 'inherit', cwd: process.cwd(), env: process.env });
}

function fullGates(): void {
  run('npx tsx scripts/test-middleware.ts');
  run('npx tsx scripts/test-popup-root-pages.ts');
  run('npx tsx scripts/test-og-meta-articles.ts');
  run('npx tsx scripts/test-news-dedup.ts');
  run('npx tsx scripts/test-event-page-quality.ts');
  run('npx tsx scripts/test-job-page-content-quality.ts');
  run('npx tsx scripts/test-job-slug-reserved.ts');
  run('npx tsx scripts/check-slug-collisions.ts');
  run('npx tsx scripts/check-sitemap-slugs.ts');
  run('npx tsx scripts/check-event-map-cities.ts');
}

function fastGates(): void {
  console.log('[prebuild-gates] FAH_FAST_PREBUILD — smoke gates only');
  run('npx tsx scripts/test-middleware.ts');
  run('npx tsx scripts/test-popup-root-pages.ts');
  run('npx tsx scripts/test-job-slug-reserved.ts');
  run('npx tsx scripts/check-slug-collisions.ts');
  run('npx tsx scripts/check-sitemap-slugs.ts');
}

function main(): void {
  if (fast) fastGates();
  else fullGates();

  try {
    execSync('npx tsx scripts/generate-latest-articles.ts', { stdio: 'pipe', cwd: process.cwd() });
  } catch {
    // optional
  }
}

main();
