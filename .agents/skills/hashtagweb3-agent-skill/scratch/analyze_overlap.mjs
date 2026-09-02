import Parser from 'rss-parser';

const FEEDS = [
  { url: 'https://decrypt.co/feed', source: 'Decrypt' },
  { url: 'https://cointelegraph.com/rss', source: 'Cointelegraph' },
  { url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', source: 'CoinDesk' },
  { url: 'https://www.theblock.co/rss.xml', source: 'The Block' },
  { url: 'https://blockchain.news/RSS/', source: 'Blockchain.News' },
  { url: 'https://dailyhodl.com/feed/', source: 'Daily Hodl' },
];

const parser = new Parser();

function stemWord(word) {
  let w = word.toLowerCase().trim();
  if (w.endsWith('ies')) w = w.slice(0, -3) + 'y';
  else if (w.endsWith('s') && !w.endsWith('us') && !w.endsWith('is') && !w.endsWith('ss')) w = w.slice(0, -1);
  if (w.endsWith('ing')) w = w.slice(0, -3);
  else if (w.endsWith('ed')) w = w.slice(0, -2);
  if (w.endsWith('e') && w.length > 3) w = w.slice(0, -1);
  return w;
}

function getKeywords(text) {
  const stop = new Set([
    'this','that','with','from','what','where','when','the','and','for',
    'says','could','will','would','about','after','amid','over','under',
    'into','onto','than','then','crypto','web3','bitcoin','ethereum'
  ]);
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .split(/\s+/)
    .map(w => w.trim())
    .filter(w => w.length > 3 && !stop.has(w))
    .map(stemWord)
    .filter(w => w.length > 2);
}

function isSimilar(a, b, threshold = 0.4) {
  const wa = new Set(getKeywords(a));
  const wb = new Set(getKeywords(b));
  if (!wa.size || !wb.size) return false;
  let overlap = 0;
  for (const w of wa) if (wb.has(w)) overlap++;
  return overlap / Math.min(wa.size, wb.size) > threshold;
}

async function analyze() {
  console.log('📡 Fetching feeds for overlap analysis...');
  const feedItems = [];

  await Promise.all(
    FEEDS.map(async (f) => {
      try {
        const feed = await parser.parseURL(f.url);
        for (const item of (feed.items || []).slice(0, 15)) {
          if (item.title) {
            feedItems.push({
              title: item.title.trim(),
              link: item.link || '',
              source: f.source,
            });
          }
        }
      } catch (e) {
        console.warn(`⚠️ Skip ${f.source}: ${e.message}`);
      }
    })
  );

  console.log(`Fetched ${feedItems.length} total stories from the 6 feeds.`);

  const overlaps = {};
  const checked = new Set();

  for (let i = 0; i < feedItems.length; i++) {
    for (let j = i + 1; j < feedItems.length; j++) {
      const a = feedItems[i];
      const b = feedItems[j];
      if (a.source === b.source) continue;

      const pairKey = [a.source, b.source].sort().join(' <-> ');

      if (isSimilar(a.title, b.title, 0.4)) {
        if (!overlaps[pairKey]) overlaps[pairKey] = [];
        overlaps[pairKey].push({ a: a.title, b: b.title });
      }
    }
  }

  console.log('\n📊 === DUPLICATE STORY CONFLICTS BY SOURCE PAIR ===\n');
  const sortedPairs = Object.entries(overlaps).sort((x, y) => y[1].length - x[1].length);

  for (const [pair, conflicts] of sortedPairs) {
    console.log(`🔥 ${pair}: ${conflicts.length} conflict(s)`);
    conflicts.forEach(c => {
      console.log(`   - A: "${c.a}"`);
      console.log(`     B: "${c.b}"\n`);
    });
  }
}

analyze().catch(console.error);
