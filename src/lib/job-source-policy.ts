import rejectedBoardsJson from '../../content/rejected-ats-boards.json';
import { atsBoardKey, getJobAtsBoards } from './ats-board-identity';

type RejectedBoard = { employer: string; website: string; misattributedTo: string };
export const REJECTED_ATS_BOARDS: Readonly<Record<string, RejectedBoard>> = rejectedBoardsJson;

export function getAtsSourceIssue(provider: string, board: string): string | undefined {
  const key = atsBoardKey(provider, board);
  const rejected = REJECTED_ATS_BOARDS[key];
  if (rejected) return `${key} belongs to ${rejected.employer}, not ${rejected.misattributedTo}`;
}

export function getJobSourceIssue(job: { link?: string; applyUrl?: string; source?: string; retiredReason?: string }): string | undefined {
  if (job.retiredReason) return job.retiredReason;
  for (const { provider, board } of getJobAtsBoards(job)) {
    const issue = getAtsSourceIssue(provider, board);
    if (issue) return issue;
  }
}

export function assertAtsSourceAllowed(provider: string, board: string): void {
  const issue = getAtsSourceIssue(provider, board);
  if (issue) throw new Error(`Rejected employer source: ${issue}`);
}
