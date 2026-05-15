const https = require('https');

async function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        resolve({ url, status: 'error', error: `HTTP ${res.statusCode}` });
        return;
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ url, html: data }));
    }).on('error', err => resolve({ url, status: 'error', error: err.message }));
  });
}

(async () => {
  console.log('Fetching sitemap...');
  const sitemapRes = await fetchHtml('https://hashtagweb3.com/sitemap.xml');
  if (sitemapRes.status === 'error') {
    console.error('Failed to fetch sitemap:', sitemapRes.error);
    return;
  }
  
  const urls = [...sitemapRes.html.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);
  console.log(`Found ${urls.length} URLs to check. Starting scan...`);
  
  let ok = 0, missingCanon = 0, wrongCanon = 0, missingOg = 0, errors = 0;
  const issues = [];
  
  // Higher concurrency for faster scanning
  const CONCURRENCY = 30;
  
  for (let i = 0; i < urls.length; i += CONCURRENCY) {
    const batch = urls.slice(i, i + CONCURRENCY);
    const results = await Promise.all(batch.map(async (url) => {
      const res = await fetchHtml(url);
      if (res.status === 'error') return res;
      
      const html = res.html;
      const canonical = html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]*)"/)?.[1]
                      || html.match(/<link[^>]*href="([^"]*)"[^>]*rel="canonical"/)?.[1];
                      
      const ogImage = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]*)"/)?.[1]
                    || html.match(/<meta[^>]*content="([^"]*)"[^>]*property="og:image"/)?.[1];
                    
      const expected = url.replace(/\/$/, '');
      const gotCanon = canonical ? canonical.replace(/\/$/, '') : null;
      
      return { 
        url, 
        hasOg: !!ogImage,
        canonStatus: !canonical ? 'missing' : (gotCanon === expected ? 'ok' : 'wrong'),
        gotCanon
      };
    }));
    
    for (const r of results) {
      if (r.status === 'error') {
        errors++;
        issues.push(`⚠️ ${r.url} - ${r.error}`);
        continue;
      }
      
      if (!r.hasOg) {
        missingOg++;
        issues.push(`❌ NO OG:IMAGE: ${r.url}`);
      }
      
      if (r.canonStatus === 'ok') {
        ok++;
      } else if (r.canonStatus === 'missing') {
        missingCanon++;
        issues.push(`❌ NO CANONICAL: ${r.url}`);
      } else {
        wrongCanon++;
        issues.push(`❌ WRONG CANONICAL: ${r.url} (got: ${r.gotCanon})`);
      }
    }
    
    if ((i + CONCURRENCY) % 150 === 0 || i + CONCURRENCY >= urls.length) {
      console.log(`Scanned ${Math.min(i + CONCURRENCY, urls.length)} / ${urls.length}...`);
    }
  }
  
  console.log('\n=== RESULTS ===');
  console.log(`✅ Correct Canonicals: ${ok}`);
  console.log(`❌ Missing Canonicals: ${missingCanon}`);
  console.log(`❌ Wrong Canonicals: ${wrongCanon}`);
  console.log(`❌ Missing OG Images: ${missingOg}`);
  console.log(`⚠️ HTTP Errors: ${errors}`);
  
  if (issues.length > 0) {
    const fs = require('fs');
    fs.writeFileSync('audit-issues.log', issues.join('\n'));
    console.log(`\nDetailed issues saved to audit-issues.log`);
    
    // Print first 15 issues
    console.log('\nSample Issues:');
    issues.slice(0, 15).forEach(i => console.log(i));
  }
})();
