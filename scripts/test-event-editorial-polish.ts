#!/usr/bin/env tsx
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import type { Web3Event } from '../src/lib/events';
import { getVerifiedEventDescription } from '../src/lib/event-description-source';
import { publishedOrganizerDescriptionText } from '../src/lib/luma-event-content';
import { isGrammarJunkParagraph } from '../src/lib/grant-grammar';
import { grammarIssuesInLine } from '../src/lib/grant-grammar';
import { stripThirdPartyCommunityPromo } from '../src/lib/community-link-sanitizer';

const STATUS_PATH = path.join(process.cwd(), 'content/events/copyedit-status.json');
const RUNTIME_PATH = path.join(process.cwd(), 'content/events-runtime.json');

const failures: string[] = [];

if (!fs.existsSync(STATUS_PATH)) {
  throw new Error('Missing content/events/copyedit-status.json — run apply-event-full-editorial-polish.ts --apply');
}

const status = JSON.parse(fs.readFileSync(STATUS_PATH, 'utf-8')) as Record<string, { method: string }>;
const events = JSON.parse(fs.readFileSync(RUNTIME_PATH, 'utf8')) as Web3Event[];

for (const event of events) {
  const desc = getVerifiedEventDescription(event);
  if (!desc) continue;

  if (!status[event.id]) {
    failures.push(`${event.id}: missing copyedit status`);
    continue;
  }
  if (!status[event.id].method.startsWith('human-editorial-polish')) {
    failures.push(`${event.id}: unexpected polish method`);
  }

  const rendered = publishedOrganizerDescriptionText(event);
  if (stripThirdPartyCommunityPromo(desc) !== desc && rendered !== desc) {
    failures.push(`${event.id}: community promo in stored copy`);
  }

  for (const line of desc.split(/\n/)) {
    if (line && isGrammarJunkParagraph(line)) failures.push(`${event.id}: junk line`);
    const issues = grammarIssuesInLine(line);
    if (issues.length) failures.push(`${event.id}: ${issues.join(',')}`);
  }

  if (/\bclick here to\b/i.test(desc)) failures.push(`${event.id}: click-here phrasing`);
}

if (failures.length) {
  throw new Error(
    `Event editorial polish failed (${failures.length}):\n${failures.slice(0, 40).join('\n')}${
      failures.length > 40 ? '\n...' : ''
    }`,
  );
}

console.log(`Event editorial polish verified for ${events.length} runtime events (${Object.keys(status).length} status records).`);