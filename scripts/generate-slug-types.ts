import * as fs from 'fs';
import * as path from 'path';
import type { Web3Event } from '../src/lib/events';
import type { ResourcePage } from '../src/types/pseo';

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

  const out = {
    events: Array.from(eventSlugs),
    companies: Array.from(companySlugs),
    glossary: Array.from(glossarySlugs),
    resources: Array.from(resourceSlugs),
    articles: Array.from(articleSlugs),
    popups: Array.from(popupSlugs),
  };

  fs.writeFileSync(OUT_FILE, JSON.stringify(out));
  console.log(`[generate-slug-types] Wrote slug index to ${OUT_FILE}`);
}

main();
