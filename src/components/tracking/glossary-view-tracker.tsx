'use client';

import { useEffect } from 'react';
import { trackGlossaryView } from '@/lib/posthog';

export function GlossaryViewTracker({ 
  term, 
  category,
  difficulty 
}: { 
  term: string; 
  category: string;
  difficulty: string;
}) {
  useEffect(() => {
    trackGlossaryView(term, category, difficulty);
  }, [term, category, difficulty]);

  return null;
}
