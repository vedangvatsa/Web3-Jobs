import type { Metadata } from 'next';
import { PageShell } from '@/components/page-shell';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Shield, Clock, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 86400;

export const metadata: Metadata = {
  title: 'Hashtag Web3 API Versioning & Deprecation Policy',
  description: 'Official API versioning strategy, RFC 8594 Sunset/Deprecation HTTP header specifications, minimum 12-month notice guarantee, and breaking change schedule.',
  alternates: {
    canonical: 'https://hashtagweb3.com/api-policy',
  },
  openGraph: {
    title: 'Hashtag Web3 API Versioning & Deprecation Policy',
    description: 'Official API versioning strategy, RFC 8594 Sunset/Deprecation HTTP header specifications, minimum 12-month notice guarantee, and breaking change schedule.',
    url: 'https://hashtagweb3.com/api-policy',
  },
};

export default function ApiPolicyPage() {
  return (
    <PageShell>
      <div className="max-w-4xl mx-auto py-8 sm:py-12 space-y-10">
        <div className="space-y-3">
          <Badge variant="outline" className="border-primary text-primary">API Lifecycle Governance</Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Hashtag Web3 API Versioning &amp; Deprecation Policy
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl leading-relaxed">
            Predictable stability guarantees for autonomous AI agents, enterprise partners, and developer integrations.
          </p>
        </div>

        {/* Core Policy Principles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 space-y-3 border-border/70 bg-card">
            <Clock className="h-6 w-6 text-primary" />
            <h3 className="font-bold text-foreground">12-Month Sunset Notice</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We guarantee a minimum of 12 months advance notice prior to sunsetting or breaking any public REST endpoint or schema.
            </p>
          </Card>

          <Card className="p-6 space-y-3 border-border/70 bg-card">
            <Shield className="h-6 w-6 text-primary" />
            <h3 className="font-bold text-foreground">RFC 8594 Headers</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Every API response transmits machine-readable <code className="text-foreground font-mono">Deprecation</code>, <code className="text-foreground font-mono">Sunset</code>, and <code className="text-foreground font-mono">API-Version</code> headers.
            </p>
          </Card>

          <Card className="p-6 space-y-3 border-border/70 bg-card">
            <CheckCircle2 className="h-6 w-6 text-primary" />
            <h3 className="font-bold text-foreground">Backward Compatible</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Additive changes (new optional fields, new parameters) are made seamlessly without version increments.
            </p>
          </Card>
        </div>

        {/* Current Active Lifecycle */}
        <section className="border border-border/70 rounded-2xl p-6 sm:p-8 bg-muted/20 space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">Current API Lifecycle Status</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="pb-3">Version</th>
                  <th className="pb-3">Base Path</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Deprecated Date</th>
                  <th className="pb-3">Sunset Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 text-foreground/90">
                <tr>
                  <td className="py-3 font-semibold font-mono">v1.0.0</td>
                  <td className="py-3 font-mono text-xs">/api/v1/*</td>
                  <td className="py-3"><Badge variant="default" className="bg-emerald-600">Active / Current</Badge></td>
                  <td className="py-3 text-muted-foreground">N/A</td>
                  <td className="py-3 font-mono text-xs">Dec 31, 2026</td>
                </tr>
                <tr>
                  <td className="py-3 font-semibold font-mono">Sandbox</td>
                  <td className="py-3 font-mono text-xs">/api/sandbox/*</td>
                  <td className="py-3"><Badge variant="secondary">Zero-Auth Test</Badge></td>
                  <td className="py-3 text-muted-foreground">N/A</td>
                  <td className="py-3 text-muted-foreground">Indefinite</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* HTTP Headers Specification */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">Deprecation &amp; Sunset Response Headers</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Hashtag Web3 implements the standard HTTP deprecation draft specifications (RFC 8594). Automated AI agents should monitor these headers in responses:
          </p>

          <div className="bg-muted/40 p-5 rounded-xl border border-border/70 font-mono text-xs sm:text-sm space-y-2">
            <div><span className="text-muted-foreground"># Current version identifier</span></div>
            <div><strong className="text-primary">API-Version</strong>: 1.0.0</div>
            <div className="pt-2"><span className="text-muted-foreground"># Unix timestamp when deprecation was announced</span></div>
            <div><strong className="text-primary">Deprecation</strong>: @1767225600</div>
            <div className="pt-2"><span className="text-muted-foreground"># HTTP-date when endpoint will cease operation</span></div>
            <div><strong className="text-primary">Sunset</strong>: Wed, 31 Dec 2026 23:59:59 GMT</div>
            <div className="pt-2"><span className="text-muted-foreground"># Link to deprecation policy &amp; migration guides</span></div>
            <div><strong className="text-primary">Link</strong>: &lt;https://hashtagweb3.com/api-policy&gt;; rel=&quot;deprecation&quot;</div>
          </div>
        </section>

        {/* Action Button */}
        <div className="pt-4 flex flex-wrap gap-4 items-center">
          <Link href="/developers" className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-5 py-2.5 rounded-lg text-sm hover:opacity-90 transition">
            Explore API Documentation <ArrowRight className="h-4 w-4" />
          </Link>
          <a href="/openapi.json" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 border px-5 py-2.5 rounded-lg text-sm hover:bg-muted transition">
            View OpenAPI 3.1 Specification
          </a>
        </div>
      </div>
    </PageShell>
  );
}
