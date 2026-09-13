#!/usr/bin/env node

import * as assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { getNewsFeed, readNewsSnapshot } from '../src/lib/news';

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
  const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'news-cache-test-'));
  const temporarySnapshot = path.join(temporaryDirectory, 'news-cache.json');
  globalThis.fetch = async () => {
    throw new Error('getNewsFeed must not make network requests');
  };

  try {
    fs.writeFileSync(temporarySnapshot, JSON.stringify({ generatedAt: new Date().toISOString(), items: [item] }), 'utf8');
    assert.deepEqual(
      readNewsSnapshot(temporarySnapshot),
      [item],
    );
    fs.writeFileSync(temporarySnapshot, '{not json', 'utf8');
    assert.deepEqual(readNewsSnapshot(temporarySnapshot), []);
    fs.unlinkSync(temporarySnapshot);
    assert.deepEqual(readNewsSnapshot(temporarySnapshot), []);

    const expected = readNewsSnapshot(cachePath);
    assert.ok(expected.length > 0, 'Committed news snapshot should contain usable items');
    assert.deepEqual(await getNewsFeed(), expected);
    console.log('News snapshot tests passed.');
  } finally {
    globalThis.fetch = originalFetch;
    fs.rmSync(temporaryDirectory, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
