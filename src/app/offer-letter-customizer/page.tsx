'use client';

import dynamic from 'next/dynamic';
import { ToolUsageTracker } from '@/components/tracking/tool-usage-tracker';
import { ToolFormLoadingSkeleton, ToolPageFrame } from '@/components/page-shell';

const OfferLetterForm = dynamic(
 () => import('@/components/offer-letter-form').then(m => ({ default: m.OfferLetterForm })),
 {
  loading: () => <ToolFormLoadingSkeleton />,
 }
);

export default function OfferLetterCustomizerPage() {
 return (
  <ToolPageFrame>
    <h1 className="sr-only">Offer Letter Customizer</h1>
    <ToolUsageTracker toolName="Offer Letter Customizer" />
    <OfferLetterForm />
  </ToolPageFrame>
 );
}
