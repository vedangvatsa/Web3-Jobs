
import { getArticles } from '@/content/articles';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

export const metadata: Metadata = {
  title: 'Web3 Job Articles & Guides',
  description: 'In-depth articles and guides on landing a job in Web3, crypto, and blockchain. Explore career paths, salary expectations, and interview tips.',
};

export default function ArticlesPage() {
  const articles = getArticles();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 md:py-16">
          <section className="text-center mb-12">
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-primary">
              Web3 Career Guides
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
              Your essential resource for navigating the Web3 job market. Explore in-depth articles on everything from smart contract auditing to DAO governance.
            </p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <Link key={article.slug} href={`/articles/${article.slug}`} className="block group">
                <Card className="flex flex-col h-full rounded-xl shadow-sm transition-all duration-300 group-hover:shadow-lg border overflow-hidden">
                  <CardHeader className="p-0">
                    <Image
                      src={article.image}
                      alt={article.title}
                      width={600}
                      height={400}
                      className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                      data-ai-hint={article.slug.replace(/-/g, ' ')}
                    />
                  </CardHeader>
                  <CardContent className="flex-grow p-6 flex flex-col">
                    <CardTitle className="text-xl leading-tight font-semibold mb-2 group-hover:text-primary transition-colors duration-300">{article.title}</CardTitle>
                    <p className="text-sm text-muted-foreground flex-grow">{article.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
