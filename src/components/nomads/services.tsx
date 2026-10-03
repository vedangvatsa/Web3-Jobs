'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Search } from 'lucide-react';
import type { ServiceCategory } from '@/lib/nomads/types';
import { Field, FilterSelect, inputStyle, EmptyResults, SourceNote } from './ui';

export function NomadServices({ categories }: { categories: ServiceCategory[] }) {
  const [q, setQuery] = useState(''), [selected, setSelected] = useState('');
  const groups = categories.filter(category => !selected || category.id === selected).map(category => ({ ...category, resources: category.resources.filter(resource => !q || `${resource.name} ${resource.description} ${category.title}`.toLowerCase().includes(q.trim().toLowerCase())) })).filter(category => category.resources.length);
  return <div><div className="mb-6 grid items-end gap-3 sm:grid-cols-2"><Field label="Find a service"><input type="search" value={q} onChange={event => setQuery(event.target.value)} className={inputStyle} placeholder="Insurance, eSIM, banking…" /></Field><Field label="Category"><FilterSelect value={selected} onValueChange={setSelected}><option value="">All categories</option>{categories.map(category => <option key={category.id} value={category.id}>{category.title}</option>)}</FilterSelect></Field></div>
    {groups.length ? <div className="space-y-9">{groups.map(category => <section key={category.id} id={category.id} className="scroll-mt-32"><h2 className="mb-4 text-xl font-semibold tracking-tight">{category.title}</h2><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{category.resources.map(resource => {
      const content = <><div className="flex items-start justify-between gap-3"><h3 className="text-sm font-semibold group-hover:text-primary">{resource.name}</h3><ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden /></div><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{resource.description}</p></>;
      const style = 'group rounded-lg border border-border/70 bg-card p-5 text-card-foreground transition-colors hover:border-foreground/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';
      return resource.url.startsWith('/') ? <Link key={resource.url} href={resource.url} prefetch={false} className={style}>{content}</Link> : <a key={resource.url} href={resource.url} target="_blank" rel="noopener noreferrer" className={style}>{content}</a>;
    })}</div></section>)}</div> : <EmptyResults onReset={() => { setQuery(''); setSelected(''); }}><Search className="mx-auto mb-3 h-5 w-5 text-muted-foreground" />No services match your search.</EmptyResults>}
    <SourceNote>Descriptions and any prices are from the source resource collection dated June 2026. Visit each provider for current plans, eligibility and terms.</SourceNote>
  </div>;
}
