import test, {type TestContext} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {main} from './post-job-openings';
import {SocialStateError, type SocialState, type SocialHistoryEntry} from './job-social-state';

const now = Date.parse('2026-10-16T08:00:00Z');
const fresh = {id: 'new-source', slug: 'fresh1', company: 'Fresh Employer', title: 'Engineer', date: '2026-10-15T00:00:00Z', dateVerified: true, active: true, link: 'https://careers.example.com/roles/fresh1'};
const oldSlugs = ['cmp101', 'mgr89'];

async function fixture(t: TestContext, args: string[] = ['--platform', 'all']) {
  const ledger: SocialState = JSON.parse(await fs.readFile(new URL('./jobs-social-posted.json', import.meta.url), 'utf8'));
  const history = ledger.history.filter(entry => oldSlugs.includes(entry.slug));
  assert.equal(history.length, 48);
  const state: SocialState = {lastIndex: 0, postedSlugs: [], pendingSlugs: [...oldSlugs], history: structuredClone(history)};
  const jobs = [...oldSlugs.map(slug => history.find(entry => entry.slug === slug)!.snapshot!), fresh];
  const argv = process.argv, env = {...process.env};
  t.after(() => {process.argv = argv; process.env = env;});
  process.argv = ['node', 'post-job-openings', ...args];
  t.mock.method(Date, 'now', () => now);
  for (const name of ['log', 'warn', 'error'] as const) t.mock.method(console, name, () => {});
  Object.assign(process.env, {BUFFER_ACCESS_TOKEN: 'offline', THREADS_ACCESS_TOKEN: 'offline', THREADS_USER_ID: 'threads-account',
    BLUESKY_APP_PASSWORD: 'offline', NEYNAR_API_KEY: 'offline', FARCASTER_SIGNER_UUID: 'offline', META_PAGE_ID: 'page', META_PAGE_TOKEN: 'offline',
    FARCASTER_POST_TO_PROFILE: 'true', FARCASTER_CHANNEL_IDS: '', LINKEDIN_PERSONAL_ENABLED: 'false',
    BUFFER_X_CHANNEL_ID: 'x-channel', BUFFER_LINKEDIN_CHANNEL_ID: 'li-web3', BUFFER_CVINBIO_CHANNEL_ID: 'li-cv'});
  delete process.env.GITHUB_TOKEN;
  const mutations: {url: string; text: string}[] = [], events: string[] = [], saved: SocialState[] = [];
  const posts = new Map<string, {id: string; channelId: string; channelService: string; text: string}>();
  let employerProof = false;
  const h = {state, jobs, history, mutations, events, saved, failReceiptSave: false};
  const store = {
    loadState: async () => state,
    saveState: async () => {
      saved.push(structuredClone(state));
      if (h.failReceiptSave && state.history.some(entry => entry.slug === fresh.slug && entry.postId)) throw new SocialStateError('receipt persistence failed');
    },
  };
  const mutation = (url: string, text: string) => {
    assert.ok(employerProof, `fresh employer GET required before ${url}`);
    employerProof = false;
    assert.ok(!oldSlugs.some(slug => text.includes(`/${slug}/`)), 'Recovered job must never be recreated');
    mutations.push({url, text}); events.push('create');
  };
  t.mock.method(globalThis, 'fetch', async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input);
    if (url.endsWith('/data/jobs-runtime.json')) {assert.equal(init?.method, 'GET'); return Response.json(jobs);}
    const job = jobs.find(job => job.link === url);
    if (job) {
      assert.equal(init?.method, 'GET'); employerProof = true; events.push(`employer:${job.slug}`);
      return new Response(`<h1>${job.title} at ${job.company}</h1><a href="apply">Apply now</a>`, {headers: {'content-type': 'text/html'}});
    }
    if (url.includes('/og/jobs/')) return new Response(new Uint8Array(1500), {headers: {'content-type': 'image/png'}});
    if (url.startsWith('https://hashtagweb3.com/')) {
      const slug = new URL(url).pathname.split('/')[1], job = jobs.find(job => job.slug === slug)!;
      assert.ok(job);
      return new Response(`<meta property="og:title" content="${job.title} at ${job.company}"><meta property="og:image" content="https://hashtagweb3.com/og/jobs/${slug}.png?v=7">`);
    }
    if (url === 'https://api.buffer.com/graphql') {
      const body = JSON.parse(String(init?.body)), id = body.variables.id;
      if (body.query.includes('channel(input:')) return Response.json({data: {channel: {id, name: id === 'x-channel' ? 'hashtag_web3' : id === 'li-web3' ? 'hashtagweb3' : 'cvinbio', service: id === 'x-channel' ? 'twitter' : 'linkedin'}}});
      if (body.query.includes('mutation')) {
        const input = body.variables.input; mutation(url, input.text);
        const id = `buffer-${posts.size + 1}`;
        posts.set(id, {id, channelId: input.channelId, channelService: input.channelId === 'x-channel' ? 'twitter' : 'linkedin', text: input.text});
        return Response.json({data: {createPost: {post: {id}}}});
      }
      events.push(`verify:${id}`);
      if (id === 'known-pending') {
        const receipt = state.history.find(entry => entry.postId === id)!;
        return Response.json({data: {post: {id, channelId: 'x-channel', channelService: 'twitter', text: receipt.expectedText, status: 'scheduled'}}});
      }
      const post = posts.get(id)!; assert.ok(post);
      return Response.json({data: {post: {...post, status: 'sent', externalLink: post.channelService === 'twitter' ? 'https://twitter.com/hashtag_web3/status/123' : 'https://www.linkedin.com/feed/update/urn:li:share:123'}}});
    }
    if (url.includes('graph.threads.net')) {
      if (url.includes('/me?')) return Response.json({id: 'threads-account', username: 'hashtagweb3'});
      if (!init?.method) return Response.json({id: 'threads-post', username: 'hashtagweb3', permalink: 'https://www.threads.com/@hashtagweb3/post/fresh', text: `${fresh.company} is hiring ${fresh.title}: https://hashtagweb3.com/fresh1/th?og=7`});
      const body = new URLSearchParams(String(init.body));
      mutation(url, body.get('text') || 'container publication');
      return Response.json({id: url.includes('threads_publish') ? 'threads-post' : 'container'});
    }
    if (url.includes('createSession')) return Response.json({accessJwt: 'offline', did: 'did:plc:offline'});
    if (url.includes('uploadBlob')) return Response.json({blob: {ref: 'offline'}});
    if (url.includes('createRecord')) {
      mutation(url, JSON.parse(String(init?.body)).record.text);
      return Response.json({uri: 'at://did:plc:offline/app.bsky.feed.post/new'});
    }
    if (url.includes('api.neynar.com')) {mutation(url, JSON.parse(String(init?.body)).text); return Response.json({cast: {hash: '0x123'}});}
    if (url.includes('graph.facebook.com')) {
      if (url.includes('/me?')) return Response.json({id: 'page', name: 'hashtagweb3'});
      if (url.endsWith('/feed')) {
        const body = init!.body as URLSearchParams; mutation(url, body.get('message')!); return Response.json({id: 'page_new'});
      }
      const slug = new URL((init!.body as URLSearchParams).get('id')!).pathname.split('/')[1];
      const job = jobs.find(job => job.slug === slug)!;
      return Response.json({title: `${job.title} at ${job.company}`, image: [{url: `https://hashtagweb3.com/og/jobs/${slug}.png?v=7`}]});
    }
    throw new Error(`Unexpected request ${url}`);
  });
  return {...h, run: () => main({store}), failPersistence: () => {h.failReceiptSave = true;}};
}

function unchangedRecovered(h: Awaited<ReturnType<typeof fixture>>) {
  assert.deepEqual(h.state.history.filter(entry => oldSlugs.includes(entry.slug)), h.history);
  for (const slug of oldSlugs) {assert.ok(h.state.pendingSlugs.includes(slug)); assert.ok(!h.state.postedSlugs.includes(slug));}
}

test('real all-platform CLI rotates to a fresh verified job despite both recovered quarantined jobs', async t => {
  const h = await fixture(t);
  await h.run();
  assert.equal(h.mutations.length, 8);
  assert.ok(h.state.postedSlugs.includes('fresh1'));
  unchangedRecovered(h);
});

test('real platform-specific CLI skips manual-only jobs and publishes an unattempted pending target before fresh rotation', async t => {
  const h = await fixture(t, ['--platform', 'facebook']);
  const partial = {...fresh, slug: 'partial1', link: 'https://careers.example.com/roles/partial1'};
  h.jobs.splice(2, 0, partial);
  h.state.pendingSlugs.push('partial1');
  h.state.history.push({slug: partial.slug, company: partial.company, title: partial.title, platform: 'x', postedAt: '2026-10-16T00:00:00Z', postId: 'existing', verification: 'verified'});
  await h.run();
  assert.equal(h.mutations.length, 1);
  assert.match(h.mutations[0].text, /\/partial1\/fb\?og=7/);
  assert.ok(!h.state.history.some(entry => entry.slug === 'fresh1'));
  unchangedRecovered(h);
});

test('real platform-specific CLI falls through quarantine to fresh rotation without resending either old job', async t => {
  const h = await fixture(t, ['--platform', 'facebook']);
  await h.run();
  assert.equal(h.mutations.length, 1);
  assert.match(h.mutations[0].text, /\/fresh1\/fb/);
  unchangedRecovered(h);
});

test('real CLI with only quarantined jobs exits without provider creations or completion changes', async t => {
  const h = await fixture(t);
  h.jobs.pop();
  await h.run();
  assert.equal(h.mutations.length, 0);
  unchangedRecovered(h);
});

test('explicit quarantined slug remains blocked even with force', async t => {
  const h = await fixture(t, ['--platform', 'all', '--slug', 'cmp101', '--force']);
  await assert.rejects(h.run(), /blocked.*pending or quarantined/);
  assert.equal(h.mutations.length, 0);
  unchangedRecovered(h);
});

test('known-ID pending receipt is reconciled read-only before fresh rotation and force never recreates it', async t => {
  const h = await fixture(t, ['--platform', 'x', '--force']);
  const pendingJob = {...fresh, slug: 'pending1', link: 'https://careers.example.com/roles/pending1'};
  h.jobs.splice(2, 0, pendingJob);
  const receipt: SocialHistoryEntry = {slug: pendingJob.slug, company: pendingJob.company, title: pendingJob.title,
    platform: 'x', postedAt: '2026-10-16T00:00:00Z', postId: 'known-pending', provider: 'buffer', verification: 'pending',
    expectedText: 'Fresh Employer is hiring Engineer\n\nhttps://hashtagweb3.com/pending1/x?og=7'};
  const original = structuredClone(receipt);
  h.state.history.push(receipt); h.state.pendingSlugs.push('pending1');
  await h.run();
  assert.equal(h.mutations.length, 1); assert.match(h.mutations[0].text, /\/fresh1\/x/);
  assert.ok(h.events.indexOf('verify:known-pending') < h.events.indexOf('create'));
  assert.deepEqual(h.state.history.find(entry => entry.slug === 'pending1'), original);
  assert.equal(h.state.history.filter(entry => entry.slug === 'pending1').length, 1);
  unchangedRecovered(h);
});

test('explicit known-ID pending slug with force remains verification-only and reports blocked', async t => {
  const h = await fixture(t, ['--platform', 'x', '--slug', 'pending1', '--force']);
  const pendingJob = {...fresh, slug: 'pending1', link: 'https://careers.example.com/roles/pending1'};
  h.jobs.push(pendingJob);
  const receipt: SocialHistoryEntry = {slug: 'pending1', company: pendingJob.company, title: pendingJob.title,
    platform: 'x', postedAt: '2026-10-16T00:00:00Z', postId: 'known-pending', provider: 'buffer', verification: 'pending',
    expectedText: 'Fresh Employer is hiring Engineer\n\nhttps://hashtagweb3.com/pending1/x?og=7'};
  const original = structuredClone(receipt);
  h.state.history.push(receipt); h.state.pendingSlugs.push('pending1');
  await assert.rejects(h.run(), /blocked.*pending or quarantined/);
  assert.equal(h.mutations.length, 0);
  assert.ok(h.events.includes('verify:known-pending'));
  assert.deepEqual(h.state.history.find(entry => entry.slug === 'pending1'), original);
  unchangedRecovered(h);
});

test('receipt persistence failure still stops all later fresh platform mutations', async t => {
  const h = await fixture(t);
  h.failPersistence();
  await assert.rejects(h.run(), SocialStateError);
  assert.equal(h.mutations.length, 1);
  assert.equal(h.state.history.find(entry => entry.slug === 'fresh1')?.postId, 'buffer-1');
  unchangedRecovered(h);
});

test('expired fresh candidates cannot bypass age guards to escape quarantine', async t => {
  const h = await fixture(t, ['--platform', 'all', '--force']);
  h.jobs[h.jobs.length - 1] = {...fresh, date: '2026-08-01T00:00:00Z'};
  await h.run();
  assert.equal(h.mutations.length, 0);
  unchangedRecovered(h);
});
