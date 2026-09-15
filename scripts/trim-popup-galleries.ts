import { existsSync, readdirSync, statSync, unlinkSync, writeFileSync } from 'fs';
import path from 'path';
import { getAllPopups } from '@/lib/popups';
import {
  POPUP_MIN_COVER_IMAGES,
  popupCommunityCoverCount,
  trimPopupCoverImages,
} from '@/lib/popup-gallery';
import type { Popup } from '@/types/popup';

const PUBLIC_POPUPS = path.join(process.cwd(), 'public/popups');
const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

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

function collectReferencedWebPaths(popups: Popup[]): Set<string> {
  const refs = new Set<string>();
  for (const popup of popups) {
    if (popup.image?.startsWith('/popups/')) refs.add(popup.image);
    for (const src of popup.coverImages ?? []) {
      if (src.startsWith('/popups/')) refs.add(src);
    }
  }
  return refs;
}

function walkFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkFiles(full));
    else out.push(full);
  }
  return out;
}

function pruneUnreferencedAssets(popups: Popup[]): string[] {
  const refs = collectReferencedWebPaths(popups);
  const removed: string[] = [];
  for (const filePath of walkFiles(PUBLIC_POPUPS)) {
    const ext = path.extname(filePath).toLowerCase();
    if (!IMAGE_EXT.has(ext)) continue;
    const webPath = `/${path.relative(path.join(process.cwd(), 'public'), filePath).split(path.sep).join('/')}`;
    if (refs.has(webPath)) continue;
    unlinkSync(filePath);
    removed.push(webPath);
  }
  return removed;
}

function main() {
  const popups = getAllPopups();
  const updated: Popup[] = [];
  const report: string[] = [];

  for (const popup of popups) {
    const before = (popup.coverImages ?? []).length;
    const coverImages = trimPopupCoverImages(popup.coverImages ?? []);
    const after = coverImages.length;
    if (before !== after) {
      report.push(`${popup.slug}: ${before} → ${after} covers`);
    }
    updated.push({ ...popup, coverImages });
  }

  writeFileSync('src/lib/popups.ts', header + JSON.stringify(updated, null, 2) + footer);

  const removed = pruneUnreferencedAssets(updated);
  const short = updated.filter((p) => popupCommunityCoverCount(p) < POPUP_MIN_COVER_IMAGES);

  console.log(report.join('\n') || '(cover lists unchanged)');
  console.log(`Pruned ${removed.length} unreferenced files from public/popups`);
  if (removed.length) {
    for (const p of removed.slice(0, 20)) console.log(`  - ${p}`);
    if (removed.length > 20) console.log(`  … and ${removed.length - 20} more`);
  }
  console.log(
    `\n${updated.length} popups. Under ${POPUP_MIN_COVER_IMAGES} community photos: ${short.map((p) => p.slug).join(', ') || 'none'}`,
  );
  if (short.length) process.exit(1);
}

main();
