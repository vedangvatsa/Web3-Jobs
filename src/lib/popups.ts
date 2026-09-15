import type { Popup } from '@/types/popup';

export const POPUP_TYPES = ['popup', 'permanent', 'sez'] as const;

export const POPUP_TYPE_LABELS: Record<(typeof POPUP_TYPES)[number], string> = {
  popup: 'Popup',
  permanent: 'Permanent',
  sez: 'City / SEZ',
};

export const popupData: Popup[] = [
  {
    "slug": "ns",
    "name": "Network School",
    "tagline": "Cloud communities made physical",
    "location": "Singapore / Kazakhstan",
    "type": "permanent",
    "themes": [
      "AI",
      "Crypto",
      "Business"
    ],
    "website": "https://ns.com",
    "image": "/popups/xyz/network-school/logo.webp",
    "foundedYear": 2024,
    "sources": [
      "ns",
      "xyz"
    ],
    "socials": {
      "x": "https://x.com/ns",
      "instagram": "https://www.instagram.com/networkschool",
      "youtube": "https://www.youtube.com/@nspodcast",
      "farcaster": "https://farcaster.xyz/ns"
    },
    "summary": "A society-as-a-service campus for techno-optimists building startup societies in person.",
    "body": [
      "Network School turns online builder communities into a physical campus, with shared meals, gym access, and housing treated as part of the product.",
      "It started in Forest City, Malaysia and has since moved toward a new campus footprint spanning Singapore and Kazakhstan.",
      "The project sits at the center of the broader Network States dashboard and hosts Layer-2 efforts like rc."
    ],
    "coverImages": [
      "/popups/xyz/network-school/city.webp",
      "/popups/xyz/network-school/room.webp",
      "/popups/xyz/network-school/gym.webp",
      "/popups/xyz/network-school/crowd.webp"
    ],
    "pricing": [
      "Network School costs $3,000/mo for a private room, or $1,500/mo with a roommate",
      "The goal at the Network School is to provide an all-inclusive society-as-a-service model so that members only worry about learning, burning, earning and having fun"
    ],
    "pricingSummary": "Network School costs $3,000/mo for a private room, or $1,500/mo with a roommate The goal at the Network School is to provide an all-inclusive society-as-a-service model so that members only worry about learning, burning, earning and having fun",
    "amenities": [
      "Amenities in Network School include:",
      "Serviced room",
      "3 nutritious meals (breakfast, lunch, dinner)",
      "24/7 gym access",
      "Fitness classes",
      "24/7 co-working access",
      "Content studios",
      "Maker space",
      "High-speed Wi-Fi",
      "Workshops, lectures, and events",
      "The Network School Fellowship",
      "Founders and creators can apply for a fellowship of $100,000 in funding for a new or existing venture, with the core requirement being that they relocate to Network School campus for one year"
    ],
    "history": [
      "Network School v1 was announced in August 2024, pitching itself as a pioneer 3-month cohort to empower dark talent, and replace declining traditional universities with a cheaper, digital-first alternative. Inspired by Balaji's experiences teaching at Stanford, the original pop-up village ran from September to December 2024 in Forest City, Malaysia, following the Network State Conference",
      "After proving demand, by March 2025 it evolved into Network School v2, a year-round residency program with double the capacity, hosting ongoing cohorts, hundreds of speakers, high-profile events, and expanding facilities",
      "In parallel, the core team started building a permanent Network School campus around the same place, with the goal that it becomes the template for \"franchising\" and the launchpad for exogenous communities to emerge",
      "At its peak the community counted 400+ members from 70+ nationalities, having drawn over 4,000 applications from more than 80 countries for the 128 spots in that first v1 cohort. The Forest City campus closed in July 2026, and Network School reopened in Kazakhstan on Sep 2",
      "Network School v1",
      "128 slots | 100 days",
      "Network School v2",
      "256 slots | 365 days",
      "Network School Campus",
      "1024 slots | Permanent"
    ],
    "durationNotes": [
      "The first iteration ( v1 ) of Network School lasted only 90 days, while ( v2 ) ran for a full year, from March 2025 to March 2026, on rotating monthly cohorts",
      "Throughout both iterations, members joined for a minimum of 1 month and extended their stay on",
      "a monthly basis"
    ],
    "locationDetails": [
      "Network School ran from Forest City, Malaysia, a billionaire project in the Singapore-Johor Special Economic Zone, from 2024 until mid-2026. The campus included private rooms, gym, coworking spaces, and auditoriums",
      "Kazakhstan is now the main hub, where NS reopened on Sep 2 with full state support",
      "As per Network School's roadmap,",
      "future nodes will arise throughout the world, forming a decentralized yet unified community"
    ],
    "overview": [
      "Balaji Srinivasan, the founder, frames it as a frontier community for techno-optimists",
      "What kind of people attend Network School?",
      "Its members include remote workers, digital nomads, online creators, personal trainers, self-improvers, event organizers, and engineers of all stripes"
    ],
    "xyzUrl": "https://xyz.city/network-states/network-school",
    "posts": [
      {
        "url": "https://x.com/jason/status/1929759890752589950",
        "author": "jason",
        "username": "jason",
        "text": "I just visited Balaji's Network School — it's gritty AND pretty.\n\nPerfect place for founders to camp out and find product market fit with other founders.",
        "date": "2025-06-03"
      },
      {
        "url": "https://x.com/robj3d3/status/2000544525832593864",
        "author": "Rob Hallam",
        "username": "robj3d3",
        "text": "This place is nuts. The energy is intense, everyone’s locked in. My brain is so stimulated from the first 24hrs of convos.",
        "date": "2025-12-15"
      },
      {
        "url": "https://x.com/Nibel_eth/status/2044353384900329717",
        "author": "nibel.base.eth",
        "username": "Nibel_eth",
        "text": "Our Base builder loft at NS is almost ready, and soon we will be commencing our founders' residency program. Builders from APAC and all over the world are welcome.",
        "date": "2026-04-15"
      }
    ]
  },
  {
    "slug": "prospera",
    "name": "Próspera",
    "tagline": "Honduran SEZ and startup city",
    "location": "Roatán, Honduras",
    "type": "sez",
    "themes": [
      "Crypto",
      "Biotech",
      "Robotics",
      "SEZ"
    ],
    "website": "https://www.prospera.co/en",
    "image": "/popups/xyz/prospera/logo.webp",
    "foundedYear": 2017,
    "sources": [
      "ns",
      "xyz"
    ],
    "socials": {
      "x": "https://x.com/prosperaglobal",
      "discord": "https://discord.com/invite/FKSGnQWxXp"
    },
    "summary": "A special economic zone and startup city on Roatán with its own legal and tax framework.",
    "body": [
      "Próspera operates as a ZEDE-style startup city on the island of Roatán, Honduras, with its own civil code, tax structure, and governance stack.",
      "It is one of the most concrete permanent jurisdictions in the popup and network-state scene, and hosts nested projects such as Infinita.",
      "Builders use it as a base for company formation, residency experiments, and long-stay coliving around emerging tech."
    ],
    "coverImages": [
      "/popups/xyz/prospera/city.webp",
      "/popups/xyz/prospera/building.webp",
      "/popups/xyz/prospera/houses.webp"
    ],
    "pricing": [
      "There are three main housing options for rent:",
      "Beta Hostel",
      "Starts at $24/night",
      "Duna Tower",
      "Starts at $100/night",
      "Las Verandas",
      "Starts at $149/night",
      "Alternatively, Airbnbs are available nearby",
      "One can also buy real estate - starting at $120,000 for a studio in Duna Tower - and move to Próspera with the help of relocation partners",
      "Events like the recurring Próspera Weekend range from at $250 to $450 with housing, food,",
      "transportation, events and activities included"
    ],
    "pricingSummary": "There are three main housing options for rent: Beta Hostel",
    "amenities": [
      "Amenities in Próspera include:",
      "Co-working space",
      "Maker space",
      "Cafés",
      "Bitcoin ATM",
      "Gym",
      "Infinity pool",
      "Sauna and cold plunge"
    ],
    "history": [
      "2017 - Próspera founded and established in Roatán, Honduras",
      "2020 - First residents and businesses",
      "2021 - Beta district's construction and launch of e-Residency program",
      "2022 - Duna residencies' construction and opening of Bitcoin center",
      "2023 - 100+ businesses incorporated",
      "2024 - First pop-up village hosted ( Vitalia ) and 250+ businesses incorporated. Legal challenges",
      "2025 - Coinbase investment, full occupancy in Duna Tower and several events",
      "* See detailed timeline at Próspera"
    ],
    "durationNotes": [
      "Próspera offers permanent residency options with no fixed duration. Individuals can live and work indefinitely under its governance framework",
      "Próspera (e)Residency is required to access Próspera physically or online and comes in three types:",
      "Visitor Pass for short stays",
      "Free but limited (no company or real estate ownership)",
      "e‑Residency for 30 days/year of physical access",
      "$130/year. Full business rights",
      "Residency for full year physical access",
      "$390$/year including mandatory insurance. Full business rights"
    ],
    "locationDetails": [
      "Próspera is located on the island of Roatán, Honduras, approximately 20 minutes from Roatán International Airport",
      "It incorporates two districts, featuring a gym, infinity pool, sauna and cold plunge, Bitcoin ATM and co-working spaces"
    ],
    "overview": [
      "Próspera ZEDE is self-described as a governance platform where entrepreneurs are free to build",
      "300+",
      "active businesses",
      "1,700+",
      "(e)residents from 40+ countries",
      "34,000sqm",
      "of real estate across 1,000 acres",
      "$100M+",
      "invested",
      "950",
      "active jobs",
      "1.2M+",
      "visitors to Roatán per year",
      "What is a ZEDE?",
      "ZEDE stands for Zone for Employment and Economic Development, a Special Economic Zone designed to have significant administrative and regulatory autonomy inside Honduras to attract investment and promote development",
      "The ZEDE framework has been declared unconstitutional by Honduras' Supreme Court in September",
      "2024. Established ZEDEs continue to function under political and investment uncertainty"
    ],
    "xyzUrl": "https://xyz.city/network-states/prospera",
    "posts": [
      {
        "url": "https://x.com/kunley_drukpa/status/1997860208245133664",
        "author": "Kunley Drukpa",
        "username": "kunley_drukpa",
        "text": "Within the space of less than a year there has somehow emerged the foundations for an actual working human capital city style in the tropics.",
        "date": "2025-12-08"
      },
      {
        "url": "https://x.com/timdraper/status/1899841452731252810",
        "author": "Tim Draper",
        "username": "timdraper",
        "text": "Trip to LATAM. Perspectives: Met with Próspera. Infinita is changing special economic zones on the planet. The next great leap for human freedom is happening right here.",
        "date": "2025-03-12"
      },
      {
        "url": "https://x.com/brian_armstrong/status/1881807446710059020",
        "author": "Brian Armstrong",
        "username": "brian_armstrong",
        "text": "We're excited to invest in @ProsperaGlobal which is creating special economic zones in Honduras. Próspera is the first true SEZ in Honduras, hopefully successfully replicated globally.",
        "date": "2025-01-22"
      },
      {
        "url": "https://x.com/balajis/status/1758767186565640429",
        "author": "Balaji Srinivasan",
        "username": "balajis",
        "text": "Próspera is one of the most important experiments in governance happening anywhere in the world right now.",
        "date": "2024-02-17"
      }
    ]
  },
  {
    "slug": "edge",
    "name": "Edge City",
    "tagline": "Monthlong popup society incubator",
    "location": "Global",
    "type": "popup",
    "themes": [
      "Science",
      "Culture",
      "Governance"
    ],
    "website": "https://www.edgecity.live",
    "image": "/popups/xyz/edge-city/logo.webp",
    "foundedYear": 2024,
    "sources": [
      "ns",
      "xyz"
    ],
    "socials": {
      "x": "https://x.com/JoinEdgeCity",
      "telegram": "https://t.me/+nu0R4MFH6cY3YTM5",
      "linktree": "https://linktr.ee/JoinEdgeCity"
    },
    "summary": "Hosts monthlong popup villages where frontier tech, science, and culture people live and build together.",
    "body": [
      "Edge City runs temporary villages that pack a few hundred residents into shared housing, meals, workouts, and co-creation for about a month at a time.",
      "Each village is designed as a society incubator rather than a conference: the point is living together, not just attending talks.",
      "Locations rotate globally, so the brand is the format more than any single permanent campus."
    ],
    "coverImages": [
      "/popups/xyz/edge-city/people.webp",
      "/popups/xyz/edge-city/work.webp",
      "/popups/xyz/edge-city/walk.webp",
      "/popups/xyz/edge-city/forest.webp"
    ],
    "pricing": [
      "Ticket prices for Edge City's pop-up villages range from $1,000 to $3,000, depending on location, duration of stay, timing of booking, and ticket type",
      "Tickets include:",
      "Full programming access. Talks, hackathons, themed weeks, and spontaneous sessions",
      "Shared spaces. Co-working, gym/fitness environments, social venues",
      "Community rhythm. Group meals, workouts, and daily coordination tools",
      "Network effects. Direct access to builders, funders, and collaborators",
      "Housing, meals, personal travel are not included",
      "Edge City usually runs early bird ticket campaigns"
    ],
    "pricingSummary": "Ticket prices for Edge City's pop-up villages range from $1,000 to $3,000, depending on location, duration of stay, timing of booking, and ticket type Tickets include:",
    "amenities": [
      "Amenities in Edge City’s pop-up villages typically feature:",
      "Gym",
      "Fitness classes (yoga, HIIT, strength training)",
      "Co-working spaces",
      "High-speed WiFi",
      "Maker and creative spaces",
      "Social areas and venues",
      "Talks, panels, and hackathons"
    ],
    "history": [
      "Edge City emerged from the Zuzalu movement, with the goal of creating a network city",
      "Inspired by the pioneer pop-up city in Montenegro, Edge City was launched in 2024 at Edge City Denver. That year, it hosted its first pop-up villages - Edge Esmeralda (California) and Edge City Lanna (Chiang Mai)",
      "In 2025, apart from the recurring Edge Esmeralda, it expanded to South Africa, Bhutan, and Argentina",
      "For 2026, Edge Esmeralda returns for its third edition, running from May 30 to June 27",
      "Edge City’s co-founder Janine Leger was a core organizer at Zuzalu",
      "Montenegro"
    ],
    "durationNotes": [
      "The typical Edge City pop-up village runs for 1 to 2 months, grouping approximately 1,000 people with 200-300 full-time residents",
      "Expeditions and unconferences are usually shorter (1 week), as they serve as scouting journeys for future villages"
    ],
    "locationDetails": [
      "Edge City’s pop-up villages have surfaced across 3 continents :",
      "North America",
      "USA",
      "South America",
      "Argentina",
      "Asia",
      "Thailand",
      "Apart from pop-up villages, Edge City also organizes unconferences and expeditions, aiming at exploring specific topics and evaluating potential locations for future villages",
      "Edge City Denver, 2024",
      "Edge City Austin, 2025",
      "Edge City South Africa, 2025",
      "Edge City Bhutan, 2025"
    ],
    "overview": [
      "Founded by Timour Kosters and Janine Leger, Edge City operates as a society incubator that hosts month-long pop-up villages worldwide",
      "Core Principles",
      "Edge City emphasizes four core principles :",
      "Building and co-creating where everyone contributes",
      "Multidisciplinary connections for breakthroughs",
      "Healthy by default environments with meals and workouts",
      "Multigenerational inclusion for families and elders",
      "What kind of people attend Edge City’s villages?",
      "High-agency builders at the forefront of technology, science, and societal governance. Eager minds that excel within innovative, interdisciplinary environments. Founders, scientists, urban planners, researchers, engineers, philosophers, storytellers",
      "Families with kids and elders are also welcome at Edge City's villages",
      "Past attendees include Vitalik Buterin, Grimes, and Laura Deming"
    ],
    "xyzUrl": "https://xyz.city/network-states/edge-city",
    "posts": [
      {
        "url": "https://x.com/tessla0x0/status/1995972724637024298",
        "author": "Tessla",
        "username": "tessla0x0",
        "text": "Edge City is a place for new sparks and the deepening of something. Maybe a connection, a thought, or a project. Every human creation you use today started as someone's passion project, and EC is a container that helps incubate that early seed of passion.",
        "date": "2025-12-02"
      },
      {
        "url": "https://x.com/tinyrainboot/status/1985409313892905194",
        "author": "tinyrainboot",
        "username": "tinyrainboot",
        "text": "Think of it a bit like burning man: there is an overarching organization, but within that, lots of independent organization of \"camps\" (residencies) and activities. You don't have to join a residency, but it's a nice way to meet new people with shared interests.",
        "date": "2025-11-03"
      },
      {
        "url": "https://x.com/JoinEdgeCity/status/2044078707787051014",
        "author": "Edge City",
        "username": "JoinEdgeCity",
        "text": "We're launching a mentorship residency in Bhutan. Edge City is sending international mentors to Gelephu (site of the new Gelephu Mindfulness City) to work with Pelsung, a national youth program launched by His Majesty the King.",
        "date": "2026-04-14"
      }
    ]
  },
  {
    "slug": "forma",
    "name": "Forma",
    "tagline": "Solana economic zone and campus project",
    "location": "Global / UK",
    "type": "permanent",
    "themes": [
      "Crypto",
      "Governance",
      "SEZ"
    ],
    "website": "https://forma.city",
    "image": "/popups/xyz/forma/logo.webp",
    "foundedYear": 2024,
    "sources": [
      "ns",
      "xyz"
    ],
    "socials": {
      "x": "https://x.com/formacity"
    },
    "summary": "Former popup host now building toward a permanent Solana-focused campus and economic zone.",
    "body": [
      "Forma began by running popup villages and Solana economic zone experiments in frontier markets.",
      "The team is now concentrating on a permanent campus direction, with the UK called out as a current build target.",
      "It sits in the overlap between temporary Zu-style gatherings and longer-horizon jurisdiction work."
    ],
    "coverImages": [
      "/popups/xyz/forma/community.webp"
    ],
    "pricing": [
      "Tickets were 1 SOL for both Forma Sri Lanka and Forma Georgia. Locals had free access",
      "Forma Argentina was free for everyone",
      "Tickets included access to the full program and shared spaces",
      "Accommodation, transportation, and most meals were not included in any of the pop-ups"
    ],
    "pricingSummary": "Tickets were 1 SOL for both Forma Sri Lanka and Forma Georgia. Locals had free access Forma Argentina was free for everyone",
    "amenities": [],
    "history": [
      "Forma emerged from the Solana ecosystem in 2024, transforming on-chain communities into real-world economic zones",
      "In March 2024, it hosted a two-week pop-up village, Forma Argentina, gathering 249 residents",
      "In 2025, it ran the Forma Sri Lanka and Forma Georgia pop-up zones and hosted the 1-day Solana Economic Zone Kazakhstan",
      "Forma plans to focus on building permanent Solana Economic Zones and is in late-stage",
      "discussions with three countries"
    ],
    "durationNotes": [
      "Forma’s pop-up villages last one to two weeks"
    ],
    "locationDetails": [
      "Forma doesn’t own a permanent hub",
      "In the past, it ran pop-up villages in:",
      "Buenos Aires, Argentina",
      "Ahangama, Sri Lanka",
      "Tbilisi, Georgia"
    ],
    "overview": [
      "Forma organizes Solana Economic Zones and pop-up villages in tech-forward countries"
    ],
    "xyzUrl": "https://xyz.city/network-states/forma",
    "posts": [
      {
        "url": "https://x.com/maniyaweb3/status/1960318419489931454",
        "author": "Maniya",
        "username": "maniyaweb3",
        "text": "Two weeks at the Forma Sri Lanka Pop-Up in Ahangama were unreal. Builders, nomads, and friends came together by the beach, surfing in the morning, coworking during the day, and diving deep into conversations about Solana, culture, and the future of Web3 late into the night.",
        "date": "2025-08-26"
      },
      {
        "url": "https://x.com/solana/status/1861863194144174592",
        "author": "Solana",
        "username": "solana",
        "text": "What happens when techno-optimistic policy meets ambitious founders?\n\nEnter @formacity — building Solana Economic Zones to accelerate progress.",
        "date": "2024-11-28"
      },
      {
        "url": "https://x.com/formacity/status/1939715083728236609",
        "author": "Forma",
        "username": "formacity",
        "text": "We hosted the world's first Solana trade mission in Kazakhstan.",
        "date": "2025-06-30"
      }
    ]
  },
  {
    "slug": "creci",
    "name": "Crecimiento",
    "tagline": "Argentine tech innovation hub",
    "location": "Buenos Aires, Argentina",
    "type": "popup",
    "themes": [
      "Crypto",
      "AI",
      "Tech",
      "Governance"
    ],
    "website": "https://www.crecimiento.build",
    "image": "/popups/xyz/crecimiento/logo.webp",
    "foundedYear": 2024,
    "sources": [
      "ns",
      "xyz"
    ],
    "socials": {
      "x": "https://x.com/crecimientoar",
      "telegram": "https://t.me/+sXWv0kpT7qo4ZTdk"
    },
    "summary": "A network of popups and experiments pushing Argentina as a crypto-forward builder hub.",
    "body": [
      "Crecimiento organizes Argentina-facing popups and socio-economic experiments aimed at making the country a magnet for tech builders.",
      "The work mixes blockchain tooling, local community organizing, and temporary city-scale gatherings in Buenos Aires.",
      "It is one of the clearest South American nodes in both the xyz.city and Network School directories."
    ],
    "coverImages": [
      "/popups/xyz/crecimiento/street.webp",
      "/popups/xyz/crecimiento/community.webp"
    ],
    "pricing": [
      "Aleph, Ciudad de Crecimiento",
      "Aleph Passport: $20/month. Access to social hangouts and most programming",
      "Co-living: $200/month. Access to cultural, social, and wellness activities",
      "Co-building: $600/month. Access to Aleph Hub co-working",
      "Argentines received a 50% discount on all tickets",
      "Aleph de Verano and Aleph March '25",
      "Free admission with application required. Selected start-ups gain 24/7 Hub access, dedicated programming, mentorship, and investor networking"
    ],
    "pricingSummary": "Aleph, Ciudad de Crecimiento Aleph Passport: $20/month. Access to social hangouts and most programming",
    "amenities": [
      "24/7 co-working (250-300 capacity)",
      "Wi-Fi, wellness sanctuary, fitness, and event spaces",
      "Dining spaces and social hangars",
      "Yoga, meditation, and fitness classes",
      "Football tournaments and tango experiences",
      "Weekly asados and art exhibitions",
      "Programming",
      "Crecimiento organizes events around six themes",
      "Crypto. Financial infrastructure, use cases, privacy, coordination",
      "Start-ups. Product, fundraising, growth, hiring, demo days",
      "Crecimiento. Regulation, talent, culture, ecosystem strategy",
      "Wellness. Mindfulness, nutrition, fitness, mental health",
      "Culture. Art, music, NFTs, Argentine heritage",
      "Unconference. Community-led events and workshops"
    ],
    "history": [
      "Crecimiento was founded in 2024, hosting Aleph, Ciudad de Crecimiento in August - a month-long pop-up city that attracted over 2,500 participants and 60+ start-ups",
      "Later that summer, it hosted Aleph de Verano",
      "In 2025, Aleph March '25 set a record with 5,000+ attendees and Aleph Festival ran from August to November",
      "The movement has engaged 10,000 builders, supported 250+ start-ups, and secured backing from Protocol Labs, the Ethereum Foundation, and major Web3 protocols",
      "The naming inspiration for Crecimiento's events is The",
      "Aleph, a short story by Jorge Luis Borges",
      "which describes Aleph as a point in space that contains all other points"
    ],
    "durationNotes": [
      "Crecimiento's pop-up villages usually range from 2 weeks to 1 month",
      "The Aleph Hub operates as a year-round permanent co-working space"
    ],
    "locationDetails": [
      "Crecimiento centers operations in Buenos Aires, Argentina. Pop-up villages and the Aleph Hub co-working space are located in the Palermo and Colegiales neighborhoods"
    ],
    "overview": [
      "Crecimiento is a global movement transforming Argentina into a hub for crypto and frontier tech innovation"
    ],
    "xyzUrl": "https://xyz.city/network-states/crecimiento",
    "posts": [
      {
        "url": "https://x.com/xcapit_/status/1820891135663034541",
        "author": "Xcapit",
        "username": "xcapit_",
        "text": "The first popup city in Buenos Aires is a testament to the transformative moment we are experiencing in Argentina. This event represents a unique opportunity to catalyze innovation in our country.",
        "date": "2024-08-07"
      },
      {
        "url": "https://x.com/Andentech/status/1989349427392172436",
        "author": "Anden Tech",
        "username": "Andentech",
        "text": "Andén's mission is to provide the technology and operational stack that turns Economic Zones, special regimes and public sector into fully digital, transparent, and onchain-native jurisdictions.",
        "date": "2025-11-14"
      },
      {
        "url": "https://x.com/crecimientoar/status/2034041989428043927",
        "author": "Crecimiento",
        "username": "crecimientoar",
        "text": "We’re launching the Buenos Aires Ethereum Community Hub, hosted at our new Aleph Hub.",
        "date": "2026-03-18"
      }
    ]
  },
  {
    "slug": "ft",
    "name": "Frontier Tower",
    "tagline": "Vertical village in San Francisco",
    "location": "San Francisco, USA",
    "type": "permanent",
    "themes": [
      "AI",
      "Crypto",
      "Biotech",
      "Longevity"
    ],
    "website": "https://frontiertower.io",
    "image": "/popups/xyz/frontier-tower/logo.webp",
    "foundedYear": 2024,
    "sources": [
      "ns",
      "xyz"
    ],
    "socials": {
      "x": "https://x.com/frontiertower",
      "telegram": "https://t.me/+M0KxFTd3LnJkNzky"
    },
    "summary": "A 16-floor San Francisco tower converting into a vertical coliving village for frontier tech builders.",
    "body": [
      "Frontier Tower is turning a high-rise into stacked housing, work, and community space for AI, crypto, biotech, and longevity builders.",
      "Unlike rotating popups, the bet is permanence inside an existing city rather than a remote campus.",
      "It is often framed as a blueprint for inter-city network societies that stay plugged into a major metro."
    ],
    "coverImages": [
      "/popups/xyz/frontier-tower/tower.webp"
    ],
    "pricing": [
      "Citizen",
      "$190/month billed monthly",
      "Access to the spaces",
      "Founding Citizen",
      "$150/month billed annually",
      "Access to the spaces, special voting rights, and priority access to events",
      "Globetrotter",
      "$500/month billed monthly",
      "Access to the spaces, special voting rights, and discounted hotel stays",
      "Builders under 25, as well as university teachers, students, and researchers can apply for a scholarship"
    ],
    "pricingSummary": "Citizen $190/month billed monthly",
    "amenities": [
      "Amenities in Frontier Tower include:",
      "Private offices",
      "Kitchen",
      "Co-working spaces",
      "Lounge",
      "Library",
      "Maker space",
      "Gym",
      "Workshops, hackathons and events",
      "Frontier Tower doesn't provide accommodation yet",
      "Private offices",
      "Frontier Tower citizens can rent a private office in the building from $1,000 to $4,000 a month. The exact price point, as well as other matters, can be inquired about via e-mail to support@frontiertower.io",
      "It includes:",
      "24/7 secure access",
      "Audiovisual setup and lighting",
      "Onsite support",
      "Access to all Frontier Tower amenities and event spaces",
      "Wellness perks: kombucha, premium coffee, and healthy snacks",
      "To lease an office, one must also have an active Founding Citizenship"
    ],
    "history": [
      "Frontier Tower is inspired by the fall of the Berlin Wall",
      "In the 1990s, tens of thousands of people left East Berlin, leaving unoccupied buildings which came to serve as hubs for creative communities to emerge",
      "The team at Frontier Tower sees that, nowadays, a lot of offices are being abandoned across cities and an analogous chance is emerging. In 2013, it built a co-living house in Leipzig called Ost-Apotheke, which brought together 35 students, artists and musicians",
      "In 2025, Deep Ink Ventures and Berlinhouse materialized this vision and bought the 16-story building for $11 million",
      "Throughout the first year, the place hosted network state-related events, like the Viva Frontier Tower pop-up village, and is expected to launch a residency program soon"
    ],
    "durationNotes": [
      "Frontier Tower runs permanently as a co-living and co-working place for members, though the residency program is yet to be launched"
    ],
    "locationDetails": [
      "Frontier Tower is located at 995 Market Street, in downtown San Francisco",
      "The team plans to expand to Buenos Aires, New York, Hong Kong, London, Toronto and Los Angeles in the future",
      "The next location for a Frontier Tower is chosen according to a competition between cities"
    ],
    "overview": [
      "A self-governed vertical village in a 16-floor building in San Francisco, serving as a lab for frontier technologies",
      "What kind of people join Frontier Tower?",
      "Open-minded, curious people interested in frontier technologies like AI, biotech, crypto, or arts & music",
      "How is the tower organized?",
      "Most floors are divided by field of work. Others are common convenience spaces",
      "Floor 16. d/acc lounge for cross pollination",
      "Floor 15. Coworking and library",
      "Floor 14. Human flourishing",
      "Floor 12. Ethereum and decentralized tech",
      "Floor 11. Health and longevity",
      "Floor 10. Frontier @ Accelerate",
      "Floor 9. AI and autonomous systems",
      "Floor 8. Neuro and biotech",
      "Floor 7. Frontier maker space",
      "Floor 6. Arts and music",
      "Floor 5. Movement floor and fitness center",
      "Floor 4. Robotics and hard tech",
      "Floor 3. Private offices",
      "Floor 2. Event and hackathon space",
      "Floor 1. Co-living 1",
      "Floor 0. Entrance"
    ],
    "xyzUrl": "https://xyz.city/network-states/frontier-tower",
    "posts": [
      {
        "url": "https://x.com/ashleevance/status/2033543601528135746",
        "author": "Ashlee Vance",
        "username": "ashleevance",
        "text": "Last year, three German dudes bought a abandoned office tower in downtown SF. They've since turned it into the most tech-infused office in the world in the form of Frontier Tower.",
        "date": "2026-03-16"
      },
      {
        "url": "https://x.com/olivercingl/status/1951133674692645355",
        "author": "Oliver",
        "username": "olivercingl",
        "text": "Frontier Tower has got to be the coolest place I've been to in SF. 16 floors full of builders, humanoid robots, longevity stuff, anything you can think of. You can just work on something on one floor, you have a question about AI, go to the AI floor to get help, then you need help with robotics so you go the robotics floor.",
        "date": "2025-08-01"
      },
      {
        "url": "https://x.com/frontiertower/status/2044836944002404356",
        "author": "Frontier Tower",
        "username": "frontiertower",
        "text": "The real reason founders move to SF isn't the capital.\nIt's the hallway conversations.\n\nSo we built a hallway.",
        "date": "2026-04-17"
      }
    ]
  },
  {
    "slug": "4seas",
    "name": "4Seas",
    "tagline": "Permanent Zuzalu node in Chiang Mai",
    "location": "Chiang Mai, Thailand",
    "type": "permanent",
    "themes": [
      "Tech",
      "Culture",
      "Governance"
    ],
    "website": "https://www.4seas.xyz",
    "image": "/popups/xyz/4seas/logo.webp",
    "foundedYear": 2023,
    "sources": [
      "ns",
      "xyz"
    ],
    "socials": {
      "x": "https://x.com/4seasdesoc",
      "telegram": "https://t.me/NomadsBase"
    },
    "summary": "A permanent Ethereum-culture coliving and coworking hub tied to the Zuzalu movement.",
    "body": [
      "4Seas keeps a standing Zuzalu-inspired base in Chiang Mai instead of dissolving after each popup season.",
      "The hub mixes coliving, coworking, and Ethereum cultural programming for longer-term residents and visitors.",
      "It is one of the clearest examples of a temporary movement hardening into a permanent node."
    ],
    "coverImages": [
      "/popups/xyz/4seas/mountain-view.webp"
    ],
    "pricing": [
      "Public spaces are free in both locations. For access to all amenities:",
      "4Seas Nimman",
      "$110/night during high season*",
      "$60/night rest of the year",
      "4Seas Mountain",
      "$70/night during high season*",
      "$50/night rest of the year",
      "*December, January, and February make up the high season"
    ],
    "pricingSummary": "Public spaces are free in both locations. For access to all amenities: 4Seas Nimman",
    "amenities": [
      "4Seas Nimman",
      "Accommodation",
      "Co-working space",
      "Public kitchen",
      "Events and meeting rooms",
      "Outdoor spaces",
      "4Seas Mountain View",
      "Accommodation",
      "Co-working space",
      "Restaurant",
      "Floating pavilion",
      "Outdoor spaces",
      "Both locations offer free spaces for hosting events",
      "To use the co-working area, one can buy a drink that serves as a day pass",
      "A coffee in Chiang Mai costs around 60 Thai Baht (~$2)"
    ],
    "history": [
      "2023 - 4Seas is born from the Zuzalu movement, a network-state experiment that brought 800 pioneers to Montenegro",
      "2024 - After a wave of pop-up communities emerge in Chiang Mai, a movement later named Zuzalu 2.0, 4Seas takes the opportunity and launches its first physical node",
      "2025 - 4Seas expands by incorporating a second location, Mountain View, a co-living and co-working resort situated near the hills of Chiang Mai"
    ],
    "durationNotes": [
      "4Seas is a permanent co-living and co-working space for members",
      "It also hosts temporary pop-up cities, such as ETHChiangmai"
    ],
    "locationDetails": [
      "4Seas has two main locations in Chiang Mai, Thailand:",
      "4Seas Nimman. First and central location in Nimmanhaemin",
      "4Seas Mountain View. Retreat-style spot in Hang Dong"
    ],
    "overview": [
      "4Seas is an Ethereum cultural community on a mission to advance the crypto ecosystem",
      "It incorporates multiple co-living and co-working spaces in Chiang Mai, Thailand, where it hosts public events on blockchain, social sciences, and humanities"
    ],
    "xyzUrl": "https://xyz.city/network-states/4seas",
    "posts": []
  },
  {
    "slug": "zucity",
    "name": "ZuCity / ZuJapan",
    "tagline": "Permanent Zuzalu village in Japan",
    "location": "Nagano, Japan",
    "type": "permanent",
    "themes": [
      "Tech",
      "Culture",
      "Biotech",
      "Longevity"
    ],
    "website": "http://zucity.org",
    "image": "/popups/xyz/zucity-japan/logo.webp",
    "foundedYear": 2024,
    "sources": [
      "ns",
      "xyz"
    ],
    "socials": {
      "x": "https://x.com/zucity_japan",
      "discord": "https://discord.gg/UQZEkHRzqt",
      "telegram": "https://t.me/+hqHkbnXdw4ZjMDVh"
    },
    "summary": "A lasting Zuzalu-inspired village restoring vacant Japanese homes into builder and culture hubs.",
    "body": [
      "ZuCity (also listed as ZuJapan) is building a permanent village in rural Japan around restored akiya homes.",
      "The project pairs housing reuse with community infrastructure, residencies, and events meant to revive local economies.",
      "It partners closely with Akiya Collective while keeping its own Zuzalu-lineage brand and channels."
    ],
    "coverImages": [
      "/popups/xyz/zucity-japan/presentation.webp",
      "/popups/xyz/zucity-japan/kitchen.webp",
      "/popups/xyz/zucity-japan/selfie.webp"
    ],
    "pricing": [
      "Co-living options for flexible stays include:",
      "Nomad",
      "$1,500/person/month",
      "Private room",
      "Access to community spaces",
      "Access to events and socials",
      "VIP",
      "$2,500/person/month",
      "All basics included",
      "Premium housing",
      "24/7 free car access",
      "Pricing is subject to change. All pricing and payments are handled onchain"
    ],
    "pricingSummary": "Co-living options for flexible stays include: Nomad",
    "amenities": [],
    "history": [
      "Inspired by Zuzalu 's pop-up village movement, ZuCity created its own community in Japan",
      "The first pop-up village took place in September 2025, and the 2026 edition is ZuCity Japan 2026",
      "It also hosts ZuCity Cherry Blossom Season in April 2026",
      "Although based near two existing SEZs, ZuCity Japan is neither an SEZ nor intends to become",
      "one"
    ],
    "durationNotes": [
      "ZuCity Japan offers both short-term co-living and permanent accommodation",
      "It hosts week-long and month-long pop-up villages and offers a 'try before you buy' path to home ownership through rent-to-own houses",
      "Rent-to-own : ZuCity Japan lets you rent short-term in",
      "coliving-style community homes, while crediting 50% of your rent toward buying a home in their",
      "Nagano-area community later"
    ],
    "locationDetails": [
      "ZuCity Japan restores homes across Nagano Prefecture, Japan, a rural area 90 minutes away from Tokyo by train"
    ],
    "overview": [
      "ZuCity Japan is a co-living community that buys and restores abandoned homes in rural Japan, building a vertically integrated neighborhood to attract entrepreneurs, scientists, and artists"
    ],
    "xyzUrl": "https://xyz.city/network-states/zucity-japan",
    "posts": [
      {
        "url": "https://x.com/ishaan0x/status/1853661371805978959",
        "author": "ishaan",
        "username": "ishaan0x",
        "text": "ZuJapan = permanent popup city in Japan for community living.",
        "date": "2024-11-05"
      },
      {
        "url": "https://x.com/zucity_japan/status/2007134989989933233",
        "author": "ZuCity Japan",
        "username": "zucity_japan",
        "text": "We just published our 2025 year end recap on our vertically-integrated coliving neighborhood in rural Japan.",
        "date": "2026-01-03"
      },
      {
        "url": "https://x.com/tessla0x0/status/1882026150895255553",
        "author": "Tessla",
        "username": "tessla0x0",
        "text": "Visited ZuJapan the other day and was intrigued by the design challenges of reviving an old city. Giving new life to abandoned homes—could Nagano be the next creative hub for artists and builders?",
        "date": "2025-01-22"
      }
    ]
  },
  {
    "slug": "akiya",
    "name": "Akiya Collective",
    "tagline": "Transforming vacant Japanese homes",
    "location": "Japan",
    "type": "permanent",
    "themes": [
      "Culture",
      "Tech",
      "Longevity"
    ],
    "website": "https://www.akiyacollective.org",
    "image": "/popups/akiyacollective.jpg",
    "foundedYear": 2024,
    "sources": [
      "ns"
    ],
    "socials": {
      "x": "https://x.com/AkiyaCollective"
    },
    "summary": "Residency and community spaces built by reclaiming Japan’s vacant akiya housing stock.",
    "body": [
      "Akiya Collective focuses on the practical work of turning abandoned Japanese homes into residencies and shared community spaces.",
      "It overlaps with ZuJapan geographically and culturally, but operates as its own organization and brand.",
      "The pitch is human flourishing through place-making, not a one-month popup calendar."
    ],
    "coverImages": [],
    "pricing": [],
    "amenities": [],
    "history": [],
    "durationNotes": [],
    "locationDetails": [],
    "overview": [],
    "xyzUrl": null,
    "posts": [
      {
        "url": "https://x.com/AkiyaCollective/status/1810328618398326866",
        "author": "akiya collective",
        "username": "AkiyaCollective",
        "text": "When we first bought our 85-year old house, it had already been abandoned for about 10-15 years. There were vines growing into the windows of the house.",
        "date": "2024-07-08"
      },
      {
        "url": "https://x.com/michael_nielsen/status/1815621699599237532",
        "author": "Michael Nielsen",
        "username": "michael_nielsen",
        "text": "I gotta say: this is a pretty interesting idea!",
        "date": "2024-07-23"
      },
      {
        "url": "https://x.com/osvllc/status/1933504919589265899",
        "author": "O'Shaughnessy Ventures",
        "username": "osvllc",
        "text": "O'Shaughnessy Ventures Awards $100K Fellowship to Revitalize Vacant Homes in Rural Japan.",
        "date": "2025-06-13"
      }
    ]
  },
  {
    "slug": "amagi",
    "name": "Amagi Life",
    "tagline": "Regenerative villages in Thailand",
    "location": "Thailand",
    "type": "permanent",
    "themes": [
      "Culture",
      "Governance"
    ],
    "website": "https://amagi.life",
    "image": "/popups/amagilife.jpg",
    "sources": [
      "ns"
    ],
    "socials": {
      "x": "https://x.com/AmagiLife"
    },
    "summary": "Long-term regenerative villages with shared land and a contribution-driven economy.",
    "body": [
      "Amagi Life builds regenerative villages in Thailand aimed at longer stays rather than short festival bursts.",
      "Shared land and contribution-based economics are core to how residents coordinate day to day.",
      "It sits closer to intentional community design than to conference-style popups."
    ],
    "coverImages": [],
    "pricing": [],
    "amenities": [],
    "history": [],
    "durationNotes": [],
    "locationDetails": [],
    "overview": [],
    "xyzUrl": null,
    "posts": [
      {
        "url": "https://x.com/JoinEdgeCity/status/1970535786412941530",
        "author": "JoinEdgeCity",
        "username": "JoinEdgeCity",
        "text": "How do you design environments that maximize human flourishing and serendipity? Janine Leger shares her journey of building Edge City, community & dynamism, multigenerational living, and the magic of popup villages on the Amagi Life podcast.",
        "date": "2025-09-24"
      },
      {
        "url": "https://x.com/viktordio_/status/2010698032916914645",
        "author": "viktordio_",
        "username": "viktordio_",
        "text": "2026 has just begun, but I've already seen one of its highlights: visiting Amagi Life and experiencing the magical performance of Lora Ute, one of its first residents.",
        "date": "2026-01-12"
      }
    ]
  },
  {
    "slug": "arc",
    "name": "Arc",
    "tagline": "Build the frontier",
    "location": "Mirissa, Sri Lanka",
    "type": "permanent",
    "themes": [
      "Tech",
      "Governance",
      "Business"
    ],
    "website": "https://thearccity.com",
    "image": "/popups/arc.webp",
    "foundedYear": 2024,
    "sources": [
      "ns",
      "xyz"
    ],
    "socials": {
      "x": "https://x.com/James_of_Arc",
      "telegram": "https://t.me/ns_arc"
    },
    "summary": "Arc accelerates the trajectory of people and places, delivering laws, capital, and talent on day one.",
    "body": [
      "Arc is a community of founders, engineers, investors, and creators who live, work, and build together. After experiments on three continents, it chose Sri Lanka as its first long-term place.",
      "The open home is Asaya, a beachfront campus on Mirissa Beach. Programming includes Ascend and the Fulgur, Curious, and Arc Angel funds.",
      "Arc activated Network School in Malaysia from 2025 to 2026 before applying the same pop-up-then-permanent playbook in Sri Lanka, including First Capital Startup Nation in Colombo."
    ],
    "coverImages": [],
    "xyzUrl": "https://xyz.city/network-states/arc",
    "pricing": [
      "Campus access at Asaya is unbundled and pay-as-you-go rather than a single all-in bundle",
      "First Capital Startup Nation hosted packages are invitation-only (see thearccity.com/startup-nation)"
    ],
    "pricingSummary": "Unbundled, pay-as-you-go access at Asaya, Mirissa; Startup Nation packages by invitation",
    "amenities": [
      "Beachfront campus at Asaya, Mirissa Beach",
      "Founder community, events, and accelerator-style programming",
      "Ascend, Fulgur, Curious, and Arc Angel investor programming in Sri Lanka",
      "Member guide for relocators (password provided with membership)"
    ],
    "history": [
      "2024 - Arc Lisbon pop-up (September–October), with Lisbon Web3 and tech community partners",
      "2025 - Arc Austin pop-up during Austin tech week (March); Singapore pop-up (September–October)",
      "2025 to 2026 - Activation at Network School in the Singapore–Johor SEZ: 1,000 founders helped, 500+ events, accelerator cohorts, and fund deployment",
      "2026 - Live on Mirissa Beach, Sri Lanka; First Capital Startup Nation with Hatch in Colombo (28 September–1 October)"
    ],
    "durationNotes": [
      "Permanent founder community at Asaya, Mirissa, with ongoing programming",
      "Historical pop-up villages typically ran about one to two months",
      "First Capital Startup Nation 2026: 28 September–1 October in Colombo"
    ],
    "locationDetails": [
      "Primary campus: Asaya, a beachfront campus in Mirissa, Sri Lanka",
      "Arc Sri Lanka connects builders to Colombo and national institutions",
      "Prior activation: Network School in Forest City, Malaysia (Singapore–Johor SEZ)"
    ],
    "overview": [
      "Arc accelerates the trajectory of people and places and ships legal, capital, and company infrastructure together.",
      "The Sri Lanka campus at Asaya on Mirissa Beach is open to the early community.",
      "Programming includes Ascend, Fulgur, Curious, and Arc Angel alongside Colombo events such as Startup Nation."
    ],
    "posts": [
      {
        "url": "https://x.com/UVK1212/status/1974337978970616076",
        "author": "Kash",
        "username": "UVK1212",
        "text": "At Ârc, we're building a charter city. starting with the first permanent Layer 2 at Network School in Forest City. From here, the model can scale to future nodes, maybe even your city.",
        "date": "2025-10-04"
      },
      {
        "url": "https://x.com/vrneth/status/1974046732829810849",
        "author": "vrn.eth",
        "username": "vrneth",
        "text": "The relationship between Ârc and Network School is a fascinating one and provides learnings for how similar projects globally can work together.",
        "date": "2025-10-03"
      },
      {
        "url": "https://x.com/rami_decodes/status/1968863630432035133",
        "author": "Rami",
        "username": "rami_decodes",
        "text": "Mr James of Arc on stage launching the  Arc experience as Layer 2 of the Network School. This is the frontier for founders!",
        "date": "2025-09-19"
      }
    ]
  },
  {
    "slug": "arkpad",
    "name": "ArkPad",
    "tagline": "Floating ocean habitation",
    "location": "Philippines",
    "type": "popup",
    "themes": [
      "Tech"
    ],
    "website": "https://arkpad.co",
    "image": "/popups/arkpad.jpg",
    "sources": [
      "ns"
    ],
    "socials": {
      "x": "https://x.com/real_Arkpad"
    },
    "summary": "Builds floating structures intended for human habitation on the water.",
    "body": [
      "ArkPad is a construction-oriented project producing floating platforms for ocean living.",
      "Unlike social popups, the core product is physical infrastructure rather than a temporary community calendar.",
      "It appears on the Network School dashboard as part of the wider startup-society build stack."
    ],
    "coverImages": [],
    "pricing": [],
    "amenities": [],
    "history": [],
    "durationNotes": [],
    "locationDetails": [],
    "overview": [],
    "xyzUrl": null,
    "posts": [
      {
        "url": "https://x.com/real_Arkpad/status/2008804685462069427",
        "author": "ArkPad",
        "username": "real_Arkpad",
        "text": "Proud to share that Mitchell Suchner, founder of ArkPad, received the Innovation Award at the Free Cities Conference for his work in ocean engineering and seasteading.",
        "date": "2026-01-07"
      },
      {
        "url": "https://x.com/FreeCitiesPod/status/2022219109367525648",
        "author": "Free Cities Pod",
        "username": "FreeCitiesPod",
        "text": "Seasteading won't scale on ideology. It scales on exports. Mitchell Suchner explains the business logic behind the world's first operational seasteading resort.",
        "date": "2026-02-13"
      }
    ]
  },
  {
    "slug": "blc",
    "name": "Bitcoin Learning Center",
    "tagline": "Physical Bitcoin hub in Asia",
    "location": "Chiang Mai, Thailand",
    "type": "permanent",
    "themes": [
      "Crypto"
    ],
    "website": "https://www.bitcoinchiangmai.org",
    "image": "/popups/bitcoincenter.jpg",
    "sources": [
      "ns"
    ],
    "socials": {},
    "summary": "A standing physical hub for Bitcoin education and community activity in Chiang Mai.",
    "body": [
      "Bitcoin Learning Center is positioned as one of Asia’s most active physical Bitcoin hubs.",
      "The focus is in-person learning and gathering rather than a full startup city stack.",
      "Chiang Mai already hosts several overlapping crypto hubs, and this one stays Bitcoin-specific."
    ],
    "coverImages": [],
    "pricing": [],
    "amenities": [],
    "history": [],
    "durationNotes": [],
    "locationDetails": [],
    "overview": [],
    "xyzUrl": null,
    "posts": []
  },
  {
    "slug": "cc",
    "name": "Cafe Cursor",
    "tagline": "Popup cafes for AI developers",
    "location": "Global",
    "type": "popup",
    "themes": [
      "AI"
    ],
    "website": "https://luma.com/cursorcommunity",
    "image": "/popups/cafecursor.jpg",
    "sources": [
      "ns"
    ],
    "socials": {
      "x": "https://x.com/cursor_ai",
      "discord": "https://discord.gg/75zBmD69JV"
    },
    "summary": "Short cafe takeovers where Cursor users meet to code together in person.",
    "body": [
      "Cafe Cursor runs temporary cafe takeovers for AI developers who want an IRL build session instead of another Discord huddle.",
      "The format is lighter than a monthlong village: show up, ship, meet other Cursor users.",
      "It sits on the popup end of the spectrum, closer to community meetups than to jurisdiction experiments."
    ],
    "coverImages": [],
    "pricing": [],
    "amenities": [],
    "history": [],
    "durationNotes": [],
    "locationDetails": [],
    "overview": [],
    "xyzUrl": null,
    "posts": [
      {
        "url": "https://x.com/balajis/status/1968212122510483492",
        "author": "Balaji Srinivasan",
        "username": "balajis",
        "text": "Cursor is now running a cafe. We move from physical popups to startup societies and network states.",
        "date": "2025-09-17"
      },
      {
        "url": "https://x.com/TheStalwart/status/1980651966545207692",
        "author": "The Stalwart",
        "username": "TheStalwart",
        "text": "I'm going to swing by Cafe Cursor today. I can't promise to build with other power users, but I am looking forward to grabbing some coffee and credits.",
        "date": "2025-10-21"
      },
      {
        "url": "https://x.com/PaulOjo312/status/2049159438590701822",
        "author": "Paul Ojo",
        "username": "PaulOjo312",
        "text": "Café Cursor event was such a great experience. I've been deliberately pushing myself to show up more in rooms like this, and I'm glad I did. Got to connect with some really cool people and have conversations that just don't happen behind a screen.",
        "date": "2026-04-29"
      }
    ]
  },
  {
    "slug": "morazan",
    "name": "Ciudad Morazán",
    "tagline": "Blue-collar startup city in Honduras",
    "location": "Honduras",
    "type": "sez",
    "themes": [
      "Business",
      "Governance"
    ],
    "website": "https://www.morazan.city",
    "image": "/popups/morazan.png",
    "sources": [
      "ns"
    ],
    "socials": {
      "x": "https://x.com/ciudadmorazan1"
    },
    "summary": "A Honduran startup city focused on housing and amenities for working families and operators.",
    "body": [
      "Ciudad Morazán is building a startup city model aimed at blue-collar families and entrepreneurs, not only frontier-tech elites.",
      "Safe housing and modern amenities are the product surface, with governance experiments underneath.",
      "It expands the Honduras map beyond Próspera’s island footprint."
    ],
    "coverImages": [],
    "pricing": [],
    "amenities": [],
    "history": [],
    "durationNotes": [],
    "locationDetails": [],
    "overview": [],
    "xyzUrl": null,
    "posts": [
      {
        "url": "https://x.com/ciudadmorazan1/status/1902180215398223904",
        "author": "Ciudad Morazán Oficial",
        "username": "ciudadmorazan1",
        "text": "Last week, Ciudad Morazán hosted an unforgettable town hall packed with energy, culture, and community spirit!",
        "date": "2025-03-19"
      },
      {
        "url": "https://x.com/CCIdotCity/status/1785682558576943311",
        "author": "Charter Cities Institute",
        "username": "CCIdotCity",
        "text": "Massimo, the mastermind behind Ciudad Morazan, envisions a city where good governance is a service. Through entrepreneurial zeal and a commitment to customer satisfaction, Morazán is redefining what it means to live in a free society.",
        "date": "2024-05-01"
      },
      {
        "url": "https://x.com/rmaxyordi/status/1783689644753776670",
        "author": "Max Garcia",
        "username": "rmaxyordi",
        "text": "It's a beautiful and dazzling spectacle to behold the body of the moon! The nights become magical in Morazan.",
        "date": "2024-04-26"
      }
    ]
  },
  {
    "slug": "commons",
    "name": "Commons Hub",
    "tagline": "Regenerative commons popup",
    "location": "Austria",
    "type": "popup",
    "themes": [
      "Culture",
      "Governance"
    ],
    "website": "https://www.commons-hub.at",
    "image": "/popups/commonshub.jpg",
    "sources": [
      "ns"
    ],
    "socials": {
      "x": "https://x.com/commonshubat"
    },
    "summary": "A regenerative commons popup village based in the Austrian Alps.",
    "body": [
      "Commons Hub gathers people around regenerative commons practice in an Alpine popup format.",
      "Expect shared infrastructure and place-based collaboration more than a pure crypto hacker house.",
      "It is one of the European entries that is clearly temporary and theme-driven."
    ],
    "coverImages": [],
    "pricing": [],
    "amenities": [],
    "history": [],
    "durationNotes": [],
    "locationDetails": [],
    "overview": [],
    "xyzUrl": null,
    "posts": [
      {
        "url": "https://x.com/Logos_network/status/2062243025816867032",
        "author": "Logos",
        "username": "Logos_network",
        "text": "Can a temporary village become the foundation for something lasting? @FelixFritsch2 of Commons Hub joins to discuss Valley of the Commons, a four-week popup village in the Austrian Alps taking concrete steps toward permanent settlement.",
        "date": "2026-06-04"
      },
      {
        "url": "https://x.com/spaceroo83/status/2003448252289679402",
        "author": "0xcommunity",
        "username": "spaceroo83",
        "text": "Great weekend at Commons Hub with awesome people - a beautiful community hub in the Austrian Alps.",
        "date": "2025-12-23"
      }
    ]
  },
  {
    "slug": "culdesac",
    "name": "Culdesac",
    "tagline": "Walkable city in Tempe",
    "location": "Tempe, Arizona, USA",
    "type": "sez",
    "themes": [
      "Business",
      "Culture"
    ],
    "website": "https://culdesac.com",
    "image": "/popups/culdesac.jpg",
    "sources": [
      "ns"
    ],
    "socials": {
      "x": "https://x.com/culdesac"
    },
    "summary": "A car-free walkable neighborhood experiment focused on belonging and local commerce.",
    "body": [
      "Culdesac is building walkable urban fabric in Tempe with transportation freedom and local business density as design goals.",
      "It is more urban development than crypto popup, but it shows up in the same startup-society directories.",
      "The product is a neighborhood residents can live in year-round."
    ],
    "coverImages": [],
    "pricing": [],
    "amenities": [],
    "history": [],
    "durationNotes": [],
    "locationDetails": [],
    "overview": [],
    "xyzUrl": null,
    "posts": [
      {
        "url": "https://x.com/devonzuegel/status/1665547211889844227",
        "author": "Devon Zuegel",
        "username": "devonzuegel",
        "text": "Just got a tour of Culdesac Tempe and it was awesome. I caught myself daydreaming about living there while wandering the new neighborhood's paseos and courtyards – and I'd never even considered living in Arizona before!",
        "date": "2023-06-05"
      },
      {
        "url": "https://x.com/christofspieler/status/1721324452531830785",
        "author": "Christof Spieler",
        "username": "christofspieler",
        "text": "Culdesac Tempe…it is genuinely well done and really makes it much easier to live a car-free life.",
        "date": "2023-11-06"
      },
      {
        "url": "https://x.com/culdesac/status/1817288964824277428",
        "author": "culdesac",
        "username": "culdesac",
        "text": "A big reason so many Americans miss college is because it's the only time they've ever lived in a walkable community. \n\nThat doesn't have to be the case. At Culdesac, we're showing that building walkable neighborhoods is possible in the U.S. again.",
        "date": "2024-07-27"
      },
      {
        "url": "https://x.com/culdesac/status/1882866065329262872",
        "author": "culdesac",
        "username": "culdesac",
        "text": "When we pitched Culdesac 7 years ago, the real estate industry laughed us out of the room. \n\nNow, with over 300 residents and  20+ local businesses in the neighborhood, they want to use our model. Thank you to all who believed in us from the start.\n\nMore big things coming soon! https://t.co/ju0FFyLkIZ",
        "date": "2025-01-24"
      }
    ]
  },
  {
    "slug": "zuberlin",
    "name": "Futura Camp (ZuBerlin)",
    "tagline": "Immersive tech coliving residency",
    "location": "Berlin, Germany",
    "type": "popup",
    "themes": [
      "Tech"
    ],
    "website": "https://futura.camp",
    "image": "/popups/zuberlin.jpg",
    "sources": [
      "ns"
    ],
    "socials": {
      "x": "https://x.com/JoinFutura"
    },
    "summary": "A Berlin coliving residency bridging cutting-edge tech with dense human connection.",
    "body": [
      "Futura Camp, also listed as ZuBerlin, runs immersive coliving residencies in Berlin.",
      "The format borrows Zu-style intensity while staying residency-shaped rather than full city-scale.",
      "Builders come for a focused stretch of living and shipping together."
    ],
    "coverImages": [],
    "pricing": [],
    "amenities": [],
    "history": [],
    "durationNotes": [],
    "locationDetails": [],
    "overview": [],
    "xyzUrl": null,
    "posts": [
      {
        "url": "https://x.com/mostlyblocks/status/1912473709530488979",
        "author": "mostlyblocks",
        "username": "mostlyblocks",
        "text": "ZuBerlin was the best conference I attended last year. Good, small group, and focused discussions.",
        "date": "2025-04-16"
      },
      {
        "url": "https://x.com/hasufl/status/1935985267015311560",
        "author": "hasufl",
        "username": "hasufl",
        "text": "Protocol & MEV Day at ZuBerlin is a must-watch. I wish I were there this year, but following the live stream is the next best thing!",
        "date": "2025-06-20"
      },
      {
        "url": "https://x.com/evgenidefi/status/1940768366278607216",
        "author": "Ev",
        "username": "evgenidefi",
        "text": "ZuBerlin was less than 2 weeks ago and I already miss it. Having the opportunity to talk to brilliant minds in a chill environment is unbeatable.",
        "date": "2025-07-03"
      }
    ]
  },
  {
    "slug": "gelephu",
    "name": "Gelephu Mindfulness City",
    "tagline": "Bhutanese SEZ and startup city",
    "location": "Bhutan",
    "type": "sez",
    "themes": [
      "Governance",
      "Business"
    ],
    "website": "https://gmc.bt",
    "image": "/popups/gelephu.jpg",
    "sources": [
      "ns"
    ],
    "socials": {
      "x": "https://x.com/gmcbhutan"
    },
    "summary": "An emerging special economic zone and startup city project in Bhutan.",
    "body": [
      "Gelephu Mindfulness City is Bhutan’s high-profile attempt at a new SEZ-style startup city.",
      "Unlike monthlong popups, the ambition is a lasting jurisdictional and urban project.",
      "It appears in Network School’s dashboard as a national-scale startup city bet."
    ],
    "coverImages": [],
    "pricing": [],
    "amenities": [],
    "history": [],
    "durationNotes": [],
    "locationDetails": [],
    "overview": [],
    "xyzUrl": null,
    "posts": [
      {
        "url": "https://x.com/realMaxAvery/status/2001657329717068282",
        "author": "Max Avery",
        "username": "realMaxAvery",
        "text": "Bhutan has pledged up to 10,000 Bitcoin to fund development of Gelephu Mindfulness City, treating BTC as a strategic national asset and advancing its blockchain-based economic diversification strategy.",
        "date": "2025-12-18"
      },
      {
        "url": "https://x.com/vibhu/status/2026164618725306733",
        "author": "Vibhu",
        "username": "vibhu",
        "text": "The Bhutan government just launched the world's first Solana-backed visa for digital nomads.",
        "date": "2026-02-24"
      },
      {
        "url": "https://x.com/JoinEdgeCity/status/2044078707787051014",
        "author": "Edge City",
        "username": "JoinEdgeCity",
        "text": "We're launching a mentorship residency in Bhutan. Edge City is sending international mentors to Gelephu (site of the new Gelephu Mindfulness City) to work with Pelsung, a national youth program launched by His Majesty the King.",
        "date": "2026-04-14"
      }
    ]
  },
  {
    "slug": "hrg",
    "name": "Hacker Residency Group",
    "tagline": "Indie hacker coliving residency",
    "location": "Da Nang, Vietnam",
    "type": "popup",
    "themes": [
      "Tech"
    ],
    "website": "https://www.hackerresidencygroup.com",
    "image": "/popups/hrg.jpg",
    "sources": [
      "ns"
    ],
    "socials": {
      "x": "https://x.com/HackerResidency"
    },
    "summary": "A residency format for ambitious indie hackers who want locked-in build time together.",
    "body": [
      "Hacker Residency Group runs coliving residencies aimed at indie hackers who want fewer distractions and more peers.",
      "Da Nang is the current geographic anchor listed on the Network School dashboard.",
      "The product is focused residency energy, not a permanent charter city."
    ],
    "coverImages": [],
    "pricing": [],
    "amenities": [],
    "history": [],
    "durationNotes": [],
    "locationDetails": [],
    "overview": [],
    "xyzUrl": null,
    "posts": [
      {
        "url": "https://x.com/robj3d3/status/1992508526166704296",
        "author": "robj3d3",
        "username": "robj3d3",
        "text": "This is what indie hacker heaven looks like.",
        "date": "2025-11-23"
      },
      {
        "url": "https://x.com/CoachDanGo/status/1994755864373366814",
        "author": "CoachDanGo",
        "username": "CoachDanGo",
        "text": "For the past month I got to hang with the powerful team of founders at the Hacker Residency.",
        "date": "2025-11-29"
      }
    ]
  },
  {
    "slug": "infinita",
    "name": "Infinita",
    "tagline": "Longevity network city in Próspera",
    "location": "Roatán, Honduras",
    "type": "permanent",
    "themes": [
      "Biotech",
      "Longevity",
      "Tech"
    ],
    "website": "https://www.infinita.city",
    "image": "/popups/xyz/infinita/logo.webp",
    "foundedYear": 2023,
    "sources": [
      "ns",
      "xyz"
    ],
    "socials": {
      "x": "https://x.com/infinitacity"
    },
    "summary": "A longevity and biotech-focused network city nested inside Próspera.",
    "body": [
      "Infinita concentrates founders working on longevity and biotech inside Próspera’s Roatán jurisdiction.",
      "Shared research, coliving, and scientific collaboration are the daily surface area.",
      "It is a nested society: legal wrapper from Próspera, thematic focus from Infinita."
    ],
    "coverImages": [
      "/popups/xyz/infinita/village.webp",
      "/popups/xyz/infinita/banner.webp",
      "/popups/xyz/infinita/talk.webp"
    ],
    "pricing": [
      "Infinita City offers multiple housing options",
      "Beta Hostel",
      "$24/night",
      "Shared rooms",
      "Duna Tower",
      "$100/night",
      "Private rooms. 1-2 bedrooms",
      "Pristine Bay",
      "$240/night",
      "Villas. 2-5 bedrooms",
      "Las Verandas",
      "$149/night",
      "Rooms or Villas. 1-3 bedrooms"
    ],
    "pricingSummary": "Infinita City offers multiple housing options Beta Hostel",
    "amenities": [
      "Shared or private bedrooms",
      "Bathrooms",
      "Co-working space",
      "Bitcoin ATM",
      "WiFi",
      "Cafés",
      "Gym",
      "Sauna and cold plunge",
      "TV.*",
      "Infinity pool.*",
      "Washing machine.*",
      "NODE Pass - $100/month or $3/day if purchased",
      "separately - is included in every housing option and gives access to every space and community",
      "events",
      "*Beta Hostel does not include these",
      "Extras",
      "Próspera food for $20/day",
      "Roatán's local food for $30/day",
      "Longevity therapy starting at $10,000",
      "Wellness & Lifestyle upgrade for $90",
      "Car rental starting at $50/day",
      "Curated outdoor adventures for $25",
      "Professional service providers ranging from $349 to $10,000"
    ],
    "history": [
      "Built on top of Próspera 's infrastructure, Infinita City is the continuation of the work behind Vitalia City",
      "From January to March 2024, in Próspera, Vitalia City hosted Vitalia, one of the first pop-up villages focused on longevity and biotech",
      "Later, Vitalia got rebranded to Infinita City under the leadership of Niklas Anzinger, one of the former co-founders",
      "During 2025, it launched a digital token - $LIVES - and hosted 3 pop-up villages",
      "Infinita City 2025",
      "January - March",
      "Crypto Cities",
      "June",
      "Bio-Frontiers",
      "September",
      "In 2026, Infinita hosts BioHub Residency, Infinite Games, and a series of other events"
    ],
    "durationNotes": [
      "Infinita's hub, home to its community, is permanent and hosts people all year round",
      "Its pop-up villages last 1 to 2 months"
    ],
    "locationDetails": [
      "Infinita has a physical hub with multiple buildings in Próspera, the special economic zone on the island of Roatán, Honduras, where it hosts pop-up villages and other events"
    ],
    "overview": [
      "Infinita is a layer-two network state at Próspera, Honduras, where founders create in longevity, biotech, science, and computation"
    ],
    "xyzUrl": "https://xyz.city/network-states/infinita",
    "posts": [
      {
        "url": "https://x.com/Warkez87/status/2047155270267158650",
        "author": "L vaskez",
        "username": "Warkez87",
        "text": "This year our Art program at Infinita was a success in many aspects and especially in the involvement of the local community, opening of spaces (art studio), exhibitions, workshops.",
        "date": "2026-04-23"
      },
      {
        "url": "https://x.com/Gonzohall/status/2037681981123658002",
        "author": "Gonçalo Hall",
        "username": "Gonzohall",
        "text": "One of the heaviest most interesting panels I ever witnessed live. Thank you Infinita for organizing such a mind blowing experience.",
        "date": "2026-03-28"
      }
    ]
  },
  {
    "slug": "ipe",
    "name": "Ipê City",
    "tagline": "Internet-native city experiments",
    "location": "Brazil / Global",
    "type": "popup",
    "themes": [
      "Crypto",
      "Tech",
      "Governance",
      "AI"
    ],
    "website": "https://docs.ipe.city",
    "image": "/popups/xyz/ipe-city/logo.webp",
    "foundedYear": 2023,
    "sources": [
      "ns",
      "xyz"
    ],
    "socials": {
      "x": "https://x.com/ipecity",
      "discord": "https://discord.gg/QKwh8deMPx",
      "telegram": "https://t.me/+kmGbiSj7XFRhZjUx"
    },
    "summary": "Techno-optimist popups and social tech for internet-native cities, starting in Brazil.",
    "body": [
      "Ipê City is known for Brazil’s early popup-city experiments around blockchain governance, AI tools, and startup-society practice.",
      "The community now frames itself more broadly as builders of social technologies for internet-native cities.",
      "Expect monthlong co-living intensity with a strong South American base and global participation."
    ],
    "coverImages": [
      "/popups/xyz/ipe-city/views.webp",
      "/popups/xyz/ipe-city/talk.webp"
    ],
    "pricing": [
      "Pricing is tiered. For Ipê Village II, as reference:",
      "Explorer",
      "$400 full month or $150/wk",
      "Access to coworking and events",
      "Daily breakfast",
      "6-month access to Ipê community",
      "Architect",
      "$400",
      "Everything in Explorer",
      "Access to $10k+ in grants",
      "1-year access to Ipê community",
      "Team",
      "Price info upon request",
      "Launch in real-world sandbox",
      "Iterate daily with early adopters",
      "Integrate product and collect data",
      "Architect passports are limited. Applicants must undergo a selection process and stay in the",
      "pop-up village for at least 3 weeks"
    ],
    "pricingSummary": "Pricing is tiered. For Ipê Village II, as reference: Explorer",
    "amenities": [
      "Co-working hub",
      "Daily breakfast",
      "Fitness sessions",
      "Grants",
      "Talks and conferences",
      "Hacker houses hosting workshops, lectures, and events",
      "Participants must book their own accommodation on Airbnb or hotels. Ipê City might share a list of discounted places"
    ],
    "history": [
      "Ipê City was founded in 2023 by Jean Hansen, driven by the frustration with the stagnant, deteriorating state of Western governance and culture",
      "In 2025, it hosted Brazil's first pop-up city, Ipê Village I, a one-month event in Florianópolis. Over 300 participants lived together and prototyped solutions for governance",
      "In 2026, Ipê City is hosting Ipê Village II, expanding on the previous edition with a focus on prototyping the operating system of a new city"
    ],
    "durationNotes": [
      "Both pop-up villages - Ipê Village I and Ipê Village II - run for 1 month. Participants can join for the full duration or shorter periods",
      "Ipê City aims to evolve into a permanent network of villages, condominiums, cottages, and",
      "small towns worldwide where members can move, stay, and own property"
    ],
    "locationDetails": [
      "Ipê City runs its events in Florianópolis, Brazil, specifically in the Jurerê Internacional neighborhood for pop-up villages",
      "Florianópolis is one of Brazil's largest tech hubs with 2,000+ start-ups"
    ],
    "overview": [
      "Ipê City is a community of techno-optimists building social technologies for internet-native cities and prototyping governance through pop-up villages in Brazil",
      "Principles",
      "Pro-Tech Innovation",
      "Pro-Freedom",
      "Pro-Human Progress"
    ],
    "xyzUrl": "https://xyz.city/network-states/ipe-city",
    "posts": [
      {
        "url": "https://x.com/JoyceBrand12/status/2046253612766998875",
        "author": "Joyce Brand",
        "username": "JoyceBrand12",
        "text": "I loved the healthy Ipé breakfast and interesting open mix when I was there.",
        "date": "2026-04-20"
      },
      {
        "url": "https://x.com/itzdezydank/status/1925548166209851431",
        "author": "Dezydank",
        "username": "itzdezydank",
        "text": "Amazing work with Ipê Village. It's inspiring to see how design can shape the future of governance and community in such an innovative space.",
        "date": "2025-05-22"
      }
    ]
  },
  {
    "slug": "mtndao",
    "name": "mtndao",
    "tagline": "Solana popup villages in Utah",
    "location": "Salt Lake City, Utah, USA",
    "type": "popup",
    "themes": [
      "Crypto"
    ],
    "website": "https://lnk.bio/mtndao",
    "image": "/popups/mountaindao.jpg",
    "sources": [
      "ns"
    ],
    "socials": {
      "x": "https://x.com/mtndao"
    },
    "summary": "Monthlong Solana founder popups centered on Salt Lake City.",
    "body": [
      "mtndao runs monthlong popup villages for Solana founders and builders in Utah.",
      "The format is classic popup: temporary density, high shipping pressure, then disperse.",
      "It is one of the clearest US Solana-native entries on the Network School list."
    ],
    "coverImages": [],
    "pricing": [],
    "amenities": [],
    "history": [],
    "durationNotes": [],
    "locationDetails": [],
    "overview": [],
    "xyzUrl": null,
    "posts": [
      {
        "url": "https://x.com/naruto11eth/status/2041898462006915399",
        "author": "naruto11eth",
        "username": "naruto11eth",
        "text": "Actually mtndao fosters that 10x better than any company out there. i have seen it with my own eyes. these were devs who have potential to be great founders and they were building all day long at mtndao from 7am to 2am.",
        "date": "2026-04-08"
      },
      {
        "url": "https://x.com/edgarpavlovsky/status/2031461586737807407",
        "author": "edgarpavlovsky",
        "username": "edgarpavlovsky",
        "text": "The power of this winter's mtndao came, above all, from the distribution of velocity amongst the community. Velocity's a common feeling at the MTN - that's not new. But usually it's concentrated - you have relatively small groups driving motion at any given time, and the community sustains on that.",
        "date": "2026-03-11"
      }
    ]
  },
  {
    "slug": "noma",
    "name": "Noma Collective",
    "tagline": "Network society for digital nomads",
    "location": "Global",
    "type": "popup",
    "themes": [
      "Culture",
      "Tech"
    ],
    "website": "https://www.noma-collective.com",
    "image": "/popups/nomacollective.png",
    "sources": [
      "ns"
    ],
    "socials": {
      "x": "https://x.com/noma_collective"
    },
    "summary": "A roaming network society for digital nomads and remote builders.",
    "body": [
      "Noma Collective organizes remote builders into a recurring network-society format rather than a single fixed city.",
      "Locations change, while the social graph and operating cadence stay consistent.",
      "It is popup-shaped, but the continuity lives in the collective more than the venue."
    ],
    "coverImages": [],
    "pricing": [],
    "amenities": [],
    "history": [],
    "durationNotes": [],
    "locationDetails": [],
    "overview": [],
    "xyzUrl": null,
    "posts": [
      {
        "url": "https://x.com/James_of_Arc/status/2010725713566150903",
        "author": "James of Arc",
        "username": "James_of_Arc",
        "text": "I've run 3 popups cities, which is more than almost anyone. Except Dan. Noma Collective has run 50+ fully immersive month long experiences all across the world - and is rapidly scaling.",
        "date": "2026-01-12"
      },
      {
        "url": "https://x.com/Logos_network/status/1902755156690612564",
        "author": "Logos",
        "username": "Logos_network",
        "text": "Nomadism has been a way of life for millenia - are network states a natural evolution? Join us for 'Nomadism and Network States' with Daniel from Noma Collective.",
        "date": "2025-03-21"
      }
    ]
  },
  {
    "slug": "nomad",
    "name": "Nomad",
    "tagline": "Coliving villages for modern nomads",
    "location": "USA / Honduras",
    "type": "popup",
    "themes": [
      "Business",
      "Tech"
    ],
    "website": "https://nomad.homes",
    "image": "/popups/nomad.jpg",
    "sources": [
      "ns"
    ],
    "socials": {
      "x": "https://x.com/NOMADcoliving"
    },
    "summary": "Builds coliving village accommodation for modern nomads across US and Honduras sites.",
    "body": [
      "Nomad focuses on the housing product: coliving villages designed for people who already live between cities.",
      "Listed geographies include the USA and Honduras, putting it near other Central American experiments.",
      "Think infrastructure layer for nomads, not a one-off festival brand."
    ],
    "coverImages": [],
    "pricing": [],
    "amenities": [],
    "history": [],
    "durationNotes": [],
    "locationDetails": [],
    "overview": [],
    "xyzUrl": null,
    "posts": [
      {
        "url": "https://x.com/NOMADcoliving/status/1986518413607313792",
        "author": "NOMAD",
        "username": "NOMADcoliving",
        "text": "We've officially partnered with another Triangle-based startup BotBuilt to panelize our units with significant cost savings on materials & labor.",
        "date": "2025-11-07"
      },
      {
        "url": "https://x.com/Indian_Bronson/status/1786572458834670021",
        "author": "ib",
        "username": "Indian_Bronson",
        "text": "There have been a lot of modular and upscale small homes for years now - someone finally decided to build a village out of them.",
        "date": "2024-05-04"
      },
      {
        "url": "https://x.com/ProsperaGlobal/status/1986529798701592861",
        "author": "Próspera",
        "username": "ProsperaGlobal",
        "text": "We're excited to have Nomad developing high-quality housing in Próspera!",
        "date": "2025-11-07"
      }
    ]
  },
  {
    "slug": "proto",
    "name": "Proto-Town",
    "tagline": "Hardware build town in Texas",
    "location": "Lockhart, Texas, USA",
    "type": "sez",
    "themes": [
      "Tech"
    ],
    "website": "https://www.proto.town",
    "image": "/popups/prototown.jpg",
    "sources": [
      "ns"
    ],
    "socials": {
      "x": "https://x.com/Proto_Town"
    },
    "summary": "A place specifically set up for people who want to build hardware in Lockhart, Texas.",
    "body": [
      "Proto-Town is blunt about its purpose: a town-shaped environment for hardware builders.",
      "Lockhart, Texas is the geographic bet, outside the usual crypto-popup beach circuit.",
      "It reads more like a specialized startup city than a temporary village."
    ],
    "coverImages": [],
    "pricing": [],
    "amenities": [],
    "history": [],
    "durationNotes": [],
    "locationDetails": [],
    "overview": [],
    "xyzUrl": null,
    "posts": [
      {
        "url": "https://x.com/ashleevance/status/2047673477612896727",
        "author": "Ashlee Vance",
        "username": "ashleevance",
        "text": "For the past two years, some folks in Texas have been creating a new hardware city out in the middle of nowhere. It's called Proto-Town, and it's both weird and wonderful. There are startups and people living in trailers right next to their machines.",
        "date": "2026-04-23"
      },
      {
        "url": "https://x.com/YIMBYLAND/status/2047759622883221644",
        "author": "YIMBYLAND",
        "username": "YIMBYLAND",
        "text": "Proto-Town has become the de-facto proving ground for Austin hardware startups. It's a place where the question is 'what are you building?', not 'what are you allowed to build?'.",
        "date": "2026-04-23"
      },
      {
        "url": "https://x.com/YIMBYLAND/status/1898567294176973171",
        "author": "YIMBYLAND",
        "username": "YIMBYLAND",
        "text": "Had such an awesome time checking out Proto-Town today. Austin hardware startups are cooking with gas. So many great companies and people around here.",
        "date": "2025-09-08"
      },
      {
        "url": "https://x.com/William_Blake/status/2047486386622845354",
        "author": "Michael P Gibson",
        "username": "William_Blake",
        "text": "Proto-Town is true frontier @Proto_Town",
        "date": "2026-04-22"
      }
    ]
  },
  {
    "slug": "rns",
    "name": "RNS.ID",
    "tagline": "Palau-backed digital residency",
    "location": "Palau / Global",
    "type": "popup",
    "themes": [
      "Governance"
    ],
    "website": "https://rns.id",
    "image": "/popups/rnsid.jpg",
    "sources": [
      "ns"
    ],
    "socials": {
      "x": "https://x.com/RNS_global"
    },
    "summary": "A government-backed digital residency program issued with the Republic of Palau.",
    "body": [
      "RNS.ID sells digital residency rather than a physical popup campus.",
      "The interesting part is the state partnership: Palau provides the government wrapper for a global digital ID product.",
      "It belongs in this directory as digital jurisdiction infrastructure, not as a coliving brand."
    ],
    "coverImages": [],
    "pricing": [],
    "amenities": [],
    "history": [],
    "durationNotes": [],
    "locationDetails": [],
    "overview": [],
    "xyzUrl": null,
    "posts": [
      {
        "url": "https://x.com/d_gilz/status/2015165066077667393",
        "author": "d_gilz",
        "username": "d_gilz",
        "text": "Used my Palau ID to get into club last night because I lost my real one and it worked.",
        "date": "2026-01-25"
      },
      {
        "url": "https://x.com/RNS_global/status/1696054313234334045",
        "author": "RNS_global",
        "username": "RNS_global",
        "text": "Honored to have Vitalik Buterin mint the first Legal DID (Legal Decentralized ID). Your ZK legal identity on chain.",
        "date": "2023-08-28"
      },
      {
        "url": "https://x.com/revolut20/status/1742195484469436643",
        "author": "revolut20",
        "username": "revolut20",
        "text": "Truly enjoying my RNS Digital ID. I've been using it personally for traveling, hotel check in and KYC for some CEXs.",
        "date": "2024-01-02"
      }
    ]
  },
  {
    "slug": "shw",
    "name": "ShanHaiWoo",
    "tagline": "Ethereum builder popup villages",
    "location": "Global",
    "type": "popup",
    "themes": [
      "Crypto",
      "AI",
      "Tech"
    ],
    "website": "https://www.shanhaiwoo.com",
    "image": "/popups/xyz/shanhaiwoo/logo.webp",
    "foundedYear": 2023,
    "sources": [
      "ns",
      "xyz"
    ],
    "socials": {
      "x": "https://x.com/shanhaiwoo",
      "telegram": "https://t.me/+oK48BwpNhlRjN2U1"
    },
    "summary": "Annual and roaming popup villages for Ethereum and AI builders with a mythic, gamified culture.",
    "body": [
      "ShanHaiWoo organizes immersive popup villages where engineers, researchers, and founders live together and ship real applications.",
      "The Singapore Innovis editions and later roaming villages mix mythology, games, and builder culture on purpose.",
      "If you want a Zu-like month with a distinct aesthetic, this is one of the main brands."
    ],
    "coverImages": [
      "/popups/xyz/shanhaiwoo/people.webp",
      "/popups/xyz/shanhaiwoo/vitalik.webp"
    ],
    "pricing": [
      "ShanHaiWoo Beidahu *",
      "Resident: $70/month or $17.5/week",
      "Guest: $112/month or $28/week",
      "Total ticket sales totaled roughly $1,932",
      "ShanHaiWoo Chiang Mai",
      "Wave 01: $199/6-weeks or $50/week",
      "Closed 15 days before event start",
      "Wave 02: $269/6-weeks or $80/week",
      "Closed the day the event started",
      "Ticket prices increased once the event began",
      "ShanHaiWoo Singapore",
      "No participation fee was charged. Given the high costs of staying in Singapore, ShanHaiWoo offered a limited number of scholarships to students and builders",
      "Each scholarship was valued at around $2,500. A total of 121 scholarships were received,",
      "and only 28 (21.2%) were accepted",
      "*Values rounded from RMB to USD at the rate of 1 RMB = 0.14 USD"
    ],
    "pricingSummary": "ShanHaiWoo Beidahu * Resident: $70/month or $17.5/week",
    "amenities": [
      "Co-working space",
      "Lecture hall",
      "Meeting rooms",
      "Workshops, lectures, and events",
      "Flights, accommodation, and meals are usually not included in the ticket price"
    ],
    "history": [
      "ShanHaiWoo was one of the earliest Zuzalu -inspired network state experiments. Since then, it has hosted several pop-up villages:",
      "2023 - The founding year. ShanHaiWoo Beidahu is hosted in a ski resort in Northeast China",
      "2024 - Moving south, ShanHaiWoo hosts its second physical meetup, a co-learning and co-creating 6-week pop-up village in Thailand - ShanHaiWoo Chiang Mai",
      "2025 - Further south, in Singapore, ShanHaiWoo organizes ShanHaiWoo Singapore, a one-month village that attracted over 200 builders",
      "In 2026, it plans to host a pop-up village before Devcon 2026"
    ],
    "durationNotes": [
      "ShanHaiWoo runs week-long and month-long temporary physical nodes",
      "It isn’t yet established in a permanent spot"
    ],
    "locationDetails": [
      "ShanHaiWoo has hosted events across Asia",
      "ShanHaiWoo Beidahu - Beidahu, a ski resort located in Jilin, China",
      "ShanHaiWoo Chiang Mai - The Wall Nimman, a community center located in Chiang Mai, Thailand",
      "ShanHaiWoo Singapore - Innovis, a corporate office located in Singapore"
    ],
    "overview": [
      "ShanHaiWoo is a community that builds month-long pop-up villages, inspired by Chinese mythology"
    ],
    "xyzUrl": "https://xyz.city/network-states/shanhaiwoo",
    "posts": [
      {
        "url": "https://x.com/Cryptotracy27/status/1840348176760643595",
        "author": "Tracy大表姐",
        "username": "Cryptotracy27",
        "text": "Great to see that ShanHaiWoo, a web3 community  with Chinese roots, is making its debut in Chiang Mai.",
        "date": "2024-09-29"
      },
      {
        "url": "https://x.com/robinsoncodes/status/2002073040981778537",
        "author": "allanrobinson",
        "username": "robinsoncodes",
        "text": "Grateful to have been part of ShanHaiWoo Singapore 2025 an incredible experience. Learned a lot, built meaningful projects & made lasting connections with amazing people  around the world. Huge respect to the team for making this happen.",
        "date": "2025-12-20"
      }
    ]
  },
  {
    "slug": "starbase",
    "name": "Starbase",
    "tagline": "Aerospace startup city in Texas",
    "location": "Texas, USA",
    "type": "sez",
    "themes": [
      "Tech",
      "Business"
    ],
    "website": "https://www.starbase.texas.gov",
    "image": "/popups/starbase.png",
    "sources": [
      "ns"
    ],
    "socials": {
      "x": "https://x.com/StarbaseTX"
    },
    "summary": "The Texas aerospace city known as Starbase, listed among startup-society experiments.",
    "body": [
      "Starbase is the Texas aerospace city project frequently nicknamed the gateway to Mars.",
      "It lands in this directory as a large-scale startup city adjacent to the network-state conversation.",
      "Unlike crypto popups, the industrial and municipal stakes are the main story."
    ],
    "coverImages": [],
    "pricing": [],
    "amenities": [],
    "history": [],
    "durationNotes": [],
    "locationDetails": [],
    "overview": [],
    "xyzUrl": null,
    "posts": [
      {
        "url": "https://x.com/StarbaseTX/status/2046361702753534365",
        "author": "Starbase, TX",
        "username": "StarbaseTX",
        "text": "Grateful for a community that shows up. This weekend, 585 volunteers covered all 6.5 miles of Boca Chica Beach and removed 5,740 lbs of debris.",
        "date": "2026-04-21"
      },
      {
        "url": "https://x.com/StarbaseTX/status/2037249033111036352",
        "author": "Starbase, TX",
        "username": "StarbaseTX",
        "text": "Starbase residents are teaming up to build a community library!",
        "date": "2026-03-27"
      },
      {
        "url": "https://x.com/Gfilche/status/2048150098211967479",
        "author": "Gali",
        "username": "Gfilche",
        "text": "Im gonna visit Starbase. It’s the most inspiring thing happening in America 🇺🇸",
        "date": "2026-04-26"
      }
    ]
  },
  {
    "slug": "mu",
    "name": "The Mu",
    "tagline": "Global popup village facilitator",
    "location": "Shanghai / Global",
    "type": "popup",
    "themes": [
      "Crypto",
      "Tech"
    ],
    "website": "https://the-mu.xyz",
    "image": "/popups/xyz/the-mu/logo.webp",
    "foundedYear": 2023,
    "sources": [
      "ns",
      "xyz"
    ],
    "socials": {
      "x": "https://x.com/themu_xyz",
      "telegram": "https://t.me/+dngZ49zj9hE1YzM1"
    },
    "summary": "A facilitator network for popup villages and local community projects worldwide.",
    "body": [
      "The Mu helps stand up popup villages across multiple cities while staying engaged with local communities.",
      "Shanghai is a notable base, but the operating model is multi-site facilitation.",
      "Think producer/organizer layer for temporary builder cities."
    ],
    "coverImages": [
      "/popups/xyz/the-mu/community.webp",
      "/popups/xyz/the-mu/accra.webp",
      "/popups/xyz/the-mu/buenos.webp"
    ],
    "pricing": [
      "Most pop-up villages that the-mu hosts are free to attend",
      "Accommodation is usually included, mainly for developers. It can also be partially covered by housing grants",
      "the-mu’s pop-up villages often include hackathons featuring prize pools in the tens of",
      "thousands of dollars"
    ],
    "pricingSummary": "Most pop-up villages that the-mu hosts are free to attend Accommodation is usually included, mainly for developers. It can also be partially covered by housing grants",
    "amenities": [],
    "history": [
      "the-mu has been organizing pop-up cities across various continents since 2023",
      "In 2023, it hosted muChiangMai, the first web3 pop-up city in Southeast Asia",
      "The year after, muBuenos ran for six weeks in Argentina and muAccra for two weeks in Ghana",
      "In 2025, the-mu was present at Expo 2025 in Japan, and, in 2026, it hosts a one-month pop-up city in Shanghai - muShanghai"
    ],
    "durationNotes": [
      "the-mu's pop-up villages typically last 2 to 6 weeks"
    ],
    "locationDetails": [
      "the-mu hosts pop-up villages across various continents, though its roots are in Asia",
      "muChiangMai",
      "Asia",
      "muBuenos",
      "South America",
      "muAccra",
      "Africa",
      "muShanghai",
      "Asia"
    ],
    "overview": [
      "the-mu is a community of digital nomads organizing pop-up cities focused on blockchain, cryptography, and web3 technologies"
    ],
    "xyzUrl": "https://xyz.city/network-states/the-mu",
    "posts": [
      {
        "url": "https://x.com/realNathanCheng/status/2033858443225038990",
        "author": "Nathan Cheng",
        "username": "realNathanCheng",
        "text": "Cool china gateway popup in Shanghai happening in May. There's also a longevity/biotech theme week.",
        "date": "2026-03-17"
      },
      {
        "url": "https://x.com/kokebsolomon/status/2046841369436516595",
        "author": "Koko",
        "username": "kokebsolomon",
        "text": "Are you like me? Endlessly curious about the country behind it all? Most have consumed everything China produces. Almost none have gone to understand how OR the culture that made it that way. MuShanghai is the month that closes that gap.",
        "date": "2026-04-22"
      },
      {
        "url": "https://x.com/_jboflagos/status/1871817696712753514",
        "author": "JB of Lagos",
        "username": "_jboflagos",
        "text": "I travelled to Ghana for the first time to participate in Mu Accra. I'm super grateful to Pishikeni who helped with the information and it was a great experience to share the same space with amazing builders from across the continent.",
        "date": "2024-12-25"
      }
    ]
  },
  {
    "slug": "tdf",
    "name": "Traditional Dream Factory",
    "tagline": "Regenerative web3 village in Portugal",
    "location": "Portugal",
    "type": "permanent",
    "themes": [
      "Crypto",
      "Culture"
    ],
    "website": "https://www.traditionaldreamfactory.com",
    "image": "/popups/traditionaldreamfactory.jpg",
    "sources": [
      "ns"
    ],
    "socials": {
      "x": "https://x.com/tdfinyourdreams"
    },
    "summary": "A regenerative coliving village in Portugal with a web3-native community.",
    "body": [
      "Traditional Dream Factory runs a regenerative coliving village in Portugal.",
      "The emphasis is longer-stay land-based community rather than a traveling monthlong popup.",
      "It shows up on the Network School dashboard as a European permanent node."
    ],
    "coverImages": [],
    "pricing": [],
    "amenities": [],
    "history": [],
    "durationNotes": [],
    "locationDetails": [],
    "overview": [],
    "xyzUrl": null,
    "posts": [
      {
        "url": "https://x.com/ReFiPodcast/status/1806785259767230677",
        "author": "ReFi Podcast",
        "username": "ReFiPodcast",
        "text": "And shoutout to TDF! They are pioneering a model for regenerative co-living, creating positive loops among all stakeholders, including nature and future generations.",
        "date": "2024-06-29"
      },
      {
        "url": "https://x.com/samueldelesque/status/1958572345200665048",
        "author": "Samuel Delesque",
        "username": "samueldelesque",
        "text": "Wi-Fi and cheap flights don't equal belonging. That's why we started building Traditional Dream Factory in Portugal: a place where remote work meets soil, community, and long-term purpose.",
        "date": "2025-08-22"
      }
    ]
  },
  {
    "slug": "vibe",
    "name": "Vibecamp",
    "tagline": "IRL festival for internet communities",
    "location": "USA / Global",
    "type": "popup",
    "themes": [
      "Culture"
    ],
    "website": "https://vibe.camp",
    "image": "/popups/vibecamp.jpg",
    "sources": [
      "ns"
    ],
    "socials": {
      "x": "https://x.com/vibecamp_"
    },
    "summary": "A recurring IRL festival for the TPOT cloud community and adjacent internet scenes.",
    "body": [
      "Vibecamp is a festival-shaped gathering for online communities that want a high-trust IRL week.",
      "It is less jurisdiction and more culture: temporary intensity, then back to the timeline.",
      "Include it when you are mapping popup-adjacent gatherings, not only SEZs."
    ],
    "coverImages": [],
    "pricing": [],
    "amenities": [],
    "history": [],
    "durationNotes": [],
    "locationDetails": [],
    "overview": [],
    "xyzUrl": null,
    "posts": [
      {
        "url": "https://x.com/SH2F088/status/2044488053998424168",
        "author": "Deep Learning",
        "username": "SH2F088",
        "text": "When I'm in a \"normal\" social environment, I find people very approachable.  But, if I do, ~85% of the time I'm quickly bored. Vibecamp flips that around.  People are flying their freak flags, and can seem less approachable. But when I did apprroach, ~85% of the time it was great, often with a solid connection.",
        "date": "2026-04-16"
      },
      {
        "url": "https://x.com/akarlin/status/1813938105734271012",
        "author": "Anatoly Karlin",
        "username": "akarlin",
        "text": "Vibecamp is the Burning Man for TPOT, i.e. smaller and cooler since not yet corporatized.",
        "date": "2024-07-18"
      },
      {
        "url": "https://x.com/robinhanson/status/1669714285910474754",
        "author": "Robin Hanson",
        "username": "robinhanson",
        "text": "I'm impressed so far with Vibecamp; it really has successfully cultivated a nice vibe. Its not a public park, party, or amusement park. And its not a conference. It is somewhere nicely chill between.",
        "date": "2023-06-16"
      }
    ]
  },
  {
    "slug": "zanzalu",
    "name": "Zanzalu",
    "tagline": "Popup village in Zanzibar",
    "location": "Zanzibar, Tanzania",
    "type": "popup",
    "themes": [
      "Culture",
      "Tech"
    ],
    "website": "https://zanzalu.org",
    "image": "/popups/xyz/zanzalu/logo.webp",
    "foundedYear": 2024,
    "sources": [
      "ns",
      "xyz"
    ],
    "socials": {
      "x": "https://x.com/_zanzalu",
      "telegram": "https://t.me/+9P9e-eWZ581jZDIx"
    },
    "summary": "A recurring popup village in Fumba Town bringing African and international builders together.",
    "body": [
      "Zanzalu runs recurring builder popups in Zanzibar with a mix of local and overseas technologists.",
      "Summer coliving density is the product: live together, collaborate, leave with projects and relationships.",
      "It is one of the main East African entries shared across both directories."
    ],
    "coverImages": [
      "/popups/xyz/zanzalu/zanzibar.webp",
      "/popups/xyz/zanzalu/talk.webp"
    ],
    "pricing": [
      "Tickets for pop-up villages depend on the edition and often have 10-20% early bird discounts",
      "Base prices for Zanzalu 2026:",
      "3-Week Pass",
      "$300",
      "3-Week Pass - African Nationals",
      "$200",
      "Week Pass",
      "$150",
      "Week Pass - African Nationals",
      "$100"
    ],
    "pricingSummary": "Tickets for pop-up villages depend on the edition and often have 10-20% early bird discounts Base prices for Zanzalu 2026:",
    "amenities": [
      "Co-working spaces",
      "Daily breakfast",
      "Wi-Fi",
      "Beach access",
      "Workshops, lectures, and events",
      "Gym, kayaking, snorkeling, and biking are available for extra cost",
      "Accommodation, transportation, and meals should be arranged by the participant"
    ],
    "history": [
      "Zanzalu launched its first edition - Zanzalu 1.0 - in 2024 as a five-week pop-up village in Zanzibar, focusing on workshops, talks on urban development, experimental governance, Web3 technologies, and cultural change",
      "In 2025, Zanzalu hosted Zanzalu 2.0, collaborating with Logos for the Road to Parallel Society event",
      "The 2026 edition - Zanzalu 3.0 - runs from July 25 to August 14"
    ],
    "durationNotes": [
      "Zanzalu hosts annual pop-up villages lasting 2 to 5 weeks usually",
      "It aims to evolve into a permanent hub in Fumba Town by 2027, aimed for residencies,",
      "experimentation, and events"
    ],
    "locationDetails": [
      "Zanzalu pop-up villages take place in Fumba Town, Zanzibar, Tanzania, an urbanization initiative within the area of the Fumba Special Economic Zone"
    ],
    "overview": [
      "Zanzalu is a pop-up city and living laboratory where innovators from Africa and beyond collaborate toward an abundant future",
      "1100+",
      "participants",
      "75+",
      "full-time residents",
      "100+",
      "sessions"
    ],
    "xyzUrl": "https://xyz.city/network-states/zanzalu",
    "posts": [
      {
        "url": "https://x.com/Web3Clubs/status/2031721483500704027",
        "author": "Web3Clubs",
        "username": "Web3Clubs",
        "text": "Zanzalu 2026 is coming!!! Zanzalu 2025 was our most epic tech pop up last year.",
        "date": "2026-03-11"
      },
      {
        "url": "https://x.com/mich_ellesart/status/1956312052512780755",
        "author": "mich_ellesart",
        "username": "mich_ellesart",
        "text": "It was really an experience I'll never forget.",
        "date": "2025-08-15"
      }
    ]
  },
  {
    "slug": "zugrama",
    "name": "Zu-Grama",
    "tagline": "Onchain deep-tech village in India",
    "location": "Kerala, India",
    "type": "popup",
    "themes": [
      "Tech",
      "Science",
      "Crypto",
      "Public Goods"
    ],
    "website": "https://zugrama.org",
    "image": "/popups/xyz/zu-grama/logo.webp",
    "foundedYear": 2024,
    "sources": [
      "ns",
      "xyz"
    ],
    "socials": {
      "x": "https://x.com/zugramadotorg",
      "telegram": "https://t.me/+WEGHdd6xLHBlYTA1"
    },
    "summary": "An onchain village for builders, scientists, and founders mixing coliving with deep tech.",
    "body": [
      "Zu-Grama organizes onchain popup villages in India that fuse coliving with deep-tech and science work.",
      "The Kerala footprint is the geographic signal most often listed.",
      "It is part of the wider Zu- family while keeping an India-first builder mandate."
    ],
    "coverImages": [
      "/popups/xyz/zu-grama/community.webp",
      "/popups/xyz/zu-grama/talk.webp"
    ],
    "pricing": [
      "For the Zu-Grama pop-up in 2025:",
      "Shared Room",
      "$560 - 1 week",
      "$960 - 3 weeks",
      "$1,600 - 6 weeks",
      "Private Room",
      "$1,225 - 1 week",
      "$2,100 - 3 weeks",
      "$3,500 - 6 weeks",
      "Tickets usually include accommodation, partial meals, and full access to the program",
      "Zu-Grama offered fully funded fellowships for selected participants"
    ],
    "pricingSummary": "For the Zu-Grama pop-up in 2025: Shared Room",
    "amenities": [],
    "history": [
      "Zu-Grama emerged in 2024 as India's first pop-up village experiment, inspired by Zuzalu",
      "In January 2025, the community hosted a six-week residency bringing together over 150 participants from around the world",
      "For 2026, Zu-Grama plans to evolve from a one-off residency into an ongoing ecosystem with alumni support and new collaboration formats"
    ],
    "durationNotes": [
      "Zu-Grama's first residency ran for six weeks, from January 5th to February 16th, 2025"
    ],
    "locationDetails": [
      "Zu-Grama's operations and events center in India",
      "The first pop-up village it organized took place in Trivandrum, Kerala"
    ],
    "overview": [
      "Zu-Grama is an on-chain pop-up village organizer supporting builders, scientists, and founders through co-living in India"
    ],
    "xyzUrl": "https://xyz.city/network-states/zu-grama",
    "posts": [
      {
        "url": "https://x.com/titaniumals/status/1966426196964757822",
        "author": "Almas",
        "username": "titaniumals",
        "text": "Staunch believers of Pop up culture and carrying on the legacy  of Zu-Grama India. Make way folks.",
        "date": "2025-09-12"
      },
      {
        "url": "https://x.com/trentmc0/status/1849325370539151533",
        "author": "Trent McConaghy",
        "username": "trentmc0",
        "text": "India is getting a popup village in early 2025: **Zu-Grama**. It's co-organized by my friend Anish, a longtime AI, cryptography, and web3 expert. It's my pleasure to help advise them.",
        "date": "2024-10-24"
      }
    ]
  },
  {
    "slug": "zuafrique",
    "name": "ZuAfrique",
    "tagline": "Popup villages across Africa",
    "location": "Ghana / Kenya / Africa",
    "type": "popup",
    "themes": [
      "Tech",
      "Crypto",
      "Public Goods",
      "Culture"
    ],
    "website": "https://zuafrique.com",
    "image": "/popups/xyz/zuafrique/logo.webp",
    "foundedYear": 2024,
    "sources": [
      "ns",
      "xyz"
    ],
    "socials": {
      "x": "https://x.com/zuAfrique"
    },
    "summary": "Multi-site African popup villages focused on real-world builder projects and onchain community.",
    "body": [
      "ZuAfrique runs multi-site popup villages across Africa with a bias toward shipping real projects.",
      "Ghana and Kenya appear as active geographies, alongside a broader continental mandate.",
      "Coliving spaces and onchain community tooling are both part of the offer."
    ],
    "coverImages": [
      "/popups/xyz/zuafrique/community.webp",
      "/popups/xyz/zuafrique/talk.webp",
      "/popups/xyz/zuafrique/people.webp"
    ],
    "pricing": [
      "ZuAfrique 1.0 was funded through a combination of sponsor support and direct organizational investment",
      "Lisk donated $25,000, AyaHQ donated $50,000, and Zuzalu Quadratic Funding contributed 3.65 ETH",
      "The 3.65 ETH was untouched due to the price dip"
    ],
    "pricingSummary": "ZuAfrique 1.0 was funded through a combination of sponsor support and direct organizational investment Lisk donated $25,000, AyaHQ donated $50,000, and Zuzalu Quadratic Funding contributed 3.65 ETH",
    "amenities": [
      "Rooms",
      "Buffet meals (breakfast and dinner)",
      "Co-working space",
      "Wi-Fi",
      "Workshops, lectures, and events"
    ],
    "history": [
      "ZuAfrique emerged in 2024 from the Zuzalu movement and launched its first pop-up city — ZuAfrique 1.0 — in April 2025",
      "In 2026, ZuAfrique hosts ZuAfrique 2.0, a three-week pop-up village in Kenya"
    ],
    "durationNotes": [
      "ZuAfrique hosts temporary pop-up villages that typically last 3 weeks",
      "ZuAfrique 1.0",
      "April 15 - May 6, 2025",
      "ZuAfrique 2.0",
      "April 12 - May 3, 2026"
    ],
    "locationDetails": [
      "ZuAfrique focuses its operations in Africa, specifically in Kilifi, Kenya"
    ],
    "overview": [
      "ZuAfrique is an on-chain movement in Africa that connects local innovation with global builders"
    ],
    "xyzUrl": "https://xyz.city/network-states/zuafrique",
    "posts": [
      {
        "url": "https://x.com/zuAfrique/status/1859231100729516124",
        "author": "ZuAfrique",
        "username": "zuAfrique",
        "text": "Network state as a human coordination layer has been with us before the emergence of the web3 industry but thanks to Vitalik Buterin and the Zuzalu community for bringing back this topic to the forefront. ZuAfrique will serve as that coordination layer for Africa.",
        "date": "2024-11-20"
      },
      {
        "url": "https://x.com/devjoethuku/status/1943242504616231169",
        "author": "Joethuku",
        "username": "devjoethuku",
        "text": "human layer and value. I didn't fully grasp it at the time but it planted a seed that has taught me the meaning of love and gratitude in everything I do. Can't wait for Zuafrique 2.0.",
        "date": "2025-07-10"
      }
    ]
  },
  {
    "slug": "zui",
    "name": "Zuitzerland",
    "tagline": "Swiss open-source popup village",
    "location": "Swiss Alps, Switzerland",
    "type": "popup",
    "themes": [
      "Tech",
      "Biotech",
      "Governance",
      "Crypto",
      "AI"
    ],
    "website": "https://www.zuitzerland.ch",
    "image": "/popups/xyz/zuitzerland/logo.webp",
    "foundedYear": 2024,
    "sources": [
      "ns",
      "xyz"
    ],
    "socials": {
      "x": "https://x.com/zuitzerland",
      "telegram": "https://t.me/zuitzerland"
    },
    "summary": "An Alpine popup sandbox for d/acc, open source, and future-society experiments.",
    "body": [
      "Zuitzerland hosts popup residencies and build sprints in the Swiss Alps.",
      "The longer ambition is a Swiss village oriented toward d/acc and open-source acceleration.",
      "It functions today as an experimental sandbox with a clear European mountain brand."
    ],
    "coverImages": [
      "/popups/xyz/zuitzerland/presentation.webp",
      "/popups/xyz/zuitzerland/vitalik.webp",
      "/popups/xyz/zuitzerland/people.webp"
    ],
    "pricing": [
      "Pricing details on Zuitzerland's pop-up villages are not publicly disclosed",
      "Zuitzerland 2025 Summit, the culmination event of the Zuitzerland Residency, cost CHF 359 ($450) for the weekend. No accommodation included.*",
      "*Zuitzerland provided a discount code for attendees"
    ],
    "pricingSummary": "Pricing details on Zuitzerland's pop-up villages are not publicly disclosed Zuitzerland 2025 Summit, the culmination event of the Zuitzerland Residency, cost CHF 359 ($450) for the weekend. No accommodation included.*",
    "amenities": [],
    "history": [
      "Zuitzerland was founded in 2024 by Isla Munro-Hochmayr, a web3 researcher and economist",
      "By September 2024, it hosted Zuitzerland v0.1, a small pop-up village in Interlaken designed to prototype d/acc leadership and societal models",
      "In May 2025, it ran its first full-scale pop-up city, Zuitzerland Residency, which served as an initial prototype for a permanent hub. It grouped 200 researchers, philosophers, and builders in an alpine ski resort",
      "In 2025, Vitalik donated $500,000 in ETH to support Zuitzerland's",
      "development as a Zuzalu hub"
    ],
    "durationNotes": [
      "Zuitzerland v0.1, the very early iteration, ran for 1 to 2 weeks in 2024. The full-scale, inaugural pop-up city lasted 3.5 weeks",
      "Zuitzerland aims to evolve into a permanent community in Switzerland, allowing for indefinite",
      "stays"
    ],
    "locationDetails": [
      "Zuitzerland's pop-up villages and events are centered in the Swiss Alps, Switzerland"
    ],
    "overview": [
      "A network state sandbox for pioneers in Web3, AI, biotech, brain-computer interfaces (BCI), and other frontier technologies",
      "It emphasizes d/acc and Swiss principles of governance and cooperation",
      "d/acc ( defensive",
      "accelerationism ) is a",
      "philosophy, proposed by Vitalik, that says we should accelerate",
      "technologies that strengthen defense, decentralization, and democratic control, so power and",
      "safety are widely shared instead of centralized"
    ],
    "xyzUrl": "https://xyz.city/network-states/zuitzerland",
    "posts": []
  },
  {
    "slug": "zukas",
    "name": "ZuKaş",
    "tagline": "Governance-focused Zu village in Turkey",
    "location": "Kaş, Turkey",
    "type": "popup",
    "themes": [
      "Governance",
      "Crypto",
      "Longevity"
    ],
    "website": "https://t.co/Rs4IKEy4KO",
    "image": "/popups/xyz/zukas/logo.webp",
    "foundedYear": 2025,
    "sources": [
      "ns",
      "xyz"
    ],
    "socials": {
      "x": "https://x.com/zuzalukas"
    },
    "summary": "A Zuzalu-lineage village in Kaş exploring participatory governance and regenerative practice.",
    "body": [
      "ZuKaş is a Zu-node in Kaş, Turkey with an explicit governance and Lycian democracy theme.",
      "Popup villages here lean into culturally rooted community practice rather than pure hacker-house energy.",
      "Longevity and crypto themes still appear, but participatory governance is the differentiator."
    ],
    "coverImages": [
      "/popups/xyz/zukas/community.webp"
    ],
    "pricing": [
      "ZuKas tickets are often tiered and include scholarship options",
      "For ZuKas II :",
      "Locals/Students - $250",
      "Full event access",
      "Blindspot - $500",
      "Full event access for people buying before the programming is revealed",
      "Earlybird - $700",
      "Full event access, daily breakfast and co-working space. Accommodation not included",
      "Resident Pass (Shared Room) - $1,300",
      "Full event access, daily breakfast and co-working space. Accommodation in a shared room",
      "Resident Pass (Private Room) - $2,000",
      "Full event access, daily breakfast and co-working space. Accommodation in a private room"
    ],
    "pricingSummary": "ZuKas tickets are often tiered and include scholarship options For ZuKas II :",
    "amenities": [
      "Shared/private rooms",
      "Co-working spaces",
      "Breakfast",
      "Salons",
      "Workshops, lectures and events",
      "ZuKas arranges group-rate guesthouses for non-resident tickets"
    ],
    "history": [
      "Emerged from the Zuzalu movement, ZuKas merges Web3 with principles from the Lycian Isonomia, the Ahi Commons, and plurality",
      "In 2025, it hosted its first pop-up village - ZuKas I. The cohort focused on the roots of ancient democracy",
      "The second edition, ZuKas II, in April 2026, explores open governance, identity, and phygital communities"
    ],
    "durationNotes": [
      "ZuKas operates pop-up villages with varying durations",
      "ZuKas I lasted 10 days. ZuKas II runs for 30 days"
    ],
    "locationDetails": [
      "ZuKas pop-up cities are hosted in Kaş, Turkey, a coastal town in the ancient Lycian region"
    ],
    "overview": [
      "ZuKas is a living hub uniting Lycian roots with longevity and civic innovation"
    ],
    "xyzUrl": "https://xyz.city/network-states/zukas",
    "posts": [
      {
        "url": "https://x.com/mechul_eth/status/1968268622062825544",
        "author": "mechul.eth",
        "username": "mechul_eth",
        "text": "One of the best, lasting memories, amazing people. And for once I got to attend an event I didn't host. Loved every moment of ZuKaş.",
        "date": "2025-09-17"
      },
      {
        "url": "https://x.com/llalenas/status/1968236410273673696",
        "author": "lalena",
        "username": "llalenas",
        "text": "Not enough Kaş in a year… need 2–3 events",
        "date": "2025-09-17"
      },
      {
        "url": "https://x.com/tarikcanaytac/status/1954290780019020268",
        "author": "Tarikmetahub.eth",
        "username": "tarikcanaytac",
        "text": "nd this will be living lab , not a spectator event. We will co create , co build and after ZuKaş we will gift the world new civic tech materials and ideas.",
        "date": "2025-08-10"
      }
    ]
  },
  {
    "slug": "zuzalu",
    "name": "Zuzalu",
    "tagline": "Ethereum popup village network",
    "location": "Luštica Bay, Montenegro / Global",
    "type": "popup",
    "themes": [
      "Governance",
      "Tech",
      "Crypto"
    ],
    "website": "https://www.zuzalu.city",
    "image": "/popups/xyz/zuzalu/logo.webp",
    "foundedYear": 2023,
    "sources": [
      "ns",
      "xyz"
    ],
    "socials": {
      "x": "https://x.com/Zuzalu_city"
    },
    "summary": "The original popup village network that kicked off the modern Zu- ecosystem.",
    "body": [
      "Zuzalu started as the first high-profile popup village in Luštica Bay, Montenegro, and grew into a distributed network.",
      "It also pushed CommunityOS ideas and open-source coordination for temporary societies.",
      "Most Zu-named projects in this directory are cultural descendants of that first experiment."
    ],
    "coverImages": [
      "/popups/xyz/zuzalu/island.webp",
      "/popups/xyz/zuzalu/vitalik.webp",
      "/popups/xyz/zuzalu/island-top.webp"
    ],
    "pricing": [
      "Zuzalu Pop-up Montenegro",
      "$100/week for breakfast, co-working space, and access to events",
      "Food was estimated at an extra $50/day",
      "Payments were made via crypto. Students and others needing financial support could apply for a subsidy",
      "Zuzalu Montenegro was invitation-based. Core organizers invited ~15 residents each, and",
      "each resident could invite 2 guests. Some participants were selected via application"
    ],
    "pricingSummary": "Zuzalu Pop-up Montenegro $100/week for breakfast, co-working space, and access to events",
    "amenities": [
      "Daily breakfast",
      "Co-working spaces",
      "Conference and workshop venues",
      "Community events and social programming",
      "Pools",
      "Beach access",
      "Gym",
      "Accommodation was not included",
      "Programming",
      "Zuzalu focused on three core themes:",
      "Cryptography & Privacy. ZK proofs, programmable cryptography, privacy-preserving tech",
      "Longevity & Biotech. DeSci, longevity research, biotech innovation (co-organized with VitaDAO )",
      "Governance & Coordination. Network states, decentralized governance, public goods",
      "Programming included talks, workshops, hackathons, and unconferences led by participants"
    ],
    "history": [
      "By 2022, Vitalik Buterin had long been thinking about topics like crypto cities and network states",
      "In January 2023, a four-person team started scouting locations and settled on a Montenegro resort. It expanded to eight people by February and launched Zuzalu in March - a two-month pop-up city for 200 residents",
      "That fall, the community ran ZuConnect Istanbul - a two-week pop-up village right before DevConnect, supported by ETHGlobal and HackZuzalu",
      "Since then, Zuzalu has expanded into decentralized Zu-villages ( ZuVillage Georgia, Zu-Garden, ZuCity Japan, ZuBerlin ) focused on experimental co-living",
      "By 2026, Zuzalu.city is a decentralized",
      "open-source operating system that connects users to Ethereum's ecosystem applications"
    ],
    "durationNotes": [
      "Zuzalu Pop-up ran for 2 months, from March to May 2023",
      "Zu’s decentralized communities organize pop-up cities that last 10 days up to 2 months :",
      "Zuitzerland v0.1",
      "1/9/2024 - 10/9/2024",
      "ZuAfrique 1.0",
      "15/4/2025 - 5/5/2025",
      "Zuzalu Montenegro",
      "25/3/2023 - 25/5/2023"
    ],
    "locationDetails": [
      "Zuzalu Pop-up, the first pop-up village ever, was hosted in Luštica Bay, Montenegro",
      "Currently, Zuzalu doesn’t own a physical hub, but its branch nodes host pop-up villages worldwide:",
      "Zu-Grama",
      "Kerala, India",
      "Zanzalu",
      "Zanzibar, Tanzania",
      "Zuitzerland Residency",
      "Swiss Alps, Switzerland"
    ],
    "overview": [
      "Zuzalu was the event that marked the birth of the pop-up village movement",
      "It currently runs as a global network of nodes experimenting with decentralized coordination, identity, and privacy tech"
    ],
    "xyzUrl": "https://xyz.city/network-states/zuzalu",
    "posts": [
      {
        "url": "https://x.com/Zuzalu_city/status/1897784899194478798",
        "author": "Zuzalu_city",
        "username": "Zuzalu_city",
        "text": "🛠️ We build tools to empower real communities around the world. 🌇\n\nLast week, we gathered representatives from crypto city and permanent Zuzalu node projects from around the world to discuss real-world needs for decentralized tooling.\n\nWatch the conversation and lightning talks https://t.co/zA2fWtqTH7",
        "date": "2025-03-06"
      },
      {
        "url": "https://x.com/Zuzalu_city/status/1888934652208927165",
        "author": "Zuzalu_city",
        "username": "Zuzalu_city",
        "text": "Let's build tools together 🤝 Join the Zu_Builders Guild!  \n\nWe're forming the Zu_Builders Guild as a collective funding mechanism designed to support contributors over the long term.  \n\nWant to get involved? ⏬️ https://t.co/nZRSEloVYZ",
        "date": "2025-02-10"
      },
      {
        "url": "https://x.com/Zuzalu_city/status/1904915108956168444",
        "author": "Zuzalu_city",
        "username": "Zuzalu_city",
        "text": "Happy 2nd birthday, Zuzalu! 🎂✨ So grateful for #Zuzalu — for the friendships, the late‑night brainstorms, and all the memories we’ve made.\n\nAre you celebrating today with someone special you met here? ❤️ Tag them below and let’s spread the love! https://t.co/Fa9mdF6IrX",
        "date": "2025-03-26"
      },
      {
        "url": "https://x.com/Zuzalu_city/status/1815418432604819831",
        "author": "Zuzalu_city",
        "username": "Zuzalu_city",
        "text": "Announcing https://t.co/a2RvDCeHQ3 ALPHA Launch🔥\n\nWe’re thrilled to announce that the ZuCity Alpha is officially live with @zuvillage! Communities can now create spaces and manage events on ZuCity Alpha. \n\nThis is a major milestone for us, and we’re excited to share it with you.",
        "date": "2024-07-22"
      }
    ]
  },
  {
    "slug": "praxis",
    "name": "Praxis",
    "tagline": "Digital nation crowdfunding a city",
    "location": "Punta Cana / Global",
    "type": "permanent",
    "themes": [
      "Crypto",
      "AI",
      "Biotech"
    ],
    "website": "https://praxisnation.com",
    "image": "/popups/xyz/praxis/logo.webp",
    "foundedYear": 2019,
    "sources": [
      "xyz"
    ],
    "socials": {
      "x": "https://x.com/praxisnation",
      "discord": "https://discord.com/invite/praxis"
    },
    "summary": "A digital nation project that runs popups while raising toward a permanent physical city.",
    "body": [
      "Praxis combines a large digital citizen base with occasional physical popups such as CAMPUS in Punta Cana.",
      "The long-term goal is crowdfunding and standing up a physical city, not only hosting temporary villages.",
      "It is one of the most explicitly nation-shaped entries on xyz.city."
    ],
    "coverImages": [
      "/popups/xyz/praxis/flags.webp"
    ],
    "pricing": [
      "Becoming a Praxis Nomad is free"
    ],
    "pricingSummary": "Becoming a Praxis Nomad is free",
    "amenities": [],
    "history": [
      "2019 - Founded by Dryden Brown and Charlie Callinan, with the vision of building a physical city",
      "2021 - Raised $4.2M seed round",
      "2022 - Raised $15M Series A",
      "2024 - Secured $525M financing for a new city",
      "November - Hosted CAMPUS pop-up village",
      "2025 - Proposed Atlas, a defense-focused city on 3,850 acres in California",
      "2026 - Exploring Greenland and other locations as building sites for a new city"
    ],
    "durationNotes": [
      "Praxis hosts events year-round at its New York headquarters. CAMPUS pop-up village ran for 4 days"
    ],
    "locationDetails": [
      "Praxis headquarters are located in New York City. Past residential experiments occurred in Austin, San Francisco, Los Angeles, and Miami",
      "CAMPUS, Praxis’s 4-day pop-up city, took place in Punta Cana, Dominican Republic"
    ],
    "overview": [
      "Praxis is a digital nation crowdfunding a physical city to restore Western Civilization through crypto, AI, biotech, and energy innovation"
    ],
    "xyzUrl": "https://xyz.city/network-states/praxis",
    "posts": []
  },
  {
    "slug": "ig",
    "name": "Invisible Garden",
    "tagline": "Traveling developer academy",
    "location": "Buenos Aires / Global",
    "type": "popup",
    "themes": [
      "Crypto",
      "AI",
      "Tech",
      "Public Goods"
    ],
    "website": "https://invisible.garden",
    "image": "/popups/xyz/invisible-garden/logo.webp",
    "foundedYear": 2024,
    "sources": [
      "xyz"
    ],
    "socials": {
      "x": "https://x.com/invisiblgarden",
      "discord": "https://discord.gg/QXBHHmRHFv",
      "telegram": "https://t.me/invgarannounce"
    },
    "summary": "A traveling academy running immersive popup cities for Ethereum, ZKP, AI, and security talent.",
    "body": [
      "Invisible Garden moves as a developer academy wrapped in popup-city living.",
      "Curriculum themes include Ethereum, zero-knowledge proofs, AI, and cybersecurity.",
      "Buenos Aires is a frequent anchor, with community channels spanning Discord and Telegram."
    ],
    "coverImages": [
      "/popups/xyz/invisible-garden/vitalik.webp"
    ],
    "pricing": [
      "Invisible Garden's pop-up villages are usually free for selected developers. The scholarship includes accommodation, co-working spaces, and advanced courses on Ethereum, ZKP, AI, and cybersecurity"
    ],
    "pricingSummary": "Invisible Garden's pop-up villages are usually free for selected developers. The scholarship includes accommodation, co-working spaces, and advanced courses on Ethereum, ZKP, AI, and cybersecurity",
    "amenities": [],
    "history": [
      "Invisible Garden hosted Invisible Garden Chiang Mai in 2024, a six-week pop-up village where nearly 70 builders successfully completed the program",
      "In 2025, it expanded to Latin America with Invisible Garden Buenos Aires, a three-week residency before Devcon, featuring mentors from Ethereum Foundation, OpenZeppelin, and the-mu",
      "An edition in Costa Rica was planned for early 2025 but postponed to Buenos",
      "Aires to align better with event",
      "calendars"
    ],
    "durationNotes": [
      "Invisible Garden's pop-up villages typically last 3 to 6 weeks"
    ],
    "locationDetails": [
      "Invisible Garden is traveling, hosting pop-up cities in various locations",
      "Invisible Garden Chiang Mai",
      "Thailand, Asia",
      "Invisible Garden Buenos Aires",
      "Argentina, Latin America"
    ],
    "overview": [
      "Invisible Garden is a pop-up dev city and developer academy that cultivates Ethereum, zero-knowledge, AI, and cybersecurity talent through immersive environments"
    ],
    "xyzUrl": "https://xyz.city/network-states/invisible-garden",
    "posts": []
  },
  {
    "slug": "idao",
    "name": "IslandDAO",
    "tagline": "Solana network state on the move",
    "location": "Mykonos / Global",
    "type": "popup",
    "themes": [
      "Crypto",
      "Tech",
      "Governance"
    ],
    "website": "https://islanddao.org",
    "image": "/popups/xyz/islanddao/logo.webp",
    "foundedYear": 2022,
    "sources": [
      "xyz"
    ],
    "socials": {
      "x": "https://x.com/islanddao",
      "discord": "https://discord.gg/dvHrj9SXQS",
      "telegram": "https://t.me/+oKI6gLuovRc1YjNk"
    },
    "summary": "A Solana-native network organizing monthlong coworking and community stays in exotic locations.",
    "body": [
      "IslandDAO runs monthlong coworking and community popups with a Solana-native culture.",
      "Mykonos is a named geography, but the operating pattern is location-flexible.",
      "Expect builder density first, jurisdiction theater second."
    ],
    "coverImages": [
      "/popups/xyz/islanddao/restaurant.webp",
      "/popups/xyz/islanddao/boat.webp"
    ],
    "pricing": [
      "To attend IslandDAO's events, one needs to be a member",
      "Membership is obtained via IslandDAO Perks NFTs, with a floor price around $200"
    ],
    "pricingSummary": "To attend IslandDAO's events, one needs to be a member Membership is obtained via IslandDAO Perks NFTs, with a floor price around $200",
    "amenities": [
      "IslandDAO's pop-up villages usually feature co-working spaces, social gatherings, hackathons, and workshops",
      "Travel and accommodation should be self-arranged"
    ],
    "history": [
      "IslandDAO started in 2022 as Dean's List DAO, a service organization focusing on providing feedback to Solana protocols and supporting ecosystem growth",
      "In 2023, it formed regional teams in Nigeria and Brazil, bringing education and opportunities to communities",
      "By 2024, it rebranded to IslandDAO and hosted two pop-up cities:",
      "IslandDAO Crete",
      "May - June 2024",
      "IslandDAO Koh Samui",
      "September - October 2024",
      "In 2025, it launched the Perks NFT collection and ran its third pop-up village, IslandDAO Mykonos",
      "For 2026, IslandDAO plans to organize two pop-up villages: IslandDAO Thailand and IslandDAO Brazil"
    ],
    "durationNotes": [
      "IslandDAO's pop-up villages typically last 1 month"
    ],
    "locationDetails": [
      "IslandDAO hosts events and pop-up villages worldwide. It isn't tied to a specific location, though events frequently occur in Greece, Thailand, and Brazil"
    ],
    "overview": [
      "IslandDAO, formerly known as Dean's List DAO, is a Web3-native network state on Solana",
      "Principles",
      "Transparency",
      "Participation",
      "Alignment",
      "Execution through trustless systems"
    ],
    "xyzUrl": "https://xyz.city/network-states/islanddao",
    "posts": [
      {
        "url": "https://x.com/islanddao/status/2045132802648047634",
        "author": "islanddao",
        "username": "islanddao",
        "text": "What started as an event, became a series of events, it became a movement. Long before the events, Islanddao has been around since the early days of the Solana ecosystem. A group of power users. A Service DAO. A Network State A movement.",
        "date": "2026-04-17"
      },
      {
        "url": "https://x.com/Whalesfriend/status/2047232898214871300",
        "author": "Whalesfriend",
        "username": "Whalesfriend",
        "text": "Workation in Paradise!",
        "date": "2026-04-23"
      }
    ]
  },
  {
    "slug": "afro",
    "name": "Afropolitan",
    "tagline": "Network state for African diaspora culture",
    "location": "Africa / Global",
    "type": "popup",
    "themes": [
      "Tech",
      "Crypto",
      "Governance",
      "Culture"
    ],
    "website": "https://www.afropolitan.io",
    "image": "/popups/xyz/afropolitan/logo.webp",
    "foundedYear": 2016,
    "sources": [
      "xyz"
    ],
    "socials": {
      "x": "https://x.com/afropolitan",
      "discord": "https://discord.com/invite/EYGg9rBScF",
      "telegram": "https://t.me/+abnmkdhN4bxhYzkx"
    },
    "summary": "A network-state style community spanning African art, finance, tech, health, energy, sports, and media.",
    "body": [
      "Afropolitan organizes as a digital-first network with physical gatherings rather than a single permanent city.",
      "The mandate is deliberately wide: culture and industry verticals across the African diaspora.",
      "It is one of the older brands in this set, with founding roots listed in 2016."
    ],
    "coverImages": [
      "/popups/xyz/afropolitan/community.webp"
    ],
    "pricing": [
      "Digital passport NFTs: starting at WETH 0.0027 on OpenSea",
      "Event tickets: $0-$200, depending on the event",
      "Tours: $3,500-$4,500 including accommodation and activities",
      "The original Afropolitan Citizen NFT has been sold out"
    ],
    "pricingSummary": "Digital passport NFTs: starting at WETH 0.0027 on OpenSea Event tickets: $0-$200, depending on the event",
    "amenities": [],
    "history": [
      "The Afropolitan digital nation plan was launched around 2021",
      "In 2022, it raised $2.1 million in pre-seed funding from investors including Balaji Srinivasan, the founder of Network School",
      "It expanded through Afropolitan Cities, organizing city tours and takeovers, such as the T.I.A. Ghana Tour in 2025"
    ],
    "durationNotes": [
      "Afropolitan is a permanent digital network, with temporary physical events and tours lasting from days to weeks",
      "T.I.A. Ghana was a 1 week tour"
    ],
    "locationDetails": [
      "Afropolitan is primarily digital and global, with a focus on Africa"
    ],
    "overview": [
      "Afropolitan is an emerging digital nation for Africans and the diaspora, aiming to enable abundant lives through community, culture, and economic opportunities",
      "The Afropolitan network is a curator of Black and African:",
      "Talent",
      "Culture",
      "Capital",
      "Information",
      "Experiences"
    ],
    "xyzUrl": "https://xyz.city/network-states/afropolitan",
    "posts": []
  },
  {
    "slug": "w3v",
    "name": "Web3 Villages",
    "tagline": "Immersive villages for Web3 builders",
    "location": "Bangkok / Global",
    "type": "popup",
    "themes": [
      "Crypto",
      "AI",
      "Robotics"
    ],
    "website": "https://www.web3villages.com",
    "image": "/popups/xyz/web3-villages/logo.webp",
    "foundedYear": 2022,
    "sources": [
      "xyz"
    ],
    "socials": {
      "x": "https://x.com/web3village",
      "discord": "https://discord.com/invite/8agJBDjBxr",
      "telegram": "https://t.me/Ethvietnamcommunity/2845"
    },
    "summary": "An ecosystem incubator hosting immersive popup villages where Web3 builders live, learn, and launch.",
    "body": [
      "Web3 Villages packages incubator energy into temporary villages for shipping projects in community.",
      "Bangkok is a recurring geography in the directories, with Discord and Telegram as coordination layers.",
      "The offer is practical: housing plus program density for people trying to launch."
    ],
    "coverImages": [
      "/popups/xyz/web3-villages/japan.webp",
      "/popups/xyz/web3-villages/people.webp",
      "/popups/xyz/web3-villages/coworking.webp",
      "/popups/xyz/web3-villages/presentation.webp"
    ],
    "pricing": [
      "Pricing for pop-up villages and events varies by location"
    ],
    "pricingSummary": "Pricing for pop-up villages and events varies by location",
    "amenities": [
      "Shared and private rooms",
      "Co-living and co-working areas",
      "Wellness spaces",
      "Shared dinners",
      "Daily rituals",
      "Hackathons",
      "Workshops, lectures, and events"
    ],
    "history": [
      "Web3 Villages, founded in 2022, was one of the early hosts of pop-up villages",
      "In 2023, it organized Web3 Village Hoi An, a one-week experience for Web3 builders, hackers, and creators",
      "In 2024, it hosted Web3 Village Chiang Mai and Web3 Village Bangkok",
      "It has supported 35+ startup ideas in areas like DeFi, identity, civic tech, and AI integration",
      "There is no evidence that the announced Web3 Village Mui Ne (2024) and Web3 Village Osaka (2025) events took place"
    ],
    "durationNotes": [
      "Web3 Villages pop-up villages typically last 1 week, offering semi-permanent co-living and building experiences"
    ],
    "locationDetails": [
      "Web3 Villages has hosted pop-up villages across Asia, including Thailand and Vietnam"
    ],
    "overview": [
      "Web3 Villages is an ecosystem incubator for Web3 innovation, community, and lasting impact",
      "As of February 2026, Web3 Villages appears inactive on social media"
    ],
    "xyzUrl": "https://xyz.city/network-states/web3-villages",
    "posts": []
  },
  {
    "slug": "jungli",
    "name": "Jungli the Nomad",
    "tagline": "Rainforest nomad village in India",
    "location": "Dandeli, India",
    "type": "permanent",
    "themes": [
      "AI",
      "Tech",
      "Business",
      "Culture"
    ],
    "website": "https://junglithenomad.com",
    "image": "/popups/xyz/jungli/logo.webp",
    "foundedYear": 2024,
    "sources": [
      "xyz"
    ],
    "socials": {},
    "summary": "A 150-acre rainforest nomad village in Karnataka with coliving, coworking, and popup hosting.",
    "body": [
      "Jungli the Nomad sits on family-held rainforest land in Dandeli, Karnataka, beside the Kali River.",
      "It runs ongoing coliving and coworking while also hosting popup villages of its own.",
      "The pitch is deep work in nature for nomads, artists, and operators, not a coastal hacker season."
    ],
    "coverImages": [],
    "pricing": [],
    "pricingSummary": null,
    "amenities": [],
    "history": [],
    "durationNotes": [],
    "locationDetails": [],
    "overview": [],
    "xyzUrl": "https://xyz.city/network-states/jungli",
    "posts": []
  },
  {
    "slug": "eth",
    "name": "Eth-iopia",
    "tagline": "Popup city and conference organizer",
    "location": "Addis Ababa, Ethiopia",
    "type": "popup",
    "themes": [
      "Crypto",
      "Tech",
      "Governance"
    ],
    "website": "https://eth-iopia.xyz",
    "image": "/popups/xyz/ethiopia/logo.webp",
    "foundedYear": 2024,
    "sources": [
      "xyz"
    ],
    "socials": {
      "x": "https://x.com/ethiopia____"
    },
    "summary": "Ethiopia-based popup city and conference organizing for local and visiting builders.",
    "body": [
      "Eth-iopia combines popup-city energy with conference organizing in Addis Ababa.",
      "The brand is geographically specific in a directory that often stays deliberately global.",
      "Use it as a starting point for Ethiopia-facing builder gatherings."
    ],
    "coverImages": [
      "/popups/xyz/ethiopia/community.webp"
    ],
    "pricing": [
      "ETHiopia Pop-up was free, but subject to application"
    ],
    "pricingSummary": "ETHiopia Pop-up was free, but subject to application",
    "amenities": [
      "Co-working spaces",
      "High-speed internet",
      "Wellness activities",
      "Workshops, lectures, and events",
      "Accommodation and food were not covered"
    ],
    "history": [
      "ETHiopia was launched in 2024, aiming to connect Ethereum innovation to African communities",
      "In January 2025, it hosted ETHiopia Pop-up, a one-month event in Addis Ababa that brought together over 100 participants for hackathons, conferences, and discussions on blockchain adoption",
      "The initiative supported local Ethereum projects and explored topics like DeFi, governance, and crypto's role in African economies"
    ],
    "durationNotes": [
      "ETHiopia's pop-up village lasted 1 month"
    ],
    "locationDetails": [
      "ETHiopia's pop-up village took place in Addis Ababa, Ethiopia"
    ],
    "overview": [
      "ETHiopia is a pop-up village initiative focused on advancing Ethereum and decentralized technologies in Africa through immersive co-living experiences",
      "As of February 2026, ETHiopia appears inactive on social media"
    ],
    "xyzUrl": "https://xyz.city/network-states/ethiopia",
    "posts": []
  },
  {
    "slug": "ary",
    "name": "Arrayah",
    "tagline": "A place to just do things",
    "location": "Sydney, Australia",
    "type": "popup",
    "themes": [
      "Culture",
      "Tech",
      "Governance"
    ],
    "website": "https://arrayah.city",
    "image": "/popups/xyz/arrayah/logo.webp",
    "foundedYear": 2024,
    "sources": [
      "xyz"
    ],
    "socials": {
      "x": "https://x.com/_Arrayah"
    },
    "summary": "A Sydney-rooted builder community with a deliberately simple mandate: make space to do things.",
    "body": [
      "Arrayah keeps the copy short on purpose: it is a place to just do things.",
      "Sydney is the listed base, with culture, tech, and governance themes around the edges.",
      "It is a smaller-scale entry compared with monthlong mega-villages."
    ],
    "coverImages": [
      "/popups/xyz/arrayah/views.webp",
      "/popups/xyz/arrayah/community.webp"
    ],
    "pricing": [
      "Pricing for Arrayah's programs varies by event and is often announced closer to the date or undisclosed before registration",
      "Freo Neuhaus Pop-Up offers tiered accommodation options: shared or private rooms, with shared or private bathrooms",
      "Arrayah Residency was $400 for the whole",
      "week"
    ],
    "pricingSummary": "Pricing for Arrayah's programs varies by event and is often announced closer to the date or undisclosed before registration Freo Neuhaus Pop-Up offers tiered accommodation options: shared or private rooms, with shared or private bathrooms",
    "amenities": [
      "Amenities in Arrayah's pop-up villages typically include:",
      "Co-living (shared or private rooms)",
      "Co-working spaces",
      "Social areas",
      "Group fitness sessions",
      "Workshops, lectures, and events"
    ],
    "history": [
      "Arrayah was founded in 2024 by Akshat Agarwal",
      "That year, it hosted a 15-person cohort in Dubai for Arrayah Chapter 1, and later Arrayah Chapter 2",
      "In 2025, in Australia, it hosted two pop-up villages:",
      "A month-long Arrayah",
      "A week-long Arrayah Residency",
      "For 2026, Arrayah continues to gather people towards intentional building, co-hosting the Freo Neuhaus Pop-Up in Fremantle, Australia",
      "Arrayah has also organized short-form events like the 4-day arrayah",
      "living alongside the Sunrise Festival"
    ],
    "durationNotes": [
      "Arrayah's pop-up neighborhoods typically last from 1 week to 1 month. Accelerators usually run for a few weeks",
      "Arrayah is also rolling out permanent homes across Australia"
    ],
    "locationDetails": [
      "Arrayah's physical activities center in Australia, with pop-up neighborhoods in Sydney and Fremantle",
      "Early iterations were focused on Dubai"
    ],
    "overview": [
      "Arrayah, meaning a ray of hope, is self-described as a place to just do things",
      "It organizes co-living hacker houses, pop-up neighborhoods, and accelerators for founders, artists, and researchers to build with intention"
    ],
    "xyzUrl": "https://xyz.city/network-states/arrayah",
    "posts": []
  },
  {
    "slug": "oz",
    "name": "The Oz City",
    "tagline": "AI and Web3 popup bootcamps",
    "location": "San Martín de los Andes, Argentina",
    "type": "popup",
    "themes": [
      "Crypto",
      "AI",
      "Tech",
      "Business"
    ],
    "website": "https://www.theozcity.com",
    "image": "/popups/xyz/the-oz-city/logo.webp",
    "foundedYear": 2025,
    "sources": [
      "xyz"
    ],
    "socials": {
      "x": "https://x.com/buildozcity",
      "telegram": "https://t.me/ozcitycommunity"
    },
    "summary": "Popup villages and bootcamps for AI and Web3 builders with coliving and build sprints.",
    "body": [
      "The Oz City organizes popup villages and bootcamps where AI and Web3 builders colive and sprint together.",
      "San Martín de los Andes is the named Argentine base.",
      "Telegram is the main community rail listed by xyz.city."
    ],
    "coverImages": [
      "/popups/xyz/the-oz-city/views.webp",
      "/popups/xyz/the-oz-city/house.webp",
      "/popups/xyz/the-oz-city/fitness.webp"
    ],
    "pricing": [
      "Oz City Cannes",
      "$100 *",
      "Bootcamp program for startups and builders",
      "Travel scholarships based on merit and need",
      "Accommodation self-organized",
      "*Commitment fee fully returned as a food coupon",
      "Oz City Patagonia",
      "$945",
      "Full access to Edge City Patagonia",
      "Access to Oz City Residency’s amenities",
      "Accommodation organized but not included*",
      "*$699 for shared room with 1 roommate or $499 with 5 roommates",
      "Breakfast was included, and rooms were gender-separated"
    ],
    "pricingSummary": "Oz City Cannes $100 *",
    "amenities": [
      "Oz City’s pop-up villages usually incorporate:",
      "Shared rooms",
      "Breakfast",
      "24/7 co-working",
      "Fitness spaces",
      "Private saunas",
      "Barbeque",
      "Workshops, lectures, and events"
    ],
    "history": [
      "Inspired by Zuzalu and the AI-blockchain synergy, Oz City has been creating pop-up environments focused on builders",
      "In June 2025, Oz City, supported by Epic Web3, launched its first pop-up village, Oz City Cannes, bringing together over 50 builders from 20+ countries for an experiment in France",
      "Later the same year, Oz City ran Oz City Patagonia, a two-week pop-up village with residency format on top of Edge City 's infrastructure in San Martín de los Andes"
    ],
    "durationNotes": [
      "Oz City operates as temporary pop-up villages, with duration depending on location and timing",
      "Oz City Cannes ran for one week. Oz City Patagonia lasted two weeks"
    ],
    "locationDetails": [
      "Oz City isn’t tied to a permanent infrastructure",
      "Pop-up locations included Valbonne, France and San Martín de los Andes, Argentina"
    ],
    "overview": [
      "Oz City is a pop-up village organizer that focuses on creating the right environment for AI and Web3 builders to accelerate their progress"
    ],
    "xyzUrl": "https://xyz.city/network-states/the-oz-city",
    "posts": []
  },
  {
    "slug": "viva",
    "name": "Viva",
    "tagline": "Longevity city ambition",
    "location": "San Francisco / planned jurisdiction",
    "type": "sez",
    "themes": [
      "Longevity",
      "Biotech",
      "AI",
      "Crypto",
      "Governance"
    ],
    "website": "https://viva.city",
    "image": "/popups/xyz/viva-city/logo.webp",
    "foundedYear": 2024,
    "sources": [
      "xyz"
    ],
    "socials": {
      "x": "https://x.com/CityOfViva",
      "telegram": "https://t.me/viva_city_updates"
    },
    "summary": "A project aiming at a special jurisdiction optimized for medical freedom and longevity research.",
    "body": [
      "Viva’s stated aim is a city-scale jurisdiction where longevity research and medical experimentation can move faster.",
      "San Francisco appears as a current community anchor while the larger city ambition remains ahead of it.",
      "Themes span biotech, AI, crypto, and governance because the bet is institutional, not just social."
    ],
    "coverImages": [
      "/popups/xyz/viva-city/city.webp",
      "/popups/xyz/viva-city/talk.webp",
      "/popups/xyz/viva-city/community.webp"
    ],
    "pricing": [
      "Apart from specific events, Viva City uses a tiered pricing structure:",
      "Online Membership",
      "$5/month",
      "Viva.city NFT",
      "Free or heavily discounted access to diverse events",
      "Founding Online Membership",
      "$50/year",
      "Viva.city NFT",
      "Free or heavily discounted access to diverse events",
      "Supporter",
      "$500/month or $5,000/year",
      "Rare Viva.city NFT",
      "Free and exclusive access to diverse events",
      "At Viva Frontier Tower, full six-week access was $1,900, and two-week access was $950.* Pricing included weekday lunches and full access to the space and programming",
      "*Tower citizens got $300 off and scholarships were available"
    ],
    "pricingSummary": "Apart from specific events, Viva City uses a tiered pricing structure: Online Membership",
    "amenities": [],
    "history": [
      "Viva City, founded by Laurence Ion, emerged from the legacy of Vitalia City, a network state whose co-founders parted ways in early 2025",
      "That year, Viva City hosted Viva Frontier Tower, a month-long pop-up village in San Francisco's Frontier Tower, gathering over 100 builders for workshops and an incubator program",
      "There are ongoing talks with governments for Viva City to establish a medical innovation zone"
    ],
    "durationNotes": [
      "Viva City's events are usually hours-long, except for pop-up villages. Viva Frontier Tower ran for 6 weeks between June and August 2025"
    ],
    "locationDetails": [
      "Viva City does not own a permanent hub",
      "The community gathers often for events at Frontier Tower's longevity floor, in San Francisco"
    ],
    "overview": [
      "Viva City is a community for longevity and biotech pioneers, hosting pop-up villages and events to accelerate breakthroughs in human health and science"
    ],
    "xyzUrl": "https://xyz.city/network-states/viva-city",
    "posts": []
  },
  {
    "slug": "netx",
    "name": "Netxstate",
    "tagline": "Regenerative bioregional network",
    "location": "Patagonia, Argentina",
    "type": "popup",
    "themes": [
      "Governance",
      "Tech",
      "Biotech"
    ],
    "website": "https://www.netxstate.com",
    "image": "/popups/xyz/netx-gen/logo.webp",
    "foundedYear": 2024,
    "sources": [
      "xyz"
    ],
    "socials": {
      "x": "https://x.com/netxstate",
      "telegram": "https://t.me/+dP8dzo6kI482YjAx"
    },
    "summary": "A network of regenerative nodes linking bioregions, communities, and startups.",
    "body": [
      "Netxstate connects regenerative nodes across bioregions instead of betting everything on one campus.",
      "Patagonia is the geographic signal most often attached to the project.",
      "Governance and biotech themes sit alongside community and startup coordination."
    ],
    "coverImages": [
      "/popups/xyz/netx-gen/community.webp",
      "/popups/xyz/netx-gen/houses.webp",
      "/popups/xyz/netx-gen/founder.webp",
      "/popups/xyz/netx-gen/sessions.webp",
      "/popups/xyz/netx-gen/people.webp"
    ],
    "pricing": [
      "Pricing depends on the event",
      "For reference, ReGen Haus was $1550 for the full month. Ticket included housing (shared rooms), breakfast, and full access to the program",
      "Payments were made via crypto, bank transfer (USD or ARS), ACH, or WIRE",
      "Amenities*",
      "Rooms",
      "Heated pool",
      "Fiber-optic Wi-Fi",
      "Kitchen and barbecue",
      "Green spaces",
      "Common areas",
      "*From Regen Haus, at Edge Patagonia"
    ],
    "pricingSummary": "Pricing depends on the event For reference, ReGen Haus was $1550 for the full month. Ticket included housing (shared rooms), breakfast, and full access to the program",
    "amenities": [],
    "history": [
      "Founded in 2024 as NetX State and rebranded to NetX Gen in 2026, the project centers its work on ecological regeneration and bioregional development",
      "In October to November 2025, NetX Gen hosted ReGen Haus, a layer two residency at Edge Patagonia ’s pop-up village",
      "Right after, it organized Regen Hub at Devconnect Buenos Aires, connecting over 300 participants in a strategic meeting point between ReFi, Web3, DeSci, decentralized governance, and local regenerative projects",
      "In 2026, NetX Gen Pop Up Island is happening at Próspera",
      "Territorial expansion and consolidation of the ecosystem are expected to develop from 2027 to 2030, and the building of regenerative cities until 2040"
    ],
    "durationNotes": [
      "NetX Gen runs temporary pop-up villages and small events, typically lasting one to four weeks"
    ],
    "locationDetails": [
      "NetX Gen is anchored in Patagonia, Argentina, and operates in temporary settings across America",
      "ReGen Haus",
      "San Martín de los Andes, Argentina",
      "Regen Hub",
      "Buenos Aires, Argentina",
      "NetX Gen Pop Up Island",
      "Roatán, Honduras",
      "NetX Gen has established partnerships across multiple bioregions (ReGen Nodes), mainly in Latin America"
    ],
    "overview": [
      "NetX Gen is a network of regenerative nodes connecting bioregions, communities, startups, and technologies to co-create a new model of civilization",
      "It builds infrastructure across three layers - digital, legal, and physical - to prototype regenerative territories, decentralized governance, and cosmolocal solutions"
    ],
    "xyzUrl": "https://xyz.city/network-states/netx-gen",
    "posts": []
  },
  {
    "slug": "ac",
    "name": "Alpha City",
    "tagline": "Federation of frontier cities",
    "location": "Various",
    "type": "popup",
    "themes": [
      "Tech",
      "Business",
      "Governance",
      "SEZ"
    ],
    "website": "https://alphacity.io",
    "image": "/popups/xyz/alpha-city/logo.webp",
    "foundedYear": 2024,
    "sources": [
      "xyz"
    ],
    "socials": {
      "x": "https://x.com/alphacityinc"
    },
    "summary": "A federation-style project coordinating frontier cities rather than running a single campus.",
    "body": [
      "Alpha City describes itself as a federation of frontier cities.",
      "The footprint is distributed by design, with small resident counts listed in the directories.",
      "Treat it as a coordination layer across places, not one popup calendar."
    ],
    "coverImages": [],
    "pricing": [],
    "pricingSummary": null,
    "amenities": [],
    "history": [],
    "durationNotes": [],
    "locationDetails": [],
    "overview": [],
    "xyzUrl": "https://xyz.city/network-states/alpha-city",
    "posts": []
  },
  {
    "slug": "ml",
    "name": "Montelibero",
    "tagline": "Libertarian intentional community in Montenegro",
    "location": "Pečurice, Montenegro",
    "type": "permanent",
    "themes": [
      "Business",
      "Tech",
      "Governance",
      "Culture"
    ],
    "website": "https://montelibero.org",
    "image": "/popups/xyz/montelibero/logo.webp",
    "foundedYear": 2021,
    "sources": [
      "xyz"
    ],
    "socials": {
      "x": "https://x.com/MonteliberoFSPE",
      "discord": "https://discord.com/invite/dDvsWMW2Ga",
      "telegram": "https://t.me/FSPE_Montenegro"
    },
    "summary": "A decentralized libertarian movement building a free, self-organized society in Montenegro.",
    "body": [
      "Montelibero is an intentional community and social movement in Montenegro organized around non-aggression and self-organization.",
      "Unlike short popups, it aims at durable local presence in Pečurice.",
      "Discord and Telegram both appear as active community rails on xyz.city."
    ],
    "coverImages": [
      "/popups/xyz/montelibero/camp.webp"
    ],
    "pricing": [
      "There isn't a ticket sale, service fee or other direct purchasing options that Montelibero specifically provides",
      "In 2023, a couple bought a 33sqm \"shell\" house for €27,000 in MTL City",
      "In the municipality of Bar, prices usually range from €1,200 to €3,000 per sqm for houses and cottages"
    ],
    "pricingSummary": "There isn't a ticket sale, service fee or other direct purchasing options that Montelibero specifically provides In 2023, a couple bought a 33sqm \"shell\" house for €27,000 in MTL City",
    "amenities": [
      "Amenities in MTL City include:",
      "Modular housing units",
      "1 hectare of developed land",
      "Access to EURMTL stablecoin system",
      "Proximity to the coast",
      "Events, workshops, and festivals"
    ],
    "history": [
      "Montelibero's movement began in December 2021 when the first settlers arrived in Montenegro",
      "It quickly experienced a significant inflow of Russians, and later attracted members from over-regulated EU countries, particularly Germany",
      "Since its founding, the community has developed MTL City (a residential place on a hectare of land), the EURMTL stablecoin system for cashless payments, and has hosted annual MTL Fest libertarian festivals starting in September 2023",
      "The first permanent resident moved to MTL City in May 2023. By mid-2024, MTL City had 17 residents across two buildings",
      "Currently, construction continues as the city also incorporates a modular home production facility",
      "The EURMTL is a stablecoin pegged to the euro, backed with fiat and other liquid assets like",
      "Bitcoin"
    ],
    "durationNotes": [
      "Montelibero is a permanent settlement project. Members can move to Montenegro indefinitely under standard visa or residency regulations, or visit for shorter periods to attend festivals and meetups"
    ],
    "locationDetails": [
      "Montelibero is a transnational online community, but it focuses its physical activities in Montenegro, mainly in the coastal municipality of Bar, where MTL City is being built",
      "Montenegro's small size, strategic location, ethnic diversity, developed democracy, and relative tolerance create favorable conditions for libertarian reforms"
    ],
    "overview": [
      "The Montelibero Project is a social experiment in Montenegro that aims to build a sustainable, successful society on a national scale by combining libertarian and panarchist ideas with local cultural characteristics",
      "Principles",
      "Montelibero aims to become a convincing practical example of the competitive advantages of freedom, non-aggression, voluntary contracts, and self-organization. They prioritize the:",
      "Creation and development of an independent economic infrastructure",
      "Facilitation of the migration to countries fundamental to the project",
      "Involvement of residents in the project",
      "Identification, initialization and support of successful libertarian models and practices",
      "Crowdfunding of the resources of the global libertarian diaspora",
      "Strengthening and developing of the association as a fully functional example of extraterritorial jurisdiction"
    ],
    "xyzUrl": "https://xyz.city/network-states/montelibero",
    "posts": []
  },
  {
    "slug": "itana",
    "name": "Itana",
    "tagline": "Digital economic zone in Lagos",
    "location": "Lagos, Nigeria",
    "type": "sez",
    "themes": [
      "SEZ",
      "Tech",
      "Business"
    ],
    "website": "https://www.itana.africa",
    "image": "/popups/xyz/itana/logo.webp",
    "foundedYear": 2023,
    "sources": [
      "xyz"
    ],
    "socials": {
      "x": "https://x.com/itanaafrica"
    },
    "summary": "Africa’s first digital economic zone oriented to technology and service businesses.",
    "body": [
      "Itana is building a digital economic zone in Lagos for technology and service-based companies.",
      "The framing is jurisdictional and commercial more than temporary coliving.",
      "It is one of the clearest African SEZ-style entries in the xyz.city directory."
    ],
    "coverImages": [
      "/popups/xyz/itana/community.webp"
    ],
    "pricing": [
      "Setting up a business in Itana costs $2,000 for the first year, with a $1,150 renewal fee each year after",
      "Itana Digital Residency is $250 per year"
    ],
    "pricingSummary": "Setting up a business in Itana costs $2,000 for the first year, with a $1,150 renewal fee each year after Itana Digital Residency is $250 per year",
    "amenities": [],
    "history": [
      "In 2023, Itana raised $2M pre-seed funding to become Africa's first digital free zone",
      "In 2024, it partnered with Africa Finance Corporation for a $100 million project to develop the zone",
      "By 2025, the zone hosted over 50 companies, with half founded by the African diaspora",
      "Construction of Itana District in Alaro City is in progress, with the first phase set to welcome",
      "residents by 2027"
    ],
    "durationNotes": [
      "Itana offers permanent digital residency and business operations with no fixed duration"
    ],
    "locationDetails": [
      "Itana functions as a digital jurisdiction, allowing remote operations without physical presence in Nigeria",
      "Its physical hub is planned for Alaro City, in Lagos, Nigeria"
    ],
    "overview": [
      "Itana, formerly Talent City, operates as the first Digital Free Zone in Africa, a licensed special economic zone that allows global businesses to incorporate and operate in Nigeria remotely",
      "100+",
      "companies incorporated",
      "48h",
      "business setup time",
      "3000+",
      "community members"
    ],
    "xyzUrl": "https://xyz.city/network-states/itana",
    "posts": []
  },
  {
    "slug": "logos",
    "name": "Logos",
    "tagline": "Decentralized tech for civil society",
    "location": "Various",
    "type": "popup",
    "themes": [
      "Tech",
      "Governance"
    ],
    "website": "https://logos.co",
    "foundedYear": 2022,
    "sources": [
      "xyz"
    ],
    "socials": {
      "x": "https://x.com/Logos_network",
      "discord": "https://discord.gg/logosnetwork"
    },
    "summary": "A social movement and decentralized technology stack aimed at revitalising civil society.",
    "body": [
      "Logos is listed as a movement plus technology stack for civil society, not a single popup venue.",
      "The directories place it in the network-state adjacency set because of governance and decentralization goals.",
      "Expect software and organizing infrastructure more than a monthlong village calendar."
    ],
    "image": "/popups/xyz/logos/logo.webp",
    "coverImages": [
      "/popups/xyz/logos/zanzibar.webp"
    ],
    "pricing": [
      "Contribution to the Logos network follows an open-source philosophy. Many events are free to attend, but require prior registration. Capacity is usually limited"
    ],
    "pricingSummary": "Contribution to the Logos network follows an open-source philosophy. Many events are free to attend, but require prior registration. Capacity is usually limited",
    "amenities": [],
    "history": [
      "Logos, founded in 2022 and publicly launched in 2023, emerged as a continuation of the cypherpunk movement",
      "It gained prominence in 2025 through events and presentations, including the co-founder Jarrad Hope 's talk at the Ethereum Cypherpunk Congress",
      "By late 2025, Logos had around 2,000 contributions, 100+ active contributors, 25+ repositories, and almost 20 local circles worldwide",
      "Logos Circles are local, community-run meetups where people",
      "discuss, ideate, and build solutions to solve local problems"
    ],
    "durationNotes": [
      "Events, like conferences or meetups, typically last 1 to 2 days",
      "Participation can be indefinite through ongoing involvement in local circles, or contributions to",
      "the technology stack"
    ],
    "locationDetails": [
      "Logos is a decentralized, digital-first movement with no fixed physical location. The community is globally distributed, operating via online communities and local circles",
      "There are Logos Circles in the US, UK, Costa Rica, Argentina, Portugal, Spain, Italy, Germany, Czechia, Kyrgyzstan, Saudi Arabia, Nigeria, Kenya, and Tanzania"
    ],
    "overview": [
      "Logos is a social movement and a decentralized technology stack aimed at revitalizing civil society",
      "It provides tools for builders and explorers to address corruption, surveillance, and stagnation in traditional institutions",
      "Technology Stack",
      "Blockchain. Advanced privacy for decentralized applications and social institutions",
      "Messaging. Private peer-to-peer communication",
      "Storage. Secure decentralized storage for apps and file sharing"
    ],
    "xyzUrl": "https://xyz.city/network-states/logos",
    "posts": []
  }
];

export function getAllPopups(): Popup[] {
  return [...popupData].sort((a, b) => a.name.localeCompare(b.name));
}

export function getPopupBySlug(slug: string): Popup | undefined {
  return popupData.find((popup) => popup.slug === slug);
}

export function getPopupSlugs(): string[] {
  return popupData.map((popup) => popup.slug);
}
