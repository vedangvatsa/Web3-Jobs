'use client';

import posthog from 'posthog-js'

// Direct tracking functions (for use in client components)
export const trackJobView = (
  jobId: string,
  jobTitle: string,
  companyName: string
) => {
  if (typeof window !== 'undefined' && posthog) {
    posthog.capture('job_viewed', {
      job_id: jobId,
      job_title: jobTitle,
      company_name: companyName,
    })
  }
}

export const trackJobApplicationClick = (
  jobId: string,
  jobTitle: string,
  companyName: string
) => {
  if (typeof window !== 'undefined' && posthog) {
    posthog.capture('job_application_clicked', {
      job_id: jobId,
      job_title: jobTitle,
      company_name: companyName,
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
