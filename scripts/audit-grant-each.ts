#!/usr/bin/env tsx
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import grants from '../content/grants/grants.json';
import type { GrantProgram } from '../src/types';
import { EventGuideContent } from '../src/components/event-guide-content';
import { generateGrantEditorial, grantEditorialToEventArticle, countStoredGrantWords } from '../src/lib/grant-editorial';
import { descriptionFormattingIssues } from './lib/description-format-checks';

const BANNED_URL =
  /(?:https?:\/\/)?(?:www\.)?(?:discord\.(?:gg|com)|t\.me\/|telegram\.(?:me|dog)|chat\.whatsapp\.com|wa\.me\/|api\.whatsapp\.com)/i;
const TON = new Set(['ton-grants', 'ton-champions']);
const JUNK = /published time:|you signed in with another tab|camper van|press enter or click to view|^\/\//i;

type Row = { id: string; words: number; issues: string[] };

const rows: Row[] = [];

for (const grant of grants as GrantProgram[]) {
  const issues: string[] = [];
  const words = countStoredGrantWords(grant);
  const blob = [
    grant.description,
    ...(grant.sections || []).flatMap((s) => [...(s.paragraphs || []), ...(s.bullets || [])]),
  ].join('\n');

  if (words < 120) issues.push('under-120-words');
  if (grant.description && /^[a-z]/.test(grant.description.trim())) issues.push('lowercase-lead');
  if (/cointelegraph|decrypt\.co\/news/.test(grant.url || '')) issues.push('news-url');

  if (!TON.has(grant.id) && /\b(?:discord|telegram|whatsapp)\b/i.test(blob)) issues.push('chat-platform-mention');
  if (BANNED_URL.test(blob)) issues.push('chat-platform-url');

  const heads = new Set<string>();
  for (const s of grant.sections || []) {
    if (heads.has(s.heading)) issues.push(`duplicate-heading:${s.heading.slice(0, 40)}`);
    heads.add(s.heading);
    if (/faq/i.test(s.heading)) {
      const ps = s.paragraphs || [];
      if (ps.length >= 2 && !ps.some((p) => p.includes('?'))) issues.push('orphan-faq');
    }
    for (const p of [...(s.paragraphs || []), ...(s.bullets || [])]) {
      if (JUNK.test(p)) issues.push('junk-paragraph');
      if (/\*\*[^*]+\*\*/.test(p)) issues.push('markdown-bold');
      if ((p.match(/https?:\/\//g) || []).length >= 3) issues.push('nav-scrape-blob');
    }
  }

  if (!grant.sections?.length) issues.push('no-sections');

  const editorial = grantEditorialToEventArticle(generateGrantEditorial(grant));
  const html = renderToStaticMarkup(
    createElement(EventGuideContent, { editorial, officialUrl: grant.url, contentMarker: 'grant' }),
  );
  for (const f of descriptionFormattingIssues(html)) issues.push(`render:${f.kind}`);

  const unique = [...new Set(issues)];
  if (unique.length) rows.push({ id: grant.id, words, issues: unique });
}

const report = {
  total: grants.length,
  needsWork: rows.length,
  clean: grants.length - rows.length,
  rows: rows.sort((a, b) => a.words - b.words),
};
const out = '/Users/vedang/ZCodeProject/Web3-Jobs/.cache/grant-manual-audit.json';
import fs from 'node:fs';
fs.mkdirSync('/Users/vedang/ZCodeProject/Web3-Jobs/.cache', { recursive: true });
fs.writeFileSync(out, JSON.stringify(report, null, 2));

const byKind: Record<string, number> = {};
for (const r of rows) for (const i of r.issues) byKind[i] = (byKind[i] || 0) + 1;

console.log(JSON.stringify({ total: report.total, needsWork: report.needsWork, clean: report.clean, byKind }, null, 2));
console.log(`Wrote ${out}`);
console.log('Worst:', rows.slice(0, 15).map((r) => `${r.id} (${r.words}w): ${r.issues.join(', ')}`).join('\n'));