import type { Popup } from '@/types/popup';
import {
  filterPopupBody,
  formatPopupParagraph,
  formatPopupText,
  isPopupScrapeNoise,
} from '@/lib/popup-text';

export const POPUP_NARRATIVE_MIN_WORDS = 500;

function wordCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

function asSentence(text: string): string {
  const t = formatPopupParagraph(text);
  if (!t || isPopupScrapeNoise(t)) return '';
  if (/[.!?]$/.test(t)) return t;
  return `${t}.`;
}

function splitIntoParagraphs(paragraphs: string[], targetWords = 120): string[] {
  const out: string[] = [];
  for (const block of paragraphs) {
    const sentences = block.match(/[^.!?]+[.!?]+/g)?.map((s) => formatPopupParagraph(s)) ?? [block];
    let buf: string[] = [];
    let n = 0;
    for (const s of sentences) {
      if (!s) continue;
      buf.push(s);
      n += wordCount(s);
      if (n >= targetWords) {
        out.push(buf.join(' '));
        buf = [];
        n = 0;
      }
    }
    if (buf.length) out.push(buf.join(' '));
  }
  return out.filter(Boolean);
}

/** Main article: editorial body + summary/overview only (lists live in sections below). */
export function composePopupNarrative(popup: Popup): string[] {
  const blocks: string[] = [];

  for (const p of filterPopupBody(popup.body)) {
    blocks.push(asSentence(p));
  }

  const summary = asSentence(popup.summary);
  if (summary && !blocks.some((b) => b.includes(summary.slice(0, 40)))) {
    blocks.push(summary);
  }

  for (const line of popup.overview ?? []) {
    const s = asSentence(line);
    if (s) blocks.push(s);
  }

  const cleaned = blocks.filter(Boolean);
  if (!cleaned.length) {
    return filterPopupBody(popup.body);
  }

  return splitIntoParagraphs(cleaned, 120);
}

export function popupNarrativeWordCount(popup: Popup): number {
  return wordCount(composePopupNarrative(popup).join(' '));
}

export function popupMeetsNarrativeMinimum(popup: Popup): boolean {
  return popupNarrativeWordCount(popup) >= POPUP_NARRATIVE_MIN_WORDS;
}

/** Normalize user-visible strings on the detail page. */
export function formatPopupField(text: string): string {
  return formatPopupText(text);
}
