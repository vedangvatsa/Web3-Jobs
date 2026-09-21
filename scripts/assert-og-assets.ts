/**
 * OG asset gate for CI deploys.
 *
 * Fails loudly when share-image generation produced nothing (our bug),
 * and reports whether the opennext bundler carried public/og + public/preview
 * into .open-next/assets (warn-only: answers "did the bundler drop them?"
 * on every deploy without blocking releases).
 *
 * Usage:
 *   npx tsx scripts/assert-og-assets.ts            # pre-build: checks public/
 *   npx tsx scripts/assert-og-assets.ts --bundled  # post-build: also checks .open-next/assets
 */
import * as fs from 'fs';
import * as path from 'path';

const ROOT = process.cwd();
const CHECK_BUNDLED = process.argv.includes('--bundled');

function countFiles(dir: string, ext: string): number {
  if (!fs.existsSync(dir)) return 0;
  let count = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) count += countFiles(full, ext);
    else if (entry.name.endsWith(ext)) count += 1;
  }
  return count;
}

function dirSizeMb(dir: string): number {
  if (!fs.existsSync(dir)) return 0;
  let bytes = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) bytes += dirSizeMb(full) * 1048576;
    else {
      try {
        bytes += fs.statSync(full).size;
      } catch {
        /* ignore */
      }
    }
  }
  return bytes / 1048576;
}

function jobCount(): number {
  try {
    const raw = JSON.parse(fs.readFileSync(path.join(ROOT, 'content', 'jobs-runtime.json'), 'utf8'));
    const jobs = Array.isArray(raw) ? raw : raw.jobs || [];
    return jobs.length;
  } catch {
    return 0;
  }
}

const jobs = jobCount();
const ogJobs = countFiles(path.join(ROOT, 'public', 'og', 'jobs'), '.png');
const ogCompanies = countFiles(path.join(ROOT, 'public', 'og', 'companies'), '.png');
const previews = countFiles(path.join(ROOT, 'public', 'preview'), '.html');
const ogMb = dirSizeMb(path.join(ROOT, 'public', 'og'));

console.log(
  `[assert-og-assets] public/ jobs=${ogJobs}/${jobs} companies=${ogCompanies} previews=${previews} og=${ogMb.toFixed(1)}MB`,
);

const failures: string[] = [];
if (jobs > 0 && ogJobs < jobs * 0.5) {
  failures.push(`only ${ogJobs}/${jobs} job OG PNGs generated`);
}
if (previews === 0) {
  failures.push('zero preview shells generated');
}

if (CHECK_BUNDLED) {
  const bundledJobs = countFiles(path.join(ROOT, '.open-next', 'assets', 'og', 'jobs'), '.png');
  const bundledPreviews = countFiles(path.join(ROOT, '.open-next', 'assets', 'preview'), '.html');
  console.log(`[assert-og-assets] bundled assets/og/jobs=${bundledJobs} assets/preview=${bundledPreviews}`);
  if (bundledJobs === 0 && ogJobs > 0) {
    console.warn(
      '[assert-og-assets] WARNING: opennext build dropped public/og — job share cards will 404 live. Investigate adapter asset bundling.',
    );
  }
  if (bundledPreviews === 0 && previews > 0) {
    console.warn('[assert-og-assets] WARNING: opennext build dropped public/preview.');
  }
}

if (failures.length > 0) {
  console.error(`[assert-og-assets] FAIL: ${failures.join('; ')}`);
  process.exit(1);
}
console.log('[assert-og-assets] OK');
