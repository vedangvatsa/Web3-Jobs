/**
 * Extract full multi-office location strings from employer career pages when
 * list APIs only return a primary city (common on Google Careers).
 */

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

/** Google collapses extra offices behind "+N more"; full list is in an a11y string. */
const GOOGLE_FROM_FOLLOWING_RE = new RegExp(
  String.raw`from the following:\s*(?:\\u003cb\\u003e|<b>)?\s*([^"<\\]+)\s*(?:\\u003c/b\\u003e|</b>)?\s*\.?`,
  'i',
);

function normalizeLocationList(raw: string): string {
  return decodeHtmlEntities(raw)
    .replace(/\\u003[cbe]/gi, '')
    .replace(/^u003[eEbcCB]+/i, '')
    .replace(/^(?:<b>|\s)+/i, '')
    .replace(/\/b\s*$/i, '')
    .replace(/\s+/g, ' ')
    .replace(/\.\s*$/, '')
    .trim();
}

function locationListMatchesPrimary(list: string, primaryLocation: string | undefined): boolean {
  if (!primaryLocation?.trim()) return true;
  const primary = primaryLocation.split(';')[0]?.trim().toLowerCase();
  if (!primary) return true;
  const first = list.split(';')[0]?.trim().toLowerCase();
  return first === primary || list.toLowerCase().startsWith(primary);
}

function extractFollowingLocationLists(html: string): string[] {
  const lists: string[] = [];
  for (const match of html.matchAll(new RegExp(GOOGLE_FROM_FOLLOWING_RE.source, 'gi'))) {
    const list = normalizeLocationList(match[1] || '');
    if (list.includes(';')) lists.push(list);
  }
  return lists;
}

export function extractGoogleCareersLocations(
  html: string,
  primaryLocation?: string,
  jobId?: string,
): string | null {
  let scope = html;
  if (jobId) {
    const idx = html.indexOf(jobId);
    if (idx >= 0) scope = html.slice(idx, idx + 20_000);
  }

  for (const list of extractFollowingLocationLists(scope)) {
    if (locationListMatchesPrimary(list, primaryLocation)) return list;
  }

  if (scope !== html) {
    for (const list of extractFollowingLocationLists(html)) {
      if (locationListMatchesPrimary(list, primaryLocation)) return list;
    }
  }

  // Legacy markup: all cities visible inline (no "+N more").
  const country =
    '(?:Germany|United Kingdom|UK|Switzerland|USA|U\\.S\\.A\\.|United States|France|Netherlands|Ireland|Spain|Italy|Poland|Sweden|Denmark|Norway|Finland|Austria|Belgium|Portugal|Canada|Australia|India|Singapore|Japan|Hong Kong|Taiwan|South Korea|Brazil|Mexico|Israel|United Arab Emirates|UAE)';
  const city = '[A-Za-zÀ-ÖØ-öø-ü][A-Za-zÀ-ÖØ-öø-ü0-9\\s.\'-]{2,80}';
  const inlineRe = new RegExp(
    `(${city}, ${country})(?:;\\s*${city}, ${country})+`,
    'g',
  );
  let best: string | null = null;
  const text = decodeHtmlEntities(html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ');
  for (const match of text.matchAll(inlineRe)) {
    const raw = (match[0] || '').replace(/[\.\)]\s*$/, '').trim();
    if (!raw.includes(';')) continue;
    if (raw.length > 220) continue;
    if (!best || raw.length > best.length) best = raw;
  }
  return best;
}

export function shouldEnrichLocationFromPosting(link: string | undefined, location: string | undefined): boolean {
  if (!link) return false;
  if (link.includes('google.com/about/careers/applications/jobs/results/')) {
    return !(location || '').includes(';');
  }
  return false;
}

export function enrichLocationFromPostingHtml(
  link: string | undefined,
  location: string | undefined,
  html: string,
): string | undefined {
  if (!shouldEnrichLocationFromPosting(link, location)) return location;
  const jobId = link?.match(/\/results\/(\d+)-/)?.[1];
  const extracted = extractGoogleCareersLocations(html, location, jobId);
  if (!extracted) return location;
  if (!(location || '').trim()) return extracted;
  if (locationListMatchesPrimary(extracted, location)) return extracted;
  return location;
}
