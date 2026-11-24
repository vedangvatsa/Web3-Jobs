import fs from 'node:fs';
import path from 'node:path';
import { getEventBaseSlug, type Web3Event } from '../src/lib/events';

const CACHE_FILE = path.join(process.cwd(), '.cache', 'luma-dubai', 'all_parsed_results.json');
const LUMA_CRYPTO_FILE = path.join(process.cwd(), 'content', 'events', 'sources', 'luma-crypto-events.json');
const SLUG_TYPES_FILE = path.join(process.cwd(), 'content', 'slug-types.json');

const ENRICHED_DESCRIPTIONS: Record<string, string> = {
  'https://luma.com/fzicd2jn': `## About the Summit

The MECA CFO Summit 2026 brings together over 200 chief financial officers, corporate finance leaders, and investment strategists across the Middle East, Eurasia, and Central Asia. Convening at the Metropolitan Hotel Dubai along Sheikh Zayed Road, the summit centers on the evolving mandate of enterprise financial leadership in an era dominated by artificial intelligence, automated treasury operations, and digital asset adoption.

As global financial centers integrate digital asset infrastructure, regional CFOs face new imperatives around capital efficiency, regulatory compliance, and cross-border settlement. This full-day summit provides a dedicated forum for senior executives to exchange practical frameworks for financial transformation, risk mitigation, and long-term enterprise value creation.

## Summit Agenda & Key Themes

- 08:30 AM — Registration, Welcome Coffee & Executive Networking
- 09:30 AM — Opening Keynote: The CFO Agenda Beyond Traditional Finance
- 10:15 AM — Panel: Artificial Intelligence & Automation in Modern Treasury Operations
- 11:30 AM — Executive Discussion: Cross-Border Liquidity & Digital Asset Integration in the UAE
- 01:00 PM — Networking Luncheon & Strategic Partner Showcase
- 02:15 PM — Breakout Sessions: ESG Reporting, Capital Structuring, and Regional Tax Strategies
- 04:00 PM — Closing Roundtable & Leadership Reception

## Who Should Attend

- Chief Financial Officers (CFOs) and Vice Presidents of Finance
- Corporate Treasurers and Heads of Financial Planning & Analysis (FP&A)
- Managing Directors and Investment Committee Members
- Enterprise Technology Leaders evaluating finance automation and digital assets

## Venue & Registration Details

- Venue: Metropolitan Hotel Dubai, Sheikh Zayed Road, Exit 41, Al Thanya Street, Dubai, United Arab Emirates
- Access: Corporate registration is required via the official MECA CFO Global portal. Verified CFOs and institutional finance leaders receive priority access.`,

  'https://luma.com/ecox-lnpi': `## About the Event

Kick off Dubai Blockchain Week with EcoX Network at the high-altitude Tacenda Lounge, located on the 68th floor of the JW Marriott Marquis in Business Bay. Block Mondays serves as the premier community gathering point for international crypto founders, Web3 builders, venture capitalists, and ecosystem leaders arriving in Dubai.

Hosted by EcoX founders Franco Fiore and Jorge Sebastiao, this evening mixer combines panoramic skyline views with curated networking, setting the stage for discussions spanning decentralized finance, layer-1 infrastructure, AI onchain agents, and regional digital asset regulations.

## Evening Schedule & Highlights

- 06:00 PM — Doors Open, Registration & Welcome Drinks
- 07:00 PM — Welcome Address & Blockchain Week Overview by EcoX Network Founders
- 07:30 PM — Open Networking, Partner Collaborations & Deal Discussions
- 09:30 PM — Evening Mixer & Skyline Lounge Reception until Late

## Key Event Details

- Venue: Tacenda Lounge, JW Marriott Marquis Dubai (Tower B, 68th Floor), Business Bay, Dubai, UAE
- Parking: Complimentary valet parking available at the hotel entrance
- Access: Registration required via Luma. RSVP is required for venue entry; beverage packages are redeemable on-site.`,

  'https://luma.com/ihbwqleq': `## About the Tournament

Join BingX for a competitive yet friendly padel tournament during BingX Dubai Week 5.0, taking place in parallel with Blockchain Life and AI Future Week 2026. Designed for crypto traders, partners, founders, and community builders, the tournament offers an energetic setting to build relationships outside the conference hall.

Padel has rapidly emerged as the preferred sport for the global crypto community in Dubai. Whether you are an experienced player or picking up a racket for a fun afternoon, this round-robin tournament matches participants into dynamic doubles pairings with prizes, refreshments, and informal networking throughout the afternoon.

## Tournament Schedule & Activities

- 02:30 PM — Check-in, Warm-Up & Bracket Announcement
- 03:00 PM — Round-Robin Group Matches
- 05:00 PM — Semifinals & Championship Match
- 06:00 PM — Trophy Presentation, Refreshments & Builder Social

## Participation & Venue Information

- Format: Friendly doubles tournament with rolling brackets
- Equipment: Padel rackets and balls provided on-site
- Location: Private padel club in Dubai (exact address sent to approved participants upon RSVP confirmation)
- Host Contact: Connect with the BingX community team on Telegram (@eugenebingx) for bracket and team queries.`,

  'https://luma.com/qnvpx8yp': `## About the Experience

Experience a restorative Russian-style banya and wellness retreat hosted by BingX as part of BingX Dubai Week 5.0. Designed as an exclusive retreat during the high-paced Blockchain Life and AI Future Week, this private gathering combines traditional steam rituals with high-level networking among crypto founders, exchange partners, and institutional traders.

Participants can recharge through curated thermal cycles, cold plunge pools, and herbal steam aromatherapy in one of Dubai's premier luxury wellness retreats. The relaxed, tech-free environment fosters genuine conversations and strategic partnerships away from crowded expo floors.

## Experience Highlights

- Master-led thermal steam sessions and traditional banya venik rituals
- Private contrast therapy: Finnish saunas, herbal steam rooms, and cold plunge baths
- Gourmet herbal teas, fresh juices, and light organic refreshments
- Curated networking in a quiet, private lounge with BingX executives and key partners

## Access & Attendance Guidelines

- Format: Private, capacity-limited wellness session
- Location: Exclusive private wellness retreat in Dubai (location shared directly with approved guests)
- Attire: Appropriate swimwear required; bathrobes, towels, and slippers provided on-site
- Approval: Registration is subject to host approval via Luma.`,

  'https://luma.com/nl8t1z95': `## About the Official Afterparty

Celebrate the grand conclusion of Blockchain Life 2026 at Privilege Dubai Club, the legendary sky-high nightlife venue on the rooftop of the SLS Dubai Hotel in Business Bay. As the official afterparty of one of the world's largest cryptocurrency and Web3 conferences, this evening brings together over 1,500 VIP attendees, top keynote speakers, exchange leaders, and venture funds under the stars.

Featuring live performances by world-class electronic music headliners, open-air infinity pool terraces, and panoramic views of the Burj Khalifa and Downtown Dubai skyline, the Blockchain Life Afterparty provides an unforgettable finale for dealmakers and builders celebrating the next market cycle.

## Evening Schedule & Highlights

- 09:00 PM — VIP Red Carpet Entry & Welcome Cocktails
- 10:00 PM — Opening DJ Set & Skyline Lounge Networking
- 11:30 PM — Headline Artist Performance & Live Visual Show
- 01:30 AM — Late-Night Electronic Music Showcase until 04:00 AM

## Entry & Ticketing Policy

- Important Note: Luma RSVP serves as an informational calendar listing; official entry requires a valid Blockchain Life 2026 VIP Pass or dedicated Afterparty Ticket purchased via the official conference website (blockchain-life.com).
- Venue: Privilege Dubai, 75th Floor, SLS Dubai Hotel & Residences, Marasi Drive, Business Bay, Dubai, UAE
- Dress Code: Elegant nightlife attire strictly enforced.`,

  'https://luma.com/c5rkb22q': `## About the Event

Hit the Arabian Gulf waters for a high-speed jet ski adventure hosted by BingX during Dubai Week 5.0. Cruising past the iconic Dubai Marina skyline, JBR beach, and Ain Dubai, this outdoor adventure offers crypto founders, traders, and ecosystem builders an exhilarating way to experience the city from the water.

Led by certified instructors with top-tier watercraft, the convoy navigates open coastal water routes with dedicated stops for photography and informal conversations among participants.

## Adventure Itinerary

- 09:00 AM — Arrival, Safety Briefing & Life Jacket Fitting
- 09:30 AM — Guided Coastal Jet Ski Tour around Dubai Marina & Palm Jumeirah
- 10:30 AM — Docking, Refreshments & Water-side Networking Lounge

## Participation Requirements

- Valid ID/Passport required at check-in
- Life jackets and safety gear provided
- Suitable for both beginners and experienced riders
- Location: Dubai Marina Watersports Center (full address sent to confirmed RSVPs).`,

  'https://luma.com/bgvni91a': `## About the Expedition

Venture deep into the Arabian desert for a thrilling dune buggy safari organized by BingX as part of BingX Dubai Week 5.0. Moving beyond conference halls and hotels, this off-road expedition places crypto enthusiasts and partners behind the wheel of high-performance off-road buggies designed to conquer red sand dunes and steep ridges.

Following an adrenaline-charged desert drive, participants gather at a private Bedouin-style desert camp for traditional refreshments, sunset views, and relaxed networking with the BingX team and fellow builders.

## Expedition Schedule

- 03:00 PM — Private Transfer Pickup from Central Dubai
- 04:00 PM — Arrival at Desert Staging Area & Safety Instructions
- 04:30 PM — Guided Dune Buggy Convoy Drive across Red Sand Dunes
- 06:00 PM — Sunset Gathering, Arabic Coffee & Desert Camp Networking
- 07:30 PM — Return Transfer to Dubai

## Details & Access

- Safety equipment (helmets, goggles) provided
- Drivers must hold a valid driver's license
- Location: Dubai Desert Conservation Area (transfer details provided upon RSVP approval).`,

  'https://luma.com/pmn95r77': `## About the Motocross Session

Experience pure adrenaline on the Dubai sand dunes with a desert motocross riding session hosted by BingX. As part of BingX Dubai Week 5.0, this high-energy sports meetup gives adventure-seeking crypto founders and traders the chance to ride specialized desert dirt bikes across sweeping sand dunes.

Under the guidance of professional desert motocross coaches, riders are grouped by experience level to navigate custom sand tracks, carve berms, and tackle dunes, followed by cold drinks and desert camaraderie.

## Program Schedule

- 03:00 PM — Staging Area Check-in & Gear Fitting
- 03:30 PM — Track Orientation & Riding Technique Briefing
- 04:00 PM — Guided Desert Motocross Sessions (Beginner & Advanced Groups)
- 05:30 PM — Sunset Cool-Down, Drinks & Community Chat

## Requirements & Venue

- Full protective riding gear (boots, chest protector, helmet, gloves) supplied
- Motorcycle riding experience recommended
- Private desert track location shared upon RSVP confirmation via Luma.`,

  'https://luma.com/ecox-fqym': `## About Block Mondays (ADFW Edition)

Block Mondays by EcoX Network returns for a special Abu Dhabi Finance Week edition at the panoramic Tacenda Lounge on the 68th floor of the JW Marriott Marquis in Business Bay, Dubai. As thousands of global institutional investors, sovereign wealth fund representatives, and Web3 founders convene in the UAE for ADFW, this evening serves as an accessible bridge between the Dubai Web3 tech ecosystem and Abu Dhabi financial leadership.

Hosted by EcoX founders Franco Fiore and Jorge Sebastiao, Block Mondays brings together blockchain architects, fintech innovators, family office principals, and digital asset managers for an evening of cross-ecosystem conversations, capital introductions, and partnership building.

## Evening Schedule

- 06:00 PM — Check-in, Panoramic Skyline Views & Welcome Drinks
- 07:15 PM — Opening Remarks: Bridging Traditional Capital & Onchain Markets during ADFW
- 07:45 PM — Curated Introductions & Unconference Networking
- 10:30 PM — Late-Night Discussions & Closing Social

## Venue & Access Information

- Venue: Tacenda Lounge, 68th Floor, Tower B, JW Marriott Marquis Dubai, Business Bay
- Transit & Parking: Free valet parking available for all registered guests
- RSVP: Free registration via Luma; beverage redemption vouchers available at the venue.`,

  'https://luma.com/16y1q9k0': `## About the Workshop

Meet Manus 2.0 is an interactive, practical workshop focused on real-world implementations of the Manus 2.0 autonomous agent platform. Hosted at MAKTABI Business Center on the 18th floor of the Sheikh Rashid Tower at the Dubai World Trade Centre (DWTC), this meetup moves beyond high-level AI hype to examine what autonomous agents can accomplish in live production environments.

Led by advanced AI practitioner Cyrille C. Catel, the session features live demonstrations of custom agentic pipelines built with Manus 2.0, practical techniques for using agents as consulting copilots, and open architecture reviews of attendee workflows.

## Session Agenda

- Welcome & Setup: Connecting laptops and local developer environments
- Live Demonstration: Building and deploying autonomous agents with Manus 2.0
- Consulting & Enterprise Workflows: Real-world case studies in client deliverables
- Interactive Teardown: Attendees share workflows, edge cases, and debugging techniques
- Q&A & Community Networking with Dubai AI builders

## Who Should Attend

- AI engineers, software developers, and technical founders
- Independent consultants and strategy advisors looking to automate workflows
- Product leaders exploring autonomous agent integration

## Venue Details

- Location: MAKTABI Business Center, DWTC, Sheikh Rashid Tower (18th Floor), Dubai, UAE
- What to Bring: Bring your laptop to follow along and test workflows live.`,

  'https://luma.com/3gqqq2zr': `## About the Evening Workshop

Meet Manus 2.0 (Session #2) is an evening practical masterclass exploring advanced autonomous agent automation using the Manus 2.0 platform. Hosted at MAKTABI Business Center within the Dubai World Trade Centre (DWTC), this session is tailored for technical professionals, agency founders, and consultants seeking hands-on mastery of production-grade AI agents.

Host Cyrille C. Catel shares end-to-end architectures of client projects powered by Manus 2.0, walking through tool calling, asynchronous execution, and multi-agent coordination.

## Workshop Agenda

- 06:30 PM — Arrival, Setup & Coffee Networking
- 07:00 PM — Live Architecture Breakdown: Complex Multi-Agent Workflows
- 08:00 PM — Hands-on Debugging & Pipeline Optimization
- 08:45 PM — Collaborative Teardown & Founder Q&A

## Venue & Requirements

- Location: MAKTABI Business Center, DWTC, Sheikh Rashid Tower (18th Floor), Dubai, UAE
- Prerequisites: Laptop required for interactive participation.`,

  'https://luma.com/nmdmm8u4': `## About the Dinner

Hosted on the opening evening of Abu Dhabi Finance Week (ADFW) 2026, the Founder × VC VIP Dinner is an exclusive, invite-only seated dinner bringing together exceptional founders, top-tier venture capitalists, family office principals, and sovereign wealth investors. Organized by BackersStage Capital, this intimate dinner provides a confidential, distraction-free environment for substantive conversations on venture funding, scaling global technology enterprises, and capitalizing on the UAE's burgeoning innovation corridor.

With seats strictly curated to maintain a high-signal investor-to-founder ratio, the evening emphasizes direct relationship-building over formal pitches, featuring gourmet dining and curated introductions.

## Dinner Schedule

- 07:00 PM — Arrival, Signature Cocktails & Private Reception
- 07:45 PM — Seated Multi-Course Dinner & Strategic Table Discussions
- 09:15 PM — Dessert, Digestifs & Open Dealflow Networking
- 10:30 PM — Dinner Conclusion

## Attendance & Venue Information

- Format: Strictly invite-only, seated private dinner
- Location: Premium fine dining venue in Abu Dhabi (exact address disclosed to confirmed guests)
- Host Contact: For partnership or guest inquiries, contact BackersStage Capital (atharv@backersstage.com).`,

  'https://luma.com/dinner_7_2026abudhabi': `## About the Private LP Dinner

Gamma Prime hosts its signature private investor dinner in Abu Dhabi during Abu Dhabi Finance Week 2026. Designed exclusively for institutional Limited Partners (LPs), single and multi-family offices, endowment managers, and fund-of-funds leaders, this invitation-only gathering offers an intimate, peer-level environment to discuss global asset allocation, fund manager selection, venture capital secondaries, and macroeconomic trends.

Gamma Prime has hosted more than 110 private investor dinners globally, welcoming over 2,350 leading investors. This Abu Dhabi edition takes place at an acclaimed local fine dining destination, offering award-winning cuisine, signature pairings, and high-trust networking.

## Evening Highlights

- Closed-door, Chatham House Rule discussions on fund performance and macro liquidity
- Curated seat placements matching institutional allocators with complementary focus areas
- Fine dining multi-course menu crafted by award-winning chefs
- Complete absence of promotional pitches or commercial presentations

## Attendance Criteria

- Eligibility: Attendance is strictly limited to verified institutional LPs, family office investment directors, and fund-of-funds partners.
- Location: Top-tier private dining room in Abu Dhabi, United Arab Emirates (location shared upon approved verification).`,

  'https://luma.com/vfjm6s3n': `## About the Roundtable Breakfast

Join the AI Work and Skills Forum for an exclusive executive breakfast roundtable exploring the strategic opportunities and operational challenges of enterprise AI adoption across the United Arab Emirates. Convening at the DMCC AI Centre in Dubai during the week of Abu Dhabi Finance Week, this morning dialogue brings together corporate executives, technology policy leaders, and AI founders to examine practical implementations of machine intelligence.

The session features an intimate conversation with a pioneering AI founder, providing ground-level perspectives on deploying LLM architectures, managing workforce transitions, and developing regional AI capabilities aligned with the UAE National Artificial Intelligence Strategy.

## Breakfast Schedule

- 08:30 AM — Executive Arrival, Fresh Artisan Coffee & Continental Breakfast
- 09:00 AM — Fireside Chat: Scaling Enterprise AI in the Middle East
- 09:40 AM — Moderated Roundtable Discussion: Workforce Transformation & AI Skills
- 10:30 AM — Open Networking & Collaborative Strategy Exchange

## Venue & Registration

- Venue: DMCC AI Centre, Jumeirah Lakes Towers (JLT), Dubai, United Arab Emirates
- Host: AI Work and Skills Forum (aiworkandskills.com)
- Attendance: Curated for enterprise decision-makers, CTOs, and AI business leaders.`,

  'https://luma.com/Private_Dinner_Abu_Dhabi': `## About the Private Dinner

The HSC Private Dinner is an exclusive, closed-door gathering hosted during Abu Dhabi Finance Week for HSC Club members, premier digital asset managers, family office principals, and institutional investment directors. Organized alongside the HSC Asset Management Abu Dhabi Summit, this private evening brings together an elite circle of capital allocators overseeing multi-million dollar portfolios across digital assets, private credit, and venture equity.

Set within an intimate private dining suite at The Abu Dhabi EDITION in Al Bateen, the dinner offers an elegant atmosphere for high-stakes dealmaking, strategic co-investment discussions, and cross-border partnership development.

## Evening Program

- 06:00 PM — Welcome Reception & Champagne Toast
- 07:00 PM — Seated Gourmet Dinner by Michelin-starred Culinary Team
- 08:30 PM — Private Roundtable: Digital Asset Market Dynamics & Institutional Inflows
- 10:00 PM — Digestifs & Informal Executive Networking

## Guest Policy & Venue Details

- Eligibility: Access is strictly limited to approved HSC Club members, verified family office trustees, and institutional fund managers.
- Venue: Private Dining Room, The Abu Dhabi EDITION, Marina, Al Bateen, Abu Dhabi, UAE.`
};

function cleanSlug(name: string): string {
  const base = getEventBaseSlug({ name });
  return base.replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

async function main() {
  const rawResults = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
  const currentLumaCrypto: Web3Event[] = JSON.parse(fs.readFileSync(LUMA_CRYPTO_FILE, 'utf8'));
  const slugTypes = JSON.parse(fs.readFileSync(SLUG_TYPES_FILE, 'utf8'));

  const reservedSlugs = new Set<string>();
  for (const list of Object.values(slugTypes) as string[][]) {
    for (const s of list) reservedSlugs.add(s.toLowerCase());
  }

  const existingById = new Map<string, Web3Event>();
  const existingByUrl = new Map<string, Web3Event>();
  for (const e of currentLumaCrypto) {
    existingById.set(e.id, e);
    if (e.url) existingByUrl.set(e.url.toLowerCase().replace(/\/$/, ''), e);
    if (e.registrationUrl) existingByUrl.set(e.registrationUrl.toLowerCase().replace(/\/$/, ''), e);
  }

  console.log(`Starting ingestion with ${currentLumaCrypto.length} existing luma-crypto events.`);

  let newlyAdded = 0;
  let updatedExisting = 0;

  for (const res of rawResults) {
    const patch = res.patch;
    if (!patch) continue;

    const rawUrl = patch.registrationUrl || '';
    const normUrl = rawUrl.toLowerCase().replace(/\/$/, '');
    const eventId = patch.sourceVerification?.eventId || '';
    const customId = `luma-crypto-${eventId.replace(/^evt-/, '')}`;

    // Check if ADFW side event
    const name = patch.name || '';
    const desc = (ENRICHED_DESCRIPTIONS[rawUrl] || patch.description || '').trim();
    const startDate = patch.startDate || '';
    const dt = startDate.slice(0, 10);
    const loc = patch.location || '';
    const city = patch.city || '';

    const isAdfwDate = dt >= '2026-12-06' && dt <= '2026-12-11';
    const hasAdfwMention = /adfw|abu dhabi finance week|finance week/i.test(`${name} ${desc}`);
    const isUaeFinance = isAdfwDate && /abu dhabi|finance|investor|token|crypto|web3|ai|wealth|solana|manus|founder|dinner|summit|soiree|cfo/i.test(`${name} ${desc}`);

    const isAdfwSideEvent = hasAdfwMention || isUaeFinance;

    const sideEventFor = isAdfwSideEvent ? ['adfw'] : undefined;

    // Check if already in catalog
    const existing = existingById.get(customId) || existingByUrl.get(normUrl);
    if (existing) {
      // Update sideEventFor if applicable
      if (isAdfwSideEvent && (!existing.sideEventFor || !existing.sideEventFor.includes('adfw'))) {
        existing.sideEventFor = Array.from(new Set([...(existing.sideEventFor || []), 'adfw']));
        updatedExisting++;
        console.log(`[UPDATE ADFW TAG] ${existing.name} -> sideEventFor: ${JSON.stringify(existing.sideEventFor)}`);
      }
      continue;
    }

    // Generate unique short slug
    let baseSlug = cleanSlug(name);
    if (baseSlug.length > 25) {
      baseSlug = baseSlug.slice(0, 25).replace(/-[^-]*$/, '');
    }
    if (!baseSlug) baseSlug = `event-${eventId.slice(4, 12).toLowerCase()}`;

    let finalSlug = baseSlug;
    let counter = 1;
    while (reservedSlugs.has(finalSlug)) {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }
    reservedSlugs.add(finalSlug);

    const newEvent: Web3Event = {
      ...patch,
      id: customId,
      slug: finalSlug,
      name,
      description: desc,
      startDate,
      endDate: patch.endDate || startDate,
      city: city || undefined,
      country: patch.country || 'United Arab Emirates',
      location: loc || (city ? `${city}, United Arab Emirates` : 'United Arab Emirates'),
      url: rawUrl,
      registrationUrl: rawUrl,
      coverImage: patch.coverImage || null,
      source: 'luma-crypto',
      ...(sideEventFor ? { sideEventFor } : {}),
      timezone: patch.timezone || 'Asia/Dubai',
      sourceVerification: {
        url: rawUrl,
        eventId,
        fetchedAt: patch.sourceVerification?.fetchedAt || new Date().toISOString(),
        method: 'luma-api'
      }
    };

    currentLumaCrypto.push(newEvent);
    existingById.set(customId, newEvent);
    existingByUrl.set(normUrl, newEvent);
    newlyAdded++;
    console.log(`[ADDED ${isAdfwSideEvent ? 'ADFW' : 'DUBAI'}] /${finalSlug} : ${name.slice(0, 50)} (desc: ${desc.length} chars)`);
  }

  // Sort events
  currentLumaCrypto.sort((a, b) => a.startDate.localeCompare(b.startDate) || a.name.localeCompare(b.name));

  fs.writeFileSync(LUMA_CRYPTO_FILE, `${JSON.stringify(currentLumaCrypto, null, 2)}\n`);
  console.log(`\nDone! Added ${newlyAdded} new events, updated ${updatedExisting} existing events.`);
  console.log(`Total events in ${LUMA_CRYPTO_FILE}: ${currentLumaCrypto.length}`);
}

main().catch(console.error);
