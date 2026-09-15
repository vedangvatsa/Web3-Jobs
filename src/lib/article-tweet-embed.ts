type FxTweetAuthor = {
  name?: string;
  screen_name?: string;
  avatar_url?: string;
};

type FxTweet = {
  url?: string;
  text?: string;
  created_at?: string;
  author?: FxTweetAuthor;
};

const tweetCache = new Map<string, ArticleTweetEmbed | null>();

export type ArticleTweetEmbed = {
  id: string;
  url: string;
  text: string;
  authorName: string;
  username: string;
  avatarUrl: string;
  createdAt?: string;
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function fetchArticleTweetEmbed(tweetId: string): Promise<ArticleTweetEmbed | null> {
  if (tweetCache.has(tweetId)) return tweetCache.get(tweetId) ?? null;

  try {
    const res = await fetch(`https://api.fxtwitter.com/status/${tweetId}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      tweetCache.set(tweetId, null);
      return null;
    }
    const data = (await res.json()) as { tweet?: FxTweet };
    const tweet = data.tweet;
    const author = tweet?.author;
    const username = author?.screen_name?.trim();
    const avatarUrl = author?.avatar_url?.trim();
    const text = tweet?.text?.trim();
    if (!username || !avatarUrl || !text) {
      tweetCache.set(tweetId, null);
      return null;
    }

    const embed: ArticleTweetEmbed = {
      id: tweetId,
      url: tweet?.url ?? `https://x.com/${username}/status/${tweetId}`,
      text,
      authorName: author?.name?.trim() || username,
      username,
      avatarUrl,
      createdAt: tweet?.created_at,
    };
    tweetCache.set(tweetId, embed);
    return embed;
  } catch {
    tweetCache.set(tweetId, null);
    return null;
  }
}

export const ARTICLE_TWEET_MOUNT_CLASS = 'article-tweet-mount';

export function renderArticleTweetMountHtml(tweetId: string): string {
  return `<div class="${ARTICLE_TWEET_MOUNT_CLASS}" data-tweet-id="${escapeHtml(tweetId)}"></div>`;
}

const TWEET_BLOCKQUOTE =
  /<blockquote class="twitter-tweet"[^>]*>[\s\S]*?<\/blockquote>/gi;

const TWEET_ID_ATTR = /data-tweet-id="(\d+)"/i;
const STATUS_HREF = /href="https:\/\/x\.com\/[^"]+\/status\/(\d+)"/i;

function extractTweetId(blockquoteHtml: string): string | null {
  const fromAttr = blockquoteHtml.match(TWEET_ID_ATTR);
  if (fromAttr?.[1]) return fromAttr[1];
  const fromHref = blockquoteHtml.match(STATUS_HREF);
  return fromHref?.[1] ?? null;
}

export type ArticleTweetEmbedResult = {
  html: string;
  tweets: ArticleTweetEmbed[];
};

/** Replace X blockquote placeholders with mount nodes for React cards. */
export async function replaceArticleTweetEmbeds(html: string): Promise<ArticleTweetEmbedResult> {
  const matches = [...html.matchAll(TWEET_BLOCKQUOTE)];
  if (!matches.length) return { html, tweets: [] };

  let out = html;
  const tweets: ArticleTweetEmbed[] = [];
  const ids = new Set<string>();

  for (const match of matches) {
    const block = match[0];
    const id = extractTweetId(block);
    if (!id || ids.has(id)) {
      out = out.replace(block, '');
      continue;
    }
    ids.add(id);

    const embed = await fetchArticleTweetEmbed(id);
    const replacement = embed ? renderArticleTweetMountHtml(id) : block;
    if (embed) tweets.push(embed);
    out = out.replace(block, replacement);
  }

  return { html: out, tweets };
}
