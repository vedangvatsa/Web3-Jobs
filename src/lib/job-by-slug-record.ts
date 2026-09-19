import fs from 'fs';
import path from 'path';
import type { Job } from '@/types';
import { fetchSiteAsset } from './load-static-json';

const slugRecordPromises = new Map<string, Promise<Job | null>>();

function readLocalJobBySlug(slug: string): Job | null {
  try {
    if (typeof fs === 'undefined' || !fs.existsSync) return null;
    const filename = `${slug}.json`;
    for (const dir of [
      path.join('public', 'jobs-by-slug'),
      path.join('content', 'jobs-by-slug'),
    ]) {
      const filePath = path.join(process.cwd(), dir, filename);
      if (!fs.existsSync(filePath)) continue;
      return JSON.parse(fs.readFileSync(filePath, 'utf8')) as Job;
    }
  } catch {
    return null;
  }
  return null;
}

/** Load a single job record by slug (small JSON asset) instead of the full jobs-runtime catalog. */
export async function fetchJobBySlug(slug: string): Promise<Job | null> {
  const clean = slug.toLowerCase().trim();
  if (!clean) return null;

  const existing = slugRecordPromises.get(clean);
  if (existing) return existing;

  const pending = (async (): Promise<Job | null> => {
    const local = readLocalJobBySlug(clean);
    if (local) return local;

    const res = await fetchSiteAsset(`/jobs-by-slug/${encodeURIComponent(clean)}.json`);
    if (!res.ok) return null;
    const parsed: unknown = await res.json();
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed as Job;
  })();

  slugRecordPromises.set(clean, pending);
  try {
    return await pending;
  } finally {
    slugRecordPromises.delete(clean);
  }
}
