import Link from 'next/link';
import type { ReactNode } from 'react';
import { PageHeader } from '@/components/page-header';
import { PageShell } from '@/components/page-shell';
import { fmtInt, fmtUsd, hiringReportStats as s } from '@/lib/hiring-report-stats';

export const dynamic = 'force-static';

type CountRow = { label: string; count: number; pct: number };
const paragraph = 'text-base leading-relaxed text-muted-foreground';
const heading = 'mb-5 text-2xl font-bold tracking-tight sm:text-3xl';
const card = 'rounded-2xl border border-border/70 bg-card p-6 sm:p-8';
const linkStyle = 'font-medium text-foreground underline decoration-border underline-offset-4 hover:decoration-primary';
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
      <figcaption className="mb-6 text-sm font-semibold">{title}</figcaption>
      <ul className="space-y-4">
        {rows.map(row => (
          <li key={row.label}>
            <div className="mb-1.5 flex items-start justify-between gap-4 text-sm">
              <span className="min-w-0 break-words">{row.label}</span>
              <span className="shrink-0 font-semibold tabular-nums">{row.pct}%</span>
            </div>
            <div aria-hidden="true" className="h-2 rounded-full bg-muted">
              <div className="h-full rounded-full bg-foreground/80" style={{ width: `${row.pct}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </figure>
  );
}

function Section({ id, title, children, chart }: { id: string; title: string; children: ReactNode; chart?: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-24">
      <div className={chart ? 'grid gap-8 lg:grid-cols-2 lg:gap-12' : ''}>
        <div>
          <h2 id={`${id}-heading`} className={heading}>{title}</h2>
          <div className="space-y-5">{children}</div>
        </div>
        {chart}
      </div>
    </section>
  );
}

export default function Web3HiringReport() {
  return (
    <main id="main-content" className="bg-background text-foreground">
      <PageShell containerClassName="space-y-16 pb-16 md:space-y-20">
        <header className="mx-auto max-w-4xl text-center">
          <p className="mb-4 text-sm text-muted-foreground">Job-board snapshot · {s.snapshotLabel}</p>
          <PageHeader
            align="center"
            className="mb-0 [&_h1]:text-balance [&_p]:max-w-3xl [&_p]:leading-relaxed"
            title={`The Web3 Hiring Report ${s.year}`}
            description="Job functions, skills mentioned in descriptions, salary ranges, and remote-work wording across the listings on Hashtag Web3."
          />
          <nav aria-label="Report sections" className="mt-7 flex flex-wrap justify-center gap-x-5 gap-y-3 text-sm">
            <a className={linkStyle} href="#functions">Job functions</a>
            <a className={linkStyle} href="#skills">Skills</a>
            <a className={linkStyle} href="#experience">Experience</a>
            <a className={linkStyle} href="#work-arrangements">Work arrangements</a>
            <a className={linkStyle} href="#salary">Salary sample</a>
            <a className={linkStyle} href="#methodology">Methodology &amp; data</a>
          </nav>
        </header>

        <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { value: `${engineering.pct}%`, label: 'Classified as engineering' },
            { value: `${python.pct}%`, label: 'Descriptions mention Python' },
            { value: `${s.remote.location.pct}%`, label: 'Location field mentions remote' },
            { value: `${s.top10SharePct}%`, label: 'Listings from the top ten employers' },
          ].map(item => (
            <div key={item.label} className={`${card} flex flex-col-reverse gap-3 text-center`}>
              <dt className="min-h-10 text-sm text-muted-foreground">{item.label}</dt>
              <dd className="text-3xl font-bold tracking-tight tabular-nums sm:text-4xl">{item.value}</dd>
            </div>
          ))}
        </dl>

        <Section id="summary" title="What the listings show">
          <p className={paragraph}>
            Engineering is the largest classified function, at {engineering.pct}% of listings in this sample.
            The ten employers with the most listings account for {s.top10SharePct}% of the snapshot.
            {' '}{s.topCompanies[0].label} represents {s.topCompanies[0].pct}% of listings, followed by {s.topCompanies[1].label} at {s.topCompanies[1].pct}% and {s.topCompanies[2].label} at {s.topCompanies[2].pct}%.
          </p>
          <p className={paragraph}>
            The sample includes payments companies, trading firms, exchanges, and other employers covered by this job board.
            Their listings can include work unrelated to blockchain. These counts describe the board on {s.snapshotLabel}; they are not a census of Web3 employment or a count of people hired.
          </p>
        </Section>

        <Section id="functions" title="Job functions" chart={<Chart title="Share of all listings by classified function" rows={s.departments} />}>
          <p className={paragraph}>
            Engineering accounts for {engineering.pct}% of listings. Sales and business development account for {sales.pct}%.
            The chart includes every category, including records that could not be classified.
          </p>
          <p className={paragraph}>
            Each listing is assigned one category using its department field first, then its title if the department does not match.
            A role can span several functions, so this is a text-based grouping rather than an employer-confirmed breakdown of responsibilities.
          </p>
          <p className={paragraph}>
            Vacancy counts do not measure the size of existing teams. They also cannot show whether an employer is expanding or replacing someone who left.
          </p>
        </Section>

        <Section id="skills" title="Skills and technical terms in descriptions" chart={<Chart title="Listings whose description contains each term" rows={s.keywords} />}>
          <p className={paragraph}>
            Python appears in {python.pct}% of descriptions and SQL in {sql.pct}%.
            The chart also counts specific technologies and work-related phrases, including AWS, risk management, and anti-money laundering.
          </p>
          <p className={paragraph}>
            AI, machine-learning, or large-language-model terms appear in {ai.pct}% of descriptions.
            A mention may come from a responsibility, a qualification, or the employer&apos;s company description. It does not establish that the role requires that skill.
          </p>
          <p className={paragraph}>
            A listing counts once for each matching term, however often that term appears. It can count in several rows.
            Common company text can appear in many listings, and ordinary uses of words such as &ldquo;react&rdquo; can match too.
            These are word counts, not a ranking of required skills.
          </p>
        </Section>

        <Section id="skills-by-function" title="How skill mentions differ by function">
          <p className={paragraph}>
            Python appears in {engineeringPython.pct}% of engineering descriptions, compared with {salesPython.pct}% of sales and business-development descriptions.
            The table compares the same terms across four job functions. Each percentage uses the listings in that column as its denominator.
          </p>
          <p className={paragraph}>
            The searches include the whole description, including company introductions and benefits text.
            A term appearing in a sales listing, for example, may describe the product being sold rather than a skill the applicant needs.
          </p>
          <p className="text-xs text-muted-foreground sm:hidden">Swipe the table to compare all four functions.</p>
          <div className="overflow-x-auto rounded-2xl border border-border/70" tabIndex={0} role="region" aria-label="Skill mentions by job function">
            <table className="w-full min-w-[42rem] text-left text-sm">
              <caption className="px-5 py-4 text-left font-semibold">Share of descriptions within each function</caption>
              <thead className="border-y border-border/70 bg-muted/40">
                <tr>
                  <th scope="col" className="px-5 py-4 font-medium">Term</th>
                  {s.skillsByFunction.map(group => (
                    <th key={group.label} scope="col" className="px-4 py-4 text-right align-top font-medium">
                      {group.label}
                      <span className="mt-1 block text-xs font-normal text-muted-foreground">n = {fmtInt(group.n)}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {engineeringSkills.skills.map((skill, index) => (
                  <tr key={skill.label}>
                    <th scope="row" className="px-5 py-3 font-normal">{skill.label}</th>
                    {s.skillsByFunction.map(group => (
                      <td key={group.label} className="px-4 py-3 text-right tabular-nums">{group.n ? `${group.skills[index].pct}%` : 'No listings'}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section id="seniority" title="What titles say about seniority" chart={<Chart title="Seniority terms in job titles" rows={s.seniority} />}>
          <p className={paragraph}>
            Entry-level, junior, graduate, and internship terms appear in {entry.pct}% of titles.
            Separate groups identify senior or lead titles and director or executive titles.
          </p>
          <p className={paragraph}>
            {unspecified.pct}% of titles contain none of the seniority terms used here.
            They are left unclassified by level. A title such as &ldquo;Software Engineer&rdquo; does not, by itself, establish whether a role is junior, mid-level, or senior.
          </p>
          <p className={paragraph}>
            Experience requirements may appear only in the description. Candidates should check those requirements rather than use this title classification to decide whether to apply.
          </p>
        </Section>

        <Section id="experience" title="Years of experience stated in descriptions" chart={<Chart title="General or role experience: share of all listings" rows={s.experience.rows} />}>
          <p className={paragraph}>
            {s.experience.matched.pct}% of descriptions contain a general or role-experience request that can be assigned to one band under the rules used here.
            The most common matched band is {experienceBand.label}, at {experienceBand.pct}% of all listings.
          </p>
          <p className={paragraph}>
            Ranges use their lower number: &ldquo;3–5 years&rdquo; is grouped under 3–5, and &ldquo;5+ years&rdquo; is grouped by its stated starting point of five.
            The groups do not set an upper limit on the experience an employer would accept.
          </p>
          <p className={paragraph}>
            Requests for experience with a named tool are recorded separately. For example, five years of software-engineering experience and two years using Python are two different requests.
            {s.experience.specificSkillYears.pct}% of listings contain a matched request tied to a named skill or tool.
          </p>
          <p className={paragraph}>
            Preferred qualifications and company-history statements are excluded from the year bands.
            Multiple different general or role-experience requests, and degree-dependent alternatives, stay in a separate category.
            An unmatched description may still state an experience requirement in another form.
          </p>
        </Section>

        <Section id="salary" title="A limited sample of annual salary ranges" chart={<Chart title={`Range midpoints in the salary sample (${fmtInt(s.salary.n)} listings)`} rows={s.salary.bands} />}>
          <p className={paragraph}>
            {s.salary.pctOfListings}% of descriptions meet the salary rules below: {fmtInt(s.salary.n)} listings from {fmtInt(s.salary.employers)} employers.
            {s.salary.medianMidpoint !== null && <> The median of their range midpoints is {fmtUsd(s.salary.medianMidpoint)} per year.</>}
            {' '}This is a summary of advertised ranges in that subset, not the median salary paid across Web3.
          </p>
          <p className={paragraph}>
            A description must state a salary range and an annual pay period in the same paragraph.
            We accept explicit US-dollar wording, or dollar ranges attached to a US location without a conflicting currency marker.
            Hourly and monthly rates, single amounts, total-compensation ranges, and descriptions with multiple distinct qualifying ranges are excluded.
          </p>
          <p className={paragraph}>
            For each included listing, the midpoint is halfway between the stated minimum and maximum.
            The chart groups those midpoints, not individual salaries or accepted offers. Bonuses, equity, and tokens are not valued or added.
          </p>
          <p className={paragraph}>
            The largest contributors to this salary sample are {s.salary.topEmployers.map((employer, index) => (
              <span key={employer.label}>{index ? '; ' : ''}{employer.label} ({employer.pct}%)</span>
            ))}. The median therefore reflects which employers publish ranges that meet the extraction rules.
          </p>
          <p className={paragraph}>
            A description that does not meet these rules may still disclose pay in another format or currency.
            <a className={linkStyle} href="/data/hiring-report-salary-sample.json"> Download the salary sample</a> to inspect each range and its original wording.
          </p>
        </Section>

        <Section id="remote" title="Remote wording and listed locations" chart={<Chart title="Most common location labels: share of all listings" rows={s.locations} />}>
          <p className={paragraph}>
            {s.remote.location.pct}% of location fields contain &ldquo;remote.&rdquo;
            In descriptions, &ldquo;remote&rdquo; or &ldquo;work from home&rdquo; appears in {s.remote.description.pct}%,
            while &ldquo;hybrid&rdquo; appears in {s.remote.hybrid.pct}%.
          </p>
          <p className={paragraph}>
            These groups overlap. A description may discuss a remote team, a restricted work arrangement, or a role that is not remote.
            Word matches do not confirm eligibility to work from any country. Check the employer&apos;s location, office-attendance, and work-authorization requirements.
          </p>
          <p className={paragraph}>
            Location labels are shown as supplied. &ldquo;New York&rdquo; and &ldquo;New York, NY&rdquo; remain separate, and a multi-city label is counted once.
            This avoids assigning ambiguous listings to a country or treating &ldquo;remote&rdquo; as a geographic region.
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

        <Section id="employer-comparison" title="Top ten employers compared with the rest">
          <p className={paragraph}>
            Among the ten employers with the most listings, {salesComparison.top.pct}% of roles are classified as sales and business development.
            The corresponding share at the other employers is {salesComparison.other.pct}%.
            Rust mentions run the other way: {rustComparison.top.pct}% in the top-ten group and {rustComparison.other.pct}% in the rest.
          </p>
          <p className={paragraph}>
            The groups are defined by listing count, not company size or employee headcount.
            Each listing has equal weight within its group. These comparisons show how the current mix of employers affects the board&apos;s totals; they do not measure a change over time.
          </p>
          <p className="text-xs text-muted-foreground sm:hidden">Swipe the table to see both groups and the difference.</p>
          <div className="overflow-x-auto rounded-2xl border border-border/70" tabIndex={0} role="region" aria-label="Top ten employers compared with remaining employers">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <caption className="px-5 py-4 text-left font-semibold">Share of listings within each employer group</caption>
              <thead className="border-y border-border/70 bg-muted/40">
                <tr>
                  <th scope="col" className="px-5 py-4 font-medium">Measure</th>
                  <th scope="col" className="px-4 py-4 text-right font-medium">Top ten<span className="mt-1 block text-xs font-normal text-muted-foreground">n = {fmtInt(s.employerComparison.top.n)}</span></th>
                  <th scope="col" className="px-4 py-4 text-right font-medium">Other employers<span className="mt-1 block text-xs font-normal text-muted-foreground">n = {fmtInt(s.employerComparison.other.n)}</span></th>
                  <th scope="col" className="px-4 py-4 text-right font-medium">Difference<span className="mt-1 block text-xs font-normal text-muted-foreground">Percentage points</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {s.employerComparison.rows.map(row => (
                  <tr key={row.label}>
                    <th scope="row" className="px-5 py-3 font-normal">{row.label}</th>
                    <td className="px-4 py-3 text-right tabular-nums">{row.top.pct}%</td>
                    <td className="px-4 py-3 text-right tabular-nums">{row.other.pct}%</td>
                    <td className="px-4 py-3 text-right tabular-nums">{row.differencePp > 0 ? '+' : ''}{row.differencePp.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-muted-foreground">Difference is the top-ten percentage minus the other-employer percentage, using the displayed rounded values.</p>
        </Section>

        <Section id="methodology" title="Methodology and downloadable data">
          <p className={paragraph}>
            This analysis was generated on {s.snapshotLabel} from {fmtInt(s.listings)} stored listings across {fmtInt(s.companies)} employers and their description files.
            It includes listings not marked inactive, deduplicated by source identity. {s.withDescription.pct}% have at least 100 characters of description text after HTML is removed.
            That threshold measures text availability, not completeness or accuracy.
          </p>
          <p className={paragraph}>
            Keyword counts use description text only. Function categories use department fields and titles; seniority categories use titles only.
            Percentages use all {fmtInt(s.listings)} listings unless a smaller group is named. The skills-by-function table uses each function&apos;s listings;
            the employer comparison uses each employer group; the salary distribution uses the qualifying salary sample.
            Percentages are rounded to one decimal place and may not sum to exactly 100%.
          </p>
          <p className={paragraph}>
            Experience and work-arrangement categories use fixed phrase-matching rules on description text.
            Experience bands require a numbered request in a qualifications section or direct request wording. Years tied to named tools are kept separate.
            Only the supported phrases, numbers, and location names are matched; other wording stays unclassified.
            These automated categories have not been checked against every employer&apos;s current posting.
          </p>
          <p className={paragraph}>
            The analysis does not infer hiring rates from listing dates, estimate salaries where amounts are absent, or compare this snapshot with differently measured older reports.
            A listing present in the catalog may have changed or closed since it was collected. The employer&apos;s current posting is the place to confirm availability and terms.
          </p>
          <ul className="space-y-3 text-sm">
            <li><a className={linkStyle} href="/data/hiring-report-stats.json">Download the report figures and input-file checksums (JSON)</a></li>
            <li><a className={linkStyle} href="/data/hiring-report-salary-sample.json">Download the salary ranges, excerpts, and listing links (JSON)</a></li>
            <li><a className={linkStyle} href="/data/hiring-report-analysis-evidence.json">Download the per-listing skill matches, experience excerpts, and work-arrangement excerpts (JSON)</a></li>
            <li><a className={linkStyle} href="https://github.com/vedangvatsa/Web3-Jobs/blob/main/scripts/compute-hiring-report-stats.ts">View the calculation script</a></li>
            <li><Link className={linkStyle} href="/jobs">Browse the current jobs board</Link></li>
          </ul>
        </Section>
      </PageShell>
    </main>
  );
}
