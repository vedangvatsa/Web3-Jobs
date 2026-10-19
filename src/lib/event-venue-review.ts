import type { Web3Event } from './events';

export type EventVenueReview = {
  expectedStartDate: string;
  checkedAt: string;
  expectedSourceEventId?: string;
  patch: Partial<Pick<Web3Event, 'venueName' | 'streetAddress' | 'addressLocality' | 'addressRegion' | 'postalCode' | 'addressCountry' | 'location' | 'city' | 'country' | 'venueAddresses' | 'venueAddressSource'>>;
};

const ADDRESS_KEYS = ['venueName', 'streetAddress', 'addressLocality', 'addressRegion', 'postalCode', 'addressCountry', 'location', 'city', 'country', 'venueAddresses', 'venueAddressSource'] as const;

function replaceAddress(event: Web3Event, patch: EventVenueReview['patch']): Web3Event {
  const next = { ...event };
  for (const key of ['venueName', 'streetAddress', 'addressLocality', 'addressRegion', 'postalCode', 'addressCountry', 'venueAddresses', 'venueAddressSource'] as const) delete next[key];
  if (patch.location !== event.location) delete next.coordinates;
  for (const key of ADDRESS_KEYS) if (patch[key] !== undefined) Object.assign(next, { [key]: patch[key] });
  return next;
}

export function applyEventVenueReview(event: Web3Event, review?: EventVenueReview, rawSource: Web3Event = event): Web3Event {
  if (!review || event.startDate.slice(0, 10) !== review.expectedStartDate.slice(0, 10)) return event;
  if (review.expectedSourceEventId && rawSource.sourceVerification?.eventId && review.expectedSourceEventId !== rawSource.sourceVerification.eventId) return event;
  const newerSource = Date.parse(rawSource.sourceVerification?.fetchedAt || '') > Date.parse(review.checkedAt);
  if (newerSource && (rawSource.locationHidden || ['private', 'unlisted'].includes(rawSource.visibility || ''))) {
    return { ...replaceAddress(event, { location: [event.city, event.country].filter(Boolean).join(', ') || 'Location shared with registered guests' }), locationHidden: true };
  }
  if (newerSource && rawSource.startDate.slice(0, 10) !== review.expectedStartDate.slice(0, 10)) return event;
  if (event.locationHidden || ['private', 'unlisted'].includes(event.visibility || '')) return event;
  if (newerSource && rawSource.location !== review.patch.location) return replaceAddress(event, rawSource);
  return replaceAddress(event, review.patch);
}
