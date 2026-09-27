import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, Clock, ArrowLeft, ArrowRight } from 'lucide-react';
import { Quiz } from '@/components/quiz';
import { PageHeader } from '@/components/page-header';
import { PageShell } from '@/components/page-shell';
import { Badge } from '@/components/ui/badge';
import { JsonLd } from '@/components/json-ld';
import { getCategory, getLesson, getLessons, getAdjacentLessons } from '@/lib/learn';
import { getCoursePath, getLessonPath } from '@/lib/learn-routes';
import { renderLessonContent } from '@/lib/learn-content';

export const LEARN_CONTENT_CLASS = [
  'learn-content prose prose-neutral dark:prose-invert max-w-none',
  'prose-headings:font-semibold prose-headings:tracking-tight prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3',
  'prose-p:leading-7 prose-p:mb-4 prose-li:leading-7 prose-strong:font-semibold prose-a:text-primary prose-a:no-underline hover:prose-a:underline',
  'prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm [--tw-prose-pre-code:hsl(var(--foreground))]',
  'prose-pre:bg-muted prose-pre:text-foreground prose-pre:border prose-pre:rounded-lg [&_pre_code]:text-foreground',
  '[&_svg]:mx-auto [&_svg]:block [&_svg]:h-auto [&_.diagram]:my-6 [&_.diagram]:overflow-x-auto [&_.diagram]:rounded-lg [&_.diagram]:border [&_.diagram]:bg-muted/30 [&_.diagram]:p-4',
  '[&_.diagram_svg]:my-0 [&_.diagram_svg]:min-w-[42rem] [&_.diagram_svg]:max-w-none [&_.diagram_svg]:w-full',
  '[&_.callout]:my-6 [&_.callout]:p-4 [&_.callout]:border-l-4 [&_.callout]:border-primary [&_.callout]:bg-primary/5 [&_.callout]:rounded-r-lg',
  '[&_.comparison-table]:my-6 [&_.comparison-table]:overflow-x-auto [&_table]:w-full [&_table]:border-collapse [&_th]:text-left [&_th]:p-3 [&_th]:border-b-2 [&_th]:font-semibold [&_td]:p-3 [&_td]:border-b',
].join(' ');

export default async function LearnLessonPage({ categorySlug, lessonSlug }: { categorySlug: string; lessonSlug: string }) {
  const lesson = getLesson(categorySlug, lessonSlug);
  const category = getCategory(categorySlug);
  if (!lesson || !category) notFound();
  const lessons = getLessons(categorySlug);
  const { prev, next } = getAdjacentLessons(categorySlug, lessonSlug);
  const siteUrl = 'https://hashtagweb3.com';
  const lessonUrl = siteUrl + getLessonPath(categorySlug, lessonSlug);
  const html = await renderLessonContent(lesson.content, categorySlug, lessonSlug);

  return (
    <div className="flex min-h-screen flex-col">
      <JsonLd data={{
        '@context': 'https://schema.org', '@type': 'TechArticle', headline: lesson.title,
        description: lesson.description, proficiencyLevel: lesson.difficulty, url: lessonUrl,
        author: { '@type': 'Organization', name: 'Hashtag Web3', url: siteUrl },
        publisher: { '@type': 'Organization', name: 'Hashtag Web3', url: siteUrl },
        mainEntityOfPage: { '@type': 'WebPage', '@id': lessonUrl },
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
          { '@type': 'ListItem', position: 2, name: 'Learn', item: `${siteUrl}/learn` },
          { '@type': 'ListItem', position: 3, name: category.title, item: siteUrl + getCoursePath(categorySlug) },
          { '@type': 'ListItem', position: 4, name: lesson.title, item: lessonUrl },
        ],
      }} />
      <main className="flex-grow" id="main-content">
        <PageShell>
          <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
            <aside className="hidden w-56 shrink-0 lg:block">
              <div className="sticky top-24">
                <Link href={getCoursePath(categorySlug)} className="mb-4 block text-sm font-semibold">{category.title}</Link>
                <nav className="space-y-0.5" aria-label="Course lessons">
                  {lessons.map(item => (
                    <Link key={item.slug} href={getLessonPath(categorySlug, item.slug)} aria-current={item.slug === lessonSlug ? 'page' : undefined}
                      className={`block rounded-md px-3 py-2 text-sm ${item.slug === lessonSlug ? 'border-l-2 border-primary bg-primary/10 font-medium text-primary' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}`}>
                      {item.title}
                    </Link>
                  ))}
                </nav>
              </div>
            </aside>
            <article className="min-w-0 max-w-4xl flex-1">
              <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <Link href="/learn" className="hover:text-foreground">Learn</Link>
                <ChevronRight className="h-3 w-3 shrink-0" />
                <Link href={getCoursePath(categorySlug)} className="hover:text-foreground">{category.title}</Link>
                <ChevronRight className="h-3 w-3 shrink-0" />
                <span className="text-foreground">{lesson.title}</span>
              </nav>
              <PageHeader title={lesson.title} />
              <div className="mb-8 flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{lesson.readTime}</span>
                <Badge variant="secondary" className="text-[10px] uppercase">{lesson.difficulty}</Badge>
              </div>
              <div className={LEARN_CONTENT_CLASS} dangerouslySetInnerHTML={{ __html: html }} />
              {lesson.quiz.length > 0 && <Quiz questions={lesson.quiz} title={`Quiz: ${lesson.title}`} />}
              <nav aria-label="Adjacent lessons" className="mt-10 flex items-center justify-between gap-4 border-t pt-6">
                {prev ? <Link href={getLessonPath(categorySlug, prev.slug)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="h-4 w-4 shrink-0" />
                  <span><span className="block text-xs">Previous</span><span className="font-medium text-foreground">{prev.title}</span></span>
                </Link> : <span />}
                {next && <Link href={getLessonPath(categorySlug, next.slug)} className="flex items-center gap-2 text-right text-sm text-muted-foreground hover:text-foreground">
                  <span><span className="block text-xs">Next</span><span className="font-medium text-foreground">{next.title}</span></span>
                  <ArrowRight className="h-4 w-4 shrink-0" />
                </Link>}
              </nav>
            </article>
          </div>
        </PageShell>
      </main>
    </div>
  );
}
