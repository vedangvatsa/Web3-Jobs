import type { Popup } from '@/types/popup';

export const POPUP_TYPES = ['popup', 'permanent', 'sez'] as const;

export const POPUP_TYPE_LABELS: Record<(typeof POPUP_TYPES)[number], string> = {
  popup: 'Popup',
  permanent: 'Permanent',
  sez: 'City / SEZ',
};

export const popupData: Popup[] = [
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
      "It is one of the clearest examples of a temporary movement hardening into a permanent node.",
      "The majority of gatherings—from knowledge shares to spontaneous social meetups—are initiated by 4Seas's residents and friends in Chiang Mai, supported by the 4Seas to make every idea a reality.",
      "GO check out 4Seas Event Gallery Recurring Event Question that Matter Every Wednesday AI Goddess Every Monday Screening Every Saturday One Way Function The Exhibition of CypherPunk February-May Upcoming Events Data loading failed.",
      "‍ ‍ More than just an event, Zuzalu is a growing network of interconnected communities, fostering open innovation, shared knowledge, and real-world impact.",
      "‍ As part of this movement, 4Seas provides a lasting hub for cypherpunks, digital nomads, and visionaries to connect, build, and experiment—extending Zuzalu’s legacy in Chiang Mai.",
      "What is 4Seas A cultural hub in Chiang Mai, rooted in Ethereum and part of the Zuzalu Movement.",
      "Space 4Seas Nimman 4Seas's central city homebase—designed as a community living laboratory, a hybrid space that brings together co-living, co-working, and public gatherings into one flow."
    ],
    "coverImages": [
      "/popups/xyz/4seas/4seasgallery1.webp",
      "/popups/xyz/4seas/4seasgallery2.webp",
      "/popups/xyz/4seas/4seasgallery3.webp"
    ],
    "pricing": [
      "Public spaces are free in both locations. For access to all amenities:",
      "$110/night during high season*",
      "$60/night rest of the year",
      "$70/night during high season*",
      "$50/night rest of the year",
      "*December, January, and February make up the high season"
    ],
    "pricingSummary": "Public spaces are free in both locations. For access to all amenities: 4Seas Nimman",
    "amenities": [
      "Co-working space",
      "Events and meeting rooms",
      "4Seas Mountain View",
      "Floating pavilion",
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
      "It is one of the older brands in this set, with founding roots listed in 2016.",
      "Read Afropolitan's Manifesto Become an Afropolitan Afropolitan is looking to onboard the most dedicated and ambitious people to join Afropolitan's growing Network.",
      "Afropolitan care less about what you’ve done and more about who you aspire to become and how Afropolitan can all be better together.",
      "Join Us Founding Afropolitans 50 men and women from across all fields of tech, art, media, and finance who believe in Afropolitan's mission that all Africans should live abundant lives.",
      "View All Episodes And media coverage from Subscribe to The Frontier Learn the strategies behind tech and crypto within the African diaspora.",
      "Afropolitan demystify the pathways to limitless value creation within these emerging technologies and the communities around them.",
      "Manifesto Community Events Podcast Newsletter Terms of Service Built by Sprise.",
      "Afropolitan is an emerging digital nation for Africans and the diaspora, aiming to enable abundant lives through community, culture, and economic opportunities.",
      "The Afropolitan network is a curator of Black and African: Talent.",
      "In 2022, it raised $2.1 million in pre-seed funding from investors including Balaji Srinivasan , the founder of Network School .",
      "It expanded through Afropolitan Cities, organizing city tours and takeovers, such as the T.I.A.",
      "To build a network state enabling Africans and the diaspora to achieve abundance through community, economic tools, and eventual physical territories.",
      "Africans and the diaspora, interested in art, finance, tech, culture, health, sports, energy, and media, seeking aligned opportunities.",
      "Networking meetups, city tours, cultural takeovers, and professional gatherings connecting the diaspora.",
      "It starts digital but plans physical nodes like charter cities governed by the network."
    ],
    "coverImages": [
      "/popups/afro/6307b710eae0eb83f56d5380_events-gallery-1.webp",
      "/popups/afro/6307b7046b5dd29f892fb096_events-gallery-2.webp",
      "/popups/afro/6307b6fb8a7e1a18f87b8e02_events-gallery-3.webp"
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
      "Afropolitan combines a digital nation narrative with city tours and passport NFT products for Africans and the diaspora.",
      "Physical tours such as T.I.A. Ghana combine weeklong programming with accommodation bundles."
    ],
    "xyzUrl": "https://xyz.city/network-states/afropolitan",
    "posts": []
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
    "image": "/popups/akiyacollective.webp",
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
      "Rooted in ancient traditions and wisdom, yet boldly looking forward, Japan will take your breath away.",
      "Hand crafted by Alex Hartan ‍ akiya collective ~ アキヤ ⋆ コレクティブ a non-profit organization and social R&D lab that renovates abandoned houses in Japan into creative residencies, installations, and experiments to advance well-being.",
      "Join the community  follow Akiya Collective's efforts  Japan is currently undergoing a national housing crisis.",
      "By 2030, one third of all homes in the country will be vacant.",
      "An aging population, coupled with the concentration of youth in urban areas have caused many homes to be abandoned in the countryside.",
      "Akiya Collective goal through Akiya Collective is to purchase and revitalize these 空き家 (\"akiyas\", empty homes ) into art installations, residencies, and other creative community spaces for people to gather.",
      "Akiya Collective operates a social R&D lab: architecting experiments for changing collective behavior, preserving public goods, and developing new infrastructure for the 21st century.",
      "Akiya Collective are actively supporting a network of home-owners in acquiring, renovating, and operating properties in Japan.",
      "Akiya Collective embody a responsive model that addresses a societal issue while creating open-ended spaces for self-exploration and contribution, starting with Akiya Collective's first home...",
      "Chapter one: komoro In 2024, Akiya Collective purchased Akiya Collective's first property in Komoro Town, Nagano Prefecture, and began transforming it into a community makerspace.",
      "Over the course of 2 years, Akiya Collective worked with 250+ volunteers (chefs, musicians, carpenters, students, and founders) to clear decades of clutter, revive the home's original architecture, and build a space for creativity and connection.",
      "From large-scale art installations and woodworking experiments to artist residencies and emergent community rituals, Komoro became the birthplace of Akiya Collective's vision for Akiya Collective.",
      "Something went wrong - try again :) any questions or want to contribute more?",
      "Akiya Collective want to enable others to pursue what they are curious about, connect with other passionate individuals, and feel a sense of belonging while doing Good see photo do you resonate with Akiya Collective's mission?",
      "This includes akiya available in locations around us, stewards from different areas to act as local ambassadors, as well as information Akiya Collective have discovered in Akiya Collective's research, like government stipends and grants available per region.",
      "Get Involved 02 | contribute For those who want to build with us, Akiya Collective're introducing a system where you can contribute to Akiya Collective's efforts, and in return, earn time-to-stay in Akiya Collective's community house.",
      "‍ join the community  follow Akiya Collective's efforts  apply for core team Akiya Collective're looking for 2-3 people to join the dedicated core contributor team for Akiya Collective."
    ],
    "coverImages": [
      "/popups/akiya/akiyagallery1.webp",
      "/popups/akiya/akiyagallery2-copy.webp",
      "/popups/akiya/akiyagallery3.webp"
    ],
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
    ],
    "pricingSummary": null
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
      "Each city node keeps a small resident count while Alpha coordinates standards across the federation.",
      "Treat it as a coordination layer across places, not one popup calendar.",
      "Alpha City describes a federation of frontier industrial cities focused on compute and hardware supply chains.",
      "Public materials highlight geothermal-powered AI training campuses and East African industrial nodes.",
      "The Genesis Program offers early participants pathways involving partner-country passports and land access.",
      "Alpha Pioneers are presented as the first cohort entering the network.",
      "Alpha's public materials describe industrial cities built around geothermal power, equatorial launch logistics, and African engineering talent.",
      "Genesis participants are framed as founders who help stand up compute, robotics, and IP businesses inside the network.",
      "Alpha co-locates AI training campuses directly on that baseload, pairing equatorial launch access with a deep East African talent pool.",
      "Alpha City combine government partnerships, advanced infrastructure, and AI-native digital governance to create the most efficient and welcoming jurisdictions for the industries that will define the next century.",
      "Passport holders with a Founder classification receive corporate redomicile, preferential licensing, and priority access to land, investment opportunities, and a first look at the core economic upside of the Alpha ecosystem.",
      "Alpha is building a network of vertically integrated industrial cities for the golden age of technology.",
      "Together, the network targets hyperscale compute, robotics research, proprietary datasets, breakthrough IP, and new technology companies.",
      "Passport holders with a Founder classification receive corporate redomicile, preferential licensing, and priority access to land and investment opportunities.",
      "Alpha Pioneers are the first generation of individuals entering the Alpha ecosystem.",
      "Early Genesis Program participants can receive fast-track citizenship with passports in participating partner countries and priority land allocation."
    ],
    "coverImages": [],
    "pricing": [],
    "pricingSummary": null,
    "amenities": [
      "Genesis Program onboarding for early passport holders",
      "Founder-class licensing and land priority for qualified applicants",
      "Industrial city planning around compute and energy infrastructure",
      "Partner-country passport pathways for selected pioneers"
    ],
    "history": [
      "2026 - Alpha City · All rights reserved"
    ],
    "durationNotes": [
      "Genesis Program participation is structured as a multi-year citizenship and investment pathway.",
      "Passport holders with a Pioneer classification receive residency access, early land and token allocations, and direct participation in Alpha's rapidly growing ecosystem."
    ],
    "locationDetails": [
      "Alpha's public roadmap references industrial cities in East and West Africa, including a Naivasha, Kenya site.",
      "Equatorial launch access and regional talent pools are part of the stated geography strategy.",
      "Alpha City cities are strategically located for AI, digital finance, advanced manufacturing, energy infrastructure, critical minerals, and aerospace."
    ],
    "overview": [
      "Industrial nodes are described as vertically integrated cities for compute, robotics, and IP creation."
    ],
    "xyzUrl": "https://xyz.city/network-states/alpha-city",
    "posts": []
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
    "image": "/popups/amagilife.webp",
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
      "It sits closer to intentional community design than to conference-style popups.",
      "A new model of living What if you could live in a place that feels like home, works like a startup, and grows like a movement?",
      "Amagi Life’re building a village in a place you already love—where nature, community, and opportunity converge; co-designed with you.",
      "A Hidden Sanctuary for Your Family , A Shortcut to Their Future.",
      "Learn More An innovative economic model Below you’ll find two ways to explore Amagi.",
      "Start with Amagi Life's Amagi AI chatbot or dive deeper into the full white paper when you’re ready.",
      "Chat with Us Amagi Life's White Paper Hybrid model Invest in land, live in the village, and become a co-owner over time.",
      "Many ways to earn equity in the village over time.",
      "Balanced ecosystem Affordable eco-conscious living with nature, innovation, and community working in synchronicity.",
      "Community oriented Cultural and entrepreneurial programs and spaces that helps drive community engagement of people who share similar values.",
      "Liran Jakob Rosenfeld January 21, 2026 Why Amagi Life Don't Use Master Plans Amagi's Blog December 31, 2025 READ THE Blog FAQ What is Amagi?",
      "Amagi is a regenerative village model that combines long-term living, shared stewardship of land, and a living economic system.",
      "It is designed to support people who want stability, autonomy, and meaningful contribution without the pressure of conventional home ownership or extractive development.",
      "Amagi exists to address three failures at once: unaffordable housing, fragile communities, and extractive development.",
      "Amagi Life are building a practical alternative where people can live securely, contribute meaningfully, and participate in shared upside—while regenerating land, culture, and local economies.",
      "Amagi is the first recorded word for freedom, originating in ancient Sumer.",
      "It roughly translates to “return to the mother” or “return to freedom”—not escape from responsibility, but liberation through restoration and integration.",
      "Amagi is built on regenerative land stewardship, shared ownership without forced collectivism, long-term affordability, and a living economic model that rewards contribution rather than extraction.",
      "Amagi is looking for people who are self-responsible, emotionally mature, capable of cooperation, and interested in contributing to something larger than themselves.",
      "It is not a place for passive consumption or ideological conformity.",
      "In this current phase, Amagi is explicitly seeking early adopters — people who are open, adventurous, and comfortable stepping into a living project that is still taking shape.",
      "Life here involves ambiguity, experimentation, and a willingness to participate while things are still rough around the edges.",
      "What unites these profiles is not profession or status, but posture: a long-term orientation, tolerance for uncertainty, and a genuine desire to help shape where and how they live."
    ],
    "coverImages": [
      "/popups/amagi/amagilifegallery1.webp",
      "/popups/amagi/amagilifegallery2.webp",
      "/popups/amagi/amagilifegallery3.webp"
    ],
    "pricing": [],
    "amenities": [],
    "history": [
      "2026 - Why We Don't Use Master Plans Amagi's Blog December 31,"
    ],
    "durationNotes": [],
    "locationDetails": [
      "Discover the rare balance of Amagi's Hidden Valley: A serene community for deep connection, located just 5 minutes away from the island's international schools."
    ],
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
    ],
    "pricingSummary": null
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
      "Arc activated Network School in Kazakhstan (Astana) and Malaysia before applying the same pop-up-then-permanent playbook in Sri Lanka, including First Capital Startup Nation in Colombo."
    ],
    "coverImages": [
      "/popups/xyz/arc/arcgallery1.webp",
      "/popups/xyz/arc/arcgallery2.webp",
      "/popups/xyz/arc/arcgallery3.webp"
    ],
    "xyzUrl": "https://xyz.city/network-states/arc",
    "pricing": [
      "Campus access at Asaya is unbundled and pay-as-you-go rather than a single all-in bundle",
      "First Capital Startup Nation hosted packages are invitation-only (see thearccity.com/startup-nation)",
      "Residency at rc in Network School is priced at $1,250/month for a shared room with all included",
      "Pop-up villages can range from $500 to $2,000, depending on the location and duration"
    ],
    "pricingSummary": "Unbundled, pay-as-you-go access at Asaya, Mirissa; Startup Nation packages by invitation",
    "amenities": [
      "Beachfront campus at Asaya, Mirissa Beach",
      "Founder community, events, and accelerator-style programming",
      "Ascend, Fulgur, Curious, and Arc Angel investor programming in Sri Lanka",
      "Member guide for relocators (password provided with membership)",
      "In Network School, rc positions itself as a platform for founders to raise investment, hire local talent and drive GDP",
      "Amenities in rc's base at NS include:",
      "3 nutritious meals (breakfast, lunch, dinner)",
      "Private co-working spaces",
      "Private office spaces",
      "High-speed Wi-Fi",
      "Workshops, lectures, and events"
    ],
    "history": [
      "2024 - Arc Lisbon pop-up (September–October), with Lisbon Web3 and tech community partners",
      "2025 - Arc Austin pop-up during Austin tech week (March); Singapore pop-up (September–October)",
      "2025 to 2026 - Activation at Network School in Kazakhstan (Astana campus; prior site in Forest City, Malaysia)",
      "2026 - Live on Mirissa Beach, Sri Lanka; First Capital Startup Nation with Hatch in Colombo (28 September–1 October)",
      "rc is in its early stages, founded by James of rc in 2024",
      "Inspired by experiences in NEOM, Próspera, Solana Hacker Houses, and Zuzalu, it began with pop-up cities",
      "September - October 2024",
      "rc Network School",
      "September - October 2025",
      "As of 2026, rc is permanently and continuously at Network School",
      "The project is looking for a special economic zone to build a",
      "city that will bring talent, capital and innovation to its"
    ],
    "durationNotes": [
      "Permanent founder community at Asaya, Mirissa, with ongoing programming",
      "Historical pop-up villages typically ran about one to two months",
      "First Capital Startup Nation 2026: 28 September–1 October in Colombo",
      "rc has a permanent residency at Network School and a permanent outpost in the charter city of Próspera",
      "In addition, rc's pop-up villages last from 1 to 2 months",
      "rc organizes pop-up villages as the means of drawing attention to the possibility and importance",
      "of charter cities"
    ],
    "locationDetails": [
      "Primary campus: Asaya, a beachfront campus in Mirissa, Sri Lanka",
      "Arc Sri Lanka connects builders to Colombo and national institutions",
      "Prior activation: Network School in Astana, Kazakhstan (formerly Forest City, Malaysia until 2026)",
      "rc's initial layer two base is located at Network School in Forest City, Malaysia",
      "It also has an outpost in Próspera (Roatán, Honduras), and hosts pop-up villages globally (Portugal, USA)"
    ],
    "overview": [
      "Arc accelerates the trajectory of people and places and ships legal, capital, and company infrastructure together.",
      "The Sri Lanka campus at Asaya on Mirissa Beach is open to the early community.",
      "Programming includes Ascend, Fulgur, Curious, and Arc Angel alongside Colombo events such as Startup Nation.",
      "A layer two network state at Network School and a pop-up village organizer experimenting with new governance, organization, and legal models",
      "A layer two network state is one which leverages the infrastructure of its parent to scale before",
      "being independent",
      "rc supports new societies by:",
      "Helping recruit and retain citizens",
      "Making it easier, faster and possible for organizations to do business"
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
    "image": "/popups/arkpad.webp",
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
      "Samal Island in the Philippines hosts ArkPad’s Reef Resort demo, combining floating units with hexafarm aquaculture.",
      "See the evidence Book a stay What ArkPad build Three products, one purpose ArkPad-D The Arkpad-D is the latest model of Arkpad unit.",
      "It is designed to survive hurricanes, be deployed hundreds of miles from land, and last decades with little to no maintenance without rusting.",
      "It can be deployed with Solar Electricity, fresh Water Generation, Internal Septic and fresh Water tanks, and even aquaculture space for growing fish.",
      "About the ArkPad-D Hexafarm The Hexafarm is a new type of floating fish cage that leverages polyculture to increase fish health, product output, and overall efficiency.",
      "Polyculture is the practice of growing multiple types of seafoods in close quarters with each other, to create a closed ecosystem that promotes the growth of all organisms.",
      "In the case of the Hexafarm, the central cage is designed for salt water fish such as Milk Fish or Grouper, while the outer cage for seaweed growing space or low-density fish rearing.",
      "About the Hexafarm Reef Resort The Reef Resort is the Philippines implementation of the previous two technologies.",
      "Samal Island's Reef Resort combines Arkpad-D units with 4 hexafarms in close proximity.",
      "It is fully walkable, and uses 'Glamphouses' another seastead design, to hold up to 150 guests per day.",
      "You can purchase ownership in some units in the Reef Resort using cryptocurrency, or contact us to ask about the types of seasteads used and if they can be deployed to your property.",
      "These are photographs of a resort that is open, not visualisations of one that is planned.",
      "ArkPad are a team of experienced Naval Architects, Civil Engineers and Mechanical Engineers, as well as Blockchain Developers.",
      "ArkPad are committed to pushing forward new technologies to bring floating cities into reality.",
      "Whether the technology is smaller and more stable deep sea platforms, improved mariculture techniques.",
      "Naval Architects Civil Engineers Mechanical Engineers Blockchain Developers The longer view What a floating city looks like A visualisation of the same structural system at settlement scale — platforms, breakwaters and aquaculture together.",
      "The Reef Resort shown elsewhere on this page is built and operating; this is what the same system is designed to scale into.",
      "Research & development Other projects Self-driving Boats Arkpad is developing technologies to build self-driving boats that can travel long distances without needing a human at the helm.",
      "Underwater Drones ArkPad are building a modular underwater drone, which can be used for underwater viewing, manipulating objects, hull inspections, hull cleaning, and aquaculture work.",
      "Ground Effect Drones ArkPad is developing a ground effect drone for long range cargo delivery, ground effect vehicles exist between air freight and traditional shipping in terms of cost and speed."
    ],
    "coverImages": [
      "/popups/arkpad/arkpadgallery1.webp",
      "/popups/arkpad/arkpadgallery2.webp",
      "/popups/arkpad/arkpadgallery3.webp"
    ],
    "pricing": [],
    "amenities": [],
    "history": [],
    "durationNotes": [],
    "locationDetails": [],
    "overview": [
      "ArkPad runs coliving for founders with an on-site maker and prototyping culture.",
      "Stays combine housing with build space for hardware and software projects."
    ],
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
    ],
    "pricingSummary": null
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
    "summary": "Sydney-rooted popups and residencies for founders, artists, and researchers.",
    "body": [
      "Arrayah means a ray of hope and describes itself as a place to just do things.",
      "Arrayah runs Sydney-rooted popups and shorter residencies for founders, artists, and researchers.",
      "Culture, tech, and governance show up across editions rather than as one fixed monthlong campus.",
      "Arrayah runs co-living houses, pop-up neighborhoods, and short accelerators for people building startups, art, or research."
    ],
    "coverImages": [
      "/popups/xyz/arrayah/community.webp",
      "/popups/xyz/arrayah/views.webp"
    ],
    "pricing": [
      "Freo Neuhaus Pop-Up offers tiered accommodation options: shared or private rooms, with shared or private bathrooms",
      "Arrayah Residency was $400 for the whole"
    ],
    "pricingSummary": null,
    "amenities": [
      "Co-living (shared or private rooms)",
      "Co-working spaces",
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
    "slug": "blc",
    "name": "Bitcoin Learning Center",
    "tagline": "Physical Bitcoin hub in Asia",
    "location": "Chiang Mai, Thailand",
    "type": "permanent",
    "themes": [
      "Crypto"
    ],
    "website": "https://www.bitcoinchiangmai.org",
    "image": "/popups/bitcoincenter.webp",
    "sources": [
      "ns"
    ],
    "socials": {},
    "summary": "A standing physical hub for Bitcoin education and community activity in Chiang Mai.",
    "body": [
      "Bitcoin Learning Center is positioned as one of Asia’s most active physical Bitcoin hubs.",
      "The focus is in-person learning and gathering rather than a full startup city stack.",
      "Chiang Mai already hosts several overlapping crypto hubs, and this one stays Bitcoin-specific.",
      "500+ members building the Bitcoin community in Chiang Mai A physical Bitcoin hub connecting local communities, universities, government, media, and sport across the region.",
      "Operating as a regional platform across education, media, and major events, it connects high-signal participants and serves as the central point of access for Bitcoin in Asia.",
      "If you are entering Asia for Bitcoin, this is where you start.",
      "November 20, 2026 Bitcoin Academy Educators 2026 Three-day Bitcoin educator training in public speaking and persuasive presenting, limited to 10 spots.",
      "September 26, 2026 Innovate Chiang Mai 2026 International Business Plan Competition International business plan competition for university students, held in English at NARIT Chiang Mai.",
      "September 26, 2026 Fun Fam Run 2026 Family fun run at Sirindhorn AstroPark, free to enter, held as part of Innovate Chiang Mai 2026.",
      "September 25, 2026 Innovate Chiang Mai 2026 Three-day expo of learning, innovation, and opportunity, free and open to the public at NARIT AstroPark.",
      "September 25, 2026 Freedom Money 2026 Sixteen voices from Bitcoin, finance, technology, and AI on what financial freedom really means, in a TED Talk-style format.",
      "September 19, 2026 Digital Future Lab 2026 A one-day workshop on digital finance and AI at the Faculty of Economics, Chiang Mai University.",
      "September 12, 2026 Entrepreneur Workshop 2026 A 90-minute workshop with Jimmy Kostro on entrepreneurship, career paths, and using AI to shape an idea.",
      "August 8, 2026 BitDevs Q10: BIP110 activation Build on Bitcoin meetup on BIP110 activation and more, hosted by Piccolo and co-hosts.",
      "July 18, 2026 Not your keys, not your coins Beginner-friendly workshop on safely storing Bitcoin with a hardware wallet, step-by-step.",
      "An intro to SeedSigner, the open-source alternative to proprietary hardware wallets.",
      "July 5, 2026 BLC and Dude Run Club A community run bringing the Bitcoin Learning Center together with Dude Run Club.",
      "June 13, 2026 Not your keys, not your coins Beginner-friendly workshop on safely storing Bitcoin with a hardware wallet, step-by-step."
    ],
    "coverImages": [
      "/popups/blc/bitcoincentergallery1.webp",
      "/popups/blc/bitcoincentergallery2.webp",
      "/popups/blc/bitcoincentergallery3.webp"
    ],
    "pricing": [],
    "amenities": [],
    "history": [
      "2026 - Bitcoin Academy Educators",
      "2026 - Innovate Chiang Mai",
      "2026 - Fun Fam Run",
      "2026 - Family fun run at Sirindhorn AstroPark, free to enter, held as part of Innovate Chiang Mai",
      "2026 - Freedom Money",
      "2026 - Digital Future Lab",
      "2026 - Entrepreneur Workshop"
    ],
    "durationNotes": [
      "With over 100 unique visitors per month and consistent engagement through weekly content, university programs, and large-scale events, the Center functions as a true gateway into the region."
    ],
    "locationDetails": [
      "Based in Chiang Mai, the hub attracts a continuous flow of international builders, founders, and Bitcoiners."
    ],
    "overview": [],
    "xyzUrl": null,
    "posts": [],
    "pricingSummary": null
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
    "image": "/popups/cafecursor.webp",
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
      "Editions rotate through cities; see the official Luma calendar for the next Cafe Cursor takeover.",
      "Cafe Cursor is a series of popup cafe takeovers where AI builders and indie hackers gather to work.",
      "Each event turns a local cafe into a temporary coworking space.",
      "Following initial events in San Francisco and New York, the project grew through community ambassadors who host local editions.",
      "Approved hosts receive support to run their own popups.",
      "The network now spans more than 80 countries with hundreds of events run by local ambassadors.",
      "Ambassadors receive playbooks to reserve cafes, coordinate RSVPs on Luma, and welcome local AI builders for a few hours of coworking.",
      "The format stays intentionally lightweight: no monthlong visas, just repeatable city-level events that scale through volunteers.",
      "Cafe Cursor - Popup cafes for AI developers Cafe Cursor Popup cafe takeovers where Cursor users gather to code and build together over coffee and credits.",
      "Following initial events in San Francisco and New York, the project grew through community ambassadors.",
      "Nov 2025 Open call for hosts Applications opened for community hosts worldwide.",
      "Jan 2026 Global expansion The network expanded to Europe, Asia, Africa, and Latin America.",
      "Ongoing Worldwide series The series operates in 80+ countries, with over 600 events run by a network of local ambassadors."
    ],
    "coverImages": [
      "/popups/cc/cafecursorgallery1.webp",
      "/popups/cc/cafecursorgallery2.webp",
      "/popups/cc/cafecursorgallery3.webp"
    ],
    "pricing": [
      "Most local Cafe Cursor editions are free or low-cost community gatherings",
      "Host support may include Cursor credits depending on the edition"
    ],
    "amenities": [
      "Temporary coworking layout inside partner cafes",
      "Cursor community hosts and ambassador support",
      "Local event promotion through Luma listings",
      "Coffee-and-code format aimed at AI builders",
      "Short sessions suitable for evening or weekend builds"
    ],
    "history": [
      "Sep 2025 - First Cafe Cursor popup in San Francisco",
      "Oct 2025 - Second event in New York",
      "Nov 2025 - Open call for community hosts worldwide",
      "Jan 2026 - Expansion across Europe, Asia, Africa, and Latin America",
      "Ongoing - Worldwide series with 600+ events hosted to date"
    ],
    "durationNotes": [
      "Individual Cafe Cursor popups are short-format gatherings rather than monthlong villages.",
      "Hosts run local editions on their own schedule through the ambassador program.",
      "Oct 2025 Cafe Cursor in New York The second event followed a month later."
    ],
    "locationDetails": [],
    "overview": [
      "Cafe Cursor reports 250+ cities, 80+ countries, and 600+ hosted events across its ambassador network.",
      "Hosts apply through the official Cursor community form to receive playbooks and credits.",
      "Event listings and host applications for Cafe Cursor are centralized on luma.com/cursorcommunity."
    ],
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
    ],
    "pricingSummary": null
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
    "image": "/popups/morazan.webp",
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
      "It expands the Honduras map beyond Próspera’s island footprint.",
      "Ciudad Morazán is a pioneering 24-hectare charter city near Choloma, Honduras.",
      "Founded by Massimo Mazzone, it provides affordable housing, industrial workspaces, and reliable infrastructure.",
      "The community is focused on local blue-collar workers and families rather than expat-only coliving.",
      "Private security and customer-focused governance are core parts of the operating model.",
      "Renters and industrial tenants apply through Ciudad Morazán's published residence and business channels on morazan.city.",
      "The charter-city model pairs private development with written rules so operators know how permits, security, and services work before they move in.",
      "International observers watch Morazán as a test of whether ZEDE-style governance can deliver safer housing for working families in northern Honduras.",
      "Distinctly focused on local blue-collar workers rather than expats, this self-sustaining community offers private security and customer-focused governance in a historically dangerous region.",
      "2019 Ciudad Morazán Approved CAMP (Commission for the Adoption of Best Practices) officially approves the project.",
      "2022 ZEDE Law Repeal Honduran Congress repeals the ZEDE laws, triggering international arbitration.",
      "2025 Honduran Election New administration takes office, shaping the future of ZEDE protections."
    ],
    "coverImages": [
      "/popups/morazan/morazangallery3.webp",
      "/popups/morazan/morazangallery4.webp",
      "/popups/morazan/morazangallery1.webp"
    ],
    "pricing": [],
    "amenities": [
      "Affordable rental housing for Honduran workers and families",
      "Industrial workspaces for small manufacturers and trades",
      "Reliable electricity and water infrastructure on site",
      "Private security and controlled access compared with surrounding areas",
      "Retail and services aimed at residents rather than tourists",
      "Community events and programming for local entrepreneurs",
      "Child-friendly public spaces within the 24-hectare footprint",
      "Customer-service-oriented governance for tenant requests"
    ],
    "history": [
      "2013 - Honduras amends its constitution to enable ZEDE-style economic zones",
      "2019 - CAMP officially approves the Ciudad Morazán project",
      "2020 - Developers draft Morazán's first laws and governance framework",
      "2022 - Honduran Congress repeals ZEDE laws, triggering international arbitration",
      "2025 - National elections shape the future of ZEDE protections"
    ],
    "durationNotes": [
      "Ciudad Morazán is designed as a permanent charter city rather than a seasonal popup.",
      "Leases target long-term residents and industrial tenants."
    ],
    "locationDetails": [
      "Ciudad Morazán sits near Choloma in northern Honduras.",
      "The site combines residential blocks with industrial workspace for local entrepreneurs.",
      "Ciudad Morazan - Honduran blue collar startup city Ciudad Morazan A startup city in Honduras providing safe housing and modern amenities for blue collar families and entrepreneurs."
    ],
    "overview": [
      "Morazán markets itself as a blue-collar startup city with safe housing and modern amenities.",
      "The project positions charter-city governance as a tool for local economic mobility.",
      "Business and residence applications for Ciudad Morazán are handled through the team's official morazan.city site."
    ],
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
    ],
    "pricingSummary": null
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
    "image": "/popups/commonshub.webp",
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
      "It is one of the European entries that is clearly temporary and theme-driven.",
      "Commons Hub is a coliving and popup venue in the Austrian Alps, about an hour from Vienna.",
      "It hosts artists, hackers, and tinkerers exploring technology, economy, society, and nature.",
      "The house includes makerspaces, gardens, a workshop, and a wood-fired hot tub, with hiking trails and a river nearby.",
      "Retreat organizers rent the Alpine house for multi-day regenerative commons gatherings without building a new venue each season.",
      "Hackers and artists share kitchen, garden, and workshop access during longer coliving stays.",
      "Event Venue & Co-Living in the Austrian Alps | Commons Hub ACCOMMODATION VENUE EVENTS COMMUNITY ABOUT EN Loading… Welcome to the commons hub , a communal guesthouse and events venue in the Austrian Alps.",
      "A home to artists, hackers, and tinkerers exploring new perspectives across technology, economy, society, and nature.",
      "The kind of place that feels familiar, even if it’s your first time.",
      "Commons Hub - Regenerative commons popup village Commons Hub A popup village for regenerative commons in the Austrian Alps.",
      "It is a home for artists, hackers, and tinkerers exploring new perspectives across technology, economy, society, and nature.",
      "The house has makerspaces, gardens, a workshop, and a wood-fired hot tub, with hiking trails and a river nearby."
    ],
    "coverImages": [
      "/popups/commons/commonshubgallery1.webp",
      "/popups/commons/commonshubgallery2.webp",
      "/popups/commons/commonshubgallery3.webp"
    ],
    "pricing": [],
    "amenities": [
      "Makerspaces and workshop tools on site",
      "Gardens and outdoor gathering areas",
      "Wood-fired hot tub and river access",
      "Event venue space for retreats and popups",
      "Coliving rooms in a historic Alpine inn"
    ],
    "history": [
      "1860 - Property built as a countryside inn in Reichenau an der Rax",
      "2023 - Commons Hub formalized as a coliving and events venue",
      "2026 - Commons Hub · Reichenau an der Rax, Austria"
    ],
    "durationNotes": [
      "Commons Hub runs both ongoing coliving and time-bound popup villages.",
      "Stays range from short retreats to longer artist and builder residencies.",
      "From private celebrations to week-long retreats, the commons hub’s laid back but intentional vibe makes for unforgettable experiences.",
      "2026 Valley of the Commons 4-week popup village for communal living."
    ],
    "locationDetails": [
      "Commons Hub is in Reichenau an der Rax, Austria.",
      "The Alps setting supports retreats, residencies, and regenerative commons programming."
    ],
    "overview": [
      "Commons Hub welcomes Web3 nomads, regens, and crypto commons builders for multi-week stays.",
      "The venue combines Alpine coliving with regenerative commons programming.",
      "Booking and retreat inquiries for Commons Hub are handled through commons-hub.at."
    ],
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
    ],
    "pricingSummary": null
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
      "Crecimiento - Argentine tech innovation hub Crecimiento Making Argentina a global hub for tech innovation.",
      "2025 Aleph Editions Expand Popup events and programs grow the ecosystem with institutional partnerships.",
      "Crecimiento is a global movement transforming Argentina into a hub for crypto and frontier tech innovation.",
      "In 2025, Aleph March '25 set a record with 5,000+ attendees and Aleph Festival ran from August to November.",
      "The movement has engaged 10,000 builders, supported 250+ start-ups, and secured backing from Protocol Labs , the Ethereum Foundation , and major Web3 protocols."
    ],
    "coverImages": [
      "/popups/xyz/crecimiento/crecimientogallery1.webp",
      "/popups/xyz/crecimiento/crecimientogallery2.webp",
      "/popups/xyz/crecimiento/crecimientogallery4.webp"
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
      "The Aleph Hub operates as a year-round permanent co-working space",
      "Its cornerstone is Aleph, an annual, month-long popup village in Buenos Aires that gathers builders to live, build, and test real-world applications alongside local policymakers.",
      "Beyond the popup event, Crecimiento operates a year-round curated permanent hub in Buenos Aires.",
      "August 2024 First Aleph Popup City Month-long Buenos Aires urban lab convenes 2,000+ builders and investors.",
      "April 2026 Uniswap Acceleration Season 6-week DeFi program with Uniswap Foundation."
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
    "image": "/popups/culdesac.webp",
    "sources": [
      "ns"
    ],
    "socials": {
      "x": "https://x.com/culdesac"
    },
    "summary": "A car-free walkable neighborhood experiment focused on belonging and local commerce.",
    "body": [
      "Culdesac is building walkable urban fabric in Tempe with transportation freedom and local business density as design goals.",
      "Culdesac’s Tempe neighborhood is car-free year-round housing, not a traveling popup calendar.",
      "The product is a neighborhood residents can live in year-round.",
      "Culdesac Tempe is marketed as the first car-free neighborhood built from scratch in the United States.",
      "The 17-acre district combines apartments, local retail, plazas, and paths next to a light rail station.",
      "Residents receive bundled mobility perks such as light-rail access and discounted rideshare options.",
      "On-site retailers span food, wellness, clothing, and neighborhood services.",
      "Phase-one openings in 2023 proved demand for car-free infill next to light rail in greater Phoenix.",
      "By 2025 Culdesac reports more than three hundred residents and twenty on-site businesses operating in the Tempe district.",
      "View Floor Plans Schedule Tour Welcome To Culdesac Tempe First walkable community of its kind — embracing a culture of belonging, transportation freedom, and thriving local businesses.",
      "View Floor Plans Schedule Tour Come connect with us Come connect with us Living at Culdesac Tempe Culdesac Tempe means living connected with those around you — your neighbors, local businesses, and the broader city.",
      "Culdesac courtyards, shared spaces, and events make it easy to build community.",
      "As a resident, you'll receive unlimited free rides on the metro, free & discounted rideshare and ridehail, as well as Bird scooters just a moment away.",
      "You're just a quick stroll away from all your essentials at the corner market, a quick haircut, or a cozy dinner at Cocina Chiwas.",
      "Culdesac local community businesses provide goods and services for aesthetics, wellness, clothing, homemade goods, treats & accessories with even more coming soon.",
      "Check out all of Culdesac's small businesses or come visit and meet them!",
      "View Retail Shops and Restaurants Award-Winning Retail Program At Culdesac Tempe, Culdesac's retailers are award-winners, community leaders, and visionaries.",
      "It has 17 acres of apartments, local shops, plazas, and paths situated right next to a light rail station in Tempe, Arizona.",
      "Nov 2019 Groundbreaking Construction begins on Culdesac Tempe, the first project on a 17-acre infill site in Tempe, Arizona.",
      "May 2023 First Residents Phase one opens and initial residents move into the car-free community.",
      "2025 Community Expansion Culdesac Tempe reaches over 350 residents and 21 local businesses with additional buildings, mature landscaping, and full amenities operational."
    ],
    "coverImages": [
      "/popups/culdesac/culdesacgallery1.webp",
      "/popups/culdesac/culdesacgallery2.webp",
      "/popups/culdesac/culdesacgallery3.webp"
    ],
    "pricing": [],
    "amenities": [
      "Car-free internal paths and shared courtyards",
      "Bundled light-rail and rideshare mobility perks",
      "Ground-floor retail including food, wellness, and services",
      "Community events in shared plazas",
      "Apartments designed without private garage requirements"
    ],
    "history": [
      "Nov 2019 - Groundbreaking on the Tempe infill site",
      "May 2023 - First residents move into phase one",
      "2025 - Community reports 350+ residents and 21 local businesses with expanded amenities"
    ],
    "durationNotes": [],
    "locationDetails": [
      "Culdesac Tempe is in Tempe, Arizona, adjacent to Valley Metro light rail.",
      "The master plan emphasizes walkable courtyards and ground-floor retail.",
      "Culdesac - A walkable city in Arizona Culdesac Walkable neighborhoods."
    ],
    "overview": [
      "Culdesac Tempe targets residents who want walkable daily life next to transit.",
      "The neighborhood bundles mobility benefits instead of on-site parking mandates."
    ],
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
    ],
    "pricingSummary": null
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
      "/popups/xyz/edge-city/edgecitygallery1.webp",
      "/popups/xyz/edge-city/edgecitygallery2.webp",
      "/popups/xyz/edge-city/people.webp"
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
      "Fitness classes (yoga, HIIT, strength training)",
      "Co-working spaces",
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
      "2024 - UP NEXT Edge Esmeralda '24 Healdsburg, CA June 2 – 29,",
      "2024 - UP NEXT Aleph, Crecimiento Buenos Aires, Argentina Aug 6 – Sept 6,",
      "2024 - UP NEXT Edge City Lanna Chiang Mai, Thailand Oct 10 – Nov 10,",
      "2024 - UP NEXT Edge City Austin Austin, TX Mar 2 – 7,",
      "2025 - UP NEXT Edge City South Africa Cape Town, South Africa Apr 3 – 12,",
      "2025 - UP NEXT Edge Esmeralda '25 Healdsburg, CA May 24 – Jun 21,",
      "2025 - UP NEXT Edge City Bhutan",
      "2025 - Bhutan, South Asia Sept 14 – 21,",
      "2025 - UP NEXT Edge City Patagonia San Martin, Argentina Oct 18 – Nov 15,",
      "2025 - UP NEXT Edge Esmeralda",
      "2026 - Healdsburg, CA May 30 – Jun 27,",
      "2026 - UP NEXT Edge City India Mandrem, Goa, India Oct 11 - Nov 1,",
      "2025 - Edge Esmeralda",
      "2026 - Edge Esmeralda",
      "2026 - Upcoming monthlong flagship popup village in Healdsburg, CA beginning May",
      "2024 - Edge City Austin ,",
      "2025 - Edge City South Africa ,",
      "2025 - Edge City Bhutan ,"
    ],
    "durationNotes": [
      "The typical Edge City pop-up village runs for 1 to 2 months, grouping approximately 1,000 people with 200-300 full-time residents",
      "Expeditions and unconferences are usually shorter (1 week), as they serve as scouting journeys for future villages"
    ],
    "locationDetails": [
      "Edge City’s pop-up villages have surfaced across 3 continents :",
      "Apart from pop-up villages, Edge City also organizes unconferences and expeditions, aiming at exploring specific topics and evaluating potential locations for future villages",
      "Edge City Denver, 2024",
      "Edge City Austin, 2025",
      "Edge City South Africa, 2025",
      "Edge City Bhutan, 2025"
    ],
    "overview": [
      "Founded by Timour Kosters and Janine Leger, Edge City operates as a society incubator that hosts month-long pop-up villages worldwide",
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
      "Addis Ababa host teams anchor the brand while conferences and residencies rotate with local partners.",
      "Builders use Eth-iopia editions to meet Ethiopia-based founders before committing to longer stays.",
      "ETHiopia's January 2025 pop-up brought together more than 100 participants for hackathons and conference programming.",
      "The initiative focuses on DeFi, governance, and crypto's role in African economies.",
      "Participants joined from across Africa and abroad for talks on DeFi, local governance experiments, and Ethereum tooling.",
      "Organizers positioned the pop-up as a bridge between global Ethereum research circles and Addis Ababa builders.",
      "ETHiopia is a pop-up village initiative focused on advancing Ethereum and decentralized technologies in Africa through immersive co-living experiences.",
      "As of February 2026, ETHiopia appears inactive on social media.",
      "The initiative supported local Ethereum projects and explored topics like DeFi, governance, and crypto's role in African economies.",
      "\" Dagim Jida, Ambassador at Base It was an eye-opening experience.",
      "The things I learned, the connections I made and the inspiration I gained were priceless.",
      "\" Kevin Chibuoyim, Co-Founder at BlockchainUNN Made good friends from Kenya, Togo, Uganda, Eritrea, Ghana, France, and many more countries.",
      "To foster Ethereum innovation in Africa through pop-up villages that connect global builders with local communities for collaboration on decentralized tech.",
      "Ethereum developers, researchers, entrepreneurs, and enthusiasts interested in blockchain's impact on African economies and governance."
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
      "Accommodation and food were not covered",
      "Co-working spaces during the Addis Ababa pop-up",
      "High-speed internet for hackathon teams",
      "Workshops, lectures, and community events on site",
      "Wellness activities alongside technical programming"
    ],
    "history": [
      "ETHiopia was launched in 2024, aiming to connect Ethereum innovation to African communities",
      "In January 2025, it hosted ETHiopia Pop-up, a one-month event in Addis Ababa that brought together over 100 participants for hackathons, conferences, and discussions on blockchain adoption",
      "The initiative supported local Ethereum projects and explored topics like DeFi, governance, and crypto's role in African economies"
    ],
    "durationNotes": [
      "ETHiopia's pop-up village lasted 1 month",
      "The flagship ETHiopia pop-up ran for one month in Addis Ababa.",
      "Accommodation and meals were not included in the free application-based ticket.",
      "In January 2025, it hosted ETHiopia Pop-up , a one-month event in Addis Ababa that brought together over 100 participants for hackathons, conferences, and discussions on blockchain adoption."
    ],
    "locationDetails": [
      "ETHiopia's pop-up village took place in Addis Ababa, Ethiopia"
    ],
    "overview": [
      "ETHiopia is a pop-up village initiative focused on advancing Ethereum and decentralized technologies in Africa through immersive co-living experiences",
      "As of February 2026, ETHiopia appears inactive on social media",
      "ETHiopia connects Ethereum builders with African communities through monthlong popup formats.",
      "The January 2025 pop-up in Addis Ababa hosted hackathons, talks, and project collaboration.",
      "ETHiopia posts pop-up applications and retrospectives on eth-iopia.xyz when new cohorts open."
    ],
    "xyzUrl": "https://xyz.city/network-states/ethiopia",
    "posts": []
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
      "It sits in the overlap between temporary Zu-style gatherings and longer-horizon jurisdiction work.",
      "Forma B u i l d s o m e t h i n g o n t h e i n t e r n e t , i t w i l l c h a n g e y o u r l i f e .",
      "Forma is a home for the founders and artists building on it.",
      "2 0 2 3 B u i l d s o m e t h i n g o n t h e i n t e r n e t , i t w i l l c h a n g e y o u r l i f e .",
      "2 0 2 3 A n A I f r i e n d w h o h e l p s y o u t u r n y o u r i d e a o r p a s s i o n i n t o a b u s i n e s s .",
      "Text Locky A n A I f r i e n d w h o h e l p s y o u t u r n y o u r i d e a o r p a s s i o n i n t o a b u s i n e s s ."
    ],
    "coverImages": [
      "/popups/xyz/forma/formagallery1.webp",
      "/popups/xyz/forma/formagallery2.webp",
      "/popups/xyz/forma/formagallery3.webp"
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
      "Forma’s pop-up villages last one to two weeks",
      "Join Residency Text Locky The internet is the fastest growing economy.",
      "2 0 2 3 Join Residency Text Locky B u i l d s o m e t h i n g o n t h e i n t e r n e t , i t w i l l c h a n g e y o u r l i f e ."
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
      "/popups/xyz/frontier-tower/frontiertowerbanner2.webp",
      "/popups/xyz/frontier-tower/frontiertower1.webp",
      "/popups/xyz/frontier-tower/frontiertower2.webp"
    ],
    "pricing": [
      "$190/month billed monthly",
      "Access to the spaces",
      "Founding Citizen",
      "$150/month billed annually",
      "Access to the spaces, special voting rights, and priority access to events",
      "$500/month billed monthly",
      "Access to the spaces, special voting rights, and discounted hotel stays",
      "Builders under 25, as well as university teachers, students, and researchers can apply for a scholarship"
    ],
    "pricingSummary": "Citizen $190/month billed monthly",
    "amenities": [
      "Amenities in Frontier Tower include:",
      "Co-working spaces",
      "Workshops, hackathons and events",
      "Frontier Tower doesn't provide accommodation yet",
      "24/7 secure access",
      "Audiovisual setup and lighting",
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
    "slug": "zuberlin",
    "name": "Futura Camp (ZuBerlin)",
    "tagline": "Immersive tech coliving residency in Berlin",
    "location": "Berlin, Germany",
    "type": "popup",
    "themes": [
      "Tech"
    ],
    "website": "https://futura.camp",
    "image": "/popups/zuberlin.webp",
    "sources": [
      "ns"
    ],
    "socials": {
      "x": "https://x.com/JoinFutura"
    },
    "summary": "Berlin coliving residency for researchers and founders, often hosted at Funkhaus.",
    "body": [
      "Futura Camp, also listed as ZuBerlin, runs immersive coliving residencies in Berlin.",
      "The format borrows Zu-style intensity while staying residency-shaped rather than full city-scale.",
      "Builders come for a focused stretch of living and shipping together.",
      "Futura Camp, formerly ZuBerlin, runs immersive coliving residencies in Berlin, often at Funkhaus.",
      "Programs blend technical depth with small-group discussion for researchers, founders, and protocol designers.",
      "Editions align with Berlin Blockchain Week and partner summits hosted at the same venue complex.",
      "June 2026 Futura Camp programming at Funkhaus includes partner tracks on neocypherpunk privacy, Ethereum infrastructure, and sovereign AI.",
      "ZuBerlin alumni describe the residency as a small-group alternative to conference halls during Berlin Blockchain Week.",
      "An immersion into the future blending cutting edge tech with deep human connection.",
      "Working, researching and personal time among the most impactful individuals of Futura Camp (ZuBerlin)'s current era.",
      "13.06 Opening 🌱 14.06 Neocypherpunk Summit web3privacy 15.06 Ethereum Day Beach BBQ 16.06 Sovereign AI Sanctuary Tech 17.06.",
      "June 2026 Futura Camp Rebrand Rebranded to Futura Camp for its third iteration, featuring partner summits at Funkhaus."
    ],
    "coverImages": [
      "/popups/zuberlin/zuberlingallery1.webp",
      "/popups/zuberlin/zuberlingallery2.webp",
      "/popups/zuberlin/zuberlingallery3.webp"
    ],
    "pricing": [],
    "amenities": [
      "Coliving rooms during Funkhaus residencies",
      "Partner summits such as Neocypherpunk and Ethereum Day on site",
      "Small-group sessions on cryptography, MEV, and sovereign AI",
      "Integration with Berlin Blockchain Week calendars"
    ],
    "history": [
      "June 2024 - Inaugural two-week ZuBerlin residency in Berlin",
      "November 2024 - ZuGarden popup combining Devcon 7 in Bangkok with an island retreat",
      "June 2025 - ZuBerlin 2.0 expands programming during Berlin Blockchain Week",
      "June 2026 - Futura Camp rebrand for the third Funkhaus edition",
      "2025 - Contact Us"
    ],
    "durationNotes": [
      "Typical Futura Camp / ZuBerlin residencies run about two weeks.",
      "June 2026 programming is scheduled for June 13–22 at Funkhaus Berlin.",
      "A highly curated residency offering a unique blend of cutting edge learning and deep immersive experience.",
      "Futura Camp (ZuBerlin) - Immersive tech coliving residency Futura Camp (ZuBerlin) An immersive coliving residency.",
      "They recently rebranded to Futura Camp and aim to create a highly curated residency that brings researchers, founders, and technologists together.",
      "Participants engage in principled discussions on topics like protocol architecture, cryptography, MEV, sovereign AI, future cities, and more while integrating with onsite partner events during Berlin Blockchain Week.",
      "November 2024 ZuGarden Thailand Ran a three week popup village combining Devcon 7 in Bangkok with an immersive island retreat.",
      "June 2025 ZuBerlin 2.0 Expanded coliving and programming for its second edition during Berlin Blockchain Week."
    ],
    "locationDetails": [
      "Primary venues are in Berlin, Germany, including Funkhaus.",
      "Some editions pair Berlin programming with international popup locations."
    ],
    "overview": [
      "Futura Camp evolved from ZuBerlin's Zuzalu-era Berlin popups.",
      "Programming pairs residency life with conference-week partner events.",
      "Futura Camp applications and Funkhaus schedules are listed on futura.camp and related ZuBerlin hubs."
    ],
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
    ],
    "pricingSummary": null
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
    "image": "/popups/gelephu.webp",
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
      "GMC’s charter ties mindfulness and governance to a long-horizon SEZ buildout in southern Bhutan.",
      "Gelephu Mindfulness City is a Special Administrative Region chartered in Bhutan in February 2024.",
      "The project spans about 4,046 km² in Bhutan's southern plains bordering Assam, India.",
      "Royal Charter grants GMC executive and legislative powers with an independent judiciary separate from the national government.",
      "GMC's public materials describe a “Mindful Prosperity” roadmap across multiple priority industries.",
      "GMC's public FAQ outlines investor incentives, sector priorities, and the separation between Bhutanese federal law and SAR governance.",
      "It seeks to offer the world a different path of development, one where traditional Bhutanese values of spirituality and harmony with nature, blends with innovation, technology and economic vibrancy.",
      "GMC also serves as His Majesty’s local vision to act as a catalyst of change for Bhutan’s administrative reform and economic advancement under the concept of “One Country, Two Systems”.",
      "Through this Royal mandate, GMC is accorded full executive and legislative powers, with an independent judiciary, to govern the SAR separate from the Royal Government of Bhutan.",
      "Under the direct guidance of His Majesty, GMC will be run by global and local talents to build an advanced economy by adopting and adapting the best governing policies and business practices from around the world.",
      "Core Industries and Sectors The idea of “Mindful Prosperity” is a recognition by His Majesty that the world cannot continue to develop at breakneck pace with little regard for humanity’s need to be in harmony with nature and the spiritual.",
      "Development should not come at all costs, but neither can it be denied.",
      "It should be carried out in balance where both Mindfulness and Prosperity blend modernity, development and economic prosperity with Bhutan’s traditional values.",
      "To help achieve this vision, GMC’s “Mindfulness Prosperity” road map focuses on eight core priority industries.",
      "Gelephu Mindfulness City - Bhutanese special economic zone Gelephu Mindfulness City Gelephu Mindfulness City is an emerging startup city and Special Economic Zone (SEZ) in Bhutan.",
      "Operating under a One Country, Two Systems model, it will feature independent and business-friendly laws.",
      "Backed by a 10,000 Bitcoin development pledge , GMC has already started to collaborate with startup societies and ecosystems like Edge City , Ethereum , and Solana ."
    ],
    "coverImages": [
      "/popups/gelephu/gelephugallery1.webp",
      "/popups/gelephu/gelephugallery2.webp",
      "/popups/gelephu/gelephugallery3.webp"
    ],
    "pricing": [],
    "amenities": [],
    "history": [
      "2026 - Golden Mandir for GMC GMC NEWS September 8,",
      "2026 - Bitget Signs Cooperation Agreement with GMCA GMC NEWS August 6,"
    ],
    "durationNotes": [],
    "locationDetails": [
      "Gelephu Mindfulness City is in southern Bhutan near the Indian border.",
      "The SAR covers roughly ten percent of Bhutan's land area.",
      "Located in Bhutan’s southern plains bordering the State of Assam in India and spanning over 4,046 km², or 10% of Bhutan, GMC was established by Royal Charter in February 2024 as a highly autonomous Special Administrative Region (SAR)."
    ],
    "overview": [
      "GMC combines Bhutanese values around mindfulness and nature with economic development goals.",
      "Official policy and investor information is published at gmc.bt.",
      "Investor FAQs and sector roadmaps for Gelephu Mindfulness City are maintained at gmc.bt."
    ],
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
    ],
    "pricingSummary": null
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
    "image": "/popups/hrg.webp",
    "sources": [
      "ns"
    ],
    "socials": {
      "x": "https://x.com/HackerResidency"
    },
    "summary": "A residency format for ambitious indie hackers who want locked-in build time together.",
    "body": [
      "Hacker Residency Group runs coliving residencies aimed at indie hackers who want fewer distractions and more peers.",
      "Da Nang, Vietnam hosts HRG’s monthlong villa residencies for indie hackers.",
      "The product is focused residency energy, not a permanent charter city.",
      "Hacker Residency Group runs a one-month experimental residency for indie hackers in Da Nang, Vietnam.",
      "Each cohort invites a small group of founders to live and build together in a villa with dedicated workspaces.",
      "The May 2026 batch advertises housing, food, laundry, and a private bedroom plus workstation for participants.",
      "The Da Nang villa cohort caps at about ten founders so everyone receives a private room and dedicated desk for the month.",
      "Led by world-class hackers Travis Fischer Founder of Agentic .",
      "USA Tony Dinh Making over $2M ARR solo while building typingmind.com and devutils.com .",
      "Vietnam Minh-Phuc Tran Built 8 startups in 12 months • Sold 3/8 startups • Building vibingbase.com .",
      "Vietnam David Park Built Raya & Kippo and then 120 other apps you've never heard of because they failed.",
      "USA The villa A stunning 14-bedroom villa with pool, workspace, and ocean views.",
      "HRG started as an experiment with a few goals in mind: 1.",
      "Shine an spotlight on the indie hacker lifestyle 🔥 2.",
      "Build a new type of international dev community focused on more ambitious digital nomads 3.",
      "Da Nang, Vietnam is legitimately one of the best digital nomad cities in the world.",
      "It's the perfect place to lock in and make 4 months of progress on your startup in 4 weeks!"
    ],
    "coverImages": [
      "/popups/hrg/hrggallery1.webp",
      "/popups/hrg/hrggallery2.webp",
      "/popups/hrg/hrggallery3.webp"
    ],
    "pricing": [],
    "amenities": [
      "Private bedroom and bathroom for each resident",
      "Dedicated workstation in the Da Nang villa",
      "Shared meals and laundry included for the cohort month",
      "Professional videography support during the residency"
    ],
    "history": [],
    "durationNotes": [
      "HRG residencies are structured as one-month live-in build sprints.",
      "The May 2026 program runs May 1 through May 31 in Da Nang.",
      "HRG Apply FAQ Batches An Experimental Hacker Residency in Da Nang, Vietnam May 1st – May 31st, 2026 Hacker Residency Group're inviting 10 ambitious founders to come live and build with us for 1 month at a dope villa in SE Asia.",
      "Hacker Residency Group cover the villa, food, laundry, your own private bedroom + bathroom + workstation, a professional videographer, and Hacker Residency Group even have some surprises in store as well...",
      "Apply to come live & build with us for the month!",
      "Hacker Residency Group - Coliving residency for indie hackers Hacker Residency Group HRG is a new residency for ambitious indie hackers to lock in."
    ],
    "locationDetails": [
      "Hacker Residency Group is anchored in Da Nang, Vietnam.",
      "Cohorts use a villa setting with ocean views and shared work areas."
    ],
    "overview": [
      "HRG selects a small cohort of indie hackers for each villa-based residency.",
      "The program advertises covered housing, food, and workspace for accepted founders.",
      "Founders apply to Hacker Residency Group through the official site for dated Da Nang cohorts."
    ],
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
    ],
    "pricingSummary": null
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
      "It is a nested society: legal wrapper from Próspera, thematic focus from Infinita.",
      "Prospera is the best place to do business on the planet.",
      "Gene therapies over breakfast, startups in swimsuits, billionaires dropping by.",
      "It is a network state on the marking, a model for the cities of tomorrow.",
      "You'll find yourself among a diverse set of builders, philosophers, BTC maxis and longevity enthusiasts.",
      "‍ 5:29 AM · Feb 10, 2025 · 401 Views Erick A.",
      "I'll review my experience & impressions and preview this article that will also compare \"startup societies\" to Infinita's legacy governments.",
      "This is my second time visiting to receive a safe therapy, in a clinical trial, on the frontiers of regenerative medicine.",
      "P r óspe r a, w h ere t h e f r o n tie r m eets r eality Próspera creates the conditions for experimentation, entrepreneurship, and ambitious collaboration to thrive."
    ],
    "coverImages": [
      "/popups/xyz/infinita/infinitagallery1.webp",
      "/popups/xyz/infinita/infinitagallery2.webp",
      "/popups/xyz/infinita/infinitagallery3.webp"
    ],
    "pricing": [
      "Infinita City offers multiple housing options",
      "Private rooms. 1-2 bedrooms",
      "Villas. 2-5 bedrooms",
      "Rooms or Villas. 1-3 bedrooms"
    ],
    "pricingSummary": "Infinita City offers multiple housing options Beta Hostel",
    "amenities": [
      "Shared or private bedrooms",
      "Co-working space",
      "Sauna and cold plunge",
      "Washing machine.*",
      "NODE Pass - $100/month or $3/day if purchased",
      "separately - is included in every housing option and gives access to every space and community",
      "*Beta Hostel does not include these",
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
      "In 2026, Infinita hosts BioHub Residency, Infinite Games, and a series of other events",
      "2026 - Infinita Roatán LLC Incorporated in Próspera 9G9H+45 Crawfish Rock, Honduras Design by Apofenia Studio Sunset Flag",
      "2025 - January - March Crypto Cities June Bio-Frontiers September In"
    ],
    "durationNotes": [
      "Infinita's hub, home to its community, is permanent and hosts people all year round",
      "Its pop-up villages last 1 to 2 months"
    ],
    "locationDetails": [
      "Infinita has a physical hub with multiple buildings in Próspera, the special economic zone on the island of Roatán, Honduras, where it hosts pop-up villages and other events",
      "‍ A place truly built for progress Located on Roatán Honduras and connected to the world, it's easy to get here and hard to leave Learn more Plan your stay  Have questions?"
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
      "Buenos Aires is a frequent anchor, with community channels spanning Discord and Telegram.",
      "Chiang Mai 2024 · Buenos Aires 2025 Past editions Get updates What next Invisible Garden Reunion, India 27 October to 7 November 2026 India Twelve days in India , with the community from previous editions.",
      "It overlaps Devcon 8 in Mumbai , 3 to 6 November 2026 .",
      "Vitalik Buterin Co-founder, Ethereum Skylar Devcon, Ethereum Foundation Tomasz K.",
      "X Telegram Discord YouTube Editions © 2026 Invisible Garden Operations LLC.",
      "Invisible Garden is a pop-up dev city and developer academy that cultivates Ethereum, zero-knowledge, AI, and cybersecurity talent through immersive environments.",
      "An edition in Costa Rica was planned for early 2025 but postponed to Buenos Aires to align better with event calendars.",
      "The scholarship includes accommodation, co-working spaces, and advanced courses on Ethereum, ZKP, AI, and cybersecurity.",
      "“ I’ve met amazing and inspiring people from all over.",
      "” Aaron Misash, Developer and Fellow at Invisible Garden These topics are truly my passion, they even shaped my university research phase, when I was exploring anonymous and scalable transactions on Ethereum Layer 2.",
      "Apply for upcoming fellowships and residencies, often announced on X .",
      "Join as a mentor or speaker in pop-up dev cities."
    ],
    "coverImages": [
      "/popups/xyz/invisible-garden/vitalik.webp",
      "/popups/ig/vitalik-buterin-400.webp",
      "/popups/ig/skylar-400.webp"
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
      "2025 - Past editions Get updates What next Invisible Garden Reunion, India 27 October to 7 November",
      "2024 - Read the recap Past edition Buenos Aires , Argentina Buenos Aires",
      "2024 - and Buenos Aires",
      "2026 - Invisible Garden Operations LLC"
    ],
    "durationNotes": [
      "Invisible Garden's pop-up villages typically last 3 to 6 weeks",
      "Since 2024 it has run as pop-up dev cities: a few weeks in one place, a cohort of builders, and mentors who teach in the room rather than over video.",
      "In 2025, it expanded to Latin America with Invisible Garden Buenos Aires , a three-week residency before Devcon, featuring mentors from Ethereum Foundation, OpenZeppelin, and the-mu."
    ],
    "locationDetails": [
      "Invisible Garden is traveling, hosting pop-up cities in various locations",
      "Invisible Garden Chiang Mai",
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
      "Expect monthlong co-living intensity with a strong South American base and global participation.",
      "Ipê City documents village governance and popup schedules for Brazil-focused editions on its public documentation site.",
      "What Is Ipê Village | Ipê City 🇺🇸 Ipê City ⌘ Ctrl k 🇺🇸 Ipê City IPÊ VILLAGE 2026 🏗️ What Is Ipê Village 👩‍🔬 Ipê City's Concrete Vision 🛠️ How To Collaborate?",
      "💲 Pricing - Ipê Passports 💲 How to pay any ticket in crypto IPÊ CITY 🌼 What is Ipê City ⛏️ Why Now?",
      "🎯 Ipê City's Goals 💙 Ipê City's Values ⭐ Becoming a Member COMMUNITY ✅ Community Guidelines PULSE 🫀 What is PULSE?"
    ],
    "coverImages": [
      "/popups/xyz/ipe-city/ipecitygallery1.webp",
      "/popups/xyz/ipe-city/ipecitygallery2.webp",
      "/popups/xyz/ipe-city/ipecitygallery4.webp"
    ],
    "pricing": [
      "$400 full month or $150/wk",
      "Access to coworking and events",
      "6-month access to Ipê community",
      "Everything in Explorer",
      "Access to $10k+ in grants",
      "1-year access to Ipê community",
      "Price info upon request",
      "Launch in real-world sandbox",
      "Iterate daily with early adopters",
      "Integrate product and collect data",
      "Architect passports are limited. Applicants must undergo a selection process and stay in the",
      "pop-up village for at least 3 weeks"
    ],
    "pricingSummary": null,
    "amenities": [
      "Fitness sessions",
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
      "Pro-Tech Innovation",
      "Pro-Human Progress",
      "Ipê City documents village formats and governance experiments on docs.ipe.city.",
      "Brazil-focused popup editions rotate while preserving the Ipê community brand.",
      "Ipê City publishes village documentation and cohort dates on docs.ipe.city.",
      "Ipê City maintains village governance notes, Brazil popup schedules, and builder docs on docs.ipe.city.",
      "Ipê popup editions document governance experiments alongside coliving logistics for Brazil-based builders."
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
      "Expect builder density first, jurisdiction theater second.",
      "IslandDAO | Solana's Global Builder Community Events Hackathon App FAQ Brazil — 19 Oct – 11 Nov Connect Next up: IslandDAO Brazil — 19 Oct – 11 Nov 2026 IslandDAO — Solana Build Together.",
      "Every IslandDAO retreat is island-based and chosen for inspiration and productivity — fast wifi, coworking spots, always with the right people in the room.",
      "A team with an idea coming to the island to connect with mentors, builders and founders, and win.",
      "Solana curious — the best place to enter the ecosystem.",
      "Find your first users and power users, to give you invaluable feedback for your startup.",
      "Get first access to event applications, ecosystem updates, and what's happening in the IslandDAO community.",
      "Community IslandDAO's Story Events Hackathon Governance FAQ Resources Brand Guidelines Terms of Service Privacy Policy © 2026 IslandDAO.",
      "IslandDAO, formerly known as Dean's List DAO, is a Web3-native network state on Solana.",
      "In 2023, it formed regional teams in Nigeria and Brazil, bringing education and opportunities to communities.",
      "For 2026, IslandDAO plans to organize two pop-up villages: IslandDAO Thailand and IslandDAO Brazil ."
    ],
    "coverImages": [
      "/popups/xyz/islanddao/boat.webp",
      "/popups/xyz/islanddao/restaurant.webp"
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
      "IslandDAO Koh Samui",
      "September - October 2024",
      "In 2025, it launched the Perks NFT collection and ran its third pop-up village, IslandDAO Mykonos",
      "For 2026, IslandDAO plans to organize two pop-up villages: IslandDAO Thailand and IslandDAO Brazil",
      "2025 - Thailand 2024 Mykonos",
      "2025 - Mykonos 2025 Thailand",
      "2024 - IslandDAO Koh Samui September - October"
    ],
    "durationNotes": [
      "IslandDAO's pop-up villages typically last 1 month",
      "Month-long coworking, hackathons, and demo days for the builders shaping the Solana ecosystem.",
      "IslandDAO has helped more than 14 Colosseum winners, incubator and accelerator cohort members across the Solana ecosystem.",
      "Running month-long retreats, hackathons and events that bring the ecosystem together and help founders win."
    ],
    "locationDetails": [
      "IslandDAO hosts events and pop-up villages worldwide. It isn't tied to a specific location, though events frequently occur in Greece, Thailand, and Brazil",
      "It isn't tied to a specific location, though events frequently occur in Greece , Thailand , and Brazil ."
    ],
    "overview": [
      "IslandDAO, formerly known as Dean's List DAO, is a Web3-native network state on Solana",
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
      "x": "https://x.com/itanaafrica",
      "instagram": "https://www.instagram.com/itanaafrica"
    },
    "summary": "Africa’s first digital economic zone oriented to technology and service businesses.",
    "body": [
      "Itana is building a digital economic zone in Lagos for technology and service-based companies.",
      "Companies incorporate through Itana’s digital zone rather than joining a temporary coliving cohort.",
      "Fast incorporation 3-day visa processing Data sovereignty assurance Ecosystem Access Connect to a curated ecosystem of talent, capital, strategic partners, and peer founders through the Itana Community.",
      "3,000+ community members Vetted service providers Exclusive networking events Growth-Ready Infrastructure Digital and physical infrastructure, including world-class workspaces in the Itana District within Alaro City, Nigeria.",
      "Elastic compute & AI capabilities Guaranteed internet uptime Premium physical facilities Trusted by Forward-Thinking Companies Join over 100 companies that chose Itana for their African market entry.",
      "Additionally, Itana have expatriates from different parts of the world; not only is there a limited expatriate quota, but the cost is quite high.",
      "I’m pumped that Itana is helping to solve all of these problems.",
      "Their team is always quick to respond, and their fast-tracked immigration services have made it significantly easier for Itana's expatriates to settle in and start work without delays.",
      "A great starting point to get support, privileged information, and a high-trust network of professionals with vast industry and ecosystem access.",
      "Business Company Formation + Streamlined application process and one-stop-shop platform to fast-track your time-to-operation in Nigeria and across Africa.",
      "Perfect for businesses looking to scale operations in Africa, leveraging tax, banking, infrastructure, trade, and immigration benefits.",
      "Great for short-term in-person team sprints, company retreats, or long-term co-working and living with a full-scale residential and commercial ecosystem with in-built ESG considerations."
    ],
    "coverImages": [
      "/popups/itana/community_video.b04eb3b8.webp",
      "/popups/itana/image1.7083bd39.webp",
      "/popups/itana/image2.37003061.webp"
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
      "Itana offers permanent digital residency and business operations with no fixed duration",
      "Community Itana Digital Residency A private, curated community for founders, business owners, and professionals who want to build, grow, and invest in Africa."
    ],
    "locationDetails": [
      "Itana functions as a digital jurisdiction, allowing remote operations without physical presence in Nigeria",
      "Its physical hub is planned for Alaro City, in Lagos, Nigeria",
      "District Live - Work - Build Eco-friendly environment that fosters creativity, collaboration, and community for the digital economy, located in the economic capital of Africa – Lagos, Nigeria."
    ],
    "overview": [
      "Itana, formerly Talent City, operates as the first Digital Free Zone in Africa, a licensed special economic zone that allows global businesses to incorporate and operate in Nigeria remotely",
      "companies incorporated",
      "business setup time",
      "community members"
    ],
    "xyzUrl": "https://xyz.city/network-states/itana",
    "posts": [],
    "socialEmbeds": [
      {
        "platform": "linkedin",
        "embedUrl": "https://www.linkedin.com/embed/feed/update/urn:li:activity:7420429768027836416",
        "label": "Digital Residents on the Itana Community",
        "viewUrl": "https://www.linkedin.com/feed/update/urn:li:activity:7420429768027836416"
      },
      {
        "platform": "linkedin",
        "embedUrl": "https://www.linkedin.com/embed/feed/update/urn:li:activity:7394050793152114688",
        "label": "Itana Residency Launchpad — Tope Emiola",
        "viewUrl": "https://www.linkedin.com/feed/update/urn:li:activity:7394050793152114688"
      },
      {
        "platform": "linkedin",
        "embedUrl": "https://www.linkedin.com/embed/feed/update/urn:li:activity:7389610617676009483",
        "label": "Chime Nnwoka on Itana and Alaro City",
        "viewUrl": "https://www.linkedin.com/feed/update/urn:li:activity:7389610617676009483"
      },
      {
        "platform": "linkedin",
        "embedUrl": "https://www.linkedin.com/embed/feed/update/urn:li:activity:7389993751433351168",
        "label": "Meet Oluwasogo O., Itana Digital Resident",
        "viewUrl": "https://www.linkedin.com/feed/update/urn:li:activity:7389993751433351168"
      }
    ]
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
      "The pitch is deep work in nature for nomads, artists, and operators, not a coastal hacker season.",
      "Jungli the Nomad organizes nomadic coliving and popup experiences for remote builders.",
      "Programming emphasizes travel-friendly formats that move between cities rather than one fixed campus.",
      "Community coordination runs through Jungli's public channels and event listings.",
      "Jungli the Nomad is an application-based learning residency on private rainforest land, not a public resort hotel.",
      "Residents get coliving, coworking, and hosted popup villages on roughly 150 acres in Dandeli.",
      "Programming emphasizes slow-paced creative work beside the Kali River in Karnataka.",
      "Apply to Stay This is not a public hotel or resort.",
      "What residents are saying real comments, view on Instagram ↗ ★★★★★ Home away from home.",
      "July - October 2026 Learn more What Jungli the Nomad're known for Colivings - with nomad needs sorted.",
      "Big, Soch, Serenne - each with its own character, all wired for deep work and easy belonging.",
      "Explore Jungli the Nomad's colivings For the long-haul Villas - private, furnished, pet-friendly homes.",
      "Explore the villas Three meals a day, together The community gathers three times a day for meals.",
      "Authentic, home-cooked, generational recipes - made with a lot of love.",
      "And a meal here isn't a meal; it's a gathering.",
      "About Jungli the Nomad's food 150 acres The whole village, on one map.",
      "Jungli the Nomad pick you up from the airport, train station or bus stop, and bring you home.",
      "Jungli the Nomad lovingly handle the food, transport & community events so you earn that time back, to make your masterpiece or simply to breathe.",
      "Life here can start from as little as $17 a day .",
      "‹ The Team Your hosts, the Schae Family › Since Jungli the Nomad opened in April 2024 650+ people have found their way home.",
      "Hear it from the Junglis Loading the wall of love… Built in consultation with hundreds of Junglis Be part of what's next .",
      "Join the conversation Help shape Jungli's evolution in Jungli the Nomad's WhatsApp community.",
      "Join the WhatsApp Community Stay in the loop Get Jungli the Nomad's newsletter on Jungli's evolution 🧬 Subscribe ✓ You're in!",
      "▶ Jungli the Nomad's story, in 90 seconds × ‹ › Rotate this phone to landscape so you can see it in full screen Est."
    ],
    "coverImages": [
      "/popups/jungli/cs-06-community-night.webp",
      "/popups/jungli/cs-03-pool-wide.webp",
      "/popups/jungli/cs-04-pool-residents.webp"
    ],
    "pricing": [],
    "pricingSummary": null,
    "amenities": [
      "Rainforest coliving and coworking on family-held land",
      "Hosted popup villages for visiting communities",
      "Application-based stays for nomads, artists, and operators",
      "Natural setting beside the Kali River in Dandeli"
    ],
    "history": [],
    "durationNotes": [
      "Stays are booked through Jungli's application process for multi-week residencies.",
      "Popup villages on site run on their own calendars in addition to ongoing coliving.",
      "It's an exclusive learning residency you apply to join ."
    ],
    "locationDetails": [
      "Colivings, villas, the river, the temple, the factory, the sports club - one humming campus.",
      "A secret location in the jungles of Karnataka, inland of Goa."
    ],
    "overview": [],
    "xyzUrl": "https://xyz.city/network-states/jungli",
    "posts": []
  },
  {
    "slug": "logos-society",
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
      "Governance and decentralization tooling are the through-line, not a single coliving campus.",
      "Expect software and organizing infrastructure more than a monthlong village calendar.",
      "Logos: Build the Parallel Testnet v0.2.1 is live for experimentation.",
      "Learn More LOGOS MENU Testnet v0.2.1 is live for experimentation.",
      "Learn More LOGOS Take Action Explore Technology Research Install Basecamp Build the Parallel Build the Parallel Basecamp is the tool for living outside existing systems.",
      "Install Basecamp Start Building Logos is the private-by-default technology stack for parallel societies.",
      "Built for a world where existing systems have stopped working.",
      "Logos is for people who are done waiting for permission.",
      "Read the manifesto 151 Contributors An open source community of builders, researchers, and technologists.",
      "226 Node Operators A decentralised network of independent Node operators ensuring Logos is secure.",
      "47 Circles Local chapters of activists and change seekers solving real world issues.",
      "19 Winnable Issues Local issues that Circles identify and solve – from privacy tech to community funding.",
      "Contributors 151 An open source community of builders, researchers, and technologists.",
      "Node Operators 226 A decentralised network of independent Node operators ensuring Logos is secure.",
      "Circles 47 Local chapters of activists and change seekers solving real world issues.",
      "Winnable Issues 19 Local issues that Circles identify and solve – from privacy tech to community funding."
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
      "discuss, ideate, and build solutions to solve local problems",
      "2022 - and publicly launched in"
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
      "Главное Montelibero project — это открытый социальный эксперимент по проверке гипотез о глобальных конкурентных преимуществах принципов свободы, ненападения, добровольных контрактов и самоорганизации.",
      "The Montelibero Project is a social experiment in Montenegro that aims to build a sustainable, successful society on a national scale by combining libertarian and panarchist ideas with local cultural characteristics."
    ],
    "coverImages": [
      "/popups/xyz/montelibero/camp.webp",
      "/popups/ml/photo_2022-03-26_10-43-40.webp",
      "/popups/ml/echo-3-partner-960x720.webp"
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
      "The EURMTL is a stablecoin pegged to the euro, backed with fiat and other liquid assets like"
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
    "slug": "mtndao",
    "name": "mtndao",
    "tagline": "Solana popup villages in Utah",
    "location": "Salt Lake City, Utah, USA",
    "type": "popup",
    "themes": [
      "Crypto"
    ],
    "website": "https://lnk.bio/mtndao",
    "image": "/popups/mountaindao.webp",
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
      "Salt Lake City editions pair dense coworking with summit programming and Demo Day.",
      "mtndao runs monthlong residencies in Salt Lake City for Solana founders and builders.",
      "The program emphasizes daily collaboration, sponsor workshops, and shipping pressure through bear and bull markets alike.",
      "Each residency culminates in Demo Day, where teams present live projects to the Solana community.",
      "Salt Lake City provides a consistent annual venue so Solana teams can return each year with sponsors and hiring partners in the same metro.",
      "Builders use the month to ship features, prepare launch demos, and meet investors who fly in for Demo Day.",
      "Sorry, you have been blocked You are unable to access lnk.bio Why have I been blocked?",
      "This website is using a security service to protect itself from online attacks.",
      "There are several actions that could trigger this block including submitting a certain word or phrase, a SQL command or malformed data.",
      "You can email the site owner to let them know you were blocked.",
      "Please include what you were doing when this page came up and the Cloudflare Ray ID found at the bottom of this page.",
      "Cloudflare Ray ID: a3b80cbeab8a5a14 • Your IP: Click to reveal 2401:4900:1f38:297d:b1d0:540d:5d9:d2c8 • Performance & security by Cloudflare.",
      "The program runs through bear markets and bull markets alike, with daily collaboration, sponsor workshops, and shipping pressure.",
      "2025 v7 Summit v7 summit runs in Salt Lake City; project directory launches.",
      "2026 v9 Summit v9 summit runs Feb 1–28 in Salt Lake City."
    ],
    "coverImages": [
      "/popups/mtndao/mountaindaogallery1.webp",
      "/popups/mtndao/mountaindaogallery2.webp",
      "/popups/mtndao/mountaindaogallery3.webp"
    ],
    "pricing": [],
    "amenities": [
      "Coworking space for Solana teams during the residency month",
      "Sponsor-led workshops with Solana ecosystem companies",
      "Demo Day stage for live project presentations",
      "Housing coordination for visiting founders"
    ],
    "history": [
      "2022 - Inaugural mtndao hackathon in Salt Lake City establishes the annual in-person builder format",
      "2023 - Residency format expands with longer coliving and sponsor programming",
      "2024 - Continued Salt Lake City cohorts for Solana founders and developers"
    ],
    "durationNotes": [
      "Core mtndao residencies run about one month in Salt Lake City.",
      "Programming mixes coworking, talks, and demo-day presentations.",
      "Mtndao - Solana popup villages in Utah mtndao Month long popup in Salt Lake City for Solana founders and builders.",
      "The residency ends with Demo Day, where dozens of teams present live projects to the Solana community."
    ],
    "locationDetails": [
      "mtndao is based in Salt Lake City, Utah.",
      "Events bring together Solana founders, developers, and investors in one venue."
    ],
    "overview": [
      "mtndao keeps a consistent Salt Lake City venue for annual Solana builder months.",
      "Sponsors fund programming that runs through both bear and bull market cycles.",
      "Cohort announcements and sponsor information for mtndao are published through the project's official link hub.",
      "mtndao posts Salt Lake City cohort dates through its official link hub."
    ],
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
    ],
    "pricingSummary": null
  },
  {
    "slug": "ns",
    "name": "Network School",
    "tagline": "Cloud communities made physical",
    "location": "Astana, Kazakhstan",
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
      "The campus is in Astana, Kazakhstan, in partnership with the Republic of Kazakhstan; ns.com lists the Astana Hub site and an all-in membership covering room, food, gym, and coworking.",
      "The first v1 cohort ran in Forest City, Malaysia before the program reopened in Kazakhstan. The campus hosts Layer-2 efforts such as Arc alongside other startup-society projects."
    ],
    "coverImages": [
      "/popups/xyz/network-school/networkschoolgallery1.webp",
      "/popups/xyz/network-school/networkschoolgallery2.webp",
      "/popups/xyz/network-school/crowd.webp"
    ],
    "pricing": [
      "Network School costs $3,000/mo for a private room, or $1,500/mo with a roommate",
      "The goal at the Network School is to provide an all-inclusive society-as-a-service model so that members only worry about learning, burning, earning and having fun"
    ],
    "pricingSummary": "Network School costs $3,000/mo for a private room, or $1,500/mo with a roommate The goal at the Network School is to provide an all-inclusive society-as-a-service model so that members only worry about learning, burning, earning and having fun",
    "amenities": [
      "Amenities in Network School include:",
      "3 nutritious meals (breakfast, lunch, dinner)",
      "24/7 co-working access",
      "High-speed Wi-Fi",
      "Workshops, lectures, and events",
      "The Network School Fellowship",
      "Founders and creators can apply for a fellowship of $100,000 in funding for a new or existing venture, with the core requirement being that they relocate to Network School campus for one year"
    ],
    "history": [
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
      "Throughout both iterations, members joined for a minimum of 1 month and extended their stay on"
    ],
    "locationDetails": [
      "Network School’s current campus is in Astana, Kazakhstan; ns.com lists Astana Hub (fifth floor) and partnership with the Republic of Kazakhstan.",
      "Former campus: Forest City, Malaysia (Singapore–Johor SEZ), from 2024 until the July 2026 closure.",
      "Kazakhstan reopening: September 2, 2026, with state support per public Network School materials.",
      "Future nodes are planned globally per Network School’s roadmap."
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
      "Governance and biotech themes sit alongside community and startup coordination.",
      "NetX Gen is a network of regenerative nodes connecting bioregions, communities, startups, and technologies to co-create a new model of civilization.",
      "It builds infrastructure across three layers - digital, legal, and physical - to prototype regenerative territories, decentralized governance, and cosmolocal solutions.",
      "Right after, it organized Regen Hub at Devconnect Buenos Aires , connecting over 300 participants in a strategic meeting point between ReFi, Web3, DeSci, decentralized governance, and local regenerative projects."
    ],
    "coverImages": [
      "/popups/xyz/netx-gen/community.webp",
      "/popups/xyz/netx-gen/people.webp",
      "/popups/xyz/netx-gen/founder.webp"
    ],
    "pricing": [
      "For reference, ReGen Haus was $1550 for the full month. Ticket included housing (shared rooms), breakfast, and full access to the program",
      "Payments were made via crypto, bank transfer (USD or ARS), ACH, or WIRE",
      "Fiber-optic Wi-Fi",
      "Kitchen and barbecue",
      "*From Regen Haus, at Edge Patagonia"
    ],
    "pricingSummary": null,
    "amenities": [],
    "history": [
      "Founded in 2024 as NetX State and rebranded to NetX Gen in 2026, the project centers its work on ecological regeneration and bioregional development",
      "In October to November 2025, NetX Gen hosted ReGen Haus, a layer two residency at Edge Patagonia ’s pop-up village",
      "Right after, it organized Regen Hub at Devconnect Buenos Aires, connecting over 300 participants in a strategic meeting point between ReFi, Web3, DeSci, decentralized governance, and local regenerative projects",
      "In 2026, NetX Gen Pop Up Island is happening at Próspera",
      "Territorial expansion and consolidation of the ecosystem are expected to develop from 2027 to 2030, and the building of regenerative cities until 2040",
      "2024 - as NetX State and rebranded to NetX Gen in",
      "2027 - to 2030 , and the building of regenerative cities until"
    ],
    "durationNotes": [
      "NetX Gen runs temporary pop-up villages and small events, typically lasting one to four weeks",
      "In October to November 2025, NetX Gen hosted ReGen Haus , a layer two residency at Edge Patagonia ’s pop-up village."
    ],
    "locationDetails": [
      "NetX Gen is anchored in Patagonia, Argentina, and operates in temporary settings across America",
      "San Martín de los Andes, Argentina",
      "Buenos Aires, Argentina",
      "NetX Gen Pop Up Island",
      "Roatán, Honduras",
      "NetX Gen has established partnerships across multiple bioregions (ReGen Nodes), mainly in Latin America"
    ],
    "overview": [
      "NetX Gen is a network of regenerative nodes connecting bioregions, communities, startups, and technologies to co-create a new model of civilization",
      "It builds infrastructure across three layers - digital, legal, and physical - to prototype regenerative territories, decentralized governance, and cosmolocal solutions",
      "Netxstate experiments with network-state governance tooling and popup coordination for digital communities.",
      "Netxstate shares governance experiments and community links on netxstate.com."
    ],
    "xyzUrl": "https://xyz.city/network-states/netx-gen",
    "posts": []
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
    "image": "/popups/nomacollective.webp",
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
      "It is popup-shaped, but the continuity lives in the collective more than the venue.",
      "Editions Ecosystem News Noma Collective's Story EN ES Book a Call EN ES EN ES Curated editions.",
      "Editions Curated remote work editions, 30+ destinations Ecosystem The vision: editions, hubs, and beyond News Guides, stories, and Noma Collective's newsletter Noma Collective's Story Who Noma Collective are and why Noma Collective built Noma Book a Call Got questions?",
      "Message us on WhatsApp Now Booking 2027 Editions Work from Anywhere.",
      "Explore Editions Speak to the Team 4,000+ Alumni 4.9 ★ Google Rating 30+ Locations 89 NPS Score Featured Where to next?",
      "Noma Collective handle the housing, programme and the community, so you can arrive with everything you need and people around you from day one.",
      "Noma Collective handle the accommodation, coworking, local setup, events, and on-the-ground support, so you can focus on your work and your life.",
      "03 Live like a local Go beyond being a tourist.",
      "Build routines, explore with people, join local experiences, and feel part of the destination while still keeping your normal work rhythm.",
      "04 Keep the community going The Edition ends, but the network does not.",
      "You leave with new friends, future travel plans, and access to Noma Collective's global Alumni community that keeps moving with you.",
      "“What Noma has cracked the code on is freeing you to do your work without interruption while also giving you a way to do the best things in town with awesome people.",
      "With Noma, you can be alone as much as you like but you have a built-in friend group to do fun stuff with.” Kevin K.",
      "The people I met will be life long friends and this is a city that has everything.",
      "I'm a solo traveler at heart but being with this group highlighted that I can enjoy community travel too.",
      "Cape Town · 5 months ago “ I went in with no expectations, and can confidently say it exceeded everything I could've imagined.",
      "I was nervous about traveling solo and meeting new people, but Leo's warmth and leadership made it one of the best experiences I could ask for.",
      "Barcelona was beautiful, but the community she created made it truly special.",
      "I'd 200% recommend taking this trip with Noma as I know I'll definitely be back for more.",
      "Japan · 6 months ago “ I didn't know two weeks with a bunch of strangers could be so profound.",
      "I didn't know as an adult you could play this much."
    ],
    "coverImages": [
      "/popups/noma/nomacollectivegallery1.webp",
      "/popups/noma/nomacollectivegallery2.webp",
      "/popups/noma/nomacollectivegallery3.webp"
    ],
    "pricing": [],
    "amenities": [],
    "history": [
      "2025 - Calendar Release Full",
      "2025 - schedule and initial"
    ],
    "durationNotes": [
      "Month-long remote work travel programs, called 'Editions', built around structure, connection, and destinations worth visiting.",
      "Barcelona · 7 months ago “ Little over a month ago I went on my first Noma trip to Japan, my first time in Asia."
    ],
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
    ],
    "pricingSummary": null
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
    "image": "/popups/nomad.webp",
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
      "Think infrastructure layer for nomads, not a one-off festival brand.",
      "NOMAD A B O U T N O D E S L O G I N A B O U T N O D E S L O G I N LIVE ANYWHERE.",
      "Decentralized Living A c c o m m o d a t i o n f o r t h e m o d e r n n o m a d .",
      "A p l a c e t o s t a y f o r t h o s e w h o l o v e t o m o v e .",
      "A g l o b a l c o l i v i n g e c o s y s t e m .",
      "A place to stay for those who love to move.",
      "A global co-living ecosystem of modern, high-quality housing 400+ Members Become part of the nomad nation 12 NODES Buy floor plans to build your own NODE, or find a NODE to rent or buy in Nomad's global network.",
      "Apply To Join Why Nomad Nation Why Nomad Nation More than just a place to stay–build community, memories, and legacy with an aligned group of movers and shakers.",
      "Apply To Join DOWNLOAD Nomad's DOWNLOAD Nomad's DOWNLOAD Nomad's MOBILE APP MOBILE APP MOBILE APP Want to get involved?",
      "Join for free by downloading Nomad's app or making an account on desktop today.",
      "Build or buy your own NODE and add it to the NOMAD network.",
      "Raleigh, USA 30 Rock Quarry Village Stage Renting Units Nomad are building a 30 unit community with a massive, black diamond shaped community building for co-living and co-working.",
      "Multiple units have already been completed and are currently renting to tenants.",
      "Raleigh, USA 30 Roatán Village Stage Under Construction Nestle upon a tropical peak overlooking the Caribbean’s vivid blue waters, Prospera is Nomad's sister village.",
      "With stunning sunset views, rainforest canopies, and refreshing breezes, this beautiful Roatán project is underway.",
      "Raleigh, USA 2 Echo Creek Village Stage Renting Units Nomad's very first NODE and prototype community site is now welcoming guests.",
      "Durham, USA 10 Durham Village Stage Under Contract Nomad's second US NODE community is coming soon to 5+ wooded acres."
    ],
    "coverImages": [
      "/popups/nomad/nomadgallery1.webp",
      "/popups/nomad/nomadgallery2.webp",
      "/popups/nomad/nomadgallery3.webp"
    ],
    "pricing": [],
    "amenities": [],
    "history": [
      "2025 - Quarter 2 Meetup led by Lauren W Register 10+ Attendees BUENOS AIRES, ARGENTINA",
      "2025 - Quarter 2 Meetup led by Lucia L Register 10+ Attendees PARK CITY, USA",
      "2025 - Quarter 2 Meetup led by NOMAD Register 10+ Attendees BARCELONA, SPAIN",
      "2025 - Quarter 2 Meetup led by NOMAD Register 10+ Attendees BUDAPEST, HUNGARY",
      "2025 - Quarter 2 Meetup led by NOMAD Register 10+ Attendees TULUM, MEXICO",
      "2025 - Quarter 2 Meetup led by NOMAD Register 10+ Attendees ERICEIRA, PORTUGAL"
    ],
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
    ],
    "pricingSummary": null
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
      "Join Praxis Join Praxis Membership Content Market Magazine Home Contact Privacy The world's first digital nation.",
      "Apply for membership Content Singularity Politics Life After Labor Sovereign Intelligence Declaration of Ascent | MMXXIV Praxis is an online community starting a new city.",
      "Praxis purpose is to revitalize Western Civilization by creating a new culture focused on the pursuit of heroism , truth, and beauty.",
      "Applications 0 Population 0 GNP (Est.) $ 0 Billion How to become a Praxian Praxis Visa Flip Reset Enlarge Apply for membership to meet Praxians online, attend events, and contribute to projects.",
      "Members may be considered for leadership on the basis of demonstrated alignment and commitment.",
      "Outstanding Members will be invited to move to the city .",
      "Praxis draw wisdom from the traditions of Praxis's ancestors and harness the power of technology to build the world to come.",
      "Praxis' purpose is to restore Western Civilization and pursue Praxis's ultimate destiny of life among the stars.",
      "Praxis is a digital nation crowdfunding a physical city to restore Western Civilization through crypto, AI, biotech, and energy innovation.",
      "Past residential experiments occurred in Austin , San Francisco , Los Angeles , and Miami .",
      "” Austin King, CEO at Nomina Some examples of the people I met: The founder of a multi-billion dollar venture fund; A person who consults nation states on their nuclear strategy as part a nuclear advisory group they are on at MIT.",
      "It gives access to Praxis Discord, where you can engage with other citizens, learn about upcoming events, and explore ways to contribute to the Nation.",
      "Praxis has proposed Atlas, in California, which is the concept for a defense and spaceport city on 3,850 acres at Vandenberg Space Force Base."
    ],
    "coverImages": [
      "/popups/xyz/praxis/flags.webp",
      "/popups/praxis/social-preview.webp"
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
      "CAMPUS, Praxis’s 4-day pop-up city, took place in Punta Cana, Dominican Republic",
      "CAMPUS , Praxis’s 4-day pop-up city, took place in Punta Cana, Dominican Republic ."
    ],
    "overview": [
      "Praxis is a digital nation crowdfunding a physical city to restore Western Civilization through crypto, AI, biotech, and energy innovation",
      "Praxis combines a long-horizon city vision with nomad community programming and events."
    ],
    "xyzUrl": "https://xyz.city/network-states/praxis",
    "posts": []
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
      "Builders use it as a base for company formation, residency experiments, and long-stay coliving around emerging tech.",
      "Próspera | A governance platform where entrepreneurs are Free to Build Visit Business Real Estate Solutions Mission More Sign In Free to Build B u s i n e s s Próspera creates startup zones with unique laws, regulations and taxes.",
      "Doing business Get in touch What are people saying about Próspera?",
      "Prospera is the best place to do business on the planet.",
      "Less than 1% of the Cost Save more with operating costs under 1% of other jurisdictions."
    ],
    "coverImages": [
      "/popups/xyz/prospera/building.webp",
      "/popups/xyz/prospera/city.webp",
      "/popups/xyz/prospera/houses.webp"
    ],
    "pricing": [
      "There are three main housing options for rent:",
      "Starts at $24/night",
      "Starts at $100/night",
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
      "active businesses",
      "(e)residents from 40+ countries",
      "of real estate across 1,000 acres",
      "visitors to Roatán per year",
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
    "slug": "proto",
    "name": "Proto-Town",
    "tagline": "Hardware build town in Texas",
    "location": "Lockhart, Texas, USA",
    "type": "sez",
    "themes": [
      "Tech"
    ],
    "website": "https://www.proto.town",
    "image": "/popups/prototown.webp",
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
      "It reads more like a specialized startup city than a temporary village.",
      "Proto-Town is a 1,200-acre ranch and hardware incubator in Lockhart, Texas.",
      "The site combines housing, machine shops, testing grounds, and manufacturing at one address.",
      "Founders live on-site to build and test physical technologies, including robotics, drones, and heavy equipment.",
      "Early startups pay room and board while established companies lease land for scaled testing.",
      "Machine shops, housing, and outdoor ranges stay on the same Texas ranch so teams can iterate hardware without shipping prototypes across town.",
      "Proto-Town describes itself as a dense manufacturing ecosystem rather than a single coworking house.",
      "Proto-Town PT-01 | PROTO-TOWN BROADCAST LIVE | Careers NOW LIVE FROM THE PROTO-TOWN RADIO BOOTH FEED — PROTO-TOWN, USA Stream is currently offline ● REC CAM-01 ▶ TUNE IN ♫ KLKT 107.9 FM STANDBY VOL proto.town | Careers 32.4°N 97.8°W.",
      "Proto-Town - A place to build hardware in Lockhart, Texas.",
      "Proto-Town combines housing, machine shops, testing grounds, and manufacturing facilities at a single address.",
      "Founders live on-site to build and test physical technologies, including autonomous bulldozers, drones, robotics, and nuclear research equipment.",
      "Early-stage startups pay for room and board, while established companies lease land for scaled testing.",
      "The project is designed to be a dense American manufacturing ecosystem operating as a frontier outpost for physical production.",
      "August 2025 County Development Agreement County unanimously approves the official development agreement for the 538 acre innovation hub.",
      "Late 2025 $20M Seed Round Closed $20M seed round backed by Bill Ackman and Coinbase cofounder Fred Ehrsam.",
      "March 2026 Nuclear Reactor Plans Filed Filed preliminary plans for a 7,600 sq ft nuclear research reactor in Lockhart with a $23M estimated cost.",
      "April 2026 Ashlee Vance profile Bloomberg journalist Ashlee Vance publishes an in-depth feature on Proto-Town and its model for hardware reindustrialization."
    ],
    "coverImages": [
      "/popups/proto/prototowngallery1.webp",
      "/popups/proto/prototowngallery2.webp",
      "/popups/proto/prototowngallery3.webp"
    ],
    "pricing": [],
    "amenities": [
      "On-site machine shops and fabrication equipment",
      "Housing for resident hardware founders",
      "Outdoor testing grounds for large equipment",
      "Manufacturing bays leasable by established companies"
    ],
    "history": [],
    "durationNotes": [
      "Residents typically stay for multi-week or multi-month build cycles.",
      "Leases are available for companies that need dedicated testing acreage."
    ],
    "locationDetails": [
      "Proto-Town is located in Lockhart, Texas.",
      "The ranch layout keeps fabrication, housing, and outdoor testing in one place.",
      "Late 2024 First Companies Move In Early hardware startups eg Pipedream Labs begin living and building on campus."
    ],
    "overview": [
      "Proto-Town targets physical-tech founders who need fabrication and testing at one ranch address.",
      "Room-and-board fees support early startups while larger tenants lease acreage.",
      "Leasing and residency inquiries for Proto-Town are routed through proto.town."
    ],
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
    ],
    "pricingSummary": null
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
    "image": "/popups/rnsid.webp",
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
      "Palau-backed digital residency is the product; rns.id covers enrollment and policy updates.",
      "RNS.ID issues blockchain-based digital identity credentials tied to real-world verification.",
      "The project targets sovereign digital identity for people who need portable, verifiable credentials.",
      "RNS.ID sits in the identity layer of the network-state tool stack rather than running a physical village.",
      "RNS.ID documents verification tiers and credential types on its homepage for travelers, founders, and remote workers who need portable proof of identity.",
      "The product direction emphasizes user-held credentials rather than centralized databases controlled by a single platform.",
      "Hosted an Inauguration Ceremony with Founding Digital Resident Tim Draper.",
      "See on Twitter Watch the video Vitalik Buterin Ethereum co-founder, minted Voyager Pass #1430 at vitalik.eth, granting official Palau Digital Resident status and supporting his belief in individual sovereignty.",
      "I got their ID and KYC’d on Kucoin with it.",
      "It’s a legit program to help people stay on board.",
      "Watch the video Voyager Pass Enhanced RNS Rewards Enjoy up to 40% discount on selected purchases.",
      "Priority Access & Features Benefit from expedited access to RNS services and upcoming features.",
      "Members receive a legally recognized government-issued identification card alongside a soulbound NFT on the blockchain.",
      "The Palau ID supports KYC and identity verification for crypto exchanges, banks, hotels, flights, rentals, and everyday services.",
      "Applicants who pass screening obtain both a digital onchain credential and a physical plastic card mailed globally.",
      "Hosts event naming Tim Draper as the founding digital resident.",
      "2023–2024 Blockchain Expansion Platform issues Legal Digital IDs on Ethereum and Solana with zkSync support for onchain KYC.",
      "2025+ Voyager Pass Rollout Enhanced benefits added including travel discounts and priority access for existing residents."
    ],
    "coverImages": [
      "/popups/rns/RNSgallery1.webp",
      "/popups/rns/RNSgallery2.webp",
      "/popups/rns/RNSgallery3.webp"
    ],
    "pricing": [
      "Credential pricing depends on verification tier and issuance type"
    ],
    "amenities": [
      "Digital identity credentials issued after verification",
      "On-chain credential records for portable identity",
      "Integration targets for wallets and governance apps"
    ],
    "history": [
      "RNS.ID launched as a sovereign digital identity project for borderless credentials",
      "The team publishes product updates and policy changes on rns.id",
      "2026 - All rights reserved"
    ],
    "durationNotes": [
      "RNS.ID - Government issued digital residency RNS.ID A digital residency program backed by the Republic of Palau.",
      "Jan 2022 Program Launch Republic of Palau announces the world's first sovereign-backed digital residency platform at rns.id."
    ],
    "locationDetails": [],
    "overview": [
      "RNS.ID focuses on verifiable digital identity rather than coliving or popup logistics.",
      "Product updates and credential policies are published through rns.id.",
      "Credential holders can present RNS.ID proofs in apps that support the project's published verification standards."
    ],
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
    ],
    "pricingSummary": null
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
      "If you want a Zu-like month with a distinct aesthetic, this is one of the main brands.",
      "Apply to Join as a Woo Resident Apply to Join as a Woo Resident Building Tomorrow’s Tech, Together Go from design to site with Framer, the web builder for creative pros.",
      "Apply to Join as a Woo Resident Apply to Join as a Woo Resident Apply to Join as a Woo Resident Apply to Join as a Woo Resident Building Tomorrow’s Tech, Together See What ShanHaiWoo Built in Singapore Missed it live?"
    ],
    "coverImages": [
      "/popups/xyz/shanhaiwoo/shanhaiwoogallery1.webp",
      "/popups/xyz/shanhaiwoo/shanhaiwoogallery2.webp",
      "/popups/xyz/shanhaiwoo/shanhaiwoogallery3.webp"
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
      "Workshops, lectures, and events",
      "Flights, accommodation, and meals are usually not included in the ticket price"
    ],
    "history": [
      "ShanHaiWoo was one of the earliest Zuzalu -inspired network state experiments. Since then, it has hosted several pop-up villages:",
      "2023 - The founding year. ShanHaiWoo Beidahu is hosted in a ski resort in Northeast China",
      "2024 - Moving south, ShanHaiWoo hosts its second physical meetup, a co-learning and co-creating 6-week pop-up village in Thailand - ShanHaiWoo Chiang Mai",
      "2025 - Further south, in Singapore, ShanHaiWoo organizes ShanHaiWoo Singapore, a one-month village that attracted over 200 builders",
      "In 2026, it plans to host a pop-up village before Devcon 2026",
      "2025 - Highlights & Projects Booklet View the",
      "2023 - Recap Woo",
      "2024 - Recap Woo"
    ],
    "durationNotes": [
      "ShanHaiWoo runs week-long and month-long temporary physical nodes",
      "It isn’t yet established in a permanent spot",
      "Apply to Join as a Woo Resident Apply to Join as a Woo Resident Building Tomorrow’s Tech, Together Building Tomorrow’s Tech, Together Beyond AI & Ethereum: Accelerating the Next-Gen Applications A one-month builder village in Singapore.",
      "Get Started Beyond AI & Ethereum: Accelerating the Next-Gen Applications A one-month builder village in Singapore."
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
    "image": "/popups/starbase.webp",
    "sources": [
      "ns"
    ],
    "socials": {
      "x": "https://x.com/StarbaseTX"
    },
    "summary": "The Texas aerospace city known as Starbase, shaping launch operations near Boca Chica.",
    "body": [
      "Starbase is the Texas aerospace city project frequently nicknamed the gateway to Mars.",
      "Starbase is the municipal name for SpaceX’s Boca Chica launch campus in Cameron County, Texas.",
      "Unlike crypto popups, the industrial and municipal stakes are the main story.",
      "Starbase is a city at the southern tip of Texas in the Rio Grande Valley.",
      "It is home to SpaceX Starship production, testing, and orbital launch facilities.",
      "Residents voted to incorporate in May 2025, establishing local governance around the launch site.",
      "The community functions as a company town with manufacturing and launch operations visible daily.",
      "Incorporation gives residents a formal municipal voice over local services while SpaceX continues Starship operations next door.",
      "Community projects documented in 2026 include coastal cleanups, conservation acreage, and a resident-led library effort.",
      "Starbase is a launch site unlike any place on Earth, with humanity’s future in space unfolding in plain view for the public.",
      "Explore View All Fun Stuff Beach Cleanup with Cameron County Boca Chica Beach Rockhands Mitigation Bank Quarterly Impact Report Updates from the Rio Grande Valley Sea Turtle Rescue SEA TURTLE INC.",
      "Just FOIA  Public Notices Community & Explore Open Records Request.",
      "Starbase - Aerospace startup city Starbase Starbase, Texas: Gateway to Mars.",
      "It is home to SpaceX's primary Starship production, testing, and orbital launch facilities where humanity's future in space unfolds in public view.",
      "The city officially incorporated in May 2025 after residents voted to establish local governance around the SpaceX site.",
      "It now operates as a tight-knit company town with world-class manufacturing and an orbital launch pad.",
      "2026 Community programs Residents organized large-scale beach cleanups along Boca Chica, conserved 1,000+ acres of land, and began building a community library together."
    ],
    "coverImages": [
      "/popups/starbase/starbasegallery1.webp",
      "/popups/starbase/starbasegallery2.webp",
      "/popups/starbase/starbasegallery3.webp"
    ],
    "pricing": [],
    "amenities": [
      "Proximity to SpaceX Starship production and launch facilities",
      "Local governance institutions created after incorporation",
      "Community volunteer programs such as beach cleanups",
      "Residential neighborhoods adjacent to the launch site"
    ],
    "history": [
      "2025 - Starbase incorporates after a resident vote in May",
      "2026 - Community programs include beach cleanups, land conservation, and a shared library effort",
      "2026 - Download Notice of Public Hearing on Tax Rate for FY2026-27 (Form 50-876) Download Form 50-212 |",
      "2026 - Download Proposed Budget FY",
      "2026 - Download Public Notice of Potential Quorum - 05/27/2026 Download Public Notice of Potential Quorum - 02/24/26 Download Fiscal Year"
    ],
    "durationNotes": [],
    "locationDetails": [
      "Starbase sits near Boca Chica, Texas, on the Gulf Coast.",
      "SpaceX operates the primary Starship campus within city limits."
    ],
    "overview": [
      "Starbase incorporates SpaceX's Boca Chica operations into a municipal government structure.",
      "Residents participate in city governance while living near orbital launch activity.",
      "Municipal updates and public meetings for Starbase, Texas are posted on starbase.texas.gov."
    ],
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
    ],
    "pricingSummary": null
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
      "Think producer/organizer layer for temporary builder cities.",
      "The Mu are a community where talents from diverse backgrounds gathered to freely exchange knowledge about technologies, ideas and build practical solutions for real-world problems.",
      "The Mu're all ears 😉 Let's spark a conversation that makes a difference.",
      "The Mu - Global popup village facilitator The Mu Facilitating popup villages in diverse locations worldwide.",
      "They originally ran popups in emerging economies with a focus on bringing blockchain opportunities to those locations.",
      "Their most recent iteration is focusing on robotics and AI and creating a bridge for people who want to experience China.",
      "The Mu community prioritizes open source development, a doer mentality, long-term thinking, and positive-sum outcomes.",
      "Events connect global participants with local tech ecosystems through unconference-style workshops, factory tours, hackathons, and cultural immersion.",
      "2025 Expo 2025 Curated a 7 day Ethereum showcase and popup event at the World Expo.",
      "2026 muShanghai Launched a 28 day popup at Alibaba HQ focused on AI, biotech, and robotics with factory access.",
      "How does The Mu popups differ from other Zuzalu popups?",
      "The-mu is a community of digital nomads organizing pop-up cities focused on blockchain, cryptography, and web3 technologies."
    ],
    "coverImages": [
      "/popups/xyz/the-mu/themugallery1.webp",
      "/popups/xyz/the-mu/themugallery2.webp",
      "/popups/xyz/the-mu/themugallery3.webp"
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
      "In 2025, the-mu was present at Expo 2025 in Japan, and, in 2026, it hosts a one-month pop-up city in Shanghai - muShanghai",
      "2025 - in Japan, and, in"
    ],
    "durationNotes": [
      "the-mu's pop-up villages typically last 2 to 6 weeks",
      "The year after, muBuenos ran for six weeks in Argentina and muAccra for two weeks in Ghana."
    ],
    "locationDetails": [
      "the-mu hosts pop-up villages across various continents, though its roots are in Asia",
      "2024 muBuenos Ran a 6 week grant supported and developer focused popup city in Buenos Aires.",
      "2024 muAccra Organized a 2 week popup city in Ghana to expand network reach into Africa.",
      "In 2023, it hosted muChiangMai , the first web3 pop-up city in Southeast Asia."
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
      "Oz City is a pop-up village organizer that focuses on creating the right environment for AI and Web3 builders to accelerate their progress.",
      "In June 2025, Oz City, supported by Epic Web3 , launched its first pop-up village, Oz City Cannes , bringing together over 50 builders from 20+ countries for an experiment in France.",
      "Pop-up locations included Valbonne, France and San Martín de los Andes, Argentina .",
      "Oz City Patagonia $945 - Full access to Edge City Patagonia.",
      "*$699 for shared room with 1 roommate or $499 with 5 roommates.",
      "” Ileana Perez, Full-Stack Dev Thank you The Oz City for believing in me.",
      "I learned, failed, regrouped, laughed, almost cried, but most of all, I grew.",
      "” Maurits Bos, Co-Founder at 42 Agents Oz City was a blast!",
      "Attend an upcoming pop-up village, usually announced on X and Substack .",
      "To create a hub for AI/Web3 builders to ship decentralized AI agents, protocols, and infrastructure through focused co-living sprints.",
      "AI engineers, crypto founders, hackers, and high-agency builders ready to prototype fast.",
      "How much does it cost to attend an Oz City pop-up village?",
      "Shared accommodation may be purchased, or participants can arrange their own privately."
    ],
    "coverImages": [
      "/popups/xyz/the-oz-city/fitness.webp",
      "/popups/xyz/the-oz-city/house.webp",
      "/popups/xyz/the-oz-city/views.webp"
    ],
    "pricing": [
      "Bootcamp program for startups and builders",
      "Travel scholarships based on merit and need",
      "Accommodation self-organized",
      "*Commitment fee fully returned as a food coupon",
      "Oz City Patagonia",
      "Full access to Edge City Patagonia",
      "Access to Oz City Residency’s amenities",
      "Accommodation organized but not included*",
      "*$699 for shared room with 1 roommate or $499 with 5 roommates",
      "Breakfast was included, and rooms were gender-separated"
    ],
    "pricingSummary": "Oz City Cannes $100 *",
    "amenities": [
      "Oz City’s pop-up villages usually incorporate:",
      "Workshops, lectures, and events"
    ],
    "history": [
      "Inspired by Zuzalu and the AI-blockchain synergy, Oz City has been creating pop-up environments focused on builders",
      "In June 2025, Oz City, supported by Epic Web3, launched its first pop-up village, Oz City Cannes, bringing together over 50 builders from 20+ countries for an experiment in France",
      "Later the same year, Oz City ran Oz City Patagonia, a two-week pop-up village with residency format on top of Edge City 's infrastructure in San Martín de los Andes"
    ],
    "durationNotes": [
      "Oz City operates as temporary pop-up villages, with duration depending on location and timing",
      "Oz City Cannes ran for one week. Oz City Patagonia lasted two weeks",
      "Later the same year, Oz City ran Oz City Patagonia , a two-week pop-up village with residency format on top of Edge City 's infrastructure in San Martín de los Andes.",
      "Usually around $100 to $500 per week, no accommodation included."
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
    "image": "/popups/traditionaldreamfactory.webp",
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
      "The village sits on a former poultry farm in Abela, Portugal, west of Lisbon.",
      "Traditional Dream Factory is a regenerative coliving village on a former poultry farm in Portugal.",
      "The project restores land while hosting creators, remote workers, and land stewards.",
      "Infrastructure includes glamping, solar power, Starlink connectivity, and on-site tokenized booking through $TDF.",
      "Residents join land-care rotations, glamping upgrades, and token-based bookings while the village funds water and pool infrastructure.",
      "TDF markets itself to remote workers who want regenerative community rather than a urban hacker hostel.",
      "Signup Log in TDF $TDF Buy $TDF Tokens 🐛 Report a bug A regenerative village in Portugal Traditional Dream Factory are building a place where land is held in common, community is intentional, and belonging is not left to chance.",
      "Join us Plan a visit What happens here Stay with us Book a room, a cabin or a camping spot and experience daily life on the land.",
      "See what's on Become part of it Members and citizens shape how this place is governed and cared for.",
      "Learn more Come and see for yourself Create an account to book a stay, join events and follow what Traditional Dream Factory are building.",
      "Traditional Dream Factory - Regenerative web3 village in Portugal Traditional Dream Factory A regenerative coliving village in Portugal.",
      "Web3 tools power governance through a DAO structure and $TDF tokens.",
      "2022 Operational coliving Built food forest, sauna, coworking barn, and DAO prototype.",
      "2023 Token launch Installed Starlink, expanded glamping and volunteer beds, and launched the booking platform and $TDF tokens.",
      "2024 Water infrastructure Raised €400K private debt and broke ground on a natural swimming pool and rainwater systems.",
      "2025 Build out phase Upgraded facilities, advanced mushroom farm, and completed the masterplan.",
      "2026 Hospitality completion Constructing en suite rooms, a restaurant, and studios while finalizing cohousing permits."
    ],
    "coverImages": [
      "/popups/tdf/tdfgallery1.webp",
      "/popups/tdf/tdfgallery2.webp",
      "/popups/tdf/tdfgallery3.webp"
    ],
    "pricing": [],
    "amenities": [
      "Glamping and coliving rooms on the Portuguese farm",
      "Solar power and Starlink connectivity",
      "On-site booking through the TDF platform and token",
      "Land-restoration projects residents can join",
      "Natural swimming pool and rainwater systems in progress"
    ],
    "history": [
      "2021 - TDF acquires the farm and launches basic glamping and volunteer infrastructure",
      "2023 - Starlink installed; booking platform and $TDF token launch",
      "2024 - Water infrastructure work including natural swimming pool and rainwater systems"
    ],
    "durationNotes": [
      "Book a stay Join an event Workshops, gatherings and residencies run throughout the year."
    ],
    "locationDetails": [
      "Traditional Dream Factory is in rural Portugal.",
      "The campus mixes restored farmland with coliving and event space."
    ],
    "overview": [
      "Traditional Dream Factory combines regenerative land work with Web3-native booking mechanics.",
      "The village hosts remote workers, creatives, and families for seasonal stays.",
      "Stays and tokenized bookings for Traditional Dream Factory are managed through the village's official booking site."
    ],
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
    ],
    "pricingSummary": null
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
    "image": "/popups/vibecamp.webp",
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
      "Include it when you are mapping popup-adjacent gatherings, not only SEZs.",
      "Vibecamp is a four-day gathering for curious, creative, openness-loving people — part festival, part unconference, part summer camp for nerdy adults (though some of them bring their children!).",
      "Founded in 2021, the 500-person event takes over a sprawling venue in Maryland every June.",
      "Wanna see what people did (and didn't) like about Vibecamp's events?",
      "675 survey responses — publicly browsable by gender, age, sexuality, and whether they'd attended before.",
      "(Yes, Vibecamp know the gender ratio could use some work, but hey, for an event attended by so many people in tech, it could be worse.) See the full data Who comes to Vibecamp?",
      "The common thread among Vibecampers is being high in openness-to-experience and kind to strangers .",
      "Attendees primarily come from a loose network of internet-adjacent communities: rationalists and post-rationalists, EAs, burners, tech folks of various stripes, along with writers, artists, therapists, lurkers, and various offline friends.",
      "You’ll be competing with the guy who comes dressed as a penguin handing out cans of sardines, and no fewer than four people who play theremins.",
      "The Discord is the easiest way in — lurk, ask questions, or just show up ready to make friends.",
      "Host something yourself, or come just to wander and see what unfolds.",
      "\" at vibecamp, you might encounter someone explaining the fourier transform on a flip chart, consensual waterboarding, a pool party and see a guy interviewing people with his portable podcast setup — all in the span of like 60 seconds.",
      "Attendee-decorated cabin When was the last time you touched grass, anon?",
      "› Nights at Ramblewood — fairy lights AND fireflies Still have questions?",
      "A few of the most common ones from first-timers: Will I fit in?",
      "Vibecamp know most of you won't look at these, but for the minority of people who love to read everything, Vibecamp're working on having materials available.",
      "Vibecamp'll continue adding to these over time, and have a few more posts Vibecamp're working on that should be live soon.",
      "Would you like to write your own explainer post, or write a better version of one of these?",
      "Drop your email and Vibecamp'll keep you posted on Vibecamp news, ticket updates, and related community projects.",
      "Vibecamp - Festival for internet communities Vibecamp A recurring IRL festival for the TPOT (This Part Of Twitter) cloud community.",
      "Combating modern isolation, it gathers adults to play, build, and connect through high-agency, decentralized activities.",
      "Emphasizing \"fierce friendliness\" and deep conversation, Vibecamp inspires attendees to seed playful local communities back home.",
      "2022 Vibecamp 1 Inaugural in-person gathering at Camp Champions in Austin, TX (~400 attendees).",
      "2024 Vibecamp 3 & Vibeclipse Hosted the third main camp, plus a special \"Vibeclipse\" event in Texas for the solar eclipse."
    ],
    "coverImages": [
      "/popups/vibe/vibecampgallery1.webp",
      "/popups/vibe/vibecampgallery2.webp",
      "/popups/vibe/vibecampgallery3.webp"
    ],
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
    ],
    "pricingSummary": null
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
      "Themes span biotech, AI, crypto, and governance because the bet is institutional, not just social.",
      "Hear it from Laurence Ion Hear it from Laurence Ion Hear it from Laurence Ion Play vid Play vid Join us Viva need an \"Apollo Project\" for longevity Why join Viva City?",
      "Learn how you can have an impact Anyone can do *something* to increase the community's effectiveness.",
      "Join us Upcoming gatherings When a lot of us live together, Viva can self-govern & accelerate innovation.",
      "Pieces to the puzzle Themes Longevity Biotech Tackle the root cause of diseases like Alzheimer's, Cancer & Heart Disease.",
      "AI AI is one of the most important tools to help advance Viva's capabilities in science to solve the problem of aging, and much more.",
      "Crypto Viva are building a new model for a self-governing IRL community.",
      "Special jurisdictions Viva are creating new laws & regulations, to remove bottlenecks that stifle innovation.",
      "A better framework to ensure no harm is done, with warp-speed innovation.",
      "Pieces to the puzzle Themes Longevity Biotech Viva's main focus - advanced medicine that can bring aging under medical control.",
      "Special jurisdictions Viva are creating Viva's own laws & regulations, to remove bottlenecks that stifle innovation."
    ],
    "coverImages": [
      "/popups/xyz/viva-city/community.webp",
      "/popups/xyz/viva-city/city.webp",
      "/popups/xyz/viva-city/talk.webp"
    ],
    "pricing": [
      "Apart from specific events, Viva City uses a tiered pricing structure:",
      "Online Membership",
      "Free or heavily discounted access to diverse events",
      "Founding Online Membership",
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
      "There are ongoing talks with governments for Viva City to establish a medical innovation zone",
      "2040 - Join pioneers in Longevity, AI, Crypto & more Join us VIVA CITY Building a new city to make death optional by",
      "2040 - Building a new city to make death optional by"
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
      "Bangkok editions anchor much of the programming, with Discord and Telegram coordinating between villages.",
      "The offer is practical: housing plus program density for people trying to launch.",
      "Web3 Villages rotates incubator popups through partner cities while keeping Discord and Telegram as coordination layers between cohorts.",
      "Web3Village is not just a hackathon slapped onto a beach.",
      "It's an ecosystem incubator — a full-stack engine for Web3 innovation, community, and lasting impact .",
      "Since 2022, Web3 Villages’ve hosted immersive Web3Villages in Hội An , Chiang Mai , and Bangkok .",
      "Scaling from popups to permanent infrastructure is Web3 Villages's next big move, and Đà Nẵng is ground zero.",
      "Web3 Villages Proven Model Popup Permanent Web3 Villages start with pop-up villages 1–2 months of immersive, semi-permanent co-living and building.",
      "The Format Shared dinners, daily rituals, flexible build hours Rapid iteration, social experimentation, deep collaboration A blend of “semester + startup sprint” that accelerates real outcomes Da Nang ?",
      "Is becoming Web3 Villages's first permanent Web3Village HQ — an always-on engine for local and global Web3 innovation.",
      "This is the hub where Web3 Villages will connect with global hubs all over the world.",
      "Interdisciplinary collision Web3 meets AI, robotics, civic tech — sparks unpredictable breakthroughs."
    ],
    "coverImages": [
      "/popups/xyz/web3-villages/people.webp",
      "/popups/xyz/web3-villages/coworking.webp",
      "/popups/xyz/web3-villages/japan.webp"
    ],
    "pricing": [],
    "pricingSummary": null,
    "amenities": [
      "Shared and private rooms",
      "Co-living and co-working areas",
      "Workshops, lectures, and events"
    ],
    "history": [
      "Web3 Villages, founded in 2022, was one of the early hosts of pop-up villages",
      "In 2023, it organized Web3 Village Hoi An, a one-week experience for Web3 builders, hackers, and creators",
      "In 2024, it hosted Web3 Village Chiang Mai and Web3 Village Bangkok",
      "It has supported 35+ startup ideas in areas like DeFi, identity, civic tech, and AI integration",
      "There is no evidence that the announced Web3 Village Mui Ne (2024) and Web3 Village Osaka (2025) events took place",
      "2023 - Chiang Mai",
      "2024 - Bangkok 2024 Showcase Contact TICKETS Open Menu Close Menu Attend Topics Past Event Hoi An",
      "2024 - Bangkok 2024 Showcase Contact TICKETS Open Menu Close Menu Attend Topics Folder: Past Event Back Hoi An"
    ],
    "durationNotes": [
      "Web3 Villages pop-up villages typically last 1 week, offering semi-permanent co-living and building experiences",
      "Every year, hundreds of builders live, learn, and launch real products — not just demos."
    ],
    "locationDetails": [
      "Web3 Villages has hosted pop-up villages across Asia, including Thailand and Vietnam"
    ],
    "overview": [
      "Web3 Villages is an ecosystem incubator for Web3 innovation, community, and lasting impact",
      "As of February 2026, Web3 Villages appears inactive on social media",
      "Web3 Villages hosts incubator-style popup villages where founders live, learn, and ship together.",
      "Bangkok and other hubs rotate based on cohort theme and partner venues.",
      "Web3 Villages lists upcoming incubator popups and partner cities on web3villages.com.",
      "Cohorts combine Bangkok and other hubs with Telegram and Discord channels for accepted builders."
    ],
    "xyzUrl": "https://xyz.city/network-states/web3-villages",
    "posts": []
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
      "Fumba Town editions put East African and international builders in the same coliving cohort.",
      "Join us in Zanzibar from July 25 to August 14, 2026.",
      "Zanzalu is an annual pop-up city and living laboratory in Fumba Town, Zanzibar.",
      "Blending the energy of a festival and a builder hub, Zanzalu becomes a temporary city designed for collaboration, focus, and curiosity.",
      "Through residencies, forums, workshops, and launches, participants explore the continent’s most consequential challenges in technology, urbanization, and industrialization.",
      "Zanzalu’s purpose is to cultivate a generative forum where people leave with new ideas, higher ambitions, and a lasting network of peers committed to building what comes next.",
      "It is both a gathering and a long-term project that aims to catalyze high-leverage experimentation and a culture of agency among rising talent.",
      "Find your people Meet friends and collaborators you’ll still be talking to in years.",
      "Upgrade your thinking Talks, workshops, and conversations on the most important trends shaping the globe.",
      "Live in paradise Warm waves and coworking amenities in East Africa’s top destination.",
      "Zanzalu Home Fumba Town, Zanzibar Zanzalu takes place in Fumba Town, a waterfront neighborhood 20 minutes outside Zanzibar City.",
      "The town has apartments, cafés, a gym, a supermarket, and a coworking space all within a short distance.",
      "The airport is about 20 minutes away, and Stone Town is an easy drive for nights out, history, and food."
    ],
    "coverImages": [
      "/popups/xyz/zanzalu/zanzalugallery1.webp",
      "/popups/xyz/zanzalu/zanzalugallery2.webp",
      "/popups/xyz/zanzalu/zanzalugallery3.webp"
    ],
    "pricing": [
      "Tickets for pop-up villages depend on the edition and often have 10-20% early bird discounts",
      "Base prices for Zanzalu 2026:",
      "3-Week Pass - African Nationals",
      "Week Pass - African Nationals"
    ],
    "pricingSummary": "Tickets for pop-up villages depend on the edition and often have 10-20% early bird discounts Base prices for Zanzalu 2026:",
    "amenities": [
      "Co-working spaces",
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
      "experimentation, and events",
      "For several weeks each year, it brings together founders, technologists, academics, artists, investors, policymakers, and creators to test ideas in the real world and to build toward an abundant future in Africa and beyond."
    ],
    "locationDetails": [
      "Zanzalu pop-up villages take place in Fumba Town, Zanzibar, Tanzania, an urbanization initiative within the area of the Fumba Special Economic Zone"
    ],
    "overview": [
      "Zanzalu is a pop-up city and living laboratory where innovators from Africa and beyond collaborate toward an abundant future",
      "full-time residents"
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
      "It is part of the wider Zu- family while keeping an India-first builder mandate.",
      "Apply Residents Residents Residents Catapulting India's innovation ecosystem by: Connecting local talent with international experts and Investors.",
      "Building ties with USA, Europe and other Global tech hubs .",
      "Participants will design, test, and take part in governance experiments that allow communities to self-organize in a transparent, scalable way.",
      "The track will also organize dialogue with key policy makers and decision makers to understand the future of innovation in India.",
      "Learn More Impact & Public goods 02 This track focuses on creating systems and solutions that have a positive societal impact.",
      "It emphasizes the development of public goods—resources that benefit everyone but are often underfunded in traditional markets.",
      "Participants will explore innovative funding models and decentralized grant systems that support public goods, ranging from infrastructure projects to open-source technologies.",
      "Learn More Longevity (Biotech, DeSci) 03 The longevity track will explore advancements in genetic research, bioengineering, and health tech.",
      "Zu-Grama will also explore the intersection of translational research in the longevity space and decentralized science (DeSci).",
      "The track aims to explore how AI can be used to solve global challenges, improve decentralized infrastructures and build systems that won't put humanity in a locked in state.",
      "Cryptography 06 The cryptography track will explore layer 1 chains such as Ethereum and applications such as DeFi, Consumer crypto etc.",
      "The track will also explore advanced cryptographic technologies, particularly zero-knowledge proofs (zk) and Fully Homomorphic Encryption (FHE).",
      "These tools are essential for creating privacy-preserving and secure systems which are key to decentralized innovation."
    ],
    "coverImages": [
      "/popups/xyz/zu-grama/zugramagallery1.webp",
      "/popups/xyz/zu-grama/zugramagallery2.webp",
      "/popups/xyz/zu-grama/zugramagallery3.webp"
    ],
    "pricing": [
      "For the Zu-Grama pop-up in 2025:",
      "$1,600 - 6 weeks",
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
      "For 2026, Zu-Grama plans to evolve from a one-off residency into an ongoing ecosystem with alumni support and new collaboration formats",
      "2024 - ZU-GRAMA ©",
      "2025 - Grama Archipelago Announcement Plans revealed for the largest popup village yet in Goa"
    ],
    "durationNotes": [
      "Zu-Grama's first residency ran for six weeks, from January 5th to February 16th, 2025",
      "A 6-week residency experiment in co-living with founders, builders, seekers, doers and experts."
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
      "Coliving spaces and onchain community tooling are both part of the offer.",
      "Builders & Innovators Developers, designers, and entrepreneurs shaping the future.",
      "Doers and Thinkers Visionaries who take action, push boundaries, & challenge old systems to create new possibilities.",
      "Investors and Ecosystem Leaders Looking to support Africa's onchain growth.",
      "“ZuAfrique can no longer afford to be spectators in conversations that define ZuAfrique's future.",
      "ZuAfrique exists to place African builders, thinkers, and creators at the centre of the table where ideas are shaped, decisions are made, and innovation reflects ZuAfrique's lived realities”.",
      "Eric Annan Co-Lead, ZuAfrique | Founder/CEO, AyaHQ The ZuAfrique Experience ZuAfrique is more than a popcity event—it’s a movement.",
      "Live & Build Together Immersive co-living spaces designed for innovation.",
      "Cultural & Tech Fusion A space where tradition meets the future, & ideas become reality.",
      "ZuAfrique - Popup villages in Africa ZuAfrique Popup villages in Africa.",
      "It operates as a movement and runs popup villages where participants colive, cocreate, and experiment with decentralized technologies that address African problems.",
      "Organized by AyaHQ, the initiative accelerates onchain ecosystems by centering African voices in global conversations about technology and innovation.",
      "2025 ZuAfrique 1.0 Launched the inaugural popup village in Kilifi, Kenya.",
      "2026 ZuAfrique 2.0 Returned to Kilifi for another popup village.",
      "ZuAfrique is an on-chain movement in Africa that connects local innovation with global builders.",
      "ZuAfrique 1.0 April 15 - May 6, 2025 ZuAfrique 2.0 April 12 - May 3, 2026 Pricing ZuAfrique 1.0 was funded through a combination of sponsor support and direct organizational investment.",
      "Lisk donated $25,000, AyaHQ donated $50,000, and Zuzalu Quadratic Funding contributed 3.65 ETH.",
      "The 3.65 ETH was untouched due to the price dip."
    ],
    "coverImages": [
      "/popups/xyz/zuafrique/zuafriquegallery1.webp",
      "/popups/xyz/zuafrique/zuafriquegallery2.webp",
      "/popups/xyz/zuafrique/zuafriquegallery3.webp"
    ],
    "pricing": [
      "ZuAfrique 1.0 was funded through a combination of sponsor support and direct organizational investment",
      "Lisk donated $25,000, AyaHQ donated $50,000, and Zuzalu Quadratic Funding contributed 3.65 ETH",
      "The 3.65 ETH was untouched due to the price dip"
    ],
    "pricingSummary": "ZuAfrique 1.0 was funded through a combination of sponsor support and direct organizational investment Lisk donated $25,000, AyaHQ donated $50,000, and Zuzalu Quadratic Funding contributed 3.65 ETH",
    "amenities": [
      "Buffet meals (breakfast and dinner)",
      "Co-working space",
      "Workshops, lectures, and events"
    ],
    "history": [
      "ZuAfrique emerged in 2024 from the Zuzalu movement and launched its first pop-up city — ZuAfrique 1.0 — in April 2025",
      "In 2026, ZuAfrique hosts ZuAfrique 2.0, a three-week pop-up village in Kenya"
    ],
    "durationNotes": [
      "ZuAfrique hosts temporary pop-up villages that typically last 3 weeks",
      "April 15 - May 6, 2025",
      "April 12 - May 3, 2026",
      "Eric and The Mu organized muAccra, a 2-week popup village in Ghana to connect the local Web3 ecosystem.",
      "In 2026, ZuAfrique hosts ZuAfrique 2.0 , a three-week pop-up village in Kenya."
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
      "It partners closely with Akiya Collective while keeping its own Zuzalu-lineage brand and channels.",
      "Build, farm, code, soak in the onsen, and meet the people who live here.",
      "20% off with crypto Get a Day Pass Join the group chat Instagram · X · Substack How much does it cost to visit?",
      "A day pass starts at $21 and covers the desks, the venue, breakfast, and the people for a full day.",
      "Length-of-stay, group, and community discounts stack on top, and the checkout quotes the real price for your dates.",
      "Pay by card (default) or save 20% with USDC on Ethereum.",
      "Yes, and local neighbors are the heart of ZuCity — not an audience for it.",
      "Come by for a day of coworking, a shared dinner, or an event on a $21 day pass, and belong here without leaving home.",
      "ZuCity / ZuJapan are next to central Komoro along the historic Hokkoku Kaido street.",
      "Each ZuCity space has its own personality: the music lounge, the kitchen with homemade miso, the always expanding library, the rooms ZuCity / ZuJapan rebuilt ourselves.",
      "ZuCity / ZuJapan write the calendar, so the rhythm fits the people in it.",
      "Coliving is slow, deep, reality-bending progress on yourself, your life, and your projects."
    ],
    "coverImages": [
      "/popups/xyz/zucity-japan/zujapangallery1.webp",
      "/popups/xyz/zucity-japan/zujapangallery2.webp",
      "/popups/xyz/zucity-japan/zujapangallery3.webp"
    ],
    "pricing": [
      "Co-living options for flexible stays include:",
      "$1,500/person/month",
      "Access to community spaces",
      "Access to events and socials",
      "$2,500/person/month",
      "All basics included",
      "24/7 free car access"
    ],
    "pricingSummary": "Co-living options for flexible stays include: Nomad",
    "amenities": [],
    "history": [
      "Inspired by Zuzalu 's pop-up village movement, ZuCity created its own community in Japan",
      "The first pop-up village took place in September 2025, and the 2026 edition is ZuCity Japan 2026",
      "It also hosts ZuCity Cherry Blossom Season in April 2026",
      "Although based near two existing SEZs, ZuCity Japan is neither an SEZ nor intends to become",
      "2026 - poster — four-track timeline SEP 04 — OCT 05 KOMORO · NAGANO Buy Track Passes More Details July 15 — August 15,",
      "2026 - Builder Residency",
      "2026 - edition is ZuCity Japan"
    ],
    "durationNotes": [
      "ZuCity Japan offers both short-term co-living and permanent accommodation",
      "It hosts week-long and month-long pop-up villages and offers a 'try before you buy' path to home ownership through rent-to-own houses",
      "Rent-to-own : ZuCity Japan lets you rent short-term in",
      "coliving-style community homes, while crediting 50% of your rent toward buying a home in their",
      "Nagano-area community later",
      "Come for a day pass, a weekend, or a month.",
      "Everything ZuCity / ZuJapan make together stays, and compounds year over year."
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
      "It functions today as an experimental sandbox with a clear European mountain brand.",
      "Zuitzerland residencies culminate in summit weekends with separate ticketed programming.",
      "Swiss editions connect to the broader Zuzalu lineage of monthlong builder villages.",
      "Zuitzerland summit weekends bill separately from longer residency weeks, with CHF pricing listed per event on the official site.",
      "Zuitzerland - Swiss open-source popup village Zuitzerland A popup village organizer.",
      "Ambitions to be a Swiss village for d/acc and open source acceleration in the Alps.",
      "It organizes popup villages with a focus on defensive accelerationism (d/acc) principles.",
      "Their mission is to create a permanent d/acc and open-source village in the Swiss Alps.",
      "April 2025 Vitalik Donation Ethereum founder donates 274 ETH to support development as a long-term Zuzalu hub."
    ],
    "coverImages": [
      "/popups/xyz/zuitzerland/zuitzerlandgallery1.webp",
      "/popups/xyz/zuitzerland/zuitzerlandgallery2.webp",
      "/popups/xyz/zuitzerland/zuitzerlandgallery3.webp"
    ],
    "pricing": [
      "Zuitzerland 2025 Summit, the culmination event of the Zuitzerland Residency, cost CHF 359 ($450) for the weekend. No accommodation included.*",
      "*Zuitzerland provided a discount code for attendees"
    ],
    "pricingSummary": null,
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
      "May 2025 First Residency Hosted a 3.5 week popup village in the Swiss Alps with participants from 42 countries.",
      "May 2025 Build Week 35 projects submitted across governance, tooling, and resilience themes.",
      "2025 Zuitzerland Summit Culmination event integrates residency learnings into long-term frameworks and tools."
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
      "safety are widely shared instead of centralized",
      "Zuitzerland runs Swiss-themed popup residencies and summit weekends for the Zuzalu extended ecosystem.",
      "Zuitzerland residency and summit tickets are sold through zuitzerland.ch when editions are open.",
      "Zuitzerland sells residency weeks and CHF-priced summit weekends on zuitzerland.ch when editions are open.",
      "Summit weekends and longer residency weeks are billed separately on the official Zuitzerland site."
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
      "Longevity and crypto themes still appear, but participatory governance is the differentiator.",
      "View in Telegram Preview channel If you have Telegram , you can view and join ZuzaluKaş right away.",
      "ZuKaş - Governance focused popup village ZuKaş A Zu-village in Kaş, Turkey focused on Lycian democracy and participatory governance.",
      "It draws on the ancient Lycian principles of democracy and commons to run residencies where builders, researchers, and creators colive and stress-test decentralized coordination and participatory governance.",
      "The project blends Web3 tools with plurality and regenerative practices.",
      "Mar 2026 AI for Locals Held a free public AI workshop at the Kaş Municipality Hall featuring live idea-to-prototype building.",
      "ZuKas is a living hub uniting Lycian roots with longevity and civic innovation.",
      "In 2025, it hosted its first pop-up village - ZuKas I .",
      "The second edition, ZuKas II , in April 2026, explores open governance, identity, and phygital communities.",
      "Full event access for people buying before the programming is revealed.",
      "\" Lalena, Creative Designer at node101 How can you get involved?",
      "Join an upcoming pop-up village, usually announced on X .",
      "To experiment with plurality governance in a Web3 context, creating prototypes for decentralized decision-making and phygital commons."
    ],
    "coverImages": [
      "/popups/xyz/zukas/zukasgallery1.webp",
      "/popups/xyz/zukas/zukasgallery2.webp",
      "/popups/xyz/zukas/zukasgallery3.webp"
    ],
    "pricing": [
      "ZuKas tickets are often tiered and include scholarship options",
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
      "Workshops, lectures and events",
      "ZuKas arranges group-rate guesthouses for non-resident tickets"
    ],
    "history": [
      "Emerged from the Zuzalu movement, ZuKas merges Web3 with principles from the Lycian Isonomia, the Ahi Commons, and plurality",
      "In 2025, it hosted its first pop-up village - ZuKas I. The cohort focused on the roots of ancient democracy",
      "The second edition, ZuKas II, in April 2026, explores open governance, identity, and phygital communities",
      "2026 - ZuKaş II (Season 02) 16-day residency September 4–19,"
    ],
    "durationNotes": [
      "ZuKas operates pop-up villages with varying durations",
      "ZuKas I lasted 10 days. ZuKas II runs for 30 days",
      "Sep 2026 ZuKaş II (Season 02) 16-day residency September 4–19, 2026 in Kaş (Season 02: “The Crucible”).",
      "\" Michel Bauwens, Founder at P2P Foundation I strongly suggest you go to ZuKas next year...",
      "\" Not enough Kaş in a year… need 2–3 events."
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
      "Later Zu-branded villages and fellowships trace much of their culture back to Zuzalu’s Montenegro cohort.",
      "Zuzalu - Ethereum popup village network Zuzalu An umbrella community of popup villages anchored to the Ethereum community.",
      "It brought together ~200 builders, thinkers, and researchers in longevity, crypto, AI, and network states for coliving and collaboration.",
      "After the original event, Zuzalu decentralized into independently-run Zu-villages, supported by two Gitcoin funding rounds for both events and core infrastructure like Zupass.",
      "Zuzalu is especially important because it minted the popup village model that provided a concrete organizational form to the network state movement.",
      "Dec 2023 Decentralization Moment Vitalik proposed a shift from centralized events to independent, global popup villages."
    ],
    "coverImages": [
      "/popups/xyz/zuzalu/zuzalugallery3.webp",
      "/popups/xyz/zuzalu/zuzalugallery8.webp",
      "/popups/xyz/zuzalu/zuzalugallery9.webp"
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
      "Co-working spaces",
      "Conference and workshop venues",
      "Community events and social programming",
      "Accommodation was not included",
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
      "15/4/2025 - 5/5/2025",
      "Zuzalu Montenegro",
      "25/3/2023 - 25/5/2023",
      "Oct–Nov 2023 ZuConnect Istanbul A 2-week gathering (~300 attendees) featuring the community's first funding round."
    ],
    "locationDetails": [
      "Zuzalu Pop-up, the first pop-up village ever, was hosted in Luštica Bay, Montenegro",
      "Currently, Zuzalu doesn’t own a physical hub, but its branch nodes host pop-up villages worldwide:",
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
