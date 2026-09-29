import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { getEventSlug, type Web3Event } from '../../src/lib/events';
import { queueEventMirror, type EventMirrorQueue } from './telegram-event-mirror';
import { eventStatePaths, persistEventState, readEventState, writeEventState, type EventDeliveries, type EventIdentity, type EventPersistenceOptions } from '../social/telegram-event-state';
import { assertUnsentSlot, type postingSlot } from '../social/posting-slot.mjs';

const normalize = (value: string) => value.normalize('NFKC').toLowerCase().trim();

export function eventIdentity(event: Web3Event): EventIdentity {
  let day = event.startDate.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(event.startDate)) {
    try { day = new Date(event.startDate).toLocaleDateString('en-CA', { timeZone: event.timezone || 'UTC' }); } catch {}
  }
  const slug = getEventSlug(event);
  const keys = [event.id, ...(event.aliases || []), `page:${slug}:${day}`].map(normalize);
  if (event.sourceVerification?.eventId) keys.push(`luma:${normalize(event.sourceVerification.eventId)}`);
  for (const raw of [event.url, event.registrationUrl, event.website]) {
    try {
      const url = new URL(raw || '');
      url.hostname = url.hostname.replace(/^www\./, '').replace(/^lu\.ma$/, 'luma.com');
      url.hash = '';
      for (const key of [...url.searchParams.keys()]) if (/^utm_|^(ref|referrer)$/i.test(key)) url.searchParams.delete(key);
      url.searchParams.sort();
      if (url.pathname === '/') continue;
      keys.push(url.hostname === 'luma.com' ? `luma-url:${url.pathname.toLowerCase().replace(/\/$/, '')}`
        : `url:${url.hostname}${url.pathname.replace(/\/$/, '')}${url.search}:${day}`);
    } catch {}
  }
  const title = normalize(event.name).replace(/[^\p{L}\p{N}]/gu, '');
  if (title) keys.push(`event:${title}:${day}:${normalize(event.city || '')}`);
  return { id: event.id, slug, name: event.name, startDate: event.startDate, keys: [...new Set(keys)] };
}

export function selectUnpostedEvents(events: Web3Event[], history: string[], ledger: EventDeliveries = {}, limit = 3): Web3Event[] {
  const seen = new Set(history.map(normalize));
  for (const receipt of Object.values(ledger)) if (receipt.status !== 'rejected') for (const event of receipt.events) event.keys.forEach(key => seen.add(normalize(key)));
  const selected: Web3Event[] = [];
  for (const event of events) {
    const identity = eventIdentity(event);
    if (identity.keys.some(key => seen.has(key))) continue;
    selected.push(event);
    identity.keys.forEach(key => seen.add(key));
    if (selected.length >= limit) break;
  }
  return selected;
}

export function assertEventDeliveryAvailable(events: Web3Event[], history: string[], ledger: EventDeliveries, last?: { postedAt: string }, force = false, now = Date.now()) {
  if (Object.values(ledger).some(entry => entry.status === 'reserved')) throw new Error('Unconfirmed Telegram event delivery requires review before another send');
  if (!force && last && now - Date.parse(last.postedAt) < 4 * 60 * 60 * 1000) throw new Error('Events digest is still on cooldown');
  if (selectUnpostedEvents(events, history, ledger, events.length).length !== events.length) throw new Error('Telegram event was already posted or reserved by another run');
}

export async function deliverEventsOnce({ events, chatId, threadId, mirrorChannelId, send, cwd = process.cwd(), force = false, persist = persistEventState, slot = null }: {
  events: Web3Event[]; chatId: string; threadId: number; mirrorChannelId?: string; cwd?: string; force?: boolean;
  send: () => Promise<{ ok?: boolean; result?: { message_id?: number } }>;
  persist?: (options?: EventPersistenceOptions) => void;
  slot?: ReturnType<typeof postingSlot> | null;
}) {
  if (!events.length) return;
  const files = eventStatePaths(chatId, cwd);
  const history = readEventState<string[]>(files.posted, []);
  const ledger = readEventState<EventDeliveries>(files.deliveries, {});
  assertUnsentSlot(ledger, slot);
  assertEventDeliveryAvailable(events, history, ledger, readEventState(files.last, undefined), force || Boolean(slot));
  const id = randomUUID();
  const receipt = { status: 'reserved' as const, reservedAt: new Date().toISOString(), chatId, threadId, events: events.map(eventIdentity), ...(slot ? { slotKey: slot.key } : {}) };
  ledger[id] = receipt;
  writeEventState(files.deliveries, ledger);
  try {
    persist({ cwd, validateRemote: remote => {
      const remoteLedger = (remote.get(path.basename(files.deliveries)) || {}) as EventDeliveries;
      assertUnsentSlot(remoteLedger, slot);
      assertEventDeliveryAvailable(events, (remote.get(path.basename(files.posted)) || []) as string[], remoteLedger,
        remote.get(path.basename(files.last)) as { postedAt: string } | undefined, force || Boolean(slot));
    } });
  } catch (error) {
    delete ledger[id];
    writeEventState(files.deliveries, ledger);
    throw error;
  }
  const result = await send();
  const confirmed = readEventState<EventDeliveries>(files.deliveries, {});
  if (result?.ok === false) {
    confirmed[id] = { ...receipt, status: 'rejected' };
    writeEventState(files.deliveries, confirmed);
    persist({ cwd });
    throw new Error('Telegram rejected the event digest; no delivery was recorded');
  }
  const messageId = result?.result?.message_id;
  if (result?.ok !== true || !Number.isInteger(messageId) || messageId! <= 0) throw new Error('Telegram event delivery has no valid receipt; reservation retained for review');
  const sentAt = new Date().toISOString();
  confirmed[id] = { ...receipt, status: 'sent', messageId, sentAt };
  writeEventState(files.deliveries, confirmed);
  writeEventState(files.posted, [...new Set([...readEventState<string[]>(files.posted, []), ...receipt.events.flatMap(event => event.keys)])]);
  writeEventState(files.last, { postedAt: sentAt });
  if (mirrorChannelId) {
    const mirrors = readEventState<EventMirrorQueue>(files.mirrors, {});
    queueEventMirror(mirrors, chatId, messageId!, mirrorChannelId);
    writeEventState(files.mirrors, mirrors);
  }
  console.log(`Telegram accepted ${events.length} events; message ID ${messageId}; slugs: ${receipt.events.map(event => event.slug).join(', ')}.`);
  persist({ cwd });
  return result;
}
