#!/usr/bin/env tsx
import grants from '../content/grants/grants.json';
import type { GrantProgram } from '../src/types';

const BANNED_URL =
  /(?:https?:\/\/)?(?:www\.)?(?:discord\.(?:gg|com)|t\.me\/|telegram\.(?:me|dog)|chat\.whatsapp\.com|wa\.me\/|api\.whatsapp\.com)/i;
const BANNED_CTA =
  /\b(?:join|reach\s+(?:out\s+)?(?:on|via|through)|contact\s+us\s+on|ping)\b[^.]{0,100}\b(?:telegram|discord|whatsapp)\b/i;

/** TON programs may describe Telegram the product; other grants must not mention chat apps. */
const TON_PRODUCT_GRANTS = new Set(['ton-grants', 'ton-champions']);

const failures: string[] = [];

for (const grant of grants as GrantProgram[]) {
  const parts = [
    grant.description,
    ...(grant.sections || []).flatMap((s) => [...(s.paragraphs || []), ...(s.bullets || [])]),
  ].filter(Boolean) as string[];

  for (const text of parts) {
    if (BANNED_URL.test(text) || BANNED_CTA.test(text)) {
      failures.push(`${grant.id}: ${text.slice(0, 100)}`);
      break;
    }
    if (!TON_PRODUCT_GRANTS.has(grant.id) && /\b(?:discord|telegram|whatsapp)\b/i.test(text)) {
      failures.push(`${grant.id}: ${text.slice(0, 100)}`);
      break;
    }
  }
}

if (failures.length) {
  throw new Error(`Grant copy contains banned chat platform references:\n${failures.slice(0, 25).join('\n')}`);
}

console.log(`No banned chat links or mentions in ${grants.length} grant records (TON product copy exempt).`);