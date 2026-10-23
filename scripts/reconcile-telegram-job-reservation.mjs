#!/usr/bin/env node
/**
 * Evidence-based reconciliation of an ambiguous Telegram job reservation.
 *
 * A reservation may only be marked rejected when the recorded evidence shows
 * Telegram was never called for that receipt. Deleting a reserved receipt or
 * replacing it with a fabricated send is forbidden; see TELEGRAM_POSTING.md.
 *
 * Usage:
 *   node scripts/reconcile-telegram-job-reservation.mjs \
 *     --ledger .telegram-jobs-deliveries-web3hiring.json \
 *     --receipt <uuid> \
 *     --evidence <json-file> \
 *     --apply
 *
 * Evidence JSON shape:
 *   {
 *     "runId": "39592405279",
 *     "jobId": "119196560293",
 *     "logLine": "Employer application unverified: ...",
 *     "logUrl": "optional",
 *     "summary": "preflight failed after reservation; process exited before send"
 *   }
 */
import fs from 'node:fs';
import path from 'node:path';
import { readJobsState, writeJobsState, persistJobsState } from './social/telegram-jobs-delivery.mjs';

function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : undefined;
}

const ledgerPath = arg('ledger');
const receiptId = arg('receipt');
const evidencePath = arg('evidence');
const apply = process.argv.includes('--apply');

if (!ledgerPath || !receiptId || !evidencePath) {
  console.error('Required: --ledger <file> --receipt <uuid> --evidence <json>');
  process.exit(1);
}

const absLedger = path.resolve(ledgerPath);
const ledger = readJobsState(absLedger, {});
const receipt = ledger[receiptId];
if (!receipt) {
  console.error(`Receipt ${receiptId} not found in ${absLedger}`);
  process.exit(1);
}
if (receipt.status !== 'reserved') {
  console.error(`Receipt ${receiptId} has status ${receipt.status}; only reserved receipts can be reconciled`);
  process.exit(1);
}

const evidence = JSON.parse(fs.readFileSync(evidencePath, 'utf8'));
for (const key of ['runId', 'jobId', 'logLine', 'summary']) {
  if (typeof evidence[key] !== 'string' || !evidence[key].trim()) {
    console.error(`Evidence missing required field: ${key}`);
    process.exit(1);
  }
}
if ('messageId' in receipt || 'sentAt' in receipt) {
  console.error('Receipt already records a send; refusing to reclassify');
  process.exit(1);
}

console.log('Reconciling reserved receipt:');
console.log(`  receipt:  ${receiptId}`);
console.log(`  chatId:   ${receipt.chatId}`);
console.log(`  slot:     ${receipt.slotKey || '(none)'}`);
console.log(`  reserved: ${receipt.reservedAt}`);
console.log(`  evidence: run ${evidence.runId} job ${evidence.jobId}`);
console.log(`            ${evidence.summary}`);
console.log(`            log: ${evidence.logLine}`);

if (!apply) {
  console.log('\nDry run only. Re-run with --apply to mark rejected and persist.');
  process.exit(0);
}

const reconciledAt = new Date().toISOString();
ledger[receiptId] = {
  ...receipt,
  status: 'rejected',
  rejectedAt: reconciledAt,
  rejectedReason: `reconciled as never-sent: ${evidence.summary}`,
  reconciliation: {
    reconciledAt,
    evidenceRunId: evidence.runId,
    evidenceJobId: evidence.jobId,
    evidenceLogLine: evidence.logLine,
    ...(evidence.logUrl ? { evidenceLogUrl: evidence.logUrl } : {}),
  },
};
writeJobsState(absLedger, ledger);
persistJobsState({ cwd: path.dirname(absLedger) });
console.log(`\nReceipt ${receiptId} marked rejected and persisted to main.`);
