import test from 'node:test';
import assert from 'node:assert/strict';
import { tweets } from './publish-ai-agent-courses-thread.mjs';

test('AI Agent Courses thread has exactly 13 tweets with valid character counts', () => {
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

test('Tweets 1 to 12 have hosted CDN images; Tweet 13 has null imageUrl for link card preview', () => {
  for (let i = 0; i < 12; i++) {
    assert.ok(tweets[i].imageUrl, `Tweet ${i + 1} must have an imageUrl`);
    assert.match(tweets[i].imageUrl, /^https:\/\/iili\.io\/[a-zA-Z0-9]+\.png$/, `Tweet ${i + 1} image URL invalid`);
  }
  assert.equal(tweets[12].imageUrl, null, 'Tweet 13 should have null imageUrl for native Telegram preview');
});
