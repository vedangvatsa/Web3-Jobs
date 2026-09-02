import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, Key, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { PageShell } from '@/components/page-shell';
import Link from 'next/link';

export const revalidate = 86400; // 24 hours

export const metadata: Metadata = {
  title: 'Hashtag Web3 Authentication Docs & Agent Auth Guide',
  description: 'Official Hashtag Web3 agent authentication guide, WorkOS auth.md specifications, OAuth 2.0 metadata, and zero-friction API key issuance.',
  alternates: {
    canonical: 'https://hashtagweb3.com/auth',
  },
  openGraph: {
    title: 'Hashtag Web3 Authentication Docs & Agent Auth Guide',
    description: 'Official Hashtag Web3 agent authentication guide, WorkOS auth.md specifications, OAuth 2.0 metadata, and zero-friction API key issuance.',
    url: 'https://hashtagweb3.com/auth',
  },
};

export default function AuthPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <PageShell>
          <div className="site-container space-y-12">
            
            {/* Header */}
            <section className="text-center">
              <PageHeader
                title="Hashtag Web3 Authentication Docs & Agent Auth Guide"
                description="WorkOS auth.md compliant authentication guide, OAuth 2.0 RFC metadata, and automated credential issuance for AI agents."
              />
            </section>

            {/* Quick Links */}
            <section className="bg-primary/5 border border-primary/20 rounded-2xl p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <Badge variant="outline" className="mb-2 border-primary text-primary">agent_auth 1.0 Spec</Badge>
                  <h2 className="text-xl font-bold text-foreground">Machine-Readable Auth Walkthrough</h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    AI agents can consume our direct prose walkthrough at <code className="text-primary font-mono text-xs">/auth.md</code>.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <a href="/auth.md" target="_blank" rel="noopener noreferrer">
                    <Button variant="default">
                      View /auth.md
                    </Button>
                  </a>
                  <Link href="/developers">
                    <Button variant="outline">
                      API Documentation
                    </Button>
                  </Link>
                </div>
              </div>
            </section>

            {/* Auth Methods */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2 mb-1">
                    <Key className="h-5 w-5 text-primary" />
                    <Badge variant="secondary">Method 1</Badge>
                  </div>
                  <CardTitle className="text-lg">Zero-Auth & Public Read Access</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    All core reading endpoints (<code className="text-foreground font-mono">/api/v1/jobs</code>, <code className="text-foreground font-mono">/api/v1/news</code>, <code className="text-foreground font-mono">/api/v1/events</code>, <code className="text-foreground font-mono">/api/v1/glossary</code>) require zero authentication.
                  </p>
                  <div className="bg-muted p-3 rounded-lg font-mono text-xs text-foreground">
                    curl https://hashtagweb3.com/api/v1/jobs?limit=5
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="h-5 w-5 text-primary" />
                    <Badge variant="secondary">Method 2</Badge>
                  </div>
                  <CardTitle className="text-lg">Instant Self-Serve Sandbox Key</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    Generate an instant test API key without filling out forms or waiting for manual approval.
                  </p>
                  <div className="bg-muted p-3 rounded-lg font-mono text-xs text-foreground">
                    curl -X POST https://hashtagweb3.com/api/sandbox/auth/register \<br/>
                    &nbsp;&nbsp;-H &quot;Content-Type: application/json&quot; \<br/>
                    &nbsp;&nbsp;-d &apos;&#123;&quot;agent_id&quot;: &quot;agent-007&quot;&#125;&apos;
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Standards & RFCs */}
            <section className="border border-border rounded-2xl p-6 sm:p-8 space-y-4">
              <h2 className="text-xl font-bold text-foreground">RFC Discovery Endpoints</h2>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center justify-between p-3 bg-muted/40 rounded-xl">
                  <span><strong>RFC 9728</strong> OAuth Protected Resource Metadata</span>
                  <a href="/.well-known/oauth-protected-resource" target="_blank" className="text-primary hover:underline font-mono text-xs">
                    /.well-known/oauth-protected-resource
                  </a>
                </li>
                <li className="flex items-center justify-between p-3 bg-muted/40 rounded-xl">
                  <span><strong>RFC 8414</strong> OAuth Authorization Server Metadata</span>
                  <a href="/.well-known/oauth-authorization-server" target="_blank" className="text-primary hover:underline font-mono text-xs">
                    /.well-known/oauth-authorization-server
                  </a>
                </li>
                <li className="flex items-center justify-between p-3 bg-muted/40 rounded-xl">
                  <span><strong>RFC 9727</strong> Standardized API Catalog (Linkset)</span>
                  <a href="/.well-known/api-catalog" target="_blank" className="text-primary hover:underline font-mono text-xs">
                    /.well-known/api-catalog
                  </a>
                </li>
              </ul>
            </section>

          </div>
        </PageShell>
      </main>
    </div>
  );
}
