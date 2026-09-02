#!/usr/bin/env node

/**
 * Manually set known company websites that GPT couldn't resolve.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COMPANIES_DIR = path.join(__dirname, '..', 'content', 'companies');

// Manually verified websites for companies GPT couldn't find
const KNOWN_WEBSITES = {
  'Alliance': 'https://alliance.xyz',
  'Antimetal': 'https://antimetal.com',
  'Artemis': 'https://artemis.xyz',
  'Base': 'https://base.org',
  'Bastion': 'https://bastion.cool',
  'Blackbird Labs': 'https://blackbird.xyz',
  'Blackbird': 'https://blackbird.xyz',
  'Braavos': 'https://braavos.app',
  'Breeze': 'https://breeze.trade',
  'Button': 'https://button.xyz',
  'Cantina': 'https://cantina.xyz',
  'Celebratix': 'https://celebratix.com',
  'Coinflow Labs': 'https://coinflow.cash',
  'Conduit': 'https://conduit.xyz',
  'Ellipsis Labs': 'https://ellipsislabs.xyz',
  'Ergonia': 'https://ergonia.com',
  'Ethena': 'https://ethena.fi',
  'Joyride Labs': 'https://joyride.games',
  'Kast': 'https://kast.gg',
  'lightcone.trade': 'https://lightcone.trade',
  'M^0 Labs': 'https://m0.org',
  'Mem Protocol': 'https://mem.co',
  'Merge': 'https://merge.xyz',
  'Mesh': 'https://meshconnect.com',
  'Monad Foundation': 'https://monad.xyz',
  'Morph': 'https://morphl2.io',
  'N3XT': 'https://n3xt.io',
  'Nascent': 'https://nascent.xyz',
  'Nexus': 'https://nexus.xyz',
  'Noise': 'https://noise.xyz',
  'Nous Research': 'https://nousresearch.com',
  'OPEN': 'https://open.network',
  'Permian Labs': 'https://permianlabs.xyz',
  'Pixion Games': 'https://pixiongames.com',
  'Rain': 'https://rain.fi',
  'Range': 'https://range.org',
  'Refi Hub': 'https://refihub.io',
  'Render Foundation': 'https://rendernetwork.com',
  'Rift': 'https://rift.finance',
  'Safe': 'https://safe.global',
  'Salt AI': 'https://salt.ai',
  'Sec3': 'https://sec3.dev',
  'Sei': 'https://sei.io',
  'Sentient': 'https://sentient.xyz',
  'Socket': 'https://socket.tech',
  'Sphere': 'https://sphere.engineer',
  'Spindl': 'https://spindl.xyz',
  'Tactic': 'https://tactic.so',
  'Tempo': 'https://tempo.xyz',
  'Trojan Trading': 'https://trojan.trade',
  'Uma': 'https://uma.xyz',
  'Veda': 'https://veda.tech',
  'Ventuals': 'https://ventuals.com',
  'Walrus Foundation': 'https://walrus.xyz',
  'World': 'https://world.org',
  'Wormhole Labs': 'https://wormhole.com',
};

let updated = 0;
for (const [companyName, website] of Object.entries(KNOWN_WEBSITES)) {
  // Find the matching file
  const slug = companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const filePath = path.join(COMPANIES_DIR, `${slug}.md`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⏭️  ${companyName}: no file at ${slug}.md`);
    continue;
  }

  let content = fs.readFileSync(filePath, 'utf-8');
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) continue;
  
  if (fmMatch[1].includes('website:')) {
    console.log(`⏭️  ${companyName}: already has website`);
    continue;
  }

  const newFm = fmMatch[1].replace(/^(name:.+)$/m, `$1\nwebsite: ${website}`);
  content = content.replace(fmMatch[1], newFm);
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`✅ ${companyName}: ${website}`);
  updated++;
}

console.log(`\nDone. Updated: ${updated}`);
