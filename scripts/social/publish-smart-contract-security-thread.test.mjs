import test from 'node:test';
import assert from 'node:assert/strict';
import { tweets } from './publish-smart-contract-security-thread.mjs';

test('Smart Contract Auditing thread has exactly 13 tweets with valid character counts', () => {
  assert.equal(tweets.length, 13, 'Thread must contain exactly 13 tweets');

  tweets.forEach((tweet, idx) => {
    // Check no emdashes
    assert.ok(!tweet.text.includes('—'), `Tweet ${idx + 1} contains emdash —`);
    assert.ok(!tweet.text.includes('–'), `Tweet ${idx + 1} contains endash –`);

    // In X / Twitter, URLs count as 23 characters regardless of length
    const normalizedLength = [...tweet.text.replace(/https?:\/\/\S+/g, 'x'.repeat(23))].length;
    assert.ok(
      normalizedLength <= 280,
      `Tweet ${idx + 1} exceeds 280 characters: length=${normalizedLength}`
    );
  });
});

test('Tweets 1 to 11 have hosted CDN images; Tweets 12 and 13 are text-only with null imageUrl', () => {
  for (let i = 0; i < 11; i++) {
    assert.ok(tweets[i].imageUrl, `Tweet ${i + 1} must have an imageUrl`);
    assert.match(tweets[i].imageUrl, /^https:\/\/iili\.io\/[a-zA-Z0-9]+\.(png|jpg)$/, `Tweet ${i + 1} image URL invalid`);
  }
  assert.equal(tweets[11].imageUrl, null, 'Tweet 12 should have null imageUrl for clean text-only recap');
  assert.equal(tweets[12].imageUrl, null, 'Tweet 13 should have null imageUrl for native Telegram preview');
});
