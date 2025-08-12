
import { getArticle, getAllArticles } from '@/lib/articles';
import { notFound } from 'next/navigation';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import Image from 'next/image';
import { Metadata } from 'next';
import type { Article as ArticleSchema } from 'schema-dts';
import { ArticleContent } from '@/components/article-content';

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

  const siteUrl = 'https://web3-jobs.example.com';

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
  
  const siteUrl = 'https://web3-jobs.example.com';
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
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <div className="flex flex-col min-h-screen bg-background">
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
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <ArticleContent content={article.content} />
              </div>
            </div>
          </article>
        </main>
        <Footer />
      </div>
    </>
  );
}
