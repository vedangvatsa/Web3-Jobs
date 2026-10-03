import rejectedBoardsJson from '../../content/rejected-ats-boards.json';
import { atsBoardKey, getJobAtsBoards } from './ats-board-identity';
import removedListingsJson from '../../content/removed-job-listings.json';
import { normalizeJobLink } from './job-slugs';

export type RemovedJobListing = { slug: string; link: string; reason: string; evidence: string; checkedAt: string; aliases?: string[]; blockedSlugs?: string[] };
export const REMOVED_JOB_LISTINGS: Readonly<Record<string, RemovedJobListing>> = removedListingsJson;
type JobSource = { link?: string; applyUrl?: string; source?: string; retiredReason?: string };

export function getRemovedJobListing(job: JobSource): RemovedJobListing | undefined {
  for (const link of [job.link, job.applyUrl]) {
    if (link) { const removed = REMOVED_JOB_LISTINGS[normalizeJobLink(link)]; if (removed) return removed; }
  }
}

export function getJobRetirementReason(job: JobSource): string {
  return job.retiredReason || getRemovedJobListing(job)?.reason || 'incorrect-employer-source';
}

type RejectedBoard = { employer: string; website: string; misattributedTo: string };
export const REJECTED_ATS_BOARDS: Readonly<Record<string, RejectedBoard>> = rejectedBoardsJson;

export function getAtsSourceIssue(provider: string, board: string): string | undefined {
  const key = atsBoardKey(provider, board);
  const rejected = REJECTED_ATS_BOARDS[key];
  if (rejected) return `${key} belongs to ${rejected.employer}, not ${rejected.misattributedTo}`;
}

export function getJobSourceIssue(job: JobSource): string | undefined {
  if (job.retiredReason) return job.retiredReason;
  const removed = getRemovedJobListing(job);
  if (removed) return removed.reason;
  for (const { provider, board } of getJobAtsBoards(job)) {
    const issue = getAtsSourceIssue(provider, board);
    if (issue) return issue;
  }
}

export function assertAtsSourceAllowed(provider: string, board: string): void {
  const issue = getAtsSourceIssue(provider, board);
  if (issue) throw new Error(`Rejected employer source: ${issue}`);
}
