/**
 * Remove untracked OG PNGs under public/og/ that are not in the live jobs/companies catalog.
 * Safe for local working trees after a partial precompute.
 */
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'node:child_process';
import { getAllJobsWithSlugs } from '../src/lib/job-guides';
import { getCompanies } from '../src/lib/companies';
import { getCompanySlug } from '../src/lib/job-slugs';

const ROOT = process.cwd();

function isTracked(relFromRoot: string): boolean {
  try {
    execSync(`git ls-files --error-unmatch -- ${JSON.stringify(relFromRoot)}`, {
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    return true;
  } catch {
    return false;
  }
}

async function main(): Promise<void> {
  const dryRun = process.argv.includes('--dry-run');
  const liveJobSlugs = new Set(
    (await getAllJobsWithSlugs()).map(({ slug }) => slug.toLowerCase().trim()).filter(Boolean),
  );
  const liveCompanySlugs = new Set(
    (await getCompanies()).map((c) => getCompanySlug(c.name).toLowerCase().trim()).filter(Boolean),
  );

  const dirs: Array<{ dir: string; live: Set<string> }> = [
    { dir: path.join(ROOT, 'public', 'og', 'jobs'), live: liveJobSlugs },
    { dir: path.join(ROOT, 'public', 'og', 'companies'), live: liveCompanySlugs },
  ];

  let removed = 0;
  let removedBytes = 0;

  for (const { dir, live } of dirs) {
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir)) {
      if (!file.endsWith('.png')) continue;
      const abs = path.join(dir, file);
      try {
        if (fs.lstatSync(abs).isSymbolicLink()) continue;
      } catch {
        continue;
      }
      if (!fs.existsSync(abs)) continue;
      if (isTracked(path.relative(ROOT, abs))) continue;
      const slug = file.replace(/\.png$/i, '').toLowerCase();
      if (live.has(slug)) continue;
      const stat = fs.statSync(abs);
      removedBytes += stat.size;
      removed += 1;
      if (!dryRun) fs.unlinkSync(abs);
    }
  }

  console.log(
    `[prune-untracked-og-pngs] ${dryRun ? 'dry-run' : 'applied'}: removed ${removed} untracked stale PNG(s) (${(removedBytes / 1e6).toFixed(2)} MB)`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
