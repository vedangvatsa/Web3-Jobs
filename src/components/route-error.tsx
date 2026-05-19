'use client';

import * as React from 'react';
import Link from 'next/link';
import { AlertCircle, Home, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function RouteError({
 error,
 reset,
 sectionName = 'page',
}: {
 error: Error & { digest?: string };
 reset: () => void;
 sectionName?: string;
}) {
 React.useEffect(() => {
  console.error(`Runtime Error caught by ${sectionName} boundary:`, error);
 }, [error, sectionName]);

 return (
  <div className="flex flex-col items-center justify-center min-h-[50vh] py-16 px-4">
   <div className="max-w-md w-full text-center space-y-6 p-8 rounded-2xl border bg-card/40 backdrop-blur-sm shadow-sm">
    <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center text-destructive">
     <AlertCircle className="h-6 w-6" />
    </div>
    <div className="space-y-2">
     <h2 className="text-xl font-bold tracking-tight">Failed to load {sectionName}</h2>
     <p className="text-sm text-muted-foreground">
      We encountered a rendering or connection failure while preparing this content. Please try reloading.
     </p>
    </div>
    <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
     <Button onClick={() => reset()} variant="default" className="flex items-center gap-2">
      <RefreshCw className="h-4 w-4" />
      <span>Try Again</span>
     </Button>
     <Link href="/" passHref legacyBehavior>
      <Button variant="outline" className="flex items-center gap-2">
       <Home className="h-4 w-4" />
       <span>Return Home</span>
      </Button>
     </Link>
    </div>
   </div>
  </div>
 );
}
