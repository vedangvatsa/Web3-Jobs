
import { getArticle, getAllArticles } from '@/lib/articles';
import { getTerm, getAllTerms } from '@/lib/glossary';
import { getResourceByCanonicalSlug, getAllResourcePages } from '@/lib/pseo';
import { notFound } from 'next/navigation';
import { GlossaryCTA } from '@/components/glossary-cta';
import { GlossaryCharts } from '@/components/glossary-charts';
import Image from 'next/image';
import { Metadata } from 'next';
import type { Article as ArticleSchema, ScholarlyArticle, BreadcrumbList } from 'schema-dts';
import { ArticleContent } from '@/components/article-content';
import { RelatedArticles } from '@/components/related-articles';
import { ResourcePageView } from '@/components/pseo/resource-page-view';
import { Suspense } from 'react';
import { cn } from '@/lib/utils';
import { addInternalLinksToContent, generateDefinedTermSchema, generateGlossaryMetaDescription, extractFAQSchema, extractHowToSchema } from '@/lib/seo-utils';
import { GlossaryViewTracker } from '@/components/tracking/glossary-view-tracker';
import { ArticleViewTracker } from '@/components/tracking/article-view-tracker';
import { PageHeader } from "@/components/page-header";

type ArticlePageProps = {
 params: {
  slug: string;
 };
};

export const dynamicParams = true;
export const revalidate = 3600; // ISR: revalidate every hour

export async function generateStaticParams() {
 const articles = await getAllArticles();
 const resources = getAllResourcePages();
 // Pre-render only the 50 most recent articles + all resource pages at build time.
 // Remaining ~716 articles are generated on-demand via ISR (built on first request, then cached).
 // Glossary terms (157 pages) are also generated on-demand via ISR.
 const topArticles = articles
  .sort((a, b) => new Date(b.publishedDate || 0).getTime() - new Date(a.publishedDate || 0).getTime())
  .slice(0, 50);
 return [
  ...topArticles.map((article) => ({ slug: article.slug })),
  ...resources.map((r) => ({ slug: r.seo.canonicalSlug })),
 ];
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
 // Check if it's a resource page first
 const resource = getResourceByCanonicalSlug(params.slug);
 if (resource) {
  const siteUrl = 'https://hashtagweb3.com';
  const resourceUrl = `${siteUrl}/${resource.seo.canonicalSlug}`;
  const ogImageUrl = `${siteUrl}/api/og?type=article&title=${encodeURIComponent(resource.seo.title)}&category=${encodeURIComponent(resource.meta.contentType)}`;
  return {
   title: resource.seo.title,
   description: resource.seo.description,
   keywords: resource.seo.keywords,
   alternates: { canonical: resourceUrl },
   openGraph: {
    title: resource.seo.title,
    description: resource.seo.description,
    type: 'article',
    url: resourceUrl,
    images: [{ url: ogImageUrl, width: 1200, height: 630, alt: resource.seo.title }],
   },
   twitter: {
    card: 'summary_large_image',
    title: resource.seo.title,
    description: resource.seo.description,
    images: [ogImageUrl],
   },
  };
 }

 // Check if it's a glossary term
 const term = await getTerm(params.slug);
 if (term) {
  const siteUrl = 'https://hashtagweb3.com';
  const termUrl = `${siteUrl}/${term.slug}`;
  const metaDescription = generateGlossaryMetaDescription(term);
  const ogImageUrl = `${siteUrl}/api/og?type=article&title=${encodeURIComponent(term.term)}&category=${encodeURIComponent(term.category)}`;
  
  return {
   title: `${term.term} - Web3 Glossary`,
   description: metaDescription,
   keywords: [term.term, ...term.synonyms || [], term.category, 'web3', 'crypto', 'blockchain', 'glossary'],
   alternates: {
    canonical: termUrl,
   },
   openGraph: {
    title: `${term.term} - Web3 Glossary`,
    description: metaDescription,
    url: termUrl,
    images: [{ url: ogImageUrl, alt: `${term.term} - ${term.category}` }],
    type: 'article',
   },
   twitter: {
    card: 'summary_large_image',
    title: `${term.term} - Web3 Glossary`,
    description: metaDescription,
    images: [ogImageUrl],
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

 // Extract salary data from title if present
 const salaryMatch = article.title.match(/\$[\d,]+-\$[\d,]+K?/);
 const salary = salaryMatch ? salaryMatch[0] : undefined;
 
 // Generate dynamic OG image URL
 const ogImageUrl = `${siteUrl}/api/og?type=article&title=${encodeURIComponent(article.title)}&category=${encodeURIComponent(article.category)}${salary ? `&salary=${encodeURIComponent(salary)}` : ''}&date=2026`;

 const keywords = [
  'web3', 'crypto', 'blockchain',
  article.title,
  article.category,
  ...(article['data-ai-hint'] ? [article['data-ai-hint']] : [])
 ].filter((v, i, a) => a.indexOf(v) === i);

 const truncatedTitle = article.title.length > 44 ? article.title.slice(0, 41) + '...' : article.title;
 const truncatedDescription = article.description.length > 155 ? article.description.slice(0, 152) + '...' : article.description;

 return {
  title: truncatedTitle,
  description: truncatedDescription,
  keywords: keywords,
  alternates: {
   canonical: articleUrl,
  },
  openGraph: {
   title: article.title,
   description: article.description,
   type: 'article',
   url: articleUrl,
   images: [
    {
     url: ogImageUrl,
     width: 1200,
     height: 630,
     alt: `${article.title} - Hashtag Web3`,
    },
   ],
  },
  twitter: {
   card: 'summary_large_image',
   title: article.title,
   description: article.description,
   images: [ogImageUrl],
  },
 };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
 // Check if it's a resource page first
 const resource = getResourceByCanonicalSlug(params.slug);
 if (resource) {
  // Warn if multiple content types match the same slug
  const termCollision = await getTerm(params.slug);
  const articleCollision = await getArticle(params.slug);
  if (termCollision || articleCollision) {
   console.warn(`[slug collision]"${params.slug}" resolved as resource, but also matches: ${[termCollision ? 'glossary term' : '', articleCollision ? 'article' : ''].filter(Boolean).join(', ')}`);
  }
  const siteUrl = 'https://hashtagweb3.com';
  const pageUrl = `${siteUrl}/${resource.seo.canonicalSlug}`;
  const articleSchema = {
   '@context': 'https://schema.org',
   '@type': 'Article',
   headline: resource.seo.title,
   description: resource.seo.description,
   url: pageUrl,
   datePublished: resource.meta.generatedAt,
   dateModified: resource.meta.generatedAt,
   author: { '@type': 'Organization', name: 'Hashtag Web3', url: siteUrl },
   publisher: {
    '@type': 'Organization',
    name: 'Hashtag Web3',
    url: siteUrl,
    logo: { '@type': 'ImageObject', url: `${siteUrl}/logo.png` },
   },
   mainEntityOfPage: { '@type': 'WebPage', '@id': pageUrl },
   keywords: resource.seo.keywords.join(', '),
  };
  const breadcrumbSchema = {
   '@context': 'https://schema.org',
   '@type': 'BreadcrumbList',
   itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
    { '@type': 'ListItem', position: 2, name: 'Resources', item: `${siteUrl}/resources` },
    { '@type': 'ListItem', position: 3, name: resource.seo.title, item: pageUrl },
   ],
  };
  const nicheResources = getAllResourcePages().filter(
   (p) => p.meta.niche === resource.meta.niche && p.seo.canonicalSlug !== resource.seo.canonicalSlug
  );
  return (
   <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
    <ResourcePageView page={resource} nicheResources={nicheResources} />
   </>
  );
 }

 // Check if it's a glossary term
 const term = await getTerm(params.slug);
 if (term) {
  const siteUrl = 'https://hashtagweb3.com';
  const allTerms = await getAllTerms();
  const relatedTermsData = term.relatedTerms
   .map(relatedSlug => allTerms.find(t => t.slug === relatedSlug || t.term === relatedSlug))
   .filter((t): t is NonNullable<typeof t> => t != null);
  
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
        <main className="flex-1">
     <div className="bg-background">
      <article className="container mx-auto px-4 page-section max-w-6xl">
       <div className="grid md:grid-cols-[1fr_300px] gap-8">
        {/* Main Content */}
        <div>
         <header className="mb-8">
          <div className="flex items-center gap-2 mb-4">
           <a href="/glossary" className="text-sm text-muted-foreground hover:text-primary">
            ← Web3 Glossary
           </a>
          </div>
          <PageHeader title={term.term} />
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
         
         <GlossaryCharts termSlug={term.slug} />
         
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

 const scholarlyCategories = ["AI & The Future of Work","Web3 Career Guides"];
 const isScholarly = scholarlyCategories.includes(article.category);

 const faqSchema = article.rawContent ? extractFAQSchema(article.rawContent) : null;
 const howToSchema = article.rawContent ? extractHowToSchema(article.rawContent, article.title, article.description) : null;

 const articleSchema: ArticleSchema | ScholarlyArticle = {
  '@type': isScholarly ? 'ScholarlyArticle' : 'Article',
  headline: article.title,
  description: article.description,
  image: imageUrl,
  datePublished: article.publishedDate,
  dateModified: article.lastUpdated || article.publishedDate,
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
   {faqSchema && (
    <script
     type="application/ld+json"
     dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
    />
   )}
   {howToSchema && (
    <script
     type="application/ld+json"
     dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
    />
   )}
      <main className="flex-1">
    <div className="bg-[#fafafa] dark:bg-black transition-colors duration-200">
      <article className="site-container px-6 page-section">
       <div>
         <Suspense fallback={<div>Loading...</div>}>
          <header className="mb-12">
           {(article.lastUpdated || article.publishedDate) && (
            <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-[0.2em] mb-6">
             Hashtag Web3 / Updated{' '}
             <time dateTime={article.lastUpdated || article.publishedDate}>
              {new Date(article.lastUpdated || article.publishedDate!).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
             </time>
            </p>
           )}
           <PageHeader title={article.title} />
           <p className="text-[17px] text-zinc-500 dark:text-zinc-400 leading-[1.8] max-w-3xl">
            {article.description}
           </p>
          </header>
          
          {article.image && (
           <div
            className={cn("relative w-full md:max-w-6xl overflow-hidden rounded-lg shadow-sm mb-8","aspect-[16/9] max-h-[280px] sm:max-h-[320px] md:max-h-[360px]"
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
            <Suspense fallback={null}>
        <RelatedArticles
         allArticles={allArticles}
         currentCategory={article.category}
         currentSlug={article.slug}
        />
       </Suspense>
    </div>
   </main>
  </div>
 );
}
