#!/usr/bin/env tsx
/**
 * Per-grant editorial checklist (279 programs). Fails if any grant violates manual review rules.
 */
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import fs from 'node:fs';
import path from 'node:path';
import grants from '../content/grants/grants.json';
import type { GrantProgram } from '../src/types';
import { EventGuideContent } from '../src/components/event-guide-content';
import {
  generateGrantEditorial,
  grantEditorialToEventArticle,
  countStoredGrantWords,
  GRANT_DETAIL_MIN_WORDS,
} from '../src/lib/grant-editorial';
import { descriptionFormattingIssues } from './lib/description-format-checks';

const TON_PRODUCT = new Set(['ton-grants', 'ton-champions']);
const BANNED_CHAT_URL =
  /(?:https?:\/\/)?(?:www\.)?(?:discord\.(?:gg|com)|t\.me\/|telegram\.(?:me|dog)|chat\.whatsapp\.com|wa\.me\/|api\.whatsapp\.com)/i;
const SCRAPE_JUNK =
  /press enter or click to view|join medium for free|stories in your inbox|published time:|you signed in with another tab/i;
const NEWS_URL = /cointelegraph|decrypt\.co\/news|coindesk\.com\/news/i;

type Row = { id: string; ok: boolean; issues: string[]; words: number };

function checkGrant(grant: GrantProgram): Row {
  const issues: string[] = [];
  const words = countStoredGrantWords(grant);
  const textParts: string[] = [grant.description || ''];
  for (const s of grant.sections || []) {
    textParts.push(s.heading, ...(s.paragraphs || []), ...(s.bullets || []));
  }
  const blob = textParts.join('\n');

  if (words < GRANT_DETAIL_MIN_WORDS) issues.push(`under-${GRANT_DETAIL_MIN_WORDS}-words`);
  if (!grant.sections?.length) issues.push('no-sections');
  if (grant.description && /^[a-z]/.test(grant.description.trim())) issues.push('lowercase-lead');
  if (NEWS_URL.test(grant.url || '')) issues.push('news-source-url');
  if (SCRAPE_JUNK.test(blob)) issues.push('scrape-artifact');
  if (!TON_PRODUCT.has(grant.id)) {
    if (BANNED_CHAT_URL.test(blob)) issues.push('banned-chat-url');
    if (/\b(?:join our discord|discord\.gg|t\.me\/|telegram channel|whatsapp group)\b/i.test(blob)) {
      issues.push('chat-cta');
    }
  }

  const headings = new Set<string>();
  for (const section of grant.sections || []) {
    if (headings.has(section.heading)) issues.push(`duplicate-heading:${section.heading}`);
    headings.add(section.heading);
    const hasBody = (section.paragraphs?.length || 0) + (section.bullets?.length || 0) > 0;
    if (!hasBody) issues.push(`empty-section:${section.heading}`);
    if (/faq/i.test(section.heading)) {
      const ps = section.paragraphs || [];
      if (ps.length >= 2 && !ps.some((p) => p.includes('?'))) issues.push('orphan-faq');
    }
    for (const p of [...(section.paragraphs || []), ...(section.bullets || [])]) {
      if (/^\/\/[^\s]/.test(p.trim())) issues.push('comment-line-leak');
    }
  }

  const editorial = grantEditorialToEventArticle(generateGrantEditorial(grant));
  const html = renderToStaticMarkup(
    createElement(EventGuideContent, { editorial, officialUrl: grant.url, contentMarker: 'grant' }),
  );
  for (const f of descriptionFormattingIssues(html)) issues.push(`render:${f.kind}`);

  const unique = [...new Set(issues)];
  return { id: grant.id, ok: unique.length === 0, issues: unique, words };
}

const rows = (grants as GrantProgram[]).map(checkGrant);
const failed = rows.filter((r) => !r.ok);

const cacheDir = path.join(process.cwd(), '.cache');
fs.mkdirSync(cacheDir, { recursive: true });
fs.writeFileSync(
  path.join(cacheDir, 'grant-manual-review.json'),
  JSON.stringify(
    {
      checkedAt: new Date().toISOString(),
      total: rows.length,
      passed: rows.length - failed.length,
      failed: failed.length,
      rows,
    },
    null,
    2,
  ),
);

if (failed.length > 0) {
  const sample = failed
    .slice(0, 25)
    .map((r) => `  ${r.id}: ${r.issues.join(', ')}`)
    .join('\n');
  throw new Error(
    `Manual grant review failed for ${failed.length}/${rows.length} programs:\n${sample}${
      failed.length > 25 ? '\n  ...' : ''
    }`,
  );
}

console.log(`Manual grant review passed for all ${rows.length} grant programs.`);