import fs from "fs";
import path from "path";

const COMPANY_DOMAINS: Record<string, string> = {
  "1inch-network": "1inch.io",
  "aztec-labs": "aztec.network",
  "bob": "gobob.xyz",
  "baton-corporation": "baton.io",
  "biti": "biti.com",
  "bitway": "bitway.io",
  "fintax": "fintax.ai",
  "frontrun": "frontrun.com",
  "frontrun-pro": "frontrun.pro",
  "grass": "getgrass.io",
  "hertzflow": "hertzflow.com",
  "icme": "icme.io",
  "manifolds-ai": "manifolds.ai",
  "nym": "nymtech.net",
  "onekey-limited": "onekey.so",
  "openeden": "openeden.com",
  "optimai-network": "optimai.network",
  "paimon-finance": "paimon.finance",
  "predict-fun": "predict.fun",
  "puffer-finance": "puffer.fi",
  "sats-terminal": "satsterminal.com",
  "smartx": "smartx.tech",
  "stablestock": "stablestock.io",
  "szns": "szns.io",
  "termix": "termix.io",
  "vibe": "vibe.xyz",
  "weex": "weex.com",
  "xhunt": "xhunt.ai"
};

async function downloadFavicon(slug: string, domain: string) {
  const targetPath = path.join(process.cwd(), `public/logo/companies/${slug}.png`);
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  try {
    const res = await fetch(faviconUrl);
    if (res.ok) {
      const buffer = await res.arrayBuffer();
      fs.writeFileSync(targetPath, Buffer.from(buffer));
      console.log(`Saved logo for ${slug} (${domain})`);
    }
  } catch (err: any) {
    console.error(`Failed ${slug}: ${err.message}`);
  }
}

async function main() {
  console.log("Fetching remaining company favicons...");
  for (const [slug, domain] of Object.entries(COMPANY_DOMAINS)) {
    await downloadFavicon(slug, domain);
  }
  console.log("Favicon download complete!");
}

main();
