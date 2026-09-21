import fs from 'node:fs';
import path from 'node:path';

/**
 * Resolve content/public catalog files under Next standalone layouts.
 * FAH runs `node .next/standalone/server.js` where cwd is often the standalone
 * directory — catalogs must still be found without round-tripping the CDN.
 */

const ROOT_MARKERS = ['content/jobs-runtime.json', 'package.json', '.next/standalone'] as const;

function uniqueResolved(paths: string[]): string[] {
  return [...new Set(paths.map((p) => path.resolve(p)))];
}

/** Candidate project roots (cwd, parents, standalone parent). */
export function catalogSearchRoots(): string[] {
  const cwd = process.cwd();
  const candidates = [
    cwd,
    path.join(cwd, '..'),
    path.join(cwd, '..', '..'),
    path.join(cwd, '.next', 'standalone'),
  ];

  // Prefer roots that look like the real app (have content catalogs).
  const ranked: string[] = [];
  for (const root of uniqueResolved(candidates)) {
    if (fs.existsSync(path.join(root, 'content', 'jobs-runtime.json'))) {
      ranked.unshift(root);
    } else {
      ranked.push(root);
    }
  }
  return uniqueResolved(ranked);
}

/** Find an existing file relative to any catalog root. */
export function findLocalFile(...relativeParts: string[]): string | null {
  try {
    if (typeof fs.existsSync !== 'function') return null;
    const rel = path.join(...relativeParts);
    for (const root of catalogSearchRoots()) {
      const abs = path.join(root, rel);
      if (fs.existsSync(abs) && fs.statSync(abs).isFile()) return abs;
    }
  } catch {
    return null;
  }
  return null;
}

/** Find an existing directory relative to any catalog root. */
export function findLocalDir(...relativeParts: string[]): string | null {
  try {
    if (typeof fs.existsSync !== 'function') return null;
    const rel = path.join(...relativeParts);
    for (const root of catalogSearchRoots()) {
      const abs = path.join(root, rel);
      if (fs.existsSync(abs) && fs.statSync(abs).isDirectory()) return abs;
    }
  } catch {
    return null;
  }
  return null;
}

/** Read and parse JSON from the first matching local path. */
export function readLocalJsonFile<T = unknown>(...relativeParts: string[]): T | null {
  const filePath = findLocalFile(...relativeParts);
  if (!filePath) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T;
  } catch {
    return null;
  }
}

export function assertMarkerPresent(label: string, ...relativeParts: string[]): void {
  if (!findLocalFile(...relativeParts) && !findLocalDir(...relativeParts)) {
    throw new Error(`[catalog] missing ${label}: ${path.join(...relativeParts)}`);
  }
}

void ROOT_MARKERS;
