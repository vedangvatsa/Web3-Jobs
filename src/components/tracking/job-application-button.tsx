'use client';

import { trackJobApplicationClick, trackOutboundClick } from '@/lib/posthog';

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
 const handleClick = () => {
  trackJobApplicationClick(jobId, jobTitle, companyName, source, date);
  trackOutboundClick(jobUrl, jobTitle);
 };

 return (
  <a 
   href={jobUrl} 
   target="_blank" 
   rel="noopener noreferrer" 
   onClick={handleClick}
   className="block h-full"
  >
   {children}
  </a>
 );
}
