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
  void getPostHogClient()
 }, [])

 useEffect(() => {
  if (!pathname) return

  void getPostHogClient().then((posthog) => {
   if (!posthog) return
   const search = typeof window !== 'undefined' ? window.location.search : ''
   const url = window.origin + pathname + search
   posthog.capture('$pageview', { '$current_url': url })
  })
 }, [pathname])

 return null
}
