import slugTypesJson from '../../content/slug-types.json';
import legacyArchiveJson from '../../content/legacy-slugs-archive.json';
import { getPopupSlugs } from '@/lib/popups';

export type SlugType = 'event' | 'company' | 'popup' | 'glossary' | 'resource' | 'article' | 'job';

type SlugTypesData = {
  events: string[];
  companies: string[];
  glossary: string[];
  resources: string[];
  articles: string[];
  popups: string[];
};

const data = (slugTypesJson as SlugTypesData) || {
  events: [],
  companies: [],
  glossary: [],
  resources: [],
  articles: [],
  popups: [],
};

const eventSet = new Set(data.events);
const companySet = new Set(data.companies);
const popupSet = new Set([...(data.popups ?? []), ...getPopupSlugs()].map((s) => s.toLowerCase().trim()));
const glossarySet = new Set(data.glossary);
const resourceSet = new Set(data.resources);
const articleSet = new Set(data.articles);

/** Historical job slugs from Telegram / bookmarks — must win over glossary & articles. */
const legacyJobSlugSet = new Set(
  Object.keys(legacyArchiveJson as Record<string, unknown>).map((s) => s.toLowerCase().trim()),
);

export function classifySlug(slug: string): SlugType {
  const norm = slug.toLowerCase().trim();
  if (eventSet.has(norm)) return 'event';
  if (companySet.has(norm)) return 'company';
  if (popupSet.has(norm)) return 'popup';
  if (legacyJobSlugSet.has(norm)) return 'job';
  if (glossarySet.has(norm)) return 'glossary';
  if (resourceSet.has(norm)) return 'resource';
  if (articleSet.has(norm)) return 'article';
  return 'job';
}
