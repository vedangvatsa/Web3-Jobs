import fs from 'node:fs';
import { createHash } from 'node:crypto';
import type { Web3Event } from '../src/lib/events';
import { cleanPublishText } from '../src/lib/noslop';
import { polishEventDescriptionLinks } from '../src/lib/event-description-links';

const sha = (value: string) => createHash('sha256').update(value).digest('hex');
const now = () => new Date().toISOString();

interface EnrichmentData {
  slug: string;
  description: string;
}

const ENRICHMENTS: EnrichmentData[] = [
  {
    slug: 'pickleball',
    description: `Superteam India hosts the Sunday Morning Padel & Pickleball Club in Mumbai on November 1, 2026, from 07:00 to 09:00 IST. The casual sports gathering brings together Solana builders, founders, designers and operators in Mumbai for India Blockchain Week and Devcon for a morning of friendly court competition.

## What to expect

The session features casual games across dedicated padel and pickleball courts. Equipment including paddles and balls is provided on site. Whether you are an experienced player or picking up a paddle for the first time, players of all skill levels are paired for informal doubles matches. Fresh juices, coconut water and morning breakfast refreshments will be served court-side.

## Who should attend

This meetup is designed for Superteam India members, Solana ecosystem contributors, Web3 founders and friends looking to connect through sports before the week of technical conferences and hackathons begins.

## Venue and schedule

The event takes place in the Mount Mary neighborhood of Bandra West, Mumbai, on Sunday, November 1, running from 07:00 to 09:00 IST. Comfortable athletic footwear and sportswear are recommended.

## Registration and admission

Registration is completely free and requires organizer approval. Court capacity is strictly limited to ensure adequate play time for all confirmed attendees. Approved guests will receive the exact court address and arrival details upon confirmation.`,
  },
  {
    slug: 'unofficial-devcon-afterparty',
    description: `Web3 Events hosts an energetic community Devcon Afterparty in Mumbai on Friday, November 6, 2026, from 21:30 IST until 01:00 on November 7. The social gathering celebrates the conclusion of the main Devcon 8 conference sessions, bringing together international Ethereum contributors, researchers and local builders.

## What to expect

The evening features live DJ performances, a curated selection of cocktails and drinks, and open-floor social networking. Unlike formal conference sessions, there are no panels, keynotes or sponsor pitches. The venue offers a high-energy dance floor alongside lounge seating for relaxed conversations with developers and teams from across the global Web3 ecosystem.

## Who should attend

The party is open to Devcon 8 attendees, hackathon participants, founders, smart-contract auditors and Web3 enthusiasts visiting Mumbai who want to celebrate a full week of Ethereum technical milestones with fellow community members.

## Venue and schedule

The party takes place at a premium nightlife venue in Mumbai on November 6, beginning at 21:30 IST and running late into the night until 01:00 IST on Saturday, November 7.

## Registration and admission

RSVP is free via Luma and subject to venue capacity limits. Guests are encouraged to arrive early with a valid ID and their confirmation QR code, as entry is managed on a first-come, first-served basis at the door.`,
  },
  {
    slug: 'zyhperpunks-dinner-devcon',
    description: `Zcash and Harsh Bajpai host the Zyhperpunks Dinner in Mumbai on November 3, 2026, from 19:30 to 22:30 IST during Devcon week. The evening brings together privacy researchers, cryptographers and cypherpunks for an intimate dinner and technical conversation on zero-knowledge privacy.

## What to expect

The program begins with a 30-minute overview of recent Zcash technical developments, network scalability improvements, and user-facing privacy tools. Attendees participate in an interactive onboarding clinic using the Zashi shielded wallet to experience private transactions firsthand. The presentation transitions into a multi-course dinner with open roundtable discussions on financial sovereignty, regulatory compliance through selective disclosure, and the state of client-side ZK-proofs.

## Who should attend

This gathering is tailored for privacy advocates, zero-knowledge engineers, cryptography researchers, and open-source contributors passionate about preserving privacy and freedom in decentralized networks.

## Venue and schedule

The dinner takes place in the Ram Krishna Nagar neighborhood of Khar West / Bandra, Mumbai, on Tuesday, November 3, running from 19:30 to 22:30 IST.

## Registration and admission

Attendance is free and requires host approval to maintain an intimate table size conducive to deep technical discussions. Venue address and directions will be shared directly with approved guests.`,
  },
  {
    slug: 'unfollow-002-mumbai-afterparty-zcash-bitrefill',
    description: `WebZero, Zcash and Bitrefill present UNFOLLOW_002 Mumbai, the official celebration and afterparty following the Free Society Hackathon during Devcon week. The event runs from 21:00 IST on Thursday, November 5, 2026, until 03:00 on Friday, November 6.

## What to expect

UNFOLLOW_002 continues WebZero's series of privacy-focused culture nights. The event features electronic music by underground international and local DJs, visual art installations, open bars and food stations. It provides a relaxed environment where hackathon finalists, cypherpunks, and crypto-commerce pioneers can unwind and connect after days of intensive building.

## Who should attend

The afterparty welcomes Free Society Hackathon participants, Zcash ecosystem builders, Bitrefill community members, Ethereum developers, and privacy advocates attending Devcon 8 in Mumbai.

## Venue and schedule

The event takes place in the MMRDA Area near the Bandra Kurla Complex (BKC) in Mumbai. Doors open at 21:00 IST on November 5, with music and celebrations continuing through 03:00 IST on November 6.

## Registration and admission

Registration is free via Luma and subject to approval. Guests must show their confirmation pass and valid government-issued photo ID at the door. Early arrival is recommended as entry is subject to venue capacity limits.`,
  },
  {
    slug: 'devcon-builders-evening-canton-x-ledger-x-openzeppelin',
    description: `WAGMI Tribe, Ledger, OpenZeppelin and the Canton Foundation host the Devcon Builders Evening in Mumbai on Thursday, November 5, 2026, from 18:00 to 22:00 IST. The collaborative session explores institutional privacy, hardware security, and smart contract auditing.

## What to expect

The evening program includes technical keynotes and live Q&A sessions delivered by senior security engineers and architects:
• OpenZeppelin engineers discuss smart contract defense, automated invariant testing, and post-deployment monitoring.
• Ledger experts present advancements in hardware-enforced signer security and transaction clear-signing standards.
• The Canton Foundation showcases architectural deep dives on Canton Network's privacy-enabled distributed ledger, demonstrating how regulated institutions achieve atomic composability without leaking transactional privacy.
The presentations are followed by a buffet dinner, drinks, and networking with security researchers.

## Who should attend

The event is designed for smart-contract engineers, protocol architects, cybersecurity researchers, enterprise blockchain leads, and DeFi developers focused on building bulletproof Web3 infrastructure.

## Venue and schedule

The event takes place at a private corporate venue in the MMRDA / BKC business district of Mumbai on November 5, running from 18:00 to 22:00 IST.

## Registration and admission

Attendance is free and requires approval. Registrations are vetted to ensure relevant background for technical sessions. Confirmed attendees receive the full venue coordinates prior to the event.`,
  },
  {
    slug: 'logos-circle-mumbai-run-club',
    description: `Logos Circle Mumbai hosts a scenic sunrise run along Mumbai's iconic Marine Drive promenade on Tuesday, November 3, 2026, from 06:30 to 08:30 IST. The gathering offers a refreshing start to the week for builders, researchers, and decentralized tech advocates.

## What to expect

The run begins with group warm-up exercises and dynamic stretching led by community running leads. Participants complete a relaxed 3 km jog along the Marine Drive jogging track with panoramic views of the Arabian Sea. Following the run, attendees gather for cool-down stretches, fresh tender coconut water, and casual breakfast conversations about decentralized systems, trustless communications, and peer-to-peer privacy infrastructure.

## Who should attend

The run is open to all fitness levels, from novice joggers to seasoned runners, including Devcon attendees, Logos community members, and Web3 developers who want to stay active during conference week.

## Venue and schedule

Meet at the Marine Drive Jogging Track near Nariman Point, South Mumbai, at 06:30 IST on Tuesday, November 3. The run and cool-down conclude by 08:30 IST, giving attendees ample time to freshen up before daytime conference sessions.

## Registration and admission

Participation is free of charge. RSVP on Luma is requested to help organizers coordinate hydration, refreshments, and pace groups. Wear comfortable running shoes and breathable athletic attire.`,
  },
  {
    slug: 'liquidity-pool-devcon',
    description: `Web3 Mumbai and community leads Harsh Gupta and Fardeen Samir host Liquidity Pool @Devcon 8 in Mumbai on Tuesday, November 3, 2026, from 21:30 IST to 00:30 on November 4. The evening meetup brings together DeFi market makers, traders, and protocol builders.

## What to expect

The event provides an informal, lounge-style networking atmosphere focused on decentralized finance and liquidity infrastructure. Discussion topics include automated market maker (AMM) design, cross-chain order routing, high-frequency onchain trading, and liquidity provisioning strategies across Layer 2 networks. Cocktails and appetizers will be served throughout the evening with ambient music for easy networking.

## Who should attend

This mixer is curated for DeFi founders, quantitative analysts, liquidity providers, decentralized exchange (DEX) developers, and crypto fund managers attending Devcon and India Blockchain Week.

## Venue and schedule

The gathering takes place at a premier lounge in Mumbai on Tuesday night, November 3, running from 21:30 IST to 00:30 IST.

## Registration and admission

Registration is free and subject to host approval to ensure an authentic peer group of market makers and builders. Exact venue location will be sent directly to approved participants via Luma.`,
  },
  {
    slug: 'p2p-networking-hub-devcon-8',
    description: `ProbeLab, the Ethereum Foundation, HOPR and Optimum host the P2P Networking Hub at Devcon 8 on Wednesday, November 4, 2026, from 10:00 to 17:00 IST in Mumbai. The full-day collaborative unconference focuses on peer-to-peer protocols, decentralized transport, and network layer resilience.

## What to expect

The hub features an interactive program organized into technical presentations, hands-on debugging clinics, and open breakout sessions:
• Peer discovery and DHT performance across discv5, Kademlia, and gossipsub networks.
• Transport protocols and privacy, highlighting libp2p enhancements, mixnets, and traffic analysis resistance.
• Ethereum client networking benchmarks, examining bandwidth optimization, latency Reduction, and message propagation bottlenecks.
• Interactive clinics where client teams review telemetry data, diagnose live testnet connection issues, and workshop next-generation transport specifications.

## Who should attend

This unconference is intended for P2P protocol researchers, client core developers (Geth, Nethermind, Besu, Lighthouse, Prysm), network infrastructure engineers, and developers building decentralized storage and messaging applications.

## Venue and schedule

The event takes place inside the Jio World Convention Centre in the Bandra Kurla Complex (BKC), Mumbai, within the Devcon Impact Space, on November 4 from 10:00 to 17:00 IST.

## Registration and admission

Access is free for Devcon 8 attendees. Advance registration on Luma is encouraged to receive schedule updates, presentation slides, and clinic agenda materials.`,
  },
  {
    slug: 'mev-sangam-mumbai',
    description: `Astralane and hosts Sujith Sizon, Manan Indir Singh, and Dhruvraj Solanki present MeV Sangam in Mumbai on Monday, November 2, 2026, from 18:00 to 22:00 IST. The off-the-record gathering convenes quantitative researchers, searchers, and block builders exploring maximal extractable value.

## What to expect

MeV Sangam is conducted under Chatham House Rule to encourage transparent, candid discussion on the frontier of MEV research:
• Proposer-Builder Separation (PBS) dynamics and inclusion lists across Ethereum Layer 1 and rollups.
• Solana searcher latency wars, Jito auction mechanics, and priority fee markets.
• Orderflow auctions, private mempools, and fair-sequencing mechanisms.
• High-frequency arbitrage, statistical cross-chain arbitrage, and algorithmic liquidation risks.
The presentations are followed by a private networking dinner with craft beers, cocktails, and food.

## Who should attend

Attendance is limited to active MEV searchers, quantitative trading engineers, block builders, relay operators, and protocol economists specializing in mechanism design.

## Venue and schedule

The dinner takes place at a private dining venue in G Block, Bandra Kurla Complex (BKC), Mumbai, on Monday, November 2, running from 18:00 to 22:00 IST.

## Registration and admission

Registration is strictly approval-based with limited seating. Applications are reviewed based on active contributions to MEV research and trading infrastructure. Confirmed guests receive confidential venue coordinates.`,
  },
  {
    slug: 'capital-connect',
    description: `Web3 Events hosts Capital Connect in Mumbai on Wednesday, November 4, 2026, from 20:00 to 23:00 IST. The curated investor and founder reception facilitates meaningful capital introductions and strategic partnerships during Devcon week.

## What to expect

Capital Connect provides a structured yet relaxed networking setting designed for high-signal discussions. Early-stage and growth-stage founders connect directly with global venture capital partners, angel syndicates, and ecosystem foundation grant leads. There are no podium pitches; instead, the format emphasizes 1-on-1 conversations, facilitated introductions, and curated discussion corners over gourmet appetizers and wine.

## Who should attend

The gathering is reserved for venture capital partners, family office principals, angel investors, ecosystem fund directors, and vetted Web3 founders currently raising seed or Series A capital.

## Venue and schedule

The reception is hosted at an upscale hospitality venue in central Mumbai on Wednesday, November 4, from 20:00 to 23:00 IST.

## Registration and admission

Tickets are complimentary but strictly invitation-only and subject to manual review. Founders must provide a project overview, and investors must verify their fund affiliation when requesting an RSVP.`,
  },
  {
    slug: 'crypto-afterhours-mumbai',
    description: `Mandala Network and community lead Gurnaman host the Mumbai Edition of Crypto Afterhours on Wednesday, November 4, 2026, from 20:00 to 23:30 IST. The evening salon offers a laid-back environment for meaningful connection away from crowded convention halls.

## What to expect

Crypto Afterhours creates a relaxed living-room atmosphere where founders, operators, and developers can unwind and discuss the human side of building in Web3. The evening includes ambient lounge music, craft cocktails, mocktails, and finger foods. Conversations center around startup survival, scaling decentralized communities, product-market fit, and personal experiences navigating volatile market cycles.

## Who should attend

This gathering is open to Web3 founders, technical leads, community builders, product managers, and international delegates seeking genuine peer connection and candid conversations in Mumbai.

## Venue and schedule

The event takes place at a private boutique venue in Bandra West, Mumbai, on November 4, running from 20:00 to 23:30 IST.

## Registration and admission

Admission is free and approval-based via Luma. Capacity is capped to maintain a comfortable, non-crowded atmosphere. Approved guests receive the venue location prior to the event.`,
  },
  {
    slug: 'mip-20',
    description: `ETHMumbai hosts MIP-20: Road to Devcon on Friday, October 30, 2026, from 15:00 to 18:00 IST. The pre-conference developer meetup introduces the Mumbai Improvement Proposal 20 and highlights local Ethereum contributions.

## What to expect

The session features technical presentations and community discussions:
• An introduction to the MIP-20 specification and its role in developer tooling, node operations, and ecosystem standards for Mumbai's developer community.
• Workshops on building decentralized applications with modern Ethereum stacks, account abstraction (ERC-4337), and zero-knowledge toolkits.
• Hackathon readiness briefings, offering advice on forming teams, identifying bounties, and preparing for ETHIndia and Devcon hackathons.
• Q&A with experienced hackathon winners and local community mentors, followed by high-chai refreshments and networking.

## Who should attend

The meetup is tailored for software engineers, blockchain developers, university students, and hackathon participants looking to level up their technical skills before Devcon 8 begins.

## Venue and schedule

The meetup takes place in Mumbai on Friday, October 30, running from 15:00 to 18:00 IST (09:30-12:30 UTC).

## Registration and admission

Registration is completely free and requires approval on Luma. Laptops are encouraged for developers wishing to participate in interactive code walkthroughs.`,
  },
  {
    slug: 'stable-payments-stablecoins-mumbai',
    description: `The Best Event (TBE) hosts Stable: Payments & Stablecoins during Devcon week in Mumbai on Wednesday, November 4, 2026, from 16:00 to 20:00 IST. The focused industry conference explores fiat-backed tokens, real-world payments, and international financial settlement.

## What to expect

The four-hour afternoon program delivers focused panel discussions and keynote presentations:
• Global stablecoin regulation, examining compliance standards, reserve audits, and licensing regimes in Asia, Europe, and the Americas.
• Merchant payment rails and point-of-sale crypto integrations, detailing fee savings and settlement finality compared to traditional card networks.
• Cross-border remittances and B2B trade settlement, highlighting emerging market adoption in Latin America, Southeast Asia, and Africa.
• Yield-bearing stablecoins, tokenized treasury bills, and real-world asset (RWA) composability within decentralized lending pools.
The panels are followed by a catered networking reception.

## Who should attend

This summit is designed for fintech executives, payments product managers, treasury officers, banking partners, stablecoin issuers, and Web3 payments infrastructure developers.

## Venue and schedule

The conference is hosted at a premier business venue in Mumbai on November 4, running from 16:00 to 20:00 IST.

## Registration and admission

Registration is free of charge and subject to host approval. Early application is recommended as seating is limited. Approved attendees receive the venue location and full speaker roster upon confirmation.`,
  },
  {
    slug: 'defilunch',
    description: `DeFi Founders Club hosts the DeFi Lunch at Devcon in Mumbai on Wednesday, November 4, 2026, from 12:30 to 14:30 IST. The curated midday dining experience brings together protocol creators and liquidity providers during Devcon week.

## What to expect

The lunch provides an informal roundtable setting where founders exchange real-world notes on protocol engineering, tokenomics, and risk management. Key discussion topics include:
• Navigating liquidity bootstrapping and fee-tier optimization in decentralized exchanges.
• Oracles, liquidations, and stress-testing lending protocols against market volatility.
• Real-World Asset (RWA) onboarding and structured credit on Ethereum Layer 2 networks.
• Institutional governance frameworks and decentralized risk-sharing mechanisms.
Attendees enjoy a multi-course lunch with fine cuisine in an exclusive dining room.

## Who should attend

Attendance is reserved for active DeFi founders, protocol architects, automated market maker leads, and quantitative liquidity providers building on EVM-compatible chains.

## Venue and schedule

The lunch takes place at a premier restaurant in the Bandra Kurla Complex (BKC), Mumbai, just minutes from the main Devcon venue, on Wednesday, November 4, from 12:30 to 14:30 IST.

## Registration and admission

Tickets are free and strictly approval-based with a hard cap on table size. Confirmation is required for entry; venue coordinates will be sent directly to approved participants.`,
  },
  {
    slug: 'harkirat',
    description: `Superteam India and educator Harkirat Singh host the Indie Builders Dinner in Mumbai on Saturday, October 31, 2026, from 19:00 to 21:00 IST. The dinner brings together independent software developers and technical entrepreneurs building on Solana.

## What to expect

The dinner format is candid and conversational, with no pitch decks, sponsor speeches, or staged panels. Attendees share war stories from the trenches of shipping production applications:
• Finding early product distribution and acquiring the first 1,000 active onchain users.
• Solo and small-team development workflows using Anchor, TypeScript, and modern Solana RPC infrastructure.
• Balancing open-source public goods with sustainable revenue models and grant funding.
• Practical architecture lessons from high-throughput token launches and mobile dApp development.
The conversation takes place over a generous dinner spread with drinks and desserts.

## Who should attend

The gathering is specifically curated for indie hackers, solo software engineers, technical co-founders, and active Superteam India contributors building decentralized applications on Solana.

## Venue and schedule

The dinner takes place at a private dining venue in Mumbai on Saturday evening, October 31, running from 19:00 to 21:00 IST (13:30-15:30 UTC).

## Registration and admission

Registration is free and subject to manual host review to preserve an intimate peer dynamic. Approved participants receive confirmation and full venue address via email.`,
  },
  {
    slug: 'near-builders-cafe-2',
    description: `The NEAR Foundation community hosts NEAR Builder's Cafe #2 in Mumbai on Monday, November 2, 2026, from 15:00 to 18:00 IST. The technical salon combines specialty coffee with architectural explorations of Chain Abstraction and decentralized AI.

## What to expect

The afternoon program is structured around interactive workshops and reading circles:
• Deep dive into Chain Abstraction: examining account aggregation, cross-chain signatures, and seamless multi-chain user experiences powered by NEAR.
• User-owned AI: exploring decentralized compute, verifiable model inference, and onchain agentic workflows.
• Code walkthroughs of multichain smart contracts and fast finality bridges.
• Hands-on mentoring with core protocol contributors and grant evaluators over artisanal espresso and treats.

## Who should attend

The session is designed for full-stack developers, smart contract engineers, AI researchers, and product architects interested in building cross-chain applications without bridging friction.

## Venue and schedule

The meetup takes place at a specialty cafe in Bandra, Mumbai, on Monday, November 2, from 15:00 to 18:00 IST.

## Registration and admission

Attendance is free with limited cafe capacity. Approval is required on Luma; guests are advised to bring a laptop to participate in code demonstrations.`,
  },
  {
    slug: 'run-and-rave',
    description: `Orviq Labs presents Run & Rave in Mumbai on Sunday, November 1, 2026, from 06:00 to 08:00 IST. The morning wellness activation blends distance running, electronic music, and community networking ahead of India Blockchain Week and Devcon 8.

## What to expect

Run & Rave kickstarts the week with a sunrise run through the coastal streets of Bandra. A mobile DJ rig guides the group with upbeat house beats, creating an energetic and uplifting rhythm. The route is paved and scenic, offering views of the Arabian Sea. Following the run, participants gather for freshly brewed artisanal coffee, electrolyte drinks, healthy breakfast bites, and relaxed networking with founders, builders, and creators.

## Who should attend

All runners, joggers, and walkers of any pace are welcome, from seasoned marathoners to casual morning runners. It is perfect for crypto founders, developers, and creators who want to prioritize health and movement before a hectic week of conferences.

## Venue and schedule

The run starts and finishes in Bandra, Mumbai, on Sunday, November 1, beginning at 06:00 IST and concluding by 08:00 IST.

## Registration and admission

Registration is free via Luma. Running shoes and comfortable sports clothing are required. Hydration points are stationed along the route, with baggage storage available at the start point.`,
  },
  {
    slug: 'off-chain-padel-mumbai',
    description: `Orviq hosts Off-Chain Padel in Mumbai on Monday, November 2, 2026, from 07:00 to 09:30 IST. The morning sports meetup offers a fun, high-energy environment for the Web3 community to connect on the padel courts.

## What to expect

The session features casual tournament play and social doubles matches across professional padel courts:
• Professional coaching tips and rules breakdown for newcomers to the sport.
• Rotating doubles brackets so attendees can play with and meet multiple industry peers.
• Refreshment bar with fresh juices, fruit platters, and coffee served throughout the morning.
• Post-match cool-down and open networking with Web3 operators and venture partners.

## Who should attend

The event is open to crypto founders, investors, developers, and Web3 enthusiasts of all athletic abilities. No prior padel experience is necessary.

## Venue and schedule

The meetup takes place at a premium indoor/outdoor sports facility in Bandra, Mumbai, on Monday, November 2, from 07:00 to 09:30 IST.

## Registration and admission

Participation is free of charge with all rackets and balls supplied by the host. Due to court space constraints, registration is strictly approval-based. Approved attendees will receive the venue address and arrival guidelines.`,
  },
  {
    slug: 'armada',
    description: `Armada Alliance presents Armada: Privacy in Practice in Mumbai on Tuesday, November 3, 2026, from 18:30 to 21:30 IST during Devcon week. The evening brings together cryptographers, protocol engineers, and privacy advocates for focused discussions on real-world cryptographic privacy.

## What to expect

The event cuts through theoretical speculation to address the engineering realities of deployed privacy networks:
• Zero-knowledge execution environments and private state transition systems.
• Anonymity sets, shielded pools, and user-friendly proof-generation benchmarks on mobile devices.
• Encrypted mempools and privacy primitives that neutralize front-running and MEV exploitation.
• Regulatory frameworks, verifiable auditing, and cryptographic compliance proofs.
Presentations are followed by open discussion over drinks, food, and networking.

## Who should attend

This gathering is tailored for zero-knowledge researchers, smart contract security auditors, protocol engineers, and Web3 developers committed to practical user privacy.

## Venue and schedule

The gathering takes place at a private venue in the Bandra / BKC area of Mumbai on Tuesday, November 3, running from 18:30 to 21:30 IST.

## Registration and admission

Attendance is free with registration approval required on Luma. Seating is kept limited to maintain an authentic salon atmosphere. Venue details are sent directly to approved participants.`,
  },
  {
    slug: 'coffeex',
    description: `The Devcon Coffee Exchange brings global coffee lovers together in Mumbai on Thursday, November 5, 2026, from 14:00 to 16:30 IST during Devcon week. The cultural gathering celebrates coffee origin, roasting, and manual brewing techniques alongside open-source software discussions.

## What to expect

Attendees bring bags of whole-bean coffee from their home countries, local roasteries, or regions:
• Manual pour-over stations equipped with V60, AeroPress, and espresso gear.
• Blind cupping and tasting sessions comparing beans from Ethiopia, Colombia, Kenya, and Indian estates in Chikmagalur and Coorg.
• Storytelling on coffee cultivation, processing methods, and local cafe culture around the world.
• Relaxed, unhurried conversations with fellow developers in a quiet, aromatic environment.

## Who should attend

The exchange is open to any Web3 developer, researcher, or attendee who appreciates specialty coffee and wants to share a favorite bag of beans with international peers.

## Venue and schedule

The meetup takes place at a designated cafe venue in Mumbai on Thursday, November 5, from 14:00 to 16:30 IST.

## Registration and admission

Registration is free. Attendees are warmly encouraged (though not strictly required) to bring 100g-250g of roasted coffee beans from their home city or favorite roaster to share with the group.`,
  },
  {
    slug: 'ethwali',
    description: `Secret Society presents ETHwali, a special community celebration in Mumbai on Sunday, November 8, 2026, from 18:00 to 23:30 IST. The event unites the international Ethereum community to celebrate the Hindu festival of lights, Diwali, in authentic Indian style.

## What to expect

ETHwali transforms the venue into a vibrant festival of lights, honoring culture, friendship, and collective success:
• Traditional Diwali lighting with earthen lamps (diyas), rangoli floor art, and festive floral decor.
• Authentic Indian festive cuisine, including regional street food stations, savory delicacies, and celebratory sweets (mithai).
• Live cultural music, acoustic sets, and upbeat DJ performances.
• Heartfelt community toasts reflecting on milestones achieved across Devcon and India Blockchain Week.

## Who should attend

The celebration warmly welcomes local and international Ethereum developers, researchers, founders, community managers, and their partners looking to experience traditional Indian festive culture and close out Devcon week together.

## Venue and schedule

The celebration takes place at a festive rooftop and banquet venue in Mumbai on Sunday evening, November 8, from 18:00 to 23:30 IST. Traditional Indian attire or smart-casual wear is celebrated.

## Registration and admission

Tickets are free via Luma and subject to venue capacity limits. Registration is free and requires host approval. Guests receive the full venue coordinates and dress code details upon confirmation.`,
  },
  {
    slug: 'sovrency-c8-launch',
    description: `CrossBar hosts the official product launch of the Sovrency C8 hardware wallet at the Sofitel Mumbai BKC on Wednesday, November 4, 2026, from 19:30 to 20:30 IST. The presentation introduces breakthrough hardware multi-party computation (MPC) security for institutional and retail digital assets.

## What to expect

The one-hour launch presentation covers:
• Keynote unveiling of the Sovrency C8 device architecture, featuring physical isolation and open-silicon verification.
• Live technical demonstrations of distributed MPC key-share generation, multi-device threshold signing, and attack resistance.
• Developer SDK walkthroughs showing how Web3 wallets and custody platforms can embed Sovrency hardware modules.
• Interactive hands-on showcase where attendees can test device navigation and sign test transactions.
The product reveal concludes with a cocktail reception and Q&A with CrossBar's hardware and cryptography engineering teams.

## Who should attend

The event is aimed at institutional digital asset custodians, cryptocurrency exchange security officers, fintech founders, hardware wallet developers, and security researchers.

## Venue and schedule

The launch takes place in the Grand Ballroom of the Sofitel Mumbai BKC, C-57, G Block, Bandra Kurla Complex, Mumbai, on November 4 from 19:30 to 20:30 IST.

## Registration and admission

Attendance is free with registration approval required. Verified industry participants and accredited press receive guaranteed admission and gift bags.`,
  },
  {
    slug: 'catalyst-founder-residency',
    description: `Web3 Events hosts Catalyst: Founder Residency during Devcon week in Mumbai, running from Tuesday, November 3, through Saturday, November 7, 2026. The residency provides a curated co-living and collaborative headquarters for active crypto startup founders.

## What to expect

Catalyst creates an intensive, high-support environment where founders can work, sleep, and connect throughout Devcon week:
• Dedicated high-speed fiber internet work desks, private phone booths, and meeting rooms for investor calls.
• Daily peer masterminds and founder circles addressing hiring, token design, and growth challenges.
• Private office hours with visiting venture capitalists, angel investors, and experienced operators.
• Daily catered breakfast, coffee, late-night brain food, and quiet workspaces away from the noisy conference floors.

## Who should attend

The residency is strictly reserved for founders, CEOs, and technical co-founders of venture-backed or bootstrapped Web3 startups building core protocol infrastructure or breakthrough consumer applications.

## Venue and schedule

The residency operates 24 hours a day from November 3 through November 7 at a private hospitality facility in Mumbai located near major conference transit lines.

## Registration and admission

Applications are evaluated based on project traction, team background, and stage of development. Approved founders receive check-in credentials, residency passes, and room details.`,
  },
  {
    slug: 'opendoors',
    description: `The ETHIndia Institutional Community hosts the Institutional Open Doors Mixer in Mumbai on Wednesday, November 4, 2026, from 21:00 to 23:30 IST. Following a private closed-door institutional dinner, the doors open to connect traditional finance and crypto-native leaders.

## What to expect

The mixer bridges traditional capital markets and decentralized infrastructure:
• Open-format networking between tier-1 banks, asset managers, hedge funds, and DeFi protocol teams.
• Discussions on real-world asset (RWA) tokenization, regulated onchain cash management, and institutional stablecoin rails.
• Exploration of Ethereum as credibly neutral financial infrastructure for global securities settlement.
• Premium open bar and passed hors d'oeuvres in an upscale setting designed for high-level relationship building.

## Who should attend

This gathering is curated for institutional investors, family office directors, asset managers, fintech executives, crypto custody specialists, and DeFi protocol founders.

## Venue and schedule

The mixer is hosted in the Bandra Kurla Complex (BKC), Mumbai, on Wednesday night, November 4, from 21:00 to 23:30 IST.

## Registration and admission

Registration is free of charge and requires approval. Professional credentials or fund affiliations must be provided during RSVP to ensure a curated guest list.`,
  },
  {
    slug: 'crossbar-iris-demo-devcon8',
    description: `CrossBar presents Open Silicon: IRIS Demo and Dabao Board Pickup at Devcon 8 in Mumbai on Thursday, November 5, 2026, from 11:00 to 16:00 IST. The open hardware clinic demonstrates non-destructive silicon inspection and open-source chip architectures.

## What to expect

The five-hour interactive clinic provides a hands-on look at open-source silicon manufacturing and validation:
• Live demonstrations of Infra-Red In-Situ (IRIS) inspection of the Daric silicon chip, verifying internal chip layout and proving the absence of hardware trojans.
• Hardware distribution desk where pre-registered developers pick up their Dabao RISC-V open evaluation boards.
• Technical teardowns explaining how physical unclonable functions (PUFs) and secure enclaves are manufactured on open-source instruction sets.
• Direct Q&A with chip design engineers and hardware security auditors on creating trustless cryptographic silicon.

## Who should attend

The session is open to hardware security engineers, embedded systems programmers, cryptographers, firmware developers, and anyone curious about open-source chip architectures.

## Venue and schedule

The clinic takes place inside the Jio World Convention Centre, Impact Space, Bandra Kurla Complex (BKC), Mumbai, on Thursday, November 5, running continuously from 11:00 to 16:00 IST.

## Registration and admission

Attendance is free for Devcon 8 badge holders. Registration on Luma guarantees priority access to hardware demo stations and confirms board reservation slots.`,
  },
  {
    slug: 'near-quantus-happy-hour',
    description: `The NEAR Foundation and Quantus host a networking Happy Hour during Devcon week in Mumbai on Thursday, November 5, 2026, from 18:00 to 21:00 IST. The gathering brings together developers, quantitative researchers, and venture partners.

## What to expect

The three-hour happy hour offers a relaxed, social atmosphere with complimentary drinks, craft cocktails, and passed appetizers:
• Conversations on Chain Abstraction, cross-chain messaging, and unified liquidity infrastructure on NEAR.
• Insights from Quantus on quantitative crypto research, algorithmic market making, and automated execution strategies.
• Discussions on developer ecosystem grants, accelerator tracks, and venture funding for multi-chain projects.
• Unfiltered networking with founders, researchers, and ecosystem leaders visiting Mumbai.

## Who should attend

The event welcomes software engineers, DeFi developers, quantitative traders, venture investors, and Web3 ecosystem contributors participating in Devcon 8 and India Blockchain Week.

## Venue and schedule

The happy hour takes place at an upscale lounge in Mumbai on Thursday, November 5, from 18:00 to 21:00 IST.

## Registration and admission

Admission is free and approval-based on Luma. Space is limited to venue capacity, so attendees are encouraged to apply early and arrive promptly at 18:00 IST.`,
  },
  {
    slug: 'frontiertraders',
    description: `Frontier Traders and the Solana ecosystem present the Frontier Traders Mixer: India on Sunday, November 1, 2026, from 16:30 to 20:30 IST in Mumbai. The session unites algorithmic traders, quantitative analysts, and onchain market makers during Solana Summit India.

## What to expect

The mixer brings traditional quantitative finance expertise together with high-speed decentralized trading infrastructure:
• Architectural deep dives into Solana's high-throughput order book DEXs, low-latency RPC gateways, and priority fee dynamics.
• Quantitative discussions on algorithmic risk management, statistical market making, and cross-venue latency arbitrage.
• Exploration of Indian and international capital market trends, structured derivatives, and onchain credit lines.
• Open networking over drinks, appetizers, and music with leading quantitative trading desks and developers.

## Who should attend

This gathering is tailored for quantitative traders, high-frequency algorithms engineers, market making desk operators, DeFi risk architects, and capital market specialists.

## Venue and schedule

The mixer is hosted at a premier lounge in G Block, Bandra Kurla Complex (BKC), Mumbai, on Sunday, November 1, running from 16:30 to 20:30 IST.

## Registration and admission

Registration is free and subject to host approval. Please indicate your trading desk or engineering affiliation when registering. Venue coordinates are sent directly to approved participants.`,
  },
  {
    slug: 'clickoptions-nextwave-trading',
    description: `NextWave Network and ClickOptions host a platform introduction and live crypto trading competition in Mumbai on Tuesday, November 3, 2026, from 16:00 to 19:00 IST. The session introduces onchain options trading with real-time competition mechanics.

## What to expect

The three-hour event combines technical education with interactive trading:
• An introduction to the ClickOptions platform architecture, detailing defined-risk options structures, automated settlement, and decentralized collateral management.
• A two-hour live simulated options trading competition using risk-free testnet accounts.
• Real-time leaderboard tracking top-performing portfolios based on risk-adjusted returns.
• Award ceremony distributing up to $200 in prize rewards to top-performing traders, followed by food, drinks, and networking with options market makers.

## Who should attend

The competition is ideal for crypto derivatives traders, options enthusiasts, quantitative analysts, and financial engineers looking to test systematic trading strategies.

## Venue and schedule

The competition takes place at a tech event space in Mumbai on Tuesday, November 3, running from 16:00 to 19:00 IST (10:30-13:30 UTC).

## Registration and admission

Registration is free and subject to approval. Participants are required to bring a laptop to connect to the trading competition platform. WiFi and power outlets are provided.`,
  },
  {
    slug: 'notneils-stealth-founder-dinner',
    description: `notneils hosts a private, confidential founder dinner during Devcon week in Mumbai on Thursday, November 5, 2026, from 19:00 to 22:00 IST. The gathering brings together founders building unannounced projects in stealth mode.

## What to expect

The dinner is strictly off-the-record and held under Chatham House Rule:
• Open discussion on technical architectures, protocol design trade-offs, and competitive dynamics away from public social media.
• Honest peer conversations on early-stage fundraising, investor term sheets, and token warrant structuring in today's market.
• Sharing proven strategies for developer hiring, product security, and launching private alpha programs.
• A multi-course dinner with fine dining and drinks in a quiet, private room.

## Who should attend

Attendance is exclusively limited to active founders and technical co-founders currently building stealth Web3 startups or pre-launch protocols.

## Venue and schedule

The dinner takes place at a private dining room in central Mumbai on Thursday evening, November 5, running from 19:00 to 22:00 IST.

## Registration and admission

Registration is strictly approval-based with a hard ceiling on attendance. Inquiries and RSVPs are verified privately to maintain confidentiality. Approved guests receive private venue details.`,
  },
  {
    slug: 'assassin',
    description: `Devcon Assassin: Mumbai Edition is a week-long social deduction and strategy game taking place across Devcon 8 and India Blockchain Week from Tuesday, November 3, through Saturday, November 7, 2026. The real-world stealth game turns conference networking into an interactive adventure.

## What to expect

Players register on the live game app and receive secret assignments:
• Each participant is assigned a secret target among registered players attending the conference.
• Players must track down their target in conference halls, side events, or networking mixers and tag them discreetly using non-contact game mechanics or clothesline pegs.
• When a target is eliminated, their assignment transfers to the assassin.
• A live digital leaderboard tracks top eliminations, bounties, and survival rankings throughout the week.
• The game culminates in an awards ceremony with hardware wallets, ecosystem bounties, and bragging rights.

## Who should attend

The game is open to all registered Devcon 8 and side-event attendees who want to break the ice, meet new developers from around the world, and add fun strategy to conference week.

## Venue and schedule

The game operates across the Jio World Centre and official Devcon side event venues in Mumbai from November 3 through November 7, 2026.

## Registration and admission

Participation is free. Players must register on Luma to receive their digital game ID, rules briefing, and initial target assignment before kickoff.`,
  },
  {
    slug: 'undisclosed',
    description: `The Midnight community presents UNDISCLOSED: MUMBAI on Wednesday, November 4, 2026, from 18:30 to 21:30 IST. The evening meetup explores zero-knowledge smart contracts, regulatory-compliant privacy, and programmable data protection.

## What to expect

The program delivers interactive presentations and architectural case studies:
• Overview of the Midnight privacy blockchain architecture and its dual-token model.
• Building zero-knowledge smart contracts using TypeScript-friendly developer tools and Compact smart contract language.
• Selective disclosure mechanisms allowing enterprises and users to prove compliance with KYC/AML laws without revealing underlying transaction metadata.
• Developer Q&A, live code demos, and networking over dinner and drinks with Midnight core contributors.

## Who should attend

The event is designed for software developers, cryptography researchers, enterprise solution architects, fintech builders, and blockchain students interested in next-generation privacy networks.

## Venue and schedule

The gathering takes place at a technology venue in Mumbai on Wednesday, November 4, from 18:30 to 21:30 IST.

## Registration and admission

Admission is free of charge via Luma. RSVP approval is required to confirm attendance. Venue directions and access credentials will be provided upon confirmation.`,
  },
  {
    slug: 'allowlist',
    description: `The Allowlist is a curated creative and digital culture networking event hosted in Mumbai on Wednesday, November 4, 2026, from 20:00 to 23:30 IST during Devcon week. The evening brings together artists, creative technologists, and consumer crypto founders.

## What to expect

The event showcases the intersection of onchain culture, digital art, and consumer applications:
• Interactive digital art displays featuring generative code, 3D animation, and onchain music projects.
• Informal fireside conversations on building sustainable creator economies and decentralized media platforms.
• Showcase of consumer crypto products, social apps, and web3 entertainment experiments.
• DJ sets, craft cocktails, mocktails, and vibrant networking with digital creators from India and around the globe.

## Who should attend

The gathering welcomes digital artists, onchain creators, UI/UX designers, consumer crypto founders, community managers, and cultural curators attending Devcon and India Blockchain Week.

## Venue and schedule

The party takes place at a creative gallery and lounge venue in Mumbai on Wednesday, November 4, running from 20:00 to 23:30 IST.

## Registration and admission

Admission is free and approval-based. Guests are encouraged to register early on Luma to secure a spot on the guest list. Approved attendees will receive venue directions.`,
  },
  {
    slug: 'deepflow',
    description: `Deepflow and Eureka Labs host the Onchain Execution Dinner in Mumbai on Thursday, November 5, 2026, from 19:00 to 22:00 IST during Devcon week. The technical dinner convenes virtual machine architects, compiler engineers, and core protocol researchers.

## What to expect

The dinner is structured around technical whiteboard discussions and peer presentations:
• Parallel execution architectures, multi-threaded virtual machines, and optimistic concurrency control in high-throughput rollups.
• State access optimization, flat databases, and memory-mapped state storage for sub-second block times.
• JIT compilation, eBPF runtimes, and bytecode verification improvements for next-generation EVM and SVM environments.
• Multi-course dining with wine and beer, providing ample time for technical debates and collaboration.

## Who should attend

The dinner is curated for systems programmers, compiler engineers, virtual machine researchers, Layer 1/Layer 2 core developers, and performance optimization specialists.

## Venue and schedule

The dinner takes place at an upscale private dining venue in the Bandra Kurla Complex (BKC), Mumbai, on Thursday, November 5, from 19:00 to 22:00 IST.

## Registration and admission

Registration is strictly approval-based with limited seating. Applications are reviewed based on engineering background and contributions to execution layer research. Approved guests receive confirmation and venue details.`,
  },
  {
    slug: 'dabao-open-hardware-hackathon',
    description: `CrossBar hosts the Dabao Open Hardware Hackathon in Mumbai on Thursday and Friday, November 5-6, 2026. The 24-hour hardware and firmware sprint challenges engineers to build cryptographic security applications on open-source silicon.

## What to expect

Participants receive hardware kits featuring the Dabao RISC-V open evaluation board and Daric security chip:
• 24 hours of collaborative prototyping, firmware programming, and hardware integration.
• Mentorship from CrossBar's silicon architects, cryptographic engineers, and embedded systems veterans.
• Hackathon tracks covering hardware authenticator keys, physical unclonable function (PUF) biometric sensors, offline multi-party computation signers, and supply-chain verification tooling.
• Final live demonstrations before a judging panel, with cash prizes and grant opportunities for winning projects.
• Fully catered meals, energy drinks, and hardware debugging stations with logic analyzers and oscilloscopes.

## Who should attend

The hackathon is ideal for embedded systems programmers, C/Rust firmware developers, hardware engineers, electrical engineering students, and cybersecurity researchers.

## Venue and schedule

The hackathon takes place at a dedicated maker space in Mumbai, starting at 10:00 IST on Thursday, November 5, and concluding with presentations at 14:00 IST on Friday, November 6.

## Registration and admission

Participation is free with hardware kits provided for all accepted teams. Space is limited to 40 hackers. Apply with your GitHub profile or hardware portfolio to secure a team spot.`,
  },
  {
    slug: 'born-up-devcon-mumbai',
    description: `The BORN UP community hosts the Devcon Mumbai Community Networking Meetup on Wednesday, November 4, 2026, from 17:00 to 20:00 IST. The meetup empowers grass-roots builders, student developers, and emerging Web3 talent visiting Devcon 8.

## What to expect

The three-hour program is designed to foster community growth and collaboration:
• Lightning talks highlighting grass-roots Web3 projects, open-source developer tooling, and community initiatives in India.
• Mentorship speed-dating connecting experienced blockchain founders with early-stage developers and student hackathon teams.
• Portfolio reviews, smart contract security tips, and career advice for engineers transitioning into decentralized technology.
• Open networking with snacks, tea, and refreshments in an inclusive, welcoming setting.

## Who should attend

The meetup is tailored for early-career developers, university blockchain club members, hackathon participants, open-source contributors, and community leaders.

## Venue and schedule

The event takes place at a community coworking hub in Mumbai on Wednesday, November 4, running from 17:00 to 20:00 IST.

## Registration and admission

Admission is free of charge via Luma. RSVP approval is required to manage venue capacity. Approved guests receive the full address and transit directions.`,
  },
  {
    slug: 'l2beat',
    description: `The L2BEAT research team hosts L2BEAT: The Next Chapter in Mumbai on Thursday, November 5, 2026, from 14:00 to 17:00 IST during Devcon week. The community research session explores Layer 2 risk assessments, rollup decentralization milestones, and transparency tooling.

## What to expect

The session features in-depth presentations by L2BEAT analysts and guest rollup researchers:
• A detailed breakdown of Stage 2 rollup requirements, evaluating fault proofs, multi-prover frameworks, and security council escape hatches.
• Shared sequencing architectures, based rollups, and inter-L2 atomic execution models.
• Governance risk evaluations and upgrade timelock analysis for major Layer 2 networks.
• Community feedback session reviewing proposed updates to the L2BEAT risk matrix and public dashboards.
• Open Q&A followed by networking over coffee, tea, and light refreshments.

## Who should attend

This event is essential for Layer 2 protocol researchers, smart contract engineers, rollup governance delegates, decentralized infrastructure builders, and ecosystem analysts.

## Venue and schedule

The session takes place at a conference venue in Mumbai on Thursday, November 5, running from 14:00 to 17:00 IST.

## Registration and admission

Registration is free and subject to approval on Luma. Seating is assigned on a first-come, first-served basis for approved attendees.`,
  },
  {
    slug: 'sidequest-happy-hour',
    description: `Sidequest hosts an evening Happy Hour in Mumbai on Wednesday, November 4, 2026, from 19:30 to 23:30 IST during Devcon week. The gathering brings together Web3 community managers, growth leads, ecosystem operators, and developer advocates for a fun, relaxed evening.

## What to expect

Sidequest Happy Hour is designed as an antidote to dense technical sessions:
• Engaging icebreaker games, trivia challenges, and casual Web3 pop quizzes with prizes.
• Open discussion lounges exploring community building, hackathon organizing, and developer marketing tactics in emerging markets.
• Curated cocktail menu, mocktails, and local Mumbai street food specialties served hot.
• Upbeat playlist and casual atmosphere for building long-term friendships across ecosystems.

## Who should attend

The mixer welcomes ecosystem community leads, developer relations advocates, marketing directors, hackathon organizers, and Web3 event producers from all protocols.

## Venue and schedule

The meetup takes place at a vibrant rooftop venue in Mumbai on Wednesday, November 4, from 19:30 to 23:30 IST (14:00-18:00 UTC).

## Registration and admission

Admission is free of charge via Luma. Registration approval is required to confirm attendance. Approved guests receive the venue coordinates prior to the evening.`,
  },
  {
    slug: 'afterhours-mixer-mumbai',
    description: `Web3 Events presents the Afterhours Mixer: Mumbai on Tuesday, November 3, 2026, from 22:00 IST until 02:00 on Wednesday, November 4. The late-night lounge gathering provides a relaxed environment for international delegates arriving in Mumbai for Devcon 8.

## What to expect

The mixer offers a welcoming landing pad for the global crypto community:
• Deep-house and downtempo DJ sets creating a sophisticated, conversation-friendly soundscape.
• Open bar serving craft cocktails, fine wines, and non-alcoholic beverages alongside late-night finger foods.
• Dedicated lounge seating clusters for private conversations and deal-making.
• A chance to reconnect with global peers and meet local Indian founders before the main conference days commence.

## Who should attend

The mixer is open to international conference delegates, founders, venture capitalists, protocol engineers, and Web3 executives seeking a sophisticated late-night networking space in Mumbai.

## Venue and schedule

The mixer is hosted at a premier lounge in central Mumbai on Tuesday night, November 3, running from 22:00 IST through 02:00 IST on November 4.

## Registration and admission

Tickets are free via Luma and subject to host approval. Capacity is strictly monitored to prevent overcrowding. Arrive with your confirmation QR code and government ID.`,
  },
  {
    slug: 'perps-and-chai-hyprearn-mumbai',
    description: `HyprEarn hosts Perps & Chai with HyprEarn @Devcon 8 in Mumbai on Wednesday, November 4, 2026, from 15:00 to 18:00 IST. The afternoon meetup combines traditional Mumbai chai culture with cutting-edge discussions on decentralized perpetual contracts and yield generation.

## What to expect

The session brings together derivatives traders and DeFi developers over traditional afternoon tea:
• Live demonstration of HyprEarn's perpetual yield strategies, automated vault rebalancing, and delta-neutral earning vaults.
• Discussions on perpetual DEX liquidity fragmentation, funding rate arbitrage, and oracle latency mitigation.
• Freshly brewed authentic Mumbai cutting chai, masala chai, herbal infusions, and traditional savory snacks like samosas and kachoris.
• Casual whiteboard sessions and networking with quantitative developers and risk managers.

## Who should attend

The meetup is tailored for perpetual DEX traders, DeFi yield farmers, smart contract engineers, liquidity providers, and quantitative finance enthusiasts.

## Venue and schedule

The event takes place at a private hospitality lounge in the Bandra Kurla Complex (BKC), Mumbai, on Wednesday, November 4, from 15:00 to 18:00 IST.

## Registration and admission

Admission is free and approval-based on Luma. Space is limited to ensure a comfortable cafe setting. Approved attendees will receive the venue address upon confirmation.`,
  },
  {
    slug: 'born-up-ibw-mumbai',
    description: `The BORN UP community hosts the India Blockchain Week Mumbai Community Networking Meetup on Sunday, November 1, 2026, from 17:00 to 20:00 IST. The gathering serves as an energetic community kickoff welcoming domestic and international builders to India Blockchain Week.

## What to expect

The meetup highlights the momentum of India's developer ecosystem:
• Keynote panel featuring Indian Web3 founders sharing lessons on building global products from India.
• Showcase of community hackathon winners and rising student builders.
• Open mic and networking sessions connecting local software engineers with international protocol teams hiring in India.
• Traditional Mumbai tea, coffee, and refreshments with casual community networking.

## Who should attend

The gathering is open to Indian blockchain developers, student builders, startup founders, global protocol teams looking to hire in India, and international delegates arriving for India Blockchain Week.

## Venue and schedule

The event takes place at a centrally located tech community space in Mumbai on Sunday, November 1, running from 17:00 to 20:00 IST.

## Registration and admission

Registration is free via Luma and requires approval to manage room capacity. Laptops are welcome for developers wishing to demo their projects.`,
  },
  {
    slug: 'eva-symposium-iii',
    description: `EVA Research hosts the EVA Symposium III in Mumbai on Monday, November 2, 2026, from 10:00 to 16:00 IST during Devcon week. The formal academic and research symposium gathers leading cryptographers, computer scientists, and zero-knowledge researchers.

## What to expect

The full-day symposium features peer-reviewed paper presentations, invited keynotes, and technical whiteboard panels:
• Formal verification of smart contracts and consensus state transition systems.
• Zero-Knowledge Virtual Machines (zkVMs): comparing proof recursion, lookup arguments, and constraint system efficiency.
• Cryptographic primitives for verifiable computation, polynomial commitments, and folding schemes.
• Open whiteboard workshops where researchers collaborate on unsolved problems in protocol security.
A catered luncheon and coffee breaks provide ample networking time between sessions.

## Who should attend

The symposium is aimed at cryptography researchers, computer science faculty and graduate students, formal verification engineers, and zero-knowledge protocol architects.

## Venue and schedule

The symposium takes place at a conference auditorium in Mumbai on Monday, November 2, from 10:00 to 16:00 IST.

## Registration and admission

Attendance is free with registration approval required. Applicants are asked to share their academic affiliation, research papers, or GitHub profiles when requesting admission.`,
  },
  {
    slug: 'shaktipith-women-residency',
    description: `Shaktipith Network presents the Shaktipith Women Only Residency in Mumbai, running throughout Devcon and India Blockchain Week from Monday, November 2, through Sunday, November 8, 2026. The residency provides a secure, empowering co-living and collaborative space exclusively for women building in Web3.

## What to expect

The week-long residency is designed to accelerate women founders and technical leaders in decentralized technology:
• Safe, private co-living accommodations with high-speed internet, dedicated work desks, and quiet call areas.
• Daily peer-led skill shares covering smart contract engineering, tokenomics, technical writing, and venture fundraising.
• Private office hours with prominent women venture capitalists, startup executives, and protocol founders.
• Wellness and mindfulness mornings featuring yoga, meditation, and healthy communal meals prepared by personal chefs.
• Closed-door demo circles where residents pitch and receive constructive feedback on their projects.

## Who should attend

The residency is reserved for women founders, software engineers, smart contract developers, researchers, and community leaders actively building decentralized technologies.

## Venue and schedule

The residency operates 24/7 from November 2 to November 8 at a private luxury villa and hospitality property in Mumbai with full security and private amenities.

## Registration and admission

Applications are reviewed through an application form. Accepted residents receive full check-in information, schedule details, and residency guidelines.`,
  },
  {
    slug: 'fluid-mumbai-smart-liquidity',
    description: `Instadapp and the Fluid team present Fluid at Mumbai: Smart Liquidity on Tuesday, November 3, 2026, from 17:00 to 21:00 IST during Devcon week. The evening features technical presentations, live protocol demos, and a networking dinner showcasing the future of modular decentralized liquidity.

## What to expect

The session explores architectural advancements in decentralized lending and automated liquidity management:
• Deep dive into Fluid's unified liquidity layer, demonstrating how smart collateral and smart debt architecture achieves up to 95% collateral efficiency.
• Automated debt refinancing, multi-token collateral vaults, and internal liquidation buffers that prevent cascading liquidations.
• Developer walkthrough on integrating Fluid SDKs into yield aggregators, arbitrage bots, and cross-chain money markets.
• Live technical Q&A with Instadapp founders and core engineers, followed by an upscale dinner, cocktails, and networking.

## Who should attend

The event is designed for DeFi developers, liquidity providers, yield strategists, risk analysts, and smart contract engineers building on EVM-compatible networks.

## Venue and schedule

The gathering takes place at a premier hospitality venue in Mumbai on Tuesday, November 3, running from 17:00 to 21:00 IST (11:30-15:30 UTC).

## Registration and admission

Registration is free and subject to host approval via Luma. Early RSVP is recommended as dinner capacity is limited. Approved participants receive confirmation and full venue details.`,
  },
  {
    slug: 'money-layer-devcon',
    description: `The Money Layer Consortium presents Money Layer @Devcon Week in Mumbai on Wednesday, November 4, 2026, from 14:00 to 18:00 IST. The four-hour conference explores digital cash, programmable payments, and decentralized settlement infrastructure.

## What to expect

The afternoon conference brings together leaders from monetary protocol design, banking, and crypto-native commerce:
• Keynote on the evolution of digital cash: from sovereign stablecoins to privacy-preserving ecash (Cashu, Fedimint).
• Panel on scalable payment channels: Lightning Network, state channels, and Layer 2 payment streaming protocols.
• Merchant adoption case studies: deploying point-of-sale crypto payments across retail and e-commerce platforms with zero chargeback risk.
• Regulatory frameworks for programmable payments, automated tax withholding, and programmable escrow.
The presentations conclude with an open tea and networking reception.

## Who should attend

The conference is tailored for payments product managers, fintech executives, monetary economists, stablecoin developers, and Web3 engineers building consumer checkout flows.

## Venue and schedule

The event takes place at a conference auditorium in Mumbai on Wednesday, November 4, from 14:00 to 18:00 IST.

## Registration and admission

Attendance is free with registration approval required on Luma. Registered attendees receive presentation decks and speaker summaries following the conference.`,
  },
  {
    slug: 'hacker-house-goa',
    description: `Builders and founders gather in Goa ahead of Devcon India for a multi-day residency focused on product development, smart contracts and community collaboration. The house brings together developers, designers and protocol contributors to prototype decentralized applications, conduct technical peer reviews and prepare for the upcoming Ethereum hackathons in Mumbai.

## What to expect

Participants take part in daily co-working sprints, technical workshops and evening demo circles. The program covers smart contract security, account abstraction, layer-2 infrastructure and decentralized finance integrations. Seasoned mentors provide feedback on architecture and project roadmaps. High-speed connectivity, ergonomic workstations, and communal meals are provided throughout the residency.

## Who should attend

The residency welcomes Web3 developers, Solidity engineers, UX designers and founders actively building open-source projects or preparing submissions for Devcon and India Blockchain Week hackathons.

## Venue and schedule

The hacker house runs in Goa from October 31 to November 4, 2026. The exact residential villa address is shared directly with accepted participants upon application approval.

## Registration and admission

Participation is free with application review required. Applications are evaluated based on project proposals, GitHub contributions, and community impact. Confirmed guests receive onboarding packages and arrival instructions.`,
  },
  {
    slug: 'india-blockchain-ai-tour-mumbai',
    description: `Octaloop hosts the Mumbai edition of the India Blockchain & AI Tour 2026 on Friday, October 31, from 10:00 to 17:00 IST. The day-long conference explores the intersection of decentralized technology, machine learning, and digital public infrastructure in India.

## What to expect

The summit features keynote presentations, panel sessions, and technical product showcases:
- High-level panels examining the convergence of decentralized computing, decentralized physical infrastructure (DePIN), and sovereign AI.
- Architecture sessions covering AI agent coordination on EVM chains, zero-knowledge inference, and cryptographic verification for autonomous models.
- Institutional discussions on regulatory policy, digital asset compliance, and Web3 enterprise integration in Bharat.
- Networking breaks, sponsor exhibitions, and executive roundtables connecting founders with venture capital funds.

## Who should attend

The event is designed for software engineers, blockchain architects, AI researchers, Web3 founders, enterprise technology executives, and angel investors active in the Indian tech ecosystem.

## Venue and schedule

The conference takes place at a premier hospitality auditorium in Mumbai on Friday, October 31, 2026, running from 10:00 to 17:00 IST.

## Registration and admission

Tickets and registration passes are available through the official India Blockchain Tour portal. Early registration is recommended to guarantee admission and access to conference recordings.`,
  },
  {
    slug: 'ibw-pre-conference-vip-night',
    description: `Hashed Emergent and India Blockchain Week present the IBW2026 Pre-Conference VIP Night in Mumbai on Saturday, October 31, 2026, from 19:00 to 23:00 IST. The invitation-only evening gathers global protocol leaders, institutional investors, and conference speakers ahead of the main week.

## What to expect

The evening offers a private, upscale networking environment with curated hospitality:
- Welcome addresses by Hashed Emergent partners and India Blockchain Week chairs, outlining key initiatives and ecosystem milestones for the upcoming conference.
- Informal executive discussions on cross-border venture capital allocation, protocol governance, and sovereign Web3 infrastructure.
- Premium dinner service, hand-crafted cocktails, and lounge music designed to facilitate meaningful conversations without stage interruptions.

## Who should attend

Attendance is reserved for IBW VIP Pass holders, Executive VIP ticket holders, venture fund general partners, protocol executives, and keynote speakers visiting Mumbai for India Blockchain Week.

## Venue and schedule

The VIP reception takes place at an exclusive rooftop lounge in Mumbai on Saturday, October 31, from 19:00 to 23:00 IST.

## Registration and admission

Admission requires an active IBW VIP or Executive VIP conference registration pass. Confirmed guests receive individual venue directions and door clearance instructions via email.`,
  },
  {
    slug: 'shanhaiwoo-mumbai-extension',
    description: `ShanHaiWoo hosts the Mumbai Devcon Extension from Sunday, November 1, through Friday, November 6, 2026. The week-long residency and community pop-up connects international builders, cypherpunks, and digital nomad researchers visiting India for Devcon.

## What to expect

The extension serves as an open collaboration space and cultural bridge:
- Daily co-working sprints with high-speed internet, collaborative whiteboards, and private meeting zones.
- Pop-up technical salons discussing crypto-native culture, network states, public goods funding, and open-source cryptographic libraries.
- Guided community excursions, local street food walks, and evening fireside chats exploring decentralized philosophy and decentralized physical infrastructure.

## Who should attend

The pop-up welcomes international developers, open-source researchers, crypto anthropologists, community builders, and Devcon attendees seeking community co-living and collaborative workspaces in Mumbai.

## Venue and schedule

The residency runs daily from November 1 to November 6 in Mumbai, located within convenient commuting distance of the main Devcon venue at Bandra Kurla Complex.

## Registration and admission

Registration is open via ShanHaiWoo's Global Builder Village program. Space is allocated on an application-review basis to maintain an intimate, collaborative working environment.`,
  },
  {
    slug: 'arbiverse-mumbai',
    description: `Arbitrum Foundation and Aditi Chopra host ArbiVerse Mumbai on Monday, November 2, 2026, from 10:30 to 18:30 IST. The full-day developer conference explores Layer 2 scaling, Arbitrum Orbit chains, and next-generation decentralized applications.

## What to expect

The summit program combines high-impact technical keynotes, workshops, and ecosystem announcements:
- Opening keynote by Offchain Labs CEO Steven Goldfeder on the technical roadmap for Arbitrum, priority gas auctions, and fast transaction feeds.
- In-depth workshops on building customizable Layer 3 chains using Arbitrum Orbit and Arbitrum Stylus for multi-language smart contracts in Rust and C++.
- Developer panels examining zero-knowledge integrations, DeFi liquidity strategies, and AI agent coordination on Arbitrum One.
- Catered networking lunch and evening social reception for attendees and ecosystem teams.

## Who should attend

The conference is tailored for Solidity and Rust developers, DeFi protocol engineers, infrastructure architects, and Web3 founders looking to deploy scalable applications on Arbitrum.

## Venue and schedule

The event takes place at a premium venue in Mumbai on Monday, November 2, from 10:30 to 18:30 IST. Laptops are recommended for developers participating in hands-on workshops.

## Registration and admission

Admission is free and requires registration approval via Luma. Approved attendees receive confirmed ticket passes and exact venue coordinates.`,
  },
  {
    slug: 'alchemy-devcon-meetings',
    description: `Alchemy hosts dedicated partner and developer meetings during Devcon week in Mumbai from Tuesday, November 3, through Friday, November 6, 2026. The sessions offer one-on-one technical architecture consultations with Alchemy's core engineering and product leadership.

## What to expect

These private meetings provide direct access to Alchemy specialists:
- Architecture review and node infrastructure optimization for high-throughput decentralized applications and decentralized finance protocols.
- Technical guidance on implementing Smart Account modular infrastructure, account abstraction (ERC-4337), and session keys.
- Strategic consultations regarding custom Rollup infrastructure, Subgraphs, webhooks, and developer tooling integrations.
- Direct feedback channels with Alchemy product managers to influence roadmap priorities and enterprise support tiers.

## Who should attend

Meetings are open to CTOs, engineering leads, protocol architects, and senior developers currently building or scaling Web3 projects who need tailored infrastructure advisory.

## Venue and schedule

Meetings take place across multiple hospitality suites near the Jio World Convention Centre in Bandra Kurla Complex (BKC), Mumbai, from November 3 to 6.

## Registration and admission

Builders must submit a meeting request form specifying their project details, technical stack, and specific discussion topics. Alchemy's team coordinates confirmed calendar slots and private suite access.`,
  },
  {
    slug: 'ibw-official-after-party',
    description: `Hashed Emergent and India Blockchain Week present the IBW Official After-Party in Mumbai on Monday, November 2, 2026, from 19:00 to 23:00 IST. The evening marks the official celebration concluding the core conference days of India Blockchain Week.

## What to expect

The after-party brings together conference attendees, speakers, and ecosystem partners for a vibrant evening:
- Live musical performances and DJ sets from acclaimed Indian and international electronic artists.
- Curated bar service featuring signature cocktails, craft beers, non-alcoholic beverages, and gourmet food counters.
- Relaxed lounge seating and open outdoor terrace areas for conversation, networking, and celebrating conference milestones.

## Who should attend

The party is open to India Blockchain Week delegates, hackathon participants, founders, developers, investors, and community members attending Web3 week in Mumbai.

## Venue and schedule

The celebration takes place at a premier nightlife and hospitality venue in Mumbai on Monday, November 2, running from 19:00 to 23:00 IST.

## Registration and admission

Registration is managed via the official India Blockchain Week side-event portal. Admission is subject to venue capacity limits, and guests are encouraged to arrive early with their confirmation pass.`,
  },
  {
    slug: 'sidequest-chai-at-dawn',
    description: `Interspace Studio hosts Sidequest: Chai at Dawn in Mumbai throughout Devcon week, running from Tuesday, November 3, through Friday, November 6, 2026, from 08:00 to 09:30 IST each morning.

## What to expect

The morning gathering offers a relaxed start before intense conference days:
- Fresh, piping-hot traditional cutting chai brewed with aromatic spices and ginger by local tea masters.
- Light morning snacks, including fresh bun maska, biscuits, and seasonal fruit.
- Casual, open-air conversations with early-bird developers, researchers, and Ethereum contributors arriving ahead of the morning keynote sessions.

## Who should attend

The gathering welcomes all Devcon attendees, hackathon builders, and visitors who enjoy early mornings and authentic local tea culture.

## Venue and schedule

The chai cart is stationed at a designated open-air gathering spot within walking distance of the Jio World Convention Centre in BKC, Mumbai, daily from 08:00 to 09:30 IST.

## Registration and admission

Participation is free and completely open. No conference badge, ticketing scan, or pre-approval is required. Exact daily coordinates are published on the Sidequest community channels.`,
  },
  {
    slug: 'sidequest-kulfi-ice-cream-hour',
    description: `Interspace Studio presents Sidequest: Kulfi Ice Cream Hour in Mumbai during Devcon week, running daily from Tuesday, November 3, through Friday, November 6, 2026, from 15:30 to 18:30 IST.

## What to expect

The afternoon social provides a refreshing cultural pause in the middle of busy conference afternoons:
- Complimentary authentic Indian kulfi ice cream in classic flavors such as malai, kesar pista, and mango.
- Informal street-side and plaza networking with developers, designers, and community builders taking a break from technical sessions.
- A relaxed, unstructured atmosphere encouraging spontaneous introductions, collaborative brainstorming, and community camaraderie.

## Who should attend

Open to all Devcon participants, side-event attendees, and Web3 enthusiasts looking to enjoy traditional Indian frozen desserts while connecting with peers.

## Venue and schedule

The kulfi cart is located at a prominent pedestrian spot near the Bandra Kurla Complex conference zone in Mumbai, open from 15:30 to 18:30 IST on November 3 through 6.

## Registration and admission

Attendance is free and open to everyone with no registration badge, ticket purchase, or application form required. Daily meeting points are shared on the Sidequest social channels.`,
  },
  {
    slug: 'sidequest-explore-mumbai',
    description: `Interspace Studio organizes Sidequest: Explore Mumbai from Wednesday, November 4, through Saturday, November 7, 2026. The initiative offers curated walking tours and cultural excursions across historic Mumbai neighborhoods.

## What to expect

Each excursion is guided by knowledgeable local hosts passionate about Mumbai's heritage, architecture, and cuisine:
- Guided walks through historic South Mumbai, exploring Victorian Gothic architecture, the Gateway of India, and art deco promenades along Marine Drive.
- Heritage food walks sampling iconic street food specialties, authentic Irani cafes, and coastal Maharashtrian dishes.
- Small group cohorts (10 to 15 people) designed to encourage friendly dialogue and cross-cultural friendship among global builders.

## Who should attend

The tours are designed for international developers, researchers, founders, and traveling companions visiting India for Devcon who want to experience the city's rich culture beyond conference halls.

## Venue and schedule

Tours depart daily at scheduled morning and afternoon times from designated meeting hubs across South Mumbai and Bandra. Detailed route maps and timings are provided upon sign-up.

## Registration and admission

Participation is free with voluntary community sign-ups. Capacity per walking group is capped to preserve a personal, immersive tour experience.`,
  },
  {
    slug: 'ethindia',
    description: `ETHGlobal and the Ethereum community present ETHIndia 2026 on Wednesday, November 4, 2026, at the Jio World Convention Centre in Mumbai during Devcon week. The conference highlights India's immense contributions to open-source Ethereum development and global blockchain ecosystems.

## What to expect

The event brings together leading figures from across the Indian and global Ethereum landscape:
- Keynote addresses from core Ethereum protocol researchers, client developers, and prominent Indian Web3 founders.
- Panel sessions examining local developer talent pipelines, university blockchain initiatives, and scaling decentralized infrastructure for hundreds of millions of users.
- Live project showcases and developer spotlights highlighting cutting-edge decentralized applications built by Indian developer teams.
- Extensive community networking areas, sponsor booths, and career connections for software engineers.

## Who should attend

The conference is tailored for smart contract engineers, open-source contributors, student developers, startup founders, and ecosystem investors celebrating Ethereum in India.

## Venue and schedule

The conference takes place within the main Devcon complex at Jio World Convention Centre, Bandra Kurla Complex (BKC), Mumbai, on Wednesday, November 4, 2026.

## Registration and admission

Access is integrated with Devcon 8 programming and registration passes. Attendees are encouraged to verify ticketing credentials and arrive early for keynote seating.`,
  },
  {
    slug: 'quantstamp-mumbai-lounge',
    description: `Quantstamp and Common Defense host the Mumbai Lounge on Wednesday, November 4, 2026, from 19:00 to 22:00 IST during Devcon week. The evening focuses on smart contract security, AI-assisted vulnerability detection, and protocol defense mechanisms.

## What to expect

The gathering offers a sophisticated social space for security professionals and builders:
- Technical discussions on advanced security practices, formal verification, automated fuzzing, and auditing zero-knowledge circuits.
- Case study presentations highlighting lessons learned from recent DeFi exploits, incident response protocols, and proactive threat modeling.
- Complimentary premium drinks, hors d'oeuvres, and an upscale networking environment conducive to high-level technical exchange.

## Who should attend

Attendance is intended for security researchers, smart contract auditors, protocol security leads, DeFi risk managers, and founders committed to building robust decentralized systems.

## Venue and schedule

The lounge takes place at a private hospitality venue in Mumbai on Wednesday, November 4, from 19:00 to 22:00 IST (13:30-16:30 UTC).

## Registration and admission

Admission requires registration approval via Luma due to strictly limited room capacity. Approved guests must present their registration QR code and valid photo identification at the door.`,
  },
  {
    slug: 'midweek-block-party-mumbai',
    description: `Orviq Labs presents the Midweek Block Party in Mumbai on Wednesday, November 4, 2026, from 20:00 to 23:30 IST. The evening provides a high-energy social gathering and networking celebration midway through Devcon week.

## What to expect

The party offers an energetic atmosphere designed for relaxation and community connection:
- Live DJ performances featuring house music, electronic dance tracks, and contemporary beats.
- An expansive dance floor alongside relaxed lounge areas for casual conversations and social mingling.
- Open bar service with craft cocktails, chilled beers, and gourmet finger foods.
- Strictly social format with no pitch decks, formal panels, or corporate presentations.

## Who should attend

The gathering warmly welcomes all Devcon attendees, hackathon hackers, founders, digital artists, and Web3 enthusiasts in Mumbai looking to unwind and connect with fellow community members.

## Venue and schedule

The party takes place at an upscale nightlife and club venue in the Bandra Kurla Complex (BKC) area of Mumbai on Wednesday, November 4, running from 20:00 to 23:30 IST.

## Registration and admission

Registration is free via Luma and subject to venue capacity limits. Early arrival is highly recommended as entry is handled on a first-come, first-served basis for approved badge holders.`,
  },
  {
    slug: 'builders-brunch-mumbai',
    description: `Buildify hosts the Builders Brunch in Mumbai on Thursday, November 5, 2026, from 13:00 to 16:00 IST during Devcon week. The midday gathering brings together decentralized technology builders for authentic Indian food and informal collaboration.

## What to expect

The brunch offers a casual, community-first setting for meaningful peer interaction:
- A rich spread of authentic regional Indian brunch specialties, fresh tropical fruits, and artisanal beverages.
- Roundtable discussions where founders and developers share unvarnished experiences regarding product development, user onboarding, and technical architecture.
- Collaborative whiteboarding spaces where engineering teams can brainstorm solutions to scalability, privacy, and UX bottlenecks.

## Who should attend

The brunch is tailored for software engineers, product designers, protocol contributors, and early-stage Web3 startup founders attending Devcon in Mumbai.

## Venue and schedule

The gathering takes place at a private restaurant and terrace venue in Mumbai on Thursday, November 5, from 13:00 to 16:00 IST (07:30-10:30 UTC).

## Registration and admission

Admission is free and requires organizer approval on Luma. The exact restaurant address is sent directly to approved participants upon confirmation.`,
  },
  {
    slug: 'pragma-mumbai',
    description: `ETHGlobal hosts Pragma Mumbai on Friday, November 6, 2026, at the Jio World Convention Centre in Bandra Kurla Complex, Mumbai. The one-day, single-track summit brings together visionary founders, core developers, and researchers for high-density technical discourse.

## What to expect

Pragma features a curated, single-track schedule emphasizing substantive technical discussions:
- In-depth keynote presentations and whiteboard debates exploring Ethereum's scaling frontiers, zero-knowledge virtual machines, and decentralized liquidity design.
- Practical demonstrations of cutting-edge developer tooling, cross-chain messaging primitives, and cryptographic security standards.
- Dedicated conversation pauses between sessions, supported by catered lunches, coffee lounges, and an interactive attendee portal for scheduling 1-on-1 bilateral meetings.

## Who should attend

The summit is designed for Web3 founders, senior protocol developers, technical architects, and research scientists committed to advancing decentralized technologies.

## Venue and schedule

The summit takes place at the Jio World Convention Centre in Bandra Kurla Complex, Mumbai, on Friday, November 6, 2026.

## Registration and admission

Admission is managed through application on ETHGlobal's event portal. Attendees must secure an approved ticket pass prior to the summit date.`,
  },
];

async function main() {
  const sourceFiles = [
    'content/events/sources/ibw-side-events.json',
    'content/events/sources/events-cache.json',
    'content/events/sources/india-luma-events.json',
    'content/events/sources/verified-discovery.json',
    'content/events/sources/curated-events.json',
    'content/events/sources/luma-batch-events.json',
  ];

  const enrichMap = new Map<string, string>();
  for (const item of ENRICHMENTS) {
    const cleaned = polishEventDescriptionLinks(cleanPublishText(item.description));
    enrichMap.set(item.slug, cleaned);
  }

  console.log(`Loaded ${enrichMap.size} detailed enrichments.`);
  let totalEnriched = 0;

  const historyPath = 'content/event-slug-history.json';
  const history = fs.existsSync(historyPath) ? JSON.parse(fs.readFileSync(historyPath, 'utf8')) : {};
  const idToSlug = new Map<string, string>();
  const urlToSlug = new Map<string, string>();
  for (const [id, entry] of Object.entries(history) as [string, { slug: string; aliases?: string[] }][]) {
    if (entry.slug) idToSlug.set(id, entry.slug);
    for (const a of entry.aliases || []) idToSlug.set(a, entry.slug);
  }

  for (const file of sourceFiles) {
    if (!fs.existsSync(file)) continue;
    const list = JSON.parse(fs.readFileSync(file, 'utf8')) as Web3Event[];
    let fileModified = false;

    for (const event of list) {
      let targetSlug = (event.slug && enrichMap.has(event.slug)) ? event.slug : idToSlug.get(event.id);
      if (!targetSlug && event.url) {
        const u = event.url.toLowerCase().replace(/^https?:\/\//, '').replace(/^lu\.ma\//, 'luma.com/').replace(/\/+$/, '');
        targetSlug = urlToSlug.get(u);
      }

      if (targetSlug && enrichMap.has(targetSlug)) {
        const enrichedText = enrichMap.get(targetSlug)!;
        const currentWords = (event.description || '').split(/\s+/).filter(Boolean).length;
        const newWords = enrichedText.split(/\s+/).filter(Boolean).length;

        event.description = enrichedText;
        if (event.descriptionSource) {
          event.descriptionSource.sha256 = sha(enrichedText);
          event.descriptionSource.fetchedAt = now();
          event.descriptionSource.method = 'reviewed-primary-sources';
        } else {
          event.descriptionSource = {
            url: event.url || event.registrationUrl || 'https://luma.com/ibw',
            fetchedAt: now(),
            method: 'reviewed-primary-sources',
            pageTitle: event.name,
            sha256: sha(enrichedText),
          };
        }

        console.log(`[${file}] Enriched /${targetSlug} (id: ${event.id}): ${currentWords} words -> ${newWords} words`);
        fileModified = true;
        totalEnriched++;
      }
    }

    if (fileModified) {
      fs.writeFileSync(file, JSON.stringify(list, null, 2) + '\n');
      console.log(`Saved changes to ${file}`);
    }
  }

  const catalogReviewedFile = 'content/events/catalog-reviewed-descriptions.json';
  if (fs.existsSync(catalogReviewedFile)) {
    const catalogDesc = JSON.parse(fs.readFileSync(catalogReviewedFile, 'utf8'));
    let catalogModified = false;
    for (const [id, entry] of Object.entries(catalogDesc)) {
      const targetSlug = idToSlug.get(id);
      if (targetSlug && enrichMap.has(targetSlug)) {
        const enrichedText = enrichMap.get(targetSlug)!;
        (entry as any).description = enrichedText;
        if ((entry as any).descriptionSource) {
          (entry as any).descriptionSource.sha256 = sha(enrichedText);
          (entry as any).descriptionSource.fetchedAt = now();
        }
        catalogModified = true;
        console.log(`[${catalogReviewedFile}] Enriched /${targetSlug} (${id})`);
      }
    }
    if (catalogModified) {
      fs.writeFileSync(catalogReviewedFile, JSON.stringify(catalogDesc, null, 2) + '\n');
      console.log(`Saved changes to ${catalogReviewedFile}`);
    }
  }

  const ibwAuditFile = 'content/events/ibw-description-audit.json';
  if (fs.existsSync(ibwAuditFile)) {
    const ibwAudit = JSON.parse(fs.readFileSync(ibwAuditFile, 'utf8'));
    let auditModified = false;
    for (const row of ibwAudit.rows) {
      const canonicalSlug = idToSlug.get(row.id) || row.slug;
      if (enrichMap.has(canonicalSlug) || enrichMap.has(row.slug)) {
        const enrichedText = (enrichMap.get(canonicalSlug) || enrichMap.get(row.slug))!;
        const newWords = enrichedText.split(/\s+/).filter(Boolean).length;
        row.afterSha256 = sha(enrichedText);
        row.wordsAfter = newWords;
        row.changed = true;
        row.decision = 'expanded';
        auditModified = true;
        console.log(`[${ibwAuditFile}] Updated /${row.slug} (${row.id})`);
      }
    }
    if (auditModified) {
      fs.writeFileSync(ibwAuditFile, JSON.stringify(ibwAudit, null, 2) + '\n');
      console.log(`Saved changes to ${ibwAuditFile}`);
    }
  }

  console.log(`\nSuccessfully enriched ${totalEnriched} events with rich, high-quality editorial content!`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
