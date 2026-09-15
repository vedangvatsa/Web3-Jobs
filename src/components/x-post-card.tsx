import { PopupPostAvatar } from '@/components/popup-post-avatar';
import { OutboundLink } from '@/components/tracking/outbound-link';
import { formatPopupPostText } from '@/lib/popup-text';
import { cn } from '@/lib/utils';

export type XPostCardProps = {
  url: string;
  author: string;
  username?: string | null;
  avatar?: string | null;
  text: string;
  /** ISO date string for `<time dateTime>` */
  date?: string | null;
  linkLabel: string;
  className?: string;
  /** Omit for full post text (articles); default 5 lines like popup grids */
  textLineClamp?: number | null;
};

export function XPostCard({
  url,
  author,
  username,
  avatar,
  text,
  date,
  linkLabel,
  className,
  textLineClamp = 5,
}: XPostCardProps) {
  const dateTime = date?.trim() || undefined;

  return (
    <OutboundLink
      href={url}
      label={linkLabel}
      className={cn(
        'group flex h-full flex-col rounded-lg border border-border/70 bg-card p-4 no-underline transition-colors hover:border-foreground/25 hover:no-underline',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <PopupPostAvatar author={author} username={username} avatar={avatar} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{author}</p>
            {username ? (
              <p className="truncate text-xs text-muted-foreground">@{username.replace(/^@/, '')}</p>
            ) : null}
          </div>
        </div>
        {dateTime ? (
          <time className="shrink-0 pt-0.5 text-[11px] text-muted-foreground" dateTime={dateTime}>
            {dateTime}
          </time>
        ) : null}
      </div>
      <p
        className="mt-3 flex-1 whitespace-pre-line text-sm leading-relaxed text-muted-foreground"
        style={
          textLineClamp != null && textLineClamp > 0
            ? {
                WebkitLineClamp: textLineClamp,
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }
            : undefined
        }
      >
        {formatPopupPostText(text)}
      </p>
      <span className="mt-3 text-xs font-medium text-foreground group-hover:underline">View on X</span>
    </OutboundLink>
  );
}
