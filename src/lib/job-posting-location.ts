import type { Job } from '../types';

const US_STATES: Record<string, string> = {
  alabama: 'AL', alaska: 'AK', arizona: 'AZ', arkansas: 'AR', california: 'CA',
  colorado: 'CO', connecticut: 'CT', delaware: 'DE', 'district of columbia': 'DC',
  florida: 'FL', georgia: 'GA', hawaii: 'HI', idaho: 'ID', illinois: 'IL',
  indiana: 'IN', iowa: 'IA', kansas: 'KS', kentucky: 'KY', louisiana: 'LA',
  maine: 'ME', maryland: 'MD', massachusetts: 'MA', michigan: 'MI', minnesota: 'MN',
  mississippi: 'MS', missouri: 'MO', montana: 'MT', nebraska: 'NE', nevada: 'NV',
  'new hampshire': 'NH', 'new jersey': 'NJ', 'new mexico': 'NM', 'new york': 'NY',
  'north carolina': 'NC', 'north dakota': 'ND', ohio: 'OH', oklahoma: 'OK',
  oregon: 'OR', pennsylvania: 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
  'south dakota': 'SD', tennessee: 'TN', texas: 'TX', utah: 'UT', vermont: 'VT',
  virginia: 'VA', washington: 'WA', 'west virginia': 'WV', wisconsin: 'WI', wyoming: 'WY',
};
const US_STATE_CODES = new Set(Object.values(US_STATES));

const COUNTRY_CODES: Record<string, string> = {
  'united states': 'US', 'united states of america': 'US', usa: 'US', us: 'US',
  'united kingdom': 'GB', uk: 'GB', britain: 'GB',
  'united arab emirates': 'AE', uae: 'AE',
  canada: 'CA', germany: 'DE', deutschland: 'DE', france: 'FR', spain: 'ES', españa: 'ES',
  italy: 'IT', italia: 'IT', netherlands: 'NL', holland: 'NL', switzerland: 'CH',
  austria: 'AT', belgium: 'BE', ireland: 'IE', portugal: 'PT', poland: 'PL',
  sweden: 'SE', norway: 'NO', denmark: 'DK', finland: 'FI', greece: 'GR',
  czechia: 'CZ', 'czech republic': 'CZ', hungary: 'HU', romania: 'RO', croatia: 'HR',
  serbia: 'RS', bulgaria: 'BG', ukraine: 'UA', cyprus: 'CY', malta: 'MT',
  estonia: 'EE', latvia: 'LV', lithuania: 'LT', georgia: 'GE', armenia: 'AM',
  turkey: 'TR', türkiye: 'TR', israel: 'IL', japan: 'JP', 'south korea': 'KR',
  china: 'CN', india: 'IN', singapore: 'SG', malaysia: 'MY', indonesia: 'ID',
  thailand: 'TH', vietnam: 'VN', philippines: 'PH', taiwan: 'TW', 'hong kong': 'HK',
  australia: 'AU', 'new zealand': 'NZ', brazil: 'BR', argentina: 'AR', mexico: 'MX',
  colombia: 'CO', chile: 'CL', nigeria: 'NG', kenya: 'KE', 'south africa': 'ZA',
  egypt: 'EG', guatemala: 'GT', panama: 'PA', 'costa rica': 'CR', uruguay: 'UY',
  bahrain: 'BH', jordan: 'JO',
  peru: 'PE', belize: 'BZ', eswatini: 'SZ', iceland: 'IS', luxembourg: 'LU',
  slovenia: 'SI', slovakia: 'SK', moldova: 'MD', kazakhstan: 'KZ', uzbekistan: 'UZ',
};
const ISO_COUNTRY_CODES = new Set(Object.values(COUNTRY_CODES));

// Disambiguate city/state pairs; a bare CA, IN, or DE is not evidence of a US job.
const US_CITY_STATES: Record<string, string> = {
  'san francisco': 'CA', 'palo alto': 'CA', 'menlo park': 'CA', 'los angeles': 'CA',
  'mountain view': 'CA', 'san jose': 'CA', 'san diego': 'CA', 'redwood city': 'CA',
  'bay area': 'CA', 'new york': 'NY', 'new york city': 'NY', brooklyn: 'NY',
  austin: 'TX', dallas: 'TX', houston: 'TX', chicago: 'IL', miami: 'FL',
  seattle: 'WA', washington: 'DC', boston: 'MA', denver: 'CO', atlanta: 'GA',
  indianapolis: 'IN', philadelphia: 'PA', portland: 'OR', bellevue: 'WA',
  charlotte: 'NC', nashville: 'TN', phoenix: 'AZ', detroit: 'MI', minneapolis: 'MN',
};

/** Global cities that map unambiguously to one ISO country (not US state codes). */
const KNOWN_INTERNATIONAL_CITIES: Record<string, ParsedJobAddress> = {
  london: { addressLocality: 'London', addressCountry: 'GB' },
  dublin: { addressLocality: 'Dublin', addressCountry: 'IE' },
  amsterdam: { addressLocality: 'Amsterdam', addressCountry: 'NL' },
  bengaluru: { addressLocality: 'Bengaluru', addressCountry: 'IN' },
  bangalore: { addressLocality: 'Bangalore', addressCountry: 'IN' },
  mumbai: { addressLocality: 'Mumbai', addressCountry: 'IN' },
  tokyo: { addressLocality: 'Tokyo', addressCountry: 'JP' },
  taipei: { addressLocality: 'Taipei', addressCountry: 'TW' },
  toronto: { addressLocality: 'Toronto', addressCountry: 'CA' },
  vancouver: { addressLocality: 'Vancouver', addressCountry: 'CA' },
  montreal: { addressLocality: 'Montréal', addressCountry: 'CA' },
  'mexico city': { addressLocality: 'Mexico City', addressCountry: 'MX' },
  barcelona: { addressLocality: 'Barcelona', addressCountry: 'ES' },
  madrid: { addressLocality: 'Madrid', addressCountry: 'ES' },
  berlin: { addressLocality: 'Berlin', addressCountry: 'DE' },
  munich: { addressLocality: 'Munich', addressCountry: 'DE' },
  frankfurt: { addressLocality: 'Frankfurt', addressCountry: 'DE' },
  paris: { addressLocality: 'Paris', addressCountry: 'FR' },
  zurich: { addressLocality: 'Zürich', addressCountry: 'CH' },
  geneva: { addressLocality: 'Geneva', addressCountry: 'CH' },
  sydney: { addressLocality: 'Sydney', addressCountry: 'AU' },
  melbourne: { addressLocality: 'Melbourne', addressCountry: 'AU' },
  lisbon: { addressLocality: 'Lisbon', addressCountry: 'PT' },
  warsaw: { addressLocality: 'Warsaw', addressCountry: 'PL' },
  prague: { addressLocality: 'Prague', addressCountry: 'CZ' },
  seoul: { addressLocality: 'Seoul', addressCountry: 'KR' },
  'abu dhabi': { addressLocality: 'Abu Dhabi', addressCountry: 'AE' },
};

/** Multi-country regions named explicitly on remote listings (not guessed from bare “Remote”). */
const REMOTE_REGION_COUNTRIES: Record<string, string[]> = {
  'north america': ['US', 'CA', 'MX'],
  americas: ['US', 'CA', 'MX'],
  latam: ['MX', 'BR', 'AR', 'CO', 'CL'],
  'latin america': ['MX', 'BR', 'AR', 'CO', 'CL'],
};

function normalizeOfficeLabel(text: string): string {
  return text.replace(/\s+office\s*$/i, '').trim();
}

function knownCityAddress(locality: string): ParsedJobAddress | undefined {
  const lower = locality.toLowerCase();
  const intl = KNOWN_INTERNATIONAL_CITIES[lower];
  if (intl) return { ...intl, addressLocality: locality };
  const usRegion = US_CITY_STATES[lower];
  if (usRegion) return { addressLocality: locality, addressRegion: usRegion, addressCountry: 'US' };
  return undefined;
}

/** Resolve remote eligibility countries when the listing names a country or multi-country region explicitly. */
export function countriesFromRemoteArea(area: string): string[] | null {
  const text = normalizeOfficeLabel(stripWorkplaceLabel(area.trim()));
  if (!text || /^(?:worldwide|global|anywhere)$/i.test(text)) return null;

  const directCountry = countryFromLocationToken(text);
  if (directCountry) return [directCountry];

  if (text.includes(',')) {
    const commaParts = text.split(',').map(part => part.trim()).filter(Boolean);
    const tail = commaParts[commaParts.length - 1]!;
    if (commaParts.length >= 2 && countryFromLocationToken(tail)) {
      return null;
    }
  }

  const slashParts = text.split(/\s*\/\s*/).map(part => part.trim()).filter(Boolean);
  if (slashParts.length > 1) {
    const codes = slashParts.map(part => countryFromLocationToken(part) || toAddressCountryCode(part));
    if (codes.every(Boolean)) return [...new Set(codes as string[])];
    return null;
  }

  const key = text.toLowerCase();
  if (REMOTE_REGION_COUNTRIES[key]) return REMOTE_REGION_COUNTRIES[key];
  if (/\bnorth america\b/i.test(key)) return REMOTE_REGION_COUNTRIES['north america'];
  if (
    /\b(?:united states|usa|u\.s\.)\b/i.test(key) &&
    !/\b(?:east|west|central|eastern|time zone|timezone|est|cst|pst)\b/i.test(key)
  ) return ['US'];
  if (/\blatam\b|\blatin america\b/i.test(key)) return REMOTE_REGION_COUNTRIES.latam;
  if (/\bamericas\b/i.test(key) && !/\bemea\b/i.test(key) && !/\beurope\b/i.test(key)) return REMOTE_REGION_COUNTRIES.americas;
  return null;
}

export interface ParsedJobAddress {
  addressLocality?: string;
  addressRegion?: string;
  addressCountry?: string;
}

export function toAddressCountryCode(value: string | undefined): string | undefined {
  if (!value?.trim()) return undefined;
  const token = value.trim().replace(/\./g, '');
  return COUNTRY_CODES[token.toLowerCase()] || (ISO_COUNTRY_CODES.has(token.toUpperCase()) ? token.toUpperCase() : undefined);
}

function countryFromLocationToken(value: string): string | undefined {
  const token = value.trim().replace(/\./g, '');
  if (US_STATE_CODES.has(token.toUpperCase())) return undefined;
  return toAddressCountryCode(token);
}

function stripWorkplaceLabel(value: string): string {
  return value.trim()
    .replace(/^(?:remote|hybrid|on[ -]?site)\s*\((.*)\)$/i, '$1')
    .replace(/^(?:remote|hybrid|on[ -]?site)(?:\s*[,·:–-]\s*|\s+)/i, '')
    .replace(/\s*\((?:remote|hybrid|on[ -]?site|HQ)\)\s*$/i, '')
    .replace(/\s*[-–/]\s*(?:remote|hybrid|on[ -]?site)\s*$/i, '')
    .replace(/\s+office\s*$/i, '').trim();
}

function locationParts(value: string): string[] {
  return stripWorkplaceLabel(value).split(/\s*(?:;|\/|\||\bor\b)\s*/i).filter(Boolean);
}

function remoteEligibilityLabel(raw: string): string {
  const trimmed = raw.trim();
  const wrapped = trimmed.match(/^remote\s*\((.*)\)\s*$/i);
  if (wrapped) return normalizeOfficeLabel(wrapped[1]!.trim());
  return normalizeOfficeLabel(stripWorkplaceLabel(trimmed));
}

/** Parse one location without borrowing a country from a different office. */
export function parseJobAddress(location: unknown): ParsedJobAddress {
  if (typeof location !== 'string' || !location.trim()) return {};
  const text = normalizeOfficeLabel(stripWorkplaceLabel(locationParts(location)[0] || ''));
  const parts = text.split(',').map(part => part.trim()).filter(Boolean);
  if (!parts.length || /^(?:remote|worldwide|global|anywhere|not specified|headquarters|hq|n\/a)$/i.test(text)) return {};

  if (parts.length === 1) {
    const known = knownCityAddress(text);
    if (known) return known;
    const country = countryFromLocationToken(text);
    if (/^(?:singapore|hong kong)$/i.test(text)) return { addressLocality: text, addressCountry: country };
    if (/^dubai$/i.test(text)) return { addressLocality: text, addressCountry: 'AE' };
    return country ? { addressCountry: country } : { addressLocality: text };
  }

  const locality = parts[0]!;
  const tail = parts[parts.length - 1]!;
  const region = US_STATES[tail.toLowerCase()] || tail.toUpperCase();
  if (parts.length === 2 && US_CITY_STATES[locality.toLowerCase()] === region) {
    return { addressLocality: locality, addressRegion: region, addressCountry: 'US' };
  }
  const country = parts.length >= 3 ? toAddressCountryCode(tail) : countryFromLocationToken(tail);
  if (country) {
    return {
      addressLocality: locality,
      ...(parts.length >= 3 && { addressRegion: country === 'US' ? US_STATES[parts[1]!.toLowerCase()] || parts[1] : parts.slice(1, -1).join(', ') }),
      addressCountry: country,
    };
  }
  if (parts.length === 2 && US_STATES[tail.toLowerCase()] && tail.toLowerCase() !== 'georgia') {
    return { addressLocality: locality, addressRegion: region, addressCountry: 'US' };
  }
  return { addressLocality: locality, addressRegion: parts.slice(1).join(', ') };
}

export function ensureAddressCountry(parsed: ParsedJobAddress, rawLocation: string): ParsedJobAddress {
  const country = toAddressCountryCode(parsed.addressCountry);
  return country ? { ...parsed, addressCountry: country } : parseJobAddress(rawLocation);
}

export type JobPostingLocationReason =
  | 'missing-location'
  | 'remote-status-unverified'
  | 'remote-country-missing'
  | 'remote-area-unresolved'
  | 'physical-country-missing';

interface JobPostingLocationFields {
  jobLocationType?: 'TELECOMMUTE';
  applicantLocationRequirements?: { '@type': 'Country'; name: string }[];
  jobLocation?: { '@type': 'Place'; address: ParsedJobAddress & { '@type': 'PostalAddress'; addressCountry: string } }[];
}

export interface JobPostingLocationResult {
  fields: JobPostingLocationFields | null;
  reason: JobPostingLocationReason | null;
}

/** Listing filters are broader than Google's fully remote eligibility rule. */
export function getJobPostingLocation(job: Pick<Job, 'location' | 'workplaceType' | 'isRemote' | 'title'>): JobPostingLocationResult {
  const raw = job.location?.trim() || '';
  if (!raw || /^not specified$/i.test(raw)) return { fields: null, reason: 'missing-location' };

  const mode = (job.workplaceType || '').toLowerCase().replace(/[\s_-]/g, '');
  const physical = mode === 'hybrid' || mode === 'onsite' || /\bhybrid\b|\bon[ -]?site\b/i.test(raw);
  const remoteMention = /\bremote\b/i.test(raw);
  if (!physical && mode === 'remote' && job.isRemote === false) return { fields: null, reason: 'remote-status-unverified' };
  const remoteTitle = !/\bremote\s+(?:sensing|desktop|control|access|procedure)\b/i.test(job.title) && /\bremote\b/i.test(job.title);
  const qualifiedRemote = /\b(?:not|no|occasional(?:ly)?|partial(?:ly)?|negotiable|optional)\b|\bremote[ -](?:first|friendly|possible)\b/i.test(raw);
  const remoteLabel = /^remote(?:\s|[-(:,·]|$)/i.test(raw) || /(?:[-–·]\s*remote|\(remote\))\s*$/i.test(raw);
  const remote = !physical && !qualifiedRemote && (mode === 'remote' || (job.isRemote !== false && remoteLabel));

  if (remote) {
    // Country-only restrictions can be represented without widening a city, state,
    // time-zone, or continent restriction to an entire country.
    const eligibility = remoteEligibilityLabel(raw);
    const areas = eligibility.includes(';')
      ? eligibility.split(/\s*;\s*/).map(part => part.trim()).filter(Boolean)
      : [eligibility];
    const countries = [...new Set(areas.flatMap(area => countriesFromRemoteArea(area) ?? []))];
    if (!countries.length) {
      const hasCountry = locationParts(raw).some(part => parseJobAddress(part).addressCountry);
      const namedConstraint = areas.some(area => {
        const label = stripWorkplaceLabel(area).trim();
        return label.length > 0 && !/^remote(?:\s+job)?$/i.test(label) && !/^(?:worldwide|global|anywhere)$/i.test(label);
      });
      return {
        fields: null,
        reason: hasCountry || namedConstraint ? 'remote-area-unresolved' : 'remote-country-missing',
      };
    }
    const names = new Intl.DisplayNames(['en'], { type: 'region' });
    return {
      reason: null,
      fields: {
        jobLocationType: 'TELECOMMUTE',
        applicantLocationRequirements: countries.map(code => ({ '@type': 'Country', name: names.of(code)! })),
      },
    };
  }

  if ((physical && remoteMention) || (!physical && (remoteMention || job.isRemote === true || mode === 'remote' || remoteTitle))) {
    return { fields: null, reason: 'remote-status-unverified' };
  }
  const addresses = locationParts(raw).map(parseJobAddress);
  if (!addresses.length || addresses.some(address => !address.addressCountry)) {
    return { fields: null, reason: 'physical-country-missing' };
  }
  return {
    reason: null,
    fields: {
      jobLocation: addresses.map(address => ({ '@type': 'Place', address: { '@type': 'PostalAddress', ...address, addressCountry: address.addressCountry! } })),
    },
  };
}
