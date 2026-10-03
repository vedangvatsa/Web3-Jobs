export type PlaceCategory = 'coliving' | 'hostel' | 'apartment' | 'guesthouse' | 'coworking';
export const PLACE_CATEGORIES: Record<PlaceCategory, string> = { coworking: 'Coworking', coliving: 'Coliving', apartment: 'Apartments', hostel: 'Hostels', guesthouse: 'Guesthouses' };
export type MonthlyClimate = { month: string; temp: number | null; humidity: number | null; rain: number | null };
export type CityCosts = { monthly_total: number; rent: number; food: number; transport: number; coworking: number; other: number };
export type CommunityLink = { name: string; platform: string; url: string };
export type NomadCity = {
  slug: string; name: string; country: string; countryCode: string; continent: string;
  lat: number; lon: number; timezone: string; emoji: string;
  image: string | null; thumbnail: string | null;
  cost: CityCosts;
  weather: { monthly: MonthlyClimate[]; avg_temp: number | null; avg_humidity: number | null; annual_rain: number | null };
  spaces: Record<PlaceCategory, number> & { total: number };
  score: number | null; safety: number | null;
  walkability: { walk: number; transit: number; bike: number; carFree: string } | null;
  internet: { download_mbps: number; upload_mbps: number; latency_ms: number; test_count: number; quarter: string } | null;
  nearby: string[]; communities: CommunityLink[];
};
export type ExplorerCity = Omit<NomadCity, 'nearby' | 'communities'>;
export type CitySummary = Pick<NomadCity, 'slug' | 'name' | 'country' | 'countryCode' | 'continent' | 'timezone' | 'emoji' | 'image' | 'thumbnail' | 'score' | 'safety' | 'walkability' | 'lat' | 'lon'> & {
  monthlyCost: number; internetMbps: number | null; temperature: number | null; placeCount: number;
};
export type NomadPlace = { id: string; name: string; category: PlaceCategory; lat: number; lon: number; citySlug: string; website: string | null; quality: number; rating: number | null; reviewCount: number | null; address: string };
export type CompactPlaces = { cities: string[]; rows: [string, string, number, number, number, number, string, number, number, number, string][] };
export const COMPACT_CATEGORIES: PlaceCategory[] = ['coliving', 'hostel', 'apartment', 'guesthouse', 'coworking'];
export type VisaProgram = { id: string; country: string; continent: string; minIncome: number; visaLength: string; description: string; requirements: string[]; officialUrl?: string; fee?: string; taxNotes?: string; referenceIncome?: string; source: string };
export type VisaProgramListing = Omit<VisaProgram, 'source'>;
export type PassportCountry = { id: string; name: string; iso: string | null };
export type EntryRule = { t: 'vf' | 'voa' | 'ev' | 'vr' | 'fm' | 'na'; d: number };
export type PassportRules = { passport: string; destinations: { name: string; iso: string | null; rule: EntryRule }[] };
export type ServiceCategory = { id: string; title: string; description: string; resources: { name: string; url: string; description: string; tag?: string }[] };
export type TaxReference = { country: string; emoji: string; rate: number; dnVisa: boolean; notes: string; source: string };

export function citySummary(city: ExplorerCity): CitySummary {
  const { slug, name, country, countryCode, continent, timezone, emoji, image, thumbnail, score, safety, walkability, lat, lon } = city;
  return { slug, name, country, countryCode, continent, timezone, emoji, image, thumbnail, score, safety, walkability, lat, lon, monthlyCost: city.cost.monthly_total, internetMbps: city.internet?.download_mbps ?? null, temperature: city.weather.avg_temp, placeCount: city.spaces.total };
}

export function safeExternalUrl(value: string | undefined | null): string | null {
  try { const url = new URL(value || ''); return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password ? url.toString() : null; } catch { return null; }
}

export function decodePlaces(data: CompactPlaces): NomadPlace[] {
  return data.rows.map(row => ({ id: String(row[0]), name: row[1], category: COMPACT_CATEGORIES[row[2]], lat: row[3], lon: row[4], citySlug: data.cities[row[5]], website: safeExternalUrl(row[6]), quality: row[7], rating: row[8] > 0 ? row[8] : null, reviewCount: row[9] > 0 ? row[9] : null, address: row[10] || '' }));
}

export const money = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
export const metric = (value: number | null | undefined, suffix = '') => value == null || !Number.isFinite(value) ? 'Not available' : `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(value)}${suffix}`;
export const cityPath = (slug: string) => `/${encodeURIComponent(slug)}`;
