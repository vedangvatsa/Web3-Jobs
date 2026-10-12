'use client';

import { DetailPrimaryActionLink } from '@/components/primary-action-link';
import { trackJobApplicationClick, trackOutboundClick } from '@/lib/posthog';
import { isJobAgeEligible } from '@/lib/job-age-policy.mjs';
import { useJobAgeClock } from '@/components/use-job-age-clock';

export function JobApplicationButton({
 jobId,
 jobTitle,
 companyName,
 jobUrl,
 source,
 date,
 children
}: {
 jobId: string;
 jobTitle: string;
 companyName: string;
 jobUrl: string;
 source?: string;
 date?: string;
 children: React.ReactNode;
}) {
  const now = useJobAgeClock([{ date }]);
  if (!isJobAgeEligible({ date }, now)) return null;
  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
   if (!isJobAgeEligible({ date })) { event.preventDefault(); return; }
  trackJobApplicationClick(jobId, jobTitle, companyName, source, date);
  trackOutboundClick(jobUrl, jobTitle);
 };

 return (
  <DetailPrimaryActionLink
   href={jobUrl}
   target="_blank"
   rel="noopener noreferrer"
   onClick={handleClick}
  >
   {children}
  </DetailPrimaryActionLink>
 );
}
