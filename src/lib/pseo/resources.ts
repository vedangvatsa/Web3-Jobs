import pseoResourcesJson from '../../../content/pseo-resources-runtime.json';
import type { ResourcePage } from '@/types/pseo';

const allPages = (pseoResourcesJson as ResourcePage[]) || [];
const resourceByCanonicalSlugMap = new Map<string, ResourcePage>(
  allPages.map(p => [p.seo.canonicalSlug.toLowerCase(), p])
);
const resourceByTypeAndSlugMap = new Map<string, ResourcePage>(
  allPages.map(p => [`${p.meta.contentType}/${p.seo.canonicalSlug}`.toLowerCase(), p])
);

export function getResourcePageBySlug(contentType: string, slug: string): ResourcePage | null {
  return resourceByTypeAndSlugMap.get(`${contentType}/${slug}`.toLowerCase()) ?? null;
}

export function getAllResourcePages(contentType?: string): ResourcePage[] {
  if (contentType) {
    return allPages.filter(p => p.meta.contentType === contentType);
  }
  return allPages;
}

// Get resource by canonical slug (flat O(1) URL lookup)
export function getResourceByCanonicalSlug(slug: string): ResourcePage | null {
  return resourceByCanonicalSlugMap.get(slug.toLowerCase()) ?? null;
}

export function getResourcePageSlugs(contentType: string): string[] {
  return allPages
    .filter(p => p.meta.contentType === contentType)
    .map(p => p.seo.canonicalSlug);
}

export function getAllContentTypes(): string[] {
  return Array.from(new Set(allPages.map(p => p.meta.contentType)));
}

export function getResourcesByNiche(nicheSlug: string): ResourcePage[] {
  return allPages.filter(page => page.meta.niche === nicheSlug);
}

export function getResourcesByTopic(topicSlug: string): ResourcePage[] {
  return allPages.filter(page => page.meta.topic === topicSlug);
}
