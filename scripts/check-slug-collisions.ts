import fs from 'fs';
import path from 'path';
import { getAllArticles } from '../src/lib/articles';
import { getAllTerms } from '../src/lib/glossary';
import { getAllResourcePages } from '../src/lib/pseo';
import { getCompanies } from '../src/lib/companies';
import { getEvents } from '../src/lib/events-server';

async function checkSlugCollisions() {
  console.log('🔍 Auditing root slug collisions across all content types...\n');

  const terms = await getAllTerms();
  const articles = await getAllArticles();
  const resources = getAllResourcePages();
  const companies = await getCompanies();
  const events = await getEvents();

  const slugMap = new Map<string, Array<{ type: string; title: string }>>();

  function register(slug: string, type: string, title: string) {
    if (!slug) return;
    const lower = slug.toLowerCase().trim();
    const existing = slugMap.get(lower) || [];
    existing.push({ type, title });
    slugMap.set(lower, existing);
  }

  terms.forEach(t => register(t.slug, 'Glossary Term', t.term));
  articles.forEach(a => register(a.slug, 'Article', a.title));
  resources.forEach(r => register(r.seo.canonicalSlug, 'Resource Page', r.seo.title));
  companies.forEach(c => register(c.slug, 'Company Page', c.name));
  events.forEach(e => {
    const slug = e.slug || e.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    register(slug, 'Event', e.name);
  });

  let collisionsFound = 0;
  for (const [slug, entries] of slugMap.entries()) {
    if (entries.length > 1) {
      // Ignore identical entry duplicates of the exact same type if any
      const types = new Set(entries.map(e => e.type));
      if (types.size > 1) {
        collisionsFound++;
        console.error(`❌ SLUG COLLISION [/${slug}]:`);
        entries.forEach(e => console.error(`   - (${e.type}) ${e.title}`));
        console.error('');
      }
    }
  }

  if (collisionsFound > 0) {
    console.error(`💥 Found ${collisionsFound} slug collision(s)! Please resolve before building.`);
    process.exit(1);
  } else {
    console.log('✅ No slug collisions found across Glossary, Articles, Resources, Companies, or Events.');
  }
}

checkSlugCollisions().catch(err => {
  console.error('Error running collision check:', err);
  process.exit(1);
});
