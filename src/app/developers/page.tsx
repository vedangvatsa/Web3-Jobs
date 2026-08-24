import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Code2, Terminal, Zap } from 'lucide-react';
import { PageHeader } from '@/components/page-header';

export const revalidate = 86400; // 24 hours

export default function DevelopersPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <div className="container mx-auto page-section px-4">
          <div className="site-container space-y-12">
            
            {/* Header */}
            <section className="text-center">
              <PageHeader
                title="Developer Portal & Public API"
                description="Machine-readable REST endpoints, OpenAPI 3.1 specifications, and agent integration tools for Hashtag Web3."
              />
            </section>

            {/* Machine-Readable Specs Download */}
            <section className="bg-primary/5 border border-primary/20 rounded-2xl p-6 sm:p-8">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div>
                  <Badge variant="outline" className="mb-2 border-primary text-primary">OpenAPI 3.1.0 Ready</Badge>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground">Authoritative Machine Specifications</h2>
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
                </div>
              </div>
            </section>

            {/* Quickstart Code Examples */}
            <section className="space-y-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">API Quickstart</h2>
              <p className="text-muted-foreground text-sm sm:text-base">
                All endpoints are free to use without an API key for up to 60 requests per minute. CORS is enabled globally for frontend and client-side applications.
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
curl -X GET "https://hashtagweb3.com/api/jobs?search=Solidity&limit=5" \\
  -H "Accept: application/json"

# Fetch latest crypto news
curl -X GET "https://hashtagweb3.com/api/news?limit=10"`}</code>
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
  'https://hashtagweb3.com/api/jobs?tag=Ethereum&limit=10'
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

url = "https://hashtagweb3.com/api/jobs"
params = {"search": "Auditor", "limit": 5}

res = requests.get(url, params=params).json()
for job in res["data"]:
    print(job["title"], "at", job["company"])`}</code>
                    </pre>
                  </CardContent>
                </Card>

              </div>
            </section>

            {/* REST Endpoint Reference */}
            <section className="space-y-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">API Endpoints Reference</h2>

              <div className="space-y-6">
                
                {/* /api/jobs */}
                <Card className="p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <Badge variant="default" className="bg-emerald-600 font-mono">GET</Badge>
                      <code className="text-base font-bold text-foreground">/api/jobs</code>
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

                {/* /api/news */}
                <Card className="p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <Badge variant="default" className="bg-emerald-600 font-mono">GET</Badge>
                      <code className="text-base font-bold text-foreground">/api/news</code>
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

                {/* /api/events */}
                <Card className="p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <Badge variant="default" className="bg-emerald-600 font-mono">GET</Badge>
                      <code className="text-base font-bold text-foreground">/api/events</code>
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

                {/* /api/glossary */}
                <Card className="p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <Badge variant="default" className="bg-emerald-600 font-mono">GET</Badge>
                      <code className="text-base font-bold text-foreground">/api/glossary</code>
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
              <div className="text-primary font-semibold text-sm uppercase tracking-wider">
                Agentic AI & MCP Server
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                Model Context Protocol (MCP) & Tool Calling
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                Autonomous AI agents (Claude Desktop, Cursor, ChatGPT, Antigravity) can connect directly to Hashtag Web3 using our OpenAPI schema or by executing standard HTTP GET requests.
              </p>
              <div className="bg-zinc-950 p-4 rounded-lg text-zinc-100 text-xs font-mono overflow-x-auto">
                <pre><code>{`// MCP Server configuration (mcp.json)
{
  "mcpServers": {
    "hashtagweb3": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://hashtagweb3.com/openapi.json"]
    }
  }
}`}</code></pre>
              </div>
            </section>

          </div>
        </div>
      </main>
    </div>
  );
}
