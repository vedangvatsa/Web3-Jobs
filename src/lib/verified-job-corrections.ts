import type { Job } from '../types';
import type { LegacySlugRecord } from './job-slugs';

export const AXIOM_TRADING_COMPANY = 'Axiom (onchain trading)';
export const AXIOM_FULLSTACK_ID = 'fa51ca24-cca0-4aea-9e20-8458919f1fc9';
export const AXIOM_FULLSTACK_LINK = `https://talent.superteam.fun/jobs/fullstack-engineer-at-axiom-${AXIOM_FULLSTACK_ID}`;
const AXIOM_IDS = new Set([AXIOM_FULLSTACK_ID, '96c2c641-33a5-4b52-bcb8-277d02723aac', 'f01d3349-8f59-45b1-ba00-f242de996008', '948a42ac-abab-4dc1-a962-5766138463f0', 'f6a08933-711f-4fe0-87de-f657aa103735']);

export function isVerifiedAxiomTradingJob(job: Job): boolean {
  if (!AXIOM_IDS.has(job.id) || !['axiom', AXIOM_TRADING_COMPANY.toLowerCase()].includes(job.company?.toLowerCase())) return false;
  try {
    const url = new URL(job.link);
    return ['talent.superteam.fun', 'app.talent.superteam.fun'].includes(url.hostname) && url.pathname.endsWith(`-${job.id}`);
  } catch { return false; }
}

export function correctVerifiedJobs(jobs: Job[]): Job[] {
  const fullstack = jobs.filter(job => isVerifiedAxiomTradingJob(job) && job.id === AXIOM_FULLSTACK_ID);
  const preferred = fullstack.find(job => job.slug === 'fullstack26' && job.link === AXIOM_FULLSTACK_LINK) || fullstack.find(job => job.link === AXIOM_FULLSTACK_LINK) || fullstack[0];
  return jobs.flatMap(job => {
    if (!isVerifiedAxiomTradingJob(job)) return [job];
    if (job.id === AXIOM_FULLSTACK_ID) return job === preferred ? [{ ...job, company: AXIOM_TRADING_COMPANY, title: 'Fullstack Engineer', link: AXIOM_FULLSTACK_LINK, slug: 'fullstack26' }] : [];
    return [{ ...job, company: AXIOM_TRADING_COMPANY }];
  });
}

export function preserveVerifiedJobAliases(jobs: Job[], archive: Record<string, LegacySlugRecord>): boolean {
  if (!jobs.some(job => isVerifiedAxiomTradingJob(job) && job.id === AXIOM_FULLSTACK_ID)) return false;
  const previous = archive.fs4;
  if (previous && previous.id !== AXIOM_FULLSTACK_ID) throw new Error('Cannot replace an unrelated fs4 archive record');
  const next = { ...previous, id: AXIOM_FULLSTACK_ID, link: AXIOM_FULLSTACK_LINK, company: AXIOM_TRADING_COMPANY, title: 'Fullstack Engineer', newSlug: 'fullstack26', recoveredFromMisattribution: true };
  if (JSON.stringify(previous) === JSON.stringify(next)) return false;
  archive.fs4 = next;
  return true;
}
