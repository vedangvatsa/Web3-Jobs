import * as fs from 'fs';
import * as path from 'path';
import type { ResourcePage } from '@/types/pseo';

const GENERATED_DIR = path.join(process.cwd(), 'content', 'generated');

export function getResourcePageBySlug(contentType: string, slug: string): ResourcePage | null {
 const filePath = path.join(GENERATED_DIR, contentType, `${slug}.json`);
 
 if (!fs.existsSync(filePath)) {
  return null;
 }
 
 const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
 return data as ResourcePage;
}

let allResourcePagesCache: ResourcePage[] | null = null;
let resourceBySlugMap: Map<string, ResourcePage> | null = null;

export function getAllResourcePages(contentType?: string): ResourcePage[] {
 if (allResourcePagesCache === null) {
  const pages: ResourcePage[] = [];
  if (fs.existsSync(GENERATED_DIR)) {
   const types = fs.readdirSync(GENERATED_DIR).filter(f => 
    fs.statSync(path.join(GENERATED_DIR, f)).isDirectory()
   );
   
   for (const type of types) {
    const typeDir = path.join(GENERATED_DIR, type);
    if (!fs.existsSync(typeDir)) continue;
    
    const files = fs.readdirSync(typeDir).filter(f => f.endsWith('.json'));
    for (const file of files) {
     const data = JSON.parse(fs.readFileSync(path.join(typeDir, file), 'utf-8'));
     pages.push(data as ResourcePage);
    }
   }
  }
  allResourcePagesCache = pages;
  resourceBySlugMap = new Map(pages.map(p => [p.seo.canonicalSlug, p]));
 }

 if (contentType) {
  return allResourcePagesCache.filter(p => p.meta.contentType === contentType);
 }

 return allResourcePagesCache;
}

// Get resource by canonical slug (flat O(1) URL lookup)
export function getResourceByCanonicalSlug(slug: string): ResourcePage | null {
 if (resourceBySlugMap === null) {
  getAllResourcePages();
 }
 return resourceBySlugMap?.get(slug) ?? null;
}

export function getResourcePageSlugs(contentType: string): string[] {
 const typeDir = path.join(GENERATED_DIR, contentType);
 
 if (!fs.existsSync(typeDir)) {
  return [];
 }
 
 return fs.readdirSync(typeDir)
  .filter(f => f.endsWith('.json'))
  .map(f => f.replace('.json', ''));
}

export function getAllContentTypes(): string[] {
 if (!fs.existsSync(GENERATED_DIR)) {
  return [];
 }
 
 return fs.readdirSync(GENERATED_DIR).filter(f => 
  fs.statSync(path.join(GENERATED_DIR, f)).isDirectory()
 );
}

export function getResourcesByNiche(nicheSlug: string): ResourcePage[] {
 const allPages = getAllResourcePages();
 return allPages.filter(page => page.meta.niche === nicheSlug);
}

export function getResourcesByTopic(topicSlug: string): ResourcePage[] {
 const allPages = getAllResourcePages();
 return allPages.filter(page => page.meta.topic === topicSlug);
}
