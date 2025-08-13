
'use server';

import { getAllArticles } from '@/lib/articles';
import { FooterContent } from './footer-content';

export async function Footer() {
  const latestArticles = (await getAllArticles()).slice(0, 4);
  return <FooterContent latestArticles={latestArticles} />;
}
