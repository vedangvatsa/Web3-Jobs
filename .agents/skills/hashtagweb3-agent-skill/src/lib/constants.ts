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
 telegramNewsSubscribers: 13_000,
 telegramNewsSubscribersFormatted: '13,000+',
 /** Year the platform was founded */
 foundedYear: 2022,
 /** Telegram channel URL */
 telegramUrl: 'https://t.me/web3hiring',
 /** Telegram news URL */
 telegramNewsUrl: 'https://t.me/web3newsfeed',
} as const;
