#!/usr/bin/env tsx

import fs from 'node:fs';
import path from 'node:path';
import * as cheerio from 'cheerio';
import matter from 'gray-matter';
import sitemap from '../src/app/sitemap';
import { getCompanies } from '../src/lib/companies';
import { getEvents } from '../src/lib/events-server';
import { getEventSlug } from '../src/lib/events';
import { getJobs } from '../src/lib/jobs';
import { getJobContentKey, getJobIdentity, getJobSlug } from '../src/lib/job-slugs';
import { getAllResourcePages } from '../src/lib/pseo/resources';
import type { Job } from '../src/types';

const ROOT = path.resolve(import.meta.dirname, '..');
const SITE_URL = 'https://hashtagweb3.com';
const EXAMPLE_LIMIT = 5;

const FABRICATED_JOB_MARKERS = [
  'leading organisation in the Web3 and blockchain ecosystem',
  'passion for the Web3 space',
  'dynamic and collaborative environment where you can grow your career',
  'fast-paced environment, collaborating with talented colleagues',
] as const;

const EDITORIAL_SLOP_MARKERS = [
  'delve',
  'navigate the landscape',
  'tapestry',
  'testament to',
  'demystify',
  'unveil',
  "in today's fast-paced",
  'unlock your potential',
  'game-changing',
] as const;

const LEGACY_COMPANY_PROSE_FIELDS = [
  'about',
  'mission',
  'culture',
  'benefits',
  'techStack',
] as const;

type Severity = 'critical' | 'warning';

interface Finding {
  severity: Severity;
  label: string;
  count: number;
  examples: string[];
}

interface MarkdownRecord {
  relativePath: string;
  slug: string;
  data: Record<string, unknown>;
  body: string;
  words: number;
}

interface RouteOwner {
  path: string;
  owner: string;
}

const findings: Finding[] = [];

function addFinding(
  severity: Severity,
  label: string,
  count: number,
  examples: string[] = [],
): void {
  if (count === 0) return;
  findings.push({
    severity,
    label,
    count,
    examples: examples.slice(0, EXAMPLE_LIMIT),
  });
}

function canonicalizeUrl(value: string): string {
  try {
    const url = new URL(value, SITE_URL);
    url.hash = '';
    url.search = '';
    url.hostname = url.hostname.toLowerCase();
    url.pathname = url.pathname === '/' ? '/' : url.pathname.replace(/\/+$/, '');
    return url.toString().replace(/\/$/, url.pathname === '/' ? '/' : '');
  } catch {
    return value.trim().replace(/[?#].*$/, '').replace(/\/+$/, '');
  }
}

function normalizeText(value: unknown): string {
  return String(value ?? '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function hasRenderedValue(value: unknown): boolean {
  if (Array.isArray(value)) return value.some((item) => normalizeText(item).length > 0);
  return normalizeText(value).length > 0;
}

function clip(value: string, maxLength = 100): string {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 3).trimEnd()}...`;
}

function markdownToPlainText(value: string): string {
  return value
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/^\s{0,3}(?:#{1,6}|>|[-*+] |\d+[.)] )/gm, ' ')
    .replace(/[|*_~]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function wordCount(value: string): number {
  const matches = markdownToPlainText(value).match(/[\p{L}\p{N}][\p{L}\p{N}'-]*/gu);
  return matches?.length ?? 0;
}

function decodeEscapedHtml(value: string): string {
  if (!value.includes('&lt;')) return value;
  if (!/&lt;\/?(?:div|p|h[1-6]|ul|ol|li|a|strong|em|b|i|br|span|table|section|article)[\s>/]/i.test(value)) {
    return value;
  }
  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&amp;/g, '&');
}

function htmlToPlainText(value: string): string {
  return cheerio
    .load(decodeEscapedHtml(value))
    .text()
    .replace(/\s+/g, ' ')
    .trim();
}

function walkFiles(directory: string, extensions: ReadonlySet<string>): string[] {
  if (!fs.existsSync(directory)) return [];
  const files: string[] = [];
  const stack = [directory];

  while (stack.length > 0) {
    const current = stack.pop()!;
    const entries = fs.readdirSync(current, { withFileTypes: true })
      .sort((a, b) => a.name.localeCompare(b.name));

    for (const entry of entries) {
      if (entry.name === 'node_modules' || entry.name === '.next') continue;
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(fullPath);
      else if (extensions.has(path.extname(entry.name))) files.push(fullPath);
    }
  }

  return files.sort();
}

function readMarkdownCollection(relativeDirectory: string): MarkdownRecord[] {
  const directory = path.join(ROOT, relativeDirectory);
  return walkFiles(directory, new Set(['.md', '.mdx'])).map((fullPath) => {
    const raw = fs.readFileSync(fullPath, 'utf8');
    const parsed = matter(raw);
    const relativePath = path.relative(ROOT, fullPath);
    const filenameSlug = path.basename(fullPath).replace(/\.mdx?$/, '');
    return {
      relativePath,
      slug: typeof parsed.data.slug === 'string' && parsed.data.slug
        ? parsed.data.slug
        : filenameSlug,
      data: parsed.data,
      body: parsed.content,
      words: wordCount(parsed.content),
    };
  });
}

function groupBy<T>(values: T[], keyOf: (value: T) => string): Map<string, T[]> {
  const groups = new Map<string, T[]>();
  for (const value of values) {
    const key = keyOf(value);
    const existing = groups.get(key);
    if (existing) existing.push(value);
    else groups.set(key, [value]);
  }
  return groups;
}

function duplicateGroups<T>(values: T[], keyOf: (value: T) => string): Array<[string, T[]]> {
  return [...groupBy(values, keyOf).entries()]
    .filter(([key, group]) => key.length > 0 && group.length > 1)
    .sort(([a], [b]) => a.localeCompare(b));
}

function formatDuplicateExamples<T>(
  groups: Array<[string, T[]]>,
  describe: (value: T) => string,
): string[] {
  return groups.map(([key, group]) => {
    const shown = group.slice(0, 4).map((value) => clip(describe(value), 120));
    if (group.length > shown.length) shown.push(`+${group.length - shown.length} more`);
    return `${clip(key)}: ${shown.join(' | ')}`;
  });
}

function findStaticRootRoutes(): RouteOwner[] {
  const appDirectory = path.join(ROOT, 'src', 'app');
  const routes: RouteOwner[] = [];
  const rootPage = path.join(appDirectory, 'page.tsx');
  if (fs.existsSync(rootPage)) routes.push({ path: '/', owner: 'static:src/app/page.tsx' });

  for (const entry of fs.readdirSync(appDirectory, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name.startsWith('[') || entry.name.startsWith('(')) continue;
    const pagePath = path.join(appDirectory, entry.name, 'page.tsx');
    if (fs.existsSync(pagePath)) {
      routes.push({
        path: `/${entry.name}`,
        owner: `static:${path.relative(ROOT, pagePath)}`,
      });
    }
  }
  return routes;
}

function collectJsonStrings(value: unknown, output: string[] = []): string[] {
  if (typeof value === 'string') output.push(value);
  else if (Array.isArray(value)) value.forEach((item) => collectJsonStrings(item, output));
  else if (value && typeof value === 'object') {
    Object.values(value as Record<string, unknown>).forEach((item) => collectJsonStrings(item, output));
  }
  return output;
}

function auditThinCollection(
  label: string,
  records: MarkdownRecord[],
  minimumWords: number,
): void {
  const thin = records
    .filter((record) => record.words < minimumWords)
    .sort((a, b) => a.words - b.words || a.relativePath.localeCompare(b.relativePath));
  addFinding(
    'warning',
    `${label} below ${minimumWords} words`,
    thin.length,
    thin.map((record) => `${record.relativePath} (${record.words})`),
  );
}

function scanEditorialSlop(records: Array<{ source: string; text: string }>): number {
  const matches: Array<{ source: string; markers: string[] }> = [];
  for (const record of records) {
    const normalized = record.text.toLowerCase();
    const markers = EDITORIAL_SLOP_MARKERS.filter((marker) => {
      const escaped = marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp(`\\b${escaped}\\b`, 'i').test(normalized);
    });
    if (markers.length > 0) matches.push({ source: record.source, markers: [...markers] });
  }
  addFinding(
    'warning',
    'authored content files with known AI/slop phrases',
    matches.length,
    matches.map((match) => `${match.source}: ${match.markers.join(', ')}`),
  );
  return matches.length;
}

function scanIconPatterns(): {
  nonLucideImports: number;
  inlineSvg: number;
  emoji: number;
  glyphIcons: number;
} {
  const tsxFiles = walkFiles(path.join(ROOT, 'src'), new Set(['.tsx']));
  const nonLucideImports: string[] = [];
  const inlineSvg: string[] = [];
  const emoji: string[] = [];
  const glyphIcons: string[] = [];
  const externalIconImport = /from\s+['"](?:react-icons(?:\/[^'"]+)?|@heroicons\/[^'"]+|@fortawesome\/[^'"]+|phosphor-react|@phosphor-icons\/[^'"]+|@mui\/icons-material(?:\/[^'"]+)?)['"]/;
  const emojiPattern = /\p{Extended_Pictographic}/u;
  const glyphPattern = /[\u2190-\u21ff\u2713\u2714\u2715\u2716\u2605\u2606\u26a1]/u;
  const chartSvgAllowlist = new Set([
    'src/app/web3-hiring-report/page.tsx',
    'src/components/glossary-charts.tsx',
  ]);

  for (const fullPath of tsxFiles) {
    const relativePath = path.relative(ROOT, fullPath);
    const lines = fs.readFileSync(fullPath, 'utf8').split('\n');
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) return;
      const location = `${relativePath}:${index + 1}`;
      if (externalIconImport.test(line)) nonLucideImports.push(location);
      if (/<svg\b/i.test(line) && !chartSvgAllowlist.has(relativePath)) inlineSvg.push(location);
      if (emojiPattern.test(line)) emoji.push(location);
      if (glyphPattern.test(line)) glyphIcons.push(location);
    });
  }

  addFinding('warning', 'non-Lucide icon-library imports', nonLucideImports.length, nonLucideImports);
  addFinding('warning', 'inline SVG UI candidates for review', inlineSvg.length, inlineSvg);
  addFinding('warning', 'emoji in TSX UI', emoji.length, emoji);
  addFinding('warning', 'arrow/check/lightning glyphs used as UI icons', glyphIcons.length, glyphIcons);
  return {
    nonLucideImports: nonLucideImports.length,
    inlineSvg: inlineSvg.length,
    emoji: emoji.length,
    glyphIcons: glyphIcons.length,
  };
}

async function main(): Promise<void> {
  const articles = readMarkdownCollection('content/articles');
  const glossary = readMarkdownCollection('content/glossary');
  const companyProfiles = readMarkdownCollection('content/companies');
  const learnLessons = readMarkdownCollection('content/learn');
  const resources = getAllResourcePages();
  const [sitemapEntries, jobs, companies, events] = await Promise.all([
    sitemap(),
    getJobs(),
    getCompanies(),
    getEvents(),
  ]);

  const sitemapDuplicates = duplicateGroups(sitemapEntries, (entry) => canonicalizeUrl(entry.url));
  addFinding(
    'critical',
    'duplicate URLs emitted by sitemap',
    sitemapDuplicates.length,
    formatDuplicateExamples(sitemapDuplicates, (entry) => entry.url),
  );

  const rootOwners: RouteOwner[] = [
    ...findStaticRootRoutes(),
    ...articles.map((record) => ({ path: `/${record.slug}`, owner: `article:${record.relativePath}` })),
    ...glossary.map((record) => ({ path: `/${record.slug}`, owner: `glossary:${record.relativePath}` })),
    ...companies.map((company) => ({ path: `/${company.slug}`, owner: `company:${company.name}` })),
    ...events.map((event) => ({ path: `/${getEventSlug(event)}`, owner: `event:${event.name}` })),
    ...resources.map((resource) => ({
      path: `/${resource.seo.canonicalSlug}`,
      owner: `resource:${resource.meta.contentType}/${resource.seo.canonicalSlug}`,
    })),
  ].map((route) => ({
    path: route.path === '/' ? '/' : route.path.toLowerCase().replace(/\/+$/, ''),
    owner: route.owner,
  }));
  const rootCollisions = duplicateGroups(rootOwners, (route) => route.path);
  addFinding(
    'critical',
    'root route collisions hidden by resolver or sitemap precedence',
    rootCollisions.length,
    rootCollisions.map(([route, owners]) => {
      const shown = owners.slice(0, 4).map((item) => clip(item.owner, 120));
      if (owners.length > shown.length) shown.push(`+${owners.length - shown.length} more`);
      return `${route}: ${shown.join(' | ')}`;
    }),
  );

  const missingCompanyDescriptions = companies
    .filter((company) => normalizeText(company.description).length === 0)
    .sort((a, b) => a.slug.localeCompare(b.slug));
  addFinding(
    'critical',
    'canonical company pages missing rendered descriptions',
    missingCompanyDescriptions.length,
    missingCompanyDescriptions.map((company) => `/${company.slug}: ${company.name}`),
  );

  const duplicateCompanyDescriptions = duplicateGroups(
    companies,
    (company) => normalizeText(company.description),
  );
  addFinding(
    'critical',
    'duplicate normalized descriptions across canonical company pages',
    duplicateCompanyDescriptions.length,
    formatDuplicateExamples(
      duplicateCompanyDescriptions,
      (company) => `/${company.slug} (${company.name})`,
    ),
  );

  const companyLegacyProseLeaks = companies
    .map((company) => ({
      company,
      fields: LEGACY_COMPANY_PROSE_FIELDS.filter((field) => hasRenderedValue(company[field])),
    }))
    .filter(({ fields }) => fields.length > 0)
    .sort((a, b) => a.company.slug.localeCompare(b.company.slug));
  addFinding(
    'critical',
    'canonical company pages exposing legacy editorial prose fields',
    companyLegacyProseLeaks.length,
    companyLegacyProseLeaks.map(({ company, fields }) => (
      `/${company.slug}: ${fields.join(', ')}`
    )),
  );

  const rawJobsPath = path.join(ROOT, 'content', 'jobs-cache.json');
  const descriptionsPath = path.join(ROOT, 'content', 'job-descriptions.json');
  const rawJobs = JSON.parse(fs.readFileSync(rawJobsPath, 'utf8')) as Job[];
  const descriptions = fs.existsSync(descriptionsPath)
    ? JSON.parse(fs.readFileSync(descriptionsPath, 'utf8')) as Record<string, string>
    : {};

  const rawIdentityCollisions = duplicateGroups(rawJobs, getJobIdentity);
  addFinding(
    'warning',
    'duplicate raw job identities (runtime dedupes these)',
    rawIdentityCollisions.length,
    rawIdentityCollisions.map(([identity, group]) => (
      `${identity}: ${group.map((job) => `${job.company} / ${job.title} [${job.source}]`).join(' | ')}`
    )),
  );

  const rawSlugCollisions = duplicateGroups(rawJobs, getJobSlug);
  addFinding(
    'critical',
    'duplicate persisted/raw job slugs',
    rawSlugCollisions.length,
    rawSlugCollisions.map(([slug, group]) => (
      `${slug}: ${group.map((job) => `${job.company} / ${job.title}`).join(' | ')}`
    )),
  );

  const effectiveSlugCollisions = duplicateGroups(jobs, getJobSlug);
  addFinding(
    'critical',
    'duplicate runtime job slugs',
    effectiveSlugCollisions.length,
    effectiveSlugCollisions.map(([slug, group]) => (
      `${slug}: ${group.map((job) => `${job.company} / ${job.title}`).join(' | ')}`
    )),
  );

  let substantialJobs = 0;
  let missingJobContent = 0;
  let thinJobContent = 0;
  const fabricatedJobs: Array<{ job: Job; markers: string[] }> = [];
  const missingExamples: string[] = [];
  const thinExamples: string[] = [];

  for (const job of jobs) {
    const rawContent = descriptions[getJobContentKey(job)] || descriptions[job.id] || '';
    const text = htmlToPlainText(rawContent);
    const lowerText = text.toLowerCase();
    const markers = FABRICATED_JOB_MARKERS.filter((marker) => lowerText.includes(marker.toLowerCase()));
    if (markers.length > 0) fabricatedJobs.push({ job, markers: [...markers] });

    if (text.length === 0) {
      missingJobContent += 1;
      if (missingExamples.length < EXAMPLE_LIMIT) missingExamples.push(`${job.company} / ${job.title}`);
    } else if (text.length < 300) {
      thinJobContent += 1;
      if (thinExamples.length < EXAMPLE_LIMIT) thinExamples.push(`${job.company} / ${job.title} (${text.length} chars)`);
    } else if (markers.length === 0) {
      substantialJobs += 1;
    }
  }

  addFinding('warning', 'active jobs missing cached employer content', missingJobContent, missingExamples);
  addFinding('warning', 'active jobs with content below 300 characters', thinJobContent, thinExamples);
  addFinding(
    'critical',
    'active jobs containing known fabricated copy',
    fabricatedJobs.length,
    fabricatedJobs.map(({ job, markers }) => `${job.company} / ${job.title}: ${markers.join(', ')}`),
  );

  const duplicateArticleTitles = duplicateGroups(articles, (record) => normalizeText(record.data.title));
  addFinding(
    'warning',
    'duplicate article titles',
    duplicateArticleTitles.length,
    formatDuplicateExamples(duplicateArticleTitles, (record) => record.relativePath),
  );

  const duplicateArticleDescriptions = duplicateGroups(
    articles,
    (record) => normalizeText(record.data.description),
  );
  addFinding(
    'warning',
    'duplicate article descriptions',
    duplicateArticleDescriptions.length,
    formatDuplicateExamples(duplicateArticleDescriptions, (record) => record.relativePath),
  );

  const missingArticleMetadata = articles.filter((record) => (
    normalizeText(record.data.title).length === 0 || normalizeText(record.data.description).length === 0
  ));
  addFinding(
    'warning',
    'articles missing a title or description',
    missingArticleMetadata.length,
    missingArticleMetadata.map((record) => record.relativePath),
  );

  auditThinCollection('articles', articles, 150);
  auditThinCollection('glossary entries', glossary, 100);
  auditThinCollection('learn lessons', learnLessons, 150);

  const thinResources = resources
    .map((resource) => {
      const source = `content/generated/${resource.meta.contentType}/${resource.seo.canonicalSlug}.json`;
      const words = wordCount(collectJsonStrings(resource.content).join(' '));
      return { source, words };
    })
    .filter((resource) => resource.words < 150)
    .sort((a, b) => a.words - b.words || a.source.localeCompare(b.source));
  addFinding(
    'warning',
    'generated resource pages below 150 words',
    thinResources.length,
    thinResources.map((resource) => `${resource.source} (${resource.words})`),
  );

  const duplicateGlossaryTerms = duplicateGroups(glossary, (record) => normalizeText(record.data.term));
  addFinding(
    'warning',
    'duplicate normalized glossary terms',
    duplicateGlossaryTerms.length,
    formatDuplicateExamples(duplicateGlossaryTerms, (record) => record.relativePath),
  );

  const editorialRecords = [
    ...articles.map((record) => ({ source: record.relativePath, text: record.body })),
    ...companyProfiles.map((record) => ({ source: record.relativePath, text: record.body })),
    ...glossary.map((record) => ({ source: record.relativePath, text: record.body })),
    ...learnLessons.map((record) => ({ source: record.relativePath, text: record.body })),
    ...resources.map((resource) => ({
      source: `content/generated/${resource.meta.contentType}/${resource.seo.canonicalSlug}.json`,
      text: collectJsonStrings(resource.content).join(' '),
    })),
  ];
  const editorialSlopMatches = scanEditorialSlop(editorialRecords);
  const iconPatterns = scanIconPatterns();

  const sitemapJobUrls = new Set(
    sitemapEntries
      .map((entry) => canonicalizeUrl(entry.url))
      .filter((url) => url.startsWith(`${SITE_URL}/jobs/`)),
  );
  const substantialJobUrls = new Set(
    jobs
      .filter((job) => {
        const rawContent = descriptions[getJobContentKey(job)] || descriptions[job.id] || '';
        const text = htmlToPlainText(rawContent);
        const lowerText = text.toLowerCase();
        return text.length >= 300
          && !FABRICATED_JOB_MARKERS.some((marker) => lowerText.includes(marker.toLowerCase()));
      })
      .map((job) => `${SITE_URL}/jobs/${getJobSlug(job)}`),
  );
  const substantialMissingFromSitemap = [...substantialJobUrls]
    .filter((url) => !sitemapJobUrls.has(url))
    .sort();
  addFinding(
    'warning',
    'substantial job pages missing from sitemap',
    substantialMissingFromSitemap.length,
    substantialMissingFromSitemap,
  );

  const criticalFindings = findings.filter((finding) => finding.severity === 'critical');
  const warningFindings = findings.filter((finding) => finding.severity === 'warning');
  const substantialPercentage = jobs.length === 0 ? 0 : (substantialJobs / jobs.length) * 100;
  const normalizedCompanyDescriptions = companies
    .map((company) => normalizeText(company.description))
    .filter(Boolean);
  const uniqueCompanyDescriptions = new Set(normalizedCompanyDescriptions).size;

  console.log('Site quality audit');
  console.log(`  Sitemap: ${sitemapEntries.length.toLocaleString()} URLs; ${sitemapJobUrls.size.toLocaleString()} job pages`);
  console.log(
    `  Jobs: ${jobs.length.toLocaleString()} active from ${new Set(jobs.map((job) => job.company)).size.toLocaleString()} companies; `
      + `${substantialJobs.toLocaleString()} substantial (${substantialPercentage.toFixed(1)}%)`,
  );
  console.log(
    `  Job content: ${missingJobContent.toLocaleString()} missing; ${thinJobContent.toLocaleString()} thin; `
      + `${fabricatedJobs.length.toLocaleString()} fabricated-marker matches`,
  );
  console.log(
    `  Editorial: ${articles.length.toLocaleString()} articles; ${companyProfiles.length.toLocaleString()} company profiles; `
      + `${glossary.length.toLocaleString()} glossary entries; ${learnLessons.length.toLocaleString()} lessons; `
      + `${resources.length.toLocaleString()} generated resources`,
  );
  console.log(
    `  Company pages: ${companies.length.toLocaleString()} canonical pages; `
      + `${uniqueCompanyDescriptions.toLocaleString()} original, normalized-unique live-job summaries; `
      + `${companyLegacyProseLeaks.length.toLocaleString()} legacy editorial prose leaks`,
  );
  console.log(`  Root namespace: ${rootOwners.length.toLocaleString()} route claims`);
  console.log(
    `  Integrity: ${sitemapDuplicates.length.toLocaleString()} sitemap duplicate groups; `
      + `${rootCollisions.length.toLocaleString()} root collisions; `
      + `${rawIdentityCollisions.length.toLocaleString()} raw job identity collisions; `
      + `${(rawSlugCollisions.length + effectiveSlugCollisions.length).toLocaleString()} job slug collisions`,
  );
  console.log(
    `  Copy/design: ${editorialSlopMatches.toLocaleString()} authored files with known slop phrases; `
      + `${iconPatterns.nonLucideImports.toLocaleString()} non-Lucide icon imports; `
      + `${(iconPatterns.inlineSvg + iconPatterns.emoji + iconPatterns.glyphIcons).toLocaleString()} custom/glyph UI candidates`,
  );

  for (const severity of ['critical', 'warning'] as const) {
    const relevant = findings.filter((finding) => finding.severity === severity);
    if (relevant.length === 0) continue;
    console.log(`\n${severity === 'critical' ? 'Critical' : 'Warnings'}`);
    for (const finding of relevant) {
      console.log(`  ${finding.label}: ${finding.count.toLocaleString()}`);
      for (const example of finding.examples) console.log(`    - ${example}`);
    }
  }

  const criticalIssueCount = criticalFindings.reduce((sum, finding) => sum + finding.count, 0);
  const warningIssueCount = warningFindings.reduce((sum, finding) => sum + finding.count, 0);
  if (criticalIssueCount > 0) {
    console.log(`\nResult: FAIL (${criticalIssueCount.toLocaleString()} critical, ${warningIssueCount.toLocaleString()} warnings)`);
    process.exitCode = 1;
  } else {
    console.log(`\nResult: PASS (${warningIssueCount.toLocaleString()} warnings)`);
  }
}

main().catch((error: unknown) => {
  console.error('Site quality audit could not run:', error);
  process.exitCode = 1;
});
