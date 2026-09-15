import { getAllPopups } from '@/lib/popups';
import {
  isPopupGenericFiller,
  isPopupScrapeCopy,
  isPopupSlopCopy,
} from '@/lib/popup-copy-guard';

type Issue = { slug: string; field: string; sample: string; kind: string };

const TEXT_FIELDS = [
  'summary',
  'tagline',
  'body',
  'overview',
  'locationDetails',
  'durationNotes',
  'history',
  'amenities',
  'pricing',
  'pricingSummary',
] as const;

const issues: Issue[] = [];

for (const popup of getAllPopups()) {
  for (const field of TEXT_FIELDS) {
    const lines =
      field === 'summary' || field === 'tagline' || field === 'pricingSummary'
        ? [popup[field]].filter(Boolean)
        : (popup[field] as string[] | undefined) ?? [];

    for (const line of lines) {
      const text = String(line);
      if (isPopupGenericFiller(text)) {
        issues.push({ slug: popup.slug, field, sample: text.slice(0, 80), kind: 'generic-filler' });
      } else if (isPopupScrapeCopy(text)) {
        issues.push({ slug: popup.slug, field, sample: text.slice(0, 80), kind: 'scrape' });
      } else if (isPopupSlopCopy(text)) {
        issues.push({ slug: popup.slug, field, sample: text.slice(0, 80), kind: 'slop' });
      }
    }
  }
}

if (issues.length) {
  console.error(`Found ${issues.length} copy issues:`);
  for (const row of issues.slice(0, 40)) {
    console.error(`  [${row.kind}] ${row.slug}.${row.field}: ${row.sample}…`);
  }
  if (issues.length > 40) console.error(`  …and ${issues.length - 40} more`);
  process.exit(1);
}

console.log('Popup copy audit passed (no generic filler, scrape, or slop flags).');
