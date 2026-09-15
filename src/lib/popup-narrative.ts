import type { Popup } from '@/types/popup';
import { isPopupOverviewPadding } from '@/lib/popup-copy-guard';
import {
  filterPopupBody,
  formatPopupParagraph,
  formatPopupText,
  insertSentenceBreaksInRunOn,
  isPopupScrapeNoise,
  splitPopupSentences,
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

/** Group sentences into readable paragraphs (not one sentence per line). */
function groupSentencesIntoParagraphs(sentences: string[], targetWords = 90): string[] {
  const out: string[] = [];
  let buf: string[] = [];
  let n = 0;

  for (const raw of sentences) {
    const s = asSentence(raw);
    if (!s) continue;
    buf.push(s);
    n += wordCount(s);
    // Prefer 2–4 sentences; flush once we have enough words or a long sentence.
    if (n >= targetWords || (buf.length >= 3 && n >= 55) || buf.length >= 4) {
      out.push(buf.join(' '));
      buf = [];
      n = 0;
    }
  }
  if (buf.length) out.push(buf.join(' '));
  return out.filter(Boolean);
}

/** Main article: editorial body + summary/overview only (lists live in sections below). */
export function composePopupNarrative(popup: Popup): string[] {
  const sentences: string[] = [];
  const seen = new Set<string>();

  const push = (text: string) => {
    const s = asSentence(text);
    if (!s) return;
    const key = s.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    sentences.push(s);
  };

  for (const p of filterPopupBody(popup.body)) {
    const prose = insertSentenceBreaksInRunOn(p);
    for (const sent of splitPopupSentences(prose)) push(sent);
  }

  const summary = asSentence(popup.summary);
  if (summary && !sentences.some((b) => b.includes(summary.slice(0, 40)))) {
    push(summary);
  }

  for (const line of popup.overview ?? []) {
    if (isPopupOverviewPadding(line)) continue;
    for (const sent of splitPopupSentences(insertSentenceBreaksInRunOn(line))) {
      push(sent);
    }
  }

  if (!sentences.length) {
    return filterPopupBody(popup.body);
  }

  return groupSentencesIntoParagraphs(sentences, 90);
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
