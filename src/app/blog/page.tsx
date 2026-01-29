
import { Header } from '@/components/header';
import { getAllArticles } from '@/lib/articles';
import { BlogPageClient } from '@/components/blog-page-client';
import type { CollectionPage } from 'schema-dts';
import { Suspense } from 'react';


export default async function PlaybookIndexPage() {
  const allArticles = await getAllArticles();
  const categories = ['All', ...[...new Set(allArticles.map(a => a.category))].sort()];
  
  const siteUrl = 'https://hashtagweb3.com';
  const blogSchema: CollectionPage = {
    '@type': 'CollectionPage',
    name: 'The Web3 Playbook | Hashtag Web3',
    url: `${siteUrl}/blog`,
    description: 'In-depth articles and guides on Web3 careers, technology, and industry insights.',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: allArticles.map((article, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${siteUrl}/${article.slug}`,
        name: article.title,
      })),
    },
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
            <Suspense fallback={<div>Loading...</div>}>
              <BlogPageClient allArticles={allArticles} categories={categories} />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}
