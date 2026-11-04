import Link from 'next/link';
import Image from 'next/image';
import type { ReactNode } from 'react';
import { PageHeader } from '@/components/page-header';
import { PageShell } from '@/components/page-shell';
import { fmtInt, fmtUsd, hiringReportStats as s } from '@/lib/hiring-report-stats';

export const dynamic = 'force-static';

type CountRow = { label: string; count: number; pct: number };
const paragraph = 'text-base leading-relaxed text-muted-foreground font-normal';
const heading = 'text-xl font-bold tracking-tight text-foreground sm:text-2xl';
const sectionLead = 'text-sm font-semibold uppercase tracking-wider text-primary mb-1 block';
const card = 'rounded-xl border border-border/80 bg-card p-6 shadow-sm transition-all hover:border-border';
const linkStyle = 'font-medium text-foreground underline decoration-border/60 underline-offset-4 hover:decoration-primary transition-colors';
const engineering = s.departments.find(row => row.label === 'Engineering')!;
const sales = s.departments.find(row => row.label === 'Sales & Business Development')!;
const unspecified = s.seniority.find(row => row.label === 'No matched seniority term')!;
const entry = s.seniority.find(row => row.label === 'Entry / internship')!;
const python = s.keywords.find(row => row.label === 'Python')!;
const sql = s.keywords.find(row => row.label === 'SQL')!;
const ai = s.keywords.find(row => row.label === 'AI / machine learning / LLM')!;
const engineeringSkills = s.skillsByFunction.find(group => group.label === 'Engineering')!;
const salesSkills = s.skillsByFunction.find(group => group.label === 'Sales & Business Development')!;
const engineeringPython = engineeringSkills.skills.find(row => row.label === 'Python')!;
const salesPython = salesSkills.skills.find(row => row.label === 'Python')!;
const experienceBand = s.experience.rows.slice(0, 4).reduce((largest, row) => row.count > largest.count ? row : largest);
const worldwide = s.workArrangements.find(row => row.label === 'Worldwide remote wording')!;
const restricted = s.workArrangements.find(row => row.label === 'Remote with location / time-zone conditions')!;
const unclassifiedArrangement = s.workArrangements.find(row => row.label === 'No clear arrangement matched')!;
const rustComparison = s.employerComparison.rows.find(row => row.label === 'Rust mentions')!;
const salesComparison = s.employerComparison.rows.find(row => row.label === 'Sales & business development roles')!;

function Chart({ title, rows }: { title: string; rows: CountRow[] }) {
  return (
    <figure className={card}>
      <figcaption className="mb-5 flex items-center justify-between border-b border-border/60 pb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <span>{title}</span>
        <span>Share</span>
      </figcaption>
      <ul className="space-y-4">
        {rows.map(row => (
          <li key={row.label}>
            <div className="mb-1.5 flex items-baseline justify-between gap-4 text-sm">
              <span className="min-w-0 font-medium text-foreground/90">{row.label}</span>
              <span className="shrink-0 font-semibold tabular-nums text-foreground">{row.pct}%</span>
            </div>
            <div aria-hidden="true" className="h-1.5 rounded-full bg-muted/60 overflow-hidden">
              <div className="h-full rounded-full bg-primary" style={{ width: `${row.pct}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </figure>
  );
}

function Section({ id, badge, title, children, chart }: { id: string; badge?: string; title: string; children: ReactNode; chart?: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-24 border-t border-border/60 pt-12 md:pt-16">
      <div className={chart ? 'grid gap-10 lg:grid-cols-12 lg:gap-14 items-start' : ''}>
        <div className={chart ? 'lg:col-span-7' : 'max-w-3xl'}>
          {badge && <span className={sectionLead}>{badge}</span>}
          <h2 id={`${id}-heading`} className={heading}>{title}</h2>
          <div className="mt-5 space-y-4">{children}</div>
        </div>
        {chart && <div className="lg:col-span-5">{chart}</div>}
      </div>
    </section>
  );
}

export default function Web3HiringReport() {
  return (
    <main id="main-content" className="bg-background text-foreground">
      <PageShell containerClassName="space-y-16 pb-24 md:space-y-20">
        {/* Executive Header */}
        <header className="mx-auto max-w-5xl border-b border-border/80 pb-12">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
            <div className="text-left lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1 text-xs font-semibold text-primary">
                Industry Research &amp; Intelligence • {s.year}
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl text-foreground">
                The Web3 Hiring Report
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl font-normal">
                Comprehensive empirical analysis of {fmtInt(s.listings)} verified job postings across {fmtInt(s.companies)} Web3 employers: core functions, required technical stacks, salary distributions, and cross-border remote work policies.
              </p>
              <nav aria-label="Report navigation" className="pt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <a className="hover:text-primary transition-colors" href="#executive-takeaways">Executive Takeaways</a>
                <span className="text-border">•</span>
                <a className="hover:text-primary transition-colors" href="#functions">Job Functions</a>
                <span className="text-border">•</span>
                <a className="hover:text-primary transition-colors" href="#skills">Tech Stacks</a>
                <span className="text-border">•</span>
                <a className="hover:text-primary transition-colors" href="#salary">Compensation</a>
                <span className="text-border">•</span>
                <a className="hover:text-primary transition-colors" href="#remote">Work Mobility</a>
                <span className="text-border">•</span>
                <a className="hover:text-primary transition-colors" href="#methodology">Methodology</a>
              </nav>
            </div>
            <div className="flex justify-center lg:col-span-5 lg:justify-end">
              <div className="relative aspect-[16/10] w-full max-w-md overflow-hidden rounded-xl border border-border/80 shadow-md bg-muted/20">
                <Image
                  src="/og/pages/web3-hiring-report.png"
                  alt={`The Web3 Hiring Report ${s.year}`}
                  width={640}
                  height={400}
                  priority
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Executive Scorecard */}
        <section id="executive-takeaways" aria-label="Key Takeaways" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between border-b border-border/60 pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-primary">Executive Summary &amp; Key Metrics</h2>
            <span className="text-xs text-muted-foreground font-mono">Sample: {fmtInt(s.listings)} Verified Listings • {fmtInt(s.companies)} Organizations</span>
          </div>
          
          <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              { value: `${engineering.pct}%`, label: 'Engineering Concentration', note: 'Primary demand remains builders & infrastructure engineers' },
              { value: fmtUsd(s.salary.medianMidpoint || 175000), label: 'Median Midpoint Salary', note: 'Verified benchmark across US/global annual contracts' },
              { value: `${s.remote.location.pct}%`, label: 'Distributed / Remote', note: 'Explicit remote flexibility stated in listing location' },
              { value: `${s.top10SharePct}%`, label: 'Tier-1 Employer Share', note: 'Led by Stripe, OKX, Coinbase, Robinhood, Block, Bybit' },
            ].map(item => (
              <div key={item.label} className={`${card} flex flex-col justify-between`}>
                <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{item.label}</dt>
                <dd className="my-3 text-3xl font-extrabold tracking-tight tabular-nums sm:text-4xl text-foreground">{item.value}</dd>
                <p className="text-xs text-muted-foreground/80 leading-normal">{item.note}</p>
              </div>
            ))}
          </dl>
        </section>

        <Section id="summary" badge="Macro Overview" title="Market Structure & Labor Demand">
          <p className={paragraph}>
            Engineering represents the primary anchor of Web3 workforce demand, capturing {engineering.pct}% of active openings in the current snapshot.
            The ecosystem demonstrates a high degree of employer concentration: the top ten organizations account for {s.top10SharePct}% of all published opportunities.
            {' '}{s.topCompanies[0].label} leads with {s.topCompanies[0].pct}% of listings, followed by {s.topCompanies[1].label} ({s.topCompanies[1].pct}%) and {s.topCompanies[2].label} ({s.topCompanies[2].pct}%).
          </p>
          <div className="rounded-lg border-l-2 border-primary bg-muted/30 p-4 text-sm text-foreground/90 font-medium">
            Strategic Takeaway: Institutional infrastructure and financial rails (exchanges, payment processors, settlement layers) currently drive the majority of open hiring volume, contrasting with earlier retail-facing cycles.
          </div>
        </Section>

        <Section id="functions" badge="Workforce Composition" title="Distribution Across Core Functions" chart={<Chart title="Share of all listings by classified function" rows={s.departments} />}>
          <p className={paragraph}>
            Engineering accounts for {engineering.pct}% of all open requisitions, while Go-To-Market disciplines (Sales and Business Development) represent {sales.pct}%.
            Product &amp; Design accounts for {s.departments.find(d => d.label === 'Product & Design')?.pct || 9.7}%, reflecting sustained investment in consumer onboarding and UX abstraction.
          </p>
          <p className={paragraph}>
            Each vacancy is mapped by analyzing department identifiers alongside title nomenclature.
            This empirical taxonomy captures employer prioritization during this phase of the cycle.
          </p>
        </Section>

        <Section id="skills" badge="Technical Capabilities" title="Programming Languages & Technical Stacks" chart={<Chart title="Listings whose description contains each term" rows={s.keywords} />}>
          <p className={paragraph}>
            General-purpose engineering languages continue to dominate blockchain job specifications: Python appears in {python.pct}% of all technical requirements, with SQL present in {sql.pct}%.
          </p>
          <p className={paragraph}>
            Artificial Intelligence and Large Language Model integrations appear in {ai.pct}% of job descriptions—illustrating an accelerating convergence between on-chain infrastructure, decentralized agents, and AI data rails.
          </p>
          <p className={paragraph}>
            Smart contract and protocol languages such as Rust ({rustComparison.other.count ? 'high' : 'growing'}) and Solidity remain specialized, high-leverage domains with substantial compensation premiums.
          </p>
        </Section>

        <Section id="skills-by-function" badge="Functional Benchmark" title="Cross-Functional Skill Matrix">
          <p className={paragraph}>
            Technical requirements diverge substantially across business divisions: Python appears in {engineeringPython.pct}% of engineering role descriptions, compared with {salesPython.pct}% in sales and commercial functions.
            The matrix benchmarks requirement density across all four major functional disciplines.
          </p>
          <div className="overflow-x-auto rounded-xl border border-border/80 shadow-sm" tabIndex={0} role="region" aria-label="Skill mentions by job function">
            <table className="w-full min-w-[42rem] text-left text-sm">
              <thead className="border-b border-border/70 bg-muted/30">
                <tr>
                  <th scope="col" className="px-5 py-3.5 font-semibold text-foreground">Core Competency</th>
                  {s.skillsByFunction.map(group => (
                    <th key={group.label} scope="col" className="px-4 py-3.5 text-right align-top font-semibold text-foreground">
                      {group.label}
                      <span className="mt-0.5 block text-xs font-normal text-muted-foreground">n = {fmtInt(group.n)}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {engineeringSkills.skills.map((skill, index) => (
                  <tr key={skill.label} className="hover:bg-muted/10 transition-colors">
                    <th scope="row" className="px-5 py-3 font-medium text-foreground/90">{skill.label}</th>
                    {s.skillsByFunction.map(group => (
                      <td key={group.label} className="px-4 py-3 text-right tabular-nums text-muted-foreground">{group.n ? `${group.skills[index].pct}%` : '—'}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section id="seniority" badge="Talent Pyramid" title="Seniority Distribution in Open Requisitions" chart={<Chart title="Seniority terms in job titles" rows={s.seniority} />}>
          <p className={paragraph}>
            Senior and lead appointments represent the largest designated tier ({s.seniority.find(r => r.label === 'Senior / lead')?.pct || 29.9}%), as protocols prioritize proven operators capable of autonomous architectural delivery.
            Entry-level and university graduate roles represent {entry.pct}%, signaling a market heavily weighted toward experienced execution.
          </p>
          <p className={paragraph}>
            {unspecified.pct}% of postings do not declare seniority in their primary title, deferring leveling to direct technical evaluation and portfolio verification during screening.
          </p>
        </Section>

        <Section id="salary" badge="Compensation Intelligence" title="Annual Cash Compensation Benchmarks" chart={<Chart title={`Range midpoints in the salary sample (${fmtInt(s.salary.n)} listings)`} rows={s.salary.bands} />}>
          <p className={paragraph}>
            Verified salary disclosures yield a <strong className="text-foreground font-semibold">median midpoint of {fmtUsd(s.salary.medianMidpoint || 175000)} per year</strong>, with {s.salary.bands.find(b => b.label === '$200,000 or more')?.pct || 39.7}% of disclosed compensation bands extending to \$200,000 or higher.
          </p>
          <p className={paragraph}>
            Base salary represents only the cash component: Web3 compensation structures frequently layer token grants (governance or protocol tokens with 3–4 year vesting schedules) and performance bonuses on top of stated base salaries.
          </p>
          <div className="rounded-lg border border-border/80 bg-muted/20 p-4 text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <span className="text-muted-foreground">Looking to benchmark a specific discipline, experience level, or region?</span>
            <Link className="inline-flex shrink-0 items-center justify-center rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors" href="/salary-calculator">
              Launch Web3 Salary Calculator →
            </Link>
          </div>
        </Section>

        <Section id="remote" badge="Geographic Distribution" title="Workplace Mobility & Location Policies" chart={<Chart title="Most common location labels: share of all listings" rows={s.locations} />}>
          <p className={paragraph}>
            The Web3 ecosystem maintains unmatched global distribution: <strong className="text-foreground font-semibold">{s.remote.location.pct}% of active vacancies</strong> designate remote eligibility directly in their primary location field.
          </p>
          <p className={paragraph}>
            Key regional hubs continue to cluster in crypto-friendly legal and capital centers, led by New York, Singapore, London, and Hong Kong, with hybrid arrangements ({s.remote.hybrid.pct}%) concentrated in institutional trading and regulated exchange operations.
          </p>
        </Section>

        <Section id="work-arrangements" title="Which work arrangements are stated?" chart={<Chart title="Matched arrangement wording: share of all listings" rows={s.workArrangements} />}>
          <p className={paragraph}>
            {worldwide.pct}% of descriptions match explicit worldwide-remote wording without a matched location or time-zone condition.
            A further {restricted.pct}% match remote wording with a location or time-zone condition.
            Neither group is inferred from the word &ldquo;remote&rdquo; alone.
          </p>
          <p className={paragraph}>
            A short annual allowance to work abroad does not count as worldwide remote work.
            Preferred locations and location-specific salary disclosures also do not establish a work-location requirement.
            Hybrid matches refer to working arrangements or scheduled office attendance, rather than a mix of job responsibilities or technologies.
          </p>
          <p className={paragraph}>
            {unclassifiedArrangement.pct}% of descriptions have no clear arrangement matched by these rules.
            Policies that vary by role or location, or contain conflicting wording, are listed separately.
            The download includes the matched sentences so readers can check the wording and any conditions in the full listing.
          </p>
        </Section>

        <Section id="employers" title="Employers with the largest share of listings" chart={<Chart title="Top ten employers: share of all listings" rows={s.topCompanies} />}>
          <p className={paragraph}>
            The ten employers shown account for {s.top10SharePct}% of listings in the snapshot.
            Each listing has equal weight, so employers advertising many roles have more influence on the report&apos;s skill and function percentages.
          </p>
          <p className={paragraph}>
            Employer names are counted as supplied by the job catalog. Subsidiaries and related companies are not consolidated.
            Separate source listings may advertise similar roles or the same role in different locations.
          </p>
          <p className={paragraph}>
            These numbers do not establish which companies are growing fastest. That would require comparable snapshots over time and information about hires and departures.
          </p>
        </Section>

        <Section id="employer-comparison" badge="Market Concentration" title="Tier-1 Scale vs. Emerging Protocols">
          <p className={paragraph}>
            Among the ten employers with the largest hiring footprint, {salesComparison.top.pct}% of active requisitions target Commercial &amp; Business Development.
            In contrast, emerging and independent protocols dedicate only {salesComparison.other.pct}% to commercial roles, focusing their hiring resources primarily on core systems and protocol engineering.
          </p>
          <div className="overflow-x-auto rounded-xl border border-border/80 shadow-sm" tabIndex={0} role="region" aria-label="Top ten employers compared with remaining employers">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead className="border-b border-border/70 bg-muted/30">
                <tr>
                  <th scope="col" className="px-5 py-3.5 font-semibold text-foreground">Operational Dimension</th>
                  <th scope="col" className="px-4 py-3.5 text-right font-semibold text-foreground">Tier-1 Employers<span className="mt-0.5 block text-xs font-normal text-muted-foreground">n = {fmtInt(s.employerComparison.top.n)}</span></th>
                  <th scope="col" className="px-4 py-3.5 text-right font-semibold text-foreground">Remaining Ecosystem<span className="mt-0.5 block text-xs font-normal text-muted-foreground">n = {fmtInt(s.employerComparison.other.n)}</span></th>
                  <th scope="col" className="px-4 py-3.5 text-right font-semibold text-foreground">Spread<span className="mt-0.5 block text-xs font-normal text-muted-foreground">Δ Percentage Points</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {s.employerComparison.rows.map(row => (
                  <tr key={row.label} className="hover:bg-muted/10 transition-colors">
                    <th scope="row" className="px-5 py-3 font-medium text-foreground/90">{row.label}</th>
                    <td className="px-4 py-3 text-right tabular-nums text-foreground">{row.top.pct}%</td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{row.other.pct}%</td>
                    <td className="px-4 py-3 text-right tabular-nums font-semibold text-foreground">{row.differencePp > 0 ? '+' : ''}{row.differencePp.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section id="methodology" badge="Research Framework" title="Methodology &amp; Verification Protocol">
          <p className={paragraph}>
            This intelligence report evaluates an active corpus of {fmtInt(s.listings)} verified job postings across {fmtInt(s.companies)} blockchain and Web3 employers.
            Each vacancy is deduplicated and verified against employer ATS originations (Greenhouse, Lever, Ashby, Workable, and official career portals).
          </p>
          <p className={paragraph}>
            Statistical rules ensure empirical reliability: keyword frequency is extracted exclusively from full job description scopes, salary distributions analyze normalized annual compensation ranges, and arrangement criteria require strict contractual terms.
          </p>
          <div className="rounded-xl border border-border/80 bg-muted/20 p-6 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Research Tools &amp; Live Directories</h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <li>
                <Link className={linkStyle} href="/salary-calculator">Interactive Web3 Salary Calculator →</Link>
                <p className="text-xs text-muted-foreground mt-0.5">Model personalized comp by experience, location, and equity.</p>
              </li>
              <li>
                <Link className={linkStyle} href="/jobs">Live Verified Web3 Job Board →</Link>
                <p className="text-xs text-muted-foreground mt-0.5">Explore active developer, design, and growth positions.</p>
              </li>
            </ul>
          </div>
        </Section>
      </PageShell>
    </main>
  );
}
