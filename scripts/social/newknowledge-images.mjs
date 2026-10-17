import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { sha256 } from './newknowledge-content.mjs';
import { REPOSITORY } from './newknowledge-state.mjs';

export async function inspectImages(root, posts) {
  const assets = [];
  for (const post of posts) {
    assert.match(post.image, /^social-assets\/knowledge-threads-month\/images\/[CEN]\d{2}-0[1-6]\.jpg$/);
    const bytes = await fs.readFile(path.join(root, post.image));
    const image = await sharp(bytes).metadata();
    assert.equal(image.format, 'jpeg');
    assert.ok(image.width >= 320 && image.width <= 4096 && image.height >= 320 && image.height <= 4096, 'Unsupported image dimensions');
    assert.ok(bytes.length > 0 && bytes.length < 5 * 1024 * 1024, 'Image exceeds 5 MB');
    assets.push({ path: post.image, sha256: sha256(bytes), bytes: bytes.length, width: image.width, height: image.height });
  }
  assert.equal(new Set(assets.map(asset => asset.sha256)).size, 6, 'Each post needs its own image');
  return assets;
}

export function pinnedImages(assets, commit) {
  assert.match(commit, /^[a-f0-9]{40}$/, 'Images require a full Git commit SHA');
  return assets.map(asset => ({ ...asset, url: `https://raw.githubusercontent.com/${REPOSITORY}/${commit}/${asset.path}` }));
}

async function downloadImage(url, fetcher) {
  assert.equal(new URL(url).protocol, 'https:');
  const response = await fetcher(url, { signal: AbortSignal.timeout(30000) });
  assert.equal(response.status, 200, `Image is unavailable: ${url}`);
  assert.match(response.headers.get('content-type') || '', /^image\//);
  const bytes = Buffer.from(await response.arrayBuffer());
  assert.ok(bytes.length > 0 && bytes.length < 10 * 1024 * 1024, 'Invalid downloaded image size');
  return bytes;
}

export async function verifyPinnedImages(assets, fetcher = fetch) {
  for (const asset of assets) {
    const bytes = await downloadImage(asset.url, fetcher);
    assert.equal(sha256(bytes), asset.sha256, `Pinned image bytes changed: ${asset.path}`);
    assert.equal(bytes.length, asset.bytes);
  }
}

export function providerImageVerifier(root, fetcher = fetch) {
  return async (url, expected) => {
    const bytes = await downloadImage(url, fetcher);
    if (sha256(bytes) === expected.sha256) return;
    const original = await fs.readFile(path.join(root, expected.path));
    assert.equal(sha256(original), expected.sha256, 'Local image changed after claim');
    const metadata = await sharp(bytes).metadata();
    assert.ok(Math.abs(metadata.width / metadata.height - expected.width / expected.height) < 0.01, 'Provider image aspect ratio differs');
    // Provider CDNs re-encode JPEGs. Compare decoded pixels as well as the pinned source hash.
    const pixels = async input => sharp(input).rotate().resize(96, 120, { fit: 'fill' }).removeAlpha().toColourspace('srgb').raw().toBuffer();
    const [actual, reference] = await Promise.all([pixels(bytes), pixels(original)]);
    assert.equal(actual.length, reference.length);
    let difference = 0, large = 0;
    for (let i = 0; i < actual.length; i++) {
      const delta = Math.abs(actual[i] - reference[i]);
      difference += delta;
      if (delta > 32) large++;
    }
    assert.ok(difference / actual.length <= 6 && large / actual.length <= 0.025, 'Provider image does not match the approved image');
  };
}
