import type { EventParty as SourceEventParty, Web3Event } from './events';
import { getEventExternalUrl } from './event-external-url';
import { hasDetailedStreetAddress } from './event-address';

type SchemaParty = {
  '@type': 'Organization' | 'Person' | 'PerformingGroup';
  name: string;
  url?: string;
};

type PostalAddress = {
  '@type': 'PostalAddress';
  name?: string;
  streetAddress?: string;
  addressLocality?: string;
  addressRegion?: string;
  postalCode?: string;
  addressCountry?: string;
};

export type GoogleEventSchema = {
  '@context': 'https://schema.org';
  '@type': 'Event';
  name: string;
  startDate: string;
  endDate?: string;
  description?: string;
  eventStatus?: 'https://schema.org/EventScheduled';
  eventAttendanceMode:
    | 'https://schema.org/OfflineEventAttendanceMode'
    | 'https://schema.org/OnlineEventAttendanceMode';
  location:
    | {
        '@type': 'Place';
        name: string;
        address: PostalAddress;
      }
    | {
        '@type': 'VirtualLocation';
        url: string;
      };
  url: string;
  sameAs?: string;
  image?: string[];
  offers?: {
    '@type': 'Offer';
    url: string;
    price: number;
    priceCurrency?: string;
    availability: 'https://schema.org/InStock';
  };
  organizer?: SchemaParty;
  performer?: SchemaParty;
};

export type EventSchemaContext = {
  pageUrl: string;
  imageUrl?: string;
};

const VIRTUAL_ONLY = /\b(?:online|virtual|remote|webinar|livestream|live[- ]stream|zoom|google meet|discord|(?:twitter|x) spaces?)\b/i;
const UNKNOWN_LOCATION = /\b(?:tba|tbd|to be (?:announced|determined)|unknown|coming soon)\b/i;
const PRIVATE_EVENT = /\b(?:invite[- ]only|invitation[- ]only|members?[- ]only|approval[- ]based|application[- ]only|closed event|private\b(?!\s+(?:credit|equity|key|sale|network|chain)))\b/i;
const ISO_CURRENCIES = new Set([
  'AED', 'AFN', 'ALL', 'AMD', 'ANG', 'AOA', 'ARS', 'AUD', 'AWG', 'AZN', 'BAM', 'BBD', 'BDT',
  'BGN', 'BHD', 'BIF', 'BMD', 'BND', 'BOB', 'BOV', 'BRL', 'BSD', 'BTN', 'BWP', 'BYN', 'BZD',
  'CAD', 'CDF', 'CHE', 'CHF', 'CHW', 'CLF', 'CLP', 'CNY', 'COP', 'COU', 'CRC', 'CUC', 'CUP',
  'CVE', 'CZK', 'DJF', 'DKK', 'DOP', 'DZD', 'EGP', 'ERN', 'ETB', 'EUR', 'FJD', 'FKP', 'GBP',
  'GEL', 'GHS', 'GIP', 'GMD', 'GNF', 'GTQ', 'GYD', 'HKD', 'HNL', 'HTG', 'HUF', 'IDR', 'ILS',
  'INR', 'IQD', 'IRR', 'ISK', 'JMD', 'JOD', 'JPY', 'KES', 'KGS', 'KHR', 'KMF', 'KPW', 'KRW',
  'KWD', 'KYD', 'KZT', 'LAK', 'LBP', 'LKR', 'LRD', 'LSL', 'LYD', 'MAD', 'MDL', 'MGA', 'MKD',
  'MMK', 'MNT', 'MOP', 'MRU', 'MUR', 'MVR', 'MWK', 'MXN', 'MXV', 'MYR', 'MZN', 'NAD', 'NGN',
  'NIO', 'NOK', 'NPR', 'NZD', 'OMR', 'PAB', 'PEN', 'PGK', 'PHP', 'PKR', 'PLN', 'PYG', 'QAR',
  'RON', 'RSD', 'RUB', 'RWF', 'SAR', 'SBD', 'SCR', 'SDG', 'SEK', 'SGD', 'SHP', 'SLE', 'SLL',
  'SOS', 'SRD', 'SSP', 'STN', 'SVC', 'SYP', 'SZL', 'THB', 'TJS', 'TMT', 'TND', 'TOP', 'TRY',
  'TTD', 'TWD', 'TZS', 'UAH', 'UGX', 'USD', 'USN', 'UYI', 'UYU', 'UYW', 'UZS', 'VED', 'VES',
  'VND', 'VUV', 'WST', 'XAF', 'XCD', 'XDR', 'XOF', 'XPF', 'XSU', 'XUA', 'YER', 'ZAR', 'ZMW', 'ZWL',
]);
const CURRENCY_SYMBOLS: Record<string, string> = {
  '€': 'EUR',
  '£': 'GBP',
  '₹': 'INR',
  '₩': 'KRW',
};

function text(value?: string | null): string {
  return value?.trim() ?? '';
}

function isHttpUrl(value?: string | null): value is string {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function isValidIsoDate(value?: string | null): value is string {
  if (!value) return false;
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})?)?$/.exec(value);
  if (!match || !Number.isFinite(Date.parse(value))) return false;

  const [year, month, day] = match.slice(1, 4).map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function hasDetailedSourceLocation(event: Web3Event): boolean {
  const streetAddress = text(event.streetAddress);
  if (streetAddress) return hasDetailedStreetAddress(streetAddress);

  return hasDetailedStreetAddress(text(event.location));
}

function sourceAddress(event: Web3Event): PostalAddress {
  const streetAddress = text(event.streetAddress);
  if (!streetAddress) {
    // Google accepts a verified full address in PostalAddress.name. Preserve the
    // source string rather than attempting to split international address formats.
    return { '@type': 'PostalAddress', name: text(event.location) };
  }

  return {
    '@type': 'PostalAddress',
    streetAddress,
    ...(text(event.addressLocality) ? { addressLocality: text(event.addressLocality) } : {}),
    ...(text(event.addressRegion) ? { addressRegion: text(event.addressRegion) } : {}),
    ...(text(event.postalCode) ? { postalCode: text(event.postalCode) } : {}),
    ...(text(event.addressCountry) ? { addressCountry: text(event.addressCountry) } : {}),
  };
}

function parseSourcePrice(value?: string): { price: number; priceCurrency?: string } | null {
  const price = text(value);
  if (!price) return null;
  if (/^free$/i.test(price)) return { price: 0 };

  const numeric = '(\\d{1,3}(?:,\\d{3})*(?:\\.\\d{1,2})?|\\d+(?:\\.\\d{1,2})?)';
  const codeFirst = new RegExp(`^([A-Z]{3})\\s*${numeric}$`, 'i');
  const codeLast = new RegExp(`^${numeric}\\s*([A-Z]{3})$`, 'i');
  const symbolFirst = new RegExp(`^([€£₹₩])\\s*${numeric}$`);
  const usDollarFirst = new RegExp(`^(US\\$)\\s*${numeric}$`, 'i');
  const codeFirstMatch = codeFirst.exec(price);
  const codeLastMatch = codeLast.exec(price);
  const symbolMatch = symbolFirst.exec(price) || usDollarFirst.exec(price);
  const currencyToken = codeFirstMatch?.[1] || codeLastMatch?.[2] || symbolMatch?.[1];
  const amountToken = codeFirstMatch?.[2] || codeLastMatch?.[1] || symbolMatch?.[2];
  if (!currencyToken || !amountToken) return null;

  const normalizedCurrencyToken = currencyToken.toUpperCase();
  const priceCurrency = CURRENCY_SYMBOLS[normalizedCurrencyToken] || (normalizedCurrencyToken === 'US$' ? 'USD' : normalizedCurrencyToken);
  if (!ISO_CURRENCIES.has(priceCurrency)) return null;

  const amount = Number(amountToken.replace(/,/g, ''));
  return Number.isFinite(amount) && amount >= 0 ? { price: amount, priceCurrency } : null;
}

function sourceParty(party?: SourceEventParty): SchemaParty | undefined {
  if (!party || !text(party.name) || !['Organization', 'Person', 'PerformingGroup'].includes(party.type)) return undefined;
  const url = party.url
    ? getEventExternalUrl({ registrationUrl: party.url, website: undefined, url: '' })
    : undefined;
  return {
    '@type': party.type,
    name: text(party.name),
    ...(url ? { url } : {}),
  };
}

/** Online when the venue fields (not the prose) say so. */
export function isOnlineEventVenue(event: Pick<Web3Event, 'location' | 'city' | 'country'>): boolean {
  return VIRTUAL_ONLY.test(`${text(event.location)} ${text(event.city)}`);
}

export function isGoogleEventSchemaEligible(event: Web3Event): boolean {
  const name = text(event.name);
  const location = text(event.location);
  if (!name || !isValidIsoDate(event.startDate)) return false;
  if (event.endDate && (!isValidIsoDate(event.endDate) || Date.parse(event.endDate) < Date.parse(event.startDate))) return false;
  const allEventText = `${name} ${location} ${text(event.description)}`;
  if (PRIVATE_EVENT.test(allEventText)) return false;
  // Online events are fully eligible via VirtualLocation. Physical events
  // need any real place — city-level is enough; Google does not require a
  // street address for a Valid rating.
  if (isOnlineEventVenue(event)) return true;
  if (!location || UNKNOWN_LOCATION.test(`${location} ${text(event.city)}`)) return false;
  return true;
}

export function buildGoogleEventSchema(event: Web3Event, context: EventSchemaContext): GoogleEventSchema | null {
  if (!isGoogleEventSchemaEligible(event) || !isHttpUrl(context.pageUrl)) return null;

  const externalUrl = getEventExternalUrl(event);
  const parsedPrice = parseSourcePrice(event.price);
  const venueName = text(event.venueName) || text(event.location);
  const organizer = sourceParty(event.organizer);
  const performer = sourceParty(event.performer);
  const online = isOnlineEventVenue(event);
  const city = text(event.city);
  const country = text(event.country);

  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: text(event.name),
    startDate: event.startDate,
    ...(event.endDate ? { endDate: event.endDate } : {}),
    ...(text(event.description) ? { description: text(event.description) } : {}),
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: online
      ? 'https://schema.org/OnlineEventAttendanceMode'
      : 'https://schema.org/OfflineEventAttendanceMode',
    location: online
      ? {
          '@type': 'VirtualLocation',
          url: context.pageUrl,
        }
      : {
          '@type': 'Place',
          name: venueName,
          address: {
            ...sourceAddress(event),
            ...(city ? { addressLocality: city } : {}),
            ...(country ? { addressCountry: country } : {}),
          },
        },
    url: context.pageUrl,
    ...(externalUrl && externalUrl !== context.pageUrl ? { sameAs: externalUrl } : {}),
    ...(isHttpUrl(context.imageUrl) ? { image: [context.imageUrl] } : {}),
    ...(parsedPrice && externalUrl ? {
      offers: {
        '@type': 'Offer',
        url: externalUrl,
        price: parsedPrice.price,
        ...(parsedPrice.priceCurrency ? { priceCurrency: parsedPrice.priceCurrency } : {}),
        availability: 'https://schema.org/InStock',
      },
    } : {}),
    ...(organizer ? { organizer } : {}),
    ...(performer ? { performer } : {}),
  };
}
