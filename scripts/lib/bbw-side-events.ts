/**
 * Binance Blockchain Week (BBW) Bangkok 2026 side-event window and geo heuristics.
 * Premier conference: 28–29 Nov 2026 at QSNCC; side listings use the surrounding week.
 */
export const BBW_2026_SIDE_START = '2026-11-25';
export const BBW_2026_SIDE_END = '2026-12-02';

const BBW_TEXT = /\bbbw\b|binance blockchain week|binance week|blockchain week bangkok|qsnncc|queen sirikit/i;

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
  const start = startDate.slice(0, 10);
  return start >= BBW_2026_SIDE_START && start <= BBW_2026_SIDE_END;
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

/** Tag Luma crypto catalog rows and runtime build paths. Never tags the premier BBW record. */
export function shouldTagBbw2026SideEvent(input: BbwSideTagInput): boolean {
  if (input.eventId === 'premier-binancebw-2026') return false;
  if (!input.startDate || !inBbw2026SideWindow(input.startDate)) return false;
  if (!isBangkokMetro(input.city || '', input.location || '', input.country)) return false;

  const text = `${input.text || ''} ${input.url || ''} ${input.website || ''}`.toLowerCase();
  if (BBW_TEXT.test(text)) return true;
  if (/binanceblockchainweek\.com|shamwise\.com\/bbw/i.test(text)) return true;

  return isLumaCatalogEntry(input);
}