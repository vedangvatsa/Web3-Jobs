/**
 * Utility functions for loading and working with the pSEO taxonomy
 */

import * as fs from 'fs';
import * as path from 'path';
import type { 
 NicheTaxonomy, 
 ContentTypes, 
 TopicsTaxonomy,
 Niche,
 ContentTypeSchema,
 Topic 
} from '@/types/pseo';

const TAXONOMY_DIR = path.join(process.cwd(), 'content', 'taxonomy');

export function loadNiches(): Niche[] {
 const data = JSON.parse(
  fs.readFileSync(path.join(TAXONOMY_DIR, 'niches.json'), 'utf-8')
 ) as NicheTaxonomy;
 return data.niches;
}

export function loadContentTypes(): ContentTypeSchema[] {
 const data = JSON.parse(
  fs.readFileSync(path.join(TAXONOMY_DIR, 'content-types.json'), 'utf-8')
 ) as ContentTypes;
 return data.contentTypes;
}

export function loadTopics(): Topic[] {
 const data = JSON.parse(
  fs.readFileSync(path.join(TAXONOMY_DIR, 'topics.json'), 'utf-8')
 ) as TopicsTaxonomy;
 return data.topics;
}

export function getNicheBySlug(slug: string): Niche | undefined {
 const niches = loadNiches();
 return niches.find(n => n.slug === slug);
}

export function getContentTypeBySlug(slug: string): ContentTypeSchema | undefined {
 const types = loadContentTypes();
 return types.find(t => t.slug === slug);
}

export function getTopicBySlug(slug: string): Topic | undefined {
 const topics = loadTopics();
 return topics.find(t => t.slug === slug);
}

export function getApplicableNichesForTopic(topicSlug: string): Niche[] {
 const topic = getTopicBySlug(topicSlug);
 if (!topic) return [];
 
 const niches = loadNiches();
 return niches.filter(n => topic.applicableNiches.includes(n.slug));
}

export function getApplicableTopicsForNiche(nicheSlug: string): Topic[] {
 const topics = loadTopics();
 return topics.filter(t => t.applicableNiches.includes(nicheSlug));
}

export function getAllValidCombinations(): Array<{
 contentType: ContentTypeSchema;
 topic: Topic;
 niche: Niche;
}> {
 const niches = loadNiches();
 const contentTypes = loadContentTypes();
 const topics = loadTopics();
 
 const combinations: Array<{
  contentType: ContentTypeSchema;
  topic: Topic;
  niche: Niche;
 }> = [];
 
 for (const topic of topics) {
  for (const typeSlug of topic.applicableTypes) {
   const contentType = contentTypes.find(t => t.slug === typeSlug);
   if (!contentType) continue;
   
   for (const nicheSlug of topic.applicableNiches) {
    const niche = niches.find(n => n.slug === nicheSlug);
    if (!niche) continue;
    
    combinations.push({ contentType, topic, niche });
   }
  }
 }
 
 return combinations;
}

export function generateResourceTitle(
 contentType: ContentTypeSchema,
 topic: Topic,
 niche: Niche,
 year: number = new Date().getFullYear()
): string {
 let title = contentType.titleTemplate;
 const count = contentType.itemsPerSection * contentType.sectionsCount;
 
 title = title.replace('{count}', String(count));
 title = title.replace('{topic}', topic.name);
 title = title.replace('{niche}', niche.name);
 title = title.replace('{year}', String(year));
 
 return title;
}

export function generateResourceSlug(
 contentType: ContentTypeSchema,
 topic: Topic,
 niche: Niche
): string {
 return `${topic.slug}-${contentType.slug}-for-${niche.slug}`;
}
