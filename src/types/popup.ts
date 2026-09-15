export type PopupType = 'popup' | 'permanent' | 'sez';

export type PopupSocials = {
  x?: string;
  telegram?: string;
  discord?: string;
  instagram?: string;
  youtube?: string;
  farcaster?: string;
  linktree?: string;
};

export type PopupPost = {
  url: string;
  author: string;
  username?: string | null;
  text: string;
  date?: string | null;
  avatar?: string | null;
};

export type PopupSocialEmbed = {
  platform: 'linkedin' | 'instagram';
  /** Official iframe `src` (e.g. LinkedIn `/embed/feed/update/…`). */
  embedUrl: string;
  /** Short label for accessibility / link-out. */
  label?: string;
  /** Public post URL when different from embed URL. */
  viewUrl?: string;
};

export type Popup = {
  slug: string;
  name: string;
  tagline: string;
  summary: string;
  body: string[];
  location: string;
  type: PopupType;
  themes: string[];
  website?: string;
  image?: string;
  coverImages?: string[];
  foundedYear?: number;
  residents?: string;
  socials: PopupSocials;
  sources: Array<'ns' | 'xyz'>;
  posts?: PopupPost[];
  socialEmbeds?: PopupSocialEmbed[];
  pricing?: string[];
  pricingSummary?: string | null;
  amenities?: string[];
  history?: string[];
  durationNotes?: string[];
  locationDetails?: string[];
  overview?: string[];
  xyzUrl?: string | null;
};
