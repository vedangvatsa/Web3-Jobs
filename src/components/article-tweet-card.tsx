import { XPostCard } from '@/components/x-post-card';
import type { ArticleTweetEmbed } from '@/lib/article-tweet-embed';

function tweetDateIso(createdAt?: string): string | undefined {
  if (!createdAt) return undefined;
  const d = new Date(createdAt);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString().slice(0, 10);
}

export function ArticleTweetCard({ embed }: { embed: ArticleTweetEmbed }) {
  return (
    <figure className="article-tweet-card not-prose my-8 mx-auto w-full max-w-xl">
      <XPostCard
        url={embed.url}
        author={embed.authorName}
        username={embed.username}
        avatar={embed.avatarUrl}
        text={embed.text}
        date={tweetDateIso(embed.createdAt)}
        linkLabel={`${embed.authorName} on X`}
        textLineClamp={null}
      />
    </figure>
  );
}
