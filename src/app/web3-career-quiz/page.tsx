
'use client';

import { Web3CareerQuiz } from '@/components/web3-career-quiz';
import { ToolUsageTracker } from '@/components/tracking/tool-usage-tracker';
import { ToolPageFrame } from '@/components/page-shell';

const schemaJson = JSON.stringify({
 '@context': 'https://schema.org',
 '@type': 'SoftwareApplication',
 name: 'Web3 Career Quiz',
 url: 'https://hashtagweb3.com/web3-career-quiz',
 description: 'Free quiz to discover your Web3 career archetype. Find out whether you are suited for DeFi engineering, DAO governance, NFT development, or crypto marketing.',
 applicationCategory: 'EducationalApplication',
 operatingSystem: 'Web',
 offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
 publisher: { '@type': 'Organization', name: 'Hashtag Web3', url: 'https://hashtagweb3.com' },
});

export default function Web3CareerQuizPage() {
 return (
  <ToolPageFrame>
   <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schemaJson }} />
   <h1 className="sr-only">Web3 Career Archetype Quiz</h1>
   <ToolUsageTracker toolName="Web3 Career Quiz" />
   <Web3CareerQuiz />
  </ToolPageFrame>
 );
}
