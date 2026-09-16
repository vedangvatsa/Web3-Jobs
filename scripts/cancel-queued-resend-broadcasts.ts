#!/usr/bin/env tsx
/**
 * Delete Resend broadcasts still in queued/draft state (stops accidental duplicate sends).
 * Usage: RESEND_API_KEY=... npx tsx scripts/cancel-queued-resend-broadcasts.ts [--dry-run]
 */

import { Resend } from 'resend';

const dryRun = process.argv.includes('--dry-run');
const apiKey = process.env.RESEND_API_KEY;
if (!apiKey) {
  console.error('Missing RESEND_API_KEY');
  process.exit(1);
}

const resend = new Resend(apiKey);

async function main(): Promise<void> {
  const list = await resend.broadcasts.list({ limit: 20 });
  if (list.error) {
    console.error('List failed:', list.error);
    process.exit(1);
  }
  const rows = (list.data as { data?: Array<{ id: string; name?: string; status?: string }> })?.data ?? [];
  const today = new Date().toISOString().slice(0, 10);
  const queued = rows.filter((b) => {
    const s = (b.status || '').toLowerCase();
    if (s === 'queued' || s === 'pending') return true;
    if (s === 'draft' && b.name?.includes(`job-alerts ${today}`)) return true;
    return false;
  });
  if (!queued.length) {
    console.log('No queued/draft broadcasts to cancel.');
    return;
  }
  for (const b of queued) {
    console.log(`${dryRun ? '[dry-run] would delete' : 'Deleting'} ${b.id} (${b.status}) ${b.name || ''}`);
    if (!dryRun) {
      const removed = await resend.broadcasts.remove(b.id);
      if (removed.error) {
        console.error(`  Failed:`, removed.error);
      }
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
