import { writeFileSync } from 'fs';
import { getAllPopups } from '@/lib/popups';
import {
  formatPopupPricingSummary,
  rewritePopupLine,
  scrubPopupLines,
} from '@/lib/popup-copy-guard';
import { explodePopupTextLines, mergeBrokenPopupLines } from '@/lib/popup-text';
import type { Popup } from '@/types/popup';

const TAGLINE_FIXES: Record<string, string> = {
  zuberlin: 'Immersive tech coliving residency in Berlin',
};

const SUMMARY_FIXES: Record<string, string> = {
  zuberlin: 'Berlin coliving residency for researchers and founders, often hosted at Funkhaus.',
};

function rewriteLines(lines: string[] | undefined): string[] {
  return (lines ?? []).map((line) => rewritePopupLine(line));
}

function scrubBody(lines: string[] | undefined): string[] {
  return explodePopupTextLines(scrubPopupLines(rewriteLines(lines)));
}

function scrubField(lines: string[] | undefined): string[] {
  return scrubPopupLines(rewriteLines(lines));
}

function scrubPopup(popup: Popup): Popup {
  const pricing = scrubField(popup.pricing);
  const pricingSummary = formatPopupPricingSummary(pricing, popup.pricingSummary);

  const summaryRaw =
    SUMMARY_FIXES[popup.slug] ??
    scrubPopupLines([rewritePopupLine(popup.summary)])[0] ??
    popup.summary;

  return {
    ...popup,
    tagline: TAGLINE_FIXES[popup.slug] ?? popup.tagline,
    summary: summaryRaw,
    body: scrubBody(popup.body),
    overview: scrubField(popup.overview),
    locationDetails: scrubField(popup.locationDetails),
    durationNotes: scrubField(popup.durationNotes),
    history: scrubField(mergeBrokenPopupLines(rewriteLines(popup.history))),
    amenities: scrubField(popup.amenities),
    pricing,
    pricingSummary,
  };
}

const header = `import type { Popup } from '@/types/popup';

export const POPUP_TYPES = ['popup', 'permanent', 'sez'] as const;

export const POPUP_TYPE_LABELS: Record<(typeof POPUP_TYPES)[number], string> = {
  popup: 'Popup',
  permanent: 'Permanent',
  sez: 'City / SEZ',
};

export const popupData: Popup[] = `;

const footer = `;

export function getAllPopups(): Popup[] {
  return [...popupData].sort((a, b) => a.name.localeCompare(b.name));
}

export function getPopupBySlug(slug: string): Popup | undefined {
  return popupData.find((popup) => popup.slug === slug);
}

export function getPopupSlugs(): string[] {
  return popupData.map((popup) => popup.slug);
}
`;

const popups = getAllPopups().map(scrubPopup);
writeFileSync('src/lib/popups.ts', header + JSON.stringify(popups, null, 2) + footer);

console.log(`Scrubbed ${popups.length} popups.`);
