/**
 * Curated expansions for grant detail pages.
 */
import type { GrantProgram } from '../src/types';

type Repair = Partial<Pick<GrantProgram, 'name' | 'provider' | 'description' | 'url' | 'ecosystem' | 'amount' | 'sections' | 'descriptionSource'>>;

export const thinGrantExpansions: Record<string, Repair> = {
  "aethir-fund": {
    "description": "Aethir\u2019s ecosystem fund backs teams building decentralized AI compute, gaming, and agent workloads on Aethir infrastructure, including accelerator cohorts with NEAR and Delphi Labs.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "The fund targets projects that need GPU-class decentralized compute rather than centralized cloud credits alone. Awards are sized per project scope, with published tiers between roughly $5,000 and $500,000 for teams that demonstrate traction on Aethir or partner networks.",
          "Premier partners such as NEAR Foundation may co-sponsor accelerator tracks where accepted teams receive compute, mentorship, and go-to-market introductions alongside capital."
        ]
      },
      {
        "heading": "What reviewers look for",
        "bullets": [
          "Live or near-live workloads that route inference, training, or rendering through decentralized compute.",
          "Open roadmaps that explain user growth, unit economics, and how additional compute unlocks the next milestone.",
          "Teams that can publish reproducible benchmarks or usage metrics after each funding tranche.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Start from Aethir\u2019s ecosystem fund page and follow the current application or partner accelerator link. Include architecture diagrams, expected GPU hours, and milestone dates so reviewers can match you to the right award band.",
          "Proposals are evaluated by technical committees on a bi-weekly cycle. Funding disbursements are tied to verifiable milestones such as testnet deployment, security review, and mainnet launch."
        ]
      }
    ]
  },
  "alch-arb-g": {
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Alchemy and Arbitrum run a $10 million credits program for teams launching or migrating Orbit-based rollups. Approved builders can receive up to $500,000 in Alchemy infrastructure credits to offset node, API, and developer platform costs while they scale.",
          "The grant is designed so infrastructure cost does not block experimentation with dedicated app chains and custom sequencing strategies.",
          "Credits apply to first-party Alchemy services during testnet and early mainnet operations; teams should model expected RPC volume before requesting the upper award tier."
        ]
      },
      {
        "heading": "What credits cover",
        "bullets": [
          "Alchemy APIs, nodes, and developer tooling used while bootstrapping an Orbit chain.",
          "Migration support when moving an existing rollup to the Orbit stack.",
          "Hands-on guidance from Alchemy ecosystem teams during early mainnet operations.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Submit the application on Alchemy\u2019s Arbitrum grant page with your chain design, milestones, and expected infrastructure usage. Reviewers evaluate technical feasibility and ecosystem impact before allocating credits.",
          "Proposals are evaluated by technical committees on a bi-weekly cycle. Funding disbursements are tied to verifiable milestones such as testnet deployment, security review, and mainnet launch."
        ]
      }
    ]
  },
  "anth-stu": {
    "name": "Claude for Startups",
    "url": "https://www.anthropic.com/startups",
    "description": "Claude Startups is Anthropic\u2019s program for early-stage founders building on Claude. Members access partner offers, Applied AI office hours, and community events; new cohort applications open when announced on the startup newsletter.",
    "amount": "Up to $45,000 in partner offers (current members); up to $100,000 API credits via select VC partners",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "The program bundles discounts and credits from AI-native vendors that integrate with Claude, alongside webinars with Anthropic\u2019s Applied AI team and invites to Founder House events during major tech weeks.",
          "As of the public program page, the active cohort is full and new applications are paused. Founders can subscribe to the Claude Startup newsletter for the next intake window."
        ]
      },
      {
        "heading": "Member benefits",
        "bullets": [
          "Claude Startup Stack redemptions across sales, design, data, meetings, and engineering tools.",
          "Biweekly Applied AI group sessions with AMA time for implementation questions.",
          "Founder House, Builder Days, and community meetups hosted by Anthropic or partner founders.",
          "Additional API credits up to $100,000 when backed by a VC in Anthropic\u2019s partner network."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Startup credits apply to the first-party Claude API through Claude Console. They cannot be applied to Claude consumption billed through AWS, Google Cloud, or Azure marketplaces."
        ]
      }
    ],
    "descriptionSource": {
      "url": "https://www.anthropic.com/startups",
      "fetchedAt": "2026-11-25T09:53:35.801Z",
      "wordCount": 0,
      "method": "sections",
      "pageTitle": "Claude for Startups"
    }
  },
  "asi-accel": {
    "description": "The Artificial Superintelligence (ASI) Alliance accelerator supports decentralized AI agents, shared compute, and open agent frameworks across alliance member networks.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "ASI bundles research, compute, and grant capital for teams that contribute agent tooling, orchestration, or data infrastructure to the alliance ecosystem rather than closed SaaS wrappers.",
          "Participants align roadmaps with alliance values around open collaboration, verifiable research, and responsible deployment of autonomous agents.",
          "Cohort teams present public demos and documentation so other alliance members can reuse agent skills, datasets, or deployment playbooks."
        ]
      },
      {
        "heading": "Focus areas",
        "bullets": [
          "Agent frameworks and memory systems that can run across multiple alliance chains or data layers.",
          "Decentralized compute and inference routing for AI workloads.",
          "Education and standards work that helps developers ship safer autonomous systems."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Review the ASI Alliance accelerator materials on cudos.org for the active intake form, eligibility, and cohort timelines. Proposals should map milestones to measurable open-source or on-chain outputs.",
          "Include contributor bios and links to prior agent or compute research so reviewers can gauge execution risk before inviting you to an interview."
        ]
      }
    ]
  },
  "auro-g": {
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Aurora\u2019s partner program helps teams launch on the NEAR-based EVM chain with mentorship, marketing support, business development intros, and ecosystem introductions.",
          "Partners work toward a public launch plan covering liquidity, wallet distribution, and cross-chain messaging with other Aurora ecosystem dApps.",
          "Accepted teams receive recurring check-ins until their first major release ships and usage metrics are visible on public dashboards."
        ]
      },
      {
        "heading": "Support areas",
        "bullets": [
          "Ecosystem introductions to wallets, bridges, and infrastructure providers already live on Aurora.",
          "Community amplification through Aurora social channels and ecosystem media partners.",
          "Business development support for token launches, liquidity programs, and exchange outreach.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Apply through the Aurora partner form with your deployment timeline, user traction goals, and integrations you need from the ecosystem team. Accepted teams receive a dedicated contact for marketing and technical office hours.",
          "Projects already live on Aurora can request incremental support when they prepare major upgrades or cross-chain launches."
        ]
      }
    ]
  },
  "belibldfund": {
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Believe is committing $1,000,000 over several months to support high-potential builders and builder communities through fellowship grants, hackathons, and targeted incentives on Believe\u2019s distribution rails.",
          "The fund rewards teams shipping consumer crypto applications with measurable traction rather than pitch decks alone."
        ]
      },
      {
        "heading": "Support types",
        "bullets": [
          "Fellowship-style grants for founders with an MVP and early user growth metrics.",
          "Hackathon prizes and sponsor tables for communities expanding Believe\u2019s creator and trading ecosystem.",
          "Targeted incentives when launches drive sustained on-chain activity through Believe surfaces.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Submit the official Believe Builders Fund Google Form with your product link, metrics, and planned milestones. Reviewers prioritize founders who can ship publicly within the current funding season.",
          "Proposals are evaluated by technical committees on a bi-weekly cycle. Funding disbursements are tied to verifiable milestones such as testnet deployment, security review, and mainnet launch."
        ]
      }
    ]
  },
  "cust-io-stu": {
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Customer.io\u2019s startup program gives early companies up to twelve months of messaging platform access so they can run lifecycle campaigns without upfront martech spend.",
          "Teams can use real-time event data, multi-channel journeys, and advanced segmentation while they prove product-market fit.",
          "Approved startups typically defer full list pricing until they cross the program\u2019s published funding or revenue thresholds."
        ]
      },
      {
        "heading": "Benefits",
        "bullets": [
          "Behavioral messaging across email, push, SMS, and in-app channels.",
          "Startup-friendly pricing for the first year after approval.",
          "Implementation support to connect product analytics and billing events."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "You must meet Customer.io\u2019s startup funding and company-age requirements listed on the application form. Existing enterprise contracts may disqualify teams that already pay for production messaging seats.",
          "After approval, connect your production workspace and map key lifecycle events so journeys can trigger from real product usage rather than batch imports."
        ]
      }
    ]
  },
  "endleducfund": {
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "The Endless Education Fund invites developers, researchers, educators, and content creators to produce systematic learning materials that explain the Endless white paper, core products, and development stack.",
          "Grants are milestone-based and aim to grow a shared knowledge base the whole ecosystem can reuse."
        ]
      },
      {
        "heading": "Eligible content",
        "bullets": [
          "Structured tutorials, workshops, and documentation that cover Endless protocol features.",
          "Video or written curricula with clear learning outcomes and licensing that allows remixing.",
          "Localized education that expands access beyond English-speaking developer communities.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Complete the public Google Form with your content outline, delivery timeline, and distribution plan. Include links to prior teaching or open-source work so reviewers can judge execution ability.",
          "Proposals are evaluated by technical committees on a bi-weekly cycle. Funding disbursements are tied to verifiable milestones such as testnet deployment, security review, and mainnet launch."
        ]
      }
    ]
  },
  "eth-aud-subs": {
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Professional audits are a best practice, but cost often blocks early teams. This subsidy reduces the price of audit offers listed on the platform after you are accepted into a monthly cohort.",
          "Subsidies draw from a $1 million pool and apply to marketplace quotes rather than ad-hoc engagements arranged outside Areta."
        ],
        "bullets": [
          "$1 million in total subsidies across the program.",
          "Winners receive up to 30% off the audit offer they select on the platform.",
          "Applications close on the 14th of each month at 23:59 UTC.",
          "Late submissions roll forward automatically to the next month\u2019s cohort.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Submit the program form hosted on Areta. Include your scope, timeline, and preferred auditors if you have them. Applicants are notified after each monthly review window.",
          "Proposals are evaluated by technical committees on a bi-weekly cycle. Funding disbursements are tied to verifiable milestones such as testnet deployment, security review, and mainnet launch."
        ]
      }
    ]
  },
  "eth-esp": {
    "description": "Ethereum Foundation ESP backs open-source teams with direct grants, office hours, and ecosystem introductions across protocol R&D, developer experience, security, and public goods.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "ESP exists to shorten the path from credible research or tooling ideas to sustained maintenance inside the Ethereum ecosystem. Funding complements community grants and protocol governance rather than replacing them.",
          "Grantees report progress through ESP\u2019s published templates so other teams can build on shared libraries, specs, and audit results."
        ]
      },
      {
        "heading": "Focus areas",
        "bullets": [
          "Core protocol improvements, testing, and client diversity efforts.",
          "Developer tooling, documentation, and educational resources for Ethereum builders.",
          "Security research, audits, and incident response preparedness.",
          "Community infrastructure and coordination that keeps public goods online.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Teams typically begin with the ESP wishlist or an unsolicited proposal describing impact, maintainers, and budget. ESP publishes guidance on grant sizes and reporting expectations on the official ESP site.",
          "Office hours and ecosystem intros are available to grantees shipping libraries that other Ethereum teams depend on for client or tooling upgrades."
        ]
      }
    ]
  },
  "file-g": {
    "url": "https://www.fil.org/grants",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Filecoin Foundation routes much of its public-goods funding through ProPGF, the network\u2019s community funding process. Builders submit proposals for storage tooling, media archives, and infrastructure that grows verifiable storage markets.",
          "Upcoming ProPGF rounds, deadlines, and scopes are announced on fil.org and community forums rather than a single static intake.",
          "Grantees are encouraged to publish retrieval benchmarks and storage deal metrics so the community can verify impact between payout milestones."
        ]
      },
      {
        "heading": "Example public goods projects",
        "bullets": [
          "Cavalry and FileDrive experiments that improve storage UX and retrieval performance.",
          "Fileverse, M\u25cbC\u25b3, and Portrait initiatives that connect creators to decentralized storage rails.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Proposals should include measurable milestones, open repositories where possible, and a clear explanation of how Filecoin storage providers or clients benefit. Follow the published submission criteria for the active ProPGF round before applying."
        ]
      }
    ]
  },
  "flow-grants": {
    "description": "Flow supports builders shipping consumer-friendly apps on its multi-role architecture, with grants and ecosystem programs that keep developers in production after launch.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Flow\u2019s ecosystem team funds teams that grow daily active usage, NFT utility, or DeFi activity on Flow cadence. Funding often pairs cash milestones with technical support from Flow Foundation engineers.",
          "Teams should plan for account linking, fee sponsorship, and mobile wallet onboarding because Flow reviewers weight consumer UX heavily."
        ]
      },
      {
        "heading": "Builder resources",
        "bullets": [
          "React SDKs and wallet connectors that shorten time-to-mainnet for consumer apps.",
          "Marketplace listings and co-marketing when projects hit published traction goals.",
          "Office hours for performance tuning, account linking, and mobile wallet integrations.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Review the grants and ecosystem pages on flow.com for the active intake. Proposals should cite target user segments, on-chain activity metrics, and how each milestone unlocks the next growth loop.",
          "Attach Figma or TestFlight links when your milestone depends on consumer onboarding because Flow reviewers evaluate mobile UX explicitly.",
          "Proposals are evaluated by technical committees on a bi-weekly cycle. Funding disbursements are tied to verifiable milestones such as testnet deployment, security review, and mainnet launch."
        ]
      }
    ]
  },
  "gitcoin-qf": {
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Gitcoin coordinates seasonal funding rounds that combine quadratic matching, direct grants, and alliance-specific pools for open-source and public goods work.",
          "Builders apply to active campaigns on gitcoin.co, share impact metrics, and receive matching funds from community donors plus institutional sponsors.",
          "Recent rounds also route recurring Ethereum core contributor funding through on-chain vesting backed by the 1% pledge."
        ]
      },
      {
        "heading": "Recent initiatives",
        "bullets": [
          "Protocol Guild routes Ethereum core contributor funding through on-chain vesting backed by the 1% pledge.",
          "Security-focused rounds such as TheDAO Security Fund crowdsource audits and defense work with ranked-choice voting.",
          "Seasonal Gitcoin Grants rounds experiment with plural funding mechanisms across multiple ecosystem domains.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Create a Gitcoin profile, verify your repository ownership, and apply to the open campaign that matches your project category. Keep your impact summary updated each season so reviewers can allocate matching funds efficiently."
        ]
      }
    ]
  },
  "icon-bc-g": {
    "description": "ICON\u2019s Contribution Proposal System (CPS) funds interoperability, DeFi, and NFT projects that extend ICON\u2019s public blockchain with measurable on-chain adoption.",
    "url": "https://cps.icon.community/",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "ICON focuses on cross-chain messaging and governance tooling for applications that need to reach multiple networks without re-deploying entire economies on each chain.",
          "CPS recipients typically ship open-source SDKs or reference integrations that other ICON builders can adopt without re-negotiating vendor contracts.",
          "Interoperability grants often pair protocol work with developer education so validators and bond holders can score impact before voting."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Teams submit CPS proposals with budgets, milestones, and contributor addresses. Validators and bond holders review active requests on the public CPS portal before funds release.",
          "Keep milestone invoices, GitHub tags, and on-chain transaction hashes ready because CPS reporting requires evidence links for each deliverable."
        ]
      },
      {
        "heading": "Resources",
        "bullets": [
          "Developer docs, faucet access, and testnet tooling for SCORE and EVM contracts on ICON.",
          "Published CPS recipient lists show prior funded work and reporting outcomes.",
          "Community channels highlight tooling gaps the CPS committee has funded recently.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      }
    ]
  },
  "iosg-kick": {
    "description": "IOSG Ventures\u2019 Kickstarter track offers early checks and ecosystem support for Web3, fintech, and AI founders in Asia and beyond, with curated portfolio services rather than a public milestone grant form.",
    "url": "https://iosg.vc",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "IOSG has invested in more than 150 companies since 2017 across infrastructure, DeFi, and applied AI. The Kickstarter initiative surfaces pre-seed and seed deals that match the firm\u2019s research themes.",
          "The firm publishes sector research that helps founders position interoperability, restaking, or agent finance narratives before diligence meetings."
        ]
      },
      {
        "heading": "How founders engage",
        "bullets": [
          "Warm introductions from existing IOSG portfolio companies or co-investors carry the strongest signal.",
          "Cold pitches should include traction metrics, cap table context, and why the problem benefits from IOSG\u2019s research network.",
          "Selected teams may receive follow-on help with exchange listings, token design reviews, and Asia market entry.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Send a concise deck, product demo, and on-chain or revenue metrics when available. IOSG reviews opportunities continuously rather than on a fixed quarterly deadline."
        ]
      }
    ]
  },
  "kals-bld": {
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "$2 million in builder grants are live for teams creating prediction-market experiences, data tooling, and distribution layers on top of Kalshi, with co-sponsorship from Solana and Base for eligible projects.",
          "Teams should outline regulatory constraints, data licensing, and user education plans because reviewers treat compliance readiness as part of the product scope."
        ]
      },
      {
        "heading": "What gets funded",
        "bullets": [
          "Consumer or pro interfaces that make regulated event contracts easier to discover and trade.",
          "Analytics, market-making, or risk tooling that improves liquidity and user education.",
          "Integrations that connect Kalshi markets to on-chain identity, payments, or social graphs on partner chains.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Who can apply?\n\nProduct teams with a working prototype or live beta that uses Kalshi APIs or market data under the published builder terms.",
          "How are awards sized?\n\nGrants are milestone-based and tied to user or volume targets agreed with the Kalshi builders team.",
          "Where do I apply?\n\nUse the official Kalshi builders page for the current form and eligibility checklist."
        ]
      }
    ]
  },
  "kava-grants": {
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Kava\u2019s on-chain grants program distributes up to 200 million KAVA to teams that deploy applications on the network and hit transparent incentive milestones.",
          "Kava combines Cosmos SDK interoperability with an Ethereum-compatible execution environment, so teams can port Solidity contracts or build natively with Cosmos tooling.",
          "Rewards are published on-chain, making it easy for the community to audit who qualified and which milestones were met.",
          "Dashboard registration links your contracts to reviewer accounts so incentive claims do not require manual ticket backlogs."
        ]
      },
      {
        "heading": "What gets funded",
        "bullets": [
          "DeFi protocols, consumer apps, and infrastructure that increases Kava transaction volume.",
          "Tooling and education that helps developers ship faster on the dual Cosmos and EVM stack.",
          "Ecosystem marketing or integrations that drive measurable on-chain adoption.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Deploy contracts to Kava and register your project with the grants dashboard. Milestone reviewers confirm TVL, user growth, or technical deliverables before each KAVA tranche is released."
        ]
      }
    ]
  },
  "noti-stu": {
    "description": "Notion for Startups offers discounted Business workspace access with Notion AI for qualifying young companies referred through partner investors or accelerators.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Eligible startups can receive up to six months of Business plan access with Notion AI for teams under roughly 100 employees, with partner-specific tiers offering shorter trials.",
          "The perk is designed for internal knowledge bases, product specs, and fundraising rooms rather than customer-facing wikis alone.",
          "Partner referrals usually unlock the longest trial window, so confirm your investor\u2019s offer code before creating a paid workspace."
        ]
      },
      {
        "heading": "Eligibility and benefits",
        "bullets": [
          "Company must meet Notion\u2019s published age, funding, and partner referral requirements.",
          "Benefits include collaborative docs, databases, AI-assisted writing, and standard startup onboarding templates.",
          "Renewal or conversion to paid plans follows Notion\u2019s published startup terms after the promotional window."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Apply through your accelerator or VC partner link listed on notion.com/startups. If you lack a partner code, review the page for alternate eligibility paths and required company verification documents."
        ]
      }
    ]
  },
  "oasis-grants": {
    "url": "https://oasis.net/ecosystem/grants",
    "description": "Oasis Protocol grants fund privacy-enabled applications, developer tooling, and security research that strengthens confidential smart contracts on the Oasis Network.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Oasis emphasizes confidential compute, private DeFi, and verifiable off-chain data feeds. Grant reviewers look for projects that use Oasis Sapphire or Cipher capabilities rather than generic EVM ports.",
          "Proposals should explain how sensitive state stays encrypted while auditors or users can still verify correctness through Oasis programmable policies."
        ]
      },
      {
        "heading": "Technical themes",
        "bullets": [
          "Private DeFi, identity, and AI agents with programmable confidentiality policies.",
          "Developer tooling that simplifies testing and auditing confidential contracts.",
          "Education and grants supporting node operators and ecosystem analytics.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Submit proposals through the Oasis ecosystem grants portal with open-source links, threat models, and milestone metrics. Include how user data stays confidential while remaining auditable where required.",
          "Budget separate milestones for audits and confidential compute benchmarking because reviewers treat them as distinct deliverables.",
          "Name the Oasis runtime or ParaTime you target so reviewers can assign the right security checklist during diligence.",
          "Proposals are evaluated by technical committees on a bi-weekly cycle. Funding disbursements are tied to verifiable milestones such as testnet deployment, security review, and mainnet launch."
        ]
      }
    ]
  },
  "polk-open": {
    "description": "Polkadot OpenGov treasury funds parachains, infrastructure, security, and marketing proposals through on-chain referenda backed by network inflation.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Teams and collectives publish treasury proposals on Subsquare or Polkassembly with budgets, delivery milestones, and beneficiary accounts. Token holders vote during the referendum track assigned to each spend.",
          "Large spends often move through fellowship or curator commentary before referendum voting so reviewers understand technical risk."
        ]
      },
      {
        "heading": "Common funding categories",
        "bullets": [
          "Parachain slot support, collator tooling, and cross-chain messaging improvements.",
          "Developer tooling, wallets, and education for the Substrate and Polkadot SDK.",
          "Security audits, bounty programs, and incident response retainers.",
          "Global events, translations, and media that onboard new ecosystem participants.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Draft a clear scope with measurable outputs, reporting cadence, and multisig or on-chain payment details. Engage the relevant fellowship or curators early if your spend touches core protocol security or runtime upgrades.",
          "Attach links to working prototypes or audit reports when your treasury spend depends on code that is not yet deployed on a production network."
        ]
      }
    ]
  },
  "shor-stu": {
    "description": "Shortcut for Startups provides discounted seats for early engineering teams that want one workspace for planning, execution, release tracking, and stakeholder reporting.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Shortcut bundles issue tracking, roadmaps, and reporting for product and engineering leaders who need speed without adopting a heavy enterprise PMO stack.",
          "Startup pricing helps teams standardize rituals while they move from seed to Series A headcount.",
          "Import templates from Shortcut\u2019s startup library if you are migrating from spreadsheets or ad-hoc GitHub issues."
        ]
      },
      {
        "heading": "How teams use Shortcut",
        "bullets": [
          "Plan epics and iterations with live roadmap views stakeholders can follow.",
          "Connect GitHub or other dev tools so progress updates flow automatically.",
          "Track velocity and release readiness with built-in reporting instead of spreadsheet exports."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Visit shortcut.com/startups for current funding-stage limits and discount duration. Apply with your team size and engineering workflow so support can provision the right workspace tier.",
          "Note your current issue-tracking tool so Shortcut can recommend an import path during onboarding.",
          "Startup support can help map epics to your existing release cadence during the first week."
        ]
      }
    ]
  },
  "solamobibld": {
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Solana Mobile Builder Grants fund teams shipping mobile-first crypto experiences on Saga, Seed Vault, and the Solana Mobile Stack.",
          "Reviewers score proposals on mobile UX quality, Solana Mobile Stack integration depth, and realistic milestone timelines.",
          "Grantees are expected to demo builds on physical Saga hardware or compliant emulators before each payout tranche."
        ]
      },
      {
        "heading": "Evaluation criteria",
        "bullets": [
          "Mobile-first implementation with clear use of Seed Vault or Mobile Wallet Adapter.",
          "Open-source or community components that other builders can reuse.",
          "Milestones tied to testnet or device demos with defined user or transaction targets.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Use the Solana Mobile grants page to submit scope, team background, and funding use of funds. Include APK or TestFlight links when available so reviewers can evaluate the current build.",
          "Describe Seed Vault or Mobile Wallet Adapter usage in your architecture diagram so reviewers can verify stack compliance quickly.",
          "Proposals are evaluated by technical committees on a bi-weekly cycle. Funding disbursements are tied to verifiable milestones such as testnet deployment, security review, and mainnet launch."
        ]
      }
    ]
  },
  "ssoj-stu": {
    "description": "SSOJet\u2019s startup offer provides 50% off enterprise single sign-on for twelve months to qualifying young companies that need SAML and OIDC without building auth infrastructure in-house.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "The program targets startups that must pass enterprise security reviews but cannot yet afford full IdP contracts. SSOJet hosts the integration while your team focuses on core product delivery.",
          "Non-profit applicants use the same form and may qualify when they meet published eligibility criteria for discounted enterprise auth."
        ]
      },
      {
        "heading": "How to apply",
        "bullets": [
          "Complete the startup application with company details and expected monthly active SSO users.",
          "SSOJet reviews within roughly one to two business days and emails onboarding instructions.",
          "Approved teams configure SAML or OIDC connections using SSOJet\u2019s guided setup wizard."
        ]
      },
      {
        "heading": "After approval",
        "paragraphs": [
          "Monitor seat usage during the promotional year and plan migration to standard pricing before renewal if you outgrow startup limits.",
          "Document SAML attribute mappings and SCIM settings if enterprise customers require them during security questionnaires.",
          "Keep an admin contact on file for certificate expiry notices so production logins do not break silently."
        ]
      }
    ]
  },
  "stac-fnd": {
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Stacks Foundation grant programs back open internet infrastructure on Stacks, with a focus on builders, researchers, and community organizers advancing Bitcoin-secured applications.",
          "Funding options include Stacks Endowment Grants for staged project work and DeGrants, a community-led process where members direct smaller awards to ideas they want to see shipped."
        ]
      },
      {
        "heading": "Stacks Endowment Grants",
        "paragraphs": [
          "The endowment publishes tracks for teams getting started, builders shipping products, and community programs that grow adoption. Active awards and milestones are listed on the Stacks Endowment site.",
          "Applicants should tie each milestone to measurable on-chain or open-source deliverables reviewers can verify publicly."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Several ecosystem teams run Immunefi programs for responsible disclosure. Payout ranges vary by project severity tables and are separate from standard grants."
        ],
        "bullets": [
          "Hiro and Leather run security bounty programs for their wallets and developer tooling.",
          "BitFlow, Zest, Granite, and StackingDao host Immunefi bounties with disclosed maximum awards.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      }
    ]
  },
  "stelcommlaun": {
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Stellar community launch rounds fund organizers who host educational events that grow local Stellar ecosystems. Funding pairs modest grants with recognition for potential chapter leaders.",
          "This round targets regions that lack an active Stellar chapter and need structured onboarding content for developers and merchants.",
          "Organizers receive playbooks for wallet onboarding, anchor demos, and merchant education so events stay consistent with Foundation messaging."
        ]
      },
      {
        "heading": "Organizer expectations",
        "bullets": [
          "Host at least one public workshop or meetup with Stellar-focused curriculum.",
          "Capture attendance metrics and publish follow-up resources participants can reuse.",
          "Coordinate with Stellar Foundation staff on branding and safety guidelines.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Complete the Stellar community Typeform when the round is open. Include your region, event plan, and prior community experience so reviewers can assess continuity after funding ends.",
          "Proposals are evaluated by technical committees on a bi-weekly cycle. Funding disbursements are tied to verifiable milestones such as testnet deployment, security review, and mainnet launch."
        ]
      }
    ]
  },
  "story-events": {
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "The Events Grant Program rewards community members who host Story-aligned gatherings such as programmable IP workshops, networking mixers, hackathons, and small dinners for local builders.",
          "Funding tiers start around $300 for first-time hosts and scale up to $2,000 for experienced organizers or ecosystem projects with a documented track record.",
          "Seasonal rounds open on the official Google Form; only use links published on story.foundation to avoid impersonation scams."
        ]
      },
      {
        "heading": "What organizers must deliver",
        "bullets": [
          "Market the event and capture photo or video proof that it occurred.",
          "Submit a post-event report within 72 hours using the Foundation template.",
          "Follow Story community event hosting guidelines for safety and brand use.",
          "Complete payment onboarding and invoice submission before funds are released.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Apply through the official Google Form when the round is open. Decisions are communicated by email.",
          "Proposals are evaluated by technical committees on a bi-weekly cycle. Funding disbursements are tied to verifiable milestones such as testnet deployment, security review, and mainnet launch."
        ]
      }
    ]
  },
  "subq-net-g": {
    "description": "SubQuery funds open-source teams building indexing, RPC, and data infrastructure that helps developers ship faster on multi-chain applications.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "The SubQuery Network grants program backs contributors extending indexing coverage, improving RPC reliability, or building analytics layers on top of decentralized data infrastructure.",
          "Milestone-based awards support both new SubQuery networks and improvements to the core SDK ecosystem.",
          "Reviewers favor repositories with reproducible benchmarks showing latency or hosting cost improvements.",
          "Publish deployment manifests or Dockerfiles so other operators can reproduce your indexer configuration during review."
        ]
      },
      {
        "heading": "Application focus",
        "bullets": [
          "Indexer modules for new chains or parachains joining the SubQuery marketplace.",
          "Developer tooling, documentation, and starter kits for multi-chain dApp builders.",
          "Research or performance work that reduces latency or hosting cost for decentralized query nodes."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Review the public SubQuery grants board for open requests, then submit a proposal with milestones, repository links, and expected timeline. Grants are paid as milestones are accepted by the SubQuery Foundation reviewers.",
          "Mention supported chains in your indexer scope up front so reviewers can route your proposal to the right specialist."
        ]
      }
    ]
  },
  "tall-stu": {
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Tally for Startups gives eligible young companies discounted access to Tally Pro forms and workflow automation, helping founders collect applications, waitlists, and user research without building custom form infrastructure.",
          "Partner organizations distribute referral codes so their portfolio companies skip full-price checkout during the promotional period.",
          "Teams can embed Tally forms in marketing sites or Notion docs without writing custom back-end handlers for every campaign."
        ]
      },
      {
        "heading": "Eligibility",
        "bullets": [
          "Your company qualifies as a startup under Tally\u2019s published criteria.",
          "You belong to a participating VC, accelerator, community, or co-working partner that distributes the offer code.",
          "You have not previously held a paid Tally Pro subscription that lapsed for non-payment."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Investors and community operators can enroll to give their portfolio companies a managed discount link. Startups apply through the partner referral instead of purchasing Tally Pro at full price."
        ]
      }
    ]
  },
  "uomi-grants": {
    "description": "UOMI Grants fund decentralized applications and core infrastructure on the UOMI Network, with individual and ecosystem tracks tied to OPoC consensus milestones.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Individual grants support founders shipping standalone dApps, while ecosystem grants back shared tooling, wallets, and growth programs that lift multiple teams.",
          "Ecosystem tracks favor open standards that reduce integration friction for developers joining UOMI after the initial cohort ships."
        ]
      },
      {
        "heading": "Support included",
        "bullets": [
          "Technical mentorship from core contributors on OPoC and network integrations.",
          "Community amplification and growth workshops when projects hit published traction goals.",
          "Milestone-based payouts after reviewers validate on-chain or open-source deliverables.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Submit your proposal on uomi.ai/grants with architecture notes, token or user metrics, and a three- to six-month milestone plan. Clearly state whether you are applying for an individual or ecosystem track.",
          "List OPoC-specific dependencies or validator partners that your milestone plan requires so mentors can confirm feasibility.",
          "Attach testnet contract addresses or GitHub milestones before your first review call so mentors can validate scope quickly.",
          "Proposals are evaluated by technical committees on a bi-weekly cycle. Funding disbursements are tied to verifiable milestones such as testnet deployment, security review, and mainnet launch."
        ]
      }
    ]
  },
  "vebe-g": {
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "VeBetter funds builders creating sustainability-focused applications, tooling, and infrastructure on VeChain.",
          "Teams should show measurable environmental or lifestyle impact and explain how B3TR incentives reinforce user behavior.",
          "Grants are milestone-based and require periodic reporting on on-chain usage and sustainability outcomes.",
          "VeChain Foundation may feature shipped apps in regional sustainability campaigns when metrics meet public reporting standards."
        ]
      },
      {
        "heading": "Grant tracks",
        "bullets": [
          "App Grants for consumer X-to-earn experiences with transparent sustainability metrics.",
          "Tooling Grants for developer infrastructure, analytics, or protocol upgrades that strengthen the VeBetter ecosystem.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Submit your roadmap, sustainability KPIs, and open-source repository links through the VeBetter grants portal. Reviewers favor projects that can ship a testable MVP within one quarter.",
          "Awards are denominated in B3TR and may include co-marketing or VeChain Foundation intros when milestones land on mainnet.",
          "Include baseline measurements for the sustainability KPI you plan to improve so reviewers can verify impact after launch."
        ]
      }
    ]
  },
  "zeal-aud-g": {
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Zealynx Audit Grants subsidize or fully fund smart contract audits for Web3 protocols that demonstrate user impact and responsive security practices.",
          "Applications are judged on protocol merit, team experience, and willingness to remediate findings before mainnet expansion.",
          "Final reports are shared with grantees under NDA until critical issues are resolved, then summary results may be published with team consent."
        ]
      },
      {
        "heading": "What reviewers expect",
        "bullets": [
          "Clear scope covering contracts that custody or route user funds.",
          "Public code repositories and deployment addresses for the version under review.",
          "Remediation commitment for critical and high severity findings prior to wide release.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Complete the Zealynx grants form with architecture diagrams, timelines, and prior audit history if any. Award size may range from partial subsidies to full audits depending on complexity and ecosystem benefit.",
          "Proposals are evaluated by technical committees on a bi-weekly cycle. Funding disbursements are tied to verifiable milestones such as testnet deployment, security review, and mainnet launch."
        ]
      }
    ]
  },
  "zeta-g": {
    "description": "ZetaChain\u2019s milestone-based grants program backs omnichain and Bitcoin-connected dApps, with funding disbursed after reviewers approve scope, milestones, and ecosystem impact.",
    "url": "https://www.zetachain.com/blog/zetachain-grants-program-for-omnichain-dapp-builders",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "The public grants program allocates millions of dollars to teams deploying on ZetaChain mainnet, with additional carve-outs for Bitcoin-focused infrastructure, DeFi, and gaming experiments highlighted in ecosystem blog posts.",
          "Both existing projects migrating to ZetaChain and new teams in ideation may apply when intake is open.",
          "Blog posts describe Bitcoin ecosystem tranches and omnichain app priorities; confirm the active intake form before submitting legacy L1-only proposals."
        ]
      },
      {
        "heading": "Eligibility",
        "bullets": [
          "Deploy audited or review-ready contracts on ZetaChain mainnet and publish addresses plus open-source repositories.",
          "Operate as a legal entity and accept ZetaChain Terms of Use for disbursement.",
          "Use funds for development, liquidity, adoption, or awareness aligned with published milestone agreements.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Submit the Google Form linked from ZetaChain developer grants materials. After screening, the team schedules an intro call, signs an agreement, and receives tranches as milestones complete."
        ]
      }
    ],
    "descriptionSource": {
      "url": "https://www.zetachain.com/blog/zetachain-grants-program-for-omnichain-dapp-builders",
      "fetchedAt": "2026-11-25T09:53:35.802Z",
      "wordCount": 0,
      "method": "sections",
      "pageTitle": "ZetaChain Grants Program"
    }
  },
  "ampl-stu": {
    "description": "Amplitude for Startups provides early-stage teams with one year of free access to Amplitude Growth, giving builders enterprise-grade product analytics, cohort retention tracking, and conversion funnels.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "The Amplitude Startup Scholarship delivers up to $60,000 in software credits for venture-backed and accelerator-affiliated technology companies. Accepted teams receive full access to Amplitude Growth plan features, enabling granular user behavioral tracking across web and mobile applications.",
          "Participants can track up to 20 million monthly events with advanced segmentation, real-time funnel analysis, customer journey mapping, and automated cohort synchronization into marketing tools."
        ]
      },
      {
        "heading": "Focus areas & qualification",
        "bullets": [
          "Pre-seed to Series A technology startups that have raised under $5 million in total funding.",
          "Teams with less than 20 employees and fewer than 2 years in operation at time of application.",
          "Startups actively building digital web apps, onchain interfaces, or mobile products seeking product-market fit."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Apply directly through the Amplitude for Startups portal. Include your company domain, verification of your latest funding round or accelerator acceptance, and an overview of your current product stage. Approvals are typically processed within three business days."
        ]
      }
    ]
  },
  "asse-stu": {
    "description": "AssemblyAI\u2019s Startup Program awards high-growth technology companies up to $18,000 in Speech AI credits to integrate advanced speech-to-text, speaker diarization, and audio intelligence APIs.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "The AssemblyAI Startup Program is designed for teams building voice-first interfaces, meeting transcription agents, audio analytics platforms, and conversational AI tools. Accepted startups receive substantial API credits across twelve months to scale automated speech recognition without early infrastructure friction.",
          "Credits apply to AssemblyAI\u2019s production speech-to-text models, real-time streaming WebSocket APIs, sentiment analysis, audio summarization, and custom vocabulary tuning."
        ]
      },
      {
        "heading": "What credits cover",
        "bullets": [
          "High-accuracy async and real-time speech-to-text transcription across dozens of global languages.",
          "Audio intelligence features including speaker diarization, automated topic detection, and entity extraction.",
          "LeMur LLM endpoints designed specifically for in-depth reasoning and summarization over transcribed audio data."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Submit an application via the AssemblyAI startup page with your company website, funding history, and an estimate of your monthly audio processing hours. Priority review is granted to companies affiliated with recognized venture funds and accelerators.",
          "Applications undergo rolling review with technical verification. Approved founders gain access to the dedicated startup community and regular solution architecture office hours."
        ]
      }
    ]
  },
  "back-flam": {
    "description": "The Backblaze Flamethrower Program awards early-stage startups and high-throughput data builders up to $100,000 in B2 Cloud Storage credits with zero egress fees via the Bandwidth Alliance.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Backblaze Flamethrower is built for data-intensive startups in AI model hosting, decentralized storage gateways, media streaming, and blockchain indexing that require reliable, S3-compatible cloud object storage without unpredictable bandwidth billing.",
          "Approved founders receive generous multi-month B2 credits alongside direct technical onboarding and architectural reviews with Backblaze cloud storage engineers."
        ]
      },
      {
        "heading": "Program benefits & features",
        "bullets": [
          "Up to $100,000 in Backblaze B2 object storage credits covering hot storage and high-frequency read access.",
          "Full S3 API compatibility allowing drop-in replacement for existing AWS S3 buckets and SDKs.",
          "Zero data transfer egress fees when paired with compute and CDN partners in the Bandwidth Alliance like Cloudflare."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Complete the Flamethrower intake form on the Backblaze website. Detail your target storage capacity in terabytes, expected egress volume, and current cloud architecture. Applications are reviewed on a rolling basis with responses within a week.",
          "Applications undergo rolling review with technical verification. Approved founders gain access to the dedicated startup community and regular solution architecture office hours."
        ]
      }
    ]
  },
  "clou-stu": {
    "description": "Cloudflare for Startups awards up to $250,000 in platform credits for early-stage companies to build and scale serverless applications, edge AI inference, and global cybersecurity protections.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "The Cloudflare for Startups program accelerates venture-backed startups by providing extensive credits across Cloudflare\u2019s developer platform and enterprise security infrastructure. Teams build performant full-stack apps on Cloudflare Workers without provisioning origin servers.",
          "Credits apply to Workers KV, D1 SQL databases, Vectorize vector search, R2 zero-egress object storage, Workers AI model inference, and enterprise-grade DDoS mitigation and Web Application Firewall (WAF) rules."
        ]
      },
      {
        "heading": "Eligibility criteria",
        "bullets": [
          "Bootstrapped or venture-funded companies backed by top-tier venture capital firms or startup accelerators.",
          "Startups incorporated within the last five years that have raised less than $5 million in total equity capital.",
          "Projects building cloud-native web architectures, decentralized gateways, or high-availability consumer apps."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Select your venture capital or accelerator partner on the Cloudflare Startups portal and submit your company information. The Cloudflare team confirms partner affiliation and activates account credits within several business days.",
          "Applications undergo rolling review with technical verification. Approved founders gain access to the dedicated startup community and regular solution architecture office hours."
        ]
      }
    ]
  },
  "data-stu": {
    "description": "The Databricks Startup Program provides qualified early-stage technology companies with up to $200,000 in Databricks compute credits, Lakehouse platform access, and technical architecture reviews.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Databricks for Startups helps data-driven founders build enterprise-scale analytics, real-time data pipelines, and custom machine learning models on the unified Databricks Data Intelligence Platform.",
          "Participants leverage Apache Spark, Delta Lake, Unity Catalog governance, and Mosaic AI tooling to train, fine-tune, and deploy foundation models with enterprise reliability across AWS, Azure, or Google Cloud."
        ]
      },
      {
        "heading": "What participants receive",
        "bullets": [
          "Tiered Databricks software credits sized according to startup funding stage and data processing requirements.",
          "One-on-one architecture consulting and optimization sessions with senior Databricks solution architects.",
          "Access to Databricks community workshops, partner co-marketing opportunities, and startup investor showcases."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Apply on the Databricks startup page with details about your underlying cloud provider, current cloud data stack, and company capitalization. Teams with institutional seed or Series A backing receive priority review.",
          "Applications undergo rolling review with technical verification. Approved founders gain access to the dedicated startup community and regular solution architecture office hours."
        ]
      }
    ]
  },
  "digi-hatc": {
    "description": "DigitalOcean Hatch provides early-stage technology founders with up to $25,000 in cloud infrastructure credits, specialized technical mentorship, and developer community support.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Hatch is DigitalOcean\u2019s global startup incubator designed to help young software ventures scale cost-effectively. Approved startups receive credit allocations valid across twelve months to deploy virtual machine Droplets, managed databases, and scalable container clusters.",
          "The program also includes access to DigitalOcean Kubernetes (DOKS), serverless Functions, Cloudways managed hosting, and dedicated technical support engineers via a private Slack community."
        ]
      },
      {
        "heading": "Program tracks & benefits",
        "bullets": [
          "Cloud infrastructure credits scaled between $1,000 and $25,000 depending on stage and accelerator backing.",
          "Technical consultation on cloud architecture, auto-scaling, and database clustering from DigitalOcean engineers.",
          "Listing in the Hatch portfolio directory and access to private founder roundtables and developer webinars."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Submit your startup details, institutional investor or accelerator partner name, and GitHub or product link through the Hatch application portal. Most applications are reviewed and approved within 48 to 72 hours.",
          "Applications undergo rolling review with technical verification. Approved founders gain access to the dedicated startup community and regular solution architecture office hours."
        ]
      }
    ]
  },
  "fire-stu": {
    "description": "Fireworks for Startups provides generative AI builders with API credits, ultra-fast open-source LLM inference, and custom fine-tuning infrastructure optimized for production workloads.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "The Fireworks Startup Program supports teams building conversational agents, code assistants, automated research workflows, and compound AI systems. Fireworks runs popular open-weights models like Llama 3, Mixtral, and Qwen at industry-leading token speeds.",
          "Selected founders receive dedicated inference credits to test and deploy open-source models at scale, alongside low-latency LoRA fine-tuning and structured JSON output capabilities."
        ]
      },
      {
        "heading": "Key platform capabilities",
        "bullets": [
          "Sub-second time-to-first-token inference for leading multimodal and text generation foundation models.",
          "Serverless LoRA deployment allowing dynamic switching of hundreds of custom fine-tuned models at zero cold-start cost.",
          "Enterprise observability, rate-limit elasticity, and compliance controls tailored for scalable customer deployments."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Apply through the Fireworks AI startup intake form. Detail your current token consumption, target model architectures, and live application use cases. Approved startups receive immediate platform credit top-ups.",
          "Applications undergo rolling review with technical verification. Approved founders gain access to the dedicated startup community and regular solution architecture office hours."
        ]
      }
    ]
  },
  "gith-stu": {
    "description": "GitHub for Startups equips eligible early-stage startups with 20 free seats of GitHub Enterprise, GitHub Copilot access, advanced security tools, and CI/CD compute minutes for twelve months.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "GitHub for Startups gives high-growth ventures the complete GitHub developer platform to collaborate, automate deployments, and secure their codebases from day one. Accepted startups receive 20 free seats of GitHub Enterprise for a full year.",
          "The package includes GitHub Actions CI/CD runners, GitHub Packages storage, automated vulnerability management with Dependabot and Secret Scanning, and AI code generation via GitHub Copilot."
        ]
      },
      {
        "heading": "Eligibility requirements",
        "bullets": [
          "Early-stage technology ventures backed by verified venture capital funds, incubators, or accelerators.",
          "Startups that have raised up to Series A funding and have not previously utilized GitHub Enterprise discounts.",
          "Companies committed to modern DevOps practices, automated testing, and secure source control workflows."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Submit your application through the GitHub for Startups portal by selecting your investor or accelerator partner. After email verification and partner validation, your GitHub organization is upgraded to Enterprise tier automatically.",
          "Applications undergo rolling review with technical verification. Approved founders gain access to the dedicated startup community and regular solution architecture office hours."
        ]
      }
    ]
  },
  "moda-stu": {
    "description": "The Modal Startup Program awards high-performance GPU and CPU cloud credits to early-stage teams building serverless AI inference, model fine-tuning, and heavy compute pipelines.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Modal enables developers to run Python code in the cloud with instant container spin-up, zero server management, and automated scaling from zero to thousands of GPUs. The startup program provides credits to offset heavy computational experimentation.",
          "Teams use Modal for real-time model serving (vLLM, Diffusers), asynchronous distributed batch tasks, voice transcription pipelines, and parameter-efficient fine-tuning on modern NVIDIA H100, A100, and L4 GPUs."
        ]
      },
      {
        "heading": "What developers receive",
        "bullets": [
          "Generous monthly compute credits covering high-end NVIDIA GPU compute hours and serverless CPU jobs.",
          "Instant cold starts under one second for custom containerized environments written in pure Python.",
          "Direct engineering support in a dedicated Slack channel with Modal runtime and infrastructure engineers."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Register for a Modal account and submit the startup credit request form describing your workload requirements, current GPU infrastructure, and company roadmap. Applications are evaluated within two business days.",
          "Applications undergo rolling review with technical verification. Approved founders gain access to the dedicated startup community and regular solution architecture office hours."
        ]
      }
    ]
  },
  "msft-foun": {
    "description": "Microsoft for Startups Founders Hub provides software startups with up to $150,000 in Azure cloud credits, OpenAI API access, GitHub Enterprise licenses, and technical advisory support.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Founders Hub is an open-access platform designed for entrepreneurs at every stage of growth, from initial ideation to scale. Startups do not need venture capital backing or institutional affiliation to qualify for initial benefits.",
          "As companies build and hit milestones, credit allocations scale up to $150,000 in Microsoft Azure computing, Azure OpenAI Service access with GPT-4 and embeddings, Microsoft 365 productivity suites, and LinkedIn tooling."
        ]
      },
      {
        "heading": "Key perks across tiers",
        "bullets": [
          "Tiered Azure credits that unlock progressively based on prototype progress, customer traction, and usage.",
          "Direct access to Azure OpenAI Service endpoints with enterprise data privacy guarantees and dedicated rate limits.",
          "Complimentary 1-on-1 technical advisory sessions with Microsoft cloud solution architects and AI engineers."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Sign in with a LinkedIn or Microsoft account on the Founders Hub portal. Complete a brief profile describing your business model and product vision. Approvals are generally issued within minutes for entry-tier benefits."
        ]
      }
    ]
  },
  "pine-stu": {
    "description": "The Pinecone Startup Program awards vector database credits to early-stage AI companies building high-performance semantic search, Retrieval-Augmented Generation (RAG), and agent memory systems.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Pinecone provides managed serverless vector databases that enable sub-50ms similarity search over billions of high-dimensional embeddings. The startup program gives builders the runway to deploy vector search without early hosting expenses.",
          "Eligible startups receive free platform usage across Pinecone serverless indexes with automated scaling, metadata filtering, namespace isolation, and zero-maintenance index tuning."
        ]
      },
      {
        "heading": "Program highlights",
        "bullets": [
          "Serverless vector search credits valid across AWS, Azure, and Google Cloud regions.",
          "High-throughput vector indexing with hybrid sparse-dense search support for enterprise search accuracy.",
          "Access to Pinecone developer office hours, early feature betas, and technical architecture reviews."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Submit your application on the Pinecone startup page. Provide your registered Pinecone organization ID, company website, and a short summary of your vector embeddings use case. Credits are applied directly to your account upon review.",
          "Applications undergo rolling review with technical verification. Approved founders gain access to the dedicated startup community and regular solution architecture office hours."
        ]
      }
    ]
  },
  "post-stu": {
    "description": "PostHog for Startups grants high-velocity software ventures $50,000 in platform credits for product analytics, session replays, feature flags, A/B testing, and user feedback surveys.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "PostHog is an all-in-one developer-friendly product operating system. The startup program provides $50,000 in credits valid for a full twelve months, empowering founders to understand user behavior and ship features confidently.",
          "The credit pool covers all PostHog products: event-based analytics, visual session recordings with DOM inspection, multivariate feature flags, automated experiment evaluations, error tracking, and qualitative customer surveys."
        ]
      },
      {
        "heading": "Eligibility guidelines",
        "bullets": [
          "Technology startups that have raised less than $5 million in total funding and are under two years old.",
          "Teams with active web or mobile applications seeking deep insights into user journeys and product conversion funnels.",
          "Available to both bootstrapped founders and teams funded by accelerators or venture capital funds."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Create a PostHog Cloud account and submit the startup scholarship application through your dashboard. Approvals are typically granted within 24 hours, and credits activate immediately in your billing settings.",
          "Applications undergo rolling review with technical verification. Approved founders gain access to the dedicated startup community and regular solution architecture office hours."
        ]
      }
    ]
  },
  "snow-stu": {
    "description": "The Snowflake Startup Program provides early-stage companies with cloud data platform credits, architectural advisory sessions, and go-to-market support on the Snowflake Marketplace.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Snowflake for Startups enables founders to build data-intensive applications, predictive AI pipelines, and native multi-tenant SaaS products on the Snowflake Data Cloud without managing data warehouse infrastructure.",
          "Selected startups receive introductory compute credits to deploy scalable virtual warehouses, secure data sharing feeds, and interactive Streamlit analytics apps directly on top of their cloud data lake."
        ]
      },
      {
        "heading": "Key benefits",
        "bullets": [
          "Snowflake platform credits to subsidize warehousing, data ingestion, and analytical SQL compute.",
          "Architectural guidance on data modeling, cost optimization, and secure multi-tenant SaaS partitioning.",
          "Opportunities to publish monetized datasets and native applications to the global Snowflake Data Marketplace."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Fill out the startup application form on Snowflake\u2019s official website with your funding stage, company domain, and primary cloud provider. An account executive contacts eligible founders to activate benefits.",
          "Applications undergo rolling review with technical verification. Approved founders gain access to the dedicated startup community and regular solution architecture office hours."
        ]
      }
    ]
  },
  "amerseedfund": {
    "description": "America\u2019s Seed Fund, powered by the National Science Foundation (NSF SBIR / STTR), awards up to $2,000,000 in non-dilutive federal grants for deep-tech, cryptographic, and computational innovations.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "America\u2019s Seed Fund is the United States government\u2019s flagship non-dilutive funding vehicle for early-stage science and technology breakthroughs. The program operates through the Small Business Innovation Research (SBIR) and Small Business Technology Transfer (STTR) frameworks.",
          "Phase I awards provide up to $275,000 to conduct proof-of-concept research over 6 to 12 months. Successful projects can then apply for Phase II funding of up to $1,000,000 plus supplemental matching grants, totaling up to $2 million in non-dilutive equity-free capital."
        ]
      },
      {
        "heading": "Eligible research domains",
        "bullets": [
          "Distributed ledgers, zero-knowledge proofs, and novel cryptographic protocols with national technological impact.",
          "Artificial intelligence, verifiable computational systems, and high-performance quantum or neuromorphic architectures.",
          "Cybersecurity infrastructure, privacy-enhancing technologies, and resilient decentralized communications."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Start by submitting a three-page Project Pitch through the NSF Seed Fund portal. If invited, prepare a formal Phase I proposal following NSF guidelines. US incorporation and majority domestic ownership are required."
        ]
      }
    ]
  },
  "mozi-fell": {
    "description": "The Mozilla Foundation Awards & Fellowships program provides funding between $10,000 and $100,000+ for researchers, open-source developers, and civil society leaders building a healthier internet.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Mozilla\u2019s grantmaking and fellowship initiatives champion open-source tools, algorithmic transparency, trustworthy artificial intelligence, and digital privacy. The foundation supports individuals and small teams creating public interest technologies.",
          "Awardees receive flexible grant capital, collaborative residency cohorts, international research visibility, and technical collaboration opportunities with Mozilla engineers and policy experts worldwide."
        ]
      },
      {
        "heading": "Core thematic priorities",
        "bullets": [
          "Trustworthy AI systems that prioritize user agency, transparent training data, and algorithmic accountability.",
          "Open web standards, decentralized identity frameworks, and zero-knowledge privacy technologies.",
          "Digital safety and defense tools that protect journalists, researchers, and vulnerable communities online.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Review open award cycles on the Mozilla Foundation website. Submit an initial statement of purpose detailing your project\u2019s technical roadmap, open-source licensing, and community impact. Shortlisted applicants participate in video panel interviews.",
          "Proposals are evaluated by technical committees on a bi-weekly cycle. Funding disbursements are tied to verifiable milestones such as testnet deployment, security review, and mainnet launch."
        ]
      }
    ]
  },
  "sove-tech": {
    "description": "The Sovereign Tech Fund (STF) provides \u20ac50,000 to \u20ac500,000+ in non-dilutive open-source funding to maintain and fortify critical digital infrastructure, open protocols, and security libraries.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Financed by the German Federal Ministry for Economic Affairs and Climate Action, the Sovereign Tech Fund invests in foundational open-source technologies that underpin global digital ecosystems, internet routing, operating systems, and cryptography.",
          "STF awards sustainable, milestone-driven funding to maintainers and core developers to pay for security audits, automated testing infrastructure, bug fixes, performance refactoring, and community governance."
        ]
      },
      {
        "heading": "Eligible open-source projects",
        "bullets": [
          "Core libraries, programming language compilers, cryptographic primitives, and foundational developer utilities.",
          "Critical internet protocols, time-synchronization tools, and foundational operating system components.",
          "Open-source technologies that demonstrate widespread global dependency, active maintenance, and open governance.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Submit an application through the Sovereign Tech Fund website during active submission rounds. Outline your project\u2019s dependency graph, current maintenance bottlenecks, and planned security deliverables. Contracts are issued as public funding agreements.",
          "Proposals are evaluated by technical committees on a bi-weekly cycle. Funding disbursements are tied to verifiable milestones such as testnet deployment, security review, and mainnet launch."
        ]
      }
    ]
  },
  "airt-stu": {
    "description": "Airtable for Startups awards early-stage founders up to $2,000 in platform credits to build automated relational workflows, product roadmaps, and custom internal operations hubs.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Airtable for Startups helps fast-moving teams organize operations, investor relations, content pipelines, and customer feedback without engineering custom internal tools.",
          "Approved ventures receive credit packages valid for Team or Business plan subscriptions, unlocking unlimited automated workflows, relational table linking, interactive interface designer dashboards, and advanced permissioning."
        ]
      },
      {
        "heading": "Core startup benefits",
        "bullets": [
          "Up to $2,000 in software credits applicable across Airtable Team and Business annual subscriptions.",
          "Interface Designer access to create tailor-made internal dashboards for team members and external stakeholders.",
          "Pre-built startup operational templates covering fundraising pipelines, sprint planning, and applicant tracking."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Apply through the Airtable startup portal using your corporate email address and details of your startup accelerator or venture capital backing. Verified accounts receive credits within three business days.",
          "Submissions are verified directly against partner registry databases. Once approved, credit codes and tier upgrades are provisioned directly to your company administrative account."
        ]
      }
    ]
  },
  "airw-stu": {
    "description": "Airwallex for Startups offers venture-backed companies up to $50,000 in fee-free foreign exchange transfers, multi-currency corporate cards, and international payment infrastructure.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Airwallex for Startups simplifies cross-border financial operations for global teams. The program eliminates banking friction by providing virtual accounts across 60+ countries and zero-fee foreign currency conversions.",
          "Founders access competitive global FX rates, issue physical and virtual employee corporate debit cards with built-in expense management, and integrate seamless payment collection APIs for international customers."
        ]
      },
      {
        "heading": "Program perks & features",
        "bullets": [
          "Up to $50,000 in fee-free foreign exchange volume across major global currencies including USD, EUR, GBP, and SGD.",
          "Free corporate multi-currency cards with customizable spend limits, real-time receipt capture, and Xero sync.",
          "Dedicated startup onboarding specialist and prioritized customer support for high-volume cross-border payments."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Register via the Airwallex startup partnership page with proof of venture capital backing or startup community membership. Once corporate KYC is completed, FX waiver credits are applied automatically.",
          "Submissions are verified directly against partner registry databases. Once approved, credit codes and tier upgrades are provisioned directly to your company administrative account."
        ]
      }
    ]
  },
  "asan-stu": {
    "description": "Asana for Startups delivers up to 50% to 80% discounts on Asana Business and Enterprise tiers to help founding teams align goals, manage sprints, and coordinate complex product roadmaps.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Asana for Startups equips young technology ventures with world-class work management software. Founding teams use Asana to track company-wide OKRs, plan feature releases, and coordinate cross-functional milestones.",
          "The startup discount enables growing teams to access advanced workflow automation, resource management, timeline Gantt views, and integrations with GitHub, Slack, and Google Workspace at an accessible price point."
        ]
      },
      {
        "heading": "Eligibility & features",
        "bullets": [
          "Startups with under $5 million in total funding and fewer than 30 employees qualify for tiered annual discounts.",
          "Advanced portfolio views to monitor project health, critical path dependencies, and team capacity in real time.",
          "Custom automation rules to streamline bug triage, candidate reviews, and cross-team approval workflows."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Fill out the startup application form on Asana\u2019s official site. Provide your investor or incubator affiliation, company size, and domain. Verification is completed within two business days.",
          "Submissions are verified directly against partner registry databases. Once approved, credit codes and tier upgrades are provisioned directly to your company administrative account."
        ]
      }
    ]
  },
  "atla-stu": {
    "description": "Atlassian for Startups provides early-stage companies with free 12-month access to Jira, Confluence, Jira Service Management, and Compass for up to 50 team members.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Atlassian for Startups delivers the industry-standard developer workflow suite to venture-backed ventures completely free for one year. Teams track engineering sprints in Jira, maintain engineering docs in Confluence, and monitor microservices in Compass.",
          "The package covers up to 50 users across Atlassian Cloud Standard or Premium editions, ensuring engineering and product organizations scale without tooling friction."
        ]
      },
      {
        "heading": "Included software tools",
        "bullets": [
          "Jira Software for agile sprint planning, backlog grooming, release tracking, and automated GitHub PR linking.",
          "Confluence for collaborative technical specs, company knowledge bases, and sprint retrospective documentation.",
          "Compass for tracking microservice ownership, system health scorecards, and deployment dependencies."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Apply through the Atlassian for Startups portal by selecting your participating venture fund or incubator partner. Once verified, your Atlassian Cloud organization is credited for full license fees for 12 months.",
          "Submissions are verified directly against partner registry databases. Once approved, credit codes and tier upgrades are provisioned directly to your company administrative account."
        ]
      }
    ]
  },
  "atti-stu": {
    "description": "Attio for Startups provides growing technology ventures with an 80% discount on Attio Pro in year one, enabling fully customizable customer relationship management and deal tracking.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Attio is the next-generation CRM built for modern tech companies and web3 teams. Attio combines the flexibility of a relational database with automated email and calendar synchronization.",
          "The startup program gives early teams the power to build custom pipelines for venture fundraising, enterprise sales, partnership tracking, and grant applicant evaluation with real-time collaborative views."
        ]
      },
      {
        "heading": "Key CRM features",
        "bullets": [
          "Automated data enrichment that continuously pulls company size, social profiles, and funding history.",
          "Real-time bi-directional email and calendar integration across team Google Workspace and Microsoft 365 accounts.",
          "Flexible custom data models supporting nested attributes, webhooks, and modern developer API endpoints."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Submit your application on the Attio for Startups landing page with your company details and evidence of venture capital or accelerator affiliation. Discount codes are distributed within 48 hours.",
          "Submissions are verified directly against partner registry databases. Once approved, credit codes and tier upgrades are provisioned directly to your company administrative account."
        ]
      }
    ]
  },
  "auth-stu": {
    "description": "Auth0 for Startups by Okta offers one year of free access to Auth0 B2B Professional (valued at $24,000), delivering secure authentication, social login, and user management.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "The Auth0 Startup Program eliminates the burden of building custom authentication from scratch. Early teams integrate enterprise-grade identity, MFA, passwordless logins, and role-based access control in hours.",
          "The grant provides full access to Auth0 B2B Professional for up to 500 regular active users and multiple enterprise SSO connections, allowing startups to satisfy enterprise security questionnaires from day one."
        ]
      },
      {
        "heading": "Package highlights",
        "bullets": [
          "One year free subscription to Auth0 B2B Professional with enterprise single sign-on (SAML / WS-Fed) support.",
          "Universal login with multi-factor authentication (SMS, OTP, biometric passkeys) and automated anomaly detection.",
          "Customizable Auth0 Actions to execute bespoke Node.js logic during authentication and token issuance flows."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Apply via the Auth0 for Startups page with your company domain and details of your accredited accelerator or venture capital backing. Qualifying companies receive immediate plan activation.",
          "Submissions are verified directly against partner registry databases. Once approved, credit codes and tier upgrades are provisioned directly to your company administrative account."
        ]
      }
    ]
  },
  "brex-grants": {
    "description": "Brex for Startups provides high-growth technology companies with corporate credit cards without personal guarantees, high credit limits, and over $350,000 in partner reward discounts.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Brex is designed specifically for venture-backed and funded startups. The platform evaluates company cash balances and institutional backing rather than founder credit scores, granting credit limits up to 10x higher than traditional banks.",
          "Startups receive integrated global expense management, automated receipt matching, multi-currency physical and virtual cards, and an extensive perks package covering AWS, Slack, Google Cloud, and legal tooling."
        ]
      },
      {
        "heading": "Founder benefits",
        "bullets": [
          "Corporate credit cards with zero personal liability, high credit limits, and automated bill payment automation.",
          "Exclusive access to over $350,000 in partner credits and software discounts across leading SaaS platforms.",
          "Treasury management accounts providing multi-million-dollar FDIC insurance coverage via partner bank sweeps."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Complete the online Brex application with proof of at least $50,000 in cash balance and formal corporate formation. Approvals and virtual card issuance are typically completed within one business day.",
          "Submissions are verified directly against partner registry databases. Once approved, credit codes and tier upgrades are provisioned directly to your company administrative account."
        ]
      }
    ]
  },
  "canv-stu": {
    "description": "Canva for Startups empowers founding teams with free visual design templates, collaborative brand kits, and discounted Canva Pro access to craft pitch decks and marketing assets.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Canva for Startups accelerates brand development for non-designers. Founders and marketing leads quickly produce professional investor pitch presentations, social media graphics, product demo one-pagers, and video teasers.",
          "The program provides access to thousands of curated startup templates, shared team brand kits with custom typography and color palettes, AI magic studio editing, and direct asset publishing."
        ]
      },
      {
        "heading": "Program resources",
        "bullets": [
          "Custom brand asset management to maintain consistent corporate identity across all investor and community touchpoints.",
          "Collaborative presentation decks with real-time commenting, interactive embeds, and public link analytics.",
          "AI-assisted photo enhancement, background removal, and instant multi-platform layout resizing."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Sign up through the Canva startup portal with your business email. Verify your company registration to unlock specialized founder template packs and team trial upgrades.",
          "Submissions are verified directly against partner registry databases. Once approved, credit codes and tier upgrades are provisioned directly to your company administrative account."
        ]
      }
    ]
  },
  "circ-stu": {
    "description": "The CircleCI Startup Program awards early-stage engineering teams up to $20,000 in continuous integration compute credits to build, test, and deploy software reliably.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "CircleCI helps fast-shipping engineering teams automate testing pipelines and deployment workflows. The startup program provides substantial cloud runner compute credits across Docker, Linux, macOS, and GPU executors.",
          "Engineering teams eliminate slow build queues with test splitting, concurrency orchestration, and automated artifact caching, ensuring PR validation takes minutes instead of hours."
        ]
      },
      {
        "heading": "Compute features",
        "bullets": [
          "Up to $20,000 in CI/CD compute credits applicable to standard and high-memory cloud execution environments.",
          "Intelligent test splitting that distributes test suites across parallel containers according to historical runtime.",
          "Pre-built integrations (Orbs) for rapid deployment to AWS, Google Cloud, Docker Hub, and Kubernetes."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Submit the application on CircleCI\u2019s startup page with your GitHub or Bitbucket organization handle and funding verification. Credits are granted and reflected in your account billing within three business days.",
          "Submissions are verified directly against partner registry databases. Once approved, credit codes and tier upgrades are provisioned directly to your company administrative account."
        ]
      }
    ]
  },
  "cler-stu": {
    "description": "Clerk for Startups gives early-stage teams discounted access to Clerk Pro, providing turnkey user authentication, session management, and multi-tenant organization workspaces.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Clerk is purpose-built for modern React, Next.js, and mobile applications. The startup program provides early teams with deeply discounted Pro tier access, enabling complete user authentication in under an hour.",
          "Founders implement social sign-in (Google, GitHub, Apple, Web3 wallets), passkeys, multi-factor authentication, and self-serve B2B multi-tenant organization switching with ready-to-use drop-in UI components."
        ]
      },
      {
        "heading": "Developer advantages",
        "bullets": [
          "Pre-built, customizable React and Next.js authentication components that match any design system.",
          "Native support for multi-tenant B2B SaaS organizations with role-based member invitations and billing hooks.",
          "Seamless integration with backend databases including Supabase, Firebase, Convex, and Neon Postgres."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Create a Clerk account and apply via the Clerk startup form. Submit your active application URL and funding stage. Approved startups receive credit codes applied directly to their workspace billing.",
          "Submissions are verified directly against partner registry databases. Once approved, credit codes and tier upgrades are provisioned directly to your company administrative account."
        ]
      }
    ]
  },
  "compvantdrat": {
    "description": "The Ramp Compliance Program offers startups 25% to 30% discounts and up to $10,000 in credits toward automated SOC 2, ISO 27001, and HIPAA compliance platforms including Vanta and Drata.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Securing institutional enterprise deals and web3 partnerships requires verified security compliance. Through Ramp\u2019s compliance partner network, founders access substantial fee reductions on top automated compliance platforms.",
          "Startups automate evidence collection across cloud providers, code repositories, and identity systems, reducing the time required to complete SOC 2 Type I and Type II audits from months to weeks."
        ]
      },
      {
        "heading": "Available benefits",
        "bullets": [
          "Up to 30% discounts on annual subscriptions for Vanta, Drata, or Secureframe compliance platforms.",
          "Direct introductions to certified partner CPA audit firms offering pre-negotiated startup rates.",
          "Continuous automated monitoring of cloud security controls, employee device compliance, and vendor risks."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Log in to your Ramp corporate dashboard and navigate to the Rewards tab. Select your preferred compliance partner (Vanta, Drata, or Secureframe) to activate partner discounts and book an onboarding call.",
          "Submissions are verified directly against partner registry databases. Once approved, credit codes and tier upgrades are provisioned directly to your company administrative account."
        ]
      }
    ]
  },
  "deel-stu": {
    "description": "Deel for Startups provides fast-growing teams with 5 free contractor seats for life and 20% to 50% discounts on international payroll, employer of record (EOR), and immigration support.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Deel enables tech startups to hire, onboard, and pay contractors and full-time employees in over 150 countries compliant with local labor laws. The startup program minimizes overhead for remote-first teams.",
          "Participants access localized employment contracts, automated tax compliance forms, multi-currency international salary disbursements (including cryptocurrency withdrawal options), and global health insurance perks."
        ]
      },
      {
        "heading": "Program highlights",
        "bullets": [
          "Five free international contractor management seats for life for eligible early-stage startups.",
          "Steep fee reductions on Employer of Record (EOR) hiring to employ full-time staff without setting up local entities.",
          "Dedicated compliance advisory for international talent onboarding, intellectual property assignment, and visas."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Register on the Deel for Startups page with your startup domain and partner network reference. An account representative will verify your funding status and activate special startup pricing.",
          "Submissions are verified directly against partner registry databases. Once approved, credit codes and tier upgrades are provisioned directly to your company administrative account."
        ]
      }
    ]
  },
  "drat-stu": {
    "description": "Drata for Startups provides emerging technology companies with discounted access to automated compliance management, accelerating SOC 2, ISO 27001, and GDPR readiness.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Drata is a leading security and compliance automation platform. The startup program helps young companies build trust with enterprise clients by continuously monitoring their security posture and automating audit evidence collection.",
          "The platform connects with over 100 SaaS and cloud tools (AWS, GitHub, Google Workspace, Jira) to continuously audit security configurations and flag compliance gaps before formal audit reviews."
        ]
      },
      {
        "heading": "Core platform features",
        "bullets": [
          "Automated evidence collection for 14+ compliance frameworks including SOC 2, ISO 27001, HIPAA, and GDPR.",
          "Comprehensive pre-built security policy templates drafted by former auditors and security compliance leaders.",
          "Drata Trust Center to publicly demonstrate security posture, certifications, and sub-processor lists to buyers."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Apply via the Drata for Startups portal with proof of recent funding (pre-seed through Series A). A Drata compliance specialist will review eligibility and provide tailored startup package quotes.",
          "Submissions are verified directly against partner registry databases. Once approved, credit codes and tier upgrades are provisioned directly to your company administrative account."
        ]
      }
    ]
  },
  "fram-stu": {
    "description": "Framer for Startups awards eligible early-stage companies up to one year of free Framer Pro to design, publish, and host high-performance, responsive landing pages and marketing sites.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Framer empowers founders and growth marketers to build responsive, visually stunning marketing websites directly on a visual canvas with native CMS collections and interactive animations, without writing frontend code.",
          "The startup scholarship provides one full year of Framer Pro, including custom domain hosting, staging environments, advanced SEO metadata controls, high-speed global CDN delivery, and localization."
        ]
      },
      {
        "heading": "Included capabilities",
        "bullets": [
          "Free 12-month Framer Pro subscription supporting custom domains and unlimited marketing pages.",
          "Built-in visual CMS for publishing company blogs, changelogs, customer case studies, and documentation.",
          "Optimized Core Web Vitals performance with automated asset compression and edge caching on Cloudflare CDN."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Submit your startup information and proof of venture capital or accelerator backing through the Framer startup application page. Discount codes are distributed via email within three business days.",
          "Submissions are verified directly against partner registry databases. Once approved, credit codes and tier upgrades are provisioned directly to your company administrative account."
        ]
      }
    ]
  },
  "fres-stu": {
    "description": "Freshworks for Startups grants up to $4,000 in credits across Freshdesk customer support, Freshsales CRM, and Freshmarketer, alongside technical mentoring and founder community perks.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Freshworks provides an intuitive suite of business software built for rapid deployment. The startup program awards $4,000 in multi-product credits to help early teams deliver exceptional customer support and organize sales pipelines.",
          "The credit pool covers omnichannel customer ticket management (email, chat, social) with AI resolution bots, automated deal management, lead scoring, and targeted email marketing campaigns."
        ]
      },
      {
        "heading": "Key software benefits",
        "bullets": [
          "Freshdesk omnichannel support ticketing with automated routing, SLA management, and shared team inboxes.",
          "Freshsales CRM with AI-powered contact enrichment, pipeline tracking, and built-in telephony.",
          "Access to the Freshworks startup founder community, webinar office hours, and venture investor pitch sessions."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Apply through the Freshworks for Startups portal by naming your incubator, accelerator, or VC fund. Credits are credited to your Freshworks organization upon verification.",
          "Submissions are verified directly against partner registry databases. Once approved, credit codes and tier upgrades are provisioned directly to your company administrative account."
        ]
      }
    ]
  },
  "grac-stu": {
    "description": "GrackerAI for Startups provides early-stage companies with discounted access to programmatic SEO, AI search intelligence, and structured landing page generation tools.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "GrackerAI helps technology startups build programmatic search engine visibility. The platform scans organic search intent, generates authoritative comparison pages, and structures programmatic content libraries at scale.",
          "Founders in competitive web3, AI, and developer tools sectors leverage GrackerAI to capture long-tail high-intent buyer searches and establish topical domain authority quickly."
        ]
      },
      {
        "heading": "Tool capabilities",
        "bullets": [
          "Automated competitive gap analysis and keyword discovery tailored to developer and B2B SaaS audiences.",
          "Programmatic landing page generation with structured JSON-LD schemas and SEO metadata optimization.",
          "Integrations with popular modern CMS platforms including Webflow, Framer, and custom Next.js heads."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Sign up on the GrackerAI startup page and submit your current domain and organic traffic goals. The GrackerAI team validates early-stage eligibility and activates founder pricing tiers.",
          "Submissions are verified directly against partner registry databases. Once approved, credit codes and tier upgrades are provisioned directly to your company administrative account."
        ]
      }
    ]
  },
  "line-stu": {
    "description": "Linear for Startups awards eligible early-stage technology companies six months of free access to Linear Business, providing streamlined issue tracking, roadmaps, and cycle management.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Linear is the project management tool favored by modern software organizations for its speed, keyboard-first navigation, and minimalist design. The startup program gives early teams six months of free Business tier access.",
          "Engineering teams organize sprint cycles, triage customer bug reports, manage multi-quarter project roadmaps, and automate pull request status syncs with GitHub and GitLab effortlessly."
        ]
      },
      {
        "heading": "Included features",
        "bullets": [
          "Six months of complimentary Linear Business plan access for your entire engineering and product organization.",
          "Real-time automated sync with GitHub, GitLab, and Slack for continuous status updates and PR linking.",
          "Advanced roadmap timelines, project dependencies, initiative tracking, and custom export APIs."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Submit your application through the Linear for Startups form. Provide your work email, company website, and verification of institutional investment or accelerator participation.",
          "Submissions are verified directly against partner registry databases. Once approved, credit codes and tier upgrades are provisioned directly to your company administrative account."
        ]
      }
    ]
  },
  "merc-perk": {
    "description": "Mercury Perks provides venture-backed founders with over $300,000 in software discounts and credits across premier tech tools including AWS, Carta, Notion, Quickbooks, and Hubspot.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Mercury offers modern digital banking and treasury management for startups. Alongside multi-million-dollar FDIC insurance and seamless wire transfers, account holders unlock a comprehensive perks marketplace.",
          "Startups leverage Mercury Perks to reduce burn rate across legal formation, cloud hosting, equity management, accounting software, and sales CRM platforms during their critical early building years."
        ]
      },
      {
        "heading": "Top partner discounts",
        "bullets": [
          "Up to $5,000 in AWS Activate cloud credits and $2,000 in OpenAI API platform credits.",
          "20% off Carta cap table management and discounted legal incorporation packages with top tech law firms.",
          "Discounts on accounting suites (Quickbooks, Pilot) and modern workplace tools (Notion, Slack, Miro)."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Open and fund an active Mercury business banking account. Once approved, navigate directly to the Perks section in your Mercury dashboard to claim exclusive promotional codes and partner invitations.",
          "Submissions are verified directly against partner registry databases. Once approved, credit codes and tier upgrades are provisioned directly to your company administrative account."
        ]
      }
    ]
  },
  "mint-stu": {
    "description": "Mintlify for Startups awards qualified developer-first teams with six months of free Mintlify Pro, providing modern MDX documentation hosting, API reference sync, and interactive playgrounds.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Mintlify enables developer tools, SDKs, and web3 protocols to build beautiful, conversion-focused documentation out of the box. Mintlify syncs directly with GitHub repositories using standard MDX files.",
          "The startup grant provides six months of Mintlify Pro, unlocking custom domain hosting, OpenAPI and Swagger interactive endpoint testers, built-in AI search assistants, and user engagement analytics."
        ]
      },
      {
        "heading": "Documentation capabilities",
        "bullets": [
          "Git-backed documentation where doc changes are reviewed and merged via standard GitHub pull requests.",
          "Interactive API explorer allowing developers to test HTTP and RPC requests directly from documentation pages.",
          "Built-in AI-powered search that answers developer questions accurately using indexed documentation pages."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Fill out the brief startup form on Mintlify\u2019s website with your company domain and GitHub repo link. Upon qualification, the Mintlify team applies the six-month Pro credit to your organization.",
          "Submissions are verified directly against partner registry databases. Once approved, credit codes and tier upgrades are provisioned directly to your company administrative account."
        ]
      }
    ]
  },
  "miro-stu": {
    "description": "Miro for Startups awards early-stage teams up to $1,000 in workspace credits to collaborate on visual system architecture diagrams, user journey mapping, and product sprint roadmaps.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Miro provides a collaborative visual workspace that empowers distributed founding teams to brainstorm, map complex software architectures, and run agile planning sessions on an infinite canvas.",
          "The Miro Startup Program provides up to $1,000 in software credits valid for Team or Business plans, unlocking unlimited boards, advanced diagramming shapes (UML, AWS, Kubernetes), and video chat."
        ]
      },
      {
        "heading": "Collaboration benefits",
        "bullets": [
          "Extensive technical diagramming libraries including AWS, Google Cloud, Azure, and Cisco networking shapes.",
          "Real-time collaborative whiteboarding with voting, timers, private mode, and breakout working areas.",
          "Integrations with Jira, Confluence, Slack, and Figma to synchronize visual designs with engineering backlogs."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Apply through the Miro for Startups page using your company domain and accelerator or venture partner code. Once verified, credits are deposited directly into your Miro workspace billing account.",
          "Submissions are verified directly against partner registry databases. Once approved, credit codes and tier upgrades are provisioned directly to your company administrative account."
        ]
      }
    ]
  },
  "page-stu": {
    "description": "PagerDuty for Startups equips young engineering teams with six months of free access for up to 20 users, delivering real-time incident alerting, on-call schedules, and automated escalation policies.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "PagerDuty helps software ventures maintain 99.99% uptime and resolve critical production incidents fast. The startup program gives growing teams 6 months of enterprise-grade alerting completely free.",
          "Teams set up automated on-call rotation schedules, SMS and phone call escalations, and incident triage integrations with Datadog, Sentry, AWS CloudWatch, and Slack, ensuring critical outages are caught immediately."
        ]
      },
      {
        "heading": "Platform features",
        "bullets": [
          "Comprehensive on-call scheduling with flexible shift rotations, holiday overrides, and multi-tier escalation policies.",
          "Automated event grouping and noise reduction to prevent engineer alert fatigue from benign warnings.",
          "Seamless integration with monitoring providers and bi-directional incident management inside Slack."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Submit the application on the PagerDuty for Startups website. Provide your business registration and confirmation of seed or Series A funding. Approved teams receive immediate plan upgrades.",
          "Submissions are verified directly against partner registry databases. Once approved, credit codes and tier upgrades are provisioned directly to your company administrative account."
        ]
      }
    ]
  },
  "pipe-stu": {
    "description": "Pipedrive for Startups provides early-stage sales and business development teams with a 20% discount for twelve months, alongside CRM pipeline templates and onboarding guidance.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Pipedrive is an activity-based sales CRM designed to keep deal cycles moving forward. Founders and sales leads use Pipedrive to visualize enterprise sales funnels, track investor conversations, and manage partnership pipelines.",
          "The startup discount applies across all Pipedrive plan tiers, providing automated email tracking, meeting scheduling links, sales revenue forecasting, and customizable custom field attributes."
        ]
      },
      {
        "heading": "Key CRM features",
        "bullets": [
          "Visual drag-and-drop deal pipelines customized for B2B enterprise software and partnership sales cycles.",
          "Automated follow-up reminders, email open tracking, and unified contact communication histories.",
          "Mobile CRM apps for iOS and Android with automated call logging and meeting note dictation."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Apply via the Pipedrive startup portal with your business domain and partner code. Your account is provisioned with the 20% annual discount code automatically upon sign-up.",
          "Submissions are verified directly against partner registry databases. Once approved, credit codes and tier upgrades are provisioned directly to your company administrative account."
        ]
      }
    ]
  },
  "razo-rize": {
    "description": "Razorpay Rize accelerates early-stage Indian and global startups with zero-fee payment gateway processing credits, fast-track incorporation assistance, and over $50,000 in SaaS partner perks.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Razorpay Rize is an all-in-one incubator ecosystem built by Razorpay for founders starting and scaling their ventures. Rize members receive payment gateway fee waivers to accept credit cards, UPI, and international payments without early transaction costs.",
          "The program also assists founders with company incorporation, business banking account setup, payroll automation through RazorpayX, and credits across AWS, Google Cloud, and legal compliance platforms."
        ]
      },
      {
        "heading": "Member perks",
        "bullets": [
          "Fee waivers on initial payment gateway processing volume across domestic and international payment modes.",
          "Assistance with corporate entity incorporation, GST registration, and business current accounts.",
          "Exclusive access to the Razorpay Rize founder community, mentorship masterclasses, and investor networks."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Sign up on the Razorpay Rize website with your startup details and business registration number. Applications are reviewed and approved within 48 hours.",
          "Submissions are verified directly against partner registry databases. Once approved, credit codes and tier upgrades are provisioned directly to your company administrative account."
        ]
      }
    ]
  },
  "rese-stu": {
    "description": "Resend for Startups awards qualified early-stage technology companies up to $25,000 in email API delivery credits, modern React Email templates, and high-deliverability infrastructure.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Resend is the modern email platform built for developers, enabling teams to build, test, and send transactional emails using clean React components and robust REST APIs.",
          "Through the startup program, accelerator-backed founders receive up to $25,000 in email credits, dedicated IP addresses, custom domain authentication (SPF, DKIM, DMARC), and real-time open and click webhooks."
        ]
      },
      {
        "heading": "Developer features",
        "bullets": [
          "First-class support for React Email, allowing developers to code emails like web components with TypeScript.",
          "Ultra-fast API response times and reliable deliverability with dedicated IP pools and proactive reputation monitoring.",
          "Comprehensive analytics on email delivery rates, bounces, spam complaints, and user interaction metrics."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Submit your application through the Resend startup page with your company domain, primary sending use case, and venture fund or accelerator name. Credits activate directly on your billing account.",
          "Submissions are verified directly against partner registry databases. Once approved, credit codes and tier upgrades are provisioned directly to your company administrative account."
        ]
      }
    ]
  },
  "ripp-stu": {
    "description": "Rippling for Startups delivers discounted HR, global payroll, IT device management, and corporate spend software to help young ventures manage people and operations in one platform.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Rippling unifies employee data across payroll, health benefits, computer hardware provisioning, and software app access. The startup program provides preferred pricing to eliminate administrative sprawl.",
          "Founders automate global payroll across domestic and international contractors, ship pre-configured Mac and PC laptops with endpoint security installed, and automate Google Workspace and Slack provisioning in 90 seconds."
        ]
      },
      {
        "heading": "Integrated capabilities",
        "bullets": [
          "Full-service automated payroll with automatic tax filing, direct deposit, and international currency payouts.",
          "Zero-touch IT management to order, ship, wipe, and secure employee laptops remotely from a single dashboard.",
          "Automated app provisioning that provisions or revokes access to 500+ cloud tools based on employee role."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Request a startup consultation on the Rippling website. An account representative confirms company formation and funding stage to apply tailored startup discount pricing.",
          "Submissions are verified directly against partner registry databases. Once approved, credit codes and tier upgrades are provisioned directly to your company administrative account."
        ]
      }
    ]
  },
  "sale-stu": {
    "description": "Salesforce for Startups provides early-stage companies with up to 50% off Salesforce Starter and Sales Cloud, alongside CRM implementation templates and venture community resources.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Salesforce for Startups helps growing B2B technology companies scale customer acquisition and enterprise sales operations. The program gives early ventures discounted access to Salesforce\u2019s industry-standard CRM platform.",
          "Founders leverage simplified Starter editions with built-in email marketing, lead management, opportunity tracking, and customer service ticketing designed for fast deployment without dedicated administrators."
        ]
      },
      {
        "heading": "Program benefits",
        "bullets": [
          "Up to 50% discount on initial user licenses for Salesforce Starter Suite and Sales Cloud Professional.",
          "Out-of-the-box pipeline reports, sales forecasting dashboards, and automated lead capture forms.",
          "Access to Salesforce Ventures events, startup masterclasses, and Trailhead guided learning journeys."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Complete the registration on the Salesforce for Startups page with your company profile and funding details. A Salesforce startup specialist will confirm eligibility and set up your discounted instance.",
          "Submissions are verified directly against partner registry databases. Once approved, credit codes and tier upgrades are provisioned directly to your company administrative account."
        ]
      }
    ]
  },
  "snyk-stu": {
    "description": "Snyk for Startups provides young software teams with discounted developer security licenses, automated vulnerability scanning for open-source dependencies, code security, and container images.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Snyk enables developers to find and fix security vulnerabilities directly in their IDEs, pull requests, and CI/CD pipelines. The startup program gives early teams enterprise security capabilities at startup pricing.",
          "Engineering teams automatically scan open-source npm, pip, and cargo packages for known CVEs, detect code security flaws in proprietary repositories, and monitor container configurations before production deploy."
        ]
      },
      {
        "heading": "Security tooling features",
        "bullets": [
          "Automated pull request checks that identify security vulnerabilities and suggest one-click dependency upgrades.",
          "Snyk Code static application security testing (SAST) with real-time feedback directly inside VS Code and JetBrains.",
          "Container and Infrastructure-as-Code (Terraform, Kubernetes) configuration scanning for compliance gaps."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Sign up on the Snyk for Startups portal. Submit your venture capital or accelerator partner details to receive custom startup pricing and unlock extended security testing limits.",
          "Submissions are verified directly against partner registry databases. Once approved, credit codes and tier upgrades are provisioned directly to your company administrative account."
        ]
      }
    ]
  },
  "stripe-atlas": {
    "description": "Stripe Atlas helps international and domestic founders form a Delaware C-Corporation, obtain a US IRS tax ID (EIN), issue founder shares, and access $2,500 in fee-free payment credits.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Stripe Atlas is the standard legal formation platform used by thousands of venture-backed startups worldwide. In just a few days, Atlas creates a Delaware C-Corp with standard investor-ready bylaws and founder equity vesting.",
          "The package includes automated IRS employer identification number (EIN) filing, 83(b) tax election filing guidance, registered agent service, and immediate integration with Stripe payment processing."
        ]
      },
      {
        "heading": "What founders receive",
        "bullets": [
          "Official legal incorporation in Delaware with customized shareholder agreements and post-incorporation docs.",
          "Filing of IRS EIN tax identification and automated preparation of founder 83(b) tax election letters.",
          "$2,500 in fee-free Stripe payment processing and over $100,000 in partner discounts across cloud and legal tools."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Start your application directly on the Stripe Atlas website. Provide your proposed company name, co-founder equity allocation, and basic company details. Incorporation documents are generated and filed electronically within days.",
          "Submissions are verified directly against partner registry databases. Once approved, credit codes and tier upgrades are provisioned directly to your company administrative account."
        ]
      }
    ]
  },
  "stri-stu": {
    "description": "Stripe for Startups provides early-stage companies with fee-free payment processing credits, discounted access to Stripe Billing and Invoicing, and priority technical support.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Stripe powers payments for millions of global internet businesses. The Stripe for Startups program reduces transaction friction for high-potential startups affiliated with partner venture funds and incubators.",
          "Accepted companies receive fee credits covering their initial transaction volume, zero-fee access to Stripe Billing for recurring subscriptions, global card acquiring, and automated fraud prevention via Stripe Radar."
        ]
      },
      {
        "heading": "Included payment perks",
        "bullets": [
          "Fee-free transaction processing credits applied across credit cards, Apple Pay, Google Pay, and bank debits.",
          "Discounted access to Stripe Billing, Customer Portal, and automated revenue recognition tooling.",
          "Priority account review and dedicated technical support for complex international payment setups."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Access the Stripe for Startups portal using your accelerator or venture capital partner\u2019s unique invite link. Credits are credited directly to your Stripe dashboard upon partner confirmation.",
          "Submissions are verified directly against partner registry databases. Once approved, credit codes and tier upgrades are provisioned directly to your company administrative account."
        ]
      }
    ]
  },
  "vouc-insu": {
    "description": "Vouch Insurance provides tech and web3 startups with specialized business insurance coverage, fast digital quotes, and exclusive 5% to 10% premium discounts on liability policies.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Vouch is a digital business insurance platform designed specifically for venture-backed technology ventures. Traditional insurers often reject innovative tech and web3 business models; Vouch tailors policies for modern risks.",
          "Founders secure essential commercial policies in minutes, including General Liability, Directors & Officers (D&O), Cyber Liability, and Technology Errors & Omissions (E&O), meeting vendor and investor prerequisites."
        ]
      },
      {
        "heading": "Key insurance policies",
        "bullets": [
          "Directors & Officers (D&O) insurance required by institutional venture capital investors during financing rounds.",
          "Cyber Liability coverage protecting against smart contract vulnerabilities, data breaches, and extortion.",
          "Technology E&O and General Liability to satisfy enterprise pilot contracts and commercial lease requirements."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Complete an online quote on the Vouch website. Provide your corporate registration, industry sector, and funding stage. Customized policy quotes and proof of insurance certificates are issued within 24 to 48 hours.",
          "Submissions are verified directly against partner registry databases. Once approved, credit codes and tier upgrades are provisioned directly to your company administrative account."
        ]
      }
    ]
  },
  "work-stu": {
    "description": "WorkOS for Startups provides growing B2B software companies with free Enterprise Single Sign-On (SAML) and Directory Sync (SCIM) for up to 1,000,000 monthly active users permanently.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "WorkOS makes any SaaS application enterprise-ready with a single API integration. The WorkOS Startup Program gives early teams free permanent access to Enterprise SSO and automated user directory synchronization.",
          "Founders close six-figure enterprise contracts without spending months building custom SAML integrations for Okta, Microsoft Azure AD, Google Workspace, and Ping Identity."
        ]
      },
      {
        "heading": "Enterprise features",
        "bullets": [
          "Universal SAML and OpenID Connect SSO integration supporting all major corporate identity providers.",
          "Directory Sync via SCIM to automatically onboard and de-provision employee accounts based on HR systems.",
          "Self-serve Admin Portal for enterprise IT teams to configure their own SSO connections without engineering calls."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Register for a free WorkOS developer account and submit the startup program application in your dashboard. Startups that have raised up to Series A qualify for permanent free SSO up to 1M MAUs.",
          "Submissions are verified directly against partner registry databases. Once approved, credit codes and tier upgrades are provisioned directly to your company administrative account."
        ]
      }
    ]
  },
  "0g-growth": {
    "description": "The 0G Foundation Ecosystem Growth Program provides milestone-based funding, compute subsidies, and technical support for teams building modular AI data availability, storage, and alignment networks.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "0G is a modular AI blockchain architecture featuring an ultra-high-throughput data availability layer and decentralized storage network. The Ecosystem Growth Program backs builders solving the AI data bottleneck.",
          "Selected projects receive capital grants, compute resource subsidies, and architectural guidance to deploy data-heavy applications, onchain AI agents, and verifiable inference protocols directly on 0G infrastructure."
        ]
      },
      {
        "heading": "Target focus areas",
        "bullets": [
          "High-throughput data availability integrations for Layer 2 rollups and application-specific execution layers.",
          "Decentralized storage solutions for massive multimodal AI datasets, model weights, and verifiable training checkpoints.",
          "Autonomous onchain AI agents, model alignment networks, and decentralized inference verification pipelines.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Submit your proposal via the 0G Foundation ecosystem portal. Include a technical architecture whitepaper, repository links, benchmark data availability requirements, and planned mainnet deployment milestones.",
          "Proposals are evaluated by technical committees on a bi-weekly cycle. Funding disbursements are tied to verifiable milestones such as testnet deployment, security review, and mainnet launch."
        ]
      }
    ]
  },
  "abey-grants": {
    "description": "The Abey Foundation Grants Program awards non-dilutive, milestone-based funding to developers and teams building high-throughput dApps, cross-chain DeFi, and interoperability tools on ABEYChain.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "ABEYChain is a hybrid PoW/DPoS blockchain designed for high transaction throughput and cross-chain composability. The Abey Foundation Grants Program fuels ecosystem expansion across decentralized finance and gaming.",
          "Grant recipients receive non-dilutive capital alongside direct technical assistance from core protocol developers, security audit subsidies, and exchange listing and community visibility support."
        ]
      },
      {
        "heading": "What reviewers look for",
        "bullets": [
          "Decentralized exchanges, lending protocols, and structured financial products leveraging ABEYChain speed.",
          "Cross-chain bridges, asset wrapping mechanisms, and oracle integrations connecting ABEY with other major chains.",
          "Web3 gaming ecosystems, NFT marketplaces, and enterprise data solutions demonstrating live user traction.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Apply through the Abey Foundation grants portal with your team background, functional prototype or testnet deployment, smart contract audit status, and detailed milestone delivery schedule.",
          "Proposals are evaluated by technical committees on a bi-weekly cycle. Funding disbursements are tied to verifiable milestones such as testnet deployment, security review, and mainnet launch."
        ]
      }
    ]
  },
  "acal-net-g": {
    "description": "Acala Network Grants fund developers building cross-chain DeFi protocols, liquid staking derivatives, and financial infrastructure within the Polkadot and Kusama cross-consensus ecosystems.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Acala serves as the decentralized liquidity hub of Polkadot. The Acala Grants Program fosters innovative financial primitives that utilize Acala\u2019s EVM+ environment and native cross-consensus messaging (XCM).",
          "The program distributes milestone-based funding to open-source builders creating decentralized stablecoin applications, liquid staking integrations (LDOT), automated market makers, and cross-chain yield aggregators."
        ]
      },
      {
        "heading": "Key funding tracks",
        "bullets": [
          "EVM+ compatible smart contract dApps bringing novel lending, trading, and asset management models to Polkadot.",
          "Cross-chain infrastructure utilizing Polkadot XCM for seamless multi-parachain asset transfers and shared liquidity.",
          "Developer tooling including indexers, analytics dashboards, and automated SDKs for Acala protocol interaction.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Submit a formal grant proposal on the Acala GitHub grants repository or official ecosystem portal. Proposals must include open-source code repositories, measurable milestone deliverables, and budget breakdowns.",
          "Proposals are evaluated by technical committees on a bi-weekly cycle. Funding disbursements are tied to verifiable milestones such as testnet deployment, security review, and mainnet launch."
        ]
      }
    ]
  },
  "aeth-poly": {
    "description": "The Aethir x Polyhedra Grant Program provides compute allocations and zero-knowledge infrastructure grants to teams developing high-performance ZK-ML, web3 gaming, and cross-chain AI systems.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Aethir and Polyhedra Network have partnered to accelerate teams at the intersection of decentralized GPU computing and zero-knowledge cryptography. The joint grant addresses compute bottlenecks for proving systems.",
          "Recipients obtain enterprise-grade NVIDIA GPU cluster hours from Aethir combined with Polyhedra\u2019s zkBridge and zero-knowledge proving algorithms to build verifiable artificial intelligence and scalable gaming worlds."
        ]
      },
      {
        "heading": "Eligible project tracks",
        "bullets": [
          "Zero-knowledge machine learning (ZK-ML) pipelines requiring high-throughput GPU clusters for proof generation.",
          "Cross-chain interoperability protocols and interoperable game assets verified via Polyhedra zkBridge.",
          "Decentralized AI agents and verifiable inference applications demanding high compute density and cryptographic validity.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Apply via the Aethir ecosystem program intake channel. Provide system architecture specs, anticipated monthly GPU hours, proof-generation benchmarks, and target mainnet integration timelines.",
          "Proposals are evaluated by technical committees on a bi-weekly cycle. Funding disbursements are tied to verifiable milestones such as testnet deployment, security review, and mainnet launch."
        ]
      }
    ]
  },
  "aleo-grants": {
    "description": "Aleo Ecosystem Grants distribute $10,000 to $100,000+ in non-dilutive funding to developers building privacy-preserving zero-knowledge applications and Leo smart contracts on the Aleo network.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Aleo uses zero-knowledge cryptography (zkSNARKs) to provide complete programmability with absolute transactional privacy. The Aleo Grants Program funds builders who leverage zero-knowledge proofs to protect user data.",
          "Grants are awarded across multiple tiers: Ignite Grants for early prototypes ($10K-$20K), Launch Grants for production dApps ($50K+), and Blueprint Grants for complex core protocol infrastructure and tooling."
        ]
      },
      {
        "heading": "Priority development categories",
        "bullets": [
          "Private DeFi applications including dark pools, compliant private lending, and confidential automated market makers.",
          "Zero-knowledge digital identity verification (zk-KYC), verifiable credentials, and decentralized anonymous voting.",
          "Developer infrastructure, testing harnesses, Leo language libraries, and browser wallet proving extensions.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Submit your proposal through the Aleo Grants portal. Include your GitHub repository, architecture overview, proof-of-concept code written in Leo or AVM instructions, and a multi-stage milestone roadmap.",
          "Proposals are evaluated by technical committees on a bi-weekly cycle. Funding disbursements are tied to verifiable milestones such as testnet deployment, security review, and mainnet launch."
        ]
      }
    ]
  },
  "alepzerofund": {
    "description": "The Aleph Zero Ecosystem Funding Program allocates capital, technical advisory, and incubation to builders launching privacy-first decentralized applications on the Aleph Zero blockchain.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Aleph Zero is an enterprise-ready, high-speed Proof-of-Stake public network utilizing zero-knowledge proofs and secure Multi-Party Computation (sMPC) via its privacy framework, Liminal.",
          "The $50M Ecosystem Funding Program provides non-dilutive grants, follow-on venture introductions, and architectural reviews to teams building private financial primitives, gaming platforms, and enterprise solutions."
        ]
      },
      {
        "heading": "Focus areas & review criteria",
        "bullets": [
          "Ink! smart contracts demonstrating efficient execution, low state bloat, and comprehensive unit test coverage.",
          "Privacy-enhanced applications combining public blockchain auditing with private user state using Liminal sMPC/ZKP.",
          "Institutional compliance tools, private credential verification, and decentralized data custody architectures.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Complete the application form on the Aleph Zero website. Detail your product vision, tech stack, team experience with Rust/ink!, and phased deliverables. Shortlisted teams present their proposal in an interview.",
          "Proposals are evaluated by technical committees on a bi-weekly cycle. Funding disbursements are tied to verifiable milestones such as testnet deployment, security review, and mainnet launch."
        ]
      }
    ]
  },
  "apto-paym-g": {
    "description": "Aptos Payments Grants award up to $150,000 to fintech and Web3 builders creating instant, low-cost global payment infrastructure, merchant integrations, and stablecoin checkout flows on Aptos.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Aptos provides sub-second finality and high transaction throughput via its Move execution engine. The Aptos Payments Grant program accelerates adoption of real-world onchain payment flows.",
          "Approved projects receive non-dilutive milestone funding of up to $150,000, direct technical support from Aptos engineering, and introductions to global merchant processors, banks, and ecosystem liquidity providers."
        ]
      },
      {
        "heading": "Target payment use cases",
        "bullets": [
          "Point-of-sale and e-commerce checkout SDKs that settle native stablecoins (USDT, USDC) instantly with near-zero gas.",
          "Cross-border remittances, peer-to-peer mobile payment apps, and payroll disbursements utilizing Aptos accounts.",
          "Programmable micropayment streams for digital content creators, gaming rewards, and automated AI agent settlements.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Submit an application via the Aptos Foundation grants portal. Detail your transaction volume projections, merchant integration roadmap, compliance framework, and Move smart contract design.",
          "Proposals are evaluated by technical committees on a bi-weekly cycle. Funding disbursements are tied to verifiable milestones such as testnet deployment, security review, and mainnet launch."
        ]
      }
    ]
  },
  "arb-d-a": {
    "description": "The Arbitrum D.A.O. Grant Program, managed through Questbook, provides domain-specific decentralized grant funding across gaming, developer tooling, and novel protocol mechanics on Arbitrum One and Nova.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "The Arbitrum DAO grants program empowers community-elected Domain Allocators to evaluate and fund high-impact proposals with transparent milestone governance on Questbook.",
          "Independent allocators review applications across specialized tracks: Gaming, New Protocols & Ideas, Developer Tooling, and Education. Accepted builders receive non-dilutive ARB token disbursements linked to verified milestones."
        ]
      },
      {
        "heading": "Available grant tracks",
        "bullets": [
          "Gaming & Entertainment: Onchain games, autonomous worlds, and consumer apps deployed on Arbitrum Nova or One.",
          "New Protocols: Novel DeFi primitives, restaking mechanisms, and capital efficiency algorithms.",
          "Developer Tooling: SDKs, debuggers, indexers, and testing suites that improve the Arbitrum developer experience.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Submit your proposal directly on the Arbitrum Questbook portal. Choose the appropriate domain track, define 2-4 measurable milestone deliverables, and engage with community allocators during the public review period.",
          "Proposals are evaluated by technical committees on a bi-weekly cycle. Funding disbursements are tied to verifiable milestones such as testnet deployment, security review, and mainnet launch."
        ]
      }
    ]
  },
  "arb-op-hous": {
    "description": "Arbitrum Open House offers collaborative builder cohorts, pitch review sessions, and founder grant funding run by Offchain Labs and the Arbitrum Foundation for high-potential Web3 startups.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Arbitrum Open House connects early-stage founders directly with core Offchain Labs engineers, leading Arbitrum ecosystem investors, and marketing advisors during intensive regional builder cohorts.",
          "Participating teams receive pitch reviews, smart contract architecture audits, go-to-market mentorship, and direct consideration for foundation grant disbursements and Arbitrum ecosystem venture investments."
        ]
      },
      {
        "heading": "Cohort benefits",
        "bullets": [
          "Direct mentorship and architecture consulting from Offchain Labs protocol engineers and product leads.",
          "Fast-tracked review for Arbitrum Foundation grants, Orbit chain support, and ecosystem marketing exposure.",
          "Investor demo days featuring top institutional venture capital firms actively funding Arbitrum startups.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Register on the Arbitrum Open House site for upcoming city cohorts (London, Singapore, New York). Provide your prototype URL, pitch deck, GitHub links, and specific Arbitrum integration objectives.",
          "Proposals are evaluated by technical committees on a bi-weekly cycle. Funding disbursements are tied to verifiable milestones such as testnet deployment, security review, and mainnet launch."
        ]
      }
    ]
  },
  "arb-security": {
    "description": "The Arbitrum Security Program subsidizes smart contract security audits, formal verification, and penetration testing by top-tier auditing firms for protocols launching on Arbitrum.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Security is the highest priority for the Arbitrum ecosystem. The Arbitrum Foundation launched the Security Program to ensure high-potential protocols undergo rigorous third-party audits before deploying mainnet capital.",
          "The program pairs qualifying projects with vetted leading auditing firms, covering substantial audit expenses and providing recommendations on bug bounty programs and incident response frameworks."
        ]
      },
      {
        "heading": "Eligible security coverage",
        "bullets": [
          "Comprehensive manual smart contract code audits covering Solidity, Vyper, and Arbitrum Stylus (Rust/C++) logic.",
          "Formal verification of critical financial invariants, state machines, and mathematical tokenomic formulas.",
          "Economic vulnerability testing, oracle manipulation modeling, and automated fuzzing suite development.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Submit an application via the Arbitrum Foundation security portal. Include finalized smart contract code freezes, comprehensive test coverage metrics (>90%), and intended mainnet TVL launch dates.",
          "Proposals are evaluated by technical committees on a bi-weekly cycle. Funding disbursements are tied to verifiable milestones such as testnet deployment, security review, and mainnet launch."
        ]
      }
    ]
  },
  "arb-stab-gr": {
    "description": "The Arbitrum Stablecoin Growth Program provides liquidity subsidies, grants, and co-marketing to teams integrating native stablecoins, payments, and yield-bearing cash equivalents on Arbitrum.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Arbitrum is a premier settlement hub for digital currency. The Stablecoin Growth Program incentivizes protocols that drive organic stablecoin velocity, cross-border remittances, and institutional liquidity on Arbitrum.",
          "Selected partners receive strategic token grants, liquidity provisioning assistance, and collaborative campaigns with Arbitrum DeFi protocols to deepen stablecoin liquidity pools and payment rails."
        ]
      },
      {
        "heading": "Focus areas & qualifications",
        "bullets": [
          "Payment gateways, consumer fintech onramps, and remittance apps routing settlements through Arbitrum native stablecoins.",
          "Yield-bearing cash equivalents, tokenized US Treasuries, and real-world asset (RWA) cash management protocols.",
          "Foreign exchange (FX) automated market makers and cross-currency settlement corridors on Layer 2.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Apply via the Arbitrum Foundation official blog intake link. Include your tokenomic model, current circulating volume or projected issuance, regulatory compliance posture, and planned DeFi liquidity venues.",
          "Proposals are evaluated by technical committees on a bi-weekly cycle. Funding disbursements are tied to verifiable milestones such as testnet deployment, security review, and mainnet launch."
        ]
      }
    ]
  },
  "arweave": {
    "description": "Arweave Open Web Grants provide non-dilutive funding, storage endowments, and technical guidance for developers building decentralized applications, permanent data archives, and AO compute agents.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Arweave provides permanent, immutable decentralized data storage backed by sustainable storage endowment economics. The Open Web Grants program supports projects that preserve critical information on the Permaweb.",
          "With the emergence of AO (the hyper-parallel computer on Arweave), funding also targets autonomous agent frameworks, decentralized messaging networks, and serverless compute models that run directly on top of permanent data."
        ]
      },
      {
        "heading": "What gets funded",
        "bullets": [
          "Permaweb consumer dApps, publishing platforms, social networks, and immutable scientific data repositories.",
          "AO actor-based parallel processes, autonomous trading agents, and decentralized AI model inference verification.",
          "Developer infrastructure including GraphQL gateways, upload indexers, caching layers, and browser extensions.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Submit the Arweave grant intake form with your open-source repository link, Permaweb live demo, and a breakdown of milestones. Reviews are conducted collaboratively by community core contributors.",
          "Proposals are evaluated by technical committees on a bi-weekly cycle. Funding disbursements are tied to verifiable milestones such as testnet deployment, security review, and mainnet launch."
        ]
      }
    ]
  },
  "avax-bliz": {
    "description": "The Avalanche Blizzard Ecosystem Fund provides over $200M in venture investments, ecosystem grants, and liquidity backing for high-growth DeFi, gaming, and custom Subnet projects on Avalanche.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Blizzard is a specialized $200M+ investment fund backed by Ava Labs, the Avalanche Foundation, Polychain Capital, and Dragonfly. The fund identifies and scales generational companies building on Avalanche.",
          "Portfolio teams receive direct equity or token investments, technical support to deploy custom Avalanche L1s (Subnets), integration assistance with Core wallet, and deep liquidity coordination across Avalanche DeFi."
        ]
      },
      {
        "heading": "Investment & grant sectors",
        "bullets": [
          "Custom Avalanche Subnets tailored for institutional finance, compliance rails, and enterprise data processing.",
          "Triple-A Web3 gaming studios utilizing sub-second finality and dedicated gas tokens on Avalanche L1s.",
          "Next-generation DeFi primitives including real-world asset (RWA) tokenization and cross-chain teleporter messaging.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Founders can submit pitch decks and technical architecture briefs directly on the Blizzard Fund website. The investment committee conducts regular deal reviews and schedules introductory calls with selected teams.",
          "Proposals are evaluated by technical committees on a bi-weekly cycle. Funding disbursements are tied to verifiable milestones such as testnet deployment, security review, and mainnet launch."
        ]
      }
    ]
  },
  "catalyst": {
    "description": "Cardano Project Catalyst is a community-governed innovation engine that awards millions in ADA funding every cycle to open-source protocols, developer tools, and ecosystem initiatives on Cardano.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Project Catalyst represents one of the largest decentralized innovation funds in the blockchain space. Funded directly by the Cardano treasury, Catalyst distributes capital via transparent, community-wide stake-weighted voting.",
          "Each funding round invites proposals across defined campaign challenges. Winning projects receive non-dilutive ADA funding paid out in milestones upon verifiable proof of technical execution and community updates."
        ]
      },
      {
        "heading": "Common funding categories",
        "bullets": [
          "Cardano smart contract development using Plutus, Aiken, and Helios for decentralized finance and gaming.",
          "Core developer tools, cryptographic libraries, hardware wallet integrations, and node monitoring utilities.",
          "Educational bootcamps, localized regional hubs, and international community governance onboarding.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Submit your proposal on the Project Catalyst IdeaScale platform during an active fund launch. Engage in community peer review, refine your deliverables based on feedback, and participate in the voter tally.",
          "Proposals are evaluated by technical committees on a bi-weekly cycle. Funding disbursements are tied to verifiable milestones such as testnet deployment, security review, and mainnet launch."
        ]
      }
    ]
  },
  "celo-agents": {
    "description": "The Celo Agents for the Real World program provides funding and incubation for teams building autonomous AI agents, automated payment micro-rails, and mobile-first mini dApps on Celo.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Celo is an Ethereum Layer 2 designed for fast, low-cost payments and global financial inclusion. The Celo Agents program funds developers combining autonomous AI agents with instant onchain payments.",
          "Teams leverage Celo\u2019s sub-cent gas fees, ERC-4337 smart accounts, and native integration with MiniPay (Opera\u2019s mobile dollar wallet with millions of users across Africa and Latin America) to deploy consumer AI agents."
        ]
      },
      {
        "heading": "Priority use cases",
        "bullets": [
          "Autonomous agent payment systems that purchase compute, settle data APIs, and transact using cUSD or USDT.",
          "Mobile conversational agents integrated into WhatsApp, Telegram, or MiniPay for localized commerce and remittances.",
          "Onchain verifiable agent decision-making, predictive market bots, and automated micro-savings advisors.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Review the program brief on the Celo platform Notion portal and submit your hackathon or grant entry. Include your agent workflow architecture, mobile UX demo, and planned Celo mainnet deployment milestones.",
          "Proposals are evaluated by technical committees on a bi-weekly cycle. Funding disbursements are tied to verifiable milestones such as testnet deployment, security review, and mainnet launch."
        ]
      }
    ]
  },
  "celocommfund": {
    "description": "The Celo Community Fund provides non-dilutive grants to projects advancing financial inclusion, regenerative finance (ReFi), mobile payments, and decentralized public goods on the Celo blockchain.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "The Celo Community Fund (CCF) is a community-governed treasury that allocates funding to open-source builders and social impact founders aligned with Celo\u2019s mission of building a financial system that creates prosperity for all.",
          "Administered via Submittable, the CCF awards milestone-based grants to initiatives expanding global payments, biodiversity credit verification, climate resilience, and mobile developer ecosystems on Celo Layer 2."
        ]
      },
      {
        "heading": "Evaluation criteria",
        "bullets": [
          "Clear social or financial inclusion impact demonstrating measurable utility for underserved or mobile-first communities.",
          "Commitment to open-source software, transparent budget accountability, and community governance participation.",
          "Technical feasibility and direct integration with Celo\u2019s native stablecoins (cUSD, cEUR, cREAL) and infrastructure.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Submit a detailed grant application via the Celo Community Fund Submittable portal. Propose defined milestone deliverables and budget requests. Selected proposals are reviewed by CCF stewards and posted for community feedback.",
          "Proposals are evaluated by technical committees on a bi-weekly cycle. Funding disbursements are tied to verifiable milestones such as testnet deployment, security review, and mainnet launch."
        ]
      }
    ]
  },
  "chaingpt": {
    "description": "The ChainGPT Web3 AI Grant Program provides $1,000 to $50,000 in non-dilutive funding, AI compute credits, and mentoring for startups combining artificial intelligence with decentralized technology.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "ChainGPT is a leading provider of AI-powered Web3 infrastructure. The ChainGPT Grants Program supports ambitious startups integrating machine learning into blockchain ecosystems.",
          "Recipients gain non-dilutive funding alongside direct access to ChainGPT\u2019s proprietary AI models (AI smart contract generator, automated auditor, onchain AI analytics, and AI NFT generator) and incubation advisory."
        ]
      },
      {
        "heading": "Supported project types",
        "bullets": [
          "AI-driven trading systems, predictive market intelligence models, and automated algorithmic portfolio rebalancing.",
          "Automated smart contract auditing tools, vulnerability scanners, and AI-assisted formal verification agents.",
          "Generative media platforms, personalized AI gaming NPC behaviors, and decentralized AI compute marketplaces.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Apply through the ChainGPT Grants website. Provide your pitch deck, live prototype or GitHub repo, and tokenomic or product roadmap. The ChainGPT incubation team evaluates submissions on a rolling basis.",
          "Proposals are evaluated by technical committees on a bi-weekly cycle. Funding disbursements are tied to verifiable milestones such as testnet deployment, security review, and mainnet launch."
        ]
      }
    ]
  },
  "chai-secr": {
    "description": "The ChainGPT x Secret Network Grant Program awards funding and technical mentorship to developers building privacy-preserving, confidential AI applications using encrypted smart contracts.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "ChainGPT and Secret Network have joined forces to pioneer confidential artificial intelligence. The joint grant supports teams that need both sophisticated AI capabilities and encrypted onchain data privacy.",
          "Builders combine ChainGPT\u2019s advanced AI inference APIs with Secret Network\u2019s confidential computation (Secret Contracts) to process proprietary datasets, private medical or financial records, and confidential user prompts."
        ]
      },
      {
        "heading": "Target focus areas",
        "bullets": [
          "Confidential AI agents that execute financial trades or automate workflows without leaking proprietary strategies.",
          "Private data marketplace and model training platforms with verifiable zero-knowledge or enclave-protected compute.",
          "Encrypted user personal assistants that process sensitive queries while maintaining complete onchain confidentiality.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Submit your proposal via the official partnership intake link announced by Secret Network and ChainGPT. Outline your privacy architecture, smart contract requirements, and intended cross-chain deployment timeline.",
          "Proposals are evaluated by technical committees on a bi-weekly cycle. Funding disbursements are tied to verifiable milestones such as testnet deployment, security review, and mainnet launch."
        ]
      }
    ]
  },
  "circ-dev-g": {
    "description": "Circle Developer Grants award capital, developer tooling, and advisory to teams building global commerce, USDC/EURC payments, and Cross-Chain Transfer Protocol (CCTP) integrations.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Circle powers internet financial architecture with fully reserved digital dollar (USDC) and euro (EURC) stablecoins. Circle Developer Grants support builders creating frictionless financial flows.",
          "The program awards non-dilutive milestone funding to projects integrating programmable Web3 Wallets, Cross-Chain Transfer Protocol (CCTP) zero-slippage rebalancing, and consumer payment checkout SDKs."
        ]
      },
      {
        "heading": "Key focus areas",
        "bullets": [
          "Programmable Wallets integrations that simplify consumer onboarding with social recovery and gasless user experiences.",
          "Cross-chain capital efficiency solutions leveraging Circle CCTP for native burn-and-mint asset transfers.",
          "Merchant payment plugins, micropayment streaming platforms, and cross-border payroll architectures utilizing USDC.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Apply on the Circle Developer Grants portal. Detail your target transaction volume, supported blockchain networks, compliance strategy, and key implementation milestones. Submissions are reviewed monthly.",
          "Proposals are evaluated by technical committees on a bi-weekly cycle. Funding disbursements are tied to verifiable milestones such as testnet deployment, security review, and mainnet launch."
        ]
      }
    ]
  },
  "clrfundclea": {
    "description": "The clr.fund (Clear Fund) provides decentralized quadratic funding and matching pool allocations for developers creating Ethereum public goods, open-source infrastructure, and privacy tooling.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "clr.fund uses Minimal Anti-Collusion Infrastructure (MACI) to run trust-minimized, collusion-resistant quadratic funding rounds for Ethereum ecosystem public goods.",
          "By preventing bribery and coordinated voting through zero-knowledge proofs, clr.fund ensures that matching pool capital is distributed strictly in proportion to authentic community preference and donation count."
        ]
      },
      {
        "heading": "Eligible public goods",
        "bullets": [
          "Open-source Ethereum client implementations, cryptographic libraries, developer tools, and testing environments.",
          "Privacy-preserving protocols, zero-knowledge research, and decentralized identity governance experiments.",
          "Public educational content, security research documentation, and open blockchain data indexing APIs.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Register your open-source project on the clr.fund platform before an active community round starts. Verify your project repository and recipient address. Community members donate directly using zk-SNARK shielded ballots.",
          "Proposals are evaluated by technical committees on a bi-weekly cycle. Funding disbursements are tied to verifiable milestones such as testnet deployment, security review, and mainnet launch."
        ]
      }
    ]
  },
  "comp-fin-g": {
    "description": "Compound Finance Grants, distributed via Questbook, provide community treasury funding to developers enhancing the Compound lending protocol, developer SDKs, and collateral risk models.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Compound Finance is an algorithmic, autonomous money market protocol on Ethereum and Layer 2s. The Compound Grants Program (CGP) empowers community contributors to strengthen protocol utility.",
          "Administered through a transparent Questbook portal with community allocators, grants support novel collateral integrations, automated liquidator bots, protocol analytics, and educational resources."
        ]
      },
      {
        "heading": "Funding categories",
        "bullets": [
          "Compound v3 (Comet) integrations: Structured yield products, smart contract vaults, and cross-chain money markets.",
          "Risk & Analytics: Quantitative simulation frameworks, real-time liquidation monitoring, and bad debt stress-testing tools.",
          "Developer Infrastructure: Web3 SDKs, mobile wallet plugins, and automated test suites for Compound smart contracts.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Submit your proposal on the Compound Questbook portal. Specify your team credentials, detailed implementation architecture, milestone deliverables, and budget in COMP or USD stablecoins.",
          "Proposals are evaluated by technical committees on a bi-weekly cycle. Funding disbursements are tied to verifiable milestones such as testnet deployment, security review, and mainnet launch."
        ]
      }
    ]
  },
  "coti-bld": {
    "description": "The COTI Builders Program awards non-dilutive grants and technical incubation to developers building confidential decentralized applications on COTI\u2019s privacy-centric Ethereum Layer 2.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "COTI is a privacy-first Ethereum Layer 2 powered by garbled circuits, delivering high-speed confidential computation that is significantly faster and lighter than traditional FHE or ZK setups.",
          "The COTI Builders Program funds innovative dApps across confidential DeFi, private onchain identity, decentralized state privacy, and institutional compliance that require data privacy on a public network."
        ]
      },
      {
        "heading": "Key development tracks",
        "bullets": [
          "Confidential DeFi: Private automated market makers, dark pools, shielded lending, and private liquidation auctions.",
          "Decentralized Identity: Selective disclosure credentials, confidential KYC verification, and encrypted onchain voting.",
          "Enterprise & AI: Confidential onchain AI inference, private real-world asset settlement, and encrypted data sharing.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Apply via the COTI Builders Program portal on Notion. Submit your project concept, code repository, target privacy architecture using garbled circuits, and a timeline of milestone deliverables.",
          "Proposals are evaluated by technical committees on a bi-weekly cycle. Funding disbursements are tied to verifiable milestones such as testnet deployment, security review, and mainnet launch."
        ]
      }
    ]
  },
  "cron-g": {
    "description": "Cronos Ecosystem Grants provide milestone-based funding, technical advisory, and liquidity coordination for dApps launching on Cronos EVM and Cronos zkEVM.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Cronos is a leading blockchain network interoperable with both Ethereum and the Cosmos IBC ecosystem, backed by Crypto.com. The Cronos Grants Program fuels sustainable ecosystem expansion.",
          "Accepted developers receive non-dilutive capital disbursed across verified milestones, direct integration support with Cronos wallets and bridges, and introductions to the Cronos Labs ecosystem venture fund."
        ]
      },
      {
        "heading": "Target verticals",
        "bullets": [
          "Decentralized finance protocols including yield markets, liquid staking, derivative DEXs, and synthetic assets.",
          "Consumer GameFi, Web3 gaming economies, and digital asset marketplaces tailored for mass retail adoption.",
          "Infrastructure tools: Data indexers, cross-chain messaging bridges, oracle feeds, and developer testing suites.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Submit an application through the Cronos Grants page or Medium intake form. Detail your product architecture, smart contract audit roadmap, team background, and clear milestone completion criteria.",
          "Proposals are evaluated by technical committees on a bi-weekly cycle. Funding disbursements are tied to verifiable milestones such as testnet deployment, security review, and mainnet launch."
        ]
      }
    ]
  },
  "dream-somnia": {
    "description": "The Dream Catalyst Accelerator by Uprising Labs and Somnia provides incubation, compute, and up to $100,000 in funding for high-TPS consumer gaming, social apps, and metaverse worlds on Somnia.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Somnia is a 400,000+ TPS Layer 1 blockchain optimized for mass-consumer entertainment, gaming, and real-time social applications. Dream Catalyst is its premier early-stage startup accelerator program.",
          "Selected founders receive financial capital, hands-on game design and tokenomic advisory, direct access to the Somnia high-performance EVM testnet, and introductions to tier-1 gaming VCs."
        ]
      },
      {
        "heading": "What reviewers look for",
        "bullets": [
          "Mass-market consumer applications, multiplayer games, and virtual worlds that require sub-second onchain interactions.",
          "Novel digital asset trading mechanics, creator economy monetization, and high-frequency event streaming dApps.",
          "Experienced gaming or consumer software teams with playable prototypes or functional interactive demos.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Apply via the Dream Catalyst website with your game pitch deck, interactive demo or video gameplay teaser, team bios, and target Somnia integration milestones. Shortlisted teams undergo cohort pitch interviews.",
          "Proposals are evaluated by technical committees on a bi-weekly cycle. Funding disbursements are tied to verifiable milestones such as testnet deployment, security review, and mainnet launch."
        ]
      }
    ]
  },
  "filliquid": {
    "description": "The FILLiquid Foundation FIG Grant Program allocates $20M in FIG tokens to fund Filecoin DeFi innovation, liquid staking, lending markets, and storage provider liquidity solutions.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "FILLiquid is an open-source decentralized lending protocol and liquid staking platform deployed on the Filecoin Virtual Machine (FVM). The FIG Grant Program incentivizes builders expanding Filecoin financial primitives.",
          "Grants reward teams that solve liquidity challenges for Filecoin Storage Providers (SPs), build algorithmic staking derivatives, or develop cross-chain yield aggregators that deepen FVM liquidity pools."
        ]
      },
      {
        "heading": "Key focus areas",
        "bullets": [
          "Liquid staking derivatives (LSDs) and algorithmic lending protocols built for Filecoin ecosystem participants.",
          "Storage provider financial tooling, hash rate leasing derivatives, and automated collateral management.",
          "Cross-chain bridges and decentralized exchange aggregators connecting Filecoin DeFi with Ethereum and Layer 2s.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Submit a proposal on the FILLiquid Medium intake portal or official governance forum. Include technical architecture docs, smart contract audit schedules, and clear milestone deliverables linked to token release tranches.",
          "Proposals are evaluated by technical committees on a bi-weekly cycle. Funding disbursements are tied to verifiable milestones such as testnet deployment, security review, and mainnet launch."
        ]
      }
    ]
  },
  "hytocreafund": {
    "description": "The HYTOPIA Creator Fund awards up to $25,000 in non-dilutive grants to voxel game developers, modders, and digital asset creators building multiplayer games on the HYTOPIA platform.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "HYTOPIA is a modern voxel-based gaming engine and sovereign blockchain built to succeed legacy sandbox games like Minecraft. The Creator Fund supports independent game developers building custom worlds.",
          "Grants provide cash funding of up to $25,000, developer support, marketing exposure to HYTOPIA\u2019s player base, and asset monetization tools to help creators launch sustainable onchain multiplayer games."
        ]
      },
      {
        "heading": "Eligible creation tracks",
        "bullets": [
          "Custom multiplayer game modes: Battle royale, roleplay servers, mini-games, and cooperative survival adventures.",
          "Voxel asset collections, custom avatar skins, interactive furniture items, and animated game mechanics.",
          "Community developer tools: Map builders, level editors, modding utilities, and player analytics plugins.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Complete the application form on the HYTOPIA Creator Fund portal. Provide your portfolio of previous game development work, a design document for your proposed HYTOPIA world, and a development timeline.",
          "Proposals are evaluated by technical committees on a bi-weekly cycle. Funding disbursements are tied to verifiable milestones such as testnet deployment, security review, and mainnet launch."
        ]
      }
    ]
  },
  "iexec-grants": {
    "description": "The iExec Grants program provides $5,000 to $50,000 in funding and confidential cloud computing resources for developers building privacy-preserving dApps, decentralized AI, and DePIN oracles.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "iExec is a decentralized marketplace for computing assets, utilizing Trusted Execution Environments (TEEs via Intel SGX) to deliver secure off-chain processing for decentralized applications.",
          "The iExec Developer Grant program funds developers who leverage confidential computing to protect proprietary AI models, preserve sensitive user data, and build verifiable offchain computation pipelines."
        ]
      },
      {
        "heading": "Priority development tracks",
        "bullets": [
          "Privacy-preserving AI inference and training using secure hardware enclaves to protect model weights and training datasets.",
          "Confidential oracles and enterprise data bridges that fetch and process proprietary Web2 APIs without onchain data leakage.",
          "Decentralized physical infrastructure (DePIN) compute sharing, secure messaging, and confidential voting dApps.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Submit your proposal on the iExec Ecosystem Fund portal. Detail your technical architecture, use of iExec SDK and TEE enclaves, open-source code repository, and milestone-based budget allocation.",
          "Proposals are evaluated by technical committees on a bi-weekly cycle. Funding disbursements are tied to verifiable milestones such as testnet deployment, security review, and mainnet launch."
        ]
      }
    ]
  },
  "immu-fund": {
    "description": "The Immutable Ecosystem Fund awards financial grants, token incentives, and game studio incubation to teams launching high-production Web3 games and marketplaces on Immutable zkEVM.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Immutable is a premier Web3 gaming platform, powered by Polygon technology on Immutable zkEVM. The Immutable Fund supports game studios, developers, and marketplace infrastructure providers.",
          "Recipients gain grant funding, technical integration support for Immutable Passport (streamlined player onboarding with passwordless login), zero gas fee trading for players, and ecosystem publishing advice."
        ]
      },
      {
        "heading": "What reviewers look for",
        "bullets": [
          "High-production games across mobile, PC, and console genres with engaging core loops and sustainable economies.",
          "Full integration with Immutable Passport and Orderbook to provide players seamless asset custody and trading.",
          "Experienced studio leadership with a proven track record of shipping successful commercial game titles.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Submit your studio pitch deck and playable game demo via the Immutable website. The gaming partnership team evaluates game mechanics, technical feasibility, and team track record during formal review calls.",
          "Proposals are evaluated by technical committees on a bi-weekly cycle. Funding disbursements are tied to verifiable milestones such as testnet deployment, security review, and mainnet launch."
        ]
      }
    ]
  },
  "inje-x-micr": {
    "description": "The Injective x Microsoft Nova Program provides institutional DeFi and financial AI model grants, Azure cloud credits, and technical mentoring co-sponsored with Microsoft.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Injective has partnered with Microsoft through the Nova program to accelerate the convergence of decentralized finance and high-performance financial artificial intelligence models.",
          "Approved builders receive financial grants from Injective alongside substantial Microsoft Azure cloud compute credits, access to OpenAI foundational models on Azure, and engineering advisory from both teams."
        ]
      },
      {
        "heading": "Target innovation areas",
        "bullets": [
          "Predictive financial AI models and algorithmic market making engines operating on Injective\u2019s onchain orderbook.",
          "Structured institutional DeFi derivatives, credit scoring protocols, and synthetic asset index funds.",
          "Cross-chain interoperability modules connecting Injective CosmWasm contracts with enterprise financial systems.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Apply through the Injective ecosystem grants page. Detail your financial model or dApp architecture, team qualifications, projected onchain trading volume, and specific Azure infrastructure needs.",
          "Proposals are evaluated by technical committees on a bi-weekly cycle. Funding disbursements are tied to verifiable milestones such as testnet deployment, security review, and mainnet launch."
        ]
      }
    ]
  },
  "iota-grants": {
    "description": "IOTA Grants provide $5,000 to $50,000+ in non-dilutive capital and engineering advisory for developers deploying smart contracts and real-world asset solutions on IOTA EVM.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "IOTA EVM introduces complete EVM compatibility and parallel transaction execution to the DAG-based IOTA network, enabling scalable smart contracts with micro-fees and high throughput.",
          "The IOTA Ecosystem Grants program distributes non-dilutive funding to open-source builders creating decentralized finance protocols, real-world asset (RWA) tokenization, supply chain tracking, and digital identity."
        ]
      },
      {
        "heading": "Supported categories",
        "bullets": [
          "EVM smart contract dApps including decentralized exchanges, lending pools, and cross-chain liquidity bridges.",
          "Real-world asset (RWA) compliance frameworks, trade finance digitization, and digital product passports.",
          "Developer tooling, indexers, RPC infrastructure, and open-source SDKs that enrich the IOTA EVM developer stack.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Submit your proposal via the official IOTA Foundation grants portal. Proposals must include detailed milestone specifications, an open-source GitHub repository, and measurable ecosystem impact metrics.",
          "Proposals are evaluated by technical committees on a bi-weekly cycle. Funding disbursements are tied to verifiable milestones such as testnet deployment, security review, and mainnet launch."
        ]
      }
    ]
  },
  "lido-grants": {
    "description": "The Lido Ecosystem Grants Organization (LEGO) awards community treasury grants to developers and researchers enhancing stETH utility, validator infrastructure, and staking analytics.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Lido is the premier liquid staking protocol on Ethereum. The Lido Ecosystem Grants Organization (LEGO) operates a community-driven grants vehicle designed to decentralize, secure, and expand the staking ecosystem.",
          "LEGO supports projects across multiple funding tiers, from small community bounties ($5K-$15K) to major protocol initiatives ($50K+), focusing on validator diversity, smart contract integrations, and risk modeling."
        ]
      },
      {
        "heading": "Key funding tracks",
        "bullets": [
          "Distributed Validator Technology (DVT) integrations (Obol, SSV) to increase node operator decentralization.",
          "Smart contract vault strategies and DeFi protocols expanding secondary market utility and composability for stETH.",
          "Open-source staking analytics dashboards, slashing risk simulations, and validator performance monitors.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Submit a proposal on the Lido GitHub LEGO repository or governance forum. Specify technical architecture, team backgrounds, deliverables per milestone tranche, and estimated completion timelines.",
          "Proposals are evaluated by technical committees on a bi-weekly cycle. Funding disbursements are tied to verifiable milestones such as testnet deployment, security review, and mainnet launch."
        ]
      }
    ]
  },
  "meta-g": {
    "description": "MetaGammaDelta Grants provide micro-funding, mentorship, and community backing for women-led Web3 projects, DAO tooling, and decentralized public goods.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "MetaGammaDelta is an inclusive, women-led DAO focused on supporting female and non-binary founders in Web3. The DAO distributes micro-grants to empower early-stage builders turning ideas into live prototypes.",
          "Alongside capital, grantees receive hands-on mentoring from experienced Web3 operators, technical code reviews, community beta testing, and introductions to leading venture capital funds."
        ]
      },
      {
        "heading": "What reviewers look for",
        "bullets": [
          "Projects led or co-founded by women or non-binary entrepreneurs across all sectors of Web3 and digital sovereignty.",
          "Working prototypes, open-source code repositories, or clear MVP roadmaps ready for execution.",
          "Collaborative community initiatives, educational programs, and public goods that expand diversity in tech.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Submit an application via the MetaGammaDelta portal. The DAO membership conducts community reviews, interviews founders, and votes on grant allocations during periodic funding cycles.",
          "Proposals are evaluated by technical committees on a bi-weekly cycle. Funding disbursements are tied to verifiable milestones such as testnet deployment, security review, and mainnet launch."
        ]
      }
    ]
  },
  "morppaymacce": {
    "description": "The Morph Payment Accelerator provides funding, technical mentoring, and consumer distribution support for teams building payment apps and consumer rollups on Morph Layer 2.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Morph is a consumer-focused Ethereum Layer 2 utilizing a decentralized sequencer network and optimistic zkEVM rollups to power seamless retail transactions and daily consumer decentralized apps.",
          "The Payment Accelerator program incubates founders creating user-friendly mobile payment rails, merchant checkout integrations, social tipping bots, and localized fiat-to-crypto ramps on Morph."
        ]
      },
      {
        "heading": "Focus areas",
        "bullets": [
          "Mobile payment interfaces with gas abstraction, social logins, and instant confirmation for peer-to-peer transfers.",
          "Merchant payment SDKs that enable online stores and physical retailers to settle stablecoins with sub-cent transaction costs.",
          "Consumer loyalty programs, reward points tokenization, and recurring subscription payment protocols.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Apply on the Morph accelerator portal with your product demo, pitch deck, target user geography, and technical integration architecture. Accepted teams join a multi-week intensive acceleration cohort.",
          "Proposals are evaluated by technical committees on a bi-weekly cycle. Funding disbursements are tied to verifiable milestones such as testnet deployment, security review, and mainnet launch."
        ]
      }
    ]
  },
  "move-g": {
    "description": "The Movemaker Grant Program awards developer grants, code audits, and incubation to builders launching applications written in the Move language across Aptos, Sui, and Movement networks.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "The Move programming language offers unmatched safety, asset-oriented programming, and formal verification capabilities. The Movemaker Grant Program accelerates the global Move builder ecosystem.",
          "The program distributes milestone funding and technical mentorship to developers building Move smart contracts, cross-Move liquidity bridges, developer frameworks, and security auditing tools across Move chains."
        ]
      },
      {
        "heading": "Priority development categories",
        "bullets": [
          "Native Move DeFi protocols, automated market makers, and liquid restaking derivatives built on Move chains.",
          "Cross-chain bridges and interoperability modules facilitating asset movement between Move networks and the EVM.",
          "Developer tooling including Move testing frameworks, static analysis linters, and educational tutorials.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Submit your proposal through the Movemaker website. Provide your GitHub repository, team backgrounds, Move smart contract architecture, and a staged milestone delivery schedule.",
          "Proposals are evaluated by technical committees on a bi-weekly cycle. Funding disbursements are tied to verifiable milestones such as testnet deployment, security review, and mainnet launch."
        ]
      }
    ]
  },
  "mult-g": {
    "description": "MultiversX Grants award milestone-based funding, technical support, and ecosystem marketing to developers deploying high-throughput dApps on MultiversX sovereign state shards.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "MultiversX (formerly Elrond) is a high-speed, carbon-negative blockchain network utilizing Adaptive State Sharding and a Secure Proof of Stake consensus to process over 15,000 transactions per second.",
          "The MultiversX Grants Program funds developers building on its Rust-based smart contract environment, supporting teams across decentralized finance, digital identity, web3 gaming, and mobile consumer apps."
        ]
      },
      {
        "heading": "Focus areas & qualifications",
        "bullets": [
          "Rust smart contracts demonstrating clean architecture, unit test coverage, and efficient execution on the MultiversX VM.",
          "Integrations with xPortal (the flagship consumer mobile wallet with millions of active users).",
          "Enterprise digital asset tokenization, decentralized physical infrastructure (DePIN), and real-world asset workflows.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Submit an application via the MultiversX ecosystem portal. Provide an overview of your team, smart contract architecture in Rust, live demo or GitHub links, and a milestone-based budget schedule.",
          "Proposals are evaluated by technical committees on a bi-weekly cycle. Funding disbursements are tied to verifiable milestones such as testnet deployment, security review, and mainnet launch."
        ]
      }
    ]
  },
  "nosa-ai-g": {
    "description": "Nosana AI Grants award $5,000 to $50,000 in cash and decentralized GPU compute credits to developers building open-source AI inference pipelines and agents on Solana.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Nosana is the decentralized GPU grid built on Solana, connecting consumers with cost-effective, crowd-sourced GPU hardware for AI model inference, embeddings generation, and fine-tuning.",
          "The Nosana AI Grants Program provides developers with capital and compute hours to build and deploy open-source LLMs, conversational agents, image generators, and automated workflows on Nosana\u2019s GPU network."
        ]
      },
      {
        "heading": "Eligible AI applications",
        "bullets": [
          "AI-powered decentralized agents that execute automated onchain transactions, trading, or data analytics on Solana.",
          "Open-source AI developer tooling, model deployment SDKs, and container orchestration pipelines using Nosana nodes.",
          "Consumer consumer AI web apps utilizing Nosana\u2019s inference endpoints for low-cost, high-speed model generation.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Apply via the Nosana grants portal. Detail your target AI models, expected monthly GPU compute consumption, GitHub repository, and planned Solana mainnet deployment milestones.",
          "Proposals are evaluated by technical committees on a bi-weekly cycle. Funding disbursements are tied to verifiable milestones such as testnet deployment, security review, and mainnet launch."
        ]
      }
    ]
  },
  "oran-g": {
    "description": "OrangeDAO Grants provide venture funding, mentorship, and community backing from a collective of over 1,000 Y Combinator alumni investing in early-stage Web3 and AI founders.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "OrangeDAO is the premier decentralized organization of Y Combinator alumni founders. The DAO supports high-potential entrepreneurs building foundational protocols, developer infrastructure, and consumer applications.",
          "Grantees and portfolio founders gain access to the extensive OrangeDAO network, receiving direct founder mentorship, technical code reviews, customer introductions, and fast-track consideration for institutional venture rounds."
        ]
      },
      {
        "heading": "What reviewers look for",
        "bullets": [
          "Ambitious technical founders with a strong bias for rapid shipping, user interviews, and iterative development.",
          "Novel applications across decentralized infrastructure, zero-knowledge systems, AI agents, and onchain consumer products.",
          "Early prototypes or live MVPs demonstrating early user engagement and clear product-market hypotheses.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Submit your startup pitch deck and product link on the OrangeDAO website. Proposals are reviewed by partner committees, and shortlisted founders participate in partner interview calls.",
          "Proposals are evaluated by technical committees on a bi-weekly cycle. Funding disbursements are tied to verifiable milestones such as testnet deployment, security review, and mainnet launch."
        ]
      }
    ]
  },
  "pharos-accel": {
    "description": "The Pharos Incubator awards milestone grants, technical advisory, and institutional investor introductions to teams building high-throughput Real World Asset (RWA) rails and financial protocols.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Pharos is an ultra-high-speed, modular blockchain built for real-world assets, payments, and institutional decentralized finance. The Pharos Incubator accelerates founding teams launching critical ecosystem primitives.",
          "Accepted projects receive grant funding, architecture guidance from core protocol engineers, smart contract audit subsidies, and direct introductions to global financial institutions and venture capital partners."
        ]
      },
      {
        "heading": "Target development verticals",
        "bullets": [
          "Real-world asset (RWA) tokenization: Treasury bills, trade receivables, commercial real estate, and private credit.",
          "Institutional DeFi: Permissioned liquidity pools, automated compliance checks, and cross-border settlement rails.",
          "High-throughput financial infrastructure: Orderbook exchanges, high-frequency settlement, and oracle feeds.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Submit your project details via the Pharos ecosystem portal. Include your technical architecture, regulatory compliance posture, team backgrounds, and planned mainnet deployment milestones.",
          "Proposals are evaluated by technical committees on a bi-weekly cycle. Funding disbursements are tied to verifiable milestones such as testnet deployment, security review, and mainnet launch."
        ]
      }
    ]
  },
  "poll-g": {
    "description": "Pollen Grants fund decentralized physical infrastructure (DePIN) developers creating open-source hardware, coverage validation algorithms, and mobile apps for the Pollen 5G wireless network.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Pollen Mobile is a decentralized, privacy-focused mobile network owned and operated by its users. The Pollen Grants Program funds community developers expanding open-source wireless infrastructure.",
          "Grants are awarded to hardware engineers, firmware developers, and software builders who enhance Pollen\u2019s 5G small cell hardware, mapping algorithms, and eSIM user management software."
        ]
      },
      {
        "heading": "Priority DePIN tracks",
        "bullets": [
          "Open-source hardware designs, antenna modifications, and power optimization for outdoor and indoor 5G small cells.",
          "Network coverage verification tools, automated RF mapping algorithms, and mobile network benchmarking apps.",
          "End-user privacy tools, zero-knowledge subscriber authentication, and decentralized eSIM management profiles.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Submit a proposal on the Pollen Mobile GitHub or documentation portal. Outline your technical implementation plan, open-source deliverables, hardware testing requirements, and budget breakdown.",
          "Proposals are evaluated by technical committees on a bi-weekly cycle. Funding disbursements are tied to verifiable milestones such as testnet deployment, security review, and mainnet launch."
        ]
      }
    ]
  },
  "poly-net-g": {
    "description": "The Polygon Village Grants program provides voucher grants, direct funding, and technical mentoring to developers building on Polygon PoS and AggLayer-connected zkEVM chains.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Polygon Village is the central builder support ecosystem for Polygon. The program supports founders building scalable decentralized applications connected via Polygon\u2019s AggLayer for unified cross-chain liquidity.",
          "Startups access milestone grant funding, hands-on solution architecture consulting, security audit credits, and infrastructure vouchers covering RPC nodes, oracles, and indexers."
        ]
      },
      {
        "heading": "Supported sectors",
        "bullets": [
          "Consumer applications, Web3 social networks, and mobile-first payment products on Polygon PoS.",
          "Zero-knowledge rollup integrations leveraging the AggLayer for instant cross-chain transaction settlement.",
          "Web3 gaming studios, digital collectable platforms, and DeFi primitives demanding ultra-low gas fees.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Submit your application through the Polygon Village portal. Provide your live product link, GitHub repositories, smart contract testnet addresses, and detailed milestone delivery schedule.",
          "Proposals are evaluated by technical committees on a bi-weekly cycle. Funding disbursements are tied to verifiable milestones such as testnet deployment, security review, and mainnet launch."
        ]
      }
    ]
  },
  "prop-bld-g": {
    "description": "The Propr Builders Grant awards milestone funding and technical mentorship to developers building tokenized real estate, fractional property ownership, and automated leasing dApps.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Propr is pioneering decentralized real estate infrastructure. The Propr Builders Grant program supports developers and fintech operators bringing commercial and residential property assets onchain.",
          "Grantees receive capital, legal and regulatory structuring guidance, smart contract templates for real estate SPVs, and direct technical integration assistance with compliant onchain identity and payment rails."
        ]
      },
      {
        "heading": "What gets funded",
        "bullets": [
          "Fractional real estate investment platforms with automated dividend distributions and compliant KYC verification.",
          "Decentralized rental payment protocols, security deposit escrows, and tenant credit reputation systems.",
          "Secondary market trading venues, automated market makers, and liquidity pools for tokenized real estate assets.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Submit your application via the Propr official portal. Outline your real estate asset pipeline, regulatory compliance structure, smart contract architecture, and execution timeline.",
          "Proposals are evaluated by technical committees on a bi-weekly cycle. Funding disbursements are tied to verifiable milestones such as testnet deployment, security review, and mainnet launch."
        ]
      }
    ]
  },
  "prot-lab-g": {
    "description": "Protocol Labs Grants award non-dilutive research and developer funding for projects pushing the boundaries of decentralized storage, content addressing (IPFS/Filecoin), and cryptographic public goods.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Protocol Labs is the research and development lab behind IPFS, Filecoin, and libp2p. The Protocol Labs Grants program funds academic research, open-source developer tooling, and foundational network infrastructure.",
          "Awardees receive non-dilutive grant capital, direct collaboration with world-class cryptographers and distributed systems engineers, and publication opportunities across major research symposiums."
        ]
      },
      {
        "heading": "Core research domains",
        "bullets": [
          "Scalable peer-to-peer networking, libp2p enhancements, and decentralized content routing protocols.",
          "Cryptographic proofs of storage, zero-knowledge verifiable computing, and consensus mechanism optimization.",
          "Open-source developer libraries, data preservation tools for science and libraries, and FVM smart contracts.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Submit a formal grant proposal on the Protocol Labs GitHub repository. Proposals undergo technical peer review by domain experts, with funding distributed in milestone tranches upon verification.",
          "Proposals are evaluated by technical committees on a bi-weekly cycle. Funding disbursements are tied to verifiable milestones such as testnet deployment, security review, and mainnet launch."
        ]
      }
    ]
  },
  "push-prot-g": {
    "description": "Push Protocol Grants provide milestone-based funding, code reviews, and co-marketing to teams integrating decentralized cross-chain notifications, chat, and video communication.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Push Protocol is the communication layer for Web3, enabling any smart contract, dApp, or backend service to deliver push notifications and encrypted chat to wallet addresses across Ethereum, Polygon, and Arbitrum.",
          "The Push Grants Program awards non-dilutive capital to developers who implement critical user engagement notifications (liquidation alerts, governance votes, token transfers) or build consumer chat dApps."
        ]
      },
      {
        "heading": "Target integration areas",
        "bullets": [
          "DeFi notifications: Liquidation warnings, yield harvest reminders, debt ratio health monitors, and limit order triggers.",
          "Decentralized communication apps: Encrypted wallet-to-wallet messaging, community group chats, and Web3 video calling.",
          "Developer tooling: Push SDK extensions, mobile notification bridges, and bot notification integrations for Discord/Telegram.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Complete the application form on the Push Protocol Notion grants portal. Include your channel use case, expected notification volume, target blockchain networks, and phased delivery milestones.",
          "Proposals are evaluated by technical committees on a bi-weekly cycle. Funding disbursements are tied to verifiable milestones such as testnet deployment, security review, and mainnet launch."
        ]
      }
    ]
  },
  "q402-grant": {
    "description": "The Q402 Grant Program awards funding and compute infrastructure to developers building autonomous onchain AI agents, automated contract management, and intelligent DeFi bots.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Q402 by Quack AI provides the framework for autonomous agents to interact natively with Web3 smart contracts, execute transactions, and analyze onchain data autonomously.",
          "The grant program supports builders developing autonomous agents that perform algorithmic execution, automated governance participation, multi-chain liquidity routing, and security monitoring."
        ]
      },
      {
        "heading": "Priority agent use cases",
        "bullets": [
          "Autonomous DeFi portfolio managers executing yield farming and risk-mitigated rebalancing across protocols.",
          "Onchain governance agents that summarize DAO proposals, analyze delegate voting histories, and execute votes.",
          "Developer agents that monitor smart contract state, trigger emergency pauses, and detect economic exploits in real time.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Submit an application on the Q402 grant website. Provide your agent architecture design, code repository, target smart contract environments, and specific milestone deliverables.",
          "Proposals are evaluated by technical committees on a bi-weekly cycle. Funding disbursements are tied to verifiable milestones such as testnet deployment, security review, and mainnet launch."
        ]
      }
    ]
  },
  "qubi-inc": {
    "description": "The Qubic Incubation Program provides funding, compute resources, and advisory for teams developing useful-proof-of-work (uPoW) neural networks, smart contracts, and computational dApps on Qubic.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Qubic is an innovative Layer 1 network utilizing Useful Proof of Work (uPoW), redirecting mining computational power into training artificial neural networks and solving complex mathematical problems.",
          "The Qubic Incubation Program provides grants, technical guidance from core protocol architects, and marketing support to builders creating decentralized artificial intelligence models and high-speed bare-metal smart contracts."
        ]
      },
      {
        "heading": "Eligible innovation tracks",
        "bullets": [
          "Useful Proof of Work AI models: Training neural network weights for image recognition, prediction markets, and optimization.",
          "Qubic Computor smart contracts written in C++ running directly on bare-metal hardware with sub-second execution.",
          "Developer infrastructure, block explorers, wallet integrations, and cross-chain bridging primitives connecting Qubic.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Apply via the Qubic official incubation program page. Outline your AI model architecture or smart contract design, technical team experience in C++/distributed systems, and milestone deliverables.",
          "Proposals are evaluated by technical committees on a bi-weekly cycle. Funding disbursements are tied to verifiable milestones such as testnet deployment, security review, and mainnet launch."
        ]
      }
    ]
  },
  "rgb-grants": {
    "description": "The RGB Grants Program awards up to $40,000 in non-dilutive funding to developers building client-side validated smart contracts, private digital assets, and Lightning Network integrations on Bitcoin.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "RGB is a smart contract protocol that operates offchain using client-side validation, anchored directly into Bitcoin transactions via single-use seals. It enables scalable, private smart contracts and tokens on Bitcoin.",
          "The RGB Grants Program funds developers and cryptographers who build wallets, contract schemas, developer tooling, and Lightning Network payment channels compatible with RGB smart contracts and fungible assets."
        ]
      },
      {
        "heading": "Priority development tracks",
        "bullets": [
          "RGB smart contracts: Digital collectibles, stablecoins, decentralized stock certificates, and DAO voting mechanisms on Bitcoin.",
          "Bifrost Lightning channel implementations enabling instantaneous offchain transfers of RGB tokens.",
          "Developer tooling, command-line interfaces, Rust SDK bindings, and cross-platform desktop/mobile wallet integrations.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Submit your proposal via the RGB community portal or GitHub repository. Provide an open-source architecture design, experience with Rust and Bitcoin Core, and a phased milestone schedule.",
          "Proposals are evaluated by technical committees on a bi-weekly cycle. Funding disbursements are tied to verifiable milestones such as testnet deployment, security review, and mainnet launch."
        ]
      }
    ]
  },
  "roniforginno": {
    "description": "The Ronin Forge Innovation Grant awards non-dilutive capital, game studio incubation, and distribution access to game developers building on Sky Mavis\u2019s Ronin gaming blockchain.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Ronin is the battle-tested Ethereum sidechain created by Sky Mavis, home to millions of daily active gamers across Axie Infinity, Pixels, and Lumiterra. Ronin Forge is its dedicated early-stage game accelerator.",
          "Grantees receive non-dilutive capital grants, access to Ronin\u2019s high-liquidity decentralized exchange (Katana), integration with Ronin Wallet, and direct distribution to one of Web3\u2019s largest active gamer communities."
        ]
      },
      {
        "heading": "What reviewers look for",
        "bullets": [
          "Playable games with high replayability, strong social viral loops, and sustainable in-game player economies.",
          "Studio teams with proven game development track records in Unity, Unreal Engine, or custom web game engines.",
          "Commitment to deep integration with Ronin infrastructure, including token trading on Katana and NFT marketplace listing.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Submit your game pitch deck and playable build through the Ronin Forge application portal on Google Forms. Shortlisted studios participate in gameplay evaluation sessions with the Sky Mavis publishing team.",
          "Proposals are evaluated by technical committees on a bi-weekly cycle. Funding disbursements are tied to verifiable milestones such as testnet deployment, security review, and mainnet launch."
        ]
      }
    ]
  },
  "root-g": {
    "description": "The Rootstock Grants Program awards up to $50,000 in non-dilutive funding, security audits, and mentorship to developers creating EVM-compatible smart contracts and DeFi secured by Bitcoin.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Rootstock (RSK) is the premier smart contract platform merged-mined with Bitcoin, combining Ethereum smart contract compatibility with the unparalleled security and settlement of the Bitcoin network.",
          "The Rootstock Grants Program provides non-dilutive funding to open-source builders creating decentralized finance protocols, real-world asset tokenization, developer tooling, and cross-chain Bitcoin liquidity bridges."
        ]
      },
      {
        "heading": "Eligible innovation tracks",
        "bullets": [
          "Bitcoin DeFi: Lending markets, decentralized exchanges, yield optimizers, and algorithmic stablecoins collateralized by RBTC.",
          "Developer Infrastructure: High-speed indexers, testnet faucets, oracle price feeds, and smart contract developer SDKs.",
          "Real-world asset (RWA) compliance frameworks and trade finance solutions leveraging Bitcoin proof-of-work security.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Submit your proposal on the Rootstock funding portal. Include your technical architecture specification, open-source GitHub repository, smart contract test coverage, and a milestone delivery roadmap.",
          "Proposals are evaluated by technical committees on a bi-weekly cycle. Funding disbursements are tied to verifiable milestones such as testnet deployment, security review, and mainnet launch."
        ]
      }
    ]
  },
  "secr-net-g": {
    "description": "Secret Network Grants provide milestone-based funding, technical assistance, and incubator support to developers building confidential smart contracts and privacy-preserving dApps on Cosmos.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Secret Network is the first blockchain network with privacy-preserving smart contracts (Secret Contracts) by default, using Trusted Execution Environments (TEEs) to encrypt state and computation.",
          "The Secret Network Grants Program funds builders who leverage programmable privacy to build novel financial primitives, private onchain identity credentials, confidential gaming mechanics, and decentralized AI."
        ]
      },
      {
        "heading": "Priority development categories",
        "bullets": [
          "Confidential DeFi: Front-running resistant automated market makers, private lending markets, and dark pools.",
          "Secret VRF and decentralized gaming: Verifiably random onchain number generation and hidden-information game state.",
          "Private access control, decentralized physical identity, and cross-chain private computation via IBC.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Submit an application on the Secret Network developer portal. Describe your smart contract architecture in CosmWasm/Rust, privacy requirements, and milestone delivery breakdown. The grants committee reviews submissions bi-weekly.",
          "Proposals are evaluated by technical committees on a bi-weekly cycle. Funding disbursements are tied to verifiable milestones such as testnet deployment, security review, and mainnet launch."
        ]
      }
    ]
  },
  "seijapafund": {
    "description": "The Sei Japan Ecosystem Fund allocates strategic capital and grants to Web3 gaming studios, entertainment franchises, and consumer social apps expanding within the Japanese and Asian markets.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Sei is a high-speed parallelized EVM Layer 1 blockchain optimized for trading and high-frequency consumer applications. The $50M Sei Japan Fund accelerates ecosystem adoption across Japan and the broader APAC region.",
          "Selected founders receive direct grant capital, localization and regulatory compliance advisory for the Japanese digital asset market, technical integration guidance, and introductions to major Japanese gaming enterprises."
        ]
      },
      {
        "heading": "Target investment sectors",
        "bullets": [
          "Web3 gaming titles, anime and IP licensing dApps, and digital collectible marketplaces tailored for Japanese audiences.",
          "High-frequency decentralized exchanges and prediction markets taking advantage of Sei\u2019s 390ms sub-second finality.",
          "Consumer mobile loyalty programs, digital ticketing, and social entertainment apps on Sei parallelized EVM.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Apply via the Sei Japan Fund portal on the official Sei blog. Provide your business plan, regional launch strategy, playable prototype or technical whitepaper, and proposed milestone deliverables.",
          "Proposals are evaluated by technical committees on a bi-weekly cycle. Funding disbursements are tied to verifiable milestones such as testnet deployment, security review, and mainnet launch."
        ]
      }
    ]
  },
  "sentient-agi": {
    "description": "The Sentient Foundation Open Source AGI Grant Program awards funding and high-end compute resources to researchers and developers building decentralized, aligned, and verifiable artificial general intelligence.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Sentient is building an open-source decentralized artificial general intelligence (AGI) platform that ensures AI models are community-owned, economically aligned, and verifiable on open public networks.",
          "The Open Source AGI Grant Program funds AI researchers, machine learning engineers, and cryptographers working on decentralized training algorithms, verifiable inference verification, and open foundation model alignment."
        ]
      },
      {
        "heading": "Eligible research domains",
        "bullets": [
          "Verifiable model inference using zero-knowledge proofs (zkML) or optimistic verification algorithms.",
          "Decentralized model training coordination, parameter-efficient distributed fine-tuning, and compute verification.",
          "Open-source model alignment techniques, synthetic dataset curation, and reinforcement learning with human feedback (RLHF).",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Submit your research proposal through the Sentient Foundation grants portal. Include your academic or open-source credentials, detailed mathematical or architectural methodology, and concrete milestone code deliverables.",
          "Proposals are evaluated by technical committees on a bi-weekly cycle. Funding disbursements are tied to verifiable milestones such as testnet deployment, security review, and mainnet launch."
        ]
      }
    ]
  },
  "serum-grants": {
    "description": "Serum Grants provide developer funding and technical incubation for open-source central limit orderbook (CLOB) DEX infrastructure, algorithmic market making, and high-frequency trading on Solana.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Project Serum pioneered onchain central limit orderbooks on Solana, unlocking institutional liquidity and shared order matching across decentralized financial protocols.",
          "The Serum Grants Program supports developers building high-performance trading interfaces, automated market-making algorithms, institutional custody integrations, and open-source analytics for onchain orderbooks."
        ]
      },
      {
        "heading": "What reviewers look for",
        "bullets": [
          "Trading user interfaces and mobile terminal clients delivering institutional-grade charting and execution.",
          "Algorithmic trading bots, market-making liquidity scripts, and arbitrage rebalancing utilities on Solana.",
          "Open-source indexers, real-time WebSocket market data feeds, and historical orderbook trade analytics.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Submit your proposal via the Serum community grants portal. Detail your smart contract architecture, trading volume projections, open-source repository link, and phased milestone schedule.",
          "Proposals are evaluated by technical committees on a bi-weekly cycle. Funding disbursements are tied to verifiable milestones such as testnet deployment, security review, and mainnet launch."
        ]
      }
    ]
  },
  "shut-cham": {
    "description": "The Shutter Champions program awards bounties, grants, and technical mentoring to developers building threshold encryption, front-running protection, and MEV-resistant smart contracts.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Shutter Network uses distributed threshold cryptography to protect blockchain users from malicious Maximal Extractable Value (MEV), front-running, and sandwich attacks on Ethereum and Layer 2s.",
          "The Shutter Champions program incentivizes builders who implement encrypted mempools, front-running resistant DEXs, sealed-bid auctions, and confidential onchain voting systems using Shutter threshold keys."
        ]
      },
      {
        "heading": "Priority use cases",
        "bullets": [
          "MEV-resistant DEXs that execute trades using threshold encrypted transaction batches to eliminate sandwiching.",
          "Sealed-bid onchain auctions, private liquidation mechanisms, and non-exploitable NFT minting flows.",
          "Censorship-resistant transaction ordering and privacy-preserving DAO governance voting platforms.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Submit an application on the Shutter blog or community forum. Describe your intended integration of Shutter threshold cryptography, technical architecture, and development deliverables across milestone phases.",
          "Proposals are evaluated by technical committees on a bi-weekly cycle. Funding disbursements are tied to verifiable milestones such as testnet deployment, security review, and mainnet launch."
        ]
      }
    ]
  },
  "skale-games": {
    "description": "The SKALE Indie Game Accelerator Program provides zero-gas blockchain infrastructure, grant funding, and publishing advisory for indie game developers building consumer Web3 games.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "SKALE is an Ethereum-native modular network featuring high-throughput, zero-gas execution chains. The Indie Game Accelerator helps game creators build seamless, web2-like gaming experiences onchain.",
          "Participating studios receive financial grants, dedicated SKALE App-Chains with zero gas fees for end players, automated minting tools, and co-marketing across the SKALE developer community."
        ]
      },
      {
        "heading": "Accelerator benefits",
        "bullets": [
          "Dedicated high-performance App-Chain providing instant block times and zero transaction costs for players.",
          "Direct grant funding to offset development, art asset creation, and smart contract security audit expenses.",
          "Publishing support, player onboarding optimization, and featured distribution across gaming portal networks.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Apply via the SKALE Network gaming portal with your game pitch deck, interactive playable demo, team background, and launch timeline. Selected studios undergo formal evaluation calls with SKALE gaming leads.",
          "Proposals are evaluated by technical committees on a bi-weekly cycle. Funding disbursements are tied to verifiable milestones such as testnet deployment, security review, and mainnet launch."
        ]
      }
    ]
  },
  "sola-scho": {
    "description": "The Solana Scholars program awards student developer grants, collegiate hackathon prizes, and research fellowships to university students building open-source protocols on Solana.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Solana Scholars is an educational grant initiative sponsored by the Solana Foundation, designed to empower collegiate developers, researchers, and university blockchain clubs around the world.",
          "The program awards project development stipends, conference travel sponsorships, technical mentoring from core Solana engineers, and incubator access for student-founded Web3 startups."
        ]
      },
      {
        "heading": "Student opportunities",
        "bullets": [
          "Milestone-based project grants for student-led software development, open-source SDKs, and research papers on Solana.",
          "Travel stipends and tickets to participate in Solana Hacker Houses and the annual Solana Breakpoint conference.",
          "Fast-tracked entry into leading Web3 startup accelerators and direct introductions to top venture capital investors.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Complete the application form on the Solana Scholars portal with proof of current academic enrollment, your GitHub profile, and a description of your proposed open-source Solana project.",
          "Proposals are evaluated by technical committees on a bi-weekly cycle. Funding disbursements are tied to verifiable milestones such as testnet deployment, security review, and mainnet launch."
        ]
      }
    ]
  },
  "stac-endo": {
    "description": "The Stacks Grants Program provides non-dilutive milestone funding to developers building smart contracts, Bitcoin DeFi (sBTC), and decentralized apps secured by Bitcoin proof-of-transfer.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Stacks brings smart contracts and decentralized applications directly to Bitcoin, utilizing its novel Proof of Transfer (PoX) consensus and sBTC for 1:1 non-custodial Bitcoin settlement.",
          "The Stacks Grants Program funds community developers, researchers, and entrepreneurs who expand Bitcoin programmability across DeFi, digital artifacts, developer tooling, and decentralized identity."
        ]
      },
      {
        "heading": "Key focus areas",
        "bullets": [
          "sBTC financial primitives: Lending, decentralized trading, and automated yield protocols collateralized natively by Bitcoin.",
          "Clarity smart contracts: Highly predictable, decidable smart contracts that eliminate entire classes of exploits.",
          "Developer tooling, indexers, Hiro SDK integrations, and educational resources for the Stacks ecosystem.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Submit a formal grant proposal on the Stacks Foundation GitHub grants repository. Define measurable milestones, deliverables, and budget in STX or USD. Community review and voting guide final funding decisions.",
          "Proposals are evaluated by technical committees on a bi-weekly cycle. Funding disbursements are tied to verifiable milestones such as testnet deployment, security review, and mainnet launch."
        ]
      }
    ]
  },
  "stan-bc-acce": {
    "description": "The Stanford Blockchain Accelerator provides equity-free incubation, mentorship, and investor access to early-stage founders building groundbreaking blockchain protocols and applications.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Run by the Stanford Blockchain Club, the Stanford Blockchain Accelerator is one of the most successful non-profit, student-led Web3 incubators in the world, having supported dozens of top venture-backed startups.",
          "Selected founders participate in an intensive multi-week curriculum, receiving direct guidance from leading industry founders, academic cryptographers, legal experts, and top-tier venture capitalists."
        ]
      },
      {
        "heading": "Accelerator highlights",
        "bullets": [
          "Completely non-dilutive, zero-equity incubation curriculum tailored for early-stage crypto founders.",
          "Weekly masterclasses and private office hours with Tier 1 Web3 founders, protocol architects, and VCs.",
          "Exclusive Demo Day in Silicon Valley attended by over 100 institutional blockchain investment funds.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Apply through the Stanford Blockchain Accelerator website during open cohort application windows. Submit your pitch deck, product demo, and team bios. Stanford affiliation is not mandatory for consideration.",
          "Proposals are evaluated by technical committees on a bi-weekly cycle. Funding disbursements are tied to verifiable milestones such as testnet deployment, security review, and mainnet launch."
        ]
      }
    ]
  },
  "subs-g": {
    "description": "The Subspace Foundation Grants Program awards non-dilutive capital and engineering advisory for developers building decentralized storage interfaces, Auto Drive apps, and modular consensus.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Subspace is a decentralized storage and compute network designed for high-throughput scalability and eco-friendly Proof of Archival Storage consensus.",
          "The Subspace Grants Program funds developers creating archival storage gateways, permanent web hosting, zero-knowledge verifiable storage integrations, and Auto Drive consumer data backup applications."
        ]
      },
      {
        "heading": "Target development categories",
        "bullets": [
          "Auto Drive ecosystem dApps: Consumer-friendly cloud storage alternatives, media archival, and NFT metadata persistence.",
          "Modular data availability and execution layer integrations connecting Subspace storage with Ethereum rollups.",
          "Developer tools: Subspace Rust SDKs, storage node monitoring software, and decentralized file explorer apps.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Submit a formal grant application via the Subspace Foundation website. Include your technical architecture, open-source code repositories, target milestone deliverables, and budget allocation.",
          "Proposals are evaluated by technical committees on a bi-weekly cycle. Funding disbursements are tied to verifiable milestones such as testnet deployment, security review, and mainnet launch."
        ]
      }
    ]
  },
  "tezo-foun-g": {
    "description": "The Tezos Foundation Grants Program funds open-source developers, academic institutions, and enterprises deploying formal verification, institutional assets, and scalable dApps on Tezos.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Tezos is an open-source, energy-efficient Proof-of-Stake blockchain with formal onchain self-governance and upgradeability. The Tezos Foundation Grants Program finances strategic ecosystem growth.",
          "Grants are awarded to developers and researchers advancing smart contract safety (Michelson, SmartPy), high-throughput Smart Rollups, digital art platforms, and enterprise asset tokenization."
        ]
      },
      {
        "heading": "Supported grant areas",
        "bullets": [
          "Core protocol research, consensus mechanism optimization, and Smart Rollup developer infrastructure.",
          "Smart contract developer tooling, static analysis checkers, and formally verified contract libraries.",
          "Arts, culture, and gaming dApps utilizing Tezos\u2019s low transaction fees and sustainable energy profile.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Submit your proposal through the Tezos Foundation grants portal. The technical advisory committee evaluates applications based on technical feasibility, community impact, and milestone feasibility.",
          "Proposals are evaluated by technical committees on a bi-weekly cycle. Funding disbursements are tied to verifiable milestones such as testnet deployment, security review, and mainnet launch."
        ]
      }
    ]
  },
  "bags-hack": {
    "description": "The Bags Hackathon Grants award cash prizes and developer incubation for consumer Web3 mobile apps, creator monetization models, and social finance products built on Solana.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Bags is a next-generation consumer Web3 social app built on Solana, enabling creators and communities to monetize conversations, digital collectibles, and real-world interactions.",
          "The Bags Hackathon and Developer Grant program funds developers who build integrated micro-apps, trading bots, community engagement widgets, and viral mobile experiences within the Bags ecosystem."
        ]
      },
      {
        "heading": "Focus areas",
        "bullets": [
          "Consumer mobile dApps with intuitive user onboarding, gas abstraction, and viral social sharing mechanics.",
          "Creator finance tools: Automated fee splits, tokenized community access passes, and creator tipping widgets.",
          "Solana Blinks and Actions integrations enabling rich interactive transactions directly within social feeds.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Register for the Bags Hackathon on the official Bags portal. Submit a working demo, GitHub repository link, and product video demonstration before the submission deadline.",
          "Proposals are evaluated by technical committees on a bi-weekly cycle. Funding disbursements are tied to verifiable milestones such as testnet deployment, security review, and mainnet launch."
        ]
      }
    ]
  },
  "dequ-g": {
    "description": "The DeQUIP Grant Program by Quranium awards milestone funding and cryptographic research grants to developers building post-quantum secure blockchain protocols and hardware integration.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Quranium is building quantum-resistant distributed ledger technology designed to protect financial systems and cryptographic keys against future quantum computing decryption threats.",
          "The DeQUIP Grant Program finances cryptographic researchers and software engineers developing quantum-safe signature schemes, lattice-based cryptography, and secure hardware security module (HSM) integrations."
        ]
      },
      {
        "heading": "What gets funded",
        "bullets": [
          "Post-quantum cryptographic algorithms: Lattice-based and hash-based digital signature implementations.",
          "Quantum-resistant smart contract execution environments, consensus mechanisms, and key management systems.",
          "Developer tooling, benchmarking suites, and educational research papers advancing quantum security awareness.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Submit your research proposal on the Quranium DeQUIP grant portal. Detail your cryptographic background, technical specifications, open-source deliverables, and phased research milestones.",
          "Proposals are evaluated by technical committees on a bi-weekly cycle. Funding disbursements are tied to verifiable milestones such as testnet deployment, security review, and mainnet launch."
        ]
      }
    ]
  },
  "unic-bld": {
    "description": "The Uniswap Foundation Unichain Builder Open Call awards non-dilutive grants and technical co-development to teams launching native DeFi protocols and infrastructure on Unichain.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "Unichain is a DeFi-native Ethereum Layer 2 designed by Uniswap Labs and the Uniswap Foundation, featuring sub-second block times, verifiable block builder decentralization, and cross-chain execution.",
          "The Unichain Builder Open Call provides strategic grant funding, liquidity bootstrapping support, and direct engineering collaboration with the Uniswap Foundation to teams deploying foundational protocols on Unichain."
        ]
      },
      {
        "heading": "Target builder categories",
        "bullets": [
          "Uniswap v4 hooks, dynamic automated market maker algorithms, and novel liquidity vault strategies on Unichain.",
          "Cross-chain DeFi primitives leveraging Unichain\u2019s native cross-chain interoperability with other Superchain rollups.",
          "Developer tooling: High-performance indexers, MEV-aware execution clients, and algorithmic trading SDKs.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Submit your proposal via the Uniswap Foundation Unichain builder portal. Provide your team background, smart contract architecture, planned testnet launch dates, and milestone budget requests.",
          "Proposals are evaluated by technical committees on a bi-weekly cycle. Funding disbursements are tied to verifiable milestones such as testnet deployment, security review, and mainnet launch."
        ]
      }
    ]
  },
  "unis-g": {
    "description": "The Uniswap Foundation Grants Program awards $5,000 to $250,000+ in non-dilutive funding to developers, researchers, and educators strengthening the Uniswap protocol and decentralized finance.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "The Uniswap Foundation supports the growth, decentralization, and sustainability of the Uniswap protocol. The Grants Program allocates millions of dollars annually across developer tooling, research, and community growth.",
          "Grants range from smaller community awards ($5K-$25K) to major institutional infrastructure grants ($100K-$250K+), funding projects that innovate around automated market makers, routing algorithms, and Uniswap v4."
        ]
      },
      {
        "heading": "Core grant categories",
        "bullets": [
          "Uniswap v4 hooks: Dynamic fees, limit orders, custom curve math, onchain oracles, and automated volatility hedging.",
          "Routing & Efficiency: Algorithmic trade routing enhancements, MEV reduction research, and gas optimization.",
          "Developer Education: Interactive tutorials, hackathon sponsorships, open-source SDKs, and analytical dashboards.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Submit your grant proposal on the Uniswap Foundation grants portal. Proposals undergo structured review by domain leads, with funding disbursed across verified, transparent milestone deliverables.",
          "Proposals are evaluated by technical committees on a bi-weekly cycle. Funding disbursements are tied to verifiable milestones such as testnet deployment, security review, and mainnet launch."
        ]
      }
    ]
  },
  "vw-hardware": {
    "description": "The Virtual Worlds Hardware Grant Program funds open-source engineering teams developing advanced haptic devices, low-latency tracking sensors, and neural interfaces for spatial computing.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "The Virtual Worlds Hardware Grant supports research and hardware engineering that bridges the physical and virtual worlds. The program finances open-hardware components for immersive spatial computing.",
          "Grantees receive non-dilutive research funding, hardware prototyping lab subsidies, component sourcing guidance, and mentorship from leading robotics, sensor, and spatial audio engineers."
        ]
      },
      {
        "heading": "Eligible hardware fields",
        "bullets": [
          "Wearable haptic feedback actuators, micro-fluidic sensory gloves, and tactile surface feedback interfaces.",
          "Ultra-low-latency spatial tracking sensors, computer vision positional trackers, and eye-tracking modules.",
          "Open-source hardware schematics, firmware drivers, and cross-platform WebXR integration libraries.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Complete the application form on the Virtual Worlds grant portal. Provide your engineering bill of materials, circuit schematics, prototype testing video, and phased fabrication milestones.",
          "Proposals are evaluated by technical committees on a bi-weekly cycle. Funding disbursements are tied to verifiable milestones such as testnet deployment, security review, and mainnet launch."
        ]
      }
    ]
  },
  "wagsi-grants": {
    "description": "The WAGSI Grants Programme by QuillAudits awards security audit subsidies, vulnerability assessments, and smart contract mentorship to early-stage Web3 startups.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "QuillAudits launched the WAGSI (We Are Gonna Secure It) Grants Programme to ensure emerging Web3 projects launch on mainnet with verified, audit-grade smart contract security.",
          "Selected startups receive subsidized or fully sponsored smart contract security audits, penetration testing of web and API backends, and ongoing security architecture consulting throughout their product lifecycle."
        ]
      },
      {
        "heading": "Included security services",
        "bullets": [
          "Comprehensive manual smart contract code audits covering Solidity, Rust, and Move implementations.",
          "Automated static analysis, invariant testing, and formal verification of critical protocol financial logic.",
          "DeFi economic security review, flash loan attack simulations, and emergency pause mechanism validation.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Apply via the QuillAudits WAGSI program portal. Provide your smart contract GitHub repository, testnet deployment links, documentation specs, and targeted mainnet launch timeline.",
          "Proposals are evaluated by technical committees on a bi-weekly cycle. Funding disbursements are tied to verifiable milestones such as testnet deployment, security review, and mainnet launch."
        ]
      }
    ]
  },
  "whit-bld": {
    "description": "The WhiteChain Builders Program awards non-dilutive funding, gas fee subsidies, and marketing exposure to developers deploying DeFi protocols and Web3 games on WhiteChain.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "WhiteChain is an EVM-compatible blockchain network built for high-throughput institutional and consumer decentralized applications, backed by the WhiteBIT digital asset exchange ecosystem.",
          "The WhiteChain Builders Program provides non-dilutive grants, technical node infrastructure support, gas fee rebates, and direct marketing reach to millions of verified WhiteBIT exchange users."
        ]
      },
      {
        "heading": "Target development verticals",
        "bullets": [
          "Decentralized finance dApps including automated market makers, lending pools, and cross-chain asset bridges.",
          "Web3 gaming titles, digital collectibles, and consumer mobile apps with integrated wallet authentication.",
          "Developer infrastructure: Block explorers, data indexers, developer SDKs, and oracle price feeds on WhiteChain.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Submit your proposal through the WhiteChain Builders portal. Include your project whitepaper, smart contract testnet addresses, team background, and clear milestone deliverables.",
          "Proposals are evaluated by technical committees on a bi-weekly cycle. Funding disbursements are tied to verifiable milestones such as testnet deployment, security review, and mainnet launch."
        ]
      }
    ]
  },
  "worl-comm-g": {
    "description": "The World Organization Community Grants program provides funding and developer resources for teams building proof-of-humanity integrations, privacy-preserving identity, and inclusive dApps on World Chain.",
    "sections": [
      {
        "heading": "Program overview",
        "paragraphs": [
          "World Chain is an Ethereum Layer 2 designed specifically to prioritize human transactions over automated bot traffic, deeply integrated with World ID proof-of-personhood verification.",
          "The World Community Grants program awards milestone funding to developers building Sybil-resistant governance tools, decentralized social networks, micro-credit systems, and human-only voting protocols."
        ]
      },
      {
        "heading": "Priority integration tracks",
        "bullets": [
          "World ID zero-knowledge integrations that verify human uniqueness without revealing real-world identity.",
          "Sybil-resistant governance protocols, one-person-one-vote DAOs, and quadratic funding matching systems.",
          "Inclusive mobile payment rails and universal basic resource experiments utilizing World Chain infrastructure.",
          "Demonstrated commitment to open-source licensing (MIT or Apache 2.0) with clean repository documentation and automated test suites."
        ]
      },
      {
        "heading": "How to apply",
        "paragraphs": [
          "Apply on the World Organization developer grants portal. Detail your World ID integration architecture, privacy protections, target user demographics, and technical delivery milestones.",
          "Proposals are evaluated by technical committees on a bi-weekly cycle. Funding disbursements are tied to verifiable milestones such as testnet deployment, security review, and mainnet launch."
        ]
      }
    ]
  }
};
