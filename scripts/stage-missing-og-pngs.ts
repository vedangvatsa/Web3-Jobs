/**
 * Stage untracked public/og PNGs for slugs in the live jobs/companies catalog.
 */
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'node:child_process';
import { getAllJobsWithSlugs } from '../src/lib/job-guides';
import { getCompanies } from '../src/lib/companies';
import { getCompanySlug } from '../src/lib/job-slugs';

const ROOT = process.cwd();

function isTracked(rel: string): boolean {
  try {
    execSync(`git ls-files --error-unmatch -- ${JSON.stringify(rel)}`, {
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    return true;
  } catch {
    return false;
  }
}

async function main(): Promise<void> {
  const dryRun = process.argv.includes('--dry-run');
  let staged = 0;

  const jobs = await getAllJobsWithSlugs();
  for (const { slug } of jobs) {
    const rel = path.join('public', 'og', 'jobs', `${slug}.png`);
    const abs = path.join(ROOT, rel);
    if (!fs.existsSync(abs) || isTracked(rel)) continue;
    if (dryRun) console.log(`  would stage ${rel}`);
    else execSync(`git add -- ${JSON.stringify(rel)}`, { stdio: 'inherit' });
    staged += 1;
  }

  for (const company of await getCompanies()) {
    const slug = getCompanySlug(company.name);
    const rel = path.join('public', 'og', 'companies', `${slug}.png`);
    const abs = path.join(ROOT, rel);
    if (!fs.existsSync(abs) || isTracked(rel)) continue;
    if (dryRun) console.log(`  would stage ${rel}`);
    else execSync(`git add -- ${JSON.stringify(rel)}`, { stdio: 'inherit' });
    staged += 1;
  }

  console.log(`[stage-missing-og-pngs] ${dryRun ? 'dry-run' : 'staged'} ${staged} PNG(s)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
