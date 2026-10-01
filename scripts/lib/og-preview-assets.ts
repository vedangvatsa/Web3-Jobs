import fs from 'node:fs';
import path from 'node:path';
import sharp, { type Metadata as ImageMetadata } from 'sharp';
import { createHash } from 'node:crypto';
import type { OgPreviewMeta } from '../../src/lib/og-preview';
import type { SocialImageInfo } from '../../src/lib/social-image-info';

const dimensions = new Map<string, Promise<ImageMetadata>>();
const catalogs = new Map<string, { mtime: number; size: number; value: unknown }>();
function catalog<T>(file: string): T {
  if (!fs.existsSync(file)) return {} as T;
  const stat = fs.statSync(file), cached = catalogs.get(file);
  if (cached?.mtime === stat.mtimeMs && cached.size === stat.size) return cached.value as T;
  const value = JSON.parse(fs.readFileSync(file, 'utf8')) as T;
  catalogs.set(file, { mtime: stat.mtimeMs, size: stat.size, value });
  return value;
}
const preparedImages = new Map<string, Record<string, SocialImageInfo>>();
function imageKey(source: string): string {
  const url = new URL(source, 'https://hashtagweb3.com');
  return ['hashtagweb3.com', 'www.hashtagweb3.com'].includes(url.hostname) ? url.pathname : url.toString();
}
export function writeSocialImageInfo(root = process.cwd()) {
  fs.writeFileSync(path.join(root, 'content/social-image-info.json'), `${JSON.stringify(preparedImages.get(root) || {})}\n`);
}
export async function preparePreviewImage(meta: OgPreviewMeta, root = process.cwd()): Promise<OgPreviewMeta> {
  let url = new URL(meta.ogImageUrl, 'https://hashtagweb3.com');
  if (!['hashtagweb3.com', 'www.hashtagweb3.com'].includes(url.hostname)) {
    const cachePath = path.join(root, 'content/social-preview-image-cache.json');
    const cache = catalog<Record<string, string>>(cachePath);
    url = new URL(cache[url.toString()] || '/og-image.png', 'https://hashtagweb3.com');
  }
  const redirectsPath = path.join(root, 'content/image-redirects.json');
  const redirects = catalog<Record<string, string>>(redirectsPath);
  const visited = new Set<string>();
  while (redirects[url.pathname]) {
    if (visited.has(url.pathname)) throw new Error(`Image redirect cycle: ${url.pathname}`);
    visited.add(url.pathname);
    url.pathname = redirects[url.pathname];
  }
  const publicRoot = path.resolve(root, 'public');
  const variants = catalog<Record<string, { losslessFull?: string; webpSrcSet?: string }>>(path.join(root, 'content/responsive-images.json'))[url.pathname];
  let optimized = variants?.losslessFull;
  if (!optimized && url.pathname.startsWith('/events/') && variants?.webpSrcSet) {
    optimized = variants.webpSrcSet.split(',').map(item => item.trim().match(/^(\S+) (\d+)w$/))
      .filter((match): match is RegExpMatchArray => !!match && Number(match[2]) >= 1200)
      .sort((a, b) => Number(a[2]) - Number(b[2]))[0]?.[1];
  }
  if (optimized?.startsWith('/responsive/') && fs.existsSync(path.join(publicRoot, optimized))) url.pathname = optimized;
  let imagePath = path.resolve(publicRoot, `.${decodeURIComponent(url.pathname)}`);
  if (!imagePath.startsWith(`${publicRoot}${path.sep}`)) throw new Error('Invalid preview image path');
  let info: ImageMetadata | undefined;
  if (fs.existsSync(imagePath)) {
    let load = dimensions.get(imagePath);
    if (!load) { load = sharp(imagePath).metadata(); dimensions.set(imagePath, load); }
    try { info = await load; } catch { /* An invalid image receives the same fallback as a missing file. */ }
  }
  if (!info?.width || !info.height || !['png', 'jpeg', 'webp', 'gif'].includes(info.format || '')) {
    url.pathname = '/og-image.png';
    url.search = '';
    imagePath = path.join(publicRoot, 'og-image.png');
    info = await sharp(imagePath).metadata();
  }
  const extension = info.format === 'jpeg' ? '.jpg' : `.${info.format}`;
  if (path.extname(imagePath).toLowerCase().replace('.jpeg', '.jpg') !== extension) {
    const bytes = fs.readFileSync(imagePath);
    const fingerprint = createHash('sha256').update(bytes).digest('hex').slice(0, 20);
    url.pathname = `/og/source/${fingerprint}${extension}`;
    imagePath = path.join(publicRoot, url.pathname);
    fs.mkdirSync(path.dirname(imagePath), { recursive: true });
    if (!fs.existsSync(imagePath)) fs.writeFileSync(imagePath, bytes);
  }
  const resolved: SocialImageInfo = { url: url.toString(), width: info.width!, height: info.pageHeight || info.height!, type: `image/${info.format}` };
  const records = preparedImages.get(root) || {};
  records[imageKey(meta.ogImageUrl)] = resolved;
  records[imageKey(resolved.url)] = resolved;
  preparedImages.set(root, records);
  return { ...meta, ogImageUrl: resolved.url, ogImageWidth: resolved.width, ogImageHeight: resolved.height, ogImageType: resolved.type };
}
