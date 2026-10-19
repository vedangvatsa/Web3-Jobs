import descriptions from '../../content/events/catalog-reviewed-descriptions.json';
import facts from '../../content/events/catalog-reviewed-facts.json';
import type { Web3Event } from './events';
import addresses from '../../content/events/venue-address-reviews.json';
import { applyEventVenueReview, type EventVenueReview } from './event-venue-review';

const reviewedDescriptions = descriptions as Record<string, Partial<Web3Event>>;
const reviewedFacts = facts as Record<string, Partial<Web3Event>>;

export function applyEventCatalogReview(event: Web3Event): Web3Event {
  const reviewed = applyEventVenueReview({ ...event, ...reviewedFacts[event.id], ...reviewedDescriptions[event.id] }, (addresses as Record<string, EventVenueReview>)[event.id], event);
  if (reviewed.locationHidden) {
    for (const key of ['venueName', 'streetAddress', 'addressLocality', 'addressRegion', 'addressCountry', 'postalCode', 'neighborhood', 'coordinates', 'venueAddresses', 'venueAddressSource'] as const) delete reviewed[key];
    reviewed.location = [reviewed.city, reviewed.country].filter(Boolean).join(', ') || 'Location shared with registered guests';
  }
  return reviewed;
}
