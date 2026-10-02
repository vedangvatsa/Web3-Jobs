import type { GlossaryTerm } from '@/types/glossary';

export type GlossaryListItem = Pick<GlossaryTerm, 'slug' | 'term' | 'category' | 'description' | 'difficulty' | 'synonyms'>;

export function getGlossaryListItem(term: GlossaryTerm): GlossaryListItem {
  return {
    slug: term.slug,
    term: term.term,
    category: term.category,
    description: term.description,
    difficulty: term.difficulty,
    ...(term.synonyms && { synonyms: term.synonyms }),
  };
}
