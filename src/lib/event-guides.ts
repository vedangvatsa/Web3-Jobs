import type { EventEditorialArticle } from "./events";

// Per-event editorial guides keyed by curated slug.
// Facts sourced from each event's official website / organizer announcements.
export const EVENT_GUIDES: Record<string, EventEditorialArticle> = {

  unbw: {
    summaryLead:
      "UN Blockchain Week spans September 10 to 19 across New York City, deliberately scheduled inside UN General Assembly week and New York Fashion Week. Rather than one conference, it is a series: a flagship two-day UN Blockchain Week Conference, an AI and blockchain summit, a fashion-tech summit timed to NYFW, a space-economy event called SpaceDAO and Orbital Finance, and an investment summit in Washington, with more than one hundred side events threaded throughout.",
    sections: [
      {
        heading: "The format",
        content: [
          "The anchor conference covers Bitcoin, artificial intelligence, energy, and the space economy, with government officials, mission-driven organizations, and investors in town for UNGA week. The AI x Blockchain Summit digs into autonomous agents, decentralized compute markets, and verification for machine-generated content. The NYFW Fashion-Tech Summit explores digital identity, luxury authentication, and NFT applications with fashion-industry participants rather than crypto-native ones, and SpaceDAO brings satellite operators and orbital-economy founders into conversation with token economists.",
          "That breadth divides opinion; generalists get an unusual cross-section, while single-topic specialists should pick their days carefully and treat the rest as networking time.",
        ],
      },
      {
        heading: "Navigating UNGA week",
        content: [
          "When the United Nations is in session, Manhattan changes: security perimeters close streets around Midtown East, hotel rates triple, and movement slows to a crawl during motorcades. Book accommodation near your priority venues rather than cheapest-available, use the subway instead of cars, and expect Secret Service-level delays on the East Side.",
          "The upside is density. Delegations, foundations, and Fortune 500 executives are all in town, which is exactly why the organizers anchor to UNGA; the formal agenda matters less than the rooms it puts you in.",
        ],
      },
      {
        heading: "Choosing your days",
        content: [
          "With events spanning ten days, serial attendance burns out even seasoned conference-goers. The flagship UN Blockchain Week Conference draws the broadest audience, AI x Blockchain pulls technical builders and researchers, Fashion-Tech attracts brand and luxury-industry people, and SpaceDAO remains the nicheiest but most memorable for its genuinely unusual speaker mix.",
          "September New York weather cooperates, but UNGA security means subway commutes beat cars decisively, hotels require booking months ahead for sane rates, and restaurant reservations around Midtown become strategic assets. Build each day around one anchor meeting location and let everything else orbit it.",
                  "The UN-week anchoring produces speaker access unavailable at any other blockchain event. Diplomats, multilateral organization representatives, sovereign development funds, and government delegations populate sessions examining blockchain applications in development finance, digital public infrastructure, remittance corridors for developing economies, and credentialing systems. For teams building solutions targeting emerging-market governments or international organizations, these rooms concentrate buyers who otherwise require months of diplomatic scheduling. The fashion-tech and space tracks extend reach into industries where blockchain penetration remains early, offering first-mover networking to consumer brands exploring digital product passports and aerospace companies evaluating satellite-data monetization through tokenized markets.",
                  "Ticketing operates per-event rather than as a single pass, so build your week deliberately from the official calendar. New York hotel minimums during UNGA week run three to four times normal rates, making early booking the highest-ROI decision of the entire trip.",
                  "Comfortable shoes matter more than business cards here; UNGA-week security perimeters turn five-minute taxi rides into thirty-minute walks with pleasing regularity throughout Manhattan.",
        ],
      },
    ],
  },

  ethtokyo: {
    summaryLead:
      "ETHGlobal Tokyo runs September 25 to 27, bringing the standard ETHGlobal hackathon format to Japan: team formation on Friday night, forty-eight hours of building with mentors from major protocols circulating continuously, project submissions Sunday afternoon, and judging across ecosystem prize tracks.",
    sections: [
      {
        heading: "What to expect",
        content: [
          "ETHGlobal hackathons compress the entire builder lifecycle into a weekend. Sponsors post bounties with specific technical criteria, mentors review code in progress rather than finished decks, and demos are judged as working software. Tokyo's edition draws from Japan's strong indie developer scene, university clubs, and international hackers who plan Asia trips around the event, producing a participant mix that is genuinely global rather than regionally captive.",
          "Pragma Tokyo, ETHGlobal's one-day technical conference, runs adjacent on September 26 for people who prefer talks to hacking, covering protocol internals, security practices, and ecosystem roadmaps with the same practitioner-first curation the hackathon applies to mentors.",
        ],
      },
      {
        heading: "Why it matters for builders",
        content: [
          "A finished ETHGlobal project remains the fastest credential in the industry: grant programs, accelerators, and hiring managers treat judged hackathon output as evidence of execution. Tokyo adds a specific opportunity layer, since Japanese companies evaluating Web3 engineers and contractors attend precisely to meet demonstrated builders.",
          "Registration is free with limited capacity and historically oversubscribed, so apply early on the official ETHGlobal page. Venues sit central enough that teams usually work late on site; Tokyo's transit stops around midnight, so choose accommodation accordingly for the final push.",
        ],
      },
      {
        heading: "Building in the Japanese market",
        content: [
          "Japanese corporate attendees observe hackathon finals specifically to identify engineers and teams worth hiring or funding, making project quality a direct career asset. Past participants report interview requests within days of strong finishes, and several Japan-focused accelerators scout exclusively at ETHGlobal events.",
          "Tokyo accommodation near the venue books quickly during conference season; Shinjuku and Shibuya bases balance cost against commute. Convenience-store culture sustains overnight hacking admirably, September humidity persists outdoors, and team formation happens Friday night promptly, so arrive rested rather than treating Thursday as travel day.",
                  "Pragma Tokyo, running September 26 within the same venue ecosystem, complements the hackathon with single-track technical curation: protocol researchers presenting recent results, Japanese enterprise builders describing production deployments, and cross-border panels addressing Japan-specific topics like exchange-listed token standards and payment regulations. Hackathon participants move between both formats freely, and many do, attending morning Pragma sessions before afternoon building blocks. Japanese corporate sponsorship runs deep across both events, with banks, conglomerates, and gaming publishers hosting booths that signal hiring interest more than marketing intent. Students from Tokyo University laboratories and technical colleges attend in force, reflecting Japan's academic blockchain research tradition.",
                  "ETHGlobal hackathons are free with application-based admission, and Tokyo's edition receives applicants globally, so submit early and prepare a GitHub worth reviewing. Pragma passes sell separately for talk-focused attendees who prefer structured learning to weekend building marathons.",
                  "Bring adapters for Japanese outlets, register for both hackathon and Pragma if undecided since crossover is permitted, and remember team formation rewards showing up Friday rested rather than jetlagged.",
                  "Tokyo's Ginza and Yurakucho districts surround typical venues with endless dinner options, and hackathon teams traditionally celebrate Sunday demos together regardless of prize outcomes.",
        ],
      },
    ],
  },


  cardanosummit: {
    summaryLead:
      "Cardano Summit arrives in Singapore on October 5 and 6, bringing Input Output Global, EMURGO, and the Cardano Foundation together with stake pool operators, dApp teams, and the wider community for the ecosystem's annual gathering.",
    sections: [
      {
        heading: "Research-driven and community-run",
        content: [
          "Cardano's development culture is academic: peer-reviewed protocol upgrades, formal verification of critical components, and methodical rollout schedules feature heavily in the program. Summit sessions typically pair IOG researchers explaining design decisions with the operators who ran them live on mainnet, a format that rewards attendees who want engineering substance over roadmap theater.",
          "Governance now dominates much of the conversation following Cardano's transition to community-controlled treasury spending, and the summit is where delegates, DReps, and ecosystem projects coordinate in person about allocating one of crypto's larger treasuries.",
        ],
      },
      {
        heading: "Singapore fit",
        content: [
          "Hosting in Singapore matches the ecosystem's institutional ambitions. The city-state's licensing regime under MAS, its concentration of family offices, and its role as Southeast Asia's corporate hub give Cardano's enterprise and payments narratives a credible backdrop, and regional SPOs and projects use the summit for the year's most efficient coordination window.",
          "The venue connects easily to Changi Airport and the Marina Bay hotel stock, though book early if TOKEN2049 week extensions overlap your stay; Singapore fills fast whenever major crypto events cluster. Side events tend toward workshops and community dinners rather than mega-parties, consistent with the ecosystem's style.",
        ],
      },
      {
        heading: "Governance era focus",
        content: [
          "Cardano's transition to on-chain governance represents one of crypto's largest experiments in community treasury management, and summit sessions examine outcomes candidly: proposal approval patterns, delegation dynamics, and funded-project accountability. DReps, the delegated representatives voting on proposals, hold in-person coordination meetings that observers consistently rate among the summit's most substantive sessions.",
          "Singapore's Marina Bay setting provides the polished institutional backdrop Cardano's enterprise partnerships warrant, with Changi airport consistently rated the world's best for smooth arrivals. Side events lean educational rather than celebratory, reflecting ecosystem culture, and hawker-center dinners offer world-class food at prices that make extended stays painless.",
                  "Singapore's summit hosting aligns with Cardano's APAC institutional strategy. The region accounts for substantial Cardano staking participation and development activity, with Vietnamese, Japanese, and Indonesian communities historically prominent among stake pool operators. Summit programming acknowledges this geography: APAC-focused sessions address regional remittance applications, agricultural traceability pilots in Southeast Asian supply chains, and partnerships with regional payment providers. Technical workshops cover Plutus smart contract development and the Haskell functional programming foundations it builds on, reflecting Cardano's deliberate engineering culture. Community-run side events, often organized by regional SPOs, provide informal settings where the ecosystem's famously engaged retail community interacts directly with IOG and Foundation leadership.",
                  "Summit tickets include community tiers priced accessibly consistent with ecosystem values, and past editions streamed keynotes live for remote participation. Singapore's hawker centers near Marina Bay provide legendary meals at trivial cost between sessions, a genuine logistical advantage over Western venues.",
                  "Cardano community channels publish summit side-event calendars independently of the Foundation, and these grassroots gatherings often deliver the year's most substantive ecosystem coordination in informal settings.",
                  "Recordings of main sessions publish through Cardano's official channels afterward, though the community coordination happening between sessions remains firmly an in-person dividend.",
        ],
      },
    ],
  },

  suibasecamp: {
    summaryLead:
      "Sui Basecamp lands in Singapore on October 7 and 8, timed against TOKEN2049 week, and is the annual gathering for builders working in Move on Sui: object-model applications, consumer products, gaming, and DeFi built on Mysten Labs' high-throughput stack.",
    sections: [
      {
        heading: "Move ecosystem showcase",
        content: [
          "Basecamp is where Sui's technical direction meets its builders. Technical sessions go deep on the object-centric data model, parallel transaction execution, zkLogin onboarding, and sponsored transactions, delivered by Mysten engineers alongside the application teams shipping on top. The ecosystem has leaned visibly into consumer products that reach normal users, and Basecamp's demos reflect that bias toward usable apps over infrastructure maximalism.",
          "For teams deciding between Move ecosystems, the summit doubles as a comparison session: Sui's distinctions from Aptos, its tooling maturity, and its grants processes are all laid out by practitioners rather than documentation.",
        ],
      },
      {
        heading: "Strategic timing",
        content: [
          "Sharing dates with TOKEN2049 changes the calculus: the global investor and founder crowd is already in Singapore, so Basecamp draws a seniority level unusual for a single-chain event. Several teams run joint side events, and the practical play is anchoring your TOKEN2049 week around whichever ecosystem sessions matter to your stack.",
          "Marina Bay accommodation peaks in price that week regardless of which event you attend; book immediately upon registration confirmation and prefer MRT-accessible lodging over proximity-only choices.",
        ],
      },
      {
        heading: "Sui technical direction",
        content: [
          "Mysten Labs engineers typically unveil protocol roadmap milestones at Basecamp, covering parallel execution advances, Move language evolution, and object-model refinements. Application teams present consumer products with real user metrics, from gaming titles to payment apps, reflecting Sui's positioning as a consumer-first chain rather than DeFi maximalism.",
          "zkLogin deserves particular attention from onboarding-focused teams; it lets users sign in with familiar web credentials while maintaining self-custody, and production implementations have matured noticeably between editions. Singapore co-location with TOKEN2049 means ecosystem houses and joint side events multiply networking density beyond the official program alone.",
                  "Sui Basecamp editions have become announcement vehicles for the ecosystem's consumer-app momentum. Gaming studios built on Sui demonstrate live titles with player counts, payment applications show transaction throughput handling real commerce, and social applications present engagement metrics challenging assumptions about crypto user acquisition. The Move programming language community maintains visible presence, comparing Sui's object-model innovations against Aptos's parallel approaches with the friendly rivalry of sibling ecosystems sharing lineage from Meta's abandoned Diem project. Developers new to Move find workshop tracks assuming general programming literacy rather than prior blockchain experience, lowering entry barriers that older ecosystems accumulated over years of layered complexity.",
                  "Basecamp attendance includes substantial TOKEN2049-week crossover, so expect senior distribution and plan meetings against the larger Singapore calendar rather than treating it as a standalone single-chain event. Official announcements arrive via Sui Foundation channels weeks before doors.",
                  "Move developers new to Sui should complete official tutorials beforehand since workshop pacing assumes them, and Singapore's Marina Bay transit links make TOKEN2049 crossover attendance logistically painless despite separate registrations.",
                  "Sui Foundation staff coordinate grant-office-hours during Basecamp, and builders arriving with working demo repositories historically secured follow-up conversations that outlasted conference week considerably.",
        ],
      },
    ],
  },

  swell: {
    summaryLead:
      "Ripple Swell comes to New York City on October 27 to 29, the annual gathering for Ripple's institutional network: banks, payment providers, remittance companies, and financial institutions working on cross-border settlement, RLUSD stablecoin rails, custody, and the XRP Ledger.",
    sections: [
      {
        heading: "Institutional by design",
        content: [
          "Swell is where Ripple announces enterprise partnerships and product direction, typically including adoption metrics for RLUSD, new payment corridors, custody wins, and XRP Ledger capability releases such as AMM and tokenization features. Keynotes feature Ripple leadership alongside bank executives and regulators willing to discuss digital-asset policy on the record.",
          "The audience composition separates Swell from crypto-native conferences: regional banks exploring settlement modernization, remittance operators managing corridor costs, fintech product leads, and policymakers outnumber retail traders substantially. Conversations run toward integration timelines, counterparty risk, and compliance posture rather than price.",
        ],
      },
      {
        heading: "Developer and ecosystem track",
        content: [
          "Alongside the main program, XRPL developer sessions cover ledger features, tooling, and grants for teams building on the ledger, making Swell a rare moment when the XRPL community gathers physically at scale.",
          "New York hosting aligns with the heart of US institutional activity, and late-October slots mean competing events are plentiful; plan meeting calendars early. Venue details and pass tiers release through Ripple's official events page, and passes historically tier upward as the date approaches.",
        ],
      },
      {
        heading: "XRP Ledger ecosystem gathering",
        content: [
          "Beyond Ripple's corporate announcements, Swell convenes the XRPL developer community at scale: validator operators, AMM liquidity providers, and teams building on ledger-native features like issued currencies and decentralized exchange functionality. Developer track sessions cover tooling maturation, EVM-compatible sidechain developments, and grants programs supporting ledger-native projects.",
          "New York late October can swing from mild to raw, so pack layers for harbor breezes. Institutional attendees often combine Swell with bank meetings across the city, compressing quarterly travel into one trip. Venue announcements release through Ripple's official events page, with early-registration pricing rewarding prompt action.",
                  "Swell's rotating history through Dubai, Amsterdam, Las Vegas, and beyond means each edition calibrates to regional institutional priorities, and the NYC return reflects American market reopening under clarified federal regulation. Ripple's US expansion, including RLUSD issuance under NYDFS trust oversight and institutional custody acquisitions, features prominently in expected programming. XRP Ledger sessions attract a distinct developer demographic: financial infrastructure engineers valuing ledger determinism, low fees, and more than a decade of uninterrupted operation over smart-contract expressiveness. Cross-border corridor case studies quantify outcomes rigorously, with participating banks presenting transfer-cost reductions measured across millions of transactions rather than pilot-scale demonstrations.",
                  "Ripple announces Swell programming through its official events page and executive social channels in phases, with institutional partner reveals clustering near the date. XRP Ledger developers should watch for dedicated workshop registrations separate from general admission, which cap independently.",
                  "RippleNet customers receive dedicated programming tracks, and XRP Ledger community awards presented at Swell recognize the volunteer contributors maintaining infrastructure that financial institutions ultimately depend upon daily.",
                  "Bring questions about RLUSD reserve transparency, corridor economics, and custody integration specifics; Swell's institutional speakers answer operational questions with unusual directness for executives of their seniority.",
                  "Attendees combining Swell with New York's overlapping institutional calendar should anchor their schedules around Ripple's official programming first, since corridor-partner announcements historically cluster there.",
        ],
      },
    ],
  },

  smartcon: {
    summaryLead:
      "Chainlink SmartCon takes place October 28 and 29, gathering the oracle network's ecosystem: DeFi protocols consuming price feeds, enterprises piloting CCIP cross-chain messaging, capital-markets institutions working with Chainlink infrastructure, and the developer community integrating data streams and automation.",
    sections: [
      {
        heading: "Oracles became infrastructure",
        content: [
          "SmartCon has evolved from a DeFi-niche meetup into an event where banks and market-infrastructure firms announce tokenization pilots built on Chainlink services. Recent editions have featured SWIFT collaboration milestones, asset-manager NAV data delivery, proof-of-reserves implementations, and cross-chain settlement demonstrations that would have sounded theoretical three years earlier.",
          "Technical tracks serve two audiences: DeFi developers integrating feeds, functions, and VRF, and enterprise engineers evaluating CCIP for interbank messaging patterns. Both tracks are taught by Chainlink Labs engineers and ecosystem integrators who own the code paths involved.",
        ],
      },
      {
        heading: "What to prepare",
        content: [
          "For teams deciding on oracle architecture or cross-chain messaging, SmartCon compresses vendor comparison into days: the people maintaining alternative approaches attend, and hallway debate is informed and blunt. Bring specific integration questions; office-hours-style access to solutions engineers is a quiet highlight.",
          "Venue and pass details release through the official chain.link events page, with early tiers selling through quickly given the breadth of the Data Provider and institutional sponsor presence. Budget an extra day for sponsor-hosted workshops that typically follow the main program.",
        ],
      },
      {
        heading: "Chainlink integration deep-dives",
        content: [
          "Solutions engineers host office-hours formats where teams bring actual integration code for review, covering feed consumption patterns, Functions request architecture, VRF randomness implementation, and CCIP message lifecycle management. Bring repository access rather than slideware; the engineers answering are the ones committing to the repositories.",
          "Data-provider booths let teams compare market-data vendors directly, and enterprise pilots announced on stage translate into partnership opportunities for adjacent service providers. Early-bird tiers sell quickly given Chainlink's broad ecosystem reach, and sponsor-hosted workshops following main programming often contain the deepest technical content of the week.",
                  "Chainlink's positioning as neutral infrastructure makes SmartCon unusually multi-chain in character. Sessions span Ethereum L2s consuming feeds, banking-message experiments connecting traditional rails, and alternative L1 integrations, reflecting the oracle layer's role beneath chain rivalries. Low-latency data stream products bringing market data on-chain receive particular attention from trading firms entering on-chain markets, and cross-chain messaging sessions address institutional requirements like private transactions and compliance controls that public messaging protocols historically lacked. Attendance skews senior accordingly: infrastructure decision-makers evaluating dependencies their systems will rely on for years choose SmartCon over promotional alternatives, and hallway debate runs informed accordingly.",
                  "Chainlink's ecosystem scale makes SmartCon one of few events where oracle integration questions get answered by protocol maintainers directly rather than developer-relations intermediaries. Workshop registrations open separately from general passes and fill faster, so register for both simultaneously when purchasing.",
                  "Chainlink's hackathon-adjacent workshops award prizes for integration quality, and past participants describe office-hours access as worth the trip alone given how rarely oracle engineers surface publicly elsewhere.",
                  "Register early through chain.link's official events page, watch for the data-provider workshop add-ons released separately, and budget a buffer day since sponsor deep-dives extend past main programming.",
                  "First-time attendees consistently report the hallway-track density surprised them; Chainlink's ecosystem spans enough industries that random encounters frequently turn into the week's most valuable conversations.",
        ],
      },
    ],
  },



  cosmoverse: {
    summaryLead:
      "Cosmoverse, the Cosmos ecosystem's flagship conference, arrives at the Grand Hyatt in Hong Kong on November 5 and 6, gathering appchain teams, validators, interchain infrastructure builders, and the researchers stewarding IBC, the busiest interoperability protocol in production.",
    sections: [
      {
        heading: "The appchain thesis, live",
        content: [
          "Cosmos articulated sovereign-application-chain design years before modularity became industry vocabulary, and Cosmoverse remains where that thesis gets evaluated honestly: IBC usage statistics, shared-security economics, liquid staking dynamics, consumer-chain performance reviews, and the governance battles that come with real decentralization. Speakers include the core contributors who maintain CometBFT, the SDK, and IBC itself, plus teams running the highest-volume appchains.",
          "Hong Kong hosting sharpens the institutional angle. The city's licensed-crypto regime actively courts issuers and trading platforms, and Cosmos-based infrastructure increasingly appears in those licensing conversations, giving this edition a finance-layer texture previous editions in other cities did not have.",
        ],
      },
      {
        heading: "Workshops and participation",
        content: [
          "Hands-on workshops cover building with CosmWasm, deploying rollapps and appchains, and integrating IBC v2, taught by maintainers rather than advocates. Validator and delegate communities hold governance caucuses around the event, and side events lean technical rather than promotional.",
          "Grand Hyatt Hong Kong sits on the harbour in Wan Chai with direct MTR access and the convention district's hotel stock nearby. November is Hong Kong's best weather month; flights from regional hubs are frequent, and visa arrangements differ sharply by nationality for mainland-connected travel, so verify requirements early.",
        ],
      },
      {
        heading: "Interchain governance in person",
        content: [
          "Cosmos governance debates carry real consequences: shared-security parameter changes, hub spending decisions, and IBC upgrades all pass through community processes that Cosmoverse convenes physically. Validator operators and large delegators hold side caucuses whose outcomes shape on-chain votes in subsequent weeks, making attendance strategically relevant beyond content consumption.",
          "Grand Hyatt Hong Kong places attendees above the Wan Chai harbourfront with MRT access beneath the building. Hong Kong's November climate is the year's finest, dry days in the mid-twenties Celsius, and Victoria Peak hikes before morning sessions become a tradition among regulars. Regional flights converge efficiently on HKG from every Asian hub.",
                  "Cosmos's technological contributions understate its market visibility, and Cosmoverse serves as corrective education. IBC carries billions in monthly cross-chain transfers across dozens of connected zones, CometBFT consensus powers chains far beyond Cosmos branding, and interchain security lets consumer chains rent validator security from the ATOM-staked set. Sessions quantify these contributions with usage data rarely surfaced elsewhere. Hong Kong hosting adds regulatory relevance: the city's licensed exchanges evaluate Cosmos-based infrastructure for custody and settlement products, and previous Cosmoverse editions attracted fund managers seeking appchain-thesis exposure through liquid staking derivatives and MEV infrastructure plays rather than direct token accumulation alone.",
                  "Cosmoverse tickets historically include workshop access tiers, and hands-on sessions require separate capacity reservations once the schedule publishes. Hong Kong's Grand Hyatt books out for conference dates quickly, though Wan Chai and Causeway Bay alternatives keep commutes under fifteen minutes.",
                  "Cosmoverse recordings publish free afterward like Devcon content, reinforcing attendance-as-access philosophy, and Hong Kong's harbourfront setting gives interchain discussions a fittingly global backdrop each morning and evening.",
                  "Interchain Foundation staff distribute governance participation guides at registration, and first-time attendees benefit from the validator-hosted orientation sessions scheduled before main programming begins each morning.",
        ],
      },
    ],
  },

  labitconf: {
    summaryLead:
      "LABITCONF, organized by La Bitconf and running since 2013, brings Latin America's longest-running Bitcoin and crypto conference to Mexico City on November 5 and 6. It remains the region's reference event, anchored less by sponsor budgets than by the fact that Latin American crypto usage is driven by necessity: inflation, remittance costs, and banking exclusion that public chains address directly.",
    sections: [
      {
        heading: "LATAM's Bitcoin hub",
        content: [
          "Latin American crypto needs skew practical. Dollar access under volatile local currencies, remittance corridors where fees eat single-digit percentages, merchant payments where card penetration is thin, and savings products that survive currency crises are the region's actual product requirements, and LABITCONF's programming reflects them: Lightning payment deployments, stablecoin off-ramp infrastructure, Bitcoin custody for ordinary households, and regulatory comparisons across Argentine, Mexican, Brazilian, and Central American regimes.",
          "El Salvador's legal-tender experiment and its aftermath receive sustained attention given the country's regional significance, typically with participants close to the policy process.",
        ],
      },
      {
        heading: "Language and logistics",
        content: [
          "Spanish dominates proceedings with English interpretation available on principal stages, and the networking floor is founder-dense relative to investor count, mirroring the region's bootstrap culture. Deals happen in Spanish over tacos; arriving with Portuguese or Spanish capability, or a trusted local partner, changes results materially.",
          "Mexico City sits at 2,240 meters altitude, and November offers its driest, mildest weather. Polanco and Roma Norte provide the safest accommodation bases with the richest restaurant scene, and Uber operates reliably. Verify visa requirements by nationality; Mexico maintains liberal transit policies but rules shift.",
        ],
      },
      {
        heading: "Regional regulatory environment",
        content: [
          "Latin American crypto regulation diverges sharply by country: Brazil's centralized framework under its central bank contrasts with Argentina's liberal-but-unstable environment, Mexico's conservative banking posture, and El Salvador's Bitcoin-law experiment. LABITCONF panels feature regulators and advisors from multiple jurisdictions explaining trajectories, making it efficient regulatory intelligence for any team operating regionally.",
          "Spanish-language content dominates with interpretation available on principal stages, and the founder-heavy crowd keeps exhibition halls functional rather than decorative. Mexico City's CDMX airport connects the Americas comprehensively, Polanco hotels place attendees near evening venues, and street-food standards between meetings are legitimately world-class.",
                  "La Bitconf's longevity provides perspective younger conferences lack. Founded when Latin American Bitcoin adoption meant Argentina's early communities and Mexican payment experiments, it has documented the region's complete cycle: exchange builds, banking crackdowns, El Salvador's legal-tender gamble, stablecoin dollarization displacing weak local currencies, and institutional re-entry as global crypto politics shifted. Founders gain longitudinal understanding unavailable through news coverage: which remittance products survived corridor economics, which custody approaches survived exchange failures, which regulatory relationships endured political transitions. Buenos Aires and Mexico City communities alternate strong representation, reflecting Spanish-speaking LATAM's twin poles, with Brazilian participation growing steadily despite language differences.",
                  "Bilingual badges indicate Spanish or English delivery on each session, and interpretation quality has improved notably across recent editions. Mexico City's CDMX airport handles North and South American connections comprehensively, and rideshare apps operate reliably between Polanco, Roma, and venue districts.",
                  "Bitcoin's cultural primacy in Latin America shapes LABITCONF's character distinctly from multisig-chain events, with mining economics, self-custody workshops, and Lightning merchant deployments receiving sustained technical attention across editions.",
        ],
      },
    ],
  },

  ethmumbai: {
    summaryLead:
      "ETHGlobal Mumbai runs November 6 to 8, immediately following India Blockchain Week in the same city, applying the classic ETHGlobal hackathon format to one of the largest developer populations on Earth: team formation Friday night, weekend-long building with protocol mentors on the floor, and judged demos Sunday.",
    sections: [
      {
        heading: "Where India builds",
        content: [
          "Indian hackathon turnouts routinely set records, and the talent pipeline feeding them runs through colleges, Devfolio-hosted fellowships, and a maturing grants ecosystem. Sponsor tracks tune to Indian use cases: payments that assume UPI competition, identity at population scale, and consumer products priced for rupee realities, with judges drawn from core protocol teams and Indian-founded protocols alike.",
          "International teams benefit too. Recruiting engineers, sourcing outsourcing partners, and testing market-entry hypotheses all happen faster in a hackathon hall than through job boards and consulting engagements; the density of demonstrably skilled builders per square meter is the attraction.",
        ],
      },
      {
        heading: "Stacking the week",
        content: [
          "With Devcon finishing in Mumbai on November 6 and ETHGlobal beginning the same day, the city becomes the center of the Ethereum world for roughly ten days spanning India Blockchain Week. International visitors commonly chain Devcon, IBW side events, and the hackathon into one trip; accommodation near the venue sells through earliest, so reserve immediately upon registration.",
          "Participation is free and capacity-limited via the official ETHGlobal page. Mumbai transit rewards patience; the Metro helps, and December-adjacent November weather is the city at its most workable.",
        ],
      },
      {
        heading: "Indian builder ecosystem",
        content: [
          "India produces millions of engineering graduates annually, and its Web3 subset has matured from outsourcing destination to origin market: Indian-founded protocols raise global rounds, Indian audit firms serve international clients, and Indian consumer apps ship to worldwide audiences. ETHGlobal Mumbai captures that inflection point, with judges increasingly drawn from successful Indian founding teams rather than visiting dignitaries alone.",
          "Team formation Friday night follows ETHGlobal tradition, and Indian collegiate turnout creates energy few hackathons match. Devfolio's platform manages applications, and prior participants recommend forming partial teams beforehand while remaining open to local additions, since complementary skill-pairings emerge organically on site.",
                  "Mumbai's hosting completes an extraordinary fortnight for Indian Ethereum: Devcon concludes November 6, ETHGlobal Mumbai begins the same day, and India Blockchain Week programming surrounds both. International visitors should plan visa validity covering the full window, book accommodation early given simultaneous demand, and budget recovery time for the city's intensity. Judging emphasizes shipped code with verifiable contracts over presentation polish, reflecting ETHGlobal's global rubrics applied consistently across locations. Prize categories typically span DeFi infrastructure, consumer applications, public goods funding mechanisms, and India-specific tracks addressing UPI integration patterns and rupee-denominated stablecoin use cases unique to the market.",
                  "Applications open through ETHGlobal's platform with Indian collegiate applicants receiving dedicated review consideration, and team-formation channels activate weeks before doors. Mumbai local trains overwhelm newcomers; the Metro lines and app-based cabs cover venue approaches more manageably for international visitors.",
                  "ETHGlobal Mumbai's venue capacity fills through rolling application review rather than first-come admission, rewarding early, thoughtful submissions describing building experience honestly over last-minute generic entries.",
                  "Mumbai's Metro Line 3 expansions improved airport-to-BKC transit markedly, and participants flying internationally should confirm e-visa processing times early given India's variable approval windows.",
        ],
      },
    ],
  },


  binancebw: {
    summaryLead:
      "Binance Blockchain Week closes out the year in Bangkok on November 28 and 29, bringing the world's largest exchange's leadership, ecosystem partners, and user community together for two days of keynotes, panels, and workshops at one of the industry's most attended single-company events.",
    sections: [
      {
        heading: "Scale and distribution",
        content: [
          "Binance events function simultaneously as product showcases and community celebrations. Announcements typically span exchange features, Web3 wallet strategy, BNB Chain ecosystem developments, and regulatory milestones across the jurisdictions where Binance holds licenses, delivered with the confidence of a platform whose user base numbers in the hundreds of millions.",
          "The attendee profile differs from developer conferences: serious retail traders, regional exchange staff, payment partners, and projects courting listings and launchpad opportunities dominate. For teams seeking distribution in Asian retail markets, few rooms offer equivalent reach; equally, the event is a poor fit for pure research audiences.",
        ],
      },
      {
        heading: "Bangkok returns",
        content: [
          "Thailand hosted previous editions to large crowds, backed by a government that has actively courted digital-asset business through licensing and tourism-linked pilot programs. Bangkok's event infrastructure, hotel depth, and global flight connectivity make it a low-friction destination, and late-November weather is dry and mild.",
          "Passes sell through quickly given Binance's distribution muscle; register via the official Binance Blockchain Week site and watch the official channels for side-event calendars, which fill fast around the main program.",
        ],
      },
      {
        heading: "BNB Chain and beyond",
        content: [
          "While Binance's exchange dominates attention, Blockchain Week programming dedicates significant space to BNB Chain ecosystem development: opBNB layer-two performance metrics, Greenfield storage adoption, and the incubation programs feeding new projects into the ecosystem. Builder-track sessions connect teams directly with Binance Labs investment staff and launchpad consideration processes.",
          "Bangkok's Queen Sirikit National Convention Center or similar major venues typically host, with riverside and Sukhumvit hotels offering convenient bases. Thai visa exemptions cover many nationalities for thirty-day stays, the BTS handles venue access cleanly, and November's dry season makes post-event beach extensions to Phuket or Koh Samui a common decompression ritual.",
                  "Binance Blockchain Week's Bangkok edition continues the exchange's practice of rotating flagship events through strategically significant jurisdictions. Thailand's digital asset licensing regime, among Southeast Asia's earliest, hosts multiple licensed platforms and active retail participation. Programming typically includes executive keynotes addressing global regulatory developments, regional market deep-dives covering Southeast Asian growth metrics, and BNB Chain technical updates spanning opBNB layer-two performance and Greenfield storage adoption. Attendee badges skew toward practicing traders and regional business development professionals rather than developers, so technical teams should calibrate expectations and prioritize dedicated builder workshops running parallel to mainstage programming.",
                  "Binance distributes tickets through official channels with early tiers priced for broad accessibility consistent with the exchange's retail base. Side events concentrate around Sukhumvit, and Bangkok's airport rail link keeps thirty-minute arrivals realistic even during late-November traffic peaks.",
                  "Binance typically streams mainstage keynotes live through official channels for remote viewing, though networking floors, regional meetups, and partner lounges remain firmly in-person value propositions.",
                  "BNB Chain builder sessions require separate workshop registration from general admission, and past attendees recommend securing both immediately since developer-track capacity fills fastest among all ticket types.",
        ],
      },
    ],
  },

  ethindia: {
    summaryLead:
      "ETHIndia, South Asia's largest Ethereum hackathon, runs December 4 to 6 in Bengaluru, closing the year's Indian conference season with thousands of builders competing across ecosystem tracks under the Devfolio and ETHGlobal banner.",
    expectedAttendance: "2,000+ developers",
    sections: [
      {
        heading: "The pipeline event",
        content: [
          "ETHIndia sits atop the Devfolio-run hackathon pyramid that funnels Indian students and early-career engineers into protocol ecosystems. Sponsor bounties double as recruitment pipelines, judges arrive from core protocol teams, and a meaningful share of India's Web3 founding teams trace their origins to a past edition's team formation. For protocols building India strategy, the event is the annual touchpoint where the community's newest cohort appears.",
          "Competition intensity is the defining feature: winning teams clear a bar comparable to global ETHGlobal events, and mentor-to-participant ratios ensure reviewed code rather than aspirational demos.",
        ],
      },
      {
        heading: "Bengaluru in December",
        content: [
          "Bengaluru, India's tech capital, supplies the deepest engineering talent pool in the country, and December delivers its mildest weather, making the hackathon's overnight stretches humane. The venue ecosystem includes side events, workshops, and career fairs extending beyond the hacking floor, and the surrounding week typically accumulates community meetups across Koramangala and Indiranagar.",
          "Registration is free with capacity managed through the official ethindia.co page, and applications historically exceed seats substantially, so apply when windows open. International visitors connecting onward from Devcon Mumbai will find frequent short flights between the two cities.",
        ],
      },
      {
        heading: "From hackathon to career",
        content: [
          "ETHIndia alumni occupy positions across the industry's leading companies and protocols, and the event functions as annual evidence that India's builder pipeline compounds yearly. Sponsor booths operate as recruitment floors with structured interview corners, and Devfolio's fellowship programs recruit from participant pools directly.",
          "Bengaluru's Kempegowda airport connects internationally, Namma Metro construction continues improving venue access, and December's mild climate makes outdoor queueing tolerable. Applications exceed capacity substantially every cycle, so submit when windows open, prepare a GitHub profile worth reviewing, and treat unfinished side projects as portfolio liabilities rather than assets.",
                  "Devfolio's stewardship gives ETHIndia distinctive continuity. Beyond the annual flagship, Devfolio operates fellowship programs, seasonal hackathon circuits, and grant infrastructure sustaining Indian builder engagement year-round, meaning participants enter structured pipelines rather than one-off events. Sponsor participation reflects strategic patience: foundations and protocols measure multi-year returns from Indian ecosystem investment, accepting longer horizons than conventional marketing metrics capture. Bengaluru's collegiate ecosystem supplies volunteer energy larger conferences cannot hire, and alumni frequently return as mentors, creating mentorship density unusual for events of this scale. First-time sponsors consistently underestimate application volume; capacity lessons from prior editions inform current caps.",
                  "ETHIndia applications typically open in autumn with rolling review, and acceptance notifications arrive with sponsor-track details. Bengaluru's December evenings turn pleasantly cool, unusual for India, making outdoor side events genuinely comfortable rather than merely tolerable between hacking sessions.",
                  "Devfolio publishes acceptance statistics and sponsor catalogs after each edition, transparency that helps applicants calibrate expectations, and Bengaluru's airport connects directly to every major Indian city for multi-stop trips.",
                  "Bengaluru's tech-community calendars fill with ETHIndia-adjacent meetups across Indiranagar and Koramangala during event week, extending networking well beyond official hours for visitors staying through weekends.",
        ],
      },
    ],
  },

  mainnet: {
    summaryLead:
      "Messari Mainnet returns to Miami on December 10 to 12, the most research-driven event on the calendar, built around the analysts whose sector theses and year-in-review reports shape institutional crypto narratives heading into the next year.",
    sections: [
      {
        heading: "Analysts at the center",
        content: [
          "Mainnet's programming favors data over promotion. Tokenomics breakdowns, market-structure analysis, and sector arguments are presented by people who publish models publicly and defend them in writing year-round. Messari's Crypto Theses drop in the event's orbit, and being cited, challenged, or interviewed for that document is worth more to most founders than any paid placement elsewhere.",
          "The attendee mix reflects the orientation: funds, data businesses, exchanges' research desks, and founders with real metrics. The implicit dress code is spreadsheet fluency; presentations that would pass at marketing-led conferences get fact-checked live here, which is precisely its appeal to people tired of narrative-first programming.",
        ],
      },
      {
        heading: "Miami in December",
        content: [
          "Miami in December is dry, warm, and at the peak of its conference desirability, so book accommodation early despite the city's abundant inventory. Mainnet's venue programming concentrates daytime interaction effectively, while South Beach and Wynwood host the dinner circuit.",
          "Passes tier through messari.events official channels, with analyst-tier access admitting you to the smaller research sessions where much of Mainnet's reputation is actually earned. For teams with proprietary data worth publishing, schedule analyst meetings in advance; walk-up pitches to Messari researchers rarely land the same way.",
        ],
      },
      {
        heading: "Research-first attendance strategy",
        content: [
          "Messari analysts publish sector theses year-round, and Mainnet sessions extend those documents into live argument. Reading relevant Messari research before attending transforms panel participation from passive listening to engaged challenge, which analysts visibly appreciate and reward with deeper engagement.",
          "Miami's December conference cluster means hotel competition extends beyond Mainnet itself, so book immediately upon registration. South Beach venues maximize evening atmosphere while Brickell locations suit finance-focused attendees; shuttle logistics vary accordingly. Analyst one-on-one meetings require advance scheduling through official channels, and bringing proprietary datasets earns measurably better conversations than generic introductions.",
                  "Mainnet's Miami tenure coincided with the city's emergence as America's crypto-financial nexus, hosting fund headquarters, exchange offices, and the venture community's crypto practices. December timing captures year-end allocation discussions, positioning Mainnet strategically within institutional calendars despite competition from adjacent Miami events. Messari's own evolution shapes programming: beyond research publications, the company's data products and API services serve professional analysts whose feedback loops inform curation. Speakers routinely debut annual reviews, sector outlooks, and methodology papers knowing the audience includes peers best positioned to stress-test claims, creating accountability dynamics rarer at marketing-oriented gatherings.",
                  "Mainnet pass tiers gate analyst-session access separately from general programming, and Messari community members receive presale windows announced through research newsletters. Miami International connects Latin American capitals directly, fitting the event's hemispheric attendee draw each December.",
                  "Messari's research analysts publish their Mainnet speaking topics in advance, letting attendees prepare challenges rather than questions, which is precisely the engagement format the event cultivates deliberately.",
                  "Messari community membership includes Mainnet benefits and analyst-access perks year-round, making annual subscriptions cost-effective for funds and founders who attend with genuine research intentions.",
                  "Bring your own dataset or thesis worth stress-testing; Mainnet's culture rewards prepared conviction, and analysts remember founders who engaged substantively long after Miami's December warmth fades.",
        ],
      },
    ],
  },

  consensushk: {
    summaryLead:
      "Consensus lands in Hong Kong on February 10 to 12, 2027, at AsiaWorld-Expo, immediately after Lunar New Year celebrations conclude. CoinDesk's APAC edition carries the flagship brand's policy-heavy, institutionally attended format to the bridge between Chinese capital and global crypto markets.",
    expectedAttendance: "10,000+ attendees",
    sections: [
      {
        heading: "Policy and capital",
        content: [
          "Hong Kong's licensed exchange regime, spot ETF approvals, and stablecoin sandbox make it the natural venue for Consensus's Asian institutional programming: SFC-adjacent regulators, exchange leadership, tokenization desks at global banks, and APAC allocators across three days of programming. The February slot catches regional funds planning first-quarter deployments, and the post-Lunar-New-Year timing has become deliberate, marking the symbolic reopening of Asian markets.",
          "Programming splits between policy tracks where Asian regulatory directions are debated on the record, and capital-markets tracks where tokenized funds, custody architecture, and ETF flows get examined by the operators running them.",
        ],
      },
      {
        heading: "Logistics",
        content: [
          "AsiaWorld-Expo sits adjacent to Hong Kong International Airport on Lantau Island, simplifying arrival-day logistics for international travelers, though staying on Hong Kong Island or in Kowloon puts you nearer evening events at the cost of a longer commute via Airport Express.",
          "February weather is cool and dry by Hong Kong standards, and hotel pricing avoids the extremes of conference-cluster months. Visas vary significantly by nationality for Hong Kong entry, so confirm requirements early; mainland China transit rules are separate and stricter, and should not be conflated with Hong Kong arrangements.",
        ],
      },
      {
        heading: "Post-Lunar-New-Year timing",
        content: [
          "Consensus Hong Kong deliberately follows Lunar New Year, capturing Asian markets' symbolic reopening while avoiding holiday travel dead zones. The slot has proven popular with regional allocators planning first-quarter deployments, and speaker announcements typically land during autumn preceding, with early-bird pricing following soon after.",
          "AsiaWorld-Expo's airport adjacency enables same-day international departures for compressed schedules, though staying on Hong Kong Island preserves evening networking access. February temperatures range cool to mild, ideal conference weather, and the city's world-class transit renders car rental unnecessary. Visa requirements vary sharply across nationalities for Hong Kong entry, so verify early in planning.",
                  "Consensus's Hong Kong edition builds on CoinDesk's established APAC presence and the city's unique intermediary position. Mainland China prohibits crypto trading domestically while Hong Kong courts it institutionally, creating controlled-interface dynamics that make Hong Kong Consensus editions distinctively diplomatic affairs: mainland-adjacent capital participates through Hong Kong structures, international firms maintain China desks, and regulators discuss frameworks acknowledging regional interdependence without conflating jurisdictions. Programming addresses these realities candidly across policy and capital-markets tracks. February delivers reliable winter sunshine, hotel availability improves dramatically following holiday travel peaks, and Airport Express connectivity renders same-day regional departures routine.",
                  "Consensus early-bird pricing follows the pattern of previous editions, releasing months ahead through CoinDesk's official channels with significant step-ups as doors approach. Hong Kong's Octopus card covers Airport Express, MTR, trams, and convenience stores, making expense tracking refreshingly simple.",
                  "CoinDesk's Consensus app coordinates meeting scheduling across the attendee base, and Hong Kong's compact geography makes same-day meetings between Kowloon, Central, and airport-zone venues entirely feasible.",
                  "Consensus's Hong Kong programming typically includes Mandarin and Cantonese interpretation on major tracks alongside English, reflecting the genuinely bicultural audience the city-state bridge position attracts.",
        ],
      },
    ],
  },

  token2049dubai: {
    summaryLead:
      "TOKEN2049 Dubai returns April 21 to 22, 2027, at Madinat Jumeirah, the MENA edition of the industry's most recognized conference brand. Smaller and more institutional than its Singapore sibling, the Dubai event concentrates sovereign wealth funds, VARA-regulated businesses, family offices, and exchanges building Middle East strategies, with larger average check sizes per meeting than almost any other conference.",
    sections: [
      {
        heading: "Institutional Dubai",
        content: [
          "Dubai's proposition is regulatory certainty plus capital proximity: VARA's licensing framework gave exchanges, custodians, and fund managers a durable legal home, and ADGM offers a common-law alternative next door in Abu Dhabi. TOKEN2049 Dubai assembles that ecosystem annually, with sovereign-adjacent funds, free-zone regulators, and MENA exchange leadership participating in both public programming and closed-door briefings.",
          "The side-event economy skews formal: yacht receptions, desert dinners, and regulator briefings replace Singapore's warehouse raves. Pitching here rewards revenue-and-custody narratives over token-economics theatrics; the allocator profile expects institutional packaging.",
        ],
      },
      {
        heading: "April logistics",
        content: [
          "Late April sits at the edge of Dubai's comfortable season, with temperatures climbing toward summer; schedule outdoor evening events accordingly and hydrate. Madinat Jumeirah's resort complex hosts the conference in a purpose-built conference estate on the coast, connected by abra waterways and shaded walkways.",
          "Hotels within Madinat and neighboring Al Sufouh properties command premium rates during conference week; Downtown and Marina bases cut costs at the expense of commute time through Dubai's traffic. Flights via DXB connect everywhere, and visas on arrival cover a broad list of nationalities, though verify current terms for your passport.",
        ],
      },
      {
        heading: "Dubai's regulatory advantage",
        content: [
          "VARA, Dubai's Virtual Assets Regulatory Authority, built licensing frameworks covering exchanges, custodians, and marketing activities with unusual specificity, and ADGM offers a common-law alternative nearby in Abu Dhabi. TOKEN2049 Dubai gathers licensed operators, regulator representatives, and applicants mid-process, making it efficient intelligence for any team pursuing MENA authorization.",
          "Family offices and sovereign-adjacent funds participate actively, and pitch expectations differ markedly from Western conferences: revenue documentation, custody arrangements, and institutional packaging outweigh token-economics narratives. April temperatures climb toward summer, so prioritize shaded and indoor evening venues, hydrate constantly, and book Madinat-area accommodation immediately upon confirming attendance since resort inventory moves fastest.",
                  "TOKEN2049 Dubai's Madinat Jumeirah setting creates a self-contained conference city: waterways connect venue clusters, shaded walkways ease April heat, and resort hotels eliminate commute friction entirely for guests staying on property. The intimacy contrasts intentionally with Singapore's urban sprawl, concentrating the MENA edition's institutional character. Previous Dubai editions sold out substantially in advance, with VIP tiers disappearing first given allocator demand for hosted lounges. Side-event culture splits between corporate receptions in DIFC towers, desert experiences requiring dedicated transportation, and marina charters, each catering to distinct attendee tribes. Secure main-program passes before allocating side-event budgets, reversing Singapore's typical prioritization.",
                  "TOKEN2049 Dubai closes the spring conference season with the industry regathering after Q1 reporting cycles, and its Madinat Jumeirah format consistently produces the highest meeting-quality-per-hour of any MENA crypto event.",
                  "Register through token2049.com official channels only, verify side-event invitations independently, and plan April hydration seriously; Gulf conference weeks reward preparation over improvisation every single time. Past Dubai editions drew MENA ministry observers alongside fund managers, giving even hallway conversations policy texture rare anywhere else in the regional conference circuit, and the April timing consistently delivers Dubai before summer heat arrives.",
        ],
      },
    ],
  },

  'signal-week': {
    summaryLead:
      "Signal Week succeeds Paris Blockchain Week as Europe's premier institutional digital-assets forum, convening July 6 to 7, 2027 at the Palais des Congrès in Paris. The conference brings together European policymakers, banking executives, sovereign and private fund managers, and leading protocol architects focused on MiCA-era market structure, digital asset custody, institutional settlement, and real-world asset tokenization.",
    expectedAttendance: "5,000+ institutional and industry attendees across Europe",
    sections: [
      {
        heading: "From Paris Blockchain Week to Signal Week",
        content: [
          "After seven editions as Paris Blockchain Week, the organizers repositioned the franchise as Signal Week for 2027, keeping Paris as the European center while moving to the expanded facilities of the Palais des Congrès de Paris at Porte Maillot.",
          "The rebrand reflects the industry's shift from retail narrative cycles to institutional signals: production stablecoin deployments, wholesale central bank digital currency pilots, and compliant decentralized finance execution.",
          "Use the official Signal Week site for ticket registrations and program announcements; legacy parisblockchainweek.com pages redirect attendees to the July 2027 dates.",
        ],
      },
      {
        heading: "Program focus and market structure",
        content: [
          "Programming prioritizes the European Union's Markets in Crypto-Assets (MiCA) regulation, institutional custody architecture, tokenized debt, and on-chain capital markets.",
          "Panels feature compliance directors from tier-one global banks, European Securities and Markets Authority (ESMA) observers, and protocol builders demonstrating institutional-grade settlement layers.",
        ],
      },
      {
        heading: "Venue and Paris logistics",
        content: [
          "Palais des Congrès de Paris (Porte Maillot, 75017 Paris) offers direct access via Paris Métro Line 1 and RER C. Paris in early July is vibrant and heavily booked, making early hotel reservations essential near the 17th arrondissement or along the central transit corridor.",
          "Bring government-issued photo identification matching your registration name, as security accreditation checkpoints for institutional forums enforce strict verification at door check-in.",
        ],
      },
      {
        heading: "Networking and side events",
        content: [
          "Satellite events, investor dinners, and community breakfasts run across central Paris throughout the conference week, spanning venues from Le Marais to the 8th arrondissement.",
          "Attendees should coordinate meeting agendas via the official event portal early and independently verify RSVP confirmations for private side receptions.",
        ],
      },
    ],
  },
  // Legacy slug alias for older /pbw links while the live page is signal-week.
  pbw: {
    summaryLead:
      "Signal Week succeeds Paris Blockchain Week as Europe's premier institutional digital-assets forum, convening July 6 to 7, 2027 at the Palais des Congrès in Paris. The conference brings together European policymakers, banking executives, sovereign and private fund managers, and leading protocol architects focused on MiCA-era market structure, digital asset custody, institutional settlement, and real-world asset tokenization.",
    expectedAttendance: "5,000+ institutional and industry attendees across Europe",
    sections: [
      {
        heading: "From Paris Blockchain Week to Signal Week",
        content: [
          "After seven editions as Paris Blockchain Week, the organizers repositioned the franchise as Signal Week for 2027, keeping Paris as the European center while moving to the expanded facilities of the Palais des Congrès de Paris at Porte Maillot.",
          "The rebrand reflects the industry's shift from retail narrative cycles to institutional signals: production stablecoin deployments, wholesale central bank digital currency pilots, and compliant decentralized finance execution.",
          "Use the official Signal Week site for ticket registrations and program announcements; legacy parisblockchainweek.com pages redirect attendees to the July 2027 dates.",
        ],
      },
      {
        heading: "Program focus and market structure",
        content: [
          "Programming prioritizes the European Union's Markets in Crypto-Assets (MiCA) regulation, institutional custody architecture, tokenized debt, and on-chain capital markets.",
          "Panels feature compliance directors from tier-one global banks, European Securities and Markets Authority (ESMA) observers, and protocol builders demonstrating institutional-grade settlement layers.",
        ],
      },
      {
        heading: "Venue and Paris logistics",
        content: [
          "Palais des Congrès de Paris (Porte Maillot, 75017 Paris) offers direct access via Paris Métro Line 1 and RER C. Paris in early July is vibrant and heavily booked, making early hotel reservations essential near the 17th arrondissement or along the central transit corridor.",
          "Bring government-issued photo identification matching your registration name, as security accreditation checkpoints for institutional forums enforce strict verification at door check-in.",
        ],
      },
      {
        heading: "Networking and side events",
        content: [
          "Satellite events, investor dinners, and community breakfasts run across central Paris throughout the conference week, spanning venues from Le Marais to the 8th arrondissement.",
          "Attendees should coordinate meeting agendas via the official event portal early and independently verify RSVP confirmations for private side receptions.",
        ],
      },
    ],
  },

  ethcc: {
    summaryLead:
      "EthCC (Ethereum Community Conference) is Europe's largest annual community-run Ethereum event, organized by the non-profit Ethereum France. Relocating to the Palais des Festivals in Cannes for its 10th edition, EthCC is renowned for prioritizing technical depth, open-source governance, and non-commercial developer talks over promotional sales pitches. More than 5,000 core developers, cryptographers, and protocol architects attend alongside hundreds of decentralized side events.",
    expectedAttendance: "5,000+ Ethereum builders, researchers, and core devs",
    sections: [
      {
        heading: "Community-first technical programming",
        content: [
          "Since its inception in Paris, EthCC has stood apart by rejecting hyper-commercial sponsor keynotes in favor of peer-reviewed technical sessions. All stages are recorded and made freely available immediately to the global Ethereum community. Talks cover protocol upgrades, execution clients, consensus engineering, zero-knowledge rollups, account abstraction, and cryptoeconomic design.",
          "Ticket sales support educational initiatives and open-source grants through Ethereum France, reinforcing the non-profit ethos that underpins the entire gathering.",
        ],
      },
      {
        heading: "The Cannes venue and Côte d'Azur logistics",
        content: [
          "Hosted at the world-famous Palais des Festivals on the Cannes Croisette, EthCC provides auditorium seating, sea-facing networking terraces, and purpose-built presentation stages. The venue sits adjacent to the Cannes railway station (Gare de Cannes), with frequent high-speed TGV connections to Paris and regional TER trains connecting to Nice Côte d'Azur International Airport (NCE) in just 30 minutes.",
          "Accommodation in Cannes ranges from seaside hotels along Boulevard de la Croisette to apartments in Le Suquet and the city center, all within walking distance of the venue.",
        ],
      },
      {
        heading: "Layer 2 scaling, ZK proofs, and decentralization",
        content: [
          "EthCC stages are traditionally where Ethereum core developers debate roadmap milestones, from data availability sampling and statelessness to post-quantum cryptography. Founders and researchers from Arbitrum, Optimism, zkSync, Starknet, Base, and Ethereum Foundation researchers routinely debut research papers and protocol updates here.",
          "The hall discussions between sessions are where cross-client benchmarks are debated and multi-rollup interoperability standards are agreed upon.",
        ],
      },
      {
        heading: "Decentralized side events and hacker houses",
        content: [
          "The week surrounding EthCC features over 200 independently organized side events: DeFi summits, ZK hackdays, MEV researcher brunches, and developer unconferences. Rather than being confined to the main venue, participants move between coastal villas, yachts, and beach venues for intimate networking.",
        ],
      },
    ],
  },

  ethdam: {
    summaryLead:
      "ETHDam returns to Pakhuis de Zwijger in Amsterdam as the Netherlands' flagship Ethereum hackathon and conference, hosted annually by CryptoCanal. The event has carved out a distinct identity by focusing intensely on privacy-preserving technologies, zero-knowledge proofs, security auditing, and decentralized artificial intelligence, attracting European and global cypherpunks and cryptographers.",
    expectedAttendance: "1,000+ privacy researchers, cryptographers, and EVM engineers",
    sections: [
      {
        heading: "Privacy, security, and cypherpunk ethos",
        content: [
          "In an era of rising compliance and surveillance, ETHDam is passionately dedicated to privacy as a fundamental human right. Talks and hackathon bounties highlight privacy pools, stealth addresses, zero-knowledge state proofs, and confidential smart contracts.",
          "CryptoCanal, the grassroots education and community organization behind ETHDam, maintains a strictly vetted, builder-first atmosphere where open debate and cypherpunk ideals are celebrated.",
        ],
      },
      {
        heading: "The Pakhuis de Zwijger venue experience",
        content: [
          "Pakhuis de Zwijger is a former refrigerated warehouse on Amsterdam's Eastern Docklands (Oostelijke Handelskade) converted into a multi-story cultural and debate center. With brick industrial architecture, multiple theater auditoriums, and canal-side outdoor decks, it offers one of the most distinctive event atmospheres in Europe.",
          "The venue is easily accessed via Tram 26 from Amsterdam Centraal Station (a 7-minute ride to the Kattenburgerstraat stop) or a scenic 15-minute bike ride along the IJ waterfront.",
        ],
      },
      {
        heading: "The 48-hour builder hackathon",
        content: [
          "Half of the ETHDam venue is dedicated to the hackathon floor, where developers, cryptographers, and UI designers build prototypes over 48 hours. Bounties from major privacy networks and Ethereum protocols reward functional tools that preserve user autonomy and resist censorship.",
        ],
      },
    ],
  },

  ethprague: {
    summaryLead:
      "ETHPrague gathers builders, cryptographers, and protocol researchers at Prague's historic Municipal House (Obecní dům) for three days of conference talks, workshops, and intensive hacking. Positioned deliberately as a cypherpunk unconference and hackathon, ETHPrague explores the frontiers of Ethereum scalability, censorship resistance, localism, and cryptographic primitives without corporate sponsorship noise.",
    expectedAttendance: "1,500+ builders, cryptographers, and researchers",
    sections: [
      {
        heading: "Prague's cypherpunk heritage",
        content: [
          "Prague has deep historical roots in digital privacy and cypherpunk counterculture, being the home of the world's first Bitcoin mining pool (Slush Pool), the first hardware wallet (Trezor), and Paralelní Polis, the famous crypto-anarchy cultural center. ETHPrague honors that lineage with an agenda focused uncompromisingly on freedom technology, privacy, and censorship resistance.",
          "Speakers avoid sales pitches; instead, presentations emphasize cryptographic proofs, decentralized governance failures, and practical mechanisms for surviving state-level network disruptions.",
        ],
      },
      {
        heading: "The Municipal House setting & venue logistics",
        content: [
          "Obecní dům is one of Prague's most celebrated Art Nouveau architectural treasures, located right in the center of the Old Town (Staré Město) next to the Powder Tower. Attendees hack and collaborate beneath ornate frescoed ceilings, stained glass, and marble colonnades, creating a surreal juxtaposition of new cryptography within 20th-century architectural elegance.",
          "The Náměstí Republiky metro station (Line B) is directly outside, connecting quickly to Prague's main train station (Hlavní nádraží) and Václav Havel Airport via transit.",
        ],
      },
      {
        heading: "Builder hackathon and technical deep dives",
        content: [
          "ETHPrague runs a competitive 48-hour hackathon alongside the main stages, with teams building tools for zero-knowledge privacy, decentralized identity, and autonomous coordination. Mentors from across the European Ethereum ecosystem provide round-the-clock guidance.",
          "Prague's affordability, world-class public transit, and walkable historic center make it one of the favorite stops on the European hacker circuit.",
        ],
      },
    ],
  },

  jbw: {
    summaryLead:
      "Japan Blockchain Week is the country's most comprehensive annual Web3 celebration, spanning multiple cities from Tokyo to Kyoto. Originating with Non Fungible Tokyo in 2018 and now bringing together thousands of builders, gaming conglomerates, exchanges, and community projects, JBW connects the global crypto industry directly with Japan's unique regulatory frameworks, corporate IP owners, and passionate builder communities.",
    expectedAttendance: "15,000+ participants across nationwide events",
    sections: [
      {
        heading: "National reach and multi-city structure",
        content: [
          "Unlike standard single-venue conferences, Japan Blockchain Week spans a fortnight across Tokyo and Kyoto, anchored by the Japan Blockchain Week Summit, WebX, and dozens of decentralized community gatherings. Participants can experience high-level regulatory forums in Tokyo's financial core followed by cultural and builder meetups in historic Kyoto.",
          "The schedule accommodates international visitors with simultaneous English interpretation on main stages and dedicated international networking zones.",
        ],
      },
      {
        heading: "IP, entertainment, and gaming conglomerates",
        content: [
          "Japan holds some of the world's most recognizable consumer entertainment IP. JBW serves as the launchpad where Japanese gaming giants, anime studios, and mainstream consumer brands present their Web3 strategies, from on-chain gaming economies to fan loyalty tokens.",
          "Meetings with Japanese corporate partners reward early scheduling and formal introductions; bring translated executive summaries and printed business cards.",
        ],
      },
      {
        heading: "Japanese regulatory clarity & institutional rails",
        content: [
          "Japan's Financial Services Agency (FSA) established one of the world's most rigorous yet clear regulatory frameworks for digital assets and stablecoins. JBW provides direct access to licensed domestic exchanges, trust banks, and regulatory compliance specialists navigating the Japanese market.",
        ],
      },
    ],
  },

  abw: {
    summaryLead:
      "Australian Blockchain Week is the official annual national summit organized by industry body Blockchain Australia, gathering policymakers, banking executives, institutional custodians, and top Web3 founders across Sydney and Melbourne. As Australia develops its digital asset licensing regime and CBDC pilot projects, ABW serves as the primary stage where policy meets on-chain innovation.",
    expectedAttendance: "3,500+ institutional attendees and builders",
    sections: [
      {
        heading: "Regulatory momentum and the Treasury roadmap",
        content: [
          "The Australian Treasury and ASIC are actively developing tailored digital asset platform licensing regimes. ABW convenes federal regulators, senators, and industry participants to debate legislation, custody requirements, and consumer protections directly.",
          "For international projects seeking APAC distribution, Australia offers deep domestic institutional superannuation capital and a highly crypto-literate retail population.",
        ],
      },
      {
        heading: "Institutional digital assets and banking integration",
        content: [
          "Australian banks and payments networks are pioneers in tokenized deposit pilots, real-world asset trials, and stablecoin settlements. Panels highlight bank-grade security, enterprise compliance, and institutional DeFi integration.",
        ],
      },
    ],
  },






  ethkl: {
    summaryLead:
      "ETHKL (Ethereum Kuala Lumpur) is Malaysia's flagship community-led Ethereum conference and hackathon, establishing a vital developer hub in Southeast Asia. Supported by the Ethereum Foundation and local builder collectives, ETHKL unites regional engineers, students, and founders for technical workshops, zero-knowledge masterclasses, and decentralized project showcases.",
    expectedAttendance: "1,000+ Southeast Asian developers and students",
    sections: [
      {
        heading: "Southeast Asia's emerging developer hub",
        content: [
          "Malaysia is rapidly emerging as a crypto-forward nation in Southeast Asia with active university blockchain chapters and progressive digital economy initiatives. ETHKL provides a welcoming entry point for regional talent into the global Ethereum ecosystem.",
        ],
      },
    ],
  },
  un: {
    summaryLead:
      "UN Blockchain Week runs September 10 to 19 across New York City, timed to overlap with the UN General Assembly and New York Fashion Week. It is organized as a series rather than a single conference, with tracks covering Bitcoin and money, AI agents, the space economy, energy, identity, and a fashion-tech summit tied to NYFW. The site lists General Admission at $399 and a VIP pass at $1,499 that includes the Washington Elite Investment Summit and Gala on September 18 at Gallery MC. The organizers describe it as an independent initiative with no UN affiliation.",
    ticketPricing: "General Admission $399 / VIP Pass $1,499 (includes Sept 18 gala)",
    speakers: "Brock Pierce, Vit Jedlicka, Michael Terpin, Hugh Dugan, Lou Kerner, Karla Ballard, Alex Lightman, Jimmy Nguyen",
    expectedAttendance: "1,000+ visionaries (per ticket page)",
    sections: [
      {
        heading: "A series, not a single conference",
        content: [
          "The week bundles several distinct programs under one banner. The site lists a flagship two-day conference, an AI and blockchain summit, a fashion-tech summit timed to NYFW, space economy programming under the SpaceDAO name, and the Washington Elite Investment Summit and Gala. Focus areas named on the page are Bitcoin and money, autonomous AI agents, orbital assets, fashion and technology, energy markets, and decentralized identity.",
          "General Admission covers public events, panels, and runways across the ten days, according to the ticket bullets. The gala and investment summit are reserved for VIP pass holders. Visitors with a narrow interest should pick the days matching their track rather than attending end to end.",
        ],
      },
      {
        heading: "Tickets and the gala",
        content: [
          "General Admission is listed at $399 and includes panels, runways, networking, the live calendar of side events, and a digital pass with recordings. The $1,499 VIP pass adds the September 18 summit and gala, a premium lounge, priority seating, a swag bag, photo opportunities, and private after-parties and investor dinners. Both tiers check out through Stripe.",
          "The gala takes place September 18 at Gallery MC, 549 West 52nd Street, and the page describes it as a black-tie evening with investors, officials, and fashion figures. Since the gala is the priciest single component of the week, buyers who only want the conference days can stop at General Admission.",
        ],
      },
      {
        heading: "Getting around during UNGA week",
        content: [
          "The event calendar runs on Luma and is updated through the week, with side events, panels, runways, and networking nights across the city. The listed contact address is 26 Broadway in Manhattan, and the organizers note the program is an independent initiative with no UN affiliation. Booking lodging early is standard advice for this week, when delegations fill Midtown hotels.",
          "Subway travel beats cars during General Assembly week, when motorcades slow Midtown traffic. Evening programming spreads beyond the main venues, so grouping meetings by neighborhood keeps days workable. Anyone needing a visa invitation should use the dedicated page on the official site.",
        ],
      },
    ],
  },
  sui: {
    summaryLead:
      "Sui Basecamp runs October 7 and 8 at Marina Bay Sands in Singapore, staged alongside TOKEN2049. The site prices a standard pass at $299 with a $229 rate available until September 30, covering both days of talks, workshops, and expo areas. Programming runs across four areas, the Summit Stage, the X Stage, the AI Builder Lab, and the SUIG Arena, with product reveals and hands-on demos promised. Listed speakers include Mysten Labs CEO Evan Cheng, CPO Adeniyi Abiodun, chief cryptographer Kostas Chalkias, and Real Vision CEO Raoul Pal. Registration runs through the event Luma page.",
    ticketPricing: "$229 until Sept 30, then $299",
    speakers: "Evan Cheng, Adeniyi Abiodun, Kostas Chalkias, Raoul Pal, Richard Socher, Hilmar Veigar Petursson",
    sections: [
      {
        heading: "Co-located with TOKEN2049",
        content: [
          "Basecamp shares its dates and venue with TOKEN2049 week, placing the Sui community gathering inside Singapore's biggest crypto fortnight. The FAQ confirms October 7 and 8 at Marina Bay Sands, with badge pickup starting October 6. A standard pass covers both days including presentations, workshops, expo areas, and official evening events.",
          "Registration goes through Luma rather than a native checkout. The discounted $229 rate holds until September 30 before the $299 full price applies. Press passes are handled by email, and a limited number of invite-only travel grants are available for ecosystem builders.",
        ],
      },
      {
        heading: "Stages and the TPS record attempt",
        content: [
          "The program runs across the Summit Stage for keynotes and reveals, the X Stage for demos and AMAs, the AI Builder Lab for hands-on workshops, and the SUIG Arena for DeFi programming. The framing is agentic finance, with instant settlement, autonomous payments, stable dollars, and post-quantum security named as themes. Product launches are promised before the rest of the world hears about them.",
          "Day one includes a live throughput experiment aiming to repeat a July test the site says pushed past 6 million transactions per second. Visitors can guess the final figure for SUI prizes of 10,000, 5,000, and 1,000 for the three closest entries. A linked blog post documents the July run.",
        ],
      },
      {
        heading: "Speakers and track record",
        content: [
          "Mysten Labs leadership anchors the list, with CEO Evan Cheng, CPO Adeniyi Abiodun, president Kevin Boon, and chief cryptographer Kostas Chalkias all named. Outside voices include Real Vision's Raoul Pal and Jamie Coutts, Google DeepMind's Alexandre Moufarek, You.com's Richard Socher, Grayscale's Zach Pandl, and Circle's Matt Stafford, alongside ecosystem founders. A speaker application form remains open.",
          "The page cites the 2025 edition as a baseline, with more than 80 sessions, 2,000 attendees, 100 speakers, 30 sponsors, and representation from more than 90 countries and 1,000 companies. Recordings from that year are linked. Practical notes cover the SG Arrival Card requirement, Bayfront MRT access to halls D and E, and visa-free entry for most nationalities.",
        ],
      },
    ],
  },
  "ripple-swell-2026": {
    summaryLead:
      "Ripple Swell runs October 27 to 29 in New York City at The Shed, 545 West 30th Street. The site describes it as Ripple's annual event and says the 2026 edition combines the Swell and Apex conferences for the first time, with tracks on payments, stablecoins, tokenization, policy, and the XRP Ledger. Listed figures are 1,500 attendees, more than 80 sessions, more than 100 speakers, and three stages. Announced keynote speakers are Water.org co-founder Matt Damon and Bullish chairman and CEO Tom Farley. Passes are tiered from a $600 Super Early Bird to a $1,500 Last Chance rate.",
    ticketPricing: "Super Early Bird $600 / Early Bird $1,000 / Standard $1,200 / Last Chance $1,500",
    speakers: "Matt Damon (Water.org co-founder), Tom Farley (Bullish chairman and CEO)",
    expectedAttendance: "1,500+ attendees, 80+ sessions, 100+ speakers, 3 stages",
    sections: [
      {
        heading: "Swell and Apex combined",
        content: [
          "The 2026 edition merges two Ripple conferences into one experience across multiple programming tracks. The stated theme is the meeting point of traditional finance and the onchain economy, aimed at financial leaders, fintech founders, developers, and researchers. Topic tracks include AI and agentic finance, capital markets and settlement, crypto markets and ETFs, DeFi, interoperability, payments, policy and regulation, stablecoins, tokenization, and XRP utility.",
          "The full agenda is posted on the site with a sessions page to browse. A call for speakers, a hackathon, and an institutional summit run alongside the main program. The audience is grouped into finance leaders, developers, researchers, community members, and press.",
        ],
      },
      {
        heading: "Speakers and scale",
        content: [
          "The two announced keynote speakers are Matt Damon, co-founder of Water.org, and Tom Farley, chairman and CEO of Bullish. The site notes more speaker announcements are coming. A dedicated 2026 speakers page carries the full list as it grows.",
          "The published scale figures are more than 1,500 attendees, more than 80 sessions, more than 100 speakers, and three stages. That makes Swell a mid-sized institutional event rather than a mass expo, with finance, developer, and policy content sharing one venue.",
        ],
      },
      {
        heading: "Tickets and venue",
        content: [
          "Four pricing windows are listed. The Super Early Bird at $600 covered April 22 to May 31, Early Bird at $1,000 ran June 1 to July 11, Standard at $1,200 runs July 12 to October 5, and Last Chance at $1,500 runs October 6 to 20. Registration goes through the official Ripple registration page.",
          "The venue is The Shed in Hudson Yards, with the address given as 545 West 30th Street and a map link on the page. Hotels and travel plus an FAQ page are linked for trip planning. Parties interested in exhibiting go through the partnerships page.",
        ],
      },
    ],
  },
  chainlink: {
    summaryLead:
      "Chainlink SmartCon is Chainlink's annual conference, and the official site currently presents the 2025 edition rather than 2026 details. That edition ran November 4 and 5 at the Metropolitan Pavilion in New York, with recorded talks now posted. The 2025 agenda centered on tokenized funds, stablecoins, cross-chain infrastructure, and bank pilots, with speakers including Chainlink's Sergey Nazarov and guests from Swift, UBS, and Aave Labs. No verified 2026 dates, venue, prices, or speakers appear on the site today, so treat this guide as provisional until organizers publish the next edition.",
    sections: [
      {
        heading: "What the site shows today",
        content: [
          "The SmartCon homepage is a recap of the November 2025 gathering, headlined as a thank-you to attendees. Session recordings are linked through YouTube, and a recap blog plus product announcements for the Runtime Environment, Confidential Compute, and Chainlink Rewards are posted. Navigation covers recordings, speakers, agenda, sponsors, visits, and FAQs for the past edition.",
          "No 2026 edition page, dates, or ticket link appears on the site. The safest reading is that organizers have not yet published the next edition. Anyone planning travel should wait for an official announcement rather than assuming a repeat slot.",
        ],
      },
      {
        heading: "The 2025 program as context",
        content: [
          "The 2025 agenda leaned institutional, with tokenized funds, stablecoin infrastructure, collateral mobility, delivery versus payment, and unified ledgers among the session titles. Bank and market voices appeared throughout, including a Swift keynote, a UBS tokenization session, and a Lido session on adopting CCIP as cross-chain infrastructure. A White House fireside and an Aave Labs fireside with Sergey Nazarov drew attention.",
          "Sponsors listed for 2025 include Swift, Euroclear, Space and Time, Aptos, OKX, Plasma, Polygon, The Graph, and X Layer. That roster signals where the conference sits in the market, at the overlap of banks, market infrastructure, and oracle and interoperability providers.",
        ],
      },
      {
        heading: "Planning for the next edition",
        content: [
          "With no verified 2026 facts on the official pages, there is nothing firm to book around. Past form points to New York in the fall, but that is pattern rather than confirmation and should not be treated as a date. Watch the SmartCon site and Chainlink's official channels for the announcement.",
          "When the next edition posts, check the same details that made 2025 plannable, namely the venue, the dated ticket tiers, and whether main-stage sessions stream. Until then, this guide stays deliberately thin.",
        ],
      },
    ],
  },
  bbw: {
    summaryLead:
      "Binance Blockchain Week runs November 28 and 29 in Bangkok, Thailand, at the Queen Sirikit National Convention Center. The event page calls it a special Asia edition run in partnership with Binance TH. Early-bird tickets are listed at $29 against a full price of $129. The page points to 2025 highlights and past speakers without naming the full 2026 lineup, and it links forms for speaking and sponsorship inquiries. No attendance figure or agenda appears on the page, so visitors should check the official site as the program is published.",
    ticketPricing: "Early-bird $29 (full price $129)",
    sections: [
      {
        heading: "A Bangkok Asia edition",
        content: [
          "The event page places the 2026 edition at the Queen Sirikit National Convention Center on November 28 and 29. It is presented as a special Asia edition in partnership with Binance TH. The page carries 2025 highlights and a previous speakers section for flavor, but the current lineup is not yet named.",
          "Speaking and sponsorship interest go through dedicated 2026 forms linked on the page. That setup suggests the program is still being assembled. Social links are posted for updates as names and sessions land.",
        ],
      },
      {
        heading: "Tickets",
        content: [
          "Early-bird tickets are listed at $29 against a stated full price of $129. Buy-now buttons appear in several spots on the page and lead to the official checkout. The discount framing rewards early commitment, as usual for this series.",
          "No ticket tiers beyond the early-bird and full price appear on the page. What each tier includes is not spelled out in the fetched content, so buyers should read the checkout terms before paying.",
        ],
      },
      {
        heading: "Program status",
        content: [
          "No agenda, session list, or attendance figure appears on the page. The 2025 highlights section is the only programming evidence offered. Visitors deciding between this and neighboring events should wait for the schedule before comparing.",
          "Bangkok in late November is a workable conference season, and the QSNCC is the city's main convention venue. None of that substitutes for a published program, so treat this guide as a placeholder until the organizers post sessions and speakers.",
        ],
      },
    ],
  },
  messari: {
    summaryLead:
      "Messari Mainnet is the 2026 edition of Messari's annual conference. The official site at mainnet.events did not load at research time, returning an error on both the bare and www addresses, so no dates, city, venue, prices, speakers, or attendance figures could be verified from an official page. This guide therefore stays general until the organizers publish details. Readers should confirm timing and location through Messari's own channels before booking travel or lodging. No concrete planning claims follow in the sections below. Check back once the official calendar posts confirmed facts.",
    sections: [
      {
        heading: "Status of the 2026 details",
        content: [
          "The official events page could not be opened during research. Both the bare domain and the www variant failed, one with a not-found status and the other with a transport error. That leaves no verified source for when or where the 2026 edition takes place.",
          "Because no official page could be read, this guide names no dates, venue, prices, speakers, or attendance total. Any third-party listing that fills in those blanks should be treated as unconfirmed until Messari itself publishes them.",
        ],
      },
      {
        heading: "How to track the announcement",
        content: [
          "The reliable path is Messari's own site and events channels. When the edition posts, look for the dates, the venue, the dated ticket tiers, and the refund and transfer terms before spending. Speaker and agenda pages typically follow the initial announcement.",
          "Past Mainnet editions were New York gatherings with institutional programming, but that history does not confirm the 2026 plan. Use it only as background while waiting for the official word.",
        ],
      },
      {
        heading: "Planning without confirmed facts",
        content: [
          "Do not book flights, hotels, or side-event venues around an unconfirmed listing. Hold off on visa paperwork that depends on event dates until the organizers publish them. If budgets must be set now, keep them provisional and cancellable.",
          "Revisit this guide once the official calendar is live. At that point the summary, pricing, speakers, and attendance fields can be filled from the published pages.",
        ],
      },
    ],
  },
  consensus: {
    summaryLead:
      "Consensus Hong Kong runs February 1 to 3, 2027, at the Hong Kong Convention and Exhibition Centre, with the exhibition open February 2 and 3. Produced by CoinDesk, the site says more than 20,000 executives, investors, builders, and policymakers have gathered across its editions since the 2025 debut. The 2027 page projects 10,000 attendees from over 100 countries and cites $87 trillion in assets managed by finance firms present in 2026. Program themes are digital assets at scale, AI adoption across Asian finance, and the agentic economy. Registration and sponsorship links are live on the site.",
    expectedAttendance: "10,000 attendees from 100+ countries",
    sections: [
      {
        heading: "Dates and venue",
        content: [
          "The event runs February 1 to 3, 2027, at the Hong Kong Convention and Exhibition Centre in Wan Chai. The exhibition component opens February 2 and runs through February 3. The page carries the tagline Money Markets Machines and positions the show as a deal-flow destination.",
          "Registration and sponsor pages are open through the site navigation. Travel and FAQ pages are posted for trip planning. The event is supported by the listed Hong Kong partner body shown on the homepage.",
        ],
      },
      {
        heading: "Program themes",
        content: [
          "Three themes anchor the 2027 program. Digital assets at scale covers tokenization of equities and real-world assets, stablecoins as payments infrastructure, and DeFi as a credit and market layer. The AI theme covers quant funds, capital markets use, and enterprise adoption stories from across Asia.",
          "The third theme is the agentic economy, with AI agents described as active market participants that trade, manage portfolios, and create new economic models. Session videos from 2026 on the page include boardroom AI adoption, institutional transformation of finance, and agentic commerce onchain.",
        ],
      },
      {
        heading: "Scale and history",
        content: [
          "The site projects 10,000 attendees from over 100 countries for 2027 and cites $87 trillion in assets managed by finance firms present at the 2026 edition. Across editions since the 2025 debut, it says more than 20,000 people have gathered. Quoted past speakers include Michael Saylor, Amy Oldenburg, and Kevin O'Leary.",
          "The homepage frames Hong Kong as the gateway for global capital into Asian digital assets. With institutions putting tokenization and stablecoins into production, the pitch is that Asia is building rather than waiting. That is the organizer's framing, and the session archive is the best check on substance.",
        ],
      },
    ],
  },
  "consensus-miami": {
    summaryLead:
      "Consensus returns to Miami on May 4 to 6, 2027, at the Miami Beach Convention Center. Produced by CoinDesk, the 2027 page projects more than 15,000 senior leaders from over 100 countries across crypto, finance, technology, and policy. It cites $87 trillion in assets managed by finance firms that gathered at the 2026 edition. Program themes are crypto at scale, institutional integration of tokenized securities and on-chain revenue, and agentic commerce. The site carries session videos from 2026, including a fireside with CZ and a keynote from Michael Saylor, plus registration and sponsorship links.",
    expectedAttendance: "15,000+ attendees from 100+ countries",
    sections: [
      {
        heading: "Return to Miami",
        content: [
          "The 2027 edition runs May 4 to 6 at the Miami Beach Convention Center. The page positions it as the flagship Consensus, where crypto, finance, tech, and policy leaders meet for deals, demos, and decisions. The tagline on the page reads Money Markets Machines.",
          "Registration and sponsor links are live in the navigation, alongside networking, hotels, why-attend, FAQ, and speaker-application pages. The site structure suggests the program and lineup will fill in through those pages as the date nears.",
        ],
      },
      {
        heading: "Program themes",
        content: [
          "Three themes are posted. Crypto at scale addresses infrastructure, policy, and protocol decisions as value moves onchain. Institutional integration covers tokenized securities, real on-chain revenue at B2B firms, and frameworks turning institutional interest into income. Agentic commerce covers AI agents trading, managing portfolios, and forming new economic models.",
          "The 2026 session videos on the page preview the register of the show, with a CZ fireside, a scaling-agentic-commerce panel, a Michael Saylor keynote, and a policy fireside with Chairman Selig. Those recordings are a useful sample of depth and tone.",
        ],
      },
      {
        heading: "Scale and past voices",
        content: [
          "The site projects more than 15,000 attendees from over 100 countries for 2027 and cites $87 trillion in assets managed by finance firms at the 2026 edition. Quoted past participants include Ripple CEO Brad Garlinghouse, Fortune editor Jeff Roberts, and Kevin O'Leary, who is quoted calling the show 18 months ahead of the market.",
          "Top attending companies are shown as logo boards on the page. The overall pitch is deal flow rather than spectacle, with networking pages and experiences listed alongside the stage program. Institutional buyers should weigh the app-driven meeting setup against their own calendars.",
        ],
      },
    ],
  },
  kbw: {
    summaryLead:
      "Korea Blockchain Week centers on September 30 to October 1 in Seoul at Walkerhill Hotels and Resorts, preceded by the invite-only Upbit Institutional Summit on September 29. The site frames the week as three stages with more than 100 sessions and more than 300 speakers, plus more than 300 side events across the city. Listed speaker highlights include Balaji Srinivasan, Hyperliquid CEO Jeff Yan, Arthur Hayes, BitMine chairman Tom Lee, Consensys CEO Joseph Lubin, Upbit CEO Kyoungsuk Oh, Tether USA CEO Bo Hines, and former CFTC commissioner Brian Quintenz. The 2025 edition drew more than 13,000 attendees.",
    speakers: "Balaji Srinivasan, Jeff Yan, Arthur Hayes, Tom Lee, Joseph Lubin, Kyoungsuk Oh, Bo Hines, Brian Quintenz",
    expectedAttendance: "13,000+ attended in 2025; 2026 lists 300+ speakers and 300+ side events",
    sections: [
      {
        heading: "How the week is structured",
        content: [
          "The main conference runs September 30 to October 1 at Walkerhill Hotels and Resorts, with three stages, more than 100 sessions, and more than 300 speakers listed. The Upbit Institutional Summit on September 29 opens the week as an invite-only affair. An agenda page and a side-events page carry the schedules as they are released.",
          "Side events are a major part of the format, with more than 300 listed across Seoul. Institutions, investors, founders, and policymakers host gatherings beyond the main venue. A side-event application form is posted for teams that want to add their own.",
        ],
      },
      {
        heading: "Leadership & Speaker Roster",
        content: [
          "The highlights list mixes crypto founders, fund voices, and policy figures. Balaji Srinivasan appears as a virtual speaker, alongside Hyperliquid CEO Jeff Yan, Maelstrom CIO Arthur Hayes, and BitMine chairman Tom Lee. Consensys founder and CEO Joseph Lubin represents the Ethereum side.",
          "Korean market and policy voices include Upbit CEO Kyoungsuk Oh, Tether USA CEO Bo Hines, and former CFTC commissioner Brian Quintenz. A full speakers page holds the wider roster, and a speaker application form remains open. Last year the event cites more than 340 speakers.",
        ],
      },
      {
        heading: "Scale, lodging, and applications",
        content: [
          "The 2025 highlights cited on the page put attendance above 13,000. For 2026 the published scale markers are the 300-plus speakers and 300-plus side events. Ticket sales run through the official ticketing subdomain linked from the homepage.",
          "The organizers flag official Walkerhill hotel rates with a direct booking link, which matters because the venue sits outside central Seoul. Sponsor, speaker, side-event, and media-pass applications are all posted. The event is produced by FACTBLOCK, described on the page as a Korean ecosystem builder.",
        ],
      },
    ],
  },
  ibw: {
    summaryLead:
      "India Blockchain Week runs November 1 to 2, 2026 at the Fairmont Mumbai for its fourth edition after three years in Bangalore. Hosted by Hashed Emergent, the two-day conference anchors a wider week of hackathons, workshops and side events across the city. The site lists tiered passes from general to executive VIP, with Binance named as title sponsor. Confirmed 2026 speakers include Eli Ben-Sasson of StarkWare, Prabal Banerjee of Avail, and Marcin Kazmierczak of RedStone Oracles, with more names on the official speakers page. The move to Mumbai places the event near financial firms and investors in India's financial capital.",
    ticketPricing: "General INR 1,199, Priority INR 2,799, VIP INR 29,999, Executive VIP INR 59,999, Student INR 999, plus taxes",
    sections: [
      {
        heading: "A move to Mumbai",
        content: [
          "The official site says the 2026 conference takes place November 1 to 2 at the Fairmont Mumbai. It is the fourth edition, after three editions in Bangalore. The organizers frame the move as a step closer to capital and institutions in India's financial capital.",
          "Hashed Emergent is named as host. The conference is described as the two-day flagship inside a wider India Blockchain Week of side events, workshops and networking sessions. The site mentions more than 90 independent side events during the week.",
        ],
      },
      {
        heading: "Passes and pricing",
        content: [
          "The site lists a General pass at INR 1,199, a Priority pass at INR 2,799, a VIP pass at INR 29,999, an Executive VIP pass at INR 59,999 and a Student pass at INR 999. It notes prices exclude taxes and that a code named GANESHA gave 20 percent off General and Priority passes until September 18.",
          "General covers two-day access plus the event app and expo areas. Priority adds lunch and forum eligibility. VIP and Executive VIP add lounge access, dinner and hotel and transfer options. Buy only through links on the official site.",
        ],
      },
      {
        heading: "Who goes and what is set",
        content: [
          "The site breaks past attendance into builders and developers at 30 percent, founders at 22 percent, protocol teams at 18 percent, investors at 15 percent and policy and media making up the rest. The confirmed 2026 speakers are Eli Ben-Sasson (StarkWare), Prabal Banerjee (Avail), Tobias Bauer (TBV), Doug Hsu (CMT Digital), Marcin Kazmierczak (RedStone Oracles), Harshit Tiwari (NEAR Foundation), Chibuotu Amadi (Paycrest), Ronak Jethava (Startale Group), and Abdulfatai Suleiman (Blockradar). The official speakers page also lists people who spoke in earlier editions.",
          "Binance is named as title sponsor for 2026. Speaker and sponsor applications run through forms linked on the site. A travel and visa guide for Mumbai is also linked for visitors from abroad.",
        ],
      },
    ],
  },
  devcon: {
    summaryLead:
      "Devcon 8 runs November 3 to 6, 2026 at the Jio World Centre in Bandra Kurla Complex, Mumbai. Organized by the Ethereum Foundation, it spans four days of talks, workshops, coworking and community-led hubs. The site lists general admission from 499 dollars via ETH and 999 dollars via fiat, plus reduced community and application-based tiers, all including 18 percent GST. Tracks include core protocol, security, privacy and governance. The travel guide notes the overlap with Diwali season and urges early hotel booking near the venue. Ticket sales began with an ETH-only early bird wave followed by additional waves in July.",
    ticketPricing: "General Admission from $499 via ETH and $999 via fiat, Community from $149, Applications from $25, includes 18 percent GST",
    sections: [
      {
        heading: "Venue and dates",
        content: [
          "The official site names Mumbai, India and November 3 to 6, 2026. The venue is the Jio World Centre at G Block, Bandra Kurla Complex in Mumbai. The event is presented as Devcon 8 India, the Ethereum Foundation's annual developer conference.",
          "The format mixes talks, workshops, coworking, art and community hubs. Community hubs are described as community-led spaces built around a set topic. Volunteer applications for this edition are listed as closed.",
        ],
      },
      {
        heading: "Tickets",
        content: [
          "The site lists General Admission in sale waves, priced at 499 dollars when paid in ETH and 999 dollars when paid in fiat. Community discounts start from 149 dollars and application-based discounts start from 25 dollars. All prices are shown as including 18 percent GST.",
          "General tickets are anon-friendly with a limit of two per order and are transferable. Discounted tickets must be claimed by the attendee and are not transferable. Indian resident discounts are verified through the ticket shop.",
        ],
      },
      {
        heading: "Program and trip notes",
        content: [
          "Listed tracks include Core Protocol, Privacy and Consent, Security, Futures Worth Building, Users Builders and Agents, Rights Freedoms and Governance, Applied Cryptography, Permissionless Networks and Open and Verifiable Stack. Speaker applications and supporter applications are linked on the site.",
          "The travel guide notes a welcome booth at the airport and metro access near the venue. It warns that Devcon overlaps Diwali season and advises booking lodging early. Past speaker names shown on the site include Vitalik Buterin, Aya Miyaguchi and Justin Drake.",
        ],
      },
    ],
  },
  devconnect: {
    summaryLead:
      "Devconnect is the Ethereum Foundation's community gathering built around independent events rather than a single main stage. The current site recaps the 2025 edition in Buenos Aires, held November 17 to 22 at La Rural in Palermo, with more than 14,000 attendees from over 130 countries. It lists over 80 exhibiting teams across eight districts and more than 500 community events around the city. No dates or host city for a 2026 edition are published on the official site. Travelers should check devconnect.org for updates before making travel plans this year.",
    expectedAttendance: "14,000+ attendees from 130+ countries (2025 edition)",
    sections: [
      {
        heading: "What Devconnect is",
        content: [
          "The site describes the Buenos Aires event as the first Ethereum World's Fair, with districts for DeFi, privacy, L2s, social, hardware and wallets, AI, gaming and art. More than 40 events took place inside La Rural, with over 500 community-run events across the city.",
          "Support came from more than 200 volunteers. Recordings from many 2025 sessions are linked as playlists. No 2026 host city or dates are shown on the homepage.",
        ],
      },
      {
        heading: "Scale in 2025",
        content: [
          "The site reports more than 14,000 attendees from more than 130 countries at the 2025 edition. It lists more than 80 exhibitors and more than 40 indoor events. These figures describe the past edition only.",
          "For 2026, the site gives no ticket prices, no speaker list and no attendance target. Readers should not rely on third-party dates until the organizers publish them.",
        ],
      },
      {
        heading: "Planning note",
        content: [
          "Since no 2026 details are published, the practical step is to watch devconnect.org for an announcement. Past editions rotated cities, with Istanbul in 2023 and Amsterdam in 2022 also linked.",
          "Anyone booking travel now should treat timing and location as unconfirmed. Pricing is listed on the official site when announced.",
        ],
      },
    ],
  },
  "bitcoin-amsterdam": {
    summaryLead:
      "Bitcoin Amsterdam runs November 5 to 6, 2026 at the Sugarfactory in Halfweg, near Amsterdam. The site lists a two-day conference pass at 197 euros and a Whale pass at 2121 euros, with a 5 percent discount for bitcoin payment. Programming centers on Bitcoin as money, mining, policy and financial infrastructure, with stages, an expo and side events. Past speakers named on the site include Jack Mallers, Adam Back, Elizabeth Stark and Edward Snowden. The venue address is listed as Kristalpromenade 7 in the Netherlands. A Bitcoin for Corporations symposium is linked as a companion program for attendees.",
    ticketPricing: "Two-day pass EUR 197, Whale pass EUR 2121, 5 percent off when paid in bitcoin",
    speakers: "Previous speakers include Jack Mallers, Adam Back, Elizabeth Stark, Edward Snowden, Pierre Rochard and Obi Nwosu",
    sections: [
      {
        heading: "Dates and venue",
        content: [
          "The site gives November 5 to 6, 2026 and names the Sugarfactory as venue. The contact address is listed as Kristalpromenade 7, Halfweg in the Netherlands. The event is presented as a two-day Bitcoin conference with stages and an expo.",
          "A Bitcoin for Corporations symposium in Amsterdam is linked alongside the main program. Travel, press, sponsor and FAQ pages are linked from the main nav.",
        ],
      },
      {
        heading: "Tickets",
        content: [
          "The site lists a two-day conference pass at 197 euros covering stages, keynotes, panels and the expo. A Whale pass is listed at 2121 euros with access to a curated lounge, a second stage, Whale Night and side events. Both offer 5 percent off when paid in bitcoin.",
          "Sales run through linked euro and bitcoin checkout pages. The site notes a price increase timer but gives no future price on the fetched page. Check the tickets page before paying.",
        ],
      },
      {
        heading: "Speakers and focus",
        content: [
          "The site labels its speaker lists as previous speakers. Names shown include Jack Mallers of Strike, Adam Back of Blockstream, Elizabeth Stark of Lightning Labs, Edward Snowden, Pierre Rochard and Obi Nwosu of Fedi.",
          "The agenda focus is Bitcoin growth, technical work and policy in Europe. Speaker applications run through an apply page. No attendance figure is published on the fetched page.",
        ],
      },
    ],
  },
  edcon: {
    summaryLead:
      "EDCON runs October 17 to 18, 2026 in Kuala Lumpur. The Community Ethereum Development Conference describes itself as a nonprofit annual gathering for Ethereum builders, researchers and community members. The site lists open applications for sponsors, community side events, speakers and volunteers, with tickets linked through Luma. Geode Labs is named as strategic partner. Past editions listed run from Paris in 2017 through Tokyo in 2024 and Osaka in 2025. Pricing, venue details and attendance figures are not published on the official site at this time for the 2026 edition.",
    sections: [
      {
        heading: "Dates and format",
        content: [
          "The site gives October 17 to 18, 2026 and names Kuala Lumpur as host city. EDCON is described as a nonprofit annual conference for the Ethereum ecosystem. It says the event gathers speakers, mentors and projects to share ideas and link communities.",
          "Four application paths are listed as open. They cover sponsorship, community side events, speaking and volunteering. Tickets are linked through Luma.",
        ],
      },
      {
        heading: "Partners and history",
        content: [
          "Geode Labs is named as strategic partner and described as an Ethereum ecosystem development group. No other 2026 sponsors are named on the fetched page. The history line lists Paris 2017, Toronto 2018, Sydney 2019, online editions in 2020 and 2021, San Francisco 2022, Montenegro 2023, Tokyo 2024 and Osaka 2025.",
          "The site gives no speaker names for 2026 on the fetched page. It also gives no ticket prices and no attendance figure. Readers should use the official forms for current status.",
        ],
      },
      {
        heading: "Planning note",
        content: [
          "With venue and schedule details still thin, the practical step is to apply early if you want to speak, volunteer or host a side event. The forms are linked directly from the homepage.",
          "For travel, confirm venue and hotel advice on edcon.io before booking. Pricing is listed on the official site when released.",
        ],
      },
      {
        heading: "Southeast Asian Ethereum community",
        content: [
          "Kuala Lumpur represents one of Southeast Asia's fastest-growing developer communities, bridging Malaysian universities and international open-source contributors.",
          "Attendees traveling into Kuala Lumpur International Airport (KLIA) can access downtown conference hubs via the KLIA Ekspres rail link.",
        ],
      },
    ],
  },
  "vienna-blockchain-week": {
    summaryLead:
      "Vienna Blockchain Week runs June 2 to 3, 2027 in Vienna, framed as an institutional digital asset and AI gathering. The site reports more than 500 attendees at the 2026 edition, with 80 percent international visitors from over 40 countries and more than 100 speakers. Six themes are listed for 2027, covering institutional assets, stablecoins, tokenization, MiCA regulation, infrastructure and AI in finance. A Super Early Bird ticket window ending August 31 is noted, with sales through events.neob.ai. Pricing is listed on the official site. Banks, asset managers, regulators and infrastructure firms form the stated audience.",
    expectedAttendance: "500+ attendees at VBW26, 80 percent international, 40+ countries",
    speakers: "VBW26 selection includes Michael Huertas, Cristiano Ventricelli, Nina-Luisa Siedler, Martin Bohm and Marina Markezic; VBW27 announced on rolling basis",
    sections: [
      {
        heading: "Dates and audience",
        content: [
          "The site gives June 2 to 3, 2027 in Vienna and calls the event Austria's institutional digital assets and AI conference. It says the 2026 edition drew more than 500 attendees, with 80 percent from abroad across 40-plus countries.",
          "The stated audience spans banks, asset managers, exchanges, investors, regulators, infrastructure firms and tech providers. Past attending firms named include PwC, EY, BCG, Moody's Ratings and Chainalysis.",
        ],
      },
      {
        heading: "Program",
        content: [
          "Six themes are listed for 2027. They are institutional digital assets, stablecoins and payments, tokenization and real world assets, regulation and MiCA, infrastructure and AI times finance. The full agenda with times is marked as to follow.",
          "The 2026 speaker set shown includes Michael Huertas, Cristiano Ventricelli, Nina-Luisa Siedler, Martin Bohm, Maximilian Bruckner, Marina Markezic and Mariana de la Roche Wills. The 2027 lineup is announced on a rolling basis.",
        ],
      },
      {
        heading: "Tickets and meetings",
        content: [
          "The site notes a Super Early Bird ending August 31 and links sales to events.neob.ai. No prices appear on the fetched page. An institutional access track offers hosted entry to qualified leaders by application.",
          "Networking runs through an app with one-to-one meetings, roundtables, a VIP dinner and an investor breakfast. Side events and venue and hotel pages are linked for trip planning.",
        ],
      },
    ],
  },
  ethbucharest: {
    summaryLead:
      "ETHBucharest states on its official site that it will not hold a main conference and hackathon in 2026, calling the year a strategic pause. The team says smaller events will continue during 2026 and asks readers to subscribe for updates on what comes next. The site links prior editions from 2024 and 2025 but publishes no dates, venue, pricing or speaker names for 2027. Visitors should treat any 2027 timing found elsewhere as unconfirmed until the organizers post it. Pricing is listed on the official site when announced directly there first.",
    sections: [
      {
        heading: "A pause year",
        content: [
          "The homepage headline reads as a strategic pause to build what matters. The body text says ETHBucharest will not host its main conference and hackathon in 2026. It frames the step as a pause, not an end.",
          "The team says it will reflect and rethink the event before returning. It thanks past attendees and points to future updates. No 2027 dates are given.",
        ],
      },
      {
        heading: "What continues",
        content: [
          "The site says smaller events will continue through 2026. Readers are asked to subscribe through a linked page to hear about them. Links to the 2024 and 2025 editions are provided.",
          "No venue, ticket or speaker details for 2027 appear on the fetched page. Any third-party listing for 2027 should be treated as unconfirmed.",
        ],
      },
      {
        heading: "Planning note",
        content: [
          "Do not book travel for a 2027 main event based on the current page. Watch ethbucharest.xyz for a return announcement.",
          "For past work, the 2024 and 2025 pages remain linked. Pricing is listed on the official site when announced.",
        ],
      },
    ],
  },
  ethseoul: {
    summaryLead:
      "ETHSeoul is a one-day Ethereum summit in South Korea organized with Krypto Seoul and Ludium. The official site currently details the April 14, 2025 edition at Sky 31 Convention in Lotte Tower, described as the fourth running since 2022. The 2025 agenda lists talks on rollups, privacy, zk systems, wallets and blobs, with speakers from Aztec, Succinct, ENS Labs, Uniswap Labs and EigenLayer. No dates, venue, pricing or attendance figures for 2027 are published on the official site. Readers should confirm future plans through ethseoul.org before booking travel or lodging for Seoul.",
    speakers: "2025 speakers include Zac Williamson, Uma Roy, Makoto Inoue, Christine Kim, Charles Lu and Austin Federa",
    sections: [
      {
        heading: "What the site shows",
        content: [
          "The homepage centers on April 14, 2025 at Sky 31 Convention, Lotte Tower. It calls ETHSeoul a one-day summit and the fourth event since 2022. Krypto Seoul and Ludium are named as organizers.",
          "The 2025 agenda runs afternoon talks of 20 minutes each plus a closing panel. Topics include rollup risks, privacy, zkVMs, blob storage, wallets and network upgrades.",
        ],
      },
      {
        heading: "Speakers and sponsors",
        content: [
          "Speaker images and agenda names include Matt Murray, Zac Williamson, Uma Roy, Makoto Inoue, Gen Lee, Taem Park, Qi Zhou, Christine Kim, Charles Lu, Austin Federa and others. Team links include Aztec Labs, Succinct, ENS Labs, Uniswap Labs, World Foundation and EigenLayer.",
          "Sponsors and partners shown are tied to 2025, with community and media partners listed at length. No 2027 sponsors are named.",
        ],
      },
      {
        heading: "Planning note",
        content: [
          "No 2027 dates, venue, prices or attendance figures appear on the fetched page. Treat any 2027 listing elsewhere as unconfirmed until ethseoul.org posts it.",
          "If you plan around Seoul, use the 2025 venue district only as background. Pricing is listed on the official site when released.",
        ],
      },
    ],
  },
  ethlisbon: {
    summaryLead:
      "ETHLisbon is a builder gathering in Lisbon organized around a hackathon, running since 2021. The official site currently details the May 9 to 11, 2025 edition at AIhub by Unicorn Factory in the Alvalade district, with 15,000 dollars in listed bounties. Named participants span Gnosis, Kusama, Rootstock, Filecoin Foundation, Wormhole and Bankless Ventures. The 2025 venue is described as a hacker house for collaboration and testing. No dates, ticket prices or attendance figures for 2026 are published on the official site at this time for the next edition in Portugal's capital.",
    speakers: "2025 names include builders from Gnosis, Kusama, Rootstock, Filecoin Foundation, Wormhole, Fuel Network and Bankless Ventures",
    sections: [
      {
        heading: "Format and venue",
        content: [
          "The site frames ETHLisbon as a hackathon-led builder event. The 2025 edition is listed as May 9 to 11 at AIhub by Unicorn Factory in Lisbon's Alvalade district. The venue is pitched as a hacker house for working and testing.",
          "The 2025 bounty pool is listed at 15,000 dollars across tracks tied to Olas, Gnosis Pay, Rootstock and Kusama. A hacker pack link holds full bounty terms.",
        ],
      },
      {
        heading: "People",
        content: [
          "Speakers, judges and mentors named for 2025 span Stefan George of Gnosis, Jose Macedo of Delphi, Raul Kripalani of the Ethereum Foundation, David Mihal of Fuel, Simao Cruz of Lightshift and teams from Wormhole, Filecoin Foundation and Rootstock.",
          "No 2026 speaker list appears on the fetched page. No ticket prices or attendance figures appear either. Past partners and highlights are linked for background.",
        ],
      },
      {
        heading: "Planning note",
        content: [
          "Since no 2026 dates are published, confirm timing on ethlisbon.org before booking. The FAQ covers team size, cost, remote access and scholarships for the 2025 setup only.",
          "Contact runs through a linked form. Pricing is listed on the official site when announced.",
        ],
      },
    ],
  },
  ethbelgrade: {
    summaryLead:
      "ETHBelgrade runs August 26 to 27, 2026 at the Sava Congress Center in Belgrade as part of Belgrade Blockchain Week. The site bills it as a welcoming Ethereum event for builders and researchers, with two stages and an agenda covering Solidity, Glamsterdam, stablecoins, DeFi and tokenization. Speakers named include staff from geth, Lido, CoW Protocol, Yearn, L2BEAT, Canton Foundation and the University of Belgrade. Sponsors listed include Tenderly, DeFi Saver, Yearn and Lido. Ticket sales are linked through an external platform. Pricing and attendance figures are listed on the official site when confirmed.",
    speakers: "TokenBrice, Guillaume Ballet (geth), Nikola Matic (Argot Collective), Sasha Kazachenko (CoW Protocol), Dmitry C (Lido), Paolo Di Stefano (Frankencoin)",
    sections: [
      {
        heading: "Dates and venue",
        content: [
          "The site gives August 26 to 27, 2026 at the Sava Congress Center. It notes the building dates to 1976 and its recent renovation as a congress center. The event sits inside Belgrade Blockchain Week.",
          "The agenda spans two stages over two days. Day one and day two sessions cover Solidity, state archival, Glamsterdam, stablecoins, DeFi safety, swaps, RWAs and CBDCs.",
        ],
      },
      {
        heading: "Speakers and sponsors",
        content: [
          "Names on the agenda and speaker wall include TokenBrice, Guillaume Ballet of geth, Nikola Matic of Argot Collective, Sasha Kazachenko of CoW Protocol, Dmitry C of Lido, Paolo Di Stefano of Frankencoin, Radina Talanova of L2BEAT and Jatin Pandya of Canton Foundation.",
          "Sponsors shown include Polaris, Pharos, Tenderly, DeFi Saver, Decenter, Yearn, Ambire, Lido, Curvy, Geode Labs, Tangem and LiFi. Speaker and sponsor forms are linked.",
        ],
      },
      {
        heading: "City note",
        content: [
          "The site points to local teams such as DeFi Saver, Tenderly and Solflare as roots of the Belgrade scene. It counts more than 50 Web3 firms in the city. Side events are linked through Belgrade Blockchain Week.",
          "Tickets link to an external platform with no price on the fetched page. Maps links and social channels are listed for updates.",
        ],
      },
    ],
  },
  gts: {
    summaryLead:
      "Global Trading Show (GTS) 2026 takes place December 10-11, 2026 in Abu Dhabi, UAE. Presented by Times of Trading and organised by VAP Group, the expo and conference covers forex, crypto, equities, gold, AI trading, DeFi and prediction markets.",
    sections: [
      {
        heading: "Programme",
        content: [
          "The announced programme includes an exhibition, main-stage talks, structured networking and strategy workshops.",
        ],
      },
      {
        heading: "Venue & Logistics",
        content: [
          "The organiser lists the location as Abu Dhabi, UAE. Standard, Business and VIP passes are available through the official tickets page at globaltradingshow.com.",
        ],
      },
    ],
  },
  rrdn: {
    summaryLead:
      "Ready for the Run @ Delhi NCR takes place on September 19, 2026 in Gurugram, India. Organized as a community-first meetup circuit, the gathering unites builders, investors, traders, founders, and researchers for grounded discussions on where AI and Web3 are headed next. Operating under the theme Signals, Delhi NCR serves as the opening leg of a 9-city nationwide circuit across India, setting the baseline for ecosystem sentiment, capital allocation, and builder conviction before the next market cycle.",
    ticketPricing: "Free (RSVP / approval required via Luma)",
    speakers: "Raajeev Anand (TechHybr) and community leaders across AI & Web3",
    expectedAttendance: "Builders, founders, allocators, and researchers",
    sections: [
      {
        heading: "The 9-City Circuit & Delhi NCR Signals",
        content: [
          "Ready for the Run is designed as a focused discussion format rather than a traditional pitch fest. The tour captures candid perspectives, real-time polling data, and collective intelligence directly from founders and operators building across India.",
          "As the region closest to capital, policy, and national infrastructure, Delhi NCR opens the circuit to establish core benchmarks. The agenda focuses on pragmatic evaluation of emerging AI agents, decentralized applications, and liquidity flows.",
        ],
      },
      {
        heading: "Leadership & Co-Hosts",
        content: [
          "The circuit is co-led by Raajeev Anand (TechHybr), bringing on-ground community reach into every stop of the nationwide tour. Through TechHybr, his work centers on making emerging technology, Web3 frameworks, and AI workflows accessible and actionable for builders and creators across India.",
        ],
      },
      {
        heading: "Ecosystem & Community Partners",
        content: [
          "OroPocket joins as a featured partner, bringing perspectives on tokenized precious metals and real-world asset (RWA) access adjacent to crypto-native products.",
          "Community partners supporting the event include KoinX, Web3 Events, Web3 Aligarh, Bhopal DAO, Zyphar Community, and Collably Network.",
        ],
      },
      {
        heading: "Organizers & Strategic Advisory",
        content: [
          "Infini3 produces the series as an intellectual property of 28° North, an advisory firm for early-stage Web3 and AI ventures. Infini3 hosts meetups, technical panels, and AMAs to document ground-level builder sentiment and industry signals.",
          "28° North provides strategic advisory across positioning, go-to-market architecture, and fundraising with an operator-first methodology.",
        ],
      },
    ],
  },
};
