import Link from 'next/link';
import type { ResourcePage, ToolItem } from '@/types/pseo';
import {
  ArrowLeft,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChecklistContent } from '@/components/pseo/checklist-content';

interface ResourcePageViewProps {
  page: ResourcePage;
  nicheResources?: ResourcePage[];
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function titleToSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

const TYPE_META: Record<string, { label: string }> = {
  ideas: { label: 'Project Ideas' },
  checklists: { label: 'Checklist' },
  mistakes: { label: 'Common Mistakes' },
  tools: { label: 'Tools Directory' },
  guides: { label: 'Guide' },
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

export function ResourcePageView({ page, nicheResources }: ResourcePageViewProps) {
  const contentType = page.meta.contentType;
  const typeMeta = TYPE_META[contentType] ?? TYPE_META.guides;
  const nicheLabel =
    nicheLabels[page.meta.niche] ??
    page.meta.niche.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  const totalItems =
    page.content.sections?.reduce((acc, s) => acc + (s.items?.length || 0), 0) || 0;

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <main className="flex-1">
        {/* Clean Editorial Header */}
        <section className="border-b border-border bg-card/40">
          <div className="container mx-auto px-4 py-10 md:py-14 max-w-5xl">
            {/* Breadcrumb */}
            <nav className="mb-4 text-xs font-mono text-muted-foreground flex items-center gap-1.5" aria-label="Breadcrumb">
              <Link href="/resources" className="hover:text-foreground transition-colors">
                Resources
              </Link>
              <span>/</span>
              <span className="text-foreground">{typeMeta.label}</span>
            </nav>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground leading-[1.2] mb-3">
              {page.seo.title}
            </h1>

            {page.content.intro && (
              <p className="text-base text-muted-foreground leading-relaxed max-w-3xl mb-6">
                {page.content.intro}
              </p>
            )}

            {/* Metadata Pills */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <Badge variant="secondary" className="font-normal px-2.5 py-1">
                {nicheLabel}
              </Badge>
              {totalItems > 0 && (
                <Badge variant="outline" className="font-mono text-muted-foreground px-2.5 py-1">
                  {totalItems} items
                </Badge>
              )}
              <span className="text-xs text-muted-foreground font-mono ml-1">
                Updated {formatDate(page.meta.generatedAt)}
              </span>
            </div>
          </div>
        </section>

        {/* Content Body */}
        <article className="container mx-auto px-4 py-10 md:py-12 max-w-5xl">
          {contentType === 'ideas' && <IdeasContent sections={page.content.sections as any} />}
          {contentType === 'checklists' && (
            <ChecklistContent
              sections={page.content.sections as any}
              slug={page.seo.canonicalSlug}
            />
          )}
          {contentType === 'mistakes' && (
            <MistakesContent sections={page.content.sections as any} />
          )}
          {contentType === 'tools' && <ToolsContent sections={page.content.sections as any} />}

          {!['ideas', 'checklists', 'mistakes', 'tools'].includes(contentType) && (
            <DefaultContent sections={page.content.sections} />
          )}

          {/* Pro Tips Section */}
          {(page.content.proTips?.length ?? 0) > 0 && (
            <section className="mt-14 pt-8 border-t border-border">
              <h2 className="text-lg font-bold tracking-tight text-foreground mb-4">
                Key Recommendations
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {page.content.proTips?.map((tip, idx) => {
                  const tipText = typeof tip === 'string' ? tip : tip.tip;
                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-lg bg-muted/40 border border-border text-sm leading-relaxed text-muted-foreground"
                    >
                      <p className="text-foreground">{tipText}</p>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Related Guides from Same Niche */}
          {nicheResources && nicheResources.length > 0 && (
            <section className="mt-12 pt-8 border-t border-border">
              <h3 className="text-base font-semibold text-foreground mb-4">
                More Guides for {nicheLabel}s
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {nicheResources.map((r) => {
                  const rMeta = TYPE_META[r.meta.contentType] ?? TYPE_META.guides;
                  return (
                    <Link
                      key={r.seo.canonicalSlug}
                      href={`/${r.seo.canonicalSlug}`}
                      className="flex items-center justify-between p-3.5 border border-border rounded-lg bg-card hover:border-primary/50 hover:bg-muted/30 transition-colors group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Badge variant="outline" className="text-[10px] uppercase tracking-wider shrink-0 font-mono">
                          {rMeta.label}
                        </Badge>
                        <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                          {r.seo.title}
                        </span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground/40 ml-2 shrink-0 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* Related Reading */}
          {(page.content.relatedResources?.length ?? 0) > 0 && (
            <section className="mt-8 pt-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 font-mono">
                Related Reading
              </h3>
              <ul className="space-y-1.5 text-sm">
                {page.content.relatedResources.map((resource, idx) => {
                  const label =
                    typeof resource === 'object' ? (resource as any).title : resource;
                  const slug =
                    typeof resource === 'object'
                      ? (resource as any).slug
                      : titleToSlug(resource);
                  return (
                    <li key={idx}>
                      <Link
                        href={`/${slug}`}
                        className="text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
                      >
                        {label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {/* Clean CTA Card */}
          <div className="mt-14 p-6 sm:p-8 rounded-xl border border-border bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-foreground">
                Looking for Web3 Opportunities?
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Explore curated, high-impact roles across top blockchain protocols and Web3 startups.
              </p>
            </div>
            <Link href="/jobs" className="shrink-0">
              <Button size="default" className="font-medium">
                Explore Jobs
              </Button>
            </Link>
          </div>

          {/* Back Navigation */}
          <div className="mt-10 pt-6 border-t border-border">
            <Link
              href="/resources"
              className="text-xs font-mono text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="h-3 w-3" /> Back to All Resources
            </Link>
          </div>
        </article>
      </main>
    </div>
  );
}

// ─── Ideas Content ────────────────────────────────────────────────────────────
interface ActualIdeaItem {
  title: string;
  description: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  timeToComplete?: string;
  timeEstimate?: string;
  estimatedTime?: string;
  skills?: string[];
}

function IdeasContent({
  sections,
}: {
  sections: Array<{ heading: string; description: string; items: ActualIdeaItem[] }>;
}) {
  return (
    <div className="space-y-12">
      {sections.map((section, idx) => (
        <section key={idx}>
          <h2 className="text-lg font-bold tracking-tight text-foreground mb-1">
            {section.heading}
          </h2>
          {section.description && (
            <p className="text-sm text-muted-foreground mb-4">{section.description}</p>
          )}

          <div className="space-y-3">
            {section.items.map((item, itemIdx) => {
              const timeText =
                item.timeToComplete || item.timeEstimate || item.estimatedTime || '';
              return (
                <div
                  key={itemIdx}
                  className="p-4 rounded-lg border border-border bg-card hover:border-border/80 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <h3 className="font-semibold text-sm text-foreground">
                      {item.title || (item as any).mistake || ''}
                    </h3>
                    {item.difficulty && (
                      <Badge variant="outline" className="text-[10px] font-mono capitalize shrink-0">
                        {item.difficulty}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                    {item.description}
                  </p>
                  {(timeText || (item.skills && item.skills.length > 0)) && (
                    <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground font-mono pt-1">
                      {timeText && <span>{timeText}</span>}
                      {item.skills?.map((skill, i) => (
                        <Badge key={i} variant="secondary" className="text-[10px] font-normal">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

// ─── Mistakes Content ─────────────────────────────────────────────────────────
interface ActualMistakeItem {
  title: string;
  description?: string;
  mistake?: string;
  impact?: string;
  consequence?: string;
  prevention?: string;
  solution?: string;
  severity?: string;
}

function MistakesContent({
  sections,
}: {
  sections: Array<{ heading: string; description: string; items: ActualMistakeItem[] }>;
}) {
  return (
    <div className="space-y-12">
      {sections.map((section, idx) => (
        <section key={idx}>
          <h2 className="text-lg font-bold tracking-tight text-foreground mb-1">
            {section.heading}
          </h2>
          {section.description && (
            <p className="text-sm text-muted-foreground mb-4">{section.description}</p>
          )}

          <div className="space-y-3">
            {section.items.map((item, itemIdx) => {
              const mistakeText = item.description || item.mistake || '';
              const consequenceText = item.impact || item.consequence || '';
              const solutionText = item.prevention || item.solution || '';

              return (
                <div
                  key={itemIdx}
                  className="p-4 rounded-lg border border-border bg-card space-y-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold text-sm text-foreground">
                      {item.title || item.mistake || ''}
                    </h3>
                    {item.severity && (
                      <Badge variant="secondary" className="text-[10px] uppercase font-mono">
                        {item.severity}
                      </Badge>
                    )}
                  </div>
                  {mistakeText && (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {mistakeText}
                    </p>
                  )}
                  {(consequenceText || solutionText) && (
                    <div className="pt-2 border-t border-border/50 grid sm:grid-cols-2 gap-3 text-xs">
                      {consequenceText && (
                        <div>
                          <span className="font-semibold text-foreground block mb-0.5">Impact:</span>
                          <span className="text-muted-foreground">{consequenceText}</span>
                        </div>
                      )}
                      {solutionText && (
                        <div>
                          <span className="font-semibold text-foreground block mb-0.5">Prevention:</span>
                          <span className="text-muted-foreground">{solutionText}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

// ─── Tools Content ────────────────────────────────────────────────────────────
function ToolsContent({
  sections,
}: {
  sections: Array<{ heading: string; description: string; items: ToolItem[] }>;
}) {
  return (
    <div className="space-y-12">
      {sections.map((section, idx) => (
        <section key={idx}>
          <h2 className="text-lg font-bold tracking-tight text-foreground mb-1">
            {section.heading}
          </h2>
          {section.description && (
            <p className="text-sm text-muted-foreground mb-4">{section.description}</p>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            {section.items.map((item, itemIdx) => (
              <a
                key={itemIdx}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 border border-border rounded-lg bg-card hover:border-primary/50 hover:bg-muted/20 transition-colors group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                      {item.name}
                      <ExternalLink className="h-3 w-3 text-muted-foreground/40 group-hover:text-primary/70" />
                    </h3>
                    {item.pricing && (
                      <Badge variant="outline" className="text-[10px] uppercase font-mono">
                        {item.pricing}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

// ─── Default Content ──────────────────────────────────────────────────────────
function DefaultContent({
  sections,
}: {
  sections?: Array<{ heading: string; description: string; items: any[] }>;
}) {
  if (!sections) return null;
  return (
    <div className="space-y-12">
      {sections.map((section, idx) => (
        <section key={idx}>
          <h2 className="text-lg font-bold tracking-tight text-foreground mb-1">
            {section.heading}
          </h2>
          {section.description && (
            <p className="text-sm text-muted-foreground mb-4">{section.description}</p>
          )}

          <div className="space-y-3">
            {section.items?.map((item, itemIdx) => (
              <div key={itemIdx} className="p-4 border border-border rounded-lg bg-card">
                <h3 className="font-semibold text-sm text-foreground mb-1">
                  {item.title || item.name || item.skill}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
