'use client';

import { useEffect } from 'react';
import { trackArticleView } from '@/lib/posthog';

export function ArticleViewTracker({ 
 slug, 
 title, 
 category 
}: { 
 slug: string; 
 title: string; 
 category: string;
}) {
 useEffect(() => {
  trackArticleView(slug, title, category);
 }, [slug, title, category]);

 return null;
}
