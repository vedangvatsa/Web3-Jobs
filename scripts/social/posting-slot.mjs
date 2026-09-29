export const SLOT_MINUTES_UTC = { morning: 210, afternoon: 690, evening: 1170 };
export const POSTING_WINDOW_MS = 60 * 60 * 1000;

export function postingSlot(slot, date) {
  if (!Object.hasOwn(SLOT_MINUTES_UTC, slot) || !/^\d{4}-\d{2}-\d{2}$/.test(date || '')) throw new Error('Invalid posting slot/date');
  const start = Date.parse(`${date}T00:00:00Z`) + SLOT_MINUTES_UTC[slot] * 60000;
  if (!Number.isFinite(start) || new Date(start).toISOString().slice(0, 10) !== date) throw new Error('Invalid posting date');
  return { key: `${date}:${slot}`, slot, date, start, end: start + POSTING_WINDOW_MS };
}

export function postingSlotFromEnv(env = process.env) {
  if (!env.TELEGRAM_PUBLISH_SLOT && !env.TELEGRAM_PUBLISH_DATE) return null;
  return postingSlot(env.TELEGRAM_PUBLISH_SLOT, env.TELEGRAM_PUBLISH_DATE);
}

export function isPostingWindow(slot, now = Date.now()) {
  return !slot || (now >= slot.start && now < slot.end);
}

export function assertPostingWindow(slot, now = Date.now()) {
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
