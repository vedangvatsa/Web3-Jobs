import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { getAllArticles } from '../src/lib/articles';
import { communityPhotos, caseStudies, testimonials } from '../src/lib/community-data';
import { isEventUpcoming, type Web3Event } from '../src/lib/events';
import type { ResponsiveImagePlan } from '../src/lib/responsive-images';

type Entry = ResponsiveImagePlan & { hash: string; files: string[]; losslessFull?: string };
type Variant = { src: string; width: number; bytes: number };
const root = process.cwd();
const publicRoot = path.join(root, 'public');
const output = path.join(root, 'content/responsive-images.json');
const redirects: Record<string, string> = JSON.parse(fs.readFileSync('content/image-redirects.json', 'utf8'));
const previous: Record<string, Entry> = fs.existsSync(output) ? JSON.parse(fs.readFileSync(output, 'utf8')) : {};
const manifest: Record<string, Entry> = {};
const policy = 'responsive-v1-webp82-native85-avif65-lossless-logos';
let written = 0, reused = 0;

function addSource(sources: Set<string>, value?: string | null) {
  if (!value) return;
  const url = new URL(value, 'https://hashtagweb3.com');
  if (!['hashtagweb3.com', 'www.hashtagweb3.com'].includes(url.hostname)) return;
  const source = redirects[url.pathname] || url.pathname;
  if (/\.(?:png|jpe?g|webp)$/i.test(source) && fs.existsSync(path.join(publicRoot, source))) sources.add(source);
}
function logoFiles(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) return ['gallery', 'promo'].includes(entry.name) ? [] : logoFiles(file);
    return [file];
  });
}
const srcSet = (variants: Variant[]) => variants.sort((a, b) => a.width - b.width).map(v => `${v.src} ${v.width}w`).join(', ');
const smaller = (size: number, baseline: number) => size < baseline * 0.9 && baseline - size > 512;

async function main() {
  const sources = new Set<string>();
  const events = JSON.parse(fs.readFileSync('content/events-runtime.json', 'utf8')) as Web3Event[];
  for (const event of events.filter(event => isEventUpcoming(event))) addSource(sources, event.coverImage);
  for (const article of await getAllArticles()) addSource(sources, article.image);
  for (const image of [...communityPhotos, ...caseStudies, ...testimonials]) addSource(sources, 'src' in image ? image.src : image.image);
  for (const file of logoFiles(path.join(publicRoot, 'logo'))) addSource(sources, `/${path.relative(publicRoot, file).replace(/\\/g, '/')}`);

  for (const source of [...sources].sort()) {
    const original = fs.readFileSync(path.join(publicRoot, source));
    if (original.length < 3072) continue;
    const logo = source.startsWith('/logo/') && !source.startsWith('/logo/gallery/');
    const hash = createHash('sha256').update(original).update(policy).update(logo ? 'logo' : 'photo').digest('hex').slice(0, 20);
    const old = previous[source];
    const meta = await sharp(original, { animated: false }).metadata().catch(() => null);
    if (!meta?.width || !meta.height || (meta.pages && meta.pages > 1) || !['png', 'jpeg', 'webp'].includes(meta.format || '')) continue;
    const extensionMatches = path.extname(source).slice(1).replace('jpg', 'jpeg') === meta.format;
    if (old?.hash === hash && (extensionMatches || old.src !== source) && old.files.every(file => fs.existsSync(path.join(publicRoot, file)))) { manifest[source] = old; reused++; continue; }
    const width = meta.autoOrient?.width || meta.width, height = meta.autoOrient?.height || meta.height;
    const nativeFormat = meta.format as 'png' | 'jpeg' | 'webp';
    const widths = (logo ? [128, 192, 256, 384] : [320, 640, 960, 1280]).filter(value => value < width * 0.9);
    const files: string[] = [];
    const save = (buffer: Buffer, w: number, format: string): Variant => {
      const src = `/responsive/${hash}/${w}.${format === 'jpeg' ? 'jpg' : format}`;
      const destination = path.join(publicRoot, src);
      fs.mkdirSync(path.dirname(destination), { recursive: true });
      if (!fs.existsSync(destination)) { fs.writeFileSync(destination, buffer); written++; }
      files.push(src);
      return { src, width: w, bytes: buffer.length };
    };
    const encode = async (w: number, format: 'png' | 'jpeg' | 'webp' | 'avif') => {
      const image = sharp(original).rotate().resize({ width: w, withoutEnlargement: true });
      if (format === 'webp') return image.webp(logo ? { lossless: true, effort: 5 } : { quality: 82, effort: 5 }).toBuffer();
      if (format === 'avif') return image.avif({ quality: 65, effort: 4 }).toBuffer();
      if (format === 'png') return image.png({ compressionLevel: 9, adaptiveFiltering: true }).toBuffer();
      return image.jpeg({ quality: 85, mozjpeg: true }).toBuffer();
    };
    const fullNative = extensionMatches ? { src: source, width, bytes: original.length } : save(original, width, nativeFormat);
    const native: Variant[] = [fullNative];
    const webp: Variant[] = [];
    const avif: Variant[] = [];
    let losslessFull: string | undefined;
    if (nativeFormat === 'webp') webp.push(native[0]);
    else {
      // PNG full-size alternatives can be lossless; small resized versions are separately sampled.
      const full = nativeFormat === 'png' ? await sharp(original).rotate().webp({ lossless: true, effort: 5 }).toBuffer() : await encode(width, 'webp');
      if (smaller(full.length, original.length)) {
        const variant = save(full, width, 'webp');
        webp.push(variant);
        if (nativeFormat === 'png') losslessFull = variant.src;
      }
    }
    // AVIF is limited to the reviewed PNG illustrations, not company branding or arbitrary posters.
    if (['/images/news/metamask-split.png', '/images/demodayonepiece.png', '/images/altlayerrollupday.png'].includes(source)) {
      const full = await encode(width, 'avif');
      if (smaller(full.length, webp[0]?.bytes || original.length)) avif.push(save(full, width, 'avif'));
    }
    for (const w of widths) {
      const nativeBuffer = await encode(w, nativeFormat);
      if (smaller(nativeBuffer.length, original.length)) native.push(save(nativeBuffer, w, nativeFormat));
      if (webp.length && nativeFormat !== 'webp') {
        const buffer = await encode(w, 'webp');
        if (smaller(buffer.length, webp[0].bytes)) webp.push(save(buffer, w, 'webp'));
      }
      if (avif.length) {
        const buffer = await encode(w, 'avif');
        if (smaller(buffer.length, avif[0].bytes)) avif.push(save(buffer, w, 'avif'));
      }
    }
    if (nativeFormat === 'webp') webp.splice(0, webp.length, ...native);
    if (files.length) manifest[source] = {
      src: fullNative.src, hash, width, height, files: [...new Set(files)],
      ...(losslessFull && { losslessFull }),
      ...(native.length > 1 && { srcSet: srcSet(native) }),
      ...(webp.length && { webpSrcSet: srcSet(webp) }),
      ...(avif.length && { avifSrcSet: srcSet(avif) }),
    };
  }
  const published = new Set<string>();
  function scanPreviews(directory: string) {
    if (!fs.existsSync(directory)) return;
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) scanPreviews(file);
      else if (entry.name.endsWith('.html')) {
        const image = fs.readFileSync(file, 'utf8').match(/<meta property="og:image" content="([^"]+)"/)?.[1];
        if (image) published.add(new URL(image).pathname);
      }
    }
  }
  scanPreviews(path.join(publicRoot, 'preview'));
  for (const [source, entry] of Object.entries(previous)) {
    if (!manifest[source] && entry.files.some(file => published.has(file))) manifest[source] = entry;
  }
  fs.writeFileSync(output, `${JSON.stringify(manifest)}\n`);
  const logoIndex = Object.fromEntries(Object.entries(manifest).filter(([src]) => src.startsWith('/logo/') && !src.startsWith('/logo/gallery/')).map(([src, { hash: _hash, files: _files, losslessFull: _lossless, ...plan }]) => [src, plan]));
  fs.mkdirSync('public/data', { recursive: true });
  fs.writeFileSync('public/data/company-image-variants.json', `${JSON.stringify(logoIndex)}\n`);
  console.log(JSON.stringify({ sources: sources.size, optimizedSources: Object.keys(manifest).length, writtenVariants: written, reusedSources: reused, manifestBytes: fs.statSync(output).size, logoIndexBytes: Buffer.byteLength(JSON.stringify(logoIndex)) }));
}
main().catch(error => { console.error(error); process.exitCode = 1; });
