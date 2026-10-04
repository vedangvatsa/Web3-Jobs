export async function loadPublishedNativeArticles({ request = fetch, now = Date.now() } = {}) {
  const response = await request('https://hashtagweb3.com/data/articles-index.json', { headers: { 'cache-control': 'no-cache' }, signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`Published article catalog HTTP ${response.status}`);
  const data = await response.json();
  if (!Array.isArray(data)) throw new Error('Invalid published article catalog');
  const articles = data.filter(article => article?.category === 'News');
  if (!articles.length) throw new Error('Published article catalog contains no news; refusing an RSS-only fallback');
  const seen = new Set();
  return articles.flatMap(article => {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(article.slug || '') || typeof article.title !== 'string' || !article.title.trim() || typeof article.description !== 'string' || !Number.isFinite(Date.parse(article.publishedDate))) throw new Error('Invalid published News article');
    if (Date.parse(article.publishedDate) > now || seen.has(article.slug)) return [];
    seen.add(article.slug);
    return [{ title: article.title, link: `https://hashtagweb3.com/${article.slug}?utm_source=telegram&utm_medium=social&utm_campaign=web3newsfeed`, snippet: article.description.slice(0, 300), source: 'Hashtag Web3', date: new Date(article.publishedDate), native: true, slug: article.slug }];
  }).sort((a, b) => b.date - a.date);
}

export async function collectNativeSummaries(items, summarize, { max = 3, maxAttempts = 12 } = {}) {
  const result = [];
  for (const item of items.slice(0, maxAttempts)) {
    if (result.length >= max) break;
    const story = await summarize(item);
    if (story) result.push(story);
  }
  return result;
}
