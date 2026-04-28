'use client';

import { trackJobApplicationClick, trackOutboundClick } from '@/lib/posthog';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

export function CompanyApplyButton({
 jobId,
 jobTitle,
 companyName,
 jobUrl,
}: {
 jobId: string;
 jobTitle: string;
 companyName: string;
 jobUrl: string;
}) {
 const handleClick = () => {
  trackJobApplicationClick(jobId, jobTitle, companyName);
  trackOutboundClick(jobUrl, jobTitle);
 };

 return (
  <a href={jobUrl} target="_blank" rel="noopener noreferrer" onClick={handleClick}>
   <Button>
    Apply Now
    <ExternalLink className="ml-2 h-4 w-4" />
   </Button>
  </a>
 );
}
