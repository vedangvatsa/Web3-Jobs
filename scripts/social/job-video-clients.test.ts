import test from 'node:test';
import assert from 'node:assert/strict';
import {bufferVerify, bufferCreate, bufferRecover, instagramVerify} from './job-video-clients.ts';
import {channels, instagramAccount} from './job-video-core.ts';
import type {Receipt, Video} from './job-video-core.ts';
const originalFetch = globalThis.fetch;
const receipt: Receipt = {status: 'pending', startedAt: '2026-10-01T00:00:00Z', postId: 'p1', text: 'Job on hashtagweb3.com'};
process.env.BUFFER_VIDEO_ACCESS_TOKEN = 'test-token';
process.env.META_PAGE_TOKEN = 'test-meta';
test('only reports Buffer success for a sent matching post with a platform URL', async () => {
  try {
    globalThis.fetch = async () => Response.json({data: {post: {id: 'p1', channelId: channels.youtube, channelService: 'youtube', text: receipt.text, status: 'scheduled'}}});
    await assert.rejects(bufferVerify('youtube', receipt, 1), /pending/);
    globalThis.fetch = async () => Response.json({data: {post: {id: 'p1', channelId: channels.youtube, channelService: 'youtube', text: receipt.text, status: 'sent', externalLink: 'https://youtube.com/shorts/123'}}});
    assert.equal(await bufferVerify('youtube', receipt, 1), 'https://youtube.com/shorts/123');
    globalThis.fetch = async () => Response.json({data: {post: {id: 'p1', channelId: channels.tiktok, channelService: 'tiktok', text: receipt.text, status: 'sent', externalLink: 'https://tiktok.com/@hashtagweb3/video/123'}}});
    await assert.rejects(bufferVerify('youtube', receipt, 1), /does not match/);
  } finally {globalThis.fetch = originalFetch;}
});
test('Buffer upload uses public media and sends the YouTube title separately', async () => {
  try {
    globalThis.fetch = async (_url, options) => {
      const body = JSON.parse(String(options?.body));
      assert.equal(body.variables.input.mode, 'shareNow');
      assert.equal(body.variables.input.metadata.youtube.title, 'Engineer at Tether');
      assert.equal(body.variables.input.metadata.youtube.embeddable, true);
      assert.equal(body.variables.input.metadata.youtube.notifySubscribers, false);
      assert.equal(body.variables.input.assets[0].video.url, 'https://example.com/video.mp4');
      return Response.json({data: {createPost: {post: {id: 'p1'}}}});
    };
    const video = {videoUrl: 'https://example.com/video.mp4'} as Video;
    assert.deepEqual(await bufferCreate('youtube', video, 'Caption', 'Engineer at Tether'), {id: 'p1', error: undefined});
  } finally {globalThis.fetch = originalFetch;}
});
test('Instagram receipt must belong to the configured account', async () => {
  try {
    globalThis.fetch = async () => Response.json({id: '123', permalink: 'https://www.instagram.com/reel/abc/', owner: {id: 'wrong'}});
    await assert.rejects(instagramVerify('123'), /ownership/);
    globalThis.fetch = async () => Response.json({id: '123', permalink: 'https://www.instagram.com/reel/abc/', owner: {id: instagramAccount}, media_product_type: 'FEED'});
    await assert.rejects(instagramVerify('123'), /not a Reel/);
    globalThis.fetch = async () => Response.json({id: '123', permalink: 'https://www.instagram.com/reel/abc/', owner: {id: instagramAccount}, media_product_type: 'REELS'});
    assert.equal(await instagramVerify('123'), 'https://www.instagram.com/reel/abc/');
  } finally {globalThis.fetch = originalFetch;}
});

test('TikTok receipts tolerate paragraph normalization but never changed content or ownership', async () => {
  const text = 'Brand Marketing Manager, Global Sponsorships at Nexo. Sofia, BG.\n\nFind the role on hashtagweb3.com\n\n#Hiring #Marketing #Jobs';
  const saved = {...receipt, text};
  const post = {id: saved.postId, channelId: channels.tiktok, channelService: 'tiktok', text: text.replace(/\n\n/g, '\n'), status: 'sent', externalLink: 'https://tiktok.com/@hashtagweb3/video/123'};
  assert.equal(text.length, 124); assert.equal(post.text.length, 122);
  try {
    globalThis.fetch = async (_url, options) => {
      assert.match(JSON.parse(String(options?.body)).query, /^query\b/);
      return Response.json({data: {post}});
    };
    assert.equal(await bufferVerify('tiktok', saved, 1), post.externalLink);
    for (const change of [
      {text: post.text.replace('Nexo', 'Another employer')},
      {text: post.text.replace('#Marketing', '#Finance')},
      {text: post.text.replace('Sofia, BG.', 'Remote.')},
      {text: post.text.replace('Marketing', 'Market ing')},
      {id: 'another-post'}, {channelId: channels.youtube},
    ]) {
      globalThis.fetch = async () => Response.json({data: {post: {...post, ...change}}});
      await assert.rejects(bufferVerify('tiktok', saved, 1), /does not match/);
    }
    globalThis.fetch = async () => Response.json({data: {post: {...post, channelId: channels.youtube, channelService: 'youtube'}}});
    await assert.rejects(bufferVerify('youtube', saved, 1), /caption/);
    assert.equal(saved.text, text);
  } finally {globalThis.fetch = originalFetch;}
});

test('TikTok lookup still requires one matching post after whitespace normalization', async () => {
  const saved = {...receipt, postId: undefined, text: 'Engineer at Example\n\n#Hiring'};
  const post = {id: 'existing', channelId: channels.tiktok, channelService: 'tiktok', text: 'Engineer at Example\n#Hiring', createdAt: receipt.startedAt};
  try {
    let posts = [post];
    globalThis.fetch = async (_url, options) => {
      assert.match(JSON.parse(String(options?.body)).query, /^query\b/);
      return Response.json({data: {posts: {edges: posts.map(node => ({node}))}}});
    };
    assert.equal(await bufferRecover('tiktok', saved), 'existing');
    posts = [post, {...post, id: 'duplicate', text: 'Engineer at Example #Hiring'}];
    await assert.rejects(bufferRecover('tiktok', saved), /Ambiguous/);
    posts = [{...post, channelId: channels.youtube}];
    await assert.rejects(bufferRecover('tiktok', saved), /Ambiguous/);
  } finally {globalThis.fetch = originalFetch;}
});
