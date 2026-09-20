import type { Web3Event } from './events';
import { getVerifiedEventDescription } from './event-description-source';

export function hasCuratedEventGuide(event: Web3Event): boolean {
  return Boolean(getVerifiedEventDescription(event));
}
