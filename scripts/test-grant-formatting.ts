#!/usr/bin/env tsx
/**
 * Render every grant detail body (EventGuideContent) and fail on formatting defects.
 */
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import grants from '../content/grants/grants.json';
import type { GrantProgram } from '../src/types';
import { EventGuideContent } from '../src/components/event-guide-content';
import { generateGrantEditorial, grantEditorialToEventArticle } from '../src/lib/grant-editorial';
import * as cheerio from 'cheerio';
import { descriptionFormattingIssues, textJunkRunIssues } from './lib/description-format-checks';

type Finding = { id: string; kind: string; sample: string };

const findings: Finding[] = [];

for (const grant of grants as GrantProgram[]) {
  const editorial = grantEditorialToEventArticle(generateGrantEditorial(grant));
  const html = renderToStaticMarkup(
    createElement(EventGuideContent, {
      editorial,
      officialUrl: grant.url,
      contentMarker: 'grant',
    }),
  );

  for (const issue of descriptionFormattingIssues(html)) {
    findings.push({ id: grant.id, kind: issue.kind, sample: issue.sample });
  }

  const visibleText = cheerio.load(html)('section').text();
  for (const issue of textJunkRunIssues(visibleText)) {
    if (issue.kind === 'junk-run') continue;
    findings.push({ id: grant.id, kind: `text-${issue.kind}`, sample: issue.sample });
  }

  for (const section of grant.sections || []) {
    if (!section.heading?.trim() || section.heading.length > 180) {
      findings.push({ id: grant.id, kind: 'section-heading', sample: section.heading || '(empty)' });
    }
    for (const p of section.paragraphs || []) {
      if (/<\/?(?:p|div|script|iframe|table)\b/i.test(p)) {
        findings.push({ id: grant.id, kind: 'raw-html-in-paragraph', sample: p.slice(0, 200) });
      }
    }
  }
}

if (findings.length > 0) {
  const byKind: Record<string, number> = {};
  for (const f of findings) byKind[f.kind] = (byKind[f.kind] || 0) + 1;
  const lines = findings.slice(0, 25).map((f) => `  ${f.id} [${f.kind}]: ${f.sample.replace(/\s+/g, ' ').slice(0, 120)}`);
  throw new Error(
    `${findings.length} grant formatting issue(s) across ${grants.length} grants:\n${JSON.stringify(byKind)}\n${lines.join('\n')}`,
  );
}

console.log(`Grant formatting regression passed for ${grants.length} published grants.`);