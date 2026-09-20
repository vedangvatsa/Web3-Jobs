import { promises as fs } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import sharp from 'sharp';

const MAX_WIDTH = 1600;
const MAX_HEIGHT = 900;
const WEBP_OPTIONS = { quality: 76, effort: 5 } as const;
const STATIC_RASTER_FORMATS = new Set(['avif', 'jpeg', 'png', 'webp']);
const REFERENCE_FILES = ['content/events/sources/events-cache.json', 'content/events/sources/curated-events.json'];
const MANIFEST_PATH = 'content/event-cover-optimization.json';

type PlannedChange = {
  sourcePath: string;
  targetPath: string;
  sourceBytes: number;
  targetBytes: number;
  resized: boolean;
  buffer: Buffer;
};

type OptimizationManifest = {
  version: 1;
  files: Record<string, string>;
};

async function listFiles(directory: string): Promise<string[]> {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const entryPath = path.join(directory, entry.name);
      return entry.isDirectory() ? listFiles(entryPath) : entry.isFile() ? [entryPath] : [];
    }),
  );
  return files.flat().sort();
}

function eventUrl(root: string, filePath: string): string {
  return `/events/${path.relative(root, filePath).split(path.sep).join('/')}`;
}

function hashFile(filePath: string): Promise<string> {
  return fs.readFile(filePath).then((buffer) => createHash('sha256').update(buffer).digest('hex'));
}

async function readManifest(): Promise<OptimizationManifest> {
  try {
    const manifest = JSON.parse(await fs.readFile(MANIFEST_PATH, 'utf8')) as OptimizationManifest;
    return manifest.version === 1 && manifest.files ? manifest : { version: 1, files: {} };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return { version: 1, files: {} };
    throw error;
  }
}

async function writeManifest(root: string, filePaths: Set<string>, dryRun: boolean): Promise<void> {
  if (dryRun) return;
  const files = Object.fromEntries(
    await Promise.all(
      [...filePaths]
        .sort()
        .map(async (filePath) => [eventUrl(root, filePath), await hashFile(filePath)]),
    ),
  );
  const nextContent = `${JSON.stringify({ version: 1, files }, null, 2)}\n`;
  try {
    if (await fs.readFile(MANIFEST_PATH, 'utf8') === nextContent) return;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
  }
  await fs.writeFile(MANIFEST_PATH, nextContent);
}

async function updateReferences(replacements: Map<string, string>, dryRun: boolean): Promise<number> {
  if (replacements.size === 0) return 0;

  let changedFiles = 0;
  for (const relativePath of REFERENCE_FILES) {
    const filePath = path.resolve(relativePath);
    let content: string;
    try {
      content = await fs.readFile(filePath, 'utf8');
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') continue;
      throw error;
    }

    let updated = content;
    for (const [source, target] of replacements) {
      updated = updated.replaceAll(`"${source}"`, `"${target}"`);
    }

    if (updated !== content) {
      changedFiles++;
      if (!dryRun) await fs.writeFile(filePath, updated);
    }
  }
  return changedFiles;
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const unknownArgs = process.argv.slice(2).filter((argument) => argument !== '--dry-run');
  if (unknownArgs.length > 0) throw new Error(`Unknown argument(s): ${unknownArgs.join(', ')}`);

  const root = path.resolve('public/events');
  const files = await listFiles(root);
  const manifest = await readManifest();
  const changes: PlannedChange[] = [];
  const skipped = { gif: [] as string[], svg: [] as string[], animated: [] as string[], unsupported: [] as string[], conflicts: [] as string[] };
  const trackedPaths = new Set<string>();
  let alreadyOptimized = 0;
  let eligible = 0;
  let retained = 0;

  for (const sourcePath of files) {
    const relativePath = path.relative(root, sourcePath).split(path.sep).join('/');
    const extension = path.extname(sourcePath).toLowerCase();
    if (extension === '.gif') {
      skipped.gif.push(relativePath);
      continue;
    }
    if (extension === '.svg') {
      skipped.svg.push(relativePath);
      continue;
    }

    let metadata: sharp.Metadata;
    try {
      metadata = await sharp(sourcePath, { animated: true }).metadata();
    } catch {
      skipped.unsupported.push(relativePath);
      continue;
    }

    if (metadata.pages && metadata.pages > 1) {
      skipped.animated.push(relativePath);
      continue;
    }
    if (!metadata.format || !STATIC_RASTER_FORMATS.has(metadata.format) || !metadata.width || !metadata.height) {
      skipped.unsupported.push(relativePath);
      continue;
    }

    eligible++;
    const sourceUrl = eventUrl(root, sourcePath);
    if (manifest.files[sourceUrl] === await hashFile(sourcePath)) {
      alreadyOptimized++;
      trackedPaths.add(sourcePath);
      continue;
    }
    const targetPath = metadata.format === 'webp'
      ? sourcePath
      : path.join(path.dirname(sourcePath), `${path.basename(sourcePath, extension)}.webp`);
    if (targetPath !== sourcePath) {
      try {
        await fs.access(targetPath);
        skipped.conflicts.push(relativePath);
        continue;
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
      }
    }

    const sourceBytes = (await fs.stat(sourcePath)).size;
    const resized = metadata.width > MAX_WIDTH || metadata.height > MAX_HEIGHT;
    let pipeline = sharp(sourcePath).rotate();
    if (resized) {
      pipeline = pipeline.resize({ width: MAX_WIDTH, height: MAX_HEIGHT, fit: 'inside', withoutEnlargement: true });
    }
    const buffer = await pipeline.webp(WEBP_OPTIONS).toBuffer();
    if (buffer.length >= sourceBytes) {
      retained++;
      trackedPaths.add(sourcePath);
      continue;
    }
    changes.push({ sourcePath, targetPath, sourceBytes, targetBytes: buffer.length, resized, buffer });
    trackedPaths.add(targetPath);
  }

  const replacements = new Map(
    changes
      .filter((change) => change.sourcePath !== change.targetPath)
      .map((change) => [eventUrl(root, change.sourcePath), eventUrl(root, change.targetPath)]),
  );

  if (!dryRun) {
    for (const change of changes) {
      const temporaryPath = `${change.targetPath}.tmp`;
      await fs.writeFile(temporaryPath, change.buffer);
      await fs.rename(temporaryPath, change.targetPath);
    }
  }
  const referenceFilesChanged = await updateReferences(replacements, dryRun);
  if (!dryRun) {
    for (const change of changes) {
      if (change.sourcePath !== change.targetPath) await fs.unlink(change.sourcePath);
    }
    await writeManifest(root, trackedPaths, false);
  }

  const originalBytes = changes.reduce((total, change) => total + change.sourceBytes, 0);
  const optimizedBytes = changes.reduce((total, change) => total + change.targetBytes, 0);
  console.log(JSON.stringify({
    mode: dryRun ? 'dry-run' : 'write',
    scanned: files.length,
    eligible,
    changed: changes.length,
    resized: changes.filter((change) => change.resized).length,
    convertedToWebp: changes.filter((change) => change.sourcePath !== change.targetPath).length,
    retained,
    alreadyOptimized,
    originalBytes,
    optimizedBytes,
    bytesSaved: originalBytes - optimizedBytes,
    referenceFilesChanged,
    skipped,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
