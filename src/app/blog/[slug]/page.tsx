
import { getArticle, getAllArticles } from '@/lib/articles';
import { notFound } from 'next/navigation';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import Image from 'next/image';
import { Metadata } from 'next';
import type { Article as ArticleSchema } from 'schema-dts';

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
    return {};
  }

  const siteUrl = 'https://web3-jobs.example.com';

  return {
    title: article.title,
    description: article.description,
    openGraph: {
      title: article.title,
      description: article.description,
      type: 'article',
      url: `${siteUrl}/blog/${article.slug}`,
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

const renderNode = (node: any, key: number) => {
    switch (node.type) {
        case 'text':
            if (node.style === 'bold') return <strong key={key}>{node.value}</strong>;
            if (node.style === 'italic') return <em key={key}>{node.value}</em>;
            return node.value;
        case 'link':
            return <a key={key} href={node.href} className="text-primary hover:underline">{node.value}</a>;
        default:
            return null;
    }
};

const renderBlock = (block: any, index: number) => {
  switch (block.type) {
    case 'h2':
      return <h2 key={index} className="text-3xl font-bold mt-8 mb-4">{block.children.map(renderNode)}</h2>;
    case 'h3':
      return <h3 key={index} className="text-2xl font-bold mt-6 mb-3">{block.children.map(renderNode)}</h3>;
    case 'p':
      return <p key={index} className="mb-4 leading-relaxed">{block.children.map(renderNode)}</p>;
    case 'ul':
      return <ul key={index} className="list-disc list-inside mb-4 pl-4 space-y-2">{block.children.map((li: any, i: number) => <li key={i}>{li.children.map(renderNode)}</li>)}</ul>;
    case 'blockquote':
        return <blockquote key={index} className="border-l-4 border-primary pl-4 italic my-6"><div className="flex flex-col gap-y-2">{block.children.map((p:any, i: number) => <p key={i}>{p.children.map(renderNode)}</p>)}</div></blockquote>
    case 'image':
      return (
        <figure key={index} className="my-8">
            <Image
                src={block.src}
                alt={block.alt}
                width={800}
                height={400}
                className="rounded-lg shadow-lg mx-auto"
                data-ai-hint={block['data-ai-hint']}
            />
            {block.caption && <figcaption className="text-center text-muted-foreground text-sm mt-2">{block.caption}</figcaption>}
        </figure>
      );
    default:
      return null;
  }
};


export default async function ArticlePage({ params }: ArticlePageProps) {
  const article = await getArticle(params.slug);

  if (!article) {
    notFound();
  }
  
  const articleSchema: ArticleSchema = {
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    image: article.image,
    author: {
        '@type': 'Organization',
        name: 'Hashtag Web3',
    },
    publisher: {
        '@type': 'Organization',
        name: 'Hashtag Web3',
        logo: {
            '@type': 'ImageObject',
            url: 'https://web3-jobs.example.com/logo.png'
        }
    },
    mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `https://web3-jobs.example.com/blog/${article.slug}`
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
              />
              <div className="prose prose-lg dark:prose-invert max-w-none">
                {article.content.map(renderBlock)}
              </div>
            </div>
          </article>
        </main>
        <Footer />
      </div>
    </>
  );
}
