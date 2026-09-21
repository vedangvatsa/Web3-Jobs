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
  title: 'Hashtag Web3 API Docs & Developer Portal',
  description: 'Hashtag Web3 developer portal: static data catalogs, OpenAPI, and agent discovery files.',
  alternates: { canonical: 'https://hashtagweb3.com/developers' },
  openGraph: {
    title: 'Hashtag Web3 Developer Portal',
    description: 'Static JSON catalogs, OpenAPI, and agent discovery for Hashtag Web3.',
    url: 'https://hashtagweb3.com/developers',
    images: [{ url: 'https://hashtagweb3.com/og-image.png', width: 1200, height: 630, alt: 'Hashtag Web3 Developer Portal' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hashtag Web3 Developer Portal',
    description: 'Static JSON catalogs, OpenAPI, and agent discovery for Hashtag Web3.',
    images: ['https://hashtagweb3.com/og-image.png'],
  },
};

const endpoints = [
  { label: 'Jobs catalog', path: '/data/jobs-runtime.json', detail: 'Full jobs snapshot (CDN).' },
  { label: 'News catalog', path: '/data/news-cache.json', detail: 'News headlines cache.' },
  { label: 'Events catalog', path: '/data/events-runtime.json', detail: 'Events snapshot.' },
  { label: 'Glossary catalog', path: '/data/glossary-runtime.json', detail: 'Glossary snapshot.' },
];

const files = [
  { label: 'OpenAPI 3.1', path: '/openapi.json', detail: 'Machine-readable API schema.' },
  { label: 'Agent manifest', path: '/.well-known/agents.json', detail: 'Discovery metadata for agents.' },
  { label: 'Agent Plugin', path: '/plugin.json', detail: 'Portable Agent Plugins 1.0 manifest.' },
  { label: 'Agent mode', path: '/?mode=agent', detail: 'Compact JSON capability index (static).' },
  { label: 'LLM context', path: '/llms.txt', detail: 'A concise platform index.' },
  { label: 'Source & Agent Config', path: 'https://github.com/vedangvatsa/Web3-Jobs', detail: 'Public AGENTS.md and skills.' },
];

const curlExample = [
  'curl -X GET \\',
  '  "https://hashtagweb3.com/data/jobs-runtime.json" \\',
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
        <div className="space-y-16 py-6 sm:space-y-20 sm:py-10">
          <EditorialPageHero
            eyebrow="Developer portal"
            title="Hashtag Web3 API & Developer Portal"
            description="Use the same jobs, news, events, and glossary data that powers Hashtag Web3. Start with a static catalog under /data/, inspect OpenAPI if you need a schema, and keep integrations free of hosted MCP or sandbox servers."
            image={communityPhotos[2].src}
            imageAlt={communityPhotos[2].alt}
          >
            <a href="/openapi.json" target="_blank" rel="noopener noreferrer"><Button size="lg">OpenAPI schema <ArrowRight className="ml-2 h-4 w-4" /></Button></a>
            <Link href="/docs"><Button size="lg" variant="outline">Read the docs</Button></Link>
          </EditorialPageHero>

          <section className="grid gap-5 sm:grid-cols-3">
            <Card className="border-primary/20 bg-primary/5 shadow-sm"><CardContent className="p-6"><Braces className="h-6 w-6 text-primary" /><h2 className="mt-5 font-semibold">Static by default</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Catalogs under /data/ are CDN files — no API key and no Serverless Function per request.</p></CardContent></Card>
            <Card className="shadow-sm"><CardContent className="p-6"><KeyRound className="h-6 w-6 text-primary" /><h2 className="mt-5 font-semibold">Agent-friendly</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Discovery files (llms.txt, agents.json, ?mode=agent) stay static so they do not raise hosting cost.</p></CardContent></Card>
            <Card className="shadow-sm"><CardContent className="p-6"><Code2 className="h-6 w-6 text-primary" /><h2 className="mt-5 font-semibold">Human site first</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">The website is built for people. Agent surfaces are free add-ons, not a second product stack.</p></CardContent></Card>
          </section>

          <section>
            <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Data catalogs</p><h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">Four useful starting points.</h2></div><p className="max-w-md text-sm leading-6 text-muted-foreground">Fetch JSON from the CDN and filter locally. Snapshots refresh on each site build.</p></div>
            <div className="grid gap-4 sm:grid-cols-2">{endpoints.map((endpoint) => <a href={endpoint.path} target="_blank" rel="noopener noreferrer" key={endpoint.path} className="group rounded-xl border border-border/70 bg-card p-5 shadow-sm transition-colors hover:border-primary/50"><div className="flex items-center justify-between"><h3 className="font-semibold">{endpoint.label}</h3><ArrowRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-1" /></div><code className="mt-3 block text-xs text-primary">{endpoint.path}</code><p className="mt-2 text-sm text-muted-foreground">{endpoint.detail}</p></a>)}</div>
          </section>

          <section className="grid gap-8 lg:grid-cols-[.85fr_1.15fr] lg:items-start">
            <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Quickstart</p><h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">One request, useful data.</h2><p className="mt-4 text-sm leading-7 text-muted-foreground">Start with standard HTTP against a static catalog. Filter in your client.</p><div className="mt-6 flex flex-wrap gap-2"><Badge variant="outline">JSON</Badge><Badge variant="outline">CDN</Badge><Badge variant="outline">OpenAPI 3.1</Badge></div></div>
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
