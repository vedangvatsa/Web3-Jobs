import { getEventMapCountryCode, getEventMapCoordinates, normalizeEventMapCity } from '@/lib/event-map-locations';
import type { NomadCity } from './types';

type CityLocation = Pick<NomadCity, 'slug' | 'name' | 'countryCode'>;
const normalized = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
const stateCodes = new Set('AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY DC'.split(' '));
const cache = new Map<string, Set<string>>();

export function cityAliases(city: CityLocation): string[] {
  return [...new Set([normalizeEventMapCity(city.name, city.countryCode), city.slug.replace(/-/g, ' '),
    ...(city.slug === 'bali' ? ['bali', 'canggu', 'ubud'] : []),
    ...(city.slug === 'bangalore' ? ['bangalore', 'bengaluru'] : []),
    ...(city.slug === 'madeira-funchal' ? ['madeira', 'funchal'] : []),
    ...(city.slug === 'las-palmas' ? ['las palmas', 'las palmas de gran canaria'] : []),
  ])];
}

export function locationCountries(location: string): Set<string> {
  const existing = cache.get(location);
  if (existing) return existing;
  const countries = new Set<string>();
  for (const segment of location.split(/;|\s[|/]\s/)) {
    const parts = segment.replace(/\b(?:remote|hybrid|on-site|onsite|office|headquarters|hq)\b\s*(?:in\b|[-:])?/gi, '').split(/[,()/]|\s[-–—]\s/).map(value => value.trim()).filter(Boolean);
    for (let index = parts.length - 1; index >= 0; index--) {
      const part = parts[index], upper = part.toUpperCase();
      const code = getEventMapCountryCode(part);
      if (normalized(part) === 'georgia' && !getEventMapCoordinates(parts[0], 'GE')) continue;
      if (part.length === 2 && stateCodes.has(upper) && parts.length > 1) {
        if (getEventMapCoordinates(parts[0], 'US')) { countries.add('US'); break; }
        if (code && getEventMapCoordinates(parts[0], code)) { countries.add(code); break; }
        if (!code) { countries.add('US'); break; }
        continue;
      }
      if (code) { countries.add(code); break; }
    }
  }
  if (cache.size >= 5000) cache.clear();
  cache.set(location, countries);
  return countries;
}

export function locationMatchesCountry(location: string, city: CityLocation): boolean {
  return locationCountries(location).has(city.countryCode);
}

export function locationMatchesCity(location: string, city: CityLocation): boolean {
  if (!locationMatchesCountry(location, city)) return false;
  const text = normalized(location);
  return cityAliases(city).some(alias => new RegExp(`(?:^|[^a-z])${normalized(alias).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:$|[^a-z])`).test(text));
}
