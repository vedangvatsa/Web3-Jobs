import { Header } from '@/components/header';
import { getTermsByCategory, getCategory, getAllCategorySlugs } from '@/lib/glossary';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { generateCollectionPageSchema } from '@/lib/seo-utils';

// Category descriptions
const CATEGORY_CONTENT: Record<string, { description: string }> = {
 'blockchain-fundamentals': {
  description: 'Core concepts that form the foundation of blockchain technology and distributed systems.',
 },
 'cryptocurrencies': {
  description: 'Digital currencies and tokens that power decentralized networks and applications.',
 },
 'defi': {
  description: 'Decentralized financial protocols for lending, trading, and yield generation.',
 },
 'nfts': {
  description: 'Non-fungible tokens representing unique digital assets and ownership.',
 },
 'smart-contracts': {
  description: 'Self-executing code on blockchains that powers decentralized applications.',
 },
 'protocols': {
  description: 'Standards and frameworks that enable blockchain interoperability and functionality.',
 },
 'governance': {
  description: 'Mechanisms for decentralized decision-making and protocol management.',
 },
 'security': {
  description: 'Best practices and tools for protecting digital assets and private keys.',
 },
 'trading': {
  description: 'Market structures, liquidity mechanisms, and trading strategies in crypto.',
 },
 'technical': {
  description: 'Infrastructure and technical concepts powering blockchain networks.',
 },
};

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
 // All glossary categories are generated on-demand via ISR.
 return [];
}

export async function generateMetadata({ params }: { params: { category: string } }): Promise<Metadata> {
 const category = await getCategory(params.category);
 
 if (!category) {
  return {
   title: 'Category Not Found',
  };
 }

 const content = CATEGORY_CONTENT[params.category];
 const siteUrl = 'https://hashtagweb3.com';
 const categoryUrl = `${siteUrl}/glossary/${params.category}`;
 const categoryDescription = content?.description || category.description;

 return {
  title: `${category.name} - Web3 Glossary | Hashtag Web3`,
  description: categoryDescription,
  keywords: [
   category.name.toLowerCase(),
   'web3',
   'glossary',
   'blockchain',
   'cryptocurrency',
   'guide'
  ],
  alternates: {
   canonical: categoryUrl,
  },
  openGraph: {
   title: `${category.name} - Web3 Glossary`,
   description: categoryDescription,
   url: categoryUrl,
   type: 'website',
   images: [{
    url: 'https://hashtagweb3.com/og-image.png',
    width: 1200,
    height: 630,
    alt: `${category.name} - Web3 Glossary`,
   }],
  },
  twitter: {
   card: 'summary_large_image',
   title: `${category.name} - Web3 Glossary`,
   description: categoryDescription,
   images: ['https://hashtagweb3.com/og-image.png'],
  },
 };
}

export default async function CategoryPage({ params }: { params: { category: string } }) {
 const category = await getCategory(params.category);
 const terms = await getTermsByCategory(params.category);

 if (!category || terms.length === 0) {
  notFound();
 }

 const content = CATEGORY_CONTENT[params.category];
 
 // Generate schema markup for the collection page
 const collectionPageSchema = generateCollectionPageSchema(
  category.name,
  content?.description || category.description,
  category.termCount ?? 0,
  terms,
  params.category,
  'https://hashtagweb3.com'
 );

 // Group terms by difficulty
 const beginnerTerms = terms.filter(t => t.difficulty === 'Beginner');
 const intermediateTerms = terms.filter(t => t.difficulty === 'Intermediate');
 const advancedTerms = terms.filter(t => t.difficulty === 'Advanced');

 return (
  <div className="flex flex-col min-h-screen">
   <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageSchema) }}
   />
   <Header />
   <main className="flex-grow">
    {/* Hero Section */}
    <section className="border-b">
     <div className="container mx-auto px-4 py-12 md:py-20 max-w-7xl">
      <div className="max-w-3xl">
       <div className="mb-4">
        <Link href="/glossary" className="text-sm text-muted-foreground hover:text-primary">
         ← Web3 Glossary
        </Link>
       </div>
       <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
        {category.name}
       </h1>
       <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
        {content?.description || category.description}
       </p>
       <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
         <BookOpen className="h-5 w-5 text-primary" />
         <span><strong>{category.termCount}</strong> terms</span>
        </div>
        {beginnerTerms.length > 0 && (
         <div className="flex items-center gap-2">
          <Badge variant="default">Beginner</Badge>
          <span>{beginnerTerms.length}</span>
         </div>
        )}
        {intermediateTerms.length > 0 && (
         <div className="flex items-center gap-2">
          <Badge variant="secondary">Intermediate</Badge>
          <span>{intermediateTerms.length}</span>
         </div>
        )}
        {advancedTerms.length > 0 && (
         <div className="flex items-center gap-2">
          <Badge variant="outline">Advanced</Badge>
          <span>{advancedTerms.length}</span>
         </div>
        )}
       </div>
      </div>
     </div>
    </section>

    {/* Terms Grid */}
    <section className="container mx-auto px-4 py-12 max-w-7xl">{/* Beginner Terms */}
     {beginnerTerms.length > 0 && (
      <div className="mb-12">
       <div className="flex items-center gap-3 mb-6">
        <Badge variant="default" className="text-sm">Beginner</Badge>
        <h2 className="text-2xl font-bold">Start here</h2>
       </div>
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {beginnerTerms.map((term) => (
         <Link key={term.slug} href={`/${term.slug}`}>
          <Card className="group hover:border-primary hover:shadow-sm transition-all h-full">
           <CardContent className="p-5">
            <h3 className="font-bold text-lg group-hover:text-foreground transition-colors mb-2">
             {term.term}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-3">
             {term.description}
            </p>
           </CardContent>
          </Card>
         </Link>
        ))}
       </div>
      </div>
     )}

     {/* Intermediate Terms */}
     {intermediateTerms.length > 0 && (
      <div className="mb-12">
       <div className="flex items-center gap-3 mb-6">
        <Badge variant="secondary" className="text-sm">Intermediate</Badge>
        <h2 className="text-2xl font-bold">Build your knowledge</h2>
       </div>
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {intermediateTerms.map((term) => (
         <Link key={term.slug} href={`/${term.slug}`}>
          <Card className="group hover:border-primary hover:shadow-sm transition-all h-full">
           <CardContent className="p-5">
            <h3 className="font-bold text-lg group-hover:text-foreground transition-colors mb-2">
             {term.term}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-3">
             {term.description}
            </p>
           </CardContent>
          </Card>
         </Link>
        ))}
       </div>
      </div>
     )}

     {/* Advanced Terms */}
     {advancedTerms.length > 0 && (
      <div className="mb-12">
       <div className="flex items-center gap-3 mb-6">
        <Badge variant="outline" className="text-sm">Advanced</Badge>
        <h2 className="text-2xl font-bold">Expert level</h2>
       </div>
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {advancedTerms.map((term) => (
         <Link key={term.slug} href={`/${term.slug}`}>
          <Card className="group hover:border-primary hover:shadow-sm transition-all h-full">
           <CardContent className="p-5">
            <h3 className="font-bold text-lg group-hover:text-foreground transition-colors mb-2">
             {term.term}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-3">
             {term.description}
            </p>
           </CardContent>
          </Card>
         </Link>
        ))}
       </div>
      </div>
     )}
    </section>
   </main>
  </div>
 );
}
