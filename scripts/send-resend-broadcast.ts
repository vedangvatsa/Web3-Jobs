/**
 * send-resend-broadcast.ts — daily job alerts via Resend Broadcasts.
 *
 * Builds the new-jobs email from recent listings and sends it as a
 * Resend broadcast to a segment (default: General). Unsubscribed contacts
 * are excluded by Resend automatically.
 *
 * Usage: npx tsx scripts/send-resend-broadcast.ts [--limit 10] [--dry-run] [--preview] [--force]
 * Env: RESEND_API_KEY (required), RESEND_SEGMENT_ID (default General),
 *      EMAIL_FROM (default "Hashtag Web3 <hi@hashtagweb3.com>")
 *
 * Implementation lives in src/lib/resend-daily.ts.
 * This file is the CLI wrapper for GitHub Actions / npm run send-alerts.
 *
 * Exits nonzero on ANY failure (no silent green runs).
 */

import { runDailyBroadcast } from '@/lib/resend-daily';

const args = process.argv.slice(2);
const limitIdx = args.indexOf('--limit');

async function cli() {
  await runDailyBroadcast({
    jobLimit: limitIdx > -1 ? Math.max(1, Number(args[limitIdx + 1]) || 10) : 10,
    dryRun: args.includes('--dry-run'),
    forceSend: args.includes('--force'),
    preview: args.includes('--preview'),
  });
}

cli().catch((e) => {
  console.error('Fatal:', (e as any)?.message || e);
  process.exit(1);
});
