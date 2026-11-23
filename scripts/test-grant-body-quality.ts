#!/usr/bin/env tsx
import grants from '../content/grants/grants.json';
import type { GrantProgram } from '../src/types';
import { countStoredGrantWords, GRANT_DETAIL_MIN_WORDS } from '../src/lib/grant-editorial';

const failures: string[] = [];

for (const grant of grants as GrantProgram[]) {
  const words = countStoredGrantWords(grant);
  if (words < GRANT_DETAIL_MIN_WORDS) {
    failures.push(`${grant.id}: ${words} stored words`);
  }
}

if (failures.length > 0) {
  throw new Error(
    `Grant detail pages below ${GRANT_DETAIL_MIN_WORDS} words:\n${failures.slice(0, 20).join('\n')}${
      failures.length > 20 ? `\n...and ${failures.length - 20} more` : ''
    }`,
  );
}

console.log(`All ${grants.length} grant detail pages meet the ${GRANT_DETAIL_MIN_WORDS}-word body minimum.`);