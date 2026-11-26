#!/usr/bin/env tsx
/**
 * Snapshot https://freecryptoapis.com/api/listings.json into the static catalog.
 */
import fs from 'node:fs';
import path from 'node:path';

const SOURCE_URL = 'https://freecryptoapis.com/api/listings.json';
const OUT_PATH = path.join(process.cwd(), 'content/crypto-apis/listings.json');

async function main() {
  const res = await fetch(SOURCE_URL, {
    headers: { 'User-Agent': 'hashtagweb3-sync/1.0 (+https://hashtagweb3.com/developers)' },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch listings (${res.status})`);
  }
  const data = await res.json();
  if (!data?.listings?.length) {
    throw new Error('Unexpected listings payload');
  }
  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, `${JSON.stringify(data, null, 2)}\n`);
  console.log(`Wrote ${data.listings.length} listings (verifiedOn ${data.verifiedOn}) to ${OUT_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});