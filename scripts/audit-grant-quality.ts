#!/usr/bin/env tsx
/**
 * Scan all grants for content/formatting defects in stored JSON.
 */
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import grants from '../content/grants/grants.json';
import type { GrantProgram } from '../src/types';
import { EventGuideContent } from '../src/components/event-guide-content';
import { generateGrantEditorial, grantEditorialToEventArticle, countStoredGrantWords } from '../src/lib/grant-editorial';
import { descriptionFormattingIssues } from './lib/description-format-checks';
import * as cheerio from 'cheerio';

type Issue = { id: string; kind: string; detail: string };

const issues: Issue[] = [];
const newsHost = /cointelegraph|decrypt\.co|coindesk|theblock\.co/i;
const junkPara = /^(?:published time:|url source:|markdown content:|\*\*acala and karura)/i;

function add(id: string, kind: string, detail: string) {
  issues.push({ id, kind, detail: detail.slice(0, 160) });
}

for (const grant of grants as GrantProgram[]) {
  const id = grant.id;
  const words = countStoredGrantWords(grant);

  if (grant.description && /^[a-z]/.test(grant.description.trim())) {
    add(id, 'description-lowercase-lead', grant.description.slice(0, 80));
  }
  if (newsHost.test(grant.url || '')) {
    add(id, 'news-url', grant.url);
  }
  if (grant.descriptionSource?.method === 'listing-summary-unverified-fetch') {
    add(id, 'unverified-fetch', grant.descriptionSource.method);
  }

  const headings: string[] = [];
  for (const section of grant.sections || []) {
    if (headings.includes(section.heading)) add(id, 'duplicate-section-heading', section.heading);
    headings.push(section.heading);
    if (/published time:/i.test(section.heading)) add(id, 'junk-heading', section.heading);
    for (const p of section.paragraphs || []) {
      if (junkPara.test(p) || /\[learn more\]\(/i.test(p)) add(id, 'junk-paragraph', p.slice(0, 100));
      if (/\*\*[^*]+\*\*/.test(p)) add(id, 'markdown-bold-leak', p.slice(0, 100));
      if (/^magazine:|source: youtube|hall of flame|^related:/i.test(p)) add(id, 'sidebar-junk', p.slice(0, 80));
    }
    if (/faq/i.test(section.heading)) {
      const ps = section.paragraphs || [];
      if (ps.length >= 2 && !ps.some((p) => p.includes('?'))) {
        add(id, 'orphan-faq', `${ps.length} answers without questions`);
      }
    }
  }

  const editorial = grantEditorialToEventArticle(generateGrantEditorial(grant));
  const html = renderToStaticMarkup(
    createElement(EventGuideContent, {
      editorial,
      officialUrl: grant.url,
      contentMarker: 'grant',
    }),
  );
  for (const f of descriptionFormattingIssues(html)) {
    add(id, `render-${f.kind}`, f.sample);
  }
  if (words < 150) add(id, 'thin-content', `${words} stored words`);
}

const byKind: Record<string, number> = {};
for (const i of issues) byKind[i.kind] = (byKind[i.kind] || 0) + 1;

console.log(JSON.stringify({ grants: grants.length, issueCount: issues.length, byKind }, null, 2));
for (const [kind, n] of Object.entries(byKind).sort((a, b) => b[1] - a[1])) {
  const sample = issues.filter((i) => i.kind === kind).slice(0, 8).map((i) => `  ${i.id}: ${i.detail}`);
  console.log(`\n${kind} (${n})\n${sample.join('\n')}`);
}