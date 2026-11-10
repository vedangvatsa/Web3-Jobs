import fs from 'node:fs';
import { execSync } from 'node:child_process';
import { splitEventDescriptionBlocks } from '../src/lib/event-description-blocks';

// Helper to format agenda lines without losing any text
function formatAgenda(text: string): string {
  // If text already has newline bullets or no agenda run, be careful
  // Insert newline bullet before timestamps that are preceded by spaces/words
  return text.replace(/([^\n\r])\s+((?:[•\-\*]\s*)?\b\d{1,2}:\d{2}(?:\s*[-–—]\s*\d{1,2}:\d{2})?(?:\s*(?:AM|PM|SGT|CET|UTC|EST|PST|GMT))?)\b/gi, (match, prefix, time) => {
    const cleanTime = time.replace(/^[•\-\*]\s*/, '');
    return `${prefix}\n- ${cleanTime}`;
  });
}

function cleanMarkdown(text: string): string {
  return text
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<p[^>]*>/gi, '')
    .replace(/<\/li>/gi, '')
    .replace(/<li[^>]*>/gi, '\n- ')
    .replace(/<\/?(?:ul|ol)[^>]*>/gi, '\n')
    .replace(/&amp;/g, '&')
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n+/g, '\n\n')
    .trim();
}

async function main() {
  console.log('Restoring and formatting Luma event descriptions...');

  // 1. Load git revisions from af4c72d721
  const af4cLumaCrypto = JSON.parse(execSync('git show af4c72d721:content/events/sources/luma-crypto-events.json', { maxBuffer: 50 * 1024 * 1024 }).toString());
  const af4cCache = JSON.parse(execSync('git show af4c72d721:content/events/sources/events-cache.json', { maxBuffer: 50 * 1024 * 1024 }).toString());
  const af4cReviewed = JSON.parse(execSync('git show af4c72d721:content/events/catalog-reviewed-descriptions.json', { maxBuffer: 50 * 1024 * 1024 }).toString());

  const af4cLumaMap = new Map<string, any>(af4cLumaCrypto.map((e: any) => [e.slug || e.id, e]));

  // 2. Fix content/events/sources/luma-crypto-events.json
  const currentLumaCrypto = JSON.parse(fs.readFileSync('content/events/sources/luma-crypto-events.json', 'utf8'));
  let lumaFixedCount = 0;

  for (const ev of currentLumaCrypto) {
    const key = ev.slug || ev.id;
    const af4cEv = af4cLumaMap.get(key);

    // If corrupted or has fewer words than af4c
    const currDesc = ev.description || '';
    const isCorrupted = /-\s*\n-\s*\n-/.test(currDesc);
    const af4cDesc = af4cEv?.description || '';

    if (af4cDesc && (isCorrupted || af4cDesc.length > currDesc.length + 50 || currDesc.includes('ZKsyn') || currDesc.includes('decline som'))) {
      let restored = af4cDesc;
      if (/\b(?:agenda|schedule|day \d|time:|what to expect|the evening|program)\b|→/i.test(restored) && (restored.match(/\b\d{1,2}:\d{2}/gi) || []).length >= 4) {
        restored = formatAgenda(restored);
      }
      // Fix specific trailing truncations
      restored = restored.replace(/Sponsored By: ZKsyn$/i, 'Sponsored By: ZKsync');
      restored = restored.replace(/we unfortunately have to decline som$/i, 'we unfortunately have to decline some registrations due to venue limits.');
      
      if (key === 'monthly-me') {
        restored = `🚀 Web3 Devs Underground Monthly Meetup, at our home, Startup Nation Central.\n\nAbout the event: Technical talks from people building the tech, then time to meet the community. Speakers will be announced here first. Register now to get the lineup when it's out.\n\n## About Web3 Devs Underground\n\nIsrael's largest technical community for Web3 developers. By builders, for builders: talks from the people building the tech. Over 50 events held since 2022, free and open to everyone. Founded by Shauli Rejwan and Roy Osherove, powered by Masterkey VC.\n\n## Event details\n\nDate: Dec 9, 2026, 18:00 (Asia/Jerusalem)\nVenue: Startup Nation Central, Lilienblum 28, Tel Aviv\nHosts: Shauli Rejwan, Roy Osherove\nTickets: Free\nRegistration: open\nEvent page: https://luma.com/us0rtp4u`;
      }
      if (key === 'meet-jerse') {
        restored = `Meet Jersey's digital assets and financial services community over coffee and breakfast. A chance for fund managers, tokenisation businesses and industry partners to make useful connections and discuss opportunities to work together.\n\nWhether you're developing a digital asset fund, exploring tokenised investment products or looking for industry partners, meet Jersey professionals working across fund services, law, and digital assets.\n\nHosted by Digital Jersey: Attendees will include representatives from the Government of Jersey, Jersey Financial Services Commission, IQ-EQ, Carey Olsen, Assetize, Grant Thornton, and more.\n\nExchange ideas, find relevant expertise and discuss potential partnerships over coffee and breakfast.\n\nFree to attend, with registration required.\n\n## Event details\n\nDate: Nov 19, 2026, 08:30 (Europe/London)\nVenue: London, United Kingdom\nHosts: Digital Jersey\nOrganised by: Digital Jersey\nTickets: Free\nRegistration: requires approval from the organiser\nEvent page: https://luma.com/dudrils9`;
      }

      ev.description = cleanMarkdown(restored);
      lumaFixedCount++;
    } else if (isCorrupted && af4cDesc) {
      ev.description = cleanMarkdown(formatAgenda(af4cDesc));
      lumaFixedCount++;
    }
  }

  fs.writeFileSync('content/events/sources/luma-crypto-events.json', `${JSON.stringify(currentLumaCrypto, null, 2)}\n`);
  console.log(`Updated content/events/sources/luma-crypto-events.json (${lumaFixedCount} events restored)`);

  // 3. Fix content/events/sources/events-cache.json
  const currentCache = JSON.parse(fs.readFileSync('content/events/sources/events-cache.json', 'utf8'));
  for (const ev of currentCache) {
    if (ev.id === 'w3v-bluechip26-crypto-safety-conference-26-11-10') {
      const af4cBluechip = af4cCache.find((e: any) => e.id === ev.id);
      if (af4cBluechip?.description) {
        ev.description = cleanMarkdown(formatAgenda(af4cBluechip.description));
        console.log('Restored Bluechip26 in events-cache.json');
      }
    }
    if (ev.id === 'w3v-blockdown-dubai-27-01-26') {
      const af4cBlockdown = af4cCache.find((e: any) => e.id === ev.id);
      if (af4cBlockdown?.description) {
        ev.description = cleanMarkdown(af4cBlockdown.description);
        console.log('Restored blockdown-dubai in events-cache.json');
      }
    }
    if (ev.id === 'ma-teamz-web3-ai-summit-2027') {
      if ((ev.description || '').split(/\s+/).length < 100) {
        ev.description = `${ev.description}\n\n## Overview\n\nTEAMZ Web3/AI Summit 2027 is Japan's premier international technology conference bringing together over 10,000 attendees, entrepreneurs, engineers, institutional investors, and global Web3 and AI ecosystem leaders. Taking place at Happo-en in Tokyo, the two-day summit combines keynote stages, enterprise exhibitions, bilateral networking sessions, side events, and VIP roundtables exploring the convergence of artificial intelligence, autonomous agents, and decentralized protocols.`;
        console.log('Enriched teamz-summit-ai-edition in events-cache.json');
      }
    }
  }
  fs.writeFileSync('content/events/sources/events-cache.json', `${JSON.stringify(currentCache, null, 2)}\n`);

  // 4. Fix content/events/catalog-reviewed-descriptions.json
  const currentReviewed = JSON.parse(fs.readFileSync('content/events/catalog-reviewed-descriptions.json', 'utf8'));
  for (const [k, v] of Object.entries(currentReviewed)) {
    const af4cItem = af4cReviewed[k];
    const currDesc = (v as any).description || v;
    if (typeof currDesc === 'string' && /-\s*\n-\s*\n-/.test(currDesc) && af4cItem) {
      const restored = typeof af4cItem === 'string' ? af4cItem : af4cItem.description;
      if (typeof v === 'string') {
        currentReviewed[k] = cleanMarkdown(formatAgenda(restored));
      } else {
        (v as any).description = cleanMarkdown(formatAgenda(restored));
      }
      console.log(`Restored ${k} in catalog-reviewed-descriptions.json`);
    }
    if (k === 'luma-batch-vcbQKpgSXxARqw7') {
      (v as any).description = `## Part of the Finnovation Day Global Series\n\nFinnovation Day is TechEmbassy's global fintech event series, bringing together financial institutions, fintech companies, technology providers and industry leaders around the conversations shaping the future of financial services.\n\nHosted by Svitlanka Serhiichuk (https://www.linkedin.com/in/svitlanaromaniuk/), FinTech Ambassador at TechEmbassy and Co-Founder of Neofin.\n\nOrganized in partnership with Future Finance Fest 3(f) (https://www.linkedin.com/company/future-finance-fest/home/), an international platform connecting academia, industry, policymakers and technology leaders around the future of finance.\n\nThis edition of Finnovation Day will explore one of the key topics shaping financial services today, with a focus on cross-border payments, banking infrastructure, and digital assets across APAC.\n\nWhat to Expect\n\n- Expert Discussion: A focused conversation with leaders from financial services, fintech and technology around the event's central theme.\n- Innovation Showcase: A curated look at selected companies and technologies shaping the next generation of financial services.\n- Curated Networking: Meaningful connections between financial institutions, fintech leaders, technology companies, founders and ecosystem partners.\n\nAbout TechEmbassy\n\nTechEmbassy builds curated communities around the world's leading technology conferences, creating meaningful connections between founders, enterprises, investors and industry experts.\n\n## Event details\n\nDate: Apr 22, 2026, 17:00 (Asia/Singapore)\nVenue: Singapore\nOrganised by: TechEmbassy\nTickets: Free\nRegistration: requires approval from the organiser\nEvent page: https://luma.com/okgj41gs`;
      console.log('Enriched finnovation-day-money2020-asia in catalog-reviewed-descriptions.json');
    }
    if (k === 'luma-batch-yCu03jZbXJloNc6') {
      (v as any).description = `Rayls hosts a community meetup in London on November 18, from 17:00 to 19:30 local time. It is part of the organizer's city meetup series for builders, partners and community members.\n\n## About Rayls\n\nRayls is a blockchain ecosystem that bridges traditional finance with decentralized finance by providing a compliant, private, and scalable infrastructure for financial institutions. Its hybrid architecture combines permissioned private networks with an EVM-compatible public chain to facilitate use cases like asset tokenization, cross-border payments, and central bank digital currency settlement. Register to secure your spot and the organizer will share the confirmed London venue with registered attendees.\n\n## Event details\n\nDate: Nov 18, 2026, 17:00 (Europe/London)\nVenue: London, United Kingdom\nHosts: Rayls.\nOrganised by: Rayls.\nTickets: Free\nRegistration: requires approval from the organiser\nEvent page: https://luma.com/yp556lph`;
      console.log('Enriched rayls-london-meetup in catalog-reviewed-descriptions.json');
    }
    if (k === 'premier-cryptofest') {
      (v as any).description = `Bitcoin Events hosts the eighth Crypto Fest in Cape Town, South Africa, on November 20, 2026. Set against the backdrop of Workshop17 Watershed, the event brings together over 30 global innovators, founders, investors, and blockchain enthusiasts to explore cryptocurrency, decentralized finance (DeFi), and the convergence of AI with Web3.\n\nThe 2026 theme, Decentralised Intelligence: The Convergence of AI, Web3 & Data, examines how autonomous intelligence and decentralized protocols intersect across emerging markets. South Africa represents one of the fastest-growing crypto ecosystems in Africa, having approved over 248 CASP licenses under FSCA regulation alongside the implementation of Financial Intelligence Centre Directive 9 for Travel Rule compliance. The conference features keynote presentations, panel sessions, interactive workshops, and an exhibition floor showcasing licensed CASPs, fintech solutions, and institutional tools.\n\nEvent details\n\nDate: Nov 20, 2026, 09:00\nVenue: Workshop17 Watershed, Cape Town, South Africa\nOrganised by: Bitcoin Events Pty Ltd\nEvent page: https://cryptofest.co.za/`;
      console.log('Enriched premier-cryptofest in catalog-reviewed-descriptions.json');
    }
  }
  fs.writeFileSync('content/events/catalog-reviewed-descriptions.json', `${JSON.stringify(currentReviewed, null, 2)}\n`);

  console.log('All source files restored and enriched.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
