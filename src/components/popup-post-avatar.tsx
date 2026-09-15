'use client';

import { useState } from 'react';

export function PopupPostAvatar({
  author,
  username,
  avatar,
}: {
  author: string;
  username?: string | null;
  avatar?: string | null;
}) {
  const [failed, setFailed] = useState(false);
  const handle = username?.replace(/^@/, '').trim();
  const src =
    avatar ||
    (handle ? `https://unavatar.io/x/${encodeURIComponent(handle)}` : null);
  const initial = (author || handle || '?').trim().slice(0, 1).toUpperCase();

  if (!src || failed) {
    return (
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground"
        aria-hidden="true"
      >
        {initial}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      width={36}
      height={36}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      className="h-9 w-9 shrink-0 rounded-full object-cover bg-muted"
      onError={() => setFailed(true)}
    />
  );
}
