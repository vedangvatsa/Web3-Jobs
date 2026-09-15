import { readFileSync, readdirSync, statSync, unlinkSync, writeFileSync } from 'fs';
import path from 'path';
import sharp from 'sharp';

const POPUPS_DIR = path.join(process.cwd(), 'public/popups');
const POPUPS_TS = path.join(process.cwd(), 'src/lib/popups.ts');
const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp']);

const MAX_COVER_WIDTH = 1200;
const MAX_LOGO_WIDTH = 384;
const WEBP_QUALITY = 70;
const JPEG_QUALITY = 72;

type Stats = { files: number; saved: number; before: number; after: number };

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

function isLogoFile(filePath: string): boolean {
  return /logo/i.test(path.basename(filePath));
}

function toWebPath(fsPath: string): string {
  return `/${path.relative(path.join(process.cwd(), 'public'), fsPath).split(path.sep).join('/')}`;
}

function applyPathRenames(renames: Map<string, string>) {
  if (!renames.size || !statSync(POPUPS_TS, { throwIfNoEntry: false })) return;
  let text = readFileSync(POPUPS_TS, 'utf8');
  for (const [from, to] of renames) {
    text = text.split(from).join(to);
  }
  writeFileSync(POPUPS_TS, text);
}

async function compressFile(
  filePath: string,
): Promise<{ before: number; after: number; renamed?: { from: string; to: string } } | null> {
  const ext = path.extname(filePath).toLowerCase();
  if (!IMAGE_EXT.has(ext)) return null;

  const before = statSync(filePath).size;
  const logo = isLogoFile(filePath);
  const maxWidth = logo ? MAX_LOGO_WIDTH : MAX_COVER_WIDTH;

  let pipeline = sharp(filePath, { failOn: 'none' }).rotate();
  const meta = await pipeline.metadata();
  if (meta.width && meta.width > maxWidth) {
    pipeline = pipeline.resize({ width: maxWidth, withoutEnlargement: true });
  }

  if (logo) {
    let out: Buffer;
    if (ext === '.webp') {
      out = await pipeline.webp({ quality: WEBP_QUALITY, effort: 4 }).toBuffer();
    } else if (ext === '.png') {
      out = await pipeline
        .png({
          compressionLevel: 9,
          palette: (meta.width ?? 0) <= 512,
        })
        .toBuffer();
    } else {
      out = await pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toBuffer();
    }
    if (out.length >= before) return null;
    writeFileSync(filePath, out);
    return { before, after: out.length };
  }

  const out = await pipeline.webp({ quality: WEBP_QUALITY, effort: 4 }).toBuffer();
  const webpPath = filePath.replace(/\.(jpe?g|png)$/i, '.webp');
  const targetPath = ext === '.webp' ? filePath : webpPath;

  if (out.length >= before && ext === '.webp') return null;

  writeFileSync(targetPath, out);
  if (targetPath !== filePath) {
    unlinkSync(filePath);
    return {
      before,
      after: out.length,
      renamed: { from: toWebPath(filePath), to: toWebPath(targetPath) },
    };
  }
  if (out.length >= before) return null;
  return { before, after: out.length };
}

async function main() {
  const stats: Stats = { files: 0, saved: 0, before: 0, after: 0 };
  const renames = new Map<string, string>();
  const files = walk(POPUPS_DIR).filter((f) => IMAGE_EXT.has(path.extname(f).toLowerCase()));

  for (const file of files) {
    const result = await compressFile(file);
    if (!result) continue;
    stats.files += 1;
    stats.saved += result.before - result.after;
    stats.before += result.before;
    stats.after += result.after;
    if (result.renamed) renames.set(result.renamed.from, result.renamed.to);
  }

  applyPathRenames(renames);

  const mib = (n: number) => (n / 1024 / 1024).toFixed(1);
  console.log(
    `Compressed ${stats.files} files: ${mib(stats.before)} MiB → ${mib(stats.after)} MiB (saved ${mib(stats.saved)} MiB)`,
  );
  if (renames.size) console.log(`Updated ${renames.size} paths in src/lib/popups.ts (JPEG/PNG → WebP)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
