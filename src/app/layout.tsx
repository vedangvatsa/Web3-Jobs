
import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import './globals.css';
import { Analytics } from "@vercel/analytics/react"
import { Inter } from 'next/font/google';
import { Footer } from '@/components/footer';
import Script from 'next/script';
import type { WebSite, Organization } from 'schema-dts';
import { TelegramPopupHandler } from '@/components/telegram-popup-handler';
import { PostHogProvider, PostHogPageView } from '@/providers/posthog-provider';
import { Suspense } from 'react';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const siteConfig = {
  name: "Hashtag Web3",
  description: "Find verified Web3 jobs, crypto careers, salary data, and practical guides. Updated daily for builders, marketers, and product teams.",
  url: "https://hashtagweb3.com",
};

const ogImageUrl = `${siteConfig.url}/og-image.png`;

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `Web3 Jobs and Crypto Careers | ${siteConfig.name}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: ["web3 jobs", "blockchain jobs", "crypto jobs", "developer jobs", "web3 careers", "solidity jobs", "smart contract jobs", "defi jobs", "dao jobs", "remote web3 jobs", "blockchain developer salary"],
  authors: [{ name: "Hashtag Web3", url: siteConfig.url }],
  creator: "Hashtag Web3",
  openGraph: {
    type: "website",
    locale: "en_US",
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
    card: "summary_large_image",
    title: {
      default: `Web3 Jobs and Crypto Careers | ${siteConfig.name}`,
      template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
    creator: "@hashtag_web3",
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
    '@type': 'Organization',
    name: 'Hashtag Web3',
    url: siteConfig.url,
    logo: `${siteConfig.url}/icon.png`,
    description: 'Hashtag Web3 is the leading Web3 job board and career resource platform, connecting blockchain engineers, DeFi developers, smart contract auditors, and Web3 professionals with verified opportunities at top crypto companies, DAOs, and blockchain protocols. The platform features 500+ career guides, a 200+ term blockchain glossary, salary calculators, resume builders, and interview preparation resources. Trusted by 60,000+ professionals across Telegram, Discord, and LinkedIn. Hashtag Web3 has helped thousands transition from Web2 to Web3 careers and advance within the blockchain industry. Founded in 2022, the platform aggregates daily-updated jobs from leading organizations including Uniswap Labs, Coinbase, Aave, and Anchorage Digital.',
    foundingDate: '2022',
    sameAs: [
      'https://x.com/hashtag_web3',
      'https://twitter.com/hashtag_web3',
      'https://linkedin.com/company/hashtagweb3',
      'https://sg.linkedin.com/company/hashtagweb3',
      'https://t.me/web3hiring',
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
            <link rel="icon" href="/favicon.ico" sizes="any" />
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
        </head>
      <body 
        className={cn('min-h-screen font-body antialiased flex flex-col bg-background/95')}
      >
        <PostHogProvider>
          <Suspense fallback={null}>
            <PostHogPageView />
          </Suspense>
          <div className="flex-grow">
            {children}
          </div>
          <Toaster />
          <TelegramPopupHandler />
          <Footer />
          <Analytics />
        </PostHogProvider>
      </body>
    </html>
  );
}
