'use client';

import { Header } from '@/components/header';
import Link from 'next/link';
import type { ResourcePage, ToolItem } from '@/types/pseo';
import { useState, useEffect } from 'react';
import {
  Lightbulb,
  CheckSquare,
  AlertTriangle,
  Wrench,
  BookOpen,
  ArrowLeft,
  ExternalLink,
  Clock,
  Zap,
  Shield,
  ChevronRight,
} from 'lucide-react';

interface ResourcePageViewProps {
 page: ResourcePage;
 nicheResources?: ResourcePage[];
}

// Simple date formatter
function formatDate(dateString: string) {
 return new Date(dateString).toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
 });
}

// Convert resource title to slug
function titleToSlug(title: string): string {
 return title
  .toLowerCase()
  .replace(/[^a-z0-9\s-]/g, '')
  .replace(/\s+/g, '-')
  .replace(/-+/g, '-')
  .trim();
}

// Content type metadata
const TYPE_META: Record<string, { label: string; icon: React.ElementType; gradient: string; badge: string }> = {
  ideas:     { label: 'Project Ideas',   icon: Lightbulb,    gradient: 'from-violet-600 to-indigo-600',  badge: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300' },
  checklists:  { label: 'Checklist',     icon: CheckSquare,   gradient: 'from-emerald-600 to-teal-600',  badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
  mistakes:   { label: 'Common Mistakes',  icon: AlertTriangle,  gradient: 'from-amber-600 to-orange-600',  badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  tools:     { label: 'Tools',       icon: Wrench,      gradient: 'from-sky-600 to-blue-600',    badge: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300' },
  guides:    { label: 'Guide',       icon: BookOpen,     gradient: 'from-rose-600 to-pink-600',   badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300' },
};

// Niche display names
const nicheLabels: Record<string, string> = {
  'solidity-developer':    'Solidity Developer',
  'web3-frontend-developer': 'Web3 Frontend Developer',
  'blockchain-engineer':   'Blockchain Engineer',
  'nft-developer':      'NFT Developer',
  'defi-developer':      'DeFi Developer',
  'solana-developer':     'Solana Developer',
  'gamefi-developer':     'GameFi Developer',
  'zk-engineer':       'ZK Engineer',
  'smart-contract-auditor':  'Smart Contract Auditor',
  'web3-product-manager':   'Web3 Product Manager',
  'web3-community-manager':  'Web3 Community Manager',
  'web3-marketer':      'Web3 Marketer',
  'web3-devrel':       'Web3 DevRel',
  'tokenomics-designer':   'Tokenomics Designer',
  'dao-contributor':     'DAO Contributor',
};

export function ResourcePageView({ page, nicheResources }: ResourcePageViewProps) {
 const contentType = page.meta.contentType;
 const typeMeta = TYPE_META[contentType] ?? TYPE_META.guides;
 const TypeIcon = typeMeta.icon;
 const nicheLabel = nicheLabels[page.meta.niche] ?? page.meta.niche.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

 // Count total items across all sections
 const totalItems = page.content.sections?.reduce((acc, s) => acc + (s.items?.length || 0), 0) || 0;

 return (
  <div className="flex flex-col min-h-screen bg-background">
   <Header />
   <main className="flex-1">
    {/* Hero banner with gradient */}
    <div className={`bg-gradient-to-br ${typeMeta.gradient} text-white`}>
     <div className="container mx-auto px-4 py-12 md:py-16 max-w-4xl">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-white/70">
       <Link href="/resources" className="hover:text-white transition-colors inline-flex items-center gap-1">
        <ArrowLeft className="h-3.5 w-3.5" />
        Resources
       </Link>
       <span className="mx-2">/</span>
       <span className="text-white/90 capitalize">{typeMeta.label}</span>
      </nav>

      <div className="flex items-start gap-4 mb-6">
       <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl shrink-0">
        <TypeIcon className="h-6 w-6" />
       </div>
       <div>
        <h1 className="text-2xl md:text-3xl font-bold leading-tight mb-3">
         {page.seo.title}
        </h1>
        <p className="text-white/85 leading-relaxed max-w-2xl">
         {page.content.intro}
        </p>
       </div>
      </div>

      <div className="flex flex-wrap gap-3 text-sm">
       <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm px-3 py-1 rounded-full">
        <Zap className="h-3.5 w-3.5" /> {nicheLabel}
       </span>
       {totalItems > 0 && (
        <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm px-3 py-1 rounded-full">
         {totalItems} items
        </span>
       )}
       <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm px-3 py-1 rounded-full">
        <Clock className="h-3.5 w-3.5" /> Updated {formatDate(page.meta.generatedAt)}
       </span>
      </div>
     </div>
    </div>

    <article className="container mx-auto px-4 py-10 max-w-4xl">
     {/* Content based on type */}
     {contentType === 'ideas' && <IdeasContent sections={page.content.sections as any} />}
     {contentType === 'checklists' && <ChecklistContent sections={page.content.sections as any} slug={page.seo.canonicalSlug} />}
     {contentType === 'mistakes' && <MistakesContent sections={page.content.sections as any} />}
     {contentType === 'tools' && <ToolsContent sections={page.content.sections as any} />}
     
     {/* Default fallback for other types */}
     {!['ideas', 'checklists', 'mistakes', 'tools'].includes(contentType) && (
      <DefaultContent sections={page.content.sections} />
     )}

     {/* Pro Tips */}
     {(page.content.proTips?.length ?? 0) > 0 && (
      <section className="mt-16 pt-8 border-t">
       <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <Zap className="h-5 w-5 text-amber-500" />
        Pro Tips
       </h2>
       <div className="grid gap-3 sm:grid-cols-2">
        {page.content.proTips?.map((tip, idx) => {
         const tipText = typeof tip === 'string' ? tip : tip.tip;
         return (
          <div key={idx} className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/30">
           <p className="text-sm text-foreground leading-relaxed">{tipText}</p>
          </div>
         );
        })}
       </div>
      </section>
     )}

     {/* Conclusion */}
     {page.content.conclusion && (
      <section className="mt-12 p-6 bg-muted/40 rounded-xl border">
       <h3 className="font-semibold mb-2">Summary</h3>
       <p className="text-muted-foreground leading-relaxed">{page.content.conclusion}</p>
      </section>
     )}

     {/* Related resources from same niche */}
     {nicheResources && nicheResources.length > 0 && (
      <section className="mt-12 pt-8 border-t">
       <h3 className="font-bold mb-4">
        More for {nicheLabel}
       </h3>
       <div className="grid gap-3 sm:grid-cols-2">
        {nicheResources.map((r) => {
         const rMeta = TYPE_META[r.meta.contentType] ?? TYPE_META.guides;
         const RIcon = rMeta.icon;
         return (
          <Link
           key={r.seo.canonicalSlug}
           href={`/${r.seo.canonicalSlug}`}
           className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/40 transition-colors group"
          >
           <span className={`inline-flex p-1.5 rounded-md ${rMeta.badge}`}>
            <RIcon className="h-3.5 w-3.5" />
           </span>
           <span className="text-sm font-medium group-hover:text-primary transition-colors">{r.seo.title}</span>
           <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 ml-auto shrink-0" />
          </Link>
         );
        })}
       </div>
      </section>
     )}

     {/* Related reading */}
     {(page.content.relatedResources?.length ?? 0) > 0 && (
      <section className="mt-8">
       <h3 className="text-sm font-medium text-muted-foreground mb-4">Related reading</h3>
       <ul className="space-y-2">
        {page.content.relatedResources.map((resource, idx) => {
         const label = typeof resource === 'object' ? (resource as any).title : resource;
         const slug = typeof resource === 'object' ? (resource as any).slug : titleToSlug(resource);
         return (
          <li key={idx} className="text-sm">
           <span className="text-muted-foreground">→</span>{' '}
           <Link href={`/${slug}`} className="text-foreground hover:text-primary hover:underline">
            {label}
           </Link>
          </li>
         );
        })}
       </ul>
      </section>
     )}

     {/* CTA */}
     <div className="mt-16 p-8 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border text-center">
      <h3 className="text-lg font-bold mb-2">Ready to build your Web3 career?</h3>
      <p className="text-sm text-muted-foreground mb-4">Browse hundreds of open roles across the decentralized ecosystem.</p>
      <Link href="/jobs" className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium">
       Explore Jobs <ChevronRight className="h-4 w-4" />
      </Link>
     </div>

     {/* Back link */}
     <div className="mt-12 pt-8 border-t">
      <Link href="/resources" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
       <ArrowLeft className="h-3.5 w-3.5" />
       Back to resources
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
 potential?: string;
 skills?: string[];
 outcomes?: string[];
}

const DIFFICULTY_STYLES = {
 beginner:     'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
 intermediate:  'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
 advanced:     'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
};

function IdeasContent({ sections }: { sections: Array<{ heading: string; description: string; items: ActualIdeaItem[] }> }) {
 return (
  <div className="space-y-14">
   {sections.map((section, idx) => (
    <section key={idx}>
     <h2 className="text-xl font-bold mb-2">{section.heading}</h2>
     <p className="text-muted-foreground mb-6 text-sm">{section.description}</p>
     
     <div className="space-y-3">
      {section.items.map((item, itemIdx) => {
       const timeText = item.timeToComplete || item.timeEstimate || item.estimatedTime || '';
       return (
        <div key={itemIdx} className="p-4 border rounded-lg hover:border-primary/30 hover:bg-muted/20 transition-all duration-200">
         <div className="flex items-start justify-between gap-4 mb-2">
          <h3 className="font-semibold text-sm">{item.title}</h3>
          <div className="flex gap-2 shrink-0">
           {item.difficulty && (
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${DIFFICULTY_STYLES[item.difficulty] || ''}`}>
             {item.difficulty}
            </span>
           )}
          </div>
         </div>
         <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
         {(timeText || (item.skills && item.skills.length > 0)) && (
          <div className="mt-3 flex items-center gap-3 flex-wrap">
           {timeText && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
             <Clock className="h-3 w-3" /> {timeText}
            </span>
           )}
           {item.skills && item.skills.map((skill, i) => (
            <span key={i} className="text-[10px] px-2 py-0.5 bg-muted rounded-full font-medium">{skill}</span>
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

// ─── Checklist Content ────────────────────────────────────────────────────────
interface ActualChecklistItem {
 title?: string;
 task?: string;
 text?: string;
 description?: string;
 priority: 'critical' | 'important' | 'nice-to-have';
 category?: string;
}

const PRIORITY_STYLES = {
 critical:     { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', border: 'border-l-red-500' },
 important:    { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300', border: 'border-l-amber-500' },
 'nice-to-have':  { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-300', border: 'border-l-gray-400' },
};

function ChecklistContent({ sections, slug }: { sections: Array<{ heading: string; description: string; items: ActualChecklistItem[] }>; slug: string }) {
 const [checked, setChecked] = useState<Set<string>>(new Set());

 useEffect(() => {
  const saved = localStorage.getItem(`checklist-${slug}`);
  if (saved) setChecked(new Set(JSON.parse(saved)));
 }, [slug]);

 useEffect(() => {
  localStorage.setItem(`checklist-${slug}`, JSON.stringify([...checked]));
 }, [checked, slug]);

 const toggle = (id: string) => {
  setChecked(prev => {
   const next = new Set(prev);
   next.has(id) ? next.delete(id) : next.add(id);
   return next;
  });
 };

 const total = sections.reduce((acc, s) => acc + s.items.length, 0);
 const done = checked.size;
 const pct = total > 0 ? Math.round((done / total) * 100) : 0;

 return (
  <div className="space-y-14">
   {/* Progress bar */}
   <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm py-3 -mt-3 border-b">
    <div className="flex items-center justify-between text-sm mb-2">
     <span className="font-medium">{done} of {total} complete ({pct}%)</span>
     {done > 0 && (
      <button onClick={() => setChecked(new Set())} className="text-muted-foreground hover:text-foreground text-xs">
       Reset
      </button>
     )}
    </div>
    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
     <div
      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
      style={{ width: `${pct}%` }}
     />
    </div>
   </div>

   {sections.map((section, sIdx) => (
    <section key={sIdx}>
     <h2 className="text-xl font-bold mb-2">{section.heading}</h2>
     <p className="text-muted-foreground mb-6 text-sm">{section.description}</p>
     
     <div className="space-y-2">
      {section.items.map((item, iIdx) => {
       const id = `${sIdx}-${iIdx}`;
       const isChecked = checked.has(id);
       const itemTitle = item.title || item.task || item.text || '';
       const pStyle = PRIORITY_STYLES[item.priority] || PRIORITY_STYLES['nice-to-have'];
       
       return (
        <label
         key={iIdx}
         className={`flex items-start gap-4 p-4 border border-l-4 ${pStyle.border} rounded-lg cursor-pointer transition-all duration-200 ${
          isChecked ? 'bg-muted/30 border-muted' : 'hover:bg-muted/20'
         }`}
        >
         <input
          type="checkbox"
          checked={isChecked}
          onChange={() => toggle(id)}
          className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-emerald-500"
         />
         <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
           <span className={`font-medium text-sm ${isChecked ? 'line-through text-muted-foreground' : ''}`}>
            {itemTitle}
           </span>
           {item.priority && (
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${pStyle.bg} ${pStyle.text}`}>
             {item.priority}
            </span>
           )}
          </div>
          {item.description && (
           <p className={`text-sm leading-relaxed ${isChecked ? 'text-muted-foreground/50' : 'text-muted-foreground'}`}>
            {item.description}
           </p>
          )}
         </div>
        </label>
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
 severity?: 'critical' | 'major' | 'minor';
}

const SEVERITY_STYLES = {
 critical: { badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300', border: 'border-l-red-500', icon: '🚨' },
 major:   { badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300', border: 'border-l-amber-500', icon: '⚠️' },
 minor:   { badge: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300', border: 'border-l-gray-400', icon: '💡' },
};

function MistakesContent({ sections }: { sections: Array<{ heading: string; description: string; items: ActualMistakeItem[] }> }) {
 return (
  <div className="space-y-14">
   {sections.map((section, idx) => (
    <section key={idx}>
     <h2 className="text-xl font-bold mb-2">{section.heading}</h2>
     <p className="text-muted-foreground mb-6 text-sm">{section.description}</p>
     
     <div className="space-y-4">
      {section.items.map((item, itemIdx) => {
       const mistakeText = item.description || item.mistake || '';
       const consequenceText = item.impact || item.consequence || '';
       const solutionText = item.prevention || item.solution || '';
       const sev = SEVERITY_STYLES[item.severity || 'minor'];
       
       return (
        <div key={itemIdx} className={`border border-l-4 ${sev.border} rounded-lg p-4 hover:bg-muted/20 transition-colors`}>
         <div className="flex items-center gap-2 mb-2">
          <h3 className="font-semibold text-sm">{item.title}</h3>
          {item.severity && (
           <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${sev.badge}`}>
            {item.severity}
           </span>
          )}
         </div>
         <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{mistakeText}</p>
         <div className="text-sm space-y-2">
          {consequenceText && (
           <div className="flex gap-2 items-start">
            <span className="text-red-500 shrink-0 mt-0.5">
             <Shield className="h-3.5 w-3.5" />
            </span>
            <p><span className="font-medium text-foreground">Impact:</span> {consequenceText}</p>
           </div>
          )}
          {solutionText && (
           <div className="flex gap-2 items-start">
            <span className="text-emerald-500 shrink-0 mt-0.5">
             <CheckSquare className="h-3.5 w-3.5" />
            </span>
            <p><span className="font-medium text-foreground">Fix:</span> {solutionText}</p>
           </div>
          )}
         </div>
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
function ToolsContent({ sections }: { sections: Array<{ heading: string; description: string; items: ToolItem[] }> }) {
 return (
  <div className="space-y-14">
   {sections.map((section, idx) => (
    <section key={idx}>
     <h2 className="text-xl font-bold mb-2">{section.heading}</h2>
     <p className="text-muted-foreground mb-6 text-sm">{section.description}</p>
     
     <div className="grid gap-3 sm:grid-cols-2">
      {section.items.map((item, itemIdx) => (
       <a
        key={itemIdx}
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="p-4 border rounded-lg hover:border-primary/30 hover:bg-muted/20 transition-all duration-200 group"
       >
        <div className="flex items-start justify-between gap-2 mb-2">
         <h3 className="font-semibold text-sm group-hover:text-primary transition-colors flex items-center gap-1.5">
          {item.name}
          <ExternalLink className="h-3 w-3 text-muted-foreground/50 group-hover:text-primary/50" />
         </h3>
         <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
          item.pricing?.toLowerCase() === 'free' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' :
          item.pricing?.toLowerCase() === 'freemium' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
          'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
         }`}>
          {item.pricing}
         </span>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
       </a>
      ))}
     </div>
    </section>
   ))}
  </div>
 );
}

// ─── Default Content ──────────────────────────────────────────────────────────
function DefaultContent({ sections }: { sections: Array<{ heading: string; description: string; items: any[] }> }) {
 return (
  <div className="space-y-14">
   {sections.map((section, idx) => (
    <section key={idx}>
     <h2 className="text-xl font-bold mb-2">{section.heading}</h2>
     <p className="text-muted-foreground mb-6 text-sm">{section.description}</p>
     
     <div className="space-y-3">
      {section.items.map((item, itemIdx) => (
       <div key={itemIdx} className="p-4 border rounded-lg">
        <h3 className="font-semibold text-sm mb-2">{item.title || item.name || item.skill}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
       </div>
      ))}
     </div>
    </section>
   ))}
  </div>
 );
}
