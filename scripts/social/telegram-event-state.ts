import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { persistTelegramState } from './telegram-news-state.mjs';
import type { EventMirrorEntry } from '../lib/telegram-event-mirror';

export type EventIdentity = { id: string; slug: string; name: string; startDate: string; keys: string[] };
export type EventDelivery = {
  status: 'reserved' | 'sent' | 'rejected';
  reservedAt: string;
  chatId: string;
  threadId: number;
  events: EventIdentity[];
  messageId?: number;
  sentAt?: string;
};
export type EventDeliveries = Record<string, EventDelivery>;
export type EventPersistenceOptions = { cwd?: string; syncOnly?: boolean; attempts?: number; validateRemote?: (remote: Map<string, unknown>) => void };

const pattern = /^\.telegram-events-(?:posted|last|deliveries|mirrors)-[a-zA-Z0-9]+\.json$/;
const record = (value: unknown): value is Record<string, unknown> => Boolean(value && typeof value === 'object' && !Array.isArray(value));
const strings = (value: unknown): value is string[] => Array.isArray(value) && value.every(item => typeof item === 'string');
const positiveId = (value: unknown) => Number.isInteger(value) && Number(value) > 0;
const timestamp = (value: unknown) => typeof value === 'string' && Number.isFinite(Date.parse(value));

export function mergeEventState(name: string, local: unknown, remote: unknown): unknown {
  if (!pattern.test(name)) throw new Error(`Unexpected event state file: ${name}`);
  for (const value of [local, remote]) {
    if (value === undefined) continue;
    if (name.includes('-posted-')) {
      if (!strings(value)) throw new Error(`Invalid event history: ${name}`);
    } else if (name.includes('-last-')) {
      if (!record(value) || !timestamp(value.postedAt)) throw new Error(`Invalid event cooldown: ${name}`);
    } else {
      if (!record(value)) throw new Error(`Invalid event ledger: ${name}`);
      for (const entry of Object.values(value)) {
        if (!record(entry)) throw new Error(`Invalid event receipt: ${name}`);
        if (name.includes('-deliveries-')) {
          if (!['reserved', 'sent', 'rejected'].includes(String(entry.status)) || !timestamp(entry.reservedAt)
            || typeof entry.chatId !== 'string' || !positiveId(entry.threadId)
            || !Array.isArray(entry.events) || !entry.events.length
            || entry.events.some(event => !record(event) || !strings(event.keys) || !event.keys.length)
            || (entry.status === 'sent' && (!positiveId(entry.messageId) || !timestamp(entry.sentAt)))) throw new Error(`Invalid event receipt: ${name}`);
        } else if (typeof entry.fromChatId !== 'string' || !positiveId(entry.sourceMessageId) || typeof entry.destination !== 'string'
          || (entry.deliveredMessageId !== undefined && !positiveId(entry.deliveredMessageId))
          || (entry.status === 'sent' && !positiveId(entry.deliveredMessageId))
          || (entry.status !== undefined && !['pending', 'reserved', 'rejected', 'sent'].includes(String(entry.status)))
          || (entry.attempts !== undefined && (!Number.isInteger(entry.attempts) || Number(entry.attempts) < 0))) throw new Error(`Invalid event mirror: ${name}`);
      }
    }
  }
  if (name.includes('-posted-')) return [...new Set([...(remote as string[] || []), ...(local as string[] || [])])];
  if (!local) return remote;
  if (!remote) return local;
  if (name.includes('-last-')) {
    const left = local as { postedAt: string }, right = remote as { postedAt: string };
    return Date.parse(left.postedAt) > Date.parse(right.postedAt) ? left : right;
  }
  const merged = { ...(remote as Record<string, unknown>), ...(local as Record<string, unknown>) };
  for (const [id, right] of Object.entries(remote as Record<string, EventDelivery & EventMirrorEntry>)) {
    const left = (local as Record<string, EventDelivery & EventMirrorEntry>)[id];
    if (!left || right.status === 'sent' || right.deliveredMessageId) { merged[id] = right; continue; }
    if (left.status === 'sent' || left.deliveredMessageId) continue;
    const phase = (entry: { status?: string }) => entry.status === 'rejected' ? 2 : entry.status === 'reserved' ? 1 : 0;
    if ((right.attempts || 0) > (left.attempts || 0)
      || ((right.attempts || 0) === (left.attempts || 0) && phase(right) > phase(left))) merged[id] = right;
  }
  return merged;
}

export function readEventState<T>(file: string, fallback: T): T {
  try { return mergeEventState(path.basename(file), JSON.parse(fs.readFileSync(file, 'utf8')), undefined) as T; }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return fallback;
    throw new Error(`Cannot read Telegram event state: ${path.basename(file)}`);
  }
}

export function writeEventState(file: string, value: unknown): void {
  mergeEventState(path.basename(file), value, undefined);
  fs.writeFileSync(`${file}.tmp`, JSON.stringify(value, null, 2) + '\n');
  fs.renameSync(`${file}.tmp`, file);
}

export function persistEventState(options: EventPersistenceOptions = {}): void {
  persistTelegramState({ ...options, pattern, mergeState: mergeEventState, kind: 'events' });
}

export function eventStatePaths(chatId: string, cwd = process.cwd()) {
  const destination = chatId.replace(/[^a-zA-Z0-9]/g, '');
  if (!destination) throw new Error('Missing Telegram events destination');
  const file = (kind: string) => path.join(cwd, `.telegram-events-${kind}-${destination}.json`);
  return { posted: file('posted'), last: file('last'), deliveries: file('deliveries'), mirrors: file('mirrors') };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  persistEventState({ syncOnly: process.argv.includes('--sync') });
}
