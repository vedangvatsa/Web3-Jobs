import assert from 'node:assert/strict';
import test from 'node:test';
import { NextRequest } from 'next/server';
import tombstones from '../content/event-tombstones.json';
import { middleware } from '../src/middleware';

test('middleware returns real 410 for root, alias, preview, bot and social requests; expiry returns 404', async () => {
  const entries = Object.values(tombstones) as Array<{ until: string; slugs: string[] }>;
  assert.ok(entries.length, 'Run retention before checking the production tombstone registry');
  const entry = entries[0];
  const original = Date.now;
  try {
    for (const now of [Date.parse(entry.until) - 1, Date.parse(entry.until)]) {
      Date.now = () => now;
      for (const slug of entry.slugs) for (const suffix of ['', '/li']) {
        for (const ua of ['Mozilla/5.0', 'LinkedInBot']) {
          const response = await middleware(new NextRequest(`https://hashtagweb3.com/${slug}${suffix}?mode=agent`, { headers: { 'user-agent': ua } }));
          assert.equal(response.status, now < Date.parse(entry.until) ? 410 : 404);
          assert.equal(response.headers.get('x-middleware-rewrite'), null);
          assert.equal(response.headers.get('cache-control'), 'no-store');
        }
      }
      assert.equal((await middleware(new NextRequest(`https://hashtagweb3.com/preview/${entry.slugs[0]}.html`))).status, now < Date.parse(entry.until) ? 410 : 404);
    }
  } finally { Date.now = original; }
});
