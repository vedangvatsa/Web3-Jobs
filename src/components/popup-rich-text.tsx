import { OutboundLink } from '@/components/tracking/outbound-link';

const BRAND_LINK_PATTERN =
  /\b(?:Network School(?:’s|'s)?|ns\.com|xyz\.city)\b/gi;

/** Bare domains and https URLs in popup copy (not emails). */
const URL_PATTERN =
  /\b(?:https?:\/\/)?(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s,;)]*)?/gi;

type RichPart = string | { href: string; label: string };

function hrefForUrl(raw: string): string {
  const trimmed = raw.replace(/[.,;:)]+$/, '');
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function labelForUrl(raw: string): string {
  return raw.replace(/[.,;:)]+$/, '');
}

function pushBrandLink(parts: RichPart[], raw: string, nsDashboardUrl?: string | null) {
  const lower = raw.toLowerCase();
  let href = 'https://ns.com';
  if (lower.includes('xyz')) {
    href = 'https://xyz.city';
  } else if (lower.includes('network school') && nsDashboardUrl) {
    href = nsDashboardUrl;
  } else if (lower === 'ns.com') {
    href = 'https://ns.com';
  }
  parts.push({ href, label: raw });
}

function tokenizePopupRichText(text: string, nsDashboardUrl?: string | null): RichPart[] {
  const parts: RichPart[] = [];
  let cursor = 0;

  while (cursor < text.length) {
    BRAND_LINK_PATTERN.lastIndex = cursor;
    const brand = BRAND_LINK_PATTERN.exec(text);
    URL_PATTERN.lastIndex = cursor;
    const url = URL_PATTERN.exec(text);

    const brandAt = brand?.index ?? Number.POSITIVE_INFINITY;
    const urlAt = url?.index ?? Number.POSITIVE_INFINITY;

    if (brandAt === Number.POSITIVE_INFINITY && urlAt === Number.POSITIVE_INFINITY) {
      parts.push(text.slice(cursor));
      break;
    }

    if (brandAt <= urlAt && brand) {
      if (brand.index > cursor) parts.push(text.slice(cursor, brand.index));
      pushBrandLink(parts, brand[0], nsDashboardUrl);
      cursor = brand.index + brand[0].length;
      continue;
    }

    if (url) {
      const at = url.index;
      if (at > 0 && text[at - 1] === '@') {
        parts.push(text.slice(cursor, at + url[0].length));
        cursor = at + url[0].length;
        continue;
      }
      if (at > cursor) parts.push(text.slice(cursor, at));
      const raw = url[0];
      parts.push({ href: hrefForUrl(raw), label: labelForUrl(raw) });
      cursor = at + raw.length;
      continue;
    }
  }

  return parts.length ? parts : [text];
}

/** Turn known source names/domains in popup copy into outbound links. */
export function PopupRichText({
  text,
  nsDashboardUrl,
}: {
  text: string;
  nsDashboardUrl?: string | null;
}) {
  const parts = tokenizePopupRichText(text, nsDashboardUrl);
  if (parts.length === 1 && typeof parts[0] === 'string') {
    return <>{parts[0]}</>;
  }

  return (
    <>
      {parts.map((part, i) =>
        typeof part === 'string' ? (
          <span key={`t-${i}`}>{part}</span>
        ) : (
          <OutboundLink
            key={`l-${i}-${part.href}`}
            href={part.href}
            label={part.label}
            className="underline-offset-4 hover:text-foreground hover:underline"
          >
            {part.label}
          </OutboundLink>
        ),
      )}
    </>
  );
}
