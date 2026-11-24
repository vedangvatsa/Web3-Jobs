import type { EventVenueAddress, Web3Event } from './events';

const STREET_DESIGNATOR = /(?:\b(?:street|st\.?|road|rd\.?|avenue|ave\.?|boulevard|blvd\.?|lane|ln\.?|drive|dr\.?|way|place|pl\.?|square|sq\.?|terrace|highway|hwy\.?|parkway|pkwy\.?|court|ct\.?|close|crescent|mews|quay|wharf|esplanade|promenade|plaza|broadway|green|grn\.?|hill|center|centre|ctr\.?|marg|tower|city|ward|chome|rue|chemin|allee|allée|route|strasse|straße|platz|gasse|via|viale|piazza|calle|carrera|avenida|av\.?|rua|travessa|estrada|jalan|lorong|soi|gil|daero|airport|point|block|complex|carrer|cl\.?|yard|thanon|strand|causeway|sk\.?|sokak|bulvar|garden)\b|\b[\p{L}\p{N}]+(?:\s+[\p{L}\p{N}]+){0,5}\s+(?:gil|ro)\b|[路街道巷]|(?:^|[\s,])(?:đường|duong)(?:$|[\s,])|\bR\.\s+[\p{L}])/iu;
const HOUSE_NUMBER = /(?:^|[\s,(])(?:#|no\.?\s*:?\s*)?\d{1,5}[a-z]?(?:-\d{1,5}[a-z]?)?(?:\/\d{1,5}[a-z]?)?(?=$|[\s,)\-–/])/i;
const POSTAL_CODE = /\b(?:\d{5,6}|\d{5}-\d{3}|[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}|\d{4}\s*[A-Z]{2}|\d{3}\s\d{2})\b/i;
const SWISS_CAMPUS_POSTAL = /(?:^|[\s,])\d{4}(?=\s+[\p{L}])/u;
const TRAILING_STREET_NUMBER = /,\s*(?:no\.?\s*)?\d{1,5}(?:\/[A-Za-z0-9]+)?(?:\s*[-–]\s*[\p{L}].*)?$/iu;
const NAMED_THOROUGHFARE = /[\p{L}0-9][\p{L}0-9\s.'-]{2,48}\s(?:street|st\.?|boulevard|blvd\.?|road|rd\.?|avenue|ave\.?|drive|dr\.?|lane|ln\.?|way|place|pl\.?)\b/iu;
const FLOOR_VENUE_ADDRESS = /\b\d{1,2}(?:st|nd|rd|th)\s+floor\b/i;
const KOREAN_LOT_ADDRESS = /\b\d{1,4}(?:-\d{1,4})?\s+[\p{Script=Hangul}A-Za-z0-9-]+-dong\b/iu;
const LETTERED_BLOCK_ADDRESS = /\b[A-Z]\s+Block\s*,\s*[^,]{5,}\bComplex\b/i;
const COMPOUND_STREET_NAME = /\b[\p{L}]+(?:straße|strasse|gasse|platz|straat|laan|kade|plein|gata|schans)\b/iu;
const ADDITIONAL_STREET_DESIGNATOR = /\b(?:quai|speedway|causeway|alameda|jl\.?|carrera|carretera)\b/i;

// Require a street locator, including lettered blocks used in Indian addresses.
// Venue names and locality-only values from feeds remain insufficient.
export function hasDetailedStreetAddress(value?: string | null): boolean {
  const address = value?.trim() ?? '';
  if (address.length < 7 || address.length > 250) return false;
  if (LETTERED_BLOCK_ADDRESS.test(address)) return true;
  const hasHouse = HOUSE_NUMBER.test(address);
  const hasPostal = POSTAL_CODE.test(address) || SWISS_CAMPUS_POSTAL.test(address);
  if (hasHouse && hasPostal) return true;
  if (TRAILING_STREET_NUMBER.test(address)) return true;
  if (
  FLOOR_VENUE_ADDRESS.test(address)
    && (STREET_DESIGNATOR.test(address) || /\btower\b/i.test(address))
    && address.length >= 30
  ) return true;
  if (NAMED_THOROUGHFARE.test(address) && address.length >= 25 && /[,–-]/.test(address)) return true;
  if (!hasHouse && !hasPostal) return false;
  return STREET_DESIGNATOR.test(address) || KOREAN_LOT_ADDRESS.test(address) || COMPOUND_STREET_NAME.test(address) || ADDITIONAL_STREET_DESIGNATOR.test(address);
}

type AddressCandidate = Pick<Web3Event, 'venueName' | 'streetAddress' | 'addressLocality' | 'addressCountry' | 'location' | 'venueAddressSource'>;

export function hasVerifiedVenueAddress(event: AddressCandidate): boolean {
  const source = event.venueAddressSource;
  if (!source || !Number.isFinite(Date.parse(source.checkedAt)) || !Array.isArray(source.urls) || !source.urls.length) return false;
  if (!source.urls.every(value => { try { return /^https?:$/.test(new URL(value).protocol); } catch { return false; } })) return false;
  for (const key of ['venueName', 'streetAddress', 'addressLocality', 'addressCountry', 'location'] as const) {
    if ((source[key] || '') !== (event[key] || '')) return false;
  }
  const street = event.streetAddress?.trim().toLowerCase();
  if (!street || street.length < 5 || !event.venueName?.trim() || !event.addressLocality?.trim() || !event.addressCountry?.trim()) return false;
  if (/\b(?:tba|tbd|to be announced|register to see|location shared|unknown)\b/i.test(street)) return false;
  return ![event.venueName, event.addressLocality, event.addressCountry].some(value => value?.trim().toLowerCase() === street);
}

export function formatVenueAddress(venue: EventVenueAddress): string {
  return [venue.streetAddress, venue.addressLocality, venue.addressRegion, venue.postalCode, venue.addressCountry].filter(Boolean).join(', ');
}

export function hasDetailedVenueAddress(venue: EventVenueAddress): boolean {
  return hasDetailedStreetAddress(venue.streetAddress) || hasVerifiedVenueAddress({
    venueName: venue.name, streetAddress: venue.streetAddress, addressLocality: venue.addressLocality,
    addressCountry: venue.addressCountry, location: formatVenueAddress(venue), venueAddressSource: venue.verification,
  });
}

export function getEventVenueLabel(event: Pick<Web3Event, 'locationHidden' | 'location' | 'venueName' | 'streetAddress' | 'addressLocality' | 'addressRegion' | 'postalCode' | 'addressCountry' | 'city' | 'country' | 'venueAddresses'>): string {
  if (event.locationHidden) return [event.city, event.country].filter(Boolean).join(', ') || 'Location shared with registered guests';
  if ((event.venueAddresses?.length || 0) > 1) return 'Multiple venues';
  const location = event.location?.trim() || '';
  const street = event.streetAddress?.trim();
  if (!street || location.toLowerCase().includes(street.toLowerCase())) return location;
  return [...new Set([event.venueName || location, street, event.addressLocality || event.city, event.addressRegion, event.postalCode, event.addressCountry || event.country].filter(Boolean))].join(', ');
}

export type EventDisplayLocation = {
  primary: string;
  detail?: string;
};

export function getEventDisplayLocation(
  event: Pick<Web3Event, 'locationHidden' | 'location' | 'venueName' | 'streetAddress' | 'addressLocality' | 'addressRegion' | 'postalCode' | 'addressCountry' | 'city' | 'country' | 'venueAddresses' | 'attendanceMode' | 'venueAddressSource'>
): EventDisplayLocation {
  if (event.locationHidden) {
    return {
      primary: [event.city, event.country].filter(Boolean).join(', ') || 'Location shared with registered guests',
    };
  }
  if ((event.venueAddresses?.length || 0) > 1) {
    return { primary: 'Multiple venues' };
  }

  const cityCountry = [event.city, event.country].filter(Boolean).join(', ');
  const venue = (event.venueName || '').trim();
  const primary = venue && cityCountry && !venue.toLowerCase().includes(cityCountry.toLowerCase())
    ? `${venue} · ${cityCountry}`
    : (venue || cityCountry || event.location || 'Location TBA');

  let detail: string | undefined = undefined;
  if (event.streetAddress && (hasDetailedStreetAddress(event.streetAddress) || hasVerifiedVenueAddress(event))) {
    const parts = [event.streetAddress, event.postalCode].filter(Boolean);
    const candidate = parts.join(', ');
    if (candidate && !primary.toLowerCase().includes(candidate.toLowerCase())) {
      detail = candidate;
    }
  }

  return { primary, detail };
}

