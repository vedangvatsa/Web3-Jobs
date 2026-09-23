/**
 * Site-wide dynamic constants.
 * Update these in ONE place whenever community numbers grow.
 * All components import from here - no hardcoded stats anywhere else.
 */

export const SITE_STATS = {
 /** Telegram @web3hiring subscriber count (round number) */
 telegramSubscribers: 60_000,
 /** Formatted string for display */
 telegramSubscribersFormatted: '60,000+',
 /** Telegram news feed subscribers */
  telegramNewsSubscribers: 11_000,
  telegramNewsSubscribersFormatted: '11,000+',
 /** Year the platform was founded */
 foundedYear: 2022,
 /** Telegram channel URL */
 telegramUrl: 'https://t.me/web3hiring',
 /** Telegram news URL */
 telegramNewsUrl: 'https://t.me/web3newsfeed',
 /** Telegram networking group (@hashtagweb3) */
 telegramCommunityUrl: 'https://t.me/hashtagweb3',
 telegramCommunityMembersFormatted: '18,000+',
} as const;

export type CommunityFeedVariant = 'hiring' | 'company-hiring' | 'news' | 'community';

export const COMMUNITY_FEED_BANNERS: Record<
  CommunityFeedVariant,
  { href: string; label: string; count: string; audience: 'subscribers' | 'members' }
> = {
  hiring: {
    href: SITE_STATS.telegramUrl,
    label: 'hiring feed',
    count: SITE_STATS.telegramSubscribersFormatted,
    audience: 'subscribers',
  },
  'company-hiring': {
    href: SITE_STATS.telegramUrl,
    label: 'company & hiring feed',
    count: SITE_STATS.telegramSubscribersFormatted,
    audience: 'subscribers',
  },
  news: {
    href: SITE_STATS.telegramNewsUrl,
    label: 'news feed',
    count: SITE_STATS.telegramNewsSubscribersFormatted,
    audience: 'subscribers',
  },
  community: {
    href: SITE_STATS.telegramCommunityUrl,
    label: 'Telegram community',
    count: SITE_STATS.telegramCommunityMembersFormatted,
    audience: 'members',
  },
};
