import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import sharp from 'sharp';
import { downloadCover } from './event-image-utils.mjs';

test('localizes valid compressed artwork below 10 KB without cropping', async t => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'event-image-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const image = await sharp({ create: { width: 900, height: 600, channels: 3, background: '#6d36cc' } }).png().toBuffer();
  assert.ok(image.length < 10000 && image.length > 512);
  t.mock.method(globalThis, 'fetch', async () => new Response(image, { headers: { 'content-type': 'image/png' } }));
  const local = await downloadCover({ id: 'compressed-poster', name: 'Poster', url: 'https://example.com/event', startDate: '2026-10-07', coverImage: 'https://example.com/art.png' }, directory);
  assert.ok(local?.startsWith('/events/'));
  const metadata = await sharp(path.join(directory, path.basename(local))).metadata();
  assert.equal(metadata.format, 'webp');
  assert.equal(metadata.width, 900);
  assert.equal(metadata.height, 600);
});

test('does not save a tiny image padded above the byte-size threshold', async t => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'event-image-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const image = await sharp({ create: { width: 1, height: 1, channels: 3, background: '#000' } }).png().toBuffer();
  t.mock.method(globalThis, 'fetch', async () => new Response(Buffer.concat([image, Buffer.alloc(1024)]), { headers: { 'content-type': 'image/png' } }));
  assert.equal(await downloadCover({ id: 'pixel', coverImage: 'https://example.com/pixel.png' }, directory), null);
  assert.deepEqual(fs.readdirSync(directory), []);
});
