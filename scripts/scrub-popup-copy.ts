import { writeFileSync } from 'fs';
import { getAllPopups } from '@/lib/popups';
import { scrubPopupLines } from '@/lib/popup-copy-guard';
import type { Popup } from '@/types/popup';

const TAGLINE_FIXES: Record<string, string> = {
  zuberlin: 'Immersive tech coliving residency in Berlin',
};

const SUMMARY_FIXES: Record<string, string> = {
  zuberlin: 'Berlin coliving residency for researchers and founders, often hosted at Funkhaus.',
};

function scrubPopup(popup: Popup): Popup {
  const pricingSummary = popup.pricingSummary
    ? scrubPopupLines([popup.pricingSummary])[0] ?? null
    : null;

  return {
    ...popup,
    tagline: TAGLINE_FIXES[popup.slug] ?? popup.tagline,
    summary: SUMMARY_FIXES[popup.slug] ?? scrubPopupLines([popup.summary])[0] ?? popup.summary,
    body: scrubPopupLines(popup.body),
    overview: scrubPopupLines(popup.overview),
    locationDetails: scrubPopupLines(popup.locationDetails),
    durationNotes: scrubPopupLines(popup.durationNotes),
    history: scrubPopupLines(popup.history),
    amenities: scrubPopupLines(popup.amenities),
    pricing: scrubPopupLines(popup.pricing),
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
