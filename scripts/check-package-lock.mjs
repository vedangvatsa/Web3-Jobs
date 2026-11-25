#!/usr/bin/env node
/**
 * Fail when package.json and package-lock.json drift (npm ci would fail in CI).
 * Run after any dependency change: `npm install`, then `npm run check:lockfile`.
 */
import { execSync } from 'node:child_process';

try {
  execSync('npm ci --dry-run --ignore-scripts', { stdio: 'inherit' });
} catch {
  console.error('\npackage-lock.json is out of sync with package.json.');
  console.error('Fix: npm install && commit package-lock.json');
  console.error('CI uses npm ci and will not run ingest/news/deploy until this passes.\n');
  process.exit(1);
}

console.log('package-lock.json is in sync (npm ci --dry-run OK).');