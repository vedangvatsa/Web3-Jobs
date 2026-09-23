import Link from 'next/link';
import { Rss } from 'lucide-react';
import { COMMUNITY_FEED_BANNERS, type CommunityFeedVariant } from '@/lib/constants';

interface CommunityFeedBannerProps {
  /** Preset copy + link from `COMMUNITY_FEED_BANNERS` in constants. */
  variant?: CommunityFeedVariant;
}

export function CommunityFeedBanner({ variant = 'hiring' }: CommunityFeedBannerProps) {
  const feed = COMMUNITY_FEED_BANNERS[variant];

  return (
    <p className="my-4 px-4 text-center text-sm leading-snug text-muted-foreground sm:px-0">
      <Link
        href={feed.href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline hover:text-foreground"
      >
        <Rss className="mr-2 inline-block h-4 w-4 shrink-0 align-[-0.2em]" aria-hidden="true" />
        Join our {feed.label} with{' '}
        <strong className="font-semibold text-foreground">{feed.count}</strong> {feed.audience}.
      </Link>
    </p>
  );
}
