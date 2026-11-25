#!/usr/bin/env tsx
/**
 * Scan committed catalog + publish-time sanitized text for third-party
 * Telegram / WhatsApp / Discord invite URLs (Hashtag Web3 own handles allowed).
 */
import fs from 'node:fs';
import { findMessagingCommunityUrls } from './lib/event-messaging-policy.mjs';
import { buildEventsListing } from '../src/lib/events-listing-build';
import { getVerifiedEventDescription } from '../src/lib/event-description-source';
import { publishedOrganizerDescriptionText } from '../src/lib/luma-event-content';
import {
  stripThirdPartyCommunityPromo,
  stripThirdPartyCommunityUrls,
} from '../src/lib/community-link-sanitizer';
import { generateGrantEditorial } from '../src/lib/grant-editorial';
import type { GrantProgram } from '../src/types';
import grants from '../content/grants/grants.json';
import jobs from '../content/jobs-runtime.json';

const OWN_HANDLE =
  /t\.me\/(?:hashtagweb3|web3hiring|web3newsfeed|web3jobs_rep)\b/i;

function sanitized(text: string | undefined): string {
  if (!text) return '';
  return stripThirdPartyCommunityPromo(stripThirdPartyCommunityUrls(String(text)));
}

function thirdPartyUrlHits(text: string): string[] {
  const after = sanitized(text);
  const policy = findMessagingCommunityUrls(after).map((h) => h.url);
  const INVITE =
    /(?:https?:\/\/)?(?:www\.)?(?:t\.me\/|telegram\.(?:me|dog)\/|chat\.whatsapp\.com\/|wa\.me\/|api\.whatsapp\.com\/|discord\.gg\/|discord(?:app)?\.com\/invite\/)[^\s<")\]]+/gi;
  const regex = [...new Set((after.match(INVITE) || []).filter((u) => !OWN_HANDLE.test(u)))];
  return [...new Set([...policy, ...regex])];
}

type Finding = { surface: string; id: string; urls: string[] };

async function main(): Promise<void> {
  const findings: Finding[] = [];

  const events = await buildEventsListing();
  for (const event of events) {
    for (const [surface, raw] of [
      ['event-card', getVerifiedEventDescription(event)],
      ['event-body', publishedOrganizerDescriptionText(event)],
    ] as const) {
      const urls = thirdPartyUrlHits(raw);
      if (urls.length) findings.push({ surface, id: event.slug || event.id, urls });
    }
  }

  for (const grant of grants as GrantProgram[]) {
    const editorial = generateGrantEditorial(grant);
    const storedBlob = [
      grant.description || '',
      ...(grant.sections || []).flatMap((s) => [
        s.heading,
        ...(s.paragraphs || []),
        ...(s.bullets || []),
      ]),
    ].join('\n');
    for (const [surface, raw] of [
      ['grant-stored-sanitized', storedBlob],
      ['grant-page', editorial.sections.map((s) => [s.heading, ...(s.paragraphs || [])].join('\n')).join('\n')],
    ] as const) {
      const urls = thirdPartyUrlHits(raw);
      if (urls.length) findings.push({ surface, id: grant.id, urls });
    }
  }

  for (const job of jobs as Array<{ id: string; slug?: string; description?: string }>) {
    const urls = thirdPartyUrlHits(job.description);
    if (urls.length) findings.push({ surface: 'job-description', id: job.slug || job.id, urls });
  }

  if (findings.length) {
    console.error(
      `Published community-link audit FAILED: ${findings.length} surface(s) still expose third-party invite URLs after sanitization.`,
    );
    for (const row of findings.slice(0, 25)) {
      console.error(`  [${row.surface}] ${row.id}: ${row.urls.join(', ')}`);
    }
    if (findings.length > 25) console.error(`  …and ${findings.length - 25} more`);
    process.exit(1);
  }

  console.log(
    JSON.stringify(
      {
        liveEventPages: events.length,
        grantPages: (grants as GrantProgram[]).length,
        jobPages: (jobs as unknown[]).length,
        thirdPartyChatUrlsOnPublishedText: 0,
      },
      null,
      2,
    ),
  );
}

void main().catch((error) => {
  console.error(error);
  process.exit(1);
});