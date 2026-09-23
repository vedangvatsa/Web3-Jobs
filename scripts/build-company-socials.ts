#!/usr/bin/env tsx
/**
 * Merge Getro-style company exports (BCA + VC boards) into content/company-socials.json
 * keyed by HashtagWeb3 company slug (domain + name matching).
 */
import fs from 'node:fs';
import path from 'node:path';
import { buildCompaniesFromJobs } from '../src/lib/companies';
import { COMPANY_WEBSITE_OVERRIDES } from '../src/lib/companies';
import type { Job } from '../src/types';
import { getCompanySlug } from '../src/lib/job-slugs';
import {
  mergeSocialLinks,
  normalizeHost,
  pickSocialLinksFromGetro,
  type CompanySocialLinks,
  type CompanySocialsMap,
} from '../src/lib/company-socials';

const ROOT = process.cwd();
const OUTPUT = path.join(ROOT, 'content/company-socials.json');

const EXPORT_PATHS = [
  path.join(ROOT, 'content/sources/blockchain-assoc-companies.json'),
  path.join(ROOT, 'content/sources/blockchain-capital-companies.json'),
  path.join(ROOT, 'content/sources/cyberfund-companies.json'),
  path.join(ROOT, 'content/sources/galaxy-venturecareers-companies.json'),
];

interface GetroCompanyRow {
  name?: string;
  domain?: string;
  website?: string;
  socials?: Record<string, string[]>;
}

function buildSlugIndexes(): {
  domainToSlug: Map<string, string>;
  nameToSlug: Map<string, string>;
  validSlugs: Set<string>;
} {
  const jobsPath = path.join(ROOT, 'content/jobs-runtime.json');
  const profilesPath = path.join(ROOT, 'content/company-profiles-runtime.json');
  const jobs = JSON.parse(fs.readFileSync(jobsPath, 'utf8')) as Job[];
  const profiles = fs.existsSync(profilesPath)
    ? JSON.parse(fs.readFileSync(profilesPath, 'utf8')) as Record<string, { website?: string }>
    : {};

  const companies = buildCompaniesFromJobs(jobs, profiles);
  const domainToSlug = new Map<string, string>();
  const nameToSlug = new Map<string, string>();

  for (const company of companies) {
    nameToSlug.set(company.name.toLowerCase().trim(), company.slug);
    if (company.website) {
      domainToSlug.set(normalizeHost(company.website), company.slug);
    }
  }

  for (const [slug, website] of Object.entries(COMPANY_WEBSITE_OVERRIDES)) {
    try {
      domainToSlug.set(normalizeHost(website), slug);
    } catch {
      // ignore bad override URLs
    }
  }

  const validSlugs = new Set(companies.map((c) => c.slug));
  return { domainToSlug, nameToSlug, validSlugs };
}

function resolveSlug(
  row: GetroCompanyRow,
  domainToSlug: Map<string, string>,
  nameToSlug: Map<string, string>,
  validSlugs: Set<string>,
): string | undefined {
  const domain = row.domain || (row.website ? normalizeHost(row.website) : '');
  if (domain) {
    const byDomain = domainToSlug.get(normalizeHost(domain));
    if (byDomain && validSlugs.has(byDomain)) return byDomain;
  }
  if (row.name) {
    const byName = nameToSlug.get(row.name.toLowerCase().trim());
    if (byName && validSlugs.has(byName)) return byName;
    const bySlug = getCompanySlug(row.name);
    if (validSlugs.has(bySlug)) return bySlug;
  }
  return undefined;
}

function loadExportRows(filePath: string): GetroCompanyRow[] {
  if (!fs.existsSync(filePath)) return [];
  const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  if (!Array.isArray(parsed)) return [];
  return parsed as GetroCompanyRow[];
}

function main(): void {
  const { domainToSlug, nameToSlug, validSlugs } = buildSlugIndexes();
  const merged: CompanySocialsMap = {};
  let rowsProcessed = 0;
  let matched = 0;
  const sourcesUsed: string[] = [];

  for (const filePath of EXPORT_PATHS) {
    const rows = loadExportRows(filePath);
    if (rows.length === 0) continue;
    sourcesUsed.push(`${filePath} (${rows.length})`);

    for (const row of rows) {
      rowsProcessed += 1;
      const links = pickSocialLinksFromGetro(row.socials);
      if (!links) continue;

      const slug = resolveSlug(row, domainToSlug, nameToSlug, validSlugs);
      if (!slug) continue;
      matched += 1;
      merged[slug] = mergeSocialLinks(merged[slug], links) || links;
    }
  }

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, `${JSON.stringify(merged, null, 2)}\n`);

  console.log(`[build-company-socials] sources:\n  ${sourcesUsed.join('\n  ') || '(none)'}`);
  console.log(`[build-company-socials] processed ${rowsProcessed} export rows, matched ${matched} → ${Object.keys(merged).length} slugs`);
  console.log(`[build-company-socials] wrote ${OUTPUT}`);
}

main();
