import type { Popup } from '@/types/popup';
import {
  isCommunityPhotoRef,
  isPopupOgCoverArtifact,
  scoreCommunityPhotoUrl,
} from '@/lib/popup-community-photos';

/** Community / event photos for the cover gallery (header `image` stays the logo). */
export function popupCoverImagePaths(popup: Popup): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const src of popup.coverImages ?? []) {
    const t = src.trim();
    if (!t || seen.has(t) || !isCommunityPhotoRef(t)) continue;
    seen.add(t);
    out.push(t);
  }
  return out;
}

export const POPUP_MIN_COVER_IMAGES = 2;
export const POPUP_MAX_COVER_IMAGES = 3;

/** Keep the best community shots for carousel / OG (cap + drop OG scrape artifacts). */
export function trimPopupCoverImages(images: string[]): string[] {
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const src of images) {
    const t = src.trim();
    if (!t || seen.has(t) || !isCommunityPhotoRef(t)) continue;
    seen.add(t);
    unique.push(t);
  }

  const realGallery = unique.filter((u) => !isPopupOgCoverArtifact(u));
  const hasGallerySet =
    realGallery.length >= 2 ||
    unique.some((u) => /gallery\d|events-gallery|cs-\d{2}-/i.test(u));

  let kept = hasGallerySet ? realGallery : unique;
  kept = [...kept].sort((a, b) => scoreCommunityPhotoUrl(b) - scoreCommunityPhotoUrl(a));
  return kept.slice(0, POPUP_MAX_COVER_IMAGES);
}

export function popupCommunityCoverCount(popup: Popup): number {
  return popupCoverImagePaths(popup).length;
}

/** @deprecated use popupCommunityCoverCount */
export function popupCoverImageCount(popup: Popup): number {
  return popupCommunityCoverCount(popup);
}
