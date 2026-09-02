import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAllResourcePages } from '@/lib/pseo';
import { Metadata } from 'next';
import type { ResourcePage } from '@/types/pseo';
import { PageHeader } from '@/components/page-header';
import { PageShell } from '@/components/page-shell';
import { EMPLOYEE_RESOURCES, EMPLOYER_RESOURCES } from '@/lib/nav-config';

export const metadata: Metadata = {
  title: 'Career Tools',
  description:
    'Complete suite of free tools, checklists, and guides for professionals and hiring teams building in the decentralized economy.',
};

const nicheLabels: Record<string, string> = {
  'solidity-developer': 'Solidity Developer',
  'web3-frontend-developer': 'Web3 Frontend Developer',
  'blockchain-engineer': 'Blockchain Engineer',
  'nft-developer': 'NFT Developer',
  'defi-developer': 'DeFi Developer',
  'solana-developer': 'Solana Developer',
  'gamefi-developer': 'GameFi Developer',
  'zk-engineer': 'ZK Engineer',
  'smart-contract-auditor': 'Smart Contract Auditor',
  'web3-product-manager': 'Web3 Product Manager',
  'web3-community-manager': 'Web3 Community Manager',
  'web3-marketer': 'Web3 Marketer',
  'web3-devrel': 'Web3 DevRel',
  'tokenomics-designer': 'Tokenomics Designer',
  'dao-contributor': 'DAO Contributor',
};

const contentTypeLabels: Record<string, string> = {
  ideas: 'Ideas',
  checklists: 'Checklist',
  mistakes: 'Mistakes',
  tools: 'Tools',
  guides: 'Guide',
};

function ToolCard({
  href,
  label,
  description,
}: {
  href: string;
  label: string;
  description?: string;
}) {
  return (
    <Link href={href} className="group block h-full">
      <Card className="h-full border-border/70 bg-card shadow-none hover:border-foreground/25 transition-colors p-4 flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors mb-1">
            {label}
          </h3>
          {description && (
            <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
          )}
        </div>
      </Card>
    </Link>
  );
}

function NicheGroup({ niche, pages }: { niche: string; pages: ResourcePage[] }) {
  const label =
    nicheLabels[niche] ?? niche.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  return (
    <Card className="border-border/70 bg-card shadow-none p-5 space-y-3">
      <div className="flex items-center justify-between border-b border-border/50 pb-2">
        <h3 className="font-semibold text-sm text-foreground">{label}</h3>
        <Badge variant="outline" className="text-[10px] font-mono">
          {pages.length}
        </Badge>
      </div>
      <ul className="space-y-1">
        {pages.map((page) => {
          const nicheLabel = nicheLabels[niche] ?? niche.replace(/-/g, ' ');
          const displayTitle = page.seo.title
            .replace(new RegExp(`\\s*(for\\s+)?${nicheLabel}s?\\s*$`, 'i'), '')
            .replace(/\s+$/, '');
          const typeLabel = contentTypeLabels[page.meta.contentType] ?? page.meta.contentType;
          return (
            <li key={page.seo.canonicalSlug}>
              <Link
                href={`/${page.seo.canonicalSlug}`}
                className="flex items-baseline gap-2 text-xs py-1 rounded hover:text-foreground text-muted-foreground transition-colors group"
              >
                <Badge
                  variant="outline"
                  className="text-[9px] uppercase font-mono tracking-wider shrink-0 font-normal px-1 py-0"
                >
                  {typeLabel}
                </Badge>
                <span className="group-hover:text-primary transition-colors leading-snug truncate">
                  {displayTitle || page.seo.title}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
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

  const sortedNiches = Object.entries(resourcesByNiche).sort(
    (a, b) => b[1].length - a[1].length
  );

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <main className="flex-1">
        <PageShell>
          <section className="text-center mb-8">
            <div className="site-container">
              <PageHeader
                title="Web3 Career Resources & Tools"
                description="Free calculators, interview kits, and role-specific guides for Web3 professionals and decentralized teams."
              />
            </div>
          </section>

          <div className="site-container space-y-12">
            {/* For Job Seekers */}
            <section>
              <div className="mb-4">
                <h2 className="text-base font-bold tracking-tight text-foreground">
                  Career Tools for Job Seekers
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Benchmark compensation, calculate freelance rates, build crypto resumes, and practice interview questions.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {EMPLOYEE_RESOURCES.map((tool) => (
                  <ToolCard key={tool.label} {...tool} />
                ))}
              </div>
            </section>

            {/* For Hiring Teams */}
            <section>
              <div className="mb-4">
                <h2 className="text-base font-bold tracking-tight text-foreground">
                  Templates for Hiring Teams
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Standardize recruitment, job descriptions, structured feedback, and onboarding.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {EMPLOYER_RESOURCES.map((tool) => (
                  <ToolCard key={tool.label} {...tool} />
                ))}
              </div>
            </section>

            {/* Role-Specific Resources */}
            {sortedNiches.length > 0 && (
              <section>
                <div className="mb-4">
                  <h2 className="text-base font-bold tracking-tight text-foreground">
                    Guides & Checklists by Role
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Architectural patterns, project ideas, and checklists categorized by engineering & product specialization.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {sortedNiches.map(([niche, pages]) => (
                    <NicheGroup key={niche} niche={niche} pages={pages} />
                  ))}
                </div>
              </section>
            )}

            {/* Call to Action */}
            <div className="p-6 rounded-xl border border-border/70 bg-card flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Ready to Join a Web3 Team?
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Explore verified engineering, product, and growth openings across top crypto protocols.
                </p>
              </div>
              <Link href="/" className="shrink-0">
                <Button size="sm">
                  Explore Jobs <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </PageShell>
      </main>
    </div>
  );
}
