import { shouldDropPopupLine } from '@/lib/popup-copy-guard';
import { normalizePopupDashes } from '@/lib/popup-dashes';

/** Normalize popup copy for display (entities, mojibake, stray UI scrape). */
export function formatPopupText(text: string): string {
  let t = text
    .replace(/\r\n/g, '\n')
    .replace(/\u00a0/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/Â(?=[A-Za-z])/g, '')
    .replace(/\s*\u2666\s*/g, ' ')
    .replace(/♔/g, '')
    .replace(/→/g, ' ')
    .replace(/[\u200b-\u200d\ufeff]/g, '');

  // Undo accidental "xyz. city" / "ns. com" splits from earlier bad sentence chopping
  t = t.replace(/\b([a-z0-9]+)\.\s+(city|com|io|co|bt|ai|xyz|org|net)\b/gi, '$1.$2');

  t = t.replace(/\s+/g, ' ').trim();
  t = normalizePopupDashes(t);
  t = t.replace(/\s+([.,;:])/g, '$1');
  t = t.replace(/\s+([,;])\s*/g, '$1 ');
  t = t.replace(/([.!?])\s*([A-Z])/g, '$1 $2');
  return t;
}

const MARKETING_PHRASE_BREAKS = [
  'Data sovereignty',
  'Ecosystem Access',
  'Elastic compute',
  'Guaranteed internet',
  'Premium physical',
  'Exclusive networking',
  'Vetted service',
  'Growth-Ready Infrastructure',
  '3,000+ community',
  'Trusted by Forward-Thinking',
  'Business Company Formation',
  'Itana Digital Residency',
  'Community Itana Digital',
];

/** Insert periods only before known glued marketing phrases (not place names). */
export function insertSentenceBreaksInRunOn(text: string): string {
  let t = formatPopupParagraph(text);
  if (t.length < 100 || (t.match(/[.!?]/g) ?? []).length >= 2) return t;

  for (const phrase of MARKETING_PHRASE_BREAKS) {
    const re = new RegExp(`([a-z0-9%])\\s+(?=${phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    t = t.replace(re, '$1. ');
  }
  return formatPopupParagraph(t);
}

export function explodePopupTextLines(lines: string[]): string[] {
  const out: string[] = [];
  for (const raw of lines) {
    const broken = insertSentenceBreaksInRunOn(raw);
    if (broken.length > 220 && (broken.match(/[.!?]/g) ?? []).length === 0) {
      continue;
    }
    const parts = splitPopupSentences(broken);
    if (parts.length > 1) {
      for (const p of parts) {
        if (p.length > 20) out.push(p);
      }
    } else if (broken.length > 20) {
      out.push(broken);
    }
  }
  return out;
}

/** Join lines split mid-sentence (common in scraped history blocks). */
export function mergeBrokenPopupLines(lines: string[]): string[] {
  const merged: string[] = [];
  for (const raw of lines) {
    const t = formatPopupParagraph(raw);
    if (!t) continue;
    const prev = merged[merged.length - 1];
    const nextIsNewEntry =
      /^(?:in|by|after|during|for)\s+\d{4}\b/i.test(t) ||
      /^\d{4}\b/.test(t) ||
      /^(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b/i.test(t);
    const prevDangles = prev && /\b(on|the|a|an|and|or|of|to|for|with|from|into|welcome)\s*$/i.test(prev);
    const prevIncomplete = prev && !/[.!?]$/.test(prev) && (prevDangles || /^[a-z(]/.test(t));
    if (prevIncomplete && !nextIsNewEntry && (/^[a-z(]/.test(t) || prevDangles)) {
      merged[merged.length - 1] = `${prev} ${t}`;
      continue;
    }
    merged.push(t);
  }
  return merged;
}

export function formatPopupParagraph(text: string): string {
  return formatPopupText(text).replace(/\n+/g, ' ');
}

/** Drop lines that are clearly nav/marketing scrape, not editorial copy. */
export function isPopupScrapeNoise(line: string): boolean {
  const t = formatPopupText(line);
  if (t.length < 12) return true;
  if (/^Read more/i.test(t)) return true;
  if (/Get a job/i.test(t)) return true;
  if (/All results go into/i.test(t)) return true;
  if (/Burn Calories/i.test(t)) return true;
  if (/^\d{2}\s*-\s*What .+ do /i.test(t)) return true;
  if (/database\.\s*$/i.test(t) && t.length < 120) return true;
  // Sourced-from-NS meta lines
  if (/appears (in|on) Network School/i.test(t)) return true;
  if (/shows up on the Network School dashboard/i.test(t)) return true;
  if (/listed on the Network School dashboard/i.test(t)) return true;
  if (/on the Network School (dashboard|list)\b/i.test(t)) return true;
  if (/Also listed on the\b/i.test(t)) return true;
  if (/ns\.com dashboard/i.test(t)) return true;
  if (/Network School directories/i.test(t)) return true;
  // CTA / website chrome / broken UI strings
  if (/^Apply to Stay\b/i.test(t)) return true;
  if (/^Learn More\b/i.test(t)) return true;
  if (/^Join the (conversation|community)\b/i.test(t)) return true;
  if (/^join the community\b/i.test(t)) return true;
  if (/Something went wrong/i.test(t)) return true;
  if (/try again\s*:?\s*\)/i.test(t)) return true;
  if (/What residents are saying/i.test(t)) return true;
  if (/view on Instagram/i.test(t)) return true;
  if (/Help shape .+ WhatsApp/i.test(t)) return true;
  if (/About .+ food\b/i.test(t) && t.length < 80) return true;
  if (/Explore the villas\b/i.test(t)) return true;
  if (/Three meals a day, together\b/i.test(t)) return true;
  if (/An innovative economic model Below/i.test(t)) return true;
  if (/A new model of living What if/i.test(t)) return true;
  if (/Hidden Sanctuary for Your Family/i.test(t)) return true;
  if (/Underwater Drones\b/i.test(t)) return true;
  if (/Ground Effect Drones\b/i.test(t)) return true;
  if (/About the ArkPad/i.test(t)) return true;
  if (/Entrepreneur Workshop\b/i.test(t)) return true;
  if (/An intro to\b/i.test(t)) return true;
  if (/^\d+\+ members building\b/i.test(t)) return true;
  if (/^\w+ \d{1,2},?\s+\d{4}\b.+\b(Workshop|Meetup|Event)\b/i.test(t)) return true;
  if (/^\d{4}\s*[-–—]\s*.+\d{4}\s*[-–—]/i.test(t)) return true; // stacked event calendar dumps
  if (/Amagi Life['’]re building/i.test(t)) return true;
  if (/Akiya Collective['’]?re looking/i.test(t)) return true;
  if (/follow Akiya Collective/i.test(t)) return true;
  if (/apply for core team/i.test(t)) return true;
  if (/[\uFFFD\uE000-\uF8FF]/.test(t)) return true; // replacement / private-use glyphs from bad emoji
  // Scrape section headers / FAQ prompts
  if (/^Amenities in .+ include:?$/i.test(t)) return true;
  if (/^Tickets include:?$/i.test(t)) return true;
  if (/shows up in the same .+ directories/i.test(t)) return true;
  if (/\b(in|across|on) (?:both |the )?(?:xyz\.city and Network School )?directories\b/i.test(t)) return true;
  if (/^What (is|kind of|are)\b.+\?$/i.test(t)) return true;
  if (shouldDropPopupLine(t)) return true;
  return false;
}

/** Tweet / post copy: keep paragraph breaks, normalize each line. */
export function formatPopupPostText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => formatPopupText(line))
    .filter(Boolean)
    .join('\n\n');
}

export function filterPopupBody(body: string[]): string[] {
  return body
    .map(formatPopupParagraph)
    .filter((p) => p.length > 0 && !isPopupScrapeNoise(p) && !shouldDropPopupLine(p));
}

/**
 * Split prose into sentences without breaking domains like xyz.city or ns.com.
 */
export function splitPopupSentences(block: string): string[] {
  const text = formatPopupParagraph(block);
  if (!text) return [];

  let protectedText = text.replace(
    /\b([a-z0-9-]+)\.(city|com|io|co|bt|ai|xyz|org|net|app)\b/gi,
    (_, a, b) => `${a}DOT${b}`,
  );
  // Keep short abbreviations like T.I.A. / U.S. from becoming sentence breaks.
  protectedText = protectedText.replace(/\b([A-Z])\.(?=[A-Z]\.)/g, '$1DOT');
  protectedText = protectedText.replace(/\b([A-Z])\.(?=\s|$)/g, '$1DOT');

  const parts =
    protectedText.match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g)?.map((s) => s.trim()) ?? [protectedText];

  return parts
    .map((s) => s.replace(/DOT/g, '.').trim())
    .filter((s) => s.length > 0);
}
