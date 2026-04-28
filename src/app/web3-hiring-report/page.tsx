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
            We analyzed <Cite href="https://hashtagweb3.com/jobs">1,502 active job listings</Cite> across 187 Web3 companies. This report breaks down what those listings reveal about skills, compensation, departments, locations, and the state of crypto hiring.
          </p>
        </div>

        {/* BIG NUMBERS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-zinc-200 dark:bg-zinc-800/50 rounded-2xl overflow-hidden mb-28">
          {[
            { value: '1,502', label: 'Active job listings analyzed', sub: 'April 2026' },
            { value: '187', label: 'Web3 companies hiring', sub: 'From Binance to Polymarket' },
            { value: '$166k', label: 'Median salary (where listed)', sub: 'Range: $65k–$298k' },
            { value: '42%', label: 'Roles are remote-first', sub: '622 of 1,502 listings' },
          ].map((d, i) => (
            <div key={i} className="bg-[#fafafa] dark:bg-black p-8 sm:p-10">
              <BigNum {...d} />
            </div>
          ))}
        </div>

        {/* SECTION 1: DEPARTMENT BREAKDOWN */}
        <section className="mb-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            <div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-5">1 in 3 Web3 roles is engineering</h2>
              <p className="text-[15px] text-zinc-500 dark:text-zinc-400 leading-[1.85] mb-5">
                34.4% of all listings are engineering roles. Operations is a distant second at 10.6%, followed by marketing at 8.9%. This engineering-heavy distribution is consistent with <Cite href="https://www.developerreport.com/">Electric Capital&apos;s Developer Report</Cite>, which shows monthly active Web3 developers growing 39% year-over-year through 2025.
              </p>
              <p className="text-[15px] text-zinc-500 dark:text-zinc-400 leading-[1.85]">
                Finance (5.0%) and compliance (2.5%) together represent 7.5% of roles — reflecting the industry&apos;s maturation as regulatory frameworks like <Cite href="https://www.esma.europa.eu/esmas-activities/digital-finance-and-innovation/markets-crypto-assets-regulation-mica">MiCA</Cite> come into force. Trading desks account for just 0.9% of listings, concentrated at Citadel Securities and Binance.
              </p>
            </div>
            <div className="bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/40 rounded-2xl p-8">
              <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-6">Department distribution (% of listings)</p>
              <HBar data={[
                { label: 'Engineering', value: 34.4, color: '#18181B' },
                { label: 'Operations', value: 10.6, color: '#27272A' },
                { label: 'Marketing', value: 8.9, color: '#3F3F46' },
                { label: 'Finance', value: 5.0, color: '#52525B' },
                { label: 'Sales & BD', value: 5.8, color: '#71717A' },
                { label: 'Product & Design', value: 4.1, color: '#A1A1AA' },
                { label: 'Compliance & Legal', value: 4.1, color: '#D4D4D8' },
              ]} unit="%" />
            </div>
          </div>
          <Sources>
            Source: <Cite href="https://hashtagweb3.com/jobs">Hashtag Web3</Cite>, April 2026 · <Cite href="https://www.developerreport.com/">Electric Capital Developer Report 2025</Cite>
          </Sources>
        </section>

        {/* SECTION 2: SKILLS */}
        <section className="mb-28">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-5">Python and data analysis dominate Web3 skill demand</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            <div>
              <p className="text-[15px] text-zinc-500 dark:text-zinc-400 leading-[1.85] mb-5">
                Data analysis (15.6%) and Python (14.7%) are the most requested skills across all Web3 listings. SQL follows at 8.9%. This mirrors the broader tech industry trend identified in the <Cite href="https://survey.stackoverflow.co/2025/">2025 Stack Overflow Developer Survey</Cite>, where Python saw its largest adoption jump in a decade.
              </p>
              <p className="text-[15px] text-zinc-500 dark:text-zinc-400 leading-[1.85] mb-5">
                Blockchain-specific skills appear in only 5.0% of listings, suggesting most Web3 companies hire for general engineering talent first and train domain expertise on the job. AI/ML skills appear in 4.8% of listings — lower than the broader tech industry&apos;s 25%, according to <Cite href="https://www.linuxfoundation.org/research/open-source-jobs-report-2025">Linux Foundation 2025</Cite>.
              </p>
              <p className="text-[15px] text-zinc-500 dark:text-zinc-400 leading-[1.85]">
                TypeScript and JavaScript are tied at 4.1% each. React appears in 3.9%. Go and distributed systems each appear in ~3%, reflecting the infrastructure-heavy nature of blockchain companies.
              </p>
            </div>
            <div className="bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/40 rounded-2xl p-8">
              <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-6">Most in-demand skills (% of listings)</p>
              <HBar data={[
                { label: 'Data Analysis', value: 15.6, color: '#18181B' },
                { label: 'Python', value: 14.7, color: '#18181B' },
                { label: 'SQL', value: 8.9, color: '#18181B' },
                { label: 'Project Management', value: 7.5, color: '#18181B' },
                { label: 'Java', value: 6.5, color: '#18181B' },
                { label: 'Blockchain', value: 5.0, color: '#18181B' },
                { label: 'AI / ML', value: 4.8, color: '#18181B' },
                { label: 'TypeScript', value: 4.1, color: '#18181B' },
                { label: 'React', value: 3.9, color: '#18181B' },
              ]} unit="%" />
            </div>
          </div>
          <Callout>Only 5% of Web3 job listings explicitly require blockchain skills. Most companies hire for Python, SQL, and data — then train crypto domain knowledge internally.</Callout>
          <Sources>
            Source: <Cite href="https://hashtagweb3.com/jobs">Hashtag Web3</Cite>, April 2026 · <Cite href="https://survey.stackoverflow.co/2025/">Stack Overflow Developer Survey 2025</Cite> · <Cite href="https://www.linuxfoundation.org/research/open-source-jobs-report-2025">LF 2025 Tech Talent</Cite>
          </Sources>
        </section>

        {/* SECTION 3: COMPENSATION */}
        <section className="mb-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            <div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-5">Web3 median salary: $166,000</h2>
              <p className="text-[15px] text-zinc-500 dark:text-zinc-400 leading-[1.85] mb-5">
                Of the 178 listings with explicit compensation, the median base salary is $166,000. The 25th percentile is $125,000 and the 75th is $200,000. Quantitative research roles command the highest median at $225,000, followed by engineering at $185,000.
              </p>
              <p className="text-[15px] text-zinc-500 dark:text-zinc-400 leading-[1.85] mb-5">
                These figures align with <Cite href="https://web3.career/web3-salaries">Web3.career salary data</Cite>, which reports average Web3 developer compensation at $120k–$180k depending on seniority. Our data skews higher because it includes US-based roles at companies like Coinbase, Robinhood, and Stripe that publish salary bands.
              </p>
              <p className="text-[15px] text-zinc-500 dark:text-zinc-400 leading-[1.85]">
                Operations and HR roles sit significantly lower at $100k–$119k median. Note: only 12% of listings disclose salary, which creates a selection bias toward US companies subject to pay transparency laws.
              </p>
            </div>
            <div className="bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/40 rounded-2xl p-8">
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
          <Callout>Quant researchers earn 2.25x what HR professionals make in Web3. Engineering sits at $185k median — 11% above the industry-wide median.</Callout>
          <Sources>
            Source: <Cite href="https://hashtagweb3.com/jobs">Hashtag Web3</Cite>, April 2026 (n=178 with disclosed salary) · <Cite href="https://web3.career/web3-salaries">Web3.career</Cite> for industry benchmarks
          </Sources>
        </section>

        {/* SECTION 4: LOCATION */}
        <section className="mb-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            <div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-5">42% of Web3 jobs are remote — 3x the industry average</h2>
              <p className="text-[15px] text-zinc-500 dark:text-zinc-400 leading-[1.85] mb-5">
                42.4% of Web3 listings are remote-first, compared to just 13% in the broader tech industry according to <Cite href="https://economicgraph.linkedin.com/">LinkedIn Economic Graph</Cite>. This is Web3&apos;s defining labor market advantage — built on a culture of distributed teams and asynchronous coordination inherited from open-source development.
              </p>
              <p className="text-[15px] text-zinc-500 dark:text-zinc-400 leading-[1.85]">
                The US accounts for 13.7% of on-site roles. Hong Kong (3.1%) and Singapore (2.5%) are the top Asian hubs. Africa and LATAM together represent 1.9% — small but growing as companies like Wave Mobile Money and Bitso expand regional operations.
              </p>
            </div>
            <div className="bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/40 rounded-2xl p-8">
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
                54% of listings target mid-level professionals (3–7 years experience). Senior roles account for 31.4%. Entry-level is just 13.7% — including 4.2% internships. This pattern reflects the industry&apos;s shift from experimentation to execution.
              </p>
              <p className="text-[15px] text-zinc-500 dark:text-zinc-400 leading-[1.85]">
                73.3% of positions are full-time. Contract roles are only 1.8%, which is low compared to traditional tech freelancing rates. Web3 companies prefer full-time commitment, likely because of the security-sensitive nature of blockchain development.
              </p>
            </div>
            <div className="bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/40 rounded-2xl p-8">
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
          <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-5">Binance alone accounts for 24% of all Web3 job listings</h2>
          <p className="text-[15px] text-zinc-500 dark:text-zinc-400 leading-[1.85] mb-8">
            Binance has 366 open roles — nearly a quarter of all listings. Revolut (78), OKX (54), Robinhood (44), and Coinbase (38) round out the top five. The concentration is striking: the top 10 companies account for over 55% of all listings. Smaller protocols and DAOs — which make up the &ldquo;long tail&rdquo; of Web3 — typically hire through informal channels not captured in structured job boards.
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/40 rounded-2xl p-8">
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
            <div className="bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/40 rounded-2xl p-8">
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
          <Callout>Infrastructure dominates at 38% of roles. DeFi is only 5%. The &ldquo;picks and shovels&rdquo; strategy — building tools rather than protocols — is where Web3 hiring is concentrated.</Callout>
          <Sources>
            Source: <Cite href="https://hashtagweb3.com/jobs">Hashtag Web3</Cite>, April 2026 · 187 companies analyzed across exchanges, DeFi, infrastructure, and gaming
          </Sources>
        </section>

        {/* METHODOLOGY */}
        <section className="mb-16">
          <h2 className="text-2xl font-serif font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-5">Methodology</h2>
          <p className="text-[15px] text-zinc-500 dark:text-zinc-400 leading-[1.85] mb-5">
            Data was collected from 1,502 job listings aggregated from Greenhouse, Lever, Ashby, and Workable ATS platforms across 187 Web3 companies. Listings were processed using GPT-4o-mini for structured extraction of skills, compensation, department, seniority, and location. Compensation data is available for 178 listings (12%), creating a selection bias toward US companies subject to pay transparency laws. All percentages are calculated against the full dataset of 1,502 listings unless otherwise noted.
          </p>
          <p className="text-[15px] text-zinc-500 dark:text-zinc-400 leading-[1.85]">
            This report was produced by <Cite href="https://hashtagweb3.com">Hashtag Web3</Cite> in April 2026. Data is refreshed daily. For the full dataset, visit our <Cite href="https://hashtagweb3.com/jobs">jobs page</Cite>.
          </p>
        </section>

      </main>
    </div>
  );
}
