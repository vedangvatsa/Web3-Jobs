import fs from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import {isDeepStrictEqual} from 'node:util';

export interface SocialHistoryEntry {
  slug: string;
  company: string;
  title: string;
  platform: string;
  postedAt: string;
  postId?: string;
  containerId?: string;
  permalink?: string;
  account?: string;
  target?: string;
  attemptId?: string;
  verification?: 'creating' | 'pending' | 'quarantined' | 'verified';
  expectedText?: string;
  provider?: 'buffer' | 'linkedin-direct';
  snapshot?: Record<string, unknown>;
  payload?: Record<string, unknown>;
  evidence?: Record<string, unknown>;
  error?: string;
}

export interface SocialState {
  lastIndex: number;
  postedSlugs: string[];
  pendingSlugs: string[];
  history: SocialHistoryEntry[];
}

export const SOCIAL_STATE_FILE = 'scripts/social/jobs-social-posted.json';
const empty = (): SocialState => ({lastIndex: 0, postedSlugs: [], pendingSlugs: [], history: []});
const record = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const text = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0;
const serialize = (state: SocialState) => JSON.stringify(state, null, 2) + '\n';
const platforms = ['x', 'threads', 'bluesky', 'farcaster', 'linkedin', 'facebook'];

export function hasVerifiedPostReceipt(entry: SocialHistoryEntry): boolean {
  if (entry.verification && entry.verification !== 'verified') return false;
  if (text(entry.postId) && !['unknown', 'published'].includes(entry.postId)) return true;
  if (!entry.evidence || !entry.permalink || entry.verification !== 'verified') return false;
  return entry.platform === 'x'
    ? /^https:\/\/(?:twitter|x)\.com\/hashtag_web3\/status\/\d+$/.test(entry.permalink)
    : entry.platform === 'threads' && /^https:\/\/www\.threads\.(?:com|net)\/@hashtagweb3\/post\/[\w-]+$/.test(entry.permalink);
}

export function deliveryTarget(entry: Pick<SocialHistoryEntry, 'platform' | 'target' | 'account'>): string {
  return entry.target || (entry.platform === 'linkedin' ? entry.account || '69c5b139af47dacb695b5feb'
    : entry.platform === 'farcaster' ? entry.account || 'channel:jobs' : entry.platform);
}
const deliveryKey = (entry: SocialHistoryEntry) => JSON.stringify([entry.slug, entry.platform, deliveryTarget(entry)]);
const entryKey = (entry: SocialHistoryEntry) => JSON.stringify([deliveryKey(entry), entry.attemptId || entry.postedAt]);

export function validateSocialState(value: unknown): asserts value is SocialState {
  function check(ok: unknown, detail: string): asserts ok {if (!ok) throw new Error(`Invalid social ledger: ${detail}`);}
  check(record(value), 'object');
  check(Number.isInteger(value.lastIndex) && Number(value.lastIndex) >= 0, 'lastIndex');
  check(Array.isArray(value.postedSlugs) && value.postedSlugs.every(text), 'postedSlugs');
  check(Array.isArray(value.pendingSlugs) && value.pendingSlugs.every(text), 'pendingSlugs');
  check(Array.isArray(value.history), 'history');
  for (const entry of value.history) {
    check(record(entry), 'entry');
    for (const key of ['slug', 'company', 'title', 'platform', 'postedAt']) check(text(entry[key]), key);
    check(text(entry.postedAt) && Number.isFinite(Date.parse(entry.postedAt)), 'postedAt');
    // Instagram receipts from the retired image publisher remain immutable history.
    check(text(entry.platform) && [...platforms, 'instagram'].includes(entry.platform), 'platform');
    for (const key of ['postId', 'containerId', 'permalink', 'account', 'target', 'attemptId', 'expectedText', 'error']) {
      check(entry[key] === undefined || text(entry[key]), key);
    }
    check(entry.verification === undefined || (text(entry.verification) && ['creating', 'pending', 'quarantined', 'verified'].includes(entry.verification)), 'verification');
    for (const key of ['snapshot', 'payload', 'evidence']) check(entry[key] === undefined || record(entry[key]), key);
    if (record(entry.snapshot)) {
      check(entry.snapshot.slug === entry.slug && entry.snapshot.company === entry.company && entry.snapshot.title === entry.title, 'source identity');
    }
    if (entry.verification === 'verified') check(hasVerifiedPostReceipt(entry as unknown as SocialHistoryEntry), 'verified evidence');
    if (entry.attemptId) check(record(entry.snapshot) && text(entry.snapshot.id) && text(entry.snapshot.link)
      && text(entry.snapshot.date) && Number.isFinite(Date.parse(entry.snapshot.date)) && entry.payload && text(entry.expectedText), 'attempt payload');
  }
}

function conflict(detail: string): never {throw new Error(`Social ledger conflict: ${detail}; reconciliation required`);}

function mergeEntry(left: SocialHistoryEntry, right: SocialHistoryEntry): SocialHistoryEntry {
  const result = {...left};
  for (const [key, value] of Object.entries(right)) {
    if (value === undefined || key === 'verification' || key === 'error') continue;
    const old = (left as unknown as Record<string, unknown>)[key];
    if (old !== undefined && !isDeepStrictEqual(old, value)) conflict(`${left.slug} ${left.platform} ${key}`);
    Object.assign(result, {[key]: value});
  }
  const rank = {creating: 0, quarantined: 1, pending: 2, verified: 3};
  const status = (entry: SocialHistoryEntry) => entry.verification || (hasVerifiedPostReceipt(entry) ? 'verified' : 'pending');
  if (left.verification || right.verification) result.verification = rank[status(left)] >= rank[status(right)] ? status(left) : status(right);
  const errors = [...new Set([left.error, right.error].filter(text).flatMap(error => error.split('\n')))];
  if (errors.length) result.error = errors.join('\n');
  return result;
}

export function mergeSocialStates(left: SocialState, right: SocialState): SocialState {
  validateSocialState(left); validateSocialState(right);
  const merged = structuredClone(left);
  for (const [key, value] of Object.entries(right)) {
    if (['history', 'postedSlugs', 'pendingSlugs', 'lastIndex'].includes(key)) continue;
    const prior = (left as unknown as Record<string, unknown>)[key];
    if (prior !== undefined && !isDeepStrictEqual(prior, value)) conflict(key);
    Object.assign(merged, {[key]: value});
  }
  const entries = new Map(merged.history.map(entry => [entryKey(entry), entry]));
  for (const entry of right.history) {
    const previous = entries.get(entryKey(entry));
    if (previous) Object.assign(previous, mergeEntry(previous, entry));
    else {
      if (merged.history.some(other => deliveryKey(other) === deliveryKey(entry) && (other.attemptId || entry.attemptId))) conflict(`${entry.slug} ${entry.platform} competing creation`);
      const copy = structuredClone(entry); merged.history.push(copy); entries.set(entryKey(entry), copy);
    }
  }
  merged.postedSlugs = [...new Set([...left.postedSlugs, ...right.postedSlugs])];
  const unresolved = new Set(merged.history.filter(entry => entry.verification && entry.verification !== 'verified').map(entry => entry.slug));
  merged.postedSlugs = merged.postedSlugs.filter(slug => !unresolved.has(slug));
  merged.pendingSlugs = [...new Set([...left.pendingSlugs, ...right.pendingSlugs, ...unresolved])].filter(slug => !merged.postedSlugs.includes(slug));
  validateSocialState(merged);
  return merged;
}

function updateInPlace(state: SocialState, merged: SocialState) {
  const entries = new Map(state.history.map(entry => [entryKey(entry), entry]));
  const history = merged.history.map(entry => Object.assign(entries.get(entryKey(entry)) || {}, structuredClone(entry)) as SocialHistoryEntry);
  Object.assign(state, structuredClone(merged), {history});
}

function assertClaims(base: SocialState, intended: SocialState, latest: SocialState) {
  const known = new Set(base.history.map(entryKey));
  for (const entry of intended.history) {
    if (!entry.attemptId || known.has(entryKey(entry))) continue;
    const competing = latest.history.find(other => deliveryKey(other) === deliveryKey(entry) && other.attemptId !== entry.attemptId);
    if (competing) conflict(`${entry.slug} ${entry.platform} competing creation`);
  }
}

export class SocialStateError extends Error {}
class GitHubError extends Error {
  constructor(readonly status: number, readonly detail: string) {super(`Social ledger HTTP ${status}: ${detail}`);}
}
function retryable(error: unknown) {
  if (!(error instanceof GitHubError) || ![409, 422].includes(error.status)) return false;
  let detail = error.detail;
  try {const body = JSON.parse(detail); if (text(body.message)) detail = body.message;} catch {}
  if (error.status === 409 && (!detail.trim() || /^Conflict\.?$/i.test(detail.trim()))) return true;
  return /\bsha\b.*does not match|\bis at [a-f0-9]+ but expected [a-f0-9]+|\breference update failed\b.*(?:expected|fast.?forward)|\bnot a fast forward\b/i.test(detail);
}

export function createSocialStateStore(options: {file?: string; token?: string; request?: typeof fetch; sleep?: (ms: number) => Promise<void>} = {}) {
  const file = options.file || SOCIAL_STATE_FILE;
  const journal = file.replace(/\.json$/, '.recovery.jsonl');
  const request = options.request || ((...args: Parameters<typeof fetch>) => fetch(...args));
  const sleep = options.sleep || ((ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms)));
  let sha: string | undefined, confirmed: SocialState | undefined;
  let retained = empty();
  const evidence = (source: string, state: SocialState) => fs.appendFile(journal, JSON.stringify({source, state}) + '\n');
  async function local(state: SocialState) {
    const tmp = `${file}.${randomUUID()}.tmp`;
    await fs.writeFile(tmp, serialize(state));
    await fs.rename(tmp, file);
  }
  async function github(method: 'GET' | 'PUT', body?: unknown, blobSha?: string) {
    const token = options.token ?? process.env.GITHUB_TOKEN;
    if (!token) throw new Error('GITHUB_TOKEN is required for durable social receipts');
    if (blobSha && (method !== 'GET' || !/^[a-f0-9]{40}$/.test(blobSha))) throw new Error('Invalid social ledger blob read');
    const endpoint = blobSha ? `git/blobs/${blobSha}` : `contents/${SOCIAL_STATE_FILE}${method === 'GET' ? '?ref=main' : ''}`;
    const response = await request(`https://api.github.com/repos/vedangvatsa/Web3-Jobs/${endpoint}`, {
      method, headers: {Authorization: `Bearer ${token}`, Accept: method === 'GET' && !blobSha ? 'application/vnd.github.object+json' : 'application/vnd.github+json', 'Content-Type': 'application/json', 'Cache-Control': 'no-cache'},
      body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(30000),
    });
    if (!response.ok) throw new GitHubError(response.status, await response.text());
    return response.json();
  }
  async function remote() {
    let response = await github('GET');
    if (response.encoding === 'none' && /^[a-f0-9]{40}$/.test(response.sha)) {
      const sha = response.sha;
      response = await github('GET', undefined, sha);
      if (response.sha !== sha) throw new Error('Social ledger blob identity mismatch');
    }
    if (!text(response.sha) || !text(response.content) || response.encoding !== 'base64') throw new Error('Invalid GitHub Contents response');
    const state: unknown = JSON.parse(Buffer.from(response.content, 'base64').toString());
    validateSocialState(state);
    await evidence('remote', state);
    return {sha: response.sha as string, state};
  }
  async function loadState(live: boolean): Promise<SocialState> {
    try {
      const disk: unknown = JSON.parse(await fs.readFile(file, 'utf8'));
      validateSocialState(disk);
      if (!live) return disk;
      await evidence('local', disk);
      const latest = await remote();
      const merged = mergeSocialStates(latest.state, disk);
      await local(merged);
      sha = latest.sha; confirmed = latest.state; retained = structuredClone(merged);
      return merged;
    } catch (cause) {throw new SocialStateError(`Cannot load social ledger: ${String(cause)}`, {cause});}
  }
  async function saveState(state: SocialState, live = true) {
    try {
      validateSocialState(state);
      const errors: unknown[] = [];
      try {await evidence('save', state);} catch (cause) {errors.push(cause);}
      let pending: SocialState;
      try {
        pending = mergeSocialStates(state, retained);
        updateInPlace(state, pending); retained = structuredClone(pending);
        await local(pending);
      } catch (cause) {throw new AggregateError([...errors, cause], `Social local checkpoint failed: ${String(cause)}`);}
      if (errors.length) throw new AggregateError(errors, 'Social recovery journal failed');
      if (!live) return;
      if (!sha || !confirmed) throw new Error('Load remote social ledger before saving');
      const base = structuredClone(confirmed), intended = structuredClone(pending);
      for (let attempt = 0; attempt < 8; attempt++) {
        try {
          const response = await github('PUT', {branch: 'main', sha, message: 'chore(social): persist job delivery receipt [skip ci]', content: Buffer.from(serialize(pending)).toString('base64')});
          if (!text(response.content?.sha)) throw new Error('Invalid GitHub PUT acknowledgement');
          sha = response.content.sha; confirmed = structuredClone(pending);
          return;
        } catch (error) {
          if (!retryable(error) || attempt === 7) throw error;
          await sleep(Math.min(250 * 2 ** attempt, 4000));
          try {
            const latest = await remote();
            assertClaims(base, intended, latest.state);
            pending = mergeSocialStates(pending, latest.state);
            sha = latest.sha; updateInPlace(state, pending); retained = structuredClone(pending);
            await local(pending);
          } catch (cause) {throw new AggregateError([error, cause], `Social refresh after conflict failed: ${String(cause)}`);}
        }
      }
    } catch (cause) {throw new SocialStateError(`Cannot persist social ledger: ${String(cause)}`, {cause});}
  }
  return {loadState, saveState};
}

export async function deliverSocialPost(options: {
  state: SocialState;
  entry: SocialHistoryEntry;
  save: () => Promise<void>;
  beforeSend: () => Promise<void>;
  send: (checkpoint: (fields: Pick<SocialHistoryEntry, 'containerId'>) => Promise<void>) => Promise<string>;
  verify?: (postId: string) => Promise<Pick<SocialHistoryEntry, 'permalink' | 'account'>>;
}): Promise<SocialHistoryEntry> {
  const {state, save, beforeSend, send, verify} = options;
  const prior = state.history.find(entry => deliveryKey(entry) === deliveryKey(options.entry)
    || (entry.slug === options.entry.slug && entry.platform === options.entry.platform && entry.verification === 'quarantined' && !entry.account));
  if (prior) {
    if (hasVerifiedPostReceipt(prior)) return prior;
    throw new Error(`Delivery ${prior.slug} ${deliveryTarget(prior)} requires read-only reconciliation; creation blocked`);
  }
  await beforeSend();
  const entry: SocialHistoryEntry = {...JSON.parse(JSON.stringify(options.entry)), attemptId: randomUUID(), verification: 'creating'};
  state.history.push(entry);
  await save();
  try {
    await beforeSend();
    entry.postId = await send(async fields => {Object.assign(entry, fields); await save();});
    if (!text(entry.postId) || ['unknown', 'published'].includes(entry.postId)) throw new Error('Provider did not return a receipt');
    Object.assign(entry, {verification: verify ? 'pending' : 'verified'});
    await save();
    if (verify) {
      Object.assign(entry, await verify(entry.postId), {verification: 'verified'});
      await save();
    }
    return entry;
  } catch (error) {
    if (error instanceof SocialStateError) throw error;
    // The durable creation claim also covers a provider response lost in transit.
    entry.error = (error as Error).message;
    try {await save();} catch (cause) {
      throw new SocialStateError(`Delivery failed and receipt checkpoint failed: ${String(cause)}`, {cause: new AggregateError([error, cause])});
    }
    throw error;
  }
}
