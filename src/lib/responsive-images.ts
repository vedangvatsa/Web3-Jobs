export type ResponsiveImagePlan = {
  src: string;
  width: number;
  height: number;
  srcSet?: string;
  webpSrcSet?: string;
  avifSrcSet?: string;
};

export function containedEventImageSizes(plan?: ResponsiveImagePlan): string {
  const ratio = plan ? plan.width / plan.height : 16 / 9;
  return `(max-width: 640px) min(calc(100vw - 2rem), ${Math.ceil(280 * ratio)}px), min(1152px, ${Math.ceil(320 * ratio)}px)`;
}

/** A landscape image filling a square needs pixels for the width cropped away too. */
export function squareGalleryImageSizes(plan?: ResponsiveImagePlan): string {
  const ratio = Math.max(1, plan ? plan.width / plan.height : 1);
  return `(max-width: 1024px) ${Math.ceil(50 * ratio)}vw, ${Math.ceil(33 * ratio)}vw`;
}
