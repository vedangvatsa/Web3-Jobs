import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cachePath = path.join(__dirname, '../content/events-cache.json');
const USER_AGENT = 'HashtagWeb3 Event Speaker Verifier/1.0 (+https://hashtagweb3.com)';
const CONCURRENCY = 8;

function addSpeaker(value, speakers) {
  if (typeof value === 'string') {
    const name = value.replace(/\s+/g, ' ').trim();
    if (
      name.length >= 3 &&
      name.length <= 120 &&
      !/https?:|\{|\}|\bspeakers?\b/i.test(name) &&
      /^[\p{L}][\p{L}.'-]*(?:\s+[\p{L}][\p{L}.'-]*)+$/u.test(name)
    ) {
      speakers.add(name);
    }
    return;
  }
  if (value && typeof value === 'object' && typeof value.name === 'string') {
    addSpeaker(value.name, speakers);
  }
}

function extractSpeakers(value, speakers) {
  if (Array.isArray(value)) {
    value.forEach((item) => extractSpeakers(item, speakers));
    return;
  }
  if (!value || typeof value !== 'object') return;

  for (const [key, child] of Object.entries(value)) {
    if (/speaker/i.test(key)) {
      if (Array.isArray(child)) child.forEach((item) => addSpeaker(item, speakers));
      else addSpeaker(child, speakers);
    }
    extractSpeakers(child, speakers);
  }
}

function parseOfficialSpeakers(html) {
  const speakers = new Set();
  const scripts = html.matchAll(/<script[^>]+type=["']application\/(?:ld\+json|json)["'][^>]*>([\s\S]*?)<\/script>/gi);
  for (const match of scripts) {
    try {
      extractSpeakers(JSON.parse(match[1]), speakers);
    } catch {
      // Ignore malformed publisher JSON-LD rather than inferring names from page text.
    }
  }
  return [...speakers].slice(0, 30);
}

async function enrichEvent(event) {
  // Clear prior results before each verification pass so removed organizer data
  // never remains visible after a request failure.
  delete event.speakers;
  delete event.speakersCheckedAt;
  if (!event.url?.startsWith('http')) return false;
  try {
    const response = await fetch(event.url, {
      headers: { 'User-Agent': USER_AGENT },
      redirect: 'follow',
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) return false;
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) return false;
    const speakers = parseOfficialSpeakers(await response.text());
    if (speakers.length > 0) event.speakers = speakers;
    return speakers.length > 0;
  } catch {
    return false;
  }
}

if (!fs.existsSync(cachePath)) throw new Error(`Missing events cache: ${cachePath}`);
const events = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
let verified = 0;

for (let index = 0; index < events.length; index += CONCURRENCY) {
  const batch = events.slice(index, index + CONCURRENCY);
  const results = await Promise.all(batch.map(enrichEvent));
  verified += results.filter(Boolean).length;
}

fs.writeFileSync(cachePath, `${JSON.stringify(events, null, 2)}\n`);
console.log(`Verified speakers for ${verified}/${events.length} events from official pages.`);
