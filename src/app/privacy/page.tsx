import { PageHeader } from '@/components/page-header';

export const revalidate = 86400; // 24 hours

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <div className="container mx-auto page-section px-4">
          <div className="site-container space-y-10">
            
            {/* Header */}
            <section className="text-center">
              <PageHeader
                title="Privacy Policy"
                description="Last updated: August 24, 2026. How Hashtag Web3 collects, uses, and safeguards your data."
              />
            </section>

            {/* Privacy Policy Content */}
            <article className="prose dark:prose-invert max-w-none bg-card border rounded-2xl p-6 sm:p-12 shadow-sm space-y-8 text-sm sm:text-base leading-relaxed text-muted-foreground">
              
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">1. Introduction</h2>
                <p>
                  Hashtag Web3 (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates hashtagweb3.com. We are committed to protecting the privacy of our website visitors, job seekers, employers, and automated agent consumers. This Privacy Policy explains what information we collect, how we use it, and what rights you have regarding your personal information.
                </p>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">2. Information We Collect</h2>
                <p>We may collect information directly from you or automatically when you interact with our platform:</p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li><strong>Voluntary User Submissions:</strong> Email addresses submitted for job alerts, newsletter updates, or resume builder exports.</li>
                  <li><strong>Hiring & Employer Data:</strong> Company name, job descriptions, contact email, and billing details provided when posting open roles.</li>
                  <li><strong>Usage Analytics:</strong> Anonymized telemetry such as page views, referrer URLs, browser type, device information, and country-level location.</li>
                  <li><strong>Automated Agent Interactions:</strong> API request headers, user agent tokens, and query parameters requested by programmatic crawlers and LLM agents.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">3. How We Use Your Information</h2>
                <p>We process collected data for legitimate business purposes, including:</p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>Delivering daily and weekly Web3 job alert emails that you have explicitly subscribed to.</li>
                  <li>Operating and indexing our public job board, conference calendar, and educational glossary.</li>
                  <li>Improving platform performance, site search speed, and developer API response latency.</li>
                  <li>Preventing fraudulent job postings, spam, and malicious bot abuse.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">4. AI Agents, Web Crawlers & Content Syndication</h2>
                <p>
                  Hashtag Web3 is an agent-friendly platform. In accordance with our published <code>/ai.txt</code>, <code>/ai.json</code>, <code>/robots.txt</code>, and <code>/llms.txt</code> directives, we grant AI agents and search engines permission to crawl, index, summarize, and cite our human-authored articles, job postings, and glossary definitions with attribution.
                </p>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">5. Cookies & Local Storage</h2>
                <p>
                  We use essential cookies and browser local storage strictly to remember your preferences (such as dark mode settings, bookmarking saved jobs, and resume drafts). We do not sell user data to third-party data brokers or behavioral advertising networks.
                </p>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">6. Your Rights (GDPR & CCPA)</h2>
                <p>Depending on your jurisdiction, you possess the right to:</p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>Request access to the personal data we maintain about you.</li>
                  <li>Request the immediate deletion or correction of your email subscription records.</li>
                  <li>Opt out of any marketing or alert notifications via the one-click unsubscribe link in every email.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">7. Contact Information</h2>
                <p>
                  If you have any questions, concerns, or data erasure requests concerning this Privacy Policy, please contact our Data Protection Officer at:
                </p>
                <p className="mt-2 font-medium text-foreground">
                  Email: <a href="mailto:privacy@hashtagweb3.com" className="text-primary hover:underline">privacy@hashtagweb3.com</a> or <a href="mailto:contact@hashtagweb3.com" className="text-primary hover:underline">contact@hashtagweb3.com</a><br />
                  Entity: Hashtag Web3 Inc., San Francisco, CA, United States
                </p>
              </div>

            </article>

          </div>
        </div>
      </main>
    </div>
  );
}
