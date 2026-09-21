'use client';

import { usePathname } from 'next/navigation';
import { PrimaryActionLink } from '@/components/primary-action-link';
import { getHeaderCta } from '@/lib/header-cta';
import { trackCTAClick } from '@/lib/posthog';

const POSTING_URL = 'https://t.me/web3jobs_rep';

const CTA_LABEL: Record<'job' | 'event' | 'popup' | 'partner', string> = {
  job: 'Post a Job',
  event: 'Post an Event',
  popup: 'Add a Society',
  partner: 'Partner',
};

const CTA_EVENT: Record<'job' | 'event' | 'popup' | 'partner', string> = {
  job: 'post_a_job',
  event: 'post_an_event',
  popup: 'add_a_society',
  partner: 'partner',
};

export function PostNavCta() {
  const cta = getHeaderCta(usePathname());
  if (!cta) return null;

  return (
    <PrimaryActionLink
      href={POSTING_URL}
      target="_blank"
      rel="noopener noreferrer"
      data-header-cta={cta}
      onClick={() => trackCTAClick(CTA_EVENT[cta], POSTING_URL)}
    >
      {CTA_LABEL[cta]}
    </PrimaryActionLink>
  );
}
