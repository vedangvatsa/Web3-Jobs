import assert from 'node:assert/strict';
import { CAROUSEL_PLATFORMS } from './newknowledge-carousel-state.mjs';
import { assertPublicFields, assertPublicCarouselCopy } from './public-copy-guard.mjs';

export const CAROUSEL_ACCOUNTS = Object.freeze({
  linkedin: Object.freeze({ channelId: '69c5b139af47dacb695b5feb', service: 'linkedin', serviceId: '89714573', profile: 'https://www.linkedin.com/company/hashtagweb3/' }),
  instagram: Object.freeze({ channelId: '69c5b180af47dacb695b611e', service: 'instagram', serviceId: '17841473830256790', profile: 'https://www.instagram.com/hashtagweb3/' }),
});

const channelFields = 'id name service serviceId type externalLink organizationId isDisconnected isLocked isQueuePaused allowedActions';
const assetFields = '__typename type source mimeType thumbnail ... on ImageAsset {image {altText width height}} ... on DocumentAsset {document {title numPages filesize}}';
export const CAROUSEL_POST_FIELDS = `id text status channelId channelService schedulingType externalLink channel {${channelFields}} assets {${assetFields}} metadata {__typename ... on InstagramPostMetadata {type shouldShareToFeed} ... on LinkedInPostMetadata {linkAttachment {url}}}`;

function targetFor(platform) {
  assert.ok(CAROUSEL_PLATFORMS.includes(platform), 'Unsupported carousel platform');
  return CAROUSEL_ACCOUNTS[platform];
}

function profileURL(value) {
  const url = new URL(value);
  assert.ok(url.protocol === 'https:' && !url.username && !url.password && !url.search && !url.hash && !url.port, 'Invalid public profile URL');
  return `${url.hostname.replace(/^www\./, '')}${url.pathname.replace(/\/$/, '')}`;
}

export function assertCarouselAccount(channel, platform) {
  const target = targetFor(platform);
  assert.equal(channel?.id, target.channelId, 'Wrong Buffer carousel channel');
  assert.equal(channel.service, target.service, 'Wrong Buffer channel service');
  const serviceId = platform === 'linkedin' ? channel.serviceId?.replace(/^urn:li:organization:/, '') : channel.serviceId;
  assert.equal(serviceId, target.serviceId, 'Wrong Buffer profile serviceId');
  const profiles = [profileURL(target.profile)];
  if (platform === 'linkedin') profiles.push(`linkedin.com/company/${target.serviceId}`);
  assert.ok(profiles.includes(profileURL(channel.externalLink)), 'Wrong Buffer public profile');
  if (platform === 'linkedin') assert.equal(channel.type, 'page', 'LinkedIn must be the brand Page');
  if (platform === 'instagram') {
    assert.ok(['business', 'account', 'profile'].includes(channel.type), 'Unsupported Instagram channel type');
    assert.equal(channel.name?.replace(/^@/, '').toLowerCase(), 'hashtagweb3', 'Wrong Instagram username');
  }
  assert.equal(channel.isDisconnected, false, 'Buffer channel disconnected');
  assert.equal(channel.isLocked, false, 'Buffer channel locked');
  assert.equal(channel.isQueuePaused, false, 'Buffer channel queue paused');
  assert.ok(typeof channel.organizationId === 'string' && channel.organizationId, 'Missing Buffer organization');
  assert.ok(channel.allowedActions?.includes('readUpdates') && channel.allowedActions?.includes('scheduleUpdates'), 'Buffer channel lacks read/publish actions');
  return { channelId: target.channelId, service: target.service, serviceId, profile: target.profile, type: channel.type, organizationId: channel.organizationId };
}

export function carouselCaptionUnits(caption, platform) {
  targetFor(platform);
  assert.equal(typeof caption, 'string', 'Missing carousel caption');
  if (platform === 'instagram') return caption.length + (caption.match(/\n/g) || []).length;
  return caption.replace(/https?:\/\/\S+|(?<![\w@./:-])(?:[a-z0-9-]+\.)+[a-z]{2,}(?:[/:?#@]\S*)?/gi, 'x'.repeat(24)).length;
}

export function assertCarouselCaption(caption, platform) {
  const units = carouselCaptionUnits(caption, platform);
  assert.ok(caption.trim() === caption && caption.length > 0 && !caption.includes('\r'), 'Invalid carousel caption');
  assert.ok(units <= (platform === 'linkedin' ? 3000 : 2196), 'Carousel caption exceeds Buffer limit');
  assert.ok((caption.match(/#[\p{L}\p{N}_]+/gu) || []).length <= 5, 'Carousel caption exceeds five hashtags');
}

export function bufferCarouselInput(spec, { publicCopy = true } = {}) {
  const target = targetFor(spec.platform);
  assert.deepEqual(spec.target, target, 'Carousel target changed');
  assertCarouselCaption(spec.caption, spec.platform);
  if (publicCopy) assertPublicFields(spec, { field: `${spec.platform}/${spec.threadId || 'carousel'}` });
  const input = { channelId: target.channelId, text: spec.caption, schedulingType: 'automatic', mode: 'shareNow', needsApproval: false };
  if (spec.platform === 'linkedin') {
    assert.ok(spec.title?.trim() && spec.pdf?.url && spec.thumbnail?.url, 'Document URL, thumbnail and title required');
    input.assets = [{ document: { url: spec.pdf.url, thumbnailUrl: spec.thumbnail.url, title: spec.title } }];
  } else {
    assert.equal(spec.images?.length, 6, 'Instagram requires six ordered images');
    input.assets = spec.images.map(image => ({ image: { url: image.url, metadata: { altText: image.alt } } }));
    input.metadata = { instagram: { type: 'post', shouldShareToFeed: true } };
  }
  return input;
}

export async function verifyCarouselReceipt(post, spec, { verifyImage, verifyDocument }) {
  const target = targetFor(spec.platform);
  assert.equal(post?.channelId, target.channelId, 'Wrong carousel receipt channel');
  assert.equal(post.channelService, target.service, 'Wrong carousel receipt service');
  const identity = assertCarouselAccount(post.channel, spec.platform);
  assert.equal(post.text, spec.caption, 'Wrong carousel caption');
  assert.equal(post.schedulingType, 'automatic', 'Carousel must publish automatically');
  assert.ok(Array.isArray(post.assets), 'Carousel receipt assets missing');
  if (spec.platform === 'linkedin') {
    assert.equal(post.assets.length, 1, 'LinkedIn requires one native document');
    if (post.metadata !== null) assert.equal(post.metadata?.__typename, 'LinkedInPostMetadata');
    assert.ok(!post.metadata?.linkAttachment, 'Link attachment cannot accompany a document');
    const asset = post.assets[0];
    assert.equal(asset.__typename, 'DocumentAsset');
    assert.equal(asset.type, 'document');
    assert.match(asset.mimeType, /^application\/(?:pdf|octet-stream)$/i);
    assert.equal(asset.document?.title, spec.title, 'Wrong document title');
    assert.equal(asset.document?.numPages, 6, 'Wrong document page count');
    if (asset.document.filesize !== null && asset.document.filesize !== undefined) assert.equal(asset.document.filesize, spec.pdf.bytes, 'Wrong document size');
    await verifyDocument(asset.source, spec.pdf);
    await verifyImage(asset.thumbnail, spec.thumbnail);
  } else {
    assert.equal(post.metadata?.__typename, 'InstagramPostMetadata');
    assert.equal(post.metadata.type, 'post', 'Instagram must be a feed post');
    assert.equal(post.metadata.shouldShareToFeed, true);
    assert.equal(post.assets.length, 6, 'Wrong Instagram image count');
    for (const [index, asset] of post.assets.entries()) {
      const expected = spec.images[index];
      assert.equal(asset.__typename, 'ImageAsset');
      assert.equal(asset.type, 'image');
      assert.equal(asset.mimeType, 'image/jpeg');
      assert.equal(asset.image?.altText, expected.alt, 'Wrong carousel image label/order');
      assert.equal(asset.image?.width, expected.width);
      assert.equal(asset.image?.height, expected.height);
      await verifyImage(asset.source, expected);
    }
  }
  if (post.status === 'sent') {
    const url = new URL(post.externalLink);
    assert.ok(url.protocol === 'https:' && !url.username && !url.password && !url.port, 'Invalid carousel permalink');
    if (spec.platform === 'instagram') {
      assert.ok(['instagram.com', 'www.instagram.com'].includes(url.hostname));
      assert.match(url.pathname, /^\/p\/[\w-]+\/?$/);
    } else {
      assert.ok(['linkedin.com', 'www.linkedin.com'].includes(url.hostname));
      assert.match(url.pathname, /^\/(?:feed\/update\/urn:li:(?:activity|share|ugcPost):\d+|posts\/hashtagweb3_[\w-]+)\/?$/);
    }
  }
  return identity;
}

export function carouselProviderClient(platform, { env = process.env, fetcher = fetch, readOnly = true } = {}) {
  const target = targetFor(platform);
  const buffer = async (query, variables, onPostId) => {
    assert.ok(!readOnly || /^query\b/.test(query), 'Read-only mode forbids Buffer mutations');
    assert.ok(env.BUFFER_ACCESS_TOKEN, 'BUFFER_ACCESS_TOKEN missing');
    let response, data;
    try {
      response = await fetcher('https://api.buffer.com', { method: 'POST', redirect: 'error', headers: { Authorization: `Bearer ${env.BUFFER_ACCESS_TOKEN}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ query, variables }), signal: AbortSignal.timeout(60000) });
      data = await response.json();
    } catch { throw new Error('Buffer response unavailable; any create outcome is unknown, reconcile without resending'); }
    const id = data?.data?.createPost?.post?.id;
    if (typeof id === 'string' && /^[\w-]+$/.test(id) && onPostId) await onPostId(id);
    assert.ok(response.ok && !data.errors?.length && data.data, `Buffer request failed: HTTP ${response.status}; reconcile any known ID`);
    return data.data;
  };
  return {
    async account() {
      const { channel } = await buffer(`query CarouselChannel($id:ChannelId!) {channel(input:{id:$id}) {${channelFields}}}`, { id: target.channelId });
      assertCarouselAccount(channel, platform);
      return channel;
    },
    async history(account) {
      assertCarouselAccount(account, platform);
      const history = [], cursors = new Set();
      let after = null;
      for (let page = 0; page < 100; page++) {
        const { posts } = await buffer(`query CarouselHistory($org:OrganizationId!,$after:String) {posts(first:100,after:$after,input:{organizationId:$org,filter:{channelIds:["${target.channelId}"],status:[draft,error,needs_approval,scheduled,sending,sent]}}) {pageInfo {hasNextPage endCursor} edges {node {id text channelId}}}}`, { org: account.organizationId, after });
        assert.ok(Array.isArray(posts?.edges) && typeof posts.pageInfo?.hasNextPage === 'boolean', 'Carousel history incomplete');
        for (const { node } of posts.edges) {
          assert.equal(node.channelId, target.channelId, 'History returned another channel');
          assert.ok(typeof node.id === 'string' && typeof node.text === 'string', 'Invalid carousel history');
          history.push(node);
        }
        if (!posts.pageInfo.hasNextPage) return history;
        after = posts.pageInfo.endCursor;
        assert.ok(typeof after === 'string' && after && !cursors.has(after), 'Carousel history cursor stalled');
        cursors.add(after);
      }
      throw new Error('Carousel history exceeded scan bound; publishing stopped');
    },
    async create(spec, onPostId) {
      assert.ok(!readOnly, 'Read-only mode forbids Buffer mutations');
      assert.equal(spec.platform, platform);
      assert.equal(typeof onPostId, 'function', 'Known-ID checkpoint callback required');
      assertPublicCarouselCopy(spec);
      const { createPost } = await buffer('mutation CreateCarousel($input:CreatePostInput!) {createPost(input:$input) {__typename ... on PostActionSuccess {post {id}} ... on MutationError {message}}}', { input: bufferCarouselInput(spec) }, onPostId);
      assert.ok(createPost?.__typename === 'PostActionSuccess' && typeof createPost.post?.id === 'string' && /^[\w-]+$/.test(createPost.post.id), 'Buffer create has no confirmed ID; reconcile without resending');
      return createPost.post.id;
    },
    async post(id) {
      assert.match(id, /^[\w-]+$/, 'Invalid Buffer post ID');
      return (await buffer(`query CarouselPost($id:PostId!) {post(input:{id:$id}) {${CAROUSEL_POST_FIELDS}}}`, { id })).post;
    },
  };
}
