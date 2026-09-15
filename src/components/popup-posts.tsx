import { OutboundLink } from '@/components/tracking/outbound-link';
import { formatPopupPostText } from '@/lib/popup-text';
import type { PopupPost } from '@/types/popup';

export function PopupPosts({
  posts,
  popupName,
  nsDashboardUrl,
  showNsAttribution,
}: {
  posts: PopupPost[];
  popupName: string;
  nsDashboardUrl?: string | null;
  showNsAttribution?: boolean;
}) {
  if (!posts.length) return null;

  return (
    <section className="mt-10">
      <h2 className="mb-3 text-lg font-bold tracking-tight">Posts</h2>
      <p className="mb-4 text-xs text-muted-foreground">
        {showNsAttribution && nsDashboardUrl ? (
          <>
            Selected posts shown on the{' '}
            <OutboundLink
              href={nsDashboardUrl}
              label={`${popupName} on ns.com dashboard`}
              className="underline-offset-4 hover:text-foreground hover:underline"
            >
              ns.com dashboard
            </OutboundLink>{' '}
            for {popupName}.
          </>
        ) : (
          <>Selected posts for {popupName}.</>
        )}
      </p>
      <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <li key={post.url}>
            <OutboundLink
              href={post.url}
              label={`${post.author} post about ${popupName}`}
              className="flex h-full flex-col rounded-lg border border-border/70 bg-card p-4 transition-colors hover:border-foreground/25"
            >
              <div className="flex items-baseline justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{post.author}</p>
                  {post.username ? (
                    <p className="truncate text-xs text-muted-foreground">@{post.username}</p>
                  ) : null}
                </div>
                {post.date ? (
                  <time className="shrink-0 text-[11px] text-muted-foreground" dateTime={post.date}>
                    {post.date}
                  </time>
                ) : null}
              </div>
              <p className="mt-3 line-clamp-5 flex-1 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {formatPopupPostText(post.text)}
              </p>
              <span className="mt-3 text-xs font-medium text-foreground">View on X</span>
            </OutboundLink>
          </li>
        ))}
      </ul>
    </section>
  );
}
