import { shouldDropPopupLine } from '@/lib/popup-copy-guard';
import { formatPopupText, isPopupScrapeNoise, mergeBrokenPopupLines } from '@/lib/popup-text';

function cleanLine(line: string): string {
  const t = formatPopupText(line);
  if (!t || isPopupScrapeNoise(t) || shouldDropPopupLine(t)) return '';
  return t;
}

function dedupeLines(lines: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const line of lines) {
    const key = line.toLowerCase().replace(/\s+/g, ' ').trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(line);
  }
  return out;
}

function looksLikePrice(line: string): boolean {
  return /^\$|starts at \$/i.test(line) || /\/night|\/month|\/week|floor price|membership/i.test(line);
}

function looksLikePricingTierTitle(line: string, next?: string): boolean {
  if (looksLikePrice(line)) return false;
  if (line.length > 52) return false;
  if (/^[*]/.test(line)) return false;
  if (/\$/.test(line)) return false;
  if (/^(public spaces|there are|alternatively|to attend|membership)/i.test(line)) return false;
  return Boolean(next && (looksLikePrice(next) || /^starts at/i.test(next)));
}

function isPricingIntro(line: string): boolean {
  if (looksLikePrice(line)) return false;
  if (/^\*/.test(line)) return false;
  if (/:\s*$/.test(line)) return true;
  return line.length >= 48 && !looksLikePricingTierTitle(line);
}

function isPricingFootnote(line: string): boolean {
  return /^\*/.test(line);
}

export type DetailGroup = {
  title?: string;
  intro?: string;
  footnote?: string;
  items: string[];
};

export type LocationBlock = {
  intro?: string;
  places: Array<{ name: string; detail: string }>;
  other: string[];
};

/** Venue names from lines like "4Seas Nimman. First and central location…". */
export function extractVenueNamesFromLocationDetails(lines: string[]): string[] {
  const names: string[] = [];
  for (const raw of lines) {
    const line = cleanLine(raw);
    const match = line.match(/^(.+?)\.\s+(.+)$/);
    if (!match) continue;
    const name = match[1].trim();
    const detail = match[2].trim();
    if (name.length > 0 && name.length <= 48 && detail.length >= 8) {
      names.push(name);
    }
  }
  return names;
}

export function parseLocationDetailLines(lines: string[]): LocationBlock {
  const places: LocationBlock['places'] = [];
  const other: string[] = [];
  let intro: string | undefined;

  for (const raw of mergeBrokenPopupLines(lines)) {
    const line = cleanLine(raw);
    if (!line) continue;

    if (/:\s*$/.test(line)) {
      intro = line;
      continue;
    }

    const dotSplit = line.match(/^(.+?)\.\s+(.+)$/);
    if (dotSplit) {
      const name = dotSplit[1].trim();
      const detail = dotSplit[2].trim();
      if (name.length <= 48 && detail.length >= 8 && !/^What (is|kind of|are)\b/i.test(line)) {
        places.push({ name, detail: ensureSentence(detail) });
        continue;
      }
    }

    other.push(ensureSentence(line));
  }

  return { intro, places, other: dedupeLines(other) };
}

function normalizePricingGroup(group: DetailGroup): DetailGroup {
  const introParts: string[] = group.intro ? [group.intro] : [];
  const footnotes: string[] = group.footnote ? [group.footnote] : [];
  const items: string[] = [];

  for (const line of group.items) {
    if (isPricingFootnote(line)) {
      footnotes.push(line.replace(/^\*\s*/, ''));
    } else if (isPricingIntro(line)) {
      introParts.push(line);
    } else {
      items.push(line);
    }
  }

  return {
    title: group.title,
    intro: introParts.length ? introParts.join(' ') : undefined,
    footnote: footnotes.length ? footnotes.join(' ') : undefined,
    items,
  };
}

function splitSingleGroupByVenues(group: DetailGroup, venueNames: string[]): DetailGroup[] {
  if (group.title || venueNames.length < 2) return [group];

  const prices = group.items.filter(looksLikePrice);
  const remainder = group.items.filter((line) => !looksLikePrice(line));
  if (prices.length < venueNames.length * 2 || prices.length % venueNames.length !== 0) {
    if (remainder.length) {
      return [{ ...group, intro: [group.intro, ...remainder].filter(Boolean).join(' ') }];
    }
    return [group];
  }

  const perVenue = prices.length / venueNames.length;
  return venueNames.map((name, index) => ({
    title: name,
    intro: index === 0 ? group.intro : undefined,
    footnote: index === venueNames.length - 1 ? group.footnote : undefined,
    items: prices.slice(index * perVenue, (index + 1) * perVenue),
  }));
}

function flattenEmptyTitleGroups(groups: DetailGroup[]): DetailGroup[] {
  const out: DetailGroup[] = [];
  for (const group of groups) {
    if (group.title && group.items.length === 0 && !group.intro && !group.footnote) {
      if (out.length) {
        out[out.length - 1].items.push(group.title);
      } else {
        out.push({ items: [group.title] });
      }
      continue;
    }
    out.push(group);
  }
  return out;
}

export function groupPricingLines(lines: string[], venueNames: string[] = []): DetailGroup[] {
  const groups: DetailGroup[] = [];
  let current: DetailGroup = { items: [] };

  for (let i = 0; i < lines.length; i += 1) {
    const line = cleanLine(lines[i]);
    if (!line) continue;
    const next = cleanLine(lines[i + 1] ?? '');

    if (looksLikePricingTierTitle(line, next)) {
      if (current.items.length || current.title || current.intro) groups.push(current);
      current = { title: line, items: [] };
      continue;
    }

    if (isPricingFootnote(line)) {
      current.footnote = [current.footnote, line.replace(/^\*\s*/, '')].filter(Boolean).join(' ');
      continue;
    }

    if (isPricingIntro(line) && !current.title && current.items.length === 0) {
      current.intro = [current.intro, line].filter(Boolean).join(' ');
      continue;
    }

    current.items.push(line);
  }

  if (current.items.length || current.title || current.intro || current.footnote) {
    groups.push(current);
  }

  let result = groups
    .map(normalizePricingGroup)
    .filter((g) => g.title || g.items.length || g.intro || g.footnote);

  if (result.length === 1 && venueNames.length >= 2) {
    result = splitSingleGroupByVenues(result[0], venueNames);
  }

  return result;
}

function isGenericAmenityItem(line: string): boolean {
  if (/\$/.test(line)) return true;
  if (line.length > 56) return false;
  if (
    /^(co-?living|co-?working|events? and|meeting rooms?|high-speed|shared |private |wellness|gym|pool|wifi|sauna|cold plunge|modular|access to|buffet|digital|community events|conference and|makerspaces|gardens and)/i.test(
      line,
    )
  ) {
    return true;
  }
  if (/\b(view|tower|city|village|campus|node|plaza|district|mountain view)\b/i.test(line)) {
    return false;
  }
  return line.length < 36;
}

function looksLikeAmenityVenueTitle(line: string, next: string): boolean {
  if (isGenericAmenityItem(line)) return false;
  if (line.length > 52) return false;
  if (/^[*]/.test(line)) return false;
  if (/\$/.test(line)) return false;
  if (looksLikePricingTierTitle(line, next)) return false;
  return /\b(view|tower|city|village|campus|node|hq|plaza|district|mountain view)\b/i.test(line);
}

export function groupAmenityLines(lines: string[]): DetailGroup[] {
  const groups: DetailGroup[] = [];
  let current: DetailGroup = { items: [] };

  for (let i = 0; i < lines.length; i += 1) {
    const line = cleanLine(lines[i]);
    if (!line) continue;
    if (/^Amenities in .+ include:?$/i.test(line) || /^Tickets include:?$/i.test(line)) {
      continue;
    }
    const next = cleanLine(lines[i + 1] ?? '');

    if (looksLikeAmenityVenueTitle(line, next)) {
      if (current.items.length || current.title) groups.push(current);
      current = { title: line, items: [] };
      continue;
    }

    current.items.push(line);
  }

  if (current.items.length || current.title) groups.push(current);

  return rebalanceSharedAmenityLines(flattenEmptyTitleGroups(groups)).filter(
    (g) => g.title || g.items.length,
  );
}

function isSharedAmenityLine(line: string): boolean {
  return /^(both locations|all locations|each location|to use the co-working|across (both|all) )/i.test(line);
}

function rebalanceSharedAmenityLines(groups: DetailGroup[]): DetailGroup[] {
  const shared: string[] = [];
  const adjusted = groups.map((group) => {
    if (!group.title) return group;
    const local: string[] = [];
    for (const item of group.items) {
      if (isSharedAmenityLine(item)) shared.push(item);
      else local.push(item);
    }
    return { ...group, items: local };
  });

  if (!shared.length) return adjusted;

  const firstOpen = adjusted.findIndex((g) => !g.title);
  if (firstOpen >= 0) {
    adjusted[firstOpen] = {
      ...adjusted[firstOpen],
      items: [...shared, ...adjusted[firstOpen].items],
    };
    return adjusted;
  }

  return [{ items: shared }, ...adjusted];
}

export type HistoryEntry = {
  heading: string;
  detail?: string;
};

function ensureSentence(line: string): string {
  const t = line.trim();
  if (!t) return '';
  if (/[.!?]$/.test(t)) return t;
  if (/[:;,—–-]$/.test(t)) return t;
  return `${t}.`;
}

function capitalizeLead(line: string): string {
  const t = line.trim();
  if (!t) return t;
  return t.replace(/^([a-z])/, (ch) => ch.toUpperCase());
}

export function parseHistoryLines(lines: string[]): HistoryEntry[] {
  const entries: HistoryEntry[] = [];
  const merged = mergeBrokenPopupLines(lines);

  for (let i = 0; i < merged.length; i += 1) {
    const line = cleanLine(merged[i]);
    if (!line) continue;

    const yearLead = line.match(/^(\d{4})\s*[-–—]\s*(.+)$/);
    if (yearLead) {
      entries.push({ heading: yearLead[1], detail: ensureSentence(yearLead[2]) });
      continue;
    }

    const rangeLead = line.match(/^(\d{4}\s+to\s+\d{4})\s*[-–—]?\s*(.*)$/i);
    if (rangeLead && rangeLead[2]) {
      entries.push({ heading: rangeLead[1], detail: ensureSentence(rangeLead[2]) });
      continue;
    }

    const inYear = line.match(/^(?:In|By|After|During)\s+(\d{4})\b[,\s]+(.+)$/i);
    if (inYear && inYear[2].length > 20) {
      entries.push({ heading: inYear[1], detail: ensureSentence(capitalizeLead(inYear[2])) });
      continue;
    }

    const nearStartYear = line.match(/^.{0,48}?\b(?:in|by|during)\s+(?:[A-Za-z]+\s+)?(\d{4})\b/i);
    if (nearStartYear && line.length > 60 && !/^\d{4}\b/.test(line)) {
      entries.push({ heading: nearStartYear[1], detail: ensureSentence(line) });
      continue;
    }

    const next = cleanLine(merged[i + 1] ?? '');
    const dateLike = /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(next) || /^\d{4}$/.test(next);
    if (dateLike && line.length < 48 && !/^\d{4}\s*[-–—]/.test(line)) {
      entries.push({ heading: line, detail: ensureSentence(next) });
      i += 1;
      continue;
    }

    if (line.length <= 48 && !/[.!?]/.test(line)) {
      entries.push({ heading: line });
      continue;
    }

    entries.push({ heading: ensureSentence(line) });
  }

  return entries;
}

export function proseLines(lines: string[]): string[] {
  return dedupeLines(
    mergeBrokenPopupLines(lines)
      .map(cleanLine)
      .filter((line) => line.length > 0 && !/^What (is|kind of|are)\b.+\?$/i.test(line))
      .map(ensureSentence),
  );
}
