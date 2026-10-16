import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { assertPublishableJobs } from '../lib/job-publish-guard.mjs';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const CONTENT = 'social-assets/nomad-resources-thread/posts.json';
const RECEIPT = 'scripts/social/nomad-thread-receipts.json';
const REPO = 'vedangvatsa/Web3-Jobs';
const X_CHANNEL = '6ab62682ea19ca0bdee284bd';
const X_ACCOUNT = 'hashtag_web3';
const THREADS_ACCOUNT = 'hashtagweb3';
const WORK = path.join(ROOT, '.cache/nomad-thread-publish');
const sha = value => createHash('sha256').update(value).digest('hex');
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const assetFields = 'source mimeType ... on ImageAsset {image {altText width height}}';
const threadFields = `threadCount thread {text assets {${assetFields}}}`;
const postFields = `id text status channelId channelService externalLink createdAt error {message} metadata { ... on TwitterPostMetadata {${threadFields}} }`;

export function validatePosts(manifest) {
  assert.equal(manifest.id, 'nomad-resources-2026-10-16');
  assert.equal(manifest.posts.length, 7);
  manifest.posts.forEach((post, index) => {
    assert.match(post.image, new RegExp(`^0${index + 1}-[a-z-]+\\.jpg$`));
    assert.ok(post.alt.length > 30 && post.alt.length < 1000);
    assert.ok(!post.text.includes('https://') && !post.text.includes('http://'));
    assert.ok([...post.text.replace(/hashtagweb3\.com\/\S+/g, 'x'.repeat(23))].length <= 280, `Post ${index + 1} exceeds X limit`);
    for (const link of post.text.match(/hashtagweb3\.com\/\S+/g) || []) assert.match(link, /^hashtagweb3\.com\/(nomads|visas|popups|jobs|citizenship)\/x$/);
  });
  assert.equal(new Set(manifest.posts.map(post => post.image)).size, 7);
  assert.deepEqual(manifest.picturedJobs.map(job => job.slug), ['con2', 'pmop', 'eng611']);
}

export function bufferInput(posts, urls) {
  assert.equal(posts.length, 7);
  assert.equal(urls.length, 7);
  const thread = posts.map((post, i) => ({ text: post.text, assets: [{ image: { url: urls[i], metadata: { altText: post.alt } } }] }));
  return { channelId: X_CHANNEL, text: posts[0].text, assets: thread[0].assets, metadata: { twitter: { thread } }, schedulingType: 'automatic', mode: 'shareNow', needsApproval: false };
}

export function assertBufferReceipt(post, posts) {
  assert.equal(post.channelId, X_CHANNEL);
  assert.equal(post.channelService, 'twitter');
  assert.equal(post.text, posts[0].text);
  assert.equal(post.metadata.threadCount, 7);
  assert.equal(post.metadata.thread.length, 7);
  post.metadata.thread.forEach((item, i) => {
    assert.equal(item.text, posts[i].text);
    assert.equal(item.assets.length, 1);
    assert.match(item.assets[0].mimeType, /^image\//);
    assert.equal(item.assets[0].image.altText, posts[i].alt);
    assert.equal(item.assets[0].image.width, 1200);
    assert.equal(item.assets[0].image.height, 1500);
  });
}

async function buffer(query, variables = {}) {
  assert.ok(process.env.BUFFER_ACCESS_TOKEN, 'BUFFER_ACCESS_TOKEN missing');
  const response = await fetch('https://api.buffer.com', { method: 'POST', headers: { Authorization: `Bearer ${process.env.BUFFER_ACCESS_TOKEN}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ query, variables }), signal: AbortSignal.timeout(60000) });
  const result = await response.json();
  if (!response.ok || result.errors?.length || !result.data) throw new Error(`Buffer HTTP ${response.status}: ${result.errors?.map(error => error.message).join('; ') || 'invalid response'}`);
  return result.data;
}

async function threads(route, body) {
  assert.ok(process.env.THREADS_ACCESS_TOKEN && process.env.THREADS_USER_ID, 'Threads credentials missing');
  const response = await fetch(`https://graph.threads.net/v1.0/${route}`, { method: body ? 'POST' : 'GET', headers: { Authorization: `Bearer ${process.env.THREADS_ACCESS_TOKEN}` }, body: body ? new URLSearchParams(body) : undefined, signal: AbortSignal.timeout(60000) });
  const result = await response.json();
  if (!response.ok || result.error) throw new Error(`Threads HTTP ${response.status}: ${result.error?.message || 'invalid response'}`);
  return result;
}

async function accounts() {
  const { channel } = await buffer('query ($id: ChannelId!) { channel(input: {id:$id}) {id name service organizationId isDisconnected isLocked} }', { id: X_CHANNEL });
  assert.equal(channel.name.replace(/^@/, '').toLowerCase(), X_ACCOUNT);
  assert.equal(channel.service, 'twitter');
  assert.equal(channel.isDisconnected, false);
  assert.equal(channel.isLocked, false);
  const account = await threads('me?fields=id,username');
  assert.equal(account.id, process.env.THREADS_USER_ID);
  assert.equal(account.username.toLowerCase(), THREADS_ACCOUNT);
  const recent = await threads(`${account.id}/threads?fields=id&limit=1`);
  if (recent.data?.[0]) await threads(`${recent.data[0].id}?fields=id,text,username,permalink,media_type,media_url,is_reply,replied_to`);
  console.log(JSON.stringify({ verifiedAccounts: { x: channel.name, threads: account.username } }));
  return { channel, account };
}

async function github(method, body) {
  assert.ok(process.env.GITHUB_TOKEN, 'GITHUB_TOKEN required for durable receipts');
  return fetch(`https://api.github.com/repos/${REPO}/contents/${RECEIPT}${method === 'GET' ? '?ref=main' : ''}`, { method, headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' }, body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(30000) });
}

async function remoteState() {
  const response = await github('GET');
  if (response.status === 404) return { state: null, sha: null, text: null };
  if (!response.ok) throw new Error(`Receipt read failed: HTTP ${response.status}`);
  const result = await response.json();
  const text = Buffer.from(result.content, 'base64').toString('utf8');
  return { state: JSON.parse(text), sha: result.sha, text };
}

function durableState(initial, expectedRemoteText) {
  let remoteText = expectedRemoteText;
  return async function save() {
    const text = JSON.stringify(initial, null, 2) + '\n';
    const temporary = path.join(WORK, 'receipt.json.tmp');
    await fs.writeFile(temporary, text);
    await fs.rename(temporary, path.join(WORK, 'receipt.json'));
    await fs.appendFile(path.join(WORK, 'journal.jsonl'), JSON.stringify({ at: new Date().toISOString(), state: initial }) + '\n');
    for (let attempt = 0; attempt < 8; attempt++) {
      const latest = await remoteState();
      if (latest.text === text) { remoteText = text; return; }
      assert.equal(latest.text, remoteText, 'Concurrent receipt change requires reconciliation');
      const response = await github('PUT', { message: 'chore(social): checkpoint nomad resource thread [skip ci]', branch: 'main', ...(latest.sha ? { sha: latest.sha } : {}), content: Buffer.from(text).toString('base64') });
      if (response.ok) { remoteText = text; return; }
      const error = await response.json();
      if (![409, 422].includes(response.status) || !/sha|expected|reference|fast forward|conflict|does not match/i.test(error.message || '')) throw new Error(`Receipt write failed: HTTP ${response.status}`);
      await sleep(1000 * (attempt + 1));
    }
    throw new Error('Receipt CAS exhausted; subsequent publishing stopped');
  };
}

async function verifyImages(manifest, commit) {
  assert.match(commit, /^[a-f0-9]{40}$/);
  const urls = [];
  for (const post of manifest.posts) {
    const local = await fs.readFile(path.join(ROOT, manifest.imageDirectory, post.image));
    const url = `https://raw.githubusercontent.com/${REPO}/${commit}/${manifest.imageDirectory}/${post.image}`;
    const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
    assert.equal(response.status, 200, post.image);
    assert.match(response.headers.get('content-type'), /^image\/jpeg/);
    assert.equal(sha(Buffer.from(await response.arrayBuffer())), sha(local), `Hosted image changed: ${post.image}`);
    urls.push(url);
  }
  return urls;
}

async function resourceLinks(posts) {
  for (const post of posts) for (const link of post.text.match(/hashtagweb3\.com\/\S+/g) || []) {
    const response = await fetch(`https://${link}`, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(30000) });
    assert.equal(response.status, 200, link);
    const url = new URL(response.url);
    assert.equal(url.hostname, 'hashtagweb3.com');
    assert.notEqual(url.pathname, '/', link);
    await response.body.cancel();
  }
}

async function publishX(manifest, urls, state, save, channel) {
  let receipt = state.platforms.x;
  if (!receipt) {
    const { posts } = await buffer('query ($org: OrganizationId!) { posts(first:100,input:{organizationId:$org,filter:{channelIds:["' + X_CHANNEL + '"]}}) {edges {node {id text}}} }', { org: channel.organizationId });
    assert.ok(!posts.edges.some(({ node }) => node.text === manifest.posts[0].text), 'Matching X root exists; reconcile before publishing');
    await assertPublishableJobs(manifest.picturedJobs);
    receipt = state.platforms.x = { status: 'claimed', startedAt: new Date().toISOString() };
    await save();
    const { createPost } = await buffer('mutation ($input:CreatePostInput!) {createPost(input:$input) {... on PostActionSuccess {post {id}} ... on MutationError {message}}}', { input: bufferInput(manifest.posts, urls) });
    assert.ok(createPost.post?.id, `X creation rejected: ${createPost.message || 'missing ID'}`);
    receipt.postId = createPost.post.id;
    receipt.status = 'accepted';
    await save();
  }
  assert.ok(receipt.postId, 'An earlier X creation has no receipt; reconcile without resending');
  for (let attempt = 0; attempt < 36; attempt++) {
    const { post } = await buffer(`query ($id:PostId!) {post(input:{id:$id}) {${postFields}}}`, { id: receipt.postId });
    assertBufferReceipt(post, manifest.posts);
    if (post.status === 'error') throw new Error(`X thread failed: ${post.error?.message || 'provider error'}`);
    if (post.status === 'sent' && post.externalLink) {
      assert.match(post.externalLink, /^https:\/\/(?:www\.)?(?:x|twitter)\.com\/hashtag_web3\/status\/\d+\/?$/);
      Object.assign(receipt, { status: 'verified', permalink: post.externalLink, verifiedAt: new Date().toISOString(), threadCount: 7, imageCount: 7 });
      await save();
      await fs.writeFile(path.join(WORK, 'x-provider-receipt.json'), JSON.stringify(post, null, 2));
      console.log(`X thread verified: ${receipt.permalink}`);
      return;
    }
    await sleep(5000);
  }
  throw new Error('X thread remains pending; its accepted ID is saved, do not resend');
}

async function verifyThreadsPost(id, expected, previousId) {
  const post = await threads(`${id}?fields=id,text,username,permalink,media_type,media_url,is_reply${previousId ? ',replied_to' : ''}`);
  assert.equal(post.id, id);
  assert.equal(post.username.toLowerCase(), THREADS_ACCOUNT);
  assert.equal(post.text, expected.text);
  assert.equal(post.media_type, 'IMAGE');
  assert.ok(post.media_url?.startsWith('https://'));
  assert.equal(post.is_reply, Boolean(previousId));
  if (previousId) assert.equal(post.replied_to?.id, previousId, 'Threads post must reply to the preceding post');
  assert.match(post.permalink, /^https:\/\/(?:www\.)?threads\.(?:net|com)\/@hashtagweb3\/post\//);
  return post;
}

async function publishThreads(manifest, urls, state, save, account) {
  if (!state.platforms.threads) {
    const recent = await threads(`${account.id}/threads?fields=id,text&limit=100`);
    assert.ok(!(recent.data || []).some(post => post.text === manifest.posts[0].text), 'Matching Threads root exists; reconcile before publishing');
    state.platforms.threads = { status: 'started', startedAt: new Date().toISOString(), posts: [] };
    await save();
  }
  const thread = state.platforms.threads;
  for (const [i, expected] of manifest.posts.entries()) {
    const previousId = i ? thread.posts[i - 1]?.postId : undefined;
    if (i) assert.ok(previousId && thread.posts[i - 1].status === 'verified', 'Previous Threads post must be verified');
    let receipt = thread.posts[i];
    if (!receipt) {
      if (i === 4) await assertPublishableJobs(manifest.picturedJobs);
      receipt = { index: i, status: 'claimed', startedAt: new Date().toISOString() };
      thread.posts.push(receipt);
      await save();
      const container = await threads(`${account.id}/threads`, { media_type: 'IMAGE', text: expected.text, image_url: urls[i], alt_text: expected.alt, ...(previousId ? { reply_to_id: previousId } : {}) });
      assert.ok(container.id, 'Threads container ID missing');
      receipt.containerId = container.id;
      receipt.status = 'container-created';
      await save();
    }
    if (!receipt.postId) {
      assert.ok(receipt.containerId, 'Ambiguous earlier Threads creation; reconcile without recreating');
      assert.notEqual(receipt.status, 'publishing', 'Ambiguous earlier Threads publish; reconcile without republishing');
      let ready = false;
      for (let attempt = 0; attempt < 24; attempt++) {
        const status = await threads(`${receipt.containerId}?fields=status,error_message`);
        if (status.status === 'FINISHED') { ready = true; break; }
        assert.ok(!['ERROR', 'EXPIRED', 'PUBLISHED'].includes(status.status), `Threads container status ${status.status}`);
        await sleep(5000);
      }
      assert.ok(ready, 'Threads container is not ready');
      if (i === 4) await assertPublishableJobs(manifest.picturedJobs);
      receipt.status = 'publishing';
      await save();
      const published = await threads(`${account.id}/threads_publish`, { creation_id: receipt.containerId });
      assert.ok(published.id, 'Threads publication ID missing');
      receipt.postId = published.id;
      receipt.status = 'accepted';
      await save();
    }
    const post = await verifyThreadsPost(receipt.postId, expected, previousId);
    Object.assign(receipt, { status: 'verified', permalink: post.permalink, verifiedAt: new Date().toISOString(), ...(previousId ? { replyTo: previousId } : {}) });
    await save();
    await fs.writeFile(path.join(WORK, `threads-post-${i + 1}.json`), JSON.stringify(post, null, 2));
    console.log(`Threads ${i + 1}/7 verified: ${post.permalink}`);
  }
  thread.status = 'verified';
  thread.permalink = thread.posts[0].permalink;
  await save();
}

export async function main() {
  const mode = process.argv.find(arg => arg.startsWith('--mode='))?.split('=')[1] || 'validate';
  const platform = process.argv.find(arg => arg.startsWith('--platform='))?.split('=')[1] || 'both';
  assert.ok(['validate', 'preflight', 'publish'].includes(mode));
  assert.ok(['both', 'x', 'threads'].includes(platform));
  const manifest = JSON.parse(await fs.readFile(path.join(ROOT, CONTENT), 'utf8'));
  validatePosts(manifest);
  const hashes = [];
  for (const post of manifest.posts) {
    const bytes = await fs.readFile(path.join(ROOT, manifest.imageDirectory, post.image));
    const image = await sharp(bytes).metadata();
    assert.equal(image.width, 1200); assert.equal(image.height, 1500); assert.equal(image.format, 'jpeg'); assert.ok(bytes.length < 5 * 1024 * 1024);
    hashes.push(sha(bytes));
  }
  const digest = sha(JSON.stringify({ manifest, hashes }));
  console.log(JSON.stringify({ contentDigest: digest, posts: 7, images: 7, links: 'bare hashtagweb3.com/<resource>/x on both platforms', mode, platform }));
  if (mode === 'validate') return;
  await fs.mkdir(WORK, { recursive: true });
  await resourceLinks(manifest.posts);
  const verified = await accounts();
  const remote = await remoteState();
  const state = remote.state || { version: 1, campaign: manifest.id, contentDigest: digest, assetCommit: process.env.GITHUB_SHA, platforms: {} };
  assert.equal(state.contentDigest, digest, 'Approved content changed after publication began');
  const urls = await verifyImages(manifest, state.assetCommit);
  await assertPublishableJobs(manifest.picturedJobs);
  await fs.writeFile(path.join(WORK, 'preflight.json'), JSON.stringify({ digest, assetCommit: state.assetCommit, accounts: { x: verified.channel.name, threads: verified.account.username }, imageUrls: urls, checkedAt: new Date().toISOString() }, null, 2));
  if (mode === 'preflight') { console.log('Preflight passed; no social mutations made.'); return; }
  const save = durableState(state, remote.text);
  if (platform === 'both' || platform === 'x') await publishX(manifest, urls, state, save, verified.channel);
  if (platform === 'both' || platform === 'threads') await publishThreads(manifest, urls, state, save, verified.account);
  if (process.env.GITHUB_STEP_SUMMARY) await fs.appendFile(process.env.GITHUB_STEP_SUMMARY, Object.entries(state.platforms).map(([key, value]) => `- ${key}: ${value.status} ${value.permalink || ''}`).join('\n') + '\n');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch(error => { console.error(error.message); process.exitCode = 1; });
