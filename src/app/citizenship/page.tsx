import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CitizenshipDirectory } from '@/components/citizenship-directory';
import { NomadShell } from '@/components/nomads/shell';
import { ResourceLink, SourceNote } from '@/components/nomads/ui';
import { citizenshipPrograms, citizenshipScope } from '@/lib/citizenship';
import { STATIC_OG } from '@/lib/job-og';

const title = 'Citizenship by investment';
const description = 'Compare selected citizenship-by-investment routes, contribution and property thresholds, additional fees and official sources.';
export const metadata: Metadata = { title, description, alternates: { canonical: 'https://hashtagweb3.com/citizenship' }, openGraph: { title, description, url: 'https://hashtagweb3.com/citizenship', type: 'website', images: [STATIC_OG.tools] }, twitter: { card: 'summary_large_image', title, description, images: [STATIC_OG.tools] } };

export default function CitizenshipPage() {
  return <NomadShell title={title} location="Compare investment routes and read the official requirements." actions={<><ResourceLink href="/nomads">Nomad cities</ResourceLink><ResourceLink href="/visas">Visas</ResourceLink><ResourceLink href="/visas?tab=checker">Passport entry</ResourceLink></>}>
    <Suspense fallback={<p role="status" className="py-12 text-center">Loading citizenship comparison...</p>}><CitizenshipDirectory programs={citizenshipPrograms} /></Suspense>
    <SourceNote><p>{citizenshipScope}</p><p className="mt-2">These investment routes lead to a citizenship application subject to approval. Residence permits and later naturalisation have different requirements. Discretionary citizenship for merit has no general investment price and is outside this directory. Only the listed routes have been reviewed; other options may exist.</p><ResourceLink href="/data/citizenship.json">Download source-backed data</ResourceLink></SourceNote>
  </NomadShell>;
}
