/**
 * Audit popup detail data for scrape leaks, duplicates, and broken sections.
 *
 * Usage: npx tsx scripts/audit-popup-pages.ts
 */
import { popupData } from '../src/lib/popups';
import {
  isPopupScrapeCopy,
  isPopupMetaDirectoryCopy,
  isPopupGenericFiller,
  shouldDropPopupLine,
} from '../src/lib/popup-copy-guard';
import { composePopupNarrative } from '../src/lib/popup-narrative';
import {
  filterPopupBody,
  isPopupScrapeNoise,
  formatPopupParagraph,
} from '../src/lib/popup-text';
import { parseLocationDetailLines, proseLines } from '../src/lib/popup-detail-sections';
import type { Popup } from '../src/types/popup';

type Issue = { slug: string; kind: string; detail: string };

const UI_CHROME =
  /\b(Home Contact Privacy|Skip to content|Flip Reset Enlarge|Membership Content Market|Applications \d+ Population|GNP \(Est\.\)|Join \w+ Join \w+|Read more|Learn More|Frequently asked)\b/i;

const INCOMPLETE =
  /(?:,\s*$|December 31,\s*$|^\s*[)”]\s)/;

const FAQ_IN_BODY = /^How (does|do|is|are|can|will)\b.+\?/i;

function dupes(lines: string[]): string[] {
  const seen = new Map<string, number>();
  const d: string[] = [];
  for (const raw of lines) {
    const key = formatPopupParagraph(raw).toLowerCase();
    if (!key) continue;
    const n = (seen.get(key) ?? 0) + 1;
    seen.set(key, n);
    if (n === 2) d.push(raw.slice(0, 100));
  }
  return d;
}

function lineFlags(text: string): string[] {
  const t = formatPopupParagraph(text);
  if (!t) return [];
  const flags: string[] = [];
  if (isPopupScrapeNoise(t)) flags.push('scrape-noise');
  if (shouldDropPopupLine(t)) flags.push('drop-line');
  if (isPopupScrapeCopy(t)) flags.push('scrape-copy');
  if (isPopupMetaDirectoryCopy(t)) flags.push('meta-directory');
  if (isPopupGenericFiller(t)) flags.push('generic-filler');
  if (UI_CHROME.test(t)) flags.push('ui-chrome');
  if (INCOMPLETE.test(t)) flags.push('incomplete');
  if (FAQ_IN_BODY.test(t)) flags.push('faq-in-body');
  if (t.length > 280 && (t.match(/[.!?]/g) ?? []).length <= 1) flags.push('run-on');
  if (/\b0 Billion\b|\$ 0\b/.test(t)) flags.push('placeholder-metrics');
  return flags;
}

function auditPopup(popup: Popup): Issue[] {
  const issues: Issue[] = [];
  const slug = popup.slug;

  const fields: Array<{ name: string; lines: string[] }> = [
    { name: 'body', lines: popup.body ?? [] },
    { name: 'overview', lines: popup.overview ?? [] },
    { name: 'locationDetails', lines: popup.locationDetails ?? [] },
    { name: 'durationNotes', lines: popup.durationNotes ?? [] },
    { name: 'history', lines: popup.history ?? [] },
    { name: 'pricing', lines: popup.pricing ?? [] },
    { name: 'amenities', lines: popup.amenities ?? [] },
  ];

  for (const { name, lines } of fields) {
    const d = dupes(lines);
    for (const line of d) {
      issues.push({ slug, kind: 'duplicate', detail: `${name}: ${line}…` });
    }
    for (const raw of lines) {
      const flags = lineFlags(raw);
      if (flags.length) {
        issues.push({
          slug,
          kind: flags.join('+'),
          detail: `${name}: ${raw.slice(0, 140)}${raw.length > 140 ? '…' : ''}`,
        });
      }
    }
  }

  const narrative = composePopupNarrative(popup);
  for (const para of narrative) {
    const flags = lineFlags(para);
    if (flags.some((f) => f !== 'run-on')) {
      issues.push({
        slug,
        kind: `rendered-${flags.join('+')}`,
        detail: `narrative: ${para.slice(0, 140)}…`,
      });
    }
  }

  const locRendered = parseLocationDetailLines(popup.locationDetails ?? []);
  const locDupes = dupes([
    ...locRendered.other,
    ...locRendered.places.map((p) => `${p.name}. ${p.detail}`),
  ]);
  for (const line of locDupes) {
    issues.push({ slug, kind: 'location-render-dup', detail: line });
  }

  const dur = proseLines(popup.durationNotes ?? []);
  if (dupes(dur).length) {
    issues.push({ slug, kind: 'duration-render-dup', detail: dur.join(' | ').slice(0, 120) });
  }

  const kept = filterPopupBody(popup.body ?? []);
  const dropped = (popup.body ?? []).filter((l) => !kept.includes(formatPopupParagraph(l)));
  if (dropped.length > 0) {
    issues.push({
      slug,
      kind: 'body-filter-would-drop',
      detail: `${dropped.length} line(s) still in source`,
    });
  }

  if (popup.website?.includes('t.co/')) {
    issues.push({
      slug,
      kind: 'bad-website',
      detail: `website is Twitter redirect: ${popup.website}`,
    });
  }

  return issues;
}

function main() {
  const all: Issue[] = [];
  for (const popup of popupData) {
    all.push(...auditPopup(popup));
  }

  const bySlug = new Map<string, Issue[]>();
  for (const i of all) {
    if (!bySlug.has(i.slug)) bySlug.set(i.slug, []);
    bySlug.get(i.slug)!.push(i);
  }

  const slugs = [...bySlug.keys()].sort();
  console.log(`Audited ${popupData.length} popups — ${slugs.length} with issues, ${all.length} flags total.\n`);

  for (const slug of slugs) {
    const items = bySlug.get(slug)!;
    console.log(`## /${slug} (${items.length})`);
    for (const i of items.slice(0, 12)) {
      console.log(`  [${i.kind}] ${i.detail}`);
    }
    if (items.length > 12) console.log(`  … +${items.length - 12} more`);
    console.log('');
  }

  if (all.length > 0) process.exit(1);
  console.log('No issues found.');
}

main();
