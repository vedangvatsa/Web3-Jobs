#!/usr/bin/env tsx
/**
 * Cancel duplicate job-alert broadcasts (draft / queued only).
 * Never cancels the canonical broadcast id in .resend-broadcast-last.json.
 *
 * Usage: RESEND_API_KEY=... npx tsx scripts/cancel-queued-resend-broadcasts.ts [--dry-run]
 */

import { Resend } from 'resend';
import {
  cancelQueuedBroadcast,
  isJobAlertsBroadcastForDate,
  jobAlertsBroadcastName,
  listRecentBroadcasts,
  loadLastBroadcastSend,
  utcDateKey,
} from './resend-broadcast-guards';

const dryRun = process.argv.includes('--dry-run');
const apiKey = process.env.RESEND_API_KEY;
if (!apiKey) {
  console.error('Missing RESEND_API_KEY');
  process.exit(1);
}

const resend = new Resend(apiKey);

async function main(): Promise<void> {
  const today = utcDateKey();
  const protectedId = loadLastBroadcastSend()?.broadcastId;
  const rows = await listRecentBroadcasts(apiKey, 30);

  const candidates = rows.filter((b) => {
    if (!isJobAlertsBroadcastForDate(b, today)) return false;
    if (protectedId && b.id === protectedId) return false;
    const s = (b.status || '').toLowerCase();
    return s === 'queued' || s === 'pending' || s === 'draft';
  });

  if (!protectedId) {
    console.warn(
      `No broadcast id in .resend-broadcast-last.json for ${today} — refusing to cancel queued sends. ` +
        `Record today's send first (name: ${jobAlertsBroadcastName(today)}).`,
    );
    process.exit(1);
  }

  if (!candidates.length) {
    console.log(`No duplicate job-alerts broadcasts to clean (protected ${protectedId}).`);
    return;
  }

  for (const b of candidates) {
    const s = (b.status || '').toLowerCase();
    console.log(
      `${dryRun ? '[dry-run] would clean' : 'Cleaning'} duplicate ${b.id} (${s}) ${b.name || ''} — protected ${protectedId}`,
    );
    if (dryRun) continue;

    if (s === 'draft') {
      const removed = await resend.broadcasts.remove(b.id);
      if (removed.error) console.error('  remove failed:', removed.error);
      continue;
    }

    try {
      await cancelQueuedBroadcast(apiKey, b.id);
    } catch (e) {
      console.error('  cancel failed:', (e as Error).message);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
