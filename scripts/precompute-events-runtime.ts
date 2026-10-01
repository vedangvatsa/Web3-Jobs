import { execSync } from 'node:child_process';
import * as fs from 'fs';
import * as path from 'path';
import { buildEventsListing } from '../src/lib/events-listing-build';
import { writeEventContentCatalog } from './event-content-catalog';
import type { EventSlugHistory } from '../src/lib/event-slug-assignment';

const OUT_PATH = path.join(process.cwd(), 'content/events-runtime.json');
const PUBLIC_DATA_PATH = path.join(process.cwd(), 'public/data/events-runtime.json');

async function main() {
  writeEventContentCatalog();
  const historyPath = path.join(process.cwd(), 'content/event-slug-history.json');
  const history: EventSlugHistory = fs.existsSync(historyPath) ? JSON.parse(fs.readFileSync(historyPath, 'utf8')) : {};
  if (fs.existsSync(OUT_PATH)) {
    for (const event of JSON.parse(fs.readFileSync(OUT_PATH, 'utf8'))) {
      if (event.slug && !history[event.id]) history[event.id] = { slug: event.slug, aliases: event.aliases };
    }
  }
  const events = await buildEventsListing();
  for (const event of events) history[event.id] = { slug: event.slug!, aliases: event.aliases };
  fs.writeFileSync(historyPath, `${JSON.stringify(history, null, 2)}\n`);
  const json = `${JSON.stringify(events)}\n`;
  fs.writeFileSync(OUT_PATH, json, 'utf-8');
  console.log(`Wrote ${events.length} events to ${OUT_PATH}`);
  fs.mkdirSync(path.dirname(PUBLIC_DATA_PATH), { recursive: true });
  fs.writeFileSync(PUBLIC_DATA_PATH, json, 'utf-8');
  console.log(`Wrote ${events.length} events to ${PUBLIC_DATA_PATH}`);

  if (process.env.SKIP_CATALOG_GATES !== '1') {
    execSync('npx tsx scripts/audit-detail-formatting.ts --events', {
      stdio: 'inherit',
      cwd: process.cwd(),
    });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
