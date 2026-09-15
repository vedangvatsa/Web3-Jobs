import { XPostCard } from '@/components/x-post-card';
import type { PopupPost } from '@/types/popup';

export function PopupPosts({
  posts,
  popupName,
}: {
  posts: PopupPost[];
  popupName: string;
}) {
  if (!posts.length) return null;

  return (
    <section className="mt-10">
      <h2 className="mb-4 text-lg font-bold tracking-tight">Posts</h2>
      <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <li key={post.url}>
            <XPostCard
              url={post.url}
              author={post.author}
              username={post.username}
              avatar={post.avatar}
              text={post.text}
              date={post.date}
              linkLabel={`${post.author} post about ${popupName}`}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
