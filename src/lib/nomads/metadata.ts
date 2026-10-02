import type { Metadata } from 'next';
import { getNomadCity, getNomadCities, nomadSources } from './server';
import { NOMAD_TOOLS } from './routes';
import { cityPath, money } from './types';

export const NOMAD_OG_IMAGE = 'https://hashtagweb3.com/og-image-tools.png';

export function nomadPageInfo(pathname: string): { title: string; description: string; path: string } | null {
  if (pathname.startsWith('/nomads/cities/')) {
    const city = getNomadCity(pathname.slice('/nomads/cities/'.length));
    return city ? { title: `${city.name}: remote-work city guide`, description: `Explore ${city.name}, ${city.country}: ${money(city.cost.monthly_total)}/month in reference living costs, ${city.spaces.total} listed places, climate, connectivity and local communities.`, path: cityPath(city.slug) } : null;
  }
  const tool = NOMAD_TOOLS.find(tool => tool.href === pathname);
  return tool ? { title: tool.key === 'cities' ? 'Nomad Toolkit' : tool.title, description: tool.description, path: tool.href } : null;
}

export function nomadMetadata(pathname: string): Metadata {
  const info = nomadPageInfo(pathname);
  if (!info) return { title: 'City not found', robots: { index: false, follow: true } };
  const url = `https://hashtagweb3.com${info.path}`;
  return { title: info.title, description: info.description, alternates: { canonical: url }, openGraph: { type: 'website', title: `${info.title} | Hashtag Web3`, description: info.description, url, images: [{ url: NOMAD_OG_IMAGE, width: 1200, height: 630, alt: info.title }] }, twitter: { card: 'summary_large_image', title: info.title, description: info.description, images: [NOMAD_OG_IMAGE] } };
}

export function nomadRoutes() {
  return [...NOMAD_TOOLS.map(tool => tool.href), ...getNomadCities().map(city => cityPath(city.slug))].map(path => ({ path, lastModified: `${nomadSources.importedAt}T00:00:00.000Z` }));
}
