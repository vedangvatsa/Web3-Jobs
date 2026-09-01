import fs from 'fs';
import path from 'path';

const newComps = [
  { slug: "fuse-energy", name: "Fuse Energy", category: "Infrastructure / Energy", hq: "London, UK", desc: "Fuse Energy is building decentralized renewable energy generation networks and smart power grid infrastructure." },
  { slug: "breederdao", name: "BreederDAO", category: "Gaming / NFT", hq: "Remote", desc: "BreederDAO is a asset generation factory for metaverse and play-to-earn gaming ecosystems." },
  { slug: "interchain-foundation", name: "Interchain Foundation", category: "Layer 1 / Ecosystem", hq: "Zug, Switzerland", desc: "The Interchain Foundation is a non-profit organization supporting open decentralized network ecosystems like Cosmos." }
];

for (const comp of newComps) {
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
