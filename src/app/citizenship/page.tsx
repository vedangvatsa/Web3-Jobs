import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CitizenshipDirectory } from '@/components/citizenship-directory';
import { NomadShell } from '@/components/nomads/shell';
import { ResourceLink } from '@/components/nomads/ui';
import { citizenshipPrograms } from '@/lib/citizenship';
import { STATIC_OG } from '@/lib/job-og';

const title = 'Citizenship by investment';
const description = 'Compare citizenship-by-investment routes, investment thresholds, additional fees and official sources.';
export const metadata: Metadata = { title, description, alternates: { canonical: 'https://hashtagweb3.com/citizenship' }, openGraph: { title, description, url: 'https://hashtagweb3.com/citizenship', type: 'website', images: [STATIC_OG.tools] }, twitter: { card: 'summary_large_image', title, description, images: [STATIC_OG.tools] } };

export default function CitizenshipPage() {
  return <NomadShell title={title}>
    <Suspense fallback={<p role="status" className="py-12 text-center">Loading citizenship comparison...</p>}><CitizenshipDirectory programs={citizenshipPrograms} /></Suspense>
    <nav aria-label="Related mobility resources" className="mt-8 flex flex-wrap gap-x-6 border-t pt-4">
      <ResourceLink href="/nomads">Nomad cities</ResourceLink>
      <ResourceLink href="/visas">Visas</ResourceLink>
      <ResourceLink href="/visas?tab=checker">Passport entry</ResourceLink>
    </nav>
  </NomadShell>;
}
