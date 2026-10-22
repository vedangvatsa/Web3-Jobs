import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { setTimeout as delay } from 'node:timers/promises';
import { test } from 'node:test';
import { canonicalNewsUrl } from '../news-discover.mjs';
import { prepareResearch, reviewCandidate, retryUnpublishedDrafts } from './news-research.mjs';
import { checkNewsSourceReadiness, isPublicSourceAddress, publicSourceUrl, requestSourceHeaders, SOURCE_READINESS_USER_AGENT } from './news-source-readiness.mjs';

const day = '2026-10-22', time = Date.parse(`${day}T04:00:00Z`);
const publicAddress = { address: '93.184.216.34', family: 4 };
const lookupFn = async () => [publicAddress];
const response = (status, headers = {}) => ({ status, headers });

function fixture(entries = [{}]) {
  const candidates = Object.fromEntries(entries.map((entry, index) => {
    const id = (index + 1).toString(16).padStart(20, '0');
    return [id, { id, title: `Protocol ${index} files a governance proposal`, link: `https://news.example.com/story-${index}`,
      published: `${day}T01:00:00Z`, status: 'pending', sources: [], attempts: 0,
      expiresAt: '2026-10-25T01:00:00Z', ...entry }];
  }));
  const ledger = { version: 1, candidates, runs: { [day]: { day, status: 'prepared', candidateIds: Object.keys(candidates),
    outcomes: {}, baselineSlugs: [], discovery: { feeds: [{ ok: true }] } } } };
  return { ledger, day, now: () => time, lookupFn };
}

test('checks link, sources and earlier actual sourceChecks, and makes an evidence-only temporary review', async () => {
  const f = fixture([{ link: 'https://feed.example.com/item', sources: [{ url: 'https://primary.example.com/filing' }],
    sourceChecks: [{ url: 'https://reporter.example.com/report', outcome: 'blocked' }] }]);
  const [id] = f.ledger.runs[day].candidateIds;
  f.ledger.runs['2026-10-21'] = { day: '2026-10-21', status: 'incomplete', candidateIds: [id], baselineSlugs: [], outcomes: {
    [id]: { status: 'deferred', note: 'A previously opened report still needed primary corroboration.',
      sourceChecks: [{ url: 'https://history.example.com/original', outcome: 'read' }] },
  } };
  const statuses = new Map([['https://feed.example.com/item', 403], ['https://primary.example.com/filing', 404],
    ['https://reporter.example.com/report', 401], ['https://history.example.com/original', 410]]);
  const requested = [], before = structuredClone(f.ledger);
  const result = await checkNewsSourceReadiness({ ...f, request: async (url, options) => {
    requested.push(url);
    assert.equal(options.headers['User-Agent'], SOURCE_READINESS_USER_AGENT);
    assert.deepEqual(options.address, publicAddress);
    return response(statuses.get(url));
  } });
  assert.deepEqual(new Set(requested), new Set(statuses.keys()));
  assert.deepEqual(f.ledger, before);
  assert.equal(result.reviews.length, 1);
  const [review] = result.reviews;
  assert.equal(review.status, 'deferred');
  assert.equal(review.reason, 'source-blocked');
  assert.equal(review.sourceChecks.length, 4);
  for (const check of review.sourceChecks) {
    assert.equal(check.status, statuses.get(check.url));
    assert.ok(['blocked', 'unavailable'].includes(check.outcome));
    assert.equal(check.method, 'GET');
    assert.equal(check.checkedAt, new Date(time).toISOString());
    assert.ok(review.note.includes(`${check.url} -> HTTP ${check.status}`));
  }
  assert.match(review.note, /did not read source content, verify facts, or perform alternate searches/);
  assert.ok(review.retrySearches.some(query => query.startsWith('Find a readable primary')));
  reviewCandidate(f.ledger, day, review, { articles: [], now: time });
  assert.equal(f.ledger.candidates[id].expiresAt, before.candidates[id].expiresAt);
  assert.equal(f.ledger.candidates[id].nextReviewDate, '2026-10-23');
  assert.equal(f.ledger.candidates[id].attempts, 1);
  prepareResearch({ ledger: f.ledger, day: '2026-10-23', now: time + 86400000, articles: [], discovery: { candidates: [], total: 0, feeds: [{ ok: true }] } });
  assert.deepEqual(f.ledger.runs['2026-10-23'].candidateIds, [id]);
  assert.equal(f.ledger.runs['2026-10-23'].outcomes[id], undefined);
  prepareResearch({ ledger: f.ledger, day: '2026-10-26', now: time + 4 * 86400000, articles: [], discovery: { candidates: [], total: 0, feeds: [{ ok: true }] } });
  assert.equal(f.ledger.runs['2026-10-26'].outcomes[id].reason, 'stale');
});

test('only definite denial/unavailability statuses qualify; a 200 is never a read', async () => {
  for (const status of [200, 204, 206, 301, 302, 303, 304, 307, 308, 400, 401, 402, 403, 404, 405, 408, 410, 418, 429, 451, 500, 502, 503, 504]) {
    let calls = 0;
    const result = await checkNewsSourceReadiness({ ...fixture(), request: async () => {
      calls++;
      return { ...response(status), text: () => assert.fail('Availability must not read content'), json: () => assert.fail('Availability must not infer facts') };
    } });
    assert.equal(calls, 1, `HTTP ${status} must not be retried`);
    assert.equal(result.reviews.length, [401, 403, 404, 410, 429, 451].includes(status) ? 1 : 0, `HTTP ${status}`);
    assert.notEqual(result.sourceChecks[0].outcome, 'read');
    if (status >= 200 && status < 300) assert.equal(result.sourceChecks[0].availability, 'responded');
  }
});

test('a blocked feed cannot hide readable link, primary, or earlier checked URLs', async () => {
  for (const location of ['link', 'sources', 'sourceChecks', 'history']) {
    const f = fixture([{ link: 'https://blocked.example.com/feed' }]);
    const [item] = Object.values(f.ledger.candidates), readable = 'https://primary.example.com/filing';
    if (location === 'link') { item.sources = [{ url: item.link }]; item.link = readable; }
    if (location === 'sources') item.sources = [{ url: readable }];
    if (location === 'sourceChecks') item.sourceChecks = [{ url: readable, outcome: 'read' }];
    if (location === 'history') f.ledger.runs['2026-10-21'] = { day: '2026-10-21', status: 'incomplete', candidateIds: [item.id], baselineSlugs: [],
      outcomes: { [item.id]: { status: 'deferred', note: 'Previously found a primary filing needing independent confirmation.', sourceChecks: [{ url: readable, outcome: 'read' }] } } };
    const seen = [];
    const result = await checkNewsSourceReadiness({ ...f, request: async url => { seen.push(url); return response(url === readable ? 200 : 403); } });
    assert.ok(seen.includes(readable), location);
    assert.equal(result.reviews.length, 0, location);
    assert.equal(result.candidates[0].decision, 'research');
  }
});

test('inherited ready fields survive reopening even without an article file; restored and active drafts are protected', async () => {
  const f = fixture([
    { articleSlug: 'saved-draft', status: 'ready' }, { reason: 'verified-event' }, { lastValidationErrors: ['Image credit needs repair'] },
    {}, {}, {}, {},
  ]);
  const items = Object.values(f.ledger.candidates), run = f.ledger.runs[day];
  run.outcomes[items[0].id] = { status: 'ready', articleSlug: 'saved-draft', note: 'Previously verified event with a drafted article pending final audit.' };
  retryUnpublishedDrafts(f.ledger, day);
  assert.equal(items[0].status, 'pending');
  const restored = { day, drafts: [{ id: items[3].id, articleSlug: 'restored-draft', sourceChecks: [{ url: 'https://restored.example.com/source', outcome: 'read' }] }] };
  const articles = [{ slug: 'active-draft', title: 'A completely different headline', sourceUrls: [canonicalNewsUrl(items[4].link)] }];
  f.ledger.runs['2026-10-21'] = { day: '2026-10-21', status: 'incomplete', candidateIds: [items[5].id], baselineSlugs: [],
    outcomes: { [items[5].id]: { status: 'ready', articleSlug: 'earlier-draft', note: 'An earlier ready draft needs its missing file recovered and audited.' } } };
  items[6].mergedInto = items[0].id;
  const requested = [];
  const result = await checkNewsSourceReadiness({ ...f, restored, articles, request: async url => { requested.push(url); return response(403); } });
  assert.ok(requested.includes('https://restored.example.com/source'));
  assert.equal(result.counts.protectedDraftCandidates, 7);
  assert.equal(result.counts.researchCandidates, 7);
  assert.equal(result.reviews.length, 0);
  assert.ok(result.candidates.every(candidate => candidate.protectedReasons.length));
});

test('all 90 blocked leads are checked without a cap while 20 prior drafts remain for research', async () => {
  const f = fixture(Array.from({ length: 110 }, (_, i) => i < 20 ? { articleSlug: `draft-${i}` } : {}));
  let calls = 0;
  const result = await checkNewsSourceReadiness({ ...f, request: async () => { calls++; return response(403); } });
  assert.equal(calls, 110);
  assert.equal(result.counts.unreviewedCandidates, 110);
  assert.equal(result.counts.deferredCandidates, 90);
  assert.equal(result.counts.protectedDraftCandidates, 20);
  assert.equal(result.counts.researchCandidates, 20);
  assert.ok(result.reviews.every(review => !f.ledger.candidates[review.id].articleSlug));
});

test('inherited previousReviews retain every actual source URL and prior ready state across repeated recovery', async () => {
  const f = fixture([
    { previousReviews: [{ source: 'ledger', review: { status: 'deferred', sourceChecks: [{ url: 'https://primary.example.com/filing', outcome: 'read' }] } }] },
    { previousReviews: [{ source: 'restored', review: { previousStatus: 'ready' } }] },
    {},
  ]);
  const [,, item] = Object.values(f.ledger.candidates);
  const restored = { day, drafts: [{ id: item.id, articleSlug: 'saved-story', status: 'unreviewed', previousStatus: 'pending',
    sourceChecks: [{ url: 'https://current.example.com/report', outcome: 'blocked' }],
    previousReviews: [{ source: 'restored', review: { sourceChecks: [{ url: 'https://earlier.example.com/report', outcome: 'read' }],
      previousReviews: [{ source: 'ledger', review: { sourceChecks: [{ url: 'https://oldest.example.com/report', outcome: 'read' }] } }] } }],
  }] };
  const seen = [];
  const result = await checkNewsSourceReadiness({ ...f, restored, request: async url => {
    seen.push(url);
    return response(url === 'https://primary.example.com/filing' ? 200 : 403);
  } });
  assert.equal(result.reviews.length, 0);
  assert.equal(result.counts.protectedDraftCandidates, 2);
  for (const url of ['https://primary.example.com/filing', 'https://current.example.com/report', 'https://earlier.example.com/report', 'https://oldest.example.com/report']) assert.ok(seen.includes(url), url);
});

test('deduplicates transport URLs across candidates but preserves queries and exact attempted URLs', async () => {
  const first = 'https://news.example.com/story?utm_source=feed&b=2&a=1', second = 'https://news.example.com/story?b=2&a=1';
  const f = fixture([{ link: `${first}#section`, sources: [{ url: first }, { url: second }] }, { link: first }]);
  const seen = [];
  const result = await checkNewsSourceReadiness({ ...f, request: async url => { seen.push(url); return response(403); } });
  assert.deepEqual(seen, [first, second]);
  assert.equal(result.reviews.length, 2);
  assert.deepEqual(result.reviews[0].sourceChecks.map(check => check.url), [first, second]);
  assert.deepEqual(result.candidates[0].sourceUrls, [`${first}#section`, first, second]);
});

test('bounded GET and DNS failures remain uncertain without retries', async () => {
  for (const failure of ['dns-timeout', 'get-timeout', 'dns-error', 'tls-error']) {
    let requests = 0, signal;
    const result = await checkNewsSourceReadiness({ ...fixture(), timeoutMs: 15,
      lookupFn: async () => {
        if (failure === 'dns-timeout') return new Promise(() => {});
        if (failure === 'dns-error') throw Object.assign(new Error('DNS failure'), { code: 'ENOTFOUND' });
        return [publicAddress];
      }, request: async (_, options) => {
        requests++; signal = options.signal;
        if (failure === 'get-timeout') return new Promise(() => {});
        throw Object.assign(new Error('TLS failure'), { code: 'CERT_HAS_EXPIRED' });
      },
    });
    assert.equal(result.reviews.length, 0, failure);
    assert.equal(result.sourceChecks[0].availability, 'network-uncertain', failure);
    assert.equal(result.sourceChecks[0].status, null);
    assert.equal(requests, failure.startsWith('dns') ? 0 : 1);
    if (failure === 'get-timeout') assert.equal(signal.aborted, true);
  }
});

test('rejects unsafe URL forms without DNS or network access', async () => {
  const invalid = ['file:///etc/passwd', 'https://localhost/story', 'http://127.0.0.1/story', 'http://2130706433/story',
    'http://0x7f000001/story', 'http://0177.0.0.1/story', 'http://[::1]/story', 'http://[::ffff:127.0.0.1]/story',
    'https://user:pass@news.example.com/story', 'https://news.example.com:8443/story', 'http://service.internal/story',
    'http://service.local/story', 'https://news.example.com./story', 'https://news.example.com\\@localhost/story', 'https://news.example.com/with space'];
  for (const url of invalid) assert.throws(() => publicSourceUrl(url), undefined, url);
  const f = fixture([{ sources: invalid.map(url => ({ url })) }]);
  let calls = 0;
  const result = await checkNewsSourceReadiness({ ...f, request: async () => { calls++; return response(403); },
    lookupFn: async hostname => { assert.equal(hostname, 'news.example.com'); return [publicAddress]; } });
  assert.equal(calls, 1);
  assert.equal(result.reviews.length, 0);
  assert.equal(result.sourceChecks.filter(check => check.availability === 'unsafe-url').length, invalid.length);
});

test('private, mixed-public/private, special IPv4 and IPv6 DNS answers cannot be requested', async () => {
  for (const address of ['0.1.2.3', '10.0.0.1', '100.64.0.1', '127.0.0.1', '169.254.169.254', '172.31.1.1', '192.168.1.1',
    '192.0.2.1', '198.18.0.1', '198.51.100.3', '203.0.113.1', '224.0.0.1', '255.255.255.255', '::', '::1',
    '::ffff:127.0.0.1', '64:ff9b::a00:1', 'fc00::1', 'fe80::1', 'ff02::1', '2001:db8::1', '2002:a00:1::1', '3fff::1']) {
    assert.equal(isPublicSourceAddress(address), false, address);
    const result = await checkNewsSourceReadiness({ ...fixture(), lookupFn: async () => [publicAddress, { address, family: address.includes(':') ? 6 : 4 }],
      request: () => assert.fail('Unsafe DNS answer must not be requested') });
    assert.equal(result.reviews.length, 0);
    assert.equal(result.sourceChecks[0].availability, 'unsafe-url', address);
    assert.equal(result.sourceChecks[0].attempted, false);
  }
  assert.equal(isPublicSourceAddress('2606:4700:4700::1111'), true);
  assert.equal(isPublicSourceAddress('2001:4860:4860::8888'), true);
});

test('transport pins vetted DNS, keeps the public Host/TLS name, sends GET and destroys the unread body', async () => {
  let options, bodyDestroyed = false, requests = 0;
  const controller = new AbortController();
  const result = await requestSourceHeaders('https://news.example.com/story', { address: publicAddress, signal: controller.signal,
    headers: { 'User-Agent': SOURCE_READINESS_USER_AGENT } }, (url, settings, callback) => {
    requests++; options = settings;
    assert.equal(url.hostname, 'news.example.com');
    const request = new EventEmitter();
    request.end = () => queueMicrotask(() => callback({ statusCode: 302, headers: { location: 'http://127.0.0.1/secret' }, destroy: () => { bodyDestroyed = true; } }));
    return request;
  });
  assert.equal(requests, 1);
  assert.equal(result.status, 302);
  assert.equal(bodyDestroyed, true);
  assert.equal(options.method, 'GET');
  assert.equal(options.agent, false);
  assert.equal(options.maxHeaderSize, 16384);
  assert.equal(options.signal, controller.signal);
  options.lookup('news.example.com', {}, (error, address, family) => { assert.equal(error, null); assert.equal(address, publicAddress.address); assert.equal(family, 4); });
  options.lookup('news.example.com', { all: true }, (error, addresses) => { assert.equal(error, null); assert.deepEqual(addresses, [publicAddress]); });
  options.lookup('other.example.com', {}, error => assert.match(error.message, /Unexpected source hostname/));
});

test('redirects never become denials or reach a second URL, including unsafe and automatic redirects', async () => {
  for (const reply of [response(302, { location: 'http://169.254.169.254/latest' }), response(307, { location: '/new-location' }),
    response(301, { location: 'https://other.example.com/story' }), response(302),
    { ...response(403), url: 'https://other.example.com/login', redirected: true }]) {
    let calls = 0;
    const result = await checkNewsSourceReadiness({ ...fixture(), request: async () => { calls++; return reply; } });
    assert.equal(calls, 1);
    assert.equal(result.reviews.length, 0);
    assert.equal(result.sourceChecks[0].availability, 'redirect-ambiguous');
    assert.equal(result.sourceChecks[0].outcome, undefined);
  }
});

test('Retry-After pauses the host without inventing results for unattempted URLs and persists across passes', async () => {
  const f = fixture([{}, {}]);
  let calls = 0;
  const request = async () => { calls++; return response(429, { 'retry-after': '172800' }); };
  const result = await checkNewsSourceReadiness({ ...f, concurrency: 4, request });
  assert.equal(calls, 1);
  assert.equal(result.reviews.length, 1);
  assert.equal(result.sourceChecks[0].retryAt, new Date(time + 172800000).toISOString());
  assert.equal(result.sourceChecks[1].availability, 'retry-after');
  assert.equal(result.sourceChecks[1].attempted, false);
  assert.equal(result.sourceChecks[1].status, null);
  assert.equal(result.cooldowns.length, 1);
  assert.match(result.reviews[0].note, /Retry-After: 172800/);
  const repeated = await checkNewsSourceReadiness({ ...f, now: () => time + 1000, previous: result, request });
  assert.equal(calls, 1);
  assert.equal(repeated.reviews.length, 0);
  assert.equal(repeated.cooldowns.length, 1);
  const expired = await checkNewsSourceReadiness({ ...f, now: () => time + 172800001, previous: repeated,
    request: async () => { calls++; return response(200); } });
  assert.equal(calls, 3);
  assert.equal(expired.cooldowns.length, 0);
});

test('HTTP-date and prior-ledger Retry-After values are honored; malformed or missing 429 hints do not cause retries', async () => {
  for (const retryAfter of [new Date(time + 60000).toUTCString(), 'not-a-date', null]) {
    let calls = 0;
    const result = await checkNewsSourceReadiness({ ...fixture([{}, {}]), request: async () => {
      calls++; return response(429, retryAfter === null ? {} : { 'retry-after': retryAfter });
    } });
    assert.equal(calls, 1);
    assert.equal(result.sourceChecks[1].status, null);
  }
  const f = fixture([{ sourceChecks: [{ url: 'https://news.example.com/prior', outcome: 'blocked', status: 429,
    checkedAt: new Date(time - 1000).toISOString(), retryAfter: '120' }] }]);
  const result = await checkNewsSourceReadiness({ ...f, request: () => assert.fail('Prior Retry-After still active') });
  assert.equal(result.counts.attemptedUrls, 0);
  assert.equal(result.reviews.length, 0);
});

test('a 503 with Retry-After is uncertain and pauses remaining same-host requests', async () => {
  let calls = 0;
  const result = await checkNewsSourceReadiness({ ...fixture([{}, {}]), request: async () => { calls++; return response(503, { 'retry-after': '120' }); } });
  assert.equal(calls, 1);
  assert.equal(result.reviews.length, 0);
  assert.equal(result.sourceChecks[0].availability, 'http-uncertain');
  assert.equal(result.sourceChecks[1].availability, 'retry-after');
});

test('global concurrency is low and each host is strictly sequential', async () => {
  const f = fixture(Array.from({ length: 12 }, (_, i) => ({ link: `https://host-${i % 4}.example.com/story-${i}` })));
  const hostActive = new Map();
  let active = 0, max = 0, calls = 0;
  const result = await checkNewsSourceReadiness({ ...f, concurrency: 2, request: async url => {
    const host = new URL(url).hostname;
    assert.equal(hostActive.get(host) || 0, 0);
    hostActive.set(host, 1); active++; calls++; max = Math.max(max, active);
    await delay(5);
    active--; hostActive.set(host, 0);
    return response(403);
  } });
  assert.equal(calls, 12);
  assert.equal(max, 2);
  assert.equal(result.reviews.length, 12);
});

test('already reviewed and completed runs never get re-reviewed; invalid configuration fails closed', async () => {
  const f = fixture(), [id] = f.ledger.runs[day].candidateIds;
  f.ledger.runs[day].outcomes[id] = { status: 'ready', articleSlug: 'ready-draft', note: 'Existing ready outcome awaiting a separate final editorial audit.' };
  const request = () => assert.fail('Completed reviews must not be reopened');
  const result = await checkNewsSourceReadiness({ ...f, request });
  assert.equal(result.counts.alreadyReviewedCandidates, 1);
  assert.equal(result.counts.unreviewedCandidates, 0);
  f.ledger.runs[day].status = 'completed';
  assert.equal((await checkNewsSourceReadiness({ ...f, request })).reviews.length, 0);
  for (const options of [{ concurrency: 0 }, { concurrency: 5 }, { timeoutMs: 0 }, { timeoutMs: 30001 }, { restored: { day: '2026-10-21', drafts: [] } }]) {
    await assert.rejects(checkNewsSourceReadiness({ ...f, request, ...options }));
  }
});
