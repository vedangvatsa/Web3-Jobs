import fs from 'fs';
import path from 'path';

const SITE_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://hashtagweb3.com';

const jsonCache = new Map<string, unknown>();

function readLocalDataFile(filename: string): unknown | null {
  try {
    if (typeof fs === 'undefined' || !fs.existsSync) return null;
    for (const dir of ['content', path.join('public', 'data')]) {
      const filePath = path.join(process.cwd(), dir, filename);
      if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf8')) as unknown;
      }
    }
  } catch {
    return null;
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
      const assetRes = await assets.fetch(new Request(url, requestInit));
      if (assetRes.ok) return assetRes;
    }
  } catch {
    // Not on Cloudflare Workers (local Node, tests).
  }

  return fetch(url, requestInit);
}

/** Load large JSON from static /data assets (not bundled in the Worker). */
export async function loadStaticJson<T>(filename: string): Promise<T> {
  const cached = jsonCache.get(filename);
  if (cached !== undefined) return cached as T;

  const local = readLocalDataFile(filename);
  if (local !== null) {
    jsonCache.set(filename, local);
    return local as T;
  }

  const res = await fetchSiteAsset(`/data/${filename}`);
  if (!res.ok) {
    throw new Error(`[loadStaticJson] ${filename}: HTTP ${res.status}`);
  }
  const data = (await res.json()) as T;
  jsonCache.set(filename, data);
  return data;
}
