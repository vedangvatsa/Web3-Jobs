'use client';

import { Header } from '@/components/header';

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
    <circle cx={cx} cy={cy} r="58" className="fill-[#fafafa] dark:fill-black" />
   </svg>
   <div className="flex flex-wrap justify-center gap-x-5 gap-y-1.5 mt-5">
    {segments.map((seg, i) => (
     <div key={i} className="flex items-center gap-2">
      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: seg.color }} />
      <span className="text-[13px] text-zinc-500 dark:text-zinc-400">{seg.label} <span className="font-semibold text-zinc-700 dark:text-zinc-300">{seg.value}%</span></span>
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
      <span className="text-sm text-zinc-700 dark:text-zinc-300 font-medium">{d.label}</span>
      <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{d.value}{unit}</span>
     </div>
     <div className="h-2.5 bg-zinc-100 dark:bg-zinc-800/60 rounded-full overflow-hidden">
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
   <div className="text-5xl sm:text-6xl font-serif font-bold text-zinc-900 dark:text-zinc-50 tracking-tight leading-none">{value}</div>
   <div className="text-sm text-zinc-500 dark:text-zinc-400 mt-3 leading-relaxed">{label}</div>
   {sub && <div className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1">{sub}</div>}
  </div>
 );
}

function Callout({ children }: { children: React.ReactNode }) {
 return (
  <blockquote className="border-l-2 border-zinc-900 dark:border-zinc-100 pl-6 py-2 my-10">
   <p className="text-lg sm:text-xl font-serif text-zinc-800 dark:text-zinc-200 leading-relaxed italic">{children}</p>
  </blockquote>
 );
}

function Sources({ children }: { children: React.ReactNode }) {
 return (
  <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
   <p className="text-[11px] text-zinc-400 dark:text-zinc-500 leading-relaxed">{children}</p>
  </div>
 );
}

function Cite({ href, children }: { href: string; children: React.ReactNode }) {
 return (
  <a href={href} target="_blank" rel="noopener noreferrer" className="text-zinc-900 dark:text-zinc-100 hover:text-indigo-600 dark:hover:text-indigo-400 underline underline-offset-2 decoration-zinc-300 dark:decoration-zinc-600 hover:decoration-indigo-400 transition-colors">
   {children}
  </a>
 );
}

/* ── Page ── */
export default function Web3HiringReport() {
 return (
  <div className="h-screen overflow-y-auto bg-[#fafafa] dark:bg-black selection:bg-zinc-200 dark:selection:bg-zinc-800 transition-colors duration-200 flex flex-col">
   <Header />
   <main id="main-content" className="w-full max-w-5xl mx-auto px-6 py-16 md:py-24 lg:py-32 pb-32 flex-1">

    {/* HERO */}
    <div className="mb-24">
     <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-[0.2em] mb-6">Hashtag Web3 Research / April 2026</p>
     <h1 className="text-4xl sm:text-[3.4rem] font-serif font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-8 leading-[1.12]">
      The Web3 Hiring<br />Report 2026
     </h1>
     <p className="text-[17px] text-zinc-500 dark:text-zinc-400 leading-[1.8] max-w-3xl">
      We analyzed <Cite href="https://hashtagweb3.com/jobs">1,466 active job listings</Cite> across 187 Web3 companies. This report breaks down what those listings reveal about skills, compensation, departments, locations, and the state of crypto hiring.
     </p>
    </div>

    {/* BIG NUMBERS */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-zinc-200 dark:bg-zinc-800/50 rounded-lg overflow-hidden mb-28">
     {[
      { value: '1,466', label: 'Active job listings analyzed', sub: 'April 2026' },
      { value: '187', label: 'Web3 companies hiring', sub: 'From Binance to Polymarket' },
      { value: '$166k', label: 'Median salary (where listed)', sub: 'Range: $65k-$298k' },
      { value: '42%', label: 'Roles are remote-first', sub: '622 of 1,466 listings' },
     ].map((d, i) => (
      <div key={i} className="bg-[#fafafa] dark:bg-black p-8 sm:p-10">
       <BigNum {...d} />
      </div>
     ))}
    </div>

    {/* EXECUTIVE SUMMARY */}
    <section className="mb-28">
     <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-5">Executive summary</h2>
     <p className="text-[15px] text-zinc-500 dark:text-zinc-400 leading-[1.85] mb-5">
      Web3 hiring in 2026 is defined by a paradox. The industry talks about decentralization, but hiring is concentrated: 50% of all listings come from just 10 companies, led by Binance with 366 open roles. It talks about blockchain, but only 5% of job listings explicitly require blockchain skills. It talks about disrupting finance, but the most-hired department is engineering (34.4%), not finance (5.0%). The gap between Web3&apos;s narrative and its labor market tells you more about the industry&apos;s actual state than any whitepaper.
     </p>
     <p className="text-[15px] text-zinc-500 dark:text-zinc-400 leading-[1.85] mb-5">
      This report is based on structured data extraction from 1,466 active job listings across 187 companies. We pulled each listing from its source ATS platform (Greenhouse, Lever, Ashby, Workable), extracted the full job description, and used GPT-4o-mini to classify each role by department, required skills, experience level, compensation, location, and crypto sub-sector. The result is the most granular public dataset on Web3 hiring available today.
     </p>
     <p className="text-[15px] text-zinc-500 dark:text-zinc-400 leading-[1.85] mb-5">
      Six findings stand out. First, engineering dominates at 34.4% of roles, nearly double the ratio at traditional tech companies. Second, Python and data analysis are the top skills, not Solidity or Rust. Third, the median salary of $166,000 carries a 15-20% premium over equivalent traditional tech roles. Fourth, 42% of positions are remote, 3x the industry average. Fifth, only 14% of roles are entry-level, creating a structural junior talent pipeline problem. Sixth, infrastructure companies account for 38% of all hiring, dwarfing DeFi (5%) and gaming (0.5%).
     </p>
     <p className="text-[15px] text-zinc-500 dark:text-zinc-400 leading-[1.85]">
      The data suggests that Web3 is maturing from a speculative industry into an operational one. Compliance and legal roles (6.3%) barely existed two years ago. Full-time employment (73.3%) dominates over contracts (1.8%). Companies are building for permanence, not for the next token launch cycle. What follows is a section-by-section breakdown of every dimension of Web3 hiring we could measure.
     </p>
    </section>

    {/* SECTION 1: DEPARTMENT BREAKDOWN */}
    <section className="mb-28">
     <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
      <div>
       <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-5">1 in 3 Web3 roles is engineering</h2>
       <p className="text-[15px] text-zinc-500 dark:text-zinc-400 leading-[1.85] mb-5">
        Engineering dominates Web3 hiring at 34.4% of all listings, a figure that far exceeds traditional tech companies. For comparison, <Cite href="https://www.bls.gov/ooh/computer-and-information-technology/">US Bureau of Labor Statistics data</Cite> puts software development at roughly 20-25% of tech company headcount when accounting for all support, sales, and administrative functions. In Web3, the ratio is closer to 1 in 3, driven by the need to build and maintain distributed infrastructure that handles billions in transaction volume.
       </p>
       <p className="text-[15px] text-zinc-500 dark:text-zinc-400 leading-[1.85] mb-5">
        Operations is a distant second at 10.6%, followed by marketing at 8.9%. The operations figure is inflated by exchange-heavy companies like Binance and OKX, where compliance operations, customer support, and risk monitoring require large teams. Marketing at 8.9% is lower than you might expect for consumer-facing companies, but makes sense given that many Web3 products grow through developer adoption and protocol integrations rather than traditional advertising.
       </p>
       <p className="text-[15px] text-zinc-500 dark:text-zinc-400 leading-[1.85] mb-5">
        Sales and business development together represent 8.4% of listings. This is concentrated in B2B infrastructure companies like Chainalysis, Elliptic, and Fireblocks, which sell compliance and custody solutions to financial institutions. Consumer-facing protocols like Uniswap or Aave have virtually zero sales roles because their products are permissionless.
       </p>
       <p className="text-[15px] text-zinc-500 dark:text-zinc-400 leading-[1.85] mb-5">
        Finance (5.0%) and compliance (2.5%) together represent 7.5% of roles, reflecting the industry&apos;s maturation as regulatory frameworks like <Cite href="https://www.esma.europa.eu/esmas-activities/digital-finance-and-innovation/markets-crypto-assets-regulation-mica">MiCA</Cite> in Europe and the <Cite href="https://www.sec.gov/spotlight/digital-assets">SEC&apos;s digital asset framework</Cite> in the US create new reporting obligations. Two years ago, compliance roles were virtually absent from Web3 job boards. Their presence at 6.3% (when combined with legal) signals a structural shift in how crypto companies operate.
       </p>
       <p className="text-[15px] text-zinc-500 dark:text-zinc-400 leading-[1.85]">
        Trading desks account for just 0.9% of listings, concentrated at Citadel Securities and Binance. This low figure is somewhat misleading: quant trading firms typically hire through direct outreach and university recruiting rather than public job boards. The true demand for trading talent in crypto is likely 3-5x what public listings suggest, based on <Cite href="https://www.efinancialcareers.com/">eFinancialCareers reporting</Cite> on crypto-native hedge fund growth.
       </p>
      </div>
      <div className="bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/40 rounded-lg p-8">
       <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-6">Department distribution (% of listings)</p>
       <HBar data={[
        { label: 'Engineering', value: 34.4, color: '#18181B' },
        { label: 'Operations', value: 10.6, color: '#27272A' },
        { label: 'Marketing', value: 8.9, color: '#3F3F46' },
        { label: 'Sales & BD', value: 8.4, color: '#52525B' },
        { label: 'Product & Design', value: 7.0, color: '#71717A' },
        { label: 'Compliance & Legal', value: 6.3, color: '#A1A1AA' },
        { label: 'Finance', value: 5.0, color: '#D4D4D8' },
       ]} unit="%" />
      </div>
     </div>
     <Callout>Engineering at 34.4% is nearly double the ratio at traditional tech companies. Web3 is still in build mode.</Callout>
     <Sources>
      Source: <Cite href="https://hashtagweb3.com/jobs">Hashtag Web3</Cite>, April 2026 · <Cite href="https://www.developerreport.com/">Electric Capital Developer Report 2025</Cite> · <Cite href="https://www.bls.gov/ooh/computer-and-information-technology/">BLS Occupational Outlook</Cite>
     </Sources>
    </section>

    {/* SECTION 2: SKILLS */}
    <section className="mb-28">
     <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-5">Python and data analysis dominate Web3 skill demand</h2>
     <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
      <div>
       <p className="text-[15px] text-zinc-500 dark:text-zinc-400 leading-[1.85] mb-5">
        Data analysis (15.6%) and Python (14.7%) are the most requested skills across all Web3 listings. SQL follows at 8.9%. This mirrors the broader tech industry trend identified in the <Cite href="https://survey.stackoverflow.co/2025/">2025 Stack Overflow Developer Survey</Cite>, where Python saw its largest adoption jump in a decade. The dominance of data skills reflects how Web3 companies operate: every blockchain transaction is public, creating massive datasets that require analysts to extract trading patterns, user behavior, and market intelligence.
       </p>
       <p className="text-[15px] text-zinc-500 dark:text-zinc-400 leading-[1.85] mb-5">
        Blockchain-specific skills appear in only 5.0% of listings. This is the single most surprising finding in our dataset. It suggests that most Web3 companies hire for general engineering talent first and train domain expertise internally. A Coinbase backend engineer does not need to understand Merkle trees on day one. They need Python, AWS, and CI/CD. The blockchain-specific knowledge comes through on-the-job exposure and internal training programs.
       </p>
       <p className="text-[15px] text-zinc-500 dark:text-zinc-400 leading-[1.85] mb-5">
        AI and machine learning skills appear in 4.8% of listings, well below the broader tech industry&apos;s 25% according to the <Cite href="https://www.linuxfoundation.org/research/open-source-jobs-report-2025">Linux Foundation 2025 Open Source Jobs Report</Cite>. This gap exists because most Web3 companies are still building core infrastructure rather than AI products. The exceptions are compliance companies like Chainalysis and Elliptic, where machine learning powers transaction monitoring and fraud detection.
       </p>
       <p className="text-[15px] text-zinc-500 dark:text-zinc-400 leading-[1.85] mb-5">
        TypeScript and JavaScript are tied at 4.1% each, and React appears in 3.9%. These three together (12.1%) represent the frontend stack for Web3 applications. Go and distributed systems each appear in about 3%, concentrated at infrastructure companies like StreamingFast that build blockchain indexing and node infrastructure.
       </p>
       <p className="text-[15px] text-zinc-500 dark:text-zinc-400 leading-[1.85]">
        Notably absent from the top skills: Solidity. The primary smart contract language does not appear in the top 30. This is because smart contract development roles are a small subset of engineering, and those listings tend to ask for &ldquo;smart contract development&rdquo; as a job function rather than listing Solidity as a discrete skill. Rust, used by Solana and Polkadot, also sits outside the top 30, appearing in fewer than 2% of listings.
       </p>
      </div>
      <div className="bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/40 rounded-lg p-8">
       <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-6">Most in-demand skills (% of listings)</p>
       <HBar data={[
        { label: 'Data Analysis', value: 15.6, color: '#18181B' },
        { label: 'Python', value: 14.7, color: '#18181B' },
        { label: 'SQL', value: 8.9, color: '#18181B' },
        { label: 'Project Mgmt', value: 7.5, color: '#18181B' },
        { label: 'Java', value: 6.5, color: '#18181B' },
        { label: 'Blockchain', value: 5.0, color: '#18181B' },
        { label: 'AI / ML', value: 4.8, color: '#18181B' },
        { label: 'TypeScript', value: 4.1, color: '#18181B' },
        { label: 'JavaScript', value: 4.1, color: '#18181B' },
        { label: 'React', value: 3.9, color: '#18181B' },
        { label: 'AWS', value: 3.4, color: '#18181B' },
        { label: 'Go', value: 2.8, color: '#18181B' },
       ]} unit="%" />
      </div>
     </div>
     <Callout>Only 5% of Web3 job listings explicitly require blockchain skills. Most companies hire for Python, SQL, and data, then train crypto domain knowledge internally. Solidity does not appear in the top 30 skills.</Callout>
     <Sources>
      Source: <Cite href="https://hashtagweb3.com/jobs">Hashtag Web3</Cite>, April 2026 · <Cite href="https://survey.stackoverflow.co/2025/">Stack Overflow Developer Survey 2025</Cite> · <Cite href="https://www.linuxfoundation.org/research/open-source-jobs-report-2025">LF 2025 Open Source Jobs</Cite>
     </Sources>
    </section>

    {/* SECTION 2B: SOFT SKILLS & NON-TECHNICAL DEMAND */}
    <section className="mb-28">
     <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-5">The hidden demand: communication, compliance, and management</h2>
     <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
      <div>
       <p className="text-[15px] text-zinc-500 dark:text-zinc-400 leading-[1.85] mb-5">
        Technical skills get the headlines, but three of the top 10 skills in our dataset are non-technical: communication (11.6%), project management (7.5%), and stakeholder management (5.3%). This tells a story about where Web3 companies are in their organizational maturity. Early-stage startups need only engineers. Scaling companies need people who can coordinate across teams, communicate with regulators, and manage complex multi-stakeholder processes.
       </p>
       <p className="text-[15px] text-zinc-500 dark:text-zinc-400 leading-[1.85] mb-5">
        Regulatory compliance (5.3%) and risk management (5.2%) together appear in more than 10% of all listings. These are not engineering skills. They are institutional skills imported from traditional finance. The demand is driven by exchanges preparing for licensing under MiCA, the SEC&apos;s evolving digital asset guidance, and Hong Kong&apos;s VASP regime. Two years ago, a Web3 company&apos;s compliance department was one person with a law degree. Today, Binance alone has dozens of compliance roles open across multiple jurisdictions.
       </p>
       <p className="text-[15px] text-zinc-500 dark:text-zinc-400 leading-[1.85] mb-5">
        AML (anti-money laundering) skills appear in 2.7% of listings, almost exclusively at exchanges and compliance-focused companies like ComplyAdvantage (13 listings) and Elliptic (15 listings). These firms sell AML-as-a-service to crypto companies, and their hiring reflects the industry&apos;s growing spend on regulatory infrastructure. According to <Cite href="https://www.chainalysis.com/blog/2024-crypto-crime-report-introduction/">Chainalysis&apos; 2024 Crypto Crime Report</Cite>, crypto firms spent an estimated $3.4 billion on compliance in 2024, up 45% year-over-year.
       </p>
       <p className="text-[15px] text-zinc-500 dark:text-zinc-400 leading-[1.85]">
        Negotiation (3.3%) and cross-functional collaboration (2.7%) round out the soft skills picture. These appear primarily in business development and partnership roles at infrastructure companies. The message is clear: Web3 is past the phase where a brilliant engineer working alone in a basement can build a billion-dollar protocol. The industry now requires the same organizational muscle as traditional enterprise software.
       </p>
      </div>
      <div className="bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/40 rounded-lg p-8">
       <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-6">Non-technical skills (% of listings)</p>
       <HBar data={[
        { label: 'Communication', value: 11.6, color: '#6366f1' },
        { label: 'Project Mgmt', value: 7.5, color: '#6366f1' },
        { label: 'Reg. Compliance', value: 5.3, color: '#6366f1' },
        { label: 'Stakeholder Mgmt', value: 5.3, color: '#6366f1' },
        { label: 'Risk Management', value: 5.2, color: '#6366f1' },
        { label: 'Analytical Skills', value: 4.6, color: '#6366f1' },
        { label: 'Product Mgmt', value: 4.1, color: '#6366f1' },
        { label: 'Negotiation', value: 3.3, color: '#6366f1' },
        { label: 'AML', value: 2.7, color: '#6366f1' },
       ]} unit="%" />
      </div>
     </div>
     <Callout>Communication (11.6%) is the third most requested skill in Web3, ahead of Java, blockchain, and TypeScript. The industry needs people who can talk to regulators, not just write code.</Callout>
     <Sources>
      Source: <Cite href="https://hashtagweb3.com/jobs">Hashtag Web3</Cite>, April 2026 · <Cite href="https://www.chainalysis.com/blog/2024-crypto-crime-report-introduction/">Chainalysis Crypto Crime Report 2024</Cite>
     </Sources>
    </section>

    {/* SECTION 3: COMPENSATION */}
    <section className="mb-28">
     <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
      <div>
       <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-5">Web3 median salary: $166,000</h2>
       <p className="text-[15px] text-zinc-500 dark:text-zinc-400 leading-[1.85] mb-5">
        Of the 178 listings with explicit compensation, the median base salary is $166,000. The 25th percentile is $125,000 and the 75th is $200,000. This $75,000 interquartile range is wider than typical tech companies, reflecting the diversity of roles from junior operations associates at $65,000 to senior quant researchers clearing $298,000.
       </p>
       <p className="text-[15px] text-zinc-500 dark:text-zinc-400 leading-[1.85] mb-5">
        Quantitative research roles command the highest median at $225,000, but this figure comes from a small sample (n=5) concentrated at Citadel Securities and trading-adjacent firms. Engineering, with a much larger sample of 71 roles, sits at $185,000 median. This is roughly 15-20% above the <Cite href="https://www.levels.fyi/t/software-engineer/levels/senior">Levels.fyi median for senior software engineers</Cite> at traditional tech companies ($155k-$165k base), excluding equity.
       </p>
       <p className="text-[15px] text-zinc-500 dark:text-zinc-400 leading-[1.85] mb-5">
        These figures align with <Cite href="https://web3.career/web3-salaries">Web3.career salary data</Cite>, which reports average Web3 developer compensation at $120k-$180k depending on seniority. Our data skews higher because it includes US-based roles at Coinbase, Robinhood, and Stripe that publish salary bands under state pay transparency laws (California, Colorado, New York, Washington).
       </p>
       <p className="text-[15px] text-zinc-500 dark:text-zinc-400 leading-[1.85] mb-5">
        The salary gap between top and bottom departments is significant. Quant research ($225k) pays 2.25x what HR ($100k) does. Operations sits at $119k, reflecting the high volume of support and compliance roles at exchanges that do not require specialized engineering skills. Marketing ($168k) is surprisingly high, likely because Web3 marketing roles often require technical knowledge of tokenomics, on-chain analytics, and developer relations.
       </p>
       <p className="text-[15px] text-zinc-500 dark:text-zinc-400 leading-[1.85]">
        A major caveat: only 12% of listings disclose salary. This creates a strong selection bias. Companies publishing salary bands are disproportionately US-based (subject to transparency laws) and disproportionately large (Coinbase, Stripe, Robinhood). Smaller crypto-native companies and those based in Singapore, Dubai, or the Cayman Islands rarely disclose compensation. Many also offer significant token-based compensation that is not captured in base salary figures. A $150k base at a pre-launch protocol could include token grants worth $500k+ at launch, making direct salary comparisons incomplete.
       </p>
      </div>
      <div className="bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/40 rounded-lg p-8">
       <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-6">Median salary by department</p>
       <HBar data={[
        { label: 'Quant Research', value: 225, color: '#18181B' },
        { label: 'Engineering', value: 185, color: '#18181B' },
        { label: 'Marketing', value: 168, color: '#18181B' },
        { label: 'Finance', value: 166, color: '#18181B' },
        { label: 'Design', value: 166, color: '#18181B' },
        { label: 'Sales', value: 160, color: '#18181B' },
        { label: 'Trading', value: 150, color: '#18181B' },
        { label: 'Operations', value: 119, color: '#18181B' },
        { label: 'Human Resources', value: 100, color: '#18181B' },
       ]} unit="k" />
      </div>
     </div>
     <Callout>Quant researchers earn 2.25x what HR professionals make in Web3. Engineering sits at $185k median, 11% above the industry-wide median.</Callout>
     <Sources>
      Source: <Cite href="https://hashtagweb3.com/jobs">Hashtag Web3</Cite>, April 2026 (n=178 with disclosed salary) · <Cite href="https://web3.career/web3-salaries">Web3.career</Cite> for industry benchmarks
     </Sources>
    </section>

    {/* SECTION 4: LOCATION */}
    <section className="mb-28">
     <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
      <div>
       <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-5">42% of Web3 jobs are remote, 3x the industry average</h2>
       <p className="text-[15px] text-zinc-500 dark:text-zinc-400 leading-[1.85] mb-5">
        42.4% of Web3 listings are remote-first, compared to just 13% in the broader tech industry according to <Cite href="https://economicgraph.linkedin.com/">LinkedIn Economic Graph</Cite>. This 3x premium exists because Web3 was built by geographically distributed teams from its inception. Bitcoin had no office. Ethereum was coordinated across time zones. That DNA persists even as the industry matures and companies like Coinbase and Ripple maintain physical offices.
       </p>
       <p className="text-[15px] text-zinc-500 dark:text-zinc-400 leading-[1.85] mb-5">
        The US accounts for 13.7% of on-site roles, concentrated in San Francisco, New York, and Miami. These three cities function as the physical nerve centers of US crypto, with SF housing Coinbase and Ripple headquarters, New York hosting Gemini and most compliance-focused firms, and Miami positioning itself as a crypto-friendly regulatory environment under state-level legislation.
       </p>
       <p className="text-[15px] text-zinc-500 dark:text-zinc-400 leading-[1.85] mb-5">
        Hong Kong (3.1%) and Singapore (2.5%) are the top Asian hubs. Hong Kong's resurgence follows the <Cite href="https://www.sfc.hk/en/Rules-and-standards/Virtual-assets">SFC's virtual asset licensing regime</Cite> introduced in 2023, which brought regulatory clarity that attracted firms like OKX and Hashkey to establish licensed operations. Singapore remains attractive despite MAS tightening retail crypto access, because it offers a stable business environment for institutional-grade infrastructure.
       </p>
       <p className="text-[15px] text-zinc-500 dark:text-zinc-400 leading-[1.85] mb-5">
        Europe (including the UK) accounts for 3.3% of on-site roles. The UK leads at 1.7%, with London's fintech corridor hosting Revolut's crypto division, Elliptic, and several compliance startups. Continental Europe at 1.6% is spread across Berlin, Zurich, and Lisbon, with MiCA creating a unified regulatory framework that should increase European hiring in 2026-2027.
       </p>
       <p className="text-[15px] text-zinc-500 dark:text-zinc-400 leading-[1.85]">
        Africa (0.8%) and LATAM (1.1%) together represent 1.9% of listings. These regions punch above their weight in actual crypto adoption. According to <Cite href="https://www.chainalysis.com/blog/2023-global-crypto-adoption-index/">Chainalysis' Global Crypto Adoption Index</Cite>, Nigeria and Kenya rank in the top 15 globally for crypto usage. Wave Mobile Money (25 listings) is actively building payments infrastructure in West Africa. Bitso in Mexico is the largest crypto exchange in Latin America. As these companies scale, African and LATAM hiring will grow disproportionately.
       </p>
      </div>
      <div className="bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/40 rounded-lg p-8">
       <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-5 text-center">Location distribution</p>
       <DonutChart segments={[
        { label: 'Remote', value: 42, color: '#18181B' },
        { label: 'USA', value: 14, color: '#6366f1' },
        { label: 'Hong Kong', value: 3, color: '#14b8a6' },
        { label: 'Singapore', value: 3, color: '#f59e0b' },
        { label: 'Europe', value: 2, color: '#f43f5e' },
        { label: 'Other', value: 36, color: '#E4E4E7' },
       ]} size={180} />
      </div>
     </div>
     <Sources>
      Source: <Cite href="https://hashtagweb3.com/jobs">Hashtag Web3</Cite>, April 2026 · <Cite href="https://economicgraph.linkedin.com/">LinkedIn Economic Graph</Cite> for industry remote work baseline
     </Sources>
    </section>

    {/* SECTION 5: EXPERIENCE & SENIORITY */}
    <section className="mb-28">
     <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
      <div>
       <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-5">Web3 is hiring mid-level engineers, not juniors</h2>
       <p className="text-[15px] text-zinc-500 dark:text-zinc-400 leading-[1.85] mb-5">
        54% of listings target mid-level professionals with 3-7 years of experience. Senior roles account for 31.4%. Entry-level is just 13.7%, including 4.2% internships. Compare this to traditional tech, where entry-level roles typically represent 20-25% of listings. Web3 is not a place to get your first job. It is a place to apply experience you already have.
       </p>
       <p className="text-[15px] text-zinc-500 dark:text-zinc-400 leading-[1.85] mb-5">
        The low entry-level percentage creates a structural talent pipeline problem. If Web3 does not hire and train juniors, where will the next generation of senior Web3 engineers come from? Currently, the answer is: from traditional tech. Most Web3 engineers spent 3-5 years at companies like Google, Meta, or Stripe before transitioning. This works when crypto is growing, but creates a fragile talent supply that depends on traditional tech continuing to produce engineers who are curious about blockchain.
       </p>
       <p className="text-[15px] text-zinc-500 dark:text-zinc-400 leading-[1.85] mb-5">
        73.3% of positions are full-time. Contract roles are only 1.8%, which is remarkably low compared to traditional tech freelancing rates of 8-12% according to <Cite href="https://www.upwork.com/research/freelance-forward-2024">Upwork&apos;s Freelance Forward 2024</Cite>. Web3 companies prefer full-time commitment for two reasons: security-sensitive code requires trusted long-term contributors, and token-based compensation only works with full-time employment structures.
       </p>
       <p className="text-[15px] text-zinc-500 dark:text-zinc-400 leading-[1.85]">
        Internships at 4.2% are concentrated at the largest employers: Binance, Coinbase, and Robinhood. Smaller crypto companies rarely run internship programs because they lack the management overhead to support interns. This means that the gateway into Web3 for new graduates is almost exclusively through large centralized exchanges and fintech companies, not through the decentralized protocols that define the industry&apos;s ethos.
       </p>
      </div>
      <div className="bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/40 rounded-lg p-8">
       <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-5 text-center">Experience level</p>
       <DonutChart segments={[
        { label: 'Mid-level', value: 54, color: '#A1A1AA' },
        { label: 'Senior', value: 31, color: '#18181B' },
        { label: 'Entry', value: 14, color: '#6366f1' },
        { label: 'Internship', value: 4, color: '#14b8a6' },
       ]} size={180} />
      </div>
     </div>
     <Sources>
      Source: <Cite href="https://hashtagweb3.com/jobs">Hashtag Web3</Cite>, April 2026
     </Sources>
    </section>

    {/* SECTION 6: TOP COMPANIES */}
    <section className="mb-28">
     <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-5">Binance alone accounts for 25% of all Web3 job listings</h2>
     <p className="text-[15px] text-zinc-500 dark:text-zinc-400 leading-[1.85] mb-5">
      Binance has 366 open roles, a quarter of all listings in our dataset. This is not just a hiring push; it reflects the company&apos;s scale. Binance processes more daily trading volume than the next five exchanges combined, according to <Cite href="https://www.coingecko.com/en/exchanges">CoinGecko exchange data</Cite>. Maintaining that infrastructure requires hundreds of engineers, compliance officers, and operations staff across 40+ countries.
     </p>
     <p className="text-[15px] text-zinc-500 dark:text-zinc-400 leading-[1.85] mb-5">
      Revolut (78 listings) is the second-largest hirer, which is notable because Revolut is primarily a neobank, not a crypto company. Its crypto division, however, has grown rapidly following the UK FCA&apos;s evolving regulatory framework and MiCA in Europe. Revolut is hiring across engineering, compliance, and marketing for its crypto products, positioning itself as a mainstream onramp.
     </p>
     <p className="text-[15px] text-zinc-500 dark:text-zinc-400 leading-[1.85] mb-5">
      OKX (54), Robinhood (44), and Coinbase (38) round out the top five. The concentration is notable: the top 10 companies account for about 50% of all listings. This mirrors the broader trend in tech where a small number of large employers dominate public job boards, while smaller companies hire through referrals, Twitter, and Discord. The true count of active Web3 employers is likely 5-10x our figure of 187.
     </p>
     <p className="text-[15px] text-zinc-500 dark:text-zinc-400 leading-[1.85] mb-5">
      An interesting presence: Stripe (34 listings). Stripe is not a crypto company, but its crypto products, including fiat-to-crypto onramps and stablecoin settlement, have made it a major employer in the Web3 space. Similarly, Hadrian (19 listings) focuses on defense and manufacturing, but its engineering team works on infrastructure that overlaps with distributed systems common in blockchain.
     </p>
     <p className="text-[15px] text-zinc-500 dark:text-zinc-400 leading-[1.85] mb-8">
      Infrastructure dominates sub-sector focus at 38.1% of listings. This includes exchanges, custodians, node operators, and developer tooling. Trading (7.9%) is second, followed by DeFi at just 5.0%. The low DeFi figure is partly definitional (many DeFi companies classify themselves as infrastructure) and partly because pure DeFi protocols run with very small teams. Uniswap Labs has fewer than 100 employees managing a protocol that handles billions in monthly volume. Gaming at 0.5% reflects the sector&apos;s contraction after the 2022-2023 NFT downturn, though studios like Genies (14 listings) are still hiring for the next cycle.
     </p>
     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/40 rounded-lg p-8">
       <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-6">Largest Web3 employers (open roles)</p>
       <HBar data={[
        { label: 'Binance', value: 366, color: '#18181B' },
        { label: 'Revolut', value: 78, color: '#18181B' },
        { label: 'OKX', value: 54, color: '#18181B' },
        { label: 'Robinhood', value: 44, color: '#18181B' },
        { label: 'Coinbase', value: 38, color: '#18181B' },
        { label: 'Ripple', value: 37, color: '#18181B' },
        { label: 'Stripe', value: 34, color: '#18181B' },
       ]} />
      </div>
      <div className="bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/40 rounded-lg p-8">
       <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-6">Crypto sub-sector focus</p>
       <HBar data={[
        { label: 'Infrastructure', value: 38.1, color: '#18181B' },
        { label: 'Trading', value: 7.9, color: '#18181B' },
        { label: 'DeFi', value: 5.0, color: '#18181B' },
        { label: 'Payments', value: 2.9, color: '#18181B' },
        { label: 'Security', value: 2.5, color: '#18181B' },
        { label: 'Gaming', value: 0.5, color: '#18181B' },
       ]} unit="%" />
      </div>
     </div>
     <Callout>Infrastructure dominates at 38% of roles. DeFi is only 5%. The &ldquo;picks and shovels&rdquo; strategy, building tools rather than protocols, is where Web3 hiring is concentrated.</Callout>
     <Sources>
      Source: <Cite href="https://hashtagweb3.com/jobs">Hashtag Web3</Cite>, April 2026 · <Cite href="https://www.coingecko.com/en/exchanges">CoinGecko</Cite> for exchange volume data · 187 companies analyzed
     </Sources>
    </section>

    {/* KEY TAKEAWAYS */}
    <section className="mb-28">
     <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-8">Key takeaways for job seekers and hiring managers</h2>
     <div className="space-y-6">
      <div className="bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/40 rounded-lg p-8">
       <h3 className="font-serif font-bold text-lg text-zinc-900 dark:text-zinc-50 mb-3">For candidates transitioning from traditional tech</h3>
       <p className="text-[15px] text-zinc-500 dark:text-zinc-400 leading-[1.85]">
        You do not need blockchain experience to get hired in Web3. 95% of listings ask for skills you already have: Python, SQL, data analysis, project management, TypeScript. The barrier to entry is lower than the industry&apos;s reputation suggests. Target mid-level roles at large employers (Binance, Coinbase, Revolut) where structured onboarding programs exist. Expect a 15-20% salary premium over equivalent roles at traditional tech companies.
       </p>
      </div>
      <div className="bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/40 rounded-lg p-8">
       <h3 className="font-serif font-bold text-lg text-zinc-900 dark:text-zinc-50 mb-3">For hiring managers at Web3 companies</h3>
       <p className="text-[15px] text-zinc-500 dark:text-zinc-400 leading-[1.85]">
        The data shows a clear junior talent pipeline problem. With only 13.7% entry-level roles, the industry is creating a dependency on poaching mid-career engineers from FAANG companies. Consider investing in internship programs and junior roles now. The cost of not building a pipeline is higher long-term. Also: publishing salary bands is table stakes. The 88% of listings that hide compensation are losing candidates to the 12% that show it.
       </p>
      </div>
      <div className="bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/40 rounded-lg p-8">
       <h3 className="font-serif font-bold text-lg text-zinc-900 dark:text-zinc-50 mb-3">For investors evaluating Web3 companies</h3>
       <p className="text-[15px] text-zinc-500 dark:text-zinc-400 leading-[1.85]">
        Hiring patterns are a strong signal of company health and sector direction. Engineering at 34% tells you the industry is still building, not optimizing. The 6.3% compliance and legal figure indicates real institutional maturation, not just regulatory theater. Watch for shifts in the DeFi hiring percentage (currently 5%): when that number climbs, it signals renewed builder activity in decentralized finance. Monitor Africa and LATAM hiring as leading indicators for the next wave of crypto adoption.
       </p>
      </div>
     </div>
    </section>

    {/* METHODOLOGY */}
    <section className="mb-16">
     <h2 className="text-2xl font-serif font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-5">Methodology</h2>
     <p className="text-[15px] text-zinc-500 dark:text-zinc-400 leading-[1.85] mb-5">
      Data was collected from 1,466 job listings aggregated from Greenhouse, Lever, Ashby, and Workable ATS platforms across 187 Web3 companies. Each listing was fetched at its source URL, and the full job description text was processed using GPT-4o-mini for structured extraction of skills, compensation, department, seniority, location, employment type, and crypto sub-sector focus.
     </p>
     <p className="text-[15px] text-zinc-500 dark:text-zinc-400 leading-[1.85] mb-5">
      Skills were normalized to a canonical list (e.g., &ldquo;React.js&rdquo; and &ldquo;ReactJS&rdquo; mapped to &ldquo;React&rdquo;). Compensation was extracted only when explicit salary ranges or figures appeared in the listing text. We did not impute or estimate salaries for listings that did not disclose them. All percentages are calculated against the full dataset of 1,466 listings unless otherwise noted. Sample sizes are flagged for departments with fewer than 10 salary data points.
     </p>
     <p className="text-[15px] text-zinc-500 dark:text-zinc-400 leading-[1.85] mb-5">
      Key limitations: Our dataset captures jobs posted through structured ATS platforms. DAOs, protocol teams, and smaller crypto startups that hire through Twitter, Discord, or direct outreach are underrepresented. The salary data (n=178, or 12% of listings) is biased toward US-based companies subject to pay transparency laws. Token-based compensation is not captured. Geographic categorization is based on listing location, not where the work is actually performed.
     </p>
     <p className="text-[15px] text-zinc-500 dark:text-zinc-400 leading-[1.85]">
      This report was produced by <Cite href="https://hashtagweb3.com">Hashtag Web3</Cite> in April 2026. Data is refreshed daily via automated ATS polling. For the full dataset, visit our <Cite href="https://hashtagweb3.com/jobs">jobs page</Cite>. For questions about methodology or data access, contact us at <Cite href="https://t.me/web3hiring">@web3hiring on Telegram</Cite>.
     </p>
    </section>

   </main>
  </div>
 );
}
