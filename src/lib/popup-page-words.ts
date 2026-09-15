import type { Popup } from '@/types/popup';
import { filterPopupBody } from '@/lib/popup-text';

/** Editorial word count for a popup detail page (excludes social posts). */
export function popupPageWordCount(popup: Popup): number {
  const chunks: string[] = [
    ...filterPopupBody(popup.body),
    popup.summary,
    popup.tagline,
    ...(popup.overview ?? []),
    ...(popup.locationDetails ?? []),
    ...(popup.durationNotes ?? []),
    ...(popup.history ?? []),
    ...(popup.pricing ?? []),
    popup.pricingSummary ?? '',
    ...(popup.amenities ?? []),
  ].filter(Boolean);

  return chunks.join(' ').split(/\s+/).filter(Boolean).length;
}

export const POPUP_PAGE_MIN_WORDS = 500;

export function popupMeetsPageMinimum(popup: Popup): boolean {
  return popupPageWordCount(popup) >= POPUP_PAGE_MIN_WORDS;
}
