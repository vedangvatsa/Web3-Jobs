import imageInfo from '../../content/social-image-info.json';

export type SocialImageInfo = { url: string; width: number; height: number; type: string };
const images = imageInfo as Record<string, SocialImageInfo>;

export function getSocialImageInfo(source: string): SocialImageInfo {
  try {
    const url = new URL(source, 'https://hashtagweb3.com');
    const key = ['hashtagweb3.com', 'www.hashtagweb3.com'].includes(url.hostname) ? url.pathname : url.toString();
    if (images[key]) return images[key];
  } catch { /* Use the validated local fallback for malformed metadata. */ }
  return images['/og-image.png'] || { url: 'https://hashtagweb3.com/og-image.png', width: 1200, height: 630, type: 'image/png' };
}
