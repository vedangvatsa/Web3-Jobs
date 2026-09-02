import * as React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function RouteLoader({ cardsCount = 6 }: { cardsCount?: number }) {
 return (
  <div className="container mx-auto py-8 px-4 max-w-6xl space-y-8 animate-pulse">
   {/* Hero Skeleton */}
   <div className="text-center space-y-4 max-w-xl mx-auto py-6">
    <Skeleton className="h-10 w-3/4 mx-auto rounded-md" />
    <Skeleton className="h-4 w-5/6 mx-auto rounded-md" />
   </div>

   {/* Grid Skeleton */}
   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(cardsCount)].map((_, i) => (
     <div key={i} className="p-6 rounded-2xl border bg-card/40 space-y-4">
      <div className="flex items-center gap-3">
       <Skeleton className="h-10 w-10 rounded-full" />
       <div className="space-y-2 flex-grow">
        <Skeleton className="h-4 w-1/2 rounded-md" />
        <Skeleton className="h-3 w-1/3 rounded-md" />
       </div>
      </div>
      <Skeleton className="h-16 w-full rounded-md" />
      <div className="flex justify-between items-center pt-2">
       <Skeleton className="h-5 w-16 rounded-full" />
       <Skeleton className="h-4 w-12 rounded-md" />
      </div>
     </div>
    ))}
   </div>
  </div>
 );
}
