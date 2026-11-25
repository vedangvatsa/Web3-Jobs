#!/usr/bin/env tsx
/**
 * Per-event manual-quality checklist (all published runtime events).
 * Writes content/events/MANUAL-QUALITY-REPORT.json and fails on any FLAG.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import * as cheerio from 'cheerio';
import { EventGuideContent } from '../src/components/event-guide-content';
import { buildEventsListing } from '../src/lib/events-listing-build';
import { resolveEventGuide } from '../src/lib/event-guide-store';
import { publishedOrganizerDescriptionText } from '../src/lib/luma-event-content';
import { buildEditorialFromOrganizerDescription } from '../src/lib/luma-event-content';
import { textJunkRunIssues } from './lib/description-format-checks';

type Flag = { code: string; detail: string };

async function auditOne(
  event: Awaited<ReturnType<typeof buildEventsListing>>[number],
): Promise<{ slug: string; name: string; words: number; flags: Flag[] }> {
  const slug = event.slug || event.id;
  const text = publishedOrganizerDescriptionText(event);
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const flags: Flag[] = [];

  if (words < 25) flags.push({ code: 'thin-copy', detail: `${words} words in published body` });
  if (/https?:\/\//i.test(text)) flags.push({ code: 'bare-url', detail: 'http(s) still in published text' });
  if (/LumaSkip to Content/i.test(text)) flags.push({ code: 'luma-chrome', detail: 'LumaSkip chrome in body' });
  if (/^\s*:\s*$/m.test(text)) flags.push({ code: 'orphan-colon', detail: 'standalone colon line' });
  if (/^(?:Learn more|Read more|Click here):\s*$/im.test(text)) {
    flags.push({ code: 'empty-cta', detail: 'CTA line without destination' });
  }
  if (/^(?:Co-hosts|Partners|Media partners|MEDIA partners):\s*$/im.test(text)) {
    flags.push({ code: 'empty-sponsors', detail: 'sponsor label with no names' });
  }
  if (/(?:^|[\s(])www\.[a-z0-9]/im.test(text)) {
    flags.push({ code: 'www-fragment', detail: 'www. host fragment in copy' });
  }

  for (const issue of textJunkRunIssues(text)) {
    if (issue.kind !== 'junk-run') {
      flags.push({ code: issue.kind, detail: issue.sample.slice(0, 120) });
    }
  }

  const guide = await resolveEventGuide(event);
  const html = renderToStaticMarkup(
    createElement(EventGuideContent, { editorial: guide, contentMarker: 'event' }),
  );
  const $ = cheerio.load(html);
  if ($('[data-event-description] a[href^="http"]').length) {
    flags.push({ code: 'body-hyperlink', detail: 'outbound anchor in event body' });
  }

  const editorial = buildEditorialFromOrganizerDescription(event);
  if (!editorial.sections.length && !editorial.summaryLead.trim()) {
    flags.push({ code: 'no-sections', detail: 'no editorial sections rendered' });
  }
  for (const section of editorial.sections) {
    if (!section.heading.trim()) flags.push({ code: 'empty-heading', detail: 'section missing heading' });
    if (section.heading.length > 120) {
      flags.push({ code: 'long-heading', detail: `heading ${section.heading.length} chars` });
    }
    const joined = section.content.join(' ').trim();
    if (!joined) flags.push({ code: 'empty-section', detail: `empty section: ${section.heading.slice(0, 40)}` });
  }

  return { slug, name: event.name, words, flags };
}

async function main() {
  const events = await buildEventsListing();
  const rows = [];
  const flagged: typeof rows = [];

  for (const event of events) {
    const row = await auditOne(event);
    rows.push(row);
    if (row.flags.length) flagged.push(row);
  }

  const report = {
    generatedAt: new Date().toISOString(),
    total: rows.length,
    passed: rows.length - flagged.length,
    flagged: flagged.length,
    rows,
  };

  const outPath = path.join(process.cwd(), 'content/events/MANUAL-QUALITY-REPORT.json');
  fs.writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`);

  console.log(`Manual quality: ${report.passed}/${report.total} passed, ${report.flagged} flagged`);
  console.log(`Report: ${outPath}`);
  if (flagged.length) {
    for (const row of flagged.slice(0, 25)) {
      console.log(`  [${row.slug}] ${row.flags.map((f) => f.code).join(', ')}`);
    }
    if (flagged.length > 25) console.log(`  ... and ${flagged.length - 25} more`);
    process.exitCode = 1;
  }
}

void main();