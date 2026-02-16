/**
 * SEO Utility functions for glossary and article optimization
 */

import type { GlossaryTerm } from '@/types/glossary';

/**
 * Adds internal hyperlinks to related glossary terms in content
 * Replaces bare term mentions with links to their glossary pages
 */
export function addInternalLinksToContent(
  content: string,
  term: GlossaryTerm,
  allTerms: GlossaryTerm[]
): string {
  let enhancedContent = content;

  // Create a map of term slugs for quick lookup
  const termMap = new Map(
    allTerms.map(t => [
      t.slug.toLowerCase(),
      { slug: t.slug, term: t.term, synonyms: t.synonyms || [] }
    ])
  );

  // Add internal links for related terms
  term.relatedTerms.forEach(relatedSlug => {
    const relatedTerm = allTerms.find(t => t.slug === relatedSlug);
    if (relatedTerm) {
      // Create regex to find term mentions (case-insensitive, word boundaries)
      const pattern = new RegExp(
        `\\b(${relatedTerm.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})\\b(?!](/|[^<]*</a>))`,
        'gi'
      );

      // Only replace first occurrence to avoid over-linking
      let replacementCount = 0;
      enhancedContent = enhancedContent.replace(pattern, (match) => {
        replacementCount++;
        // Only link the first occurrence (avoid over-saturation)
        if (replacementCount === 1 && !enhancedContent.includes(`href="/${relatedTerm.slug}"`)) {
          return `<a href="/${relatedTerm.slug}" class="text-primary hover:underline">${match}</a>`;
        }
        return match;
      });
    }
  });

  return enhancedContent;
}

/**
 * Generates a comprehensive meta description for glossary terms
 * Falls back to existing description if content-based one is too short
 */
export function generateGlossaryMetaDescription(
  term: GlossaryTerm,
  maxLength: number = 160
): string {
  // Use the existing description if it fits
  if (term.description.length <= maxLength) {
    return term.description;
  }

  // Create a truncated version of the description
  const truncated = term.description.substring(0, maxLength - 3) + '...';
  return truncated;
}

/**
 * Extracts the first paragraph of content as a meta description fallback
 */
export function extractFirstParagraph(htmlContent: string, maxLength: number = 160): string {
  // Remove HTML tags
  const text = htmlContent.replace(/<[^>]*>/g, '').trim();

  // Get first sentence or 160 chars
  const sentences = text.split(/[.!?]+/).filter(s => s.trim());
  if (sentences.length > 0) {
    const firstSentence = sentences[0].trim() + '.';
    if (firstSentence.length <= maxLength) {
      return firstSentence;
    }
  }

  // Fall back to truncated text
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Generates schema.org DefinedTerm markup with proper structure
 */
export function generateDefinedTermSchema(
  term: GlossaryTerm,
  siteUrl: string = 'https://hashtagweb3.com',
  relatedTerms?: GlossaryTerm[]
) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    '@id': `${siteUrl}/${term.slug}`,
    name: term.term,
    description: term.description,
    image: term.image ? {
      '@type': 'ImageObject',
      url: term.image,
      alt: term.imageAlt || term.term
    } : undefined,
    sameAs: term.synonyms?.map(syn => ({
      '@type': 'Text',
      text: syn
    })) || [],
    inDefinedTermSet: {
      '@type': 'DefinedTermSet',
      '@id': `${siteUrl}/glossary`,
      name: 'Web3 Glossary',
      description: 'Comprehensive glossary of Web3, blockchain, and cryptocurrency terms',
      url: `${siteUrl}/glossary`,
      hasPart: relatedTerms?.map(rt => ({
        '@type': 'DefinedTerm',
        '@id': `${siteUrl}/${rt.slug}`,
        name: rt.term
      })) || []
    },
    author: {
      '@type': 'Organization',
      name: 'Hashtag Web3',
      url: siteUrl
    },
    datePublished: term.publishedDate,
    dateModified: term.updatedDate || term.publishedDate
  };

  // Remove undefined fields
  return JSON.parse(JSON.stringify(schema));
}

/**
 * Generates schema.org CollectionPage markup for glossary category pages
 */
export function generateCollectionPageSchema(
  categoryName: string,
  categoryDescription: string,
  termCount: number,
  terms: GlossaryTerm[],
  categorySlug: string,
  siteUrl: string = 'https://hashtagweb3.com'
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${siteUrl}/glossary/${categorySlug}`,
    name: `${categoryName} - Web3 Glossary`,
    description: categoryDescription,
    url: `${siteUrl}/glossary/${categorySlug}`,
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: siteUrl
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Glossary',
          item: `${siteUrl}/glossary`
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: categoryName,
          item: `${siteUrl}/glossary/${categorySlug}`
        }
      ]
    },
    hasPart: terms.map((term, idx) => ({
      '@type': 'DefinedTerm',
      '@id': `${siteUrl}/${term.slug}`,
      position: idx + 1,
      name: term.term,
      description: term.description,
      url: `${siteUrl}/${term.slug}`
    })),
    numberOfItems: termCount,
    isPartOf: {
      '@type': 'WebSite',
      '@id': siteUrl,
      name: 'Hashtag Web3',
      url: siteUrl
    },
    publisher: {
      '@type': 'Organization',
      name: 'Hashtag Web3',
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`,
        width: 250,
        height: 60
      }
    }
  };
}
