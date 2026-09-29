import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { persistTelegramState } from './telegram-news-state.mjs';
import { assertPostingWindow, assertUnsentSlot, hasSentSlot } from './posting-slot.mjs';

const pattern = /^\.telegram-(?:(?:posted(?:-last)?|job-urls)-[a-zA-Z0-9]+|jobs-deliveries-[a-zA-Z0-9]+)\.json$/;
const object = value => value && typeof value === 'object' && !Array.isArray(value);

export function mergeJobsState(name, local, remote) {
  if (!pattern.test(name)) throw new Error(`Unexpected job state file: ${name}`);
  for (const value of [local, remote]) {
    if (value === undefined) continue;
    if (/^\.telegram-posted-(?!last-)/.test(name)) {
      if (!Array.isArray(value) || value.some(key => typeof key !== 'string')) throw new Error(`Invalid job history: ${name}`);
    } else if (name.includes('-last-')) {
      if (!Number.isFinite(Date.parse(value?.postedAt))) throw new Error(`Invalid job cooldown: ${name}`);
    } else {
      if (!object(value)) throw new Error(`Invalid job state: ${name}`);
      for (const entry of Object.values(value)) {
        if (!object(entry)) throw new Error(`Invalid job receipt: ${name}`);
        if (name.includes('-deliveries-')) {
          if (!['reserved', 'sent', 'rejected'].includes(entry.status) || typeof entry.chatId !== 'string'
            || typeof entry.message !== 'string' || !Array.isArray(entry.jobs) || !entry.jobs.length
            || entry.jobs.some(job => typeof job.key !== 'string' || typeof job.url !== 'string')
            || (entry.status === 'sent' && (!Number.isInteger(entry.messageId) || entry.messageId <= 0 || !Number.isFinite(Date.parse(entry.sentAt))))) throw new Error(`Invalid job delivery: ${name}`);
        } else if (!Array.isArray(entry.slugs) || entry.slugs.some(slug => typeof slug !== 'string')) throw new Error(`Invalid job URL history: ${name}`);
      }
    }
  }
  if (/^\.telegram-posted-(?!last-)/.test(name)) return [...new Set([...(remote || []), ...(local || [])])];
  if (!local) return remote;
  if (!remote) return local;
  if (name.includes('-last-')) return Date.parse(local.postedAt) > Date.parse(remote.postedAt) ? local : remote;
  const merged = { ...remote, ...local };
  for (const [id, prior] of Object.entries(remote)) {
    const current = local[id];
    if (!current) continue;
    if (name.includes('-deliveries-')) {
      if (prior.status === 'sent' || (prior.status === 'rejected' && current.status === 'reserved')) merged[id] = prior;
    } else {
      merged[id] = { ...(Date.parse(current.updatedAt) >= Date.parse(prior.updatedAt) ? current : prior), slugs: [...new Set([...prior.slugs, ...current.slugs])] };
    }
  }
  return merged;
}

export function readJobsState(file, fallback) {
  try { return mergeJobsState(path.basename(file), JSON.parse(fs.readFileSync(file, 'utf8')), undefined); }
  catch (error) { if (error.code === 'ENOENT') return fallback; throw new Error(`Cannot read Telegram job state: ${path.basename(file)}`); }
}

export function writeJobsState(file, value) {
  mergeJobsState(path.basename(file), value, undefined);
  fs.writeFileSync(`${file}.tmp`, JSON.stringify(value, null, 2) + '\n');
  fs.renameSync(`${file}.tmp`, file);
}

export function persistJobsState(options = {}) {
  return persistTelegramState({ ...options, pattern, mergeState: mergeJobsState, kind: 'jobs' });
}

function assertAvailable(ledger, chatId, slot) {
  assertUnsentSlot(ledger, slot, chatId);
  if (Object.values(ledger).some(entry => entry.chatId === chatId && entry.status === 'reserved')) throw new Error(`Unconfirmed Telegram job delivery requires review: ${chatId}`);
}

export async function deliverJobsOnce({ jobs, message, chatIds, postedFile, lastFile, urlFile, ledgerFile, slot = null, send, persist = persistJobsState }) {
  assertPostingWindow(slot);
  const cwd = path.dirname(postedFile);
  const failures = [];
  for (const chatId of chatIds) {
    const ledger = readJobsState(ledgerFile, {});
    if (hasSentSlot(ledger, slot, chatId)) continue;
    assertAvailable(ledger, chatId, slot);
    const id = randomUUID();
    const receipt = { status: 'reserved', reservedAt: new Date().toISOString(), chatId, jobs, message, ...(slot ? { slotKey: slot.key } : {}) };
    ledger[id] = receipt;
    writeJobsState(ledgerFile, ledger);
    try {
      persist({ cwd, validateRemote: remote => assertAvailable(remote.get(path.basename(ledgerFile)) || {}, chatId, slot) });
    } catch (error) {
      delete ledger[id];
      writeJobsState(ledgerFile, ledger);
      throw error;
    }
    const result = await send(chatId, message);
    const confirmed = readJobsState(ledgerFile, {});
    if (result?.ok === false) {
      confirmed[id] = { ...receipt, status: 'rejected' };
      writeJobsState(ledgerFile, confirmed);
      persist({ cwd });
      failures.push(`${chatId}: Telegram rejected the digest`);
      continue;
    }
    const messageId = result?.result?.message_id;
    if (result?.ok !== true || !Number.isInteger(messageId) || messageId <= 0) throw new Error('Telegram job delivery has no valid receipt; reservation retained for review');
    const sentAt = new Date().toISOString();
    confirmed[id] = { ...receipt, status: 'sent', messageId, sentAt };
    writeJobsState(ledgerFile, confirmed);
    writeJobsState(postedFile, [...new Set([...readJobsState(postedFile, []), ...jobs.map(job => job.key)])]);
    writeJobsState(lastFile, { postedAt: sentAt, ...(slot ? { slotKey: slot.key } : {}) });
    const urls = readJobsState(urlFile, {});
    for (const job of jobs) if (job.slug && new URL(job.url).hostname === 'hashtagweb3.com') {
      urls[job.key] = { slugs: [...new Set([...(urls[job.key]?.slugs || []), job.slug])], lastSlug: job.slug, lastUrl: `https://hashtagweb3.com/${job.slug}`, updatedAt: sentAt };
    }
    writeJobsState(urlFile, urls);
    console.log(`Telegram accepted ${jobs.length} jobs for ${chatId}; message ID ${messageId}${slot ? `; slot ${slot.key}` : ''}.`);
    persist({ cwd });
  }
  if (failures.length) throw new Error(failures.join('; '));
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) persistJobsState({ syncOnly: process.argv.includes('--sync') });
