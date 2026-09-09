import { NextRequest, NextResponse } from 'next/server';
import { buildUniqueJobMetaDescription, resolveJobSlug } from '@/lib/job-guides';
import { buildJobOgImageUrl, SITE_URL } from '@/lib/job-og';

export const runtime = 'nodejs';

const SITE_NAME = 'Hashtag Web3';
const SOCIAL_SUFFIXES = new Set(['li', 'linkedin', 'x', 'tw', 'twitter', 'th', 'threads', 'fb', 'facebook', 'bsky', 'bluesky', 'fc', 'warp', 'farcaster', 'rd', 'reddit', 'ig', 'insta', 'instagram']);

/**
 * Returns a minimal HTML shell (~2KB) containing only OG/Twitter meta tags.
 *
 * Social link-preview crawlers (LinkedIn, Slack, Discord, etc.) only need the
 * <head> meta tags to render a preview card. Our full Next.js pages are 265–511 KB
 * due to embedded RSC payloads — LinkedIn's scraper has a ~120 KB limit and fails
 * with "Scraping error" on anything larger.
 *
 * The middleware rewrites requests from detected link-preview bots to this endpoint,
 * passing the original path as ?path=.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sourcePath = searchParams.get('path') || request.headers.get('x-og-source-path') || '/';
  const path = stripSocialSuffix(sourcePath);

  const { title, description, ogImageUrl, canonicalUrl } = await resolveMetadata(path);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>${escHtml(title)}</title>
<meta name="description" content="${escHtml(description)}"/>
<link rel="canonical" href="${escHtml(canonicalUrl)}"/>
<meta property="og:type" content="website"/>
<meta property="og:site_name" content="${escHtml(SITE_NAME)}"/>
<meta property="og:title" content="${escHtml(title)}"/>
<meta property="og:description" content="${escHtml(description)}"/>
<meta property="og:url" content="${escHtml(canonicalUrl)}"/>
<meta property="og:image" content="${escHtml(ogImageUrl)}"/>
<meta property="og:image:width" content="1200"/>
<meta property="og:image:height" content="630"/>
<meta property="og:image:type" content="image/png"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:site" content="@hashtag_web3"/>
<meta name="twitter:title" content="${escHtml(title)}"/>
<meta name="twitter:description" content="${escHtml(description)}"/>
<meta name="twitter:image" content="${escHtml(ogImageUrl)}"/>
</head>
<body></body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      // Do not let an in-flight deployment cache a stale job shell at our edge.
      // Platforms keep their own preview cache; our readiness gate warms the
      // response immediately before publishing.
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'X-Robots-Tag': 'noindex',
    },
  });
}

function escHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

interface PageMeta {
  title: string;
  description: string;
  ogImageUrl: string;
  canonicalUrl: string;
}

function stripSocialSuffix(path: string): string {
  const parts = path.split('/').filter(Boolean);
  const last = parts[parts.length - 1]?.toLowerCase();
  if (last && SOCIAL_SUFFIXES.has(last)) {
    parts.pop();
  }
  return parts.length ? `/${parts.join('/')}` : '/';
}

async function resolveJobMetadata(slug: string): Promise<PageMeta | null> {
  const resolution = await resolveJobSlug(slug);
  const job = resolution.job;
  if (!job || !resolution.canonicalSlug) return null;

  const title = `${job.title} at ${job.company}`;
  const description = buildUniqueJobMetaDescription(job);
  const ogImageUrl = buildJobOgImageUrl(job);

  return {
    title,
    description,
    ogImageUrl,
    canonicalUrl: `${SITE_URL}/${resolution.canonicalSlug}`,
  };
}

async function resolveMetadata(path: string): Promise<PageMeta> {
  const canonicalUrl = `${SITE_URL}${path}`;

  // ── Blog articles: /blog/<slug> ───────────────────────────────────────────
  if (path.startsWith('/blog/')) {
    const slug = path.replace('/blog/', '');
    const title = slug.split('-').map((p: string) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
    return {
      title: `${title} | ${SITE_NAME}`,
      description: 'Practical insights for Web3 builders and professionals. Read on Hashtag Web3.',
      ogImageUrl: `${SITE_URL}/api/og?type=article&title=${encodeURIComponent(title)}`,
      canonicalUrl,
    };
  }

  // ── Glossary terms ────────────────────────────────────────────────────────
  if (path.startsWith('/glossary/')) {
    const slug = path.replace('/glossary/', '');
    const term = slug.split('-').map((p: string) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
    return {
      title: `${term} | Blockchain Glossary | ${SITE_NAME}`,
      description: `Learn what ${term} means in Web3, blockchain, and crypto.`,
      ogImageUrl: `${SITE_URL}/api/og?type=default&title=${encodeURIComponent(term)}`,
      canonicalUrl,
    };
  }

  // ── Job detail pages: /jobs/<slug> or /<jobslug> ──────────────────────────
  if (path.startsWith('/jobs/') && path !== '/jobs') {
    const slug = path.replace('/jobs/', '');
    const jobMeta = await resolveJobMetadata(slug);
    if (jobMeta) return jobMeta;
    const parts = slug.replace(/^job[a-z0-9]{4,6}$/, '').split('-').filter(Boolean);
    const readableTitle = parts.length > 0
      ? parts.map((p: string) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ')
      : 'Web3 Job Opening';
    return {
      title: `${readableTitle} | ${SITE_NAME}`,
      description: `Apply for ${readableTitle} on Hashtag Web3 — the leading Web3 job board.`,
      ogImageUrl: `${SITE_URL}/api/og?type=job&title=${encodeURIComponent(readableTitle)}`,
      canonicalUrl: `${SITE_URL}/${slug}`,
    };
  }

  // ── Static known pages ────────────────────────────────────────────────────
  const PAGE_META: Record<string, Omit<PageMeta, 'canonicalUrl'>> = {
    '/': {
      title: `Web3 Jobs and Crypto Careers | ${SITE_NAME}`,
      description: 'Find verified Web3 jobs, crypto careers, salary data, and practical guides. Updated daily for builders, marketers, and product teams.',
      ogImageUrl: `${SITE_URL}/opengraph-image.png`,
    },
    '/jobs': {
      title: `Web3 Jobs & Crypto Careers | ${SITE_NAME}`,
      description: 'Find the best remote Web3 jobs. Discover verified opportunities in Solidity, blockchain development, DeFi, DAOs, and crypto marketing.',
      ogImageUrl: `${SITE_URL}/api/og?type=default&title=Remote%20Web3%20Jobs`,
    },
    '/blog': {
      title: `Web3 Career Playbook | ${SITE_NAME}`,
      description: 'Practical guides, salary data, and career advice for Web3 professionals.',
      ogImageUrl: `${SITE_URL}/api/og?type=default&title=Web3%20Career%20Playbook`,
    },
    '/community': {
      title: `Web3 Community | ${SITE_NAME}`,
      description: 'Join 60,000+ Web3 builders and professionals across Telegram, Discord, and LinkedIn.',
      ogImageUrl: `${SITE_URL}/api/og?type=default&title=Web3%20Community`,
    },
    '/companies': {
      title: `Web3 Companies Hiring | ${SITE_NAME}`,
      description: 'Browse 200+ Web3 companies actively hiring — from DeFi protocols to blockchain infrastructure.',
      ogImageUrl: `${SITE_URL}/api/og?type=default&title=Web3%20Companies%20Hiring`,
    },
    '/glossary': {
      title: `Blockchain Glossary | ${SITE_NAME}`,
      description: '200+ blockchain and Web3 terms explained in plain English.',
      ogImageUrl: `${SITE_URL}/api/og?type=default&title=Blockchain%20Glossary`,
    },
    '/salary-calculator': {
      title: `Web3 Salary Calculator | ${SITE_NAME}`,
      description: 'Find out what you should be earning in Web3. Compare salaries by role, skills, and location.',
      ogImageUrl: `${SITE_URL}/api/og?type=default&title=Web3%20Salary%20Calculator`,
    },
    '/events': {
      title: `Web3 Events & Conferences | ${SITE_NAME}`,
      description: 'Upcoming Web3 conferences, hackathons, and crypto summits worldwide.',
      ogImageUrl: `${SITE_URL}/api/og?type=default&title=Web3%20Events`,
    },
    '/news': {
      title: `Web3 & Crypto News | ${SITE_NAME}`,
      description: 'Latest Web3 and crypto news for blockchain professionals.',
      ogImageUrl: `${SITE_URL}/api/og?type=default&title=Web3%20%26%20Crypto%20News`,
    },
  };

  const meta = PAGE_META[path];
  if (meta) {
    return { ...meta, canonicalUrl };
  }

  // Root-level job slugs are the URLs used by the social poster. Resolve the
  // actual record so a crawler never receives a generic image for a job URL.
  if (/^\/[^/]+$/.test(path)) {
    const jobMeta = await resolveJobMetadata(path.slice(1));
    if (jobMeta) return jobMeta;
  }

  // Fallback
  return {
    title: `${SITE_NAME} | Web3 Jobs & Crypto Careers`,
    description: 'Find verified Web3 jobs, crypto careers, salary data, and practical guides.',
    ogImageUrl: `${SITE_URL}/opengraph-image.png`,
    canonicalUrl,
  };
}
