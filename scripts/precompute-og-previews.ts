import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import {
  buildOgPreviewHtml,
  collectOgPreviewPaths,
  previewAssetPath,
  resolveOgPreviewMeta,
} from '../src/lib/og-preview';

const OUT_ROOT = path.join(process.cwd(), 'public', 'preview');
const MANIFEST_PATH = path.join(OUT_ROOT, '.preview-manifest.json');
const FULL_REBUILD = process.argv.includes('--full');

type PreviewManifest = Record<string, string>;

function sha(input: string): string {
  return crypto.createHash('sha1').update(input).digest('hex').slice(0, 16);
}

function loadManifest(): PreviewManifest {
  try {
    return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8')) as PreviewManifest;
  } catch {
    return {};
  }
}

function saveManifest(manifest: PreviewManifest): void {
  fs.mkdirSync(OUT_ROOT, { recursive: true });
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest), 'utf8');
}

async function main() {
  if (FULL_REBUILD && fs.existsSync(OUT_ROOT)) {
    for (const entry of fs.readdirSync(OUT_ROOT)) {
      if (entry === '.preview-manifest.json') continue;
      fs.rmSync(path.join(OUT_ROOT, entry), { recursive: true, force: true, maxRetries: 5, retryDelay: 150 });
    }
  } else {
    fs.mkdirSync(OUT_ROOT, { recursive: true });
  }

  const paths = await collectOgPreviewPaths();
  const manifest = FULL_REBUILD ? {} : loadManifest();
  let written = 0;
  let skipped = 0;
  const livePaths = new Set<string>();

  for (const contentPath of paths) {
    livePaths.add(contentPath);
    const meta = await resolveOgPreviewMeta(contentPath);
    const fingerprint = sha(JSON.stringify(meta));
    const asset = previewAssetPath(contentPath);
    const outFile = path.join(process.cwd(), 'public', asset.replace(/^\//, ''));
    const manifestKey = contentPath || '/';

    if (!FULL_REBUILD && manifest[manifestKey] === fingerprint && fs.existsSync(outFile)) {
      skipped += 1;
      continue;
    }

    const html = buildOgPreviewHtml(meta);
    fs.mkdirSync(path.dirname(outFile), { recursive: true });
    fs.writeFileSync(outFile, html, 'utf8');
    manifest[manifestKey] = fingerprint;
    written += 1;
  }

  for (const key of Object.keys(manifest)) {
    if (key.startsWith('__')) continue;
    if (livePaths.has(key)) continue;
    delete manifest[key];
  }

  const fallbackMeta = await resolveOgPreviewMeta('/');
  const fallbackFp = sha(JSON.stringify(fallbackMeta));
  const fallbackPath = path.join(OUT_ROOT, 'default.html');
  if (FULL_REBUILD || manifest.__default__ !== fallbackFp || !fs.existsSync(fallbackPath)) {
    fs.writeFileSync(fallbackPath, buildOgPreviewHtml(fallbackMeta), 'utf8');
    manifest.__default__ = fallbackFp;
    written += 1;
  } else {
    skipped += 1;
  }

  saveManifest(manifest);
  console.log(
    `[precompute-og-previews] wrote ${written}, skipped ${skipped}, paths=${paths.length} → ${OUT_ROOT}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
