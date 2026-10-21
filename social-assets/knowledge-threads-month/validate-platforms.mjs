import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { unzipSync, strFromU8 } from 'fflate';
import { loadCarouselSources, validateCarouselManifest, inspectCarouselExport } from '../../scripts/social/newknowledge-carousel-publisher.mjs';
import { carouselCaptionUnits } from '../../scripts/social/newknowledge-carousel-providers.mjs';
import { sha256 } from '../../scripts/social/newknowledge-content.mjs';

const repo = fileURLToPath(new URL('../../', import.meta.url));
const directory = 'social-assets/knowledge-threads-month';
const bundle = await loadCarouselSources(repo);
validateCarouselManifest(bundle);
const work = path.join(repo, '.cache/cross-platform-2026-10-21/pdf-checks');
await fs.mkdir(work, { recursive: true });
const records = [];
for (const entry of bundle.manifest.threads) {
  for (const platform of ['linkedin', 'instagram']) await inspectCarouselExport(repo, bundle, entry, platform);
  const pdf = path.join(repo, entry.linkedin.pdf.path);
  const info = execFileSync('pdfinfo', [pdf], { encoding: 'utf8' });
  assert.match(info, /Pages:\s+6\b/);
  assert.match(info, /Page size:\s+600 x 750 pts/);
  assert.match(info, /Encrypted:\s+no/);
  assert.match(info, /JavaScript:\s+no/);
  const prefix = path.join(work, entry.id);
  execFileSync('pdfimages', ['-j', pdf, prefix]);
  const extracted = (await fs.readdir(work)).filter(name => name.startsWith(`${entry.id}-`) && name.endsWith('.jpg')).sort();
  assert.equal(extracted.length, 6);
  for (const [index, name] of extracted.entries()) assert.equal(sha256(await fs.readFile(path.join(work, name))), entry.sourceImages[index].sha256, `${entry.id}: PDF image order or pixels changed`);
  const zipped = unzipSync(new Uint8Array(await fs.readFile(path.join(repo, entry.instagram.pack.path))));
  assert.deepEqual(Object.keys(zipped).sort(), ['01.jpg', '02.jpg', '03.jpg', '04.jpg', '05.jpg', '06.jpg', 'alt-text.json', 'caption.txt'].sort());
  assert.equal(strFromU8(zipped['caption.txt']).trim(), entry.instagram.caption);
  const alts = JSON.parse(strFromU8(zipped['alt-text.json']));
  for (const [index, image] of entry.instagram.images.entries()) {
    const name = `${String(index + 1).padStart(2, '0')}.jpg`;
    assert.equal(sha256(zipped[name]), image.sha256);
    assert.equal(alts[index].file, name);
    assert.equal(alts[index].alt, image.alt);
    const corner = await sharp(zipped[name]).extract({ left: 0, top: 0, width: 1, height: 1 }).removeAlpha().raw().toBuffer();
    assert.ok(corner.every(channel => channel >= 253), `${entry.id}: non-white Instagram background`);
  }
  records.push({ id: entry.id, pages: 6, originalPdfImagesVerified: 6, instagramImages: 6, zipEntries: 8, linkedinUnits: carouselCaptionUnits(entry.linkedin.caption, 'linkedin'), instagramUnits: carouselCaptionUnits(entry.instagram.caption, 'instagram') });
}
for (const id of ['C02', 'E02', 'N03', 'C05', 'N06', 'N10']) {
  const entry = bundle.manifest.threads.find(thread => thread.id === id);
  execFileSync('pdftoppm', ['-f', '1', '-singlefile', '-scale-to-x', '390', '-scale-to-y', '488', '-png', path.join(repo, entry.linkedin.pdf.path), path.join(work, `${id}-preview`)]);
}
const report = { checkedAt: new Date().toISOString(), sourceContentSha256: bundle.manifest.sourceContentSha256, documents: records.length, totalPages: records.length * 6, embeddedOriginalImagesVerified: records.length * 6, instagramImages: records.length * 6, imagePacks: records.length, maxInstagramCaptionUnits: Math.max(...records.map(record => record.instagramUnits)), records };
await fs.writeFile(path.join(repo, directory, 'exports/validation.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ ...report, records: undefined }, null, 2));
