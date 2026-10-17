import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { CAMPAIGN } from './newknowledge-content.mjs';

export const REPOSITORY = 'vedangvatsa/Web3-Jobs';
export const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const statusRank = { claimed: 0, 'container-created': 1, publishing: 2, accepted: 3, verified: 4 };
const serialize = state => JSON.stringify(state, null, 2) + '\n';

export function receiptPath(date, platform) {
  assert.match(date, /^2026-\d{2}-\d{2}$/);
  assert.ok(['x', 'threads'].includes(platform));
  return `scripts/social/newknowledge-receipts/${CAMPAIGN}/${date}-${platform}.json`;
}

export function mergeReceipts(remote, proposed, location = '') {
  if (remote === undefined || remote === null) return structuredClone(proposed);
  if (proposed === undefined) return structuredClone(remote);
  if (location.endsWith('.status')) {
    assert.ok(Object.hasOwn(statusRank, remote) && Object.hasOwn(statusRank, proposed), 'Unknown receipt status');
    return statusRank[remote] > statusRank[proposed] ? remote : proposed;
  }
  if (remote && proposed && !Array.isArray(remote) && !Array.isArray(proposed) && typeof remote === 'object' && typeof proposed === 'object') {
    const merged = {};
    for (const key of new Set([...Object.keys(remote), ...Object.keys(proposed)])) {
      assert.ok(!['__proto__', 'constructor', 'prototype'].includes(key), 'Invalid receipt key');
      merged[key] = mergeReceipts(remote[key], proposed[key], `${location}.${key}`);
    }
    return merged;
  }
  assert.deepEqual(remote, proposed, `Conflicting receipt ${location}; manual reconciliation required`);
  return structuredClone(remote);
}

export function durableReceipt({ read, write, record, wait = sleep }) {
  let acknowledgedText;
  const acknowledged = new Set();
  return {
    async load() {
      const remote = await read();
      acknowledgedText = remote.text;
      acknowledged.add(remote.text);
      if (remote.state) await record(remote.state);
      return remote.state;
    },
    async save(proposed) {
      await record(proposed);
      for (let attempt = 0; attempt < 8; attempt++) {
        const remote = await read();
        // Contents GET can lag behind a successful PUT, including returning an old 404.
        if (remote.text !== acknowledgedText && acknowledged.has(remote.text)) {
          await wait(1000 * (attempt + 1));
          continue;
        }
        const merged = mergeReceipts(remote.state, proposed);
        const text = serialize(merged);
        await record(merged);
        if (remote.text === text) {
          acknowledgedText = text; acknowledged.add(text);
          return merged;
        }
        const response = await write({ sha: remote.sha, text });
        if (response.ok) {
          acknowledgedText = text; acknowledged.add(text);
          return merged;
        }
        if (![409, 422].includes(response.status) || !/sha|expected|reference|fast forward|conflict|does not match|already exists/i.test(response.message || '')) {
          throw new Error(`Receipt write failed: HTTP ${response.status}; publishing stopped`);
        }
        await wait(1000 * (attempt + 1));
      }
      throw new Error('Receipt CAS exhausted after 8 attempts; publishing stopped');
    },
  };
}

export async function localJournal(directory) {
  await fs.mkdir(directory, { recursive: true });
  return async (state, event = 'checkpoint') => {
    const line = JSON.stringify({ at: new Date().toISOString(), event, state }) + '\n';
    const handle = await fs.open(path.join(directory, 'journal.jsonl'), 'a');
    try { await handle.write(line); await handle.sync(); } finally { await handle.close(); }
    if (event !== 'checkpoint') return;
    const temporary = path.join(directory, `receipt-${randomUUID()}.tmp`);
    await fs.writeFile(temporary, serialize(state), { flush: true });
    await fs.rename(temporary, path.join(directory, 'receipt.json'));
  };
}

export function githubReceipt({ date, platform, token, record, fetcher = fetch }) {
  assert.ok(token, 'GITHUB_TOKEN required for receipt access');
  const url = `https://api.github.com/repos/${REPOSITORY}/contents/${receiptPath(date, platform)}`;
  const headers = { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json', 'Cache-Control': 'no-cache', 'X-GitHub-Api-Version': '2022-11-28' };
  return durableReceipt({
    record,
    read: async () => {
      const response = await fetcher(`${url}?ref=main&read=${randomUUID()}`, { headers, signal: AbortSignal.timeout(30000) });
      if (response.status === 404) return { state: null, text: null, sha: null };
      assert.ok(response.ok, `Receipt read failed: HTTP ${response.status}`);
      const result = await response.json();
      assert.ok(result.sha && result.encoding === 'base64' && result.content, 'Invalid GitHub receipt response');
      const text = Buffer.from(result.content, 'base64').toString('utf8');
      return { state: JSON.parse(text), text, sha: result.sha };
    },
    write: async ({ sha, text }) => {
      const response = await fetcher(url, {
        method: 'PUT', headers, signal: AbortSignal.timeout(30000),
        body: JSON.stringify({ message: `chore(social): knowledge ${date} ${platform} receipt [skip ci]`, branch: 'main', ...(sha ? { sha } : {}), content: Buffer.from(text).toString('base64') }),
      });
      const result = await response.json();
      if (response.ok) assert.ok(result.content?.sha && result.commit?.sha, 'Missing GitHub write acknowledgement; publishing stopped');
      return { ok: response.ok, status: response.status, message: result.message };
    },
  });
}
