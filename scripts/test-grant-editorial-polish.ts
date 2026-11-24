#!/usr/bin/env tsx
import fs from 'node:fs';
import path from 'node:path';
import grants from '../content/grants/grants.json';
import type { GrantProgram } from '../src/types';
import { countStoredGrantWords, GRANT_DETAIL_MIN_WORDS } from '../src/lib/grant-editorial';
import { isGrammarJunkParagraph } from '../src/lib/grant-grammar';

const STATUS_PATH = path.join(process.cwd(), 'content/grants/copyedit-status.json');
const failures: string[] = [];

if (!fs.existsSync(STATUS_PATH)) {
  throw new Error('Missing copyedit-status.json — run apply-grant-full-editorial-polish.ts --apply');
}

const status = JSON.parse(fs.readFileSync(STATUS_PATH, 'utf-8')) as Record<string, { method: string }>;

for (const grant of grants as GrantProgram[]) {
  const words = countStoredGrantWords(grant);
  if (words < GRANT_DETAIL_MIN_WORDS) failures.push(`${grant.id}: ${words} words`);
  if (words < 150) failures.push(`${grant.id}: below 150 words (${words})`);
  if (!grant.description?.trim()) failures.push(`${grant.id}: empty description`);
  if (!status[grant.id] || status[grant.id].method !== 'human-editorial-polish-v2') {
    failures.push(`${grant.id}: missing editorial polish status`);
  }

  const heads = grant.sections?.map((s) => s.heading) || [];
  if (!heads.some((h) => /program overview/i.test(h))) {
    failures.push(`${grant.id}: no program overview section`);
  }
  if (!heads.some((h) => /how to apply/i.test(h))) {
    failures.push(`${grant.id}: no how to apply section`);
  }

  for (const s of grant.sections || []) {
    for (const line of [...(s.paragraphs || []), ...(s.bullets || []), grant.description]) {
      if (line && isGrammarJunkParagraph(line)) failures.push(`${grant.id}: junk line`);
    }
    if (s.heading.length > 120) failures.push(`${grant.id}: long heading`);
  }
}

if (failures.length) {
  throw new Error(
    `Editorial polish check failed (${failures.length}):\n${failures.slice(0, 40).join('\n')}${
      failures.length > 40 ? '\n...' : ''
    }`,
  );
}

console.log(`Editorial polish verified for all ${grants.length} grants.`);