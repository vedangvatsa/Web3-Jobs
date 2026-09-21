#!/usr/bin/env tsx
/**
 * Fail postbuild if FAH standalone is missing static assets the UI references.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const STANDALONE = path.join(process.cwd(), '.next', 'standalone');

const REQUIRED = [
  'public/logo/HashtagWeb3.png',
  'public/logo/job/binance.webp',
  'public/logo/companies/google.webp',
  'public/favicon.ico',
  'public/icon.png',
  'public/apple-icon.png',
  'public/events/ethsofia.webp',
  'public/images/demodayonepiece.png',
  'public/images/obortechinterview.jpg',
  'public/images/altlayerrollupday.png',
  'public/og-image.png',
];

function main(): void {
  if (!fs.existsSync(STANDALONE)) {
    console.log('[test-standalone-public-assets] no .next/standalone — skip');
    return;
  }
  for (const rel of REQUIRED) {
    const abs = path.join(STANDALONE, rel);
    assert.ok(fs.existsSync(abs), `standalone missing ${rel} (logos, favicons, and event covers will 404 on FAH)`);
  }
  console.log('[test-standalone-public-assets] ok');
}

main();
