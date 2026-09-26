export const EVENTS_REPLY_MARKUP = {
  inline_keyboard: [[{ text: 'More Events', url: 'https://hashtagweb3.com/events/tg' }]],
};

export interface EventMirrorEntry {
  fromChatId: string;
  sourceMessageId: number;
  destination: string;
  deliveredMessageId?: number;
}

export type EventMirrorQueue = Record<string, EventMirrorEntry>;

export function queueEventMirror(queue: EventMirrorQueue, fromChatId: string, sourceMessageId: number, destination: string): void {
  if (!Number.isInteger(sourceMessageId) || sourceMessageId <= 0) throw new Error('Invalid Telegram source message ID');
  if (fromChatId === destination) throw new Error('Event mirror must have a different destination');
  const key = `${fromChatId}:${sourceMessageId}:${destination}`;
  queue[key] ||= { fromChatId, sourceMessageId, destination };
}

export async function deliverEventMirrors(
  queue: EventMirrorQueue,
  token: string,
  save: () => void,
  request: typeof fetch = fetch,
): Promise<string[]> {
  const failures: string[] = [];
  for (const entry of Object.values(queue)) {
    if (entry.deliveredMessageId) continue;
    try {
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
      if (!response.ok || !result.ok || !Number.isInteger(id) || id! <= 0) throw new Error(result.description || `HTTP ${response.status}, missing message receipt`);
      entry.deliveredMessageId = id;
      save();
      console.log(`Mirrored events to ${entry.destination}; message ID ${id}.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Request failed';
      failures.push(`${entry.destination}: ${message.replaceAll(token, '[redacted]')}`);
    }
  }
  return failures;
}
