
'use server';

import { getAllArticles } from '@/lib/articles';
import { StaticFooter } from './static-footer';

export async function Footer() {
  const latestArticles = (await getAllArticles()).slice(0, 4);
  return <StaticFooter latestArticles={latestArticles} />;
}
