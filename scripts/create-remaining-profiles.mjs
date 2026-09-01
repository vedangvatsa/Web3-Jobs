import fs from 'fs';
import path from 'path';

const missing = [
  { slug: "ethena-labs", name: "Ethena Labs", category: "DeFi / Stablecoins", hq: "Remote", desc: "Ethena Labs is the creator of USDe, a synthetic dollar protocol providing a crypto-native, yield-bearing dollar solution." },
  { slug: "arbitrum-opco", name: "Arbitrum OpCo", category: "Layer 2 / Scaling", hq: "Remote", desc: "Arbitrum OpCo drives operating initiatives, developer growth, and core ecosystem development for the Arbitrum L2 network." }
];

for (const comp of missing) {
  const filePath = path.join("content/companies", `${comp.slug}.md`);
  if (!fs.existsSync(filePath)) {
    const content = `---
name: "${comp.name}"
title: "${comp.name} Jobs: Software Engineer, Product Manager & More"
description: "${comp.desc}"
website: "https://${comp.slug}.com"
twitter: ""
linkedin: ""
careers: ""
category: "${comp.category}"
headquarters: "${comp.hq}"
slug: "${comp.slug}"
---

### About ${comp.name}

${comp.desc}
`;
    fs.writeFileSync(filePath, content, "utf8");
    console.log(`Created ${comp.slug}.md`);
  }
}
