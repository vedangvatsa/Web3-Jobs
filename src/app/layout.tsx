
import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import './globals.css';
import { Analytics } from "@vercel/analytics/react"
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const siteConfig = {
  name: "Hashtag Web3",
  description: "The best job board for Web3, crypto, and blockchain roles. The best place for top talent to discover exclusive opportunities at leading Web3 companies, DAOs, and crypto startups.",
  url: "https://web3-jobs.example.com",
};

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} - Find your next Web3 Job`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: ["web3 jobs", "blockchain jobs", "crypto jobs", "developer jobs", "web3 careers", "solidity jobs", "smart contract jobs", "defi jobs", "dao jobs", "remote web3 jobs", "blockchain developer salary"],
  authors: [{ name: "Hashtag Web3", url: siteConfig.url }],
  creator: "Hashtag Web3",
  metadataBase: new URL(siteConfig.url),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: `${siteConfig.url}/og-image.png`,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    creator: "@hashtag_web3",
    images: [`${siteConfig.url}/og-image.png`],
  },
  alternates: {
    canonical: siteConfig.url,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable}`}>
      <body className={cn('min-h-screen bg-background font-body antialiased flex flex-col')}>
        <div className="flex-grow">{children}</div>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
