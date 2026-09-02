#!/usr/bin/env node

/**
 * One-time script to deduplicate subscribers in Firestore.
 * 
 * The current saveEmail() uses email-as-doc-ID (correct), but old entries
 * used auto-generated IDs, causing duplicates. This script:
 * 1. Groups all docs by normalized email
 * 2. For each email, keeps the doc with the email-as-ID (or the oldest)
 * 3. Deletes the rest
 *
 * Usage:
 *   node scripts/dedup-subscribers.mjs              # Dry run (default)
 *   node scripts/dedup-subscribers.mjs --execute     # Actually delete dupes
 */

import { execSync } from 'child_process';

const EXECUTE = process.argv.includes('--execute');
const PROJECT = 'web3-job-board-aggregator';

const token = execSync('gcloud auth print-access-token', { encoding: 'utf8' }).trim();

async function fetchAllSubscribers() {
  const docs = [];
  let pageToken = '';

  while (true) {
    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents/subscribers?pageSize=1000${pageToken ? '&pageToken=' + pageToken : ''}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (data.documents) docs.push(...data.documents);
    if (!data.nextPageToken) break;
    pageToken = data.nextPageToken;
  }

  return docs;
}

async function deleteDoc(docName) {
  const url = `https://firestore.googleapis.com/v1/${docName}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.ok;
}

async function main() {
  console.log(`Mode: ${EXECUTE ? '🔴 EXECUTE (will delete)' : '🟢 DRY RUN'}`);
  console.log('');

  const docs = await fetchAllSubscribers();
  console.log(`Total documents: ${docs.length}`);

  // Group by normalized email
  const byEmail = new Map();
  for (const doc of docs) {
    const email = (doc.fields?.email?.stringValue || '').toLowerCase().trim();
    if (!email) continue;
    if (!byEmail.has(email)) byEmail.set(email, []);
    byEmail.get(email).push(doc);
  }

  console.log(`Unique emails: ${byEmail.size}`);
  console.log('');

  let toDelete = 0;
  let deleted = 0;

  for (const [email, emailDocs] of byEmail) {
    if (emailDocs.length <= 1) continue;

    // Prefer the doc whose ID matches the email (the canonical format)
    const canonical = emailDocs.find(d => d.name.endsWith(`/${email}`));
    const keep = canonical || emailDocs[0];
    const dupes = emailDocs.filter(d => d !== keep);

    console.log(`${email}: ${emailDocs.length} docs, keeping ${keep.name.split('/').pop()}, deleting ${dupes.length}`);
    toDelete += dupes.length;

    if (EXECUTE) {
      for (const dupe of dupes) {
        const ok = await deleteDoc(dupe.name);
        if (ok) deleted++;
        else console.error(`  Failed to delete: ${dupe.name}`);
      }
    }
  }

  console.log('');
  console.log(`Documents to delete: ${toDelete}`);
  if (EXECUTE) {
    console.log(`Actually deleted: ${deleted}`);
  } else {
    console.log('Run with --execute to actually delete duplicates.');
  }
}

main().catch(e => { console.error(e); process.exit(1); });
