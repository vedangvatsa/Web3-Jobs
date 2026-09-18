import type { GlossaryTerm, GlossaryCategory } from '@/types/glossary';
import { GLOSSARY_CATEGORIES } from '@/types/glossary';
import { loadStaticJson } from './load-static-json';

type GlossaryIndex = {
  allTermsList: GlossaryTerm[];
  termBySlugMap: Map<string, GlossaryTerm>;
};

let glossaryIndex: GlossaryIndex | null = null;
let glossaryLoad: Promise<GlossaryIndex> | null = null;

async function ensureGlossaryIndex(): Promise<GlossaryIndex> {
  if (glossaryIndex) return glossaryIndex;
  if (!glossaryLoad) {
    glossaryLoad = loadStaticJson<GlossaryTerm[]>('glossary-runtime.json').then((raw) => {
      const allTermsList = Array.isArray(raw) ? raw : [];
      const termBySlugMap = new Map<string, GlossaryTerm>();
      for (const term of allTermsList) {
        termBySlugMap.set(term.slug.toLowerCase().trim(), term);
      }
      glossaryIndex = { allTermsList, termBySlugMap };
      return glossaryIndex;
    });
  }
  return glossaryLoad;
}

export async function getAllTerms(): Promise<GlossaryTerm[]> {
  return (await ensureGlossaryIndex()).allTermsList;
}

export async function getTerm(slug: string): Promise<GlossaryTerm | null> {
  const { termBySlugMap } = await ensureGlossaryIndex();
  return termBySlugMap.get(slug.toLowerCase().trim()) || null;
}

export async function getTermsByCategory(categorySlug: string): Promise<GlossaryTerm[]> {
 const allTerms = await getAllTerms();
 const category = GLOSSARY_CATEGORIES.find(cat => cat.slug === categorySlug);
 
 if (!category) return [];
 
 return allTerms.filter(term => 
  term.category.toLowerCase().replace(/\s+/g, '-') === categorySlug
 );
}

export async function getCategory(categorySlug: string): Promise<GlossaryCategory | null> {
 const categories = await getCategoriesWithCounts();
 return categories.find(cat => cat.slug === categorySlug) || null;
}

export async function getAllCategorySlugs(): Promise<string[]> {
 const categories = await getCategoriesWithCounts();
 return categories
  .filter(cat => cat.termCount && cat.termCount > 0)
  .map(cat => cat.slug);
}

export async function getTermsByLetter(letter: string): Promise<GlossaryTerm[]> {
 const allTerms = await getAllTerms();
 return allTerms.filter(term => 
  term.term.toLowerCase().startsWith(letter.toLowerCase())
 );
}

export async function searchTerms(query: string): Promise<GlossaryTerm[]> {
 const allTerms = await getAllTerms();
 const lowercaseQuery = query.toLowerCase();
 
 return allTerms.filter(term => 
  term.term.toLowerCase().includes(lowercaseQuery) ||
  term.description.toLowerCase().includes(lowercaseQuery) ||
  term.synonyms?.some(syn => syn.toLowerCase().includes(lowercaseQuery))
 );
}

export async function getCategoriesWithCounts(): Promise<GlossaryCategory[]> {
 const allTerms = await getAllTerms();
 
 return GLOSSARY_CATEGORIES.map(category => ({
  ...category,
  termCount: allTerms.filter(term => 
   term.category.toLowerCase().replace(/\s+/g, '-') === category.slug
  ).length,
 }));
}

export async function getGlossaryStats() {
 const allTerms = await getAllTerms();
 const categories = await getCategoriesWithCounts();
 
 return {
  totalTerms: allTerms.length,
  totalCategories: categories.filter(cat => cat.termCount && cat.termCount > 0).length,
  beginnerTerms: allTerms.filter(t => t.difficulty === 'Beginner').length,
  intermediateTerms: allTerms.filter(t => t.difficulty === 'Intermediate').length,
  advancedTerms: allTerms.filter(t => t.difficulty === 'Advanced').length,
 };
}
