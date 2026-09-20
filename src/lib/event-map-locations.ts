import { COUNTRY_NAMES, normalizeCountry, type PublicWeb3Event } from '@/lib/events';

export type EventMapGroup = {
  key: string;
  label: string;
  events: PublicWeb3Event[];
  coordinates: [number, number];
};

/** Country names (and common aliases) → ISO code for map grouping. */
export const EVENT_MAP_COUNTRY_CODES: Record<string, string> = {
  'united arab emirates': 'AE',
  uae: 'AE',
  bolivia: 'BO',
  brazil: 'BR',
  bulgaria: 'BG',
  canada: 'CA',
  'dominican republic': 'DO',
  finland: 'FI',
  france: 'FR',
  germany: 'DE',
  ghana: 'GH',
  'hong kong': 'HK',
  india: 'IN',
  italy: 'IT',
  japan: 'JP',
  malawi: 'MW',
  portugal: 'PT',
  rwanda: 'RW',
  singapore: 'SG',
  'south africa': 'ZA',
  'south korea': 'KR',
  'republic of korea': 'KR',
  spain: 'ES',
  switzerland: 'CH',
  thailand: 'TH',
  turkey: 'TR',
  türkiye: 'TR',
  turkiye: 'TR',
  'united kingdom': 'GB',
  uk: 'GB',
  'great britain': 'GB',
  britain: 'GB',
  england: 'GB',
  'united states': 'US',
  'united states of america': 'US',
  usa: 'US',
  'u.s.': 'US',
  'u.s.a.': 'US',
  america: 'US',
  mexico: 'MX',
  ethiopia: 'ET',
  honduras: 'HN',
  malaysia: 'MY',
  nigeria: 'NG',
  colombia: 'CO',
  netherlands: 'NL',
  'the netherlands': 'NL',
  holland: 'NL',
  australia: 'AU',
  austria: 'AT',
  nepal: 'NP',
  cyprus: 'CY',
  azerbaijan: 'AZ',
  madagascar: 'MG',
  chile: 'CL',
  china: 'CN',
  greece: 'GR',
  norway: 'NO',
  slovenia: 'SI',
  taiwan: 'TW',
  kenya: 'KE',
  poland: 'PL',
  romania: 'RO',
  serbia: 'RS',
  czechia: 'CZ',
  'czech republic': 'CZ',
};

/** Normalized `city|CC` → [lat, lng]. */
export const EVENT_MAP_CITY_COORDINATES: Record<string, [number, number]> = {
  'abu dhabi|AE': [24.45, 54.38],
  'dubai|AE': [25.2, 55.27],
  'cochabamba|BO': [-17.39, -66.16],
  'sao paulo|BR': [-23.55, -46.63],
  'sofia|BG': [42.7, 23.32],
  'toronto|CA': [43.65, -79.38],
  'punta cana|DO': [18.56, -68.37],
  'helsinki|FI': [60.17, 24.94],
  'biarritz|FR': [43.48, -1.56],
  'cannes|FR': [43.55, 7.02],
  'nanterre|FR': [48.89, 2.21],
  'paris|FR': [48.86, 2.35],
  'berlin|DE': [52.52, 13.41],
  'dortmund|DE': [51.51, 7.47],
  'accra|GH': [5.56, -0.19],
  'hong kong|HK': [22.32, 114.17],
  'ahmedabad|IN': [23.02, 72.57],
  'bengaluru|IN': [12.97, 77.59],
  'chennai|IN': [13.08, 80.27],
  'bhopal|IN': [23.26, 77.41],
  'chandigarh|IN': [30.73, 76.78],
  'delhi|IN': [28.61, 77.21],
  'goa|IN': [15.49, 73.83],
  'hyderabad|IN': [17.39, 78.49],
  'indore|IN': [22.72, 75.86],
  'jaipur|IN': [26.91, 75.79],
  'lucknow|IN': [26.85, 80.95],
  'mumbai|IN': [19.08, 72.88],
  'nashik|IN': [19.99, 73.79],
  'pune|IN': [18.52, 73.86],
  'surat|IN': [21.17, 72.83],
  'pescara|IT': [42.46, 14.21],
  'milan|IT': [45.46, 9.19],
  'rome|IT': [41.9, 12.5],
  'bunkyo city|JP': [35.71, 139.75],
  'minato city|JP': [35.66, 139.75],
  'nakano city|JP': [35.71, 139.67],
  'tokyo|JP': [35.68, 139.76],
  'blantyre|MW': [-15.79, 35.01],
  'kuala lumpur|MY': [3.14, 101.69],
  'amsterdam|NL': [52.37, 4.9],
  'lagos|NG': [6.52, 3.38],
  'lisbon|PT': [38.72, -9.14],
  'kigali|RW': [-1.94, 30.06],
  'nairobi|KE': [-1.29, 36.82],
  'belgrade|RS': [44.81, 20.46],
  'singapore|SG': [1.35, 103.82],
  'cape town|ZA': [-33.92, 18.42],
  'johannesburg|ZA': [-26.2, 28.04],
  'seoul|KR': [37.57, 126.98],
  'barcelona|ES': [41.39, 2.17],
  'madrid|ES': [40.42, -3.7],
  'lugano|CH': [46, 8.95],
  'zurich|CH': [47.38, 8.54],
  'bangkok|TH': [13.76, 100.5],
  'beyoglu|TR': [41.04, 28.98],
  'istanbul|TR': [41.01, 28.98],
  'vienna|AT': [48.21, 16.37],
  'sydney|AU': [-33.87, 151.21],
  'birmingham|GB': [52.48, -1.9],
  'london|GB': [51.51, -0.13],
  'watford|GB': [51.66, -0.4],
  'kathmandu|NP': [27.72, 85.32],
  'iskandar puteri|MY': [1.42, 103.65],
  'addis ababa|ET': [9.03, 38.74],
  'bogota|CO': [4.71, -74.07],
  'roatan|HN': [16.32, -86.53],
  'mexico city|MX': [19.43, -99.13],
  'alameda|US': [37.77, -122.26],
  'arlington|US': [38.88, -77.1],
  'atherton|US': [37.46, -122.2],
  'belmont|US': [37.52, -122.28],
  'berkeley|US': [37.87, -122.27],
  'burlingame|US': [37.58, -122.35],
  'danville|US': [37.82, -122.0],
  'dublin|US': [37.7, -121.94],
  'fremont|US': [37.55, -121.99],
  'hoboken|US': [40.74, -74.03],
  'jersey city|US': [40.72, -74.04],
  'menlo park|US': [37.45, -122.18],
  'mountain view|US': [37.39, -122.08],
  'newark|US': [40.74, -74.17],
  'oakland|US': [37.8, -122.27],
  'palo alto|US': [37.44, -122.14],
  'queens|US': [40.73, -73.82],
  'redwood city|US': [37.49, -122.23],
  'san carlos|US': [37.51, -122.26],
  'san jose|US': [37.34, -121.89],
  'san mateo|US': [37.56, -122.32],
  'san rafael|US': [37.97, -122.53],
  'santa clara|US': [37.35, -121.96],
  'sausalito|US': [37.86, -122.49],
  'south san francisco|US': [37.65, -122.41],
  'stanford|US': [37.43, -122.17],
  'stamford|US': [41.05, -73.54],
  'sunnyvale|US': [37.37, -122.04],
  'walnut creek|US': [37.91, -122.06],
  'woodside|US': [37.43, -122.25],
  'atlanta|US': [33.75, -84.39],
  'austin|US': [30.27, -97.74],
  'boston|US': [42.36, -71.06],
  'brooklyn|US': [40.68, -73.94],
  'columbus|US': [39.96, -82.99],
  'culver city|US': [34.02, -118.4],
  'davie|US': [26.08, -80.25],
  'denver|US': [39.74, -104.99],
  'fullerton|US': [33.87, -117.92],
  'las vegas|US': [36.17, -115.14],
  'miami|US': [25.76, -80.19],
  'miami beach|US': [25.79, -80.13],
  'new york|US': [40.71, -74.01],
  'san francisco|US': [37.77, -122.42],
  'washington dc|US': [38.91, -77.04],
};

export const EVENT_MAP_CITY_ALIASES: Record<string, string> = {
  beograd: 'belgrade',
  'hong kong island': 'hong kong',
  'abu dhabi uae': 'abu dhabi',
  'dubai uae': 'dubai',
  'new york city': 'new york',
  'sao paulo': 'sao paulo',
  'washington, dc': 'washington dc',
  'washington d c': 'washington dc',
  'أبو ظبي': 'abu dhabi',
  'delhi ncr': 'delhi',
  gurugram: 'delhi',
  gurgaon: 'delhi',
  'new delhi': 'delhi',
  noida: 'delhi',
  'navi mumbai': 'mumbai',
  'queens county': 'queens',
  gujarat: 'ahmedabad',
  bangalore: 'bengaluru',
  roatán: 'roatan',
  roatan: 'roatan',
  'mexico city': 'mexico city',
  'bogotá': 'bogota',
  bogota: 'bogota',
  sisli: 'istanbul',
  'şişli': 'istanbul',
  rooftop: 'singapore',
};

export const EVENT_MAP_CITY_DISPLAY_NAMES: Record<string, string> = {
  delhi: 'Delhi NCR',
  mumbai: 'Mumbai',
  bengaluru: 'Bengaluru',
};

const NON_MAP_CITY = /^(global|tba|virtual|online|\?)$/i;

function titleCaseCity(city: string): string {
  return city
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

/** Canonical city label for UI + map (Navi Mumbai → Mumbai, New Delhi → Delhi NCR). */
export function getEventDisplayCity(city?: string | null): string {
  const raw = (city || '').trim();
  if (!raw) return '';
  const normalized = normalizeEventMapCity(raw);
  return EVENT_MAP_CITY_DISPLAY_NAMES[normalized] || titleCaseCity(normalized);
}

export function getEventMapCountryCode(country?: string): string | null {
  const normalized = normalizeCountry(country || '');
  if (!normalized) return null;

  const byName = Object.entries(COUNTRY_NAMES).find(([, name]) => name === normalized);
  if (byName) return byName[0];

  return EVENT_MAP_COUNTRY_CODES[normalized.toLowerCase()] || null;
}

export function normalizeEventMapCity(city: string): string {
  const trimmed = city.trim();
  const normalized = trimmed
    .normalize('NFC')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

  const aliased = EVENT_MAP_CITY_ALIASES[normalized] || EVENT_MAP_CITY_ALIASES[trimmed.normalize('NFC')];
  if (aliased) return aliased;

  if (/ظبي/.test(trimmed) && /أبو|ابو|abu/i.test(trimmed)) return 'abu dhabi';
  if (/^دبي$/u.test(trimmed.normalize('NFC'))) return 'dubai';

  return normalized.split(',')[0].trim();
}

export function getEventMapCoordinates(city: string, countryCode: string): [number, number] | null {
  const normalizedCity = normalizeEventMapCity(city);
  return EVENT_MAP_CITY_COORDINATES[`${normalizedCity}|${countryCode}`] || null;
}

export function shouldShowEventOnMap(event: Pick<PublicWeb3Event, 'city' | 'country'>): boolean {
  if (!event.city || NON_MAP_CITY.test(event.city.trim())) return false;
  const countryCode = getEventMapCountryCode(event.country);
  if (!countryCode) return false;
  return getEventMapCoordinates(event.city, countryCode) !== null;
}

export function groupEventsForMap(events: PublicWeb3Event[]): EventMapGroup[] {
  const locations = new Map<string, EventMapGroup>();

  events.forEach((event) => {
    if (!shouldShowEventOnMap(event)) return;
    const countryCode = getEventMapCountryCode(event.country)!;
    const city = normalizeEventMapCity(event.city!);
    const coordinates = EVENT_MAP_CITY_COORDINATES[`${city}|${countryCode}`]!;
    const key = `${city}|${countryCode}`;
    const displayCity = EVENT_MAP_CITY_DISPLAY_NAMES[city] || titleCaseCity(city);
    const label = `${displayCity}, ${COUNTRY_NAMES[countryCode] || event.country}`;
    const group = locations.get(key) || { key, label, events: [], coordinates };
    group.events.push(event);
    locations.set(key, group);
  });

  return [...locations.values()].sort(
    (a, b) => b.events.length - a.events.length || a.label.localeCompare(b.label),
  );
}

/** Used by scripts/check-event-map-cities.ts */
export function listUnmappedMapEvents(events: PublicWeb3Event[]): {
  missingCoordinates: Array<{ key: string; count: number; rawCities: string[]; sample: string }>;
  missingCountry: Array<{ country: string; city: string; count: number }>;
} {
  const missingCoordinates = new Map<string, { count: number; rawCities: Set<string>; sample: string }>();
  const missingCountry = new Map<string, number>();

  for (const event of events) {
    if (!event.city || NON_MAP_CITY.test(event.city.trim())) continue;
    const countryCode = getEventMapCountryCode(event.country);
    if (!countryCode) {
      const k = `${event.country || '?'}|${event.city}`;
      missingCountry.set(k, (missingCountry.get(k) || 0) + 1);
      continue;
    }
    const city = normalizeEventMapCity(event.city);
    const key = `${city}|${countryCode}`;
    if (!EVENT_MAP_CITY_COORDINATES[key]) {
      const cur = missingCoordinates.get(key) || { count: 0, rawCities: new Set<string>(), sample: event.name };
      cur.count += 1;
      cur.rawCities.add(event.city);
      missingCoordinates.set(key, cur);
    }
  }

  return {
    missingCoordinates: [...missingCoordinates.entries()]
      .sort((a, b) => b[1].count - a[1].count)
      .map(([key, v]) => ({
        key,
        count: v.count,
        rawCities: [...v.rawCities],
        sample: v.sample,
      })),
    missingCountry: [...missingCountry.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([k, count]) => {
        const [country, city] = k.split('|');
        return { country, city, count };
      }),
  };
}
