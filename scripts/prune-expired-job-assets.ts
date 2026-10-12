import fs from 'node:fs';
import path from 'node:path';
import { isExpiredJobPath } from '../src/lib/job-age-path';

const read = <T,>(file: string): T => JSON.parse(fs.readFileSync(file, 'utf8'));
const write = (file: string, value: unknown) => fs.writeFileSync(file, `${JSON.stringify(value)}\n`);
const unused = new Set<string>();
const references = (value: unknown): string[] => JSON.stringify(value).match(/\/(?:responsive|og\/source)\/[a-zA-Z0-9/_.-]+\.(?:png|jpg|jpeg|webp|avif)/g) || [];
let removedEntries = 0;
for (const file of ['content/responsive-images.json', 'content/social-image-info.json']) {
  if (!fs.existsSync(file)) continue;
  const map = read<Record<string, unknown>>(file);
  let changed = false;
  for (const [key, value] of Object.entries(map)) {
    if (!isExpiredJobPath(key)) continue;
    references(value).forEach(file => unused.add(file));
    delete map[key];
    changed = true;
    removedEntries++;
  }
  if (changed) write(file, map);
}
const protectedFiles = new Set<string>();
if (fs.existsSync('content/responsive-images.json')) references(read('content/responsive-images.json')).forEach(file => protectedFiles.add(file));
if (fs.existsSync('content/social-image-info.json')) {
  for (const [key, value] of Object.entries(read<Record<string, unknown>>('content/social-image-info.json'))) {
    if (!unused.has(key)) references(value).forEach(file => protectedFiles.add(file));
  }
}
for (const file of ['public/og/manifest.json', 'public/preview/.preview-manifest.json']) {
  if (!fs.existsSync(file)) continue;
  const map = read<Record<string, unknown>>(file);
  let changed = false;
  for (const key of Object.keys(map)) {
    const jobSlug = key.match(/^job(?:-ig)?:([a-z0-9_-]+)$/i)?.[1];
    const contentPath = jobSlug ? `/${jobSlug}` : key.startsWith('/') ? key : `/${key}`;
    if (isExpiredJobPath(contentPath)) { delete map[key]; changed = true; removedEntries++; }
  }
  if (changed) write(file, map);
}
const redirectFile = 'content/image-redirects.json';
const redirects = read<Record<string, string>>(redirectFile);
let changedRedirects = false;
for (const [source, target] of Object.entries(redirects)) {
  if (isExpiredJobPath(source) || isExpiredJobPath(target)) { redirects[source] = '/og-image.png'; changedRedirects = true; }
}
if (changedRedirects) fs.writeFileSync(redirectFile, `${JSON.stringify(redirects, null, 2)}\n`);
let removedFiles = 0;
for (const file of unused) {
  if (protectedFiles.has(file)) continue;
  const local = path.join('public', file);
  if (fs.existsSync(local)) { fs.unlinkSync(local); removedFiles++; }
}
if (fs.existsSync('content/social-image-info.json')) {
  const map = read<Record<string, unknown>>('content/social-image-info.json');
  for (const key of Object.keys(map)) if (unused.has(key) && !protectedFiles.has(key)) delete map[key];
  write('content/social-image-info.json', map);
}
console.log(`Expired job assets: ${removedEntries} manifest entries, ${removedFiles} unshared derivative files removed.`);
