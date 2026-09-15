import type { Web3Event } from '@/lib/events';
import { EVENT_GUIDES } from '@/lib/event-guides';
import fs from 'fs';
import path from 'path';

function hasGeneratedEventGuide(eventId: string): boolean {
  try {
    const guidePath = path.join(process.cwd(), 'content', 'generated-event-guides.json');
    const parsed = JSON.parse(fs.readFileSync(guidePath, 'utf8')) as Record<string, unknown>;
    return Boolean(parsed[eventId]);
  } catch {
    return false;
  }
}

export function hasCuratedEventGuide(event: Web3Event): boolean {
  const slug = (event.slug || '').toLowerCase().trim();
  if (slug && EVENT_GUIDES[slug]) return true;
  return Boolean(event.id && hasGeneratedEventGuide(event.id));
}

