
'use client';

import type { Job, Article, NewsItem } from '@/types';
import { CommunityPageContent } from '@/components/community-page-content';

export function HomePageContent({ 
    latestJobs,
    latestArticles,
    latestNews
}: { 
    latestJobs: Job[],
    latestArticles: Omit<Article, 'content'>[],
    latestNews: NewsItem[]
}) {

  return (
      <div className="py-16">
        <CommunityPageContent 
          latestJobs={latestJobs} 
          latestArticles={latestArticles}
          latestNews={latestNews}
        />
      </div>
  );
}

