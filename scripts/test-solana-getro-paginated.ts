import fs from "fs";

async function fetchAllSolanaGetroJobs() {
  console.log("Fetching Solana Getro ecosystem jobs...");
  const allJobs: any[] = [];
  let page = 1;
  const maxPages = 25; // 20 per page * 25 = 500 max

  while (page <= maxPages) {
    const url = `https://jobs.solana.com/jobs?page=${page}`;
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
        }
      });
      const html = await res.text();
      const m = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/);
      if (!m) break;
      const parsed = JSON.parse(m[1]);
      const jobs = parsed.props?.pageProps?.initialState?.jobs?.found || [];
      if (!jobs.length) break;

      console.log(`Page ${page}: fetched ${jobs.length} jobs.`);
      allJobs.push(...jobs);
      if (jobs.length < 20) break;
      page++;
    } catch (err: any) {
      console.error(`Error page ${page}:`, err.message);
      break;
    }
  }

  console.log(`\nFetched total ${allJobs.length} Solana ecosystem jobs from Getro!`);
  fs.writeFileSync("scripts/solana_getro_all_jobs.json", JSON.stringify(allJobs, null, 2));
}

fetchAllSolanaGetroJobs();
