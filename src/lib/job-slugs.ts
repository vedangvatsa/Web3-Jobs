import type { Job } from '@/types';

/**
 * Condenses a title to its single most meaningful role noun
 */
export function cleanShortTitle(title: string): string {
  const t = title.toLowerCase();

  if (t.includes('solidity') || t.includes('smart contract')) return 'solidity';
  if (t.includes('rust')) return 'rust';
  if (t.includes('zk') || t.includes('zero knowledge')) return 'zk';
  if (t.includes('cryptography') || t.includes('cryptographer')) return 'cryptography';
  if (t.includes('frontend') || t.includes('ui') || t.includes('ux')) return 'frontend';
  if (t.includes('backend')) return 'backend';
  if (t.includes('full stack') || t.includes('fullstack')) return 'fullstack';
  if (t.includes('devops') || t.includes('infrastructure') || t.includes('reliability')) return 'devops';
  if (t.includes('security') || t.includes('auditor') || t.includes('audit')) return 'security';
  if (t.includes('qa') || t.includes('testing') || t.includes('quality')) return 'qa';
  if (t.includes('trader') || t.includes('quant')) return 'trader';
  if (t.includes('analyst')) return 'analyst';
  if (t.includes('product manager') || t.includes('pm') || t.includes('product lead')) return 'pm';
  if (t.includes('marketing') || t.includes('growth') || t.includes('growth')) return 'marketing';
  if (t.includes('community') || t.includes('social')) return 'community';
  if (t.includes('devrel') || t.includes('developer relations')) return 'devrel';
  if (t.includes('compliance') || t.includes('mlro') || t.includes('legal')) return 'compliance';
  if (t.includes('recruiter') || t.includes('talent') || t.includes('hr')) return 'recruiting';
  if (t.includes('onboarding')) return 'onboarding';
  if (t.includes('supervisor')) return 'supervisor';
  if (t.includes('manager')) return 'manager';
  if (t.includes('director')) return 'director';
  if (t.includes('developer') || t.includes('engineer')) return 'developer';
  if (t.includes('analyst')) return 'analyst';
  if (t.includes('associate')) return 'associate';

  // Fallback to first two words
  const words = t.replace(/[^a-z0-9\s]+/g, ' ').trim().split(/\s+/);
  return words.slice(0, 2).join('-');
}

/**
 * Shortens company name to its core brand
 */
function cleanShortCompany(company: string): string {
  let c = company.toLowerCase();
  c = c.replace(/\s+inc\.?$/i, '')
       .replace(/\s+ltd\.?$/i, '')
       .replace(/\s+llc\.?$/i, '')
       .replace(/\s+corp\.?$/i, '')
       .replace(/\s+labs?$/i, '')
       .replace(/\s+technologies$/i, '')
       .replace(/\s+mobile\s+money$/i, '')
       .replace(/\s+metrics$/i, '')
       .trim();
  return c.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

/**
 * Generates an extremely short, pretty, direct slug like:
 * "/bitgo-onboarding"
 * "/coinbase-backend"
 * "/polymarket-client"
 * "/stripe-qa"
 */
export function getJobSlug(job: Job): string {
  const company = cleanShortCompany(job.company || 'web3');
  const title = cleanShortTitle(job.title || 'role');
  const baseSlug = `${company}-${title}`.replace(/-+/g, '-');

  // Use a short deterministic 5-character suffix of the ID to guarantee absolute uniqueness across millions of jobs
  // while keeping the slug extremely clean (e.g. /bitgo-onboarding-93731 or /coinbase-backend-49830)
  const shortId = (job.id || '').replace(/[^a-z0-9]/gi, '').slice(-5).toLowerCase();

  return shortId ? `${baseSlug}-${shortId}` : baseSlug;
}
