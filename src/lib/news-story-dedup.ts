/**
 * TypeScript entry for Next.js — implementation lives in scripts/news-story-dedup.mjs.
 * Keep both in sync when changing dedup rules.
 */
export {
  normalizeUrl,
  stemWord,
  getKeywords,
  distinctiveTokens,
  eventFingerprint,
  fingerprintsMatch,
  isSimilar,
  sameEvent,
  postedTexts,
  recentPostedTexts,
  alreadyCovered,
  rememberPostedStory,
  trimPostedLog,
} from '../../scripts/news-story-dedup.mjs';

export type PostedStory = {
  link?: string;
  headline?: string;
  originalTitle?: string;
  summary?: string;
  snippet?: string;
};
