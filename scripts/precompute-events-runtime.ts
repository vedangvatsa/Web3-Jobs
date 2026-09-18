import * as fs from 'fs';
import * as path from 'path';
import { buildEventsListing } from '../src/lib/events-listing-build';

const OUT_PATH = path.join(process.cwd(), 'content/events-runtime.json');

async function main() {
  const events = await buildEventsListing();
  fs.writeFileSync(OUT_PATH, `${JSON.stringify(events)}\n`, 'utf-8');
  console.log(`Wrote ${events.length} events to ${OUT_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
