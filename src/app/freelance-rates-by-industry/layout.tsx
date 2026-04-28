import type { Metadata } from 'next';

export const metadata: Metadata = {
 title: 'Freelance Rates by Industry (2026) | Hourly & Project Benchmarks',
 description:
  'Freelance rates by industry for 2026. Compare hourly and project pricing benchmarks for software, design, marketing, content, and operations roles.',
 keywords: [
  'freelance rates by industry',
  'freelance hourly rates',
  'freelance project rates',
  'freelancer pricing calculator',
  'freelance benchmark rates',
  'web3 freelance rates',
  'software freelance rates',
  'design freelance rates',
  'marketing freelance rates',
 ],
 robots: {
  index: true,
  follow: true,
  googleBot: {
   index: true,
   follow: true,
   'max-snippet': -1,
   'max-image-preview': 'large',
   'max-video-preview': -1,
  },
 },
 alternates: {
  canonical: '/freelance-rates-by-industry',
 },
 openGraph: {
  title: 'Freelance Rates by Industry (2026) | Hourly & Project Benchmarks',
  description:
   'Explore freelance pricing benchmarks by industry with practical hourly and project-rate ranges.',
  url: 'https://hashtagweb3.com/freelance-rates-by-industry',
  images: [
   {
    url: 'https://hashtagweb3.com/og-image-tools.png',
    width: 1200,
    height: 630,
    alt: 'Freelance Rates by Industry',
   },
  ],
 },
 twitter: {
  card: 'summary_large_image',
  title: 'Freelance Rates by Industry (2026) | Hourly & Project Benchmarks',
  description:
   'Benchmark freelance hourly and project rates across major industries and roles.',
  images: ['https://hashtagweb3.com/og-image-tools.png'],
 },
};

const webPageSchema = {
 '@context': 'https://schema.org',
 '@type': 'WebPage',
 name: 'Freelance Rates by Industry (2026)',
 description:
  'Freelance rate benchmarks by industry with hourly and project pricing ranges.',
 url: 'https://hashtagweb3.com/freelance-rates-by-industry',
};

const breadcrumbSchema = {
 '@context': 'https://schema.org',
 '@type': 'BreadcrumbList',
 itemListElement: [
  {
   '@type': 'ListItem',
   position: 1,
   name: 'Home',
   item: 'https://hashtagweb3.com',
  },
  {
   '@type': 'ListItem',
   position: 2,
   name: 'Resources',
   item: 'https://hashtagweb3.com/resources',
  },
  {
   '@type': 'ListItem',
   position: 3,
   name: 'Freelance Rates by Industry',
   item: 'https://hashtagweb3.com/freelance-rates-by-industry',
  },
 ],
};

const faqSchema = {
 '@context': 'https://schema.org',
 '@type': 'FAQPage',
 mainEntity: [
  {
   '@type': 'Question',
   name: 'How do I estimate my freelance hourly rate?',
   acceptedAnswer: {
    '@type': 'Answer',
    text: 'Start with your annual income target, divide by realistic billable hours, then adjust for industry demand, experience, and delivery complexity.',
   },
  },
  {
   '@type': 'Question',
   name: 'Should I charge hourly or per project?',
   acceptedAnswer: {
    '@type': 'Answer',
    text: 'Use hourly pricing when scope is uncertain. Use project pricing when scope, timeline, and deliverables are clear and measurable.',
   },
  },
  {
   '@type': 'Question',
   name: 'Why do freelance rates differ by region?',
   acceptedAnswer: {
    '@type': 'Answer',
    text: 'Rates vary with local market demand, purchasing power, competition, and client budgets. Specialized skills can command premiums across regions.',
   },
  },
 ],
};

export default function FreelanceRatesByIndustryLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 return (
  <>
   <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
   />
   <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
   />
   <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
   />
   {children}
  </>
 );
}
