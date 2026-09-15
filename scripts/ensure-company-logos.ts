/**
 * Audit + backfill company logos for OG job cards.
 * Ensures public/logo/companies/<slug>.png exists for every company in jobs-cache.
 *
 * Usage:
 *   npx tsx scripts/ensure-company-logos.ts           # download missing
 *   npx tsx scripts/ensure-company-logos.ts --dry-run # report only
 */

import fs from 'fs';
import path from 'path';
import { getJobs } from '../src/lib/jobs';
import { getCompanySlug } from '../src/lib/job-slugs';
import {
  resolveCompanyLogo,
  getCompanyFaviconUrl,
  getCompanyFaviconUrlBySlug,
} from '../src/lib/company-logo';

const DRY_RUN = process.argv.includes('--dry-run');
const OUT_DIR = path.join(process.cwd(), 'public/logo/companies');
const MIN_BYTES = 80; // reject tiny/empty placeholders

/** Explicit domains for companies whose ATS links don't reveal the brand site. */
const DOMAIN_OVERRIDES: Record<string, string> = {
  'mantra-chain': 'mantrachain.io',
  'skip-protocol': 'skip.money',
  kiln: 'kiln.fi',
  'arch-network': 'arch.network',
  somnia: 'somnia.network',
  anagram: 'anagram.xyz',
  grayscale: 'grayscale.com',
  'grayscale-investments': 'grayscale.com',
  dakota: 'dakota.io',
  fintax: 'fintax.ai',
  'story-protocol': 'story.foundation',
  bitway: 'bitway.io',
  paribu: 'paribu.com',
  gensyn: 'gensyn.ai',
};

/** When slug.png is missing but a related file exists, copy/reuse it. */
const LOGO_FILE_ALIASES: Record<string, string[]> = {
  'mantra-chain': ['mantra.png', 'mantra.webp'],
  grayscale: ['grayscale-investments.png', 'grayscale-investments.webp'],
  'grayscale-investments': ['grayscale.png'],
  bitway: ['bitway.svg'],
  fintax: ['fintax.svg'],
};

type CompanyInfo = {
  slug: string;
  name: string;
  count: number;
  link?: string;
};

function domainFromJobLink(link?: string): string | null {
  if (!link) return null;
  try {
    const host = new URL(link).hostname.replace(/^www\./, '');
    // Skip ATS hosts — they aren't company domains
    if (
      /greenhouse\.io|lever\.co|ashbyhq\.com|workable\.com|recruitee\.com|smartrecruiters\.com|bamboohr\.com|jobvite\.com|myworkdayjobs\.com|applytojob\.com|comeet\.com|teamtailor\.com|rippling\.com|getro\.com|wellfound\.com|linkedin\.com/i.test(
        host
      )
    ) {
      return null;
    }
    return host;
  } catch {
    return null;
  }
}

async function downloadPng(url: string, dest: string): Promise<boolean> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'HashtagWeb3-LogoBot/1.0' },
    });
    if (!res.ok) return false;
    const contentType = (res.headers.get('content-type') || '').toLowerCase();
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.byteLength < MIN_BYTES) return false;
    // Accept png/webp/jpeg/ico/svg-as-favicons; Google favicon API returns PNG
    if (
      contentType &&
      !contentType.includes('image') &&
      !contentType.includes('octet-stream')
    ) {
      return false;
    }
    fs.writeFileSync(dest, buf);
    return true;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

async function ensurePngForSlug(info: CompanyInfo): Promise<'had' | 'copied' | 'fetched' | 'failed'> {
  const dest = path.join(OUT_DIR, `${info.slug}.png`);
  if (fs.existsSync(dest) && fs.statSync(dest).size >= MIN_BYTES) {
    return 'had';
  }

  // Reuse known sibling / alias files under public/logo/companies
  for (const candidate of LOGO_FILE_ALIASES[info.slug] || []) {
    const abs = path.join(OUT_DIR, candidate);
    if (!fs.existsSync(abs)) continue;
    if (candidate.endsWith('.png')) {
      if (!DRY_RUN) fs.copyFileSync(abs, dest);
      return 'copied';
    }
    if (candidate.endsWith('.svg') && !DRY_RUN) {
      try {
        const sharp = (await import('sharp')).default;
        await sharp(abs)
          .resize(128, 128, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
          .png()
          .toFile(dest);
        if (fs.existsSync(dest) && fs.statSync(dest).size >= MIN_BYTES) return 'copied';
      } catch {
        // fall through to favicon fetch
      }
    }
  }

  // If resolveCompanyLogo found a png under job/partners/alias, copy it
  const resolved = resolveCompanyLogo(info.slug);
  if (resolved) {
    const abs = path.join(process.cwd(), 'public', resolved);
    if (resolved.endsWith('.png') && abs !== dest && fs.existsSync(abs)) {
      if (!DRY_RUN) fs.copyFileSync(abs, dest);
      return 'copied';
    }
    if (resolved.endsWith('.webp') && fs.existsSync(abs)) {
      const siblingPng = abs.replace(/\.webp$/i, '.png');
      if (fs.existsSync(siblingPng)) {
        if (!DRY_RUN) fs.copyFileSync(siblingPng, dest);
        return 'copied';
      }
    }
  }

  if (DRY_RUN) return 'failed';

  const candidates: string[] = [];
  const override = DOMAIN_OVERRIDES[info.slug];
  if (override) {
    candidates.push(
      `https://www.google.com/s2/favicons?domain=${override}&sz=128`,
      `https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${override}&size=128`
    );
  }
  const fromLink = domainFromJobLink(info.link);
  if (fromLink) {
    candidates.push(
      `https://www.google.com/s2/favicons?domain=${fromLink}&sz=128`,
      `https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${fromLink}&size=128`
    );
  }
  candidates.push(getCompanyFaviconUrlBySlug(info.slug));

  const seen = new Set<string>();
  for (const url of candidates) {
    if (!url || seen.has(url)) continue;
    seen.add(url);
    if (await downloadPng(url, dest)) return 'fetched';
  }

  return 'failed';
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const jobs = await getJobs();

  const bySlug = new Map<string, CompanyInfo>();
  for (const job of jobs) {
    const slug = getCompanySlug(job.company);
    const existing = bySlug.get(slug);
    if (existing) {
      existing.count += 1;
      if (!existing.link && job.link) existing.link = job.link;
    } else {
      bySlug.set(slug, {
        slug,
        name: job.company,
        count: 1,
        link: job.link,
      });
    }
  }

  const companies = [...bySlug.values()].sort((a, b) => b.count - a.count);
  console.log(`Companies in jobs cache: ${companies.length}`);
  if (DRY_RUN) console.log('DRY RUN — no files will be written\n');

  let had = 0;
  let copied = 0;
  let fetched = 0;
  let failed = 0;
  const failures: CompanyInfo[] = [];

  // Concurrency-limited queue
  const concurrency = 8;
  let i = 0;
  async function worker() {
    while (i < companies.length) {
      const idx = i++;
      const info = companies[idx];
      const result = await ensurePngForSlug(info);
      if (result === 'had') had++;
      else if (result === 'copied') {
        copied++;
        console.log(`copied  ${info.slug} (${info.name})`);
      } else if (result === 'fetched') {
        fetched++;
        console.log(`fetched ${info.slug} (${info.name})`);
      } else {
        failed++;
        failures.push(info);
        console.log(`FAILED  ${info.slug} (${info.name}, ${info.count} jobs)`);
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()));

  console.log('\n========== SUMMARY ==========');
  console.log(`Already had PNG: ${had}`);
  console.log(`Copied from sibling: ${copied}`);
  console.log(`Fetched: ${fetched}`);
  console.log(`Failed: ${failed}`);
  if (failures.length) {
    console.log('\nStill missing:');
    for (const f of failures.slice(0, 80)) {
      console.log(`  - ${f.slug} | ${f.name} | ${f.count} jobs | ${f.link || ''}`);
    }
    if (failures.length > 80) console.log(`  ... +${failures.length - 80} more`);
  }

  // Final coverage check using resolveCompanyLogo (any format) AND png path
  let withPng = 0;
  for (const c of companies) {
    if (fs.existsSync(path.join(OUT_DIR, `${c.slug}.png`))) withPng++;
  }
  console.log(`\nCoverage: ${withPng}/${companies.length} companies have /logo/companies/<slug>.png`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
