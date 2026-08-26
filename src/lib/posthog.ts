'use client';

import type { PostHog } from 'posthog-js';

let clientPromise: Promise<PostHog | null> | null = null;

/** Load analytics only in the browser and only when it is configured. */
export function getPostHogClient(): Promise<PostHog | null> {
 if (typeof window === 'undefined' || !process.env.NEXT_PUBLIC_POSTHOG_KEY) {
  return Promise.resolve(null);
 }

 clientPromise ??= import('posthog-js')
  .then(({ default: posthog }) => {
   if (!posthog.__loaded) {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
     api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
     person_profiles: 'identified_only',
     capture_pageview: false,
     capture_pageleave: true,
     autocapture: false,
     loaded: (client) => {
      if (process.env.NODE_ENV === 'development') client.debug();
     },
    });
   }
   return posthog;
  })
  .catch(() => null);

 return clientPromise;
}

function withPostHog(action: (client: PostHog) => void): void {
 void getPostHogClient().then((client) => {
  if (client) action(client);
 });
}

// Direct tracking functions (for use in client components)
export const trackJobView = (
 jobId: string,
 jobTitle: string,
 companyName: string,
 source?: string,
 date?: string,
) => {
 withPostHog((client) => {
  client.capture('job_viewed', {
   job_id: jobId,
   job_title: jobTitle,
   company_name: companyName,
   job_source: source,
   days_since_posted: date ? Math.floor((Date.now() - new Date(date).getTime()) / 86400000) : undefined,
  });
 });
}

export const trackJobApplicationClick = (
 jobId: string,
 jobTitle: string,
 companyName: string,
 source?: string,
 date?: string,
) => {
 withPostHog((client) => {
  client.capture('job_application_clicked', {
   job_id: jobId,
   job_title: jobTitle,
   company_name: companyName,
   job_source: source,
   days_since_posted: date ? Math.floor((Date.now() - new Date(date).getTime()) / 86400000) : undefined,
  });
 });
}

export const trackToolUsage = (
 toolName: string,
 action: 'started' | 'completed' | 'downloaded' | 'shared',
 metadata?: Record<string, unknown>
) => {
 withPostHog((client) => {
  client.capture('tool_usage', {
   tool_name: toolName,
   action,
   ...metadata,
  });
 });
}

export const trackGlossaryView = (
 term: string,
 category: string,
 difficulty: string
) => {
 withPostHog((client) => {
  client.capture('glossary_term_viewed', {
   term_name: term,
   category: category,
   difficulty: difficulty,
  });
 });
}

export const trackArticleView = (
 slug: string,
 title: string,
 category: string
) => {
 withPostHog((client) => {
  client.capture('article_viewed', {
   article_slug: slug,
   article_title: title,
   category: category,
  });
 });
}

export const trackCompanyView = (
 slug: string,
 name: string,
 jobCount: number
) => {
 withPostHog((client) => {
  client.capture('company_viewed', {
   company_slug: slug,
   company_name: name,
   job_count: jobCount,
  });
 });
}

export const trackSearch = (query: string, resultsCount: number) => {
 withPostHog((client) => {
  client.capture('search_performed', {
   search_query: query,
   search_location: 'job_board',
   results_count: resultsCount,
  });
 });
}

export const trackJobAlertSignup = (email: string, source: string) => {
 withPostHog((client) => {
  client.capture('job_alert_signup', {
   source,
   email_domain: email.split('@')[1], // Only track domain for privacy
  });
 });
}

export const trackOutboundClick = (url: string, linkText?: string) => {
 withPostHog((client) => {
  client.capture('outbound_click', {
   destination: url,
   link_text: linkText,
   page_location: window.location.pathname,
  });
 });
}

// Track key conversion CTAs (Post a Job, Telegram joins, etc.)
export const trackCTAClick = (ctaName: string, destination: string) => {
 withPostHog((client) => {
  client.capture('cta_clicked', {
   cta_name: ctaName,
   destination,
   page_location: window.location.pathname,
  });
 });
}

// Track news article clicks with source attribution
export const trackNewsClick = (
 articleTitle: string,
 articleUrl: string,
 source: string
) => {
 withPostHog((client) => {
  client.capture('news_article_clicked', {
   article_title: articleTitle,
   article_url: articleUrl,
   news_source: source,
  });
 });
}

export const identifyUser = (userId: string, traits?: Record<string, unknown>) => {
 withPostHog((client) => client.identify(userId, traits));
}

export const resetUser = () => {
 withPostHog((client) => client.reset());
}
