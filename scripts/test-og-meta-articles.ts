import * as fs from 'fs';
import * as path from 'path';
import { getAllArticles } from '../src/lib/articles';
import { buildArticlePageMeta } from '../src/lib/article-og-meta';
import { previewAssetPath } from '../src/lib/og-preview';
import { isLinkPreviewCrawlerRequest, linkPreviewPreviewPath, SOCIAL_UTM_MAP } from '../src/lib/social-share';

async function main() {
  console.log('🧪 Article OG meta + social suffix preview checks...\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, name: string, detail?: string) {
    if (condition) {
      passed++;
      console.log(`  ✅ ${name}`);
    } else {
      failed++;
      console.error(`  ❌ ${name}`);
      if (detail) console.error(`     ${detail}`);
    }
  }

  const articles = await getAllArticles();
  assert(articles.length > 0, 'Loaded at least one article');

  for (const article of articles) {
    const meta = buildArticlePageMeta(article);
    assert(
      meta.title === article.title && meta.canonicalUrl.endsWith(`/${article.slug}`),
      `Article meta for /${article.slug}`,
      `title="${meta.title}" url="${meta.canonicalUrl}"`,
    );
    assert(
      !meta.ogImageUrl.includes('/api/og') && /^https?:\/\//i.test(meta.ogImageUrl),
      `Article OG image for /${article.slug}`,
      meta.ogImageUrl,
    );
  }

  const sample = articles.find((a) => a.slug === 'clarity-act') ?? articles[0];
  const suffixKeys = Object.keys(SOCIAL_UTM_MAP);
  const expectedPreview = previewAssetPath(`/${sample.slug}`);
  const botHeaders = new Headers({ 'user-agent': 'LinkedInBot/1.0' });
  const headlessOrBot = isLinkPreviewCrawlerRequest({ headers: botHeaders, method: 'GET' });

  console.log(`\nSocial suffix preview paths for /${sample.slug} (${suffixKeys.length} suffixes)...`);
  for (const suffix of suffixKeys) {
    const socialPath = `/${sample.slug}/${suffix}`;
    const rewritePath = linkPreviewPreviewPath(socialPath, 'LinkedInBot/1.0', headlessOrBot);
    const previewFile = rewritePath ? path.join(process.cwd(), 'public', rewritePath.slice(1)) : '';
    assert(
      rewritePath === expectedPreview && Boolean(previewFile && fs.existsSync(previewFile)),
      `Bot preview path ${socialPath}`,
      rewritePath || '(no preview path)',
    );
  }

  console.log('\n========================================');
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log('========================================\n');

  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
