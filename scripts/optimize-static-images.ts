import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve('public');
const MANIFEST_PATH = path.resolve('content/static-image-optimization.json');
const WEBP_OPTIONS = { quality: 76, effort: 5 } as const;
const WEBP_CAPS = {
  images: { width: 1920, height: 1920 },
  logo: { width: 1024, height: 1024 },
  root: { width: 1920, height: 1920 },
} as const;

type Category = keyof typeof WEBP_CAPS;
type SupportedExtension = '.jpg' | '.jpeg' | '.png' | '.webp';
type ManifestEntry = {
  sha256: string;
  status: 'optimized' | 'retained';
};
type Manifest = {
  version: 1;
  files: Record<string, ManifestEntry>;
};
type Change = {
  path: string;
  relativePath: string;
  sourceBytes: number;
  targetBytes: number;
  resized: boolean;
  repairedMismatch: boolean;
  buffer: Buffer;
};
type Skipped = {
  avif: string[];
  gif: string[];
  ico: string[];
  svg: string[];
  animated: string[];
  malformed: string[];
  unsupported: string[];
  mismatchUnrepaired: string[];
  mismatchRetained: string[];
  notSmaller: string[];
};

function extensionFormat(extension: SupportedExtension): 'jpeg' | 'png' | 'webp' {
  if (extension === '.jpg' || extension === '.jpeg') return 'jpeg';
  return extension.slice(1) as 'png' | 'webp';
}

function isSupportedExtension(extension: string): extension is SupportedExtension {
  return extension === '.jpg' || extension === '.jpeg' || extension === '.png' || extension === '.webp';
}

function categoryFor(filePath: string): Category {
  const relativePath = path.relative(ROOT, filePath);
  if (relativePath.startsWith(`images${path.sep}`)) return 'images';
  if (relativePath.startsWith(`logo${path.sep}`)) return 'logo';
  return 'root';
}

function publicPath(filePath: string): string {
  return `/${path.relative(ROOT, filePath).split(path.sep).join('/')}`;
}

async function listFiles(directory: string): Promise<string[]> {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map((entry) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory() ? listFiles(entryPath) : entry.isFile() ? [entryPath] : [];
  }));
  return files.flat();
}

async function listScopedFiles(): Promise<string[]> {
  const [images, logo, rootEntries] = await Promise.all([
    listFiles(path.join(ROOT, 'images')),
    listFiles(path.join(ROOT, 'logo')),
    fs.readdir(ROOT, { withFileTypes: true }),
  ]);
  const rootFiles = rootEntries.filter((entry) => entry.isFile()).map((entry) => path.join(ROOT, entry.name));
  return [...images, ...logo, ...rootFiles].sort();
}

function hashFile(filePath: string): Promise<string> {
  return fs.readFile(filePath).then((buffer) => createHash('sha256').update(buffer).digest('hex'));
}

async function readManifest(): Promise<Manifest> {
  try {
    const manifest = JSON.parse(await fs.readFile(MANIFEST_PATH, 'utf8')) as Manifest;
    return manifest.version === 1 && manifest.files ? manifest : { version: 1, files: {} };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return { version: 1, files: {} };
    throw error;
  }
}

async function writeAtomically(filePath: string, content: Buffer | string): Promise<void> {
  const temporaryPath = `${filePath}.${process.pid}.tmp`;
  await fs.writeFile(temporaryPath, content);
  await fs.rename(temporaryPath, filePath);
}

async function writeManifest(entries: Record<string, ManifestEntry>): Promise<void> {
  const content = `${JSON.stringify({ version: 1, files: entries }, null, 2)}\n`;
  try {
    if (await fs.readFile(MANIFEST_PATH, 'utf8') === content) return;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
  }
  await writeAtomically(MANIFEST_PATH, content);
}

function initialSkipped(): Skipped {
  return {
    avif: [], gif: [], ico: [], svg: [], animated: [], malformed: [], unsupported: [], mismatchUnrepaired: [], mismatchRetained: [], notSmaller: [],
  };
}

async function createCandidate(sourcePath: string, extension: SupportedExtension, category: Category): Promise<{ buffer: Buffer; resized: boolean }> {
  const metadata = await sharp(sourcePath, { animated: false }).metadata();
  const cap = WEBP_CAPS[category];
  const resized = extension === '.webp' && Boolean(metadata.width && metadata.height && (metadata.width > cap.width || metadata.height > cap.height));
  let pipeline = sharp(sourcePath, { animated: false }).rotate();
  if (resized) {
    pipeline = pipeline.resize({ width: cap.width, height: cap.height, fit: 'inside', withoutEnlargement: true });
  }
  if (extension === '.png') {
    return { buffer: await pipeline.withMetadata().png({ compressionLevel: 9, adaptiveFiltering: true }).toBuffer(), resized };
  }
  if (extension === '.webp') {
    return { buffer: await pipeline.webp(WEBP_OPTIONS).toBuffer(), resized };
  }
  return { buffer: await pipeline.jpeg({ quality: 82, mozjpeg: true }).toBuffer(), resized };
}

async function outputMatchesExtension(buffer: Buffer, extension: SupportedExtension): Promise<boolean> {
  const metadata = await sharp(buffer, { animated: false }).metadata();
  return metadata.format === extensionFormat(extension) && Boolean(metadata.width && metadata.height) && !(metadata.pages && metadata.pages > 1);
}

async function main(): Promise<void> {
  const dryRun = process.argv.includes('--dry-run');
  const unknownArgs = process.argv.slice(2).filter((argument) => argument !== '--dry-run');
  if (unknownArgs.length > 0) throw new Error(`Unknown argument(s): ${unknownArgs.join(', ')}`);

  const [files, manifest] = await Promise.all([listScopedFiles(), readManifest()]);
  const changes: Change[] = [];
  const skipped = initialSkipped();
  const manifestEntries: Record<string, ManifestEntry> = {};
  let eligible = 0;
  let alreadyOptimized = 0;
  let retained = 0;

  for (const filePath of files) {
    const relativePath = publicPath(filePath);
    const extension = path.extname(filePath).toLowerCase();
    if (extension === '.avif') { skipped.avif.push(relativePath); continue; }
    if (extension === '.gif') { skipped.gif.push(relativePath); continue; }
    if (extension === '.ico') { skipped.ico.push(relativePath); continue; }
    if (extension === '.svg') { skipped.svg.push(relativePath); continue; }
    if (!isSupportedExtension(extension)) { skipped.unsupported.push(relativePath); continue; }

    let metadata: sharp.Metadata;
    try {
      metadata = await sharp(filePath, { animated: true }).metadata();
    } catch {
      skipped.malformed.push(relativePath);
      continue;
    }
    if (metadata.pages && metadata.pages > 1) { skipped.animated.push(relativePath); continue; }
    if (!metadata.format || !metadata.width || !metadata.height) { skipped.malformed.push(relativePath); continue; }
    if (metadata.format === 'gif' || metadata.format === 'heif') { skipped.unsupported.push(relativePath); continue; }
    if (!['jpeg', 'png', 'webp'].includes(metadata.format)) { skipped.mismatchUnrepaired.push(relativePath); continue; }

    eligible++;
    const sourceHash = await hashFile(filePath);
    const previous = manifest.files[relativePath];
    if (previous?.sha256 === sourceHash) {
      alreadyOptimized++;
      manifestEntries[relativePath] = previous;
      continue;
    }

    const repairedMismatch = metadata.format !== extensionFormat(extension);
    let candidate: { buffer: Buffer; resized: boolean };
    try {
      candidate = await createCandidate(filePath, extension, categoryFor(filePath));
      if (!await outputMatchesExtension(candidate.buffer, extension)) {
        skipped.mismatchUnrepaired.push(relativePath);
        continue;
      }
    } catch {
      skipped.malformed.push(relativePath);
      continue;
    }

    const sourceBytes = (await fs.stat(filePath)).size;
    if (candidate.buffer.length >= sourceBytes) {
      retained++;
      if (repairedMismatch) skipped.mismatchRetained.push(relativePath);
      skipped.notSmaller.push(relativePath);
      manifestEntries[relativePath] = { sha256: sourceHash, status: 'retained' };
      continue;
    }
    changes.push({
      path: filePath,
      relativePath,
      sourceBytes,
      targetBytes: candidate.buffer.length,
      resized: candidate.resized,
      repairedMismatch,
      buffer: candidate.buffer,
    });
  }

  if (!dryRun) {
    for (const change of changes) {
      await writeAtomically(change.path, change.buffer);
      const output = await fs.readFile(change.path);
      if (!await outputMatchesExtension(output, path.extname(change.path).toLowerCase() as SupportedExtension)) {
        throw new Error(`Atomic replacement validation failed for ${change.relativePath}`);
      }
      manifestEntries[change.relativePath] = { sha256: await hashFile(change.path), status: 'optimized' };
    }
    await writeManifest(manifestEntries);
  }

  const originalBytes = changes.reduce((total, change) => total + change.sourceBytes, 0);
  const optimizedBytes = changes.reduce((total, change) => total + change.targetBytes, 0);
  console.log(JSON.stringify({
    mode: dryRun ? 'dry-run' : 'write',
    scanned: files.length,
    eligible,
    changed: changes.length,
    resized: changes.filter((change) => change.resized).length,
    repairedMismatch: changes.filter((change) => change.repairedMismatch).length,
    retained,
    alreadyOptimized,
    originalBytes,
    optimizedBytes,
    bytesSaved: originalBytes - optimizedBytes,
    changedFiles: changes.map((change) => change.relativePath),
    skipped,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
