import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Braces, Check, Code2, KeyRound, Terminal } from 'lucide-react';
import { EditorialPageHero } from '@/components/editorial-page-hero';
import { PageShell } from '@/components/page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { communityPhotos } from '@/lib/community-data';

export const revalidate = 86400;

export const metadata: Metadata = {
  title: 'API Docs & Developer Portal',
  description: 'Hashtag Web3 developer portal: REST API reference, OpenAPI 3.1 specs, MCP servers, SDKs, CLI, and agent integration guides.',
  alternates: { canonical: 'https://hashtagweb3.com/developers' },
  openGraph: {
    title: 'Hashtag Web3 Developer Portal',
    description: 'REST APIs, feeds, OpenAPI schemas, and agent integration tools for Hashtag Web3.',
    url: 'https://hashtagweb3.com/developers',
    images: [{ url: 'https://hashtagweb3.com/api/og?type=default&title=Developer%20Portal', width: 1200, height: 630, alt: 'Hashtag Web3 Developer Portal' }],
  },
};

const endpoints = [
  { label: 'Jobs', path: '/api/jobs', detail: 'Search verified Web3 roles.' },
  { label: 'News', path: '/api/news', detail: 'Read the current news feed.' },
  { label: 'Events', path: '/api/events', detail: 'Browse global Web3 events.' },
  { label: 'Glossary', path: '/api/glossary', detail: 'Query technical definitions.' },
];

const files = [
  { label: 'OpenAPI 3.1', path: '/openapi.json', detail: 'Machine-readable API schema.' },
  { label: 'Agent manifest', path: '/.well-known/agents.json', detail: 'Discovery metadata for agents.' },
  { label: 'LLM context', path: '/llms.txt', detail: 'A concise platform index.' },
  { label: 'Auth guide', path: '/auth.md', detail: 'Registration and bearer tokens.' },
];

const curlExample = [
  'curl -X GET \\',
  '  "https://hashtagweb3.com/api/jobs?search=Solidity&limit=5" \\',
  '  -H "Accept: application/json"',
].join('\n');

export default function DevelopersPage() {
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: 'Hashtag Web3 API Documentation & Developer Portal',
    description: 'Guide and reference for integrating with Hashtag Web3 REST APIs, feeds, and agent surfaces.',
    url: 'https://hashtagweb3.com/developers',
    author: { '@type': 'Organization', name: 'Hashtag Web3', url: 'https://hashtagweb3.com' },
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }} />
      <PageShell>
        <div className="site-container space-y-16 py-6 sm:space-y-20 sm:py-10">
          <EditorialPageHero
            eyebrow="Developer portal"
            title="Build on the public layer."
            description="Use the same jobs, news, events, and glossary data that powers Hashtag Web3. Start with a public endpoint, inspect the schema, and move to authenticated surfaces only when you need them."
            image={communityPhotos[2].src}
            imageAlt={communityPhotos[2].alt}
          >
            <a href="/openapi.json" target="_blank" rel="noopener noreferrer"><Button size="lg">OpenAPI schema <ArrowRight className="ml-2 h-4 w-4" /></Button></a>
            <Link href="/docs"><Button size="lg" variant="outline">Read the docs</Button></Link>
          </EditorialPageHero>

          <section className="grid gap-5 sm:grid-cols-3">
            <Card className="border-primary/20 bg-primary/5 shadow-sm"><CardContent className="p-6"><Braces className="h-6 w-6 text-primary" /><h2 className="mt-5 font-semibold">Public by default</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Read endpoints require no key and support CORS for browser integrations.</p></CardContent></Card>
            <Card className="shadow-sm"><CardContent className="p-6"><KeyRound className="h-6 w-6 text-primary" /><h2 className="mt-5 font-semibold">Agent-ready</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Use discovery files, MCP, and the auth guide to make integrations legible to tools.</p></CardContent></Card>
            <Card className="shadow-sm"><CardContent className="p-6"><Code2 className="h-6 w-6 text-primary" /><h2 className="mt-5 font-semibold">Stable surfaces</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Canonical JSON APIs and feed endpoints are designed for practical consumption.</p></CardContent></Card>
          </section>

          <section>
            <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">REST API</p><h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">Four useful starting points.</h2></div><p className="max-w-md text-sm leading-6 text-muted-foreground">All standard read endpoints are unauthenticated. Add query parameters for search, limits, offsets, and filters.</p></div>
            <div className="grid gap-4 sm:grid-cols-2">{endpoints.map((endpoint) => <a href={endpoint.path} target="_blank" rel="noopener noreferrer" key={endpoint.path} className="group rounded-xl border border-border/70 bg-card p-5 shadow-sm transition-colors hover:border-primary/50"><div className="flex items-center justify-between"><h3 className="font-semibold">{endpoint.label}</h3><ArrowRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-1" /></div><code className="mt-3 block text-xs text-primary">{endpoint.path}</code><p className="mt-2 text-sm text-muted-foreground">{endpoint.detail}</p></a>)}</div>
          </section>

          <section className="grid gap-8 lg:grid-cols-[.85fr_1.15fr] lg:items-start">
            <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Quickstart</p><h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">One request, useful data.</h2><p className="mt-4 text-sm leading-7 text-muted-foreground">Start with standard HTTP. The API returns JSON and includes pagination metadata for production clients.</p><div className="mt-6 flex flex-wrap gap-2"><Badge variant="outline">JSON</Badge><Badge variant="outline">CORS</Badge><Badge variant="outline">OpenAPI 3.1</Badge><Badge variant="outline">MCP</Badge></div></div>
            <Card className="overflow-hidden border-zinc-800 bg-zinc-950 text-zinc-100 shadow-sm"><CardContent className="p-0"><div className="flex items-center gap-2 border-b border-zinc-800 px-5 py-3 text-xs text-zinc-400"><Terminal className="h-4 w-4" /> cURL</div><pre className="overflow-x-auto p-5 text-xs leading-7 sm:text-sm"><code>{curlExample}</code></pre></CardContent></Card>
          </section>

          <section className="grid gap-8 lg:grid-cols-2">
            <div className="rounded-2xl bg-muted/50 p-6 sm:p-8"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Machine-readable files</p><h2 className="mt-3 text-2xl font-bold tracking-tight">Discovery without the scavenger hunt.</h2><div className="mt-6 space-y-3">{files.map((file) => <a key={file.path} href={file.path} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-lg border border-border/70 bg-background p-3 hover:border-primary"><span><span className="block text-sm font-semibold">{file.label}</span><code className="text-xs text-primary">{file.path}</code></span><ArrowRight className="h-4 w-4 text-primary" /></a>)}</div></div>
            <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm sm:p-8"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Authentication</p><h2 className="mt-3 text-2xl font-bold tracking-tight">Read openly. Authenticate when needed.</h2><p className="mt-4 text-sm leading-7 text-muted-foreground">Public read endpoints are free to query. Agents and partners that need elevated limits or write operations can use the documented registration and bearer-token flow.</p><ul className="mt-6 space-y-3 text-sm text-muted-foreground">{['Public read endpoints need no key.', 'Agent registration returns a scoped token.', 'CORS is enabled for browser integrations.'].map((item) => <li key={item} className="flex gap-3"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{item}</li>)}</ul><Link href="/auth.md" className="mt-6 inline-flex items-center text-sm font-semibold text-primary hover:underline">Read auth.md <ArrowRight className="ml-1 h-4 w-4" /></Link></div>
          </section>
        </div>
      </PageShell>
    </main>
  );
}
