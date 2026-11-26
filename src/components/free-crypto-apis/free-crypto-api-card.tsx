'use client';

import { ListingCard, ListingCardHeader, ListingCardTitle } from '@/components/listing-card';
import type { FreeCryptoApiListing } from '@/types';
import { freeCryptoApiDetailUrl } from '@/lib/free-crypto-apis';
import { useState } from 'react';

const FREE_PATH_LABEL: Record<string, string> = {
  ongoing: 'Ongoing free tier',
  keyless: 'Keyless',
  trial: 'Trial only',
  paid: 'Paid only',
  unknown: 'Access unclear',
};

function domainFromUrl(url?: string): string {
  if (!url) return '';
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

function subtitleFor(listing: FreeCryptoApiListing): string {
  const pathLabel = FREE_PATH_LABEL[listing.freePath] || listing.freePath;
  const badges: string[] = [listing.categoryLabel, pathLabel];
  if (listing.mcp?.status === 'yes') badges.push('MCP');
  if (listing.x402?.status === 'yes') badges.push('x402');
  return badges.join(' · ');
}

export function FreeCryptoApiCard({ listing }: { listing: FreeCryptoApiListing }) {
  const domain = domainFromUrl(listing.websiteUrl);
  const [srcAttempt, setSrcAttempt] = useState(0);
  const initial = (listing.name || 'A').trim().charAt(0).toUpperCase();
  const subtitle = subtitleFor(listing);

  const faviconUrls = domain
    ? [
        `https://icons.duckduckgo.com/ip3/${domain}.ico`,
        `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
      ]
    : [];
  const currentFavicon = srcAttempt < faviconUrls.length ? faviconUrls[srcAttempt] : null;

  return (
    <a
      href={freeCryptoApiDetailUrl(listing)}
      target="_blank"
      rel="noopener noreferrer"
      className="block h-full min-w-0"
    >
      <ListingCard>
        <ListingCardHeader className="min-w-0">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden bg-transparent">
              {currentFavicon ? (
                <img
                  key={currentFavicon}
                  src={currentFavicon}
                  alt=""
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-sm object-contain"
                  loading="lazy"
                  onError={() => setSrcAttempt((prev) => prev + 1)}
                  onLoad={(e) => {
                    const img = e.currentTarget;
                    if (img.naturalWidth > 0 && img.naturalWidth <= 16 && img.naturalHeight <= 16) {
                      setSrcAttempt((prev) => prev + 1);
                    }
                  }}
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-muted/40 text-xs font-bold text-foreground/70 select-none">
                  <span>{initial}</span>
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <ListingCardTitle title={listing.name}>{listing.name}</ListingCardTitle>
              <p className="mt-0.5 truncate text-xs text-muted-foreground" title={subtitle}>
                {subtitle}
              </p>
            </div>
          </div>
        </ListingCardHeader>
      </ListingCard>
    </a>
  );
}