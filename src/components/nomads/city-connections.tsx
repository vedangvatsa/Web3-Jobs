import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { ResourceLink } from './ui';

export type CityConnectionSection = { id: string; label: string; total: number; location: string; href: string; content: ReactNode };

export function CityConnections({ sections }: { sections: CityConnectionSection[] }) {
  const available = sections.filter(section => section.total > 0);
  if (!available.length) return <div className="flex flex-wrap gap-x-5 gap-y-2">{sections.map(section => <ResourceLink key={section.id} href={section.href}>Browse {section.label.toLowerCase()}</ResourceLink>)}</div>;
  return <div className="space-y-8">
    {available.map(section => <section key={section.id} data-city-connection={section.id} aria-labelledby={`city-${section.id}-heading`}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 id={`city-${section.id}-heading`} className="flex flex-wrap items-center gap-2 text-base font-semibold">{section.label}{section.id === 'companies' ? ' hiring' : ''} in {section.location}<Badge variant="secondary" className="font-normal tabular-nums">{section.total}</Badge></h3>
        <ResourceLink href={section.href}>Browse {section.label.toLowerCase()}</ResourceLink>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{section.content}</div>
    </section>)}
  </div>;
}
