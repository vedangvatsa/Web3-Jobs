'use server';

import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import html from 'remark-html';
import type { GlossaryTerm, GlossaryCategory } from '@/types/glossary';
import { GLOSSARY_CATEGORIES } from '@/types/glossary';

const glossaryDirectory = path.join(process.cwd(), 'content', 'glossary');

// In-process cache: populated once per server lifetime.
let allTermsCache: GlossaryTerm[] | null = null;
let termBySlugCache: Map<string, GlossaryTerm> | null = null;

/**
 * Loads all glossary terms once and caches them.
 * getTerm() uses this to avoid re-reading 157 files per request.
 */
export async function getAllTerms(): Promise<GlossaryTerm[]> {
 if (allTermsCache !== null) return allTermsCache;
 try {
  const files = await fs.readdir(glossaryDirectory);
  const mdFiles = files.filter(file => file.endsWith('.md'));

  const terms = await Promise.all(
   mdFiles.map(async (filename) => {
    const filePath = path.join(glossaryDirectory, filename);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const { data } = matter(fileContent);

    return {
     term: data.term || '',
     slug: data.slug || filename.replace('.md', ''),
     category: data.category || 'Other',
     difficulty: data.difficulty || 'Beginner',
     image: data.image,
     imageAlt: data.imageAlt,
     description: data.description || '',
     content: '', // Don't process content for list view
     relatedTerms: data.relatedTerms || [],
     synonyms: data.synonyms || [],
     publishedDate: data.publishedDate || '2024-01-15T00:00:00.000Z',
     updatedDate: data.updatedDate,
    } as GlossaryTerm;
   })
  );

  allTermsCache = terms.sort((a, b) => a.term.localeCompare(b.term));
  return allTermsCache;
 } catch (error) {
  console.error('Error reading glossary terms:', error);
  return [];
 }
}

/**
 * Get a single term by slug: O(1) after first call via slug→term map.
 */
export async function getTerm(slug: string): Promise<GlossaryTerm | null> {
 try {
  // Build the slug map on first access
  if (termBySlugCache === null) {
   const terms = await getAllTerms();
   termBySlugCache = new Map(terms.map(t => [t.slug, t]));
  }

  const cached = termBySlugCache.get(slug);
  if (!cached) return null;

  // If content hasn't been rendered yet, load it now and update the map
  if (!cached.content) {
   const filePath = path.join(glossaryDirectory, `${slug}.md`);
   const fileContent = await fs.readFile(filePath, 'utf-8');
   const { data, content } = matter(fileContent);
   const processedContent = await remark()
    .use(remarkGfm)
    .use(html, { sanitize: false })
    .process(content);
   const fullTerm: GlossaryTerm = {
    ...cached,
    content: processedContent.toString(),
    // Re-read remaining fields in case they were not in the list cache
    term: data.term || cached.term,
    slug: data.slug || slug,
    category: data.category || cached.category,
    difficulty: data.difficulty || cached.difficulty,
    image: data.image || cached.image,
    imageAlt: data.imageAlt || cached.imageAlt,
    description: data.description || cached.description,
    relatedTerms: data.relatedTerms || cached.relatedTerms,
    synonyms: data.synonyms || cached.synonyms,
   };
   termBySlugCache.set(slug, fullTerm);
   return fullTerm;
  }

  return cached;
 } catch (error) {
  console.error('Error reading term:', error);
  return null;
 }
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
