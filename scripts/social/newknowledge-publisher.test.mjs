import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { CAMPAIGN, renderThread } from './newknowledge-content.mjs';
import { providerClient, X_CHANNEL } from './newknowledge-providers.mjs';
import { runKnowledgePlatform } from './newknowledge-publisher.mjs';
import { durableReceipt } from './newknowledge-state.mjs';

const content = JSON.parse(await fs.readFile(new URL('../../social-assets/knowledge-threads-month/content.json', import.meta.url)));
const env = { BUFFER_ACCESS_TOKEN: 'offline-test', THREADS_ACCESS_TOKEN: 'offline-test', THREADS_USER_ID: '123' };
const date = '2026-10-18';
const now = Date.parse(`${date}T11:30:00Z`);
const reply = value => new Response(JSON.stringify(value), { status: 200, headers: { 'Content-Type': 'application/json' } });

function spec(platform) {
  const posts = renderThread(content.threads.find(thread => thread.sequence === 1), platform);
  return { campaign: CAMPAIGN, date, platform, threadId: 'C01', sequence: 1, assetCommit: 'a'.repeat(40), contentDigest: platform, posts,
    assets: posts.map((post, i) => ({ path: post.image, url: `https://raw.githubusercontent.com/example/test/${'a'.repeat(40)}/${i}.jpg`, sha256: String(i).repeat(64), width: 1200, height: 1500 })) };
}

function harness(platform, options = {}) {
  const expected = spec(platform);
  let remote = null, revision = 0, next = 1000, currentTime = now;
  const writes = [], mutations = [], requests = [], records = [], containers = new Map(), posts = new Map();
  const faults = { ...options };
  const makeX = id => ({ id, channelId: X_CHANNEL, channelService: 'twitter', text: expected.posts[0].text, status: 'sent', externalLink: 'https://x.com/hashtag_web3/status/321', metadata: { threadCount: 6, thread: expected.posts.map((p, i) => ({ text: p.text, assets: [{ source: expected.assets[i].url, mimeType: 'image/jpeg', image: { altText: p.alt, width: 1200, height: 1500 } }] })) } });
  const fetcher = async (url, init = {}) => {
    requests.push({ url, method: init.method || 'GET' });
    if (url === 'https://api.buffer.com') {
      const { query, variables } = JSON.parse(init.body);
      if (query.startsWith('mutation')) {
        mutations.push({ type: 'x-create', body: variables.input });
        assert.equal(remote.status, 'claimed', 'Claim must exist before Buffer create');
        const id = String(next++); posts.set(id, makeX(id));
        if (faults.ambiguousCreate) throw new Error('unknown create response');
        return reply({ data: { createPost: { post: { id } } } });
      }
      if (query.includes('channel(input:')) return reply({ data: { channel: { id: X_CHANNEL, name: faults.wrongAccount ? 'wrong' : '@hashtag_web3', service: 'twitter', organizationId: 'org', isDisconnected: false, isLocked: false } } });
      if (query.includes('posts(first:')) return reply({ data: { posts: { edges: faults.duplicate ? [{ node: { id: 'old', text: expected.posts[0].text } }] : [] } } });
      const post = structuredClone(posts.get(variables.id));
      faults.changePost?.(post);
      return reply({ data: { post } });
    }
    assert.ok(url.startsWith('https://graph.threads.net/v1.0/'));
    const route = url.slice('https://graph.threads.net/v1.0/'.length);
    if (route.startsWith('me?')) return reply({ id: '123', username: faults.wrongAccount ? 'wrong' : 'hashtagweb3' });
    if (route.includes('/threads?')) return reply({ data: faults.duplicate ? [{ id: 'old', text: expected.posts[0].text }] : [] });
    if (route === '123/threads') {
      const body = Object.fromEntries(init.body);
      mutations.push({ type: 'container-create', body });
      const index = containers.size;
      assert.ok(remote.steps[index]?.createClaim, 'Claim must exist before Threads create');
      if (index) assert.equal(remote.steps[index - 1].status, 'verified');
      const id = String(next++); containers.set(id, body);
      if (faults.ambiguousCreate) throw new Error('unknown create response');
      return reply({ id });
    }
    if (route === '123/threads_publish') {
      const body = Object.fromEntries(init.body), container = containers.get(body.creation_id);
      mutations.push({ type: 'container-publish', body });
      const step = Object.values(remote.steps).find(s => s.containerId === body.creation_id);
      assert.equal(step.status, 'publishing');
      assert.ok(step.publishClaim, 'Publish claim must be durable before request');
      const id = String(next++);
      posts.set(id, { id, text: container.text, username: 'hashtagweb3', media_type: 'IMAGE', media_url: container.image_url, is_reply: Boolean(container.reply_to_id), ...(container.reply_to_id ? { replied_to: { id: container.reply_to_id } } : {}), permalink: `https://www.threads.com/@hashtagweb3/post/${id}` });
      if (faults.ambiguousPublish) throw new Error('unknown publish response');
      return reply({ id });
    }
    const id = route.split('?')[0];
    if (route.includes('fields=status')) {
      assert.ok(containers.has(id));
      if (faults.expireWindow) currentTime = Date.parse(`${date}T12:30:00Z`);
      return reply({ status: faults.containerPending ? 'IN_PROGRESS' : 'FINISHED' });
    }
    const post = structuredClone(posts.get(id));
    faults.changePost?.(post);
    return reply(post);
  };
  const store = () => durableReceipt({
    read: async () => ({ state: structuredClone(remote), text: remote ? JSON.stringify(remote, null, 2) + '\n' : null, sha: remote ? String(revision) : null }),
    write: async ({ sha, text }) => {
      if (sha !== (remote ? String(revision) : null)) return { ok: false, status: 409, message: 'sha conflict' };
      const value = JSON.parse(text);
      if (faults.checkpointFailure && (value.postId || Object.values(value.steps).some(step => step.postId || step.containerId))) throw new Error('checkpoint unavailable');
      remote = value; revision++; writes.push(structuredClone(value)); return { ok: true };
    },
    record: async value => records.push(structuredClone(value)), wait: async () => {},
  });
  const run = (mode = 'publish', extra = {}) => runKnowledgePlatform({ spec: expected, store: store(), client: providerClient(platform, { env, fetcher, readOnly: mode !== 'publish' }), mode, clock: () => currentTime, wait: async () => {}, verifyImage: async (url, asset) => assert.equal(url, asset.url, 'wrong image'), ...extra });
  return { run, mutations, requests, writes, records, faults, posts, containers, spec: expected, state: () => remote, clock: value => { currentTime = value; } };
}

test('Buffer sends a native six-image thread including its root, with per-platform link bodies', async () => {
  const x = harness('x'); await x.run();
  const threads = harness('threads'); await threads.run();
  assert.equal(x.mutations.length, 1);
  const body = x.mutations[0].body;
  assert.equal(body.mode, 'shareNow');
  assert.equal(body.channelId, X_CHANNEL);
  assert.equal(body.metadata.twitter.thread.length, 6);
  assert.equal(body.text, body.metadata.twitter.thread[0].text);
  assert.deepEqual(body.assets, body.metadata.twitter.thread[0].assets);
  body.metadata.twitter.thread.forEach((p, i) => assert.deepEqual(p.assets, [{ image: { url: x.spec.assets[i].url, metadata: { altText: x.spec.posts[i].alt } } }]));
  assert.match(body.metadata.twitter.thread[5].text, /\/building-web3-portfolio\/x$/);
  assert.match(threads.mutations.filter(m => m.type === 'container-create')[5].body.text, /\/building-web3-portfolio\/th$/);
  assert.equal(x.state().status, 'verified');
  assert.equal(threads.state().status, 'verified');
});

test('Threads replies follow the previous verified image post and sent reruns create nothing', async () => {
  const h = harness('threads'); await h.run();
  assert.equal(h.mutations.length, 12);
  const creates = h.mutations.filter(m => m.type === 'container-create');
  assert.equal(creates[0].body.reply_to_id, undefined);
  for (let i = 1; i < 6; i++) assert.equal(creates[i].body.reply_to_id, h.state().steps[i - 1].postId);
  assert.equal((await h.run()).status, 'already-sent');
  assert.equal(h.mutations.length, 12);
  const x = harness('x'); await x.run(); await x.run();
  assert.equal(x.mutations.length, 1);
});

test('unknown creates and publishes remain claimed and never retry blindly', async () => {
  for (const platform of ['x', 'threads']) {
    const h = harness(platform, { ambiguousCreate: true });
    await assert.rejects(h.run(), /unknown create/);
    h.faults.ambiguousCreate = false;
    await assert.rejects(h.run(), /Ambiguous earlier/);
    assert.equal(h.mutations.length, 1);
  }
  const h = harness('threads', { ambiguousPublish: true });
  await assert.rejects(h.run(), /unknown publish/);
  h.faults.ambiguousPublish = false;
  await assert.rejects(h.run(), /Ambiguous earlier Threads publish/);
  assert.equal(h.mutations.length, 2);
});

test('a saved unfinished container resumes without recreating it', async () => {
  const h = harness('threads', { containerPending: true });
  await assert.rejects(h.run(), /container not ready/);
  assert.equal(h.state().steps[0].status, 'container-created');
  assert.equal(h.mutations.length, 1);
  h.faults.containerPending = false;
  await h.run();
  assert.equal(h.mutations.filter(m => m.type === 'container-create').length, 6);
  assert.equal(h.mutations.filter(m => m.type === 'container-publish').length, 6);
});

test('window expiry during container polling stops publication and does not backfill next day', async () => {
  const h = harness('threads', { expireWindow: true });
  await assert.rejects(h.run(), /Outside posting window/);
  assert.equal(h.mutations.length, 1);
  h.clock(Date.parse('2026-10-19T11:30:00Z'));
  await assert.rejects(h.run(), /Outside posting window/);
  assert.equal(h.mutations.length, 1);
  const x = harness('x'); x.clock(Date.parse('2026-10-17T11:30:00Z'));
  await assert.rejects(x.run(), /Outside posting window/);
  assert.equal(x.requests.length, 0);
});

test('account and history checks fail before any create', async () => {
  for (const platform of ['x', 'threads']) for (const fault of ['wrongAccount', 'duplicate']) {
    const h = harness(platform, { [fault]: true });
    await assert.rejects(h.run());
    assert.equal(h.mutations.length, 0);
    assert.equal(h.writes.length, 0);
  }
});

test('wrong receipt account, text, image or reply order stops further posting', async () => {
  for (const changePost of [
    post => { post.username = 'wrong'; }, post => { post.text = 'wrong'; },
    post => { post.media_url = 'https://wrong.example/image.jpg'; },
    post => { post.is_reply = true; post.replied_to = { id: 'wrong' }; },
    post => { post.media_type = 'VIDEO'; },
  ]) {
    const h = harness('threads', { changePost });
    await assert.rejects(h.run());
    assert.equal(h.mutations.length, 2);
    assert.ok(h.state().steps[0].postId);
    assert.equal(h.state().steps[0].status, 'accepted');
  }
  for (const changePost of [
    post => { post.channelId = 'wrong'; }, post => { post.metadata.thread[2].text = 'wrong'; },
    post => { post.metadata.thread[3].assets[0].source = 'https://wrong.example/image.jpg'; },
    post => { post.metadata.threadCount = 5; },
  ]) {
    const h = harness('x', { changePost });
    await assert.rejects(h.run()); await assert.rejects(h.run());
    assert.equal(h.mutations.length, 1);
    assert.ok(h.state().postId);
  }
});

test('preflight writes no remote state and manual recovery verifies IDs without provider mutations', async () => {
  for (const platform of ['x', 'threads']) {
    const h = harness(platform);
    assert.equal((await h.run('preflight')).status, 'ready');
    assert.equal(h.mutations.length, 0); assert.equal(h.writes.length, 0);
  }
  const x = harness('x', { ambiguousCreate: true });
  await assert.rejects(x.run());
  const id = [...x.posts.keys()][0];
  assert.equal((await x.run('reconcile', { recovery: { postId: id } })).status, 'verified');
  assert.equal(x.mutations.length, 1);
  const t = harness('threads', { ambiguousPublish: true });
  await assert.rejects(t.run());
  const root = [...t.posts.keys()][0];
  const recovered = await t.run('reconcile', { recovery: { postId: root, index: 1 } });
  assert.equal(recovered.status, 'incomplete');
  assert.equal(t.state().steps[0].postId, root);
  assert.equal(t.state().steps[0].status, 'verified');
  assert.equal(t.mutations.length, 2);
});

test('failure to persist an acknowledged ID keeps local evidence and stops later mutations', async () => {
  for (const platform of ['x', 'threads']) {
    const h = harness(platform, { checkpointFailure: true });
    await assert.rejects(h.run(), /checkpoint unavailable/);
    assert.equal(h.mutations.length, 1);
    assert.ok(h.records.some(value => platform === 'x' ? value.postId : value.steps[0]?.containerId));
    h.faults.checkpointFailure = false;
    await assert.rejects(h.run(), /Ambiguous earlier/);
    assert.equal(h.mutations.length, 1);
  }
});

test('concurrent runs race for a single claim and never double-create', async () => {
  for (const platform of ['x', 'threads']) {
    const h = harness(platform);
    const results = await Promise.allSettled([h.run(), h.run()]);
    assert.equal(results.filter(r => r.status === 'fulfilled').length, 1);
    assert.equal(h.mutations.filter(m => m.type === (platform === 'x' ? 'x-create' : 'container-create')).length, platform === 'x' ? 1 : 6);
  }
});

test('a reply to the root instead of the previous post stops the chain', async () => {
  let rootId;
  const h = harness('threads', { changePost: post => {
    if (!post.is_reply) rootId = post.id;
    else if (post.text === spec('threads').posts[2].text) post.replied_to.id = rootId;
  } });
  await assert.rejects(h.run(), /reply must follow the previous post/);
  assert.equal(h.mutations.length, 6);
  assert.equal(h.state().steps[1].status, 'verified');
  assert.equal(h.state().steps[2].status, 'accepted');
  assert.equal(h.state().steps[3], undefined);
});

test('concurrent resumptions cannot publish a saved container twice', async () => {
  const h = harness('threads', { containerPending: true });
  await assert.rejects(h.run(), /container not ready/);
  h.faults.containerPending = false;
  const results = await Promise.allSettled([h.run(), h.run()]);
  assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
  const publishes = h.mutations.filter(m => m.type === 'container-publish');
  assert.equal(publishes.length, 6);
  assert.equal(new Set(publishes.map(m => m.body.creation_id)).size, 6);
  assert.equal(h.mutations.filter(m => m.type === 'container-create').length, 6);
});
