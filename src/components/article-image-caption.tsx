import Link from 'next/link';

type ArticleImageCaptionProps = {
  caption?: string;
  creditUrl?: string;
  className?: string;
};

/** Hero and inline image credits: small, italic, centered below the image. */
export function ArticleImageCaption({ caption, creditUrl, className }: ArticleImageCaptionProps) {
  if (!caption && !creditUrl) return null;

  return (
    <p
      className={[
        'mb-8 text-center text-xs italic text-muted-foreground',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {caption}
      {caption && creditUrl ? ' ' : null}
      {creditUrl ? (
        <Link
          href={creditUrl}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="underline underline-offset-2"
        >
          Source
        </Link>
      ) : null}
    </p>
  );
}
