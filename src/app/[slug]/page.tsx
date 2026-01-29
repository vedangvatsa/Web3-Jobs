
import { getArticle, getAllArticles } from '@/lib/articles';
import { notFound } from 'next/navigation';
import { Header } from '@/components/header';
import Image from 'next/image';
import { Metadata } from 'next';
import type { Article as ArticleSchema, ScholarlyArticle } from 'schema-dts';
import { ArticleContent } from '@/components/article-content';
import { Button } from '@/components/ui/button';
import { Rss } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Suspense } from 'react';
import { RelatedArticles } from '@/components/related-articles';
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

  // Enhanced title with CTAs for better CTR
  const enhancedTitle = `${article.title} | 2026 Guide`;
  
  // Enhanced description with power words and CTAs
  const enhancedDescription = article.description.length > 155 
    ? article.description 
    : `${article.description} ✓ Expert insights ✓ Practical tips ✓ Updated 2026`;

  return {
    title: enhancedTitle,
    description: enhancedDescription,
    keywords: keywords,
    alternates: {
      canonical: articleUrl,
    },
    authors: [{ name: 'Hashtag Web3', url: siteUrl }],
    openGraph: {
      title: enhancedTitle,
      description: enhancedDescription,
      type: 'article',
      url: articleUrl,
      siteName: 'Hashtag Web3',
      publishedTime: new Date().toISOString(),
      modifiedTime: new Date().toISOString(),
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
      title: enhancedTitle,
      description: enhancedDescription,
      images: [article.image.startsWith('http') ? article.image : `${siteUrl}${article.image}`],
      creator: '@hashtagweb3',
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const article = await getArticle(params.slug);
  const allArticles = await getAllArticles();

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

  // Breadcrumb Schema for better navigation in SERPs
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteUrl
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: `${siteUrl}/blog`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: article.category,
        item: `${siteUrl}/blog?category=${encodeURIComponent(article.category)}`
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: article.title,
        item: `${siteUrl}/${article.slug}`
      }
    ]
  };

  // FAQ Schema (if article has FAQ sections)
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `What is ${article.title.toLowerCase().replace('10 ', '').replace('a guide to ', '')}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: article.description
        }
      }
    ]
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
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
                        <Image
                          src={article.image}
                          alt={`${article.title} - Hashtag Web3 article cover`}
                          width={1200}
                          height={630}
                          className={cn("rounded-lg shadow-xl mb-8 w-full md:max-w-4xl h-auto"
                          )}
                          priority
                          data-ai-hint={`${article['data-ai-hint'] || ''}`}
                        />
                    )}
                    
                    <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
                      <ArticleContent content={article.content} />
                    </div>
                    <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
                      <ArticleContent content={article.content} />
                    </div>

                    <RelatedArticles 
                      allArticles={allArticles}
                      currentCategory={article.category}
                      currentSlug={article.slug}
                    />

                    <Card className="mt-12 bg-card border-dashed backdrop-blur-none">
                      <CardContent className="p-8 text-center">
                          <h3 className="text-2xl font-bold text-primary mb-2">Looking for a Web3 Job?</h3>
                          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                              Get the best Web3, crypto, and blockchain jobs delivered directly to you. Join our Telegram channel with over 60,000 subscribers.
                          </p>
                          <a href="https://t.me/web3hiring" target="_blank" rel="noopener noreferrer">
                              <Button size="lg">
                                  <Rss className="mr-2 h-5 w-5" />
                                  Join Web3 Jobs Feed
                              </Button>
                          </a>
                      </CardContent>
                    </Card>
                 </Suspense>
              </div>
            </article>
        </div>
      </main>
    </div>
  );
}
