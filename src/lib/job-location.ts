/**
 * Utilities for cleaning and normalizing messy ATS job locations.
 *
 * ATS systems like Greenhouse, Lever, and Workday often return locations with:
 * - Redundant hierarchy joined by semicolons: "Australia; Sydney, New South Wales, Australia"
 * - Redundant broad regional tags: "Brazil; LATAM; Remote Roles - LATAM; São Paulo, Brazil"
 * - Duplicate city/country names: "Singapore, Singapore", "Budapest, Budapest, Hungary", "Hong Kong, Hong Kong SAR"
 * - Multi-office semicolon-delimited lists: "Menlo Park, CA; New York, NY"
 */

const REGION_ONLY_RE = /^(?:LATAM|APAC|EMEA|AMER|Remote Roles\s*-\s*(?:LATAM|APAC|EMEA|AMER)|United States\s*\(US\)|US|USA)$/i;

/**
 * Cleans a single location part (e.g. "Sydney, New South Wales, Australia" or "Singapore, Singapore").
 */
export function cleanSingleLocationPart(part: string): string {
  let s = part.trim();
  s = s.replace(/^[,\s;]+|[,\s;]+$/g, '');

  // Budapest, Budapest, Hungary -> Budapest, Hungary
  // Vienna, Vienna, Austria -> Vienna, Austria
  // Bogotá, Bogotá, Colombia -> Bogotá, Colombia
  s = s.replace(/^([^\s,]+(?:\s+[^\s,]+)*),\s*\1,\s*(.+)$/iu, '$1, $2');

  // Singapore, Singapore -> Singapore
  if (/^singapore,\s*singapore$/i.test(s)) {
    s = 'Singapore';
  }

  // Hong Kong, Hong Kong SAR -> Hong Kong
  s = s.replace(/^Hong Kong,\s*Hong Kong(?:\s*SAR)?$/i, 'Hong Kong');

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
