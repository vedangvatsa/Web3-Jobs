import { readFileSync, writeFileSync } from 'fs';
import { getAllPopups } from '@/lib/popups';
import { scrubPopupLines, shouldDropPopupLine } from '@/lib/popup-copy-guard';
import type { Popup } from '@/types/popup';

type Supplement = Partial<
  Pick<
    Popup,
    | 'body'
    | 'overview'
    | 'history'
    | 'locationDetails'
    | 'durationNotes'
    | 'amenities'
    | 'pricing'
  >
>;

const supplements = JSON.parse(
  readFileSync('content/popup-verified-supplements.json', 'utf-8')
) as Record<string, Supplement>;

const fields: Array<keyof Supplement> = [
  'body',
  'overview',
  'history',
  'locationDetails',
  'durationNotes',
  'amenities',
  'pricing',
];

function mergeLines(existing: string[] | undefined, incoming: string[]): string[] {
  const out = [...(existing ?? [])];
  const seen = new Set(out.map((l) => l.toLowerCase()));
  for (const line of incoming) {
    if (shouldDropPopupLine(line)) continue;
    const key = line.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(line);
  }
  return out;
}

const popups = getAllPopups().map((popup) => {
  const extra = supplements[popup.slug];
  if (!extra) return popup;
  const next: Popup = { ...popup };
  for (const field of fields) {
    const lines = extra[field];
    if (!lines?.length) continue;
    const cleaned = scrubPopupLines(lines);
    next[field] = mergeLines(next[field] as string[] | undefined, cleaned) as Popup[typeof field];
  }
  return next;
});

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

writeFileSync('src/lib/popups.ts', header + JSON.stringify(popups, null, 2) + footer);
console.log('Applied verified supplements.');
