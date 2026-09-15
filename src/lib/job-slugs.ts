import type { Job } from '@/types';

const TRACKING_QUERY_PARAMS = new Set([
  'gh_src',
  'source',
  'ref',
  'referrer',
  't',
  'utm_campaign',
  'utm_content',
  'utm_medium',
  'utm_source',
  'utm_term',
]);

/**
 * Normalizes a source URL without removing identifiers needed by embedded ATS
 * pages. The result is used for deduplication, not for navigation.
 */
export function normalizeJobLink(link: string): string {
  try {
    const url = new URL(link);
    const hostname = url.hostname.toLowerCase();

    const greenhouseId = url.searchParams.get('gh_jid')
      || (hostname.includes('greenhouse.io') ? url.pathname.match(/\/jobs\/(\d+)/i)?.[1] : undefined)
      || url.pathname.match(/\/(?:careers\/)?positions\/(\d+)/i)?.[1];
    if (greenhouseId) return `greenhouse:${greenhouseId}`;

    const uuid = url.pathname.match(/\/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})(?:\/|$)/i)?.[1];
    if (uuid && hostname.includes('ashbyhq.com')) return `ashby:${uuid.toLowerCase()}`;
    if (uuid && hostname.includes('lever.co')) return `lever:${uuid.toLowerCase()}`;

    const workableId = hostname.includes('workable.com')
      ? url.pathname.match(/\/j\/([a-z0-9]+)(?:\/|$)/i)?.[1]
      : undefined;
    if (workableId) return `workable:${workableId.toLowerCase()}`;

    const breezyId = hostname.endsWith('.breezy.hr')
      ? url.pathname.match(/\/p\/([a-z0-9]+)(?:-|\/|$)/i)?.[1]
      : undefined;
    if (breezyId) return `breezy:${hostname}:${breezyId.toLowerCase()}`;

    url.hash = '';
    for (const param of [...url.searchParams.keys()]) {
      if (TRACKING_QUERY_PARAMS.has(param.toLowerCase())) {
        url.searchParams.delete(param);
      }
    }
    url.hostname = hostname;
    url.pathname = url.pathname.replace(/\/+$/, '') || '/';
    return url.toString();
  } catch {
    return link.trim().toLowerCase();
  }
}

/** A source-stable identity used by the cache, description store, and slugs. */
export function getJobIdentity(job: Pick<Job, 'id' | 'title' | 'company' | 'link'>): string {
  const normalizedLink = normalizeJobLink(job.link || '');
  if (normalizedLink) return normalizedLink;

  return [job.company, job.id, job.title]
    .map((value) => (value || '').trim().toLowerCase().replace(/\s+/g, ' '))
    .join('|');
}

/** Small deterministic hash that works in both server and browser bundles. */
function stableHash(value: string): string {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36).padStart(7, '0');
}

export function getJobContentKey(job: Pick<Job, 'id' | 'title' | 'company' | 'link'>): string {
  return `job-${stableHash(getJobIdentity(job))}`;
}

/**
 * Extracts exactly ONE word representing the core role category
 */
export function getOneWordRole(title: string): string {
  const t = title.toLowerCase();

  if (t.includes('solidity')) return 'solidity';
  if (t.includes('rust')) return 'rust';
  if (t.includes('zk') || t.includes('zero knowledge') || t.includes('cryptograph')) return 'cryptography';
  if (t.includes('frontend') || /\b(ui|ux)\b/i.test(t)) return 'frontend';
  if (t.includes('backend')) return 'backend';
  if (t.includes('full stack') || t.includes('fullstack')) return 'fullstack';
  if (t.includes('devops') || t.includes('infrastructure')) return 'devops';
  if (t.includes('security') || t.includes('audit')) return 'security';
  if (/\bqa\b/i.test(t) || t.includes('testing') || t.includes('quality')) return 'qa';
  if (t.includes('trader') || t.includes('quant')) return 'trader';
  if (t.includes('product') || /\bpm\b/i.test(t)) return 'product';
  if (t.includes('marketing') || t.includes('growth')) return 'marketing';
  if (t.includes('community')) return 'community';
  if (t.includes('devrel') || t.includes('developer relations')) return 'devrel';
  if (t.includes('compliance') || t.includes('legal') || t.includes('mlro')) return 'compliance';
  if (t.includes('recruiter') || t.includes('talent') || /\bhr\b/i.test(t)) return 'recruiting';
  if (t.includes('onboarding')) return 'onboarding';
  if (t.includes('supervisor')) return 'supervisor';
  if (t.includes('manager')) return 'manager';
  if (t.includes('analyst')) return 'analyst';
  if (t.includes('developer')) return 'developer';
  if (t.includes('engineer')) return 'engineer';
  if (t.includes('designer')) return 'designer';
  if (t.includes('writer')) return 'writer';
  if (t.includes('sales') || t.includes('account') || t.includes('business development') || /\bbd\b/i.test(t)) return 'sales';
  if (t.includes('operations') || /\bops\b/i.test(t)) return 'operations';
  if (t.includes('architect')) return 'architect';
  if (t.includes('intern')) return 'intern';
  if (t.includes('associate') || t.includes('assistant')) return 'associate';

  // Fallback to the first alphabetic word
  const words = t.replace(/[^a-z0-9\s]+/g, ' ').trim().split(/\s+/);
  return words[0] || 'job';
}

/**
 * Next slug for a role word: `product`, then `product1`, `product2`, … on collision.
 */
export function allocateSequentialRoleSlug(roleWord: string, usedSlugs: Set<string>): string {
  const base = (roleWord || 'job').toLowerCase().replace(/[^a-z0-9]/g, '') || 'job';
  if (!usedSlugs.has(base)) return base;
  for (let n = 1; n <= 999_999; n += 1) {
    const candidate = `${base}${n}`;
    if (!usedSlugs.has(candidate)) return candidate;
  }
  throw new Error(`Could not allocate slug for role: ${base}`);
}

/** Mint a public slug from a job title, respecting slugs already in use. */
export function mintJobSlugFromTitle(title: string, usedSlugs: Set<string>): string {
  const roleWord = getOneWordRole(title || 'job');
  return allocateSequentialRoleSlug(roleWord, usedSlugs);
}

/**
 * Keeps slugs for known postings (by employer URL identity). New postings get a
 * title keyword slug (`product`, `product1`, …) in oldest-first order.
 */
export function assignJobSlugsInCache(
  jobs: Array<Pick<Job, 'id' | 'title' | 'company' | 'link' | 'date' | 'slug'>>,
): void {
  const usedSlugs = new Set<string>();
  const identityToSlug = new Map<string, string>();

  for (const job of jobs) {
    const identity = getJobIdentity(job as Job);
    const slug = job.slug?.trim();
    if (slug && !usedSlugs.has(slug)) {
      identityToSlug.set(identity, slug);
      usedSlugs.add(slug);
    }
  }

  const sorted = [...jobs].sort((a, b) => {
    const ta = Date.parse(a.date || '') || 0;
    const tb = Date.parse(b.date || '') || 0;
    if (ta !== tb) return ta - tb;
    return String(a.id).localeCompare(String(b.id));
  });

  for (const job of sorted) {
    const identity = getJobIdentity(job as Job);
    const preserved = identityToSlug.get(identity);
    if (preserved) {
      job.slug = preserved;
      continue;
    }
    const slug = mintJobSlugFromTitle(job.title || 'job', usedSlugs);
    job.slug = slug;
    usedSlugs.add(slug);
    identityToSlug.set(identity, slug);
  }
}

/** @inheritdoc assignJobSlugsInCache */
export function rebakeJobSlugsInPlace(
  jobs: Array<Pick<Job, 'id' | 'title' | 'company' | 'link' | 'date' | 'slug'>>,
): void {
  assignJobSlugsInCache(jobs);
}

export type LegacySlugRecord = {
  id?: string;
  link?: string;
  company?: string;
  title?: string;
};

type JobSlugFields = Pick<Job, 'id' | 'title' | 'company' | 'link' | 'slug'>;

/** Record a retired public slug so old links (e.g. Telegram) keep resolving. */
export function retireJobSlugInArchive(
  archive: Record<string, LegacySlugRecord>,
  slug: string,
  job: JobSlugFields,
): boolean {
  const clean = slug?.trim();
  if (!clean || archive[clean]) return false;
  archive[clean] = {
    id: job.id,
    link: job.link,
    company: job.company,
    title: job.title,
  };
  return true;
}

/**
 * When a posting keeps the same identity but gets a new slug, retire the old slug.
 * When a posting drops out of the cache, retire its last slug.
 */
export function syncLegacyArchiveAfterSlugChanges(
  before: JobSlugFields[],
  after: JobSlugFields[],
  archive: Record<string, LegacySlugRecord>,
): number {
  let added = 0;
  const beforeByIdentity = new Map<string, { slug: string; job: JobSlugFields }>();
  for (const job of before) {
    const identity = getJobIdentity(job);
    if (job.slug?.trim()) {
      beforeByIdentity.set(identity, { slug: job.slug.trim(), job });
    }
  }

  const afterByIdentity = new Map<string, JobSlugFields>();
  const afterSlugs = new Set<string>();
  for (const job of after) {
    afterByIdentity.set(getJobIdentity(job), job);
    if (job.slug?.trim()) afterSlugs.add(job.slug.trim());
  }

  for (const [identity, { slug, job }] of beforeByIdentity) {
    const live = afterByIdentity.get(identity);
    if (live) {
      const nextSlug = live.slug?.trim();
      if (nextSlug && nextSlug !== slug) {
        if (retireJobSlugInArchive(archive, slug, job)) added += 1;
      }
      continue;
    }
    if (!afterSlugs.has(slug)) {
      if (retireJobSlugInArchive(archive, slug, job)) added += 1;
    }
  }

  return added;
}

/** Assign slugs and merge any retired URLs into the legacy archive. */
export function assignJobSlugsAndSyncLegacyArchive(
  jobs: JobSlugFields[],
  archive: Record<string, LegacySlugRecord>,
): number {
  const snapshot = jobs.map((job) => ({
    id: job.id,
    title: job.title,
    company: job.company,
    link: job.link,
    slug: job.slug,
  }));
  assignJobSlugsInCache(jobs);
  return syncLegacyArchiveAfterSlugChanges(snapshot, jobs, archive);
}

/** Public job detail path (always short slug at site root). */
export function getJobPublicPath(job: Pick<Job, 'slug' | 'id' | 'title' | 'company' | 'link'>): string {
  return `/${getJobSlug(job as Job)}`;
}

export function getJobPublicUrl(
  job: Pick<Job, 'slug' | 'id' | 'title' | 'company' | 'link'>,
  siteUrl = 'https://hashtagweb3.com',
): string {
  const base = siteUrl.replace(/\/+$/, '');
  return `${base}${getJobPublicPath(job)}`;
}

/** Public URL slug — always `job.slug` from cache (minted via assignJobSlugsInCache). */
export function getJobSlug(job: Job): string {
  return job.slug || '';
}

export function getCompanySlug(company: string): string {
  const lower = (company || '').toLowerCase().trim();
  if (lower.startsWith('ritual') || lower.includes('ritual')) {
    return 'ritual';
  }
  if (lower.includes('nomic')) {
    return 'nomic-foundation';
  }
  if (lower.includes('franklin') || lower.includes('templeton')) {
    return 'franklin-templeton';
  }
  if (lower.includes('offchain') || lower.includes('arbitrum')) {
    return 'offchain-labs';
  }
  if (lower.includes('aztec')) {
    return 'aztec-labs';
  }
  if (lower.includes('symbiotic')) {
    return 'symbiotic';
  }
  if (lower.includes('wynd')) {
    return 'wynd-labs';
  }
  if (lower.includes('helius')) {
    return 'helius';
  }
  if (lower.includes('liminal')) {
    return 'liminal-custody';
  }
  if (lower === 'strategy' || lower === 'microstrategy' || lower.includes('microstrategy')) {
    return 'strategy';
  }
  if (lower === 'pwc' || lower.includes('pricewaterhousecoopers') || lower.startsWith('pwc ')) {
    return 'pwc';
  }
  return (company || 'web3')
    .toLowerCase()
    .replace(/[’'"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
}

export function getCardTitle(title: string, max = 34): string {
  let t = (title || '').trim();
  // Strip recruitment-cycle noise prefixes: "Off-Cycle Fall 2026", "Summer 2027", "Cohort 2026", etc.
  const noise = /^(?:off[- ]cycle|co[- ]?op|cohort|class of|fall|spring|summer|winter|autumn)[\s,:-]*(?:20\d{2}(?:[-/]–?\d{2,4})?)?[\s,:-]+/i;
  for (let i = 0; i < 4; i++) {
    const stripped = t.replace(noise, '').trim();
    if (stripped === t || !stripped) break;
    t = stripped;
  }
  t = t || (title || '').trim();
  // Normalize the intern noun for consistent card display
  t = t.replace(/internship\b/gi, 'Intern');
  if (t.length <= max) return t;
  const segments = t.split(',').map(seg => seg.trim()).filter(Boolean);
  let out = segments[0];
  for (let i = 1; i < segments.length; i++) {
    const next = `${out}, ${segments[i]}`;
    if (next.length <= max) out = next;
    else break;
  }
  if (out.length > max) {
    const cut = out.lastIndexOf(' ', max);
    out = cut > 0 ? out.slice(0, cut) : out.slice(0, max);
  }
  return out.trim();
}
