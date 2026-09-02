
'use server';

import { getFooterArticles } from '@/lib/articles';
import { FooterContent } from './footer-content';

export async function Footer() {
 const latestArticles = await getFooterArticles();
 return <FooterContent latestArticles={latestArticles} />;
}
