'use client';

import { RouteError } from '@/components/route-error';

export default function EventsError({
 error,
 reset,
}: {
 error: Error & { digest?: string };
 reset: () => void;
}) {
 return <RouteError error={error} reset={reset} sectionName="events calendar" />;
}
