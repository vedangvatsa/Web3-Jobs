// Types for the pSEO Resource Pages system

export interface NicheContext {
  audience: string;
  painPoints: string[];
  skills: string[];
  salaryRange: {
    min: number;
    max: number;
    currency: string;
  };
  careerPaths: string[];
  contentThatWorks: string;
  subtopics: string[];
}

export interface Niche {
  slug: string;
  name: string;
  shortName: string;
  category: 'engineering' | 'security' | 'product' | 'operations' | 'marketing' | 'legal' | 'analytics' | 'strategy' | 'leadership';
  context: NicheContext;
}

export interface NicheTaxonomy {
  version: string;
  lastUpdated: string;
  niches: Niche[];
}

export interface ContentTypeSchema {
  slug: string;
  name: string;
  titleTemplate: string;
  description: string;
  icon: string;
  itemsPerSection: number;
  sectionsCount: number;
  proTipsCount: number;
  schema: {
    item: Record<string, string | string[]>;
  };
  examples: string[];
}

export interface ContentTypes {
  version: string;
  lastUpdated: string;
  contentTypes: ContentTypeSchema[];
}

export interface Topic {
  slug: string;
  name: string;
  applicableTypes: string[];
  applicableNiches: string[];
}

export interface TopicsTaxonomy {
  version: string;
  lastUpdated: string;
  topics: Topic[];
}

// Resource Page Content Types

export interface BaseItem {
  title: string;
  description: string;
}

export interface IdeaItem extends BaseItem {
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  timeToComplete: string;
  potential: 'high' | 'medium' | 'standard';
}

export interface ChecklistItem extends BaseItem {
  priority: 'critical' | 'important' | 'nice-to-have';
  category: string;
}

export interface TemplateItem extends BaseItem {
  useCase: string;
  format: 'document' | 'spreadsheet' | 'code' | 'presentation';
}

export interface GuideItem extends BaseItem {
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prerequisites: string[];
}

export interface MistakeItem {
  title: string;
  mistake: string;
  consequence: string;
  solution: string;
  severity: 'critical' | 'major' | 'minor';
}

export interface QuestionItem {
  question: string;
  category: 'technical' | 'behavioral' | 'situational' | 'culture';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  sampleAnswer: string;
  followUp: string;
}

export interface ToolItem {
  name: string;
  description: string;
  url: string;
  pricing: 'free' | 'freemium' | 'paid';
  category: string;
}

export interface SkillItem {
  skill: string;
  description: string;
  importance: 'critical' | 'important' | 'nice-to-have';
  learningResources: string[];
  timeToLearn: string;
}

export type ResourceItem = 
  | IdeaItem 
  | ChecklistItem 
  | TemplateItem 
  | GuideItem 
  | MistakeItem 
  | QuestionItem 
  | ToolItem 
  | SkillItem;

export interface ResourceSection<T extends ResourceItem = ResourceItem> {
  heading: string;
  description: string;
  items: T[];
}

export interface ResourcePageMeta {
  contentType: string;
  topic: string;
  niche: string;
  generatedAt: string;
  version: string;
}

export interface ResourcePageSEO {
  title: string;
  description: string;
  keywords: string[];
  canonicalSlug: string;
}

export interface ResourcePageContent<T extends ResourceItem = ResourceItem> {
  intro: string;
  sections: ResourceSection<T>[];
  proTips: string[];
  conclusion: string;
  relatedResources: string[];
}

export interface ResourcePage<T extends ResourceItem = ResourceItem> {
  meta: ResourcePageMeta;
  seo: ResourcePageSEO;
  content: ResourcePageContent<T>;
}

// Type guards
export function isIdeaItem(item: ResourceItem): item is IdeaItem {
  return 'potential' in item && 'timeToComplete' in item;
}

export function isChecklistItem(item: ResourceItem): item is ChecklistItem {
  return 'priority' in item && 'category' in item;
}

export function isTemplateItem(item: ResourceItem): item is TemplateItem {
  return 'useCase' in item && 'format' in item;
}

export function isGuideItem(item: ResourceItem): item is GuideItem {
  return 'prerequisites' in item && 'difficulty' in item && !('potential' in item);
}

export function isMistakeItem(item: ResourceItem): item is MistakeItem {
  return 'mistake' in item && 'consequence' in item && 'solution' in item;
}

export function isQuestionItem(item: ResourceItem): item is QuestionItem {
  return 'question' in item && 'sampleAnswer' in item;
}

export function isToolItem(item: ResourceItem): item is ToolItem {
  return 'url' in item && 'pricing' in item;
}

export function isSkillItem(item: ResourceItem): item is SkillItem {
  return 'skill' in item && 'learningResources' in item;
}

// Generation request type
export interface GenerationRequest {
  contentType: ContentTypeSchema;
  topic: Topic;
  niche: Niche;
  year?: number;
  count?: number;
}

// Utility type for page slugs
export type ResourcePageSlug = `${string}-for-${string}`;

export function generateSlug(contentType: string, topic: string, niche: string): string {
  return `${topic}-${contentType}-for-${niche}`;
}

export function parseSlug(slug: string): { topic: string; contentType: string; niche: string } | null {
  const forIndex = slug.lastIndexOf('-for-');
  if (forIndex === -1) return null;
  
  const beforeFor = slug.substring(0, forIndex);
  const niche = slug.substring(forIndex + 5);
  
  // This is simplified - in practice you'd match against known content types
  return {
    topic: beforeFor,
    contentType: 'unknown',
    niche
  };
}
