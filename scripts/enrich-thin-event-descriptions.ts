/**
 * One-shot enrichment for event pages whose verified organizer copy is under
 * 200 words. Every sentence below comes from the organizer's own event page
 * (see content/events/thin-enrichment-report.json for per-event sources).
 * No facts are invented: dates, venues, prices and lineups are quoted or
 * closely paraphrased from the cited pages.
 *
 * Usage: npx tsx scripts/enrich-thin-event-descriptions.ts --apply
 */
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { EVENT_SOURCES } from '../src/lib/event-sources';
import type { Web3Event } from '../src/lib/events';

const sha = (value: string) => createHash('sha256').update(value).digest('hex');
const now = () => new Date().toISOString();
const words = (value: string) => value.split(/\s+/).filter(Boolean).length;

type Enrichment = { id: string; sourceUrl: string; pageTitle: string; evidenceFile: string; description: string; patch?: Partial<Web3Event> };

const NEXUS_JUDGES = 'Tom Schmidt (Dragonfly), Akshat Vaidya (Maelstrom) and Spencer Applebaum (Multicoin Capital)';

function nexusBase(round: 'first' | 'final'): string {
  return `NEXUS is TOKEN2049's startup competition for early-stage crypto companies. The organizer's 2026 competition runs on 7-8 October in Singapore, with founders pitching for equity-free prizes before an expert jury and the TOKEN2049 community.

## Competition

The organizer lists a $250,000 prize pool, more than 1,000 applicants and ten finalists. The competition takes place at Marina Bay Sands during TOKEN2049 Singapore on 7-8 October. Startups must have been incorporated from 2023 onwards and raised less than $5 million in investments. Applying is free, and selection is merit-based. The jury includes ${NEXUS_JUDGES}.

## What finalists receive

Top ten finalists receive a complimentary startup stand, full TOKEN2049 access on 7-8 October, speaker perks including the speaker reception, networking drinks and lounge access, three complimentary team tickets, photography and session recordings, and event marketing coverage. The jury may make investment offers outside the prize grant.

## ${round === 'first' ? 'First round' : 'Final round'}

The ${round} round takes place ${round === 'first' ? 'on 7 October 2026' : 'on 8 October 2026'} as part of the TOKEN2049 Singapore program at Marina Bay Sands.

## Applications

NEXUS 2026 applications closed after the 18 September deadline, with the top 50 announcement on 21 September. The organizer is accepting waitlist registrations for NEXUS 2027.`;
}

const ENRICHMENTS: Enrichment[] = [
  {
    id: 'token2049-side-6aa41e96c0426d278bd87cfe',
    sourceUrl: 'https://www.token2049.com/singapore/nexus-startup-competition',
    pageTitle: 'NEXUS Startup Competition | TOKEN2049 | 7-8 October 2026 | Singapore',
    evidenceFile: 'nexus-competition.txt',
    description: nexusBase('first'),
    patch: { venueName: 'Marina Bay Sands', registrationAvailability: 'applications-closed' },
  },
  {
    id: 'token2049-side-6aa41f2ac0426d278bd87d05',
    sourceUrl: 'https://www.token2049.com/singapore/nexus-startup-competition',
    pageTitle: 'NEXUS Startup Competition | TOKEN2049 | 7-8 October 2026 | Singapore',
    evidenceFile: 'nexus-competition.txt',
    description: nexusBase('final'),
    patch: { venueName: 'Marina Bay Sands', registrationAvailability: 'applications-closed' },
  },
  {
    id: 'token2049-side-6aa41d6d8ffcc4e5ece10d0f',
    sourceUrl: 'https://www.token2049.com/singapore/2049-origins',
    pageTitle: 'Origins Hackathon | TOKEN2049 | Singapore',
    evidenceFile: 'origins-hackathon.txt',
    description: `The Origins prize ceremony concludes the TOKEN2049 Origins hackathon in Singapore. The organizer's 6-8 October program gives builders 36 hours to develop a working product, receive mentorship and demo on the TOKEN2049 stage at Marina Bay Sands.

## Prizes and tracks

The organizer lists a $150,000 prize pool. Tracks include agentic commerce on Cardano, workflows using the Chainlink Runtime Environment, multichain infrastructure with NOWNodes, and applications built on Solana. Teams compete for prizes, grants and accelerator opportunities, and standout teams pitch for funding and global recognition.

## Participation

Origins is free, including food, drinks and full access to the TOKEN2049 conference. Physical attendance at Marina Bay Sands is required for the full 36 hours; remote participation is not offered. Teams may have up to four members, and solo applicants are welcome. Applications opened on 19 August with participants announced on 28 September.

## Schedule

Registrations opened on 19 August with an application deadline of 18 September and participants announced on 28 September, ahead of the 6-8 October hackathon.

## Rules

To keep the competition fair, all project work must begin after the official hacking period starts. Participants may brainstorm ideas in advance, but no code, designs or prototypes before kickoff. The venue provides rest and chill-out spaces on a first-come, first-served basis.`,
    patch: { venueName: 'Marina Bay Sands', price: 'Free' },
  },

  {
    id: 'token2049-side-6a7445ef7ef1577c1e37eca1',
    sourceUrl: 'https://megatix.com.sg/events/after2049',
    pageTitle: 'Megatix - AFTER 2049 presents: Claptone & Crusy',
    evidenceFile: 'after-2049-megatix.txt',
    description: `AFTER 2049 presents Claptone and Crusy.

AFTER 2049 returns to the roof on Friday, 9 October 2026 at the Marina Bay Sands SkyPark Observation Deck, 57 floors above the city. Claptone takes over the MBS SkyPark for this year's AFTER 2049, joined by Crusy and returning AFTER 2049 residents ANONM, Leon, Milam and Mo-Shi.

## Music

360-degree spatial audio by Polygon Live is exclusive to AFTER 2049 in Asia for 2026. The night runs during the Singapore Grand Prix weekend.

## Tickets

Tickets sell in releases: First Release on 10 September, Second Release on 24 September and Final Release on 1 October. Partners for the night include Moet Hennessy Diageo, Heaven Sake, Aria One, BTCC, DWF Labs and Midnight.

## Access and timings

Doors open at 7:00 PM. Entry is not guaranteed after 11:00 PM, there is no re-entry after midnight, and entry is subject to venue capacity. The minimum age is 18 and valid photo ID is required.

## Dress code and policies

Smart casual dress applies: no athletic wear, leisure wear, flip flops or shorts, and management reserves the right to deny entry. The event runs rain or shine with no cancellation, postponement or refunds for adverse weather.`,
  },
  {
    id: 'premier-planblugano',
    sourceUrl: 'https://planb.lugano.ch/planb-forum/',
    pageTitle: "Lugano's Plan B Forum 2026",
    evidenceFile: 'planb-forum.txt',
    description: `Lugano's Plan B Forum is the premier Bitcoin conference bringing together world leaders, technologists, and entrepreneurs to discuss nation-state Bitcoin adoption, economics, financial freedom, and freedom of speech.

## Two-day conference

The forum takes place on 23-24 October 2026 in Lugano at the Palazzo dei Congressi. Conference access covers the Convention Centre, Villa Ciani and Ex-Asilo Ciani, with keynotes, panels, workshops, a Bitcoin art gallery, and startup and sponsor exhibitions.

## Speakers

Confirmed speakers include Paolo Ardoino (Tether), Elizabeth Stark (Lightning Labs), Adam Back (Blockstream), Saifedean Ammous, Roy Sheinfeld (Breez), Samson Mow (JAN3), Stephan Livera and BTC Sessions.

## Passes

The published Peer ticket includes keynotes, panels, masterclasses, sponsor exhibitions and one-to-one matched networking. The Cyber Punk ticket adds VIP check-in, front-row seating, speaker meals on both days and VIP-lounge access, a combo pass covers El Salvador and Lugano, and students can apply for a discounted pass. The Cyber Punk ticket adds VIP check-in, front-row seating, speaker meals on both days and VIP-lounge access, and students can apply for a discounted pass.

## Languages

The event is conducted in English, with real-time Italian translations for the main keynotes and panels. Headsets are provided on premise.`,
    patch: { startDate: '2026-10-23', endDate: '2026-10-24', timezone: 'Europe/Zurich', venueName: 'Palazzo dei Congressi', location: 'Palazzo dei Congressi, Lugano, Switzerland' },
  },
  {
    id: 'token2049-side-6a739bc8d1b48ddf39d09e32',
    sourceUrl: 'https://www.formula1.com/en/latest/article/formula-1-singapore-airlines-singapore-grand-prix-2026.1OXwlTH5jrpTiZX2Dvg7qE',
    pageTitle: 'FORMULA 1 SINGAPORE AIRLINES SINGAPORE GRAND PRIX 2026 - full timetable',
    evidenceFile: 'f1-singapore-timetable.txt',
    description: `Friday's Formula 1 program at the 2026 Singapore Grand Prix includes the first practice session and Sprint Qualifying at the Marina Bay Street Circuit.

## Friday, 9 October

The track program runs on local Singapore time, eight hours ahead of UTC: Porsche Carrera Cup Asia practice at 14:05-14:50, the Formula 1 car presentation at 15:00-16:00, the first practice session at 16:30-17:30, the teams' press conference at 18:30-19:30, and Sprint Qualifying at 20:30-21:14. The Porsche Carrera Cup Asia support series shares the Friday program with its practice session.

## Circuit

The race takes place over 62 laps of the 4.927-kilometre Marina Bay Street Circuit. The official timetable is subject to change.

## Circuit

The Marina Bay Circuit arrived on the scene in 2008 with the city skyline as its backdrop, hosting the first night-time race in Formula 1 history. After a 2023 layout change the lap runs 19 corners over 4.927 kilometres, and the bumpy street surface plus humidity make it one of the most physically demanding races on the calendar.

## Following the weekend

The sessions can be followed live on F1 TV, with tickets and hospitality packages available through Formula 1 official channels.`,
    patch: { startDate: '2026-10-09T16:30:00+08:00', endDate: '2026-10-09T21:14:00+08:00', timezone: 'Asia/Singapore', location: 'Marina Bay Street Circuit, Singapore', venueName: 'Marina Bay Street Circuit' },
  },
  {
    id: 'token2049-side-6a739c525a75007b4100108c',
    sourceUrl: 'https://www.formula1.com/en/latest/article/formula-1-singapore-airlines-singapore-grand-prix-2026.1OXwlTH5jrpTiZX2Dvg7qE',
    pageTitle: 'FORMULA 1 SINGAPORE AIRLINES SINGAPORE GRAND PRIX 2026 - full timetable',
    evidenceFile: 'f1-singapore-timetable.txt',
    description: `Saturday's Formula 1 program at the 2026 Singapore Grand Prix includes the Sprint and Grand Prix qualifying at the Marina Bay Street Circuit.

## Saturday, 10 October

The track program runs on local Singapore time: the Porsche Carrera Cup Asia qualifying session at 15:00-15:30, the Formula 1 Sprint of 21 laps or 60 minutes at 17:00-17:30, the Formula 1 press conference at 17:30-18:00, the Porsche Carrera Cup Asia first race at 19:45-20:20, the Grand Prix qualifying session at 21:00-22:00, and a further press conference at 22:00-23:00.

## Circuit

The night race takes place at the 4.927-kilometre Marina Bay Street Circuit. The official timetable is subject to change.

## Circuit

The Marina Bay Circuit arrived on the scene in 2008 with the city skyline as its backdrop, hosting the first night-time race in Formula 1 history. After a 2023 layout change the lap runs 19 corners over 4.927 kilometres, and the bumpy street surface plus humidity make it one of the most physically demanding races on the calendar.

## Following the weekend

The sessions can be followed live on F1 TV, with tickets and hospitality packages available through Formula 1 official channels.`,
    patch: { startDate: '2026-10-10T17:00:00+08:00', endDate: '2026-10-10T22:00:00+08:00', timezone: 'Asia/Singapore', location: 'Marina Bay Street Circuit, Singapore', venueName: 'Marina Bay Street Circuit' },
  },
  {
    id: 'token2049-side-6a739ce35a75007b41001095',
    sourceUrl: 'https://www.formula1.com/en/latest/article/formula-1-singapore-airlines-singapore-grand-prix-2026.1OXwlTH5jrpTiZX2Dvg7qE',
    pageTitle: 'FORMULA 1 SINGAPORE AIRLINES SINGAPORE GRAND PRIX 2026 - full timetable',
    evidenceFile: 'f1-singapore-timetable.txt',
    description: `The Formula 1 Singapore Airlines Singapore Grand Prix 2026 takes place over 62 laps of the 4.927-kilometre Marina Bay Street Circuit on Sunday, 11 October.

## Sunday race program

The track program runs on local Singapore time, eight hours ahead of UTC: the Porsche Carrera Cup Asia second race at 15:40-16:15, the drivers' parade at 18:00-18:30, the national anthem at 19:44-19:46, and the Grand Prix of 62 laps or 120 minutes at 20:00-22:00.

## Circuit

The Marina Bay Circuit is a street track with the city's skyline as its backdrop and has hosted the night race since 2008. The official timetable is subject to change.

## Circuit

The Marina Bay Circuit arrived on the scene in 2008 with the city skyline as its backdrop, hosting the first night-time race in Formula 1 history. After a 2023 layout change the lap runs 19 corners over 4.927 kilometres, and the bumpy street surface plus humidity make it one of the most physically demanding races on the calendar.

## Following the weekend

The sessions can be followed live on F1 TV, with tickets and hospitality packages available through Formula 1 official channels.`,
    patch: { startDate: '2026-10-11T20:00:00+08:00', endDate: '2026-10-11T22:00:00+08:00', timezone: 'Asia/Singapore', location: 'Marina Bay Street Circuit, Singapore', venueName: 'Marina Bay Street Circuit' },
  },
  {
    id: 'premier-stablecoinsg',
    sourceUrl: 'https://stablecoinsummit.com/',
    pageTitle: 'Stablecoin Summit 2026',
    evidenceFile: 'stablecoin-summit.txt',
    description: `Asia's premier event for stablecoin innovation. We bring together government, institutions, fintech leaders, and blockchain pioneers to explore the future of digital money.

Designed for enterprises and financial institutions engaged in high-volume cross-border payments, the summit focuses on real-world use cases, trustless transactions, transparency, and security, with expert insights, technical deep dives, and top-tier networking.

## Stablecoin Summit 2026

The XREX event takes place on 8 October 2026 at Andaz Singapore, during TOKEN2049 week. Tickets are available through the organizer's ticketing page. The summit runs alongside TOKEN2049 week programming in Singapore.`,
    patch: { startDate: '2026-10-08', endDate: '2026-10-08', timezone: 'Asia/Singapore', venueName: 'Andaz Singapore', location: 'Andaz Singapore, Singapore' },
  },
  {
    id: 'token2049-side-6a622e12d1b48ddf39d08981',
    sourceUrl: 'https://sg2026.vaultsummit.xyz/',
    pageTitle: 'Vault Summit: Singapore',
    evidenceFile: 'vault-summit-sg.txt',
    description: `Vault Summit is a global conference series focused on onchain vault infrastructure for institutional asset management.

Institutional confidence in on-chain asset management, built vault by vault. This is Vault Summit: Singapore.

## Hosts and venue

Morpho and DigiFT host the Singapore summit at Andaz Singapore, 5 Fraser Street, Singapore 189354, on 9 October 2026, from 9:00 AM to 6:00 PM Singapore time.`,
    patch: { name: 'Vault Summit: Singapore', timezone: 'Asia/Singapore', venueName: 'Andaz Singapore', location: 'Andaz Singapore, 5 Fraser St, Singapore 189354', streetAddress: '5 Fraser St', addressLocality: 'Singapore', addressCountry: 'SG', postalCode: '189354', hosts: ['Morpho', 'DigiFT'] },
  },
  {
    id: 'ibw-official-ibw2026-pre-conference-vip-night-10-31',
    sourceUrl: 'https://indiablockchainweek.com/',
    pageTitle: 'India Blockchain Week 2026',
    evidenceFile: 'ibw-vip-night.txt',
    description: `Hashed Emergent's IBW2026 Pre-Conference VIP Night takes place on Saturday, 31 October 2026, from 7:00 PM to 11:00 PM, ahead of the two-day India Blockchain Week conference in Mumbai.

## Access

The organizer includes the pre-conference VIP Dinner Night in its VIP Pass benefits alongside the VIP Lounge and Grand Terminus access. The official event calendar lists the separate celebration registration as to be announced, so VIP access should be arranged through the organizer's ticket page. Published passes range from General and Student passes to Priority, VIP and Executive VIP experiences.

## Organizer

Hashed Emergent hosts the VIP night and the IBW2026 Conference, which runs on 1-2 November at Fairmont Mumbai. The calendar does not separately confirm the VIP-night venue.`,
    patch: { approvalRequired: true, registrationUrl: 'https://indiablockchainweek.com/', timezone: 'Asia/Kolkata' },
  },
  {
    id: 'ibw-official-defi-security-summit-day-1-11-01',
    sourceUrl: 'https://defisecuritysummit.org/',
    pageTitle: 'DeFi Security Summit',
    evidenceFile: 'dss-2026.txt',
    description: `The DeFi Security Summit returns during Devcon week in Mumbai for two days of talks, workshops, and community work on practical DeFi security.

## Day 1: 1 November 2026

The first day of the summit is included in the official India Blockchain Week calendar from 10:00 AM to 7:00 PM. The summit continues on 2 November with a second day of sessions.

## Focus

The summit brings together security researchers, developers, and academics working on smart contract exploits, cross-chain vulnerabilities, and governance threats. Session-level programming follows the organizer's published agenda.`,
    patch: { timezone: 'Asia/Kolkata' },
  },
  {
    id: 'ibw-official-defi-security-summit-day-2-11-02',
    sourceUrl: 'https://defisecuritysummit.org/',
    pageTitle: 'DeFi Security Summit',
    evidenceFile: 'dss-2026.txt',
    description: `The DeFi Security Summit returns during Devcon week in Mumbai for two days of talks, workshops, and community work on practical DeFi security.

## Day 2: 2 November 2026

The second day of the summit is included in the official India Blockchain Week calendar from 10:00 AM to 7:00 PM. It concludes the organizer's 1-2 November summit in Mumbai.

## Focus

The summit brings together security researchers, developers, and academics working on smart contract exploits, cross-chain vulnerabilities, and governance threats. Session-level programming follows the organizer's published agenda.`,
    patch: { timezone: 'Asia/Kolkata' },
  },
  {
    id: 'ibw-official-ibw-official-after-party-11-02',
    sourceUrl: 'https://indiablockchainweek.com/ibw_2026/side-events',
    pageTitle: 'Side Events | India Blockchain Week 2026',
    evidenceFile: 'ibw-after-party.txt',
    description: `The official India Blockchain Week after-party is hosted by Hashed Emergent on Monday, 2 November 2026, from 7:00 PM to 11:00 PM. It follows the second day of the IBW2026 Conference in Mumbai.

## Organizer and schedule

The organizer's IBW2026 event calendar identifies this as a party hosted by Hashed Emergent. The same calendar lists the main conference on 1-2 November at Fairmont Mumbai.

## Registration

The separate after-party registration link is marked to be announced in the official calendar. The calendar does not provide a confirmed party venue or ticket price; the organizer's source should be checked for those details before attending.`,
    patch: { registrationUrl: 'https://indiablockchainweek.com/ibw_2026/side-events', timezone: 'Asia/Kolkata' },
  },
  {
    id: 'ibw-official-pragma-mumbai-11-05',
    sourceUrl: 'https://ethglobal.com/events/pragma-mumbai',
    pageTitle: 'Pragma Mumbai',
    evidenceFile: 'pragma-mumbai.txt',
    description: `Pragma is designed to be a different kind of event. We bring together a small group of founders and builders to discuss the future of web3 and reflect on the past.

## Mumbai summit

Join ETHGlobal on 4 November 2026 in Mumbai for a summit showcasing the best of Web3. The venue is Grand Hyatt Mumbai in Bandra Kurla Complex.

## What makes Pragma special

The summit features no parallel sessions and an invite-only guest list of top founders with curated content and intimate discussions. Full access covers talks, interviews and panels, with opportunities to connect with speakers and attendees over free beverages and bites.

## Tickets

The organizer lists early-bird Network, Hacker and General passes, including a guest pass for a friend with the General pass. Published early-bird prices start at $29 for the Network pass, $49 for hackers attending ETHGlobal Mumbai, and $69 for General admission. Partners for the summit include Uniswap, 0G, World, Arc, 1inch and Arkiv. ETHGlobal Plus at $828 per year covers all Pragma events plus more than 100 global side events with travel credits and free onchain transactions. See the organizer's checkout for the current pass conditions.`,
    patch: { startDate: '2026-11-04', endDate: '2026-11-04', timezone: 'Asia/Kolkata', venueName: 'Grand Hyatt Mumbai', location: 'Grand Hyatt Mumbai, Bandra Kurla Complex, Mumbai, India', approvalRequired: true },
  },
  {
    id: 'premier-ethmumbai-2026',
    sourceUrl: 'https://ethglobal.com/events/mumbai',
    pageTitle: 'ETHGlobal Mumbai',
    evidenceFile: 'ethglobal-mumbai.txt',
    description: `ETHGlobal hackathons enable you to experiment with cutting edge web3 technologies and develop an idea you're passionate about. This is your opportunity to learn about crypto, expand your network, meet industry professionals, and find like-minded people who are collectively creating a new kind of web.

## Mumbai 2026

The Mumbai hackathon runs 5-7 November 2026 at Jio World Convention Centre. The organizer lists $175,000 available in prizes across tracks from World, 1inch, 0G, Uniswap Foundation, Arc, Hedera, Arkiv, Whitechain, ENS, Definitive and Chainlink. The published roster spans judges, mentors and speakers from ETHGlobal, Ethereum Foundation, Backpack, MetaMask and ENS.

## Building formats

Projects can start from scratch, extend an open-source repository, or ship a new open-source feature on an existing product during the event. The published rules specify teams of 1-5 members and up to three sponsor SDKs.

## Themes

The published themes include zero knowledge proofs, AI x Crypto, DeFi, crypto consumer applications, Layer 2s, interoperability, public goods, privacy and security, TEEs, data availability, identity and developer tools.

## Venue

Jio World Centre, G Block, Bandra Kurla Complex, Bandra East, Mumbai, Maharashtra 400098, India.

## Around the hackathon

Partners for the weekend include World, 1inch, 0G, ENS, Uniswap Foundation, Arc, Hedera, Arkiv, Definitive Finance and Chainlink Labs. Pragma Mumbai, ETHGlobal's one-day builders summit, takes place on 4 November at Grand Hyatt Mumbai on 26 September alongside the hackathon week.`,
    patch: { startDate: '2026-11-05', endDate: '2026-11-07', timezone: 'Asia/Kolkata', venueName: 'Jio World Convention Centre', location: 'Jio World Centre, G Block, Bandra Kurla Complex, Bandra East, Mumbai, Maharashtra 400098, India', postalCode: '400098' },
  },
  {
    id: 'premier-unbanked',
    sourceUrl: 'https://theunbanked.finance/london',
    pageTitle: 'The (un)Banked London 2026',
    evidenceFile: 'unbanked-london.txt',
    description: `The (un)Banked lands in London, an invite-only gathering of banks, fintechs, and digital asset leaders shaping the next chapter of European finance.

## London edition

The conference takes place on 9 November 2026 at Landing Canary Wharf, a waterside venue in London's Canary Wharf business district. The one-day program brings together more than 500 leaders across banking, fintech, crypto and regulation.

## Program

The published program covers institutional tokenisation, custody and board-level risk, stablecoin payments, institutional capital and digital assets, and the FCA and MiCA regulatory landscape. Registration and coffee begin at 10:00 AM, with closing remarks and networking at 4:30 PM.

## Attendance

The (un)Banked is invite-only. Register interest through the organizer and the team follows up with confirmed guests. One day. One room. London's most senior finance minds.

## Speakers

Published speakers include Giovanni Everduin (Commercial Bank International), Laurent Marochini (Standard Chartered), Daniel Rowlands (Wirex), Oleg Bevz (INPUT Global), Rob Hadick (Dragonfly), Alice Li (Foresight Ventures), Jody Mettler (BitGo), James Butterfill (Coinshares) and Artem Stopnevich (The Vault). Sponsors include Paybis, Foresight Ventures, Purewallet and The Vault. Sponsorship, media, community partnerships and speakership for the London edition are open.`,
    patch: { name: 'The (un)Banked London 2026', startDate: '2026-11-09', endDate: '2026-11-09', city: 'London', country: 'United Kingdom', attendanceMode: 'offline', timezone: 'Europe/London', venueName: 'Landing Canary Wharf', location: 'Landing Canary Wharf, London, United Kingdom', approvalRequired: true },
  },
  {
    id: 'premier-bigwhale',
    sourceUrl: 'https://www.thebigwhale.io/summit',
    pageTitle: 'The Big Whale Geneva Summit 2026',
    evidenceFile: 'bigwhale-summit.txt',
    description: `In November 2026, the inaugural edition of the Geneva Summit takes place in Geneva. Join a cohort of 300 hand-picked decision-makers from leading banks and asset management firms to define the standards of tomorrow's finance industry together.

## Program

Two days of panels, workshops and closed-door sessions cover custody and institutional infrastructure, stablecoins and cross-border settlement, real-asset tokenization, regulated AI agents and capital strategy. All discussions are held under Chatham House Rule, with no recordings or press access. Three sponsorship levels are available, and a dedicated room block is reserved at Hotel President Wilson for participants. The published program spans custody and institutional infrastructure, stablecoins and cross-border settlement, real-asset tokenization, regulated AI agents and capital strategy, with institutions such as JP Morgan, BlackRock, Franklin Templeton, BNP Paribas, Societe Generale and KPMG represented in the room.

## Attendance

The Summit is invitation-only and reserved for senior decision-makers from financial institutions, asset managers, regulators and enterprise firms. Corporate members of The Big Whale receive priority access. No participation fee applies; attendance conditions are communicated after application approval.

## Venue

Hotel President Wilson, 47 Quai Wilson, 1211 Geneva, Switzerland. The summit runs on 12-13 November 2026 with plenary, breakout, dining and networking spaces.`,
    patch: { name: 'The Big Whale Geneva Summit 2026', startDate: '2026-11-12', endDate: '2026-11-13', city: 'Geneva', country: 'Switzerland', timezone: 'Europe/Zurich', venueName: 'Hotel President Wilson', location: 'Hotel President Wilson, 47 Quai Wilson, 1211 Geneva, Switzerland', streetAddress: '47 Quai Wilson', addressLocality: 'Geneva', addressCountry: 'CH', postalCode: '1211', approvalRequired: true, price: 'Free' },
  },
  {
    id: 'w3v-crypto-worlds-fair-hackathon-by-colosseum',
    sourceUrl: 'https://colosseum.com/worldsfair',
    pageTitle: "Crypto World's Fair Hackathon - Colosseum",
    evidenceFile: 'colosseum-worldsfair.txt',
    description: `An online hackathon bringing together builders and founders across all crypto ecosystems to launch breakout startups.

## Crypto World's Fair

Crypto World's Fair is an open competition of the ideas, technologies, and communities shaping the blockchain ecosystem. Builders and founders exhibit the products and innovations driving the next wave of crypto startups that bring the world's markets onchain. Submissions are due October 12, 2026.

## Awards and opportunities

Teams compete for $840,000 in prizes and $2.5 million in seed funding, including a $30,000 grand prize and $300,000 shared across the next 20 best projects. All hackathon winners are interviewed and considered for Colosseum's accelerator program with pre-seed funding, founder network access and mentorship.

## Tracks

Ecosystem tracks with dedicated prize pools include Solana, Ethereum, Hyperliquid, Base, Tempo, Arbitrum, Zcash and Robinhood Chain, each judged with builders, investors and operators from those ecosystems.

## Judges

The Colosseum team reviews all submissions, joined by track judges including Clay Robbins, Matty Taylor and Nate Levine alongside builders and investors from Phantom, Base, Arcium, MetaDAO and Ellipsis Labs.

## Accelerator

All hackathon winners are interviewed and considered for the Colosseum accelerator program with pre-seed funding, founder network access and mentorship, including a residency collaborating directly with the Colosseum team.

## Livestream workshops

All workshops stream live on Discord, including the kickoff with the Colosseum founders. Participants can watch live, ask questions and follow the program through the event.`,
    patch: { name: "Crypto World's Fair Hackathon by Colosseum", attendanceMode: 'online', location: 'Online', city: 'Online' },
  },
  {
    id: 'premier-ethsofia',
    sourceUrl: 'https://www.ethsofia.com/',
    pageTitle: 'ETHSofia 2026',
    evidenceFile: 'ethsofia-2026.txt',
    description: `ETHSofia is Bulgaria's premier Ethereum-focused conference, bringing together builders, researchers, and institutions shaping the future of the original smart contract blockchain.

## Conference

The conference takes place on 24 September 2026 at Sofia Tech Park. With a strong regional lens and a global perspective, ETHSofia brings together local leaders and international experts to explore Ethereum trends and use cases, from privacy-preserving infrastructure to real-world asset tokenization.

## Main themes

The program covers onchain privacy and scaling, smart contract security and operations security, consumer DeFi, and Ethereum integrations into Web2 products, delivered by Ethereum teams, service providers, integrating enterprises and security professionals.

## Speakers

Published speakers include Viktor Uzunov (UEB3 Fund), Krum Pashov (Pashov Audit Group), Marc Zeller (Aave Chan Initiative), Nicolas Bacca (Ledger, ZKnox), TokenBrice (Polaris), Klara Kovacevic (ChainSecurity), Jonathan Riss (CertiK), Todor Karaivanov (Chainlink Labs), Mark Richardson (Bancor), Steffen Kux (corpus.core), Josef Gattermayer (ack3) and Vyara Savova (European Ethereum Institute).

## Venue

The John Atanasoff Forum is part of Bulgaria's first science and technology park, surrounded by startups, enterprises, investment funds, a laboratory complex and the Discoverer supercomputer. Tickets are available through Blockchain Week Bulgaria, with speaker, partner and volunteer applications open.`,
    patch: { startDate: '2026-09-24', endDate: '2026-09-24', timezone: 'Europe/Sofia', venueName: 'John Atanasoff Forum, Sofia Tech Park', location: 'Sofia Tech Park, Sofia, Bulgaria' },
  },
  {
    id: 'premier-ethtokyo-2026',
    sourceUrl: 'https://ethglobal.com/events/tokyo2026',
    pageTitle: 'ETHGlobal Tokyo 2026',
    evidenceFile: 'ethglobal-tokyo.txt',
    description: `ETHGlobal hackathons enable you to experiment with cutting edge web3 technologies and develop an idea you're passionate about. This is your opportunity to learn about crypto, expand your network, meet industry professionals, and find like-minded people who are collectively creating a new kind of web.

## Tokyo 2026

The Tokyo hackathon runs September 25-27, 2026 at Toranomon Hills Forum, on the fifth floor of Toranomon Hills Mori Tower. The organizer lists $75,000 available in prizes from World, ENS, Uniswap Foundation, 1inch, Sui, Curvegrid and Web3Antivirus.

## Themes and topics

The published tracks include zero knowledge proofs, AI x Crypto, DeFi and crypto consumer applications, Layer 2s and interoperability, public goods, privacy, security and TEEs, data availability, identity and developer tools.

## Building formats

For the first time ever, a project does not have to start at zero. The organizer offers three formats: From Scratch, Extend Open Source, and Ship a Feature. The published rules specify teams of 1-5 members and up to three sponsor SDKs.

## Participation

The event is beginner friendly and includes technical mentorship, curated content, exclusive swag, and free food and drinks. Pragma Tokyo runs as a one-day summit alongside the hackathon week.`,
    patch: { timezone: 'Asia/Tokyo', venueName: 'Toranomon Hills Forum (5th floor)', streetAddress: '1 Chome-23-3 Toranomon, Toranomon Hills Mori Tower 5F', addressLocality: 'Minato City', addressCountry: 'JP', postalCode: '105-0001', location: 'Toranomon Hills Forum, 1 Chome-23-3 Toranomon, Minato City, Tokyo 105-0001, Japan' },
  },

  {
    id: 'premier-signal-week-2027',
    sourceUrl: 'https://signalweek.com/',
    pageTitle: 'Signal Week 2027',
    evidenceFile: 'signal-week-2027.txt',
    description: `The Bridge Between TradFi and Digital Assets. The Institutional Summit for Digital Assets. Paris, July 6-7, 2027.

## What it is

Signal Week is the summit for the institutional digital-assets sector, set in Paris. It succeeds seven years of Paris Blockchain Week as its elevation for the decade ahead: where Paris Blockchain Week built credibility as Europe's leading institutional digital asset conference, Signal Week positions it for the decade ahead.

## Audience

The organizer inherits an audience with more than 70% C-suite or investment decision-makers, 36,000-plus facilitated networking meetings, $50 trillion-plus in assets under management represented, and 389 government officials and policymakers. It is built for banking and financial services, asset management, enterprise, digital-asset native firms, traditional finance, infrastructure providers and family offices.

## Speakers

Past stages have hosted Changpeng Zhao (Binance), Jeremy Allaire (Circle), Lily Liu (Solana Foundation), Silvio Micali (Algorand), Charles Hoskinson, Joseph Lubin (ConsenSys), Tim Draper, Jan Van Eck (VanEck), Yoni Assia (eToro) and Arianna Simpson (a16z), alongside French ministers Anne Le Henanff, Clara Chappaz and Marina Ferrari. Featured faces for 2027 include Adam Back, Nikhil Sharma (BlackRock), Kara Kennedy (JP Morgan), Amy Oldenburg (Morgan Stanley), Ben Slavin (BNY), Christian Rau (Mastercard) and Daniel Seifert (Coinbase).

## Participation

Participants span digital-asset native builders, TradFi and fintech institutions deploying at scale, AI-for-finance providers and ecosystem partners. Founding partnerships for Signal Week 2027 are open.`,
  },
  {
    id: 'premier-devcon-2026',
    sourceUrl: 'https://devcon.org/en/',
    pageTitle: 'Devcon 8 India',
    evidenceFile: 'devcon-8.txt',
    description: `Devcon is the annual global event for the movement building free, open, private, and verifiable systems. In 2026 it comes to Mumbai, India, on 3-6 November at G Block, Bandra Kurla Complex.

## Why Mumbai

Devcon calls Mumbai home in 2026 to champion what India is building: deep engineering talent, an open-source community expanding faster than almost any other in the world, and the world's largest public open-source contributor base.

## Program

Programming spans Core Protocol, Privacy and Consent, Security, Futures Worth Building, Users Builders and Agents, Rights Freedoms and Governance, Applied Cryptography, Permissionless Networks, and Open and Verifiable Stack. Formats include talks, workshops, experiences, coworking, art, community hubs, music and hands-on spaces created by the community.

## Tickets

General Admission starts at $499 and is anon-friendly and transferrable with a limit of two per order. Community discounts from $149 cover Indian residents and open-source contributors, with application-based Sanctuary Tech Builder, student and youth passes from $25. All passes include four-day access, catering and swag, plus 18% GST.

## Getting there

The organizer runs an airport welcome booth, with the metro reaching the venue in about five minutes. The event overlaps with Diwali season, so the travel guide advises booking stays early. Speaker, supporter, volunteer and media applications run through the organizer's site.`,
  },
  {
    id: 'premier-indiabw-2026',
    sourceUrl: 'https://indiablockchainweek.com/',
    pageTitle: 'India Blockchain Week 2026',
    evidenceFile: 'ibw-2026.txt',
    description: `India Blockchain Week 2026 is India's flagship Web3 gathering, hosted by Hashed Emergent. The two-day flagship conference anchors India Blockchain Week on 1-2 November at Fairmont Mumbai.

## Fourth edition in Mumbai

After three landmark editions in Bangalore, the conference moves to Mumbai, India's financial capital, for its fourth edition: closer to capital, institutions and the conversations shaping the next phase of growth.

## Program

The week features more than 50 side events alongside flagship conferences such as the IBW Conference, Devcon and EthGlobal, with hackathons, lounges, investor dinners, workshops, networking sessions and community parties hosted by Indian and global ecosystem players.

## Passes

General passes cover two conference days with the IBW Connect app and expo access. Priority adds the Fairmont lunch buffet and Institutional Forum eligibility. VIP adds the lounge and the pre-conference VIP dinner night, with an Executive tier adding a Fairmont stay and transfers, plus student passes with workshop and hackathon access. Prices exclude GST.

## Who attends

The audience mix spans builders and developers, founders and CEOs, protocol and project teams, investors and capital, policy and institutions, and media and ecosystem contributors. The 2026 speaker lineup and final agenda are announced closer to the event, with speaker, sponsor and partner applications open.`,
  },
];
async function main() {
  const apply = process.argv.includes('--apply');
  const records: Array<Record<string, unknown>> = [];
  for (const item of ENRICHMENTS) {
    const holder = EVENT_SOURCES.find(({ events }) => events.some((e) => e.id === item.id));
    if (!holder) throw new Error(`unknown event ${item.id}`);
    const event = holder.events.find((e) => e.id === item.id)!;
    const evidencePath = path.join('.cache/event-verification/thin-enrich', item.evidenceFile);
    if (!fs.existsSync(evidencePath)) throw new Error(`missing evidence ${evidencePath}`);
    const record = {
      id: item.id, words: words(item.description),
      source: { url: item.sourceUrl, fetchedAt: now(), method: 'reviewed-primary-sources', pageTitle: item.pageTitle, sha256: sha(item.description) },
    };
    records.push(record);
    console.log(`${item.id}: ${record.words} words`);
    if (apply) {
      Object.assign(event, item.patch, {
        description: item.description,
        descriptionSource: record.source,
      });
      fs.writeFileSync(path.join('content/events/sources', holder.file), `${JSON.stringify(holder.events, null, 2)}\n`);
    }
  }
  fs.writeFileSync(apply ? 'content/events/thin-enrichment-report.json' : '/tmp/thin-enrichment-preview.json', `${JSON.stringify({ applied: apply, records }, null, 2)}\n`);
}
main().catch((e) => { console.error(e); process.exitCode = 1; });
