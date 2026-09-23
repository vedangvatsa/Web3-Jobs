/**
 * Audit + backfill company logos for OG job cards.
 * Ensures public/logo/companies/<slug>.png exists for every company in the catalog.
 * Re-fetches favicons when the on-disk PNG is missing, tiny, ICO/JPEG mislabeled, or unreadable.
 *
 * Usage:
 *   npx tsx scripts/ensure-company-logos.ts           # download missing / refresh bad
 *   npx tsx scripts/ensure-company-logos.ts --dry-run # report only
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execSync } from 'child_process';
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
const MIN_EDGE_PX = 48; // below this, favicons look broken on company pages
const DUPLICATE_MAX_BYTES = 2500; // shared tiny files copied to wrong slugs

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
  securitize: 'securitize.io',
  cournot: 'yzilabs.com',
  mercuryo: 'mercuryo.com',
  'mysten-labs': 'mystenlabs.com',
  'subzero-labs': 'subzerolabs.org',
  transak: 'transak.com',
  aspora: 'aspora.com',
  augustus: 'augustus.com',
  mural: 'muralpay.com',
  'wormhole-labs': 'wormholelabs.xyz',
  drw: 'drw.com',
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
  website?: string;
  link?: string;
};

type LogoQuality =
  | { ok: true }
  | { ok: false; reason: string };

function fileDescription(abs: string): string {
  try {
    return execSync(`file -b ${JSON.stringify(abs)}`, { encoding: 'utf8' }).trim();
  } catch {
    return '';
  }
}

async function assessLogoQuality(
  abs: string,
  opts?: { slug?: string; duplicateSlugs?: Set<string>; strictBytes?: boolean },
): Promise<LogoQuality> {
  if (!fs.existsSync(abs)) return { ok: false, reason: 'missing' };
  const bytes = fs.statSync(abs).size;
  if (bytes < MIN_BYTES) return { ok: false, reason: 'too-small-bytes' };
  if (opts?.slug && opts.duplicateSlugs?.has(opts.slug)) {
    return { ok: false, reason: 'duplicate-hash' };
  }

  const desc = fileDescription(abs);
  if (/icon resource/i.test(desc)) return { ok: false, reason: 'ico-not-png' };
  if (/JPEG image/i.test(desc)) return { ok: false, reason: 'jpeg-not-png' };

  try {
    const sharp = (await import('sharp')).default;
    const meta = await sharp(abs).metadata();
    const w = meta.width ?? 0;
    const h = meta.height ?? 0;
    if (w < MIN_EDGE_PX || h < MIN_EDGE_PX) {
      return { ok: false, reason: `tiny-${w}x${h}` };
    }
    if (opts?.strictBytes && bytes < 900) {
      return { ok: false, reason: `low-bytes-${bytes}` };
    }
    return { ok: true };
  } catch {
    return { ok: false, reason: 'unreadable' };
  }
}

function buildDuplicateSlugSet(slugs: string[]): Set<string> {
  const byHash = new Map<string, { bytes: number; slugs: string[] }>();
  for (const slug of slugs) {
    const abs = path.join(OUT_DIR, `${slug}.png`);
    if (!fs.existsSync(abs)) continue;
    const buf = fs.readFileSync(abs);
    const hash = crypto.createHash('md5').update(buf).digest('hex');
    const entry = byHash.get(hash) ?? { bytes: buf.byteLength, slugs: [] };
    entry.slugs.push(slug);
    byHash.set(hash, entry);
  }
  const dupes = new Set<string>();
  for (const { bytes, slugs: group } of byHash.values()) {
    if (group.length > 1 && bytes <= DUPLICATE_MAX_BYTES) {
      for (const s of group) dupes.add(s);
    }
  }
  return dupes;
}

async function normalizeToPng128(src: Buffer, dest: string): Promise<boolean> {
  try {
    const sharp = (await import('sharp')).default;
    await sharp(src)
      .resize(128, 128, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png()
      .toFile(dest);
    const q = await assessLogoQuality(dest);
    return q.ok;
  } catch {
    return false;
  }
}

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
  const timeout = setTimeout(() => controller.abort(), 15000);
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
    return normalizeToPng128(buf, dest);
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchLogoForSlug(info: CompanyInfo, dest: string): Promise<boolean> {
  const candidates: string[] = [];
  const override = DOMAIN_OVERRIDES[info.slug];
  if (override) {
    candidates.push(
      `https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${override}&size=128`,
      `https://www.google.com/s2/favicons?domain=${override}&sz=128`,
    );
  }
  if (info.website) {
    const fromSite = getCompanyFaviconUrl(info.website);
    if (fromSite) candidates.push(fromSite);
  }
  const fromLink = domainFromJobLink(info.link);
  if (fromLink) {
    candidates.push(
      `https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${fromLink}&size=128`,
      `https://www.google.com/s2/favicons?domain=${fromLink}&sz=128`,
    );
  }
  candidates.push(getCompanyFaviconUrlBySlug(info.slug));

  const seen = new Set<string>();
  for (const url of candidates) {
    if (!url || seen.has(url)) continue;
    seen.add(url);
    if (await downloadPng(url, dest)) return true;
  }
  return false;
}

async function ensurePngForSlug(
  info: CompanyInfo,
  duplicateSlugs: Set<string>,
): Promise<'had' | 'copied' | 'fetched' | 'refreshed' | 'failed'> {
  const dest = path.join(OUT_DIR, `${info.slug}.png`);
  const existing = await assessLogoQuality(dest, {
    slug: info.slug,
    duplicateSlugs,
  });
  if (existing.ok) return 'had';

  // Reuse known sibling / alias files under public/logo/companies
  for (const candidate of LOGO_FILE_ALIASES[info.slug] || []) {
    const abs = path.join(OUT_DIR, candidate);
    if (!fs.existsSync(abs)) continue;
    if (candidate.endsWith('.png')) {
      const aliasQ = await assessLogoQuality(abs);
      if (aliasQ.ok) {
        if (!DRY_RUN) fs.copyFileSync(abs, dest);
        return 'copied';
      }
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

  // If resolveCompanyLogo found a png under job/partners/alias, copy/normalize it
  const resolved = resolveCompanyLogo(info.slug);
  if (resolved) {
    const abs = path.join(process.cwd(), 'public', resolved);
    if (resolved.endsWith('.png') && abs !== dest && fs.existsSync(abs)) {
      const siblingQ = await assessLogoQuality(abs);
      if (siblingQ.ok) {
        if (!DRY_RUN) fs.copyFileSync(abs, dest);
        return 'copied';
      }
    }
    if (resolved.endsWith('.webp') && fs.existsSync(abs)) {
      const siblingPng = abs.replace(/\.webp$/i, '.png');
      if (fs.existsSync(siblingPng)) {
        const siblingQ = await assessLogoQuality(siblingPng);
        if (siblingQ.ok) {
          if (!DRY_RUN) fs.copyFileSync(siblingPng, dest);
          return 'copied';
        }
      }
    }
  }

  if (DRY_RUN) {
    console.log(`refresh ${info.slug} (${existing.reason})`);
    return 'failed';
  }

  const hadFile = fs.existsSync(dest);
  if (await fetchLogoForSlug(info, dest)) {
    return hadFile ? 'refreshed' : 'fetched';
  }

  return 'failed';
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const runtime = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'content/companies-runtime.json'), 'utf8'),
  ) as Record<
    string,
    { name: string; website?: string; jobCount?: number }
  >;
  const jobs = await getJobs();

  const bySlug = new Map<string, CompanyInfo>();
  for (const [slug, row] of Object.entries(runtime)) {
    bySlug.set(slug, {
      slug,
      name: row.name,
      count: row.jobCount ?? 0,
      website: row.website,
    });
  }
  for (const job of jobs) {
    const slug = getCompanySlug(job.company);
    const existing = bySlug.get(slug);
    if (existing) {
      existing.count = Math.max(existing.count, 1);
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
  console.log(`Companies in catalog: ${companies.length}`);
  const duplicateSlugs = buildDuplicateSlugSet(companies.map((c) => c.slug));
  if (duplicateSlugs.size) {
    console.log(`Duplicate placeholder hashes: ${duplicateSlugs.size} slugs flagged`);
  }
  if (DRY_RUN) console.log('DRY RUN — no files will be written\n');

  let had = 0;
  let copied = 0;
  let fetched = 0;
  let refreshed = 0;
  let failed = 0;
  const failures: CompanyInfo[] = [];

  // Concurrency-limited queue
  const concurrency = 8;
  let i = 0;
  async function worker() {
    while (i < companies.length) {
      const idx = i++;
      const info = companies[idx];
      const result = await ensurePngForSlug(info, duplicateSlugs);
      if (result === 'had') had++;
      else if (result === 'copied') {
        copied++;
        console.log(`copied  ${info.slug} (${info.name})`);
      } else if (result === 'fetched') {
        fetched++;
        console.log(`fetched ${info.slug} (${info.name})`);
      } else if (result === 'refreshed') {
        refreshed++;
        console.log(`refresh ${info.slug} (${info.name})`);
      } else {
        failed++;
        failures.push(info);
        console.log(`FAILED  ${info.slug} (${info.name}, ${info.count} jobs)`);
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()));

  console.log('\n========== SUMMARY ==========');
  console.log(`Already OK: ${had}`);
  console.log(`Copied from sibling: ${copied}`);
  console.log(`Fetched new: ${fetched}`);
  console.log(`Refreshed bad: ${refreshed}`);
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
