#!/usr/bin/env node
/**
 * Fail when package.json and package-lock.json drift (npm ci would fail in CI).
 * Run after any dependency change: `npm install`, then `npm run check:lockfile`.
 */
import { execSync } from 'node:child_process';

function gitLines(command) {
  try {
    return execSync(command, { encoding: 'utf8' })
      .trim()
      .split('\n')
      .filter(Boolean);
  } catch {
    return [];
  }
}

/** Staged package.json without a staged lockfile is the usual drift source. */
function assertStagedPairing() {
  const staged = gitLines('git diff --cached --name-only');
  if (!staged.length) {
    return;
  }
  const pkg = staged.includes('package.json');
  const lock = staged.includes('package-lock.json');
  if (pkg && !lock) {
    console.error('\npackage.json is staged but package-lock.json is not.');
    console.error('Fix: npm install && git add package-lock.json');
    console.error('Commit both files together whenever dependencies change.\n');
    process.exit(1);
  }
}

function assertNpmCiDryRun() {
  try {
    execSync('npm ci --dry-run --ignore-scripts', { stdio: 'inherit' });
  } catch {
    console.error('\npackage-lock.json is out of sync with package.json.');
    console.error('Fix: npm install && commit package-lock.json');
    console.error('CI uses npm ci and will not run ingest/news/deploy until this passes.\n');
    process.exit(1);
  }
}

assertStagedPairing();
assertNpmCiDryRun();

console.log('package-lock.json is in sync (npm ci --dry-run OK).');