import assert from 'node:assert/strict';
import test, { type TestContext } from 'node:test';
import fs from 'node:fs/promises';
import { setImmediate } from 'node:timers/promises';
import { parseDocument } from 'yaml';
import { postingSlot } from './posting-slot.mjs';
import { createJobSocialSlotGuard } from './job-social-slot';
import { main, postToThreads, postToBluesky } from './post-job-openings';
import { deliverSocialPost, validateSocialState, type SocialState, type SocialHistoryEntry } from './job-social-state';
import { linkedInTargets } from './linkedin-targets';
import { BUFFER_X_CHANNEL_ID } from './buffer-x';

const date = '2026-10-22';
const slot = postingSlot('morning', date);
const scheduled = { SOCIAL_PUBLISH_SLOT: 'morning', SOCIAL_PUBLISH_DATE: date };
const companyTargets = linkedInTargets({ NODE_ENV: 'test' });
const empty = (): SocialState => ({ lastIndex: 0, postedSlugs: [], pendingSlugs: [], history: [] });
const job = {
  id: 'employer-1', slug: 'engineer1', company: 'Example', title: 'Engineer', active: true,
  link: 'https://careers.example.com/roles/engineer1', date: '2026-10-21T03:30:00Z', dateVerified: true,
};
const text = 'Example is hiring Engineer: https://hashtagweb3.com/engineer1/th';
const entry = (platform = 'threads'): SocialHistoryEntry => ({
  slug: job.slug, company: job.company, title: job.title, platform, postedAt: '2026-10-22T04:29:00Z',
  expectedText: text, snapshot: { ...job }, payload: { text },
});

function cliFixture(t: TestContext, platform = 'x', now = slot.end - 60000) {
  const env = { ...process.env }, argv = process.argv;
  t.after(() => { process.env = env; process.argv = argv; });
  Object.assign(process.env, scheduled, {
    BUFFER_ACCESS_TOKEN: 'offline', THREADS_ACCESS_TOKEN: 'offline', THREADS_USER_ID: 'threads-id',
    BLUESKY_APP_PASSWORD: 'offline', NEYNAR_API_KEY: 'offline', FARCASTER_SIGNER_UUID: 'offline',
    META_PAGE_ID: 'facebook-id', META_PAGE_TOKEN: 'offline', LINKEDIN_PERSONAL_ENABLED: 'false',
    BUFFER_LINKEDIN_CHANNEL_ID: companyTargets[0].channelId,
    BUFFER_CVINBIO_CHANNEL_ID: companyTargets[1].channelId,
  });
  delete process.env.GITHUB_TOKEN;
  process.argv = ['node', 'poster', '--platform', platform, '--slug', job.slug, '--force'];
  const clock = { now };
  t.mock.method(Date, 'now', () => clock.now);
  for (const method of ['log', 'warn', 'error'] as const) t.mock.method(console, method, () => {});
  const state = empty(), saves: SocialState[] = [];
  const store = {
    loadState: async () => state,
    saveState: async () => { validateSocialState(state); saves.push(structuredClone(state)); },
  };
  return { clock, state, saves, store };
}

function mockSite(t: TestContext, extra: (url: string, init?: RequestInit) => Promise<Response | void>) {
  t.mock.method(globalThis, 'fetch', async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input);
    const response = await extra(url, init);
    if (response) return response;
    if (url.endsWith('/data/jobs-runtime.json')) return Response.json([job]);
    if (url === job.link) return new Response('<h1>Engineer at Example</h1><a href="apply">Apply now</a>', { headers: { 'content-type': 'text/html' } });
    if (url.includes('/og/jobs/')) return new Response(new Uint8Array(1500), { headers: { 'content-type': 'image/png' } });
    if (url.startsWith('https://hashtagweb3.com/engineer1/')) return new Response('<meta property="og:title" content="Engineer at Example"><meta property="og:image" content="https://hashtagweb3.com/og/jobs/engineer1.png?v=7">');
    throw new Error(`Unexpected request: ${init?.method || 'GET'} ${url}`);
  });
}

test('scheduled social uses the shared inclusive start and exclusive 60-minute end in every slot', () => {
  for (const name of ['morning', 'afternoon', 'evening']) {
    const window = postingSlot(name, date);
    let now = window.start - 1;
    const env = { SOCIAL_PUBLISH_SLOT: name, SOCIAL_PUBLISH_DATE: date };
    const guard = createJobSocialSlotGuard({ env, now: () => now });
    assert.throws(guard.assertOpen, /Outside posting window/);
    now = window.start; assert.doesNotThrow(guard.assertOpen);
    now = window.end - 1; assert.doesNotThrow(guard.assertOpen);
    now = window.end; assert.throws(guard.assertOpen, /Outside posting window/);
    env.SOCIAL_PUBLISH_SLOT = ''; env.SOCIAL_PUBLISH_DATE = '';
    assert.throws(guard.assertOpen, /Outside posting window/);
    now = NaN; assert.throws(guard.assertOpen, /Outside posting window/);
  }
  for (const env of [{}, { SOCIAL_PUBLISH_SLOT: '', SOCIAL_PUBLISH_DATE: '' }]) {
    assert.doesNotThrow(createJobSocialSlotGuard({ env, now: () => slot.end + 86400000 }).assertOpen);
  }
  for (const env of [{ SOCIAL_PUBLISH_SLOT: 'morning' }, { SOCIAL_PUBLISH_DATE: date }]) {
    assert.throws(() => createJobSocialSlotGuard({ env }), /Invalid posting/);
  }
});

test('partial and malformed scheduling metadata fail before state access, even with force', async t => {
  cliFixture(t);
  t.mock.method(globalThis, 'fetch', async () => assert.fail('Invalid metadata must not request anything'));
  for (const env of [
    { SOCIAL_PUBLISH_SLOT: 'morning', SOCIAL_PUBLISH_DATE: '' },
    { SOCIAL_PUBLISH_SLOT: '', SOCIAL_PUBLISH_DATE: date },
    { ...scheduled, SOCIAL_PUBLISH_SLOT: 'recovery' },
    { ...scheduled, SOCIAL_PUBLISH_DATE: '2026-02-30' },
    { ...scheduled, SOCIAL_PUBLISH_DATE: '2026-10-22T03:30:00Z' },
    { SOCIAL_PUBLISH_SLOT: ' ', SOCIAL_PUBLISH_DATE: ' ' },
  ]) {
    Object.assign(process.env, env);
    await assert.rejects(main({ store: { loadState: async () => assert.fail('No claims'), saveState: async () => assert.fail('No writes') } }), /Invalid posting/);
  }
});

test('expiry during employer proof blocks claims; expiry during claim persistence blocks the provider', async () => {
  for (const expires of ['preflight', 'claim']) {
    let now = slot.end - 1, saves = 0;
    const state = empty();
    const guard = createJobSocialSlotGuard({ env: scheduled, now: () => now });
    const beforeSend = guard.beforeSend(async () => { if (expires === 'preflight') now = slot.end; });
    await assert.rejects(deliverSocialPost({
      state, entry: entry(), beforeSend,
      save: async () => { saves++; now = slot.end; },
      send: async () => assert.fail('No expired creation'),
    }), /Outside posting window/);
    if (expires === 'preflight') {
      assert.deepEqual(state, empty()); assert.equal(saves, 0);
    } else {
      assert.equal(state.history.length, 1);
      assert.equal(state.history[0].verification, 'creating');
      assert.equal(state.history[0].postId, undefined);
      assert.match(state.history[0].error!, /Outside posting window/);
    }
  }
});

test('expired CLI runs reconcile historical X, Threads and LinkedIn IDs without loading jobs or creating claims', async t => {
  const h = cliFixture(t, 'all', slot.end);
  const [linkedin] = companyTargets;
  for (const platform of ['x', 'threads', 'linkedin']) h.state.history.push({
    ...entry(platform), snapshot: { ...job, date: '2024-01-01T00:00:00Z' },
    postId: `${platform}-known`, verification: 'pending',
    ...(platform === 'threads' ? {} : { provider: 'buffer', account: platform === 'x' ? 'hashtag_web3' : linkedin.channelId }),
  });
  h.state.pendingSlugs.push(job.slug);
  const readIds: string[] = [];
  t.mock.method(globalThis, 'fetch', async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input);
    if (url.includes('graph.threads.net')) {
      assert.equal(init?.method, undefined);
      if (url.includes('/me?')) return Response.json({ id: 'threads-id', username: 'hashtagweb3' });
      assert.ok(url.includes('/threads-known?')); readIds.push('threads-known');
      return Response.json({ id: 'threads-known', username: 'hashtagweb3', text, permalink: 'https://www.threads.net/@hashtagweb3/post/known' });
    }
    assert.equal(url, 'https://api.buffer.com/graphql');
    const body = JSON.parse(String(init?.body));
    assert.match(body.query, /^query (?:XReceipt|LinkedInReceipt)/);
    readIds.push(body.variables.id);
    const x = body.variables.id === 'x-known';
    assert.ok(x || body.variables.id === 'linkedin-known');
    return Response.json({ data: { post: {
      id: body.variables.id, text, channelId: x ? BUFFER_X_CHANNEL_ID : linkedin.channelId,
      channelService: x ? 'twitter' : 'linkedin', status: 'sent',
      externalLink: x ? 'https://x.com/hashtag_web3/status/123' : 'https://www.linkedin.com/feed/update/urn:li:share:123',
    } } });
  });
  await assert.rejects(main({ store: h.store }), /Outside posting window/);
  assert.deepEqual(readIds.sort(), ['linkedin-known', 'threads-known', 'x-known']);
  assert.equal(h.state.history.length, 3);
  for (const receipt of h.state.history) {
    assert.equal(receipt.verification, 'verified');
    assert.equal(receipt.attemptId, undefined);
    assert.equal(receipt.snapshot!.date, '2024-01-01T00:00:00Z');
  }
  assert.ok(h.saves.some(state => state.history.every(receipt => receipt.verification === 'verified')));
});

test('a deploy wait crossing the end prevents even a pending slug or provider claim', async t => {
  const h = cliFixture(t);
  process.env.GITHUB_TOKEN = 'offline';
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const waiting = Promise.withResolvers<void>();
  let checks = 0;
  mockSite(t, async url => {
    if (url.endsWith('/commits/main')) return Response.json({ sha: 'head' });
    if (url.endsWith('/check-runs')) {
      if (++checks === 1) { waiting.resolve(); return Response.json({ check_runs: [{ name: 'App Hosting', status: 'in_progress' }] }); }
      return Response.json({ check_runs: [] });
    }
  });
  const attempt = assert.rejects(main({ store: h.store }), /Outside posting window/);
  await Promise.race([waiting.promise, attempt]); await setImmediate();
  h.clock.now = slot.end; t.mock.timers.tick(60000);
  await attempt;
  assert.equal(checks, 2);
  assert.deepEqual(h.state.history, []); assert.deepEqual(h.state.pendingSlugs, []);
});

test('preview latency cannot create a pending slug after the slot closes', async t => {
  const h = cliFixture(t);
  mockSite(t, async url => { if (url.startsWith('https://hashtagweb3.com/engineer1/x')) h.clock.now = slot.end; });
  await assert.rejects(main({ store: h.store }), /Outside posting window/);
  assert.deepEqual(h.state.history, []); assert.deepEqual(h.state.pendingSlugs, []);
});

for (const manual of [false, true]) test(manual
  ? 'explicit manual CLI commands without scheduled metadata preserve publication and receipt checks'
  : 'an accepted X post can be checkpointed and read back after expiry without another mutation', async t => {
  const h = cliFixture(t, 'x', manual ? slot.end + 60000 : slot.end - 60000);
  if (manual) { delete process.env.SOCIAL_PUBLISH_SLOT; delete process.env.SOCIAL_PUBLISH_DATE; }
  let creates = 0, reads = 0, expectedText = '';
  mockSite(t, async (url, init) => {
    if (url !== 'https://api.buffer.com/graphql') return;
    const body = JSON.parse(String(init?.body));
    if (body.query.includes('XChannel')) return Response.json({ data: { channel: { id: BUFFER_X_CHANNEL_ID, name: 'hashtag_web3', service: 'twitter' } } });
    if (body.query.includes('mutation')) {
      if (!manual) assert.ok(h.clock.now < slot.end);
      creates++; expectedText = body.variables.input.text; h.clock.now = slot.end;
      return Response.json({ data: { createPost: { post: { id: 'accepted-x' } } } });
    }
    assert.match(body.query, /^query XReceipt/); reads++;
    assert.equal(h.saves.at(-1)!.history[0].postId, 'accepted-x');
    return Response.json({ data: { post: { id: 'accepted-x', text: expectedText, channelId: BUFFER_X_CHANNEL_ID, channelService: 'twitter', status: 'sent', externalLink: 'https://x.com/hashtag_web3/status/123' } } });
  });
  await main({ store: h.store });
  assert.equal(creates, 1); assert.equal(reads, 1);
  assert.equal(h.state.history[0].verification, 'verified');
});

for (const platform of ['x', 'linkedin']) test(`${platform} channel lookup latency blocks the new Buffer mutation`, async t => {
  const h = cliFixture(t, platform);
  let reads = 0;
  mockSite(t, async (url, init) => {
    if (url !== 'https://api.buffer.com/graphql') return;
    const body = JSON.parse(String(init?.body));
    assert.match(body.query, /^query (?:XChannel|LinkedInChannel)/);
    reads++; h.clock.now = slot.end;
    return Response.json({ data: { channel: {
      id: body.variables.id, service: platform === 'x' ? 'twitter' : 'linkedin',
      name: platform === 'x' ? 'hashtag_web3' : 'hashtagweb3',
    } } });
  });
  await assert.rejects(main({ store: h.store }), /Incomplete social publish/);
  assert.equal(reads, 1);
  assert.equal(h.state.history.length, 1);
  assert.equal(h.state.history[0].verification, 'creating');
  assert.equal(h.state.history[0].postId, undefined);
});

test('an in-window X failure still allows an independent Facebook attempt and preserves both outcomes', async t => {
  const h = cliFixture(t, 'all');
  Object.assign(process.env, { FARCASTER_CHANNEL_IDS: '', FARCASTER_POST_TO_PROFILE: 'false' });
  for (const platform of ['threads', 'bluesky']) h.state.history.push({ ...entry(platform), verification: 'verified', postId: `${platform}-known` });
  for (const target of companyTargets) h.state.history.push({ ...entry('linkedin'), verification: 'verified', postId: target.channelId, account: target.channelId });
  const creates: string[] = [];
  mockSite(t, async (url, init) => {
    if (url === 'https://api.buffer.com/graphql') {
      const body = JSON.parse(String(init?.body));
      if (body.query.includes('XChannel')) return Response.json({ data: { channel: { id: BUFFER_X_CHANNEL_ID, name: 'hashtag_web3', service: 'twitter' } } });
      assert.match(body.query, /mutation/); creates.push('x'); throw new Error('Provider response lost');
    }
    if (!url.startsWith('https://graph.facebook.com/')) return;
    if (url.includes('/me?')) return Response.json({ id: 'facebook-id', name: 'Example' });
    assert.ok(h.clock.now < slot.end);
    if (url.endsWith('/feed')) { creates.push('facebook-feed'); return Response.json({ id: 'facebook-accepted' }); }
    creates.push('facebook-scrape');
    return Response.json({ title: 'Engineer at Example', image: [{ url: 'https://hashtagweb3.com/og/jobs/engineer1.png?v=7' }] });
  });
  await assert.rejects(main({ store: h.store }), /Unverified social deliveries remain/);
  assert.deepEqual(creates, ['x', 'facebook-scrape', 'facebook-feed']);
  assert.equal(h.state.history.find(receipt => receipt.platform === 'x')!.verification, 'creating');
  assert.equal(h.state.history.find(receipt => receipt.platform === 'facebook')!.postId, 'facebook-accepted');
  assert.equal(h.state.history.find(receipt => receipt.platform === 'facebook')!.verification, 'verified');
});

test('Threads account latency blocks creation and container processing latency blocks publishing', async t => {
  const h = cliFixture(t, 'threads');
  const guard = createJobSocialSlotGuard();
  const beforeSend = guard.beforeSend(async () => {});
  t.mock.method(globalThis, 'fetch', async (_url: string | URL | Request, init?: RequestInit) => {
    assert.equal(init?.method, undefined); h.clock.now = slot.end;
    return Response.json({ id: 'threads-id', username: 'hashtagweb3' });
  });
  await assert.rejects(postToThreads(text, 'https://hashtagweb3.com/engineer1/th', beforeSend), /Outside posting window/);

  h.clock.now = slot.end - 1;
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const processing = Promise.withResolvers<void>();
  let creates = 0;
  t.mock.method(globalThis, 'fetch', async (url: string | URL | Request, init?: RequestInit) => {
    if (!init?.method) return Response.json({ id: 'threads-id', username: 'hashtagweb3' });
    assert.ok(String(url).endsWith('/threads'), 'No publish after container processing');
    creates++; return Response.json({ id: 'container-known' });
  });
  const options = {
    state: h.state, entry: entry(), beforeSend,
    save: async () => { await h.store.saveState(); if (h.state.history[0]?.containerId) processing.resolve(); },
    send: (checkpoint: (fields: { containerId: string }) => Promise<void>) => postToThreads(text, 'https://hashtagweb3.com/engineer1/th', beforeSend, checkpoint),
  };
  const attempt = assert.rejects(deliverSocialPost(options), /Outside posting window/);
  await Promise.race([processing.promise, attempt]); await setImmediate();
  h.clock.now = slot.end; t.mock.timers.tick(3000);
  await attempt;
  assert.equal(creates, 1);
  assert.equal(h.state.history[0].containerId, 'container-known');
  assert.equal(h.state.history[0].postId, undefined);
  await assert.rejects(deliverSocialPost(options), /read-only reconciliation/);
  assert.equal(creates, 1);
});

test('Bluesky image latency cannot upload a new blob or create a post after expiry', async t => {
  const h = cliFixture(t, 'bluesky');
  let sessions = 0;
  t.mock.method(globalThis, 'fetch', async (input: string | URL | Request) => {
    const url = String(input);
    if (url.endsWith('createSession')) { sessions++; return Response.json({ accessJwt: 'offline', did: 'did:plc:fixture' }); }
    assert.equal(url, 'https://hashtagweb3.com/og/jobs/engineer1.png');
    h.clock.now = slot.end;
    return new Response(new Uint8Array(1500), { headers: { 'content-type': 'image/png' } });
  });
  await assert.rejects(postToBluesky(text, 'https://hashtagweb3.com/engineer1/bsky', 'https://hashtagweb3.com/og/jobs/engineer1.png', job.company, job.title, 'Build systems.', createJobSocialSlotGuard().beforeSend(async () => {})), /Outside posting window/);
  assert.equal(sessions, 1);
});

test('Facebook account latency blocks the preview mutation and post claim after expiry', async t => {
  const h = cliFixture(t, 'facebook');
  let reads = 0;
  mockSite(t, async (url, init) => {
    if (!url.startsWith('https://graph.facebook.com/')) return;
    assert.ok(url.includes('/me?')); assert.equal(init?.method, undefined);
    reads++; h.clock.now = slot.end;
    return Response.json({ id: 'facebook-id', name: 'Example' });
  });
  await assert.rejects(main({ store: h.store }), /Incomplete social publish/);
  assert.equal(reads, 1); assert.deepEqual(h.state.history, []);
});

for (const boundary of ['initialize', 'upload', 'post']) {
  test(`personal LinkedIn stops before ${boundary} after an earlier request crosses the end`, async t => {
    const h = cliFixture(t, 'linkedin');
    Object.assign(process.env, { LINKEDIN_PERSONAL_ENABLED: 'true', LINKEDIN_PERSONAL_ACCESS_TOKEN: 'offline', LINKEDIN_PERSONAL_MEMBER_ID: 'member', LINKEDIN_PERSONAL_TOKEN_EXPIRES_AT: '2026-10-23T00:00:00Z' });
    for (const target of companyTargets) h.state.history.push({ ...entry('linkedin'), account: target.channelId, verification: 'verified', postId: target.channelId });
    const writes: string[] = [];
    let initialized = false;
    mockSite(t, async (url, init) => {
      if (initialized && url === 'https://hashtagweb3.com/og/jobs/engineer1.png?v=7') {
        if (boundary === 'initialize') h.clock.now = slot.end;
        return;
      }
      if (!url.startsWith('https://api.linkedin.com/')) return;
      if (url.endsWith('/userinfo')) {
        initialized = true;
        return Response.json({ sub: 'member', name: 'Fixture' });
      }
      writes.push(url);
      if (url.includes('initializeUpload')) {
        assert.notEqual(boundary, 'initialize');
        if (boundary === 'upload') h.clock.now = slot.end;
        return Response.json({ value: { image: 'urn:li:image:fixture', uploadUrl: 'https://api.linkedin.com/upload/fixture' } });
      }
      assert.equal(url, 'https://api.linkedin.com/upload/fixture'); assert.equal(init?.method, 'PUT');
      assert.equal(boundary, 'post'); h.clock.now = slot.end;
      return new Response(null, { status: 201 });
    });
    await assert.rejects(main({ store: h.store }), /Incomplete social publish/);
    assert.equal(writes.length, ['initialize', 'upload', 'post'].indexOf(boundary));
    const claim = h.state.history.find(receipt => receipt.provider === 'linkedin-direct')!;
    assert.equal(claim.verification, 'creating'); assert.equal(claim.postId, undefined);
  });
}

test('the parent passes scheduled date/slot while standalone manual dispatch keeps them absent', async () => {
  const read = async (name: string) => {
    const document = parseDocument(await fs.readFile(new URL(`../../.github/workflows/${name}`, import.meta.url), 'utf8'), { uniqueKeys: true });
    assert.deepEqual(document.errors, []); return document.toJS();
  };
  const parent = await read('refresh-jobs-cache.yml'), child = await read('post-job-openings-social.yml');
  assert.deepEqual(parent.jobs['post-openings'].with, { date: '${{ needs.gate.outputs.date }}', slot: '${{ needs.gate.outputs.slot }}' });
  const publish = child.jobs['post-opening'].steps.find((step: { id?: string }) => step.id === 'publish');
  for (const name of ['slot', 'date']) {
    assert.equal(child.on.workflow_call.inputs[name].required, true);
    assert.equal(child.on.workflow_dispatch.inputs[name], undefined);
    assert.equal(publish.env[`SOCIAL_PUBLISH_${name.toUpperCase()}`], `\${{ inputs.${name} }}`);
  }
  assert.ok(child.jobs['post-opening'].steps.some((step: { run?: string }) => step.run?.includes('scripts/social/job-social-*.test.ts')));
});
