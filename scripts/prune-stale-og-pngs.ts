/**
 * Remove job/company OG PNGs (and manifest keys) for slugs no longer in the catalog.
 * Run after incremental precompute so git only keeps live entities.
 */
import * as fs from 'fs';
import * as path from 'path';
import { getAllJobsWithSlugs } from '../src/lib/job-guides';
import { getCompanies } from '../src/lib/companies';
import { getCompanySlug } from '../src/lib/job-slugs';

const ROOT = process.cwd();
const OUT_JOBS = path.join(ROOT, 'public', 'og', 'jobs');
const OUT_COMPANIES = path.join(ROOT, 'public', 'og', 'companies');
const MANIFEST_PATH = path.join(ROOT, 'public', 'og', 'manifest.json');

type Manifest = Record<string, string>;

function loadManifest(): Manifest {
  try {
    return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8')) as Manifest;
  } catch {
    return {};
  }
}

function saveManifest(manifest: Manifest): void {
  fs.mkdirSync(path.dirname(MANIFEST_PATH), { recursive: true });
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest), 'utf8');
}

async function main(): Promise<void> {
  const liveJobSlugs = new Set(
    (await getAllJobsWithSlugs()).map(({ slug }) => slug.toLowerCase().trim()).filter(Boolean),
  );
  const liveCompanySlugs = new Set(
    (await getCompanies()).map((c) => getCompanySlug(c.name).toLowerCase().trim()).filter(Boolean),
  );

  const manifest = loadManifest();
  let removedFiles = 0;
  let removedKeys = 0;

  if (fs.existsSync(OUT_JOBS)) {
    for (const file of fs.readdirSync(OUT_JOBS)) {
      if (!file.endsWith('.png')) continue;
      const slug = file.replace(/\.png$/i, '').toLowerCase();
      if (liveJobSlugs.has(slug)) continue;
      fs.unlinkSync(path.join(OUT_JOBS, file));
      removedFiles += 1;
      const key = `job:${slug}`;
      if (manifest[key]) {
        delete manifest[key];
        removedKeys += 1;
      }
    }
  }

  if (fs.existsSync(OUT_COMPANIES)) {
    for (const file of fs.readdirSync(OUT_COMPANIES)) {
      if (!file.endsWith('.png')) continue;
      const slug = file.replace(/\.png$/i, '').toLowerCase();
      if (liveCompanySlugs.has(slug)) continue;
      fs.unlinkSync(path.join(OUT_COMPANIES, file));
      removedFiles += 1;
      const key = `company:${slug}`;
      if (manifest[key]) {
        delete manifest[key];
        removedKeys += 1;
      }
    }
  }

  if (removedKeys > 0) saveManifest(manifest);
  console.log(
    `[prune-stale-og-pngs] removed ${removedFiles} PNG(s), ${removedKeys} manifest key(s); live jobs=${liveJobSlugs.size}, companies=${liveCompanySlugs.size}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
