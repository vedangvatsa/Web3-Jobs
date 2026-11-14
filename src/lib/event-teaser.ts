/**
 * Render-safe teaser text for event cards and RSS surfaces.
 *
 * Card components and the feed render raw `event.description` directly, so
 * raw scraped copy reaches the browser unchanged. This helper applies the
 * same two passes the detail page body gets: scrape-artifact/grammar cleanup
 * and third-party messaging-community CTA stripping (the 2026-11-12 Safe
 * Browsing incident). Pure string transforms only — client-bundle safe.
 */
import { stripThirdPartyCommunityPromo } from './community-link-sanitizer';
import { cleanupEventDescriptionFormat } from './event-description-cleanup';

export function eventTeaserText(text: string | null | undefined): string {
  if (!text) return '';
  return cleanupEventDescriptionFormat(stripThirdPartyCommunityPromo(text)).trim();
}
