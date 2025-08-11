
import { getAllArticles } from '@/lib/articles';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';

const siteConfig = {
  name: "Hashtag Web3",
  url: "https://web3-jobs.example.com",
};

export const metadata: Metadata = {
  title: "Blog",
  description: "Insights, guides, and news from the world of Web3.",
  openGraph: {
    title: "Hashtag Web3 Blog",
    description: "Insights, guides, and news from the world of Web3.",
    url: `${siteConfig.url}/blog`,
    images: [
      {
        url: `${siteConfig.url}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Hashtag Web3 Blog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hashtag Web3 Blog",
    description: "Insights, guides, and news from the world of Web3.",
    images: [`${siteConfig.url}/og-image.png`],
  },
};


export default async function BlogIndexPage() {
  const articles = await getAllArticles();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <section className="text-center mb-12 max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary">
              Our Blog
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Insights, guides, and news from the world of Web3.
            </p>
          </section>

          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            {articles.map((article) => (
               <Card key={article.slug} className="flex flex-col transform transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
                 <Link href={`/${article.slug}`} className="block h-full">
                   <div className="relative w-full h-48">
                     <Image
                       src={article.image}
                       alt={article.title}
                       fill
                       className="object-cover rounded-t-lg"
                       sizes="(max-width: 768px) 100vw, 50vw"
                       data-ai-hint={`${article.slug.replace(/-/g, ' ')}`}
                     />
                   </div>
                   <CardHeader className="flex-grow">
                     <CardTitle className="text-xl">{article.title}</CardTitle>
                     <CardDescription className="pt-2">{article.description}</CardDescription>
                   </CardHeader>
                 </Link>
               </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
