import assert from 'node:assert/strict';

export const X_CHANNEL = '6ab62682ea19ca0bdee284bd';
export const X_ACCOUNT = 'hashtag_web3';
export const THREADS_ACCOUNT = 'hashtagweb3';
const assetFields = 'source mimeType ... on ImageAsset {image {altText width height}}';
const postFields = `id text status channelId channelService externalLink error {message} metadata { ... on TwitterPostMetadata {threadCount thread {text assets {${assetFields}}}} }`;

export function bufferThreadInput(posts, assets) {
  assert.equal(posts.length, 6);
  assert.equal(assets.length, 6);
  const thread = posts.map((post, i) => ({ text: post.text, assets: [{ image: { url: assets[i].url, metadata: { altText: post.alt } } }] }));
  return { channelId: X_CHANNEL, text: posts[0].text, assets: thread[0].assets, metadata: { twitter: { thread } }, schedulingType: 'automatic', mode: 'shareNow', needsApproval: false };
}

export function threadsContainerInput(post, asset, previousId) {
  return { media_type: 'IMAGE', text: post.text, image_url: asset.url, alt_text: post.alt, ...(previousId ? { reply_to_id: previousId } : {}) };
}

export async function verifyXReceipt(post, spec, verifyImage) {
  assert.equal(post.channelId, X_CHANNEL, 'Wrong X account');
  assert.equal(post.channelService, 'twitter');
  assert.equal(post.text, spec.posts[0].text, 'Wrong X root text');
  assert.equal(post.metadata?.threadCount, 6);
  assert.equal(post.metadata.thread.length, 6);
  for (const [i, item] of post.metadata.thread.entries()) {
    assert.equal(item.text, spec.posts[i].text, `Wrong X post ${i + 1} text`);
    assert.equal(item.assets.length, 1);
    const image = item.assets[0];
    assert.match(image.mimeType, /^image\//);
    assert.equal(image.image.altText, spec.posts[i].alt);
    assert.equal(image.image.width, spec.assets[i].width);
    assert.equal(image.image.height, spec.assets[i].height);
    await verifyImage(image.source, spec.assets[i]);
  }
  if (post.status === 'sent') assert.match(post.externalLink, /^https:\/\/(?:www\.)?(?:x|twitter)\.com\/hashtag_web3\/status\/\d+\/?$/);
}

export async function verifyThreadsReceipt(post, id, expected, asset, previousId, verifyImage) {
  assert.equal(post.id, id);
  assert.equal(post.username?.toLowerCase(), THREADS_ACCOUNT, 'Wrong Threads account');
  assert.equal(post.text, expected.text, 'Wrong Threads text');
  assert.equal(post.media_type, 'IMAGE');
  assert.equal(post.is_reply, Boolean(previousId));
  if (previousId) assert.equal(post.replied_to?.id, previousId, 'Threads reply must follow the previous post');
  else assert.ok(!post.replied_to?.id, 'Root must not be a reply');
  assert.match(post.permalink, /^https:\/\/(?:www\.)?threads\.(?:net|com)\/@hashtagweb3\/post\/[\w-]+\/?$/);
  await verifyImage(post.media_url, asset);
}

export function providerClient(platform, { env = process.env, fetcher = fetch, readOnly = false } = {}) {
  const buffer = async (query, variables = {}) => {
    assert.ok(env.BUFFER_ACCESS_TOKEN, 'BUFFER_ACCESS_TOKEN missing');
    assert.ok(!readOnly || !query.startsWith('mutation'), 'Read-only mode forbids Buffer mutations');
    const response = await fetcher('https://api.buffer.com', { method: 'POST', headers: { Authorization: `Bearer ${env.BUFFER_ACCESS_TOKEN}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ query, variables }), signal: AbortSignal.timeout(60000) });
    const data = await response.json();
    assert.ok(response.ok && !data.errors?.length && data.data, `Buffer request failed: HTTP ${response.status}`);
    return data.data;
  };
  const threads = async (route, body) => {
    assert.ok(env.THREADS_ACCESS_TOKEN && env.THREADS_USER_ID, 'Threads credentials missing');
    assert.ok(!readOnly || !body, 'Read-only mode forbids Threads mutations');
    const response = await fetcher(`https://graph.threads.net/v1.0/${route}`, { method: body ? 'POST' : 'GET', headers: { Authorization: `Bearer ${env.THREADS_ACCESS_TOKEN}` }, body: body ? new URLSearchParams(body) : undefined, signal: AbortSignal.timeout(60000) });
    const data = await response.json();
    assert.ok(response.ok && !data.error, `Threads request failed: HTTP ${response.status}`);
    return data;
  };
  if (platform === 'x') return {
    async account() {
      const { channel } = await buffer('query ($id:ChannelId!) {channel(input:{id:$id}) {id name service organizationId isDisconnected isLocked}}', { id: X_CHANNEL });
      assert.equal(channel.id, X_CHANNEL);
      assert.equal(channel.name.replace(/^@/, '').toLowerCase(), X_ACCOUNT);
      assert.equal(channel.service, 'twitter');
      assert.equal(channel.isDisconnected, false);
      assert.equal(channel.isLocked, false);
      assert.ok(channel.organizationId);
      return channel;
    },
    async history(account) {
      const { posts } = await buffer(`query ($org:OrganizationId!) {posts(first:100,input:{organizationId:$org,filter:{channelIds:["${X_CHANNEL}"]}}) {edges {node {id text}}}}`, { org: account.organizationId });
      assert.ok(Array.isArray(posts?.edges), 'X history unavailable');
      return posts.edges.map(edge => edge.node);
    },
    async create(posts, assets) {
      const { createPost } = await buffer('mutation ($input:CreatePostInput!) {createPost(input:$input) {... on PostActionSuccess {post {id}} ... on MutationError {message}}}', { input: bufferThreadInput(posts, assets) });
      assert.ok(createPost?.post?.id, 'X create response has no ID; manual reconciliation required');
      return createPost.post.id;
    },
    async post(id) {
      assert.match(id, /^[\w-]+$/);
      return (await buffer(`query ($id:PostId!) {post(input:{id:$id}) {${postFields}}}`, { id })).post;
    },
  };
  assert.equal(platform, 'threads');
  return {
    async account() {
      const account = await threads('me?fields=id,username');
      assert.equal(account.id, env.THREADS_USER_ID);
      assert.match(account.id, /^\d+$/);
      assert.equal(account.username.toLowerCase(), THREADS_ACCOUNT);
      return account;
    },
    async history(account) {
      const recent = await threads(`${account.id}/threads?fields=id,text&limit=100`);
      assert.ok(Array.isArray(recent.data), 'Threads history unavailable');
      return recent.data;
    },
    async createContainer(post, asset, previousId) {
      const result = await threads(`${env.THREADS_USER_ID}/threads`, threadsContainerInput(post, asset, previousId));
      assert.ok(result.id, 'Threads create response has no ID; manual reconciliation required');
      return result.id;
    },
    async container(id) {
      assert.match(id, /^\d+$/);
      return threads(`${id}?fields=status,error_message`);
    },
    async publishContainer(id) {
      const result = await threads(`${env.THREADS_USER_ID}/threads_publish`, { creation_id: id });
      assert.ok(result.id, 'Threads publish response has no ID; manual reconciliation required');
      return result.id;
    },
    async post(id) {
      assert.match(id, /^\d+$/);
      return threads(`${id}?fields=id,text,username,permalink,media_type,media_url,is_reply,replied_to`);
    },
  };
}
