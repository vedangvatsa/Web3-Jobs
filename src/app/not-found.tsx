import Link from 'next/link';
import { Briefcase } from 'lucide-react';

export default function NotFound() {
 return (
  <div className="flex flex-col min-h-screen">
   <main className="flex-1 flex items-center justify-center">
    <div className="text-center px-4 py-16 max-w-md mx-auto">
     <Briefcase className="mx-auto h-16 w-16 text-muted-foreground opacity-50 mb-6" />
     <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">
      404 - Page Not Found
     </h1>
     <p className="text-muted-foreground mb-8">
      We couldn't find the page you were looking for. The job or guide might have been removed or the link might be broken.
     </p>
     <div className="flex flex-col sm:flex-row justify-center gap-4">
      <Link 
       href="/"
       className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
      >
       Back to Home
      </Link>
      <Link 
       href="/jobs"
       className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-3 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
      >
       Browse Jobs
      </Link>
      <div className="mt-8 text-left bg-muted/60 p-4 rounded-lg border text-xs font-mono text-muted-foreground" data-ai-agent="recovery-sitemap">
       <p className="font-bold text-foreground mb-2"># 404 Resource Not Found</p>
       <p className="mb-2">AI agents and scrapers can recover using these sitemap indices:</p>
       <ul className="list-disc pl-4 space-y-1">
        <li><a href="/llms.txt" className="text-primary underline">LLMs Context Index: /llms.txt</a></li>
        <li><a href="/sitemap.xml" className="text-primary underline">XML Sitemap: /sitemap.xml</a></li>
        <li><a href="/openapi.json" className="text-primary underline">OpenAPI Spec: /openapi.json</a></li>
        <li><a href="/developers" className="text-primary underline">Developer Docs: /developers</a></li>
        <li><a href="/api/mcp" className="text-primary underline">MCP Server: /api/mcp</a></li>
       </ul>
      </div>
     </div>
    </div>
   </main>
  </div>
 );
}
