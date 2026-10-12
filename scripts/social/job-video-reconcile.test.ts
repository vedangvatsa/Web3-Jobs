import test from 'node:test';
import type {TestContext} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {main, parseReconcileOptions} from './job-video-reconcile.ts';
import type {ReconcileReport} from './job-video-reconcile.ts';
import {createStateStore, validateLedger} from './job-video-state.ts';
import {channels, instagramAccount, platforms} from './job-video-core.ts';
import type {Ledger, Platform, Receipt} from './job-video-core.ts';

const at = '2026-10-12T11:32:06.170Z';
const slot = '2026-10-12:afternoon';
const oldError = 'Error: Video ledger PUT failed: HTTP 409';
const urls = {instagram: 'https://www.instagram.com/reel/existing/', youtube: 'https://www.youtube.com/watch?v=existing', tiktok: 'https://tiktok.com/@hashtagweb3/video/existing'};
const applyEnv = {VIDEO_SLUGS: 'marketing211', VIDEO_DRY_RUN: 'false', GITHUB_ACTIONS: 'true'};
const originalFetch = globalThis.fetch;
process.env.BUFFER_VIDEO_ACCESS_TOKEN = 'offline-test';
process.env.META_PAGE_TOKEN = 'offline-test';

function fixture(): Ledger {
  const state: Ledger = {version: 1, slots: {[slot]: ['marketing211', 'ops63']}, jobs: {}};
  for (const slug of state.slots[slot]) {
    const text = `Saved caption for ${slug}`;
    state.jobs[slug] = {slot, selectedAt: at, verifiedAt: at, reservationId: `reservation-${slug}`, captions: {instagram: text, youtube: text, youtubeTitle: slug, tiktok: text}, receipts: {}};
    for (const platform of platforms) state.jobs[slug].receipts[platform] = {status: 'sent', text, startedAt: at, attemptId: `attempt-${slug}-${platform}`, postId: `${slug}-${platform}`, url: urls[platform]};
  }
  const receipt = state.jobs.marketing211.receipts.tiktok!;
  receipt.status = 'pending'; receipt.error = oldError; delete receipt.url;
  return state;
}

function pendingOnly(platform: Platform, changes: Partial<Receipt> = {}): Ledger {
  const state = fixture();
  state.jobs.marketing211.receipts.tiktok = {...state.jobs.marketing211.receipts.tiktok!, status: 'sent', url: urls.tiktok};
  state.jobs.marketing211.receipts[platform] = {...state.jobs.marketing211.receipts[platform]!, status: 'pending', url: undefined, error: oldError, ...changes};
  const receipt = state.jobs.marketing211.receipts[platform];
  if (receipt.postId === undefined) delete receipt.postId;
  if (receipt.url === undefined) delete receipt.url;
  return state;
}

function bufferPost(receipt = fixture().jobs.marketing211.receipts.tiktok!, changes: Record<string, unknown> = {}) {
  return {id: receipt.postId, channelId: channels.tiktok, channelService: 'tiktok', text: receipt.text, status: 'sent', externalLink: urls.tiktok, createdAt: at, assets: [], ...changes};
}

function instagramPost(receipt: Receipt, changes: Record<string, unknown> = {}) {
  return {id: receipt.postId, owner: {id: instagramAccount}, media_product_type: 'REELS', caption: receipt.text, timestamp: at, permalink: urls.instagram, ...changes};
}

function query(options: RequestInit) {
  const body: unknown = JSON.parse(String(options.body));
  assert.ok(body && typeof body === 'object' && 'query' in body && typeof body.query === 'string');
  return body.query;
}

async function harness(t: TestContext, initial = fixture()) {
  const directory = await fs.mkdtemp(join(tmpdir(), 'job-video-reconcile-'));
  const file = join(directory, 'state.json');
  const original = JSON.stringify(initial, null, 2) + '\n';
  await fs.writeFile(file, original);
  t.after(() => fs.rm(directory, {recursive: true, force: true}));
  let remote = structuredClone(initial), sha = 'sha-1';
  let provider: (url: URL, options: RequestInit) => Response | Promise<Response> = () => Response.json({data: {post: bufferPost()}});
  let putStatus = 200;
  const requests: {url: string; method: string; query?: string}[] = [];
  const writes: Ledger[] = [];
  const reports: ReconcileReport[] = [];
  const network: typeof fetch = async (input, options = {}) => {
    const url = new URL(String(input));
    const method = options.method || 'GET';
    const request = {url: url.href, method, query: undefined as string | undefined};
    requests.push(request);
    if (url.hostname === 'api.github.com') {
      assert.equal(url.pathname, '/repos/vedangvatsa/Web3-Jobs/contents/scripts/social/job-video-state.json');
      if (method === 'GET') {
        assert.equal(url.searchParams.get('ref'), 'main');
        return Response.json({sha, encoding: 'base64', content: Buffer.from(JSON.stringify(remote)).toString('base64')});
      }
      assert.equal(method, 'PUT');
      const body: unknown = JSON.parse(String(options.body));
      assert.ok(body && typeof body === 'object' && 'content' in body && 'sha' in body && 'branch' in body);
      assert.equal(body.branch, 'main'); assert.equal(body.sha, sha);
      const state: unknown = JSON.parse(Buffer.from(String(body.content), 'base64').toString());
      validateLedger(state); writes.push(state);
      if (putStatus !== 200) return Response.json({message: 'Permission denied'}, {status: putStatus});
      remote = structuredClone(state); sha = `sha-${writes.length + 1}`;
      return Response.json({content: {sha}});
    }
    if (url.hostname === 'api.buffer.com') {
      assert.equal(method, 'POST');
      request.query = query(options);
      assert.match(request.query, /^query\b/);
      assert.doesNotMatch(request.query, /\bmutation\b|\bcreatePost\b/);
    } else if (url.hostname === 'graph.facebook.com') {
      assert.equal(method, 'GET'); assert.equal(options.body, undefined);
      assert.doesNotMatch(url.pathname, /media_publish/);
    } else assert.fail(`Unexpected network destination ${url.href}`);
    return provider(url, options);
  };
  globalThis.fetch = network;
  t.after(() => {
    globalThis.fetch = originalFetch;
    for (const request of requests) {
      const url = new URL(request.url);
      if (url.hostname === 'api.github.com') continue;
      if (url.hostname === 'api.buffer.com') {
        assert.equal(request.method, 'POST'); assert.match(request.query || '', /^query\b/);
        assert.doesNotMatch(request.query || '', /\bmutation\b|\bcreatePost\b/);
      } else {
        assert.equal(url.hostname, 'graph.facebook.com'); assert.equal(request.method, 'GET');
        assert.doesNotMatch(url.pathname, /media_publish/);
      }
    }
  });
  const store = createStateStore({file, request: network, token: 'offline-github', sleep: async () => {assert.fail('Unexpected retry');}});
  const run = (args: string[] = [], env: NodeJS.ProcessEnv = {VIDEO_SLUGS: 'marketing211'}) => main(args, env, {
    ...store, report: async report => {reports.push(structuredClone(report));},
  });
  const disk = async () => {
    const value: unknown = JSON.parse(await fs.readFile(file, 'utf8'));
    validateLedger(value); return value;
  };
  return {
    run, requests, writes, reports, disk, original, file, directory,
    get remote() {return remote;},
    setRemote: (state: Ledger) => {remote = structuredClone(state);},
    respond: (response: typeof provider) => {provider = response;},
    failPuts: (status: number) => {putStatus = status;},
    providerRequests: () => requests.filter(request => new URL(request.url).hostname !== 'api.github.com'),
  };
}

test('the whole command defaults to report-only, reads durable main and leaves every ledger file unchanged', async t => {
  const h = await harness(t);
  const latest = fixture(); latest.jobs.ops63.receipts.youtube!.error = 'History added after checkout';
  h.setRemote(latest);
  const report = await h.run();
  assert.equal(report.dryRun, true); assert.deepEqual(report.slugs, ['marketing211']);
  assert.deepEqual(report.results.map(result => result.status), ['already_sent', 'already_sent', 'verified']);
  assert.equal(report.results[2].postId, 'marketing211-tiktok'); assert.equal(report.results[2].url, urls.tiktok);
  assert.equal(report.results[2].previousError, oldError); assert.equal(report.results[2].persisted, false);
  assert.equal(h.requests[0].method, 'GET'); assert.equal(h.providerRequests().length, 1); assert.equal(h.writes.length, 0);
  assert.deepEqual(h.remote, latest);
  assert.equal(await fs.readFile(h.file, 'utf8'), h.original);
  assert.deepEqual(await fs.readdir(h.directory), ['state.json']);
});

test('apply verifies the existing post before its only ledger PUT, preserves history, and creates no provider mutations', async t => {
  const initial = fixture();
  const h = await harness(t, initial);
  h.respond(() => {
    assert.equal(h.writes.length, 0);
    assert.equal(h.remote.jobs.marketing211.receipts.tiktok?.status, 'pending');
    return Response.json({data: {post: bufferPost()}});
  });
  const report = await h.run([], applyEnv);
  assert.equal(report.dryRun, false); assert.equal(report.results[2].status, 'verified'); assert.equal(report.results[2].persisted, true);
  assert.deepEqual(h.requests.map(request => [new URL(request.url).hostname, request.method]), [['api.github.com', 'GET'], ['api.buffer.com', 'POST'], ['api.github.com', 'PUT']]);
  const expected = structuredClone(initial);
  expected.jobs.marketing211.receipts.tiktok = {...expected.jobs.marketing211.receipts.tiktok!, status: 'sent', url: urls.tiktok};
  assert.deepEqual(h.remote, expected); assert.deepEqual(await h.disk(), expected);
  assert.equal(h.remote.jobs.marketing211.receipts.tiktok?.error, oldError);
});

test('CLI modes are explicit, bounded and default-safe', async t => {
  assert.deepEqual(parseReconcileOptions(['--slugs=marketing211'], {}), {slugs: ['marketing211'], dryRun: true});
  assert.deepEqual(parseReconcileOptions(['--slugs', 'marketing211,ops63', '--apply'], {}), {slugs: ['marketing211', 'ops63'], dryRun: false});
  assert.equal(parseReconcileOptions(['--dry-run'], applyEnv).dryRun, true);
  const h = await harness(t);
  await h.run(['--slugs', 'marketing211', '--apply'], {GITHUB_ACTIONS: 'true'});
  assert.equal(h.writes.length, 1);
});

test('missing, unknown and malformed slugs or modes fail before any API reads or writes', async t => {
  const cases: [string[], NodeJS.ProcessEnv][] = [
    [[], {}], [[], {VIDEO_SLUGS: 'missing'}], [[], {VIDEO_SLUGS: 'marketing211,missing'}],
    [[], {VIDEO_SLUGS: 'marketing211,ops63,third'}], [[], {VIDEO_SLUGS: 'marketing211,marketing211'}],
    [[], {VIDEO_SLUGS: 'marketing211,'}], [[], {VIDEO_SLUGS: '__proto__'}],
    [[], {VIDEO_SLUGS: 'marketing211', VIDEO_DRY_RUN: 'invalid'}],
    [['--slugs'], {}], [['--force'], {VIDEO_SLUGS: 'marketing211'}],
    [['--apply', '--dry-run'], {VIDEO_SLUGS: 'marketing211'}],
    [['--slugs=marketing211', '--slugs=ops63'], {}],
    [['--apply'], {VIDEO_SLUGS: 'marketing211'}],
  ];
  for (const [args, env] of cases) {
    const h = await harness(t);
    await assert.rejects(h.run(args, env), /slugs|slug|argument|VIDEO_DRY_RUN|Choose only one|GitHub Actions/);
    assert.deepEqual(h.requests, []); assert.deepEqual(h.writes, []);
    assert.equal(await fs.readFile(h.file, 'utf8'), h.original);
    assert.deepEqual(await fs.readdir(h.directory), ['state.json']);
  }
});

test('pending and provider-error responses remain unconfirmed after one query, with no state reset', {timeout: 2000}, async t => {
  for (const status of ['scheduled', 'error', 'sent']) {
    const h = await harness(t);
    h.respond(() => Response.json({data: {post: bufferPost(undefined, {status, externalLink: undefined, error: {message: 'Provider processing error'}})}}));
    await assert.rejects(h.run([], applyEnv), /reconciliation errors/);
    assert.equal(h.providerRequests().length, 1); assert.equal(h.writes.length, 0);
    assert.equal(h.reports[0].results[2].status, 'unconfirmed');
    assert.match(h.reports[0].results[2].detail || '', /pending|Provider processing error/);
    assert.deepEqual(await h.disk(), fixture()); assert.deepEqual(h.remote, fixture());
    assert.deepEqual(await fs.readdir(h.directory), ['state.json']);
  }
});

test('Buffer ID, ownership, service, text and real HTTPS URL are checked before marking sent', async t => {
  for (const change of [
    {id: 'another-post'}, {channelId: channels.youtube}, {channelService: 'youtube'}, {text: 'Different caption'},
    {externalLink: 'https://example.com/fake'}, {externalLink: 'http://tiktok.com/@hashtagweb3/video/1'},
  ]) {
    const h = await harness(t);
    h.respond(() => Response.json({data: {post: bufferPost(undefined, change)}}));
    await assert.rejects(h.run([], applyEnv), /reconciliation errors/);
    assert.equal(h.writes.length, 0); assert.equal(h.providerRequests().length, 1);
    assert.equal(h.reports[0].results[2].status, 'unconfirmed');
    assert.deepEqual(await h.disk(), fixture());
  }
});

test('an ambiguous provider read is not retried or converted into a rejected creation', async t => {
  const h = await harness(t);
  h.respond(() => {throw new TypeError('Provider connection lost');});
  await assert.rejects(h.run([], applyEnv), error => {
    assert.ok(error instanceof AggregateError);
    assert.match(String(error.errors[0].cause), /Provider connection lost/);
    return true;
  });
  assert.equal(h.providerRequests().length, 1); assert.equal(h.writes.length, 0);
  assert.deepEqual(await h.disk(), fixture());
});

test('an ID-less Buffer receipt uses one bounded lookup and one verification, saving only the verified ID', async t => {
  const initial = pendingOnly('tiktok', {status: 'creating', postId: undefined});
  const receipt = initial.jobs.marketing211.receipts.tiktok!;
  const h = await harness(t, initial);
  h.respond((_url, options) => {
    const post = bufferPost(receipt, {id: 'recovered-post'});
    if (query(options).includes('posts(first:')) {
      assert.match(query(options), /posts\(first: 100,/);
      return Response.json({data: {posts: {edges: [{node: post}]}}});
    }
    return Response.json({data: {post}});
  });
  const report = await h.run([], applyEnv);
  assert.equal(h.providerRequests().length, 2); assert.equal(h.writes.length, 1);
  assert.equal(report.results[2].status, 'verified');
  assert.deepEqual(h.remote.jobs.marketing211.receipts.tiktok, {...receipt, status: 'sent', postId: 'recovered-post', url: urls.tiktok});
});

test('ambiguous or unconfirmed recovered Buffer IDs never change the original creating receipt', {timeout: 2000}, async t => {
  for (const matches of [0, 1, 2]) {
    const initial = pendingOnly('tiktok', {status: 'creating', postId: undefined});
    const h = await harness(t, initial);
    h.respond((_url, options) => {
      const post = bufferPost(initial.jobs.marketing211.receipts.tiktok, {id: 'candidate', status: 'scheduled', externalLink: undefined});
      return query(options).includes('posts(first:')
        ? Response.json({data: {posts: {edges: Array.from({length: matches}, () => ({node: post}))}}})
        : Response.json({data: {post}});
    });
    await assert.rejects(h.run([], applyEnv), /reconciliation errors/);
    assert.equal(h.providerRequests().length, matches === 1 ? 2 : 1);
    assert.equal(h.writes.length, 0); assert.deepEqual(await h.disk(), initial);
    assert.equal(h.reports[0].results[2].postId, undefined);
  }
});

test('an existing Instagram ID is checked directly for owner, caption, timestamp and Reel URL', async t => {
  const initial = pendingOnly('instagram', {status: 'publishing', containerId: 'existing-container', publishAttemptId: 'existing-publish'});
  const receipt = initial.jobs.marketing211.receipts.instagram!;
  const h = await harness(t, initial);
  h.respond(url => {
    assert.equal(url.pathname, `/v21.0/${receipt.postId}`);
    assert.match(url.searchParams.get('fields') || '', /caption,timestamp/);
    return Response.json(instagramPost(receipt));
  });
  const report = await h.run([], applyEnv);
  assert.equal(h.providerRequests().length, 1); assert.equal(h.providerRequests()[0].method, 'GET');
  assert.equal(report.results[0].status, 'verified'); assert.equal(report.results[0].persisted, true);
  assert.deepEqual(h.remote.jobs.marketing211.receipts.instagram, {...receipt, status: 'sent', url: urls.instagram});
});

test('Instagram identity mismatches and non-Reel or non-HTTPS results remain unconfirmed', async t => {
  for (const change of [
    {id: 'different-id'}, {owner: {id: 'different-account'}}, {caption: 'Different caption'},
    {timestamp: undefined}, {timestamp: '2026-01-01T00:00:00Z'}, {media_product_type: 'FEED'},
    {permalink: 'http://www.instagram.com/reel/unsafe/'}, {permalink: 'https://example.com/reel/fake/'},
  ]) {
    const initial = pendingOnly('instagram', {containerId: 'original-container'});
    const h = await harness(t, initial);
    h.respond(() => Response.json(instagramPost(initial.jobs.marketing211.receipts.instagram!, change)));
    await assert.rejects(h.run([], applyEnv), /reconciliation errors/);
    assert.equal(h.writes.length, 0); assert.equal(h.providerRequests().length, 1);
    assert.equal(h.reports[0].results[0].status, 'unconfirmed'); assert.deepEqual(await h.disk(), initial);
  }
});

test('an ID-less Instagram receipt uses bounded published-media lookup and verification, never container publishing', async t => {
  const initial = pendingOnly('instagram', {status: 'publishing', postId: undefined, containerId: 'existing-container'});
  const receipt = initial.jobs.marketing211.receipts.instagram!;
  const h = await harness(t, initial);
  h.respond(url => {
    if (url.pathname === `/v21.0/${instagramAccount}/media`) {
      assert.equal(url.searchParams.get('limit'), '100');
      return Response.json({data: [{id: 'found-media', caption: receipt.text, timestamp: at, permalink: urls.instagram}]});
    }
    assert.equal(url.pathname, '/v21.0/found-media');
    return Response.json(instagramPost(receipt, {id: 'found-media'}));
  });
  const report = await h.run([], applyEnv);
  assert.equal(h.providerRequests().length, 2);
  assert.ok(h.providerRequests().every(request => request.method === 'GET'));
  assert.equal(report.results[0].status, 'verified');
  assert.deepEqual(h.remote.jobs.marketing211.receipts.instagram, {...receipt, status: 'sent', postId: 'found-media', url: urls.instagram});
});

test('absent or ambiguous Instagram matches preserve publishing status and the container ID', async t => {
  for (const count of [0, 2]) {
    const initial = pendingOnly('instagram', {status: 'publishing', postId: undefined, containerId: 'original-container'});
    const h = await harness(t, initial);
    h.respond(() => Response.json({data: Array.from({length: count}, (_, index) => ({id: `candidate-${index}`, caption: initial.jobs.marketing211.captions.instagram, timestamp: at, permalink: urls.instagram}))}));
    await assert.rejects(h.run([], applyEnv), /reconciliation errors/);
    assert.equal(h.providerRequests().length, 1); assert.equal(h.writes.length, 0);
    assert.deepEqual(await h.disk(), initial); assert.equal(h.reports[0].results[0].status, 'unconfirmed');
  }
});

test('sent, absent and explicitly rejected receipts never trigger provider creation or verification', async t => {
  const initial = fixture();
  delete initial.jobs.marketing211.receipts.youtube;
  initial.jobs.marketing211.receipts.tiktok!.status = 'rejected';
  delete initial.jobs.marketing211.receipts.tiktok!.postId;
  const h = await harness(t, initial);
  await assert.rejects(h.run([], applyEnv), /reconciliation errors/);
  assert.deepEqual(h.reports[0].results.map(result => result.status), ['already_sent', 'not_attempted', 'unconfirmed']);
  assert.equal(h.providerRequests().length, 0); assert.equal(h.writes.length, 0); assert.deepEqual(await h.disk(), initial);
  const sentOnly = await h.run(['--slugs=ops63'], applyEnv);
  assert.ok(sentOnly.results.every(result => result.status === 'already_sent'));
  assert.equal(h.providerRequests().length, 0); assert.equal(h.writes.length, 0);
});

test('persistence failure reports verified-but-unsaved, retains real evidence and stops later provider reads', async t => {
  const initial = fixture(); initial.jobs.ops63.receipts.tiktok!.status = 'pending';
  const h = await harness(t, initial);
  h.failPuts(403);
  await assert.rejects(h.run(['--slugs=marketing211,ops63'], applyEnv), error => {
    assert.ok(error instanceof AggregateError); assert.match(error.errors[0].message, /HTTP 403/); return true;
  });
  assert.equal(h.providerRequests().length, 1); assert.equal(h.writes.length, 1);
  const result = h.reports[0].results[2];
  assert.equal(result.status, 'verified'); assert.equal(result.persisted, false); assert.match(result.detail || '', /persistence failed/);
  assert.equal(h.remote.jobs.marketing211.receipts.tiktok?.status, 'pending');
  assert.deepEqual((await h.disk()).jobs.marketing211.receipts.tiktok, {...initial.jobs.marketing211.receipts.tiktok, status: 'sent', url: urls.tiktok});
});

test('partial reconciliation persists only the verified receipt and reports the unconfirmed one as an error', {timeout: 2000}, async t => {
  const initial = fixture();
  initial.jobs.marketing211.receipts.instagram!.status = 'pending';
  delete initial.jobs.marketing211.receipts.instagram!.url;
  const h = await harness(t, initial);
  h.respond(url => url.hostname === 'graph.facebook.com'
    ? Response.json(instagramPost(initial.jobs.marketing211.receipts.instagram!))
    : Response.json({data: {post: bufferPost(undefined, {status: 'scheduled', externalLink: undefined})}}));
  await assert.rejects(h.run([], applyEnv), /1 video reconciliation errors/);
  const expected = structuredClone(initial);
  expected.jobs.marketing211.receipts.instagram = {...expected.jobs.marketing211.receipts.instagram!, status: 'sent', url: urls.instagram};
  assert.equal(h.writes.length, 1); assert.equal(h.providerRequests().length, 2);
  assert.deepEqual(h.remote, expected); assert.deepEqual(await h.disk(), expected);
  assert.deepEqual(h.reports[0].results.map(result => [result.status, result.persisted]), [['verified', true], ['already_sent', false], ['unconfirmed', false]]);
});

test('reconciliation import has no CLI execution or network requests', async t => {
  const h = await harness(t);
  const moduleUrl = new URL('./job-video-reconcile.ts?import-test', import.meta.url).href;
  const imported = await import(moduleUrl);
  assert.equal(typeof imported.main, 'function'); assert.equal(h.requests.length, 0);
  assert.equal(await fs.readFile(h.file, 'utf8'), h.original);
});

test('workflow reconciliation and publication are mutually exclusive and retain the shared concurrency lock', async () => {
  const workflow = await fs.readFile(new URL('../../.github/workflows/post-job-videos-social.yml', import.meta.url), 'utf8');
  const steps = workflow.split(/^      - name: /m).slice(1);
  const step = (name: string) => {
    const found = steps.filter(step => step.startsWith(name + '\n'));
    assert.equal(found.length, 1); return found[0];
  };
  const publish = step('Publish or resume two videos'), reconcile = step('Reconcile existing video receipts');
  const condition = (step: string) => step.match(/^        if: (.+)$/m)?.[1];
  assert.equal(condition(publish), '${{ !inputs.reconcile_only }}');
  assert.equal(condition(reconcile), '${{ inputs.reconcile_only }}');
  const enabled = (step: string, input: boolean | undefined) => condition(step) === '${{ inputs.reconcile_only }}' ? Boolean(input) : !input;
  for (const input of [undefined, false, true]) {
    assert.equal(Number(enabled(publish, input)) + Number(enabled(reconcile, input)), 1);
    assert.equal(enabled(reconcile, input), input === true);
  }
  const manualInputs = workflow.split('  workflow_call:')[0];
  assert.match(manualInputs, /      reconcile_only:\n        description: [^\n]+\n        type: boolean\n        default: false/);
  assert.match(manualInputs, /      dry_run:\n        description: [^\n]+\n        type: boolean\n        default: true/);
  assert.match(workflow, /^concurrency:\n  group: social-job-videos\n  cancel-in-progress: false$/m);
  assert.match(publish, /node scripts\/social\/post-job-videos\.ts/);
  assert.equal(workflow.match(/node scripts\/social\/post-job-videos\.ts/g)?.length, 1);
  assert.equal(workflow.match(/node scripts\/social\/job-video-reconcile\.ts/g)?.length, 1);
  assert.doesNotMatch(reconcile, /post-job-videos\.ts|bufferCreate|media_publish/);
  assert.match(reconcile, /VIDEO_SLUGS: \$\{\{ inputs\.slugs \}\}/);
  assert.match(reconcile, /VIDEO_DRY_RUN: \$\{\{ inputs\.dry_run \}\}/);
  assert.match(reconcile, /run: node scripts\/social\/job-video-reconcile\.ts/);
  assert.match(step('Test video publishing and receipt persistence'), /node --test scripts\/social\/job-video-\*\.test\.ts/);
  const retain = step('Retain video receipts');
  assert.match(retain, /if: always\(\)/); assert.match(retain, /job-video-state\.recovery\.jsonl/);
});
