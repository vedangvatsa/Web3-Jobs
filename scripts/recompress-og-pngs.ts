/**
 * Re-palette existing OG PNGs on disk (no Satori regen).
 * Fixes legacy files where sharp failed once and full RGBA resvg bytes were saved.
 */
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';
import { compressOgPng } from './lib/og-png-compress';

const ROOT = process.cwd();
const DIRS = [
  path.join(ROOT, 'public', 'og', 'jobs'),
  path.join(ROOT, 'public', 'og', 'companies'),
];

const DRY = process.argv.includes('--dry-run');
const MIN_SAVE = 512;

async function recompressFile(file: string): Promise<{ before: number; after: number } | null> {
  const before = fs.statSync(file).size;
  if (before < 20_000) return null;

  const input = fs.readFileSync(file);
  const meta = await sharp(input).metadata();
  const isTruecolor = meta.channels === 4 || !meta.palette;

  if (!isTruecolor && before <= 16_000) return null;

  const afterBuf = await compressOgPng(input);
  const after = afterBuf.length;
  if (after >= before - MIN_SAVE) return null;

  if (!DRY) fs.writeFileSync(file, afterBuf);
  return { before, after };
}

async function main(): Promise<void> {
  let touched = 0;
  let saved = 0;

  for (const dir of DIRS) {
    if (!fs.existsSync(dir)) continue;
    for (const name of fs.readdirSync(dir)) {
      if (!name.endsWith('.png')) continue;
      const file = path.join(dir, name);
      const result = await recompressFile(file);
      if (!result) continue;
      touched += 1;
      saved += result.before - result.after;
    }
  }

  console.log(
    `[recompress-og-pngs] ${DRY ? 'would update' : 'updated'} ${touched} PNG(s), saved ${(saved / 1024 / 1024).toFixed(1)} MiB`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
