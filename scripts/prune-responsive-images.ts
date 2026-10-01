import fs from 'node:fs';
import path from 'node:path';

const apply = process.argv.includes('--apply');
const root = path.resolve('public/responsive');
const manifest = JSON.parse(fs.readFileSync('content/responsive-images.json', 'utf8')) as Record<string, { files: string[] }>;
const keep = new Set(Object.values(manifest).flatMap(image => image.files));
const graceMs = 7 * 24 * 60 * 60 * 1000;
function walk(directory: string): string[] {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(file) : [file];
  });
}
for (const file of walk('public/preview').filter(file => file.endsWith('.html'))) {
  const image = fs.readFileSync(file, 'utf8').match(/<meta property="og:image" content="([^"]+)"/)?.[1];
  if (image) keep.add(new URL(image).pathname);
}
const redirects = JSON.parse(fs.readFileSync('content/image-redirects.json', 'utf8')) as Record<string, string>;
for (const target of Object.values(redirects)) keep.add(target);
let removed = 0, bytes = 0, grace = 0;
for (const file of walk(root)) {
  const relative = `/responsive/${path.relative(root, file).replace(/\\/g, '/')}`;
  if (!/^\/responsive\/[a-f0-9]{20}\/\d+\.(?:png|jpg|webp|avif)$/.test(relative) || keep.has(relative)) continue;
  const stat = fs.statSync(file);
  if (Date.now() - stat.mtimeMs < graceMs) { grace++; continue; }
  removed++; bytes += stat.size;
  if (apply) fs.unlinkSync(file);
}
console.log(JSON.stringify({ mode: apply ? 'apply' : 'dry-run', unreferencedFiles: removed, bytes, protectedRecentFiles: grace, cachedPageGraceDays: 7 }));
