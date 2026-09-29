import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { assertPostingWindow, postingSlotFromEnv } from './posting-slot.mjs';

export async function prepareTelegramSlot(kind, { cwd = process.cwd(), request = fetch, slot = postingSlotFromEnv() } = {}) {
  assertPostingWindow(slot);
  if (!['jobs', 'events', 'news', 'group-news', 'ai-news'].includes(kind)) throw new Error('Unknown Telegram publisher');
  if (!['jobs', 'events'].includes(kind)) return;
  const filename = `${kind}-runtime.json`;
  const response = await request(`https://hashtagweb3.com/data/${filename}`, { headers: { 'cache-control': 'no-cache' }, signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`Published ${kind} catalog: HTTP ${response.status}`);
  const records = await response.json();
  if (!Array.isArray(records) || !records.length || records.some(record => !record || !record.id || !record.slug || typeof record[kind === 'jobs' ? 'title' : 'name'] !== 'string')) throw new Error(`Invalid published ${kind} catalog`);
  fs.writeFileSync(path.join(cwd, 'content', filename), JSON.stringify(records) + '\n');
  console.log(`Using ${records.length} published ${kind} records for Telegram.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  prepareTelegramSlot(process.argv[2]).catch(error => { console.error(error.message); process.exitCode = 1; });
}
