#!/usr/bin/env tsx
/**
 * Fail postbuild if FAH standalone is missing static assets the UI references.
 */
import fs from 'node:fs';
import path from 'node:path';
import { assertStandalonePublicAssets } from './lib/standalone-public-assets';

const STANDALONE = path.join(process.cwd(), '.next', 'standalone');

function main(): void {
  if (!fs.existsSync(STANDALONE)) {
    console.log('[test-standalone-public-assets] no .next/standalone — skip');
    return;
  }
  assertStandalonePublicAssets(process.cwd(), STANDALONE);
  console.log('[test-standalone-public-assets] ok');
}

main();
