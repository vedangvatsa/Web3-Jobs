import {channels, instagramAccount, organizationId} from './job-video-core.ts';
import type {Platform, Receipt, Video} from './job-video-core.ts';
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
type BufferPost = {id: string; channelId: string; channelService: string; text: string; status: string; externalLink?: string; createdAt: string; assets: {source: string}[]; error?: {message: string}};
const postFields = 'id channelId channelService text status externalLink createdAt assets { source } error { message }';

export async function bufferQuery<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const token = process.env.BUFFER_VIDEO_ACCESS_TOKEN;
  if (!token) throw new Error('Missing BUFFER_VIDEO_ACCESS_TOKEN');
  const response = await fetch('https://api.buffer.com', {method: 'POST', headers: {Authorization: `Bearer ${token}`, 'Content-Type': 'application/json'}, body: JSON.stringify({query, variables}), signal: AbortSignal.timeout(60000)});
  if (!response.ok) throw new Error(`Buffer HTTP ${response.status}`);
  const result = await response.json() as {data?: T; errors?: {message: string}[]};
  if (result.errors?.length || !result.data) throw new Error(`Buffer ${result.errors?.map(e => e.message).join('; ') || 'missing data'}`);
  return result.data;
}

export async function meta<T>(route: string, body?: Record<string, string>): Promise<T> {
  const token = process.env.META_PAGE_TOKEN;
  if (!token) throw new Error('Missing META_PAGE_TOKEN');
  const response = await fetch(`https://graph.facebook.com/v21.0/${route}`, {method: body ? 'POST' : 'GET', headers: {Authorization: `Bearer ${token}`}, body: body ? new URLSearchParams(body) : undefined, signal: AbortSignal.timeout(60000)});
  const result = await response.json() as T & {error?: {message: string}};
  if (!response.ok || result.error) throw new Error(`Instagram HTTP ${response.status} ${result.error?.message || ''}`);
  return result;
}

export async function verifyAccounts(): Promise<void> {
  const {channels: connected} = await bufferQuery<{channels: {id: string; service: string; name: string}[]}>('query { channels(input: {organizationId: "' + organizationId + '"}) {id service name} }');
  for (const platform of ['youtube', 'tiktok'] as const) {
    const channel = connected.find(c => c.id === channels[platform]);
    if (!channel || channel.service !== platform || !/^hashtag\s?web3$/i.test(channel.name.replace(/^@/, ''))) throw new Error(`Unexpected ${platform} channel`);
  }
  const account = await meta<{id: string; username: string}>(`${instagramAccount}?fields=id,username`);
  if (account.id !== instagramAccount || !/^hashtag_?web3$/i.test(account.username)) throw new Error('Unexpected Instagram account');
  console.log(`Accounts verified — Instagram @${account.username}, YouTube Hashtag Web3, TikTok @hashtagweb3`);
}

export async function bufferCreate(platform: 'youtube' | 'tiktok', video: Video, text: string, title: string): Promise<{id?: string; error?: string}> {
  const metadata = platform === 'youtube' ? {youtube: {title, categoryId: '22', privacy: 'public', embeddable: true, madeForKids: false, notifySubscribers: false}} : {};
  const {createPost} = await bufferQuery<{createPost: {post?: {id: string}; message?: string}}>(
    'mutation ($input: CreatePostInput!) { createPost(input: $input) { ... on PostActionSuccess {post {id}} ... on MutationError {message} } }',
    {input: {channelId: channels[platform], text, schedulingType: 'automatic', mode: 'shareNow', needsApproval: false, assets: [{video: {url: video.videoUrl}}], metadata}},
  );
  return {id: createPost.post?.id, error: createPost.message};
}

export async function bufferRecover(platform: 'youtube' | 'tiktok', receipt: Receipt): Promise<string> {
  const result = await bufferQuery<{posts: {edges: {node: BufferPost}[]}}>('query { posts(first: 100, input: {organizationId: "' + organizationId + '", filter: {channelIds: ["' + channels[platform] + '"]}}) {edges {node {' + postFields + '}}} }');
  const matches = result.posts.edges.map(e => e.node).filter(p => p.text === receipt.text && Date.parse(p.createdAt) >= Date.parse(receipt.startedAt) - 60000);
  if (matches.length !== 1) throw new Error('Ambiguous Buffer creation needs reconciliation before retrying');
  return matches[0].id;
}

export async function bufferVerify(platform: 'youtube' | 'tiktok', receipt: Receipt, attempts = 24): Promise<string> {
  for (let attempt = 0; attempt < attempts; attempt++) {
    const {post} = await bufferQuery<{post: BufferPost}>('query ($id: PostId!) {post(input: {id: $id}) {' + postFields + '}}', {id: receipt.postId});
    if (!post || post.channelId !== channels[platform] || post.channelService !== platform || post.text !== receipt.text) throw new Error('Buffer receipt does not match the requested video post');
    if (post.status === 'error') throw new Error(`Buffer publish failed — ${post.error?.message || 'unknown error'}`);
    if (post.status === 'sent' && post.externalLink) {
      const url = new URL(post.externalLink);
      const allowed = platform === 'youtube' ? ['youtube.com', 'www.youtube.com', 'youtu.be'] : ['tiktok.com', 'www.tiktok.com'];
      if (url.protocol !== 'https:' || !allowed.includes(url.hostname)) throw new Error('Unexpected Buffer publication URL');
      return post.externalLink;
    }
    if (attempt + 1 < attempts) await sleep(10000);
  }
  throw new Error('Buffer publication is pending; saved post ID will be checked on retry');
}

export async function instagramFind(receipt: Receipt): Promise<{id: string; permalink: string} | undefined> {
  const result = await meta<{data: {id: string; caption?: string; permalink: string; timestamp: string}[]}>(`${instagramAccount}/media?fields=id,caption,permalink,timestamp&limit=100`);
  const matches = result.data.filter(p => p.caption === receipt.text && Date.parse(p.timestamp) >= Date.parse(receipt.startedAt) - 60000);
  if (matches.length > 1) throw new Error('Multiple Instagram posts match this receipt');
  return matches[0];
}

export async function instagramReady(containerId: string): Promise<'FINISHED' | 'PUBLISHED'> {
  for (let attempt = 0; attempt < 30; attempt++) {
    const result = await meta<{status_code: string; status?: string}>(`${containerId}?fields=status_code,status`);
    if (result.status_code === 'FINISHED' || result.status_code === 'PUBLISHED') return result.status_code;
    if (['ERROR', 'EXPIRED'].includes(result.status_code)) throw new Error(`Instagram container ${result.status_code} ${result.status || ''}`);
    await sleep(10000);
  }
  throw new Error('Instagram container is still processing; retained for retry');
}

export async function instagramVerify(id: string): Promise<string> {
  const media = await meta<{id: string; permalink: string; owner: {id: string}; media_product_type: string}>(`${id}?fields=id,permalink,owner,media_product_type`);
  if (media.id !== id || media.owner?.id !== instagramAccount || new URL(media.permalink).hostname !== 'www.instagram.com') throw new Error('Instagram receipt ownership mismatch');
  if (media.media_product_type !== 'REELS') throw new Error('Instagram publication is not a Reel');
  return media.permalink;
}
