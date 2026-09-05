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
 * Generates an extremely short, single-word-based slug followed by numbers
 * to guarantee absolute uniqueness and prevent collisions.
 * e.g. "/onboarding29373" -> sequential: /frontend1, /frontend2
 */
export function getJobSlug(job: Job): string {
  if (job.slug) {
    return job.slug;
  }
  const roleWord = getOneWordRole(job.title || 'job');
  const cleanId = (job.id || '').replace(/[^a-z0-9]/gi, '').toLowerCase();
  let shortId = '';
  if (/\d/.test(cleanId) || /[a-f0-9]{8,}/.test(cleanId)) {
    shortId = cleanId.slice(-5);
  } else {
    shortId = stableHash(getJobIdentity(job)).slice(0, 5);
  }
  return shortId ? `${roleWord}${shortId}` : roleWord;
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
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
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
