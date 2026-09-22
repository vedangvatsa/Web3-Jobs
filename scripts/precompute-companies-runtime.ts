#!/usr/bin/env tsx

import fs from 'node:fs';
import path from 'node:path';
import { buildCompaniesFromJobs, type CompanyProfileRow } from '../src/lib/companies';
import type { Job } from '../src/types';

const ROOT = process.cwd();
const OUTPUT_CONTENT_PATH = path.join(ROOT, 'content', 'companies-runtime.json');
const OUTPUT_PUBLIC_PATH = path.join(ROOT, 'public', 'data', 'companies-runtime.json');

export interface PrecomputedCompany {
  slug: string;
  name: string;
  website: string;
  description: string;
  jobCount: number;
  lastUpdated: string;
  jobIds: string[];
}

async function main(): Promise<void> {
  console.log('[precompute-companies] Computing companies from jobs...');
  const t0 = Date.now();
  const jobsPath = path.join(ROOT, 'content', 'jobs-runtime.json');
  const jobs = JSON.parse(fs.readFileSync(jobsPath, 'utf8')) as Job[];
  const profiles = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/company-profiles-runtime.json'), 'utf8')) as Record<string, CompanyProfileRow>;
  const companies = buildCompaniesFromJobs(jobs, profiles);
  console.log(`[precompute-companies] Found ${companies.length} companies in ${Date.now() - t0}ms.`);

  const map: Record<string, PrecomputedCompany> = {};
  for (const company of companies) {
    map[company.slug.toLowerCase().trim()] = {
      slug: company.slug,
      name: company.name,
      website: company.website,
      description: company.description || '',
      jobCount: company.jobs.length,
      lastUpdated: company.lastUpdated,
      jobIds: company.jobs.map((j) => j.id || j.slug || j.link).filter(Boolean),
    };
  }

  fs.mkdirSync(path.dirname(OUTPUT_CONTENT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_CONTENT_PATH, JSON.stringify(map));

  fs.mkdirSync(path.dirname(OUTPUT_PUBLIC_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PUBLIC_PATH, JSON.stringify(map));

  console.log(`[precompute-companies] Wrote ${Object.keys(map).length} companies to ${OUTPUT_CONTENT_PATH} (${(fs.statSync(OUTPUT_CONTENT_PATH).size / 1024).toFixed(1)} KB)`);
}

main().catch((err) => {
  console.error('[precompute-companies] Error:', err);
  process.exit(1);
});
