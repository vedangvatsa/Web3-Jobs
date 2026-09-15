import { shouldDropPopupLine } from '@/lib/popup-copy-guard';
import { formatPopupText, isPopupScrapeNoise, mergeBrokenPopupLines } from '@/lib/popup-text';

function cleanLine(line: string): string {
  const t = formatPopupText(line);
  if (!t || isPopupScrapeNoise(t) || shouldDropPopupLine(t)) return '';
  return t;
}

function looksLikePrice(line: string): boolean {
  return /^\$|starts at \$/i.test(line) || /\/night|\/month|\/week|floor price|membership/i.test(line);
}

function looksLikeVenueTitle(line: string, next?: string): boolean {
  if (looksLikePrice(line)) return false;
  if (line.length > 52) return false;
  if (/^[*]/.test(line)) return false;
  if (/^(public spaces|there are|alternatively|to attend|membership)/i.test(line)) return false;
  return Boolean(next && (looksLikePrice(next) || /^starts at/i.test(next)));
}

export type DetailGroup = {
  title?: string;
  items: string[];
};

export function groupPricingLines(lines: string[]): DetailGroup[] {
  const groups: DetailGroup[] = [];
  let current: DetailGroup = { items: [] };

  for (let i = 0; i < lines.length; i += 1) {
    const line = cleanLine(lines[i]);
    if (!line) continue;
    const next = cleanLine(lines[i + 1] ?? '');

    if (looksLikeVenueTitle(line, next)) {
      if (current.items.length) groups.push(current);
      current = { title: line, items: [] };
      continue;
    }

    if (/^[*]/.test(line)) {
      current.items.push(line.replace(/^\*\s*/, ''));
      continue;
    }

    if (looksLikePrice(line) || line.length > 20) {
      current.items.push(line);
    } else if (!current.title && !groups.length && !current.items.length) {
      current.items.push(line);
    } else {
      current.items.push(line);
    }
  }

  if (current.items.length || current.title) groups.push(current);
  return groups.filter((g) => g.title || g.items.length);
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
    const nextIsShortAmenity =
      next &&
      next.length < 42 &&
      !next.startsWith('Both ') &&
      !next.startsWith('To use') &&
      !next.startsWith('A coffee');

    if (
      looksLikeVenueTitle(line, next) ||
      (/^[A-Z0-9]/.test(line) && line.length < 40 && nextIsShortAmenity && !line.includes('.'))
    ) {
      if (current.items.length || current.title) groups.push(current);
      current = { title: line, items: [] };
      continue;
    }

    current.items.push(line);
  }

  if (current.items.length || current.title) groups.push(current);
  return groups.filter((g) => g.title || g.items.length);
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

    // "In 2023, …" / "By 2025, …" prose — use year as heading, rest as detail.
    const inYear = line.match(/^(?:In|By|After|During)\s+(\d{4})\b[,\s]+(.+)$/i);
    if (inYear && inYear[2].length > 20) {
      entries.push({ heading: inYear[1], detail: ensureSentence(capitalizeLead(inYear[2])) });
      continue;
    }

    // "After proving demand, by March 2025 it evolved…" — year near the start only.
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

    // Short labels (v1, slot counts) stay as headings; long prose becomes detail-only.
    if (line.length <= 48 && !/[.!?]/.test(line)) {
      entries.push({ heading: line });
      continue;
    }

    entries.push({ heading: ensureSentence(line) });
  }

  return entries;
}

export function proseLines(lines: string[]): string[] {
  return mergeBrokenPopupLines(lines)
    .map(cleanLine)
    .filter((line) => line.length > 0 && !/^What (is|kind of|are)\b.+\?$/i.test(line))
    .map(ensureSentence);
}
