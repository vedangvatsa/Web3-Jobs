import Link from 'next/link';
import { Rss } from 'lucide-react';
import { SITE_STATS } from '@/lib/constants';

interface CommunityFeedBannerProps {
  label?: string;
  href?: string;
  text?: React.ReactNode;
}

export function CommunityFeedBanner({
  label = 'hiring feed',
  href = SITE_STATS.telegramUrl,
  text,
}: CommunityFeedBannerProps) {
  return (
    <div className="text-center my-4 space-y-2">
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-2"
      >
        <Rss className="h-4 w-4" />
        {text ? (
          <span>{text}</span>
        ) : (
          <span>
            Join our {label} with <strong className="text-foreground">{SITE_STATS.telegramSubscribersFormatted}</strong> subscribers.
          </span>
        )}
      </Link>
    </div>
  );
}
