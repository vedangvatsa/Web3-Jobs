#!/usr/bin/env node

/**
 * Self-contained script: writes the manual email list to manual-emails.json,
 * then uploads each email to the 'manual_additions' Firestore collection.
 * 
 * Usage:
 *   node scripts/upload-manual-emails.mjs              # Dry run
 *   node scripts/upload-manual-emails.mjs --execute     # Actually write
 */

import { execSync } from 'child_process';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const EXECUTE = process.argv.includes('--execute');
const PROJECT = 'web3-job-board-aggregator';
const COLLECTION = 'manual_additions';
const CONCURRENCY = 20;

const token = execSync('gcloud auth print-access-token', { encoding: 'utf8' }).trim();

// Read from manual-emails.json
const emailsFile = join(__dirname, 'manual-emails.json');
if (!existsSync(emailsFile)) {
  console.error('❌ scripts/manual-emails.json not found. Create it first.');
  process.exit(1);
}

const rawEmails = JSON.parse(readFileSync(emailsFile, 'utf8'));
const emails = [...new Set(rawEmails.map(e => e.toLowerCase().trim()).filter(Boolean))];

console.log(`Mode: ${EXECUTE ? '🔴 EXECUTE' : '🟢 DRY RUN'}`);
console.log(`Collection: ${COLLECTION}`);
console.log(`Total emails provided: ${rawEmails.length}`);
console.log(`Unique emails: ${emails.length}`);
console.log('');

async function upsertDoc(email) {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents/${COLLECTION}/${encodeURIComponent(email)}`;
  const body = {
    fields: {
      email: { stringValue: email },
      createdAt: { timestampValue: new Date().toISOString() },
      source: { stringValue: 'manual_import' }
    }
  };

  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  return res.ok;
}

async function processBatch(batch) {
  return Promise.all(batch.map(email => upsertDoc(email)));
}

async function main() {
  if (!EXECUTE) {
    console.log(`Would add ${emails.length} emails to '${COLLECTION}' collection.`);
    console.log('Sample (first 10):');
    emails.slice(0, 10).forEach(e => console.log(`  ${e}`));
    console.log('');
    console.log('Run with --execute to actually write to Firestore.');
    return;
  }

  let success = 0;
  let failed = 0;

  for (let i = 0; i < emails.length; i += CONCURRENCY) {
    const batch = emails.slice(i, i + CONCURRENCY);
    const results = await processBatch(batch);
    
    for (const ok of results) {
      if (ok) success++;
      else failed++;
    }

    const progress = Math.min(i + CONCURRENCY, emails.length);
    process.stdout.write(`\rProgress: ${progress}/${emails.length} (success: ${success}, failed: ${failed})`);
  }

  console.log('');
  console.log('');
  console.log('✅ Done!');
  console.log(`Success: ${success}`);
  console.log(`Failed: ${failed}`);
}

main().catch(e => { console.error(e); process.exit(1); });
