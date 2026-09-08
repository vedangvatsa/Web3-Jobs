import Link from 'next/link';
import { ArrowRight, Clock, DollarSign, ExternalLink, MapPin } from 'lucide-react';
import type { Company, Job } from '@/types';
import { CompanyLogo } from '@/components/company-logo';
import { JobApplicationButton } from '@/components/tracking/job-application-button';
import { getCompanySlug, getJobSlug } from '@/lib/job-slugs';
import { getJobSalaryInfo } from '@/lib/job-salary';

interface JobDetailViewProps {
  job: Job;
  contentHtml: string;
  company: Partial<Company> | null;
  siteUrl: string;
  logoSrc?: string | null;
  faviconUrl?: string | null;
}

function getPostedLabel(date: string): string | null {
  const postedAt = new Date(date);
  if (Number.isNaN(postedAt.getTime())) return null;

  const daysAgo = Math.max(0, Math.floor((Date.now() - postedAt.getTime()) / 86_400_000));
  if (daysAgo === 0) return 'Posted today';
  if (daysAgo === 1) return 'Posted yesterday';
  return `Posted ${daysAgo} days ago`;
}

/** US state/territory names (lowercased) to ISO subdivision abbreviations. */
const US_STATE_ABBRS: Record<string, string> = {
  alabama: 'AL', alaska: 'AK', arizona: 'AZ', arkansas: 'AR', california: 'CA',
  colorado: 'CO', connecticut: 'CT', delaware: 'DE', 'district of columbia': 'DC',
  florida: 'FL', georgia: 'GA', hawaii: 'HI', idaho: 'ID', illinois: 'IL',
  indiana: 'IN', iowa: 'IA', kansas: 'KS', kentucky: 'KY', louisiana: 'LA',
  maine: 'ME', maryland: 'MD', massachusetts: 'MA', michigan: 'MI', minnesota: 'MN',
  mississippi: 'MS', missouri: 'MO', montana: 'MT', nebraska: 'NE', nevada: 'NV',
  'new hampshire': 'NH', 'new jersey': 'NJ', 'new mexico': 'NM', 'new york': 'NY',
  'north carolina': 'NC', 'north dakota': 'ND', ohio: 'OH', oklahoma: 'OK',
  oregon: 'OR', pennsylvania: 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
  'south dakota': 'SD', tennessee: 'TN', texas: 'TX', utah: 'UT', vermont: 'VT',
  virginia: 'VA', washington: 'WA', 'west virginia': 'WV', wisconsin: 'WI',
  wyoming: 'WY', 'puerto rico': 'PR',
};
const US_STATE_CODES = new Set([...Object.values(US_STATE_ABBRS), 'AA', 'AE', 'AP']);

/** Country names/aliases (lowercased) to ISO 3166-1 alpha-2 codes. */
const COUNTRY_CODES: Record<string, string> = {
  'united states': 'US', 'united states of america': 'US', usa: 'US', us: 'US',
  'united kingdom': 'GB', uk: 'GB', britain: 'GB', england: 'GB', scotland: 'GB', wales: 'GB',
  'united arab emirates': 'AE', uae: 'AE',
  canada: 'CA', germany: 'DE', deutschland: 'DE', france: 'FR', spain: 'ES', españa: 'ES',
  italy: 'IT', italia: 'IT', netherlands: 'NL', holland: 'NL', switzerland: 'CH',
  austria: 'AT', belgium: 'BE', ireland: 'IE', portugal: 'PT', poland: 'PL',
  sweden: 'SE', norway: 'NO', denmark: 'DK', finland: 'FI', greece: 'GR',
  czechia: 'CZ', 'czech republic': 'CZ', hungary: 'HU', romania: 'RO', croatia: 'HR',
  serbia: 'RS', bulgaria: 'BG', ukraine: 'UA', cyprus: 'CY', malta: 'MT',
  estonia: 'EE', latvia: 'LV', lithuania: 'LT', georgia: 'GE', armenia: 'AM',
  turkey: 'TR', türkiye: 'TR', israel: 'IL', japan: 'JP', 'south korea': 'KR',
  korea: 'KR', china: 'CN', india: 'IN', singapore: 'SG', malaysia: 'MY',
  indonesia: 'ID', thailand: 'TH', vietnam: 'VN', philippines: 'PH', taiwan: 'TW',
  'hong kong': 'HK', australia: 'AU', 'new zealand': 'NZ', brazil: 'BR',
  argentina: 'AR', mexico: 'MX', colombia: 'CO', chile: 'CL', nigeria: 'NG',
  kenya: 'KE', 'south africa': 'ZA', egypt: 'EG', guatemala: 'GT', panama: 'PA',
  'costa rica': 'CR', uruguay: 'UY', peru: 'PE', belize: 'BZ', romania_2: 'RO',
  eswatini: 'SZ', iceland: 'IS', luxembourg: 'LU', slovenia: 'SI',
  slovakia: 'SK', moldova: 'MD', kazakhstan: 'KZ', uzbekistan: 'UZ',
};
/** ISO codes seen in the wild as bare region tokens (checked AFTER US states). */
const BARE_COUNTRY_CODES = new Set([
  'GB', 'SG', 'MY', 'AE', 'CY', 'MT', 'HK', 'NZ', 'ZA', 'KR', 'JP', 'CH', 'NO',
  'IS', 'IE', 'PT', 'NL', 'SE', 'DK', 'FI', 'GR', 'CZ', 'HU', 'RO', 'HR', 'RS',
  'BG', 'UA', 'EE', 'LV', 'LT', 'GE', 'AM', 'TR', 'IL', 'IN', 'ID', 'TH', 'VN',
  'PH', 'TW', 'AU', 'BR', 'AR', 'MX', 'CO', 'CL', 'NG', 'KE', 'EG', 'GT', 'PA',
  'CR', 'UY', 'PE', 'BZ', 'SZ', 'LU', 'SI', 'SK', 'MD', 'KZ', 'UZ', 'DE', 'FR',
  'ES', 'IT', 'BE', 'PL', 'CA',
]);

function normalizeCountryToken(token: string): string | null {
  const key = token.trim().toLowerCase().replace(/\./g, '');
  if (!key) return null;
  const direct = COUNTRY_CODES[key];
  if (direct) return direct;
  if (/^[a-z]{2}$/.test(key)) {
    const upper = key.toUpperCase();
    // US states win ties (CA = California, not Canada, in job-location context).
    if (US_STATE_CODES.has(upper)) return null;
    if (BARE_COUNTRY_CODES.has(upper)) return upper;
  }
  return null;
}

export interface ParsedJobAddress {
  addressLocality?: string;
  addressRegion?: string;
  addressCountry?: string;
}

/**
 * Splits a free-text job location ("New York, NY (HQ)", "Kuala Lumpur,
 * Malaysia", "Palo Alto, California, United States") into structured address
 * parts. Only emits what the source string actually states — streetAddress
 * and postalCode are unknowable from ATS feeds and are deliberately omitted
 * (fabricating them would be misleading structured data).
 */
export function parseJobAddress(location: unknown): ParsedJobAddress {
  if (typeof location !== 'string') return {};
  // First site wins for multi-site postings ("Abu Dhabi, UAE; Kuala Lumpur",
  // "Cyprus / Georgia / Poland" multi-country lists).
  let text = location.split(';')[0] ?? '';
  text = text.split('/')[0] ?? '';
  // Alternatives ("Vancouver, BC or New York City") and trailing qualifiers
  // ("New York, NY / Hybrid", "Bengaluru, India (Hybrid)", "New York Office").
  text = text.split(/\s+or\s+/i)[0] ?? '';
  text = text.replace(/\(.*?\)/g, ' ').replace(/\s*\/\s*(hybrid|onsite|on-site)\s*$/i, ' ').replace(/\s+office\s*$/i, ' ');
  const parts = text.split(',').map((p) => p.trim().replace(/\.+$/, '')).filter(Boolean);
  if (parts.length === 0) return {};

  if (parts.length === 1) {
    const only = parts[0]!;
    // Bare country tokens ("Guatemala", "United States") carry no locality.
    const asCountry = normalizeCountryToken(only);
    if (asCountry && !/^(singapore|hong kong|dubai)$/i.test(only)) return { addressCountry: asCountry };
    return { addressLocality: only };
  }

  const out: ParsedJobAddress = { addressLocality: parts[0] };
  if (parts.length >= 3) {
    const regionRaw = parts[1]!;
    out.addressRegion = US_STATE_ABBRS[regionRaw.toLowerCase()] ?? regionRaw;
    out.addressCountry = normalizeCountryToken(parts[2]!) ?? parts[2];
  } else {
    const tail = parts[1]!;
    const asCountry = normalizeCountryToken(tail);
    if (asCountry) {
      out.addressCountry = asCountry;
    } else if (US_STATE_ABBRS[tail.toLowerCase()]) {
      out.addressRegion = US_STATE_ABBRS[tail.toLowerCase()];
    } else {
      out.addressRegion = tail;
    }
  }
  return out;
}

export function JobDetailView({
  job,
  contentHtml,
  company,
  siteUrl,
  logoSrc = null,
  faviconUrl = null,
}: JobDetailViewProps) {
  const slug = getJobSlug(job);
  const companySlug = getCompanySlug(job.company);
  const canonicalUrl = `${siteUrl}/${slug}`;
  const companyUrl = `${siteUrl}/${companySlug}`;
  const postedLabel = job.dateVerified === false ? null : getPostedLabel(job.date);
  const postedDate = new Date(job.date);
  const absoluteLogoUrl = logoSrc
    ? logoSrc.startsWith('http')
      ? logoSrc
      : `${siteUrl}${logoSrc.startsWith('/') ? '' : '/'}${logoSrc}`
    : null;

  const hiringOrganization = {
    '@type': 'Organization',
    name: job.company,
    url: companyUrl,
    ...(company?.website && { sameAs: company.website }),
    ...(absoluteLogoUrl && { logo: absoluteLogoUrl }),
  };

  const isDateValid = !Number.isNaN(postedDate.getTime());
  const datePostedIso = isDateValid ? postedDate.toISOString() : new Date().toISOString();
  const validThroughDate = new Date(
    (isDateValid ? postedDate.getTime() : Date.now()) + 60 * 24 * 60 * 60 * 1000
  ).toISOString();

  const titleLower = job.title.toLowerCase();
  const deptLower = (typeof job.department === 'string' ? job.department : (job.department as any)?.name || '').toLowerCase();
  const locLower = (typeof job.location === 'string' ? job.location : (job.location as any)?.name || '').toLowerCase();

  const descriptionText = contentHtml ? contentHtml.toLowerCase() : '';

  const employmentType = (() => {
    if (titleLower.includes('intern') || deptLower.includes('intern') || descriptionText.includes('internship') || descriptionText.includes('intern position')) return 'INTERN';
    if (titleLower.includes('contract') || titleLower.includes('freelance') || deptLower.includes('contract') || descriptionText.includes('contractor') || descriptionText.includes('contract position') || descriptionText.includes('freelance')) return 'CONTRACTOR';
    if (titleLower.includes('part-time') || titleLower.includes('part time') || descriptionText.includes('part-time') || descriptionText.includes('part time')) return 'PART_TIME';
    if (titleLower.includes('full-time') || titleLower.includes('full time') || descriptionText.includes('full-time') || descriptionText.includes('full time') || descriptionText.includes('permanent')) return 'FULL_TIME';
    return 'FULL_TIME';
  })();

  const isRemote =
    !job.location ||
    locLower.includes('remote') ||
    locLower.includes('anywhere') ||
    locLower.includes('worldwide') ||
    locLower.includes('global') ||
    locLower.includes('virtual');

  // Word-boundary matching throughout: bare substring tests misfire badly
  // here ('Austin' contains 'us', 'Eurasia' contains 'asia', 'Lucknow'
  // contains 'uk' patterns, etc.).
  const applicantLocationName = (() => {
    if (/\b(us|usa|u\.s\.?|united states)\b/.test(locLower)) return 'United States';
    if (/\b(emea|europe|european|eu)\b/.test(locLower)) return 'Europe';
    if (/\bapac\b/.test(locLower) || /\basia\b/.test(locLower)) return 'Asia';
    if (/\blatam\b/.test(locLower) || locLower.includes('latin america')) return 'Latin America';
    if (/\buk\b/.test(locLower) || locLower.includes('united kingdom') || locLower.includes('britain')) return 'United Kingdom';
    if (locLower.includes('canada')) return 'Canada';
    return 'Worldwide';
  })();

  // Structured work address for non-remote postings. Only locality/region/
  // country are emitted: streetAddress and postalCode are unknowable from
  // ATS-sourced locations and must not be fabricated.
  const jobAddress: ParsedJobAddress = !isRemote ? parseJobAddress(job.location) : {};
  if (
    !isRemote &&
    !jobAddress.addressLocality &&
    !jobAddress.addressRegion &&
    !jobAddress.addressCountry &&
    typeof job.location === 'string' &&
    job.location.trim()
  ) {
    // Last resort: keep the raw string as the locality (previous behavior).
    jobAddress.addressLocality = job.location.trim();
  }

  const salaryInfo = getJobSalaryInfo(job, contentHtml);

  const jobPostingSchema = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: contentHtml,
    ...(job.dateVerified !== false && isDateValid && { datePosted: datePostedIso }),
    validThrough: validThroughDate,
    employmentType,
    directApply: true,
    hiringOrganization,
    industry: 'Web3 / Blockchain / Cryptocurrency',
    baseSalary: salaryInfo.schema,
    ...(job.department && { occupationalCategory: typeof job.department === 'string' ? job.department : (job.department as any)?.name || String(job.department) }),
    ...(isRemote
      ? {
          jobLocationType: 'TELECOMMUTE',
          applicantLocationRequirements: {
            '@type': 'Country',
            name: applicantLocationName,
          },
        }
      : {
          jobLocation: {
            '@type': 'Place',
            address: {
              '@type': 'PostalAddress',
              ...(jobAddress.addressLocality && { addressLocality: jobAddress.addressLocality }),
              ...(jobAddress.addressRegion && { addressRegion: jobAddress.addressRegion }),
              ...(jobAddress.addressCountry && { addressCountry: jobAddress.addressCountry }),
            },
          },
        }),
    url: canonicalUrl,
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Jobs', item: `${siteUrl}/jobs` },
      { '@type': 'ListItem', position: 3, name: job.company, item: companyUrl },
      { '@type': 'ListItem', position: 4, name: job.title, item: canonicalUrl },
    ],
  };

  return (
    <article className="site-container px-4 py-10 sm:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <nav aria-label="Breadcrumb" className="mb-8 flex flex-wrap gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span aria-hidden="true">/</span>
        <Link href="/jobs" className="hover:text-foreground">Jobs</Link>
        <span aria-hidden="true">/</span>
        <Link href={`/${companySlug}`} className="hover:text-foreground">{job.company}</Link>
      </nav>

      <header className="border-b pb-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center">
            <CompanyLogo
              logoSrc={logoSrc ?? faviconUrl}
              faviconUrl={faviconUrl}
              name={job.company}
              size="h-full w-full"
            />
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{job.title}</h1>
            <Link href={`/${companySlug}`} className="mt-2 inline-block font-medium hover:text-primary">
              {job.company}
            </Link>

            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
              {job.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                  {job.location}
                </span>
              )}
              {salaryInfo.display && (
                <span className="flex items-center gap-1.5 font-medium text-foreground/90">
                  <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                  {salaryInfo.display}
                </span>
              )}
              {postedLabel && (
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" aria-hidden="true" />
                  {postedLabel}
                </span>
              )}
            </div>
          </div>

          <JobApplicationButton
            jobId={job.id}
            jobTitle={job.title}
            companyName={job.company}
            jobUrl={job.link}
            source={job.source}
            date={job.dateVerified === false ? undefined : job.date}
          >
            <span className="inline-flex h-11 w-full items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground hover:bg-primary/90 sm:w-auto">
              Apply
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </span>
          </JobApplicationButton>
        </div>
      </header>

      <section
        className="prose prose-slate mt-10 max-w-none dark:prose-invert prose-headings:tracking-tight prose-a:text-primary"
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />

      {company?.description && (
        <section className="mt-12 border-t pt-8">
          <h2 className="text-lg font-bold tracking-tight mb-3">About {company.name}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{company.description}</p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            {company.website && (
              <a href={company.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-medium hover:text-primary">
                {new URL(company.website).hostname.replace(/^www\./, '')}
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            )}
            <Link href={`/${companySlug}`} className="inline-flex items-center gap-1.5 font-medium hover:text-primary">
              View all {company.jobCount} roles at {company.name}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </section>
      )}
    </article>
  );
}
