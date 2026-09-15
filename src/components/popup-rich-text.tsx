import { OutboundLink } from '@/components/tracking/outbound-link';

const LINK_PATTERN =
  /\b(?:Network School(?:’s|\'s)?|ns\.com|xyz\.city)\b/gi;

/** Turn known source names/domains in popup copy into outbound links. */
export function PopupRichText({
  text,
  nsDashboardUrl,
}: {
  text: string;
  nsDashboardUrl?: string | null;
}) {
  const parts: Array<string | { href: string; label: string }> = [];
  let last = 0;
  let match: RegExpExecArray | null;
  const re = new RegExp(LINK_PATTERN.source, 'gi');

  while ((match = re.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(text.slice(last, match.index));
    }
    const raw = match[0];
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
    last = match.index + raw.length;
  }

  if (last < text.length) parts.push(text.slice(last));
  if (!parts.length) return <>{text}</>;

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
        )
      )}
    </>
  );
}
