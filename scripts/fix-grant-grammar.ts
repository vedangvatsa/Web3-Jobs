#!/usr/bin/env tsx
/**
 * Apply grammar / typography fixes across all grants in grants.json.
 * Usage: npx tsx scripts/fix-grant-grammar.ts [--apply]
 */
import fs from 'node:fs';
import path from 'node:path';
import grants from '../content/grants/grants.json';
import type { GrantProgram } from '../src/types';
import { countStoredGrantWords } from '../src/lib/grant-editorial';
import { grammarIssuesInLine, isGrammarJunkParagraph, normalizeGrantGrammarLine } from './lib/grant-grammar';

const GRANTS_PATH = path.join(process.cwd(), 'content/grants/grants.json');
const apply = process.argv.includes('--apply');

let linesTouched = 0;
let junkRemoved = 0;

function cleanText(text: string): string | null {
  if (isGrammarJunkParagraph(text)) {
    junkRemoved++;
    return null;
  }
  const next = normalizeGrantGrammarLine(text);
  if (next !== text) linesTouched++;
  return next;
}

for (const grant of grants as GrantProgram[]) {
  if (grant.description) {
    const d = cleanText(grant.description);
    if (d === null) grant.description = '';
    else grant.description = d;
  }

  const sections = grant.sections || [];
  for (const section of sections) {
    if (section.heading) {
      const h = cleanText(section.heading);
      if (h) section.heading = h;
    }
    section.paragraphs = (section.paragraphs || [])
      .map((p) => cleanText(p))
      .filter((p): p is string => Boolean(p));
    if (section.bullets) {
      section.bullets = section.bullets
        .map((b) => cleanText(b))
        .filter((b): b is string => Boolean(b));
    }
  }

  grant.sections = sections.filter((s) => s.paragraphs?.length || s.bullets?.length);

  if (grant.descriptionSource) {
    grant.descriptionSource.wordCount = countStoredGrantWords(grant);
    grant.descriptionSource.fetchedAt = new Date().toISOString();
  }
}

console.log(`Grammar pass: ${linesTouched} lines normalized, ${junkRemoved} junk paragraphs removed.`);

if (apply) {
  fs.writeFileSync(GRANTS_PATH, `${JSON.stringify(grants, null, 2)}\n`);
  console.log(`Wrote ${GRANTS_PATH}`);
}