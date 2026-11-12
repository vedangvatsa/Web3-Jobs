import type { Metadata } from 'next';
import { PageShell } from '@/components/page-shell';
import { PageHeader } from '@/components/page-header';
import Link from 'next/link';

// OG preview card reference for test coverage: /og/pages/hall-of-fame.png

export const metadata: Metadata = {
  title: 'Security Hall of Fame | Hashtag Web3',
  description: 'Security researchers who have responsibly disclosed vulnerabilities to Hashtag Web3.',
  alternates: { canonical: 'https://hashtagweb3.com/hall-of-fame' },
  openGraph: {
    title: 'Security Hall of Fame | Hashtag Web3',
    description: 'Acknowledging security researchers who help keep Hashtag Web3 safe.',
    url: 'https://hashtagweb3.com/hall-of-fame',
    type: 'website',
    images: [{ url: 'https://hashtagweb3.com/og/pages/hall-of-fame.png', width: 1200, height: 630 }],
  },
};

export default function HallOfFamePage() {
  return (
    <PageShell>
      <main className="flex-1">
        <article className="site-container py-10 sm:py-14 max-w-3xl">
          <PageHeader title="Security Hall of Fame" description="Security researchers who have responsibly disclosed vulnerabilities to Hashtag Web3." />
          
          <div className="prose prose-slate dark:prose-invert">
            <p className="text-center text-muted-foreground py-12">
              No security issues have been reported yet. Be the first!
            </p>
            
            <h2>How to Report</h2>
            <p>If you find a security vulnerability, please report it via:</p>
            <ul>
              <li>Email: <a href="mailto:hello@hashtagweb3.com">hello@hashtagweb3.com</a></li>
              <li>Telegram: <a href="https://t.me/web3jobs_rep" target="_blank" rel="noopener noreferrer">@web3jobs_rep</a></li>
            </ul>
            
            <h2>What We Look For</h2>
            <ul>
              <li>XSS (Cross-Site Scripting) in our rendered content</li>
              <li>Open redirect vulnerabilities</li>
              <li>CSP bypasses</li>
              <li>Information disclosure in API responses</li>
              <li>Injection vulnerabilities in search/filter parameters</li>
            </ul>
            
            <h2>What We Don't Need</h2>
            <ul>
              <li>Reports about third-party job application sites (Greenhouse, Lever, etc.)</li>
              <li>Missing security headers on external domains</li>
              <li>Content policy disagreements (educational crypto content is intentional)</li>
              <li>Automated scanner output without manual verification</li>
            </ul>
            
            <h2>Recognition</h2>
            <p>Valid reports will be acknowledged here with researcher name/handle (with permission) and a brief description of the issue class.</p>
          </div>

          <div className="mt-12 pt-8 border-t">
            <p className="text-sm text-muted-foreground">
              <Link href="/security-policy" className="text-primary hover:underline">← Back to Security Policy</Link>
            </p>
          </div>
        </article>
      </main>
    </PageShell>
  );
}