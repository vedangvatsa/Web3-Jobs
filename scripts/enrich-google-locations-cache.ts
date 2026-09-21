#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { enrichMultiOfficeLocations } from './lib/enrich-multi-office-locations';

async function main() {
  const cachePath = path.join(process.cwd(), 'content/jobs-cache.json');
  const jobs = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
  const n = await enrichMultiOfficeLocations(jobs);
  fs.writeFileSync(cachePath, `${JSON.stringify(jobs, null, 2)}\n`);
  console.log(`Updated ${n} job location(s) in jobs-cache.json`);
}

main();
