import fs from 'fs';
import path from 'path';

const SITE_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://hashtagweb3.com';

const jsonCache = new Map<string, unknown>();

function readLocalDataFile(filename: string): unknown | null {
  try {
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

/** Load large JSON from static /data assets (not bundled in the Worker). */
export async function loadStaticJson<T>(filename: string): Promise<T> {
  const cached = jsonCache.get(filename);
  if (cached !== undefined) return cached as T;

  const local = readLocalDataFile(filename);
  if (local !== null) {
    jsonCache.set(filename, local);
    return local as T;
  }

  const res = await fetch(`${SITE_ORIGIN}/data/${filename}`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`[loadStaticJson] ${filename}: HTTP ${res.status}`);
  }
  const data = (await res.json()) as T;
  jsonCache.set(filename, data);
  return data;
}
