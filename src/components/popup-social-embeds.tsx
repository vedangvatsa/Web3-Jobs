import { OutboundLink } from '@/components/tracking/outbound-link';
import type { PopupSocialEmbed } from '@/types/popup';

function viewHref(embed: PopupSocialEmbed): string {
  if (embed.viewUrl) return embed.viewUrl;
  const m = embed.embedUrl.match(/urn:li:activity:(\d+)/);
  if (m) return `https://www.linkedin.com/feed/update/urn:li:activity:${m[1]}`;
  return embed.embedUrl;
}

function platformLabel(platform: PopupSocialEmbed['platform']): string {
  return platform === 'linkedin' ? 'LinkedIn' : 'Instagram';
}

export function PopupSocialEmbeds({
  embeds,
  popupName,
}: {
  embeds: PopupSocialEmbed[];
  popupName: string;
}) {
  if (!embeds.length) return null;

  return (
    <section className="mt-10">
      <h2 className="mb-3 text-lg font-bold tracking-tight">From the community</h2>
      <p className="mb-4 text-xs text-muted-foreground">
        Posts featured on {popupName}&apos;s community page.
      </p>
      <ul className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {embeds.map((embed) => {
          const href = viewHref(embed);
          const title = embed.label ?? `${platformLabel(embed.platform)} post`;
          return (
            <li key={embed.embedUrl} className="overflow-hidden rounded-lg border border-border/70 bg-card">
              <iframe
                title={title}
                src={embed.embedUrl}
                className="h-[min(520px,70vh)] w-full border-0 bg-background"
                loading="lazy"
                sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
              />
              <div className="border-t border-border/70 px-4 py-2.5">
                <OutboundLink
                  href={href}
                  label={`${title} on ${platformLabel(embed.platform)}`}
                  className="text-xs font-medium text-foreground underline-offset-4 hover:underline"
                >
                  View on {platformLabel(embed.platform)}
                </OutboundLink>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
