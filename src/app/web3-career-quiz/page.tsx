
'use client';

import { Header } from '@/components/header';
import { ArchetypeAssessment } from '@/components/archetype-assessment';
import { ToolUsageTracker } from '@/components/tracking/tool-usage-tracker';

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
    <div className="flex flex-col min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schemaJson }} />
      <Header />
      <main className="flex-1 flex items-center justify-center p-4">
        <ToolUsageTracker toolName="Web3 Career Quiz" />
        <ArchetypeAssessment />
      </main>
    </div>
  );
}
