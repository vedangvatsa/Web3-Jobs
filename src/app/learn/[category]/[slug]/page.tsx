import { Header } from '@/components/header';
import { getCategory, getLesson, getLessons, getAdjacentLessons } from '@/lib/learn';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, Clock, ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

interface Props {
  params: { category: string; slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const lesson = getLesson(params.category, params.slug);
  if (!lesson) return {};
  const category = getCategory(params.category);
  return {
    title: `${lesson.title} - ${category?.title || 'Learn'} | Hashtag Web3`,
    description: lesson.description,
    alternates: { canonical: `/learn/${params.category}/${params.slug}` },
  };
}

export async function generateStaticParams() {
  const { getCategories } = await import('@/lib/learn');
  const categories = getCategories();
  const params: { category: string; slug: string }[] = [];
  for (const cat of categories) {
    const lessons = getLessons(cat.slug);
    for (const lesson of lessons) {
      params.push({ category: cat.slug, slug: lesson.slug });
    }
  }
  return params;
}

const difficultyColors: Record<string, string> = {
  beginner: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  advanced: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export default function LessonPage({ params }: Props) {
  const lesson = getLesson(params.category, params.slug);
  if (!lesson) notFound();

  const category = getCategory(params.category);
  const allLessons = getLessons(params.category);
  const { prev, next } = getAdjacentLessons(params.category, params.slug);

  // Convert markdown to simple HTML (headings, paragraphs, bold, lists, code)
  const htmlContent = markdownToHtml(lesson.content);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="flex gap-8">
            {/* Sidebar */}
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-8">
                <Link
                  href={`/learn/${params.category}`}
                  className="text-sm font-semibold text-foreground mb-4 block"
                >
                  {category?.title}
                </Link>
                <nav className="space-y-0.5">
                  {allLessons.map((l) => (
                    <Link
                      key={l.slug}
                      href={`/learn/${params.category}/${l.slug}`}
                      className={`block text-sm py-2 px-3 rounded-md transition-colors ${
                        l.slug === params.slug
                          ? 'bg-primary/10 text-primary font-medium border-l-2 border-primary'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                    >
                      {l.title}
                    </Link>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Content */}
            <article className="flex-1 min-w-0 max-w-3xl">
              {/* Breadcrumb */}
              <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                <Link href="/learn" className="hover:text-foreground transition-colors">Learn</Link>
                <ChevronRight className="h-3 w-3" />
                <Link href={`/learn/${params.category}`} className="hover:text-foreground transition-colors">
                  {category?.title}
                </Link>
                <ChevronRight className="h-3 w-3" />
                <span className="text-foreground">{lesson.title}</span>
              </nav>

              <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
                {lesson.title}
              </h1>

              <div className="flex items-center gap-3 mb-8 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {lesson.readTime}
                </span>
                <Badge variant="secondary" className={`text-[10px] uppercase ${difficultyColors[lesson.difficulty] || ''}`}>
                  {lesson.difficulty}
                </Badge>
              </div>

              {/* Rendered content */}
              <div
                className="prose prose-neutral dark:prose-invert max-w-none
                  prose-headings:font-semibold prose-headings:tracking-tight
                  prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
                  prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                  prose-p:leading-7 prose-p:mb-4
                  prose-li:leading-7
                  prose-strong:font-semibold
                  prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                  prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
                  prose-pre:bg-muted prose-pre:border prose-pre:rounded-lg
                  [&_svg]:mx-auto [&_svg]:my-8 [&_svg]:block
                  [&_.diagram]:my-8 [&_.diagram]:p-6 [&_.diagram]:bg-muted/30 [&_.diagram]:border [&_.diagram]:rounded-lg
                  [&_.callout]:my-6 [&_.callout]:p-4 [&_.callout]:border-l-4 [&_.callout]:border-primary [&_.callout]:bg-primary/5 [&_.callout]:rounded-r-lg
                  [&_.comparison-table]:my-8 [&_.comparison-table_table]:w-full
                  [&_table]:w-full [&_table]:border-collapse [&_th]:text-left [&_th]:p-3 [&_th]:border-b-2 [&_th]:font-semibold [&_td]:p-3 [&_td]:border-b"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />

              {/* Prev/Next navigation */}
              <div className="flex items-center justify-between mt-12 pt-8 border-t gap-4">
                {prev ? (
                  <Link
                    href={`/learn/${params.category}/${prev.slug}`}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
                  >
                    <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    <div>
                      <div className="text-xs text-muted-foreground">Previous</div>
                      <div className="font-medium text-foreground">{prev.title}</div>
                    </div>
                  </Link>
                ) : <div />}
                {next ? (
                  <Link
                    href={`/learn/${params.category}/${next.slug}`}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group text-right"
                  >
                    <div>
                      <div className="text-xs text-muted-foreground">Next</div>
                      <div className="font-medium text-foreground">{next.title}</div>
                    </div>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                ) : <div />}
              </div>
            </article>
          </div>
        </div>
      </main>
    </div>
  );
}

/**
 * Minimal markdown-to-HTML converter.
 * Supports: headings, paragraphs, bold, italic, inline code,
 * code blocks, lists, links, tables, and raw HTML/SVG passthrough.
 */
function markdownToHtml(md: string): string {
  const lines = md.split('\n');
  let html = '';
  let inCodeBlock = false;
  let inList = false;
  let listType: 'ul' | 'ol' = 'ul';
  let inTable = false;
  let inHtmlBlock = false;
  let htmlBlockContent = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Raw HTML/SVG blocks (pass through)
    if (!inHtmlBlock && /^<(div|svg|table|figure|section|aside)\b/.test(line.trim())) {
      inHtmlBlock = true;
      htmlBlockContent = line;
      // Check if it closes on same line
      const tagMatch = line.trim().match(/^<(\w+)/);
      if (tagMatch && line.includes(`</${tagMatch[1]}>`)) {
        html += line + '\n';
        inHtmlBlock = false;
        htmlBlockContent = '';
      }
      continue;
    }
    if (inHtmlBlock) {
      htmlBlockContent += '\n' + line;
      // Check for closing tag
      if (/<\/(div|svg|table|figure|section|aside)>\s*$/.test(line.trim())) {
        html += htmlBlockContent + '\n';
        inHtmlBlock = false;
        htmlBlockContent = '';
      }
      continue;
    }

    // Code blocks
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        html += '</code></pre>\n';
        inCodeBlock = false;
      } else {
        const lang = line.trim().slice(3).trim();
        html += `<pre><code class="language-${lang || 'text'}">`;
        inCodeBlock = true;
      }
      continue;
    }
    if (inCodeBlock) {
      html += escapeHtml(line) + '\n';
      continue;
    }

    // Close list if we hit a non-list line
    if (inList && !line.match(/^[\s]*[-*]\s/) && !line.match(/^[\s]*\d+\.\s/) && line.trim() !== '') {
      html += `</${listType}>\n`;
      inList = false;
    }

    // Table
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      if (!inTable) {
        html += '<table>\n';
        inTable = true;
        // Header row
        const cells = line.split('|').filter(c => c.trim()).map(c => `<th>${inlineFormat(c.trim())}</th>`).join('');
        html += `<thead><tr>${cells}</tr></thead>\n<tbody>\n`;
        i++; // Skip separator row
        continue;
      }
      const cells = line.split('|').filter(c => c.trim()).map(c => `<td>${inlineFormat(c.trim())}</td>`).join('');
      html += `<tr>${cells}</tr>\n`;
      continue;
    }
    if (inTable && !line.trim().startsWith('|')) {
      html += '</tbody></table>\n';
      inTable = false;
    }

    // Empty line
    if (line.trim() === '') {
      continue;
    }

    // Headings
    if (line.startsWith('## ')) {
      const text = line.slice(3).trim();
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      html += `<h2 id="${id}">${inlineFormat(text)}</h2>\n`;
      continue;
    }
    if (line.startsWith('### ')) {
      const text = line.slice(4).trim();
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      html += `<h3 id="${id}">${inlineFormat(text)}</h3>\n`;
      continue;
    }

    // Unordered list
    if (line.match(/^[-*]\s/)) {
      if (!inList) {
        html += '<ul>\n';
        inList = true;
        listType = 'ul';
      }
      html += `<li>${inlineFormat(line.replace(/^[-*]\s/, ''))}</li>\n`;
      continue;
    }

    // Ordered list
    if (line.match(/^\d+\.\s/)) {
      if (!inList) {
        html += '<ol>\n';
        inList = true;
        listType = 'ol';
      }
      html += `<li>${inlineFormat(line.replace(/^\d+\.\s/, ''))}</li>\n`;
      continue;
    }

    // Regular paragraph
    html += `<p>${inlineFormat(line)}</p>\n`;
  }

  // Close any open blocks
  if (inList) html += `</${listType}>\n`;
  if (inTable) html += '</tbody></table>\n';
  if (inCodeBlock) html += '</code></pre>\n';

  return html;
}

function inlineFormat(text: string): string {
  return text
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
