import slugTypes from '../../content/slug-types.json';

export type HeaderCta = 'job' | 'event';

const eventSlugs = new Set(slugTypes.events);
const jobSlugs = new Set((slugTypes as typeof slugTypes & { jobs?: string[] }).jobs ?? []);
const staticPages = new Set((slugTypes as typeof slugTypes & { staticPages?: string[] }).staticPages ?? []);

export function getHeaderCta(pathname: string | null): HeaderCta | null {
  if (!pathname) return null;
  const path = pathname.replace(/\/+$/, '') || '/';
  if (path === '/' || path === '/jobs') return 'job';
  if (path === '/events') return 'event';
  if (!/^\/[^/]+$/.test(path)) return null;
  let slug: string;
  try {
    slug = decodeURIComponent(path.slice(1)).toLowerCase();
  } catch {
    return null;
  }
  if (staticPages.has(slug)) return null;
  if (eventSlugs.has(slug)) return 'event';
  if (jobSlugs.has(slug)) return 'job';
  return null;
}
