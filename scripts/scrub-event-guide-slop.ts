/**
 * One-shot noslop scrub for content/events/editorial/generated-event-guides.json
 * Usage: npx tsx scripts/scrub-event-guide-slop.ts
 */
import fs from 'node:fs';
import { cleanPublishText } from '../src/lib/noslop';

const PATH = 'content/events/editorial/generated-event-guides.json';

const AI_REPLACEMENTS: Array<[RegExp, string]> = [
  [/\bIt'?s not just\b[^.?!]*[.?!]\s*/gi, ''],
  [/\bThis isn'?t just\b[^.?!]*[.?!]\s*/gi, ''],
  [/\bThe timing is no accident\.?\s*/gi, ''],
  [/\bArguably the most consequential[^.?!]*[.?!]\s*/gi, ''],
  [/\bFew conference towns repay the jet lag this generously\.?\s*/gi, ''],
  [/\bthe most efficient single day of market intelligence on the calendar\.?\s*/gi, 'a useful day for market updates.'],
  [/\bmarking a pivotal moment\b/gi, ''],
  [/\bushering in a new era\b/gi, ''],
  [/\bseamlessly\b/gi, ''],
  [/\bcutting[- ]edge\b/gi, ''],
  [/\bgame[- ]changer\b/gi, ''],
  [/\brevolutionary\b/gi, ''],
  [/\bunlock the (?:power|potential) of\b/gi, 'use'],
  [/\belevate your\b/gi, 'improve your'],
  [/\bdelve into\b/gi, 'cover'],
  [/\bat its core,?\s*/gi, ''],
  [/\bHere'?s the thing:?\s*/gi, ''],
  [/\bLet'?s dive in\.?\s*/gi, ''],
  [/\bWhat really matters is\b/gi, ''],
  [/\breal exchange, not broadcast\b/gi, 'in-person discussion'],
  [/\bpeople actually building protocols, writing contracts, and shipping products\b/gi, 'builders and operators'],
  [/\bThis is not an introduction to blockchain\.?\s*/gi, ''],
  [/\bpart of a growing calendar of focused\b/gi, 'a'],
];

function scrub(text: string): string {
  let s = cleanPublishText(text, { stripFiller: true });
  for (const [re, rep] of AI_REPLACEMENTS) s = s.replace(re, rep);
  s = s.replace(/\s{2,}/g, ' ').replace(/\s+([,.;:])/g, '$1').trim();
  s = s.replace(/^[,.;:\s]+/, '').replace(/\s+\./g, '.');
  return s;
}

function walk(value: unknown): unknown {
  if (typeof value === 'string') return scrub(value);
  if (Array.isArray(value)) return value.map(walk);
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) out[k] = walk(v);
    return out;
  }
  return value;
}

const before = fs.readFileSync(PATH, 'utf8');
const cleaned = walk(JSON.parse(before));
const after = `${JSON.stringify(cleaned, null, 2)}\n`;
fs.writeFileSync(PATH, after);
console.log('em dashes remaining', (after.match(/—/g) || []).length);
console.log('bytes', before.length, '->', after.length);
