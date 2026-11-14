/**
 * Hard-fail safety audit for the committed event catalog.
 *
 * Layer 2 of the messaging-community guarantee behind the Google Safe
 * Browsing flag on this site (2026-11-12). Layer 1 (`canImportEvent`) blocks
 * bad records at import time; this audit assumes a writer regressed anyway
 * and fails the refresh workflow loudly BEFORE anything is committed or
 * published. Wire order in refresh-jobs-cache.yml: after catalogs are
 * precomputed, before the commit step.
 *
 * Fails when:
 *   1. any committed source record carries a third-party
 *      Telegram/WhatsApp/Discord community URL in any field;
 *   2. any runtime event (built in-process) carries one;
 *   3. any published description (card text or rendered page body) carries a
 *      junk-formatting signature (DOM leaks, unformatted blocks, junk runs).
 */
import fs from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import * as cheerio from 'cheerio';
import { findEventMessagingCommunityLink } from './lib/event-messaging-policy.mjs';
import { descriptionFormattingIssues, textJunkRunIssues } from './lib/description-format-checks';
import { buildEventsListing } from '../src/lib/events-listing-build';
import { getVerifiedEventDescription } from '../src/lib/event-description-source';
import {
  buildEditorialFromOrganizerDescription,
  publishedOrganizerDescriptionText,
} from '../src/lib/luma-event-content';
import { EventGuideContent } from '../src/components/event-guide-content';

const root = process.cwd();
const messaging: Array<{ scope: string; id: string; detail: string }> = [];
const junk: Array<{ id: string; issues: string[] }> = [];

async function audit(): Promise<void> {
// ── 1. Committed source records: no messaging-community links anywhere. ──
const sourcesDir = path.join(root, 'content/events/sources');
const sourceFiles = fs.readdirSync(sourcesDir).filter(file => file.endsWith('.json')).sort();
for (const file of sourceFiles) {
  let parsed: unknown;
  try {
    parsed = JSON.parse(fs.readFileSync(path.join(sourcesDir, file), 'utf8'));
  } catch (error) {
    messaging.push({ scope: 'sources', id: file, detail: `unparseable JSON: ${(error as Error).message}` });
    continue;
  }
  const hit = findEventMessagingCommunityLink(parsed, file);
  if (hit) messaging.push({ scope: 'sources', id: file, detail: `${hit.path} → ${hit.url}` });
}

// ── 2. Runtime: the built listing must be clean end to end. ──
const runtime = await buildEventsListing();
for (const event of runtime) {
  const hit = findEventMessagingCommunityLink(event, 'runtime');
  if (hit) messaging.push({ scope: 'runtime', id: event.id, detail: `${hit.path} → ${hit.url}` });
}

// ── 3. Published descriptions: no junk-formatting signatures. ──
const SOFT_JUNK_KIND = 'junk-run';
const warnings: Array<{ id: string; issues: string[] }> = [];
for (const event of runtime) {
  const issues: string[] = [];

  const textIssues = (text: string, surface: string) => textJunkRunIssues(text)
    .filter(issue => issue.kind !== SOFT_JUNK_KIND)
    .map(issue => `${surface}:${issue.kind}`);
  const softIssues = (text: string) => textJunkRunIssues(text)
    .filter(issue => issue.kind === SOFT_JUNK_KIND);

  const cardText = getVerifiedEventDescription(event);
  if (cardText) issues.push(...textIssues(cardText, 'card-text'));

  const bodyText = publishedOrganizerDescriptionText(event);
  if (bodyText) {
    issues.push(...textIssues(bodyText, 'body-text'));

    const editorial = buildEditorialFromOrganizerDescription(event);
    const html = renderToStaticMarkup(createElement(EventGuideContent, { editorial }));
    for (const issue of descriptionFormattingIssues(html)) issues.push(`body-html:${issue.kind}`);
  }

  if (issues.length) junk.push({ id: event.id, issues: [...new Set(issues)] });
  else if (bodyText) {
    const soft = softIssues(bodyText);
    if (soft.length) warnings.push({ id: event.id, issues: [SOFT_JUNK_KIND] });
  }
}

if (messaging.length || junk.length) {
  console.error(`Event catalog safety audit FAILED: ${messaging.length} messaging finding(s), ${junk.length} junky description(s).`);
  for (const finding of messaging) console.error(`  [messaging] ${finding.scope} ${finding.id}: ${finding.detail}`);
  for (const finding of junk) console.error(`  [junk] ${finding.id}: ${finding.issues.join(', ')}`);
  if (warnings.length) console.error(`  (also ${warnings.length} soft junk-run warning(s) — operator review, not blocking)`);
  process.exit(1);
}
for (const warning of warnings.slice(0, 10)) console.log(`  [warning] ${warning.id}: ${warning.issues.join(', ')}`);
console.log(`Event catalog safety audit passed: ${sourceFiles.length} source files, ${runtime.length} runtime events — no messaging-community links, no junk formatting signatures.${warnings.length ? ` ${warnings.length} soft junk-run warning(s) logged for review.` : ''}`);
}

void audit().catch((error) => {
  console.error(error);
  process.exit(1);
});
