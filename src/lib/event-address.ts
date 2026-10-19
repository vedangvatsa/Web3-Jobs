import type { Web3Event } from './events';

const STREET_DESIGNATOR = /(?:\b(?:street|st\.?|road|rd\.?|avenue|ave\.?|boulevard|blvd\.?|lane|ln\.?|drive|dr\.?|way|place|pl\.?|square|sq\.?|terrace|highway|hwy\.?|parkway|pkwy\.?|court|ct\.?|close|crescent|mews|quay|wharf|esplanade|promenade|plaza|broadway|green|grn\.?|hill|center|centre|ctr\.?|marg|tower|city|ward|chome|rue|chemin|allee|allée|route|strasse|straße|platz|gasse|via|viale|piazza|calle|carrera|avenida|av\.?|rua|travessa|estrada|jalan|lorong|soi|ro|gil|daero|airport|point|block|complex)\b|[路街道巷])/i;
const HOUSE_NUMBER = /(?:^|[\s,])#?\d{1,5}[a-z]?(?:-\d{1,5}[a-z]?)?(?:\/\d{1,5})?(?=$|[\s,])/i;
const KOREAN_LOT_ADDRESS = /\b\d{1,4}(?:-\d{1,4})?\s+[\p{Script=Hangul}A-Za-z0-9-]+-dong\b/iu;
const LETTERED_BLOCK_ADDRESS = /\b[A-Z]\s+Block\s*,\s*[^,]{5,}\bComplex\b/i;

// Require a street locator, including lettered blocks used in Indian addresses.
// Venue names and locality-only values from feeds remain insufficient.
export function hasDetailedStreetAddress(value?: string | null): boolean {
  const address = value?.trim() ?? '';
  if (address.length < 7 || address.length > 250) return false;
  if (LETTERED_BLOCK_ADDRESS.test(address)) return true;
  if (!HOUSE_NUMBER.test(address)) return false;
  return STREET_DESIGNATOR.test(address) || KOREAN_LOT_ADDRESS.test(address);
}

export function getEventVenueLabel(event: Pick<Web3Event, 'locationHidden' | 'location' | 'venueName' | 'streetAddress' | 'addressLocality' | 'addressRegion' | 'postalCode' | 'addressCountry' | 'city' | 'country'>): string {
  if (event.locationHidden) return [event.city, event.country].filter(Boolean).join(', ') || 'Location shared with registered guests';
  const location = event.location?.trim() || '';
  const street = event.streetAddress?.trim();
  if (!street || location.toLowerCase().includes(street.toLowerCase())) return location;
  return [...new Set([event.venueName || location, street, event.addressLocality || event.city, event.addressRegion, event.postalCode, event.addressCountry || event.country].filter(Boolean))].join(', ');
}
