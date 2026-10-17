import test from 'node:test';
import assert from 'node:assert/strict';
import { platformLink, renderOwnSiteLinks, assertCanonicalLinkPath } from './platform-links.mjs';

test('platform links append the destination suffix after the complete page path', () => {
  for (const [platform, suffix] of Object.entries({ twitter: 'x', threads: 'th', linkedin: 'li', telegram: 'tg', facebook: 'fb', instagram: 'ig', bluesky: 'bsky', farcaster: 'fc', discord: 'dc', reddit: 'rd' })) {
    assert.equal(platformLink('/nomads', platform), `https://hashtagweb3.com/nomads/${suffix}`);
    assert.equal(platformLink('https://hashtagweb3.com/nomads/x/?city=Delhi#cost', platform), `https://hashtagweb3.com/nomads/${suffix}?city=Delhi#cost`);
    assert.equal(platformLink('hashtagweb3.com/th/nomads', platform), `hashtagweb3.com/nomads/${suffix}`);
    assert.equal(platformLink('https://hashtagweb3.com', platform), `https://hashtagweb3.com/${suffix}`);
  }
});

test('text rendering preserves prose, punctuation, external links, emails and deceptive hosts', () => {
  const text = 'Read (https://hashtagweb3.com/visas/x). Also hashtagweb3.com/jobs! https://example.org/?next=hashtagweb3.com/jobs https://hashtagweb3.com.evil.org/jobs user@hashtagweb3.com sub.hashtagweb3.com/x';
  const expected = 'Read (https://hashtagweb3.com/visas/th). Also hashtagweb3.com/jobs/th! https://example.org/?next=hashtagweb3.com/jobs https://hashtagweb3.com.evil.org/jobs user@hashtagweb3.com sub.hashtagweb3.com/x';
  assert.equal(renderOwnSiteLinks(text, 'threads'), expected);
  assert.equal(renderOwnSiteLinks(expected, 'threads'), expected);
  assert.equal(platformLink('https://outside.example/path/x', 'threads'), 'https://outside.example/path/x');
  assert.equal(platformLink('https://www.hashtagweb3.com/nomads/th/x', 'x'), 'https://hashtagweb3.com/nomads/x');
});

test('canonical campaign paths reject external, tracking, traversal and resource URLs', () => {
  assertCanonicalLinkPath('/building-web3-portfolio');
  for (const path of ['//evil.org', 'https://evil.org', '/nomads/x', '/th/nomads', '/nomads?x=1', '/a/../b', '/a%2fb', '/image.jpg']) assert.throws(() => assertCanonicalLinkPath(path));
  assert.throws(() => platformLink('/jobs', 'unknown'));
  assert.throws(() => platformLink('https://user@hashtagweb3.com/jobs', 'x'));
});
