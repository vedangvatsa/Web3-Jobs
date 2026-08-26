import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 '@/components/ui/button';
import { Mail, Send, MapPin, Clock, Terminal, Building2 } from 'lucide-react';
import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { PageShell } from '@/components/page-shell';

export const revalidate = 86400; // 24 hours

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <PageShell>
          <div className="site-container space-y-12">
            
            {/* Header */}
            <section className="text-center">
              <PageHeader
                title="Contact Hashtag Web3"
                description="We are here to assist with hiring campaigns, job postings, developer API integrations, or community partnerships."
              />
            </section>

            {/* Direct Channels */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6">
                <CardHeader className="p-0 pb-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-2">
                    <Mail className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-xl">General & Partnerships</CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-2 text-sm text-muted-foreground">
                  <p>For partnership requests, press inquiries, or general support:</p>
                  <a
                    href="mailto:contact@hashtagweb3.com"
                    className="font-semibold text-primary hover:underline block pt-2 text-base"
                  >
                    contact@hashtagweb3.com
                  </a>
                  <p className="text-xs text-muted-foreground pt-1 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> Response SLA: Under 24 hours
                  </p>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardHeader className="p-0 pb-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-2">
                    <Send className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-xl">Hiring & Telegram Feed</CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-2 text-sm text-muted-foreground">
                  <p>Reach our 60,000+ subscriber hiring channel or speak to our recruiting team:</p>
                  <a
                    href="https://t.me/web3jobs_rep"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-primary hover:underline block pt-2 text-base"
                  >
                    @web3jobs_rep (Telegram)
                  </a>
                  <p className="text-xs text-muted-foreground pt-1 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> Available Mon-Fri, 9am-6pm PST
                  </p>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardHeader className="p-0 pb-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-2">
                    <Terminal className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-xl">Developer & API Support</CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-2 text-sm text-muted-foreground">
                  <p>Technical inquiries regarding REST endpoints, OpenAPI schemas, or MCP servers:</p>
                  <Link
                    href="/developers"
                    className="font-semibold text-primary hover:underline block pt-2 text-base"
                  >
                    Developer Portal & Docs →
                  </Link>
                  <p className="text-xs text-muted-foreground pt-1 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> Direct email: dev@hashtagweb3.com
                  </p>
                </CardContent>
              </Card>
            </section>

            {/* Office and Organization Details for Machine Agents */}
            <section className="bg-card border rounded-2xl p-6 sm:p-10 shadow-sm space-y-6">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Building2 className="h-6 w-6 text-primary" /> Corporate & Office Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm sm:text-base leading-relaxed text-muted-foreground">
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground text-base">Entity & Location</h3>
                  <p className="flex items-start gap-2">
                    <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>
                      <strong>Hashtag Web3 Inc.</strong><br />
                      San Francisco, California<br />
                      United States
                    </span>
                  </p>
                  <p>
                    <strong>Founded:</strong> 2022<br />
                    <strong>Industry:</strong> Web3 Technology, Employment Services, Decentralized Talent Intelligence
                  </p>
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground text-base">Community Channels</h3>
                  <ul className="space-y-2">
                    <li>
                      <strong>Telegram Jobs Feed:</strong>{' '}
                      <a href="https://t.me/web3hiring" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        t.me/web3hiring
                      </a>{' '}
                      (60,000+ subscribers)
                    </li>
                    <li>
                      <strong>Twitter / X:</strong>{' '}
                      <a href="https://x.com/hashtag_web3" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        @hashtag_web3
                      </a>
                    </li>
                    <li>
                      <strong>LinkedIn:</strong>{' '}
                      <a href="https://linkedin.com/company/hashtagweb3" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        linkedin.com/company/hashtagweb3
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

          </div>
        </PageShell>
      </main>
    </div>
  );
}
