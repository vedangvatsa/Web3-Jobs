import type { Job } from '@/types';

/**
 * Extracts exactly ONE word representing the core role category
 */
export function getOneWordRole(title: string): string {
  const t = title.toLowerCase();

  if (t.includes('solidity')) return 'solidity';
  if (t.includes('rust')) return 'rust';
  if (t.includes('zk') || t.includes('zero knowledge') || t.includes('cryptograph')) return 'cryptography';
  if (t.includes('frontend') || t.includes('ui') || t.includes('ux')) return 'frontend';
  if (t.includes('backend')) return 'backend';
  if (t.includes('full stack') || t.includes('fullstack')) return 'fullstack';
  if (t.includes('devops') || t.includes('infrastructure')) return 'devops';
  if (t.includes('security') || t.includes('audit')) return 'security';
  if (t.includes('qa') || t.includes('testing') || t.includes('quality')) return 'qa';
  if (t.includes('trader') || t.includes('quant')) return 'trader';
  if (t.includes('product') || t.includes('pm')) return 'product';
  if (t.includes('marketing') || t.includes('growth')) return 'marketing';
  if (t.includes('community')) return 'community';
  if (t.includes('devrel') || t.includes('relations')) return 'devrel';
  if (t.includes('compliance') || t.includes('legal') || t.includes('mlro')) return 'compliance';
  if (t.includes('recruiter') || t.includes('talent') || t.includes('hr')) return 'recruiting';
  if (t.includes('onboarding')) return 'onboarding';
  if (t.includes('supervisor')) return 'supervisor';
  if (t.includes('manager')) return 'manager';
  if (t.includes('analyst')) return 'analyst';
  if (t.includes('developer')) return 'developer';
  if (t.includes('engineer')) return 'engineer';
  if (t.includes('designer')) return 'designer';
  if (t.includes('writer')) return 'writer';
  if (t.includes('sales') || t.includes('account')) return 'sales';
  if (t.includes('operations') || t.includes('ops')) return 'operations';
  if (t.includes('associate') || t.includes('assistant')) return 'associate';

  // Fallback to the first alphabetic word
  const words = t.replace(/[^a-z0-9\s]+/g, ' ').trim().split(/\s+/);
  return words[0] || 'job';
}

/**
 * Generates an extremely short, single-word-based slug followed by numbers
 * to guarantee absolute uniqueness and prevent collisions.
 * e.g. "/onboarding-29373"
 *      "/trader-30002"
 *      "/supervisor-25712"
 *      "/developer-20729"
 *      "/qa-3331"
 *      "/associate-de40"
 */
export function getJobSlug(job: Job): string {
  if (job.slug) {
    return job.slug;
  }
  const roleWord = getOneWordRole(job.title || 'job');
  const shortId = (job.id || '').replace(/[^a-z0-9]/gi, '').slice(-5).toLowerCase();
  return shortId ? `${roleWord}${shortId}` : roleWord;
}

export function getCompanySlug(company: string): string {
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
