import { permanentRedirect, notFound } from 'next/navigation';
import legacySlugsJson from '../../../../content/grants/legacy-slugs.json';
import { getGrantById } from '@/lib/grants';

const legacySlugs = legacySlugsJson as Record<string, string>;

interface GrantRedirectProps {
  params: Promise<{ slug: string }>;
}

export default async function GrantLegacyRedirectPage({ params }: GrantRedirectProps) {
  const { slug } = await params;
  const target = legacySlugs[slug] || slug;
  const grant = getGrantById(target);

  if (!grant) {
    notFound();
  }

  permanentRedirect(`/${grant.id}`);
}
