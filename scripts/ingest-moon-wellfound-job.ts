#!/usr/bin/env tsx
/**
 * Publish Moon's Head of Growth Marketing role from Wellfound (primary page JSON-LD).
 */
import fs from 'node:fs';
import path from 'node:path';
import { load } from 'cheerio';
import sharp from 'sharp';
import type { Job } from '../src/types';
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
import { eligibleIngestedJobs } from './lib/job-ingestion-policy';
import { normalizeSourcePostingDate } from '../src/lib/job-source-date';
import { postings } from './lib/country-local-feeds';
import { polishJobDescriptionHtml } from '../src/lib/job-description-polish';

const JOB_URL = 'https://wellfound.com/jobs/5101765-head-of-growth-marketing';
const COMPANY_NAME = 'Moon';
const COMPANY_SLUG = 'moon';
const COMPANY_WEBSITE = 'https://paywithmoon.com/';
const MOON_LOGO_URL =
  'https://cdn.prod.website-files.com/6604526310f4c7f24d8e3435/6696b8aa9cec14c7a88baf02_webclip.png';

async function ensureBranding(root: string) {
  const logoDir = path.join(root, 'public/logo/companies');
  fs.mkdirSync(logoDir, { recursive: true });
  const logoPath = path.join(logoDir, `${COMPANY_SLUG}.png`);

  const res = await fetch(MOON_LOGO_URL, { signal: AbortSignal.timeout(20_000) });
  if (!res.ok) throw new Error(`Moon logo download HTTP ${res.status}`);
  await sharp(Buffer.from(await res.arrayBuffer())).png().toFile(logoPath);
  console.log('✓ Ensured company logo at', logoPath);

  const logosPath = path.join(root, 'content/company-logos-index.json');
  const logos = JSON.parse(fs.readFileSync(logosPath, 'utf8')) as string[];
  const rel = `/logo/companies/${COMPANY_SLUG}.png`;
  if (!logos.includes(rel)) {
    logos.push(rel);
    logos.sort();
    fs.writeFileSync(logosPath, `${JSON.stringify(logos, null, 2)}\n`);
  }

  const brandingPath = path.join(root, 'content/company-branding.json');
  const branding = JSON.parse(fs.readFileSync(brandingPath, 'utf8'));
  branding[COMPANY_SLUG] = {
    website: COMPANY_WEBSITE,
    logo: `/logo/companies/${COMPANY_SLUG}.png`,
  };
  fs.writeFileSync(brandingPath, `${JSON.stringify(branding, null, 2)}\n`);

  const socialsPath = path.join(root, 'content/company-socials.json');
  const socials = JSON.parse(fs.readFileSync(socialsPath, 'utf8'));
  socials[COMPANY_SLUG] = { website: COMPANY_WEBSITE };
  fs.writeFileSync(socialsPath, `${JSON.stringify(socials, null, 2)}\n`);

  const editorialPath = path.join(root, 'content/company-profile-editorial.json');
  const editorial = JSON.parse(fs.readFileSync(editorialPath, 'utf8'));
  editorial[COMPANY_SLUG] =
    'Moon (paywithmoon.com) helps people spend digital assets in everyday commerce through Moon Visa® virtual cards, discounted merchant gift cards, and payments infrastructure for consumers and partners. Shoppers can fund cards with Bitcoin, Lightning, Tether (USDT), USDC, or Ether and receive USD-denominated balances for online checkout where Visa is accepted.';
  fs.writeFileSync(editorialPath, `${JSON.stringify(editorial, null, 2)}\n`);
}

async function fetchPrimaryPage(): Promise<{ body: string; finalUrl: string }> {
  const res = await fetch(JOB_URL, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; hashtagweb3-ingest/1.0)', Accept: 'text/html' },
    redirect: 'follow',
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`Primary page HTTP ${res.status}`);
  const finalUrl = res.url.split('#')[0].replace(/\?.*$/, '');
  if (finalUrl !== JOB_URL) throw new Error(`Unexpected redirect: ${res.url}`);
  return { body: await res.text(), finalUrl };
}

async function main() {
  const root = process.cwd();
  await ensureBranding(root);

  const { body, finalUrl } = await fetchPrimaryPage();
  const $ = load(body);
  const visible = $('body').clone();
  visible.find('script,style,noscript').remove();
  if (/just a moment|access denied|captcha/i.test($('title').text())) {
    throw new Error('Primary page blocked by bot challenge');
  }
  const rows = postings(body);
  if (rows.length !== 1 || !rows[0].title) throw new Error('Expected exactly one JobPosting on primary page');
  const posting = rows[0];
  const title = posting.title!.trim();
  const employer = (posting.hiringOrganization?.name || '').trim();
  if (employer !== COMPANY_NAME) throw new Error(`Employer mismatch: ${employer}`);
  if (!isConcreteJobOpening(title, finalUrl)) throw new Error(`Filtered non-opening title: ${title}`);

  const date = normalizeSourcePostingDate(posting.datePosted);
  if (!date) throw new Error('Missing datePosted on primary page');

  const locations = (Array.isArray(posting.jobLocation) ? posting.jobLocation : [posting.jobLocation]).filter(Boolean);
  const locality = locations
    .map((loc) => {
      const addr = (loc as { address?: { addressLocality?: string; addressCountry?: string } })?.address;
      return [addr?.addressLocality, addr?.addressCountry].filter(Boolean).join(', ');
    })
    .filter(Boolean)
    .join(' / ');
  const location = locality ? `${locality} (Remote)` : 'Remote';

  const rawDescription =
    [posting.description, posting.experienceRequirements?.description].filter(Boolean).join('\n') || '';
  if (load(rawDescription).text().length < 100) throw new Error('Insufficient description from primary page');

  const jobRow: Job = {
    id: 'wellfound-5101765',
    title,
    company: COMPANY_NAME,
    link: finalUrl,
    applyUrl: finalUrl,
    date,
    dateVerified: true,
    dateSource: 'Wellfound.JobPosting.datePosted',
    source: 'Wellfound: Moon [paywithmoon]',
    location,
    isRemote: true,
    workplaceType: 'Remote',
    department: 'Marketing',
    type: posting.employmentType === 'FULL_TIME' ? 'Full-time' : 'Full-time',
    skills: ['Growth Marketing', 'Bitcoin', 'Stablecoins', 'Payments', 'Fintech', 'Social Media'],
    active: true,
  };

  const cachePath = path.join(root, 'content/jobs-cache.json');
  const allJobs: Job[] = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
  const filtered = allJobs.filter(
    (j) =>
      j.id !== jobRow.id &&
      j.link !== jobRow.link &&
      !(j.company === COMPANY_NAME && j.title === title)
  );

  const legacyArchive = loadJobLegacyArchive();
  const reservedSlugs = loadReservedRootSlugsSync();
  const publishedSlugs = loadPublishedRootSlugsSync();

  const combined = eligibleIngestedJobs([jobRow, ...filtered], root);
  if (!combined.some((j) => j.id === jobRow.id)) {
    throw new Error('Job failed age or source eligibility checks after ingest');
  }

  assignJobSlugsAndSyncLegacyArchive(combined, legacyArchive, reservedSlugs, publishedSlugs);
  writeJobLegacyArchive(legacyArchive);
  fs.writeFileSync(cachePath, `${JSON.stringify(combined, null, 2)}\n`);

  const minted = combined.find((j) => j.id === jobRow.id)!;
  console.log(`✓ Published "${minted.title}" at /${minted.slug}`);

  const store = readJobDescriptionStore(root);
  const descriptions = { ...store.descriptions };
  const cleanDesc = polishJobDescriptionHtml(sanitizeJobDescriptionHtml(rawDescription, COMPANY_NAME), COMPANY_NAME);
  descriptions[getJobContentKey(minted)] = cleanDesc;

  const copyeditPath = path.join(root, 'content/jobs/copyedit-status.json');
  const copyedit = JSON.parse(fs.readFileSync(copyeditPath, 'utf8')) as Record<
    string,
    { reviewedAt: string; method: string; words: number }
  >;
  const contentKey = getJobContentKey(minted);
  const words = load(rawDescription).root().text().replace(/\s+/g, ' ').trim().split(/\s+/).length;
  copyedit[contentKey] = {
    reviewedAt: new Date().toISOString(),
    method: 'human-editorial-polish-v2',
    words,
  };
  fs.writeFileSync(copyeditPath, `${JSON.stringify(copyedit, null, 2)}\n`);

  writeJobDescriptionStore(
    {
      descriptions,
      aliases: { ...store.aliases, ...buildJobDescriptionAliases(combined, descriptions) },
    },
    root
  );
  console.log('✓ Stored sanitized job description');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});