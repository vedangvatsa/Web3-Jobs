'use client';

import { ListingCard, ListingCardHeader, ListingCardTitle } from '@/components/listing-card';
import type { GrantProgram } from '@/types';
import Link from 'next/link';
import { useState } from 'react';

const GENERIC_HOSTS = new Set([
  'forms.gle',
  'docs.google.com',
  'typeform.com',
  'notion.site',
  'notion.so',
  'medium.com',
  'warpcast.com',
  'mirror.xyz',
  't.me',
  'twitter.com',
  'x.com',
  'github.com',
  'substack.com',
]);

const KNOWN_ECOSYSTEM_DOMAINS: Record<string, string> = {
  ethereum: 'ethereum.org',
  solana: 'solana.com',
  base: 'base.org',
  arbitrum: 'arbitrum.io',
  optimism: 'optimism.io',
  polygon: 'polygon.technology',
  celo: 'celo.org',
  avalanche: 'avax.network',
  aptos: 'aptosfoundation.org',
  sui: 'sui.io',
  near: 'near.org',
  polkadot: 'polkadot.network',
  cosmos: 'cosmos.network',
  filecoin: 'filecoin.io',
  ton: 'ton.org',
  starknet: 'starknet.io',
  zksync: 'zksync.io',
  monad: 'monad.xyz',
  berachain: 'berachain.com',
  sei: 'sei.io',
  injective: 'injective.com',
  ronin: 'roninchain.com',
  arweave: 'arweave.org',
  biconomy: 'biconomy.io',
  akash: 'akash.network',
  balancer: 'balancer.fi',
};

function getGrantDomain(grant: GrantProgram): string {
  if (grant.domain) {
    return grant.domain;
  }

  try {
    const parsed = new URL(grant.url);
    const host = parsed.hostname.replace(/^www\./, '').toLowerCase();

    // If the URL host is a generic hosting platform (Google Form, Notion, Medium, etc.),
    // fallback to the ecosystem or provider brand domain
    const isGeneric = Array.from(GENERIC_HOSTS).some((gh) => host === gh || host.endsWith(`.${gh}`));
    if (isGeneric) {
      const eco = (grant.ecosystem || '').toLowerCase();
      if (KNOWN_ECOSYSTEM_DOMAINS[eco]) {
        return KNOWN_ECOSYSTEM_DOMAINS[eco];
      }
      const providerLower = grant.provider.toLowerCase().replace(/[^a-z0-9]/g, '');
      for (const [key, dom] of Object.entries(KNOWN_ECOSYSTEM_DOMAINS)) {
        if (providerLower.includes(key)) {
          return dom;
        }
      }
    }

    return host;
  } catch {
    return '';
  }
}

function getGrantSubtitle(grant: GrantProgram): string {
  const name = grant.name.trim();
  const provider = (grant.provider || '').trim();
  const amount = (grant.amount || '').trim();
  const ecosystem = (grant.ecosystem || '').trim();
  const category = (grant.category || '').trim();

  // Strip generic suffixes to check if provider repeats the grant title
  const normalize = (s: string) =>
    s
      .replace(/\s+(for Startups|Grants? Program|Grants?|Foundation|Ecosystem Fund)$/i, '')
      .trim()
      .toLowerCase();

  const isRedundant =
    !provider ||
    normalize(provider) === normalize(name) ||
    name.toLowerCase().includes(provider.toLowerCase()) ||
    provider.toLowerCase().includes(name.toLowerCase());

  const hasSpecificAmount =
    Boolean(amount) && !/^(milestone-based|project-based|flexible)$/i.test(amount);

  if (isRedundant) {
    if (hasSpecificAmount) {
      return amount;
    }
    if (ecosystem && ecosystem !== 'Other' && ecosystem !== 'Global') {
      return `${ecosystem} · ${category}`;
    }
    if (amount) {
      return amount;
    }
    return category;
  }

  // Provider is distinct from title
  if (hasSpecificAmount) {
    return `${provider} · ${amount}`;
  }
  return provider;
}

export function GrantCard({ grant }: { grant: GrantProgram }) {
  const domain = getGrantDomain(grant);
  const faviconUrl = domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128` : null;
  const [imgError, setImgError] = useState(false);

  const initial = (grant.provider || grant.name || 'G').trim().charAt(0).toUpperCase();
  const subtitle = getGrantSubtitle(grant);

  return (
    <Link
      href={`/${grant.id}`}
      prefetch={false}
      className="block h-full min-w-0"
    >
      <ListingCard>
        <ListingCardHeader className="min-w-0">
          <div className="flex min-w-0 items-center gap-3">
            <div className="h-10 w-10 shrink-0 flex items-center justify-center bg-transparent overflow-hidden">
              {faviconUrl && !imgError ? (
                <img
                  src={faviconUrl}
                  alt={`${grant.provider} favicon`}
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-sm object-contain"
                  loading="lazy"
                  onError={() => setImgError(true)}
                  onLoad={(e) => {
                    const img = e.currentTarget;
                    // Google returns a 16x16 generic globe when favicon is missing.
                    // When detected, fall back to initial letter badge instead of blurry globe.
                    if (img.naturalWidth > 0 && img.naturalWidth <= 16 && img.naturalHeight <= 16) {
                      setImgError(true);
                    }
                  }}
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-muted/40 font-bold text-foreground/70 select-none text-xs">
                  <span>{initial}</span>
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <ListingCardTitle title={grant.name}>
                {grant.name}
              </ListingCardTitle>
              <p className="text-xs text-muted-foreground truncate mt-0.5" title={subtitle}>
                {subtitle}
              </p>
            </div>
          </div>
        </ListingCardHeader>
      </ListingCard>
    </Link>
  );
}
