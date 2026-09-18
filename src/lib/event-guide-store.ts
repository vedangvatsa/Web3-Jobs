import type { Web3Event, EventEditorialArticle } from './events';
import { EVENT_GUIDES } from './event-guides';
import { getEventEditorialGuide, getEventSlug } from './events';
import { sanitizeEventEditorial } from './event-editorial-facts';
import {
  buildEditorialFromOrganizerDescription,
  isLumaListedEvent,
} from './luma-event-content';

// Server-only store for per-event guides.
// Luma listings: organiser description only. Else: EVENT_GUIDES -> generated JSON -> getEventEditorialGuide.
let cachedGenerated: Record<string, EventEditorialArticle> | null = null;

import generatedEventGuidesJson from '../../content/generated-event-guides.json';

/** Generated guides keyed by a different event id (e.g. premier vs marketacross). */
const GENERATED_EVENT_GUIDE_ALIASES: Record<string, string> = {
  'premier-blockchain-life-2026': 'ma-blockchain-life',
};

function loadGenerated(): Record<string, EventEditorialArticle> {
  if (cachedGenerated !== null) return cachedGenerated;
  cachedGenerated = generatedEventGuidesJson as Record<string, EventEditorialArticle>;
  return cachedGenerated;
}

export async function resolveEventGuide(event: Web3Event): Promise<EventEditorialArticle> {
  const slug = (event.slug || getEventSlug(event) || '').toLowerCase().trim();
  if (slug && EVENT_GUIDES[slug]) return sanitizeEventEditorial(EVENT_GUIDES[slug]);

  if (isLumaListedEvent(event)) {
    return sanitizeEventEditorial(buildEditorialFromOrganizerDescription(event));
  }

  const generated = loadGenerated();
  const generatedKey = (event.id && generated[event.id])
    ? event.id
    : event.id && GENERATED_EVENT_GUIDE_ALIASES[event.id];
  if (generatedKey && generated[generatedKey]) {
    return sanitizeEventEditorial(generated[generatedKey]);
  }

  return sanitizeEventEditorial(getEventEditorialGuide(event));
}
