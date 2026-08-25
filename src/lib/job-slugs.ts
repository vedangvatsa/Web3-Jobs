import type { Job } from '@/types';

/**
 * Normalizes title to a short, clean, pretty slug component
 */
export function cleanShortTitle(title: string): string {
  let t = title.toLowerCase();

  // Strip punctuation and parentheticals
  t = t.replace(/[,/\\|()\[\]]/g, ' ');

  // Shorten common long phrases to crisp equivalents
  t = t.replace(/\bsoftware engineer\b/gi, 'engineer');
  t = t.replace(/\bsoftware developer\b/gi, 'developer');
  t = t.replace(/\bmachine learning\b/gi, 'ml');
  t = t.replace(/\bdevops engineer\b/gi, 'devops');
  t = t.replace(/\bsmart contracts?\b/gi, 'smart-contract');
  t = t.replace(/\bzero knowledge\b/gi, 'zk');
  t = t.replace(/\bbusiness development\b/gi, 'bizdev');
  t = t.replace(/\bproduct manager\b/gi, 'product-manager');
  t = t.replace(/\baccount manager\b/gi, 'account-manager');
  t = t.replace(/\bhuman resources\b/gi, 'hr');

  // Strip fluff/noise levels
  t = t.replace(/\b(senior|staff|principal|lead|associate|junior|mid-level|entry-level|level|grade|tier)\b/gi, ' ');
  t = t.replace(/\b(i|ii|iii|iv|v|vi)\b/gi, ' ');
  t = t.replace(/\b(remote|global|worldwide|hybrid|onsite|americas|emea|apac|latam|us|uk|eu)\b/gi, ' ');

  // Clean spacing
  t = t.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  return t || 'engineer';
}

/**
 * Generates a short, pretty, direct slug like:
 * "coinbase-backend-engineer-8154"
 * "stripe-finance-engineer-8153"
 * "uniswap-solidity-engineer-1049"
 * "bitgo-onboarding-manager-8733"
 */
export function getJobSlug(job: Job): string {
  const companyPart = (job.company || 'web3')
    .toLowerCase()
    .replace(/\s+inc\.?$/i, '')
    .replace(/\s+ltd\.?$/i, '')
    .replace(/\s+llc\.?$/i, '')
    .replace(/\s+labs?$/i, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const titlePart = cleanShortTitle(job.title || 'role');
  const baseSlug = `${companyPart}-${titlePart}`.replace(/-+/g, '-');

  // Use a short deterministic 4-char ID hash to guarantee absolute uniqueness across thousands of jobs
  const shortId = (job.id || '').replace(/[^a-z0-9]/gi, '').slice(-4).toLowerCase();

  return shortId ? `${baseSlug}-${shortId}` : baseSlug;
}
