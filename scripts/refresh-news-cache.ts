#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { fetchNewsFeedItems } from '../src/lib/news';

async function refreshNewsCache(): Promise<void> {
  const cachePath = path.join(process.cwd(), 'content/news-cache.json');
  const { items, successfulFeeds } = await fetchNewsFeedItems();

  if (successfulFeeds === 0) {
    console.error('News cache was not updated: every upstream RSS feed failed; existing snapshot was preserved.');
    process.exitCode = 1;
    return;
  }

  if (items.length === 0) {
    console.error(`News cache was not updated: ${successfulFeeds} feed(s) responded but produced no usable items.`);
    process.exitCode = 1;
    return;
  }

  const snapshot = JSON.stringify({ generatedAt: new Date().toISOString(), items }, null, 2) + '\n';
  const temporaryPath = `${cachePath}.${process.pid}.${Date.now()}.tmp`;
  try {
    fs.writeFileSync(temporaryPath, snapshot, 'utf8');
    fs.renameSync(temporaryPath, cachePath);
    console.log(`Updated news cache with ${items.length} items from ${successfulFeeds} feed(s).`);
  } finally {
    if (fs.existsSync(temporaryPath)) fs.unlinkSync(temporaryPath);
  }
}

refreshNewsCache().catch((error) => {
  console.error('News cache refresh failed:', error);
  process.exitCode = 1;
});
