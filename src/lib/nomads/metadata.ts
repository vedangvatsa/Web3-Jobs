import type { Metadata } from 'next';
import { getNomadCity, getNomadCities, nomadSources } from './server';
import { NOMAD_TOOLS } from './routes';
import { cityPath, money } from './types';

export const nomadOgImage = (pathname: string) => `https://hashtagweb3.com/og/pages${pathname}.png`;

export function legacyNomadDestination(pathname: string): string | null {
  const city = pathname.startsWith('/nomads/cities/') ? getNomadCity(pathname.slice('/nomads/cities/'.length)) : undefined;
  if (city) return cityPath(city.slug);
  return NOMAD_TOOLS.find(tool => !['cities', 'visas'].includes(tool.key) && pathname === `/nomads/${tool.key}`)?.href || null;
}

export function nomadPageInfo(pathname: string): { title: string; description: string; path: string } | null {
  const city = /^\/[a-z0-9-]+$/.test(pathname) ? getNomadCity(pathname.slice(1)) : undefined;
  if (city) return { title: `${city.name}: remote-work city guide`, description: `Explore ${city.name}, ${city.country}: ${money(city.cost.monthly_total)}/month in reference living costs, ${city.spaces.total} listed places, climate, connectivity and local communities.`, path: cityPath(city.slug) };
  const tool = NOMAD_TOOLS.find(tool => tool.href === pathname);
  return tool ? { title: tool.key === 'cities' ? 'Nomad Toolkit' : tool.title, description: tool.description, path: tool.href } : null;
}

export function nomadMetadata(pathname: string): Metadata {
  const info = nomadPageInfo(pathname);
  if (!info) return { title: 'City not found', robots: { index: false, follow: true } };
  const url = `https://hashtagweb3.com${info.path}`;
  const image = nomadOgImage(info.path);
  return { title: info.title, description: info.description, alternates: { canonical: url }, openGraph: { type: 'website', title: `${info.title} | Hashtag Web3`, description: info.description, url, images: [{ url: image, width: 1200, height: 630, alt: info.title }] }, twitter: { card: 'summary_large_image', title: info.title, description: info.description, images: [image] } };
}

export function nomadRoutes() {
  return [...NOMAD_TOOLS.map(tool => tool.href), ...getNomadCities().map(city => cityPath(city.slug))].map(path => ({ path, lastModified: `${nomadSources.importedAt}T00:00:00.000Z` }));
}
