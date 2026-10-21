import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { CAMPAIGN, sha256 } from './newknowledge-content.mjs';
import { durableReceipt } from './newknowledge-state.mjs';
import { carouselReceiptPath } from './newknowledge-carousel-state.mjs';
import { INSTAGRAM_CAROUSEL_TARGET, createInstagramCarouselSpec, instagramCarouselClient, runInstagramCarousel } from './newknowledge-instagram-carousel.mjs';

const content = JSON.parse(await fs.readFile(new URL('../../social-assets/knowledge-threads-month/content.json', import.meta.url)));
const calendar = JSON.parse(await fs.readFile(new URL('../../social-assets/knowledge-threads-month/calendar.json', import.meta.url)));
const date = '2026-10-21', now = Date.parse(`${date}T11:30:00Z`), commit = 'a'.repeat(40);
const token = 'offline-meta-secret';
const response = (value, status = 200) => new Response(JSON.stringify(value), { status });
const encode = value => JSON.stringify(value, null, 2) + '\n';

function harness(options = {}) {
  const sourceThread = structuredClone(content.threads.find(thread => thread.id === 'C02'));
  if (options.freshness) sourceThread.freshness = options.freshness;
  const bufferSpec = {
    campaign: CAMPAIGN, date, threadId: sourceThread.id, sequence: sourceThread.sequence, platform: 'instagram',
    sourceContentSha256: 'f'.repeat(64), calendarSha256: 'c'.repeat(64), sourceThreadSha256: sha256(JSON.stringify(sourceThread)),
    sourcePostHashes: sourceThread.posts.map(post => sha256(JSON.stringify(post))), sourceImages: [], assetCommit: commit,
    target: { channelId: 'old-buffer-channel' }, caption: 'Approved native Instagram carousel caption #Web3',
    images: Array.from({ length: 6 }, (_, index) => {
      const file = `social-assets/knowledge-threads-month/exports/C02/instagram/0${index + 1}.jpg`;
      return { path: file, url: `https://raw.githubusercontent.com/vedangvatsa/Web3-Jobs/${commit}/${file}`, sha256: String(index + 1).repeat(64), bytes: 123, width: 1080, height: 1350, alt: `Approved slide ${index + 1} image description` };
    }),
  };
  const spec = createInstagramCarouselSpec(bufferSpec), faults = { ...options };
  let remote = null, revision = 0, next = 1000, currentTime = now, assetsVerified = false, quotaReads = 0;
  const requests = [], mutations = [], writes = [], records = [], containers = new Map(), posts = new Map();
  const account = { id: INSTAGRAM_CAROUSEL_TARGET.accountId, username: INSTAGRAM_CAROUSEL_TARGET.username };
  const fetcher = async (url, init = {}) => {
    const parsed = new URL(url), route = parsed.pathname.slice('/v21.0/'.length);
    assert.equal(parsed.origin, 'https://graph.facebook.com');
    assert.equal(init.headers.Authorization, `Bearer ${token}`);
    assert.ok(!parsed.searchParams.has('access_token') && !url.includes(token));
    const request = { route, fields: parsed.searchParams.get('fields'), method: init.method, after: parsed.searchParams.get('after') };
    requests.push(request);
    if (init.method === 'POST') {
      const body = Object.fromEntries(init.body);
      assert.ok(!body.access_token && assetsVerified, 'Public images required before mutation');
      assert.ok(remote?.claimId, 'Durable root claim required before mutation');
      let stage, id;
      if (route === `${account.id}/media_publish`) {
        stage = 'publish';
        assert.ok(remote.publish?.claimId && remote.publish.creationId === body.creation_id, 'Publish claim must precede request');
        assert.ok(containers.get(body.creation_id)?.stage === 'parent');
        id = String(next++);
        const childContainers = containers.get(body.creation_id).body.children.split(',');
        const children = childContainers.map((containerId, index) => {
          const input = containers.get(containerId).body;
          return { id: String(8000 + index), media_type: 'IMAGE', media_url: input.image_url, alt_text: input.alt_text };
        });
        posts.set(id, { id, owner: { id: account.id }, media_type: 'CAROUSEL_ALBUM', media_product_type: 'FEED', caption: containers.get(body.creation_id).body.caption, permalink: `https://www.instagram.com/p/offline${id}/`, timestamp: new Date(currentTime).toISOString(), children: { data: children } });
        containers.get(body.creation_id).published = true;
      } else {
        assert.equal(route, `${account.id}/media`);
        if (body.media_type === 'CAROUSEL') {
          stage = 'parent';
          assert.ok(remote.parent?.createClaim, 'Parent claim must precede request');
          const ids = body.children.split(',');
          assert.deepEqual(ids, Array.from({ length: 6 }, (_, index) => remote.children[index].containerId));
          assert.ok(Object.values(remote.children).every(child => child.status === 'verified'));
        } else {
          const index = spec.images.findIndex(image => image.url === body.image_url);
          assert.ok(index >= 0);
          stage = `child-${index + 1}`;
          assert.ok(remote.children[index]?.createClaim, 'Child claim must precede request');
        }
        id = String(next++); containers.set(id, { stage, body });
      }
      mutations.push({ stage, id, body });
      if (faults.unknownStage === stage) throw new Error(`network failure ${token}`);
      if (faults.idlessStage === stage) return response({});
      if (faults.partialStage === stage) return response({ id, error: { message: token } }, 500);
      if (faults.partialPublish && stage === 'publish') return response({ id, config_issue: 'CAPTION_NOT_ATTACHED' });
      if (faults.duplicateContainerStage === stage) return response({ id: mutations[0].id });
      return response({ id });
    }
    assert.equal(init.method, 'GET');
    if (route === account.id) {
      assert.equal(request.fields, 'id,username');
      return response({ ...account, ...faults.account });
    }
    if (route === `${account.id}/content_publishing_limit`) {
      quotaReads++;
      assert.equal(request.fields, 'quota_usage,config');
      if (faults.quotaError) return response({ error: { message: token } }, 400);
      if (faults.quotaResponse) return response(faults.quotaResponse);
      return response({ data: [{ quota_usage: faults.quotaByCall?.(quotaReads) ?? faults.quotaUsage ?? 2, config: { quota_total: faults.quotaTotal ?? 100, quota_duration: 86400 } }] });
    }
    if (route === `${account.id}/media`) {
      if (faults.historyResponse) return response(faults.historyResponse(request));
      return response({ data: faults.duplicate ? [{ id: '42', caption: spec.caption }] : [] });
    }
    if (containers.has(route)) {
      const container = containers.get(route);
      if (faults.expireOnRead === container.stage) currentTime = Date.parse(`${date}T12:30:00Z`);
      const status_code = faults.containerStatus || (faults.pendingStage === container.stage ? 'IN_PROGRESS' : container.published ? 'PUBLISHED' : 'FINISHED');
      return response({ id: route, status_code });
    }
    const id = route.split('/')[0];
    const post = structuredClone(posts.get(id));
    assert.ok(post, 'Unexpected media ID');
    faults.changePost?.(post);
    if (route.endsWith('/children')) return response(faults.childrenResponse ? faults.childrenResponse(post, request) : post.children);
    delete post.children;
    return response(post);
  };
  const stageForWrite = state => {
    if (state.postId && !remote?.postId) return 'publish';
    if (state.parent?.containerId && !remote?.parent?.containerId) return 'parent';
    for (let index = 0; index < 6; index++) if (state.children[index]?.containerId && !remote?.children[index]?.containerId) return `child-${index + 1}`;
  };
  const store = () => durableReceipt({
    read: async () => ({ state: structuredClone(remote), text: remote ? encode(remote) : null, sha: remote ? String(revision) : null }),
    write: async ({ sha, text }) => {
      if (sha !== (remote ? String(revision) : null)) return { ok: false, status: 409, message: 'sha conflict' };
      const state = JSON.parse(text);
      if (faults.writeFailureStage && faults.writeFailureStage === stageForWrite(state)) throw new Error(`checkpoint failed ${token}`);
      if (faults.claimFailure) throw new Error('claim acknowledgement unknown');
      remote = state; revision++; writes.push(structuredClone(state));
      if (faults.expireAfterClaim) {
        const claimed = faults.expireAfterClaim === 'publish' ? state.publish && !state.postId
          : faults.expireAfterClaim === 'parent' ? state.parent && !state.parent.containerId
          : state.children[Number(faults.expireAfterClaim.slice(-1)) - 1] && !state.children[Number(faults.expireAfterClaim.slice(-1)) - 1].containerId;
        if (claimed) currentTime = Date.parse(`${date}T12:30:00Z`);
      }
      return { ok: true };
    },
    record: async state => records.push({ event: 'checkpoint', state: structuredClone(state) }), wait: async () => {},
  });
  const client = readOnly => instagramCarouselClient({ env: { META_PAGE_TOKEN: token }, fetcher, readOnly });
  const run = (mode = 'publish', extra = {}) => runInstagramCarousel({
    spec, sourceThread, calendar, events: options.events || [], store: store(), client: client(mode !== 'publish'), mode,
    verifyAssets: async () => { if (faults.assetFailure) throw new Error('public asset unavailable'); assetsVerified = true; },
    verifyImage: async (url, image) => assert.equal(url, image.url, 'Wrong published image pixels/order'),
    journal: async (state, event) => records.push({ event, state: structuredClone(state) }), clock: () => currentTime, wait: async () => {}, ...extra,
  });
  return { run, client, spec, bufferSpec, sourceThread, faults, requests, mutations, writes, records, containers, posts, state: () => remote, time: time => { currentTime = time; } };
}

test('Meta selection preserves the spec base, pins explicit brand identity and rejects Buffer receipt reuse', async () => {
  const h = harness();
  assert.equal(h.spec.transport, 'meta');
  assert.deepEqual(h.spec.target, INSTAGRAM_CAROUSEL_TARGET);
  for (const key of Object.keys(h.bufferSpec).filter(key => key !== 'target')) assert.deepEqual(h.spec[key], h.bufferSpec[key]);
  assert.equal(carouselReceiptPath(date, 'instagram'), `scripts/social/newknowledge-carousel-receipts/${CAMPAIGN}/${date}-instagram.json`);
  await h.run();
  const state = structuredClone(h.state()); state.spec = h.bufferSpec;
  const before = h.requests.length;
  await assert.rejects(h.run('preflight', { initialState: state }), /transport, account or asset pins changed/);
  assert.equal(h.requests.length, before);
});

test('six children, one native parent and one publish each have durable claims and immediate IDs', async () => {
  const h = harness();
  const result = await h.run();
  assert.equal(result.status, 'verified'); assert.equal(h.state().status, 'verified');
  assert.deepEqual(h.mutations.map(item => item.stage), ['child-1', 'child-2', 'child-3', 'child-4', 'child-5', 'child-6', 'parent', 'publish']);
  h.mutations.slice(0, 6).forEach((mutation, index) => assert.deepEqual(mutation.body, { image_url: h.spec.images[index].url, is_carousel_item: 'true', alt_text: h.spec.images[index].alt }));
  assert.deepEqual(h.mutations[6].body, { media_type: 'CAROUSEL', children: h.mutations.slice(0, 6).map(item => item.id).join(','), caption: h.spec.caption });
  assert.deepEqual(h.mutations[7].body, { creation_id: h.mutations[6].id });
  assert.deepEqual(h.state().publishedChildIds, ['8000', '8001', '8002', '8003', '8004', '8005']);
  assert.deepEqual(result.proof.childIds, h.state().publishedChildIds);
  assert.equal(result.proof.altTextVerified, true);
  for (const mutation of h.mutations) {
    const checkpoint = h.records.findIndex(record => record.event === 'checkpoint' && JSON.stringify(record.state).includes(`"${mutation.id}"`));
    const readback = h.records.findIndex(record => ['instagram-container-read-attempt', 'instagram-readback-attempt'].includes(record.event) && (record.state.containerId === mutation.id || record.state.postId === mutation.id));
    assert.ok(checkpoint >= 0 && checkpoint < readback, `ID must precede read-back for ${mutation.stage}`);
  }
});

test('new and resumed CAS races cannot create duplicate children, parents or published posts', async () => {
  const fresh = harness();
  const newResults = await Promise.allSettled([fresh.run(), fresh.run()]);
  assert.equal(newResults.filter(result => result.status === 'fulfilled').length, 1);
  assert.equal(fresh.mutations.length, 8);
  for (const pendingStage of ['child-3', 'parent']) {
    const h = harness({ pendingStage });
    await assert.rejects(h.run(), /still processing/);
    h.faults.pendingStage = undefined;
    const results = await Promise.allSettled([h.run(), h.run()]);
    assert.ok(results.some(result => result.status === 'fulfilled'));
    assert.equal(h.mutations.length, 8);
    assert.equal(new Set(h.mutations.map(item => item.stage)).size, 8);
  }
});

test('ambiguous or ID-less child, parent and publish requests never automatically retry', async () => {
  for (const stage of ['child-2', 'parent', 'publish']) for (const fault of ['unknownStage', 'idlessStage']) {
    const h = harness({ [fault]: stage });
    await assert.rejects(h.run());
    const before = h.mutations.length;
    h.faults[fault] = undefined;
    await assert.rejects(h.run(), /Ambiguous earlier Instagram/);
    assert.equal(h.mutations.length, before);
  }
});

test('partial error bodies checkpoint child, parent and published IDs before throwing', async () => {
  for (const partialStage of ['child-3', 'parent', 'publish']) {
    const h = harness({ partialStage });
    await assert.rejects(h.run(), error => /Instagram request failed/.test(error.message) && !error.message.includes(token));
    const known = h.mutations.at(-1).id;
    assert.ok(JSON.stringify(h.state()).includes(`"${known}"`));
    h.faults.partialStage = undefined;
    assert.equal((await h.run()).status, 'verified');
    assert.equal(h.mutations.length, 8);
  }
});

test('publication config_issue is a known-ID partial success, never a reason to publish again', async () => {
  const h = harness({ partialPublish: true });
  await assert.rejects(h.run(), /partial publication/);
  assert.ok(h.state().postId);
  const before = h.writes.length;
  assert.equal((await h.run('preflight')).status, 'verified');
  assert.equal(h.writes.length, before);
  assert.equal((await h.run('reconcile')).status, 'verified');
  assert.equal(h.mutations.length, 8);
});

test('failed ID writes retain local evidence, redact credentials and stop unknown remote claims', async () => {
  for (const writeFailureStage of ['child-2', 'parent', 'publish']) {
    const h = harness({ writeFailureStage });
    await assert.rejects(h.run(), error => /checkpoint failed/.test(error.message) && !error.message.includes(token));
    const known = h.mutations.at(-1).id, count = h.mutations.length;
    const checkpoint = h.records.findLast(record => record.event === 'checkpoint' && JSON.stringify(record.state).includes(`"${known}"`));
    assert.ok(checkpoint);
    h.faults.writeFailureStage = undefined;
    await assert.rejects(h.run(), /Ambiguous earlier/);
    assert.equal(h.mutations.length, count);
    assert.equal((await h.run('publish', { initialState: checkpoint.state })).status, 'verified');
    assert.equal(h.mutations.length, 8);
  }
});

test('claim write failures cannot reach provider mutations', async () => {
  const h = harness({ claimFailure: true });
  await assert.rejects(h.run(), /claim acknowledgement unknown/);
  assert.equal(h.mutations.length, 0);
});

test('known child and parent containers resume bounded polls without recreation', async () => {
  for (const pendingStage of ['child-4', 'parent']) {
    const h = harness({ pendingStage });
    await assert.rejects(h.run(), /still processing/);
    const id = h.mutations.at(-1).id;
    assert.equal(h.requests.filter(request => request.route === id).length, 6);
    const writes = h.writes.length, before = h.requests.length;
    assert.equal((await h.run('preflight')).status, 'container-pending');
    assert.equal(h.requests.slice(before).filter(request => request.route === id).length, 1);
    assert.equal(h.writes.length, writes);
    h.faults.pendingStage = undefined;
    await h.run();
    assert.equal(h.mutations.filter(item => item.id === id).length, 1);
    assert.equal(h.mutations.length, 8);
  }
});

test('ERROR, EXPIRED and unexpected PUBLISHED containers fail closed and retain IDs', async () => {
  for (const containerStatus of ['ERROR', 'EXPIRED', 'PUBLISHED', 'UNKNOWN']) {
    const h = harness({ containerStatus });
    await assert.rejects(h.run());
    await assert.rejects(h.run());
    assert.equal(h.mutations.length, 1); assert.ok(h.state().children[0].containerId);
  }
});

test('duplicate child IDs and a parent reusing a child ID stop all subsequent mutations', async () => {
  for (const duplicateContainerStage of ['child-2', 'parent']) {
    const h = harness({ duplicateContainerStage });
    await assert.rejects(h.run(), /Duplicate claimed|parent cannot reuse/);
    const count = h.mutations.length;
    await assert.rejects(h.run(), /Duplicate claimed|parent cannot reuse/);
    assert.equal(h.mutations.length, count);
    assert.ok(!h.mutations.some(item => item.stage === 'publish'));
  }
});

test('window guard runs immediately before every child, parent and publish request', async () => {
  for (const expireAfterClaim of ['child-1', 'child-4', 'parent', 'publish']) {
    const h = harness({ expireAfterClaim });
    await assert.rejects(h.run(), /Outside posting window/);
    assert.ok(!h.mutations.some(item => item.stage === expireAfterClaim));
    h.time(Date.parse('2026-10-22T11:30:00Z'));
    const count = h.mutations.length;
    await assert.rejects(h.run(), /Outside posting window/);
    assert.equal(h.mutations.length, count);
  }
  for (const expireOnRead of ['child-2', 'parent']) {
    const h = harness({ expireOnRead });
    await assert.rejects(h.run(), /Outside posting window/);
    assert.ok(!h.mutations.some(item => item.stage === 'publish'));
  }
});

test('exact end boundary and previous dates cannot start; known published IDs verify outside the window', async () => {
  for (const time of [`${date}T11:29:59.999Z`, `${date}T12:30:00Z`, '2026-10-22T11:30:00Z']) {
    const h = harness(); h.time(Date.parse(time));
    await assert.rejects(h.run(), /Outside posting window/);
    assert.equal(h.requests.length, 0);
  }
  const h = harness({ partialStage: 'publish' });
  await assert.rejects(h.run());
  h.time(Date.parse('2026-10-22T15:00:00Z')); h.faults.quotaError = true;
  assert.equal((await h.run()).status, 'verified');
  assert.equal(h.mutations.length, 8);
});

test('preflight, reconcile and client defaults never mutate providers or write preflight receipts', async () => {
  for (const mode of ['preflight', 'reconcile']) {
    const h = harness();
    assert.equal((await h.run(mode)).status, 'ready');
    assert.equal(h.mutations.length, 0); assert.equal(h.writes.length, 0);
    const readonly = h.client(true), before = h.requests.length;
    await assert.rejects(readonly.createChild(h.spec, 0, async () => {}), /Read-only/);
    await assert.rejects(readonly.createParent(h.spec, ['1', '2', '3', '4', '5', '6'], async () => {}), /Read-only/);
    await assert.rejects(readonly.publish('123', async () => {}), /Read-only/);
    assert.equal(h.requests.length, before);
  }
  const h = harness(); await h.run();
  const writes = h.writes.length;
  for (const mode of ['publish', 'preflight', 'reconcile']) assert.equal((await h.run(mode)).proof.postId, h.state().postId);
  assert.equal(h.writes.length, writes); assert.equal(h.mutations.length, 8);
});

test('a read-only client cannot strand a new mutation claim, while known publication verification stays read-only', async () => {
  const fresh = harness();
  await assert.rejects(fresh.run('publish', { client: fresh.client(true) }), /writable Instagram client/);
  assert.equal(fresh.writes.length, 0); assert.equal(fresh.requests.length, 0);
  const h = harness({ pendingStage: 'child-2' });
  await assert.rejects(h.run());
  const writes = h.writes.length;
  await assert.rejects(h.run('publish', { client: h.client(true) }), /writable Instagram client/);
  assert.equal(h.writes.length, writes);
  h.faults.pendingStage = undefined;
  await h.run();
  assert.equal((await h.run('publish', { client: h.client(true) })).status, 'verified');
  assert.equal(h.mutations.length, 8);
});

test('manual publish recovery verifies matching root and children before saving, without another mutation', async () => {
  const h = harness({ unknownStage: 'publish' }); await assert.rejects(h.run());
  const id = [...h.posts.keys()][0], writes = h.writes.length;
  h.faults.changePost = post => { post.caption = 'wrong'; };
  await assert.rejects(h.run('reconcile', { recovery: { postId: id } }), /caption/);
  assert.equal(h.writes.length, writes); assert.equal(h.state().postId, undefined);
  h.faults.changePost = undefined;
  h.time(Date.parse('2026-10-22T12:30:00Z')); h.faults.quotaError = true;
  assert.equal((await h.run('reconcile', { recovery: { postId: id } })).status, 'verified');
  assert.equal(h.mutations.length, 8);
  await assert.rejects(h.run('reconcile', { recovery: { postId: '9999' } }), /cannot replace/);
  const child = harness({ unknownStage: 'child-1' }); await assert.rejects(child.run());
  await assert.rejects(child.run('reconcile', { recovery: { postId: '9999' } }), /publish claim/);
});

test('wrong owner, caption, child image order, alt, format, permalink or timestamp cannot verify', async () => {
  for (const changePost of [
    post => { post.owner.id = 'other'; }, post => { post.caption = 'other'; },
    post => { post.media_type = 'VIDEO'; }, post => { post.media_product_type = 'REELS'; },
    post => { post.children.data.reverse(); },
    post => { [post.children.data[0].media_url, post.children.data[1].media_url] = [post.children.data[1].media_url, post.children.data[0].media_url]; },
    post => { post.children.data[0].alt_text = 'wrong'; }, post => { post.children.data[0].media_type = 'VIDEO'; },
    post => { post.children.data.pop(); }, post => { post.children.data[1].id = post.children.data[0].id; },
    post => { post.permalink = 'https://www.instagram.com/reel/abc/'; },
    post => { post.timestamp = 'not-a-timestamp'; }, post => { post.timestamp = '2026-10-20T11:30:00Z'; },
    post => { post.timestamp = '2026-10-22T11:30:00Z'; },
  ]) {
    const h = harness({ changePost });
    await assert.rejects(h.run()); await assert.rejects(h.run('preflight'));
    assert.equal(h.mutations.length, 8); assert.ok(h.state().postId); assert.equal(h.state().status, 'accepted');
  }
  const h = harness({ changePost: post => { delete post.media_product_type; delete post.timestamp; } });
  assert.equal((await h.run()).status, 'verified');
});

test('wrong root ownership stops before reading its children', async () => {
  const h = harness({ changePost: post => { post.owner.id = 'other'; } });
  await assert.rejects(h.run(), /owner/);
  assert.ok(!h.requests.some(request => request.route.endsWith('/children')));
});

test('brand account and dynamic publishing quota errors stop before any claim or create', async () => {
  for (const options of [
    { account: { id: 'other' } }, { account: { username: 'hashtag_web3' } }, { quotaError: true },
    { quotaUsage: 100 }, { quotaResponse: { data: [] } }, { quotaResponse: { data: [{ quota_usage: 1 }] } },
    { quotaResponse: { data: [{ quota_usage: 0, config: { quota_total: 100, quota_duration: 3600 } }] } },
    { assetFailure: true }, { duplicate: true },
  ]) {
    const h = harness(options);
    await assert.rejects(h.run(), error => !error.message.includes(token));
    assert.equal(h.mutations.length, 0); assert.equal(h.writes.length, 0);
  }
  const h = harness({ quotaUsage: 60, quotaTotal: 100 });
  assert.equal((await h.run('preflight')).quota.quotaTotal, 100);
  assert.equal(h.mutations.length, 0);
});

test('quota is checked again just before publish and an unclaimed publish can safely resume', async () => {
  const h = harness({ quotaByCall: call => call >= 9 ? 100 : 2 });
  await assert.rejects(h.run(), /quota exhausted/);
  assert.equal(h.mutations.length, 7); assert.equal(h.state().publish, undefined);
  h.faults.quotaByCall = undefined;
  assert.equal((await h.run()).status, 'verified');
  assert.equal(h.mutations.length, 8);
});

test('history scans every cursor page without following token-bearing next URLs', async () => {
  const h = harness({ historyResponse: request => request.after
    ? { data: [{ id: '2', caption: h.spec.caption }] }
    : { data: [{ id: '1', caption: 'unrelated' }], paging: { cursors: { after: 'NEXT' }, next: `https://evil.example/other-account?access_token=${token}` } } });
  await assert.rejects(h.run(), /Matching Instagram caption/);
  assert.deepEqual(h.requests.filter(request => request.route.endsWith('/media')).map(request => request.after), [null, 'NEXT']);
  assert.equal(h.mutations.length, 0); assert.equal(h.writes.length, 0);
});

test('incomplete, repeated and unbounded history cannot declare no duplicate', async () => {
  for (const historyResponse of [
    () => ({}), () => ({ data: [], paging: { next: 'next', cursors: { after: 'NEXT' } } }),
    () => ({ data: [{ id: '1', caption: '' }], paging: { next: 'next' } }),
    () => ({ data: [{ id: '1', caption: '' }], paging: { next: 'next', cursors: { after: 'NEXT' } } }),
    request => ({ data: [{ id: String(Number(request.after || 0) + 1), caption: '' }], paging: { next: 'next', cursors: { after: String(Number(request.after || 0) + 1) } } }),
  ]) {
    const h = harness({ historyResponse });
    await assert.rejects(h.run());
    assert.equal(h.mutations.length, 0); assert.equal(h.writes.length, 0);
  }
});

test('published children paginate in order without using returned next URLs', async () => {
  const h = harness({ childrenResponse: (post, request) => {
    const start = Number(request.after || 0);
    return { data: post.children.data.slice(start, start + 2), ...(start < 4 ? { paging: { next: `https://evil.example/?access_token=${token}`, cursors: { after: String(start + 2) } } } : {}) };
  } });
  assert.equal((await h.run()).status, 'verified');
  assert.deepEqual(h.requests.filter(request => request.route.endsWith('/children')).map(request => request.after), [null, '2', '4']);
  assert.deepEqual(h.state().publishedChildIds, ['8000', '8001', '8002', '8003', '8004', '8005']);
});

test('incomplete published children paging cannot verify a receipt', async () => {
  const h = harness({ changePost: post => { post.children.paging = { next: 'next' }; } });
  await assert.rejects(h.run(), /cursor missing|paging incomplete/);
  assert.equal(h.state().status, 'accepted'); assert.equal(h.mutations.length, 8);
});

test('claimed content, asset order, pins and target remain immutable; unsupported dates stop offline', async () => {
  const h = harness(); await h.run();
  for (const patch of [
    { caption: 'different' }, { assetCommit: 'b'.repeat(40) }, { images: [...h.spec.images].reverse() },
    { target: { ...h.spec.target, accountId: 'other' } }, { date: '2026-10-18' }, { date: '2026-11-17' },
    { date: '2026-10-22' }, { transport: 'buffer' },
  ]) {
    const before = h.requests.length;
    await assert.rejects(h.run('preflight', { spec: { ...h.spec, ...patch } }));
    assert.equal(h.requests.length, before);
  }
  assert.equal(h.mutations.length, 8);
});

test('selected source freshness is checked before mutation and reconcile can inspect expired sources', async () => {
  const event = { id: 'source-event', startDate: '2026-10-22', endDate: '2026-10-23', city: 'Paris' };
  const freshness = { kind: 'events', eventIds: [event.id], expectedDates: { [event.id]: { startDate: event.startDate, endDate: event.endDate } }, expectedDetails: { [event.id]: { city: event.city } } };
  const stale = harness({ freshness, events: [{ ...event, eventStatus: 'EventCancelled' }] });
  await assert.rejects(stale.run(), /cancelled/); assert.equal(stale.mutations.length, 0);
  const h = harness({ freshness, events: [event] }); await h.run();
  h.time(Date.parse('2026-10-24T11:30:00Z'));
  await assert.rejects(h.run('preflight'), /has ended/);
  assert.equal((await h.run('reconcile')).status, 'verified');
});
