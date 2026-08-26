import { getTermsByCategory, getCategory } from '@/lib/glossary';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { generateCollectionPageSchema } from '@/lib/seo-utils';
import { PageHeader } from "@/components/page-header";

// Category descriptions
const CATEGORY_CONTENT: Record<string, { description: string }> = {
 'blockchain-fundamentals': {
  description: 'Master core blockchain concepts including distributed ledgers, consensus mechanisms, mining, and the foundational technology powering decentralized networks and Web3 applications.',
 },
 'cryptocurrencies': {
  description: 'Explore digital currencies and tokens including Bitcoin, Ethereum, stablecoins, and altcoins that power decentralized networks, DeFi protocols, and the broader Web3 ecosystem.',
 },
 'defi': {
  description: 'Understand decentralized finance protocols including lending platforms, automated market makers, yield farming strategies, liquidity pools, and permissionless financial services.',
 },
 'nfts': {
  description: 'Learn about non-fungible tokens including digital art, gaming assets, membership passes, and the standards and marketplaces driving unique digital ownership on-chain.',
 },
 'smart-contracts': {
  description: 'Explore self-executing programs deployed on blockchains, including Solidity development, contract security, gas optimization, and building decentralized applications.',
 },
 'protocols': {
  description: 'Discover blockchain protocols and standards enabling cross-chain interoperability, layer-2 scaling solutions, token standards, and decentralized infrastructure.',
 },
 'governance': {
  description: 'Understand decentralized governance mechanisms including DAOs, on-chain voting, token-weighted proposals, treasury management, and community-driven protocol decisions.',
 },
 'security': {
  description: 'Learn blockchain security best practices including wallet protection, private key management, smart contract auditing, phishing prevention, and safe DeFi interaction.',
 },
 'trading': {
  description: 'Master crypto trading concepts including order types, DEX and CEX mechanics, liquidity provision, technical analysis, market making, and on-chain trading strategies.',
 },
 'technical': {
  description: 'Explore technical blockchain infrastructure including nodes, validators, rollups, data availability layers, cryptographic primitives, and network architecture.',
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
  title: `${category.name} - Web3 Glossary`,
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
    url: 'https://hashtagweb3.com/api/og?type=default&title=Web3%20Glossary',
    width: 1200,
    height: 630,
    alt: `${category.name} - Web3 Glossary`,
   }],
  },
  twitter: {
   card: 'summary_large_image',
   title: `${category.name} - Web3 Glossary`,
   description: categoryDescription,
   images: ['https://hashtagweb3.com/api/og?type=default&title=Web3%20Glossary'],
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
      <main className="flex-grow">
    {/* Hero Section */}
    <section className="border-b">
     <div className="container mx-auto px-4 page-section max-w-6xl">
      <div className="max-w-3xl">
       <div className="mb-4">
        <Link href="/glossary" className="text-sm text-muted-foreground hover:text-primary">
         ← Web3 Glossary
        </Link>
       </div>
       <PageHeader title={category.name} />
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
    <section className="container mx-auto px-4 py-12 max-w-6xl">{/* Beginner Terms */}
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
