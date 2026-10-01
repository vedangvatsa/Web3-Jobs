import manifestJson from '../../content/responsive-images.json';
import redirectsJson from '../../content/image-redirects.json';
import type { ResponsiveImagePlan } from './responsive-images';
import type { CompanyLogoMap } from './job-logo-map';

const manifest = manifestJson as Record<string, ResponsiveImagePlan & { hash?: string }>;
const redirects = redirectsJson as Record<string, string>;

export function getImageVariants(src?: string | null): ResponsiveImagePlan | undefined {
  if (!src) return undefined;
  const url = new URL(src, 'https://hashtagweb3.com');
  if (!['hashtagweb3.com', 'www.hashtagweb3.com'].includes(url.hostname)) return undefined;
  const image = manifest[redirects[url.pathname] || url.pathname];
  if (!image) return undefined;
  const { src: original, width, height, srcSet, webpSrcSet, avifSrcSet } = image;
  return { src: original, width, height, ...(srcSet && { srcSet }), ...(webpSrcSet && { webpSrcSet }), ...(avifSrcSet && { avifSrcSet }) };
}

export function withLogoImageVariants(logos: CompanyLogoMap): CompanyLogoMap {
  return Object.fromEntries(Object.entries(logos).map(([slug, logo]) => {
    const imageVariants = getImageVariants(logo.logo);
    return [slug, { ...logo, ...(imageVariants && { imageVariants }) }];
  }));
}
