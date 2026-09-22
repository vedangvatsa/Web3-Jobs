import fs from 'fs';
import path from 'path';
import { catalogSearchRoots, findLocalFile, readLocalJsonFile } from './catalog-fs';

const SITE_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://hashtagweb3.com';

type JsonCacheEntry = { data: unknown; mtimeMs: number | null };

const jsonCache = new Map<string, JsonCacheEntry>();
const jsonLoads = new Map<string, Promise<unknown>>();

export function localCatalogMtimeMs(filename: string): number | null {
  for (const rel of [
    path.join('content', filename),
    path.join('public', 'data', filename),
  ]) {
    for (const root of catalogSearchRoots()) {
      const abs = path.join(root, rel);
      try {
        if (fs.existsSync(abs) && fs.statSync(abs).isFile()) {
          return fs.statSync(abs).mtimeMs;
        }
      } catch {
        // continue
      }
    }
  }
  return null;
}

function readLocalDataFile(filename: string): unknown | null {
  const direct = readLocalJsonFile('content', filename) ?? readLocalJsonFile('public', 'data', filename);
  if (direct !== null) return direct;

  // Filename-only search under known data dirs (legacy callers).
  for (const root of catalogSearchRoots()) {
    for (const rel of [
      path.join(root, filename),
      path.join(root, 'content', filename),
      path.join(root, 'public', 'data', filename),
      path.join(root, 'data', filename),
    ]) {
      try {
        if (fs.existsSync(rel) && fs.statSync(rel).isFile()) {
          return JSON.parse(fs.readFileSync(rel, 'utf8')) as unknown;
        }
      } catch {
        // continue
      }
    }
  }
  return null;
}

/** Fetch a static path from the Worker assets binding (no full app re-entry). */
export async function fetchSiteAsset(relativePath: string, init?: RequestInit): Promise<Response> {
  const urlPath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
  const url = `${SITE_ORIGIN}${urlPath}`;
  const requestInit: RequestInit = {
    ...init,
    headers: { Accept: 'application/json', ...(init?.headers ?? {}) },
  };

  try {
    const { getCloudflareContext } = await import('@opennextjs/cloudflare');
    const env = getCloudflareContext()?.env;
    const assets = env?.ASSETS;
    if (assets) {
      return assets.fetch(new Request(url, requestInit));
    }
  } catch {
    // Not on Cloudflare Workers (local Node, tests).
  }

  return fetch(url, requestInit);
}

async function fetchRemoteJson(filename: string): Promise<unknown> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetchSiteAsset(`/data/${filename}`);
      if (!res.ok) throw new Error(`[loadStaticJson] ${filename}: HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      lastError = err;
      if (attempt < 2) {
        await new Promise((resolve) => setTimeout(resolve, 150 * (attempt + 1)));
      }
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

/**
 * Load large JSON from local content/public catalogs first, then CDN.
 * Never treat a missing catalog as an empty page — callers should throw so
 * Next does not ISR-cache a false 404.
 */
export async function loadStaticJson<T>(filename: string, validate?: (value: unknown) => boolean): Promise<T> {
  const devMtimeMs =
    process.env.NODE_ENV === 'development' ? localCatalogMtimeMs(filename) : null;
  const cached = jsonCache.get(filename);
  if (cached !== undefined) {
    const staleInDev = devMtimeMs !== null && cached.mtimeMs !== devMtimeMs;
    if (!staleInDev && (!validate || validate(cached.data))) return cached.data as T;
    jsonCache.delete(filename);
  }
  let pending = jsonLoads.get(filename);
  if (!pending) {
    pending = Promise.resolve()
      .then(async () => {
        const local = readLocalDataFile(filename);
        if (local !== null) return local;
        return fetchRemoteJson(filename);
      })
      .finally(() => {
        jsonLoads.delete(filename);
      });
    jsonLoads.set(filename, pending);
  }
  const data = await pending;
  if (validate && !validate(data)) throw new Error(`[loadStaticJson] ${filename}: invalid catalog`);
  jsonCache.set(filename, { data, mtimeMs: devMtimeMs });
  return data as T;
}

/** Best-effort local path helper for non-JSON assets (markdown, shards). */
export function resolveLocalCatalogPath(...relativeParts: string[]): string | null {
  return findLocalFile(...relativeParts);
}
