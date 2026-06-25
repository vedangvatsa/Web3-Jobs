'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

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
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return

  // Dynamic import: loads posthog-js only when needed, after hydration
  import('posthog-js').then((mod) => {
   const posthog = mod.default
   if (!posthog.__loaded) {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
     api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
     person_profiles: 'identified_only',
     capture_pageview: false,
     capture_pageleave: true,
     autocapture: false,
     loaded: (ph) => {
      if (process.env.NODE_ENV === 'development') ph.debug()
     },
    })
   }
  })
 }, [])

 // Track page views on route changes
 useEffect(() => {
  if (!pathname) return

  import('posthog-js').then((mod) => {
   const posthog = mod.default
   if (posthog.__loaded) {
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
