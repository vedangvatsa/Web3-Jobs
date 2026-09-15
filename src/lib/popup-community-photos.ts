/** Heuristics: gallery should show event / cohort / place photos, not logos or press marks. */

const LOGO_MARK =
  /(?:^|\/)(logo|favicon|webclip|opengraph|twitter-image|apple-touch)(?:\.|[-_])/i;

const GENERIC_OG = /opengraph-image|twitter-image\.png|cover-82f5097857/i;

const PRESS_OR_UI =
  /techcrunch|decrypt|techpoint|techcabal|tekedia|weetracker|latestly|coin-republic|socials\/|email\//i;

/** Founder headshots / speaker cards, not cohort event photography. */
const PORTRAIT_GRID =
  /630e39[0-9a-f]{2,}_[A-Za-z%20-]+\.(jpe?g|png)$/i;

/** Hashed `cover-*.jpeg` from OG scrapes and similar one-off press art. */
export function isPopupOgCoverArtifact(ref: string): boolean {
  return /\/cover-[a-f0-9]{10}\.(jpe?g|webp|png)$/i.test(ref) || /open-graph\.(jpe?g|png)$/i.test(ref);
}

const COMMUNITY_HINT =
  /gallery|community|crowd|events-gallery|banner|hero|village|views|street|people|forest|work|walk|mountain|camp|tower|city|gym|talk|accra|buenos|selfie|kitchen|presentation|houses|building|boat|restaurant|flags|zanzibar|island|vitalik|stay-big|pool-residents|cs-\d{2}-/i;

export function isCommunityPhotoRef(ref: string): boolean {
  const t = ref.trim();
  if (!t) return false;
  if (LOGO_MARK.test(t) || GENERIC_OG.test(t) || PRESS_OR_UI.test(t) || PORTRAIT_GRID.test(t)) {
    return false;
  }
  if (/open-graph\.(jpe?g|png)$/i.test(t) && !/events-gallery/i.test(t)) return false;
  if (/\/logo\.(webp|png|jpe?g|svg)$/i.test(t)) return false;
  if (/gallery\d*\.(png|jpe?g|webp)$/i.test(t)) return true;
  if (/\.png$/i.test(t) && !COMMUNITY_HINT.test(t)) return false;
  if (/-p-\d+\./i.test(t)) return false;
  if (COMMUNITY_HINT.test(t)) return true;
  if (/assets\.ns\.com\/static\/dashboard\//i.test(t) && /gallery|banner/i.test(t)) return true;
  if (/cover-[a-f0-9]{10}\.(jpe?g|webp|png)$/i.test(t)) return false;
  if (/events-gallery/i.test(t)) return true;
  if (/room-honeymoon|\/room-[a-z]+-\d/i.test(t)) return false;
  if (/\.(jpe?g|webp)$/i.test(t) && !/logo/i.test(t)) return true;
  return false;
}

export function scoreCommunityPhotoUrl(url: string): number {
  let s = 0;
  if (/events-gallery|gallery\d|akiyagallery/i.test(url)) s += 25;
  if (/community|crowd|people|cohort|group/i.test(url)) s += 18;
  if (/banner|hero|village|campus/i.test(url)) s += 12;
  if (/states\/[a-z0-9-]+\/(?!logo)/i.test(url)) s += 15;
  if (/pool-residents|community-night|cs-\d{2}-(community|dinner|workshop|veranda|dancefloor|pool)/i.test(url)) {
    s += 22;
  }
  if (/image[1-9]\.|community_video/i.test(url)) s += 20;
  if (/room-honeymoon|\/room-/i.test(url)) s -= 25;
  if (/og\/stay-/i.test(url)) s += 14;
  if (/cover-[a-f0-9]{10}\./i.test(url)) s -= 50;
  if (/logo|favicon|opengraph|webclip|press|techcrunch/i.test(url)) s -= 40;
  if (/\.png$/i.test(url)) s -= 8;
  if (/-p-\d+\./i.test(url)) s -= 12;
  return s;
}
