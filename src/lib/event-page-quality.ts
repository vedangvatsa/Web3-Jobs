import type { Web3Event } from '@/lib/events';
import { EVENT_GUIDES } from '@/lib/event-guides';
import fs from 'fs';
import path from 'path';

/** Auto-synced Luma /crypto listings use this sentence when the organiser left the body empty. */
export const LUMA_CRYPTO_BOILERPLATE_RE = /Web3 community event(\.| in)\b/i;

export function isLumaCryptoBoilerplateDescription(description: string): boolean {
  const text = description.trim();
  if (!text) return true;
  return LUMA_CRYPTO_BOILERPLATE_RE.test(text) && text.length < 240;
}

function hasGeneratedEventGuide(eventId: string): boolean {
  try {
    const guidePath = path.join(process.cwd(), 'content', 'generated-event-guides.json');
    const parsed = JSON.parse(fs.readFileSync(guidePath, 'utf8')) as Record<string, unknown>;
    return Boolean(parsed[eventId]);
  } catch {
    return false;
  }
}

export function hasCuratedEventGuide(event: Web3Event): boolean {
  const slug = (event.slug || '').toLowerCase().trim();
  if (slug && EVENT_GUIDES[slug]) return true;
  return Boolean(event.id && hasGeneratedEventGuide(event.id));
}

/**
 * Directory pages for scraped Luma /crypto rows with no organiser copy should stay
 * discoverable on /events but out of Google (thin, duplicate of Luma).
 */
export function hasIndexableEventPage(event: Web3Event): boolean {
  if (hasCuratedEventGuide(event)) return true;
  if (event.source === 'curated-premier') return true;

  const description = (event.description || '').trim();
  if (event.source === 'luma-crypto') {
    return !isLumaCryptoBoilerplateDescription(description);
  }

  if (description.length < 100) return false;
  return !isLumaCryptoBoilerplateDescription(description);
}
