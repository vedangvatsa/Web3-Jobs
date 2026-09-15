function norm(line: string): string {
  return line.replace(/\s+/g, ' ').trim();
}

/** Generic filler added during bulk enrichment — not project-specific facts. */
const GENERIC_FILLER = [
  /^Use the official website as the source of truth for open applications/i,
  /^Directory summaries here are for orientation/i,
  /^When a project runs both permanent hubs and popups/i,
  /^Confirm dates, pricing, and applications on the official site at/i,
];

const SCRAPE_MARKERS = [
  /\bHome About\b/i,
  /\bGet involved Contact\b/i,
  /\bLearn More Deep-tech\b/i,
  /\bSkip to content\b/i,
  /\bPosts Timeline\b/i,
  /\bWho it's for\b/i,
  /\bResource links\b/i,
  /\bFrequently asked questions\b/i,
  /\bPowered by\b/i,
  /\bContinue with Google\b/i,
  /\bRequest Access\b/i,
  /\bJoin the chat\b/i,
  /Collective've\b/i,
  /\bBusiness Residence Publications\b/i,
];

const SLOP_WORDS =
  /\b(seamless(?:ly)?|revolutionary|unlock(?:ing)?|empower(?:ing)?|delve|testament|game-changer|cutting-edge|holistic|comprehensive|pivotal|next-level|without further ado|at its core|dive into|beacon|tapestry|embark|elevate|vibrant|flourishing|maximize human flourishing|lived, daily reality|pioneering concepts)\b/i;

export function isPopupGenericFiller(line: string): boolean {
  const t = norm(line);
  return GENERIC_FILLER.some((re) => re.test(t));
}

export function isPopupScrapeCopy(line: string): boolean {
  const t = norm(line);
  if (t.length < 12) return true;
  if (SCRAPE_MARKERS.some((re) => re.test(t))) return true;
  // Nav-stuffed lines: many short Title Case tokens in a row
  if (/\b(About|Events|Explore|Contact)\b.*\b(About|Events|Explore|Contact)\b/.test(t)) return true;
  return false;
}

export function isPopupSlopCopy(line: string): boolean {
  const t = norm(line);
  if (SLOP_WORDS.test(t)) return true;
  if (/building the future of community, work, and coordination/i.test(t)) return true;
  if (/bridging cutting-edge tech with dense human connection/i.test(t)) return true;
  return false;
}

export function shouldDropPopupLine(line: string): boolean {
  return isPopupGenericFiller(line) || isPopupScrapeCopy(line) || isPopupSlopCopy(line);
}

export function scrubPopupLines(lines: string[] | undefined): string[] {
  if (!lines?.length) return [];
  const out: string[] = [];
  const seen = new Set<string>();
  for (const raw of lines) {
    const t = norm(raw);
    if (!t || shouldDropPopupLine(t)) continue;
    const key = t.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t);
  }
  return out;
}
