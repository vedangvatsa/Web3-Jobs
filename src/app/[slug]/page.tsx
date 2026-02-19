
import { getArticle, getAllArticles } from '@/lib/articles';
import { getTerm, getAllTerms } from '@/lib/glossary';
import { notFound } from 'next/navigation';
import { Header } from '@/components/header';
import { GlossaryCTA } from '@/components/glossary-cta';
import Image from 'next/image';
import { Metadata } from 'next';
import type { Article as ArticleSchema, ScholarlyArticle, BreadcrumbList } from 'schema-dts';
import { ArticleContent } from '@/components/article-content';
import { RelatedArticles } from '@/components/related-articles';
import { Suspense } from 'react';
import { cn } from '@/lib/utils';
import { addInternalLinksToContent, generateDefinedTermSchema, generateGlossaryMetaDescription } from '@/lib/seo-utils';
import { GlossaryViewTracker } from '@/components/tracking/glossary-view-tracker';
import { ArticleViewTracker } from '@/components/tracking/article-view-tracker';

type ArticlePageProps = {
  params: {
    slug: string;
  };
};

export async function generateStaticParams() {
  const articles = await getAllArticles();
  const terms = await getAllTerms();
  return [
    ...terms.map((term) => ({ slug: term.slug })),
    ...articles.map((article) => ({ slug: article.slug })),
  ];
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  // Check if it's a glossary term first
  const term = await getTerm(params.slug);
  if (term) {
    const siteUrl = 'https://hashtagweb3.com';
    const termUrl = `${siteUrl}/${term.slug}`;
    const metaDescription = generateGlossaryMetaDescription(term);
    
    return {
      title: `${term.term} - Web3 Glossary | Hashtag Web3`,
      description: metaDescription,
      keywords: [term.term, ...term.synonyms || [], term.category, 'web3', 'crypto', 'blockchain', 'glossary'],
      alternates: {
        canonical: termUrl,
      },
      openGraph: {
        title: `${term.term} - Web3 Glossary`,
        description: metaDescription,
        url: termUrl,
        images: term.image ? [{ url: term.image, alt: term.imageAlt || term.term }] : [],
        type: 'article',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${term.term} - Web3 Glossary`,
        description: metaDescription,
        images: term.image ? [term.image] : [],
      },
    };
  }
  
  // Fall back to article
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
  // Check if it's a glossary term first
  const term = await getTerm(params.slug);
  if (term) {
    const siteUrl = 'https://hashtagweb3.com';
    const allTerms = await getAllTerms();
    const relatedTermsData = term.relatedTerms
      .map(relatedSlug => allTerms.find(t => t.slug === relatedSlug || t.term === relatedSlug))
      .filter(Boolean);
    
    // Add internal links to content for related terms
    const enhancedContent = addInternalLinksToContent(term.content, term, allTerms);
    
    const definedTermSchema = generateDefinedTermSchema(term, siteUrl, relatedTermsData);
    
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
          name: 'Glossary',
          item: `${siteUrl}/glossary`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: term.term,
          item: `${siteUrl}/${term.slug}`,
        },
      ],
    };
    
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <GlossaryViewTracker term={term.term} category={term.category} difficulty={term.difficulty} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(definedTermSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
        <Header />
        <main className="flex-1">
          <div className="bg-background">
            <article className="container mx-auto px-4 py-8 max-w-7xl">
              <div className="grid md:grid-cols-[1fr_300px] gap-8">
                {/* Main Content */}
                <div>
                  <header className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                      <a href="/glossary" className="text-sm text-muted-foreground hover:text-primary">
                        ← Web3 Glossary
                      </a>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                      {term.term}
                    </h1>
                    <p className="text-xl text-muted-foreground mb-4">
                      {term.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-primary/10 text-primary rounded-md text-sm font-medium">
                        {term.category}
                      </span>
                      <span className={`px-3 py-1 rounded-md text-sm font-medium ${
                        term.difficulty === 'Beginner' ? 'bg-green-500/10 text-green-700 dark:text-green-400' :
                        term.difficulty === 'Intermediate' ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400' :
                        'bg-red-500/10 text-red-700 dark:text-red-400'
                      }`}>
                        {term.difficulty}
                      </span>
                    </div>
                  </header>
                  
                  {term.image && (
                    <div className="relative w-full aspect-[21/9] overflow-hidden rounded-lg mb-8">
                      <Image
                        src={term.image}
                        alt={term.imageAlt || term.term}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 900px"
                        priority
                      />
                    </div>
                  )}
                  
                  <div 
                    className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-primary prose-a:underline"
                    dangerouslySetInnerHTML={{ __html: enhancedContent }}
                  />
                  
                  <GlossaryCTA termName={term.term} />
                </div>
                
                {/* Sidebar */}
                <aside className="space-y-6">
                  {/* Related Terms */}
                  {relatedTermsData.length > 0 && (
                    <div className="border rounded-lg p-6">
                      <h3 className="font-bold mb-4">Related Terms</h3>
                      <div className="space-y-2">
                        {relatedTermsData.map((relatedTerm) => (
                          <a
                            key={relatedTerm.slug}
                            href={`/${relatedTerm.slug}`}
                            className="block p-3 rounded-md hover:bg-muted transition-colors"
                          >
                            <div className="font-medium text-sm">{relatedTerm.term}</div>
                            <div className="text-xs text-muted-foreground line-clamp-2 mt-1">
                              {relatedTerm.description}
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Synonyms */}
                  {term.synonyms && term.synonyms.length > 0 && (
                    <div className="border rounded-lg p-6">
                      <h3 className="font-bold mb-3">Also known as</h3>
                      <div className="flex flex-wrap gap-2">
                        {term.synonyms.map((synonym) => (
                          <span key={synonym} className="px-2 py-1 bg-muted rounded text-sm">
                            {synonym}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* CTA */}
                  <div className="border rounded-lg p-6 bg-primary/5">
                    <h3 className="font-bold mb-2">Work in Web3</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Explore companies hiring for roles involving {term.term}
                    </p>
                    <a 
                      href="/jobs" 
                      className="block w-full text-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
                    >
                      Browse Jobs
                    </a>
                  </div>
                </aside>
              </div>
            </article>
          </div>
        </main>
      </div>
    );
  }
  
  // Fall back to article
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
      <ArticleViewTracker slug={article.slug} title={article.title} category={article.category} />
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
            
            <RelatedArticles 
              allArticles={allArticles.map(({ content, ...rest }) => rest)}
              currentCategory={article.category}
              currentSlug={article.slug}
            />
        </div>
      </main>
    </div>
  );
}
