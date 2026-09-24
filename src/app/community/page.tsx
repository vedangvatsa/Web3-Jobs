import { getAllArticles } from '@/lib/articles';
import { getJobs } from '@/lib/jobs';
import { getNewsListingItems } from '@/lib/news';
import { buildCompanyLogoMap } from '@/lib/job-listing';
import { CommunityPageContent } from '@/components/community-page-content';
import { Metadata } from 'next';
import type { WebPage, WithContext } from 'schema-dts';
import { PageShell } from '@/components/page-shell';

export const revalidate = 43200; // Revalidate every 12 hours

export const metadata: Metadata = {
  title: 'Web3 Community',
  description: 'Your hub for Web3 careers. Explore thousands of crypto jobs, get career advice, and connect with a global community of blockchain professionals.',
  alternates: {
    canonical: 'https://hashtagweb3.com/community',
  },
  openGraph: {
    type: 'website',
    title: 'Web3 Community | Hashtag Web3',
    description: 'Your hub for Web3 careers. Explore thousands of crypto jobs, get career advice, and connect with a global community of blockchain professionals.',
    url: 'https://hashtagweb3.com/community',
    images: [{
      url: 'https://hashtagweb3.com/og/pages/community.png',
      width: 1200,
      height: 630,
      alt: 'Hashtag Web3 Community',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Web3 Community | Hashtag Web3',
    description: 'Join 60,000+ Web3 professionals. Access exclusive jobs, career guides, salary data, and connect with the global blockchain community.',
    images: ['https://hashtagweb3.com/og/pages/community.png'],
  },
};

export default async function Page() {
  const allJobs = await getJobs();
  const latestJobs = allJobs.slice(0, 9);
  const companyLogos = await buildCompanyLogoMap(latestJobs);
  const latestArticles = (await getAllArticles()).slice(0, 9);
  const latestNews = (await getNewsListingItems()).slice(0, 9);

  const siteUrl = 'https://hashtagweb3.com';
  const pageSchema: WithContext<WebPage> = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    url: `${siteUrl}/community`,
    name: 'Web3 Community | Hashtag Web3',
    isPartOf: {
      '@type': 'WebSite',
      url: siteUrl,
      name: 'Hashtag Web3'
    },
    description: 'Your hub for Web3 careers. Explore thousands of crypto jobs, get career advice, and connect with a global community of blockchain professionals.',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }}
      />
      <div className="flex flex-col min-h-screen">
        <main className="flex-1">
          <PageShell>
            <CommunityPageContent
              latestJobs={latestJobs}
              latestArticles={latestArticles}
              latestNews={latestNews}
              companyLogos={companyLogos}
            />
          </PageShell>
        </main>
      </div>
    </>
  );
}
