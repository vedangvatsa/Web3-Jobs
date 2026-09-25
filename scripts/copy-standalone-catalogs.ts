#!/usr/bin/env tsx
/**
 * Copy every runtime catalog the site needs into `.next/standalone`.
 * Without this, FAH cold starts miss content/public files and detail pages 404.
 */
import fs from 'node:fs';
import path from 'node:path';
import { assertStandalonePublicAssets } from './lib/standalone-public-assets';

const ROOT = process.cwd();
const STANDALONE = path.join(ROOT, '.next', 'standalone');

const FILES = [
  'content/jobs-runtime.json',
  'content/homepage-jobs.json',
  'content/events-runtime.json',
  'content/glossary-runtime.json',
  'content/companies-runtime.json',
  'content/company-profiles-runtime.json',
  'content/articles-index.json',
  'content/news-cache.json',
  'content/slug-types.json',
  'content/legacy-slugs-archive.json',
  'content/learn-runtime.json',
  'content/pseo-resources-runtime.json',
  'content/company-logos-index.json',
  'content/latest-articles.json',
  'content/sitemap-routes.json',
  'public/favicon.ico',
  'public/icon.png',
  'public/apple-icon.png',
  'public/logo/HashtagWeb3.png',
];

const DIRS = [
  ['content/job-shards', 'content/job-shards'],
  ['content/job-description-shards', 'content/job-description-shards'],
  ['content/articles', 'content/articles'],
  ['content/glossary', 'content/glossary'],
  ['public/data', 'public/data'],
  ['public/job-shards', 'public/job-shards'],
  ['public/job-description-shards', 'public/job-description-shards'],
  ['public/articles-data', 'public/articles-data'],
  ['public/logo', 'public/logo'],
  ['public/events', 'public/events'],
  ['public/images', 'public/images'],
  ['public/preview', 'public/preview'],
  ['public/popups', 'public/popups'],
  ['public/visualizers', 'public/visualizers'],
  ['public/og', 'public/og'],
];

/** Top-level public/ entries copied wholesale (dirs above are copied explicitly). */
const PUBLIC_ROOT_SKIP = new Set([
  'data',
  'job-shards',
  'job-description-shards',
  'articles-data',
  'logo',
  'events',
  'images',
  'preview',
  'popups',
  'visualizers',
  'og',
]);

function copyFile(rel: string): void {
  const src = path.join(ROOT, rel);
  if (!fs.existsSync(src)) {
    console.warn(`[copy-standalone-catalogs] skip missing ${rel}`);
    return;
  }
  const dest = path.join(STANDALONE, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function copyDir(srcRel: string, destRel: string): void {
  const src = path.join(ROOT, srcRel);
  if (!fs.existsSync(src)) {
    console.warn(`[copy-standalone-catalogs] skip missing dir ${srcRel}`);
    return;
  }
  const dest = path.join(STANDALONE, destRel);
  fs.mkdirSync(dest, { recursive: true });
  fs.cpSync(src, dest, { recursive: true });
}

function copyPublicRootFiles(): void {
  const publicRoot = path.join(ROOT, 'public');
  if (!fs.existsSync(publicRoot)) return;
  for (const name of fs.readdirSync(publicRoot)) {
    if (PUBLIC_ROOT_SKIP.has(name)) continue;
    const rel = path.join('public', name);
    const src = path.join(ROOT, rel);
    const dest = path.join(STANDALONE, rel);
    if (fs.statSync(src).isDirectory()) {
      copyDir(rel, rel);
    } else {
      copyFile(rel);
    }
  }
}

function main(): void {
  if (!fs.existsSync(STANDALONE)) {
    console.log('[copy-standalone-catalogs] no .next/standalone — skip');
    return;
  }
  for (const file of FILES) copyFile(file);
  for (const [src, dest] of DIRS) copyDir(src, dest);
  copyPublicRootFiles();

  assertStandalonePublicAssets(ROOT, STANDALONE);
  console.log('[copy-standalone-catalogs] site catalogs copied into .next/standalone');
}

main();
