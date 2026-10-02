import imagesJson from '../../../content/nomad-display-images.json';
import type { ResponsiveImagePlan } from '../responsive-images';

const images = imagesJson as Record<string, { base: string; width: number; height: number }>;

export function cityImagePlan(src: string | null): ResponsiveImagePlan | undefined {
  const image = src ? images[src] : undefined;
  if (!image) return undefined;
  return {
    src: `${image.base}-480.webp`, width: image.width, height: image.height,
    srcSet: [...new Set([480, image.width])].map(width => `${image.base}-${width}.webp ${width}w`).join(', '),
  };
}
