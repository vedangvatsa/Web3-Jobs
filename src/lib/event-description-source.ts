import type { Web3Event } from './events';
import { isThinEventListingDescription } from './event-editorial-facts';

export function getEventDescriptionSource(event: Web3Event): { url: string; fetchedAt: string } | undefined {
  const source = event.sourceVerification || event.descriptionSource;
  if (!source || !/^https?:\/\//i.test(source.url) || !Number.isFinite(Date.parse(source.fetchedAt))) return undefined;
  return { url: source.url, fetchedAt: source.fetchedAt };
}

export function getVerifiedEventDescription(event: Web3Event): string {
  const description = (event.description || '').trim();
  return getEventDescriptionSource(event) && !isThinEventListingDescription(description) ? description : '';
}
