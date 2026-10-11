import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { isDeepStrictEqual } from 'node:util';
import { setTimeout as delay } from 'node:timers/promises';

export const CATALOG_PATHS = {
  jobs: ['content/jobs-cache.json', 'content/jobs-runtime.json', 'content/homepage-jobs.json', 'content/companies-runtime.json', 'content/slug-types.json', 'content/legacy-slugs-archive.json', 'content/job-description-shards/', 'content/prebuild-input-hashes.json', 'content/sitemap-routes.json', 'content/social-image-info.json', 'content/removed-job-paths.json', 'content/recovered-job-redirects.json', 'public/sitemap.xml', 'public/.well-known/sitemap.json', 'public/og/jobs/', 'public/og/companies/', 'public/og/manifest.json', 'public/preview/', 'public/logo/companies/'],
  events: ['content/events/', 'content/events-runtime.json', 'content/event-slug-history.json', 'content/event-tombstones.json', 'content/event-image-overrides.json', 'content/event-cover-optimization.json', 'content/static-image-optimization.json', 'content/responsive-images.json', 'content/social-preview-image-cache.json', 'content/image-redirects.json', 'content/legacy-image-paths.json', 'content/social-image-info.json', 'content/prebuild-input-hashes.json', 'src/lib/event-guides.ts', 'scripts/event-emails.json', 'scripts/event-emails-full.json', 'public/preview/', 'public/events/', 'public/responsive/', 'public/images/', 'public/og/external/'],
  news: ['content/news-cache.json'],
};
const SHARED_MAPS = new Set(['content/prebuild-input-hashes.json', 'content/social-image-info.json', 'content/responsive-images.json', 'content/social-preview-image-cache.json', 'content/image-redirects.json', 'public/og/manifest.json', 'public/preview/.preview-manifest.json']);
const RECEIPT = 'content/catalog-refresh-state.json';

export function mergeCatalogMap(base, local, remote, key = '') {
  if (isDeepStrictEqual(local, base)) return remote;
  if (isDeepStrictEqual(remote, base) || isDeepStrictEqual(local, remote)) return local;
  const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  if ((base === undefined || object(base)) && object(local) && object(remote)) {
    const result = Object.create(null);
    for (const name of new Set([...Object.keys(base || {}), ...Object.keys(local), ...Object.keys(remote)])) {
      const value = mergeCatalogMap(base?.[name], local[name], remote[name], `${key}/${name}`);
      if (value !== undefined) result[name] = value;
    }
    return result;
  }
  throw new Error(`Concurrent catalogue conflict at ${key || '/'}`);
}

export async function publishCatalog({ kind, cwd = process.cwd(), attempts = 8, wait = delay, beforePush }) {
  if (process.env.GITHUB_ACTIONS !== 'true') throw new Error('Catalogue publication requires GitHub Actions');
  if (!Object.hasOwn(CATALOG_PATHS, kind)) throw new Error('Unknown catalogue kind');
  const git = (args, options = {}) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'], maxBuffer: 64 * 1024 * 1024, ...options }).trim();
  const base = git(['rev-parse', 'HEAD']);
  const paths = CATALOG_PATHS[kind];
  const allowed = file => paths.some(scope => scope.endsWith('/') ? file.startsWith(scope) : file === scope);
  const names = args => git(args).split('\0').filter(Boolean);
  const files = [...new Set([...names(['diff', '--name-only', '-z', base]), ...names(['ls-files', '--others', '--exclude-standard', '-z'])])].filter(allowed);
  const cache = path.join(cwd, '.cache/catalog-publication', kind);
  fs.mkdirSync(cache, { recursive: true });
  const temporary = fs.mkdtempSync(path.join(cache, 'index-'));
  const env = { ...process.env, GIT_INDEX_FILE: path.join(temporary, 'index'), GIT_AUTHOR_NAME: 'github-actions[bot]', GIT_AUTHOR_EMAIL: '41898282+github-actions[bot]@users.noreply.github.com', GIT_COMMITTER_NAME: 'github-actions[bot]', GIT_COMMITTER_EMAIL: '41898282+github-actions[bot]@users.noreply.github.com' };
  const at = (ref, file) => { try { return git(['rev-parse', '--verify', `${ref}:${file}`]); } catch { return null; } };
  const jsonAt = (ref, file) => { const blob = at(ref, file); return blob ? JSON.parse(git(['show', `${ref}:${file}`])) : undefined; };
  const snapshot = files.map(file => {
    const absolute = path.join(cwd, file), old = at(base, file);
    if (!fs.existsSync(absolute)) return { file, old, blob: null };
    if (!fs.lstatSync(absolute).isFile()) throw new Error(`Refusing non-file catalogue output: ${file}`);
    const raw = fs.readFileSync(absolute);
    const backup = path.join(cache, 'files', file);
    fs.mkdirSync(path.dirname(backup), { recursive: true }); fs.writeFileSync(backup, raw);
    return { file, old, blob: git(['hash-object', '-w', '--stdin'], { input: raw }), ...(SHARED_MAPS.has(file) ? { json: JSON.parse(raw.toString()) } : {}) };
  });
  fs.writeFileSync(path.join(cache, 'snapshot.json'), `${JSON.stringify({ kind, base, files: snapshot.map(({ json, ...entry }) => entry) }, null, 2)}\n`);
  const checkedAt = new Date().toISOString();
  try {
    for (let attempt = 1; attempt <= attempts; attempt++) {
      git(['fetch', 'origin', 'main']);
      const remote = git(['rev-parse', 'FETCH_HEAD']);
      git(['read-tree', remote], { env });
      for (const entry of snapshot) {
        const current = at(remote, entry.file);
        let blob = entry.blob;
        if (current !== entry.old && current !== entry.blob) {
          if (!SHARED_MAPS.has(entry.file) || entry.blob === null) throw new Error(`Newer main changed ${entry.file}; recovery snapshot retained`);
          const merged = mergeCatalogMap(jsonAt(base, entry.file), entry.json, jsonAt(remote, entry.file));
          blob = git(['hash-object', '-w', '--stdin'], { input: `${JSON.stringify(merged, null, 2)}\n` });
        }
        if (blob === null) git(['update-index', '--force-remove', '--', entry.file], { env });
        else git(['update-index', '--add', '--cacheinfo', '100644', blob, entry.file], { env });
      }
      const receipt = jsonAt(remote, RECEIPT) || { version: 1, catalogs: {} };
      receipt.catalogs[kind] = { checkedAt, sourceCommit: base, changedFiles: files.length };
      const receiptBlob = git(['hash-object', '-w', '--stdin'], { input: `${JSON.stringify(receipt, null, 2)}\n` });
      git(['update-index', '--add', '--cacheinfo', '100644', receiptBlob, RECEIPT], { env });
      const tree = git(['write-tree'], { env });
      if (tree === git(['rev-parse', `${remote}^{tree}`])) return { kind, commit: remote, changedFiles: files.length, attempt, checkedAt };
      const commit = git(['commit-tree', tree, '-p', remote, '-m', `chore: refresh ${kind} catalogue`], { env });
      await beforePush?.({ attempt, remote, commit });
      try {
        git(['push', 'origin', `${commit}:refs/heads/main`]);
        const result = { kind, commit, changedFiles: files.length, attempt, checkedAt };
        fs.writeFileSync(path.join(cache, 'result.json'), `${JSON.stringify(result, null, 2)}\n`);
        return result;
      } catch (error) {
        if (attempt === attempts) throw new Error(`Catalogue push failed after ${attempts} attempts; recovery snapshot retained: ${error.message}`);
        await wait(Math.min(30000, 1000 * 2 ** (attempt - 1)));
      }
    }
  } finally { fs.rmSync(temporary, { recursive: true, force: true }); }
}
