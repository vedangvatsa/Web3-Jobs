import fs from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import {isDeepStrictEqual} from 'node:util';
import {platforms} from './job-video-core.ts';
import type {Ledger, Receipt} from './job-video-core.ts';

const file = 'scripts/social/job-video-state.json';
const repository = 'vedangvatsa/Web3-Jobs';
const empty = (): Ledger => ({version: 1, slots: {}, jobs: {}});
const serialize = (state: Ledger) => JSON.stringify(state, null, 2) + '\n';
const record = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
const text = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;
const timestamp = (value: unknown) => text(value) && /^\d{4}-\d\d-\d\dT/.test(value) && Number.isFinite(Date.parse(value));
const slotKey = (value: string) => /^\d{4}-\d\d-\d\d:(morning|afternoon|evening)$/.test(value)
  && Number.isFinite(Date.parse(value.slice(0, 10))) && new Date(value.slice(0, 10)).toISOString().slice(0, 10) === value.slice(0, 10);

function requireState(condition: unknown, path: string): asserts condition {
  if (!condition) throw new Error(`Invalid video ledger: ${path}`);
}

function fields(value: Record<string, unknown>, allowed: string[], path: string) {
  requireState(Object.keys(value).every(key => allowed.includes(key)), `${path} has unknown fields`);
}

export function validateLedger(value: unknown): asserts value is Ledger {
  requireState(record(value) && value.version === 1 && record(value.slots) && record(value.jobs), 'version, slots or jobs');
  fields(value, ['version', 'slots', 'jobs'], 'ledger');
  const assigned = new Set<string>();
  for (const [slot, slugs] of Object.entries(value.slots)) {
    requireState(slotKey(slot) && Array.isArray(slugs) && slugs.length <= 2, `slots.${slot}`);
    for (const slug of slugs) {
      requireState(text(slug) && /^[\w-]+$/.test(slug) && !['__proto__', 'constructor', 'prototype'].includes(slug) && !assigned.has(slug), `slots.${slot} duplicate or invalid slug`);
      const job = value.jobs[slug];
      requireState(record(job) && job.slot === slot, `slots.${slot}.${slug} has no matching job`);
      assigned.add(slug);
    }
  }
  for (const [slug, job] of Object.entries(value.jobs)) {
    requireState(assigned.has(slug) && record(job), `jobs.${slug} has no slot`);
    fields(job, ['slot', 'selectedAt', 'verifiedAt', 'reservationId', 'captions', 'receipts'], `jobs.${slug}`);
    requireState(timestamp(job.selectedAt) && timestamp(job.verifiedAt), `${slug} timestamps`);
    requireState(job.reservationId === undefined || text(job.reservationId), `${slug} reservationId`);
    requireState(record(job.captions) && record(job.receipts), `${slug} captions or receipts`);
    fields(job.captions, [...platforms, 'youtubeTitle'], `${slug} captions`);
    fields(job.receipts, platforms, `${slug} receipts`);
    for (const platform of [...platforms, 'youtubeTitle']) requireState(text(job.captions[platform]), `${slug} caption ${platform}`);
    for (const platform of platforms) {
      const receipt = job.receipts[platform];
      if (receipt === undefined) continue;
      requireState(record(receipt), `${slug} ${platform} receipt`);
      fields(receipt, ['status', 'text', 'startedAt', 'attemptId', 'publishAttemptId', 'postId', 'containerId', 'url', 'error'], `${slug} ${platform}`);
      requireState(text(receipt.status) && ['creating', 'pending', 'publishing', 'sent', 'rejected'].includes(receipt.status), `${slug} ${platform} status`);
      requireState(receipt.text === job.captions[platform] && timestamp(receipt.startedAt), `${slug} ${platform} identity`);
      for (const key of ['attemptId', 'publishAttemptId', 'postId', 'containerId', 'url', 'error']) {
        requireState(receipt[key] === undefined || text(receipt[key]), `${slug} ${platform} ${key}`);
      }
      requireState(platform === 'instagram' || (!receipt.containerId && !receipt.publishAttemptId && receipt.status !== 'publishing'), `${slug} ${platform} Instagram fields`);
      if (receipt.status === 'pending' || receipt.status === 'publishing') {
        requireState(receipt.postId || (platform === 'instagram' && receipt.containerId), `${slug} ${platform} missing provider ID`);
      }
      if (receipt.status === 'sent') requireState(receipt.postId && receipt.url, `${slug} ${platform} missing sent evidence`);
      if (receipt.status === 'rejected') requireState(!receipt.postId && !receipt.containerId && !receipt.url, `${slug} ${platform} rejected with provider evidence`);
      if (text(receipt.url)) {
        const url = new URL(receipt.url);
        const hosts = platform === 'instagram' ? ['www.instagram.com', 'instagram.com'] : platform === 'youtube' ? ['www.youtube.com', 'youtube.com', 'youtu.be'] : ['www.tiktok.com', 'tiktok.com'];
        requireState(url.protocol === 'https:' && hosts.includes(url.hostname), `${slug} ${platform} URL`);
      }
    }
  }
}

export function receiptErrors(...errors: (string | undefined)[]): string | undefined {
  const lines = [...new Set(errors.flatMap(error => error ? error.split('\n') : []))];
  return lines.length ? lines.join('\n') : undefined;
}

function conflict(path: string): never {throw new Error(`Video ledger conflict: ${path}; reconciliation required`);}

function mergeReceipt(left: Receipt, right: Receipt, path: string): Receipt {
  if (left.text !== right.text) conflict(`${path} text`);
  if (left.startedAt !== right.startedAt || (left.attemptId && right.attemptId && left.attemptId !== right.attemptId)) {
    // Only an explicit rejection without provider IDs permits another creation attempt.
    const rejected = left.status === 'rejected' ? left : right.status === 'rejected' ? right : undefined;
    const next = rejected === left ? right : left;
    if (!rejected || Date.parse(next.startedAt) <= Date.parse(rejected.startedAt)) conflict(`${path} attempt identity`);
    return {...next, error: receiptErrors(left.error, right.error)};
  }
  for (const key of ['postId', 'containerId', 'url', 'publishAttemptId'] as const) {
    if (left[key] && right[key] && left[key] !== right[key]) conflict(`${path} ${key}`);
  }
  const rank = {creating: 0, rejected: 1, pending: 2, publishing: 3, sent: 4};
  const result: Receipt = {...left, ...right, status: rank[left.status] > rank[right.status] ? left.status : right.status};
  for (const key of ['attemptId', 'publishAttemptId', 'postId', 'containerId', 'url'] as const) {
    if (left[key] || right[key]) result[key] = left[key] || right[key];
  }
  const error = receiptErrors(left.error, right.error);
  if (error) result.error = error;
  return result;
}

export function mergeLedgers(left: Ledger, right: Ledger): Ledger {
  validateLedger(left); validateLedger(right);
  const merged = structuredClone(left);
  for (const [slot, slugs] of Object.entries(right.slots)) {
    if (merged.slots[slot]?.length && slugs.length && !isDeepStrictEqual(merged.slots[slot], slugs)) conflict(`slot ${slot}`);
    if (!merged.slots[slot]?.length) merged.slots[slot] = [...slugs];
  }
  for (const [slug, job] of Object.entries(right.jobs)) {
    const previous = merged.jobs[slug];
    if (!previous) {merged.jobs[slug] = structuredClone(job); continue;}
    for (const key of ['slot', 'selectedAt', 'verifiedAt', 'captions'] as const) {
      if (!isDeepStrictEqual(previous[key], job[key])) conflict(`${slug} ${key}`);
    }
    if (previous.reservationId && job.reservationId && previous.reservationId !== job.reservationId) conflict(`${slug} reservation identity`);
    if (job.reservationId) previous.reservationId = job.reservationId;
    for (const platform of platforms) {
      const receipt = job.receipts[platform];
      if (receipt) previous.receipts[platform] = previous.receipts[platform]
        ? mergeReceipt(previous.receipts[platform], receipt, `${slug} ${platform}`) : structuredClone(receipt);
    }
  }
  validateLedger(merged);
  return merged;
}

function assertClaims(base: Ledger, intended: Ledger, latest: Ledger) {
  for (const [slug, job] of Object.entries(intended.jobs)) {
    const before = base.jobs[slug], other = latest.jobs[slug];
    if (!other) continue;
    if (!before && (!job.reservationId || job.reservationId !== other.reservationId)) conflict(`${slug} competing reservation`);
    for (const platform of platforms) {
      const receipt = job.receipts[platform], prior = before?.receipts[platform], remote = other.receipts[platform];
      if (!receipt || !remote) continue;
      const newAttempt = !prior || prior.startedAt !== receipt.startedAt || prior.attemptId !== receipt.attemptId;
      if (newAttempt && !isDeepStrictEqual(prior, remote) && (!receipt.attemptId || receipt.attemptId !== remote.attemptId)) conflict(`${slug} ${platform} competing creation`);
      if (receipt.publishAttemptId && receipt.publishAttemptId !== prior?.publishAttemptId && remote.status === 'publishing' && receipt.publishAttemptId !== remote.publishAttemptId) conflict(`${slug} ${platform} competing publication`);
    }
  }
}

function updateInPlace(target: Ledger, source: Ledger) {
  Object.assign(target.slots, structuredClone(source.slots));
  for (const [slug, job] of Object.entries(source.jobs)) {
    const existing = target.jobs[slug];
    if (!existing) {target.jobs[slug] = structuredClone(job); continue;}
    // The publisher holds receipt references across awaits; replacing them loses later IDs.
    const receipts = existing.receipts;
    Object.assign(existing, structuredClone(job), {receipts});
    for (const platform of platforms) {
      const receipt = job.receipts[platform];
      if (receipt) receipts[platform] = Object.assign(receipts[platform] || {}, receipt);
    }
  }
}

export class VideoStateError extends Error {}

class GitHubError extends Error {
  status: number;
  detail: string;
  constructor(method: string, status: number, detail: string) {
    super(`Video ledger ${method} failed: HTTP ${status}${detail ? ` ${detail}` : ''}`);
    this.status = status;
    this.detail = detail;
  }
}

function retryable(error: unknown): boolean {
  if (!(error instanceof GitHubError) || ![409, 422].includes(error.status)) return false;
  let detail = error.detail;
  try {const body: unknown = JSON.parse(detail); if (record(body) && text(body.message)) detail = body.message;} catch {}
  if (error.status === 409 && (!detail.trim() || /^Conflict\.?$/i.test(detail.trim()))) return true;
  return /\bsha\b.*does not match|\bis at [a-f0-9]+ but expected [a-f0-9]+|\breference update failed\b.*(?:expected|fast.?forward)|\bnot a fast forward\b/i.test(detail);
}

type StateOptions = {file?: string; request?: typeof fetch; sleep?: (ms: number) => Promise<void>; maxAttempts?: number; token?: string};

export function createStateStore(options: StateOptions = {}) {
  const localFile = options.file || file;
  const recoveryFile = localFile.replace(/\.json$/, '') + '.recovery.jsonl';
  const request = options.request || ((...args: Parameters<typeof fetch>) => fetch(...args));
  const sleep = options.sleep || ((ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms)));
  const maxAttempts = options.maxAttempts ?? 8;
  if (!Number.isInteger(maxAttempts) || maxAttempts < 1 || maxAttempts > 20) throw new Error('Invalid video ledger retry limit');
  let sha: string | undefined;
  let confirmed: Ledger | undefined;
  let retained = empty();

  async function evidence(source: string, state: Ledger) {
    await fs.appendFile(recoveryFile, JSON.stringify({source, state}) + '\n');
  }
  async function local(state: Ledger) {
    const temporary = `${localFile}.${randomUUID()}.tmp`;
    await fs.writeFile(temporary, serialize(state));
    await fs.rename(temporary, localFile);
  }
  async function github(method: 'GET' | 'PUT', body?: unknown): Promise<unknown> {
    const token = options.token ?? process.env.GITHUB_TOKEN;
    if (!token) throw new Error('Missing GITHUB_TOKEN for video ledger');
    const response = await request(`https://api.github.com/repos/${repository}/contents/${file}${method === 'GET' ? '?ref=main' : ''}`, {
      method, headers: {Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json', 'Cache-Control': 'no-cache'},
      body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(30000),
    });
    if (!response.ok) throw new GitHubError(method, response.status, await response.text());
    return response.json();
  }
  async function readRemote(readOnly = false) {
    const response = await github('GET');
    requireState(record(response) && text(response.sha) && text(response.content) && response.encoding === 'base64', 'GitHub Contents response');
    const state: unknown = JSON.parse(Buffer.from(response.content, 'base64').toString('utf8'));
    validateLedger(state);
    if (!readOnly) await evidence('remote', state);
    return {sha: response.sha, state};
  }
  async function loadState(remote: boolean, {readOnly = false}: {readOnly?: boolean} = {}): Promise<Ledger> {
    try {
      let disk = empty();
      try {
        const parsed: unknown = JSON.parse(await fs.readFile(localFile, 'utf8'));
        validateLedger(parsed); disk = parsed;
      } catch (error) {
        if (!remote || !record(error) || error.code !== 'ENOENT') throw error;
      }
      if (!remote) {retained = structuredClone(disk); return disk;}
      if (!readOnly) await evidence('local', disk);
      const latest = await readRemote(readOnly);
      const state = mergeLedgers(mergeLedgers(retained, disk), latest.state);
      if (!readOnly) await local(state);
      sha = latest.sha; confirmed = latest.state; retained = structuredClone(state);
      return state;
    } catch (cause) {throw new VideoStateError(`Cannot load video ledger: ${String(cause)}`, {cause});}
  }
  async function saveState(state: Ledger, remote: boolean): Promise<void> {
    try {
      validateLedger(state);
      const checkpointErrors: unknown[] = [];
      try {await evidence('save', state);} catch (cause) {checkpointErrors.push(cause);}
      let pending: Ledger;
      try {
        pending = mergeLedgers(retained, state);
        updateInPlace(state, pending);
        retained = structuredClone(pending);
        await local(pending);
      } catch (cause) {
        checkpointErrors.push(cause);
        throw new AggregateError(checkpointErrors, `Video ledger local checkpoint failed: ${String(cause)}`);
      }
      if (checkpointErrors.length) throw new AggregateError(checkpointErrors, `Video ledger recovery journal failed: ${String(checkpointErrors[0])}`);
      if (!remote) return;
      if (!sha || !confirmed) throw new Error('Load the remote video ledger before saving');
      const base = structuredClone(confirmed);
      const intended = structuredClone(pending);
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
          const response = await github('PUT', {message: 'chore(social): persist job video receipts [skip ci]', branch: 'main', sha, content: Buffer.from(serialize(pending)).toString('base64')});
          requireState(record(response) && record(response.content) && text(response.content.sha), 'GitHub PUT acknowledgement');
          sha = response.content.sha; confirmed = structuredClone(pending);
          return;
        } catch (error) {
          if (!retryable(error) || attempt + 1 === maxAttempts) throw error;
          await sleep(Math.min(250 * 2 ** attempt, 4000));
          try {
            const latest = await readRemote();
            assertClaims(base, intended, latest.state);
            // A stale GET must not erase evidence from an acknowledged PUT or this save.
            pending = mergeLedgers(pending, latest.state);
            sha = latest.sha;
            updateInPlace(state, pending);
            retained = structuredClone(pending);
            await local(pending);
          } catch (cause) {
            throw new AggregateError([error, cause], `Video ledger refresh after conflict failed: ${String(cause)}`);
          }
        }
      }
    } catch (cause) {throw new VideoStateError(`Cannot persist video ledger: ${String(cause)}`, {cause});}
  }
  return {loadState, saveState};
}

export const {loadState, saveState} = createStateStore();
