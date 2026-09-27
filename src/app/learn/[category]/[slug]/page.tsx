import { notFound, permanentRedirect } from 'next/navigation';
import { getLearnRedirectPath } from '@/lib/learn-routes';

export default async function LegacyLessonPage({ params }: { params: Promise<{ category: string; slug: string }> }) {
  const { category, slug } = await params;
  const destination = getLearnRedirectPath(`/learn/${category}/${slug}`);
  if (!destination) notFound();
  permanentRedirect(destination);
}
