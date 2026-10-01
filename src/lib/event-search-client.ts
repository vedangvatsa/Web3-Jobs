import type { Web3Event } from './events';
import { getVerifiedEventDescription } from './event-description-source';

let descriptionsPromise: Promise<Record<string, string>> | null = null;

/** Full descriptions are needed for text search, not for browsing event cards. */
export function loadEventSearchDescriptions(): Promise<Record<string, string>> {
  if (!descriptionsPromise) {
    descriptionsPromise = fetch('/data/events-runtime.json')
      .then(async response => {
        if (!response.ok) throw new Error(`Event search HTTP ${response.status}`);
        const data: unknown = await response.json();
        if (!Array.isArray(data) || data.some(event => !event || typeof event.id !== 'string' || typeof event.description !== 'string')) {
          throw new Error('Invalid event search catalog');
        }
        return Object.fromEntries((data as Web3Event[]).map(event => [event.id, getVerifiedEventDescription(event).toLowerCase()]));
      })
      .catch(error => {
        descriptionsPromise = null;
        throw error;
      });
  }
  return descriptionsPromise;
}
