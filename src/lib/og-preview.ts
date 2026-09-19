import { getArticle, getAllArticles } from '@/lib/articles';
import { buildArticlePageMeta } from '@/lib/article-og-meta';
import { buildUniqueJobMetaDescription, resolveJobSlug, getAllJobsWithSlugs } from '@/lib/job-guides';
import { getTerm, getAllTerms } from '@/lib/glossary';
import { getResourceByCanonicalSlug, getAllResourcePages } from '@/lib/pseo';
import {
  buildJobOgImageUrl,
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
import { getCompanies } from '@/lib/companies';
import { getCompanySlug } from '@/lib/job-slugs';

const SITE_NAME = 'Hashtag Web3';

export type OgPreviewMeta = {
  title: string;
  description: string;
  ogImageUrl: string;
  canonicalUrl: string;
};

/** CDN path for a crawler HTML shell, e.g. `/` → `/preview/index.html`. */
export function previewAssetPath(contentPath: string): string {
  const normalized = contentPath.replace(/\/+$/, '') || '/';
  if (normalized === '/') return '/preview/index.html';
  return `/preview${normalized}.html`;
}

export function buildOgPreviewHtml(meta: OgPreviewMeta): string {
  const ogImageType = eventOgImageMimeType(meta.ogImageUrl);
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
<meta property="og:image:width" content="1200"/>
<meta property="og:image:height" content="630"/>
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

export async function resolveOgPreviewMeta(path: string): Promise<OgPreviewMeta> {
  const canonicalUrl = `${SITE_URL}${path}`;

  if (path.startsWith('/blog/')) {
    const slug = path.replace('/blog/', '');
    const title = slug.split('-').map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
    return {
      title: `${title} | ${SITE_NAME}`,
      description: 'Practical insights for Web3 builders and professionals. Read on Hashtag Web3.',
      ogImageUrl: STATIC_OG.blog,
      canonicalUrl,
    };
  }

  if (path.startsWith('/glossary/')) {
    const slug = path.replace('/glossary/', '');
    const term = slug.split('-').map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
    return {
      title: `${term} | Blockchain Glossary | ${SITE_NAME}`,
      description: `Learn what ${term} means in Web3, blockchain, and crypto.`,
      ogImageUrl: STATIC_OG.default,
      canonicalUrl,
    };
  }

  if (path.startsWith('/jobs/') && path !== '/jobs') {
    const slug = path.replace('/jobs/', '');
    const jobMeta = await resolveJobMetadata(slug);
    if (jobMeta) return jobMeta;
    const parts = slug.replace(/^job[a-z0-9]{4,6}$/, '').split('-').filter(Boolean);
    const readableTitle = parts.length > 0
      ? parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ')
      : 'Web3 Job Opening';
    return {
      title: `${readableTitle} | ${SITE_NAME}`,
      description: `Apply for ${readableTitle} on Hashtag Web3 — the leading Web3 job board.`,
      ogImageUrl: STATIC_OG.jobs,
      canonicalUrl: `${SITE_URL}/${slug}`,
    };
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
      ogImageUrl: STATIC_OG.default,
    },
    '/companies': {
      title: `Web3 Companies Hiring | ${SITE_NAME}`,
      description: 'Browse 200+ Web3 companies actively hiring — from DeFi protocols to blockchain infrastructure.',
      ogImageUrl: STATIC_OG.companies,
    },
    '/glossary': {
      title: `Blockchain Glossary | ${SITE_NAME}`,
      description: '200+ blockchain and Web3 terms explained in plain English.',
      ogImageUrl: STATIC_OG.default,
    },
    '/salary-calculator': {
      title: `Web3 Salary Calculator | ${SITE_NAME}`,
      description: 'Find out what you should be earning in Web3. Compare salaries by role, skills, and location.',
      ogImageUrl: STATIC_OG.tools,
    },
    '/events': {
      title: `Web3 Events & Conferences | ${SITE_NAME}`,
      description: 'Upcoming Web3 conferences, hackathons, and crypto summits worldwide.',
      ogImageUrl: STATIC_OG.default,
    },
    '/news': {
      title: `Web3 & Crypto News | ${SITE_NAME}`,
      description: 'Latest Web3 and crypto news for blockchain professionals.',
      ogImageUrl: STATIC_OG.news,
    },
    '/developers': {
      title: `Hashtag Web3 Developer Portal | ${SITE_NAME}`,
      description: 'Static catalogs and developer resources for Hashtag Web3.',
      ogImageUrl: STATIC_OG.default,
    },
    '/contact': {
      title: `Contact Hashtag Web3 | ${SITE_NAME}`,
      description: 'Direct communication channels for partnerships, hiring campaigns, and community support.',
      ogImageUrl: STATIC_OG.default,
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
    '/digital-nomad-visas': {
      title: `Visas for Digital Nomads | ${SITE_NAME}`,
      description: 'Browse digital-nomad visa requirements for remote Web3 workers.',
      ogImageUrl: STATIC_OG.tools,
    },
    '/web3-hiring-report': {
      title: `Hiring Report 2026 | ${SITE_NAME}`,
      description: 'Data-driven insights based on active Web3 job listings, including hiring velocity, roles, salary benchmarks, and remote work patterns.',
      ogImageUrl: STATIC_OG.report,
    },
    '/learn': {
      title: `Learn Web3 | ${SITE_NAME}`,
      description: 'Free structured courses for Web3 builders.',
      ogImageUrl: STATIC_OG.blog,
    },
  };

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

    const jobMeta = await resolveJobMetadata(slug);
    if (jobMeta) return jobMeta;

    const term = await getTerm(slug);
    if (term) {
      return {
        title: `${term.term} - Web3 Glossary`,
        description: `Learn what ${term.term} means in Web3, blockchain, and crypto.`,
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

    try {
      const companies = await getCompanies();
      const company = companies.find((c) => getCompanySlug(c.name) === slug);
      if (company) {
        return {
          title: `${company.name} Jobs | ${SITE_NAME}`,
          description: `Open Web3 roles at ${company.name} on Hashtag Web3.`,
          ogImageUrl: STATIC_OG.companies,
          canonicalUrl: `${SITE_URL}/${slug}`,
        };
      }
    } catch {
      // ignore
    }

    const article = await getArticle(slug);
    if (article) {
      return buildArticlePageMeta(article);
    }
  }

  return {
    title: `${SITE_NAME} | Web3 Jobs & Crypto Careers`,
    description: 'Find verified Web3 jobs, crypto careers, salary data, and practical guides.',
    ogImageUrl: buildDefaultOgImageUrl(),
    canonicalUrl,
  };
}

/** Paths to bake into public/preview for link-preview crawlers. */
export async function collectOgPreviewPaths(): Promise<string[]> {
  const paths = new Set<string>([
    '/',
    '/jobs',
    '/blog',
    '/news',
    '/events',
    '/glossary',
    '/companies',
    '/community',
    '/developers',
    '/contact',
    '/learn',
    '/salary-calculator',
    '/jd-builder',
    '/invoice-generator',
    '/resume-builder',
    '/remote-work-checklist',
    '/digital-nomad-visas',
    '/web3-hiring-report',
  ]);

  const [jobs, articles, events, terms, resources, companies] = await Promise.all([
    getAllJobsWithSlugs(),
    getAllArticles(),
    getEvents(),
    getAllTerms(),
    Promise.resolve(getAllResourcePages()),
    getCompanies(),
  ]);

  for (const { slug } of jobs) {
    if (slug) paths.add(`/${slug}`);
  }
  for (const article of articles) {
    if (article.slug) paths.add(`/${article.slug}`);
  }
  for (const event of events) {
    paths.add(`/${getEventSlug(event)}`);
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
    paths.add(`/${getCompanySlug(company.name)}`);
  }

  return Array.from(paths);
}
