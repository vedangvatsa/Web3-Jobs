#!/usr/bin/env tsx
/**
 * Remove Telegram / WhatsApp / Discord URLs and join CTAs from grant catalog text only.
 * Usage: npx tsx scripts/strip-grant-community-links.ts [--apply]
 */
import fs from 'node:fs';
import path from 'node:path';
import type { GrantProgram } from '../src/types';
import {
  stripThirdPartyCommunityPromo,
  stripThirdPartyCommunityUrls,
} from '../src/lib/community-link-sanitizer';

const GRANTS_PATH = path.join(process.cwd(), 'content/grants/grants.json');
const apply = process.argv.includes('--apply');

const BANNED_URL =
  /(?:discord\.(?:gg|com)|t\.me\/|telegram\.(?:me|dog)|chat\.whatsapp\.com|wa\.me\/|api\.whatsapp\.com)/i;

function clean(text: string): string {
  if (!text) return text;
  return stripThirdPartyCommunityPromo(stripThirdPartyCommunityUrls(text))
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function hasBanned(text: string): boolean {
  return BANNED_URL.test(text) || /\bjoin\b[^.]{0,60}\b(?:discord|telegram|whatsapp)\b/i.test(text);
}

let touched = 0;
const grants: GrantProgram[] = JSON.parse(fs.readFileSync(GRANTS_PATH, 'utf-8'));

for (const grant of grants) {
  let changed = false;
  const desc = clean(grant.description || '');
  if (desc !== grant.description) {
    grant.description = desc;
    changed = true;
  }
  for (const section of grant.sections || []) {
    section.paragraphs = (section.paragraphs || []).map((p) => {
      const next = clean(p);
      if (next !== p) changed = true;
      return next;
    }).filter((p) => p.length > 0);
    if (section.bullets) {
      section.bullets = section.bullets.map((b) => {
        const next = clean(b);
        if (next !== b) changed = true;
        return next;
      }).filter((b) => b.length > 0);
    }
  }
  if (changed) touched++;
}

const offenders: string[] = [];
for (const grant of grants) {
  const blob = [grant.description, ...(grant.sections || []).flatMap((s) => [...(s.paragraphs || []), ...(s.bullets || [])])].join('\n');
  if (hasBanned(blob)) offenders.push(grant.id);
}

console.log(`Cleaned ${touched} grants. Remaining offenders: ${offenders.length}`);
if (offenders.length) console.log(offenders.join(', '));

if (apply) {
  fs.writeFileSync(GRANTS_PATH, `${JSON.stringify(grants, null, 2)}\n`);
  console.log(`Wrote ${GRANTS_PATH}`);
} else {
  console.log('Dry run — pass --apply to write');
}