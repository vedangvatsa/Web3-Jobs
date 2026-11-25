/**
 * Binance Blockchain Week (BBW) Bangkok 2026 side-event tagging.
 *
 * Premier conference: 28–29 Nov 2026 at QSNCC (premier-binancebw-2026).
 *
 * Tagging rules (Bangkok metro required in all cases):
 * - Luma catalog rows (`source: luma-crypto`, id `luma-crypto-*` or `luma-*`): start date must fall
 *   in the LUMA tight window. No keyword heuristics — date + geography only.
 * - Explicit BBW / Binance Blockchain Week copy in title, description, or URL: allowed in the wider
 *   TEXT window (pre-parties and post-conference dinners that name BBW explicitly).
 */
export const BBW_2026_PREMIER_START = '2026-11-28';
export const BBW_2026_PREMIER_END = '2026-11-29';

/** Luma Bangkok rows without explicit BBW text in title/description. */
export const BBW_2026_LUMA_TIGHT_START = '2026-11-26';
export const BBW_2026_LUMA_TIGHT_END = '2026-12-01';

/** Rows that explicitly mention BBW / Binance Blockchain Week. */
export const BBW_2026_TEXT_WIDE_START = '2026-11-24';
export const BBW_2026_TEXT_WIDE_END = '2026-12-03';

/** @deprecated Use LUMA_TIGHT_* or TEXT_WIDE_*; kept for callers expecting a single window. */
export const BBW_2026_SIDE_START = BBW_2026_LUMA_TIGHT_START;
/** @deprecated Use LUMA_TIGHT_* or TEXT_WIDE_*; kept for callers expecting a single window. */
export const BBW_2026_SIDE_END = BBW_2026_LUMA_TIGHT_END;

const BBW_TEXT = /\bbbw\b|binance blockchain week|binance week|blockchain week bangkok|qsnncc|queen sirikit/i;

function inDateWindow(startDate: string, windowStart: string, windowEnd: string): boolean {
  const day = startDate.slice(0, 10);
  return day >= windowStart && day <= windowEnd;
}

export function isBangkokMetro(city: string, location: string, country?: string): boolean {
  const c = city.toLowerCase();
  const l = location.toLowerCase();
  if (c.includes('bangkok') || l.includes('bangkok')) return true;
  if (/krung thep|กรุงเทพ/i.test(l) || /krung thep/i.test(c)) return true;
  const countryNorm = (country || '').trim();
  if (
    (countryNorm === 'Thailand' || countryNorm === 'TH') &&
    /\bbangkok\b|krung thep|qsnncc|queen sirikit national convention/i.test(l)
  ) {
    return true;
  }
  return false;
}

export function inBbw2026SideWindow(startDate: string): boolean {
  return inDateWindow(startDate, BBW_2026_LUMA_TIGHT_START, BBW_2026_LUMA_TIGHT_END);
}

export type BbwSideTagInput = {
  text?: string;
  city?: string;
  location?: string;
  country?: string;
  startDate?: string;
  eventId?: string;
  source?: string;
  url?: string;
  website?: string;
};

function isLumaCatalogEntry(input: BbwSideTagInput): boolean {
  if (input.source === 'luma-crypto') return true;
  const id = input.eventId || '';
  return id.startsWith('luma-crypto-') || /^luma-[a-z0-9]+$/i.test(id);
}

function hasExplicitBbwText(text: string): boolean {
  if (BBW_TEXT.test(text)) return true;
  return /binanceblockchainweek\.com|shamwise\.com\/bbw/i.test(text);
}

/** Tag Luma crypto catalog rows and runtime build paths. Never tags the premier BBW record. */
export function shouldTagBbw2026SideEvent(input: BbwSideTagInput): boolean {
  if (input.eventId === 'premier-binancebw-2026') return false;
  if (!input.startDate) return false;
  if (!isBangkokMetro(input.city || '', input.location || '', input.country)) return false;

  const text = `${input.text || ''} ${input.url || ''} ${input.website || ''}`.toLowerCase();

  if (hasExplicitBbwText(text)) {
    return inDateWindow(input.startDate, BBW_2026_TEXT_WIDE_START, BBW_2026_TEXT_WIDE_END);
  }

  if (isLumaCatalogEntry(input)) {
    return inDateWindow(input.startDate, BBW_2026_LUMA_TIGHT_START, BBW_2026_LUMA_TIGHT_END);
  }

  return false;
}