/**
 * One-time / catch-up: add all subscribed global contacts to a Resend segment.
 * Broadcasts only deliver to segment members (not legacy audience_id lists).
 *
 * Usage:
 *   npx tsx scripts/sync-resend-broadcast-segment.ts [--limit N] [--concurrency 25]
 * Env: RESEND_API_KEY, RESEND_SEGMENT_ID (default: General segment)
 */

import fs from 'fs';
import { pathToFileURL } from 'url';
import { Resend } from 'resend';
import { RESEND_GENERAL_SEGMENT_ID } from './resend-broadcast-guards';

const args = process.argv.slice(2);
const limitIdx = args.indexOf('--limit');
const maxContacts = limitIdx > -1 ? Math.max(1, Number(args[limitIdx + 1]) || 0) : 0;
const concIdx = args.indexOf('--concurrency');
const concurrency = concIdx > -1 ? Math.min(30, Math.max(1, Number(args[concIdx + 1]) || 10)) : 10;

const segmentId =
  process.env.RESEND_SEGMENT_ID?.trim() ||
  process.env.RESEND_AUDIENCE_ID?.trim() ||
  RESEND_GENERAL_SEGMENT_ID;

const STATE_FILE = new URL('../.resend-segment-sync.json', import.meta.url).pathname;

type SyncState = { after?: string; added: number; skipped: number; errors: number };

function loadState(): SyncState {
  try {
    const raw = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')) as SyncState;
    return {
      after: raw.after,
      added: raw.added ?? 0,
      skipped: raw.skipped ?? 0,
      errors: raw.errors ?? 0,
    };
  } catch {
    return { added: 0, skipped: 0, errors: 0 };
  }
}

function saveState(state: SyncState) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}

async function addToSegment(resend: Resend, contactId: string): Promise<'added' | 'skipped'> {
  for (let attempt = 0; attempt < 8; attempt++) {
    const result = await resend.contacts.segments.add({ contactId, segmentId });
    if (!result.error) return 'added';
    const msg = String(result.error.message ?? result.error);
    if (/already|duplicate|exists/i.test(msg)) return 'skipped';
    if (/rate|too many|429/i.test(msg) && attempt < 7) {
      await sleep(1000 * (attempt + 1));
      continue;
    }
    throw new Error(msg);
  }
  return 'skipped';
}

async function mapPool<T, R>(
  items: T[],
  worker: (item: T) => Promise<R>,
  poolSize: number,
): Promise<R[]> {
  const results: R[] = [];
  let i = 0;
  async function run() {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await worker(items[idx]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(poolSize, items.length) }, () => run()));
  return results;
}

export async function syncResendBroadcastSegment(): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY missing');
    process.exit(1);
  }

  const resend = new Resend(apiKey);
  const state = loadState();
  let after = state.after;
  let processed = 0;

  console.log(
    `Sync contacts → segment ${segmentId} (concurrency ${concurrency}${maxContacts ? `, limit ${maxContacts}` : ''})`,
  );
  if (after) console.log(`Resuming after contact ${after}`);

  for (let page = 0; page < 5000; page++) {
    const listed = await resend.contacts.list({ limit: 100, after });
    if (listed.error) throw listed.error;
    const batch = listed.data?.data ?? [];
    if (!batch.length) break;

    let targets = batch.filter((c) => !c.unsubscribed);
    if (maxContacts) {
      const remaining = maxContacts - processed;
      if (remaining <= 0) break;
      targets = targets.slice(0, remaining);
    }
    await mapPool(
      targets,
      async (c) => {
        try {
          const status = await addToSegment(resend, c.id);
          if (status === 'added') state.added++;
          else state.skipped++;
          return true;
        } catch (e) {
          state.errors++;
          if (state.errors <= 3) console.error('add failed:', c.email, (e as Error).message);
          return false;
        }
      },
      concurrency,
    );
    processed += targets.length;
    after = batch.at(-1)?.id;
    state.after = after;
    saveState(state);

    console.log(
      `Page ${page + 1}: +${targets.length} subscribed, added ${state.added}, skipped ${state.skipped}, errors ${state.errors}`,
    );

    if (maxContacts && processed >= maxContacts) break;
    if (!listed.data?.has_more) break;
  }

  console.log(
    `Done. Added ${state.added}, skipped ${state.skipped}, errors ${state.errors}. Cursor: ${state.after ?? 'none'}`,
  );
}

const isMain = import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  syncResendBroadcastSegment().catch((e) => {
    console.error(e?.message || e);
    process.exit(1);
  });
}
