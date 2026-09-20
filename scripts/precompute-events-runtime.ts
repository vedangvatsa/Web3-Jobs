import * as fs from 'fs';
import * as path from 'path';
import { buildEventsListing } from '../src/lib/events-listing-build';
import { writeEventContentCatalog } from './event-content-catalog';

const OUT_PATH = path.join(process.cwd(), 'content/events-runtime.json');
const PUBLIC_DATA_PATH = path.join(process.cwd(), 'public/data/events-runtime.json');

async function main() {
  writeEventContentCatalog();
  const events = await buildEventsListing();
  const json = `${JSON.stringify(events)}\n`;
  fs.writeFileSync(OUT_PATH, json, 'utf-8');
  console.log(`Wrote ${events.length} events to ${OUT_PATH}`);
  fs.mkdirSync(path.dirname(PUBLIC_DATA_PATH), { recursive: true });
  fs.writeFileSync(PUBLIC_DATA_PATH, json, 'utf-8');
  console.log(`Wrote ${events.length} events to ${PUBLIC_DATA_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
