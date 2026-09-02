#!/usr/bin/env node

/**
 * Apply verified corrections to company website URLs.
 * These were manually verified via web search.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COMPANIES_DIR = path.join(__dirname, '..', 'content', 'companies');

// Corrections found via manual web search verification
const CORRECTIONS = {
  'render-network': 'https://rendernetwork.com',     // NOT render.com (that's a hosting platform)
  'wave-mobile-money': 'https://wave.com',            // NOT wavemoney.com
  'galaxy-digital': 'https://galaxy.com',             // NOT galaxydigital.io
  'crossmint': 'https://crossmint.com',               // NOT crossmint.io
  'notabene': 'https://notabene.id',                   // NOT notabene.com
  'bastion': 'https://bastion.com',                    // NOT bastion.cool
  'trustswap': 'https://trustswap.com',                // NOT trustswap.org
  'wormhole': 'https://wormhole.com',                  // NOT wormholenetwork.com
  'sei-labs': 'https://sei.io',                        // NOT seilabs.com
  'render-foundation': 'https://rendernetwork.com',    // Same as Render Network
  'ellipsis-labs': 'https://ellipsislabs.xyz',         // Verified correct
  'anchorage-digital': 'https://anchorage.com',        // Verified correct
};

let updated = 0;
for (const [slug, correctUrl] of Object.entries(CORRECTIONS)) {
  const filePath = path.join(COMPANIES_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) {
    console.log(`⏭️  ${slug}: file not found`);
    continue;
  }

  let content = fs.readFileSync(filePath, 'utf-8');
  const webMatch = content.match(/^website:\s*(.+)$/m);
  
  if (webMatch && webMatch[1].trim() === correctUrl) {
    console.log(`✅ ${slug}: already correct (${correctUrl})`);
    continue;
  }

  if (webMatch) {
    const old = webMatch[1].trim();
    content = content.replace(`website: ${old}`, `website: ${correctUrl}`);
    console.log(`🔄 ${slug}: ${old} → ${correctUrl}`);
  } else {
    // Add website field
    const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (fmMatch) {
      const newFm = fmMatch[1].replace(/^(name:.+)$/m, `$1\nwebsite: ${correctUrl}`);
      content = content.replace(fmMatch[1], newFm);
      console.log(`➕ ${slug}: added ${correctUrl}`);
    }
  }

  fs.writeFileSync(filePath, content, 'utf-8');
  updated++;
}

console.log(`\nDone. Corrected: ${updated}`);
