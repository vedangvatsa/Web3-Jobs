'use client';

import { RouteError } from '@/components/route-error';

export default function NewsError({
 error,
 reset,
}: {
 error: Error & { digest?: string };
 reset: () => void;
}) {
 return <RouteError error={error} reset={reset} sectionName="daily news feed" />;
}
