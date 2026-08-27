import { getAllArticles } from '@/lib/articles';
import { BlogPageClientWrapper } from '@/components/blog-page-client-wrapper';
import type { Metadata } from 'next';
import type { CollectionPage, WithContext } from 'schema-dts';

export const metadata: Metadata = {
 title: 'Web3 Career Playbook',
 description: 'Actionable guides to land a job in Web3. Read deep-dives on blockchain developer resumes, salary negotiation, smart contract interview prep, and tech guides.',
 alternates: {
  canonical: 'https://hashtagweb3.com/blog',
 },
 openGraph: {
  type: 'website',
  title: 'Web3 Career Playbook | Hashtag Web3',
  description: 'Actionable guides to land a job in Web3. Read deep-dives on blockchain developer resumes, salary negotiation, and smart contract interview prep.',
  url: 'https://hashtagweb3.com/blog',
  images: [{
   url: 'https://hashtagweb3.com/api/og?type=default&title=Web3%20Career%20Playbook',
   width: 1200,
   height: 630,
   alt: 'Hashtag Web3 Career Playbook',
  }],
 },
 twitter: {
  card: 'summary_large_image',
  title: 'Web3 Career Playbook | Hashtag Web3',
  description: 'Actionable guides to land a job in Web3. Read deep-dives on blockchain developer resumes, salary negotiation, and smart contract interview prep.',
  images: ['https://hashtagweb3.com/api/og?type=default&title=Web3%20Career%20Playbook'],
 },
};

// The page can be statically generated because useSearchParams is wrapped in a Suspense boundary in BlogPageClientWrapper
export default async function PlaybookIndexPage() {
 const allArticles = await getAllArticles();
 const categories = ['All', ...[...new Set(allArticles.map(a => a.category))].sort()];
 
 const siteUrl = 'https://hashtagweb3.com';
 const blogSchema: WithContext<CollectionPage> = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Web3 Career Guides 2026 | $120K+ Salary Insights & Job Search Tips',
  url: `${siteUrl}/blog`,
  description: 'Expert Web3 career guides for 2026. Learn how to land blockchain jobs, negotiate $120K+ salaries, build your portfolio, and break into DeFi, NFT, and DAO roles.',
 };

 return (
  <div className="bg-background">
   <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
   />
   <div className="flex flex-col min-h-screen">
        <main className="flex-1">
     <div className="bg-background">
      <BlogPageClientWrapper allArticles={allArticles} categories={categories} />
     </div>
    </main>
   </div>
  </div>
 );
}
