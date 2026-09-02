import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Code2, Terminal, Zap, Shield, Key, RefreshCw, Cpu } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { PageShell } from '@/components/page-shell';

export const revalidate = 86400; // 24 hours

export default function DevelopersPage() {
  const schemaData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebAPI',
        name: 'Hashtag Web3 REST API',
        description: 'Official public REST API for Hashtag Web3, providing endpoints for searching Web3 jobs, crypto news, blockchain events, and glossary definitions.',
        url: 'https://hashtagweb3.com/developers',
        documentation: 'https://hashtagweb3.com/developers',
        termsOfService: 'https://hashtagweb3.com/privacy',
        provider: {
          '@type': 'Organization',
          name: 'Hashtag Web3',
          url: 'https://hashtagweb3.com',
        },
      },
      {
        '@type': 'TechArticle',
        headline: 'Hashtag Web3 API Documentation & Developer Portal',
        description: 'Comprehensive guide and reference for integrating with Hashtag Web3 REST APIs, OpenAPI 3.1 specifications, and Model Context Protocol (MCP) servers.',
        url: 'https://hashtagweb3.com/developers',
        author: {
          '@type': 'Organization',
          name: 'Hashtag Web3',
          url: 'https://hashtagweb3.com',
        },
      },
    ],
  };

  return (
    <div className="flex flex-col min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      <main className="flex-1">
        <PageShell>
          <div className="site-container space-y-12">
            
            {/* Header */}
            <section className="text-center">
              <PageHeader
                title="Hashtag Web3 API Docs & Developer Portal"
                description="Machine-readable REST endpoints, OpenAPI 3.1 specifications, MCP servers, and agent integration tools for Hashtag Web3."
              />
            </section>

            {/* Machine-Readable Specs Download */}
            <section className="bg-primary/5 border border-primary/20 rounded-2xl p-6 sm:p-8">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div>
                  <Badge variant="outline" className="mb-2 border-primary text-primary">OpenAPI 3.1.0 Ready</Badge>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground">Hashtag Web3 OpenAPI Specifications &amp; Schemas</h2>
                  <p className="text-muted-foreground text-sm mt-1 max-w-2xl">
                    Hashtag Web3 publishes fully typed schemas and agent manifests for automated tool use, MCP servers, and LLM function calling.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <a href="/openapi.json" target="_blank" rel="noopener noreferrer">
                    <Button variant="default">
                      openapi.json
                    </Button>
                  </a>
                  <a href="/api/openapi.yaml" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline">
                      openapi.yaml
                    </Button>
                  </a>
                  <a href="/llms.txt" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline">
                      llms.txt
                    </Button>
                  </a>
                  <a href="/.well-known/agents.json" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline">
                      agents.json
                    </Button>
                  </a>
                </div>
              </div>
            </section>

            {/* Sandbox & Zero-Auth Testing Environment */}
            <section className="bg-muted/30 border border-border/70 rounded-2xl p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-primary" />
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">Hashtag Web3 Sandbox &amp; Test Environment</h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
                Hashtag Web3 provides a zero-auth, zero-friction Sandbox and testing environment for AI agents and developers. 
                Test integrations safely against mock payloads without touching production databases or consuming rate limits.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                <div className="p-4 border border-border/70 rounded-xl bg-card">
                  <h3 className="font-semibold text-sm mb-1">Sandbox Base URL</h3>
                  <a href="/api/sandbox" target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline font-mono">
                    /api/sandbox
                  </a>
                </div>
                <div className="p-4 border border-border/70 rounded-xl bg-card">
                  <h3 className="font-semibold text-sm mb-1">Instant Sandbox Key</h3>
                  <a href="/api/sandbox/auth/register" target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline font-mono">
                    /api/sandbox/auth/register
                  </a>
                </div>
                <div className="p-4 border border-border/70 rounded-xl bg-card">
                  <h3 className="font-semibold text-sm mb-1">Zero-Auth Jobs</h3>
                  <a href="/api/sandbox/jobs" target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline font-mono">
                    /api/sandbox/jobs
                  </a>
                </div>
                <div className="p-4 border border-border/70 rounded-xl bg-card">
                  <h3 className="font-semibold text-sm mb-1">Echo Test Probe</h3>
                  <a href="/api/sandbox/echo" target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline font-mono">
                    /api/sandbox/echo
                  </a>
                </div>
              </div>
            </section>

            {/* Agent Platform Configurations & Public Repository */}
            <section className="bg-muted/30 border rounded-2xl p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-3">
                <Cpu className="h-6 w-6 text-primary" />
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">Hashtag Web3 Agent Configurations &amp; Open Source</h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
                Hashtag Web3 is fully open-source and built to be indexable and readable by autonomous AI coding assistants and agents. 
                Our public GitHub repository contains specialized files and configurations to instruct agents on how to safely interface with the code.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                <div className="p-4 border rounded-xl bg-background">
                  <h3 className="font-semibold text-sm mb-1">GitHub Codebase</h3>
                  <a href="https://github.com/vedangvatsa/Web3-Jobs" target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline font-mono">
                    vedangvatsa/Web3-Jobs
                  </a>
                </div>
                <div className="p-4 border rounded-xl bg-background">
                  <h3 className="font-semibold text-sm mb-1">Agent Plugin Spec</h3>
                  <a href="/plugin.json" target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline font-mono">
                    plugin.json Manifest
                  </a>
                </div>
                <div className="p-4 border rounded-xl bg-background">
                  <h3 className="font-semibold text-sm mb-1">Agent Skill Spec</h3>
                  <a href="https://github.com/vedangvatsa/Web3-Jobs/blob/main/SKILL.md" target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline font-mono">
                    SKILL.md Definition
                  </a>
                </div>
                <div className="p-4 border rounded-xl bg-background">
                  <h3 className="font-semibold text-sm mb-1">Coding Agent Rules</h3>
                  <a href="https://github.com/vedangvatsa/Web3-Jobs/blob/main/AGENTS.md" target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline font-mono">
                    AGENTS.md &amp; Rules
                  </a>
                </div>
              </div>
            </section>

            {/* Official Multi-Language SDKs & Registries */}
            <section className="bg-primary/5 border border-primary/20 rounded-2xl p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-3">
                <Code2 className="h-6 w-6 text-primary" />
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">Hashtag Web3 Multi-Language SDKs &amp; MCP Registries</h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
                Official SDK packages and verified Model Context Protocol (MCP) server listings across language ecosystems and agent registries.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 border rounded-xl bg-background">
                  <Badge className="mb-2 bg-blue-600 hover:bg-blue-700">npm (JavaScript / TS)</Badge>
                  <h3 className="font-semibold text-sm">@hashtagweb3/sdk</h3>
                  <a href="https://www.npmjs.com/package/@hashtagweb3/sdk" target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline font-mono block mt-1">
                    npmjs.com/package/@hashtagweb3/sdk
                  </a>
                </div>
                <div className="p-4 border rounded-xl bg-background">
                  <Badge className="mb-2 bg-yellow-600 hover:bg-yellow-700">PyPI (Python)</Badge>
                  <h3 className="font-semibold text-sm">hashtagweb3</h3>
                  <a href="https://pypi.org/project/hashtagweb3/" target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline font-mono block mt-1">
                    pypi.org/project/hashtagweb3
                  </a>
                </div>
                <div className="p-4 border rounded-xl bg-background">
                  <Badge className="mb-2 bg-red-600 hover:bg-red-700">RubyGems (Ruby)</Badge>
                  <h3 className="font-semibold text-sm">hashtagweb3</h3>
                  <a href="https://rubygems.org/gems/hashtagweb3" target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline font-mono block mt-1">
                    rubygems.org/gems/hashtagweb3
                  </a>
                </div>
                <div className="p-4 border rounded-xl bg-background">
                  <Badge className="mb-2 bg-cyan-600 hover:bg-cyan-700">Go Module</Badge>
                  <h3 className="font-semibold text-sm">github.com/hashtagweb3/sdk</h3>
                  <a href="https://github.com/hashtagweb3/sdk" target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline font-mono block mt-1">
                    github.com/hashtagweb3/sdk
                  </a>
                </div>
                <div className="p-4 border rounded-xl bg-background">
                  <Badge className="mb-2 bg-purple-600 hover:bg-purple-700">Smithery MCP Registry</Badge>
                  <h3 className="font-semibold text-sm">Smithery Listing</h3>
                  <a href="https://smithery.ai/server/@hashtagweb3/mcp" target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline font-mono block mt-1">
                    smithery.ai/server/@hashtagweb3/mcp
                  </a>
                </div>
                <div className="p-4 border rounded-xl bg-background">
                  <Badge className="mb-2 bg-emerald-600 hover:bg-emerald-700">mcp.so Registry</Badge>
                  <h3 className="font-semibold text-sm">mcp.so Listing</h3>
                  <a href="https://mcp.so/server/hashtagweb3" target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline font-mono block mt-1">
                    mcp.so/server/hashtagweb3
                  </a>
                </div>
              </div>
            </section>

            {/* Authentication & API Keys */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <Key className="h-6 w-6 text-primary" />
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Hashtag Web3 Authentication Docs &amp; Security Guide</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="text-lg font-bold text-foreground mb-2 flex items-center gap-2">
                    <Badge variant="secondary">Public Read Endpoints</Badge> No Key Required
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    All standard read endpoints (<code className="text-primary font-bold">/api/v1/jobs</code>, <code className="text-primary font-bold">/api/v1/news</code>, <code className="text-primary font-bold">/api/v1/events</code>, <code className="text-primary font-bold">/api/v1/glossary</code>) are free to query without an API key or authentication. Global CORS is enabled for frontend integrations.
                  </p>
                  <div className="text-xs font-mono bg-muted/40 p-3 rounded-md text-foreground/80">
                    Default Rate Limit: 120 requests / minute per IP
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-bold text-foreground mb-2 flex items-center gap-2">
                    <Badge variant="outline" className="border-primary text-primary">Agent Auth &amp; Tokens</Badge> Bearer Auth
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    Autonomous AI agents and verified partners requiring elevated rate limits or write operations can register for an agent token via our WorkOS-compliant <code className="text-primary font-bold">/auth.md</code> flow.
                  </p>
                  <div className="flex gap-2">
                    <a href="/auth.md" target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm">Read auth.md Spec</Button>
                    </a>
                    <a href="/.well-known/oauth-protected-resource" target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="sm">OAuth Resource Info</Button>
                    </a>
                  </div>
                </Card>
              </div>
            </section>

            {/* Quickstart Code Examples */}
            <section className="space-y-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Hashtag Web3 API Quickstart &amp; Code Samples</h2>
              <p className="text-muted-foreground text-sm sm:text-base">
                Query verified Web3 jobs, crypto news, blockchain glossary terms, and global events using your preferred language or command line.
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* cURL */}
                <Card className="flex flex-col">
                  <CardHeader className="pb-3 border-b bg-muted/30">
                    <CardTitle className="text-sm font-mono flex items-center gap-2">
                      <Terminal className="h-4 w-4 text-primary" /> cURL
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 bg-zinc-950 text-zinc-100 font-mono text-xs overflow-x-auto rounded-b-lg flex-grow">
                    <pre>
                      <code>{`# Search Solidity jobs
curl -X GET "https://hashtagweb3.com/api/v1/jobs?search=Solidity&limit=5" \\
  -H "Accept: application/json"

# Fetch latest crypto news
curl -X GET "https://hashtagweb3.com/api/v1/news?limit=10"`}</code>
                    </pre>
                  </CardContent>
                </Card>

                {/* TypeScript / Fetch */}
                <Card className="flex flex-col">
                  <CardHeader className="pb-3 border-b bg-muted/30">
                    <CardTitle className="text-sm font-mono flex items-center gap-2">
                      <Code2 className="h-4 w-4 text-primary" /> TypeScript / JavaScript
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 bg-zinc-950 text-zinc-100 font-mono text-xs overflow-x-auto rounded-b-lg flex-grow">
                    <pre>
                      <code>{`const response = await fetch(
  'https://hashtagweb3.com/api/v1/jobs?tag=Ethereum&limit=10'
);
const { data, meta } = await response.json();
console.log(\`Found \${meta.total} jobs:\`, data);`}</code>
                    </pre>
                  </CardContent>
                </Card>

                {/* Python */}
                <Card className="flex flex-col">
                  <CardHeader className="pb-3 border-b bg-muted/30">
                    <CardTitle className="text-sm font-mono flex items-center gap-2">
                      <Zap className="h-4 w-4 text-primary" /> Python
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 bg-zinc-950 text-zinc-100 font-mono text-xs overflow-x-auto rounded-b-lg flex-grow">
                    <pre>
                      <code>{`import requests

url = "https://hashtagweb3.com/api/v1/jobs"
params = {"search": "Auditor", "limit": 5}

res = requests.get(url, params=params).json()
for job in res["data"]:
    print(job["title"], "at", job["company"])`}</code>
                    </pre>
                  </CardContent>
                </Card>

              </div>
            </section>

            {/* Official CLI Tool */}
            <section className="bg-card border rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <Terminal className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">Hashtag Web3 Official CLI Tool (npx hashtagweb3)</h2>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Developers and agents can run the official CLI tool directly with zero configuration via <code>npx</code> or install it globally from npm:
              </p>
              <div className="bg-zinc-950 p-4 rounded-lg text-zinc-100 text-xs font-mono overflow-x-auto">
                <pre><code>{`# Run via npx directly
npx hashtagweb3 jobs --search "Solidity" --limit 5
npx hashtagweb3 news --limit 5
npx hashtagweb3 events --type conference
npx hashtagweb3 glossary --search "Zero Knowledge"

# Or install globally
npm install -g hashtagweb3`}</code></pre>
              </div>
            </section>

            {/* REST Endpoint Reference */}
            <section className="space-y-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Hashtag Web3 REST API Endpoints &amp; Reference</h2>

              <div className="space-y-6">
                
                {/* /api/v1/jobs */}
                <Card className="p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <Badge variant="default" className="bg-emerald-600 font-mono">GET</Badge>
                      <code className="text-base font-bold text-foreground">/api/v1/jobs</code>
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">operationId: listJobs</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Search and paginate verified Web3 job postings across engineering, DeFi, security, and growth.
                  </p>
                  <div className="bg-muted/40 rounded-lg p-4 text-xs space-y-2 font-mono">
                    <div className="text-muted-foreground font-sans font-semibold mb-1">Query Parameters:</div>
                    <div><span className="text-primary font-bold">search</span> (string, optional): Keyword query for title, company, or tags.</div>
                    <div><span className="text-primary font-bold">tag</span> (string, optional): Filter by ecosystem or tech tag (e.g. <code>Solidity</code>, <code>Rust</code>).</div>
                    <div><span className="text-primary font-bold">company</span> (string, optional): Filter by company name.</div>
                    <div><span className="text-primary font-bold">limit</span> (integer, optional, default: 50, max: 200).</div>
                    <div><span className="text-primary font-bold">offset</span> (integer, optional, default: 0).</div>
                  </div>
                </Card>

                {/* /api/v1/news */}
                <Card className="p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <Badge variant="default" className="bg-emerald-600 font-mono">GET</Badge>
                      <code className="text-base font-bold text-foreground">/api/v1/news</code>
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">operationId: listNews</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Real-time aggregated crypto news headlines from top industry publications.
                  </p>
                  <div className="bg-muted/40 rounded-lg p-4 text-xs space-y-2 font-mono">
                    <div className="text-muted-foreground font-sans font-semibold mb-1">Query Parameters:</div>
                    <div><span className="text-primary font-bold">search</span> (string, optional): Keyword filter for headlines.</div>
                    <div><span className="text-primary font-bold">limit</span> (integer, optional, default: 30, max: 100).</div>
                  </div>
                </Card>

                {/* /api/v1/events */}
                <Card className="p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <Badge variant="default" className="bg-emerald-600 font-mono">GET</Badge>
                      <code className="text-base font-bold text-foreground">/api/v1/events</code>
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">operationId: listEvents</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upcoming crypto conferences, hackathons, developer summits, and community meetups worldwide.
                  </p>
                  <div className="bg-muted/40 rounded-lg p-4 text-xs space-y-2 font-mono">
                    <div className="text-muted-foreground font-sans font-semibold mb-1">Query Parameters:</div>
                    <div><span className="text-primary font-bold">search</span> (string, optional): Search by event name, city, or description.</div>
                    <div><span className="text-primary font-bold">type</span> (string, optional): <code>conference</code> | <code>hackathon</code> | <code>meetup</code> | <code>online</code></div>
                    <div><span className="text-primary font-bold">country</span> (string, optional): Filter by host country.</div>
                    <div><span className="text-primary font-bold">limit</span> (integer, optional, default: 50, max: 200).</div>
                    <div><span className="text-primary font-bold">offset</span> (integer, optional, default: 0).</div>
                  </div>
                </Card>

                {/* /api/v1/glossary */}
                <Card className="p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <Badge variant="default" className="bg-emerald-600 font-mono">GET</Badge>
                      <code className="text-base font-bold text-foreground">/api/v1/glossary</code>
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">operationId: listGlossaryTerms</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    200+ technical blockchain definitions with clear explanations and category taxonomies.
                  </p>
                  <div className="bg-muted/40 rounded-lg p-4 text-xs space-y-2 font-mono">
                    <div className="text-muted-foreground font-sans font-semibold mb-1">Query Parameters:</div>
                    <div><span className="text-primary font-bold">search</span> (string, optional): Term name or concept lookup.</div>
                    <div><span className="text-primary font-bold">category</span> (string, optional): e.g. <code>DeFi</code>, <code>Consensus</code>, <code>Cryptography</code>.</div>
                    <div><span className="text-primary font-bold">limit</span> (integer, optional, default: 50, max: 250).</div>
                  </div>
                </Card>

              </div>
            </section>

            {/* Model Context Protocol (MCP) & Agent Guidance */}
            <section className="bg-card border rounded-2xl p-6 sm:p-10 shadow-sm space-y-6">
              <div className="text-primary font-semibold text-sm uppercase tracking-wider flex items-center gap-2">
                <Cpu className="h-4 w-4" /> Agentic AI &amp; Model Context Protocol (MCP)
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                Hashtag Web3 Model Context Protocol (MCP) Server &amp; Manifest
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                Autonomous AI agents (Claude Desktop, Cursor, ChatGPT, Antigravity) can connect directly to Hashtag Web3 using our standardized Streamable HTTP MCP server at <code>https://hashtagweb3.com/.well-known/mcp</code> or <code>https://hashtagweb3.com/api/mcp</code>.
              </p>
              <div className="bg-zinc-950 p-4 rounded-lg text-zinc-100 text-xs font-mono overflow-x-auto">
                <pre><code>{`// MCP Server configuration (mcp.json)
{
  "mcpServers": {
    "hashtagweb3": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://hashtagweb3.com/.well-known/mcp"]
    }
  }
}`}</code></pre>
              </div>
            </section>

            {/* REST Versioning & Deprecation Policy */}
            <section className="space-y-6 border-t pt-10">
              <div className="flex items-center gap-3">
                <RefreshCw className="h-6 w-6 text-primary" />
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Hashtag Web3 API Versioning &amp; Deprecation Policy</h2>
              </div>
              <div className="bg-muted/30 border rounded-xl p-6 text-sm text-muted-foreground space-y-4 leading-relaxed">
                <p>
                  <strong className="text-foreground">URL Path Versioning:</strong> Hashtag Web3 provides deterministic API versioning through URI path prefixes (e.g. <code>/api/v1/jobs</code>). Non-breaking additions (new fields, optional parameters) are introduced within the current minor version without altering existing response keys.
                </p>
                <p>
                  <strong className="text-foreground">Deprecation Signaling:</strong> Whenever an API version or field is scheduled for retirement, Hashtag Web3 signals this via standard HTTP headers:
                </p>
                <ul className="list-disc pl-5 space-y-1 font-mono text-xs text-foreground/90">
                  <li><code>API-Version: 1.0.0</code> — Indicates active schema version.</li>
                  <li><code>Deprecation: @1767225600</code> — Unix timestamp of deprecation declaration.</li>
                  <li><code>Sunset: Wed, 31 Dec 2026 23:59:59 GMT</code> — Official sunset timeline (minimum 12 months advance notice).</li>
                </ul>
                <p>
                  Developers and AI agents can monitor these response headers to ensure automated, self-healing integration lifecycle management.
                </p>
              </div>
            </section>

          </div>
        </PageShell>
      </main>
    </div>
  );
}
