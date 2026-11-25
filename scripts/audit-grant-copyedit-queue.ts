#!/usr/bin/env tsx
import fs from 'node:fs';
import path from 'node:path';
import grants from '../content/grants/grants.json';
import type { GrantProgram } from '../src/types';
import { countStoredGrantWords } from '../src/lib/grant-editorial';

const STATUS_PATH = path.join(process.cwd(), 'content/grants/copyedit-status.json');

type Status = Record<string, { reviewedAt: string; note?: string }>;

function loadStatus(): Status {
  try {
    return JSON.parse(fs.readFileSync(STATUS_PATH, 'utf-8')) as Status;
  } catch {
    return {};
  }
}

function scrapeScore(grant: GrantProgram): number {
  let score = 0;
  const blob = JSON.stringify(grant.sections || []);
  const desc = grant.description?.trim() || '';

  if (desc && /^[a-z]/.test(desc)) score += 3;
  if (/\?\s*\n\n/.test(blob)) score -= 0; // fixed FAQs ok
  if (/descriptionSource/.test(JSON.stringify(grant)) && grant.descriptionSource?.method === 'paragraphs') score += 2;
  if (grant.descriptionSource?.method === 'listing-summary-unverified-fetch') score += 5;
  if (grant.descriptionSource?.method === 'jsonld') score += 3;

  for (const s of grant.sections || []) {
    if (s.heading.length > 100) score += 2;
    if (/Introducing |TL;DR|Learn more|Get .* stories/i.test(s.heading)) score += 3;
    if (s.paragraphs?.length === 1 && s.paragraphs[0] === desc) score += 4;
    if ((s.paragraphs || []).some((p) => p.length > 1200)) score += 2;
    if ((s.bullets || []).length > 12) score += 1;
  }

  const manualRepaired = [
    'pooltogether-grants',
    'stacks-foundation',
    'eth-audit-subsidy',
    'anth-stu',
    'zetachain-grants',
  ];
  if (manualRepaired.includes(grant.id)) score = Math.max(0, score - 4);

  const words = countStoredGrantWords(grant);
  if (words > 800) score += 2; // often unedited scrape walls

  return score;
}

const status = loadStatus();
const queue = (grants as GrantProgram[])
  .map((g) => ({
    id: g.id,
    score: scrapeScore(g),
    words: countStoredGrantWords(g),
    reviewed: Boolean(status[g.id]),
  }))
  .filter((g) => !g.reviewed)
  .sort((a, b) => b.score - a.score || b.words - a.words);

const out = path.join(process.cwd(), '.cache/grant-copyedit-queue.json');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify({ total: grants.length, reviewed: Object.keys(status).length, queue }, null, 2));

console.log(
  JSON.stringify(
    {
      total: grants.length,
      reviewed: Object.keys(status).length,
      remaining: queue.length,
      top20: queue.slice(0, 20).map((q) => `${q.id} (score ${q.score}, ${q.words}w)`),
    },
    null,
    2,
  ),
);
console.log(`Queue: ${out}`);