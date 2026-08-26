'use client';

import Link from 'next/link';
import type { Job, Company } from '@/types';
import { getJobSlug } from '@/lib/job-slugs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  ExternalLink, 
  ArrowLeft, 
  Clock, 
  ArrowRight
} from 'lucide-react';
import { JobApplicationButton } from '@/components/tracking/job-application-button';

interface JobDetailViewProps {
  job: Job;
  contentHtml: string;
  company: Partial<Company> | null;
  relatedJobs: Job[];
  siteUrl: string;
  logoSrc?: string | null;
}

export function JobDetailView({
  job,
  contentHtml,
  company,
  relatedJobs,
  siteUrl,
  logoSrc = null,
}: JobDetailViewProps) {
  const slug = getJobSlug(job);
  const companySlug = (job.company || 'web3')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const effectiveLogoSrc = logoSrc || `https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${companySlug.replace(/-/g, '')}.com&size=128`;

  const canonicalUrl = `${siteUrl}/${slug}`;

  const daysAgo = Math.max(0, Math.floor((Date.now() - new Date(job.date).getTime()) / (1000 * 60 * 60 * 24)));
  const relativeDate = daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo} days ago`;

  const absoluteLogoUrl = effectiveLogoSrc.startsWith('http')
    ? effectiveLogoSrc
    : `${siteUrl}${effectiveLogoSrc.startsWith('/') ? '' : '/'}${effectiveLogoSrc}`;

  const lowerTitle = (job.title || '').toLowerCase();
  let employmentType = 'FULL_TIME';
  if (lowerTitle.includes('part-time') || lowerTitle.includes('part time')) {
    employmentType = 'PART_TIME';
  } else if (lowerTitle.includes('contract') || lowerTitle.includes('freelance')) {
    employmentType = 'CONTRACTOR';
  } else if (lowerTitle.includes('intern')) {
    employmentType = 'INTERN';
  }

  const jobPostingSchema = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: contentHtml,
    datePosted: new Date(job.date).toISOString(),
    validThrough: new Date(new Date(job.date).getTime() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    employmentType: employmentType,
    hiringOrganization: {
      '@type': 'Organization',
      name: job.company,
      sameAs: company?.website || `${siteUrl}/${companySlug}`,
      logo: absoluteLogoUrl,
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Remote',
        addressCountry: 'Worldwide',
      },
    },
    applicantLocationRequirements: {
      '@type': 'Country',
      name: 'Worldwide',
    },
    jobLocationType: 'TELECOMMUTE',
    url: canonicalUrl,
    directApply: true,
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Jobs',
        item: `${siteUrl}/jobs`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: job.company,
        item: `${siteUrl}/${companySlug}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: job.title,
        item: canonicalUrl,
      },
    ],
  };

  return (
    <article className="w-full">
      {/* JSON-LD Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="container mx-auto page-section px-4">
        <div className="site-container">
        
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center space-x-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <span>/</span>
          <Link href="/jobs" className="hover:text-foreground transition-colors">Jobs</Link>
          <span>/</span>
          <Link href={`/${companySlug}`} className="hover:text-foreground transition-colors">{job.company}</Link>
          <span>/</span>
          <span className="text-foreground truncate max-w-[200px] sm:max-w-xs">{job.title}</span>
        </nav>

        {/* Job Hero Header Card */}
        <div className="bg-card border border-border/70 rounded-xl p-6 sm:p-8 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            
            <div className="flex flex-col sm:flex-row items-start gap-5 flex-1 min-w-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-border/80 bg-white flex items-center justify-center p-2 shrink-0 shadow-sm">
                <img 
                  src={effectiveLogoSrc} 
                  alt={`${job.company} logo`} 
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.src = `https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${companySlug.replace(/-/g, '')}.com&size=128`;
                  }}
                />
              </div>
              
              <div className="space-y-4 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="text-muted-foreground">
                    <Clock className="w-3.5 h-3.5 mr-1" /> Posted {relativeDate}
                  </Badge>
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground leading-tight">
                  {job.title}
                </h1>

                <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-muted-foreground pt-1">
                  <Link 
                    href={`/${companySlug}`}
                    className="flex items-center gap-2 font-semibold text-foreground hover:text-primary transition-colors"
                  >
                    {job.company}
                  </Link>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    Remote / Global
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row md:flex-col gap-3 min-w-[180px] shrink-0">
              <JobApplicationButton
                jobId={job.id}
                jobTitle={job.title}
                companyName={job.company}
                jobUrl={job.link}
                source={job.source}
                date={job.date}
              >
                <Button size="lg" className="w-full text-base font-semibold shadow-sm hover:shadow transition-all">
                  Apply <ExternalLink className="ml-2 w-4 h-4" />
                </Button>
              </JobApplicationButton>

              <Button variant="outline" size="lg" asChild className="w-full text-base font-semibold">
                <Link href={`/${companySlug}`}>
                  More roles by {job.company}
                </Link>
              </Button>
            </div>

          </div>
        </div>

        {/* Main Layout: Single Column Centered */}
        <div className="space-y-8">
          
          <div 
            className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary prose-ul:my-4 prose-li:my-1 text-foreground/90 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />

          {/* Centered Apply Button */}
          <div className="flex justify-center pt-8">
            <JobApplicationButton
              jobId={job.id}
              jobTitle={job.title}
              companyName={job.company}
              jobUrl={job.link}
              source={job.source}
              date={job.date}
            >
              <Button size="lg" className="font-semibold shadow min-w-[200px] text-base py-6">
                Apply <ExternalLink className="ml-2 w-4 h-4" />
              </Button>
            </JobApplicationButton>
          </div>

        </div>

        {/* Bottom Back Button */}
        <div className="mt-12 pt-8 border-t border-border/60 flex items-center justify-between">
          <Button variant="outline" asChild>
            <Link href="/jobs" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to All Jobs
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/${companySlug}`}>
              All {job.company} Openings <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>

      </div>
    </div>
  </article>
);
}
