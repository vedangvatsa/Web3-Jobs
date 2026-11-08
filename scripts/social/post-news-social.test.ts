import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  fallbackCaptions,
  pickNextNewsArticle,
  queuePostToBuffer,
  loadNewsState,
  saveNewsState,
  NewsArticle,
  NewsSocialReceipt,
} from './post-news-social';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const mockArticle: NewsArticle = {
  slug: 'test-crypto-bill',
  title: 'Hong Kong Lawmakers Pass Crypto Tax Reporting Bill for 2027 Collection',
  description: 'Service providers must collect user data starting in 2027 under the new framework approved by legislators.',
  category: 'News',
  publishedDate: '2026-11-08',
};

test('fallbackCaptions produces short, concise captions under limits', () => {
  const captions = fallbackCaptions(mockArticle);

  assert.ok(captions.xHeadline.length > 0 && captions.xHeadline.length <= 60);
  assert.ok(captions.xBody.length > 0 && captions.xBody.length <= 85);
  assert.ok(captions.xFullText.length < 280, `X caption too long: ${captions.xFullText.length}`);
  assert.ok(captions.xFullText.includes('https://hashtagweb3.com/test-crypto-bill?utm_source=twitter'));
  assert.ok(captions.xFullText.includes('#Web3 #Crypto'));

  assert.ok(captions.linkedInHeadline.length > 0 && captions.linkedInHeadline.length <= 75);
  assert.ok(captions.linkedInFullText.includes('Read more: https://hashtagweb3.com/test-crypto-bill?utm_source=linkedin'));
  assert.ok(captions.linkedInFullText.includes('#Web3 #Blockchain #Crypto'));
});

test('pickNextNewsArticle selects the newest unposted article', () => {
  const articles: NewsArticle[] = [
    { ...mockArticle, slug: 'story-1', publishedDate: '2026-11-08' },
    { ...mockArticle, slug: 'story-2', publishedDate: '2026-11-07' },
  ];

  const history: NewsSocialReceipt[] = [
    { slug: 'story-1', platform: 'x', channelId: 'c1', postId: 'p1', status: 'queued', queuedAt: '2026-11-08' },
    { slug: 'story-1', platform: 'linkedin', channelId: 'c2', postId: 'p2', status: 'queued', queuedAt: '2026-11-08' },
  ];

  const picked = pickNextNewsArticle(articles, history, 'all');
  assert.equal(picked?.slug, 'story-2');
});

test('pickNextNewsArticle returns null when all articles are posted', () => {
  const articles: NewsArticle[] = [
    { ...mockArticle, slug: 'story-1', publishedDate: '2026-11-08' },
  ];

  const history: NewsSocialReceipt[] = [
    { slug: 'story-1', platform: 'x', channelId: 'c1', postId: 'p1', status: 'queued', queuedAt: '2026-11-08' },
    { slug: 'story-1', platform: 'linkedin', channelId: 'c2', postId: 'p2', status: 'queued', queuedAt: '2026-11-08' },
  ];

  const picked = pickNextNewsArticle(articles, history, 'all');
  assert.equal(picked, null);
});

test('pickNextNewsArticle honors forced slug override', () => {
  const articles: NewsArticle[] = [
    { ...mockArticle, slug: 'story-1', publishedDate: '2026-11-08' },
    { ...mockArticle, slug: 'story-2', publishedDate: '2026-11-07' },
  ];

  const history: NewsSocialReceipt[] = [
    { slug: 'story-2', platform: 'x', channelId: 'c1', postId: 'p1', status: 'queued', queuedAt: '2026-11-08' },
  ];

  const picked = pickNextNewsArticle(articles, history, 'all', 'story-2');
  assert.equal(picked?.slug, 'story-2');
});

test('queuePostToBuffer sends mode: addToQueue and schedulingType: automatic', async () => {
  let capturedBody: any = null;
  const mockFetch: typeof fetch = async (url, init) => {
    assert.equal(url, 'https://api.buffer.com/graphql');
    capturedBody = JSON.parse(String(init?.body));
    return new Response(JSON.stringify({
      data: {
        createPost: {
          post: {
            id: 'post-buffer-999',
            status: 'scheduled',
          },
        },
      },
    }), { status: 200 });
  };

  const postId = await queuePostToBuffer({
    token: 'test-token',
    channelId: 'channel-x-123',
    text: 'Test headline\n\nhttps://example.com',
    fetchFn: mockFetch,
  });

  assert.equal(postId, 'post-buffer-999');
  assert.equal(capturedBody.variables.input.channelId, 'channel-x-123');
  assert.equal(capturedBody.variables.input.mode, 'addToQueue');
  assert.equal(capturedBody.variables.input.schedulingType, 'automatic');
});

test('queuePostToBuffer attaches linkAttachment for LinkedIn', async () => {
  let capturedBody: any = null;
  const mockFetch: typeof fetch = async (url, init) => {
    capturedBody = JSON.parse(String(init?.body));
    return new Response(JSON.stringify({
      data: {
        createPost: {
          post: {
            id: 'post-li-888',
            status: 'scheduled',
          },
        },
      },
    }), { status: 200 });
  };

  const postId = await queuePostToBuffer({
    token: 'test-token',
    channelId: 'channel-li-456',
    text: 'Test LinkedIn copy',
    linkAttachment: {
      url: 'https://hashtagweb3.com/test-story',
      title: 'Test Story Title',
      description: 'Test Story Description',
    },
    fetchFn: mockFetch,
  });

  assert.equal(postId, 'post-li-888');
  assert.equal(capturedBody.variables.input.channelId, 'channel-li-456');
  assert.equal(capturedBody.variables.input.mode, 'addToQueue');
  assert.deepEqual(capturedBody.variables.input.metadata, {
    linkedin: {
      linkAttachment: {
        url: 'https://hashtagweb3.com/test-story',
        title: 'Test Story Title',
        description: 'Test Story Description',
      },
    },
  });
});

test('queuePostToBuffer surfaces API and GraphQL errors', async () => {
  const errorFetch: typeof fetch = async () => {
    return new Response(JSON.stringify({
      errors: [{ message: 'Channel token expired' }],
    }), { status: 200 });
  };

  await assert.rejects(
    queuePostToBuffer({
      token: 'bad-token',
      channelId: 'ch1',
      text: 'text',
      fetchFn: errorFetch,
    }),
    /Buffer GraphQL error: Channel token expired/,
  );
});

test('loadNewsState and saveNewsState roundtrip cleanly', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'news-state-'));
  const tempFile = path.join(tempDir, 'state.json');

  assert.deepEqual(loadNewsState(tempFile), { history: [] });

  const sampleState = {
    history: [
      {
        slug: 'dcmaccess',
        platform: 'x' as const,
        channelId: 'ch-x',
        postId: 'post-1',
        status: 'queued',
        queuedAt: '2026-11-09T00:00:00Z',
      },
    ],
  };

  saveNewsState(tempFile, sampleState);
  assert.deepEqual(loadNewsState(tempFile), sampleState);

  fs.rmSync(tempDir, { recursive: true });
});
