import type { ExplorerCity } from './types';
import { metric, money } from './types';

export const RANK_CATEGORIES = [
  { key: 'score', label: 'Overall score', ascending: false },
  { key: 'cost', label: 'Living costs', ascending: true },
  { key: 'internet', label: 'Internet speed', ascending: false },
  { key: 'safety', label: 'Safety', ascending: false },
  { key: 'walkability', label: 'Walkability', ascending: false },
  { key: 'temperature', label: 'Temperature', ascending: false },
  { key: 'rainfall', label: 'Rainfall', ascending: true },
  { key: 'humidity', label: 'Humidity', ascending: true },
] as const;
export type RankCategory = typeof RANK_CATEGORIES[number]['key'];
export const CLIMATE_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const isClimateCategory = (category: RankCategory) => ['temperature', 'rainfall', 'humidity'].includes(category);
export const searchText = (value: string) => value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[-_]/g, ' ').toLowerCase().trim();

export function comparisonSlugs(cities: readonly ExplorerCity[], params: { get: (key: string) => string | null }): [string, string] {
  const selected = (params.get('compare') || params.get('cities') || '').split(',');
  const first = params.get('a') || selected[0] || 'lisbon';
  const a = cities.some(city => city.slug === first) ? first : 'lisbon';
  const second = params.get('b') || selected[1] || 'chiang-mai';
  const b = second !== a && cities.some(city => city.slug === second) ? second : a === 'chiang-mai' ? 'lisbon' : 'chiang-mai';
  return [a, b];
}

export function rankCategory(value: string | null): RankCategory {
  if (value === 'climate') return 'temperature';
  if (value === 'monthly_total') return 'cost';
  return RANK_CATEGORIES.find(category => category.key === value)?.key || 'score';
}

export function rankingValue(city: ExplorerCity, category: RankCategory, month: number): number | null {
  const weather = city.weather.monthly[month];
  switch (category) {
    case 'score': return city.score;
    case 'cost': return city.cost.monthly_total;
    case 'internet': return city.internet?.download_mbps ?? null;
    case 'safety': return city.safety;
    case 'walkability': return city.walkability?.walk ?? null;
    case 'temperature': return weather?.temp ?? null;
    case 'rainfall': return weather?.rain ?? null;
    case 'humidity': return weather?.humidity ?? null;
  }
}

export function rankingLabel(city: ExplorerCity, category: RankCategory, month: number): string {
  const value = rankingValue(city, category, month);
  if (value === null) return 'Not available';
  return category === 'cost' ? money(value) : metric(value, { score: ' / 100', internet: ' Mbps', safety: ' / 10', walkability: ' / 10', temperature: '°C', rainfall: ' mm', humidity: '%' }[category]);
}

export function compareCityRank(a: ExplorerCity, b: ExplorerCity, category: RankCategory, month: number, ascending: boolean): number {
  const av = rankingValue(a, category, month), bv = rankingValue(b, category, month);
  if (av === null || bv === null) return av === bv ? a.name.localeCompare(b.name) : av === null ? 1 : -1;
  return (ascending ? av - bv : bv - av) || a.name.localeCompare(b.name);
}

export function matchesClimate(city: ExplorerCity, month: number, filters: { min: string; max: string; humidity: string; rain: string }): boolean {
  const weather = city.weather.monthly[month];
  if (!weather) return false;
  if (filters.min !== '' && (weather.temp === null || weather.temp < Number(filters.min))) return false;
  if (filters.max !== '' && (weather.temp === null || weather.temp > Number(filters.max))) return false;
  if (filters.humidity && (weather.humidity === null || (filters.humidity === 'low' ? weather.humidity >= 40 : filters.humidity === 'medium' ? weather.humidity < 40 || weather.humidity > 65 : weather.humidity <= 65))) return false;
  if (filters.rain && (weather.rain === null || (filters.rain === 'dry' ? weather.rain > 50 : filters.rain === 'moderate' ? weather.rain <= 50 || weather.rain > 200 : weather.rain <= 200))) return false;
  return true;
}
