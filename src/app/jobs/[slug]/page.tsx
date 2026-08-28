import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { JobDetailView } from '@/components/job-detail-view';
import { getCompanyBySlug } from '@/lib/companies';
import { getCompanyFaviconUrl, resolveCompanyLogo } from '@/lib/company-logo';
import {
  buildSynthesizedJobContent,
  buildUniqueJobMetaDescription,
  getAllJobsWithSlugs,
  getJobBySlug,
  getJobSlug,
  hasSubstantialJobContent,
} from '@/lib/job-guides';
import { getCompanySlug } from '@/lib/job-slugs';

interface JobPageProps {
  params: {
    slug: string;
  };
}

const SITE_URL = 'https://hashtagweb3.com';

export const dynamicParams = true;
export const revalidate = 3600;

export async function generateStaticParams() {
  // Jobs are now at /<slug> (root), not /jobs/<slug>. /jobs/:slug redirects via next.config.
  return [];
}

export async function generateMetadata({ params }: JobPageProps): Promise<Metadata> {
  const job = await getJobBySlug(params.slug);
  if (!job) {
    notFound();
  }

  const slug = getJobSlug(job);
  const canonicalUrl = `${SITE_URL}/${slug}`;
  const title = `${job.title} at ${job.company}`;
  const description = buildUniqueJobMetaDescription(job);
  const ogImageUrl = `${SITE_URL}/api/og?type=default&title=${encodeURIComponent(title)}`;
  const hasVerifiedContent = hasSubstantialJobContent(job);

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    robots: hasVerifiedContent ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: 'website',
      siteName: 'Hashtag Web3',
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function JobPage({ params }: JobPageProps) {
  const job = await getJobBySlug(params.slug);
  if (!job) {
    notFound();
  }

  const companySlug = getCompanySlug(job.company);
  const company = await getCompanyBySlug(companySlug);
  const contentHtml = buildSynthesizedJobContent(job);
  const logoSrc = resolveCompanyLogo(companySlug);
  const faviconUrl = getCompanyFaviconUrl(company?.website);

  return (
    <JobDetailView
      job={job}
      contentHtml={contentHtml}
      company={company}
      siteUrl={SITE_URL}
      logoSrc={logoSrc}
      faviconUrl={faviconUrl}
    />
  );
}
