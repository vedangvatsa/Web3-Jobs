import { notFound, permanentRedirect } from 'next/navigation';
import { getLearnRedirectPath } from '@/lib/learn-routes';

export default async function LegacyCoursePage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const destination = getLearnRedirectPath(`/learn/${category}`);
  if (!destination) notFound();
  permanentRedirect(destination);
}
