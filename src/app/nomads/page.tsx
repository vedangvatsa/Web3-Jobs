import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { NomadShell } from '@/components/nomads/shell';
import { CityExplorer } from '@/components/nomads/city-explorer';
import { getNomadSummaries } from '@/lib/nomads/server';
import { NOMAD_TOOLS } from '@/lib/nomads/routes';
import { nomadMetadata } from '@/lib/nomads/metadata';

export const dynamic = 'force-static';
export const revalidate = 86400;
export const metadata = nomadMetadata('/nomads');

export default function NomadsPage() {
  return <NomadShell title="Find your next base">
    <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-muted" aria-label="Loading city finder" />}><CityExplorer cities={getNomadSummaries()} /></Suspense>
    <section id="all-tools" className="mt-8 scroll-mt-32 border-t pt-6"><h2 className="mb-5 text-xl font-semibold tracking-tight">More planning tools</h2><div className="grid gap-6 lg:grid-cols-3">{['Explore', 'Plan your stay', 'Money & resources'].map(group => <div key={group}><h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{group}</h3><div className="space-y-2">{NOMAD_TOOLS.filter(tool => tool.group === group && tool.key !== 'cities').map(tool => <Link key={tool.key} href={tool.href} prefetch={false} className="group flex items-start justify-between gap-3 rounded-lg border border-border/70 bg-card p-4 transition-colors hover:border-foreground/25"><div><h4 className="text-sm font-semibold">{tool.title}</h4><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{tool.description}</p></div><ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden /></Link>)}</div></div>)}</div></section>
    <section className="mt-8 border-t pt-6" aria-label="More remote-work resources">
      <h2 className="text-base font-semibold">Prepare for remote work</h2>
      <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        {[['/salary-calculator', 'Salary calculator'], ['/freelance-rates-by-industry', 'Freelance rate benchmarks'], ['/remote-work-checklist', 'Remote-work checklist']].map(([href, label]) => <Link key={href} href={href} prefetch={false} className="inline-flex min-h-11 items-center gap-2 text-primary hover:underline">{label}<ArrowUpRight className="h-4 w-4" aria-hidden /></Link>)}
      </div>
    </section>
  </NomadShell>;
}
