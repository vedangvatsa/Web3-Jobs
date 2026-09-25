import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { assertStandalonePublicAssets, requiredPublicAssets } from './lib/standalone-public-assets';

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'standalone-assets-'));
const standalone = path.join(root, '.next/standalone');
const write = (file: string, value: string) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, value);
};
try {
  write(path.join(root, 'content/events-runtime.json'), JSON.stringify([{ coverImage: '/events/current.webp?v=2' }, { coverImage: 'https://example.com/remote.jpg' }]));
  write(path.join(root, 'content/articles-index.json'), JSON.stringify([{ category: 'News', image: '/images/news/current.jpg' }]));
  for (const file of requiredPublicAssets(root)) {
    write(path.join(root, file), 'asset');
    write(path.join(standalone, file), 'asset');
  }
  assertStandalonePublicAssets(root, standalone);
  assert.equal(fs.existsSync(path.join(root, 'public/events/ethsofia.webp')), false);
  const cover = path.join(standalone, 'public/events/current.webp');
  fs.unlinkSync(cover);
  assert.throws(() => assertStandalonePublicAssets(root, standalone), /Standalone missing public\/events\/current.webp/);
  write(cover, 'truncated');
  assert.throws(() => assertStandalonePublicAssets(root, standalone), /Incomplete standalone asset/);
  write(cover, 'asset');
  fs.unlinkSync(path.join(root, 'public/images/news/current.jpg'));
  assert.throws(() => assertStandalonePublicAssets(root, standalone), /Referenced public asset missing from source/);
  console.log('Standalone asset validation regressions passed.');
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}
