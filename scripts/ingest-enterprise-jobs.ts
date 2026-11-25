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

interface AmazonRawJob {
  id_icims: string;
  title: string;
  location: string;
  city?: string;
  state?: string;
  country_code?: string;
  posted_date: string;
  company_name: string;
  description: string;
  basic_qualifications?: string;
  preferred_qualifications?: string;
}

interface JpmcRawReq {
  Id: number | string;
  Title: string;
  PrimaryLocation?: string;
  PostedDate?: string;
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
    .split(/<br\s*\/?>|\r?\n/)
    .map((l) => l.replace(/^[\s•\-\*·▪–—]+/, '').trim())
    .filter(Boolean);
  if (!lines.length) return '';
  return `<ul>\n${lines.map((l) => `  <li>${escapeHtml(l)}</li>`).join('\n')}\n</ul>`;
}

function buildAwsJobDescription(job: AmazonRawJob): string {
  const parts: string[] = [];

  parts.push(
    '<p><strong>About Amazon Web Services (AWS):</strong> Amazon Web Services (AWS) is the world’s most comprehensive and broadly adopted cloud platform, powering leading enterprises, startups, and decentralized Web3 protocols worldwide.</p>'
  );

  if (job.description) {
    const cleanDesc = job.description
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .trim();
    parts.push(`<h3>About the Role</h3>\n<p>${escapeHtml(cleanDesc)}</p>`);
  }

  if (job.basic_qualifications) {
    parts.push(`<h3>Basic Qualifications</h3>\n${textToHtmlList(job.basic_qualifications)}`);
  }

  if (job.preferred_qualifications) {
    parts.push(`<h3>Preferred Qualifications</h3>\n${textToHtmlList(job.preferred_qualifications)}`);
  }

  return parts.join('\n\n');
}

async function ensureEnterpriseBranding(root: string): Promise<void> {
  const logoDir = path.join(root, 'public/logo/companies');
  fs.mkdirSync(logoDir, { recursive: true });

  const brandingPath = path.join(root, 'content/company-branding.json');
  const branding = fs.existsSync(brandingPath) ? JSON.parse(fs.readFileSync(brandingPath, 'utf8')) : {};

  const socialsPath = path.join(root, 'content/company-socials.json');
  const socials = fs.existsSync(socialsPath) ? JSON.parse(fs.readFileSync(socialsPath, 'utf8')) : {};

  // AWS Branding
  const awsLogo = path.join(logoDir, 'aws.png');
  if (!fs.existsSync(awsLogo) || fs.statSync(awsLogo).size < 100) {
    try {
      const res = await fetch('https://www.google.com/s2/favicons?domain=aws.amazon.com&sz=128', {
        signal: AbortSignal.timeout(10_000),
      });
      if (res.ok) fs.writeFileSync(awsLogo, Buffer.from(await res.arrayBuffer()));
    } catch {}
  }

  if (!branding.aws) {
    branding.aws = {
      website: 'https://aws.amazon.com',
      logo: '/logo/companies/aws.png',
    };
    fs.writeFileSync(brandingPath, `${JSON.stringify(branding, null, 2)}\n`);
  }

  if (!socials.aws) {
    socials.aws = {
      website: 'https://aws.amazon.com',
      linkedin: 'https://www.linkedin.com/company/amazon-web-services',
      twitter: 'https://x.com/awscloud',
    };
    fs.writeFileSync(socialsPath, `${JSON.stringify(socials, null, 2)}\n`);
  }

  // AWS Company Profile
  const awsMdPath = path.join(root, 'content/companies/aws.md');
  if (!fs.existsSync(awsMdPath)) {
    const md = `---
name: AWS
website: 'https://aws.amazon.com'
category: Cloud Infrastructure & AI
headquarters: Seattle, WA, United States
description: "Amazon Web Services (AWS) is the world’s most comprehensive and broadly adopted cloud platform. AWS powers global financial services, digital native businesses, and decentralized Web3 ecosystems with high-performance computing, managed blockchain infrastructure, and institutional-grade security."
lastUpdated: 2026-11-25
---

Amazon Web Services (AWS) is the premier cloud computing infrastructure provider powering next-generation financial technology and Web3 ecosystems.

AWS actively recruits specialized talent across Web3 business development, digital asset custody architecture, blockchain node infrastructure, and decentralized systems.
`;
    fs.writeFileSync(awsMdPath, md);
  }
}

async function fetchAwsWeb3Jobs(): Promise<AmazonRawJob[]> {
  const keywords = ['web3', 'blockchain', 'cryptocurrency', 'tokenization', 'crypto'];
  const map = new Map<string, AmazonRawJob>();

  for (const kw of keywords) {
    const url = `https://www.amazon.jobs/en/search.json?base_query=${encodeURIComponent(kw)}&result_type=job`;
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(10_000) });
      if (!res.ok) continue;
      const data = (await res.json()) as { jobs?: AmazonRawJob[] };
      for (const j of data.jobs || []) {
        if (!map.has(j.id_icims)) map.set(j.id_icims, j);
      }
    } catch (e) {
      console.warn(`AWS search error for ${kw}:`, e);
    }
  }

  const now = Date.now();
  const valid: AmazonRawJob[] = [];

  for (const job of map.values()) {
    const text = `${job.title} ${job.description} ${job.basic_qualifications} ${job.preferred_qualifications}`.toLowerCase();
    if (text.includes('prime video') || text.includes('theatrical') || text.includes('animation')) continue;
    if (text.includes('visual design') && !text.includes('web3')) continue;

    const isWeb3 =
      text.includes('web3') ||
      text.includes('blockchain') ||
      text.includes('cryptocurrency') ||
      text.includes('crypto assets');

    if (!isWeb3) continue;

    const parsedDate = new Date(job.posted_date);
    if (Number.isNaN(parsedDate.getTime())) continue;
    const ageDays = (now - parsedDate.getTime()) / (1000 * 60 * 60 * 24);
    if (ageDays <= 30) {
      valid.push(job);
    }
  }

  return valid;
}

export async function ingestEnterpriseJobs(root: string = process.cwd()): Promise<number> {
  await ensureEnterpriseBranding(root);

  const cachePath = path.join(root, 'content/jobs-cache.json');
  const allJobs = JSON.parse(fs.readFileSync(cachePath, 'utf8')) as Job[];
  const previousById = new Map(allJobs.map((j) => [String(j.id), j]));

  // Clean out previous AWS jobs to do a fresh upsert
  const filtered = allJobs.filter((j) => {
    const isAws = j.company?.toLowerCase() === 'aws' || j.company?.toLowerCase() === 'amazon web services';
    const isAwsSource = String(j.source || '').includes('amazon.jobs') || String(j.source || '').includes('Amazon Web Services');
    return !isAws && !isAwsSource;
  });

  const store = readJobDescriptionStore(root);
  const descriptions = { ...store.descriptions };
  const added: Job[] = [];

  // 1. Fetch AWS Web3 roles
  const awsJobs = await fetchAwsWeb3Jobs();
  console.log(`Found ${awsJobs.length} fresh, qualified Web3 jobs on AWS.`);

  for (const raw of awsJobs) {
    const id = `aws-${raw.id_icims}`;
    const title = raw.title.replace(/\s+/g, ' ').trim();
    const link = `https://www.amazon.jobs/en/jobs/${raw.id_icims}`;
    const applyUrl = link; // DIRECT OFFICIAL LINK: No aggregators!

    if (!isConcreteJobOpening(title, link)) continue;

    const locParts = (raw.location || '').split(',').map((s) => s.trim()).filter(Boolean);
    const location = locParts.length > 1 ? `${locParts[1]}, ${locParts[0]}` : raw.location || 'Remote';

    const parsedDate = new Date(raw.posted_date);
    const isoDate = !Number.isNaN(parsedDate.getTime()) ? parsedDate.toISOString() : new Date().toISOString();

    const rawHtml = buildAwsJobDescription(raw);
    const cleanHtml = sanitizeJobDescriptionHtml(rawHtml, 'AWS');

    const jobRow: Job = {
      id,
      title,
      company: 'AWS',
      link,
      applyUrl,
      date: isoDate,
      dateVerified: true,
      dateSource: 'AWS Careers Portal',
      source: 'Amazon Web Services [amazon.jobs]',
      location,
      department: 'Financial Services & Web3',
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

  console.log(`✓ Added ${added.length} AWS Web3 jobs directly linking to amazon.jobs. Cache now ${merged.length} jobs.`);
  return added.length;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  ingestEnterpriseJobs().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
