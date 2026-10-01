import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { preparePreviewImage } from './lib/og-preview-assets';
import { collectLiveEventCoverBasenames } from './lib/event-cover-refs';

async function main() {
  fs.mkdirSync('.cache', { recursive: true });
  const root = fs.mkdtempSync(path.resolve('.cache/preview-image-test-'));
  try {
    fs.mkdirSync(path.join(root, 'public/images'), { recursive: true });
    fs.mkdirSync(path.join(root, 'content'), { recursive: true });
    const png = await sharp({ create: { width: 64, height: 32, channels: 4, background: '#2255aa' } }).png().toBuffer();
    fs.writeFileSync(path.join(root, 'public/og-image.png'), png);
    fs.writeFileSync(path.join(root, 'public/images/valid.png'), png);
    fs.writeFileSync(path.join(root, 'public/images/mislabeled.jpg'), png);
    fs.writeFileSync(path.join(root, 'content/image-redirects.json'), JSON.stringify({ '/images/old.jpg': '/images/valid.png' }));
    fs.writeFileSync(path.join(root, 'content/social-preview-image-cache.json'), JSON.stringify({ 'https://example.com/remote.jpg': '/images/valid.png' }));
    const prepare = (url: string) => preparePreviewImage({ title: 'Example', description: 'Example', canonicalUrl: 'https://hashtagweb3.com/example', ogImageUrl: url }, root);
    const redirected = await prepare('https://hashtagweb3.com/images/old.jpg');
    assert.equal(redirected.ogImageUrl, 'https://hashtagweb3.com/images/valid.png');
    assert.equal(redirected.ogImageWidth, 64);
    assert.equal(redirected.ogImageHeight, 32);
    assert.equal(redirected.ogImageType, 'image/png');
    assert.equal((await prepare('https://example.com/remote.jpg')).ogImageUrl, redirected.ogImageUrl);
    assert.equal((await prepare('https://hashtagweb3.com/missing.png')).ogImageUrl, 'https://hashtagweb3.com/og-image.png');
    assert.equal((await prepare('https://unknown.example/expired.png')).ogImageUrl, 'https://hashtagweb3.com/og-image.png');
    const corrected = await prepare('https://hashtagweb3.com/images/mislabeled.jpg');
    assert.match(corrected.ogImageUrl, /\/og\/source\/.+\.png$/);
    assert.ok(fs.existsSync(path.join(root, 'public', new URL(corrected.ogImageUrl).pathname)));
    fs.writeFileSync(path.join(root, 'content/image-redirects.json'), JSON.stringify({ '/a': '/b', '/b': '/a' }));
    await assert.rejects(prepare('https://hashtagweb3.com/a'), /cycle/);
    console.log('Preview recovery passed: legacy redirects, cached external images, missing files, correct MIME/dimensions, and redirect-cycle rejection.');
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
  const protectedCovers = await collectLiveEventCoverBasenames();
  for (const url of JSON.parse(fs.readFileSync('content/legacy-image-paths.json', 'utf8')) as string[]) {
    assert.ok(protectedCovers.has(path.basename(url)), `Cleanup must preserve ${url}`);
  }
  console.log('Legacy preview images are protected from stale-cover cleanup.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
