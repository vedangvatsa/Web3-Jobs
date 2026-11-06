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

const INFOSYS_JOB_CODES = [
  'INFSYS-EXTERNAL-253485',
  'INFSYS-EXTERNAL-253489',
  'INFSYS-EXTERNAL-253494',
  'INFSYS-EXTERNAL-253496',
  'INFSYS-EXTERNAL-253530',
  'INFSYS-EXTERNAL-255106',
  'INFSYS-EXTERNAL-255107',
];

interface InfosysApiJob {
  postingId?: number;
  requisitionId?: number;
  postingTitle?: string;
  postingDesc?: string;
  rolesResponsibilities?: string;
  techRequirement?: string;
  addResponsibility?: string | null;
  unit?: string;
  roleDesignation?: string;
  preferredSkills?: string;
  educationalRequirement?: string;
  createdOn?: string;
  minExperienceLevel?: number;
  maxExperienceLevel?: number;
  city?: string;
  country?: string;
  referenceCode?: string;
  organizationName?: string;
  publicationId?: number;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function textToHtmlList(text: string | null | undefined): string {
  if (!text) return '';
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.replace(/^[\s•\-\*·▪–—]+/, '').trim())
    .filter(Boolean);
  if (!lines.length) return '';
  return `<ul>\n${lines.map((l) => `  <li>${escapeHtml(l)}</li>`).join('\n')}\n</ul>`;
}

function buildJobDescription(data: InfosysApiJob): string {
  const parts: string[] = [];

  parts.push(
    '<p><strong>About Infosys:</strong> Infosys is a global leader in next-generation digital services and consulting, enabling clients across more than 50 countries to navigate digital transformation and scale enterprise blockchain infrastructure.</p>'
  );

  if (data.postingDesc?.trim()) {
    parts.push(`<h3>About the Role</h3>\n<p>${escapeHtml(data.postingDesc.trim())}</p>`);
  }

  const responsibilitiesList = textToHtmlList(data.rolesResponsibilities);
  if (responsibilitiesList) {
    parts.push(`<h3>Responsibilities</h3>\n${responsibilitiesList}`);
  }

  const techRequirementsList = textToHtmlList(data.techRequirement);
  if (techRequirementsList) {
    parts.push(`<h3>Technical &amp; Professional Requirements</h3>\n${techRequirementsList}`);
  }

  if (data.preferredSkills?.trim()) {
    const skillsClean = data.preferredSkills
      .split(',')
      .map((s) => s.replace(/Technology->/g, '').replace(/->/g, ' / ').trim())
      .filter(Boolean)
      .join(', ');
    if (skillsClean) {
      parts.push(`<h3>Preferred Skills</h3>\n<p>${escapeHtml(skillsClean)}</p>`);
    }
  }

  if (data.educationalRequirement?.trim()) {
    parts.push(`<h3>Educational Requirements</h3>\n<p>${escapeHtml(data.educationalRequirement.trim())}</p>`);
  }

  if (data.minExperienceLevel != null && data.maxExperienceLevel != null) {
    parts.push(`<p><strong>Experience Level:</strong> ${data.minExperienceLevel} - ${data.maxExperienceLevel} Years</p>`);
  }

  return parts.join('\n\n');
}

function normalizeCity(raw: string | undefined): string {
  if (!raw) return 'Bangalore';
  const trimmed = raw.trim();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}

async function ensureInfosysBranding(root: string): Promise<void> {
  // 1. Ensure logo exists
  const logoDir = path.join(root, 'public/logo/companies');
  fs.mkdirSync(logoDir, { recursive: true });
  const logoPath = path.join(logoDir, 'infosys.png');

  if (!fs.existsSync(logoPath) || fs.statSync(logoPath).size < 100) {
    const faviconRes = await fetch('https://www.google.com/s2/favicons?domain=infosys.com&sz=128', {
      signal: AbortSignal.timeout(15_000),
    });
    if (faviconRes.ok) {
      const buffer = Buffer.from(await faviconRes.arrayBuffer());
      fs.writeFileSync(logoPath, buffer);
      console.log('✓ Ensured Infosys logo at', logoPath);
    }
  }

  // 2. Company branding
  const brandingPath = path.join(root, 'content/company-branding.json');
  const branding = fs.existsSync(brandingPath) ? JSON.parse(fs.readFileSync(brandingPath, 'utf8')) : {};
  if (!branding.infosys) {
    branding.infosys = {
      website: 'https://infosys.com',
      logo: '/logo/companies/infosys.png',
    };
    fs.writeFileSync(brandingPath, `${JSON.stringify(branding, null, 2)}\n`);
  }

  // 3. Company socials
  const socialsPath = path.join(root, 'content/company-socials.json');
  const socials = fs.existsSync(socialsPath) ? JSON.parse(fs.readFileSync(socialsPath, 'utf8')) : {};
  if (!socials.infosys) {
    socials.infosys = {
      website: 'https://infosys.com',
      linkedin: 'https://www.linkedin.com/company/infosys',
      twitter: 'https://x.com/Infosys',
    };
    fs.writeFileSync(socialsPath, `${JSON.stringify(socials, null, 2)}\n`);
  }

  // 4. Company markdown profile
  const companyMdPath = path.join(root, 'content/companies/infosys.md');
  if (!fs.existsSync(companyMdPath)) {
    const mdContent = `---
name: Infosys
website: 'https://infosys.com'
category: IT Services & Consulting
headquarters: Bangalore, India
description: "Infosys is a global leader in next-generation digital services and consulting. Established in 1981, Infosys enables clients in more than 50 countries to navigate their digital transformation, powering enterprise blockchain solutions, distributed ledger technologies, smart contract security, and Web3 enterprise architectures."
lastUpdated: 2026-11-07
---

Infosys is an international information technology and digital consulting organization building enterprise blockchain solutions, distributed ledger infrastructure, and Web3 applications.

The company actively hires talent across blockchain engineering, smart contract development, enterprise consulting, and distributed systems architecture.
`;
    fs.writeFileSync(companyMdPath, mdContent);
    console.log('✓ Created content/companies/infosys.md');
  }
}

async function main() {
  const root = process.cwd();
  await ensureInfosysBranding(root);

  const cachePath = path.join(root, 'content/jobs-cache.json');
  const allJobs = JSON.parse(fs.readFileSync(cachePath, 'utf8')) as Job[];
  const previousById = new Map(allJobs.map((j) => [String(j.id), j]));

  // Remove previous infosys jobs to do a clean upsert
  const filtered = allJobs.filter((j) => {
    const companyMatch = j.company?.toLowerCase() === 'infosys';
    const linkMatch = String(j.link || '').includes('career.infosys.com');
    return !companyMatch && !linkMatch;
  });

  const store = readJobDescriptionStore(root);
  const descriptions = { ...store.descriptions };
  const added: Job[] = [];

  for (const code of INFOSYS_JOB_CODES) {
    const apiUrl = `https://intapgateway.infosysapps.com/careersci/search/intapjbsrch/getJobDesc?referenceCode=${encodeURIComponent(code)}`;
    console.log(`Fetching ${code}...`);
    const res = await fetch(apiUrl, { signal: AbortSignal.timeout(15_000) });
    if (!res.ok) {
      console.warn(`Failed to fetch ${code}: HTTP ${res.status}`);
      continue;
    }
    const data = (await res.json()) as InfosysApiJob;
    const title = (data.postingTitle || 'Blockchain Developer').replace(/\s+/g, ' ').trim();
    const link = `https://career.infosys.com/jobdesc?jobReferenceCode=${code}&sourceId=1`;

    if (!isConcreteJobOpening(title, link)) {
      console.warn(`Disqualified job ${code}: ${title}`);
      continue;
    }

    const city = normalizeCity(data.city);
    const location = `${city}, India`;
    const id = `infosys-${code.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

    const rawHtml = buildJobDescription(data);
    const cleanHtml = sanitizeJobDescriptionHtml(rawHtml, 'Infosys');

    const jobRow: Job = {
      id,
      title,
      company: 'Infosys',
      link,
      applyUrl: link,
      date: '2026-11-06T00:00:00.000Z',
      dateVerified: true,
      dateSource: 'Infosys Careers Portal',
      source: 'Infosys Careers [infosys]',
      location,
      department: data.unit || 'Block Chain Services',
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

  console.log(`✓ Added ${added.length} Infosys jobs; cache now ${merged.length} jobs.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
