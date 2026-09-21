#!/usr/bin/env tsx
import { execSync } from 'node:child_process';

function run(cmd: string): void {
  execSync(cmd, { stdio: 'inherit', cwd: process.cwd(), env: process.env });
}

function main(): void {
  const fast = process.env.FAH_FAST_PREBUILD === '1';

  if (fast) {
    console.log('[production-build] FAH_FAST_PREBUILD — catalog smoke tests + next build');
    run('npm run test:catalog-recovery');
    run('npm run test:jobs-catalog');
    run('npm run test:company-jobs');
    run('next build');
    return;
  }

  run('npm run test:catalog-recovery');
  run('npm run test:jobs-catalog');
  run('npm run test:company-jobs');
  run('npm run test:detail-formatting');
  run('npm run audit:detail-formatting');
  run('next build');
}

main();
