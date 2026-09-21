import * as fs from 'fs';
import * as path from 'path';
import type { Web3Event } from '../src/lib/events';
import type { ResourcePage } from '../src/types/pseo';
import type { Job } from '../src/types';

const OUT_FILE = path.join(process.cwd(), 'content', 'slug-types.json');

function main() {
  const eventsFile = path.join(process.cwd(), 'content', 'events-runtime.json');
  const events: Web3Event[] = fs.existsSync(eventsFile)
    ? JSON.parse(fs.readFileSync(eventsFile, 'utf-8'))
    : [];

  const eventSlugs = new Set<string>();
  const LEGACY_SLUG_ALIASES: Record<string, string> = {
    pbw: 'signal-week',
    'paris-blockchain-week': 'signal-week',
    icbti: 'waset-icbt',
  };

  events.forEach((e) => {
    if (e.slug) eventSlugs.add(e.slug.toLowerCase().trim());
    for (const alias of e.aliases || []) eventSlugs.add(alias.toLowerCase().trim());
    if (e.id) {
      const id = e.id.toLowerCase().trim();
      eventSlugs.add(id);
      eventSlugs.add(id.replace(/^(premier|side)-/, ''));
    }
  });
  Object.keys(LEGACY_SLUG_ALIASES).forEach((k) => eventSlugs.add(k));

  const companyProfilesFile = path.join(process.cwd(), 'content', 'company-profiles-runtime.json');
  const companyProfiles = fs.existsSync(companyProfilesFile)
    ? JSON.parse(fs.readFileSync(companyProfilesFile, 'utf-8'))
    : {};
  const companySlugs = new Set<string>(Object.keys(companyProfiles).map((s) => s.toLowerCase().trim()));
  const companiesRuntimeFile = path.join(process.cwd(), 'content', 'companies-runtime.json');
  if (fs.existsSync(companiesRuntimeFile)) {
    const companies = JSON.parse(fs.readFileSync(companiesRuntimeFile, 'utf8')) as Record<string, unknown>;
    for (const slug of Object.keys(companies)) companySlugs.add(slug.toLowerCase().trim());
  }

  const glossaryDir = path.join(process.cwd(), 'content', 'glossary');
  const glossaryFiles = fs.existsSync(glossaryDir)
    ? fs.readdirSync(glossaryDir).filter((f) => f.endsWith('.md'))
    : [];
  const glossarySlugs = new Set<string>(glossaryFiles.map((f) => f.replace('.md', '').toLowerCase().trim()));

  const pseoFile = path.join(process.cwd(), 'content', 'pseo-resources-runtime.json');
  const pseoResources: ResourcePage[] = fs.existsSync(pseoFile)
    ? JSON.parse(fs.readFileSync(pseoFile, 'utf-8'))
    : [];
  const resourceSlugs = new Set<string>(pseoResources.map((r) => r.seo.canonicalSlug.toLowerCase().trim()));

  const articlesDir = path.join(process.cwd(), 'content', 'articles');
  const articleFiles = fs.existsSync(articlesDir)
    ? fs.readdirSync(articlesDir).filter((f) => f.endsWith('.md'))
    : [];
  const articleSlugs = new Set<string>(articleFiles.map((f) => f.replace('.md', '').toLowerCase().trim()));

  const popupSlugs = new Set<string>([
    'zuzalu', 'edge-city', 'network-school', 'prospera', 'praxis',
    'jungli', 'cabin', 'infinita', 'culdesac', 'afropolitan', 'liberty-island',
  ]);

  const appDir = path.join(process.cwd(), 'src', 'app');
  const staticPageSlugs = new Set(fs.readdirSync(appDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('[')
      && fs.existsSync(path.join(appDir, entry.name, 'page.tsx')))
    .map((entry) => entry.name.toLowerCase()));
  const jobs: Job[] = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'content/jobs-runtime.json'), 'utf8'));
  const legacyJobs: Record<string, unknown> = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'content/legacy-slugs-archive.json'), 'utf8'));
  const legacyJobSlugs = new Set(Object.keys(legacyJobs).map((slug) => slug.toLowerCase().trim()));
  const jobSlugs = new Set([
    ...jobs.map((job) => job.slug?.toLowerCase().trim()).filter((slug): slug is string => Boolean(slug)),
    ...legacyJobSlugs,
  ].filter((slug) => !staticPageSlugs.has(slug) && !eventSlugs.has(slug)
    && !companySlugs.has(slug) && !popupSlugs.has(slug)
    && (legacyJobSlugs.has(slug) || (!glossarySlugs.has(slug) && !resourceSlugs.has(slug) && !articleSlugs.has(slug)))));

  const out = {
    events: Array.from(eventSlugs),
    companies: Array.from(companySlugs),
    glossary: Array.from(glossarySlugs),
    resources: Array.from(resourceSlugs),
    articles: Array.from(articleSlugs),
    popups: Array.from(popupSlugs),
    jobs: Array.from(jobSlugs).sort(),
    staticPages: Array.from(staticPageSlugs).sort(),
  };

  fs.writeFileSync(OUT_FILE, JSON.stringify(out));
  console.log(`[generate-slug-types] Wrote slug index to ${OUT_FILE}`);
}

main();
