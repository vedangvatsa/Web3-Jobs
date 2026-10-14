import type { Metadata } from 'next';
import { PageRecovery } from '@/components/page-recovery';

export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: true },
  alternates: { canonical: null },
};

export default function NotFound() {
  return <PageRecovery />;
}
