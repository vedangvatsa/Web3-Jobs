import posthog from 'posthog-js'

// Direct tracking functions (for use in client components)
export const trackJobView = (job: {
  id: string
  title: string
  company: string
  location?: string
  type?: string
}) => {
  if (typeof window !== 'undefined' && posthog) {
    posthog.capture('job_viewed', {
      job_id: job.id,
      job_title: job.title,
      company: job.company,
      location: job.location,
      employment_type: job.type,
    })
  }
}

export const trackJobApplicationClick = (job: {
  id: string
  title: string
  company: string
}) => {
  if (typeof window !== 'undefined' && posthog) {
    posthog.capture('job_application_clicked', {
      job_id: job.id,
      job_title: job.title,
      company: job.company,
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

export const trackGlossaryView = (term: {
  name: string
  category: string
  difficulty: string
  slug: string
}) => {
  if (typeof window !== 'undefined' && posthog) {
    posthog.capture('glossary_term_viewed', {
      term_name: term.name,
      category: term.category,
      difficulty: term.difficulty,
      slug: term.slug,
    })
  }
}

export const trackArticleView = (article: {
  title: string
  category: string
  slug: string
}) => {
  if (typeof window !== 'undefined' && posthog) {
    posthog.capture('article_viewed', {
      article_title: article.title,
      category: article.category,
      slug: article.slug,
    })
  }
}

export const trackCompanyView = (company: {
  name: string
  slug: string
  industry?: string
}) => {
  if (typeof window !== 'undefined' && posthog) {
    posthog.capture('company_viewed', {
      company_name: company.name,
      company_slug: company.slug,
      company_industry: company.industry,
    })
  }
}

export const trackSearch = (query: string, location: string, resultsCount?: number) => {
  if (typeof window !== 'undefined' && posthog) {
    posthog.capture('search_performed', {
      search_query: query,
      search_location: location,
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
