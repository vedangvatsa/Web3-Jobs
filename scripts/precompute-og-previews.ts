import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { load } from 'cheerio';
import { preparePreviewImage, writeSocialImageInfo } from './lib/og-preview-assets';
import { isRemediatedJobSlug } from '../src/lib/job-guides';
import { legacyNomadDestination } from '../src/lib/nomads/metadata';
import { isRemovedJobPath } from '../src/lib/removed-job-path';
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
  fs.mkdirSync(OUT_ROOT, { recursive: true });

  const paths = await collectOgPreviewPaths();
  const manifest = FULL_REBUILD ? {} : loadManifest();
  let written = 0;
  let skipped = 0;
  const livePaths = new Set<string>();

  for (const contentPath of paths) {
    livePaths.add(contentPath);
    const meta = await preparePreviewImage(await resolveOgPreviewMeta(contentPath));
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

  // Keep older shared URLs functional even when they are no longer in today's catalog.
  function existingShells(directory: string): string[] {
    return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
      const file = path.join(directory, entry.name);
      return entry.isDirectory() ? existingShells(file) : entry.name.endsWith('.html') ? [file] : [];
    });
  }
  for (const file of existingShells(OUT_ROOT)) {
    const relative = path.relative(OUT_ROOT, file).replace(/\\/g, '/').replace(/\.html$/, '');
    const contentPath = relative === 'index' ? '/' : `/${relative}`;
    if (isRemovedJobPath(contentPath)) {
      fs.unlinkSync(file);
      delete manifest[contentPath];
      continue;
    }
    if (livePaths.has(contentPath) || relative === 'default') continue;
    const before = fs.readFileSync(file, 'utf8');
    const nomadDestination = legacyNomadDestination(contentPath);
    if (nomadDestination) {
      const html = buildOgPreviewHtml(await preparePreviewImage(await resolveOgPreviewMeta(nomadDestination)));
      if (before !== html) { fs.writeFileSync(file, html); written++; }
      continue;
    }
    const $ = load(before);
    const canonicalPath = new URL($('link[rel="canonical"]').attr('href') || contentPath, 'https://hashtagweb3.com').pathname;
    if (isRemediatedJobSlug(canonicalPath.replace(/^\/(?:jobs\/)?/, ''))) {
      const meta = await preparePreviewImage(await resolveOgPreviewMeta(`/${canonicalPath.split('/').filter(Boolean).pop()}`));
      const html = buildOgPreviewHtml(meta);
      if (before !== html) { fs.writeFileSync(file, html); written++; }
      continue;
    }
    const image = $('meta[property="og:image"]').attr('content');
    if (!image) throw new Error(`Missing OG image in ${file}`);
    const meta = await preparePreviewImage({
      title: $('meta[property="og:title"]').attr('content') || $('title').text(),
      description: $('meta[property="og:description"]').attr('content') || '',
      canonicalUrl: $('link[rel="canonical"]').attr('href') || `https://hashtagweb3.com${contentPath}`,
      ogImageUrl: image,
    });
    const html = buildOgPreviewHtml(meta);
    if (before !== html) { fs.writeFileSync(file, html); written++; }
  }

  const fallbackMeta = await preparePreviewImage(await resolveOgPreviewMeta('/'));
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
  writeSocialImageInfo();
  console.log(
    `[precompute-og-previews] wrote ${written}, skipped ${skipped}, paths=${paths.length} → ${OUT_ROOT}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
