import { lookup } from 'node:dns/promises';
import http from 'node:http';
import https from 'node:https';
import { isIP } from 'node:net';
import { coveredByArticle } from '../news-discover.mjs';
import { validateLedger } from './news-research.mjs';

export const SOURCE_READINESS_USER_AGENT = 'HashtagWeb3NewsSourceReadiness/1.0 (+https://hashtagweb3.com)';
const BLOCKED = new Set([401, 403, 429, 451]);
const UNAVAILABLE = new Set([404, 410]);
const actualOutcomes = new Set(['read', 'blocked', 'unavailable']);

export function publicSourceUrl(value) {
  if (typeof value !== 'string' || value.length > 8192 || /[\s\\\u0000-\u001f\u007f]/.test(value)) throw new Error('Invalid source URL');
  const url = new URL(value);
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || url.port
    || isIP(url.hostname.replace(/^\[|\]$/g, '')) || !url.hostname.includes('.')
    || !url.hostname.split('.').every(label => /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i.test(label))
    || /(?:^|\.)(?:localhost|local|localdomain|internal|intranet|lan|home|arpa|onion|test|invalid)$/.test(url.hostname)) {
    throw new Error('Expected a public HTTP(S) hostname without credentials or a custom port');
  }
  url.hash = '';
  return url;
}

export function isPublicSourceAddress(address) {
  if (isIP(address) === 4) {
    const [a, b, c] = address.split('.').map(Number);
    return !(a === 0 || a === 10 || a === 127 || a >= 224
      || (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254)
      || (a === 172 && b >= 16 && b <= 31) || (a === 192 && (b === 168 || b === 0 || (b === 88 && c === 99)))
      || (a === 198 && (b === 18 || b === 19 || (b === 51 && c === 100)))
      || (a === 203 && b === 0 && c === 113));
  }
  if (isIP(address) === 6 && !address.includes('%')) {
    const [a, b = '0'] = address.split(':');
    const first = parseInt(a, 16), second = parseInt(b || '0', 16);
    return first >= 0x2000 && first <= 0x3fff
      && !(first === 0x2001 && (second < 0x200 || second === 0xdb8))
      && first !== 0x2002 && first !== 0x3fff;
  }
  return false;
}

export function requestSourceHeaders(value, { address, signal, headers }, requestFn) {
  const url = publicSourceUrl(value);
  if (!isPublicSourceAddress(address?.address) || isIP(address.address) !== address.family) throw new Error('Unsafe pinned source address');
  const send = requestFn || (url.protocol === 'https:' ? https.request : http.request);
  return new Promise((resolve, reject) => {
    const request = send(url, {
      method: 'GET', agent: false, maxHeaderSize: 16 * 1024, signal, headers,
      lookup: (hostname, options, callback) => {
        if (hostname !== url.hostname) return callback(new Error('Unexpected source hostname'));
        if (options.all) callback(null, [address]);
        else callback(null, address.address, address.family);
      },
    }, response => {
      const result = { url: url.href, status: response.statusCode, headers: response.headers };
      response.destroy();
      resolve(result);
    });
    request.once('error', reject);
    request.end();
  });
}

function header(response, name) {
  const value = typeof response.headers?.get === 'function' ? response.headers.get(name) : response.headers?.[name];
  return typeof value === 'string' ? value : null;
}

function retryAt(value, checkedAt) {
  if (!value || !Number.isFinite(Date.parse(checkedAt))) return null;
  const time = /^\d+$/.test(value.trim()) ? Date.parse(checkedAt) + Number(value.trim()) * 1000 : Date.parse(value);
  return Number.isFinite(time) && Math.abs(time) <= 8.64e15 ? new Date(time).toISOString() : null;
}

async function bounded(timeoutMs, action) {
  const controller = new AbortController();
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      const error = new Error('Source availability check timed out');
      error.name = 'TimeoutError';
      controller.abort(error);
      reject(error);
    }, timeoutMs);
  });
  try { return await Promise.race([Promise.resolve().then(() => action(controller.signal)), timeout]); }
  finally { clearTimeout(timer); }
}

async function probe(url, { request, lookupFn, timeoutMs, now }) {
  let attempted = false;
  try {
    return await bounded(timeoutMs, async signal => {
      const addresses = await lookupFn(new URL(url).hostname, { all: true, verbatim: true });
      signal.throwIfAborted();
      if (!Array.isArray(addresses) || !addresses.length) throw new Error('DNS returned no source addresses');
      if (addresses.some(entry => !isPublicSourceAddress(entry.address) || isIP(entry.address) !== entry.family)) {
        return { url, attempted: false, status: null, checkedAt: null, availability: 'unsafe-url', detail: 'DNS included a non-public address; no GET was sent.' };
      }
      attempted = true;
      const response = await request(url, { address: addresses[0], signal, headers: {
        'User-Agent': SOURCE_READINESS_USER_AGENT,
        Accept: 'text/html,application/xhtml+xml,application/json;q=0.8,*/*;q=0.5',
      } });
      signal.throwIfAborted();
      const check = { url, attempted: true, method: 'GET', checkedAt: new Date(now()).toISOString(), status: response.status };
      const retryAfter = header(response, 'retry-after');
      if (retryAfter !== null) Object.assign(check, { retryAfter, retryAt: retryAt(retryAfter, check.checkedAt) });
      if (response.redirected || (response.url && response.url !== url)) {
        return { ...check, availability: 'redirect-ambiguous', detail: 'The transport returned an unobserved redirect; no denial inferred.' };
      }
      if (response.status >= 300 && response.status < 400) {
        const location = header(response, 'location');
        let redirectUrl = null;
        try { if (location) redirectUrl = publicSourceUrl(new URL(location, url).href).href; } catch {}
        return { ...check, availability: 'redirect-ambiguous', location, redirectUrl,
          detail: redirectUrl ? 'Redirect not followed; destination access needs research.' : 'Missing or unsafe redirect destination; redirect not followed.' };
      }
      if (BLOCKED.has(response.status)) return { ...check, availability: 'denied', outcome: 'blocked' };
      if (UNAVAILABLE.has(response.status)) return { ...check, availability: 'unavailable', outcome: 'unavailable' };
      if (response.status >= 200 && response.status < 300) return { ...check, availability: 'responded', detail: 'HTTP response only; content was not read or verified.' };
      return { ...check, availability: 'http-uncertain', detail: 'This HTTP status is not definite evidence for a source-blocked deferral.' };
    });
  } catch (error) {
    return { url, attempted, status: null, checkedAt: null, availability: 'network-uncertain', error: error.code || error.name,
      detail: error.name === 'TimeoutError' ? 'DNS/GET deadline exceeded; access remains unknown.' : 'DNS, TLS or request failure; access remains unknown.' };
  }
}

function sourceRecords(ledger, day, item, restored) {
  const pending = [item, ...Object.entries(ledger.runs).filter(([date]) => date < day).flatMap(([, run]) => run.outcomes[item.id] ? [run.outcomes[item.id]] : []),
    ...(restored?.drafts || []).filter(draft => draft.id === item.id || (item.articleSlug && draft.articleSlug === item.articleSlug))];
  const records = [], seen = new Set();
  for (let index = 0; index < pending.length; index++) {
    const record = pending[index];
    if (!record || typeof record !== 'object' || seen.has(record)) continue;
    seen.add(record);
    records.push(record);
    for (const entry of record.previousReviews || []) if (entry?.review) pending.push(entry.review);
  }
  return records;
}

export function knownCandidateSourceUrls(records) {
  return [...new Set(records.flatMap(record => [record.link, ...(record.sources || []).map(source => source.url),
    ...(record.sourceChecks || []).filter(check => actualOutcomes.has(check.outcome)).map(check => check.url)])
    .filter(url => typeof url === 'string' && url.length > 0))];
}

function draftProtection(item, records, articles, restored, ledger) {
  const reasons = [];
  if (records.some(record => record.articleSlug || ['ready', 'published'].includes(record.status) || ['ready', 'published'].includes(record.previousStatus) || record.reason === 'verified-event'
    || Array.isArray(record.lastValidationErrors))) reasons.push('prior-ready-or-draft-fields');
  if (restored?.drafts.some(draft => draft.id === item.id || (item.articleSlug && draft.articleSlug === item.articleSlug))) reasons.push('restored-draft');
  const article = coveredByArticle({ ...item, sources: knownCandidateSourceUrls(records).map(url => ({ url })) }, articles);
  if (article || records.some(record => articles.some(entry => entry.slug === record.articleSlug || entry.slug === record.duplicateOf))) reasons.push('active-article');
  if (records.some(record => record.mergedInto && ledger.candidates[record.mergedInto]?.articleSlug)) reasons.push('merged-draft');
  return reasons;
}

export async function checkNewsSourceReadiness({ ledger, day, articles = [], restored = null, previous = null,
  request = requestSourceHeaders, lookupFn = lookup, timeoutMs = 10_000, concurrency = 3, now = Date.now } = {}) {
  validateLedger(ledger);
  const run = ledger.runs[day];
  if (!run) throw new Error('Source readiness needs a prepared daily research run');
  if (restored && (restored.day !== day || !Array.isArray(restored.drafts))) throw new Error('Restored draft context does not match the current research day');
  if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > 4) throw new Error('Source concurrency must be between 1 and 4');
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 30_000) throw new Error('Source timeout must be between 1 and 30000 ms');
  const candidates = (run.status === 'completed' ? [] : run.candidateIds.filter(id => !run.outcomes[id])).map(id => {
    const item = ledger.candidates[id], records = sourceRecords(ledger, day, item, restored);
    return { id, title: item.title, records, sourceUrls: knownCandidateSourceUrls(records), protectedReasons: draftProtection(item, records, articles, restored, ledger) };
  });
  const startedAt = new Date(now()).toISOString(), sources = new Map(), groups = new Map(), cooldowns = new Map(), stopped = new Map();
  const hostKey = url => new URL(url).hostname.replace(/^www\./, '');
  for (const check of [...(previous?.cooldowns || []), ...candidates.flatMap(candidate => candidate.records.flatMap(record => record.sourceChecks || []))]) {
    if (!Number.isInteger(check.status) || !check.retryAfter) continue;
    const until = retryAt(check.retryAfter, check.checkedAt);
    if (!until || Date.parse(until) <= now()) continue;
    try {
      const key = hostKey(publicSourceUrl(check.url).href);
      if (!cooldowns.has(key) || Date.parse(until) > Date.parse(cooldowns.get(key).retryAt)) cooldowns.set(key, { ...check, retryAt: until });
    } catch {}
  }
  for (const candidate of candidates) {
    candidate.keys = [];
    for (const sourceUrl of candidate.sourceUrls) {
      let url;
      try { url = publicSourceUrl(sourceUrl).href; } catch {}
      const key = url || sourceUrl;
      if (!candidate.keys.includes(key)) candidate.keys.push(key);
      if (sources.has(key)) {
        if (!sources.get(key).sourceUrls.includes(sourceUrl)) sources.get(key).sourceUrls.push(sourceUrl);
        continue;
      }
      const source = { url: key, sourceUrls: [sourceUrl] };
      sources.set(key, source);
      if (!url) {
        Object.assign(source, { attempted: false, status: null, checkedAt: null, availability: 'unsafe-url', detail: 'URL was not a safe public source target; no GET was sent.' });
      } else {
        const host = hostKey(url);
        if (!groups.has(host)) groups.set(host, []);
        groups.get(host).push(source);
      }
    }
  }
  const jobs = [...groups.entries()];
  let cursor = 0;
  await Promise.all(Array.from({ length: Math.min(concurrency, jobs.length) }, async () => {
    while (cursor < jobs.length) {
      const [host, urls] = jobs[cursor++];
      for (const source of urls) {
        const cooldown = cooldowns.get(host), pause = cooldown && Date.parse(cooldown.retryAt) > now() ? cooldown : stopped.get(host);
        if (pause) {
          Object.assign(source, { attempted: false, status: null, checkedAt: null, availability: 'retry-after',
            detail: 'Host paused after an earlier response; this URL has no access result.',
            retryAfterSource: { url: pause.url, status: pause.status, checkedAt: pause.checkedAt, retryAfter: pause.retryAfter ?? null, retryAt: pause.retryAt ?? null } });
          continue;
        }
        Object.assign(source, await probe(source.url, { request, lookupFn, timeoutMs, now }));
        if (source.retryAt && Date.parse(source.retryAt) > now()) cooldowns.set(host, source);
        if (source.status === 429 || (source.retryAfter !== undefined && !source.retryAt)) stopped.set(host, source);
      }
    }
  }));
  const reviews = [], results = candidates.map(candidate => {
    const sourceChecks = candidate.keys.map(key => sources.get(key));
    const blocked = !candidate.protectedReasons.length && sourceChecks.length > 0
      && sourceChecks.every(check => check.attempted && ['blocked', 'unavailable'].includes(check.outcome));
    if (blocked) {
      const checks = sourceChecks.map(({ url, outcome, status, method, checkedAt, retryAfter, retryAt }) => ({ url, outcome, status, method, checkedAt,
        ...(retryAfter !== undefined ? { retryAfter, retryAt } : {}) }));
      const title = candidate.title || candidate.id;
      reviews.push({ id: candidate.id, status: 'deferred', reason: 'source-blocked', sourceChecks: checks,
        note: `Availability-only GET checks for "${title}": ${checks.map(check => `${check.url} -> HTTP ${check.status}${check.retryAfter !== undefined ? ` (Retry-After: ${check.retryAfter})` : ''}`).join('; ')}. All known URLs returned definite access/unavailability responses. This pass did not read source content, verify facts, or perform alternate searches. Temporary deferral; primary and independent alternatives still need research.`,
        retrySearches: [...new Set([...(ledger.candidates[candidate.id].retrySearches || []).filter(query => typeof query === 'string' && query.trim().length >= 10),
          `Find a readable primary announcement or filing for: ${title}`,
          `Find independent reporting confirming the event in: ${title}`,
          'Retry the attempted URLs after any Retry-After time, within the existing verification window.'])] });
    }
    return { id: candidate.id, title: candidate.title, sourceUrls: candidate.sourceUrls, protectedReasons: candidate.protectedReasons,
      decision: blocked ? 'defer-source-blocked' : 'research', sourceChecks };
  });
  const checks = [...sources.values()];
  return { version: 1, day, startedAt, finishedAt: new Date(now()).toISOString(),
    scope: 'Availability only: no source reads, factual verification, alternate searches, or publication approval.',
    counts: { runCandidates: run.candidateIds.length, unreviewedCandidates: candidates.length,
      alreadyReviewedCandidates: run.candidateIds.filter(id => run.outcomes[id]).length,
      protectedDraftCandidates: candidates.filter(candidate => candidate.protectedReasons.length).length,
      deferredCandidates: reviews.length, researchCandidates: candidates.length - reviews.length,
      uniqueUrls: checks.length, attemptedUrls: checks.filter(check => check.attempted).length,
      definiteBlockerUrls: checks.filter(check => check.outcome).length, respondingUrls: checks.filter(check => check.availability === 'responded').length,
      uncertainUrls: checks.filter(check => !check.outcome && check.availability !== 'responded').length },
    sourceChecks: checks, candidates: results, reviews,
    cooldowns: [...cooldowns.values()].filter(check => Date.parse(check.retryAt) > now()).map(({ url, status, checkedAt, retryAfter, retryAt }) => ({ url, status, checkedAt, retryAfter, retryAt })) };
}
