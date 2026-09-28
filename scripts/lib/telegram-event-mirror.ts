export const EVENTS_REPLY_MARKUP = {
  inline_keyboard: [[{ text: 'More Events', url: 'https://hashtagweb3.com/events/tg' }]],
};

export interface EventMirrorEntry {
  fromChatId: string;
  sourceMessageId: number;
  destination: string;
  deliveredMessageId?: number;
  status?: 'pending' | 'reserved' | 'rejected' | 'sent';
  attempts?: number;
  reservedAt?: string;
}

export type EventMirrorQueue = Record<string, EventMirrorEntry>;

export function queueEventMirror(queue: EventMirrorQueue, fromChatId: string, sourceMessageId: number, destination: string): void {
  if (!Number.isInteger(sourceMessageId) || sourceMessageId <= 0) throw new Error('Invalid Telegram source message ID');
  if (fromChatId === destination) throw new Error('Event mirror must have a different destination');
  const key = `${fromChatId}:${sourceMessageId}:${destination}`;
  queue[key] ||= { fromChatId, sourceMessageId, destination, status: 'pending', attempts: 0 };
}

export async function deliverEventMirrors(
  queue: EventMirrorQueue,
  token: string,
  save: (claimKey?: string) => void,
  request: typeof fetch = fetch,
): Promise<string[]> {
  const failures: string[] = [];
  for (const [key, entry] of Object.entries(queue)) {
    if (entry.deliveredMessageId) continue;
    if (entry.status === 'reserved') {
      failures.push(`${entry.destination}: unconfirmed mirror delivery requires review`);
      continue;
    }
    try {
      const previous = { ...entry };
      entry.status = 'reserved';
      entry.attempts = (entry.attempts || 0) + 1;
      entry.reservedAt = new Date().toISOString();
      try { save(key); }
      catch (error) { queue[key] = previous; throw error; }
      const response = await request(`https://api.telegram.org/bot${token}/copyMessage`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(30000),
        body: JSON.stringify({
          chat_id: entry.destination,
          from_chat_id: entry.fromChatId,
          message_id: entry.sourceMessageId,
          reply_markup: EVENTS_REPLY_MARKUP,
        }),
      });
      const result = await response.json() as { ok?: boolean; result?: { message_id?: number }; description?: string };
      const id = result.result?.message_id;
      if (result.ok === false) {
        entry.status = 'rejected';
        save();
        throw new Error(result.description || `HTTP ${response.status}`);
      }
      if (!response.ok || !result.ok || !Number.isInteger(id) || id! <= 0) throw new Error(result.description || `HTTP ${response.status}, missing message receipt`);
      entry.deliveredMessageId = id;
      entry.status = 'sent';
      console.log(`Mirrored events to ${entry.destination}; message ID ${id}.`);
      save();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Request failed';
      failures.push(`${entry.destination}: ${message.replaceAll(token, '[redacted]')}`);
    }
  }
  return failures;
}
