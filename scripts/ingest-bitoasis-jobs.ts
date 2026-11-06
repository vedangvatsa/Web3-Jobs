#!/usr/bin/env tsx
import fs from 'node:fs';
import path from 'node:path';
import type { Job } from '../src/types';
import { eligibleIngestedJobs } from './lib/job-ingestion-policy';
import { assignJobSlugsAndSyncLegacyArchive, getJobContentKey } from '../src/lib/job-slugs';
import { loadPublishedRootSlugsSync, loadReservedRootSlugsSync } from '../src/lib/reserved-root-slugs';
import { loadJobLegacyArchive, writeJobLegacyArchive } from './lib/job-slug-assignment';
import { isConcreteJobOpening } from '../src/lib/job-filters';
import { sanitizeJobDescriptionHtml } from '../src/lib/sanitize-html';
import {
  buildJobDescriptionAliases,
  readJobDescriptionStore,
  writeJobDescriptionStore,
} from './lib/job-description-store';

const KEKA_ACTIVE_JOBS_URL =
  'https://dcx.keka.com/careers/api/embedjobs/default/active/a19960b8-1dc8-4788-9544-3335b26ea14a';

interface KekaLocation {
  id?: number;
  name?: string;
  city?: string;
  state?: string;
  countryCode?: string;
  countryName?: string;
}

interface KekaSalaryRange {
  minimum?: number;
  maximum?: number;
  currency?: string;
  salaryPeriod?: number;
}

interface KekaJob {
  id: number;
  title: string;
  description: string;
  departmentIdentifier?: string;
  departmentName?: string;
  excerpt?: string;
  jobLocations?: KekaLocation[];
  jobType?: number;
  experience?: string;
  jobNumber?: string;
  salaryRange?: KekaSalaryRange;
  salaryRangeFormat?: string;
  publishedOn: string;
}

function cleanKekaDescriptionHtml(rawHtml: string): string {
  let html = rawHtml
    .replace(/\s*style="[^"]*"/gi, '')
    .replace(/<span\s*>(.*?)<\/span>/gi, '$1')
    .replace(/<(div|p)>\s*<strong>\s*([^<]+?)\s*<\/strong>\s*<\/\1>/gi, '<h3>$2</h3>')
    .replace(/<(div|p)>\s*(?:<br\s*\/?>)?\s*<\/\1>/gi, '')
    .trim();

  // If description doesn't start with About BitOasis, add a brief intro
  if (!/BitOasis is/i.test(html.slice(0, 300))) {
    const intro =
      '<p><strong>About BitOasis:</strong> BitOasis is the leading cryptocurrency trading platform in the Middle East and North Africa (MENA), providing secure trading, liquidity, and OTC execution across the GCC region.</p>';
    html = `${intro}\n\n${html}`;
  }

  return sanitizeJobDescriptionHtml(html, 'BitOasis');
}

function resolveJobLocation(job: KekaJob): string {
  const loc = job.jobLocations?.[0];
  const country = loc?.countryName?.toLowerCase() || '';
  const city = loc?.city?.trim() || '';

  if (country.includes('emirates') || country.includes('uae') || loc?.countryCode === 'AE' || city.toLowerCase() === 'dubai') {
    return 'Dubai, United Arab Emirates';
  }
  if (country.includes('jordan') || loc?.countryCode === 'JO' || city.toLowerCase() === 'amman' || job.salaryRange?.currency === 'JOD') {
    return 'Amman, Jordan';
  }
  if (country.includes('bahrain') || loc?.countryCode === 'BA' || loc?.countryCode === 'BH' || city.toLowerCase() === 'manama' || job.salaryRange?.currency === 'BHD') {
    return 'Manama, Bahrain';
  }

  // Fallback to headquarters
  return 'Dubai, United Arab Emirates';
}

function formatSalary(job: KekaJob): string | undefined {
  if (!job.salaryRangeFormat) return undefined;
  const cleanRange = job.salaryRangeFormat.replace(/\.00/g, '').replace(/\s+/g, ' ').trim();
  // Monthly salary in the Middle East
  return `${cleanRange}/month`;
}

async function ensureBitOasisBranding(root: string): Promise<void> {
  const logoDir = path.join(root, 'public/logo/companies');
  fs.mkdirSync(logoDir, { recursive: true });
  const logoPath = path.join(logoDir, 'bitoasis.png');

  if (!fs.existsSync(logoPath) || fs.statSync(logoPath).size < 100) {
    const faviconRes = await fetch('https://www.google.com/s2/favicons?domain=bitoasis.net&sz=128', {
      signal: AbortSignal.timeout(15_000),
    });
    if (faviconRes.ok) {
      const buffer = Buffer.from(await faviconRes.arrayBuffer());
      fs.writeFileSync(logoPath, buffer);
      console.log('✓ Ensured BitOasis logo at', logoPath);
    }
  }

  const brandingPath = path.join(root, 'content/company-branding.json');
  const branding = fs.existsSync(brandingPath) ? JSON.parse(fs.readFileSync(brandingPath, 'utf8')) : {};
  if (!branding.bitoasis) {
    branding.bitoasis = {
      website: 'https://bitoasis.net',
      logo: '/logo/companies/bitoasis.png',
    };
    fs.writeFileSync(brandingPath, `${JSON.stringify(branding, null, 2)}\n`);
  }

  const socialsPath = path.join(root, 'content/company-socials.json');
  const socials = fs.existsSync(socialsPath) ? JSON.parse(fs.readFileSync(socialsPath, 'utf8')) : {};
  if (!socials.bitoasis) {
    socials.bitoasis = {
      website: 'https://bitoasis.net',
      twitter: 'https://x.com/bitoasis',
      linkedin: 'https://www.linkedin.com/company/bitoasis-technologies-fze',
    };
    fs.writeFileSync(socialsPath, `${JSON.stringify(socials, null, 2)}\n`);
  }

  const companyMdPath = path.join(root, 'content/companies/bitoasis.md');
  if (!fs.existsSync(companyMdPath)) {
    const mdContent = `---
name: BitOasis
website: 'https://bitoasis.net'
category: Cryptocurrency Exchange
headquarters: Dubai, United Arab Emirates
description: "BitOasis is the leading cryptocurrency trading platform in the Middle East and North Africa (MENA). Established in 2015, BitOasis enables retail, high-net-worth, and institutional clients to buy, sell, and trade digital assets across local fiat currencies with regulatory licenses from VARA and the Central Bank of Bahrain."
lastUpdated: 2026-11-07
---

BitOasis is a pioneer digital asset platform and cryptocurrency exchange headquartered in Dubai, providing secure trading, liquidity, and OTC execution across the MENA region.

The company actively hires talent across business development, software engineering, finance, compliance, and risk management.
`;
    fs.writeFileSync(companyMdPath, mdContent);
    console.log('✓ Created content/companies/bitoasis.md');
  }
}

async function main() {
  const root = process.cwd();
  await ensureBitOasisBranding(root);

  const cachePath = path.join(root, 'content/jobs-cache.json');
  const allJobs = JSON.parse(fs.readFileSync(cachePath, 'utf8')) as Job[];
  const previousById = new Map(allJobs.map((j) => [String(j.id), j]));

  // Remove previous bitoasis jobs to allow clean upsert
  const filtered = allJobs.filter((j) => {
    const companyMatch = j.company?.toLowerCase() === 'bitoasis';
    const linkMatch = String(j.link || '').includes('dcx.keka.com');
    return !companyMatch && !linkMatch;
  });

  const store = readJobDescriptionStore(root);
  const descriptions = { ...store.descriptions };
  const added: Job[] = [];

  console.log(`Fetching active BitOasis jobs from ${KEKA_ACTIVE_JOBS_URL}...`);
  const res = await fetch(KEKA_ACTIVE_JOBS_URL, { signal: AbortSignal.timeout(15_000) });
  if (!res.ok) {
    throw new Error(`Failed to fetch Keka jobs: HTTP ${res.status}`);
  }

  const kekaJobs = (await res.json()) as KekaJob[];
  console.log(`Found ${kekaJobs.length} active jobs on Keka portal.`);

  for (const kj of kekaJobs) {
    const title = kj.title.replace(/\s+/g, ' ').trim();
    const link = `https://dcx.keka.com/careers/jobdetails/${kj.id}`;

    if (!isConcreteJobOpening(title, link)) {
      console.warn(`Disqualified non-concrete job: ${kj.id} ${title}`);
      continue;
    }

    const location = resolveJobLocation(kj);
    const id = `bitoasis-keka-${kj.id}`;
    const cleanHtml = cleanKekaDescriptionHtml(kj.description);
    const department = kj.departmentName?.replace(/^BO\s*-\s*|^DCX\s*-\s*/i, '').trim() || 'Operations';
    const salary = formatSalary(kj);
    const date = new Date(kj.publishedOn).toISOString();

    const jobRow: Job = {
      id,
      title,
      company: 'BitOasis',
      link,
      applyUrl: link,
      date,
      dateVerified: true,
      dateSource: 'Keka.JobPosting.publishedOn',
      source: 'BitOasis Careers [bitoasis]',
      location,
      department,
      ...(salary && { salary }),
      active: true,
      ...(previousById.get(id)?.slug && { slug: previousById.get(id)!.slug }),
    };

    added.push(jobRow);
    descriptions[getJobContentKey(jobRow)] = cleanHtml;
  }

  const merged = eligibleIngestedJobs([...filtered, ...added]);
  const legacyArchive = loadJobLegacyArchive(root);
  assignJobSlugsAndSyncLegacyArchive(
    merged,
    legacyArchive,
    loadReservedRootSlugsSync(),
    loadPublishedRootSlugsSync()
  );
  writeJobLegacyArchive(legacyArchive, root);

  merged.sort(
    (a, b) =>
      new Date(String((b as { date: string }).date)).getTime() -
      new Date(String((a as { date: string }).date)).getTime()
  );

  fs.writeFileSync(cachePath, `${JSON.stringify(merged, null, 2)}\n`);
  writeJobDescriptionStore(
    {
      descriptions,
      aliases: { ...store.aliases, ...buildJobDescriptionAliases(merged, descriptions) },
    },
    root
  );

  console.log(`✓ Ingested ${added.length} BitOasis jobs; total cached jobs: ${merged.length}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
