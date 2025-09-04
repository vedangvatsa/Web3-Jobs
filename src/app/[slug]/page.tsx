
import { getArticle, getAllArticles } from '@/lib/articles';
import { notFound } from 'next/navigation';
import { Header } from '@/components/header';
import Image from 'next/image';
import { Metadata } from 'next';
import type { Article as ArticleSchema } from 'schema-dts';
import { ArticleContent } from '@/components/article-content';
import { Button } from '@/components/ui/button';
import { Rss } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

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

  const siteUrl = 'https://jobs.hashtagweb3.com';

  return {
    title: article.title,
    description: article.description,
    openGraph: {
      title: article.title,
      description: article.description,
      type: 'article',
      url: `${siteUrl}/${article.slug}`,
      images: [
        {
          url: article.image,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.description,
      images: [article.image],
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const article = await getArticle(params.slug);

  if (!article) {
    notFound();
  }
  
  const siteUrl = 'https://jobs.hashtagweb3.com';
  const articleSchema: ArticleSchema = {
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    image: article.image,
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

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <Header />
      <main className="flex-1">
        <article className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <header className="mb-8">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary mb-4">
                {article.title}
              </h1>
              <p className="text-lg text-muted-foreground">
                {article.description}
              </p>
            </header>
            <Image
              src={article.image}
              alt={article.title}
              width={1200}
              height={630}
              className="rounded-lg shadow-xl mb-8"
              priority
              data-ai-hint={`${article.slug.replace(/-/g, ' ')}`}
            />
            <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
              <ArticleContent content={article.content} />
            </div>

            <Card className="bg-secondary/40 border-dashed">
              <CardContent className="p-8 text-center">
                  <h3 className="text-2xl font-bold text-primary mb-2">Looking for a Web3 Job?</h3>
                  <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                      Get the best Web3, crypto, and blockchain jobs delivered directly to you. Join our Telegram channel with over 58,000 subscribers.
                  </p>
                  <a href="https://t.me/web3hiring" target="_blank" rel="noopener noreferrer">
                      <Button size="lg">
                          <Rss className="mr-2 h-5 w-5" />
                          Join Web3 Jobs Feed
                      </Button>
                  </a>
              </CardContent>
            </Card>

          </div>
        </article>
      </main>
    </div>
  );
}
