
import { Header } from '@/components/header';
import { getAllArticles } from '@/lib/articles';
import { BlogPageClientWrapper } from '@/components/blog-page-client-wrapper';
import type { CollectionPage } from 'schema-dts';

// The page can be statically generated because useSearchParams is wrapped in a Suspense boundary in BlogPageClientWrapper
export default async function PlaybookIndexPage() {
 const allArticles = await getAllArticles();
 const categories = ['All', ...[...new Set(allArticles.map(a => a.category))].sort()];
 
 const siteUrl = 'https://hashtagweb3.com';
 const blogSchema: CollectionPage = {
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
    <Header />
    <main className="flex-1">
     <div className="bg-background">
      <h1 className="sr-only">Web3 Playbook - Career Guides and Tech Deep Dives</h1>
      <BlogPageClientWrapper allArticles={allArticles} categories={categories} />
     </div>
    </main>
   </div>
  </div>
 );
}
