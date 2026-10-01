import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { load } from 'cheerio';
import { collectOgPreviewPaths, resolveOgPreviewMeta } from '../src/lib/og-preview';

const cachePath = path.resolve('content/social-preview-image-cache.json');
const cache: Record<string, string> = fs.existsSync(cachePath) ? JSON.parse(fs.readFileSync(cachePath, 'utf8')) : {};
function shells(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? shells(file) : entry.name.endsWith('.html') ? [file] : [];
  });
}
async function main() {
  const urls = new Set<string>();
  for (const contentPath of await collectOgPreviewPaths()) urls.add((await resolveOgPreviewMeta(contentPath)).ogImageUrl);
  for (const file of shells('public/preview')) {
    const $ = load(fs.readFileSync(file, 'utf8'));
    const value = $('meta[property="og:image"]').attr('content');
    if (value) urls.add(value);
  }
  const external = [...urls].filter(value => {
    const url = new URL(value);
    return !['hashtagweb3.com', 'www.hashtagweb3.com'].includes(url.hostname);
  });
  let cursor = 0, downloaded = 0;
  const failures: Array<{ url: string; reason: string }> = [];
  await Promise.all(Array.from({ length: 4 }, async () => {
    while (cursor < external.length) {
      const value = new URL(external[cursor++]).toString();
      if (cache[value] && fs.existsSync(path.join('public', cache[value]))) continue;
      try {
        const url = new URL(value);
        if (url.protocol !== 'https:' || !url.hostname.includes('.') || /^(?:127\.|10\.|192\.168\.|169\.254\.|172\.(?:1[6-9]|2\d|3[01])\.)/.test(url.hostname)) throw new Error('Non-public image URL');
        const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(20_000) });
        if (!response.ok || !response.headers.get('content-type')?.startsWith('image/')) {
          await response.body?.cancel();
          throw new Error(`HTTP ${response.status} ${response.headers.get('content-type')}`);
        }
        const chunks: Uint8Array[] = []; let size = 0;
        for await (const chunk of response.body as unknown as AsyncIterable<Uint8Array>) {
          size += chunk.length;
          if (size > 8 * 1024 * 1024) throw new Error('Source image exceeds 8 MiB');
          chunks.push(chunk);
        }
        const bytes = await sharp(Buffer.concat(chunks), { animated: false, limitInputPixels: 40_000_000 }).rotate()
          .resize({ width: 1200, height: 630, fit: 'inside', withoutEnlargement: true }).webp({ quality: 76, effort: 5 }).toBuffer();
        const digest = createHash('sha256').update(bytes).digest('hex').slice(0, 24);
        const relative = `/og/external/${digest}.webp`;
        const destination = path.join('public', relative);
        fs.mkdirSync(path.dirname(destination), { recursive: true });
        fs.writeFileSync(destination, bytes);
        cache[value] = relative;
        downloaded++;
      } catch (error) {
        cache[value] = '/og-image.png';
        failures.push({ url: value, reason: (error as Error).message });
      }
    }
  }));
  fs.writeFileSync(cachePath, `${JSON.stringify(Object.fromEntries(Object.entries(cache).sort()), null, 2)}\n`);
  console.log(JSON.stringify({ externalImages: external.length, downloaded, brandedFallbacks: failures }, null, 2));
}
main().catch(error => { console.error(error); process.exitCode = 1; });
