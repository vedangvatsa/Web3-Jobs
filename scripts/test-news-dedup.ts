import assert from 'node:assert/strict';
import type { NewsItem } from '../src/types';
import { deduplicateNewsItems, isExcludedNewsItem, isSameNewsStory } from '../src/lib/news';
import { sameEvent } from '../src/lib/news-story-dedup';

function item(partial: Partial<NewsItem> & Pick<NewsItem, 'title' | 'link'>): NewsItem {
  return {
    pubDate: '2026-09-15T12:00:00.000Z',
    creator: 'Author',
    contentSnippet: 'Snippet text about web3.',
    source: 'Example',
    ...partial,
  };
}

function main() {
  const clarityNative = item({
    title: 'Senate Blocks Clarity Act on Procedural Vote',
    link: '/clarity-act',
    source: 'Hashtag Web3',
    contentSnippet: 'The Senate voted 49–50 on cloture for the Clarity Act.',
  });
  const clarityRss = item({
    title: "Crypto's Clarity Act is a Schrödinger's cat in life-death limbo as U.S. Senate returns",
    link: 'https://www.coindesk.com/news-analysis/clarity',
    source: 'Coindesk',
    contentSnippet: 'The Senate returns with the Clarity Act in limbo.',
  });
  assert.equal(isSameNewsStory(clarityNative, clarityRss), true);

  const nasdaqNative = item({
    title: 'Nasdaq Invests $100 Million in Payward to Advance Tokenization',
    link: '/nasdaq-kraken',
    source: 'Hashtag Web3',
    contentSnippet: 'Nasdaq will invest $100 million in Payward.',
  });
  const nasdaqRss = item({
    title: 'Nasdaq to invest $100 million in Kraken parent Payward',
    link: 'https://example.com/nasdaq-payward',
    source: 'The Block',
    contentSnippet: 'The exchange backs Payward.',
  });
  assert.equal(isSameNewsStory(nasdaqNative, nasdaqRss), true);

  const coin = item({
    title: 'COIN Price Prediction: Oversold at $174 but Bears Hold the Keys',
    link: 'https://example.com/coin',
  });
  const pepe = item({
    title: 'PEPE Price Prediction: Bears Hold the Wheel but Oversold Stochastics Set a Trap',
    link: 'https://example.com/pepe',
  });
  assert.equal(isSameNewsStory(coin, pepe), false);
  assert.equal(sameEvent(coin.title, pepe.title), false);

  const merged = deduplicateNewsItems(
    [clarityRss, clarityNative, nasdaqRss, nasdaqNative, coin, pepe].sort(
      (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime(),
    ),
  );
  assert.equal(merged.length, 4);
  assert.ok(merged.some((row) => row.link === '/clarity-act'));
  assert.ok(merged.some((row) => row.link === '/nasdaq-kraken'));
  assert.ok(merged.some((row) => row.link === coin.link));
  assert.ok(merged.some((row) => row.link === pepe.link));

  const quantumAttack = item({
    title: 'Researchers cut estimated quantum Bitcoin attack cost',
    link: '/quantum-bitcoin',
    source: 'Hashtag Web3',
    pubDate: '2026-09-10T00:00:00.000Z',
  });
  const quantumDefense = item({
    title: 'StarkWare reports 79% cut in estimated quantum-safe Bitcoin compute cost',
    link: '/quantum-cost',
    source: 'Hashtag Web3',
    pubDate: '2026-09-24T00:00:00.000Z',
  });
  assert.equal(isSameNewsStory(quantumAttack, quantumDefense), false);
  for (const pair of [[quantumAttack, quantumDefense], [quantumDefense, quantumAttack]]) {
    const stories = deduplicateNewsItems([...pair, { ...quantumDefense }]);
    assert.equal(stories.length, 2);
    assert.ok(stories.some((row) => row.link === '/quantum-cost'));
    assert.ok(stories.some((row) => row.link === '/quantum-bitcoin'));
  }

  const cointelegraphRoundup = item({
    title: 'Here’s what happened in crypto today',
    link: 'https://cointelegraph.com/news/what-happened-in-crypto-today',
    source: 'Cointelegraph',
    contentSnippet: 'Need to know what happened in crypto today? Here is the latest news on daily trends...',
  });
  assert.equal(isExcludedNewsItem(cointelegraphRoundup), true);

  const pricePrediction = item({
    title: 'BABA Price Prediction: Bears Own the Chart, But a $113 Snap-Back Is Loading',
    link: 'https://blockchain.news/news/20260910-price-prediction-baba-bears-own-the-chart-but-a',
    source: 'Blockchain.News',
    contentSnippet: 'BABA is pinned at $109.22 on the Bollinger lower band.',
  });
  assert.equal(isExcludedNewsItem(pricePrediction), true);

  console.log('News dedup tests passed.');
}

main();
