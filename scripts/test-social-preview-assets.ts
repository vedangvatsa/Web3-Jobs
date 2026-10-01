import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { load } from 'cheerio';

const publicRoot = path.resolve('public');
const root = path.join(publicRoot, 'preview');
const imageMetadata = new Map<string, sharp.Metadata>();
const externalImages = new Set<string>();
const failures: string[] = [];
function files(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? files(file) : entry.name.endsWith('.html') ? [file] : [];
  });
}
async function main() {
  const previews = files(root);
  assert.ok(previews.length > 0, 'No social previews were generated');
  for (const file of previews) {
    try {
      const $ = load(fs.readFileSync(file, 'utf8'));
      const image = $('meta[property="og:image"]').attr('content');
      assert.ok(image, 'Missing og:image');
      const url = new URL(image);
      assert.equal(url.protocol, 'https:');
      assert.equal($('meta[name="twitter:image"]').attr('content'), image, 'Twitter and OG image differ');
      assert.equal($('meta[property="og:image:secure_url"]').attr('content'), image);
      if (!['hashtagweb3.com', 'www.hashtagweb3.com'].includes(url.hostname)) { externalImages.add(image); continue; }
      const target = path.resolve(publicRoot, `.${decodeURIComponent(url.pathname)}`);
      assert.ok(target.startsWith(`${publicRoot}${path.sep}`));
      assert.ok(fs.existsSync(target), `Missing image: ${url.pathname}`);
      let meta = imageMetadata.get(target);
      if (!meta) { meta = await sharp(target).metadata(); imageMetadata.set(target, meta); }
      assert.ok(meta.width && meta.height, 'Image has no dimensions');
      assert.equal($('meta[property="og:image:width"]').attr('content'), String(meta.width), 'Incorrect image width');
      assert.equal($('meta[property="og:image:height"]').attr('content'), String(meta.pageHeight || meta.height), 'Incorrect image height');
      assert.equal($('meta[property="og:image:type"]').attr('content'), `image/${meta.format}`, 'Incorrect image MIME');
      const extension = path.extname(target).slice(1).replace('jpg', 'jpeg');
      assert.equal(extension, meta.format, 'Image URL extension does not match its bytes');
    } catch (error) { failures.push(`${path.relative(publicRoot, file)}: ${(error as Error).message}`); }
  }
  if (process.argv.includes('--verify-external')) {
    for (const url of externalImages) {
      try {
        let response = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(15_000) });
        if (!response.ok) {
          response = await fetch(url, { headers: { Range: 'bytes=0-1023' }, signal: AbortSignal.timeout(15_000) });
          await response.body?.cancel();
        }
        assert.ok(response.ok, `HTTP ${response.status}`);
        assert.match(response.headers.get('content-type') || '', /^image\//);
      } catch (error) { failures.push(`${url}: ${(error as Error).message}`); }
    }
  }
  for (const failure of failures.slice(0, 50)) console.error(failure);
  console.log(`Social previews: ${previews.length} checked, ${imageMetadata.size} local images, ${externalImages.size} external images, ${failures.length} failures.`);
  assert.equal(externalImages.size, 0, 'Cache external social images before generating previews');
  assert.equal(failures.length, 0, 'Broken social-preview assets');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
