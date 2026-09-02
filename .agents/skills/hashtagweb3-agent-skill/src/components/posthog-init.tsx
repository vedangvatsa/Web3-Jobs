'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { getPostHogClient } from '@/lib/posthog'

/**
 * Lightweight PostHog initializer that does NOT use next/dynamic with ssr: false.
 * This avoids BAILOUT_TO_CLIENT_SIDE_RENDERING which was forcing the entire
 * page to render client-side, pushing LCP past 4s on mobile.
 *
 * PostHog SDK is dynamically imported at runtime (not at build time) so it
 * doesn't bloat the initial JS bundle.
 */
export function PostHogInit() {
 const pathname = usePathname()
 const searchParams = useSearchParams()

 // Initialize PostHog on first mount (client-side only)
 useEffect(() => {
  void getPostHogClient()
 }, [])

 // Track page views on route changes
 useEffect(() => {
  if (!pathname) return

  void getPostHogClient().then((posthog) => {
   if (posthog) {
    let url = window.origin + pathname
    if (searchParams?.toString()) {
     url = url + `?${searchParams.toString()}`
    }
    posthog.capture('$pageview', {
     '$current_url': url,
    })
   }
  })
 }, [pathname, searchParams])

 return null
}
