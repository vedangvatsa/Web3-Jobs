import slugTypesJson from '../../content/slug-types.json';
import legacyArchiveJson from '../../content/legacy-slugs-archive.json';
import jobsRuntimeJson from '../../content/jobs-runtime.json';
import type { Job } from '@/types';
import { getPopupSlugs } from '@/lib/popups';
import { resolveLearnRoute } from '@/lib/learn-routes';
import { hasLiveJobRootOwner } from '@/lib/job-root-ownership';
import type { ArchivedSlugRecord } from '@/lib/job-guides';

export type SlugType = 'event' | 'company' | 'popup' | 'glossary' | 'resource' | 'article' | 'job' | 'learn';

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

const legacyArchive = legacyArchiveJson as Record<string, ArchivedSlugRecord>;
const legacyJobSlugSet = new Set(
  Object.keys(legacyArchive).map((s) => s.toLowerCase().trim()),
);

export function classifySlug(slug: string): SlugType {
  const norm = slug.toLowerCase().trim();
  if (resolveLearnRoute(norm)) return 'learn';
  if (eventSet.has(norm)) return 'event';
  if (companySet.has(norm)) return 'company';
  if (popupSet.has(norm)) return 'popup';
  // An archive reservation alone cannot shadow published content. Keep job
  // precedence only while its canonical posting or identity-verified alias resolves.
  if (legacyJobSlugSet.has(norm) && (
    (!glossarySet.has(norm) && !resourceSet.has(norm) && !articleSet.has(norm))
    || hasLiveJobRootOwner(norm, legacyArchive[norm], jobsRuntimeJson as Job[])
  )) return 'job';
  if (glossarySet.has(norm)) return 'glossary';
  if (resourceSet.has(norm)) return 'resource';
  if (articleSet.has(norm)) return 'article';
  return 'job';
}
