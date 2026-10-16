import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { validatePosts, bufferInput, assertBufferReceipt } from './publish-nomad-thread.mjs';

const manifest = JSON.parse(await fs.readFile(new URL('../../social-assets/nomad-resources-thread/posts.json', import.meta.url), 'utf8'));

test('approved thread retains seven images and literal /x links on both platforms', () => {
  validatePosts(manifest);
  assert.deepEqual(manifest.posts.flatMap(post => post.text.match(/hashtagweb3\.com\/\S+/g) || []), ['nomads', 'visas', 'popups', 'jobs', 'citizenship'].map(slug => `hashtagweb3.com/${slug}/x`));
  for (const change of [value => { value.posts.pop(); }, value => { value.posts[1].text += ' https://example.com'; }, value => { value.posts[1].text = 'x'.repeat(281); }, value => { value.posts[2].image = '../secret.jpg'; }]) {
    const value = structuredClone(manifest); change(value); assert.throws(() => validatePosts(value));
  }
});

test('Buffer thread includes the root and one ordered image with alt text per post', () => {
  const urls = manifest.posts.map((_, i) => `https://example.com/${i}.jpg`);
  const input = bufferInput(manifest.posts, urls);
  assert.equal(input.text, input.metadata.twitter.thread[0].text);
  assert.equal(input.metadata.twitter.thread.length, 7);
  input.metadata.twitter.thread.forEach((post, i) => {
    assert.equal(post.text, manifest.posts[i].text);
    assert.deepEqual(post.assets, [{ image: { url: urls[i], metadata: { altText: manifest.posts[i].alt } } }]);
  });
});

test('verification rejects another account, missing replies, changed text, missing images or wrong media', () => {
  const post = { channelId: '6ab62682ea19ca0bdee284bd', channelService: 'twitter', text: manifest.posts[0].text, metadata: { threadCount: 7, thread: manifest.posts.map(p => ({ text: p.text, assets: [{ mimeType: 'image/jpeg', image: { altText: p.alt, width: 1200, height: 1500 } }] })) } };
  assertBufferReceipt(post, manifest.posts);
  for (const change of [value => { value.channelId = 'other'; }, value => { value.metadata.thread.pop(); }, value => { value.metadata.thread[4].text = 'wrong'; }, value => { value.metadata.thread[2].assets = []; }, value => { value.metadata.thread[6].assets[0].mimeType = 'video/mp4'; }]) {
    const value = structuredClone(post); change(value); assert.throws(() => assertBufferReceipt(value, manifest.posts));
  }
});
