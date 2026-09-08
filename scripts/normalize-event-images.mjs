import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import os from 'os';
import { execFileSync } from 'child_process';
import sharp from 'sharp';

const eventsDir = path.resolve('public/events');
const dirs = { cache: 'content/events-cache.json', curated: 'content/curated-events.json' };

function magicOf(file) {
  const b = fs.readFileSync(file);
  if (b.length < 12) return 'tiny';
  const hex = b.subarray(0, 12).toString('hex');
  if (hex.startsWith('52494646') && /57454250/.test(b.subarray(8, 12).toString('hex'))) return 'webp';
  if (hex.startsWith('89504e47')) return 'png';
  if (hex.startsWith('47494638')) return 'gif';
  if (hex.startsWith('ffd8ff')) return 'jpeg';
  if (b.subarray(4, 8).toString('ascii') === 'ftyp') {
    const brand = b.subarray(8, 12).toString('ascii');
    if (/avif|avis|mif1|heic|heix|mif2|hevc/.test(brand)) return brand;
    return 'bmff-other';
  }
  return 'other';
}

// Decode any raster (incl. AVIF/HEIC that sharp/libvips cannot) to a PNG temp
// using macOS sips, then re-encode to WebP with sharp. Returns WebP buffer|null.
async function toWebp(file, quality = 76) {
  const sig = magicOf(file);
  if (sig === 'tiny' || sig == null) return null;
  if (sig === 'webp') return fs.readFileSync(file);
  const tmp = path.join(os.tmpdir(), `evt-${crypto.randomBytes(6).toString('hex')}.png`);
  try {
    // animated GIF: keep as-is so containers serve real .gif
    if (sig === 'gif') return fs.readFileSync(file);
    execFileSync('/usr/bin/sips', ['-s', 'format', 'png', file, '--out', tmp], { stdio: 'pipe' });
    return await sharp(tmp, { density: 96 })
      .rotate()
      .resize({ width: 1600, height: 900, fit: 'cover', withoutEnlargement: true })
      .webp({ quality, alphaQuality: 85 })
      .toBuffer();
  } catch (e) {
    return null;
  } finally {
    try { fs.unlinkSync(tmp); } catch { /* ignore */ }
  }
}

async function main() {
  const files = fs.readdirSync(eventsDir);
  const byStem = new Map();
  for (const f of files) {
    if (f.startsWith('.')) continue;
    const ext = path.extname(f).toLowerCase();
    if (!/\.(png|jpe?g|webp|gif|avif|heic)$/.test(f)) continue;
    const stem = f.slice(0, f.length - ext.length);
    if (!byStem.has(stem)) byStem.set(stem, []);
    byStem.get(stem).push(f);
  }

  let converted = 0;
  let keptWebp = 0;
  let deleted = 0;
  const failed = [];
  const finalExt = new Map();

  for (const [stem, group] of byStem) {
    const full = group.map((f) => path.join(eventsDir, f));
    const anyWebp = full.find((f) => magicOf(f) === 'webp');
    let keep;
    if (anyWebp) {
      keep = path.basename(anyWebp);
      keptWebp++;
    } else {
      const src = full.slice().sort((a, b) => fs.statSync(a).size - fs.statSync(b).size)[0];
      const buf = await toWebp(src);
      if (buf && buf.length > 300) {
        const dest = path.join(eventsDir, `${stem}.webp`);
        fs.writeFileSync(dest, buf);
        keep = path.basename(dest);
        keptWebp++;
        converted++;
      } else {
        failed.push(stem);
        keep = group[0];
      }
    }
    finalExt.set(stem, path.extname(keep).slice(1));
    for (const f of full) {
      if (path.basename(f) !== keep) {
        fs.unlinkSync(f);
        deleted++;
      }
    }
  }

  // ---- Repoint JSON refs to real filenames ----
  function fixJson(filePath) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const arr = Array.isArray(data) ? data : data.events;
    let changed = 0;
    for (const e of arr) {
      if (!e.coverImage || !e.coverImage.startsWith('/events/')) continue;
      const name = path.basename(e.coverImage);
      const ext = path.extname(name);
      const stem = name.slice(0, name.length - ext.length);
      const fext = finalExt.get(stem);
      if (!fext) continue;
      const want = `/events/${stem}.${fext}`;
      if (want !== e.coverImage) {
        e.coverImage = want;
        changed++;
      }
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
    return changed;
  }

  const changedCache = fixJson(dirs.cache);
  const changedCurated = fixJson(dirs.curated);

  let total = 0;
  for (const f of fs.readdirSync(eventsDir)) {
    if (!f.startsWith('.')) total += fs.statSync(path.join(eventsDir, f)).size;
  }

  console.log(JSON.stringify({
    stems: byStem.size,
    beforeFiles: files.length,
    afterFiles: fs.readdirSync(eventsDir).filter((f) => !f.startsWith('.')).length,
    convertedToWebp: converted,
    keptExistingWebp: keptWebp,
    deletedDuplicates: deleted,
    jsonCacheRefsChanged: changedCache,
    jsonCuratedRefsChanged: changedCurated,
    finalBytes: total,
    finalMB: (total / 1048576).toFixed(1),
    failures: failed.slice(0, 10),
    failureCount: failed.length,
  }, null, 2));
}

main().catch((e) => { console.error(e); process.exit(1); });