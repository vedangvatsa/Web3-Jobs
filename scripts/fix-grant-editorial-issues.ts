#!/usr/bin/env tsx
/**
 * Merge duplicate section headings and fix common editorial defects before human review.
 */
import fs from 'node:fs';
import path from 'node:path';
import grants from '../content/grants/grants.json';
import type { GrantProgram } from '../src/types';
import { countStoredGrantWords } from '../src/lib/grant-editorial';

const GRANTS_PATH = path.join(process.cwd(), 'content/grants/grants.json');
const apply = process.argv.includes('--apply');

const SCRAPE = /press enter or click to view|published time:|you signed in with another tab/i;

function capitalizeLead(text: string): string {
  const t = text.trim();
  if (!t || /^[A-Z(]/.test(t)) return t;
  return t.charAt(0).toUpperCase() + t.slice(1);
}

for (const grant of grants as GrantProgram[]) {
  grant.description = capitalizeLead(grant.description || '');

  const merged: GrantProgram['sections'] = [];
  for (const section of grant.sections || []) {
    const paragraphs = (section.paragraphs || []).filter((p) => !SCRAPE.test(p));
    const bullets = section.bullets || [];
    if (!paragraphs.length && !bullets.length) continue;

    const seen = merged.filter((m) => m.heading === section.heading).length;
    const heading = seen > 0 ? `${section.heading} (continued)` : section.heading;
    const prev = merged[merged.length - 1];
    if (prev && prev.heading === heading) {
      prev.paragraphs = [...(prev.paragraphs || []), ...paragraphs];
      prev.bullets = [...(prev.bullets || []), ...bullets];
    } else {
      merged.push({ ...section, heading, paragraphs, bullets: bullets.length ? bullets : undefined });
    }
  }
  grant.sections = merged;

  if (grant.descriptionSource) {
    grant.descriptionSource.wordCount = countStoredGrantWords(grant);
  }
}

console.log('Editorial merge pass complete.');
if (apply) {
  fs.writeFileSync(GRANTS_PATH, `${JSON.stringify(grants, null, 2)}\n`);
}