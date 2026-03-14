/**
 * Submits all site URLs to IndexNow (Bing, Yandex, etc.)
 * Usage: npx tsx scripts/indexnow-submit.ts
 */

import { getAllArticles } from '../src/lib/articles';
import { getAllTerms, getAllCategorySlugs } from '../src/lib/glossary';
import { getCompanies } from '../src/lib/companies';
import { getAllResourcePages } from '../src/lib/pseo/resources';

const siteUrl = 'https://hashtagweb3.com';
const keys = [
  '1f8e4a6a875745e79ae76969de11a9c7',
  '5f98e9e755144404909369d2575e4ed7',
];

async function main() {
  const [articles, companies, glossaryTerms, categorySlugs, resourcePages] =
    await Promise.all([
      getAllArticles(),
      getCompanies(),
      getAllTerms(),
      getAllCategorySlugs(),
      getAllResourcePages(),
    ]);

  const staticUrls = [
    siteUrl,
    `${siteUrl}/jobs`,
    `${siteUrl}/blog`,
    `${siteUrl}/glossary`,
    `${siteUrl}/companies`,
    `${siteUrl}/community`,
    `${siteUrl}/news`,
    `${siteUrl}/resources`,
    `${siteUrl}/salary-calculator`,
    `${siteUrl}/resume-builder`,
    `${siteUrl}/invoice-generator`,
    `${siteUrl}/jd-builder`,
    `${siteUrl}/web3-career-quiz`,
    `${siteUrl}/interview-questions`,
    `${siteUrl}/freelance-rates-by-industry`,
    `${siteUrl}/digital-nomad-visas`,
    `${siteUrl}/remote-work-checklist`,
    `${siteUrl}/employee-onboarding-checklist`,
    `${siteUrl}/offer-letter-customizer`,
    `${siteUrl}/employee-exit-survey`,
    `${siteUrl}/interview-feedback-template`,
    `${siteUrl}/employee-milestones-tracker`,
    `${siteUrl}/employee-engagement-survey`,
    `${siteUrl}/work-life-balance-survey`,
    `${siteUrl}/company-culture-guide`,
  ];

  const allUrls = [
    ...staticUrls,
    ...articles.map((a) => `${siteUrl}/${a.slug}`),
    ...companies.map((c) => `${siteUrl}/companies/${c.slug}`),
    ...glossaryTerms.map((t) => `${siteUrl}/${t.slug}`),
    ...categorySlugs.map((c) => `${siteUrl}/glossary/${c}`),
    ...resourcePages.map((p) => `${siteUrl}/${p.seo.canonicalSlug}`),
  ];

  console.log(`Submitting ${allUrls.length} URLs to IndexNow...`);

  for (const key of keys) {
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: 'hashtagweb3.com',
        key,
        urlList: allUrls,
      }),
    });
    console.log(`Key ${key} → HTTP ${res.status} ${res.statusText}`);
  }
}

main().catch(console.error);
