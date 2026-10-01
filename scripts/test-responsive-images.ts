import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import sharp, { type Metadata } from 'sharp';
import type { ResponsiveImagePlan } from '../src/lib/responsive-images';

type Entry = ResponsiveImagePlan & { files: string[]; losslessFull?: string };
const manifest = JSON.parse(fs.readFileSync('content/responsive-images.json', 'utf8')) as Record<string, Entry>;
const metadata = new Map<string, Metadata>();
async function inspect(url: string) {
  const file = path.join('public', url);
  assert.ok(fs.existsSync(file), `Missing responsive image ${url}`);
  if (!metadata.has(url)) metadata.set(url, await sharp(file).metadata());
  return metadata.get(url)!;
}
async function main() {
  let losslessChecks = 0;
  for (const [source, entry] of Object.entries(manifest)) {
    assert.ok(fs.existsSync(path.join('public', source)), `Missing original ${source}`);
    for (const srcSet of [entry.srcSet, entry.webpSrcSet, entry.avifSrcSet].filter(Boolean) as string[]) {
      const widths: number[] = [];
      for (const item of srcSet.split(',')) {
        const match = item.trim().match(/^(\S+) (\d+)w$/);
        assert.ok(match, `Invalid descriptor: ${item}`);
        const meta = await inspect(match[1]);
        const width = Number(match[2]);
        assert.equal(meta.autoOrient?.width || meta.width, width, `Incorrect srcset width: ${match[1]}`);
        assert.ok(width <= entry.width, `Upscaled ${source}`);
        widths.push(width);
      }
      assert.equal(Math.max(...widths), entry.width, `Missing full-resolution fallback: ${source}`);
      assert.equal(new Set(widths).size, widths.length, 'Duplicate widths');
    }
    for (const file of entry.files) {
      const meta = await inspect(file);
      const format = meta.format === 'heif' && meta.compression === 'av1' ? 'avif' : meta.format;
      assert.equal(path.extname(file).slice(1).replace('jpg', 'jpeg'), format, `Wrong MIME extension: ${file}`);
      assert.ok(!meta.pages || meta.pages === 1, 'Unexpected animation change');
    }
    if (entry.losslessFull) {
      const a = await sharp(path.join('public', source)).rotate().toColourspace('srgb').ensureAlpha().raw().toBuffer();
      const b = await sharp(path.join('public', entry.losslessFull)).toColourspace('srgb').ensureAlpha().raw().toBuffer();
      assert.equal(a.length, b.length);
      if (!a.equals(b)) {
        let identical = true;
        for (let i = 0; i < a.length && identical; i += 4) {
          identical = a[i + 3] === b[i + 3] && (!a[i + 3] || (a[i] === b[i] && a[i + 1] === b[i + 1] && a[i + 2] === b[i + 2]));
        }
        assert.ok(identical, `${source}: visible pixels changed`);
      }
      losslessChecks++;
    }
  }
  assert.equal('/events/ethlisbon.gif' in manifest, false, 'Do not flatten native animations');
  console.log(`Responsive images passed: ${Object.keys(manifest).length} sources, ${metadata.size} assets, ${losslessChecks} pixel-identical visible lossless conversions, full-resolution fallbacks preserved.`);
}
main().catch(error => { console.error(error); process.exitCode = 1; });
