import type { GrantProgram } from '../../src/types';

export type GrantApplicationStatus = { ok: true } | { ok: false; reason: string };

export const CLOSED_COPY_PATTERNS = [
  /(?:we )?no longer accept(?:ing)?(?: new)? applications/i,
  /program ended/i,
  /made the decision to sunset/i,
  /applications?\s+(?:are\s+)?(?:currently\s+)?closed/i,
  /applications closed until/i,
  /(?:intake|registration|submissions?)\s+(?:are\s+)?closed/i,
  /not accepting(?: any )?(?:new )?applications/i,
  /this (?:grant )?round (?:has )?closed/i,
  /submissions? (?:are )?closed/i,
] as const;

const OPEN_COPY =
  /(?:now accepting|accepting applications|apply now|submit (?:your )?application|applications (?:are )?open|request a grant|how to apply|start your application|open for applications)/i;

function grantTextBlob(g: GrantProgram): string {
  return [
    g.description,
    g.deadline || '',
    ...(g.sections || []).flatMap((s) => [s.heading, ...(s.paragraphs || []), ...(s.bullets || [])]),
  ].join('\n');
}

function parseDeadlinePast(deadline: string, asOf = new Date()): boolean {
  const trimmed = deadline.trim();
  if (!trimmed || /rolling|always open|ongoing|continuous|year-round|quarterly|biannual|periodic|varies|monthly review/i.test(trimmed)) {
    return false;
  }
  if (trimmed === ',' || trimmed.length < 4) return false;

  const withYear = trimmed.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);
  if (withYear) {
    const d = new Date(`${withYear[2]} ${withYear[1]}, ${withYear[3]}`);
    return !Number.isNaN(d.getTime()) && d < asOf;
  }

  const monthDayYear = trimmed.match(/^([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})$/);
  if (monthDayYear) {
    const d = new Date(`${monthDayYear[1]} ${monthDayYear[2]}, ${monthDayYear[3]}`);
    return !Number.isNaN(d.getTime()) && d < asOf;
  }

  const range = trimmed.match(/(\d{1,2}\s+[A-Za-z]+)\s*[–-]\s*(\d{1,2}\s+[A-Za-z]+\s+\d{4})/i);
  if (range) {
    const end = new Date(range[2]);
    return !Number.isNaN(end.getTime()) && end < asOf;
  }

  return false;
}

export function grantApplicationStatus(g: GrantProgram, asOf = new Date()): GrantApplicationStatus {
  const finalUrl = (g as GrantProgram & { urlLive?: { finalUrl?: string } }).urlLive?.finalUrl || g.url;
  if (/closedform/i.test(finalUrl) || /closedform/i.test(g.url)) {
    return { ok: false, reason: 'apply-url-closed' };
  }

  const blob = grantTextBlob(g);
  const liveClosed = matchClosedCopy(blob);
  if (liveClosed) {
    return { ok: false, reason: 'closed-language-in-copy' };
  }

  if (g.deadline && parseDeadlinePast(g.deadline, asOf)) {
    return { ok: false, reason: 'deadline-past' };
  }

  return { ok: true };
}

export function matchClosedCopy(text: string): string | null {
  for (const pattern of CLOSED_COPY_PATTERNS) {
    const hit = text.match(pattern);
    if (hit) return hit[0];
  }
  return null;
}

export type LiveApplicationVerdict = 'open' | 'closed' | 'unknown' | 'unreachable';

export function classifyLiveApplicationPage(params: {
  grant: GrantProgram;
  pageText: string;
  finalUrl: string;
}): { verdict: LiveApplicationVerdict; detail?: string } {
  const { grant, pageText, finalUrl } = params;
  if (/closedform/i.test(finalUrl)) {
    return { verdict: 'closed', detail: 'apply-url-closedform' };
  }

  const closed = matchClosedCopy(pageText);
  if (closed) return { verdict: 'closed', detail: closed };

  if (OPEN_COPY.test(pageText)) return { verdict: 'open', detail: 'open-language-on-page' };

  if (/rolling|always open|ongoing/i.test(grant.deadline || '') && pageText.length > 400) {
    return { verdict: 'open', detail: 'rolling-deadline-and-substantive-page' };
  }

  if (/forms\.gle|typeform\.com|\/apply|application form|grants\.google\.com\/forms/i.test(finalUrl + pageText.slice(0, 5000))) {
    return { verdict: 'open', detail: 'live-apply-surface' };
  }

  if (pageText.length < 200) return { verdict: 'unknown', detail: 'thin-live-page' };

  return { verdict: 'unknown', detail: 'no-open-or-closed-signal' };
}