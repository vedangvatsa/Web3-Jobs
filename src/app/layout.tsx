import type { Metadata, Viewport } from 'next';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import './globals.css';
import { Inter } from 'next/font/google';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import Script from 'next/script';
import type { WebSite, Organization } from 'schema-dts';

import dynamic from 'next/dynamic';
import { PostHogInit } from '@/components/posthog-init';
import { ClarityInit } from '@/components/clarity-init';

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

const ogImageUrl = `${siteConfig.url}/og-image.png`;

export const viewport: Viewport = {
 width: 'device-width',
 initialScale: 1,
};

export const metadata: Metadata = {
 metadataBase: new URL(siteConfig.url),
 referrer: 'strict-origin-when-cross-origin',
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
   types: {
     'application/rss+xml': [
       {
         url: 'https://hashtagweb3.com/jobs/feed.xml',
         title: 'Hashtag Web3 Jobs RSS Feed',
       },
     ],
   },
  },
 icons: {
  icon: [
   { url: '/favicon.ico', sizes: '48x48' },
   { url: '/icon.png', sizes: '192x192', type: 'image/png' },
  ],
  shortcut: '/favicon.ico',
  apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
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

  return (
   <html lang="en" suppressHydrationWarning className={`${inter.variable}`}>
    <head>
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
     <Script
       id="gtag-script"
       strategy="lazyOnload"
     src="https://www.googletagmanager.com/gtag/js?id=G-FYBLPS87X0"
    />
     <Script
      id="gtag-inline-script"
      strategy="lazyOnload"
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
     <PostHogInit />
     <ClarityInit />
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
