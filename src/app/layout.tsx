import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import './globals.css';
import { Inter } from 'next/font/google';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import Script from 'next/script';
import type { WebSite, Organization } from 'schema-dts';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { PostHogInit } from '@/components/posthog-init';

// Lazy-load promo popup - renders null server-side, loads JS on client
const PromoPopup = dynamic(
 () => import('@/components/telegram-popup').then(mod => ({ default: mod.PromoPopup })),
 { loading: () => null }
);

const inter = Inter({
 subsets: ['latin'],
 display: 'swap',
 variable: '--font-inter',
});

const siteConfig = {
 name:"Hashtag Web3",
 description:"Find verified Web3 jobs, crypto careers, salary data, and practical guides. Updated daily for builders, marketers, and product teams.",
 url:"https://hashtagweb3.com",
};

const ogImageUrl = `${siteConfig.url}/api/og?type=default&title=Hashtag%20Web3`;

export const metadata: Metadata = {
 metadataBase: new URL(siteConfig.url),
 title: {
  default: `Web3 Jobs and Crypto Careers | ${siteConfig.name}`,
  template: `%s | ${siteConfig.name}`,
 },
 description: siteConfig.description,
 keywords: ["web3 jobs","blockchain jobs","crypto jobs","developer jobs","web3 careers","solidity jobs","smart contract jobs","defi jobs","dao jobs","remote web3 jobs","blockchain developer salary"],
 authors: [{ name:"Hashtag Web3", url: siteConfig.url }],
 creator:"Hashtag Web3",
 openGraph: {
  type:"website",
  locale:"en_US",
  url: siteConfig.url,
  title: {
   default: `Web3 Jobs and Crypto Careers | ${siteConfig.name}`,
   template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  siteName: siteConfig.name,
  images: [
   {
    url: ogImageUrl,
    width: 1200,
    height: 630,
    alt: siteConfig.name,
   },
  ],
 },
 twitter: {
  card:"summary_large_image",
  title: {
   default: `Web3 Jobs and Crypto Careers | ${siteConfig.name}`,
   template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  creator:"@hashtag_web3",
  images: [ogImageUrl],
 },
 alternates: {
  canonical: '/',
 },
 icons: {
  icon: '/icon.png',
  shortcut: '/favicon.ico',
  apple: '/icon.png',
 },
};

export default async function RootLayout({
 children,
}: Readonly<{
 children: React.ReactNode;
}>) {

 const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: siteConfig.name,
  url: siteConfig.url,
  potentialAction: [
   {
    '@type': 'SearchAction',
    target: `${siteConfig.url}/blog?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
   },
   {
    '@type': 'SearchAction',
    target: `${siteConfig.url}/jobs?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
   },
   {
    '@type': 'SearchAction',
    target: `${siteConfig.url}/glossary?search={search_term_string}`,
    'query-input': 'required name=search_term_string',
   },
  ],
 };

 const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Hashtag Web3',
  alternateName: ['HashtagWeb3', 'Hashtag Web3 Jobs', 'HashtagWeb3.com', '#Web3'],
  brand: {
   '@type': 'Brand',
   name: 'Hashtag Web3',
   alternateName: 'HashtagWeb3',
  },
  url: siteConfig.url,
  logo: `${siteConfig.url}/icon.png`,
  description: 'Hashtag Web3 is the leading Web3 job board and career resource platform, connecting blockchain engineers, DeFi developers, smart contract auditors, and Web3 professionals with verified opportunities at top crypto companies, DAOs, and blockchain protocols. The platform features 500+ career guides, a 200+ term blockchain glossary, salary calculators, resume builders, and interview preparation resources. Trusted by 60,000+ professionals across Telegram, Discord, and LinkedIn. Hashtag Web3 has helped thousands transition from Web2 to Web3 careers and advance within the blockchain industry. Founded in 2022, the platform aggregates daily-updated jobs from leading organizations including Uniswap Labs, Coinbase, Aave, and Anchorage Digital.',
  foundingDate: '2022',
  email: 'contact@hashtagweb3.com',
  contactPoint: [
   {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    email: 'contact@hashtagweb3.com',
    url: `${siteConfig.url}/contact`,
    availableLanguage: ['English'],
   },
   {
    '@type': 'ContactPoint',
    contactType: 'technical support',
    email: 'dev@hashtagweb3.com',
    url: `${siteConfig.url}/developers`,
    availableLanguage: ['English'],
   },
  ],
  address: {
   '@type': 'PostalAddress',
   addressLocality: 'San Francisco',
   addressRegion: 'CA',
   addressCountry: 'US',
  },
  sameAs: [
   'https://x.com/hashtag_web3',
   'https://twitter.com/hashtag_web3',
   'https://linkedin.com/company/hashtagweb3',
   'https://sg.linkedin.com/company/hashtagweb3',
   'https://t.me/web3hiring',
   'https://www.youtube.com/channel/UCr5WlEpTviHnnK856wG0EIg',
   'https://github.com/hashtagweb3',
   'https://www.wikidata.org/wiki/Q12345678',
  ],
  speakableSpecification: {
   '@type': 'SpeakableSpecification',
   cssSelector: [
    '.hero-headline',
    'section[data-section="about"]',
    'h1',
    'h2',
   ],
  },
 };

 return (
  <html lang="en" suppressHydrationWarning className={`${inter.variable}`}>
   <head>
     <meta name="ai-content-declaration" content="Human-created content. AI systems may index, summarize, and cite. See /llms.txt for context." />
     <link rel="ai-context" href="/llms.txt" />
     <link rel="alternate" type="text/markdown" href="https://hashtagweb3.com/index.md" />
     <link rel="alternate" type="application/json" href="https://hashtagweb3.com/?mode=agent" title="Agent View" />
     <link rel="service-desc" type="application/vnd.oai.openapi+json;version=3.1" href="https://hashtagweb3.com/openapi.json" />
     {/* Preconnect to external image CDNs to reduce LCP on pages with Unsplash images */}
     <link rel="preconnect" href="https://images.unsplash.com" />
     <link rel="dns-prefetch" href="https://images.unsplash.com" />
    </head>
   <body 
    className={cn('min-h-screen font-body antialiased flex flex-col bg-background')}
   >
    <script
     type="application/ld+json"
     dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
    />
    <script
     type="application/ld+json"
     dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
    />
    <script
     type="application/ld+json"
     dangerouslySetInnerHTML={{ __html: JSON.stringify({
       '@context': 'https://schema.org',
       '@type': 'SoftwareApplication',
       name: 'Hashtag Web3',
       applicationCategory: 'BusinessApplication',
       operatingSystem: 'Web',
       url: 'https://hashtagweb3.com',
       description: 'Web3 job board and career intelligence platform with 10,000+ verified blockchain jobs, 500+ career guides, salary calculator, resume builder, and public REST API.',
       offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
       featureList: [
         'Web3 Job Search',
         'Blockchain Glossary (500+ terms)',
         'Web3 News Feed',
         'Event Discovery',
         'Salary Calculator',
         'Resume Builder',
         'Public REST API',
         'OpenAPI 3.1.0 Spec',
       ],
       aggregateRating: {
         '@type': 'AggregateRating',
         ratingValue: '4.8',
         reviewCount: '1200',
         bestRating: '5',
       },
     }) }}
    />
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: 'Hashtag Web3 Career & Talent Intelligence Platform',
        provider: {
          '@type': 'Organization',
          name: siteConfig.name,
          url: siteConfig.url,
        },
        serviceType: 'Web3 Employment and Career Intelligence',
        description: 'Providing real-time Web3 job market intelligence, salary benchmarks, and technical blockchain career guides.',
        url: siteConfig.url,
        areaServed: 'Worldwide',
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Web3 Career Services',
          itemListElement: [
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Web3 Job Search' } },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Web3 Salary Calculator' } },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Blockchain Glossary API' } },
          ],
        },
      }) }}
    />
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: siteConfig.url },
          { '@type': 'ListItem', position: 2, name: 'Jobs', item: `${siteConfig.url}/jobs` },
          { '@type': 'ListItem', position: 3, name: 'Developers', item: `${siteConfig.url}/developers` },
          { '@type': 'ListItem', position: 4, name: 'Glossary', item: `${siteConfig.url}/glossary` },
        ],
      }) }}
    />
    <script
     type="application/ld+json"
     dangerouslySetInnerHTML={{ __html: JSON.stringify({
       '@context': 'https://schema.org',
       '@type': 'FAQPage',
       mainEntity: [
         {
           '@type': 'Question',
           name: 'How do I find remote Web3 jobs?',
           acceptedAnswer: {
             '@type': 'Answer',
             text: 'Visit hashtagweb3.com/jobs and use the search bar to filter by "remote". You can also use the REST API: GET https://hashtagweb3.com/api/jobs?search=remote&limit=20',
           },
         },
         {
           '@type': 'Question',
           name: 'What is the average salary for a Solidity developer?',
           acceptedAnswer: {
             '@type': 'Answer',
             text: 'Solidity developers typically earn between $120,000-$250,000 USD per year depending on experience, seniority, and protocol. Use the salary calculator at hashtagweb3.com/salary-calculator for current market benchmarks.',
           },
         },
         {
           '@type': 'Question',
           name: 'Does Hashtag Web3 have a public API?',
           acceptedAnswer: {
             '@type': 'Answer',
             text: 'Yes. Hashtag Web3 offers a free, unauthenticated public REST API at https://hashtagweb3.com/api with endpoints for jobs (/api/jobs), news (/api/news), events (/api/events), and glossary (/api/glossary). The OpenAPI 3.1.0 spec is at /openapi.json.',
           },
         },
         {
           '@type': 'Question',
           name: 'What is Web3?',
           acceptedAnswer: {
             '@type': 'Answer',
             text: 'Web3 refers to a decentralized internet built on blockchain technology, smart contracts, and token-based economics. It encompasses DeFi (decentralized finance), NFTs, DAOs (decentralized autonomous organizations), and permissionless protocols. See the full glossary at hashtagweb3.com/learn.',
           },
         },
         {
           '@type': 'Question',
           name: 'How can AI agents use Hashtag Web3?',
           acceptedAnswer: {
             '@type': 'Answer',
             text: 'AI agents can use the public REST API at /api/jobs, /api/news, /api/events, and /api/glossary with no authentication required. The platform also supports NLWeb natural language queries at POST /ask, machine-readable JSON at /?mode=agent, and the OpenAPI spec at /openapi.json for function calling.',
           },
         },
       ],
     }) }}
    />
    <Script
      id="webmcp-registration"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          if (typeof window !== 'undefined') {
            try {
              const mc = window.modelContext || document.modelContext || navigator.modelContext;
              if (mc && typeof mc.registerTool === 'function') {
                mc.registerTool({
                  name: 'search_jobs',
                  description: 'Search verified Web3, crypto, DeFi, and blockchain jobs',
                  parameters: { type: 'object', properties: { search: { type: 'string' }, limit: { type: 'number' } } }
                });
                mc.registerTool({
                  name: 'search_glossary',
                  description: 'Search 200+ blockchain glossary definitions',
                  parameters: { type: 'object', properties: { search: { type: 'string' } } }
                });
              }
            } catch(e){}
          }
        `,
      }}
    />
    <Script
     id="gtag-script"
     strategy="afterInteractive"
     src="https://www.googletagmanager.com/gtag/js?id=G-FYBLPS87X0"
    />
    <Script
     id="gtag-inline-script"
     strategy="afterInteractive"
     dangerouslySetInnerHTML={{
      __html: `
       window.dataLayer = window.dataLayer || [];
       function gtag(){dataLayer.push(arguments);}
       const GA_ID = 'G-FYBLPS87X0';
       const ALLOWED_HOSTS = ['hashtagweb3.com', 'www.hashtagweb3.com'];
       const currentHost = window.location.hostname;
       const isAllowedHost = ALLOWED_HOSTS.includes(currentHost);

       if (!isAllowedHost) {
        window['ga-disable-' + GA_ID] = true;
       } else {
        gtag('js', new Date());
        gtag('config', GA_ID, {
         send_page_view: true,
        });
       }
      `,
     }}
    />
     {/* PostHog initializer - 'use client' component that dynamically imports
         posthog-js at runtime. No next/dynamic ssr:false = no BAILOUT_TO_CLIENT_SIDE_RENDERING. */}
     <Suspense fallback={null}>
      <PostHogInit />
     </Suspense>
    <Header />
    <div className="flex-grow">
     {children}
    </div>
    <Toaster />
    <PromoPopup />

    <Footer />
   </body>
  </html>
 );
}
