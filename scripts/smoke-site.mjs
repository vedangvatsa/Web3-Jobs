import fs from 'node:fs';

const base = process.env.SITE_TEST_BASE_URL || 'http://localhost:3199';
const jobs = JSON.parse(fs.readFileSync('content/jobs-runtime.json', 'utf8'));
const events = JSON.parse(fs.readFileSync('content/events-runtime.json', 'utf8'));
const articles = JSON.parse(fs.readFileSync('content/articles-index.json', 'utf8'));
const sampleArticle = articles.find(article => article.category === 'News');
const routes = [...new Set([
  '/', '/jobs', '/companies', '/events', '/news', '/blog', '/glossary', '/learn', '/resources',
  '/community', '/about', '/contact', '/salary-calculator', '/resume-builder',
  '/coinbase', `/${jobs[0].slug}`, `/${events[0].slug}`, `/${sampleArticle.slug}`, '/account-abstraction',
  '/data/jobs-runtime.json', '/data/events-runtime.json', '/data/glossary-runtime.json',
  '/jobs/feed.xml', '/sitemap.xml', '/robots.txt',
])];
let failures = 0;
for (const route of routes) {
  try {
    const response = await fetch(new URL(route, base), { signal: AbortSignal.timeout(20000) });
    const body = await response.text();
    const visible = body.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
    const missing = /<h1\b[^>]*>\s*Page not found\s*<\/h1>/i.test(visible);
    const ok = response.ok && !missing;
    if (!ok) failures++;
    console.log(`${ok ? 'PASS' : 'FAIL'} ${route} HTTP ${response.status}${missing ? ' not-found page' : ''}`);
  } catch (error) {
    failures++;
    console.log(`FAIL ${route}: ${error.message}`);
  }
}
console.log(`${routes.length - failures}/${routes.length} routes passed at ${base}`);
if (failures) process.exitCode = 1;
