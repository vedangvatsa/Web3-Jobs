import { ArticleTweetCard } from '@/components/article-tweet-card';
import { ARTICLE_TWEET_MOUNT_CLASS } from '@/lib/article-tweet-embed';
import type { ArticleTweetEmbed } from '@/lib/article-tweet-embed';
import { cn } from '@/lib/utils';

const TWEET_MOUNT_RE = new RegExp(
  `<div class="${ARTICLE_TWEET_MOUNT_CLASS}" data-tweet-id="(\\d+)"></div>`,
  'g',
);

const proseClassName = cn(
  'article-prose',
  'prose prose-lg dark:prose-invert max-w-none',
  'prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-foreground',
  'prose-h2:text-2xl prose-h2:sm:text-3xl prose-h2:mt-10 prose-h2:mb-4',
  'prose-h3:text-xl prose-h3:sm:text-2xl prose-h3:mt-8 prose-h3:mb-3',
  'prose-h4:text-lg prose-h4:font-semibold prose-h4:mt-6 prose-h4:mb-2',
  'prose-p:text-base prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-5',
  'prose-a:text-foreground prose-a:font-medium prose-a:underline hover:prose-a:text-primary prose-a:transition-colors',
  'prose-li:text-base prose-li:text-muted-foreground prose-li:leading-relaxed prose-li:mb-1.5',
  'prose-ul:my-5 prose-ol:my-5',
  'prose-strong:text-foreground prose-strong:font-semibold',
  '[&_:not(pre)>code]:text-xs [&_:not(pre)>code]:sm:text-sm [&_:not(pre)>code]:bg-muted/70 [&_:not(pre)>code]:px-1.5 [&_:not(pre)>code]:py-0.5 [&_:not(pre)>code]:rounded-md [&_:not(pre)>code]:font-mono [&_:not(pre)>code]:text-foreground',
  'prose-code:before:content-none prose-code:after:content-none',
  '[--tw-prose-pre-code:hsl(var(--foreground))]',
  '[&_pre_code]:block [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:rounded-none [&_pre_code]:text-foreground',
  'prose-pre:bg-muted/40 prose-pre:text-foreground prose-pre:border prose-pre:border-border/70 prose-pre:rounded-xl prose-pre:p-4 prose-pre:sm:p-6 prose-pre:overflow-x-auto prose-pre:font-mono prose-pre:text-xs prose-pre:sm:text-sm prose-pre:leading-snug prose-pre:my-8',
  'prose-blockquote:border-l-2 prose-blockquote:border-primary prose-blockquote:pl-5 prose-blockquote:py-1.5 prose-blockquote:my-6 prose-blockquote:not-italic prose-blockquote:text-foreground/90 prose-blockquote:bg-muted/20 prose-blockquote:rounded-r-lg',
  '[&_table]:w-full [&_table]:border-collapse [&_table]:my-8 [&_table]:text-sm',
  '[&_thead]:bg-muted/50 [&_th]:text-left [&_th]:p-3.5 [&_th]:border-b [&_th]:border-border [&_th]:font-semibold [&_th]:text-foreground [&_th]:text-xs [&_th]:uppercase [&_th]:tracking-wider',
  '[&_td]:p-3.5 [&_td]:border-b [&_td]:border-border/60 [&_td]:text-muted-foreground [&_tr:hover]:bg-muted/30 [&_tr]:transition-colors',
  'prose-img:rounded-xl prose-img:border prose-img:border-border/70 prose-img:my-6 prose-img:w-full prose-img:max-w-3xl prose-img:mx-auto prose-img:h-auto prose-img:object-contain prose-img:shadow-sm',
  'prose-figure:my-8 prose-figure:text-center',
  'prose-figcaption:text-center prose-figcaption:text-xs prose-figcaption:sm:text-sm prose-figcaption:text-muted-foreground prose-figcaption:mt-2.5 prose-figcaption:italic',
  '[&_p:has(img)+p]:text-center [&_p:has(img)+p]:text-xs [&_p:has(img)+p]:sm:text-sm [&_p:has(img)+p]:text-muted-foreground [&_p:has(img)+p]:italic [&_p:has(img)+p]:-mt-4 [&_p:has(img)+p]:mb-8',
  '[&_.article-diagram]:my-8 [&_.article-diagram]:overflow-x-auto [&_.article-diagram]:rounded-xl [&_.article-diagram]:border [&_.article-diagram]:border-border [&_.article-diagram]:bg-card [&_.article-diagram]:p-4 [&_.article-diagram]:sm:p-6',
  '[&_.article-diagram-title]:mb-4 [&_.article-diagram-title]:text-center [&_.article-diagram-title]:font-mono [&_.article-diagram-title]:text-xs [&_.article-diagram-title]:font-semibold [&_.article-diagram-title]:uppercase [&_.article-diagram-title]:tracking-wider [&_.article-diagram-title]:text-muted-foreground',
  '[&_.article-diagram-svg]:mx-auto [&_.article-diagram-svg]:block [&_.article-diagram-svg]:h-auto [&_.article-diagram-svg]:min-w-[42rem] [&_.article-diagram-svg]:max-w-none [&_.article-diagram-svg]:sm:min-w-0 [&_.article-diagram-svg]:sm:max-w-full',
  'prose-hr:border-border/70 prose-hr:my-10',
);

function splitArticleContent(content: string, tweetEmbeds?: ArticleTweetEmbed[]) {
  const byId = new Map(tweetEmbeds?.map((t) => [t.id, t]) ?? []);
  const segments: Array<{ kind: 'html'; html: string } | { kind: 'tweet'; embed: ArticleTweetEmbed }> = [];

  let lastIndex = 0;
  for (const match of content.matchAll(TWEET_MOUNT_RE)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      segments.push({ kind: 'html', html: content.slice(lastIndex, index) });
    }
    const id = match[1];
    const embed = byId.get(id);
    if (embed) segments.push({ kind: 'tweet', embed });
    lastIndex = index + match[0].length;
  }
  if (lastIndex < content.length) {
    segments.push({ kind: 'html', html: content.slice(lastIndex) });
  }

  if (!segments.length) {
    segments.push({ kind: 'html', html: content });
  }

  return segments;
}

export function ArticleContent({
  content,
  tweetEmbeds,
  className,
}: {
  content: string;
  tweetEmbeds?: ArticleTweetEmbed[];
  className?: string;
}) {
  const hasMounts = content.includes(ARTICLE_TWEET_MOUNT_CLASS);
  if (!hasMounts) {
    return (
      <div className={cn(proseClassName, className)} dangerouslySetInnerHTML={{ __html: content }} />
    );
  }

  const segments = splitArticleContent(content, tweetEmbeds);

  return (
    <div className={className}>
      {segments.map((segment, i) => {
        if (segment.kind === 'tweet') {
          return <ArticleTweetCard key={`tweet-${segment.embed.id}-${i}`} embed={segment.embed} />;
        }
        if (!segment.html.trim()) return null;
        return (
          <div
            key={`html-${i}`}
            className={proseClassName}
            dangerouslySetInnerHTML={{ __html: segment.html }}
          />
        );
      })}
    </div>
  );
}
