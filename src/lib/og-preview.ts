import { getAllArticles } from '@/lib/articles';
import { buildArticlePageMeta } from '@/lib/article-og-meta';
import { buildUniqueJobMetaDescription, resolveJobSlug, getAllJobsWithSlugs, getLegacyJobSlugs, getRemediatedJobSlugs, isRetiredJobSlug } from '@/lib/job-guides';
import { getTerm, getAllTerms, getAllCategorySlugs, getCategory as getGlossaryCategory } from '@/lib/glossary';
import { getResourceByCanonicalSlug, getAllResourcePages } from '@/lib/pseo';
import {
  buildJobOgImageUrl,
  buildCompanyOgImageUrl,
  buildDefaultOgImageUrl,
  STATIC_OG,
  resolveEventOgImageUrl,
  eventOgImageMimeType,
  SITE_URL,
} from '@/lib/job-og';
import { buildEventMetaDescription } from '@/lib/event-editorial-facts';
import { hasCuratedEventGuide } from '@/lib/event-page-quality';
import { getEventBySlug, getEvents } from '@/lib/events-server';
import { getEventSlug } from '@/lib/events';
import { getCompanies, getCompanyBySlug, hasPublishedCompanyProfile } from '@/lib/companies';
import { REJECTED_ATS_BOARDS } from '@/lib/job-source-policy';
import { getCompanySlug } from '@/lib/job-slugs';
import { fmtInt, hiringReportStats } from '@/lib/hiring-report-stats';
import { getLearnRedirectPath, learnRoutes, resolveLearnRoute } from '@/lib/learn-routes';
import { learnPageMetadata } from '@/lib/learn-meta';
import { legacyNomadDestination, nomadPageInfo, nomadRoutes, nomadOgImage } from '@/lib/nomads/metadata';
import { getPopupSlugs } from '@/lib/popups';
import { getPopupPath, resolvePopupForPathSegment } from '@/lib/popup-seo';
import { formatPopupField } from '@/lib/popup-narrative';
import { generateGlossaryMetaDescription } from '@/lib/seo-utils';
import { isRemovedJobPath } from '@/lib/removed-job-path';
import { isExpiredJobPath } from '@/lib/job-age-path';
import { canonicalSocialPagePath } from '@/lib/social-share';
import slugTypes from '../../content/slug-types.json';

const SITE_NAME = 'Hashtag Web3';
const REMEDIATED_COMPANY_SLUGS = new Set(Object.values(REJECTED_ATS_BOARDS).map(board => getCompanySlug(board.misattributedTo)));
const COMPANY_SLUGS = new Set([...slugTypes.companies, ...REMEDIATED_COMPANY_SLUGS]);

export type OgPreviewMeta = {
  title: string;
  description: string;
  ogImageUrl: string;
  canonicalUrl: string;
  ogImageWidth?: number;
  ogImageHeight?: number;
  ogImageType?: string;
};

/** CDN path for a crawler HTML shell, e.g. `/` → `/preview/index.html`. */
export function previewAssetPath(contentPath: string): string {
  const normalized = contentPath.replace(/\/+$/, '') || '/';
  if (normalized === '/') return '/preview/index.html';
  return `/preview${normalized}.html`;
}

export function buildOgPreviewHtml(meta: OgPreviewMeta): string {
  const ogImageType = meta.ogImageType || eventOgImageMimeType(meta.ogImageUrl);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>${escHtml(meta.title)}</title>
<meta name="description" content="${escHtml(meta.description)}"/>
<link rel="canonical" href="${escHtml(meta.canonicalUrl)}"/>
<meta property="og:type" content="website"/>
<meta property="og:site_name" content="${escHtml(SITE_NAME)}"/>
<meta property="og:title" content="${escHtml(meta.title)}"/>
<meta property="og:description" content="${escHtml(meta.description)}"/>
<meta property="og:url" content="${escHtml(meta.canonicalUrl)}"/>
<meta property="og:image" content="${escHtml(meta.ogImageUrl)}"/>
<meta property="og:image:secure_url" content="${escHtml(meta.ogImageUrl)}"/>
<meta property="og:image:width" content="${meta.ogImageWidth || 1200}"/>
<meta property="og:image:height" content="${meta.ogImageHeight || 630}"/>
<meta property="og:image:type" content="${escHtml(ogImageType)}"/>
<meta property="og:image:alt" content="${escHtml(meta.title)}"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:site" content="@hashtag_web3"/>
<meta name="twitter:title" content="${escHtml(meta.title)}"/>
<meta name="twitter:description" content="${escHtml(meta.description)}"/>
<meta name="twitter:image" content="${escHtml(meta.ogImageUrl)}"/>
<meta name="twitter:image:alt" content="${escHtml(meta.title)}"/>
</head>
<body></body>
</html>`;
}

function escHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function resolveJobMetadata(slug: string): Promise<OgPreviewMeta | null> {
  const resolution = await resolveJobSlug(slug);
  const job = resolution.job;
  if (!job || !resolution.canonicalSlug) return null;

  return {
    title: `${job.title} at ${job.company}`,
    description: buildUniqueJobMetaDescription(job),
    ogImageUrl: buildJobOgImageUrl({ ...job, slug: resolution.canonicalSlug || job.slug }),
    canonicalUrl: `${SITE_URL}/${resolution.canonicalSlug}`,
  };
}

async function resolveArticleMetadata(slug: string): Promise<OgPreviewMeta | null> {
  const article = (await getAllArticles()).find(article => article.slug === slug);
  return article ? buildArticlePageMeta(article) : null;
}

const PAGE_META: Record<string, Omit<OgPreviewMeta, 'canonicalUrl'>> = {
    '/': {
      title: `Web3 Jobs and Crypto Careers | ${SITE_NAME}`,
      description: 'Find verified Web3 jobs, crypto careers, salary data, and practical guides. Updated daily for builders, marketers, and product teams.',
      ogImageUrl: STATIC_OG.default,
    },
    '/jobs': {
      title: `Web3 Jobs & Crypto Careers | ${SITE_NAME}`,
      description: 'Find the best remote Web3 jobs. Discover verified opportunities in Solidity, blockchain development, DeFi, DAOs, and crypto marketing.',
      ogImageUrl: STATIC_OG.jobs,
    },
    '/blog': {
      title: `Web3 Career Playbook | ${SITE_NAME}`,
      description: 'Practical guides, salary data, and career advice for Web3 professionals.',
      ogImageUrl: STATIC_OG.blog,
    },
    '/community': {
      title: `Web3 Community | ${SITE_NAME}`,
      description: 'Join 60,000+ Web3 builders and professionals across Telegram, Discord, and LinkedIn.',
      ogImageUrl: `${SITE_URL}/og/pages/community.png`,
    },
    '/popups': {
      title: `Startup Societies | ${SITE_NAME}`,
      description: 'Directory of popup cities, permanent nodes, SEZs, and builder villages for Web3 and frontier tech. Filter by type and region.',
      ogImageUrl: `${SITE_URL}/og/pages/popups.png`,
    },
    '/companies': {
      title: `Web3 Companies Hiring | ${SITE_NAME}`,
      description: 'Browse Web3 companies hiring in DeFi, crypto, and blockchain infrastructure.',
      ogImageUrl: STATIC_OG.companies,
    },
    '/glossary': {
      title: `Blockchain Glossary | ${SITE_NAME}`,
      description: 'Blockchain and Web3 terms explained in plain English.',
      ogImageUrl: `${SITE_URL}/og/pages/glossary.png`,
    },
    '/salary-calculator': {
      title: `Web3 Salary Calculator | ${SITE_NAME}`,
      description: 'Find out what you should be earning in Web3. Compare salaries by role, skills, and location.',
      ogImageUrl: STATIC_OG.tools,
    },
    '/events': {
      title: `Web3 Events & Conferences | ${SITE_NAME}`,
      description: 'Upcoming Web3 conferences, hackathons, and crypto summits worldwide.',
      ogImageUrl: `${SITE_URL}/og/pages/events.png`,
    },
    '/news': {
      title: `Web3 & Crypto News | ${SITE_NAME}`,
      description: 'Latest Web3 and crypto news for blockchain professionals.',
      ogImageUrl: STATIC_OG.news,
    },
    '/developers': {
      title: `Hashtag Web3 Developer Portal | ${SITE_NAME}`,
      description: 'Static catalogs and developer resources for Hashtag Web3.',
      ogImageUrl: `${SITE_URL}/og/pages/developers.png`,
    },
    '/contact': {
      title: `Contact Hashtag Web3 | ${SITE_NAME}`,
      description: 'Direct communication channels for partnerships, hiring campaigns, and community support.',
      ogImageUrl: `${SITE_URL}/og/pages/contact.png`,
    },
    '/about': {
      title: `About Us | ${SITE_NAME}`,
      description: 'About Hashtag Web3, its job board, career resources, and blockchain community.',
      ogImageUrl: `${SITE_URL}/og/pages/about.png`,
    },
    '/privacy': {
      title: `Privacy Policy | ${SITE_NAME}`,
      description: 'How Hashtag Web3 handles your data, user privacy, and AI crawler indexing permissions.',
      ogImageUrl: `${SITE_URL}/og/pages/privacy.png`,
    },
    '/resources': {
      title: `Career Tools | ${SITE_NAME}`,
      description: 'Free Web3 career tools for resumes, salaries, interviews, and offer letters.',
      ogImageUrl: STATIC_OG.tools,
    },
    '/web3-career-quiz': {
      title: `Web3 Career Quiz | ${SITE_NAME}`,
      description: 'Find Web3 career paths that match your skills, interests, and working style.',
      ogImageUrl: STATIC_OG.tools,
    },
    '/interview-questions': {
      title: `Interview Questions | ${SITE_NAME}`,
      description: 'Prepare for Web3 interviews with role-based questions for Solidity, DeFi, product management, and security.',
      ogImageUrl: `${SITE_URL}/og/pages/interview-questions.png`,
    },
    '/freelance-rates-by-industry': {
      title: `Freelance Rates 2026 | ${SITE_NAME}`,
      description: 'Compare freelance hourly and project pricing for software, design, marketing, content, and operations roles.',
      ogImageUrl: STATIC_OG.tools,
    },
    '/company-culture-guide': {
      title: `Culture Guide Builder | ${SITE_NAME}`,
      description: 'Document your company values, communication norms, and team rituals in a culture guide.',
      ogImageUrl: STATIC_OG.tools,
    },
    '/employee-onboarding-checklist': {
      title: `Onboarding Checklist | ${SITE_NAME}`,
      description: 'Plan onboarding for Web3 hires with tasks for culture, security, role training, and their first 90 days.',
      ogImageUrl: STATIC_OG.tools,
    },
    '/offer-letter-customizer': {
      title: `Offer Letter Tool | ${SITE_NAME}`,
      description: 'Create Web3 offer letters with salary, token allocation, and vesting schedules.',
      ogImageUrl: STATIC_OG.tools,
    },
    '/employee-exit-survey': {
      title: `Exit Survey | ${SITE_NAME}`,
      description: 'Create an employee exit survey to gather feedback from departing team members.',
      ogImageUrl: STATIC_OG.tools,
    },
    '/interview-feedback-template': {
      title: `Interview Feedback Template | ${SITE_NAME}`,
      description: 'Create structured interview feedback forms for consistent candidate evaluations.',
      ogImageUrl: STATIC_OG.tools,
    },
    '/employee-milestones-tracker': {
      title: `Milestones Tracker | ${SITE_NAME}`,
      description: 'Plan goals and track milestones for new hires during their first 30, 60, and 90 days.',
      ogImageUrl: STATIC_OG.tools,
    },
    '/employee-engagement-survey': {
      title: `Engagement Survey | ${SITE_NAME}`,
      description: 'Create an employee pulse survey to measure team morale and satisfaction.',
      ogImageUrl: STATIC_OG.tools,
    },
    '/work-life-balance-survey': {
      title: `Work-Life Survey | ${SITE_NAME}`,
      description: 'Create a work-life balance survey to assess team workload, stress, and well-being.',
      ogImageUrl: STATIC_OG.tools,
    },
    '/jd-builder': {
      title: `JD Builder | ${SITE_NAME}`,
      description: 'Create structured job descriptions for Web3 and crypto roles.',
      ogImageUrl: STATIC_OG.tools,
    },
    '/invoice-generator': {
      title: `Invoice Generator | ${SITE_NAME}`,
      description: 'Create invoices for Web3 freelance and contract work.',
      ogImageUrl: STATIC_OG.tools,
    },
    '/resume-builder': {
      title: `Resume Builder | ${SITE_NAME}`,
      description: 'Build a resume tailored for blockchain and Web3 roles.',
      ogImageUrl: STATIC_OG.tools,
    },
    '/remote-work-checklist': {
      title: `Remote Work Checklist | ${SITE_NAME}`,
      description: 'Plan a secure, productive remote workspace.',
      ogImageUrl: STATIC_OG.tools,
    },
    '/visas': {
      title: `Visas for Digital Nomads | ${SITE_NAME}`,
      description: 'Browse digital-nomad visa requirements for remote Web3 workers.',
      ogImageUrl: STATIC_OG.tools,
    },
    '/citizenship': {
      title: `Citizenship by investment | ${SITE_NAME}`,
      description: 'Compare selected citizenship-by-investment routes, contribution and property thresholds, additional fees and official sources.',
      ogImageUrl: STATIC_OG.tools,
    },
    '/web3-hiring-report': {
      title: `Hiring Report ${hiringReportStats.year} | ${SITE_NAME}`,
      description: `${hiringReportStats.snapshotLabel}: ${fmtInt(hiringReportStats.listings)} listings from ${hiringReportStats.companies} employers. Job functions, description keywords, salary ranges, and remote-work wording.`,
      ogImageUrl: STATIC_OG.report,
    },
    '/learn': {
      title: `Learn Web3 | ${SITE_NAME}`,
      description: 'Free structured courses for Web3 builders.',
      ogImageUrl: STATIC_OG.blog,
    },
};

export async function resolveKnownOgPreviewMeta(path: string): Promise<OgPreviewMeta | null> {
  path = path.replace(/\/+$/, '') || '/';
  const canonicalPath = legacyNomadDestination(path) || getLearnRedirectPath(path) || canonicalSocialPagePath(path);
  if (canonicalPath !== path) return resolveKnownOgPreviewMeta(canonicalPath);
  const canonicalUrl = `${SITE_URL}${path}`;
  const nomad = nomadPageInfo(path);
  if (nomad) return { title: `${nomad.title} | ${SITE_NAME}`, description: nomad.description, ogImageUrl: nomadOgImage(nomad.path), canonicalUrl: `${SITE_URL}${nomad.path}` };
  const learningRoute = resolveLearnRoute(path.slice(1));
  if (learningRoute) {
    const meta = learnPageMetadata(learningRoute);
    if (typeof meta.title === 'string' && meta.description) return { title: meta.title, description: meta.description, ogImageUrl: STATIC_OG.blog, canonicalUrl };
  }

  const glossarySlug = path.match(/^\/glossary\/([^/]+)$/)?.[1];
  if (glossarySlug) {
    const category = await getGlossaryCategory(glossarySlug);
    if (category?.termCount) return {
      title: `${category.name} - Web3 Glossary`,
      description: category.description,
      ogImageUrl: `${SITE_URL}/og/pages/glossary.png`,
      canonicalUrl,
    };
    const term = await getTerm(glossarySlug);
    if (term) return resolveKnownOgPreviewMeta(`/${term.slug}`);
    return null;
  }

  const articleSlug = path.match(/^\/blog\/([^/]+)$/)?.[1];
  if (articleSlug) return resolveArticleMetadata(articleSlug);

  const companySlug = path.match(/^\/companies\/([^/]+)$/)?.[1];
  if (companySlug && COMPANY_SLUGS.has(companySlug)) return resolveKnownOgPreviewMeta(`/${companySlug}`);

  const jobSlug = path.match(/^\/jobs\/([^/]+)$/)?.[1];
  if (jobSlug) return resolveJobMetadata(jobSlug);

  const hub = PAGE_META[path];
  if (hub) return { ...hub, canonicalUrl };

  if (/^\/[^/]+$/.test(path)) {
    const slug = path.slice(1);

    try {
      const event = await getEventBySlug(slug);
      if (event) {
        const eventSlug = getEventSlug(event);
        return {
          title: `${event.name} - Dates, Venue & Registration`,
          description: buildEventMetaDescription(event, hasCuratedEventGuide(event)),
          ogImageUrl: resolveEventOgImageUrl(event, SITE_URL),
          canonicalUrl: `${SITE_URL}/${eventSlug}`,
        };
      }
    } catch {
      // ignore
    }

    if (COMPANY_SLUGS.has(slug)) {
      const company = await getCompanyBySlug(slug);
      if (company) {
        return {
          title: `${company.name} Jobs | ${SITE_NAME}`,
          description: await hasPublishedCompanyProfile(company.slug) ? company.description || '' : `Company information and Web3 job listings for ${company.name} on Hashtag Web3.`,
          ogImageUrl: buildCompanyOgImageUrl(company),
          canonicalUrl: `${SITE_URL}/${company.slug}`,
        };
      }
    }

    const popup = resolvePopupForPathSegment(slug);
    if (popup) return {
      title: `${popup.name} Popup | ${SITE_NAME}`,
      description: formatPopupField(popup.summary),
      ogImageUrl: new URL(popup.coverImages?.[0] || '/og-image.png', SITE_URL).toString(),
      canonicalUrl: `${SITE_URL}${getPopupPath(popup.slug)}`,
    };

    const jobMeta = await resolveJobMetadata(slug);
    if (jobMeta) return jobMeta;
    if (isRetiredJobSlug(slug)) return {
      title: `Listing removed | ${SITE_NAME}`,
      description: 'This listing is no longer available.',
      ogImageUrl: STATIC_OG.jobs,
      canonicalUrl,
    };

    const term = await getTerm(slug);
    if (term) {
      return {
        title: `${term.term} - Web3 Glossary`,
        description: generateGlossaryMetaDescription(term),
        ogImageUrl: STATIC_OG.default,
        canonicalUrl: `${SITE_URL}/${term.slug}`,
      };
    }

    const resource = getResourceByCanonicalSlug(slug);
    if (resource) {
      return {
        title: resource.seo.title,
        description: resource.seo.description,
        ogImageUrl: STATIC_OG.default,
        canonicalUrl: `${SITE_URL}/${resource.seo.canonicalSlug}`,
      };
    }

    return resolveArticleMetadata(slug);
  }

  return null;
}

export async function resolveOgPreviewMeta(path: string): Promise<OgPreviewMeta> {
  return await resolveKnownOgPreviewMeta(path) || {
    title: `${SITE_NAME} | Web3 Jobs & Crypto Careers`,
    description: 'Find verified Web3 jobs, crypto careers, salary data, and practical guides.',
    ogImageUrl: buildDefaultOgImageUrl(),
    canonicalUrl: `${SITE_URL}${path}`,
  };
}

/** Paths to bake into public/preview for link-preview crawlers. */
export async function collectOgPreviewPaths(): Promise<string[]> {
  const paths = new Set<string>([
    ...Object.keys(PAGE_META),
    ...nomadRoutes().map(route => route.path),
    ...getPopupSlugs().map(getPopupPath),
    ...getRemediatedJobSlugs().map(slug => `/${slug}`),
    ...[...REMEDIATED_COMPANY_SLUGS].map(slug => `/${slug}`),
    ...learnRoutes.map(route => `/${route.slug}`),
  ]);

  const [jobs, articles, events, terms, resources, companies, categories, registeredCompanies, registeredEvents] = await Promise.all([
    getAllJobsWithSlugs(),
    getAllArticles(),
    getEvents(),
    getAllTerms(),
    Promise.resolve(getAllResourcePages()),
    getCompanies(true),
    getAllCategorySlugs(),
    Promise.all([...COMPANY_SLUGS].map(async slug => ({ slug, company: await getCompanyBySlug(slug) }))),
    Promise.all(slugTypes.events.map(async slug => ({ slug, event: await getEventBySlug(slug) }))),
  ]);

  for (const { slug } of jobs) {
    if (slug) paths.add(`/${slug}`);
  }
  for (const slug of getLegacyJobSlugs()) {
    const path = `/${slug}`;
    if (paths.has(path) || isExpiredJobPath(path) || isRemovedJobPath(path)) continue;
    const resolved = await resolveJobSlug(slug);
    if (resolved.job && resolved.canonicalSlug) paths.add(path);
  }
  for (const article of articles) {
    if (article.slug) paths.add(`/${article.slug}`);
  }
  for (const event of events) {
    paths.add(`/${getEventSlug(event)}`);
    for (const alias of event.aliases || []) {
      if (/^[a-z0-9][a-z0-9_-]*$/i.test(alias)) paths.add(`/${alias}`);
    }
  }
  for (const { slug, event } of registeredEvents) {
    if (event) paths.add(`/${slug}`);
  }
  for (const term of terms) {
    if (term.slug) {
      paths.add(`/${term.slug}`);
      paths.add(`/glossary/${term.slug}`);
    }
  }
  for (const resource of resources) {
    if (resource.seo?.canonicalSlug) paths.add(`/${resource.seo.canonicalSlug}`);
  }
  for (const company of companies) {
    paths.add(`/${company.slug}`);
  }
  for (const { slug, company } of registeredCompanies) {
    if (!company) continue;
    paths.add(`/${slug}`);
    paths.add(`/${company.slug}`);
  }
  for (const category of categories) paths.add(`/glossary/${category}`);

  return Array.from(paths).filter(path => !isRemovedJobPath(path) && !isExpiredJobPath(path));
}
