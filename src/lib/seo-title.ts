/** Google typically displays ~50–60 characters of the HTML title. Layout adds ` | Hashtag Web3`. */

export const SEO_SITE_NAME = 'Hashtag Web3';
export const SEO_TITLE_MAX = 60;

export const SEO_TITLE_BRAND_SUFFIX = ` | ${SEO_SITE_NAME}`;

/** Max length for metadata.title segments before the root layout template adds the brand. */
export const SEO_TITLE_SEGMENT_MAX = SEO_TITLE_MAX - SEO_TITLE_BRAND_SUFFIX.length;

export function stripTrailingBrand(title: string, siteName = SEO_SITE_NAME): string {
  const trimmed = title.trim();
  const suffix = ` | ${siteName}`;
  if (trimmed.endsWith(suffix)) return trimmed.slice(0, -suffix.length).trim();
  const dashSuffix = ` - ${siteName}`;
  if (trimmed.endsWith(dashSuffix)) return trimmed.slice(0, -dashSuffix.length).trim();
  return trimmed;
}

export function truncateTitleAtWord(text: string, max: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  const cut = trimmed.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  if (lastSpace >= Math.floor(max * 0.55)) return cut.slice(0, lastSpace).trimEnd();
  return cut.trimEnd();
}

/** Use in `metadata.title` — root layout appends the brand suffix. */
export function seoTitleSegment(segment: string, maxSegment = SEO_TITLE_SEGMENT_MAX): string {
  return truncateTitleAtWord(stripTrailingBrand(segment), maxSegment);
}

/** Full title for Open Graph / Twitter (brand included once). */
export function seoSocialTitle(segment: string): string {
  const seg = seoTitleSegment(segment);
  return truncateTitleAtWord(`${seg}${SEO_TITLE_BRAND_SUFFIX}`, SEO_TITLE_MAX);
}

/** Final document title as rendered in the browser tab. */
export function applyTitleTemplate(segment: string): string {
  return seoSocialTitle(segment);
}

export function isTitleLengthCompliant(fullTitle: string, max = SEO_TITLE_MAX): boolean {
  return fullTitle.trim().length <= max;
}