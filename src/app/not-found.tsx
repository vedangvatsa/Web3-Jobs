import type { Metadata } from 'next';
import { PageRecovery } from '@/components/page-recovery';
import { PageShell } from '@/components/page-shell';

export const metadata: Metadata = {
  title: 'Page not found',
  description: 'Find your way to Web3 jobs, events, guides and tools on Hashtag Web3.',
  robots: { index: false, follow: true },
  alternates: { canonical: null },
};

export default function NotFound() {
  return (
    <main id="main-content">
      <PageShell className="lg:py-16">
        <PageRecovery />
      </PageShell>
    </main>
  );
}
