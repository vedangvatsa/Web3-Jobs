import type { EventEditorialArticle } from '@/lib/events';
import { formatEventDate, formatEventLocation, type Web3Event } from '@/lib/events';

/** Quick-fact strings we should not show — they admit we lack the data. */
const NON_FACT_PATTERNS = [
  /see the official registration page/i,
  /confirm capacity on the official event page/i,
  /listed on the official programme when announced/i,
  /confirm on the official page/i,
  /check the official tickets page/i,
  /when listed\)/i,
  /check official site/i,
  /discounts via partners on the official site/i,
  /institutional pricing tiers;\s*check official site/i,
  /^tiered passes;\s*discounts via partners/i,
  /^confirm on the official/i,
];

const THIN_LISTING_DESCRIPTION_PATTERNS = [
  /web3 community event\b/i,
  /is listed in the official/i,
  /is listed as a .+ during/i,
];

/** Matches sync-luma-crypto-events.ts stub until enrich-luma-crypto-descriptions runs. */
const LUMA_SYNC_STUB = /^(.+\.\s*)?Web3 community event(\.| in .+\.)?$/i;

/** Auto-generated listing blurbs (sync stubs), not organiser copy on Luma. */
export function isThinEventListingDescription(description: string): boolean {
  const text = description.trim();
  if (!text) return true;
  if (LUMA_SYNC_STUB.test(text)) return true;
  if (THIN_LISTING_DESCRIPTION_PATTERNS.some((pattern) => pattern.test(text)) && text.length < 320) {
    return true;
  }
  return false;
}

export function isDisplayableEventFact(value?: string | null): boolean {
  const text = value?.trim();
  if (!text) return false;
  return !NON_FACT_PATTERNS.some((pattern) => pattern.test(text));
}

export function sanitizeEventEditorial(editorial: EventEditorialArticle): EventEditorialArticle {
  return {
    ...editorial,
    ticketPricing: isDisplayableEventFact(editorial.ticketPricing) ? editorial.ticketPricing : undefined,
    expectedAttendance: isDisplayableEventFact(editorial.expectedAttendance)
      ? editorial.expectedAttendance
      : undefined,
    speakers: isDisplayableEventFact(editorial.speakers) ? editorial.speakers : undefined,
  };
}

export function buildEventMetaDescription(event: Web3Event, hasEditorialGuide: boolean): string {
  const formattedDate = formatEventDate(event.startDate, event.endDate);
  const place = formatEventLocation(event);
  // Never render "in Virtual / TBA": virtual events happen online.
  const where = place === 'Virtual / TBA' ? 'online' : `in ${place}`;

  if (hasEditorialGuide) {
    return `${event.name} on ${formattedDate} ${where}. Dates, venue, and practical notes for attendees.`;
  }

  return `${event.name} on ${formattedDate} ${where}. Date, venue, and registration details.`;
}
