import { PageHeader } from '@/components/page-header';
import { PageShell } from '@/components/page-shell';
import { fmtInt, fmtUsd, fmtUsdK, hiringReportStats as s } from '@/lib/hiring-report-stats';

export const dynamic = 'force-static';

const kw = s.keywords;
const engDept = s.departments.find((d) => d.label === 'Engineering');
const salesDept = s.departments.find((d) => d.label === 'Sales & BD');
const productDept = s.departments.find((d) => d.label === 'Product & Design');
const mktDept = s.departments.find((d) => d.label === 'Marketing');
const opsDept = s.departments.find((d) => d.label === 'Operations');
const compDept = s.departments.find((d) => d.label === 'Compliance & Legal');
const finDept = s.departments.find((d) => d.label === 'Finance');

const DEPT_BAR_COLORS = ['#18181B', '#27272A', '#3F3F46', '#52525B', '#71717A', '#A1A1AA', '#D4D4D8'];
const deptChartData = s.departments.map((d, i) => ({
 label: d.label,
 value: d.pct,
 color: DEPT_BAR_COLORS[i] ?? '#D4D4D8',
}));

const skillChartData = [
 { label: 'AI / ML / LLM', value: kw.ai.pct, color: '#18181B' },
 { label: 'Python', value: kw.python.pct, color: '#18181B' },
 { label: 'Data / Analytics', value: kw.dataAnalysis.pct, color: '#18181B' },
 { label: 'SQL', value: kw.sql.pct, color: '#18181B' },
 { label: 'AWS', value: kw.aws.pct, color: '#18181B' },
 { label: 'Project Mgmt', value: kw.projectMgmt.pct, color: '#18181B' },
 { label: 'Java', value: kw.java.pct, color: '#18181B' },
 { label: 'TypeScript', value: kw.typescript.pct, color: '#18181B' },
 { label: 'React', value: kw.react.pct, color: '#18181B' },
 { label: 'Smart Contracts', value: kw.smartContract.pct, color: '#18181B' },
 { label: 'Rust', value: kw.rust.pct, color: '#18181B' },
 { label: 'Solidity', value: kw.solidity.pct, color: '#18181B' },
];

const softSkillChartData = [
 { label: 'Product Mgmt', value: kw.productMgmt.pct, color: '#52525B' },
 { label: 'Analytical Skills', value: kw.analytical.pct, color: '#52525B' },
 { label: 'Risk Management', value: kw.risk.pct, color: '#52525B' },
 { label: 'Project Mgmt', value: kw.projectMgmt.pct, color: '#52525B' },
 { label: 'AML', value: kw.aml.pct, color: '#52525B' },
 { label: 'Negotiation', value: kw.negotiation.pct, color: '#52525B' },
 { label: 'Stakeholder Mgmt', value: kw.stakeholder.pct, color: '#52525B' },
];

const salaryBandChartData = [
 { label: '$200k+', value: s.salary.bands.over200.pct, color: '#18181B' },
 { label: '$150k - $200k', value: s.salary.bands.b150_200.pct, color: '#52525B' },
 { label: '$100k - $150k', value: s.salary.bands.b100_150.pct, color: '#71717A' },
 { label: '< $100k', value: s.salary.bands.under100.pct, color: '#A1A1AA' },
];

const locationDonut = [
 { label: 'USA', value: Math.round(s.location.usa.pct), color: '#18181B' },
 { label: 'Other', value: Math.round(s.location.other.pct), color: '#E4E4E7' },
 { label: 'Remote', value: Math.round(s.location.remoteBucket.pct), color: '#3F3F46' },
 { label: 'Europe', value: Math.round(s.location.europe.pct), color: '#52525B' },
 { label: 'Singapore', value: Math.round(s.location.singapore.pct), color: '#71717A' },
 { label: 'Hong Kong', value: Math.round(s.location.hongKong.pct), color: '#A1A1AA' },
];

const seniorityDonut = [
 { label: 'Mid-level', value: Math.round(s.seniority.mid.pct), color: '#A1A1AA' },
 { label: 'Senior', value: Math.round(s.seniority.senior.pct), color: '#18181B' },
 { label: 'Executive', value: Math.round(s.seniority.executive.pct), color: '#52525B' },
 { label: 'Entry/Intern', value: Math.round(s.seniority.entry.pct), color: '#D4D4D8' },
];

const topEmployerChartData = s.topCompanies.slice(0, 9).map((c) => ({
 label: c.name,
 value: c.count,
 color: '#18181B',
}));

const employerTypeChartData = [
 { label: 'Exchanges', value: s.employerTypes.exchange.pct, color: '#18181B' },
 { label: 'Infrastructure', value: s.employerTypes.infrastructure.pct, color: '#18181B' },
 { label: 'Payments', value: s.employerTypes.payments.pct, color: '#18181B' },
 { label: 'Trading', value: s.employerTypes.trading.pct, color: '#18181B' },
 { label: 'DeFi protocols', value: s.employerTypes.defi.pct, color: '#A1A1AA' },
];

const velocityDayLabels: Record<string, string> = {
 '2026-09-04': 'Sep 04 (Thu)',
 '2026-09-05': 'Sep 05 (Fri)',
 '2026-09-06': 'Sep 06 (Sat)',
 '2026-09-07': 'Sep 07 (Sun)',
 '2026-09-08': 'Sep 08 (Mon)',
 '2026-09-09': 'Sep 09 (Tue)',
 '2026-09-10': 'Sep 10 (Wed)',
 '2026-09-11': 'Sep 11 (Thu)',
};

const velocityChartData = Object.entries(s.velocity.byDate)
 .sort((a, b) => b[0].localeCompare(a[0]))
 .map(([date, value]) => ({
  label: velocityDayLabels[date] ?? date,
  value,
  color: date.endsWith('-05') || date.endsWith('-06') ? '#A1A1AA' : '#18181B',
 }));

const CHART_CARD =
  'rounded-2xl border border-border/70 bg-card p-6 sm:p-8 shadow-sm flex flex-col justify-center';

/* ── Chart Components ── */
function DonutChart({ segments, size = 180 }: { segments: { label: string; value: number; color: string }[]; size?: number }) {
 const total = segments.reduce((a, b) => a + b.value, 0);
 const r = 75, cx = 100, cy = 100, circ = 2 * Math.PI * r;
 let offset = -circ / 4;
 return (
  <div className="flex flex-col items-center">
   <svg width={size} height={size} viewBox="0 0 200 200">
    {segments.map((seg, i) => {
     const dash = (seg.value / total) * circ;
     const el = <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={seg.color} strokeWidth="24" strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={-offset} className="transition-all duration-700" />;
     offset += dash;
     return el;
    })}
    <circle cx={cx} cy={cy} r="58" className="fill-background" />
   </svg>
   <div className="flex flex-wrap justify-center gap-x-5 gap-y-1.5 mt-5">
    {segments.map((seg, i) => (
     <div key={i} className="flex items-center gap-2">
      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: seg.color }} />
      <span className="text-sm text-muted-foreground">{seg.label} <span className="font-semibold text-foreground">{seg.value}%</span></span>
     </div>
    ))}
   </div>
  </div>
 );
}

function HBar({ data, unit = '' }: { data: { label: string; value: number; color: string }[]; unit?: string }) {
 const max = Math.max(...data.map(d => d.value));
 return (
  <div className="space-y-4">
   {data.map((d, i) => (
    <div key={i}>
     <div className="flex justify-between mb-1.5">
      <span className="text-sm font-medium text-foreground/90">{d.label}</span>
      <span className="text-sm font-bold text-foreground">{d.value}{unit}</span>
     </div>
     <div className="h-2.5 bg-muted rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(d.value / max) * 100}%`, backgroundColor: d.color }} />
     </div>
    </div>
   ))}
  </div>
 );
}

function BigNum({ value, label, sub }: { value: string; label: string; sub?: string }) {
 return (
  <div className="text-center">
   <div className="text-5xl sm:text-6xl font-bold text-foreground tracking-tight leading-none">{value}</div>
   <div className="text-sm text-muted-foreground mt-3 leading-relaxed">{label}</div>
   {sub && <div className="text-xs text-muted-foreground/80 mt-1">{sub}</div>}
  </div>
 );
}

function Callout({ children }: { children: React.ReactNode }) {
 return (
  <blockquote className="my-10 rounded-r-lg border-l-2 border-primary bg-muted/20 py-2 pl-6">
   <p className="text-lg sm:text-xl leading-relaxed text-foreground/90 not-italic">{children}</p>
  </blockquote>
 );
}

function Sources({ children }: { children: React.ReactNode }) {
 return (
  <div className="mt-6 border-t border-border/60 pt-4">
   <p className="text-xs text-muted-foreground leading-relaxed">{children}</p>
  </div>
 );
}

function Cite({ href, children }: { href: string; children: React.ReactNode }) {
 return (
  <a
   href={href}
   target="_blank"
   rel="noopener noreferrer"
   className="font-medium text-foreground underline underline-offset-2 decoration-border transition-colors hover:decoration-primary"
  >
   {children}
  </a>
 );
}

/* ── Page ── */
export default function Web3HiringReport() {
 return (
  <div className="flex min-h-screen flex-col bg-background text-foreground">
   <main id="main-content" className="flex-1">
    <PageShell containerClassName="space-y-20 pb-16 md:space-y-28 md:pb-20">

    <div>
     <PageHeader
      align="left"
      className="mb-0 text-left [&_h1]:text-left [&_p]:mx-0 [&_p]:max-w-3xl [&_p]:text-base [&_p]:leading-relaxed"
      title={
       <>
        The Web3 Hiring
        <br />
        Report 2026
       </>
      }
      description={
       <>
        We analyzed <Cite href="https://hashtagweb3.com/jobs">{fmtInt(s.listings)} active job listings</Cite> across {s.companies} companies.
        Full posting text on each listing was parsed for skills, pay bands, remote language,
        and compensation keywords, alongside ATS titles, departments, and locations.
       </>
      }
     />
    </div>

    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
     {[
      { value: fmtInt(s.listings), label: 'Active job listings analyzed', sub: s.snapshotLabel },
      { value: String(s.companies), label: 'Companies hiring', sub: 'Exchanges, payments, infra' },
      { value: fmtUsdK(s.salary.median), label: 'Median salary (in posting text)', sub: `n=${fmtInt(s.salary.n)} parsed ranges` },
      { value: `${Math.round(s.jdRemote.pct)}%`, label: 'Postings mention remote work', sub: `${Math.round(s.location.remoteField.pct)}% remote in location field` },
     ].map((d, i) => (
      <div key={i} className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm sm:p-8">
       <BigNum {...d} />
      </div>
     ))}
    </div>

    <section>
     <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-5">Executive summary</h2>
     <p className="text-base text-muted-foreground leading-relaxed mb-5">
      Public Web3 hiring in {s.snapshotLabel} is concentrated and operational. The top 10 employers account for {s.top10SharePct}% of open roles. {s.topCompanies[0]?.name} leads the board with {fmtInt(s.topCompanies[0]?.count ?? 0)} listings, ahead of {s.topCompanies[1]?.name} ({fmtInt(s.topCompanies[1]?.count ?? 0)}) and {s.topCompanies[2]?.name} ({fmtInt(s.topCompanies[2]?.count ?? 0)}). Engineering is still the largest function at {engDept?.pct}%. Finance is {finDept?.pct}%. Pure DeFi protocol teams barely show up on structured ATS boards.
     </p>
     <p className="text-base text-muted-foreground leading-relaxed mb-5">
      This report uses the same job text shown on Hashtag Web3 role pages: {fmtInt(s.withDesc)} of {fmtInt(s.listings)} listings ({s.withDescPct}%) include at least 100 characters of description text. Departments and seniority come from titles and ATS fields. Keyword and salary rates below are measured on that full posting text unless noted.
     </p>
     <p className="text-base text-muted-foreground leading-relaxed mb-5">
      Six findings stand out. Engineering is 35.9% of roles. Sales and BD (10.8%) outrank operations (6.9%). Median base pay parsed from posting text is $203,500 (n=1,293, about 21% of listings). AI, ML, or LLM language appears in 49.6% of full postings. Remote work is mentioned in 35.4% of posting text, though only 19.3% of location fields say remote. Entry and intern titles are 3.8%. Stripe, not Binance, tops the employer count.
     </p>
     <p className="text-base text-muted-foreground leading-relaxed">
      Compliance and legal departments are 5.4% of the board. Contract language appears in 9% of postings. Typical weekdays add roughly 90 newly dated roles. What follows is measured from this cache; external 2026 salary surveys are cited only where our sample is thin.
     </p>
    </section>

    <section>
     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
      <div>
       <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-5">1 in 3 Web3 roles is engineering</h2>
       <p className="text-base text-muted-foreground leading-relaxed mb-5">
        Engineering is 35.9% of the September board (2,176 of 6,069 listings). That is still well above a typical tech company mix, where <Cite href="https://www.bls.gov/ooh/computer-and-information-technology/">BLS occupational data</Cite> puts software development closer to 20-25% of headcount once sales, support, and admin are counted. Web3 is still building rails, not just running them.
       </p>
       <p className="text-base text-muted-foreground leading-relaxed mb-5">
        Sales and business development is now second at 10.8%, ahead of product and design (9.8%) and marketing (7.8%). Operations dropped to 6.9%. The sales lift is concentrated at B2B firms selling custody, on-ramps, and compliance tooling to institutions. Permissionless protocols still hire almost no quota-carrying salespeople.
       </p>
       <p className="text-base text-muted-foreground leading-relaxed mb-5">
        Compliance and legal is 5.4%. Finance is 4.9%. Together they are 10.3% of public listings, which matches a market that has to live with <Cite href="https://www.esma.europa.eu/esmas-activities/digital-finance-and-innovation/markets-crypto-assets-regulation-mica">MiCA</Cite> and the <Cite href="https://www.sec.gov/spotlight/digital-assets">SEC digital-asset docket</Cite>. HR is 3.1%. Trading titles are 2.1% on the board, which understates desk hiring because shops like Jane Street still recruit off-cycle.
       </p>
       <p className="text-base text-muted-foreground leading-relaxed">
        13.3% of listings did not map cleanly to those buckets (CEO office, research, facilities, mixed ATS labels). We left them as Other rather than forcing them into engineering.
       </p>
      </div>
      <div className={`${CHART_CARD}`}>
       <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-6">Department distribution (% of listings)</p>
       <HBar data={deptChartData} unit="%" />
      </div>
     </div>
     <Callout>Engineering at 35.9% is still roughly 1.5x a traditional tech mix. Sales has overtaken operations on the public board.</Callout>
     <Sources>
      Source: <Cite href="https://hashtagweb3.com/jobs">Hashtag Web3</Cite>, {s.snapshotLabel} (n={fmtInt(s.listings)}) | <Cite href="https://www.bls.gov/ooh/computer-and-information-technology/">BLS Occupational Outlook</Cite>
     </Sources>
    </section>

    <section>
     <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-5">Python and SQL still lead explicit skill language</h2>
     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
      <div>
       <p className="text-base text-muted-foreground leading-relaxed mb-5">
        On full posting text, Python appears in 18.0% of listings and SQL in 12.4%. Data-analysis language (analyst, analytics, data-driven) is 14.2%. Project management is 7.5%; Java is 7.5%. TypeScript (5.8%), React (5.2%), and AWS (9.7%) trail the data stack but still show up often in engineering JDs.
       </p>
       <p className="text-base text-muted-foreground leading-relaxed mb-5">
        &ldquo;Blockchain&rdquo; appears in 37.4% of postings, mostly because employers describe the industry, not because 37% of roles require chain expertise day one. Smart-contract language is 4.4%; Solidity is 1.4%; Rust is 4.0%. Golang is about 3% when matched narrowly (not the word &ldquo;go&rdquo; in prose).
       </p>
       <p className="text-base text-muted-foreground leading-relaxed mb-5">
        AI, ML, or LLM terms appear in 49.6% of full postings, up from the May 2026 title-only scrape. That includes compliance ML, fraud models, and generic &ldquo;AI-native&rdquo; copy, not only hiring for model training roles.
       </p>
       <p className="text-base text-muted-foreground leading-relaxed">
        <Cite href="https://survey.stackoverflow.co/2025/">Stack Overflow&apos;s 2025 survey</Cite> still shows Python climbing across tech. Our Web3 board skews exchange and payments heavy, so the skill mix looks more like institutional fintech than pure protocol shops.
       </p>
      </div>
      <div className={`${CHART_CARD}`}>
       <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-6">Skills in full posting text (% of listings)</p>
       <HBar data={skillChartData} unit="%" />
      </div>
     </div>
     <Callout>Half of postings mention AI. Python and SQL still beat Solidity in explicit requirements. Industry &ldquo;blockchain&rdquo; copy is everywhere; chain-native languages are not.</Callout>
     <Sources>
      Source: <Cite href="https://hashtagweb3.com/jobs">Hashtag Web3</Cite> posting text, September 2026 (n=6,069) | <Cite href="https://survey.stackoverflow.co/2025/">Stack Overflow Developer Survey 2025</Cite>
     </Sources>
    </section>

    <section>
     <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-5">Soft skills and institutional language in postings</h2>
     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
      <div>
       <p className="text-base text-muted-foreground leading-relaxed mb-5">
        Communication skills appear in 50.3% of full postings, often as boilerplate. More specific signals: product management language 12.3%, analytical skills 9.2%, risk management 8.4%, project management 7.5%, AML 7.1%, negotiation 5.1%, stakeholder management 4.8%.
       </p>
       <p className="text-base text-muted-foreground leading-relaxed mb-5">
        The word &ldquo;compliance&rdquo; shows up in 36% of posting text because exchanges describe regulated environments, not because 36% of hires are compliance officers. Department counts are the cleaner org-chart signal: compliance and legal is 5.4% of listings.
       </p>
       <p className="text-base text-muted-foreground leading-relaxed">
        <Cite href="https://www.chainalysis.com/blog/2024-crypto-crime-report-introduction/">Chainalysis crime reporting</Cite> still describes rising compliance spend. Our JD text matches that story: AML and risk sit alongside engineering in exchange postings.
       </p>
      </div>
      <div className={`${CHART_CARD}`}>
       <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-6">Non-technical phrases in posting text (% of listings)</p>
       <HBar data={softSkillChartData} unit="%" />
      </div>
     </div>
     <Callout>Product, risk, and AML language is common in posting text. Use department counts when you care about headcount mix, not raw keyword frequency.</Callout>
     <Sources>
      Source: <Cite href="https://hashtagweb3.com/jobs">Hashtag Web3</Cite>, September 2026 | <Cite href="https://www.chainalysis.com/blog/2024-crypto-crime-report-introduction/">Chainalysis Crypto Crime Report</Cite>
     </Sources>
    </section>

    <section>
     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
      <div>
       <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-5">Median salary in posting text: {fmtUsd(s.salary.median)}</h2>
       <p className="text-base text-muted-foreground leading-relaxed mb-5">
        1,293 listings include a parseable USD range in the salary field or posting body (21.3% of the board). The median midpoint is $203,500. Observed range: about $67,500 to $360,000. US pay-transparency employers and trading firms pull the median up versus the old May sample.
       </p>
       <p className="text-base text-muted-foreground leading-relaxed mb-5">
        54.7% of parsed ranges sit at $200k or above; 29.0% fall between $150k and $200k; 11.7% between $100k and $150k; 4.6% below $100k. Only 71 rows carry a dedicated salary field in the cache JSON; the rest of the signal comes from ranges embedded in HTML descriptions.
       </p>
       <p className="text-base text-muted-foreground leading-relaxed mb-5">
        External checks: <Cite href="https://www.maneki.work/reports/web3-hiring-2026">Maneki</Cite> ($194.3k median on 716 published ranges), <Cite href="https://plexusrs.com/state-of-crypto-hiring-2026-salaries-rust-vs-solidity-and-what-200-candidates-want/">Plexus</Cite> ($182k average in 2025), <Cite href="https://www.definitivetalent.xyz/salary-benchmarks">DeFinitive</Cite> (~$155k US blockchain developer base in June 2026).
       </p>
       <p className="text-base text-muted-foreground leading-relaxed">
        Token grants are not in these figures. The remaining 79% of postings give candidates no numeric band to negotiate against.
       </p>
      </div>
      <div className="flex flex-col gap-6">
       <div className={`${CHART_CARD}`}>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-6">Distribution of salaries in posting text (n={fmtInt(s.salary.n)})</p>
        <HBar data={salaryBandChartData} unit="%" />
       </div>
      </div>
     </div>
     <Callout>More than half of parsed salary bands are $200k+. One in five listings still publishes a usable USD range in the posting text.</Callout>
     <Sources>
      Source: <Cite href="https://hashtagweb3.com/jobs">Hashtag Web3</Cite>, September 2026 (n=1,293) | <Cite href="https://www.maneki.work/reports/web3-hiring-2026">Maneki</Cite> | <Cite href="https://plexusrs.com/state-of-crypto-hiring-2026-salaries-rust-vs-solidity-and-what-200-candidates-want/">Plexus</Cite>
     </Sources>
    </section>

    <section>
     <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
      <div>
       <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-5">35% of postings mention remote work</h2>
       <p className="text-base text-muted-foreground leading-relaxed mb-5">
        Full posting text mentions remote work in 35.4% of listings (2,148 roles). Hybrid appears in 10.8%. The location field alone says remote on only 19.3% (1,170 roles). Candidates should read the body, not only the location pill.
       </p>
       <p className="text-base text-muted-foreground leading-relaxed mb-5">
        The US is 30.9% of listings. Europe is 8.9%. Singapore is 5.4%. Hong Kong is 5.1%. The Middle East is 1.3%. LATAM is 1.1%. Africa is 0.2%. 25.5% did not fit those hubs (multi-city APAC strings, Canada, India, and vague &ldquo;global&rdquo; labels without remote).
       </p>
       <p className="text-base text-muted-foreground leading-relaxed">
        <Cite href="https://www.chainalysis.com/blog/2023-global-crypto-adoption-index/">Chainalysis adoption rankings</Cite> still put several African and LATAM markets high on usage. Public ATS hiring has not caught up. If you only read this board, you would think crypto work happens in San Francisco, New York, Singapore, and Hong Kong.
       </p>
      </div>
      <div className={`${CHART_CARD}`}>
       <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-5 text-center">Location distribution</p>
       <DonutChart segments={locationDonut} size={180} />
      </div>
     </div>
     <Sources>
      Source: <Cite href="https://hashtagweb3.com/jobs">Hashtag Web3</Cite>, September 2026 | <Cite href="https://www.maneki.work/reports/web3-hiring-2026">Maneki Web3 Hiring 2026</Cite>
     </Sources>
    </section>

    <section>
     <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
      <div>
       <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-5">Web3 is still hiring mid-level people, not juniors</h2>
       <p className="text-base text-muted-foreground leading-relaxed mb-5">
        Titles without a seniority marker default to mid-level: 60.1%. Explicit senior / staff / lead titles are 26.7%. Director, VP, and C-level titles are 9.4%. Junior, intern, graduate, and entry titles together are 3.8% (229 roles). Intern appears in 2.9% of titles. Traditional tech still posts a much thicker junior layer.
       </p>
       <p className="text-base text-muted-foreground leading-relaxed mb-5">
        Contract or freelance language appears in 9.0% of posting text; full-time in 11.5%. Title-only counts understate employment type because most JDs never label it explicitly.
       </p>
       <p className="text-base text-muted-foreground leading-relaxed">
        Internships cluster at large employers. Small protocol teams still do not run campus programs. The on-ramp into this industry remains: spend a few years at a conventional tech or finance firm, then switch.
       </p>
      </div>
      <div className={`${CHART_CARD}`}>
       <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-5 text-center">Experience level</p>
       <DonutChart segments={seniorityDonut} size={180} />
      </div>
     </div>
    </section>

    <section>
     <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-5">Stripe leads the board. Exchanges are still huge.</h2>
     <p className="text-base text-muted-foreground leading-relaxed mb-5">
      Stripe has 625 open roles on this cache, the most of any employer. That is payments and stablecoin-adjacent hiring as much as &ldquo;crypto native.&rdquo; OKX is second with 339. Binance has 285. Coinbase 210. Block 205. Jane Street 180. Tangem 171. Ramp 145. Bybit 144. Robinhood 125. Ripple 124.
     </p>
     <p className="text-base text-muted-foreground leading-relaxed mb-5">
      The top 10 companies are 40% of all listings. Binance is no longer #1 on our public ATS board. Exchange volume still matters for <Cite href="https://www.coingecko.com/en/exchanges">CoinGecko league tables</Cite>, but payments and public-market fintech now post more roles than any single CEX.
     </p>
     <p className="text-base text-muted-foreground leading-relaxed mb-8">
      Company-name buckets: exchanges 21.3%, infrastructure (custody, wallets, labs, chains) 17.0%, payments 16.5%, trading firms 5.0%. Pure DeFi names are 0.1% of this board. Gaming is effectively zero. A large Other bucket (40%) is mixed fintech, research, and firms that do not self-label. Picks and shovels still beat protocols.
     </p>
     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className={`${CHART_CARD}`}>
       <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-6">Largest employers (open roles)</p>
       <HBar data={topEmployerChartData} />
      </div>
      <div className={`${CHART_CARD}`}>
       <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-6">Employer type (% of listings)</p>
       <HBar data={employerTypeChartData} unit="%" />
      </div>
     </div>
     <Callout>Exchanges plus payments plus infrastructure are 54.8% of tagged listings. DeFi protocols are almost invisible on structured ATS pages.</Callout>
     <Sources>
      Source: <Cite href="https://hashtagweb3.com/jobs">Hashtag Web3</Cite>, September 2026 | <Cite href="https://www.coingecko.com/en/exchanges">CoinGecko</Cite> | 324 companies
     </Sources>
    </section>

    <section>
     <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
      <div>
       <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-5">Typical weekdays add about 90 new roles</h2>
       <p className="text-base text-muted-foreground leading-relaxed mb-5">
        From 4 to 13 September 2026, weekdays posted 44 to 119 new roles (average 91), excluding a 352-role spike on 3 September that looks like a scrape backfill, not a hiring day. Weekends dropped to 2-6 postings.
       </p>
       <p className="text-base text-muted-foreground leading-relaxed">
        That weekday/weekend split is corporate recruiting hours, not DAO weekend bursts. 1,092 listings in the cache are dated in the last 14 days. The market is liquid: a closed role is replaced quickly, mostly by the same large employers.
       </p>
      </div>
      <div className={`${CHART_CARD}`}>
       <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-6">New roles by posted date (Sep 4–11)</p>
       <HBar data={velocityChartData} />
      </div>
     </div>
    </section>

    <section>
     <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
      <div>
       <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-5">AI language is in half of posting text</h2>
       <p className="text-base text-muted-foreground leading-relaxed mb-5">
        AI, ML, or LLM terms appear in 49.6% of full postings, up from the May 2026 extract (~35%). Rust is 4.0%. Smart-contract language is 4.4%. Solidity is 1.4%. The board is still mostly exchanges and payments, but the copy has shifted toward AI-assisted products and fraud models, not only smart-contract engineering.
       </p>
       <p className="text-base text-muted-foreground leading-relaxed">
        That does not mean half of hires are ML researchers. It means half of employers describe AI somewhere in the role or company context. Protocol-native shops still hire Rust and Solidity; they are a thin slice of 6,069 public rows.
       </p>
      </div>
      <div className={`${CHART_CARD}`}>
       <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-6">Keyword mentions in full posting text</p>
       <HBar data={[
        { label: 'AI / ML / LLM', value: kw.ai.pct, color: '#18181B' },
        { label: 'Smart contracts', value: kw.smartContract.pct, color: '#52525B' },
        { label: 'Rust', value: kw.rust.pct, color: '#A1A1AA' },
        { label: 'Solidity', value: kw.solidity.pct, color: '#A1A1AA' },
       ]} unit="%" />
      </div>
     </div>
    </section>

    <section>
     <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
      <div className={`${CHART_CARD}`}>
       <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-5 text-center">Long-term pay mentions (equity vs token)</p>
       <DonutChart segments={[
        { label: 'Equity / stock options', value: s.compensation.equityShareOfPayMix, color: '#18181B' },
        { label: 'Token compensation', value: s.compensation.tokenShareOfPayMix, color: '#A1A1AA' },
       ]} size={180} />
      </div>
      <div>
       <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-5">Equity dominates token talk in benefits sections</h2>
       <p className="text-base text-muted-foreground leading-relaxed mb-5">
        Among 3,900 listings with compensation or benefits language, 38.4% mention equity or stock options and 7.6% mention tokens or tokenomics. Where long-term pay is discussed at all, equity mentions outnumber token mentions roughly five to one (1,499 vs 298).
       </p>
       <p className="text-base text-muted-foreground leading-relaxed">
        <Cite href="https://plexusrs.com/state-of-crypto-hiring-2026-salaries-rust-vs-solidity-and-what-200-candidates-want/">Plexus&apos;s 2026 candidate survey</Cite> ranked remote work first and token allocation last. That matches licensed exchanges and public fintech: USD base, ordinary equity, tokens optional.
       </p>
      </div>
     </div>
    </section>

    <section>
     <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-8">Key takeaways for job seekers and hiring managers</h2>
     <div className="space-y-6">
      <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm sm:p-8">
       <h3 className="font-bold text-lg text-foreground mb-3">For candidates transitioning from traditional tech</h3>
       <p className="text-base text-muted-foreground leading-relaxed">
        Target mid-level seats at Stripe, Coinbase, OKX, Binance, and Block. Posting text centers around $204k where bands exist; 79% of listings still omit numbers. Python, SQL, and AI-adjacent product work show up more often than Solidity in requirements.
       </p>
      </div>
      <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm sm:p-8">
       <h3 className="font-bold text-lg text-foreground mb-3">For hiring managers at Web3 companies</h3>
       <p className="text-base text-muted-foreground leading-relaxed">
        Entry titles are 3.8%. Publish salary bands: only 21% of postings include parseable USD ranges. Say remote in the location field if the role is remote; 35% of JDs mention remote but only 19% of location strings do.
       </p>
      </div>
      <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm sm:p-8">
       <h3 className="font-bold text-lg text-foreground mb-3">For investors evaluating Web3 companies</h3>
       <p className="text-base text-muted-foreground leading-relaxed">
        Engineering at 36% means the sector is still building. Compliance plus finance at 10% is institutional, not theater. Watch DeFi ATS share (near zero here). Payments and CEX headcount are the loud public signal; protocol teams still hire off Discord.
       </p>
      </div>
     </div>
    </section>

    <section className="pb-4">
     <h2 className="text-2xl font-bold tracking-tight text-foreground mb-5">Methodology</h2>
     <p className="text-base text-muted-foreground leading-relaxed mb-5">
      This snapshot covers {fmtInt(s.listings)} active listings on Hashtag Web3 ({s.snapshotLabel}). We use the full posting text shown on each role page ({s.withDescPct}% of listings have at least 100 characters after HTML is removed). Keyword and salary signals come from that text. Department and seniority splits use job titles and ATS department fields. Geography uses each listing&apos;s location field.
     </p>
     <p className="text-base text-muted-foreground leading-relaxed mb-5">
      Salary figures are midpoints of explicit USD ranges in the posting or salary field only; we do not estimate pay where no range is published. Listings hired only through DAO votes, Discord, or private channels are underrepresented on public job boards.
     </p>
     <p className="text-base text-muted-foreground leading-relaxed">
      Produced by <Cite href="https://hashtagweb3.com">Hashtag Web3</Cite>, {s.snapshotLabel}. For the live board see the <Cite href="https://hashtagweb3.com/jobs">jobs page</Cite>. Questions: <Cite href="https://t.me/web3hiring">@web3hiring on Telegram</Cite>.
     </p>
    </section>

   </PageShell>
   </main>
  </div>
 );
}
