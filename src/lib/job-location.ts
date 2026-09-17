/**
 * Utilities for cleaning and normalizing messy ATS job locations.
 *
 * ATS systems like Greenhouse, Lever, and Workday often return locations with:
 * - Redundant hierarchy joined by semicolons: "Australia; Sydney, New South Wales, Australia"
 * - Redundant broad regional tags: "Brazil; LATAM; Remote Roles - LATAM; São Paulo, Brazil"
 * - Duplicate city/country names: "Singapore, Singapore", "Budapest, Budapest, Hungary", "Hong Kong, Hong Kong SAR"
 * - Multi-office semicolon-delimited lists: "Menlo Park, CA; New York, NY"
 * - ATS codes and internal placeholders: "US-NYC", "Office - Chicago", "Remote Roles - EMEA"
 * - Double commas/punctuation artifacts: "Belgrade, , Serbia"
 */

const REGION_ONLY_RE = /^(?:LATAM|APAC|EMEA|AMER|Remote Roles\s*-\s*(?:LATAM|APAC|EMEA|AMER)|United States\s*\(US\)|US|USA)$/i;

const ATS_CODE_MAP: Record<string, string> = {
  'US-NYC': 'New York, NY',
  'US-NY': 'New York, NY',
  'US-New York City': 'New York, NY',
  'US-New York': 'New York, NY',
  'US-SF-HQ': 'San Francisco, CA',
  'US-SF': 'San Francisco, CA',
  'US-San Francisco': 'San Francisco, CA',
  'US-SEA': 'Seattle, WA',
  'US-Seattle': 'Seattle, WA',
  'US-CHI': 'Chicago, IL',
  'US-Chicago': 'Chicago, IL',
  'US-Atlanta': 'Atlanta, GA',
  'US-Georgia': 'Georgia',
  'US-Remote-CA': 'Remote (California)',
  'US-West Coast (Remote)': 'Remote (US West Coast)',
  'US-Remote': 'Remote (US)',
  'US-REM': 'Remote (US)',
  'CA-Toronto': 'Toronto, Canada',
  'CA-Remote': 'Remote (Canada)',
  'AMER-US-Remote': 'Remote (US)',
};

const SORTED_ATS_CODES = Object.keys(ATS_CODE_MAP).sort((a, b) => b.length - a.length);

/**
 * Cleans a single location part (e.g. "Sydney, New South Wales, Australia" or "Singapore, Singapore").
 */
export function cleanSingleLocationPart(part: string): string {
  let s = part.trim();

  // Whitespace & punctuation artifacts
  s = s.replace(/\s*,\s*,\s*/g, ', ');
  s = s.replace(/\s+,\s*/g, ', ');
  s = s.replace(/\s+;\s*/g, '; ');
  s = s.replace(/^[,\s;/]+|[,\s;/]+$/g, '');

  // Strip ATS internal office prefixes
  s = s.replace(/\bOffice\s*-\s*NYC\b/g, 'New York, NY');
  s = s.replace(/\bOffice\s*-\s*Chicago\b/g, 'Chicago, IL');

  // Replace ATS shorthand codes (US-NYC, US-Remote, etc.)
  for (const code of SORTED_ATS_CODES) {
    s = s.split(code).join(ATS_CODE_MAP[code]);
  }

  // Common country/city redundancies & specific typos
  s = s.replace(/\bCananda\b/g, 'Canada');
  s = s.replace(/\bMexico,\s*Mexico City\b/gi, 'Mexico City, Mexico');
  s = s.replace(/\bSingapore,\s*Central Singapore,\s*Singapore\b/gi, 'Singapore');
  s = s.replace(/\bSingapore,\s*Singapore\b/gi, 'Singapore');
  s = s.replace(/\bHong Kong,\s*Hong Kong(?:\s*SAR)?\b/gi, 'Hong Kong');
  s = s.replace(/\bNetherlands,\s*Netherlands\b/gi, 'Netherlands');

  // Exact duplicate single country/city: 'Luxembourg, Luxembourg', 'Poland, Poland', 'Malta, Malta'
  s = s.replace(/^([A-Za-z\u00C0-\u024F]+),\s*\1$/iu, '$1');

  // ATS pattern 'Remote Roles - EMEA' -> 'EMEA (Remote)'
  s = s.replace(/^Remote Roles\s*-\s*([A-Za-z]+)$/i, '$1 (Remote)');

  // Budapest, Budapest, Hungary -> Budapest, Hungary
  // Vienna, Vienna, Austria -> Vienna, Austria
  // Bogotá, Bogotá, Colombia -> Bogotá, Colombia
  s = s.replace(/^([^\s,]+(?:\s+[^\s,]+)*),\s*\1,\s*(.+)$/iu, '$1, $2');

  // Slashes deduplication: 'Taiwan / Taiwan / South Korea / Japan'
  if (s.includes(' / ')) {
    const parts = s.split(' / ').map((p) => p.trim()).filter(Boolean);
    const unique = [...new Set(parts)];
    s = unique.join(' / ');
  }

  return s;
}

/**
 * Takes a raw job location string (potentially multi-office or hierarchical)
 * and returns a clean, human-readable display string.
 *
 * Examples:
 * - "Australia; Sydney, New South Wales, Australia" -> "Sydney, New South Wales, Australia"
 * - "Brazil; LATAM; Remote Roles - LATAM; São Paulo, Brazil" -> "São Paulo, Brazil"
 * - "Hong Kong, Hong Kong SAR; Singapore, Singapore" -> "Hong Kong; Singapore"
 * - "Menlo Park, CA; New York, NY" -> "Menlo Park, CA; New York, NY"
 */
export function cleanJobLocation(rawLocation?: string | null): string {
  if (!rawLocation || !rawLocation.trim()) return 'Remote';
  const loc = rawLocation.trim();

  const rawParts = loc.split(';').map((p) => p.trim()).filter(Boolean);
  if (rawParts.length <= 1) {
    return cleanSingleLocationPart(loc);
  }

  const cleanedParts = rawParts.map(cleanSingleLocationPart).filter(Boolean);

  // Filter out redundant broad parts if a more specific part exists
  const kept: string[] = [];
  for (let i = 0; i < cleanedParts.length; i++) {
    const current = cleanedParts[i]!;
    const isRedundant = cleanedParts.some((other, idx) => {
      if (idx === i) return false;
      const lowerOther = other.toLowerCase();
      const lowerCurrent = current.toLowerCase();

      // If another part has comma-separated details (e.g. 'Sydney, New South Wales, Australia')
      // and current is just one of those tokens (e.g. 'Australia' or 'New South Wales')
      if (other.includes(',') && !current.includes(',')) {
        const otherTokens = lowerOther.split(',').map((t) => t.trim());
        if (otherTokens.includes(lowerCurrent)) {
          return true;
        }
      }

      // If current is a broad region/tag and another part is a specific location
      if (REGION_ONLY_RE.test(current)) {
        return true;
      }

      return false;
    });

    if (!isRedundant && !kept.includes(current)) {
      kept.push(current);
    }
  }

  const finalParts = kept.length > 0 ? kept : cleanedParts;
  return finalParts.join('; ');
}

/**
 * Returns the primary (most specific) single location from a potentially multi-location string.
 * Used for single-location feeds, structured address schemas, or search facets.
 */
export function getPrimaryJobLocation(rawLocation?: string | null): string {
  const cleaned = cleanJobLocation(rawLocation);
  if (cleaned.includes(';')) {
    return cleaned.split(';')[0]!.trim();
  }
  return cleaned;
}
