'use client';

import { trackJobApplicationClick, trackOutboundClick } from '@/lib/posthog';

export function JobApplicationButton({ 
  jobId, 
  jobTitle, 
  companyName, 
  jobUrl,
  children 
}: { 
  jobId: string; 
  jobTitle: string; 
  companyName: string; 
  jobUrl: string;
  children: React.ReactNode;
}) {
  const handleClick = () => {
    trackJobApplicationClick(jobId, jobTitle, companyName);
    trackOutboundClick(jobUrl, jobTitle);
  };

  return (
    <a 
      href={jobUrl} 
      target="_blank" 
      rel="noopener noreferrer" 
      onClick={handleClick}
      className="block h-full transform transition-all duration-200 hover:-translate-y-1"
    >
      {children}
    </a>
  );
}
