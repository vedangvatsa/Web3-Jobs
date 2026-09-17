/**
 * compress-news-image.mjs — compress a downloaded hero to repo standard.
 * Usage: node scripts/compress-news-image.mjs <src-tmp> <slug>
 * Output: public/images/news/<slug>.jpg (1920px max, JPEG q78 mozjpeg;
 * falls back to q75/1600px if still over 350KB).
 */
import sharp from 'sharp';
import fs from 'fs';

const [src, slug] = process.argv.slice(2);
if (!src || !slug || !fs.existsSync(src)) {
  console.error('Usage: node scripts/compress-news-image.mjs <src-tmp> <slug>');
  process.exit(1);
}
const dest = new URL(`../public/images/news/${slug}.jpg`, import.meta.url).pathname;

async function build(width, quality) {
  const tmp = `${dest}.opt`;
  await sharp(src).rotate().resize({ width, withoutEnlargement: true }).jpeg({ quality, mozjpeg: true }).toFile(tmp);
  return tmp;
}

let tmp = await build(1920, 78);
if (fs.statSync(tmp).size > 350_000) {
  fs.unlinkSync(tmp);
  tmp = await build(1600, 75);
}
fs.renameSync(tmp, dest);
console.log(`${slug}.jpg: ${Math.round(fs.statSync(dest).size / 1024)}KB`);
