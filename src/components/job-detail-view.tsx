'use client';

import Link from 'next/link';
import type { Job, Company } from '@/types';
import { getJobSlug } from '@/lib/job-slugs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  ExternalLink, 
  Building2, 
  ArrowLeft, 
  Sparkles, 
  Clock, 
  Calculator,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { JobApplicationButton } from '@/components/tracking/job-application-button';

interface JobDetailViewProps {
  job: Job;
  contentHtml: string;
  company: Partial<Company> | null;
  relatedJobs: Job[];
  siteUrl: string;
}

export function JobDetailView({
  job,
  contentHtml,
  company,
  relatedJobs,
  siteUrl,
}: JobDetailViewProps) {
  const slug = getJobSlug(job);
  const companySlug = (job.company || 'web3')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const canonicalUrl = `${siteUrl}/${slug}`;
  const postedDateStr = new Date(job.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const daysAgo = Math.max(0, Math.floor((Date.now() - new Date(job.date).getTime()) / (1000 * 60 * 60 * 24)));
  const relativeDate = daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo} days ago`;

  const jobPostingSchema = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: contentHtml,
    datePosted: new Date(job.date).toISOString(),
    validThrough: new Date(new Date(job.date).getTime() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    employmentType: 'FULL_TIME',
    hiringOrganization: {
      '@type': 'Organization',
      name: job.company,
      sameAs: company?.website || `${siteUrl}/companies/${companySlug}`,
      logo: `${siteUrl}/logo/companies/${companySlug}.png`,
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
    url: job.link,
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
        item: `${siteUrl}/companies/${companySlug}`,
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

      <div className="site-container max-w-5xl py-6 md:py-10">
        
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center space-x-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <span>/</span>
          <Link href="/jobs" className="hover:text-foreground transition-colors">Jobs</Link>
          <span>/</span>
          <Link href={`/companies/${companySlug}`} className="hover:text-foreground transition-colors">{job.company}</Link>
          <span>/</span>
          <span className="text-foreground truncate max-w-[200px] sm:max-w-xs">{job.title}</span>
        </nav>

        {/* Job Hero Header Card */}
        <div className="bg-card border border-border/70 rounded-xl p-6 sm:p-8 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            
            <div className="space-y-4 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="font-medium bg-primary/10 text-primary border-primary/20">
                  <Sparkles className="w-3.5 h-3.5 mr-1" /> Verified Web3 Opening
                </Badge>
                <Badge variant="outline" className="text-muted-foreground">
                  <Clock className="w-3.5 h-3.5 mr-1" /> Posted {relativeDate}
                </Badge>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground leading-tight">
                {job.title}
              </h1>

              <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-muted-foreground pt-1">
                <Link 
                  href={`/companies/${companySlug}`}
                  className="flex items-center gap-1.5 font-semibold text-foreground hover:text-primary transition-colors"
                >
                  <Building2 className="w-4 h-4 text-primary" />
                  {job.company}
                </Link>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  Remote / Global
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

              <Button variant="outline" size="sm" asChild className="w-full text-xs">
                <Link href={`/companies/${companySlug}`}>
                  View {job.company}
                </Link>
              </Button>
            </div>

          </div>
        </div>

        {/* Main Layout: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Content Column: Authentic Curled Job Description */}
          <div className="lg:col-span-3 space-y-8">
            <div 
              className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary prose-ul:my-4 prose-li:my-1 text-foreground/90 leading-relaxed bg-card/40 border border-border/60 rounded-xl p-6 sm:p-8"
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />

            {/* Apply Bottom Banner */}
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 mt-8">
              <div className="space-y-1 text-center sm:text-left">
                <h3 className="text-lg sm:text-xl font-bold text-foreground">Interested in this role at {job.company}?</h3>
                <p className="text-sm text-muted-foreground">Submit your official application on the hiring portal.</p>
              </div>
              <JobApplicationButton
                jobId={job.id}
                jobTitle={job.title}
                companyName={job.company}
                jobUrl={job.link}
                source={job.source}
                date={job.date}
              >
                <Button size="lg" className="font-semibold shadow min-w-[160px]">
                  Apply <ExternalLink className="ml-2 w-4 h-4" />
                </Button>
              </JobApplicationButton>
            </div>

          </div>

          {/* Right Sidebar Column */}
          <div className="space-y-6">
            
            {/* Quick Box */}
            <Card className="sticky top-24 shadow-sm border-border/70">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-primary" /> Verified Job
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="space-y-2 border-b border-border/40 pb-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Position:</span>
                    <span className="font-medium text-foreground text-right truncate max-w-[160px]">{job.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Company:</span>
                    <span className="font-medium text-foreground">{job.company}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Posted Date:</span>
                    <span className="font-medium text-foreground">{postedDateStr}</span>
                  </div>
                </div>

                <JobApplicationButton
                  jobId={job.id}
                  jobTitle={job.title}
                  companyName={job.company}
                  jobUrl={job.link}
                  source={job.source}
                  date={job.date}
                >
                  <Button className="w-full text-base font-semibold py-5">
                    Apply <ExternalLink className="ml-2 w-4 h-4" />
                  </Button>
                </JobApplicationButton>
              </CardContent>
            </Card>

            {/* Related Jobs */}
            {relatedJobs.length > 0 && (
              <Card className="shadow-sm border-border/70">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold">Similar Web3 Jobs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 p-4 pt-0">
                  {relatedJobs.map((rJob) => {
                    const rSlug = getJobSlug(rJob);
                    return (
                      <Link
                        key={rJob.id}
                        href={`/${rSlug}`}
                        className="block p-3 rounded-lg bg-muted/40 hover:bg-muted/80 transition-colors border border-transparent hover:border-border/50"
                      >
                        <p className="font-semibold text-sm text-foreground truncate">{rJob.title}</p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                          <span>{rJob.company}</span>
                          <span className="text-primary font-medium flex items-center">View <ArrowRight className="w-3 h-3 ml-0.5" /></span>
                        </div>
                      </Link>
                    );
                  })}
                </CardContent>
              </Card>
            )}

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
            <Link href={`/companies/${companySlug}`}>
              All {job.company} Openings <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>

      </div>
    </article>
  );
}
