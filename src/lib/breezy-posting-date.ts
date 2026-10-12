import { load } from 'cheerio';
import type { Job, JobPostingDateEvidence } from '../types';
import { getJobIdentity } from './job-slugs';
import { BREEZY_ORIGINAL_DATE_SOURCE, normalizeSourcePostingDate, requiresPrimaryJobDate } from './job-source-date';

type EvidenceInput = Omit<JobPostingDateEvidence, 'provider' | 'datePosted'>;
export type BreezyPostingDate = Pick<Job, 'date' | 'dateVerified' | 'dateSource' | 'dateEvidence' | 'description' | 'active'>;

const textKey = (value: unknown) => typeof value === 'string'
  ? load(value).text().normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim() : '';

export function extractBreezyPostingDate(job: Job, html: string, evidence: EvidenceInput): BreezyPostingDate | null {
  if (!requiresPrimaryJobDate(job) || getJobIdentity({ ...job, link: evidence.url }) !== getJobIdentity(job)) return null;
  if (!normalizeSourcePostingDate(evidence.checkedAt) || !/^[a-f0-9]{64}$/.test(evidence.bodySha256)) return null;
  let host: string;
  try {
    const expected = new URL(job.link), actual = new URL(evidence.url);
    if (expected.protocol !== 'https:' || actual.protocol !== 'https:' || expected.port || actual.port || !expected.hostname.endsWith('.breezy.hr')) return null;
    host = expected.hostname;
    const board = job.source.match(/^breezy:.*\[([^\]]+)\]$/i)?.[1];
    if (board && host !== `${board.toLowerCase()}.breezy.hr`) return null;
  } catch { return null; }
  const postings: Record<string, unknown>[] = [];
  const visit = (value: unknown) => {
    if (Array.isArray(value)) { value.forEach(visit); return; }
    if (!value || typeof value !== 'object') return;
    const node = value as Record<string, unknown>;
    if ([node['@type']].flat().includes('JobPosting')) postings.push(node);
    if (node['@graph']) visit(node['@graph']);
  };
  const $ = load(html);
  $('script[type="application/ld+json"]').each((_, element) => { try { visit(JSON.parse($(element).text())); } catch {} });
  const matches = postings.filter(posting => {
    const url = typeof posting.url === 'string' ? posting.url : undefined;
    if (!url || getJobIdentity({ ...job, link: url }) !== getJobIdentity(job) || textKey(posting.title) !== textKey(job.title)) return false;
    const organization = posting.hiringOrganization as { name?: string; sameAs?: string } | undefined;
    if (textKey(organization?.name) === textKey(job.company)) return true;
    try {
      if (!organization?.sameAs) return false;
      const website = new URL(organization.sameAs);
      return website.protocol === 'https:' && website.hostname === host && website.pathname === '/';
    }
    catch { return false; }
  });
  if (!matches.length) return null;
  const dates = matches.map(posting => normalizeSourcePostingDate(posting.datePosted));
  if (dates.some(date => !date) || new Set(dates).size !== 1) return null;
  const visible = load(html);
  visible('script, style').remove();
  const closed = /position closed\s*sorry,? this position is no longer accepting candidates/i.test(visible.text().replace(/\s+/g, ' '));
  return {
    date: dates[0], dateVerified: true, dateSource: BREEZY_ORIGINAL_DATE_SOURCE,
    dateEvidence: { ...evidence, provider: 'breezy', datePosted: dates[0] },
    ...(closed && { active: false }),
    ...(typeof matches[0].description === 'string' && { description: matches[0].description }),
  };
}
