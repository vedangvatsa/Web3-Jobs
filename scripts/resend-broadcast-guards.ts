/**
 * Shared guards for daily job-alert Resend broadcasts (duplicate send prevention).
 */

import fs from 'fs';

export const RESEND_GENERAL_SEGMENT_ID = '2db4b31c-7b5b-46b9-b2b1-98ae142d289b';

export type ResendBroadcastRow = {
  id: string;
  name?: string;
  status?: string;
  sent_at?: string | null;
};

export type LastBroadcastSend = { dateUtc: string; broadcastId?: string; at?: string };

const LAST_SEND_FILE = new URL('../.resend-broadcast-last.json', import.meta.url).pathname;

export function utcDateKey(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

export function jobAlertsBroadcastName(dateUtc = utcDateKey()): string {
  return `job-alerts ${dateUtc}`;
}

export function loadLastBroadcastSend(): LastBroadcastSend | null {
  try {
    const parsed = JSON.parse(fs.readFileSync(LAST_SEND_FILE, 'utf8')) as LastBroadcastSend;
    if (parsed?.dateUtc) return parsed;
  } catch {
    /* no prior send recorded */
  }
  return null;
}

export function saveLastBroadcastSend(broadcastId: string): void {
  const record: LastBroadcastSend = {
    dateUtc: utcDateKey(),
    broadcastId,
    at: new Date().toISOString(),
  };
  fs.writeFileSync(LAST_SEND_FILE, `${JSON.stringify(record)}\n`);
}

const ACTIVE_BROADCAST_STATUSES = new Set(['sent', 'queued', 'scheduled', 'pending']);

export function isJobAlertsBroadcastForDate(row: ResendBroadcastRow, dateUtc: string): boolean {
  const name = row.name?.trim() ?? '';
  return name === jobAlertsBroadcastName(dateUtc) || name.startsWith(`job-alerts ${dateUtc}`);
}

export async function listRecentBroadcasts(resendKey: string, limit = 50): Promise<ResendBroadcastRow[]> {
  const res = await fetch(`https://api.resend.com/broadcasts?limit=${limit}`, {
    headers: { Authorization: `Bearer ${resendKey}` },
  });
  if (!res.ok) {
    throw new Error(`broadcasts list failed: ${res.status} ${await res.text()}`);
  }
  const json = (await res.json()) as { data?: ResendBroadcastRow[] };
  return json.data ?? [];
}

/** Live sends for this UTC day that should block another create(). */
export async function findActiveJobAlertsBroadcasts(
  resendKey: string,
  dateUtc = utcDateKey(),
): Promise<ResendBroadcastRow[]> {
  const rows = await listRecentBroadcasts(resendKey);
  return rows.filter((row) => {
    if (!isJobAlertsBroadcastForDate(row, dateUtc)) return false;
    const status = (row.status ?? '').toLowerCase();
    return ACTIVE_BROADCAST_STATUSES.has(status);
  });
}

export async function cancelQueuedBroadcast(resendKey: string, broadcastId: string): Promise<void> {
  const res = await fetch(`https://api.resend.com/broadcasts/${encodeURIComponent(broadcastId)}/cancel`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`broadcast cancel failed (${broadcastId}): ${res.status} ${body}`);
  }
}

/**
 * Paginated subscribed contact count in a segment (for preflight).
 * Stops early once stopAt is reached: a full 150k-contact walk takes
 * ~15 min and risks the job timeout; the gate only needs to know the
 * segment is healthy, not its exact size.
 */
export async function countSegmentContacts(
  resendKey: string,
  segmentId: string,
  maxPages = 3000,
  stopAt = Infinity,
): Promise<number> {
  let after: string | undefined;
  let total = 0;
  for (let page = 0; page < maxPages; page++) {
    const url = new URL(`https://api.resend.com/segments/${encodeURIComponent(segmentId)}/contacts`);
    url.searchParams.set('limit', '100');
    if (after) url.searchParams.set('after', after);
    const res = await fetch(url, { headers: { Authorization: `Bearer ${resendKey}` } });
    if (!res.ok) {
      throw new Error(`segment contacts failed: ${res.status} ${await res.text()}`);
    }
    const json = (await res.json()) as {
      data?: Array<{ id: string; unsubscribed?: boolean }>;
      has_more?: boolean;
    };
    const batch = json.data ?? [];
    total += batch.filter((c) => !c.unsubscribed).length;
    if (total >= stopAt) return total;
    if (!batch.length || !json.has_more) return total;
    after = batch[batch.length - 1]?.id;
    if (!after) return total;
  }
  return total;
}

export function minSegmentContactsThreshold(): number {
  const raw = process.env.RESEND_MIN_SEGMENT_CONTACTS?.trim();
  if (raw) {
    const n = Number(raw);
    if (Number.isFinite(n) && n > 0) return Math.floor(n);
  }
  return 50_000;
}
