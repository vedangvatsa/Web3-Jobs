import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import * as cheerio from 'cheerio';
import { EventGuideContent } from '../src/components/event-guide-content';
import { buildEventsListing } from '../src/lib/events-listing-build';
import { resolveEventGuide } from '../src/lib/event-guide-store';
import { publishedOrganizerDescriptionText } from '../src/lib/luma-event-content';
import { textJunkRunIssues } from './lib/description-format-checks';

async function main() {
  const events = await buildEventsListing();
  const anchorSlugs: string[] = [];
  const urlInTextSlugs: string[] = [];
  let junkSoft = 0;

  for (const event of events) {
    const slug = event.slug || event.id;
    const guide = await resolveEventGuide(event);
    const html = renderToStaticMarkup(
      createElement(EventGuideContent, { editorial: guide, contentMarker: 'event' }),
    );
    const $ = cheerio.load(html);
    if ($('[data-event-description] a[href^="http"]').length) {
      anchorSlugs.push(slug);
    }
    const body = publishedOrganizerDescriptionText(event);
    if (/https?:\/\//.test(body)) urlInTextSlugs.push(slug);
    if (textJunkRunIssues(body).some((i) => i.kind === 'junk-run')) junkSoft++;
  }

  console.log(
    JSON.stringify(
      {
        events: events.length,
        outboundAnchorsInBody: anchorSlugs.length,
        publishedTextWithBareUrl: urlInTextSlugs.length,
        junkRunSoftWarnings: junkSoft,
        anchorSamples: anchorSlugs.slice(0, 8),
        urlTextSamples: urlInTextSlugs.slice(0, 8),
      },
      null,
      2,
    ),
  );
  if (anchorSlugs.length) process.exitCode = 1;
}

void main();