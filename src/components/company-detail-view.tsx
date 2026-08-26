import { getCompanyBySlug } from '@/lib/companies';
import { resolveCompanyLogo, getCompanyFaviconUrl } from '@/lib/company-logo';
import { CompanyLogo } from '@/components/company-logo';
import { Badge } from '@/components/ui/badge';
import { Building2, Briefcase, ExternalLink, Calendar, MapPin } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { JobPosting, Organization, WithContext } from 'schema-dts';
import { CompanyViewTracker } from '@/components/tracking/company-view-tracker';
import { CompanyApplyButton } from '@/components/tracking/company-apply-button';
import { OutboundLink } from '@/components/tracking/outbound-link';

export async function CompanyDetailView({ slug }: { slug: string }) {
  const company = await getCompanyBySlug(slug);

  if (!company) {
    notFound();
  }

  // Override display name when the company website belongs to a known brand alias
  const displayName = (() => {
    try {
      if (company.website) {
        const host = new URL(company.website.startsWith('http') ? company.website : `https://${company.website}`).hostname;
        if (host.includes('offchainlabs.com')) return 'Offchain Labs';
      }
    } catch { /* ignore */ }
    return company.name;
  })();

  const logoSrc = resolveCompanyLogo(company.slug);
  const faviconUrl = getCompanyFaviconUrl(company.website);

  const organizationSchema: WithContext<Organization> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: displayName,
    ...(company.website && { url: company.website }),
    ...(company.description && { description: company.description }),
    ...(company.founded && { foundingDate: String(company.founded) }),
  };

  const jobPostingsSchema: WithContext<JobPosting>[] = company.jobs.slice(0, 10).map(job => ({
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: `${job.title} at ${displayName}`,
    datePosted: new Date(job.date).toISOString(),
    hiringOrganization: {
      '@type': 'Organization',
      name: displayName,
      ...(company.website && { url: company.website }),
    },
    employmentType: 'FULL_TIME',
    jobLocation: {
      '@type': 'Place',
      address: { '@type': 'PostalAddress', addressLocality: company.headquarters || 'Remote' }
    },
    url: job.link,
    validThrough: new Date(new Date(job.date).setDate(new Date(job.date).getDate() + 30)).toISOString(),
  }));

  const categorizeJob = (title: string): string => {
    const lower = title.toLowerCase();
    if (lower.includes('engineer') || lower.includes('developer') || lower.includes('software')) return 'Engineering';
    if (lower.includes('marketing') || lower.includes('growth')) return 'Marketing';
    if (lower.includes('product') || lower.includes('manager')) return 'Product';
    if (lower.includes('design')) return 'Design';
    if (lower.includes('sales') || lower.includes('business development')) return 'Sales';
    if (lower.includes('analyst') || lower.includes('data')) return 'Data';
    return 'Other';
  };

  const jobsByCategory = company.jobs.reduce((acc, job) => {
    const category = categorizeJob(job.title);
    if (!acc[category]) acc[category] = [];
    acc[category].push(job);
    return acc;
  }, {} as Record<string, typeof company.jobs>);

  return (
    <>
      <CompanyViewTracker slug={company.slug} name={displayName} jobCount={company.jobCount} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      {jobPostingsSchema.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <div className="flex flex-col min-h-screen">
        <main className="flex-grow">
          <div className="container mx-auto px-4 page-section md:py-12 max-w-6xl">
            {/* Breadcrumbs */}
            <nav className="text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-primary">Home</Link>
              {' / '}
              <Link href="/companies" className="hover:text-primary">Companies</Link>
              {' / '}
              <span className="text-foreground">{displayName}</span>
            </nav>

            {/* Company Header */}
            <header className="mb-8 border border-border/60 bg-muted/10 rounded-2xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                <div className="relative h-20 w-20 flex items-center justify-center p-3 bg-background rounded-2xl shadow-sm border border-border/80 shrink-0">
                  <CompanyLogo logoSrc={logoSrc} faviconUrl={faviconUrl} name={displayName} />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                    {displayName} Careers
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-3">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Briefcase className="h-4 w-4" />
                      {company.jobCount} Active Role{company.jobCount !== 1 ? 's' : ''}
                    </span>
                    {company.website && (
                      <OutboundLink
                        href={company.website}
                        label={`${displayName} website`}
                        className="flex items-center gap-1.5 text-primary hover:underline font-medium"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Website
                      </OutboundLink>
                    )}
                  </div>
                </div>
              </div>
            </header>

            {/* About Card */}
            {company.about && (
              <div className="border rounded-lg p-5 mb-8 bg-muted/30">
                <div
                  className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-muted-foreground prose-headings:text-foreground prose-headings:text-lg prose-headings:font-semibold prose-headings:mt-6 prose-headings:mb-3 prose-p:leading-relaxed prose-p:mb-3 prose-li:leading-relaxed prose-strong:text-foreground prose-a:text-primary"
                  dangerouslySetInnerHTML={{ __html: company.about }}
                />
              </div>
            )}

            {/* Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 border rounded-lg p-5">
              <div className="min-w-0">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active Roles</div>
                <div className="text-base font-bold mt-0.5 truncate">{company.jobCount}</div>
              </div>
              {company.headquarters && (
                <div className="min-w-0 overflow-hidden">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">HQ</div>
                  <div className="text-base font-bold mt-0.5 flex items-center gap-1 min-w-0">
                    <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="truncate">{company.headquarters}</span>
                  </div>
                </div>
              )}
              {company.category && (
                <div className="min-w-0">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</div>
                  <div className="text-base font-bold mt-0.5 truncate">{company.category}</div>
                </div>
              )}
              {company.founded && (
                <div className="min-w-0">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Founded</div>
                  <div className="text-base font-bold mt-0.5 flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                    {company.founded}
                  </div>
                </div>
              )}
            </div>

            {/* Department breakdown */}
            {Object.keys(jobsByCategory).length > 1 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {Object.entries(jobsByCategory)
                  .sort(([, a], [, b]) => b.length - a.length)
                  .map(([category, jobs]) => (
                    <Badge key={category} variant="secondary" className="text-xs">
                      {category}: {jobs.length}
                    </Badge>
                  ))}
              </div>
            )}

            {/* Open Roles Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Open Roles</h2>
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                {company.jobCount} Job{company.jobCount !== 1 ? 's' : ''} Found
              </span>
            </div>

            {/* 2-Column Job Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {company.jobs.map((job) => (
                <div key={job.id} className="border rounded-lg p-4 hover:bg-muted/40 transition-colors flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="bg-primary/10 p-2 rounded-md shrink-0 mt-0.5">
                      <Briefcase className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{job.title}</div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <span>{company.name}</span>
                        <span aria-hidden="true">-</span>
                        <span>{new Date(job.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>
                  <CompanyApplyButton
                    jobId={job.id}
                    jobTitle={job.title}
                    companyName={company.name}
                    jobUrl={job.link}
                  />
                </div>
              ))}
            </div>

          </div>
        </main>
      </div>
    </>
  );
}
