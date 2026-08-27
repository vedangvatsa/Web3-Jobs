import { getAllTerms, getCategoriesWithCounts, getGlossaryStats } from '@/lib/glossary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BookOpen, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
 title: 'Web3 Glossary',
 description: 'Web3 glossary covering blockchain, cryptocurrency, DeFi, and NFT terminology with plain-language explanations.',
 alternates: {
  canonical: 'https://hashtagweb3.com/glossary',
 },
 openGraph: {
  type: 'website',
  title: 'Web3 Glossary | Hashtag Web3',
  description: 'Complete guide to Web3 terminology. Understand blockchain, DeFi, NFTs, and cryptocurrency concepts.',
  url: 'https://hashtagweb3.com/glossary',
  images: [{
   url: 'https://hashtagweb3.com/api/og?type=default&title=Web3%20Glossary',
   width: 1200,
   height: 630,
   alt: 'Web3 Glossary',
  }],
 },
 twitter: {
  card: 'summary_large_image',
  title: 'Web3 Glossary | Hashtag Web3',
  description: 'Explore 200+ Web3 and cryptocurrency terms. Complete guide to blockchain, DeFi, NFTs, and decentralized technology concepts.',
  images: ['https://hashtagweb3.com/api/og?type=default&title=Web3%20Glossary'],
 },
};

export const revalidate = 86400; // Revalidate daily

// Force static generation for better performance
export const dynamic = 'force-static';

export default async function GlossaryPage({
 searchParams,
}: {
 searchParams: { category?: string };
}) {
 const allTerms = await getAllTerms();
 const categories = await getCategoriesWithCounts();
 const stats = await getGlossaryStats();
 
 // Filter by category if provided
 const filteredTerms = searchParams.category
  ? allTerms.filter(term => term.category === searchParams.category)
  : allTerms;
 
 // Group terms by first letter
 const termsByLetter = filteredTerms.reduce((acc, term) => {
  const firstLetter = term.term[0].toUpperCase();
  if (!acc[firstLetter]) acc[firstLetter] = [];
  acc[firstLetter].push(term);
  return acc;
 }, {} as Record<string, typeof allTerms>);
 
 const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
 const availableLetters = Object.keys(termsByLetter).sort();

 const siteUrl = 'https://hashtagweb3.com';
 const glossaryPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  '@id': `${siteUrl}/glossary#page`,
  url: `${siteUrl}/glossary`,
  name: 'Web3 Glossary | Hashtag Web3',
  description: 'Complete guide to Web3, blockchain, DeFi, NFT, and crypto terminology with plain-language explanations.',
  isPartOf: {
   '@type': 'WebSite',
   url: siteUrl,
   name: 'Hashtag Web3',
  },
  about: {
   '@type': 'DefinedTermSet',
   '@id': `${siteUrl}/glossary#termset`,
   name: 'Web3 Glossary',
   description: 'Comprehensive taxonomy of blockchain, DeFi, and cryptocurrency terms',
   url: `${siteUrl}/glossary`,
  },
  breadcrumb: {
   '@type': 'BreadcrumbList',
   itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
    { '@type': 'ListItem', position: 2, name: 'Glossary', item: `${siteUrl}/glossary` },
   ],
  },
 };

 return (
  <div className="flex flex-col min-h-screen">
   <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(glossaryPageSchema) }}
   />
      <main className="flex-grow">
    {/* Hero Section */}
    <section className="border-b">
     <div className="container mx-auto px-4 page-section max-w-6xl">
      <div className="max-w-3xl">
        {searchParams.category ? (
         <>
          <div className="mb-4">
           <Link href="/glossary" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            All Terms
           </Link>
          </div>
          <PageHeader title={searchParams.category} align="left" className="mb-0" />
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
           Browse all {searchParams.category} terms in our Web3 glossary.
          </p>
         </>
        ) : (
         <>
          <PageHeader title="Web3 Glossary" align="left" className="mb-0" />
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
           Your complete guide to blockchain, cryptocurrency, and decentralized technology terminology. 
           From basic concepts to advanced protocols, understand the language that powers Web3.
          </p>
         <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
           <BookOpen className="h-5 w-5 text-primary" />
           <span><strong>{stats.totalTerms}</strong> terms</span>
          </div>
          <div className="flex items-center gap-2">
           <TrendingUp className="h-5 w-5 text-primary" />
           <span><strong>{stats.totalCategories}</strong> categories</span>
          </div>
         </div>
        </>
       )}
      </div>
     </div>
    </section>

    {/* Alphabet Navigation */}
    <section className="border-b bg-muted/30">
     <div className="container mx-auto px-4 page-section max-w-6xl">
      <div className="flex flex-wrap gap-2 justify-center">
       {alphabet.map(letter => (
        <Link
         key={letter}
         href={`#${letter.toLowerCase()}`}
         className={`w-10 h-10 flex items-center justify-center rounded-md font-semibold transition-colors ${
          availableLetters.includes(letter)
           ? 'bg-primary text-primary-foreground hover:bg-primary/90'
           : 'bg-muted text-muted-foreground cursor-not-allowed'
         }`}
        >
         {letter}
        </Link>
       ))}
      </div>
     </div>
    </section>

    {/* Categories - only show when not filtering */}
    {!searchParams.category && (
     <section className="container mx-auto px-4 page-section max-w-6xl">
      <div className="mb-8">
       <h2 className="text-3xl font-bold mb-2">Browse by category</h2>
       <p className="text-muted-foreground">Explore terms organized by Web3 sector</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
       {categories.filter(cat => cat.termCount && cat.termCount > 0).map((category) => (
        <Link key={category.slug} href={`/glossary/${category.slug}`}>
         <Card className="group hover:border-primary transition-all h-full">
         <CardHeader>
          <CardTitle className="text-lg group-hover:text-primary transition-colors flex items-center justify-between">
           {category.name}
           <Badge variant="secondary">{category.termCount}</Badge>
          </CardTitle>
         </CardHeader>
         <CardContent>
          <p className="text-sm text-muted-foreground">{category.description}</p>
         </CardContent>
        </Card>
       </Link>
      ))}
     </div>
    </section>
    )}

    {/* All Terms Alphabetically */}
    <section className="container mx-auto px-4 page-section max-w-6xl border-t">
     <div className="mb-8">
      <h2 className="text-3xl font-bold mb-2">{searchParams.category ? `${searchParams.category} Terms` : 'All terms'}</h2>
      <p className="text-muted-foreground">{searchParams.category ? `${filteredTerms.length} terms in this category` : 'Complete alphabetical listing'}</p>
     </div>
     
     {availableLetters.map(letter => (
      <div key={letter} id={letter.toLowerCase()} className="mb-12 scroll-mt-20">
       <h3 className="text-2xl font-bold mb-4 pb-2 border-b">{letter}</h3>
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {termsByLetter[letter].map((term) => (
         <Link key={term.slug} href={`/${term.slug}`}>
          <Card className="group hover:border-primary hover:shadow-sm transition-all h-full">
           <CardContent className="p-4">
            <h4 className="font-semibold group-hover:text-foreground transition-colors mb-2">
             {term.term}
            </h4>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
             {term.description}
            </p>

           </CardContent>
          </Card>
         </Link>
        ))}
       </div>
      </div>
     ))}
    </section>
   </main>
  </div>
 );
}
