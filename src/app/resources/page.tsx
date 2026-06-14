
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAllResourcePages } from '@/lib/pseo';
import { Metadata } from 'next';
import type { ResourcePage } from '@/types/pseo';
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: 'Free Web3 Career Tools and Resources',
  description: 'A complete suite of free tools and resources for professionals and companies building in the decentralized economy.',
};

const employeeResources = [
  { href:"/interview-questions", label:"Interview Questions", description:"Practice with 200+ Web3 interview questions across technical and non-technical roles." },
  { href:"/web3-career-quiz", label:"Archetype Assessment", description:"Discover your Web3 personality and the career paths that match." },
  { href:"/salary-calculator", label:"Salary Calculator", description:"Estimate your potential salary in the Web3 industry." },
  { href:"/freelance-rates-by-industry", label:"Freelance Rates by Industry", description:"Benchmark freelance hourly and project rates across industries and roles." },
  { href:"/resume-builder", label:"Resume Builder", description:"Craft a crypto-native resume that gets noticed by recruiters." },
  { href:"/invoice-generator", label:"Invoice Generator", description:"A free and simple invoice generator for Web3 freelancers." },
  { href:"/digital-nomad-visas", label:"Digital Nomad Visas", description:"A searchable list of visas for working remotely around the world." },
  { href:"/remote-work-checklist", label:"Remote Checklist", description:"Optimize your remote work setup for productivity and well-being." },
];

const employerResources = [
  { href:"/jd-builder", label:"JD Builder", description:"Craft the perfect job description to attract top Web3 talent." },
  { href:"/offer-letter-customizer", label:"Offer Letter Customizer", description:"Generate professional, customizable offer letters for new hires." },
  { href:"/employee-onboarding-checklist", label:"Onboarding Checklist", description:"Run a structured onboarding process for new Web3 hires." },
  { href:"/interview-feedback-template", label:"Interview Feedback", description:"Standardize your hiring process with structured feedback." },
  { href:"/employee-exit-survey", label:"Employee Exit Survey", description:"Gather valuable insights from departing team members." },
  { href:"/employee-milestones-tracker", label:"Milestones Tracker", description:"Create structured 30-60-90 day plans for new employees." },
  { href:"/employee-engagement-survey", label:"Engagement Survey", description:"Quickly gauge team morale and satisfaction." },
  { href:"/work-life-balance-survey", label:"Work-Life Balance Survey", description:"Assess team workload and well-being to prevent burnout." },
  { href:"/company-culture-guide", label:"Company Culture Guide", description:"Define and document your company's values and ways of working." },
];

// Niche display names
const nicheLabels: Record<string, string> = {
  'solidity-developer':      'Solidity Developer',
  'web3-frontend-developer':   'Web3 Frontend Developer',
  'blockchain-engineer':     'Blockchain Engineer',
  'nft-developer':        'NFT Developer',
  'defi-developer':        'DeFi Developer',
  'solana-developer':       'Solana Developer',
  'gamefi-developer':       'GameFi Developer',
  'zk-engineer':         'ZK Engineer',
  'smart-contract-auditor':    'Smart Contract Auditor',
  'web3-product-manager':     'Web3 Product Manager',
  'web3-community-manager':    'Web3 Community Manager',
  'web3-marketer':        'Web3 Marketer',
  'web3-devrel':         'Web3 DevRel',
  'tokenomics-designer':     'Tokenomics Designer',
  'dao-contributor':       'DAO Contributor',
};

const contentTypeLabels: Record<string, string> = {
  ideas: 'Ideas',
  checklists: 'Checklist',
  mistakes: 'Mistakes',
  tools: 'Tools',
  guides: 'Guide',
};

function ToolCard({ href, label, description }: { href: string; label: string; description: string }) {
  return (
    <Link href={href}>
      <Card className="h-full group hover:border-primary hover:shadow-sm transition-all">
        <CardContent className="p-4">
          <h3 className="font-semibold text-sm group-hover:text-foreground transition-colors mb-1">{label}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

function NicheGroup({ niche, pages }: { niche: string; pages: ResourcePage[] }) {
  const label = nicheLabels[niche] ?? niche.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  return (
    <Card className="h-full hover:border-primary hover:shadow-sm transition-all">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">{label}</h3>
          <Badge variant="secondary">{pages.length}</Badge>
        </div>
        <ul className="space-y-1">
          {pages.map(page => {
            const nicheLabel = nicheLabels[niche] ?? niche.replace(/-/g, ' ');
            const displayTitle = page.seo.title
              .replace(new RegExp(`\\s*(for\\s+)?${nicheLabel}s?\\s*$`, 'i'), '')
              .replace(/\s+$/, '');
            const typeLabel = contentTypeLabels[page.meta.contentType] ?? page.meta.contentType;
            return (
              <li key={page.seo.canonicalSlug}>
                <Link
                  href={`/${page.seo.canonicalSlug}`}
                  className="flex items-baseline gap-2 text-sm py-1.5 rounded hover:bg-muted/60 px-2 -mx-1 transition-colors group"
                >
                  <Badge variant="outline" className="text-[10px] uppercase tracking-wider shrink-0 font-normal">
                    {typeLabel}
                  </Badge>
                  <span className="text-muted-foreground group-hover:text-foreground transition-colors leading-snug">
                    {displayTitle || page.seo.title}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}

export default function ResourcesPage() {
  const allResources = getAllResourcePages();

  const resourcesByNiche = allResources.reduce((acc, resource) => {
    const niche = resource.meta.niche;
    if (!acc[niche]) acc[niche] = [];
    acc[niche].push(resource);
    return acc;
  }, {} as Record<string, ResourcePage[]>);

  const sortedNiches = Object.entries(resourcesByNiche).sort((a, b) => b[1].length - a[1].length);

  return (
    <div className="flex flex-col min-h-screen">
            <main className="flex-1">

        {/* Hero */}
        <section className="border-b">
          <div className="container mx-auto px-4 page-section max-w-6xl">
            <div className="max-w-3xl">
              <PageHeader title="Web3 Career Resources" />
              <p className="text-xl text-muted-foreground leading-relaxed">
                Free tools and guides for professionals and hiring teams building in the decentralized economy.
              </p>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 page-section max-w-6xl space-y-16">

          {/* Role-specific resources */}
          {sortedNiches.length > 0 && (
            <section>
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2">By Role</h2>
                <p className="text-muted-foreground">Guides, checklists, and tools for specific Web3 roles.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedNiches.map(([niche, pages]) => (
                  <NicheGroup key={niche} niche={niche} pages={pages} />
                ))}
              </div>
            </section>
          )}

          {/* For Job Seekers */}
          <section>
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">For Job Seekers</h2>
              <p className="text-muted-foreground">Tools to find, land, and thrive in a Web3 role.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {employeeResources.map(tool => <ToolCard key={tool.label} {...tool} />)}
            </div>
          </section>

          {/* For Hiring Teams */}
          <section>
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">For Hiring Teams</h2>
              <p className="text-muted-foreground">Templates and tools to hire, onboard, and retain talent.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {employerResources.map(tool => <ToolCard key={tool.label} {...tool} />)}
            </div>
          </section>

        </div>

        {/* CTA */}
        <section className="border-t">
          <div className="container mx-auto px-4 page-section max-w-6xl">
            <Card className="bg-muted/30 border shadow-none">
              <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                <div>
                  <h3 className="text-lg font-bold">Looking for a Web3 Job?</h3>
                  <p className="text-sm text-muted-foreground mt-1">Now that you have the resources, find the perfect role on the #1 Web3 job board.</p>
                </div>
                <Link href="/jobs" className="shrink-0">
                  <Button size="lg">
                    Explore Jobs <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>

      </main>
    </div>
  );
}
