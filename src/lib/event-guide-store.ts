import type { Web3Event, EventEditorialArticle } from './events';
import { buildSourceBackedEventEditorial } from './event-content';

export async function resolveEventGuide(event: Web3Event): Promise<EventEditorialArticle> {
  return buildSourceBackedEventEditorial(event);
}
