import type { Web3Event, EventEditorialArticle } from './events';
import { EVENT_GUIDES } from './event-guides';
import { getEventEditorialGuide, getEventSlug } from './events';
import { isThinEventListingDescription, sanitizeEventEditorial } from './event-editorial-facts';
import { buildEditorialFromOrganizerDescription } from './luma-event-content';

// Server-only store for per-event guides.
// Precedence: EVENT_GUIDES -> generated JSON -> substantive organiser copy -> synthesized rich editorial guide.
let cachedGenerated: Record<string, EventEditorialArticle> | null = null;

import generatedEventGuidesJson from '../../content/generated-event-guides.json';

/** Generated guides keyed by a different event id (e.g. premier vs marketacross). */
const GENERATED_EVENT_GUIDE_ALIASES: Record<string, string> = {
  'premier-blockchain-life-2026': 'ma-blockchain-life',
  'premier-pragma-tokyo-2026': 'luma-host-evt-HVi8pTdZBEHTVLR',
};

function loadGenerated(): Record<string, EventEditorialArticle> {
  if (cachedGenerated !== null) return cachedGenerated;
  cachedGenerated = generatedEventGuidesJson as Record<string, EventEditorialArticle>;
  return cachedGenerated;
}

function getEditorialLength(editorial: EventEditorialArticle): number {
  const leadLen = (editorial.summaryLead || '').length;
  const sectionsLen = (editorial.sections || []).reduce(
    (acc, s) => acc + (s.heading || '').length + (s.content || []).join(' ').length,
    0,
  );
  return leadLen + sectionsLen;
}

export async function resolveEventGuide(event: Web3Event): Promise<EventEditorialArticle> {
  const slug = (event.slug || getEventSlug(event) || '').toLowerCase().trim();
  if (slug && EVENT_GUIDES[slug]) return sanitizeEventEditorial(EVENT_GUIDES[slug]);

  const generated = loadGenerated();
  const generatedKey = (event.id && generated[event.id])
    ? event.id
    : event.id && GENERATED_EVENT_GUIDE_ALIASES[event.id];
  if (generatedKey && generated[generatedKey]) {
    return sanitizeEventEditorial(generated[generatedKey]);
  }

  // If the organizer provided substantive copy, use the formatted organizer copy
  const rawDesc = (event.description || '').trim();
  if (rawDesc && !isThinEventListingDescription(rawDesc)) {
    const organizerEditorial = buildEditorialFromOrganizerDescription(event);
    const orgLen = getEditorialLength(organizerEditorial);
    // Standalone organizer copy if multi-section and substantive, or very thorough single section (>=1000 chars)
    if ((orgLen >= 750 && organizerEditorial.sections.length >= 2) || orgLen >= 1000) {
      return sanitizeEventEditorial(organizerEditorial);
    }
  }

  // Synthesize rich 4-section editorial guide (incorporates any brief organizer description)
  return sanitizeEventEditorial(getEventEditorialGuide(event));
}

