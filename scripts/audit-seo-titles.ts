/**
 * Full-site SEO title audit: simulates final tab titles via applyTitleTemplate / seoSocialTitle.
 */
import assert from 'node:assert/strict';
import {
  applyTitleTemplate,
  SEO_TITLE_BRAND_SUFFIX,
  seoSocialTitle,
  SEO_TITLE_MAX,
} from '../src/lib/seo-title';
import grants from '../content/grants/grants.json';
import events from '../content/events-runtime.json';
import companies from '../content/companies-runtime.json';
import articles from '../content/articles-index.json';
import { getAllTerms } from '../src/lib/glossary';
import { getAllResourcePages } from '../src/lib/pseo';
import { getJobs } from '../src/lib/jobs';
import { getCompanySlug } from '../src/lib/job-slugs';
import { resolveKnownOgPreviewMeta } from '../src/lib/og-preview';
import { nomadRoutes } from '../src/lib/nomads/metadata';
import { learnRoutes } from '../src/lib/learn-routes';
import { learnPageMetadata } from '../src/lib/learn-meta';
import { getPopupSlugs, getPopupBySlug } from '../src/lib/popups';
import { popupPageMetadata } from '../src/lib/popup-seo';

type Fail = { label: string; full: string; len: number; dup: number };

function checkDocumentTitle(label: string, segment: string): Fail | null {
  const full = applyTitleTemplate(segment);
  const dup = (full.match(/ \| Hashtag Web3/g) || []).length;
  if (full.length > SEO_TITLE_MAX || dup !== 1) {
    return { label, full, len: full.length, dup };
  }
  return null;
}

function checkSocialTitle(label: string, title: string): Fail | null {
  const full = title.includes('Hashtag Web3') ? title : seoSocialTitle(title);
  const dup = (full.match(/ \| Hashtag Web3/g) || []).length;
  if (full.length > SEO_TITLE_MAX || dup !== 1) {
    return { label, full, len: full.length, dup };
  }
  return null;
}

/** Root layout `%s | Hashtag Web3` when metadata.title is already a segment. */
function checkLayoutTitleSegment(label: string, segment: string): Fail | null {
  const full = `${segment.trim()}${SEO_TITLE_BRAND_SUFFIX}`;
  const dup = (full.match(/ \| Hashtag Web3/g) || []).length;
  if (full.length > SEO_TITLE_MAX || dup !== 1) {
    return { label, full, len: full.length, dup };
  }
  return null;
}

async function main() {
  const fails: Fail[] = [];
  let checked = 0;

  const push = (f: Fail | null) => {
    if (f) fails.push(f);
    checked++;
  };

  for (const g of grants) push(checkDocumentTitle(`grant:${g.id}`, g.name));
  for (const e of events) push(checkDocumentTitle(`event:${e.id}`, e.name || ''));

  for (const [slug, c] of Object.entries(companies)) {
    push(checkDocumentTitle(`company:${slug}`, `${c.name} Jobs`));
  }

  for (const a of articles) push(checkDocumentTitle(`article:${a.slug}`, a.title));

  for (const t of await getAllTerms()) push(checkDocumentTitle(`term:${t.slug}`, t.term));

  for (const r of getAllResourcePages()) {
    push(checkDocumentTitle(`pseo:${r.seo.canonicalSlug}`, r.seo.title));
  }

  const jobs = await getJobs();
  for (const job of jobs) {
    push(
      checkDocumentTitle(
        `job:${job.slug || getCompanySlug(job.company)}`,
        `${job.title} at ${job.company}`,
      ),
    );
  }

  const hubs = [
    '/',
    '/jobs',
    '/events',
    '/grants',
    '/companies',
    '/blog',
    '/news',
    '/learn',
    '/glossary',
    '/developers',
    '/contact',
    '/top100',
    '/community',
    '/popups',
    '/resources',
    '/citizenship',
    '/visas',
    '/nomads',
    '/salary-calculator',
    '/web3-hiring-report',
    '/resume-builder',
    '/jd-builder',
    '/invoice-generator',
    '/remote-work-checklist',
    '/web3-career-quiz',
    '/interview-questions',
    '/freelance-rates-by-industry',
    '/company-culture-guide',
    '/employee-onboarding-checklist',
    '/offer-letter-customizer',
    '/privacy',
    '/about',
  ];

  for (const h of hubs) {
    const m = await resolveKnownOgPreviewMeta(h);
    if (m) push(checkSocialTitle(`hub:${h}`, m.title));
    else checked++;
  }

  for (const { path } of nomadRoutes()) {
    const m = await resolveKnownOgPreviewMeta(path);
    if (m) push(checkSocialTitle(`nomad:${path}`, m.title));
  }

  for (const route of learnRoutes) {
    const meta = learnPageMetadata(route);
    const title = typeof meta.title === 'string' ? meta.title : '';
    if (title) {
      push(checkLayoutTitleSegment(`learn:${route.slug}`, title));
      const og = meta.openGraph?.title;
      if (typeof og === 'string') push(checkSocialTitle(`learn-og:${route.slug}`, og));
    } else checked++;
  }

  for (const slug of getPopupSlugs()) {
    const popup = getPopupBySlug(slug);
    if (!popup) continue;
    const meta = popupPageMetadata(popup);
    const og = meta.openGraph?.title;
    if (typeof og === 'string') push(checkSocialTitle(`popup:${slug}`, og));
  }

  if (fails.length) {
    const byKind = new Map<string, number>();
    for (const f of fails) {
      const kind = f.label.split(':')[0];
      byKind.set(kind, (byKind.get(kind) || 0) + 1);
    }
    console.error(`SEO title audit failed: ${fails.length} of ${checked} URLs`);
    console.error('By kind:', Object.fromEntries([...byKind.entries()].sort((a, b) => b[1] - a[1])));
    for (const f of fails.slice(0, 20)) {
      console.error(`- ${f.label} (${f.len}c, brand×${f.dup}): ${f.full}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(`SEO title audit passed for ${checked} page title samples (max ${SEO_TITLE_MAX} chars, single brand suffix).`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});