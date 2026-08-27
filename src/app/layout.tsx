import type { Metadata, Viewport } from 'next';
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

export const viewport: Viewport = {
 width: 'device-width',
 initialScale: 1,
};

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

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Hashtag Web3 Talent Intelligence & Career Platform',
    serviceType: 'Web3 Job Board and Career Intelligence',
    provider: {
      '@type': 'Organization',
      name: 'Hashtag Web3',
      url: siteConfig.url,
    },
    areaServed: 'Worldwide',
    description: 'Verified Web3 job postings, developer career playbooks, compensation calculators, blockchain glossary, and developer APIs.',
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Web3 Career & Intelligence Services',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Web3 Job Search & Verification',
            description: 'Curated and verified Web3 job listings from top protocols, DAOs, and crypto startups.',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Developer APIs & Agent Tool Calling',
            description: 'High-performance REST endpoints and Model Context Protocol (MCP) servers for AI agents.',
          },
        },
      ],
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '1280',
      bestRating: '5',
      worstRating: '1',
    },
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is Hashtag Web3?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Hashtag Web3 is the premier Web3 job board, blockchain career resource platform, and decentralized talent intelligence network connecting builders with verified blockchain, DeFi, and crypto opportunities.',
        },
      },
      {
        '@type': 'Question',
        name: 'Are the jobs on Hashtag Web3 verified?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, every job listed on Hashtag Web3 is verified against official employer career portals, ATS systems, and authentic Web3 protocol repositories to eliminate scam and duplicate postings.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does Hashtag Web3 provide developer APIs and MCP servers for AI agents?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, Hashtag Web3 provides public REST endpoints (GET /api/v1/jobs, /api/v1/glossary, /api/v1/events, /api/v1/news), OpenAPI 3.1 specifications, and a Streamable HTTP Model Context Protocol (MCP) server at /.well-known/mcp.',
        },
      },
    ],
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
        name: 'Jobs',
        item: 'https://hashtagweb3.com/jobs',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Developers',
        item: 'https://hashtagweb3.com/developers',
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: 'Glossary',
        item: 'https://hashtagweb3.com/glossary',
      },
    ],
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
      dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
     />
     <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
     />
     <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
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
