import { Header } from '@/components/header';
import { getCompanyBySlug, getCompanies } from '@/lib/companies';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Briefcase, ExternalLink, Calendar, MapPin, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import type { JobPosting, Organization, WithContext } from 'schema-dts';
import { CompanyViewTracker } from '@/components/tracking/company-view-tracker';
import { CompanyApplyButton } from '@/components/tracking/company-apply-button';
import { OutboundLink } from '@/components/tracking/outbound-link';

export const revalidate = 3600;

export async function generateStaticParams() {
  const companies = await getCompanies();
  return companies.map((company) => ({
    slug: company.slug,
  }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const company = await getCompanyBySlug(params.slug);
  
  if (!company) {
    return { title: 'Company Not Found' };
  }

  const siteUrl = 'https://hashtagweb3.com';
  const ogImageUrl = `${siteUrl}/api/og?type=company&title=${encodeURIComponent(company.name)}&count=${company.jobCount}`;
  const desc = company.description 
    ? `${company.description}. ${company.jobCount} open positions.`
    : `${company.jobCount} open positions at ${company.name}. Browse Web3 and blockchain jobs.`;

  return {
    title: `${company.name} Jobs — ${company.jobCount} Open Positions | Hashtag Web3`,
    description: desc,
    alternates: { canonical: `/companies/${company.slug}` },
    openGraph: {
      title: `${company.name} — ${company.jobCount} Open Positions`,
      description: desc,
      url: `${siteUrl}/companies/${company.slug}`,
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: `${company.name} Jobs` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${company.name} — ${company.jobCount} Open Positions`,
      description: desc,
      images: [ogImageUrl],
    },
  };
}

export default async function CompanyPage({ params }: { params: { slug: string } }) {
  const company = await getCompanyBySlug(params.slug);

  if (!company) {
    notFound();
  }

  const organizationSchema: WithContext<Organization> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: company.name,
    ...(company.website && { url: company.website }),
    ...(company.description && { description: company.description }),
    ...(company.founded && { foundingDate: String(company.founded) }),
  };

  const jobPostingsSchema: WithContext<JobPosting>[] = company.jobs.slice(0, 10).map(job => ({
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: `${job.title} at ${company.name}`,
    datePosted: new Date(job.date).toISOString(),
    hiringOrganization: {
      '@type': 'Organization',
      name: company.name,
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

  // Simple job categorization
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
      <CompanyViewTracker slug={company.slug} name={company.name} jobCount={company.jobCount} />
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
        <Header />
        <main className="flex-grow">
          <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
            {/* Breadcrumbs */}
            <nav className="text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-primary">Home</Link>
              {' / '}
              <Link href="/companies" className="hover:text-primary">Companies</Link>
              {' / '}
              <span className="text-foreground">{company.name}</span>
            </nav>

            {/* Company Header — Compact */}
            <header className="mb-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-primary/10 p-3 rounded-lg shrink-0">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-3xl md:text-4xl font-bold mb-1">{company.name}</h1>
                  {company.description && (
                    <p className="text-muted-foreground">{company.description}</p>
                  )}
                </div>
              </div>

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <Badge variant="default" className="text-sm px-3 py-1">
                  <Briefcase className="h-3.5 w-3.5 mr-1.5" />
                  {company.jobCount} position{company.jobCount !== 1 ? 's' : ''}
                </Badge>
                {company.category && (
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Building2 className="h-3.5 w-3.5" />
                    {company.category}
                  </span>
                )}
                {company.headquarters && (
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    {company.headquarters}
                  </span>
                )}
                {company.founded && (
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    Est. {company.founded}
                  </span>
                )}
                {company.website && (
                  <OutboundLink
                    href={company.website}
                    label={`${company.name} website`}
                    className="flex items-center gap-1.5 text-primary hover:underline"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Website
                  </OutboundLink>
                )}
              </div>
            </header>

            {/* About — Only if content exists, rendered inline */}
            {company.about && (
              <section className="mb-8">
                <div 
                  className="text-sm text-muted-foreground leading-relaxed prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ 
                    __html: company.about
                      .split('\n\n')
                      .slice(0, 2) // Only first 2 paragraphs to keep it minimal
                      .map(para => `<p class="mb-2">${para.replace(/\n/g, '<br />')}</p>`)
                      .join('') 
                  }} 
                />
              </section>
            )}

            {/* Department breakdown — Inline badges */}
            {Object.keys(jobsByCategory).length > 1 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {Object.entries(jobsByCategory)
                  .sort(([, a], [, b]) => b.length - a.length)
                  .map(([category, jobs]) => (
                    <Badge key={category} variant="secondary">
                      {category}: {jobs.length}
                    </Badge>
                  ))}
              </div>
            )}

            {/* Job Listings — Clean table-like layout */}
            <section>
              <h2 className="text-xl font-bold mb-4">
                Open positions
                <span className="text-muted-foreground font-normal ml-2">({company.jobCount})</span>
              </h2>
              <div className="divide-y border rounded-lg overflow-hidden">
                {company.jobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-muted/50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{job.title}</div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        <span>{new Date(job.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        <Badge variant="outline" className="text-xs py-0">{categorizeJob(job.title)}</Badge>
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
            </section>

            {/* Footer note */}
            <p className="text-xs text-muted-foreground mt-6">
              Updated {new Date(company.lastUpdated).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}. 
              Jobs aggregated from {company.name}&apos;s career page.
            </p>
          </div>
        </main>
      </div>
    </>
  );
}
