#!/usr/bin/env tsx
import grants from '../content/grants/grants.json';
import type { GrantProgram } from '../src/types';
import { countStoredGrantWords, generateGrantEditorial, countGrantEditorialWords } from '../src/lib/grant-editorial';

const thin: Array<{ id: string; stored: number; rendered: number; method?: string }> = [];
const liveListing: string[] = [];

for (const g of grants as GrantProgram[]) {
  const editorial = generateGrantEditorial(g);
  const rendered = countGrantEditorialWords(editorial.summaryLead, editorial.sections);
  const stored = countStoredGrantWords(g);
  if (stored < 120) thin.push({ id: g.id, stored, rendered, method: g.descriptionSource?.method });
  if (g.descriptionSource?.method === 'listing-description-live-url') liveListing.push(g.id);
}

thin.sort((a, b) => a.stored - b.stored);
console.log(JSON.stringify({ total: grants.length, thinUnder120Stored: thin.length, liveListingOnly: liveListing }, null, 2));
console.log('thinnest', thin.slice(0, 30));