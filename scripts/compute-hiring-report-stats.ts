import { mkdirSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { annualUsdRange, department, keywordRules, median, percentage } from './lib/hiring-report-analysis';
import { seniority } from './lib/hiring-report-analysis';
import { loadHiringReportInput } from './lib/hiring-report-input';
import { experienceRequirements, remoteArrangement } from './lib/hiring-report-details';

const root = process.cwd();
const { records, inputSha256, excludedRows } = loadHiringReportInput(root);
const jobs = records.map(record => record.job);

const n = records.length;
function distribution(values: string[], denominator = n) {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) || 0) + 1);
  return [...counts].map(([label, count]) => ({ label, count, pct: percentage(count, denominator) }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}
const companies = distribution(jobs.map(job => job.company.trim()));
const topCompanies = companies.slice(0, 10);
const analysisRecords = records.map(({ job, text }) => ({
  company: job.company.trim(),
  title: job.title,
  url: `https://hashtagweb3.com/${job.slug}`,
  function: department(job.title, String(job.department || '')),
  keywords: keywordRules.filter(([, pattern]) => pattern.test(text)).map(([label]) => label),
  remoteLocation: /\bremote\b/i.test(job.location || ''),
  experience: experienceRequirements(text),
  arrangement: remoteArrangement(text),
}));
const functionLabels = ['Engineering', 'Product & Design', 'Sales & Business Development', 'Compliance & Legal'];
const skillsByFunction = functionLabels.map(label => {
  const cohort = analysisRecords.filter(row => row.function === label);
  return {
    label, n: cohort.length,
    skills: keywordRules.map(([skill]) => {
      const count = cohort.filter(row => row.keywords.includes(skill)).length;
      return { label: skill, count, pct: percentage(count, cohort.length) };
    }),
  };
});
const topNames = new Set(topCompanies.map(company => company.label));
const topCohort = analysisRecords.filter(row => topNames.has(row.company));
const otherCohort = analysisRecords.filter(row => !topNames.has(row.company));
type AnalysisRecord = typeof analysisRecords[number];
const comparisons: [string, (row: AnalysisRecord) => boolean][] = [
  ['Engineering roles', row => row.function === 'Engineering'],
  ['Sales & business development roles', row => row.function === 'Sales & Business Development'],
  ['Compliance & legal roles', row => row.function === 'Compliance & Legal'],
  ['AI / machine learning / LLM mentions', row => row.keywords.includes('AI / machine learning / LLM')],
  ['Python mentions', row => row.keywords.includes('Python')],
  ['SQL mentions', row => row.keywords.includes('SQL')],
  ['Rust mentions', row => row.keywords.includes('Rust')],
  ['Solidity mentions', row => row.keywords.includes('Solidity')],
  ['Remote in location field', row => row.remoteLocation],
];
const employerComparison = {
  top: { n: topCohort.length, employers: topNames.size },
  other: { n: otherCohort.length, employers: companies.length - topNames.size },
  rows: comparisons.map(([label, match]) => {
    const topCount = topCohort.filter(match).length;
    const otherCount = otherCohort.filter(match).length;
    const top = { count: topCount, pct: percentage(topCount, topCohort.length) };
    const other = { count: otherCount, pct: percentage(otherCount, otherCohort.length) };
    return { label, top, other, differencePp: Math.round((top.pct - other.pct) * 10) / 10 };
  }),
};
const experienceOrder = ['0–2 years', '3–5 years', '6–9 years', '10+ years', 'Multiple or conditional requirements', 'No matched general / role requirement'];
const experienceRows = distribution(analysisRecords.map(row => row.experience.label));
const matchedExperience = analysisRecords.filter(row => row.experience.lowerYears !== null).length;
const requiredSkillYears = analysisRecords.filter(row => row.experience.evidence.some(item => item.request === 'required' && item.scope === 'specific skill')).length;
const arrangementOrder = ['Worldwide remote wording', 'Remote with location / time-zone conditions', 'Hybrid / scheduled office attendance', 'On-site wording', 'Conditional or conflicting arrangements', 'No clear arrangement matched'];
const arrangementRows = distribution(analysisRecords.map(row => row.arrangement.label));
const withDescription = records.filter(({ text }) => text.replace(/\s+/g, ' ').length >= 100).length;
const keywordCounts = keywordRules.map(([label, pattern]) => {
  const count = records.filter(({ text }) => pattern.test(text)).length;
  return { label, count, pct: percentage(count, n) };
}).sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
const remoteInDescription = records.filter(({ text }) => /\bremote\b|\bwork(?:ing)? from home\b/i.test(text)).length;
const remoteInLocation = jobs.filter(job => /\bremote\b/i.test(job.location || '')).length;
const hybridInDescription = records.filter(({ text }) => /\bhybrid\b/i.test(text)).length;
const salaryEvidence = records.flatMap(({ job, text }) => {
  const range = annualUsdRange(text, job.location || '');
  return range ? [{ company: job.company, title: job.title, url: `https://hashtagweb3.com/${job.slug}`, location: job.location, ...range }] : [];
});
const salaryN = salaryEvidence.length;
const salaryBands = [
  { label: 'Below $100,000', count: salaryEvidence.filter(item => item.midpoint < 100_000).length },
  { label: '$100,000 to below $150,000', count: salaryEvidence.filter(item => item.midpoint >= 100_000 && item.midpoint < 150_000).length },
  { label: '$150,000 to below $200,000', count: salaryEvidence.filter(item => item.midpoint >= 150_000 && item.midpoint < 200_000).length },
  { label: '$200,000 or more', count: salaryEvidence.filter(item => item.midpoint >= 200_000).length },
].map(band => ({ ...band, pct: percentage(band.count, salaryN) }));
const now = new Date();
const payload = {
  generatedAt: now.toISOString(),
  snapshotLabel: now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }),
  year: now.getUTCFullYear(),
  sourceCommit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  inputSha256,
  listings: n,
  companies: companies.length,
  excludedInactiveOrDuplicateRows: excludedRows,
  withDescription: { count: withDescription, pct: percentage(withDescription, n) },
  top10SharePct: percentage(topCompanies.reduce((sum, company) => sum + company.count, 0), n),
  topCompanies,
  departments: distribution(jobs.map(job => department(job.title, String(job.department || '')))),
  seniority: distribution(jobs.map(job => seniority(job.title))),
  locations: distribution(jobs.map(job => job.location?.trim() || 'Location not supplied')).slice(0, 10),
  keywords: keywordCounts,
  skillsByFunction,
  experience: {
    matched: { count: matchedExperience, pct: percentage(matchedExperience, n) },
    rows: experienceOrder.map(label => experienceRows.find(row => row.label === label) || { label, count: 0, pct: 0 }),
    specificSkillYears: { count: requiredSkillYears, pct: percentage(requiredSkillYears, n) },
  },
  workArrangements: arrangementOrder.map(label => arrangementRows.find(row => row.label === label) || { label, count: 0, pct: 0 }),
  employerComparison,
  remote: {
    description: { count: remoteInDescription, pct: percentage(remoteInDescription, n) },
    location: { count: remoteInLocation, pct: percentage(remoteInLocation, n) },
    hybrid: { count: hybridInDescription, pct: percentage(hybridInDescription, n) },
  },
  salary: {
    n: salaryN,
    pctOfListings: percentage(salaryN, n),
    medianMidpoint: median(salaryEvidence.map(item => item.midpoint)),
    bands: salaryBands,
    employers: new Set(salaryEvidence.map(item => item.company)).size,
    topEmployers: distribution(salaryEvidence.map(item => item.company), salaryN).slice(0, 3),
  },
};
const json = JSON.stringify(payload, null, 2) + '\n';
if (process.argv.includes('--write')) {
  mkdirSync(path.join(root, 'public/data'), { recursive: true });
  for (const file of ['content/hiring-report-stats.json', 'public/data/hiring-report-stats.json']) writeFileSync(path.join(root, file), json);
  const evidenceJson = JSON.stringify({ generatedAt: payload.generatedAt, listings: salaryEvidence }, null, 2) + '\n';
  for (const file of ['content/hiring-report-salary-sample.json', 'public/data/hiring-report-salary-sample.json']) writeFileSync(path.join(root, file), evidenceJson);
  const analysisJson = JSON.stringify({ generatedAt: payload.generatedAt, records: analysisRecords }, null, 2) + '\n';
  for (const file of ['content/hiring-report-analysis-evidence.json', 'public/data/hiring-report-analysis-evidence.json']) writeFileSync(path.join(root, file), analysisJson);
  console.log(`Hiring report: ${n} listings, ${companies.length} companies, ${salaryN} qualifying salary ranges.`);
} else {
  console.log(json);
}
