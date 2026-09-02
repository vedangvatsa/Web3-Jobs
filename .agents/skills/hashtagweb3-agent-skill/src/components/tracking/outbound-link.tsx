'use client';

import { trackOutboundClick } from '@/lib/posthog';

export function OutboundLink({ 
 href, 
 label, 
 children,
 className,
 target = '_blank',
 rel = 'noopener noreferrer'
}: { 
 href: string; 
 label?: string;
 children: React.ReactNode;
 className?: string;
 target?: string;
 rel?: string;
}) {
 const handleClick = () => {
  trackOutboundClick(href, label || href);
 };

 return (
  <a 
   href={href} 
   target={target} 
   rel={rel} 
   onClick={handleClick}
   className={className}
  >
   {children}
  </a>
 );
}
