import slugTypes from '../../content/slug-types.json';
import { EMPLOYER_RESOURCES } from './nav-config';

export type HeaderCta = 'job' | 'event' | 'popup' | 'partner';

const EMPLOYER_JOB_CTA_PATHS = new Set(
  EMPLOYER_RESOURCES.map((item) => item.href.replace(/\/+$/, '') || '/'),
);

const eventSlugs = new Set(slugTypes.events);
const jobSlugs = new Set((slugTypes as typeof slugTypes & { jobs?: string[] }).jobs ?? []);
const popupSlugs = new Set((slugTypes as typeof slugTypes & { popups?: string[] }).popups ?? []);
const staticPages = new Set((slugTypes as typeof slugTypes & { staticPages?: string[] }).staticPages ?? []);

export function getHeaderCta(pathname: string | null): HeaderCta | null {
  if (!pathname) return null;
  const path = pathname.replace(/\/+$/, '') || '/';
  if (path === '/' || path === '/jobs') return 'job';
  if (path === '/events') return 'event';
  if (path === '/popups') return 'popup';
  if (path === '/community') return 'partner';
  if (EMPLOYER_JOB_CTA_PATHS.has(path)) return 'job';
  if (!/^\/[^/]+$/.test(path)) return null;
  let slug: string;
  try {
    slug = decodeURIComponent(path.slice(1)).toLowerCase();
  } catch {
    return null;
  }
  if (staticPages.has(slug) && slug !== 'popups') return null;
  if (eventSlugs.has(slug)) return 'event';
  if (popupSlugs.has(slug)) return 'popup';
  if (jobSlugs.has(slug)) return 'job';
  return null;
}
