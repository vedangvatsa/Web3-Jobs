import { OutboundLink } from '@/components/tracking/outbound-link';
import { PopupPostAvatar } from '@/components/popup-post-avatar';
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
  const attribution =
    showNsAttribution && nsDashboardUrl ? (
      <p className="mb-4 text-xs text-muted-foreground">
        Also listed on the{' '}
        <OutboundLink
          href={nsDashboardUrl}
          label={`${popupName} on ns.com dashboard`}
          className="underline-offset-4 hover:text-foreground hover:underline"
        >
          ns.com dashboard
        </OutboundLink>
        .
      </p>
    ) : null;

  if (!posts.length) {
    if (!attribution) return null;
    return <section className="mt-10">{attribution}</section>;
  }

  return (
    <section className="mt-10">
      <h2 className="mb-3 text-lg font-bold tracking-tight">Posts</h2>
      {attribution ?? (
        <p className="mb-4 text-xs text-muted-foreground">Selected posts for {popupName}.</p>
      )}
      <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <li key={post.url}>
            <OutboundLink
              href={post.url}
              label={`${post.author} post about ${popupName}`}
              className="flex h-full flex-col rounded-lg border border-border/70 bg-card p-4 transition-colors hover:border-foreground/25"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2.5">
                  <PopupPostAvatar
                    author={post.author}
                    username={post.username}
                    avatar={post.avatar}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{post.author}</p>
                    {post.username ? (
                      <p className="truncate text-xs text-muted-foreground">@{post.username}</p>
                    ) : null}
                  </div>
                </div>
                {post.date ? (
                  <time className="shrink-0 pt-0.5 text-[11px] text-muted-foreground" dateTime={post.date}>
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
