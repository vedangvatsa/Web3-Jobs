import fs from 'node:fs';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import cities from '../content/nomads/cities.json';

async function main() {
  const manifest: Record<string, { base: string; width: number; height: number }> = {};
  const directory = 'public/images/nomads/display';
  fs.mkdirSync(directory, { recursive: true });
  let written = 0;
  for (const city of cities) {
    if (!city.image) continue;
    const source = fs.readFileSync(`public${city.image}`);
    const fingerprint = createHash('sha256').update(source).update('nomad-display-v1-16x10-q76-effort6').digest('hex').slice(0, 16);
    const info = await sharp(source).metadata();
    if (!info.width || !info.height) throw new Error(`Invalid city image: ${city.slug}`);
    const width = Math.floor(Math.min(1024, info.width, info.height * 1.6) / 16) * 16;
    if (width < 480) throw new Error(`City image too small: ${city.slug}`);
    const base = `/images/nomads/display/${city.slug}-${fingerprint}`;
    manifest[city.image] = { base, width, height: width * 10 / 16 };
    for (const size of new Set([480, width])) {
      const target = `public${base}-${size}.webp`;
      if (fs.existsSync(target)) continue;
      const buffer = await sharp(source).rotate().resize(size, size * 10 / 16, { fit: 'cover', withoutEnlargement: true }).webp({ quality: 76, effort: 6 }).toBuffer();
      fs.writeFileSync(target, buffer);
      written++;
    }
  }
  fs.writeFileSync('content/nomad-display-images.json', `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`City display images: ${written} written, ${Object.keys(manifest).length} cities. Originals preserved.`);
}
main().catch(error => { console.error(error); process.exitCode = 1; });
