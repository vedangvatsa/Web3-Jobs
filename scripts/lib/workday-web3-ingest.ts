import type { Job } from '../../src/types';
import { isWeb3Job, passesWeb3TitleFilter } from '../../src/lib/web3-job-classifier';
import { isConcreteJobOpening } from '../../src/lib/job-filters';
import { sanitizeJobDescriptionHtml } from '../../src/lib/sanitize-html';
import { getJobContentKey } from '../../src/lib/job-slugs';
import { normalizeIngestIsoDate, normalizeWorkdayPostedOn } from './ingest-date-normalize';

export type WorkdayWeb3Board = {
  company: string;
  host: string;
  tenant: string;
  site: string;
  /** Public careers base URL (no trailing slash), used for apply links. */
  baseUrl: string;
  searchTexts: string[];
  sourceLabel: string;
  idPrefix: string;
  /** Drop stale rows from this ingest before upsert. */
  matchLink: (link: string) => boolean;
  web3TitlesOnly?: boolean | 'strict';
  /** Cap list pagination for noisy keyword searches (default 120). */
  maxListPostings?: number;
};

type WorkdayPosting = {
  title: string;
  externalPath: string;
  locationsText?: string;
  bulletFields?: string[];
  postedOn?: string;
};

type WorkdayListResponse = {
  total?: number;
  jobPostings?: WorkdayPosting[];
};

type WorkdayDetailResponse = {
  jobPostingInfo?: {
    title?: string;
    jobDescription?: string;
    location?: string;
    startDate?: string;
    externalUrl?: string;
    jobReqId?: string;
    id?: string;
  };
};

async function fetchWorkdayPostings(
  board: WorkdayWeb3Board,
  searchText: string,
): Promise<WorkdayPosting[]> {
  const endpoint = `${board.host}/wday/cxs/${board.tenant}/${board.site}/jobs`;
  const postings: WorkdayPosting[] = [];
  const cap = board.maxListPostings ?? 120;
  let total = 1;

  for (let offset = 0; offset < total && postings.length < cap; offset += 20) {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0 (compatible; hashtagweb3-ingest/1.0)' },
      body: JSON.stringify({ appliedFacets: {}, limit: 20, offset, searchText }),
      signal: AbortSignal.timeout(60_000),
    });
    if (!res.ok) throw new Error(`Workday list HTTP ${res.status} (${board.company}, "${searchText}")`);
    const data = (await res.json()) as WorkdayListResponse;
    total = Math.max(total, data.total ?? postings.length + (data.jobPostings?.length || 0));
    if (data.jobPostings?.length) postings.push(...data.jobPostings);
    if (!data.jobPostings?.length || data.jobPostings.length < 20) break;
  }

  return postings;
}

function dedupePostings(postings: WorkdayPosting[]): WorkdayPosting[] {
  const seen = new Set<string>();
  const out: WorkdayPosting[] = [];
  for (const p of postings) {
    const key = p.externalPath || p.title;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(p);
  }
  return out;
}

export async function ingestWorkdayWeb3Board(
  board: WorkdayWeb3Board,
  previousById: Map<string, Job>,
): Promise<{ jobs: Job[]; descriptions: Record<string, string> }> {
  const descriptions: Record<string, string> = {};
  const jobs: Job[] = [];
  const allPostings: WorkdayPosting[] = [];

  for (const searchText of board.searchTexts) {
    console.log(`  Workday search ${board.company}: "${searchText}"...`);
    const batch = await fetchWorkdayPostings(board, searchText);
    console.log(`    → ${batch.length} postings`);
    allPostings.push(...batch);
  }

  for (const posting of dedupePostings(allPostings)) {
    const listingTitle = (posting.title || '').replace(/\s+/g, ' ').trim();
    if (board.web3TitlesOnly && !isWeb3Job(listingTitle, '').web3) {
      continue;
    }

    const detailUrl = `${board.host}/wday/cxs/${board.tenant}/${board.site}${posting.externalPath}`;
    const fallbackLink = `${board.baseUrl}${posting.externalPath}`;
    let detail: WorkdayDetailResponse['jobPostingInfo'] = {};
    let description = '';

    try {
      const detailRes = await fetch(detailUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; hashtagweb3-ingest/1.0)' },
        signal: AbortSignal.timeout(45_000),
      });
      if (detailRes.ok) {
        const body = (await detailRes.json()) as WorkdayDetailResponse;
        detail = body.jobPostingInfo || {};
        description = detail.jobDescription || '';
      }
    } catch {
      // Listing still identifies a live role.
    }

    const title = (detail.title || posting.title || '').replace(/\s+/g, ' ').trim();
    const bodyText = description.replace(/<[^>]+>/g, ' ');
    if (
      !passesWeb3TitleFilter(board.web3TitlesOnly ?? 'strict', title, bodyText)
    ) {
      continue;
    }

    const link = detail.externalUrl || fallbackLink;
    if (!title || !isConcreteJobOpening(title, link)) continue;

    const reqId =
      detail.jobReqId ||
      detail.id ||
      posting.bulletFields?.[0] ||
      posting.externalPath.split('/').pop() ||
      posting.externalPath;
    const id = `${board.idPrefix}-${String(reqId).replace(/[^a-zA-Z0-9._-]/g, '-')}`;
    const fromDetail = normalizeIngestIsoDate(detail.startDate);
    const postedHint = [posting.postedOn, posting.title].filter(Boolean).join(' ');
    const fromList = normalizeWorkdayPostedOn(postedHint);
    const { date, verified: dateOk } =
      fromDetail.verified && fromDetail.date
        ? fromDetail
        : fromList.verified && fromList.date
          ? fromList
          : fromDetail;
    const html = description
      ? sanitizeJobDescriptionHtml(description, board.company)
      : '';

    const jobRow: Job = {
      id,
      title,
      company: board.company,
      link,
      applyUrl: link,
      date,
      ...(dateOk ? { dateVerified: true, dateSource: 'Workday Recruiting' } : {}),
      source: board.sourceLabel,
      location: detail.location || posting.locationsText || undefined,
      active: true,
      ...(previousById.get(id)?.slug && { slug: previousById.get(id)!.slug }),
    };

    jobs.push(jobRow);
    if (html) descriptions[getJobContentKey(jobRow)] = html;
  }

  return { jobs, descriptions };
}

export type WorkdayPublicJobDetail = {
  jobDescription: string;
  title?: string;
  location?: string;
  externalUrl?: string;
};

/** Resolve full posting HTML from a public myworkdayjobs.com job URL (Phenom apply links, etc.). */
export async function fetchWorkdayJobFromPublicUrl(
  publicJobUrl: string,
): Promise<WorkdayPublicJobDetail | null> {
  let url: URL;
  try {
    url = new URL(publicJobUrl);
  } catch {
    return null;
  }
  if (!url.hostname.includes('myworkdayjobs.com')) return null;

  const segments = url.pathname.split('/').filter(Boolean);
  const jobIdx = segments.indexOf('job');
  if (jobIdx < 1) return null;

  const site = segments.slice(0, jobIdx).join('/');
  const externalPath = `/${segments.slice(jobIdx).join('/')}`;
  const tenant = url.hostname.split('.')[0];
  const detailUrl = `${url.origin}/wday/cxs/${tenant}/${site}${externalPath}`;

  try {
    const detailRes = await fetch(detailUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; hashtagweb3-ingest/1.0)' },
      signal: AbortSignal.timeout(45_000),
    });
    if (!detailRes.ok) return null;
    const body = (await detailRes.json()) as WorkdayDetailResponse;
    const info = body.jobPostingInfo;
    if (!info?.jobDescription?.trim()) return null;
    return {
      jobDescription: info.jobDescription,
      title: info.title,
      location: info.location,
      externalUrl: info.externalUrl,
    };
  } catch {
    return null;
  }
}

export function stripPriorIngest(
  allJobs: Job[],
  company: string,
  matchLink: (link: string) => boolean,
  sourceIncludes?: string,
): Job[] {
  const companyLower = company.toLowerCase();
  return allJobs.filter((j) => {
    const link = String(j.link || '');
    const src = String(j.source || '');
    if (j.company?.toLowerCase() === companyLower && matchLink(link)) return false;
    if (sourceIncludes && src.includes(sourceIncludes) && j.company?.toLowerCase() === companyLower) {
      return false;
    }
    return true;
  });
}