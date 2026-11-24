import type { GrantProgram } from '@/types';

export const GRANT_EDITORIAL_PAD =
  'See the official program page for current eligibility, milestone templates, and reporting requirements published by the operator.';

const GRANT_GENERIC_APPLY =
  'Review eligibility on the official program page linked above, then submit using the application channel the operator publishes.';

/** Scraped parked-domain / SEO spam (not the real program operator). */
export const GRANT_SCRAPED_SPAM =
  /crypto funding blog|latest in crypto casino|your trusted guide to cryptocurrency news, funding trends, and deep dives into casino/i;

function grantBodyText(grant: GrantProgram): string {
  return [
    grant.description || '',
    ...(grant.sections || []).flatMap((s) => [...(s.paragraphs || []), ...(s.bullets || [])]),
  ].join(' ');
}

export function grantHasScrapedSpam(grant: GrantProgram): boolean {
  return GRANT_SCRAPED_SPAM.test(grantBodyText(grant));
}

export function grantHasEditorialPadding(grant: GrantProgram): boolean {
  return (grant.sections || []).some((s) => (s.paragraphs || []).includes(GRANT_EDITORIAL_PAD));
}

export function stripGrantEditorialPadding(grant: GrantProgram): void {
  for (const section of grant.sections || []) {
    section.paragraphs = (section.paragraphs || []).filter((p) => p !== GRANT_EDITORIAL_PAD);
  }
}

/** True when stored sections match a known thin-expansion blob (fabricated, not scraped). */
export function grantMatchesThinExpansion(
  grant: GrantProgram,
  thinFirstParagraphById: Record<string, string | undefined>,
): boolean {
  const needle = thinFirstParagraphById[grant.id];
  if (!needle) return false;
  const first = grant.sections?.[0]?.paragraphs?.[0]?.trim() || '';
  return first.length > 0 && first.slice(0, Math.min(needle.length, 120)) === needle.slice(0, Math.min(needle.length, 120));
}

export function grantWrongSourcePage(grant: GrantProgram): boolean {
  const pt = (grant as GrantProgram & { descriptionSource?: { pageTitle?: string } }).descriptionSource?.pageTitle || '';
  if (!pt) return false;
  const name = `${grant.name} ${grant.provider}`.toLowerCase();
  const programHint = /\b(grant|fund|prezenti|fellowship|bounty|award|stipend|micro-?grant)\b/i.test(name);
  if (!programHint) return false;
  const titleHint = /\b(grant|fund|program|apply|fellowship|bounty|award|prezenti|community fund)\b/i.test(pt);
  if (titleHint) return false;
  try {
    const host = new URL(grant.url).hostname.replace(/^www\./, '');
    if (host === 'celo.org' && grant.url.includes('/community')) return true;
  } catch {
    return false;
  }
  return false;
}

export function grantSourceUrlMismatch(grant: GrantProgram): boolean {
  const src = (grant as GrantProgram & { descriptionSource?: { url?: string } }).descriptionSource?.url;
  if (!src) return false;
  try {
    return new URL(src).href.replace(/\/$/, '') !== new URL(grant.url).href.replace(/\/$/, '');
  } catch {
    return false;
  }
}

export function grantNeedsSourceRefetch(
  grant: GrantProgram,
  thinFirstParagraphById: Record<string, string | undefined>,
): string[] {
  const method = (grant as GrantProgram & { descriptionSource?: { method?: string } }).descriptionSource?.method;
  if (method === 'curated-official-summary') return [];

  const reasons: string[] = [];
  if (grantHasScrapedSpam(grant)) reasons.push('scraped-spam');
  if (grantWrongSourcePage(grant)) reasons.push('wrong-source-url');
  if (grantSourceUrlMismatch(grant)) reasons.push('stale-source-url');
  if (grantMatchesThinExpansion(grant, thinFirstParagraphById)) reasons.push('thin-fabrication');
  return reasons;
}

export function stripGrantGenericApplyBoilerplate(grant: GrantProgram): void {
  for (const section of grant.sections || []) {
    section.paragraphs = (section.paragraphs || []).filter((p) => p !== GRANT_GENERIC_APPLY);
  }
}