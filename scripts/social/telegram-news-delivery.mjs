import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { alreadyCovered, normalizeUrl, recentPostedTexts, rememberPostedStory, trimPostedLog } from '../news-story-dedup.mjs';
import { persistNewsState } from './telegram-news-state.mjs';
import { assertUnsentSlot } from './posting-slot.mjs';

export function readNewsState(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return fallback;
    throw new Error(`Cannot read Telegram news history: ${path.basename(file)}`);
  }
}

export function assertUnreserved(stories, history, ledger = {}) {
  const receiptHistory = new Set();
  for (const receipt of Object.values(ledger)) if (receipt.status === 'sent') for (const story of receipt.stories || []) rememberPostedStory(receiptHistory, story);
  const confirmedHistory = [...receiptHistory, ...history];
  const urls = new Set(confirmedHistory.filter(text => /^https?:\/\//i.test(text)).map(normalizeUrl));
  const recent = recentPostedTexts(confirmedHistory);
  if (Object.values(ledger).some(receipt => receipt.status === 'reserved')) {
    throw new Error('Unconfirmed Telegram news delivery requires review before another send');
  }
  for (const story of stories) {
    if (urls.has(normalizeUrl(story.link)) || alreadyCovered(story.originalTitle || story.headline, recent)
      || alreadyCovered(story.headline, recent)) {
      throw new Error('Telegram news story was already posted or reserved by another run');
    }
  }
}

export function uniqueNewsStories(stories) {
  const accepted = [];
  const history = new Set();
  for (const story of stories) {
    if (typeof story.headline !== 'string' || typeof story.summary !== 'string' || !/^https?:\/\//i.test(story.link || '')) continue;
    try {
      assertUnreserved([story], [...history]);
    } catch {
      continue;
    }
    accepted.push(story);
    rememberPostedStory(history, story);
  }
  return accepted;
}

export async function deliverNewsOnce({ stories, postedFile, lastFile, send, persist = persistNewsState, slot = null }) {
  const cwd = path.dirname(postedFile);
  const ledgerFile = postedFile.replace('-posted', '-deliveries');
  const ledger = readNewsState(ledgerFile, {});
  assertUnsentSlot(ledger, slot);
  const history = readNewsState(postedFile, []);
  assertUnreserved(stories, history, ledger);
  const id = randomUUID();
  ledger[id] = { status: 'reserved', reservedAt: new Date().toISOString(), stories, ...(slot ? { slotKey: slot.key } : {}) };
  fs.writeFileSync(postedFile, JSON.stringify(history, null, 2) + '\n');
  fs.writeFileSync(ledgerFile, JSON.stringify(ledger, null, 2) + '\n');
  try {
    persist({ cwd, validateRemote: remote => {
      const remoteLedger = remote.get(path.basename(ledgerFile)) || {};
      assertUnsentSlot(remoteLedger, slot);
      assertUnreserved(stories, remote.get(path.basename(postedFile)) || [], remoteLedger);
    } });
  } catch (error) {
    delete ledger[id];
    fs.writeFileSync(postedFile, JSON.stringify(history, null, 2) + '\n');
    fs.writeFileSync(ledgerFile, JSON.stringify(ledger, null, 2) + '\n');
    throw error;
  }
  const result = await send();
  const confirmed = readNewsState(ledgerFile, {});
  if (result?.ok === false) {
    confirmed[id] = { ...ledger[id], status: 'rejected' };
    fs.writeFileSync(ledgerFile, JSON.stringify(confirmed, null, 2) + '\n');
    persist({ cwd });
    throw new Error('Telegram rejected the news digest; no delivery was recorded');
  }
  if (result?.ok !== true || !Number.isInteger(result.result?.message_id) || result.result.message_id <= 0) {
    throw new Error('Telegram delivery has no valid receipt; reservation retained for review');
  }
  confirmed[id] = { ...ledger[id], status: 'sent', messageId: result.result.message_id, sentAt: new Date().toISOString() };
  fs.writeFileSync(ledgerFile, JSON.stringify(confirmed, null, 2) + '\n');
  const posted = new Set(readNewsState(postedFile, []));
  for (const story of stories) rememberPostedStory(posted, story);
  fs.writeFileSync(postedFile, JSON.stringify(trimPostedLog(posted), null, 2) + '\n');
  fs.writeFileSync(lastFile, JSON.stringify({ postedAt: confirmed[id].sentAt }));
  persist({ cwd });
  return result;
}
