
import { getAllArticles } from '@/lib/articles';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import Link from 'next/link';

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
              <Card key={article.slug} className="h-full transform transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
                <Link href={`/blog/${article.slug}`} className="block h-full">
                  <CardHeader>
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
