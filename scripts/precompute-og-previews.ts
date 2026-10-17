import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { load } from 'cheerio';
import { preparePreviewImage, writeSocialImageInfo } from './lib/og-preview-assets';
import { assertStaticPagePreviewCoverage } from './lib/og-preview-discovery';
import { isRemediatedJobSlug } from '../src/lib/job-guides';
import { legacyNomadDestination } from '../src/lib/nomads/metadata';
import { isRemovedJobPath } from '../src/lib/removed-job-path';
import { isExpiredJobPath } from '../src/lib/job-age-path';
import eventTombstones from '../content/event-tombstones.json';
import { removedEventStatus } from './lib/event-retention.mjs';
import nextConfig from '../next.config.mjs';
import {
  buildOgPreviewHtml,
  collectOgPreviewPaths,
  previewAssetPath,
  resolveKnownOgPreviewMeta,
  resolveOgPreviewMeta,
} from '../src/lib/og-preview';

type PreviewManifest = Record<string, string>;

function sha(input: string): string {
  return crypto.createHash('sha1').update(input).digest('hex').slice(0, 16);
}

function loadManifest(manifestPath: string): PreviewManifest {
  try {
    return JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as PreviewManifest;
  } catch {
    return {};
  }
}

export async function precomputeOgPreviews({ root = process.cwd(), paths, fullRebuild = false }: {
  root?: string;
  paths?: string[];
  fullRebuild?: boolean;
} = {}) {
  const OUT_ROOT = path.join(root, 'public', 'preview');
  const MANIFEST_PATH = path.join(OUT_ROOT, '.preview-manifest.json');
  const FULL_REBUILD = fullRebuild;
  fs.mkdirSync(OUT_ROOT, { recursive: true });

  if (!paths) {
    paths = await collectOgPreviewPaths();
    assertStaticPagePreviewCoverage(paths);
  }
  const rootRedirects = new Map(((await nextConfig.redirects?.()) || [])
    .filter(entry => entry.permanent && /^\/[a-z0-9-]+$/.test(entry.source) && /^\/[a-z0-9-]+$/.test(entry.destination))
    .filter(entry => fs.existsSync(path.join(root, 'content/articles', `${entry.destination.slice(1)}.md`)))
    .map(entry => [entry.source, entry.destination]));
  const manifest = FULL_REBUILD ? {} : loadManifest(MANIFEST_PATH);
  let written = 0;
  let skipped = 0;
  const livePaths = new Set<string>();

  for (const contentPath of paths) {
    if (isExpiredJobPath(contentPath) || isRemovedJobPath(contentPath) || removedEventStatus(contentPath, eventTombstones)) continue;
    livePaths.add(contentPath);
    const resolved = await resolveKnownOgPreviewMeta(contentPath);
    if (!resolved) throw new Error(`Missing OG preview metadata for ${contentPath}`);
    const meta = await preparePreviewImage(resolved, root);
    const fingerprint = sha(JSON.stringify(meta));
    const asset = previewAssetPath(contentPath);
    const outFile = path.join(root, 'public', asset.replace(/^\//, ''));
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
    if (isExpiredJobPath(contentPath) || isRemovedJobPath(contentPath) || removedEventStatus(contentPath, eventTombstones)) {
      fs.unlinkSync(file);
      delete manifest[contentPath];
      continue;
    }
    if (livePaths.has(contentPath) || relative === 'default') continue;
    const before = fs.readFileSync(file, 'utf8');
    const canonicalDestination = legacyNomadDestination(contentPath) || rootRedirects.get(contentPath);
    if (canonicalDestination) {
      const html = buildOgPreviewHtml(await preparePreviewImage(await resolveOgPreviewMeta(canonicalDestination), root));
      if (before !== html) { fs.writeFileSync(file, html); written++; }
      continue;
    }
    const knownMeta = await resolveKnownOgPreviewMeta(contentPath);
    if (knownMeta) {
      const html = buildOgPreviewHtml(await preparePreviewImage(knownMeta, root));
      if (before !== html) { fs.writeFileSync(file, html); written++; }
      continue;
    }
    const $ = load(before);
    const canonicalPath = new URL($('link[rel="canonical"]').attr('href') || contentPath, 'https://hashtagweb3.com').pathname;
    if (isExpiredJobPath(canonicalPath) || isRemovedJobPath(canonicalPath) || removedEventStatus(canonicalPath, eventTombstones)) {
      fs.unlinkSync(file);
      delete manifest[contentPath];
      continue;
    }
    if (isRemediatedJobSlug(canonicalPath.replace(/^\/(?:jobs\/)?/, ''))) {
      const meta = await preparePreviewImage(await resolveOgPreviewMeta(`/${canonicalPath.split('/').filter(Boolean).pop()}`), root);
      const html = buildOgPreviewHtml(meta);
      if (before !== html) { fs.writeFileSync(file, html); written++; }
      continue;
    }
    const image = $('meta[property="og:image"]').attr('content');
    if (!image) throw new Error(`Missing OG image in ${file}`);
    if (image.includes('/og/companies/')) {
      const html = buildOgPreviewHtml(await preparePreviewImage(await resolveOgPreviewMeta(canonicalPath), root));
      if (before !== html) { fs.writeFileSync(file, html); written++; }
      continue;
    }
    const meta = await preparePreviewImage({
      title: $('meta[property="og:title"]').attr('content') || $('title').text(),
      description: $('meta[property="og:description"]').attr('content') || '',
      canonicalUrl: $('link[rel="canonical"]').attr('href') || `https://hashtagweb3.com${contentPath}`,
      ogImageUrl: image,
    }, root);
    const html = buildOgPreviewHtml(meta);
    if (before !== html) { fs.writeFileSync(file, html); written++; }
  }

  const fallbackMeta = await preparePreviewImage(await resolveOgPreviewMeta('/'), root);
  const fallbackFp = sha(JSON.stringify(fallbackMeta));
  const fallbackPath = path.join(OUT_ROOT, 'default.html');
  if (FULL_REBUILD || manifest.__default__ !== fallbackFp || !fs.existsSync(fallbackPath)) {
    fs.writeFileSync(fallbackPath, buildOgPreviewHtml(fallbackMeta), 'utf8');
    manifest.__default__ = fallbackFp;
    written += 1;
  } else {
    skipped += 1;
  }

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest), 'utf8');
  writeSocialImageInfo(root);
  console.log(
    `[precompute-og-previews] wrote ${written}, skipped ${skipped}, paths=${paths.length} → ${OUT_ROOT}`,
  );
}

if (require.main === module) precomputeOgPreviews({ fullRebuild: process.argv.includes('--full') }).catch((error) => {
  console.error(error);
  process.exit(1);
});
