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

async function fetchJsonFromOrigin(relativePath: string): Promise<Response> {
  const urlPath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
  const url = `${SITE_ORIGIN}${urlPath}`;
  const init: RequestInit = { headers: { Accept: 'application/json' } };

  try {
    const { getCloudflareContext } = await import('@opennextjs/cloudflare');
    const service = getCloudflareContext()?.env?.WORKER_SELF_REFERENCE;
    if (service) {
      return service.fetch(new Request(url, init));
    }
  } catch {
    // Not running on Cloudflare Workers (local Node, tests).
  }

  return fetch(url, init);
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

  const res = await fetchJsonFromOrigin(`/data/${filename}`);
  if (!res.ok) {
    throw new Error(`[loadStaticJson] ${filename}: HTTP ${res.status}`);
  }
  const data = (await res.json()) as T;
  jsonCache.set(filename, data);
  return data;
}
