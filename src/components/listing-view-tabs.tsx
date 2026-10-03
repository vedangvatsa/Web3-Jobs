'use client';

import { TabsList, TabsTrigger } from '@/components/ui/tabs';

export function ListingViewTabs({ label, options }: { label: string; options: ReadonlyArray<{ value: string; label: string }> }) {
  return <TabsList aria-label={label} className="grid h-auto w-full auto-cols-fr grid-flow-col lg:h-11 lg:w-auto">
    {options.map(option => <TabsTrigger key={option.value} value={option.value} className="min-h-11 min-w-0 px-2 text-xs sm:px-3 sm:text-sm lg:h-9 lg:min-h-0">{option.label}</TabsTrigger>)}
  </TabsList>;
}
