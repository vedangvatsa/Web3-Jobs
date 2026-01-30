
import { getArticle, getAllArticles } from '@/lib/articles';
import { notFound } from 'next/navigation';
import { Header } from '@/components/header';
import Image from 'next/image';
import { Metadata } from 'next';
import type { Article as ArticleSchema, ScholarlyArticle, BreadcrumbList } from 'schema-dts';
import { ArticleContent } from '@/components/article-content';
import { Suspense } from 'react';
import { cn } from '@/lib/utils';

type ArticlePageProps = {
  params: {
    slug: string;
  };
};

export async function generateStaticParams() {
  const articles = await getAllArticles();
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const article = await getArticle(params.slug);
  if (!article) {
    notFound();
  }

  const siteUrl = 'https://hashtagweb3.com';
  const articleUrl = `${siteUrl}/${article.slug}`;

  const keywords = [
    'web3', 
    'crypto', 
    'blockchain', 
    ...article.title.toLowerCase().split(' '),
    ...article.category.toLowerCase().split(' '),
    ...(article['data-ai-hint']?.toLowerCase().split(' ') || [])
  ].filter((v, i, a) => a.indexOf(v) === i); // Remove duplicates

  return {
    title: `${article.title} | Web3 Playbook`,
    description: article.description,
    keywords: keywords,
    alternates: {
      canonical: articleUrl,
    },
    openGraph: {
      title: `${article.title} | Web3 Playbook`,
      description: article.description,
      type: 'article',
      url: articleUrl,
      images: [
        {
          url: article.image.startsWith('http') ? article.image : `${siteUrl}${article.image}`,
          width: 1200,
          height: 630,
          alt: `${article.title} - Hashtag Web3`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${article.title} | Web3 Playbook`,
      description: article.description,
      images: [article.image.startsWith('http') ? article.image : `${siteUrl}${article.image}`],
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const article = await getArticle(params.slug);

  if (!article) {
    notFound();
  }
  
  const siteUrl = 'https://hashtagweb3.com';
  const imageUrl = article.image.startsWith('http') ? article.image : `${siteUrl}${article.image}`;

  const scholarlyCategories = ["AI & The Future of Work", "Web3 Career Guides"];
  const isScholarly = scholarlyCategories.includes(article.category);

  const articleSchema: ArticleSchema | ScholarlyArticle = {
    '@type': isScholarly ? 'ScholarlyArticle' : 'Article',
    headline: article.title,
    description: article.description,
    image: imageUrl,
    datePublished: new Date().toISOString(),
    dateModified: new Date().toISOString(),
    author: {
        '@type': 'Organization',
        name: 'Hashtag Web3',
        url: siteUrl,
    },
    publisher: {
        '@type': 'Organization',
        name: 'Hashtag Web3',
        url: siteUrl,
        logo: {
            '@type': 'ImageObject',
            url: `${siteUrl}/logo.png`
        }
    },
    mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `${siteUrl}/${article.slug}`
    }
  };

  const breadcrumbSchema: BreadcrumbList = {
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: `${siteUrl}/blog`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: article.title,
        item: `${siteUrl}/${article.slug}`,
      },
    ],
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Header />
      <main className="flex-1">
        <div className="bg-background">
            <article className="container mx-auto px-4 py-8">
              <div className="max-w-5xl mx-auto p-4 sm:p-8">
                 <Suspense fallback={<div>Loading...</div>}>
                    <header className="mb-8">
                      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary mb-4">
                        {article.title}
                      </h1>
                      <p className="text-lg text-muted-foreground">
                        {article.description}
                      </p>
                    </header>
                    
                    {article.image && (
                      <div
                        className={cn(
                          "relative w-full md:max-w-4xl overflow-hidden rounded-lg shadow-xl mb-8",
                          "aspect-[16/9] max-h-[280px] sm:max-h-[320px] md:max-h-[360px]"
                        )}
                      >
                        <Image
                          src={article.image}
                          alt={`${article.title} - Hashtag Web3 article cover`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 900px, 1024px"
                          priority
                          data-ai-hint={`${article['data-ai-hint'] || ''}`}
                        />
                      </div>
                    )}
                    
                    <ArticleContent content={article.content} className="mb-12" />
                 </Suspense>
              </div>
            </article>
        </div>
      </main>
    </div>
  );
}
