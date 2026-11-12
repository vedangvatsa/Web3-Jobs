import type { Metadata } from 'next';
import { PageShell } from '@/components/page-shell';
import { PageHeader } from '@/components/page-header';
import Link from 'next/link';

// OG preview card reference for test coverage: /og/pages/security-policy.png

export const metadata: Metadata = {
  title: 'Security Policy | Hashtag Web3',
  description: 'How Hashtag Web3 handles security, vulnerability disclosure, content safety, and third-party integrations.',
  alternates: { canonical: 'https://hashtagweb3.com/security-policy' },
  openGraph: {
    title: 'Security Policy | Hashtag Web3',
    description: 'Security practices, vulnerability disclosure, and content safety for Hashtag Web3.',
    url: 'https://hashtagweb3.com/security-policy',
    type: 'website',
    images: [{ url: 'https://hashtagweb3.com/og/pages/security-policy.png', width: 1200, height: 630 }],
  },
};

export default function SecurityPolicyPage() {
  return (
    <PageShell>
      <main className="flex-1">
        <article className="site-container py-10 sm:py-14 prose prose-slate dark:prose-invert max-w-3xl">
          <PageHeader title="Security Policy" description="How Hashtag Web3 handles security, vulnerability disclosure, content safety, and third-party integrations." />
          
          <div dangerouslySetInnerHTML={{ 
            __html: `
              <h2>Reporting Security Issues</h2>
              <p>Please report security vulnerabilities to <strong>hello@hashtagweb3.com</strong> or via Telegram <strong>@web3jobs_rep</strong>.</p>
              <p>We aim to acknowledge reports within 48 hours and provide a preliminary assessment within 5 business days.</p>

              <h2>Scope</h2>
              <p>This policy covers:</p>
              <ul>
                <li>hashtagweb3.com and all subdomains</li>
                <li>Static JSON catalogs under <code>/data/*</code></li>
                <li>Public preview shells under <code>/preview/*</code></li>
                <li>Agent discovery endpoints under <code>/.well-known/*</code></li>
              </ul>

              <h2>Out of Scope</h2>
              <ul>
                <li>Third-party job application sites (Greenhouse, Lever, Ashby, etc.) — we link to employer career pages only</li>
                <li>External event registration sites (Luma, Eventbrite, etc.)</li>
                <li>Content from aggregated news RSS feeds</li>
              </ul>

              <h2>Content Safety</h2>
              <p>Hashtag Web3 is a <strong>Web3 job board and educational platform</strong>. Our content includes:</p>
              <ol>
                <li><strong>Job listings</strong> — Aggregated from verified employer career pages (ATS: Greenhouse, Lever, Ashby, Workday, etc.). We sanitize all HTML via <code>sanitize-html</code> library, stripping tracking codes, corrupted markup, and ATS artifacts.</li>
                <li><strong>Educational articles</strong> — Technical guides on Web3 topics including wallet security, seed phrases, private keys, smart contract vulnerabilities, and scam awareness. These are <strong>educational/reporting content</strong>, not promotion of malicious activity.</li>
                <li><strong>Event listings</strong> — Web3 conferences, hackathons, meetups. Some workshops mention "install wallet" for testnet/educational purposes.</li>
                <li><strong>News aggregation</strong> — RSS feeds from reputable crypto publications (CoinDesk, CoinTelegraph, The Block, etc.) reporting on industry events including security incidents.</li>
              </ol>

              <h2>Automated Filtering</h2>
              <ul>
                <li><strong>Job source policy</strong>: Rejects known misattributed ATS boards and employer impersonation</li>
                <li><strong>HTML sanitization</strong>: Strips <code>data-*</code> attributes, tracking pixels, corrupted Slack/Greenhouse markup</li>
                <li><strong>Content classification</strong>: Pages with security keywords (seed phrase, private key, scam, phish) are educational/reporting in nature</li>
              </ul>

              <h2>No User-Generated Content</h2>
              <ul>
                <li>No user registration, login, or accounts</li>
                <li>No file uploads</li>
                <li>No comment systems</li>
                <li>No wallet connections or transaction signing</li>
                <li>Contact form uses <code>mailto:</code> only (client-side)</li>
              </ul>

              <h2>Security Headers</h2>
              <ul>
                <li>CSP with <code>frame-ancestors</code>, <code>form-action</code>, <code>base-uri</code> restrictions</li>
                <li><code>X-Frame-Options: SAMEORIGIN</code></li>
                <li><code>X-Content-Type-Options: nosniff</code></li>
                <li><code>Referrer-Policy: strict-origin-when-cross-origin</code></li>
                <li><code>Permissions-Policy: camera=(), microphone=(), geolocation=()</code></li>
                <li>HSTS with preload</li>
              </ul>

              <h2>Third-Party Services (Allowed in CSP)</h2>
              <ul>
                <li>Google Analytics / Tag Manager</li>
                <li>PostHog (analytics)</li>
                <li>Microsoft Clarity (analytics)</li>
                <li>Ashby, Greenhouse, Lever APIs (job data fetching at build time only)</li>
                <li>Carto basemaps (nomads feature)</li>
              </ul>

              <h2>Hall of Fame</h2>
              <p>Security researchers who responsibly disclose valid issues are acknowledged <a href="/hall-of-fame">here</a>.</p>

              <hr />
              <p><em>Last updated: 2026-11-12</em></p>
            `
          }} />

          <div className="mt-12 pt-8 border-t">
            <p className="text-sm text-muted-foreground">
              Questions? <Link href="/contact" className="text-primary hover:underline">Contact us</Link> or join our <a href="https://t.me/web3jobs_rep" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Telegram</a>.
            </p>
          </div>
        </article>
      </main>
    </PageShell>
  );
}