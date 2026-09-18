import type { Web3Event } from '@/lib/events';
import { EVENT_GUIDES } from '@/lib/event-guides';
import { isThinEventListingDescription } from '@/lib/event-editorial-facts';
import { isLumaListedEvent } from '@/lib/luma-event-content';
import generatedEventGuidesJson from '../../content/generated-event-guides.json';

const GENERATED_EVENT_GUIDE_ALIASES: Record<string, string> = {
  'premier-blockchain-life-2026': 'ma-blockchain-life',
};

const generatedGuideIds = new Set(Object.keys(generatedEventGuidesJson as Record<string, unknown>));

function hasGeneratedEventGuide(eventId: string): boolean {
  return generatedGuideIds.has(eventId);
}

export function hasCuratedEventGuide(event: Web3Event): boolean {
  if (isLumaListedEvent(event)) {
    const description = event.description?.trim() || '';
    return Boolean(description && !isThinEventListingDescription(description));
  }

  const slug = (event.slug || '').toLowerCase().trim();
  if (slug && EVENT_GUIDES[slug]) return true;
  const aliasedId = event.id ? GENERATED_EVENT_GUIDE_ALIASES[event.id] : undefined;
  if (aliasedId && hasGeneratedEventGuide(aliasedId)) return true;
  return Boolean(event.id && hasGeneratedEventGuide(event.id));
}

