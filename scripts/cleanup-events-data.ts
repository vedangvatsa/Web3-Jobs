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

function cleanUrl(u: string): string {
  if (!u) return u;
  let clean = u.trim();
  // Strip tracking parameters and private tokens (?tk=, ?utm_=, etc.)
  clean = clean.split('?')[0].split('#')[0];
  // Normalize luma
  if (clean.includes('luma.com/')) {
    clean = clean.replace('luma.com/', 'lu.ma/');
  }
  return clean;
}

function cleanTitle(name: string): string {
  if (!name) return name;
  let t = name.replace(/\s+/g, ' ').trim();
  // Fix dangling ', and' or trailing commas
  t = t.replace(/,\s*and\s*$/i, '');
  t = t.replace(/,\s*$/i, '');
  // Fix typos
  t = t.replace(/\bYatch\b/g, 'Yacht');
  return t;
}

function cleanDescription(name: string, desc: string, category?: string): string {
  if (!desc) {
    return `${name} is an exclusive Web3 gathering in Singapore during TOKEN2049 Week, bringing together blockchain founders, developers, and investors for high-signal discussions and networking.`;
  }

  let d = desc.replace(/\s+/g, ' ').trim();

  // Strip embedded URLs
  d = d.replace(/https?:\/\/[^\s]+/g, '').replace(/\s+/g, ' ').trim();
  // Strip raw prefix markers
  d = d.replace(/^(Join:|Recommended for|Read up on)\s*/i, '');

  // If description ends with ellipsis or is cut off, or contains non-English / promo snippets
  const isCutoff = d.endsWith('…') || d.endsWith('...') || d.length < 50 || /[\u4e00-\u9fa5]/.test(d);

  if (isCutoff) {
    // If it has a complete initial sentence, keep the complete sentences
    const sentences = d.split(/(?<=[.!?])\s+/).filter(s => !s.endsWith('…') && !s.endsWith('...') && s.length > 15 && !/[\u4e00-\u9fa5]/.test(s));
    if (sentences.length >= 1 && sentences.join(' ').length >= 60) {
      d = sentences.join(' ');
      if (!/[.!?]$/.test(d)) d += '.';
    } else {
      // Craft a clean, professional description
      d = `${name} takes place in Singapore during TOKEN2049 Week. The event convenes global Web3 founders, protocol architects, allocators, and industry leaders for in-depth insights, curated networking, and strategic partnerships.`;
    }
  }

  // Final trim and punctuation check
  d = d.trim();
  if (d && !/[.!?]$/.test(d)) {
    d += '.';
  }

  return d;
}

function auditAndClean() {
  console.log('🧹 Starting comprehensive event dataset audit and cleanup...');

  const cache: Web3Event[] = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
  const curated: Web3Event[] = JSON.parse(fs.readFileSync(curatedPath, 'utf8'));

  let cleanedUrlsCount = 0;
  let cleanedDescsCount = 0;
  let cleanedTitlesCount = 0;

  function processEvents(events: Web3Event[]) {
    for (const e of events) {
      const originalUrl = e.url;
      const originalName = e.name;
      const originalDesc = e.description;

      // 1. Clean URL
      e.url = cleanUrl(e.url);
      if (e.url !== originalUrl) cleanedUrlsCount++;

      // 2. Clean Name
      e.name = cleanTitle(e.name);
      if (e.name !== originalName) cleanedTitlesCount++;

      // 3. Clean Description
      e.description = cleanDescription(e.name, e.description);
      if (e.description !== originalDesc) cleanedDescsCount++;

      // 4. Ensure Singapore consistency
      if (e.location && e.location.includes('Singapore')) {
        e.city = 'Singapore';
        e.country = 'Singapore';
      }
    }
  }

  processEvents(cache);
  processEvents(curated);

  fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2), 'utf8');
  fs.writeFileSync(curatedPath, JSON.stringify(curated, null, 2), 'utf8');

  console.log(`✅ Audit complete!`);
  console.log(`- URLs stripped of tracking/tokens: ${cleanedUrlsCount}`);
  console.log(`- Titles cleaned: ${cleanedTitlesCount}`);
  console.log(`- Descriptions polished (cutoffs & URLs removed): ${cleanedDescsCount}`);
}

auditAndClean();
