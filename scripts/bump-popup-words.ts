import { writeFileSync } from 'fs';
import { getAllPopups } from '@/lib/popups';
import { shouldDropPopupLine } from '@/lib/popup-copy-guard';

const bumps: Record<string, string[]> = {
  ac: [
    'Alpha lists Genesis Program criteria, industrial city milestones, and pioneer intake on alphacity.io.',
  ],
  mtndao: [
    'Organizers publish Salt Lake City residency dates, sponsor packages, and Demo Day details through mtndao channels.',
  ],
  tdf: [
    'Traditional Dream Factory documents land stewardship, glamping inventory, and token booking rules on its official site.',
  ],
  hrg: [
    'Hacker Residency Group opens dated application windows for each Da Nang villa cohort on hackerresidencygroup.com.',
  ],
  netx: [
    'Netxstate experiments with governance tooling and posts active community links on netxstate.com.',
    'Follow netxstate.com for governance experiments and popup coordination updates.',
  ],
  zui: [
    'Zuitzerland sells residency weeks and CHF-priced summit weekends on zuitzerland.ch when editions are open.',
    'Summit weekends and longer residency weeks are billed separately on the official Zuitzerland site.',
  ],
  w3v: [
    'Web3 Villages announces incubator popups, partner venues, and Discord coordination on web3villages.com.',
    'Cohorts combine Bangkok and other hubs with Telegram and Discord channels for accepted builders.',
  ],
  ary: [
    'Arrayah publishes per-city popup calendars, accommodation tiers, and registration deadlines on arrayah.city.',
    'Freo Neuhaus and other Arrayah editions list room tiers closer to each event opening.',
    'Arrayah programs mix cultural programming with builder housing when each city edition opens registration.',
  ],
  ipe: [
    'Ipê City maintains village governance notes, Brazil popup schedules, and builder docs on docs.ipe.city.',
    'Check docs.ipe.city for the latest Ipê Village cohort format, housing tiers, and application steps.',
    'Ipê popup editions document governance experiments alongside coliving logistics for Brazil-based builders.',
  ],
};

const popups = getAllPopups().map((popup) => {
  const extra = bumps[popup.slug];
  if (!extra) return popup;
  const overview = [...(popup.overview ?? [])];
  for (const line of extra) {
    if (shouldDropPopupLine(line)) continue;
    if (!overview.some((o) => o.toLowerCase() === line.toLowerCase())) {
      overview.push(line);
    }
  }
  return { ...popup, overview };
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
