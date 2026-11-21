export const SLOT_MINUTES_UTC = { morning: 210, afternoon: 690, evening: 1170 };
export const SLOT_ORDER = /** @type {const} */ (['morning', 'afternoon', 'evening']);
/** @deprecated Windows now last until the next slot; kept for older imports. */
export const POSTING_WINDOW_MS = 60 * 60 * 1000;

function utcDateOffset(date, days) {
  return new Date(Date.parse(`${date}T00:00:00Z`) + days * 86400000).toISOString().slice(0, 10);
}

function slotStartMs(slot, date) {
  if (!Object.hasOwn(SLOT_MINUTES_UTC, slot) || !/^\d{4}-\d{2}-\d{2}$/.test(date || '')) throw new Error('Invalid posting slot/date');
  const start = Date.parse(`${date}T00:00:00Z`) + SLOT_MINUTES_UTC[slot] * 60000;
  if (!Number.isFinite(start) || new Date(start).toISOString().slice(0, 10) !== date) throw new Error('Invalid posting date');
  return start;
}

/** Exclusive end of a slot: the next slot's start (evening closes at the next day's morning). */
export function nextSlotStart(slot, date) {
  const index = SLOT_ORDER.indexOf(/** @type {(typeof SLOT_ORDER)[number]} */ (slot));
  if (index < 0) throw new Error('Invalid posting slot/date');
  if (index < SLOT_ORDER.length - 1) return slotStartMs(SLOT_ORDER[index + 1], date);
  return slotStartMs('morning', utcDateOffset(date, 1));
}

export function postingSlot(slot, date) {
  const start = slotStartMs(slot, date);
  return { key: `${date}:${slot}`, slot, date, start, end: nextSlotStart(slot, date) };
}

/**
 * UTC date for a named slot at `now`.
 * Late cron that crosses midnight still belongs to yesterday when today's start is ahead.
 */
export function slotDateAt(slot, now = Date.now()) {
  const today = new Date(now).toISOString().slice(0, 10);
  if (now >= slotStartMs(slot, today)) return today;
  return utcDateOffset(today, -1);
}

/**
 * Slot whose window contains `now`. GitHub public-repo cron keeps the original
 * schedule string even when delivered hours late, so scheduled runs must pick
 * the open wall-clock slot instead of trusting the cron label alone.
 */
export function activeSlotAt(now = Date.now()) {
  const today = new Date(now).toISOString().slice(0, 10);
  for (const slot of SLOT_ORDER) {
    const current = postingSlot(slot, today);
    if (now >= current.start && now < current.end) return { slot, date: today, key: current.key };
  }
  const yesterday = utcDateOffset(today, -1);
  const evening = postingSlot('evening', yesterday);
  if (now >= evening.start && now < evening.end) return { slot: 'evening', date: yesterday, key: evening.key };
  throw new Error(`No open posting slot at ${new Date(now).toISOString()}`);
}

export function postingSlotFromEnv(env = process.env) {
  if (!env.TELEGRAM_PUBLISH_SLOT && !env.TELEGRAM_PUBLISH_DATE) return null;
  return postingSlot(env.TELEGRAM_PUBLISH_SLOT, env.TELEGRAM_PUBLISH_DATE);
}

export function isPostingWindow(slot, now = Date.now()) {
  return !slot || (now >= slot.start && now < slot.end);
}

export function assertPostingWindow(slot, now = Date.now()) {
  if (process.env.FORCE_SOCIAL === 'true') return;
  if (!isPostingWindow(slot, now)) throw new Error(`Outside posting window for ${slot.key}; late or early runs must not send`);
}

export function hasSentSlot(ledger, slot, chatId) {
  if (!slot) return false;
  return Object.values(ledger || {}).some(receipt => receipt.status === 'sent'
    && (!chatId || receipt.chatId === chatId)
    && (receipt.slotKey === slot.key || (!receipt.slotKey && Date.parse(receipt.sentAt) >= slot.start && Date.parse(receipt.sentAt) < slot.end)));
}

export function assertUnsentSlot(ledger, slot, chatId, now = Date.now()) {
  assertPostingWindow(slot, now);
  if (hasSentSlot(ledger, slot, chatId)) throw new Error(`Telegram destination already completed slot ${slot.key}`);
}
