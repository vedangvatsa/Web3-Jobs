#!/usr/bin/env npx tsx
/**
 * Automated News Social Poster (X and LinkedIn via Buffer Queue)
 *
 * Posts verified, published news articles to X and LinkedIn by queuing them in Buffer.
 * Uses mode: 'addToQueue' so Buffer automatically spaces out news posts from job opening posts.
 *
 * Captions are intentionally kept short, concise, and in simple, easy-to-understand plain English.
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { parseGeminiJsonResponse } from './gemini-json.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');

try { dotenv.config({ path: path.join(rootDir, '.env') }); } catch {}
try { dotenv.config({ path: path.join(rootDir, '.env.local'), override: true }); } catch {}

export const DEFAULT_BUFFER_X_CHANNEL = '6ab62682ea19ca0bdee284bd';
export const DEFAULT_BUFFER_LINKEDIN_CHANNEL = '69c5b139af47dacb695b5feb';
export const SITE_URL = 'https://hashtagweb3.com';

const GEMINI_MODELS = [
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3-flash-preview',
  'gemini-3.1-flash-lite-preview',
  'gemini-flash-latest',
];

export interface NewsArticle {
  slug: string;
  title: string;
  description: string;
  category: string;
  publishedDate: string;
  image?: string;
}

export interface NewsSocialReceipt {
  slug: string;
  platform: 'x' | 'linkedin';
  channelId: string;
  postId: string;
  status: string;
  slot?: string;
  date?: string;
  queuedAt: string;
}

export interface NewsSocialState {
  history: NewsSocialReceipt[];
}

export interface Captions {
  xHeadline: string;
  xBody: string;
  xFullText: string;
  linkedInHeadline: string;
  linkedInBody: string;
  linkedInFullText: string;
}

/**
 * Load published news articles from content/articles-index.json, sorted by date descending.
 */
export function loadPublishedNewsArticles(articlesIndexPath?: string): NewsArticle[] {
  const file = articlesIndexPath || path.join(rootDir, 'content/articles-index.json');
  if (!fs.existsSync(file)) return [];
  const articles: NewsArticle[] = JSON.parse(fs.readFileSync(file, 'utf8'));
  return articles
    .filter((a) => a.category === 'News' && Boolean(a.slug && a.title))
    .sort((a, b) => (b.publishedDate || '').localeCompare(a.publishedDate || ''));
}

/**
 * Clean text to ensure simple, plain English without buzzwords or fluff.
 */
export function sanitizePlainEnglish(text: string): string {
  return String(text || '')
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Truncate text cleanly on word boundaries.
 */
export function truncateWords(text: string, maxLen: number): string {
  const clean = sanitizePlainEnglish(text);
  if (clean.length <= maxLen) return clean;
  const sub = clean.slice(0, maxLen - 3);
  const lastSpace = sub.lastIndexOf(' ');
  return (lastSpace > 20 ? sub.slice(0, lastSpace) : sub).trim() + '...';
}

/**
 * Extract the first complete sentence, protecting common abbreviations.
 */
export function cleanFirstSentence(desc: string): string {
  const protectedText = String(desc || '')
    .replace(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec|No|Inc|Co|Dr|Mr|Ms)\./gi, '$1_DOT_')
    .replace(/\b(U\.S\.)/gi, 'US_DOT_')
    .replace(/\b(e\.g\.)/gi, 'EG_DOT_')
    .replace(/\b(i\.e\.)/gi, 'IE_DOT_');
  const first = protectedText.split(/[.?!]\s+/)[0] || desc;
  return first
    .replace(/_DOT_/g, '.')
    .replace(/US\./g, 'U.S.')
    .replace(/EG\./g, 'e.g.')
    .replace(/IE\./g, 'i.e.')
    .trim();
}

/**
 * Fallback caption generator using standard simple title and description.
 */
export function fallbackCaptions(article: NewsArticle): Captions {
  const cleanTitle = sanitizePlainEnglish(article.title);
  const cleanDesc = sanitizePlainEnglish(article.description);
  const firstSentence = cleanFirstSentence(cleanDesc);

  // Shorten cleanly for X on word boundaries (well within 280 chars)
  const xHeadline = truncateWords(cleanTitle, 70);
  const xBody = truncateWords(firstSentence, 105);
  const xUrl = `${SITE_URL}/${article.slug}?utm_source=twitter&utm_medium=social&utm_campaign=news`;
  const xFullText = `${xHeadline}\n\n${xBody}\n\n${xUrl}\n\n#Web3 #Crypto`;

  // LinkedIn allows slightly more detail (within 380 chars)
  const linkedInHeadline = truncateWords(cleanTitle, 80);
  const linkedInBody = truncateWords(cleanDesc, 200);
  const linkedInUrl = `${SITE_URL}/${article.slug}?utm_source=linkedin&utm_medium=social&utm_campaign=news`;
  const linkedInFullText = `${linkedInHeadline}\n\n${linkedInBody}\n\nRead more: ${linkedInUrl}\n\n#Web3 #Blockchain #Crypto`;

  return {
    xHeadline,
    xBody,
    xFullText,
    linkedInHeadline,
    linkedInBody,
    linkedInFullText,
  };
}

/**
 * Generate short, concise, simple captions using Gemini with fallback.
 */
export async function generateNewsCaptions(
  article: NewsArticle,
  apiKey?: string,
  fetchFn: typeof fetch = fetch,
): Promise<Captions> {
  const fallback = fallbackCaptions(article);
  if (!apiKey) return fallback;

  const prompt = `Rewrite this Web3 news headline and summary into short, concise social copy in simple everyday words.
Ensure it is easy to understand for anyone.
DO NOT use buzzwords, corporate jargon, or hype (avoid: "revolutionary", "game-changer", "pivotal", "landscape", "underscores").

Article Title: ${article.title}
Article Summary: ${article.description}

Output ONLY JSON matching:
{
  "xHeadline": "short 1-line headline (max 70 chars, plain simple English)",
  "xBody": "1 short sentence explaining what happened in simple words (max 110 chars)",
  "linkedInHeadline": "clear 1-line headline (max 85 chars)",
  "linkedInBody": "2 short simple sentences in plain English explaining the key point (max 220 chars total)"
}`;

  for (const model of GEMINI_MODELS) {
    try {
      const res = await fetchFn(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 1024,
              responseMimeType: 'application/json',
            },
          }),
          signal: AbortSignal.timeout(15000),
        },
      );
      if (!res.ok) continue;
      const data = await res.json();
      const { value } = parseGeminiJsonResponse(data, 'object');
      if (value && typeof value === 'object') {
        const xHeadline = sanitizePlainEnglish((value as Record<string, string>).xHeadline) || fallback.xHeadline;
        const xBody = sanitizePlainEnglish((value as Record<string, string>).xBody) || fallback.xBody;
        const linkedInHeadline = sanitizePlainEnglish((value as Record<string, string>).linkedInHeadline) || fallback.linkedInHeadline;
        const linkedInBody = sanitizePlainEnglish((value as Record<string, string>).linkedInBody) || fallback.linkedInBody;

        const xUrl = `${SITE_URL}/${article.slug}?utm_source=twitter&utm_medium=social&utm_campaign=news`;
        const linkedInUrl = `${SITE_URL}/${article.slug}?utm_source=linkedin&utm_medium=social&utm_campaign=news`;

        return {
          xHeadline,
          xBody,
          xFullText: `${xHeadline}\n\n${xBody}\n\n${xUrl}\n\n#Web3 #Crypto`,
          linkedInHeadline,
          linkedInBody,
          linkedInFullText: `${linkedInHeadline}\n\n${linkedInBody}\n\nRead more: ${linkedInUrl}\n\n#Web3 #Blockchain #Crypto`,
        };
      }
    } catch {
      // Continue to next model on error
    }
  }

  return fallback;
}

/**
 * Pick the newest unposted news article.
 */
export function pickNextNewsArticle(
  articles: NewsArticle[],
  history: NewsSocialReceipt[],
  platform: 'x' | 'linkedin' | 'all' = 'all',
  forceSlug?: string,
): NewsArticle | null {
  if (forceSlug) {
    return articles.find((a) => a.slug === forceSlug) || null;
  }

  const postedX = new Set(history.filter((h) => h.platform === 'x').map((h) => h.slug));
  const postedLinkedIn = new Set(history.filter((h) => h.platform === 'linkedin').map((h) => h.slug));

  for (const article of articles) {
    if (platform === 'x' && !postedX.has(article.slug)) return article;
    if (platform === 'linkedin' && !postedLinkedIn.has(article.slug)) return article;
    if (platform === 'all' && (!postedX.has(article.slug) || !postedLinkedIn.has(article.slug))) {
      return article;
    }
  }

  return null;
}

/**
 * Queue a post into Buffer using mode: 'addToQueue'.
 */
export async function queuePostToBuffer(params: {
  token: string;
  channelId: string;
  text: string;
  linkAttachment?: { url: string; title?: string; description?: string };
  fetchFn?: typeof fetch;
}): Promise<string> {
  const input: Record<string, unknown> = {
    channelId: params.channelId,
    text: params.text,
    schedulingType: 'automatic',
    mode: 'addToQueue',
  };

  if (params.linkAttachment) {
    input.metadata = {
      linkedin: {
        linkAttachment: {
          url: params.linkAttachment.url,
          ...(params.linkAttachment.title ? { title: params.linkAttachment.title } : {}),
          ...(params.linkAttachment.description ? { description: params.linkAttachment.description } : {}),
        },
      },
    };
  }

  const query = `
    mutation CreatePost($input: CreatePostInput!) {
      createPost(input: $input) {
        ... on PostActionSuccess {
          post {
            id
            status
          }
        }
        ... on MutationError {
          message
        }
      }
    }
  `;

  const fetcher = params.fetchFn || fetch;
  const res = await fetcher('https://api.buffer.com/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${params.token}`,
    },
    body: JSON.stringify({ query, variables: { input } }),
    signal: AbortSignal.timeout(30000),
  });

  if (!res.ok) throw new Error(`Buffer API request failed: HTTP ${res.status}`);
  const data = (await res.json()) as {
    data?: { createPost?: { post?: { id: string; status?: string }; message?: string } };
    errors?: { message: string }[];
  };

  if (data.errors?.length) {
    throw new Error(`Buffer GraphQL error: ${data.errors.map((e) => e.message).join('; ')}`);
  }

  const post = data.data?.createPost?.post;
  if (!post?.id) {
    throw new Error(`Buffer post creation failed: ${data.data?.createPost?.message || 'missing post ID'}`);
  }

  return post.id;
}

/**
 * Load state file
 */
export function loadNewsState(stateFile: string): NewsSocialState {
  if (!fs.existsSync(stateFile)) return { history: [] };
  try {
    return JSON.parse(fs.readFileSync(stateFile, 'utf8'));
  } catch {
    return { history: [] };
  }
}

/**
 * Save state file
 */
export function saveNewsState(stateFile: string, state: NewsSocialState): void {
  fs.writeFileSync(stateFile, JSON.stringify(state, null, 2) + '\n', 'utf8');
}

// ── CLI Execution ──

async function run() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const forceSlug = args.find((_, i, a) => a[i - 1] === '--slug');
  const targetPlatform = (args.find((_, i, a) => a[i - 1] === '--platform') || 'all') as 'x' | 'linkedin' | 'all';

  const bufferToken = process.env.BUFFER_ACCESS_TOKEN;
  const xChannelId = process.env.BUFFER_X_CHANNEL_ID || DEFAULT_BUFFER_X_CHANNEL;
  const linkedInChannelId = process.env.BUFFER_LINKEDIN_CHANNEL_ID || DEFAULT_BUFFER_LINKEDIN_CHANNEL;
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const slot = process.env.SOCIAL_PUBLISH_SLOT || 'manual';
  const date = process.env.SOCIAL_PUBLISH_DATE || new Date().toISOString().slice(0, 10);

  const stateFile = path.join(__dirname, 'news-social-posted.json');
  const state = loadNewsState(stateFile);
  const articles = loadPublishedNewsArticles();

  if (!articles.length) {
    console.log('No published news articles found in content/articles-index.json.');
    return;
  }

  const article = pickNextNewsArticle(articles, state.history, targetPlatform, forceSlug);
  if (!article) {
    console.log('All recent news articles have already been queued to X and LinkedIn.');
    return;
  }

  console.log(`Selected article for social queue: "${article.title}" (${article.slug})`);

  const captions = await generateNewsCaptions(article, geminiApiKey);

  console.log('\n--- X Caption ---');
  console.log(captions.xFullText);
  console.log(`Length: ${captions.xFullText.length} chars`);

  console.log('\n--- LinkedIn Caption ---');
  console.log(captions.linkedInFullText);
  console.log(`Length: ${captions.linkedInFullText.length} chars`);

  if (isDryRun) {
    console.log('\n[DRY RUN] Skipping Buffer GraphQL requests. State remains unchanged.');
    return;
  }

  if (!bufferToken) {
    console.error('BUFFER_ACCESS_TOKEN is missing. Cannot queue post.');
    process.exit(1);
  }

  const now = new Date().toISOString();

  // Queue to X
  if (targetPlatform === 'x' || targetPlatform === 'all') {
    const alreadyQueued = state.history.some((h) => h.slug === article.slug && h.platform === 'x');
    if (!alreadyQueued || forceSlug) {
      try {
        console.log(`\nQueuing to Buffer X channel (${xChannelId})...`);
        const postId = await queuePostToBuffer({
          token: bufferToken,
          channelId: xChannelId,
          text: captions.xFullText,
        });
        console.log(`✓ Queued to X: Buffer Post ID ${postId}`);
        state.history.push({
          slug: article.slug,
          platform: 'x',
          channelId: xChannelId,
          postId,
          status: 'queued',
          slot,
          date,
          queuedAt: now,
        });
      } catch (err) {
        console.error(`✗ Failed to queue to X: ${(err as Error).message}`);
      }
    } else {
      console.log('Article already queued to X.');
    }
  }

  // Queue to LinkedIn
  if (targetPlatform === 'linkedin' || targetPlatform === 'all') {
    const alreadyQueued = state.history.some((h) => h.slug === article.slug && h.platform === 'linkedin');
    if (!alreadyQueued || forceSlug) {
      try {
        console.log(`\nQueuing to Buffer LinkedIn channel (${linkedInChannelId})...`);
        const articleUrl = `${SITE_URL}/${article.slug}?utm_source=linkedin&utm_medium=social&utm_campaign=news`;
        const postId = await queuePostToBuffer({
          token: bufferToken,
          channelId: linkedInChannelId,
          text: captions.linkedInFullText,
          linkAttachment: {
            url: articleUrl,
            title: article.title,
            description: article.description,
          },
        });
        console.log(`✓ Queued to LinkedIn: Buffer Post ID ${postId}`);
        state.history.push({
          slug: article.slug,
          platform: 'linkedin',
          channelId: linkedInChannelId,
          postId,
          status: 'queued',
          slot,
          date,
          queuedAt: now,
        });
      } catch (err) {
        console.error(`✗ Failed to queue to LinkedIn: ${(err as Error).message}`);
      }
    } else {
      console.log('Article already queued to LinkedIn.');
    }
  }

  saveNewsState(stateFile, state);
  console.log(`\nUpdated state saved to ${stateFile}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  run().catch((err) => {
    console.error('Fatal error in news social poster:', err);
    process.exit(1);
  });
}
