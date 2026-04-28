
'use client';

import type { NewsItem } from '@/types';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function NewsCard({ item }: { item: NewsItem }) {
  const [formattedDate, setFormattedDate] = useState('');

  useEffect(() => {
    setFormattedDate(new Date(item.pubDate).toLocaleDateString());
  }, [item.pubDate]);

  return (
    <Card className="bg-card ">
      <CardContent className="p-4">
        <a href={item.link} target="_blank" rel="noopener noreferrer" className="block hover:bg-accent/20 rounded-md p-3">
          <p className="text-xs text-primary font-semibold">{item.source}</p>
          <h4 className="font-semibold leading-snug text-foreground">{item.title}</h4>
          {formattedDate ? (
            <p className="text-xs text-muted-foreground mt-1">{formattedDate}</p>
          ) : (
            <Skeleton className="h-4 w-20 mt-1" />
          )}
        </a>
      </CardContent>
    </Card>
  );
}
