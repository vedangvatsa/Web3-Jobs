import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { CAMPAIGN, sha256, assertKnowledgeWindow, assertThreadResourceFreshness } from './newknowledge-content.mjs';
import { REPOSITORY, sleep } from './newknowledge-state.mjs';
import { assertCarouselDate } from './newknowledge-carousel-state.mjs';
import { assertCarouselCaption } from './newknowledge-carousel-providers.mjs';
import { assertCarouselAssetPath } from './newknowledge-carousel-publisher.mjs';

export const INSTAGRAM_CAROUSEL_TARGET = Object.freeze({ accountId: '17841473830256790', username: 'hashtagweb3', service: 'instagram' });
const API = 'https://graph.facebook.com/v21.0';
const receiptStatuses = new Set(['claimed', 'container-created', 'publishing', 'accepted', 'verified']);
const idPattern = /^\d+$/;
const assertId = id => assert.ok(typeof id === 'string' && idPattern.test(id), 'Invalid Instagram ID');

function assertImage(image, commit) {
  assertCarouselAssetPath(image?.path);
  assert.match(image.sha256, /^[a-f0-9]{64}$/, 'Invalid Instagram image hash');
  assert.ok(Number.isSafeInteger(image.bytes) && image.bytes > 0 && image.bytes < 8 * 1024 * 1024, 'Invalid Instagram image size');
  assert.equal(image.width, 1080); assert.equal(image.height, 1350);
  assert.ok(typeof image.alt === 'string' && image.alt.trim().length >= 20 && image.alt.length <= 1000, 'Invalid Instagram image alt text');
  assert.match(commit, /^[a-f0-9]{40}$/, 'Instagram assets require a full Git commit SHA');
  assert.equal(image.url, `https://raw.githubusercontent.com/${REPOSITORY}/${commit}/${image.path}`, 'Instagram image URL must be full-SHA-pinned');
}

function assertSpec(spec) {
  assert.equal(spec?.transport, 'meta', 'Explicit Meta transport required');
  assert.equal(spec.platform, 'instagram');
  assert.equal(spec.campaign, CAMPAIGN);
  assertCarouselDate(spec.date);
  assert.deepEqual(spec.target, INSTAGRAM_CAROUSEL_TARGET, 'Wrong Instagram carousel target');
  assertCarouselCaption(spec.caption, 'instagram');
  assert.ok((spec.caption.match(/(?:^|\s)@[\w.]+/g) || []).length <= 20, 'Too many Instagram mentions');
  assert.equal(spec.images?.length, 6, 'Instagram carousel needs six images');
  for (const image of spec.images) assertImage(image, spec.assetCommit);
  assert.equal(new Set(spec.images.map(image => image.sha256)).size, 6, 'Instagram carousel images must be distinct');
}

export function createInstagramCarouselSpec(bufferSpec) {
  assert.equal(bufferSpec?.platform, 'instagram', 'Only Instagram specs can select Meta');
  assert.ok(!bufferSpec.transport || ['buffer', 'meta'].includes(bufferSpec.transport), 'Unsupported existing transport');
  const spec = { ...structuredClone(bufferSpec), transport: 'meta', target: { ...INSTAGRAM_CAROUSEL_TARGET } };
  assertSpec(spec);
  return spec;
}

function accountIdentity(account) {
  assert.ok(account?.id === INSTAGRAM_CAROUSEL_TARGET.accountId, 'Wrong Instagram account ID');
  assert.ok(typeof account.username === 'string' && account.username.toLowerCase() === INSTAGRAM_CAROUSEL_TARGET.username, 'Wrong Instagram username');
  return { ...INSTAGRAM_CAROUSEL_TARGET };
}

function assertCapacity(quota) {
  assert.ok(Number.isSafeInteger(quota?.quotaUsage) && quota.quotaUsage >= 0, 'Invalid Instagram quota usage');
  assert.ok(Number.isSafeInteger(quota.quotaTotal) && quota.quotaTotal > 0, 'Invalid Instagram quota total');
  assert.equal(quota.quotaDuration, 86400, 'Unsupported Instagram quota duration');
  assert.ok(quota.quotaUsage < quota.quotaTotal, 'Instagram publishing quota exhausted');
  return quota;
}

export function instagramCarouselClient({ env = process.env, fetcher = fetch, readOnly = true } = {}) {
  const token = env.META_PAGE_TOKEN;
  const safeError = error => {
    let message = error instanceof Error ? error.message : 'Instagram operation failed';
    if (token) for (const secret of [token, encodeURIComponent(token)]) message = message.replaceAll(secret, '[redacted]');
    return new Error(message);
  };
  const wrap = operation => async (...args) => { try { return await operation(...args); } catch (error) { throw safeError(error); } };
  const request = async (route, { params, body, onId } = {}) => {
    assert.ok(!body || !readOnly, 'Read-only mode forbids Instagram mutations');
    assert.ok(token, 'META_PAGE_TOKEN missing');
    if (body) assert.equal(typeof onId, 'function', 'Instagram known-ID checkpoint callback required');
    const url = new URL(`${API}/${route}`);
    if (params) url.search = new URLSearchParams(params).toString();
    let response, result;
    try {
      response = await fetcher(url.href, {
        method: body ? 'POST' : 'GET', redirect: 'error',
        headers: { Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}) },
        ...(body ? { body: new URLSearchParams(body) } : {}), signal: AbortSignal.timeout(60000),
      });
      result = await response.json();
    } catch { throw new Error(body ? 'Instagram mutation response unknown; reconcile without resending' : 'Instagram read response unavailable'); }
    if (body && typeof result?.id === 'string' && idPattern.test(result.id)) await onId(result.id);
    assert.ok(response.ok && result && !result.error, `Instagram request failed: HTTP ${response.status}${body ? '; retain any known ID and reconcile without resending' : ''}`);
    if (body) {
      assertId(result.id);
      assert.ok(!result.config_issue && !result.caption_add_on_attachment_status, 'Instagram partial publication; known ID retained, reconcile without resending');
    }
    return result;
  };
  const collect = async (route, fields, { maxItems = 9999, maxPages = 100 } = {}) => {
    const items = [], cursors = new Set(), ids = new Set();
    let after;
    for (let page = 0; page < maxPages; page++) {
      const result = await request(route, { params: { fields, limit: '100', ...(after ? { after } : {}) } });
      assert.ok(Array.isArray(result.data), 'Instagram collection incomplete');
      for (const item of result.data) {
        assertId(item.id);
        assert.ok(!ids.has(item.id), 'Instagram collection repeated an ID');
        ids.add(item.id); items.push(item);
      }
      assert.ok(items.length <= maxItems, 'Instagram collection reached its completeness bound');
      if (!result.paging?.next) return items;
      assert.ok(typeof result.paging.next === 'string' && result.data.length > 0, 'Instagram collection paging incomplete');
      after = result.paging.cursors?.after;
      assert.ok(typeof after === 'string' && after && !cursors.has(after), 'Instagram collection cursor missing or stalled');
      cursors.add(after);
    }
    throw new Error('Instagram collection exceeded pagination bound');
  };
  return {
    readOnly,
    account: wrap(async () => {
      const account = await request(INSTAGRAM_CAROUSEL_TARGET.accountId, { params: { fields: 'id,username' } });
      accountIdentity(account);
      return { id: account.id, username: account.username };
    }),
    quota: wrap(async () => {
      const result = await request(`${INSTAGRAM_CAROUSEL_TARGET.accountId}/content_publishing_limit`, { params: { fields: 'quota_usage,config' } });
      assert.ok(Array.isArray(result.data) && result.data.length === 1, 'Instagram quota unavailable');
      const entry = result.data[0];
      return assertCapacity({ quotaUsage: entry.quota_usage, quotaTotal: entry.config?.quota_total, quotaDuration: entry.config?.quota_duration });
    }),
    history: wrap(async account => {
      accountIdentity(account);
      const items = await collect(`${INSTAGRAM_CAROUSEL_TARGET.accountId}/media`, 'id,caption,timestamp');
      return items.map(item => {
        assert.ok(item.caption === undefined || item.caption === null || typeof item.caption === 'string', 'Invalid Instagram history caption');
        return { id: item.id, caption: item.caption ?? '', ...(item.timestamp ? { timestamp: item.timestamp } : {}) };
      });
    }),
    createChild: wrap(async (spec, index, onId) => {
      assert.ok(!readOnly, 'Read-only mode forbids Instagram mutations');
      assertSpec(spec);
      assert.ok(Number.isInteger(index) && index >= 0 && index < 6, 'Invalid Instagram child index');
      const image = spec.images[index];
      return (await request(`${INSTAGRAM_CAROUSEL_TARGET.accountId}/media`, { body: { image_url: image.url, is_carousel_item: 'true', alt_text: image.alt }, onId })).id;
    }),
    createParent: wrap(async (spec, children, onId) => {
      assert.ok(!readOnly, 'Read-only mode forbids Instagram mutations');
      assertSpec(spec);
      assert.equal(children?.length, 6);
      children.forEach(assertId);
      assert.equal(new Set(children).size, 6, 'Duplicate Instagram child containers');
      return (await request(`${INSTAGRAM_CAROUSEL_TARGET.accountId}/media`, { body: { media_type: 'CAROUSEL', children: children.join(','), caption: spec.caption }, onId })).id;
    }),
    container: wrap(async id => {
      assertId(id);
      const result = await request(id, { params: { fields: 'id,status_code' } });
      assert.ok(result.id === id, 'Wrong Instagram container ID');
      assert.ok(['FINISHED', 'IN_PROGRESS', 'ERROR', 'EXPIRED', 'PUBLISHED'].includes(result.status_code), 'Unknown Instagram container status');
      return { id, status_code: result.status_code };
    }),
    publish: wrap(async (parentId, onId) => {
      assert.ok(!readOnly, 'Read-only mode forbids Instagram mutations');
      assertId(parentId);
      return (await request(`${INSTAGRAM_CAROUSEL_TARGET.accountId}/media_publish`, { body: { creation_id: parentId }, onId })).id;
    }),
    post: wrap(async id => {
      assertId(id);
      const post = await request(id, { params: { fields: 'id,owner,media_type,media_product_type,caption,permalink,timestamp' } });
      assert.ok(post.id === id && post.owner?.id === INSTAGRAM_CAROUSEL_TARGET.accountId, 'Wrong Instagram published post owner or ID');
      assert.ok(post.media_type === 'CAROUSEL_ALBUM', 'Instagram post is not a carousel album');
      const children = await collect(`${id}/children`, 'id,media_type,media_url,alt_text', { maxItems: 6, maxPages: 6 });
      return {
        id: post.id, owner: { id: post.owner.id }, media_type: post.media_type,
        ...(post.media_product_type != null ? { media_product_type: post.media_product_type } : {}),
        caption: post.caption, permalink: post.permalink, ...(post.timestamp != null ? { timestamp: post.timestamp } : {}),
        children: { data: children.map(child => ({ id: child.id, media_type: child.media_type, media_url: child.media_url, alt_text: child.alt_text })) },
      };
    }),
  };
}

export async function verifyInstagramCarouselReceipt(post, spec, { verifyImage, postId = post?.id, startedAt, now = Date.now() } = {}) {
  assertSpec(spec);
  assertId(postId);
  assert.ok(post?.id === postId, 'Wrong Instagram published post ID');
  assert.ok(post.owner?.id === spec.target.accountId, 'Wrong Instagram published post owner');
  assert.ok(post.media_type === 'CAROUSEL_ALBUM', 'Instagram post is not a carousel album');
  if (post.media_product_type != null) assert.ok(post.media_product_type === 'FEED', 'Instagram carousel must be a feed post');
  assert.ok(post.caption === spec.caption, 'Wrong Instagram carousel caption');
  const url = new URL(post.permalink);
  assert.ok(url.protocol === 'https:' && ['instagram.com', 'www.instagram.com'].includes(url.hostname) && !url.username && !url.password && !url.port && !url.search && !url.hash && /^\/p\/[\w-]+\/?$/.test(url.pathname), 'Invalid Instagram carousel permalink');
  if (post.timestamp != null) {
    const time = Date.parse(post.timestamp), claimTime = Date.parse(startedAt);
    assert.ok(typeof post.timestamp === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(post.timestamp) && Number.isFinite(time) && Number.isFinite(claimTime) && Number.isFinite(now), 'Invalid Instagram publication timestamp');
    assert.ok(time >= claimTime - 60000 && time <= now + 60000, 'Instagram publication timestamp does not match the claim');
  }
  assert.ok(Array.isArray(post.children?.data) && !post.children.paging?.next, 'Incomplete Instagram carousel children');
  assert.equal(post.children.data.length, 6, 'Wrong Instagram carousel image count');
  const childIds = [];
  for (const [index, child] of post.children.data.entries()) {
    assertId(child.id); childIds.push(child.id);
    assert.ok(child.media_type === 'IMAGE', 'Instagram carousel child must be an image');
    assert.ok(child.alt_text === spec.images[index].alt, 'Wrong Instagram image alt text or order');
    const imageURL = new URL(child.media_url);
    assert.ok(imageURL.protocol === 'https:' && !imageURL.username && !imageURL.password && !imageURL.searchParams.has('access_token'), 'Invalid Instagram child image URL');
    await verifyImage(child.media_url, spec.images[index]);
  }
  assert.equal(new Set(childIds).size, 6, 'Duplicate published Instagram child IDs');
  return { postId, status: 'sent', permalink: post.permalink, childIds, altTextVerified: true, ...(post.timestamp ? { timestamp: post.timestamp } : {}) };
}

function validateState(state, spec) {
  assert.equal(state.version, 1, 'Unsupported Instagram carousel receipt');
  assert.ok(state.claimId && Number.isFinite(Date.parse(state.startedAt)), 'Invalid Instagram carousel claim');
  assert.deepEqual(state.spec, spec, 'Claimed Instagram content, transport, account or asset pins changed');
  assert.deepEqual(state.account, INSTAGRAM_CAROUSEL_TARGET, 'Claimed Instagram account changed');
  assert.ok(receiptStatuses.has(state.status), 'Unknown Instagram receipt status');
  assert.ok(state.children && !Array.isArray(state.children), 'Missing Instagram child claims');
  for (const [key, child] of Object.entries(state.children)) {
    assert.match(key, /^[0-5]$/);
    assert.ok(child.createClaim && receiptStatuses.has(child.status), 'Invalid Instagram child claim');
    if (child.containerId) assertId(child.containerId);
    if (child.status === 'verified') assert.ok(child.containerId, 'Verified child lacks an ID');
  }
  const knownChildren = Object.values(state.children).map(child => child.containerId).filter(Boolean);
  assert.equal(new Set(knownChildren).size, knownChildren.length, 'Duplicate claimed Instagram child IDs');
  if (state.parent) {
    assert.ok(state.parent.createClaim && receiptStatuses.has(state.parent.status), 'Invalid Instagram parent claim');
    const ids = Array.from({ length: 6 }, (_, index) => {
      assert.ok(state.children[index]?.status === 'verified', 'Parent requires six verified children');
      return state.children[index].containerId;
    });
    assert.equal(new Set(ids).size, 6, 'Duplicate claimed child IDs');
    assert.deepEqual(state.parent.childContainerIds, ids, 'Parent child order changed');
    if (state.parent.containerId) {
      assertId(state.parent.containerId);
      assert.ok(!ids.includes(state.parent.containerId), 'Instagram parent cannot reuse a child container ID');
    }
  }
  if (state.publish) {
    assert.ok(state.publish.claimId && state.parent?.containerId && receiptStatuses.has(state.publish.status), 'Invalid Instagram publish claim');
    assert.equal(state.publish.creationId, state.parent.containerId, 'Publish parent changed');
    if (state.publish.postId) assertId(state.publish.postId);
  }
  if (state.postId) {
    assertId(state.postId);
    assert.ok(state.publish?.claimId, 'Published ID requires an existing publish claim');
    assert.equal(state.publish.postId, state.postId, 'Conflicting Instagram published IDs');
  }
  if (state.status === 'verified') assert.ok(state.postId && state.publishedChildIds?.length === 6, 'Verified Instagram receipt lacks IDs');
}

export async function runInstagramCarousel({
  spec, sourceThread, calendar, events = [], store, client, verifyAssets, verifyImage,
  mode = 'preflight', initialState, recovery, clock = Date.now, wait = sleep, journal,
}) {
  assert.ok(['preflight', 'publish', 'reconcile'].includes(mode), 'Unknown Instagram carousel mode');
  spec = structuredClone(spec);
  assertSpec(spec);
  assert.equal(spec.threadId, sourceThread?.id);
  assert.equal(spec.sequence, sourceThread.sequence);
  assert.equal(spec.sourceThreadSha256, sha256(JSON.stringify(sourceThread)), 'Selected Instagram source changed');
  assert.deepEqual(spec.sourcePostHashes, sourceThread.posts.map(post => sha256(JSON.stringify(post))), 'Selected Instagram source posts changed');
  assert.deepEqual(calendar.dates.find(entry => entry.date === spec.date), { date: spec.date, id: sourceThread.id, sequence: sourceThread.sequence, title: sourceThread.title }, 'Selected Instagram calendar date changed');
  assert.equal(typeof journal, 'function', 'Durable local journal required');
  assert.equal(typeof verifyAssets, 'function', 'Public asset verification required');
  assert.equal(typeof verifyImage, 'function', 'Provider image verification required');
  if (recovery) { assert.equal(mode, 'reconcile', 'Only reconcile accepts a post ID'); assertId(recovery.postId); }
  let state = initialState === undefined ? await store.load() : structuredClone(initialState);
  if (state) { validateState(state, spec); await journal(state, 'checkpoint'); }
  const stamp = () => new Date(clock()).toISOString();
  const freshness = () => {
    if (mode !== 'reconcile') assertThreadResourceFreshness(sourceThread, events, Math.max(clock(), Date.parse(`${spec.date}T11:30:00Z`)));
  };
  const guard = () => { assert.equal(mode, 'publish', 'Read-only Instagram provider operation'); assertKnowledgeWindow(spec.date, clock()); freshness(); };
  const save = async () => { assert.notEqual(mode, 'preflight', 'Read-only Instagram receipts'); state = await store.save(state); validateState(state, spec); };
  const capacity = async () => {
    const quota = assertCapacity(await client.quota());
    await journal(quota, 'instagram-publishing-quota');
    return quota;
  };
  freshness();
  if (mode === 'publish' && !state?.postId && !state?.publish?.postId) {
    assert.notEqual(client.readOnly, true, 'Publish resumptions require a writable Instagram client; no new claim was acquired');
    guard();
  }
  if (recovery) {
    assert.ok(state?.publish?.claimId, 'Recovery requires an existing publish claim');
    assert.ok(!(state.postId || state.publish.postId) || (state.postId || state.publish.postId) === recovery.postId, 'Recovery cannot replace a known Instagram post ID');
  }
  const account = await client.account();
  const identity = accountIdentity(account);
  if (state) assert.deepEqual(state.account, identity, 'Instagram account changed after claim');
  await verifyAssets(spec);
  if (!state) {
    const quota = mode === 'reconcile' ? undefined : await capacity();
    const history = await client.history(account);
    const matches = history.filter(post => post.caption === spec.caption);
    await journal({ ids: matches.map(post => post.id) }, 'instagram-matching-history');
    assert.equal(matches.length, 0, 'Matching Instagram caption exists; manual reconciliation required');
    if (mode !== 'publish') return { status: 'ready', spec, account: identity, quota };
    guard();
    state = { version: 1, spec, account: identity, claimId: randomUUID(), startedAt: stamp(), status: 'claimed', children: {} };
    await save();
  }
  const verifyPublished = async id => {
    await journal({ state, postId: id }, 'instagram-readback-attempt');
    const post = await client.post(id);
    await journal({ postId: id, post }, 'instagram-provider-receipt');
    const proof = await verifyInstagramCarouselReceipt(post, spec, { verifyImage, postId: id, startedAt: state.startedAt, now: clock() });
    if (state.publishedChildIds) assert.deepEqual(state.publishedChildIds, proof.childIds, 'Published Instagram child IDs changed');
    if (mode !== 'preflight' && state.status !== 'verified') {
      state.postId = id; state.publish.postId = id; state.publish.status = 'verified';
      state.status = 'verified'; state.publishedChildIds = proof.childIds; state.permalink = proof.permalink; state.verifiedAt = stamp();
      await journal(state, 'checkpoint'); await save();
    }
    return { status: 'verified', state, proof: { ...proof, checkedAt: stamp() } };
  };
  const knownId = recovery?.postId || state.postId || state.publish?.postId;
  if (knownId) return verifyPublished(knownId);
  if (state.publish?.claimId) {
    await journal({ state, containerId: state.parent.containerId }, 'instagram-ambiguous-publish-read');
    const container = await client.container(state.parent.containerId);
    await journal(container, 'instagram-container');
    throw new Error('Ambiguous earlier Instagram publish; reconcile a matching post ID without republishing');
  }
  if (mode === 'preflight') await capacity();
  const poll = async (id, label) => {
    const attempts = mode === 'publish' ? 6 : 1;
    for (let attempt = 0; attempt < attempts; attempt++) {
      await journal({ state, containerId: id, label, attempt }, 'instagram-container-read-attempt');
      const container = await client.container(id);
      await journal({ ...container, label }, 'instagram-container');
      assert.equal(container.id, id, 'Wrong Instagram container ID');
      if (container.status_code === 'FINISHED') return true;
      assert.ok(container.status_code === 'IN_PROGRESS', 'Instagram container failed, expired or already published; retain IDs and reconcile');
      if (attempt + 1 < attempts) await wait(60000);
    }
    assert.notEqual(mode, 'publish', 'Instagram container still processing; retain its ID and resume without recreating');
    return false;
  };
  const mutate = async (label, send, checkpoint) => {
    await journal({ state, label }, 'instagram-mutation-attempt');
    guard();
    let known;
    const id = await send(async id => {
      assertId(id); assert.ok(!known || known === id, 'Instagram mutation returned conflicting IDs'); known = id;
      checkpoint(id);
      await journal(state, 'checkpoint'); await save();
    });
    assert.ok(known && id === known, 'Instagram mutation skipped its ID checkpoint; reconcile without resending');
    return id;
  };
  if (!state.parent) for (let index = 0; index < 6; index++) {
    let child = state.children[index];
    if (!child) {
      if (mode !== 'publish') return { status: 'incomplete', nextStep: `child-${index + 1}`, state };
      await capacity(); guard();
      const createClaim = randomUUID();
      state.children[index] = { createClaim, startedAt: stamp(), status: 'claimed' };
      await save();
      assert.equal(state.children[index].createClaim, createClaim, 'Instagram child claim ownership changed');
      await mutate(`child-${index + 1}`, checkpoint => client.createChild(spec, index, checkpoint), id => {
        state.children[index].containerId = id; state.children[index].status = 'container-created';
      });
      child = state.children[index];
    }
    assert.ok(child.containerId, 'Ambiguous earlier Instagram child create; reconcile manually without recreating');
    if (!await poll(child.containerId, `child-${index + 1}`)) return { status: 'container-pending', nextStep: `child-${index + 1}`, state };
    if (mode === 'publish' && state.children[index].status !== 'verified') {
      state.children[index].status = 'verified'; await save();
    }
  }
  if (!state.parent) {
    if (mode !== 'publish') return { status: 'incomplete', nextStep: 'parent', state };
    const children = Array.from({ length: 6 }, (_, index) => {
      assert.equal(state.children[index].status, 'verified', 'Parent requires ready child containers');
      return state.children[index].containerId;
    });
    await capacity(); guard();
    const createClaim = randomUUID();
    state.parent = { createClaim, startedAt: stamp(), status: 'claimed', childContainerIds: children };
    await save();
    assert.equal(state.parent.createClaim, createClaim, 'Instagram parent claim ownership changed');
    await mutate('parent', checkpoint => client.createParent(spec, children, checkpoint), id => {
      state.parent.containerId = id; state.parent.status = 'container-created'; state.status = 'container-created';
    });
  }
  assert.ok(state.parent.containerId, 'Ambiguous earlier Instagram parent create; reconcile manually without recreating');
  if (!await poll(state.parent.containerId, 'parent')) return { status: 'container-pending', nextStep: 'publish', state };
  if (mode !== 'publish') return { status: 'container-ready', nextStep: 'publish', state };
  await capacity(); guard();
  const claimId = randomUUID();
  state.publish = { claimId, startedAt: stamp(), creationId: state.parent.containerId, status: 'publishing' };
  state.status = 'publishing'; await save();
  assert.equal(state.publish.claimId, claimId, 'Instagram publish claim ownership changed');
  await mutate('publish', checkpoint => client.publish(state.parent.containerId, checkpoint), id => {
    state.postId = id; state.publish.postId = id; state.publish.status = 'accepted'; state.status = 'accepted';
  });
  return verifyPublished(state.postId);
}
