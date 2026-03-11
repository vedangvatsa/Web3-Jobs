
import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import './globals.css';
import { Analytics } from "@vercel/analytics/react"
import { Inter } from 'next/font/google';
import { Footer } from '@/components/footer';
import Script from 'next/script';
import type { WebSite, Organization } from 'schema-dts';
import { FirebaseClientProvider } from '@/firebase/client-provider';
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

  const websiteSchema: WebSite = {
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

  const organizationSchema: Organization = {
    '@type': 'Organization',
    name: 'Hashtag Web3',
    url: siteConfig.url,
    logo: `${siteConfig.url}/icon.png`,
    description: 'Hashtag Web3 is a Web3 job board and career resource platform connecting blockchain, crypto, DeFi, and DAO professionals with job opportunities. The platform lists thousands of Web3 jobs, maintains a 200+ term glossary, and publishes career guides for the Web3 industry.',
    foundingDate: '2022',
    sameAs: [
      'https://x.com/hashtag_web3',
      'https://twitter.com/hashtag_web3',
      'https://linkedin.com/company/hashtagweb3',
      'https://sg.linkedin.com/company/hashtagweb3',
      'https://t.me/web3hiring',
    ],
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
          <FirebaseClientProvider>
            <div className="flex-grow">
                {children}
            </div>
            <Toaster />
            <TelegramPopupHandler />
          </FirebaseClientProvider>
          <Footer />
          <Analytics />
        </PostHogProvider>
      </body>
    </html>
  );
}
