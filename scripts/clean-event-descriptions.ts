import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();
const cachePath = path.join(rootDir, 'content', 'events-cache.json');
const curatedPath = path.join(rootDir, 'content', 'curated-events.json');

interface Web3Event {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  city?: string;
  country?: string;
  location: string;
  month?: string;
  url: string;
  website?: string | null;
  coverImage: string | null;
  twitter?: string | null;
  source?: string;
  slug?: string;
}

function cleanDescription(desc: string, name: string): string {
  if (!desc) return desc;
  let d = desc.trim();

  // Strip "on Web3Voyager:"
  if (d.includes('on Web3Voyager:')) {
    d = d.replace(/^[^:]*on Web3Voyager:\s*/i, '');
    // Capitalize first character
    d = d.charAt(0).toUpperCase() + d.slice(1);
    // If it starts with 'a ' or 'an ', prefix with event name
    if (/^(a|an)\s+/i.test(d)) {
      d = `${name} is ${d.toLowerCase()}`;
    }
  }

  // Specific cleans
  if (d.includes('THIS IS AN ONLINE EVENT PLEASE DO NOT COME TO THE PHYSICAL VENUE')) {
    d = 'An interactive online tech talk exploring Web3, smart contract architecture, and decentralized application development for aspiring blockchain engineers and builders.';
  }

  if (d.startsWith('LAGOS BLOCKCHAIN SUMMIT brings together')) {
    d = d.replace('LAGOS BLOCKCHAIN SUMMIT', 'Lagos Blockchain Summit');
  }

  if (d.startsWith('CRYPTO ASSETS CONFERENCE 2027 - #CAC27 brings together')) {
    d = d.replace('CRYPTO ASSETS CONFERENCE 2027 - #CAC27', 'Crypto Assets Conference 2027 (#CAC27)');
  }

  if (d.startsWith('BEYOND THE FRAME')) {
    d = 'Beyond The Frame is an immersive digital art event featuring 3D works rendered on decentralized infrastructure.';
  }

  // Ensure ends with punctuation
  d = d.trim();
  if (d && !/[.!?]$/.test(d)) {
    d += '.';
  }

  return d;
}

function run() {
  console.log('Sanitizing and cleaning all event descriptions...');
  let cache: Web3Event[] = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
  let curated: Web3Event[] = JSON.parse(fs.readFileSync(curatedPath, 'utf8'));

  // 1. Filter out spam events
  const originalCacheLen = cache.length;
  cache = cache.filter(e => e.id !== 'eb-1998992594662');
  if (cache.length !== originalCacheLen) {
    console.log(`Removed ${originalCacheLen - cache.length} spam/scam event(s).`);
  }

  let cleanedCount = 0;
  cache.forEach(e => {
    const orig = e.description;
    e.description = cleanDescription(e.description, e.name);
    if (e.description !== orig) cleanedCount++;
  });

  curated.forEach(e => {
    const orig = e.description;
    e.description = cleanDescription(e.description, e.name);
    if (e.description !== orig) cleanedCount++;
  });

  fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2), 'utf8');
  fs.writeFileSync(curatedPath, JSON.stringify(curated, null, 2), 'utf8');

  console.log(`✅ Cleaned ${cleanedCount} event descriptions.`);
}

run();
