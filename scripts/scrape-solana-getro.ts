import fs from "fs";

async function probeSolanaGetro() {
  const url = "https://jobs.solana.com/jobs";
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
      }
    });
    const html = await res.text();
    console.log(`Page status: ${res.status}, length: ${html.length}`);

    // Check for Next.js hydration data or embedded JSON state
    const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/);
    if (nextDataMatch) {
      console.log("Found __NEXT_DATA__!");
      const parsed = JSON.parse(nextDataMatch[1]);
      console.log("Keys in __NEXT_DATA__:", Object.keys(parsed));
      console.log("PageProps keys:", Object.keys(parsed.props?.pageProps || {}));
      fs.writeFileSync("scripts/solana_next_data.json", JSON.stringify(parsed, null, 2));
    } else {
      console.log("No __NEXT_DATA__ script found directly.");
    }
  } catch (err: any) {
    console.error("Error:", err.message);
  }
}

probeSolanaGetro();
