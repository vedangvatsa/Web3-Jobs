'use client';

import { useEffect, useRef } from 'react';
import { trackToolUsage } from '@/lib/posthog';

export function ToolUsageTracker({
 toolName,
 action = 'started',
 metadata,
}: {
 toolName: string;
 action?: 'started' | 'completed' | 'downloaded' | 'shared';
 metadata?: Record<string, any>;
}) {
 const hasTracked = useRef(false);

 useEffect(() => {
  if (hasTracked.current) return;
  trackToolUsage(toolName, action, metadata);
  hasTracked.current = true;
 }, [toolName, action, metadata]);

 return null;
}