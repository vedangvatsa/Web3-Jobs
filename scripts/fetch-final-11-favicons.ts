import fs from "fs";
import path from "path";

const DOMAINS: Record<string, string> = {
  "baton-corporation": "baton.systems",
  "biti": "biti.com",
  "bitway": "bitway.io",
  "fintax": "fintax.no",
  "hertzflow": "hertzflow.com",
  "manifolds-ai": "manifolds.ai",
  "openeden": "openeden.com",
  "smartx": "smartx.com",
  "termix": "termix.io",
  "the-tie": "thetie.io",
  "yzi-labs": "yzilabs.com"
};

async function main() {
  for (const [slug, domain] of Object.entries(DOMAINS)) {
    const targetPath = path.join(process.cwd(), `public/logo/companies/${slug}.png`);
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    try {
      const res = await fetch(faviconUrl);
      if (res.ok) {
        const buffer = await res.arrayBuffer();
        fs.writeFileSync(targetPath, Buffer.from(buffer));
        console.log(`Saved logo for ${slug} (${domain})`);
      }
    } catch (e) {}
  }
}

main();
