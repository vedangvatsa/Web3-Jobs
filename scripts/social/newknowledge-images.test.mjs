import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { sha256 } from './newknowledge-content.mjs';
import { pinnedImages, verifyPinnedImages, providerImageVerifier } from './newknowledge-images.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const response = bytes => new Response(bytes, { status: 200, headers: { 'Content-Type': 'image/jpeg' } });
const image = color => sharp({ create: { width: 1200, height: 1500, channels: 3, background: color } }).jpeg().toBuffer();

test('public asset pin checks the exact bytes and refuses mutable branch names', async () => {
  const bytes = await image('#176349');
  const asset = { path: 'social-assets/knowledge-threads-month/images/C01-01.jpg', bytes: bytes.length, sha256: sha256(bytes), width: 1200, height: 1500 };
  assert.throws(() => pinnedImages([asset], 'main'));
  const pins = pinnedImages([asset], 'a'.repeat(40));
  assert.match(pins[0].url, /raw\.githubusercontent\.com\/vedangvatsa\/Web3-Jobs\/[a-f0-9]{40}\//);
  await verifyPinnedImages(pins, async () => response(bytes));
  const changed = await image('#ffffff');
  await assert.rejects(verifyPinnedImages(pins, async () => response(changed)), /Pinned image bytes changed/);
});

test('provider image validation accepts JPEG re-encoding and rejects another same-sized image', async () => {
  const directory = await fs.mkdtemp(path.join(root, '.cache/newknowledge-image-test-'));
  try {
    const bytes = await sharp(Buffer.from('<svg width="1200" height="1500"><rect width="1200" height="1500" fill="#f5f4ef"/><rect x="100" y="200" width="600" height="800" fill="#176349"/></svg>')).jpeg({ quality: 95 }).toBuffer();
    const file = path.join(directory, 'approved.jpg');
    await fs.writeFile(file, bytes);
    const asset = { path: path.relative(root, file), sha256: sha256(bytes), width: 1200, height: 1500 };
    const reencoded = await sharp(bytes).resize(1080, 1350).jpeg({ quality: 80 }).toBuffer();
    await providerImageVerifier(root, async () => response(reencoded))('https://cdn.example/image.jpg', asset);
    const wrong = await image('#176349');
    await assert.rejects(providerImageVerifier(root, async () => response(wrong))('https://cdn.example/wrong.jpg', asset), /does not match/);
  } finally { await fs.rm(directory, { recursive: true, force: true }); }
});
