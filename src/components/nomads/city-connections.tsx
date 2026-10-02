'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

export type CityConnectionTab = { id: string; label: string; total: number; location: string; href: string; content: ReactNode };

export function CityConnections({ tabs }: { tabs: CityConnectionTab[] }) {
  const available = tabs.filter(tab => tab.total > 0);
  if (!available.length) return <div className="flex flex-wrap gap-x-5 gap-y-2">{tabs.map(tab => <Link key={tab.id} href={tab.href} prefetch={false} className="inline-flex min-h-11 items-center text-sm font-medium hover:underline">Browse {tab.label.toLowerCase()} ↗</Link>)}</div>;
  return <Tabs defaultValue={available[0].id}>
    <TabsList className={cn('grid h-auto w-full gap-1 sm:flex sm:w-fit', available.length === 1 ? 'grid-cols-1' : available.length === 3 ? 'grid-cols-3' : 'grid-cols-2')}>{available.map(tab => <TabsTrigger key={tab.id} value={tab.id} className="min-h-11 min-w-0 gap-1 px-2 text-xs sm:gap-2 sm:px-3 sm:text-sm">{tab.label}<span className="rounded bg-background/70 px-1 py-0.5 text-[10px] tabular-nums">{tab.total}</span></TabsTrigger>)}</TabsList>
    {available.map(tab => <TabsContent key={tab.id} value={tab.id} className="mt-4"><div className="mb-3 flex flex-wrap items-center justify-between gap-3"><h3 className="text-sm font-medium">{tab.label}{tab.id === 'companies' ? ' hiring' : ''} in {tab.location}</h3><Link href={tab.href} prefetch={false} className="inline-flex min-h-11 items-center text-xs font-medium hover:underline">Browse {tab.label.toLowerCase()} ↗</Link></div><div className={cn('grid gap-3', tab.total === 2 ? 'md:grid-cols-2' : tab.total > 2 && 'md:grid-cols-2 xl:grid-cols-3')}>{tab.content}</div></TabsContent>)}
  </Tabs>;
}
