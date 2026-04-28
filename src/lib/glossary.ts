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

/**
 * Get all glossary terms
 */
export async function getAllTerms(): Promise<GlossaryTerm[]> {
 try {
  // Read all files from glossary directory (flat structure)
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
     publishedDate: new Date().toISOString(),
     updatedDate: data.updatedDate,
    } as GlossaryTerm;
   })
  );

  // Sort alphabetically by term
  return terms.sort((a, b) => a.term.localeCompare(b.term));
 } catch (error) {
  console.error('Error reading glossary terms:', error);
  return [];
 }
}

/**
 * Get a single term by slug
 */
export async function getTerm(slug: string): Promise<GlossaryTerm | null> {
 try {
  const files = await fs.readdir(glossaryDirectory);
  const mdFiles = files.filter(file => file.endsWith('.md'));

  for (const filename of mdFiles) {
   const filePath = path.join(glossaryDirectory, filename);
   const fileContent = await fs.readFile(filePath, 'utf-8');
   const { data, content } = matter(fileContent);

   // Check if this file's slug matches the requested slug
   const fileSlug = data.slug || filename.replace('.md', '');
   if (fileSlug === slug) {
    // Process markdown to HTML
    const processedContent = await remark()
     .use(remarkGfm)
     .use(html, { sanitize: false })
     .process(content);
    const contentHtml = processedContent.toString();

    return {
     term: data.term || '',
     slug: data.slug || slug,
     category: data.category || 'Other',
     difficulty: data.difficulty || 'Beginner',
     image: data.image,
     imageAlt: data.imageAlt,
     description: data.description || '',
     content: contentHtml,
     relatedTerms: data.relatedTerms || [],
     synonyms: data.synonyms || [],
     publishedDate: new Date().toISOString(),
     updatedDate: data.updatedDate,
    } as GlossaryTerm;
   }
  }

  return null;
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
