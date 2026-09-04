import { cn } from '@/lib/utils';

export function ArticleContent({ content, className }: { content: string; className?: string }) {
  return (
    <div
      className={cn(
        "article-prose",
        "prose prose-lg dark:prose-invert max-w-none",
        // Headings
        "prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-foreground",
        "prose-h2:text-2xl prose-h2:sm:text-3xl prose-h2:mt-10 prose-h2:mb-4",
        "prose-h3:text-xl prose-h3:sm:text-2xl prose-h3:mt-8 prose-h3:mb-3",
        "prose-h4:text-lg prose-h4:font-semibold prose-h4:mt-6 prose-h4:mb-2",
        // Paragraphs & Body
        "prose-p:text-base prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-5",
        // Links
        "prose-a:text-foreground prose-a:font-medium prose-a:underline hover:prose-a:text-primary prose-a:transition-colors",
        // Lists
        "prose-li:text-base prose-li:text-muted-foreground prose-li:leading-relaxed prose-li:mb-1.5",
        "prose-ul:my-5 prose-ol:my-5",
        // Strong
        "prose-strong:text-foreground prose-strong:font-semibold",
        // Code
        "prose-code:text-sm prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:font-mono prose-code:text-foreground",
        "prose-pre:bg-muted/60 prose-pre:border prose-pre:border-border/70 prose-pre:rounded-lg",
        // Blockquote
        "prose-blockquote:border-l-2 prose-blockquote:border-primary prose-blockquote:pl-5 prose-blockquote:py-1 prose-blockquote:my-6 prose-blockquote:italic prose-blockquote:text-muted-foreground",
        // Tables
        "[&_table]:w-full [&_table]:border-collapse [&_th]:text-left [&_th]:p-3 [&_th]:border-b [&_th]:border-border [&_th]:font-semibold [&_th]:text-foreground [&_td]:p-3 [&_td]:border-b [&_td]:border-border/60 [&_td]:text-muted-foreground",
        // Images & Media
        "prose-img:rounded-xl prose-img:border prose-img:border-border/70 prose-img:my-6 prose-img:w-full prose-img:max-w-3xl prose-img:mx-auto prose-img:h-auto prose-img:object-contain prose-img:shadow-sm",
        "prose-figure:my-8 prose-figure:text-center",
        "prose-figcaption:text-xs prose-figcaption:sm:text-sm prose-figcaption:text-muted-foreground prose-figcaption:mt-2 prose-figcaption:italic",
        // HR
        "prose-hr:border-border/70 prose-hr:my-10",
        className
      )}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
