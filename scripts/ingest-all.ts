#!/usr/bin/env node
/**
 * Master unified ingestion script:
 * Runs all specialized ingestion modules concurrently or in controlled sequence,
 * then pre-bakes all slugs in one fast step.
 */

import { execSync } from 'child_process';

const steps = [
  { name: 'Mercuryo BambooHR', cmd: 'npx tsx scripts/ingest-mercuryo-bamboo.ts' },
  { name: 'CoinDCX Official', cmd: 'npx tsx scripts/ingest-coindcx-official.ts' },
  { name: 'Regional ATS Feeds', cmd: 'npx tsx scripts/ingest-regional-feeds.ts' },
  { name: 'Global Ecosystem Feeds', cmd: 'npx tsx scripts/ingest-global-ecosystem-feeds.ts' },
  { name: 'Untracked Web3 & AI Feeds', cmd: 'npx tsx scripts/ingest-untracked-web3-companies.ts' },
  { name: 'Prebake Slugs', cmd: 'node scripts/prebake_slugs.js' },
];

console.log('🚀 Starting unified job ingestion pipeline...');
const startTime = Date.now();

for (const step of steps) {
  console.log(`\n⏳ [Pipeline] Running: ${step.name}...`);
  try {
    execSync(step.cmd, { stdio: 'inherit' });
  } catch (err) {
    console.error(`⚠️ [Pipeline] Warning: ${step.name} failed or had errors:`, err.message);
  }
}

const duration = ((Date.now() - startTime) / 1000).toFixed(1);
console.log(`\n✨ Unified ingestion pipeline finished in ${duration}s!`);
