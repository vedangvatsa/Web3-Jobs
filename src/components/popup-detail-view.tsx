import Image from 'next/image';
import Link from 'next/link';
import {
  ExternalLink,
  MapPin,
  Calendar,
  Users,
  Twitter,
  Send,
  MessageCircle,
  Instagram,
  Youtube,
  Link2,
} from 'lucide-react';
import { OutboundLink } from '@/components/tracking/outbound-link';
import { PopupCoverImages } from '@/components/popup-cover-images';
import { PopupPosts } from '@/components/popup-posts';
import { PopupSocialEmbeds } from '@/components/popup-social-embeds';
import { PopupRichText } from '@/components/popup-rich-text';
import { composePopupNarrative, formatPopupField } from '@/lib/popup-narrative';
import { popupCoverImagePaths } from '@/lib/popup-gallery';
import { getNsDashboardUrl } from '@/lib/popup-ns';
import { getPopupPath } from '@/lib/popup-seo';
import {
  groupAmenityLines,
  groupPricingLines,
  parseHistoryLines,
  proseLines,
} from '@/lib/popup-detail-sections';
import type { Popup, PopupSocials } from '@/types/popup';
import type { BreadcrumbList, Organization, WithContext } from 'schema-dts';

function socialEntries(socials: PopupSocials) {
  const entries: Array<{
    key: keyof PopupSocials;
    label: string;
    href: string;
    icon: typeof Twitter;
  }> = [];

  if (socials.x) entries.push({ key: 'x', label: 'X', href: socials.x, icon: Twitter });
  if (socials.telegram) entries.push({ key: 'telegram', label: 'Telegram', href: socials.telegram, icon: Send });
  if (socials.discord) entries.push({ key: 'discord', label: 'Discord', href: socials.discord, icon: MessageCircle });
  if (socials.instagram) entries.push({ key: 'instagram', label: 'Instagram', href: socials.instagram, icon: Instagram });
  if (socials.youtube) entries.push({ key: 'youtube', label: 'YouTube', href: socials.youtube, icon: Youtube });
  if (socials.farcaster) entries.push({ key: 'farcaster', label: 'Farcaster', href: socials.farcaster, icon: Link2 });
  if (socials.linktree) entries.push({ key: 'linktree', label: 'Linktree', href: socials.linktree, icon: Link2 });

  return entries;
}

function websiteHost(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function ProseSection({
  title,
  lines,
  nsDashboardUrl,
}: {
  title: string;
  lines: string[];
  nsDashboardUrl?: string | null;
}) {
  const items = proseLines(lines);
  if (!items.length) return null;
  return (
    <section className="mt-10">
      <h2 className="mb-3 text-lg font-bold tracking-tight">{title}</h2>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={`${title}-${item}`} className="break-words text-sm leading-relaxed text-muted-foreground">
            <PopupRichText text={item} nsDashboardUrl={nsDashboardUrl} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function GroupedSection({
  title,
  groups,
  nsDashboardUrl,
}: {
  title: string;
  groups: ReturnType<typeof groupPricingLines>;
  nsDashboardUrl?: string | null;
}) {
  if (!groups.length) return null;
  return (
    <section className="mt-10">
      <h2 className="mb-3 text-lg font-bold tracking-tight">{title}</h2>
      <div className="space-y-5">
        {groups.map((group) => (
          <div key={`${title}-${group.title ?? group.items[0]}`}>
            {group.title ? (
              <h3 className="mb-2 text-sm font-medium text-foreground">
                <PopupRichText text={group.title} nsDashboardUrl={nsDashboardUrl} />
              </h3>
            ) : null}
            <ul className="space-y-1.5">
              {group.items.map((item) => (
                <li key={item} className="break-words text-sm leading-relaxed text-muted-foreground">
                  • <PopupRichText text={item} nsDashboardUrl={nsDashboardUrl} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function HistorySection({
  lines,
  nsDashboardUrl,
}: {
  lines: string[];
  nsDashboardUrl?: string | null;
}) {
  const entries = parseHistoryLines(lines);
  if (!entries.length) return null;
  return (
    <section className="mt-10">
      <h2 className="mb-3 text-lg font-bold tracking-tight">History</h2>
      <ol className="space-y-4 border-l border-border/70 pl-4">
        {entries.map((entry) => (
          <li key={`${entry.heading}-${entry.detail ?? ''}`} className="relative">
            <span
              className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full border border-border bg-background"
              aria-hidden="true"
            />
            <p className="text-sm font-medium text-foreground">
              <PopupRichText text={entry.heading} nsDashboardUrl={nsDashboardUrl} />
            </p>
            {entry.detail ? (
              <p className="mt-1 break-words text-sm leading-relaxed text-muted-foreground">
                <PopupRichText text={entry.detail} nsDashboardUrl={nsDashboardUrl} />
              </p>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}

export function PopupDetailView({ popup }: { popup: Popup }) {
  const socials = socialEntries(popup.socials);
  const posts = popup.posts ?? [];
  const covers = popupCoverImagePaths(popup);
  const pricing = popup.pricing ?? [];
  const amenities = popup.amenities ?? [];
  const history = popup.history ?? [];
  const durationNotes = popup.durationNotes ?? [];
  const locationDetails = popup.locationDetails ?? [];
  const pricingGroups = groupPricingLines(pricing);
  const amenityGroups = groupAmenityLines(amenities);
  const narrative = composePopupNarrative(popup);

  const sameAs = socialEntries(popup.socials).map((entry) => entry.href);

  const organizationSchema: WithContext<Organization> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: popup.name,
    description: popup.summary,
    ...(popup.website ? { url: popup.website } : {}),
    ...(popup.image ? { logo: `https://hashtagweb3.com${popup.image}` } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };

  const breadcrumbSchema: WithContext<BreadcrumbList> = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://hashtagweb3.com' },
      { '@type': 'ListItem', position: 2, name: 'Startup Societies', item: 'https://hashtagweb3.com/popups' },
      {
        '@type': 'ListItem',
        position: 3,
        name: popup.name,
        item: `https://hashtagweb3.com${getPopupPath(popup.slug)}`,
      },
    ],
  };

  const nsDashboardUrl = getNsDashboardUrl(popup.slug);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <article>
        <nav className="mb-8 flex flex-wrap gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <Link href="/popups" className="hover:text-foreground">
            Startup Societies
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-foreground">{popup.name}</span>
        </nav>

        <header className="border-b border-border/70 pb-8">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-5">
            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/60 bg-muted/40">
              {popup.image ? (
                <Image
                  src={popup.image}
                  alt=""
                  width={64}
                  height={64}
                  className="h-full w-full object-cover"
                  priority
                  unoptimized
                />
              ) : (
                <span className="text-xl font-semibold text-muted-foreground">
                  {popup.name.slice(0, 1)}
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="break-words text-2xl font-bold tracking-tight sm:text-4xl">
                {popup.name}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                {formatPopupField(popup.tagline)}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {formatPopupField(popup.location)}
                </span>
                {popup.foundedYear ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 shrink-0" aria-hidden="true" />
                    Founded {popup.foundedYear}
                  </span>
                ) : null}
                {popup.residents ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="h-4 w-4 shrink-0" aria-hidden="true" />
                    Residents {popup.residents}
                  </span>
                ) : null}
                {popup.website ? (
                  <OutboundLink
                    href={popup.website}
                    label={`${popup.name} website`}
                    className="inline-flex items-center gap-1.5 hover:text-foreground"
                  >
                    <ExternalLink className="h-4 w-4 shrink-0" aria-hidden="true" />
                    {websiteHost(popup.website)}
                  </OutboundLink>
                ) : null}
                {socials.length > 0 ? (
                  <span className="inline-flex flex-wrap items-center gap-1.5">
                    {socials.map(({ key, label, href, icon: Icon }) => (
                      <OutboundLink
                        key={key}
                        href={href}
                        label={`${popup.name} on ${label}`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border/70 text-muted-foreground transition-colors hover:border-foreground/25 hover:text-foreground"
                      >
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </OutboundLink>
                    ))}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </header>

        <PopupCoverImages images={covers} popupName={popup.name} />

        <section className="mt-8 space-y-4">
          {narrative.map((paragraph, index) => (
            <p
              key={`${popup.slug}-narrative-${index}`}
              className="break-words text-sm leading-relaxed text-muted-foreground sm:text-[15px]"
            >
              <PopupRichText text={formatPopupField(paragraph)} nsDashboardUrl={nsDashboardUrl} />
            </p>
          ))}
        </section>

        <ProseSection title="Location" lines={locationDetails} nsDashboardUrl={nsDashboardUrl} />
        <ProseSection title="Duration" lines={durationNotes} nsDashboardUrl={nsDashboardUrl} />
        <GroupedSection title="Pricing" groups={pricingGroups} nsDashboardUrl={nsDashboardUrl} />
        <GroupedSection title="Amenities" groups={amenityGroups} nsDashboardUrl={nsDashboardUrl} />
        <HistorySection lines={history} nsDashboardUrl={nsDashboardUrl} />

        <PopupPosts posts={posts} popupName={popup.name} />

        <PopupSocialEmbeds embeds={popup.socialEmbeds ?? []} popupName={popup.name} />

      </article>
    </>
  );
}
