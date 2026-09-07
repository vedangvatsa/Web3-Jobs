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
      <div className="inline-flex items-center gap-3 text-sm text-muted-foreground flex-wrap justify-center">
        <Link
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-foreground inline-flex items-center gap-2"
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
        <span>•</span>
        <Link
          href="/jobs/feed.xml"
          target="_blank"
          className="hover:text-foreground text-xs font-mono border px-2 py-0.5 rounded"
          title="Direct Web3 Jobs RSS XML Feed"
        >
          RSS XML
        </Link>
      </div>
    </div>
  );
}
