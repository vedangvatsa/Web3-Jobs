import type { Web3Event, EventEditorialArticle } from './events';
import { buildEditorialFromOrganizerDescription } from './luma-event-content';
import { getEventDescriptionSource, getVerifiedEventDescription } from './event-description-source';

export function buildSourceBackedEventEditorial(event: Web3Event): EventEditorialArticle {
  const description = getVerifiedEventDescription(event);
  const editorial = buildEditorialFromOrganizerDescription({ ...event, description });
  return {
    ...editorial,
    sections: description ? editorial.sections : [],
    descriptionStatus: description ? 'source-backed' : 'unavailable',
    descriptionSource: description ? getEventDescriptionSource(event) : undefined,
  };
}
