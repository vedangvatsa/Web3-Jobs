import type { GlossaryTerm, GlossaryCategory } from '@/types/glossary';
import { GLOSSARY_CATEGORIES } from '@/types/glossary';
import glossaryRuntimeJson from '../../content/glossary-runtime.json';

const allTermsList: GlossaryTerm[] = (glossaryRuntimeJson as GlossaryTerm[]) || [];
const termBySlugMap = new Map<string, GlossaryTerm>();
for (const term of allTermsList) {
  termBySlugMap.set(term.slug.toLowerCase().trim(), term);
}

/**
 * Loads all glossary terms (precomputed at build time).
 */
export async function getAllTerms(): Promise<GlossaryTerm[]> {
  return allTermsList;
}

/**
 * Get a single term by slug: O(1) lookup.
 */
export async function getTerm(slug: string): Promise<GlossaryTerm | null> {
  return termBySlugMap.get(slug.toLowerCase().trim()) || null;
}

/**
 * Get terms by category
 */
export async function getTermsByCategory(categorySlug: string): Promise<GlossaryTerm[]> {
 const allTerms = await getAllTerms();
 const category = GLOSSARY_CATEGORIES.find(cat => cat.slug === categorySlug);
 
 if (!category) return [];
 
 return allTerms.filter(term => 
  term.category.toLowerCase().replace(/\s+/g, '-') === categorySlug
 );
}

/**
 * Get category by slug
 */
export async function getCategory(categorySlug: string): Promise<GlossaryCategory | null> {
 const categories = await getCategoriesWithCounts();
 return categories.find(cat => cat.slug === categorySlug) || null;
}

/**
 * Get all category slugs for static generation
 */
export async function getAllCategorySlugs(): Promise<string[]> {
 const categories = await getCategoriesWithCounts();
 return categories
  .filter(cat => cat.termCount && cat.termCount > 0)
  .map(cat => cat.slug);
}

/**
 * Get terms by first letter
 */
export async function getTermsByLetter(letter: string): Promise<GlossaryTerm[]> {
 const allTerms = await getAllTerms();
 return allTerms.filter(term => 
  term.term.toLowerCase().startsWith(letter.toLowerCase())
 );
}

/**
 * Search terms by query
 */
export async function searchTerms(query: string): Promise<GlossaryTerm[]> {
 const allTerms = await getAllTerms();
 const lowercaseQuery = query.toLowerCase();
 
 return allTerms.filter(term => 
  term.term.toLowerCase().includes(lowercaseQuery) ||
  term.description.toLowerCase().includes(lowercaseQuery) ||
  term.synonyms?.some(syn => syn.toLowerCase().includes(lowercaseQuery))
 );
}

/**
 * Get categories with term counts
 */
export async function getCategoriesWithCounts(): Promise<GlossaryCategory[]> {
 const allTerms = await getAllTerms();
 
 return GLOSSARY_CATEGORIES.map(category => ({
  ...category,
  termCount: allTerms.filter(term => 
   term.category.toLowerCase().replace(/\s+/g, '-') === category.slug
  ).length,
 }));
}

/**
 * Get glossary statistics
 */
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
