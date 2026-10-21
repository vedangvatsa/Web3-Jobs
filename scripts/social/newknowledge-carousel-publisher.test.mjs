import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { CAMPAIGN, sha256 } from './newknowledge-content.mjs';
import { durableReceipt } from './newknowledge-state.mjs';
import { CAROUSEL_ACCOUNTS, carouselProviderClient } from './newknowledge-carousel-providers.mjs';
import { runCarouselPlatform } from './newknowledge-carousel-publisher.mjs';

const content = JSON.parse(await fs.readFile(new URL('../../social-assets/knowledge-threads-month/content.json', import.meta.url)));
const calendar = JSON.parse(await fs.readFile(new URL('../../social-assets/knowledge-threads-month/calendar.json', import.meta.url)));
const date = '2026-10-21', now = Date.parse(`${date}T11:30:00Z`);
const encode = value => JSON.stringify(value, null, 2) + '\n';
const reply = data => new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } });

function harness(platform, options = {}) {
  const sourceThread = structuredClone(content.threads.find(thread => thread.id === 'C02'));
  if (options.freshness) sourceThread.freshness = options.freshness;
  const target = CAROUSEL_ACCOUNTS[platform];
  const image = index => ({ path: `social-assets/knowledge-threads-month/exports/C02-${index}.jpg`, url: `https://raw.githubusercontent.com/vedangvatsa/Web3-Jobs/${'a'.repeat(40)}/social-assets/knowledge-threads-month/exports/C02-${index}.jpg`, sha256: String(index).repeat(64), bytes: 123, width: 1080, height: 1350, alt: `Approved carousel image number ${index}` });
  const spec = {
    campaign: CAMPAIGN, date, threadId: sourceThread.id, sequence: sourceThread.sequence, platform, target,
    sourceThreadSha256: sha256(JSON.stringify(sourceThread)), sourcePostHashes: sourceThread.posts.map(post => sha256(JSON.stringify(post))),
    assetCommit: 'a'.repeat(40), caption: `Approved ${platform} caption`,
    ...(platform === 'linkedin' ? { title: 'Approved document', pdf: { path: 'social-assets/knowledge-threads-month/exports/C02.pdf', url: 'https://example.test/C02.pdf', sha256: 'f'.repeat(64), bytes: 100, pageCount: 6, widthPt: 600, heightPt: 750 }, thumbnail: image(1) } : { images: Array.from({ length: 6 }, (_, i) => image(i + 1)) }),
  };
  const account = { id: target.channelId, service: target.service, serviceId: target.serviceId, externalLink: target.profile, name: 'hashtagweb3', type: platform === 'linkedin' ? 'page' : 'business', organizationId: 'brand-org', isDisconnected: false, isLocked: false, isQueuePaused: false, allowedActions: ['readUpdates', 'scheduleUpdates'] };
  const faults = { ...options }, mutations = [], requests = [], writes = [], records = [], posts = new Map();
  let remote = null, revision = 0, currentTime = now, assetsVerified = false;
  const makePost = id => ({
    id, text: spec.caption, channelId: target.channelId, channelService: platform, channel: structuredClone(account), status: faults.pending ? 'sending' : 'sent', schedulingType: 'automatic',
    externalLink: platform === 'linkedin' ? 'https://www.linkedin.com/feed/update/urn:li:activity:123/' : 'https://www.instagram.com/p/abc123/',
    metadata: platform === 'linkedin' ? { __typename: 'LinkedInPostMetadata', linkAttachment: null } : { __typename: 'InstagramPostMetadata', type: 'post', shouldShareToFeed: true },
    assets: platform === 'linkedin'
      ? [{ __typename: 'DocumentAsset', type: 'document', mimeType: 'application/pdf', source: spec.pdf.url, thumbnail: spec.thumbnail.url, document: { title: spec.title, numPages: 6, filesize: 100 } }]
      : spec.images.map(image => ({ __typename: 'ImageAsset', type: 'image', mimeType: 'image/jpeg', source: image.url, image: { altText: image.alt, width: image.width, height: image.height } })),
  });
  const fetcher = async (url, init) => {
    assert.equal(url, 'https://api.buffer.com');
    const { query, variables } = JSON.parse(init.body);
    requests.push(query);
    if (query.startsWith('mutation')) {
      assert.ok(remote?.claimId, 'CAS claim required before provider create');
      assert.ok(assetsVerified, 'All public assets must be checked before create');
      mutations.push(variables.input);
      const id = `post-${mutations.length}`;
      posts.set(id, makePost(id));
      if (faults.unknown) throw new Error('uncertain connection');
      if (faults.missingId) return reply({ data: { createPost: { __typename: 'MutationError', message: 'provider failure' } } });
      return reply({ data: { createPost: { __typename: 'PostActionSuccess', post: { id } } }, ...(faults.partialErrors ? { errors: [{ message: 'partial failure' }] } : {}) });
    }
    if (query.includes('CarouselChannel')) return reply({ data: { channel: { ...account, ...faults.account } } });
    if (query.includes('CarouselHistory')) return reply({ data: { posts: { edges: faults.duplicate ? [{ node: { id: 'old', text: spec.caption, channelId: target.channelId } }] : [], pageInfo: { hasNextPage: false } } } });
    const post = structuredClone(posts.get(variables.id));
    faults.post?.(post);
    return reply({ data: { post } });
  };
  const store = () => durableReceipt({
    read: async () => ({ state: structuredClone(remote), text: remote ? encode(remote) : null, sha: remote ? String(revision) : null }),
    write: async ({ sha, text }) => {
      if (sha !== (remote ? String(revision) : null)) return { ok: false, status: 409, message: 'sha conflict' };
      const value = JSON.parse(text);
      if (faults.claimWriteFailure && !value.postId) throw new Error('claim acknowledgement unknown');
      if (faults.idWriteFailure && value.postId) throw new Error('ID checkpoint failed');
      remote = value; revision++; writes.push(structuredClone(value));
      if (faults.expireAfterClaim && !value.postId) currentTime = Date.parse(`${date}T12:30:00Z`);
      return { ok: true };
    },
    record: async state => records.push({ event: 'checkpoint', state: structuredClone(state) }), wait: async () => {},
  });
  const run = (mode = 'publish', extra = {}) => runCarouselPlatform({
    spec, sourceThread, calendar, events: options.events || [], store: store(), mode, clock: () => currentTime,
    client: carouselProviderClient(platform, { env: { BUFFER_ACCESS_TOKEN: 'offline-token' }, fetcher, readOnly: mode !== 'publish' }),
    verifyAssets: async () => { if (faults.assetFailure) throw new Error('public asset unavailable'); assetsVerified = true; },
    verifyImage: async (url, image) => assert.equal(url, image.url, 'Wrong carousel image'),
    verifyDocument: async (url, document) => assert.equal(url, document.url, 'Wrong PDF source hash'),
    wait: async () => {}, journal: async (state, event) => records.push({ state: structuredClone(state), event }), ...extra,
  });
  return { run, spec, sourceThread, faults, mutations, requests, writes, records, posts, state: () => remote, time: value => { currentTime = value; } };
}

test('one native document or six-image feed post is created only after a durable claim', async () => {
  for (const platform of ['linkedin', 'instagram']) {
    const h = harness(platform);
    assert.equal((await h.run()).status, 'verified');
    assert.equal(h.mutations.length, 1);
    const input = h.mutations[0];
    assert.equal(input.channelId, CAROUSEL_ACCOUNTS[platform].channelId);
    assert.equal(input.mode, 'shareNow'); assert.equal(input.schedulingType, 'automatic');
    if (platform === 'linkedin') {
      assert.deepEqual(input.assets, [{ document: { url: h.spec.pdf.url, thumbnailUrl: h.spec.thumbnail.url, title: h.spec.title } }]);
      assert.equal(input.metadata, undefined);
    } else {
      assert.deepEqual(input.assets, h.spec.images.map(image => ({ image: { url: image.url, metadata: { altText: image.alt } } })));
      assert.deepEqual(input.metadata, { instagram: { type: 'post', shouldShareToFeed: true } });
    }
    assert.equal(h.state().status, 'verified');
    const checkpoint = h.records.findIndex(record => record.event === 'checkpoint' && record.state.postId);
    assert.ok(checkpoint >= 0 && checkpoint < h.records.findIndex(record => record.event === 'readback-attempt'));
  }
});

test('preflight and reconcile without claims have no provider or receipt writes', async () => {
  for (const platform of ['linkedin', 'instagram']) for (const mode of ['preflight', 'reconcile']) {
    const h = harness(platform);
    assert.equal((await h.run(mode)).status, 'ready');
    assert.equal(h.mutations.length, 0); assert.equal(h.writes.length, 0);
  }
});

test('LinkedIn document receipts accept native UGC permalinks and nullable platform metadata', async () => {
  for (const kind of ['activity', 'share', 'ugcPost']) {
    const h = harness('linkedin', { post: post => {
      post.externalLink = `https://www.linkedin.com/feed/update/urn:li:${kind}:123456789/`;
      post.metadata = null;
    } });
    assert.equal((await h.run()).status, 'verified');
    assert.equal((await h.run('reconcile')).status, 'verified');
    assert.equal(h.mutations.length, 1);
  }
  for (const change of [
    post => { delete post.metadata; },
    post => { post.metadata = { __typename: 'InstagramPostMetadata' }; },
    post => { post.metadata.linkAttachment = { url: 'https://hashtagweb3.com/' }; },
    post => { post.externalLink = 'https://www.linkedin.com/feed/update/urn:li:organization:123456789/'; },
    post => { post.externalLink = 'https://www.linkedin.com/feed/update/urn:li:ugcPost:not-a-post/'; },
    post => { post.externalLink = 'https://www.linkedin.com/company/hashtagweb3/'; },
    post => { post.externalLink = 'https://linkedin.com.example/feed/update/urn:li:ugcPost:123456789/'; },
  ]) {
    const h = harness('linkedin', { post: change });
    await assert.rejects(h.run());
    await assert.rejects(h.run('reconcile'));
    assert.equal(h.state().status, 'accepted');
    assert.equal(h.mutations.length, 1);
  }
});

test('unknown and ID-less creates cannot automatically resend, including on a later date', async () => {
  for (const platform of ['linkedin', 'instagram']) for (const fault of ['unknown', 'missingId']) {
    const h = harness(platform, { [fault]: true });
    await assert.rejects(h.run(), /unknown|no confirmed ID/);
    h.faults[fault] = false;
    await assert.rejects(h.run(), /Ambiguous earlier/);
    h.time(Date.parse('2026-10-22T11:30:00Z'));
    await assert.rejects(h.run(), /Ambiguous earlier/);
    assert.equal(h.mutations.length, 1); assert.equal(h.state().status, 'claimed');
  }
});

test('partial GraphQL responses checkpoint their known ID before reporting errors', async () => {
  const h = harness('linkedin', { partialErrors: true });
  await assert.rejects(h.run(), /Buffer request failed/);
  assert.equal(h.state().postId, 'post-1'); assert.equal(h.state().status, 'accepted');
  h.faults.partialErrors = false;
  assert.equal((await h.run()).status, 'verified');
  assert.equal(h.mutations.length, 1);
});

test('callback receipt write failure retains a local ID and never retries the create', async () => {
  for (const platform of ['linkedin', 'instagram']) {
    const h = harness(platform, { idWriteFailure: true });
    await assert.rejects(h.run(), /ID checkpoint failed/);
    assert.ok(h.records.some(record => record.state.postId === 'post-1'));
    assert.equal(h.state().postId, undefined);
    h.faults.idWriteFailure = false;
    await assert.rejects(h.run(), /Ambiguous earlier/);
    assert.equal((await h.run('reconcile', { recovery: { postId: 'post-1' } })).status, 'verified');
    assert.equal(h.mutations.length, 1);
  }
});

test('claim races allow exactly one provider create per platform', async () => {
  for (const platform of ['linkedin', 'instagram']) {
    const h = harness(platform);
    const results = await Promise.allSettled([h.run(), h.run()]);
    assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
    assert.equal(h.mutations.length, 1);
  }
});

test('account, complete history, public assets and durable claim failures stop before create', async () => {
  for (const fault of [{ account: { serviceId: 'personal-id' } }, { duplicate: true }, { assetFailure: true }, { claimWriteFailure: true }]) {
    const h = harness('linkedin', fault);
    await assert.rejects(h.run());
    assert.equal(h.mutations.length, 0); assert.equal(h.writes.length, 0);
  }
});

test('exact 12:30 UTC boundary and a claim that crosses it cannot create or backfill', async () => {
  for (const time of [`${date}T11:29:59.999Z`, `${date}T12:30:00Z`, '2026-10-22T11:30:00Z']) {
    const h = harness('instagram'); h.time(Date.parse(time));
    await assert.rejects(h.run(), /Outside posting window/);
    assert.equal(h.requests.length, 0);
  }
  const h = harness('instagram', { expireAfterClaim: true });
  await assert.rejects(h.run(), /Outside posting window/);
  assert.equal(h.mutations.length, 0); assert.equal(h.state().status, 'claimed');
});

test('pending IDs get bounded polling and resume with one read, even outside the create window', async () => {
  const h = harness('instagram', { pending: true });
  await assert.rejects(h.run(), /ID retained but not sent/);
  assert.equal(h.requests.filter(query => query.includes('CarouselPost')).length, 36);
  const before = h.requests.length;
  await assert.rejects(h.run(), /ID retained but not sent/);
  assert.equal(h.requests.slice(before).filter(query => query.includes('CarouselPost')).length, 1);
  h.posts.get('post-1').status = 'sent'; h.time(Date.parse('2026-10-22T15:00:00Z'));
  assert.equal((await h.run()).status, 'verified');
  assert.equal(h.mutations.length, 1);
});

test('verified reruns and verified preflight read current proof without mutations', async () => {
  const h = harness('linkedin'); await h.run();
  const count = h.writes.length;
  for (const mode of ['publish', 'preflight', 'reconcile']) {
    const before = h.requests.length;
    const result = await h.run(mode);
    assert.equal(result.proof.postId, 'post-1');
    assert.ok(h.requests.slice(before).some(query => query.includes('CarouselPost')));
  }
  assert.equal(h.writes.length, count); assert.equal(h.mutations.length, 1);
  h.faults.post = post => { post.text = 'changed after publication'; };
  await assert.rejects(h.run('preflight'), /Wrong carousel caption/);
  assert.equal(h.writes.length, count);
});

test('wrong account, PDF, title, cover, asset type or image order cannot verify a receipt', async () => {
  const changes = {
    linkedin: [
      post => { post.channel.serviceId = 'other'; }, post => { post.assets[0].source = 'https://example.test/wrong.pdf'; },
      post => { post.assets[0].document.title = 'wrong'; }, post => { post.assets[0].document.numPages = 5; },
      post => { post.assets[0].thumbnail = 'https://example.test/wrong.jpg'; }, post => { post.metadata.linkAttachment = { url: 'https://example.test' }; },
    ],
    instagram: [
      post => { post.channelId = 'other'; }, post => { post.assets.reverse(); },
      post => { post.assets[0].type = 'video'; }, post => { post.metadata.type = 'reel'; },
      post => { post.assets[0].image.altText = 'wrong'; }, post => { post.assets[0].source = 'https://example.test/wrong.jpg'; },
    ],
  };
  for (const [platform, faults] of Object.entries(changes)) for (const change of faults) {
    const h = harness(platform, { post: change });
    await assert.rejects(h.run()); await assert.rejects(h.run());
    assert.equal(h.state().status, 'accepted'); assert.equal(h.state().postId, 'post-1');
    assert.equal(h.mutations.length, 1);
  }
});

test('provider error and unknown status retain IDs without blind retries', async () => {
  for (const status of ['error', 'draft', 'needs_approval', 'unknown']) {
    const h = harness('linkedin', { post: post => { post.status = status; } });
    await assert.rejects(h.run(), /uncertain status/);
    await assert.rejects(h.run(), /uncertain status/);
    assert.equal(h.state().postId, 'post-1'); assert.equal(h.mutations.length, 1);
  }
});

test('manual reconciliation verifies the candidate first and cannot replace a known ID', async () => {
  const h = harness('linkedin', { unknown: true });
  await assert.rejects(h.run());
  h.faults.post = post => { post.assets[0].document.title = 'wrong'; };
  const count = h.writes.length;
  await assert.rejects(h.run('reconcile', { recovery: { postId: 'post-1' } }), /Wrong document title/);
  assert.equal(h.writes.length, count);
  delete h.faults.post;
  await h.run('reconcile', { recovery: { postId: 'post-1' } });
  await assert.rejects(h.run('reconcile', { recovery: { postId: 'other' } }), /cannot replace/);
  assert.equal(h.mutations.length, 1);
});

test('claimed captions, titles, pins and account targets are immutable', async () => {
  const h = harness('linkedin'); await h.run();
  for (const patch of [{ caption: 'different' }, { title: 'different' }, { assetCommit: 'b'.repeat(40) }, { pdf: { ...h.spec.pdf, sha256: 'b'.repeat(64) } }, { target: { ...h.spec.target, channelId: 'other' } }]) {
    await assert.rejects(h.run('preflight', { spec: { ...h.spec, ...patch } }));
  }
  assert.equal(h.mutations.length, 1);
});

test('unsupported dates and mismatched calendar selections stop before provider reads', async () => {
  for (const invalid of ['2026-10-18', '2026-11-17', '2026-10-32']) {
    const h = harness('instagram');
    await assert.rejects(h.run('preflight', { spec: { ...h.spec, date: invalid } }));
    assert.equal(h.requests.length, 0);
  }
  const h = harness('instagram');
  await assert.rejects(h.run('preflight', { spec: { ...h.spec, date: '2026-10-22' } }), /calendar date changed/);
  assert.equal(h.requests.length, 0);
});

test('only the selected thread freshness is required and reconcile can inspect expired sources', async () => {
  const event = { id: 'event', startDate: '2026-10-22', endDate: '2026-10-23', city: 'Paris' };
  const freshness = { kind: 'events', eventIds: ['event'], expectedDates: { event: { startDate: event.startDate, endDate: event.endDate } }, expectedDetails: { event: { city: 'Paris' } } };
  const h = harness('instagram', { freshness, events: [event] });
  await h.run();
  h.time(Date.parse('2026-10-24T11:30:00Z'));
  await assert.rejects(h.run('preflight'), /event has ended/);
  assert.equal((await h.run('reconcile')).status, 'verified');
  const stale = harness('instagram', { freshness, events: [{ ...event, eventStatus: 'EventCancelled' }] });
  await assert.rejects(stale.run(), /cancelled/);
  assert.equal(stale.mutations.length, 0); assert.equal(stale.writes.length, 0);
  assert.equal((await harness('instagram', { events: [{ ...event, eventStatus: 'EventCancelled' }] }).run('preflight')).status, 'ready');
});
