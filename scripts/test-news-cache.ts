#!/usr/bin/env node

import * as assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { getNewsFeed, parseNewsSnapshot, readNewsSnapshot } from '../src/lib/news';

const cachePath = path.join(process.cwd(), 'content/news-cache.json');
const originalFetch = globalThis.fetch;
const item = {
  title: 'Bitcoin protocol update ships',
  link: 'https://example.com/news/bitcoin-protocol-update',
  pubDate: '2026-09-13T00:00:00.000Z',
  creator: 'Example Author',
  contentSnippet: 'A valid cached news item.',
  source: 'Example News',
};

async function main(): Promise<void> {
  globalThis.fetch = async () => {
    throw new Error('getNewsFeed must not make network requests');
  };

  try {
    assert.deepEqual(
      parseNewsSnapshot({ generatedAt: new Date().toISOString(), items: [item] }),
      [item],
    );
    assert.deepEqual(parseNewsSnapshot(null), []);
    assert.deepEqual(parseNewsSnapshot({ generatedAt: 'invalid', items: [item] }), []);
    assert.deepEqual(parseNewsSnapshot({ generatedAt: new Date().toISOString(), items: [{}] }), []);

    const expected = parseNewsSnapshot(JSON.parse(fs.readFileSync(cachePath, 'utf8')));
    assert.ok(expected.length > 0, 'Committed news snapshot should contain usable items');
    assert.deepEqual(await getNewsFeed(), expected);
    assert.deepEqual(readNewsSnapshot(), expected);
    console.log('News snapshot tests passed.');
  } finally {
    globalThis.fetch = originalFetch;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
