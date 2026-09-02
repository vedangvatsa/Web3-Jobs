import fs from 'fs';
import path from 'path';
import type { Web3Event, EventEditorialArticle } from './events';
import { EVENT_GUIDES } from './event-guides';
import { getEventEditorialGuide } from './events';

// Server-only store for per-event guides.
// Precedence: hand-curated EVENT_GUIDES (by slug) -> generated per-event guide (by id) -> legacy fallback.
let cachedGenerated: Record<string, EventEditorialArticle> | null = null;

function loadGenerated(): Record<string, EventEditorialArticle> {
  if (cachedGenerated !== null) return cachedGenerated;
  let loaded: Record<string, EventEditorialArticle> = {};
  try {
    const p = path.join(process.cwd(), 'content', 'generated-event-guides.json');
    const parsed: unknown = JSON.parse(fs.readFileSync(p, 'utf8'));
    if (parsed && typeof parsed === 'object') {
      loaded = parsed as Record<string, EventEditorialArticle>;
    }
  } catch {
    loaded = {};
  }
  cachedGenerated = loaded;
  return loaded;
}

export async function resolveEventGuide(event: Web3Event): Promise<EventEditorialArticle> {
  const slug = (event.slug || '').toLowerCase().trim();
  if (slug && EVENT_GUIDES[slug]) return EVENT_GUIDES[slug];

  const generated = loadGenerated();
  if (event.id && generated[event.id]) return generated[event.id];

  return getEventEditorialGuide(event);
}
