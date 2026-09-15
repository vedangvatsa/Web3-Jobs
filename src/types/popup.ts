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
  pricing?: string[];
  pricingSummary?: string | null;
  amenities?: string[];
  history?: string[];
  durationNotes?: string[];
  locationDetails?: string[];
  overview?: string[];
  xyzUrl?: string | null;
};
