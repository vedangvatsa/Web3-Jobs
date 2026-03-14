'use client';

import posthog from 'posthog-js'

// Direct tracking functions (for use in client components)
export const trackJobView = (
  jobId: string,
  jobTitle: string,
  companyName: string,
  source?: string,
  date?: string,
) => {
  if (typeof window !== 'undefined' && posthog) {
    posthog.capture('job_viewed', {
      job_id: jobId,
      job_title: jobTitle,
      company_name: companyName,
      job_source: source,
      days_since_posted: date ? Math.floor((Date.now() - new Date(date).getTime()) / 86400000) : undefined,
    })
  }
}

export const trackJobApplicationClick = (
  jobId: string,
  jobTitle: string,
  companyName: string,
  source?: string,
  date?: string,
) => {
  if (typeof window !== 'undefined' && posthog) {
    posthog.capture('job_application_clicked', {
      job_id: jobId,
      job_title: jobTitle,
      company_name: companyName,
      job_source: source,
      days_since_posted: date ? Math.floor((Date.now() - new Date(date).getTime()) / 86400000) : undefined,
    })
  }
}

export const trackToolUsage = (
  toolName: string,
  action: 'started' | 'completed' | 'downloaded' | 'shared',
  metadata?: Record<string, any>
) => {
  if (typeof window !== 'undefined' && posthog) {
    posthog.capture('tool_usage', {
      tool_name: toolName,
      action,
      ...metadata,
    })
  }
}

export const trackGlossaryView = (
  term: string,
  category: string,
  difficulty: string
) => {
  if (typeof window !== 'undefined' && posthog) {
    posthog.capture('glossary_term_viewed', {
      term_name: term,
      category: category,
      difficulty: difficulty,
    })
  }
}

export const trackArticleView = (
  slug: string,
  title: string,
  category: string
) => {
  if (typeof window !== 'undefined' && posthog) {
    posthog.capture('article_viewed', {
      article_slug: slug,
      article_title: title,
      category: category,
    })
  }
}

export const trackCompanyView = (
  slug: string,
  name: string,
  jobCount: number
) => {
  if (typeof window !== 'undefined' && posthog) {
    posthog.capture('company_viewed', {
      company_slug: slug,
      company_name: name,
      job_count: jobCount,
    })
  }
}

export const trackSearch = (query: string, resultsCount: number) => {
  if (typeof window !== 'undefined' && posthog) {
    posthog.capture('search_performed', {
      search_query: query,
      search_location: 'job_board',
      results_count: resultsCount,
    })
  }
}

export const trackJobAlertSignup = (email: string, source: string) => {
  if (typeof window !== 'undefined' && posthog) {
    posthog.capture('job_alert_signup', {
      source,
      email_domain: email.split('@')[1], // Only track domain for privacy
    })
  }
}

export const trackOutboundClick = (url: string, linkText?: string) => {
  if (typeof window !== 'undefined' && posthog) {
    posthog.capture('outbound_click', {
      destination: url,
      link_text: linkText,
      page_location: window.location.pathname,
    })
  }
}

// Track key conversion CTAs (Post a Job, Telegram joins, etc.)
export const trackCTAClick = (ctaName: string, destination: string) => {
  if (typeof window !== 'undefined' && posthog) {
    posthog.capture('cta_clicked', {
      cta_name: ctaName,
      destination,
      page_location: window.location.pathname,
    })
  }
}

// Track news article clicks with source attribution
export const trackNewsClick = (
  articleTitle: string,
  articleUrl: string,
  source: string
) => {
  if (typeof window !== 'undefined' && posthog) {
    posthog.capture('news_article_clicked', {
      article_title: articleTitle,
      article_url: articleUrl,
      news_source: source,
    })
  }
}

export const identifyUser = (userId: string, traits?: Record<string, any>) => {
  if (typeof window !== 'undefined' && posthog) {
    posthog.identify(userId, traits)
  }
}

export const resetUser = () => {
  if (typeof window !== 'undefined' && posthog) {
    posthog.reset()
  }
}

export { posthog }
