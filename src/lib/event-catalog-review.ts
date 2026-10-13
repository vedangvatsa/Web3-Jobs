import descriptions from '../../content/events/catalog-reviewed-descriptions.json';
import facts from '../../content/events/catalog-reviewed-facts.json';
import type { Web3Event } from './events';

const reviewedDescriptions = descriptions as Record<string, Partial<Web3Event>>;
const reviewedFacts = facts as Record<string, Partial<Web3Event>>;

export function applyEventCatalogReview(event: Web3Event): Web3Event {
  const reviewed = { ...event, ...reviewedFacts[event.id], ...reviewedDescriptions[event.id] };
  if (reviewed.locationHidden) {
    for (const key of ['venueName', 'streetAddress', 'addressLocality', 'addressRegion', 'addressCountry', 'postalCode', 'neighborhood', 'coordinates'] as const) delete reviewed[key];
    reviewed.location = [reviewed.city, reviewed.country].filter(Boolean).join(', ') || 'Location shared with registered guests';
  }
  return reviewed;
}
