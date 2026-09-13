'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { getPostHogClient } from '@/lib/posthog'

/**
 * Lightweight PostHog initializer. Avoids useSearchParams() so the root layout
 * does not trigger BAILOUT_TO_CLIENT_SIDE_RENDERING or cache-control: no-store
 * on static/ISR pages. Query strings are read from window.location at runtime.
 */
export function PostHogInit() {
  const pathname = usePathname()

  useEffect(() => {
   if (!pathname) return;

   const trackPageview = () => {
    void getPostHogClient().then((posthog) => {
      if (!posthog) return;
      const url = window.origin + pathname + window.location.search;
      posthog.capture('$pageview', { '$current_url': url });
    });
   };

   if (document.readyState === 'complete') {
    trackPageview();
    return;
   }

   window.addEventListener('load', trackPageview, { once: true });
   return () => window.removeEventListener('load', trackPageview);
  }, [pathname])

 return null
}
