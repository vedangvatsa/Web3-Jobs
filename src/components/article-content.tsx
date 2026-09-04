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
        "prose-code:text-xs prose-code:sm:text-sm prose-code:bg-muted/70 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:font-mono prose-code:text-foreground",
        "prose-pre:bg-muted/40 prose-pre:border prose-pre:border-border/70 prose-pre:rounded-xl prose-pre:p-4 prose-pre:sm:p-6 prose-pre:overflow-x-auto prose-pre:font-mono prose-pre:text-xs prose-pre:sm:text-sm prose-pre:leading-relaxed prose-pre:my-8",
        // Blockquote
        "prose-blockquote:border-l-2 prose-blockquote:border-primary prose-blockquote:pl-5 prose-blockquote:py-1.5 prose-blockquote:my-6 prose-blockquote:not-italic prose-blockquote:text-foreground/90 prose-blockquote:bg-muted/20 prose-blockquote:rounded-r-lg",
        // Tables
        "[&_table]:w-full [&_table]:border-collapse [&_table]:my-8 [&_table]:text-sm",
        "[&_thead]:bg-muted/50 [&_th]:text-left [&_th]:p-3.5 [&_th]:border-b [&_th]:border-border [&_th]:font-semibold [&_th]:text-foreground [&_th]:text-xs [&_th]:uppercase [&_th]:tracking-wider",
        "[&_td]:p-3.5 [&_td]:border-b [&_td]:border-border/60 [&_td]:text-muted-foreground [&_tr:hover]:bg-muted/30 [&_tr]:transition-colors",
        // Images & Media
        "prose-img:rounded-xl prose-img:border prose-img:border-border/70 prose-img:my-6 prose-img:w-full prose-img:max-w-3xl prose-img:mx-auto prose-img:h-auto prose-img:object-contain prose-img:shadow-sm",
        "prose-figure:my-8 prose-figure:text-center",
        "prose-figcaption:text-xs prose-figcaption:sm:text-sm prose-figcaption:text-muted-foreground prose-figcaption:mt-2.5 prose-figcaption:italic",
        // HR
        "prose-hr:border-border/70 prose-hr:my-10",
        className
      )}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
