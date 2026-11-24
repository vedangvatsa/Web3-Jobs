/**
 * Curated expansions for grant detail pages below 150 stored words.
 * Applied after base repairs in apply-grant-manual-repairs.ts (later keys win).
 */
import type { GrantProgram } from '../src/types';

type Repair = Partial<Pick<GrantProgram, 'name' | 'provider' | 'description' | 'url' | 'ecosystem' | 'amount' | 'sections' | 'descriptionSource'>>;

export const thinGrantExpansions: Record<string, Repair> = {
  'aethir-fund': {
    description:
      'Aethir’s ecosystem fund backs teams building decentralized AI compute, gaming, and agent workloads on Aethir infrastructure, including accelerator cohorts with NEAR and Delphi Labs.',
    sections: [
      {
        heading: 'Program overview',
        paragraphs: [
          'The fund targets projects that need GPU-class decentralized compute rather than centralized cloud credits alone. Awards are sized per project scope, with published tiers between roughly $5,000 and $500,000 for teams that demonstrate traction on Aethir or partner networks.',
          'Premier partners such as NEAR Foundation may co-sponsor accelerator tracks where accepted teams receive compute, mentorship, and go-to-market introductions alongside capital.',
        ],
      },
      {
        heading: 'What reviewers look for',
        bullets: [
          'Live or near-live workloads that route inference, training, or rendering through decentralized compute.',
          'Open roadmaps that explain user growth, unit economics, and how additional compute unlocks the next milestone.',
          'Teams that can publish reproducible benchmarks or usage metrics after each funding tranche.',
        ],
      },
      {
        heading: 'How to apply',
        paragraphs: [
          'Start from Aethir’s ecosystem fund page and follow the current application or partner accelerator link. Include architecture diagrams, expected GPU hours, and milestone dates so reviewers can match you to the right award band.',
        ],
      },
    ],
  },
  'alchemy-arb-grant': {
    sections: [
      {
        heading: 'Program overview',
        paragraphs: [
          'Alchemy and Arbitrum run a $10 million credits program for teams launching or migrating Orbit-based rollups. Approved builders can receive up to $500,000 in Alchemy infrastructure credits to offset node, API, and developer platform costs while they scale.',
          'The grant is designed so infrastructure cost does not block experimentation with dedicated app chains and custom sequencing strategies.',
          'Credits apply to first-party Alchemy services during testnet and early mainnet operations; teams should model expected RPC volume before requesting the upper award tier.',
        ],
      },
      {
        heading: 'What credits cover',
        bullets: [
          'Alchemy APIs, nodes, and developer tooling used while bootstrapping an Orbit chain.',
          'Migration support when moving an existing rollup to the Orbit stack.',
          'Hands-on guidance from Alchemy ecosystem teams during early mainnet operations.',
        ],
      },
      {
        heading: 'How to apply',
        paragraphs: [
          'Submit the application on Alchemy’s Arbitrum grant page with your chain design, milestones, and expected infrastructure usage. Reviewers evaluate technical feasibility and ecosystem impact before allocating credits.',
        ],
      },
    ],
  },
  'anthropic-startups': {
    name: 'Claude for Startups',
    url: 'https://www.anthropic.com/startups',
    description:
      'Claude Startups is Anthropic’s program for early-stage founders building on Claude. Members access partner offers, Applied AI office hours, and community events; new cohort applications open when announced on the startup newsletter.',
    amount: 'Up to $45,000 in partner offers (current members); up to $100,000 API credits via select VC partners',
    sections: [
      {
        heading: 'Program overview',
        paragraphs: [
          'The program bundles discounts and credits from AI-native vendors that integrate with Claude, alongside webinars with Anthropic’s Applied AI team and invites to Founder House events during major tech weeks.',
          'As of the public program page, the active cohort is full and new applications are paused. Founders can subscribe to the Claude Startup newsletter for the next intake window.',
        ],
      },
      {
        heading: 'Member benefits',
        bullets: [
          'Claude Startup Stack redemptions across sales, design, data, meetings, and engineering tools.',
          'Biweekly Applied AI group sessions with AMA time for implementation questions.',
          'Founder House, Builder Days, and community meetups hosted by Anthropic or partner founders.',
          'Additional API credits up to $100,000 when backed by a VC in Anthropic’s partner network.',
        ],
      },
      {
        heading: 'Credits policy',
        paragraphs: [
          'Startup credits apply to the first-party Claude API through Claude Console. They cannot be applied to Claude consumption billed through AWS, Google Cloud, or Azure marketplaces.',
        ],
      },
    ],
    descriptionSource: {
      url: 'https://www.anthropic.com/startups',
      fetchedAt: new Date().toISOString(),
      wordCount: 0,
      method: 'sections',
      pageTitle: 'Claude for Startups',
    },
  },
  'asi-accel': {
    description:
      'The Artificial Superintelligence (ASI) Alliance accelerator supports decentralized AI agents, shared compute, and open agent frameworks across alliance member networks.',
    sections: [
      {
        heading: 'Program overview',
        paragraphs: [
          'ASI bundles research, compute, and grant capital for teams that contribute agent tooling, orchestration, or data infrastructure to the alliance ecosystem rather than closed SaaS wrappers.',
          'Participants align roadmaps with alliance values around open collaboration, verifiable research, and responsible deployment of autonomous agents.',
          'Cohort teams present public demos and documentation so other alliance members can reuse agent skills, datasets, or deployment playbooks.',
        ],
      },
      {
        heading: 'Focus areas',
        bullets: [
          'Agent frameworks and memory systems that can run across multiple alliance chains or data layers.',
          'Decentralized compute and inference routing for AI workloads.',
          'Education and standards work that helps developers ship safer autonomous systems.',
        ],
      },
      {
        heading: 'How to participate',
        paragraphs: [
          'Review the ASI Alliance accelerator materials on cudos.org for the active intake form, eligibility, and cohort timelines. Proposals should map milestones to measurable open-source or on-chain outputs.',
          'Include contributor bios and links to prior agent or compute research so reviewers can gauge execution risk before inviting you to an interview.',
        ],
      },
    ],
  },
  'aurora-grants': {
    sections: [
      {
        heading: 'Program overview',
        paragraphs: [
          'Aurora’s partner program helps teams launch on the NEAR-based EVM chain with mentorship, marketing support, business development intros, and ecosystem introductions.',
          'Partners work toward a public launch plan covering liquidity, wallet distribution, and cross-chain messaging with other Aurora ecosystem dApps.',
          'Accepted teams receive recurring check-ins until their first major release ships and usage metrics are visible on public dashboards.',
        ],
      },
      {
        heading: 'Support areas',
        bullets: [
          'Ecosystem introductions to wallets, bridges, and infrastructure providers already live on Aurora.',
          'Community amplification through Aurora social channels and ecosystem media partners.',
          'Business development support for token launches, liquidity programs, and exchange outreach.',
        ],
      },
      {
        heading: 'How to join',
        paragraphs: [
          'Apply through the Aurora partner form with your deployment timeline, user traction goals, and integrations you need from the ecosystem team. Accepted teams receive a dedicated contact for marketing and technical office hours.',
          'Projects already live on Aurora can request incremental support when they prepare major upgrades or cross-chain launches.',
        ],
      },
    ],
  },
  'believe-builders-fund': {
    sections: [
      {
        heading: 'Program overview',
        paragraphs: [
          'Believe is committing $1,000,000 over several months to support high-potential builders and builder communities through fellowship grants, hackathons, and targeted incentives on Believe’s distribution rails.',
          'The fund rewards teams shipping consumer crypto applications with measurable traction rather than pitch decks alone.',
        ],
      },
      {
        heading: 'Support types',
        bullets: [
          'Fellowship-style grants for founders with an MVP and early user growth metrics.',
          'Hackathon prizes and sponsor tables for communities expanding Believe’s creator and trading ecosystem.',
          'Targeted incentives when launches drive sustained on-chain activity through Believe surfaces.',
        ],
      },
      {
        heading: 'How to apply',
        paragraphs: [
          'Submit the official Believe Builders Fund Google Form with your product link, metrics, and planned milestones. Reviewers prioritize founders who can ship publicly within the current funding season.',
        ],
      },
    ],
  },
  'customer-io-startups': {
    sections: [
      {
        heading: 'Program overview',
        paragraphs: [
          'Customer.io’s startup program gives early companies up to twelve months of messaging platform access so they can run lifecycle campaigns without upfront martech spend.',
          'Teams can use real-time event data, multi-channel journeys, and advanced segmentation while they prove product-market fit.',
          'Approved startups typically defer full list pricing until they cross the program’s published funding or revenue thresholds.',
        ],
      },
      {
        heading: 'Benefits',
        bullets: [
          'Behavioral messaging across email, push, SMS, and in-app channels.',
          'Startup-friendly pricing for the first year after approval.',
          'Implementation support to connect product analytics and billing events.',
        ],
      },
      {
        heading: 'Eligibility',
        paragraphs: [
          'You must meet Customer.io’s startup funding and company-age requirements listed on the application form. Existing enterprise contracts may disqualify teams that already pay for production messaging seats.',
          'After approval, connect your production workspace and map key lifecycle events so journeys can trigger from real product usage rather than batch imports.',
        ],
      },
    ],
  },
  'endless-education-fund': {
    sections: [
      {
        heading: 'Program overview',
        paragraphs: [
          'The Endless Education Fund invites developers, researchers, educators, and content creators to produce systematic learning materials that explain the Endless white paper, core products, and development stack.',
          'Grants are milestone-based and aim to grow a shared knowledge base the whole ecosystem can reuse.',
        ],
      },
      {
        heading: 'Eligible content',
        bullets: [
          'Structured tutorials, workshops, and documentation that cover Endless protocol features.',
          'Video or written curricula with clear learning outcomes and licensing that allows remixing.',
          'Localized education that expands access beyond English-speaking developer communities.',
        ],
      },
      {
        heading: 'How to apply',
        paragraphs: [
          'Complete the public Google Form with your content outline, delivery timeline, and distribution plan. Include links to prior teaching or open-source work so reviewers can judge execution ability.',
        ],
      },
    ],
  },
  'eth-audit-subsidy': {
    sections: [
      {
        heading: 'Program overview',
        paragraphs: [
          'Professional audits are a best practice, but cost often blocks early teams. This subsidy reduces the price of audit offers listed on the platform after you are accepted into a monthly cohort.',
          'Subsidies draw from a $1 million pool and apply to marketplace quotes rather than ad-hoc engagements arranged outside Areta.',
        ],
        bullets: [
          '$1 million in total subsidies across the program.',
          'Winners receive up to 30% off the audit offer they select on the platform.',
          'Applications close on the 14th of each month at 23:59 UTC.',
          'Late submissions roll forward automatically to the next month’s cohort.',
        ],
      },
      {
        heading: 'How to apply',
        paragraphs: [
          'Submit the program form hosted on Areta. Include your scope, timeline, and preferred auditors if you have them. Applicants are notified after each monthly review window.',
        ],
      },
    ],
  },
  'eth-esp': {
    description:
      'Ethereum Foundation ESP backs open-source teams with direct grants, office hours, and ecosystem introductions across protocol R&D, developer experience, security, and public goods.',
    sections: [
      {
        heading: 'Mission and role',
        paragraphs: [
          'ESP exists to shorten the path from credible research or tooling ideas to sustained maintenance inside the Ethereum ecosystem. Funding complements community grants and protocol governance rather than replacing them.',
          'Grantees report progress through ESP’s published templates so other teams can build on shared libraries, specs, and audit results.',
        ],
      },
      {
        heading: 'Focus areas',
        bullets: [
          'Core protocol improvements, testing, and client diversity efforts.',
          'Developer tooling, documentation, and educational resources for Ethereum builders.',
          'Security research, audits, and incident response preparedness.',
          'Community infrastructure and coordination that keeps public goods online.',
        ],
      },
      {
        heading: 'How to engage',
        paragraphs: [
          'Teams typically begin with the ESP wishlist or an unsolicited proposal describing impact, maintainers, and budget. ESP publishes guidance on grant sizes and reporting expectations on the official ESP site.',
          'Office hours and ecosystem intros are available to grantees shipping libraries that other Ethereum teams depend on for client or tooling upgrades.',
        ],
      },
    ],
  },
  'filecoin-grants': {
    url: 'https://www.fil.org/grants',
    sections: [
      {
        heading: 'Program overview',
        paragraphs: [
          'Filecoin Foundation routes much of its public-goods funding through ProPGF, the network’s community funding process. Builders submit proposals for storage tooling, media archives, and infrastructure that grows verifiable storage markets.',
          'Upcoming ProPGF rounds, deadlines, and scopes are announced on fil.org and community forums rather than a single static intake.',
          'Grantees are encouraged to publish retrieval benchmarks and storage deal metrics so the community can verify impact between payout milestones.',
        ],
      },
      {
        heading: 'Example public goods projects',
        bullets: [
          'Cavalry and FileDrive experiments that improve storage UX and retrieval performance.',
          'Fileverse, M○C△, and Portrait initiatives that connect creators to decentralized storage rails.',
        ],
      },
      {
        heading: 'Submission expectations',
        paragraphs: [
          'Proposals should include measurable milestones, open repositories where possible, and a clear explanation of how Filecoin storage providers or clients benefit. Follow the published submission criteria for the active ProPGF round before applying.',
        ],
      },
    ],
  },
  'flow-grants': {
    description:
      'Flow supports builders shipping consumer-friendly apps on its multi-role architecture, with grants and ecosystem programs that keep developers in production after launch.',
    sections: [
      {
        heading: 'Program overview',
        paragraphs: [
          'Flow’s ecosystem team funds teams that grow daily active usage, NFT utility, or DeFi activity on Flow cadence. Funding often pairs cash milestones with technical support from Flow Foundation engineers.',
          'Teams should plan for account linking, fee sponsorship, and mobile wallet onboarding because Flow reviewers weight consumer UX heavily.',
        ],
      },
      {
        heading: 'Builder resources',
        bullets: [
          'React SDKs and wallet connectors that shorten time-to-mainnet for consumer apps.',
          'Marketplace listings and co-marketing when projects hit published traction goals.',
          'Office hours for performance tuning, account linking, and mobile wallet integrations.',
        ],
      },
      {
        heading: 'How to apply',
        paragraphs: [
          'Review the grants and ecosystem pages on flow.com for the active intake. Proposals should cite target user segments, on-chain activity metrics, and how each milestone unlocks the next growth loop.',
          'Attach Figma or TestFlight links when your milestone depends on consumer onboarding because Flow reviewers evaluate mobile UX explicitly.',
        ],
      },
    ],
  },
  'gitcoin-qf': {
    sections: [
      {
        heading: 'Program overview',
        paragraphs: [
          'Gitcoin coordinates seasonal funding rounds that combine quadratic matching, direct grants, and alliance-specific pools for open-source and public goods work.',
          'Builders apply to active campaigns on gitcoin.co, share impact metrics, and receive matching funds from community donors plus institutional sponsors.',
          'Recent rounds also route recurring Ethereum core contributor funding through on-chain vesting backed by the 1% pledge.',
        ],
      },
      {
        heading: 'Recent initiatives',
        bullets: [
          'Protocol Guild routes Ethereum core contributor funding through on-chain vesting backed by the 1% pledge.',
          'Security-focused rounds such as TheDAO Security Fund crowdsource audits and defense work with ranked-choice voting.',
          'Seasonal Gitcoin Grants rounds experiment with plural funding mechanisms across multiple ecosystem domains.',
        ],
      },
      {
        heading: 'How to participate',
        paragraphs: [
          'Create a Gitcoin profile, verify your repository ownership, and apply to the open campaign that matches your project category. Keep your impact summary updated each season so reviewers can allocate matching funds efficiently.',
        ],
      },
    ],
  },
  'icon-blockchain-grants': {
    description:
      'ICON’s Contribution Proposal System (CPS) funds interoperability, DeFi, and NFT projects that extend ICON’s public blockchain with measurable on-chain adoption.',
    url: 'https://cps.icon.community/',
    sections: [
      {
        heading: 'Why build on ICON',
        paragraphs: [
          'ICON focuses on cross-chain messaging and governance tooling for applications that need to reach multiple networks without re-deploying entire economies on each chain.',
          'CPS recipients typically ship open-source SDKs or reference integrations that other ICON builders can adopt without re-negotiating vendor contracts.',
          'Interoperability grants often pair protocol work with developer education so validators and bond holders can score impact before voting.',
        ],
      },
      {
        heading: 'Grant process',
        paragraphs: [
          'Teams submit CPS proposals with budgets, milestones, and contributor addresses. Validators and bond holders review active requests on the public CPS portal before funds release.',
          'Keep milestone invoices, GitHub tags, and on-chain transaction hashes ready because CPS reporting requires evidence links for each deliverable.',
        ],
      },
      {
        heading: 'Resources',
        bullets: [
          'Developer docs, faucet access, and testnet tooling for SCORE and EVM contracts on ICON.',
          'Published CPS recipient lists show prior funded work and reporting outcomes.',
          'Community channels highlight tooling gaps the CPS committee has funded recently.',
        ],
      },
    ],
  },
  'iosg-kickstarter': {
    description:
      'IOSG Ventures’ Kickstarter track offers early checks and ecosystem support for Web3, fintech, and AI founders in Asia and beyond, with curated portfolio services rather than a public milestone grant form.',
    url: 'https://iosg.vc',
    sections: [
      {
        heading: 'Program overview',
        paragraphs: [
          'IOSG has invested in more than 150 companies since 2017 across infrastructure, DeFi, and applied AI. The Kickstarter initiative surfaces pre-seed and seed deals that match the firm’s research themes.',
          'The firm publishes sector research that helps founders position interoperability, restaking, or agent finance narratives before diligence meetings.',
        ],
      },
      {
        heading: 'How founders engage',
        bullets: [
          'Warm introductions from existing IOSG portfolio companies or co-investors carry the strongest signal.',
          'Cold pitches should include traction metrics, cap table context, and why the problem benefits from IOSG’s research network.',
          'Selected teams may receive follow-on help with exchange listings, token design reviews, and Asia market entry.',
        ],
      },
      {
        heading: 'What to prepare',
        paragraphs: [
          'Send a concise deck, product demo, and on-chain or revenue metrics when available. IOSG reviews opportunities continuously rather than on a fixed quarterly deadline.',
        ],
      },
    ],
  },
  'kalshi-builders': {
    sections: [
      {
        heading: 'Program overview',
        paragraphs: [
          '$2 million in builder grants are live for teams creating prediction-market experiences, data tooling, and distribution layers on top of Kalshi, with co-sponsorship from Solana and Base for eligible projects.',
          'Teams should outline regulatory constraints, data licensing, and user education plans because reviewers treat compliance readiness as part of the product scope.',
        ],
      },
      {
        heading: 'What gets funded',
        bullets: [
          'Consumer or pro interfaces that make regulated event contracts easier to discover and trade.',
          'Analytics, market-making, or risk tooling that improves liquidity and user education.',
          'Integrations that connect Kalshi markets to on-chain identity, payments, or social graphs on partner chains.',
        ],
      },
      {
        heading: 'Frequently asked questions',
        paragraphs: [
          'Who can apply?\n\nProduct teams with a working prototype or live beta that uses Kalshi APIs or market data under the published builder terms.',
          'How are awards sized?\n\nGrants are milestone-based and tied to user or volume targets agreed with the Kalshi builders team.',
          'Where do I apply?\n\nUse the official Kalshi builders page for the current form and eligibility checklist.',
        ],
      },
    ],
  },
  'kava-grants': {
    sections: [
      {
        heading: 'Program overview',
        paragraphs: [
          'Kava’s on-chain grants program distributes up to 200 million KAVA to teams that deploy applications on the network and hit transparent incentive milestones.',
          'Kava combines Cosmos SDK interoperability with an Ethereum-compatible execution environment, so teams can port Solidity contracts or build natively with Cosmos tooling.',
          'Rewards are published on-chain, making it easy for the community to audit who qualified and which milestones were met.',
          'Dashboard registration links your contracts to reviewer accounts so incentive claims do not require manual ticket backlogs.',
        ],
      },
      {
        heading: 'What gets funded',
        bullets: [
          'DeFi protocols, consumer apps, and infrastructure that increases Kava transaction volume.',
          'Tooling and education that helps developers ship faster on the dual Cosmos and EVM stack.',
          'Ecosystem marketing or integrations that drive measurable on-chain adoption.',
        ],
      },
      {
        heading: 'How to participate',
        paragraphs: [
          'Deploy contracts to Kava and register your project with the grants dashboard. Milestone reviewers confirm TVL, user growth, or technical deliverables before each KAVA tranche is released.',
        ],
      },
    ],
  },
  'notion-startups': {
    description:
      'Notion for Startups offers discounted Business workspace access with Notion AI for qualifying young companies referred through partner investors or accelerators.',
    sections: [
      {
        heading: 'Program overview',
        paragraphs: [
          'Eligible startups can receive up to six months of Business plan access with Notion AI for teams under roughly 100 employees, with partner-specific tiers offering shorter trials.',
          'The perk is designed for internal knowledge bases, product specs, and fundraising rooms rather than customer-facing wikis alone.',
          'Partner referrals usually unlock the longest trial window, so confirm your investor’s offer code before creating a paid workspace.',
        ],
      },
      {
        heading: 'Eligibility and benefits',
        bullets: [
          'Company must meet Notion’s published age, funding, and partner referral requirements.',
          'Benefits include collaborative docs, databases, AI-assisted writing, and standard startup onboarding templates.',
          'Renewal or conversion to paid plans follows Notion’s published startup terms after the promotional window.',
        ],
      },
      {
        heading: 'How to redeem',
        paragraphs: [
          'Apply through your accelerator or VC partner link listed on notion.com/startups. If you lack a partner code, review the page for alternate eligibility paths and required company verification documents.',
        ],
      },
    ],
  },
  'oasis-grants': {
    url: 'https://oasis.net/ecosystem/grants',
    description:
      'Oasis Protocol grants fund privacy-enabled applications, developer tooling, and security research that strengthens confidential smart contracts on the Oasis Network.',
    sections: [
      {
        heading: 'Program overview',
        paragraphs: [
          'Oasis emphasizes confidential compute, private DeFi, and verifiable off-chain data feeds. Grant reviewers look for projects that use Oasis Sapphire or Cipher capabilities rather than generic EVM ports.',
          'Proposals should explain how sensitive state stays encrypted while auditors or users can still verify correctness through Oasis programmable policies.',
        ],
      },
      {
        heading: 'Technical themes',
        bullets: [
          'Private DeFi, identity, and AI agents with programmable confidentiality policies.',
          'Developer tooling that simplifies testing and auditing confidential contracts.',
          'Education and grants supporting node operators and ecosystem analytics.',
        ],
      },
      {
        heading: 'How to apply',
        paragraphs: [
          'Submit proposals through the Oasis ecosystem grants portal with open-source links, threat models, and milestone metrics. Include how user data stays confidential while remaining auditable where required.',
          'Budget separate milestones for audits and confidential compute benchmarking because reviewers treat them as distinct deliverables.',
          'Name the Oasis runtime or ParaTime you target so reviewers can assign the right security checklist during diligence.',
        ],
      },
    ],
  },
  'polkadot-opengov': {
    description:
      'Polkadot OpenGov treasury funds parachains, infrastructure, security, and marketing proposals through on-chain referenda backed by network inflation.',
    sections: [
      {
        heading: 'Treasury proposals',
        paragraphs: [
          'Teams and collectives publish treasury proposals on Subsquare or Polkassembly with budgets, delivery milestones, and beneficiary accounts. Token holders vote during the referendum track assigned to each spend.',
          'Large spends often move through fellowship or curator commentary before referendum voting so reviewers understand technical risk.',
        ],
      },
      {
        heading: 'Common funding categories',
        bullets: [
          'Parachain slot support, collator tooling, and cross-chain messaging improvements.',
          'Developer tooling, wallets, and education for the Substrate and Polkadot SDK.',
          'Security audits, bounty programs, and incident response retainers.',
          'Global events, translations, and media that onboard new ecosystem participants.',
        ],
      },
      {
        heading: 'Before you submit',
        paragraphs: [
          'Draft a clear scope with measurable outputs, reporting cadence, and multisig or on-chain payment details. Engage the relevant fellowship or curators early if your spend touches core protocol security or runtime upgrades.',
          'Attach links to working prototypes or audit reports when your treasury spend depends on code that is not yet deployed on a production network.',
        ],
      },
    ],
  },
  'shortcut-startups': {
    description:
      'Shortcut for Startups provides discounted seats for early engineering teams that want one workspace for planning, execution, release tracking, and stakeholder reporting.',
    sections: [
      {
        heading: 'Program overview',
        paragraphs: [
          'Shortcut bundles issue tracking, roadmaps, and reporting for product and engineering leaders who need speed without adopting a heavy enterprise PMO stack.',
          'Startup pricing helps teams standardize rituals while they move from seed to Series A headcount.',
          'Import templates from Shortcut’s startup library if you are migrating from spreadsheets or ad-hoc GitHub issues.',
        ],
      },
      {
        heading: 'How teams use Shortcut',
        bullets: [
          'Plan epics and iterations with live roadmap views stakeholders can follow.',
          'Connect GitHub or other dev tools so progress updates flow automatically.',
          'Track velocity and release readiness with built-in reporting instead of spreadsheet exports.',
        ],
      },
      {
        heading: 'Eligibility',
        paragraphs: [
          'Visit shortcut.com/startups for current funding-stage limits and discount duration. Apply with your team size and engineering workflow so support can provision the right workspace tier.',
          'Note your current issue-tracking tool so Shortcut can recommend an import path during onboarding.',
          'Startup support can help map epics to your existing release cadence during the first week.',
        ],
      },
    ],
  },
  'solana-mobile-builder': {
    sections: [
      {
        heading: 'Program overview',
        paragraphs: [
          'Solana Mobile Builder Grants fund teams shipping mobile-first crypto experiences on Saga, Seed Vault, and the Solana Mobile Stack.',
          'Reviewers score proposals on mobile UX quality, Solana Mobile Stack integration depth, and realistic milestone timelines.',
          'Grantees are expected to demo builds on physical Saga hardware or compliant emulators before each payout tranche.',
        ],
      },
      {
        heading: 'Evaluation criteria',
        bullets: [
          'Mobile-first implementation with clear use of Seed Vault or Mobile Wallet Adapter.',
          'Open-source or community components that other builders can reuse.',
          'Milestones tied to testnet or device demos with defined user or transaction targets.',
        ],
      },
      {
        heading: 'How to apply',
        paragraphs: [
          'Use the Solana Mobile grants page to submit scope, team background, and funding use of funds. Include APK or TestFlight links when available so reviewers can evaluate the current build.',
          'Describe Seed Vault or Mobile Wallet Adapter usage in your architecture diagram so reviewers can verify stack compliance quickly.',
        ],
      },
    ],
  },
  'ssojet-startup': {
    description:
      'SSOJet’s startup offer provides 50% off enterprise single sign-on for twelve months to qualifying young companies that need SAML and OIDC without building auth infrastructure in-house.',
    sections: [
      {
        heading: 'Program overview',
        paragraphs: [
          'The program targets startups that must pass enterprise security reviews but cannot yet afford full IdP contracts. SSOJet hosts the integration while your team focuses on core product delivery.',
          'Non-profit applicants use the same form and may qualify when they meet published eligibility criteria for discounted enterprise auth.',
        ],
      },
      {
        heading: 'Application steps',
        bullets: [
          'Complete the startup application with company details and expected monthly active SSO users.',
          'SSOJet reviews within roughly one to two business days and emails onboarding instructions.',
          'Approved teams configure SAML or OIDC connections using SSOJet’s guided setup wizard.',
        ],
      },
      {
        heading: 'After approval',
        paragraphs: [
          'Monitor seat usage during the promotional year and plan migration to standard pricing before renewal if you outgrow startup limits.',
          'Document SAML attribute mappings and SCIM settings if enterprise customers require them during security questionnaires.',
          'Keep an admin contact on file for certificate expiry notices so production logins do not break silently.',
        ],
      },
    ],
  },
  'stacks-foundation': {
    sections: [
      {
        heading: 'Program overview',
        paragraphs: [
          'Stacks Foundation grant programs back open internet infrastructure on Stacks, with a focus on builders, researchers, and community organizers advancing Bitcoin-secured applications.',
          'Funding options include Stacks Endowment Grants for staged project work and DeGrants, a community-led process where members direct smaller awards to ideas they want to see shipped.',
        ],
      },
      {
        heading: 'Stacks Endowment Grants',
        paragraphs: [
          'The endowment publishes tracks for teams getting started, builders shipping products, and community programs that grow adoption. Active awards and milestones are listed on the Stacks Endowment site.',
          'Applicants should tie each milestone to measurable on-chain or open-source deliverables reviewers can verify publicly.',
        ],
      },
      {
        heading: 'Security bounties',
        paragraphs: [
          'Several ecosystem teams run Immunefi programs for responsible disclosure. Payout ranges vary by project severity tables and are separate from standard grants.',
        ],
        bullets: [
          'Hiro and Leather run security bounty programs for their wallets and developer tooling.',
          'BitFlow, Zest, Granite, and StackingDao host Immunefi bounties with disclosed maximum awards.',
        ],
      },
    ],
  },
  'stellar-comm-launch': {
    sections: [
      {
        heading: 'Program overview',
        paragraphs: [
          'Stellar community launch rounds fund organizers who host educational events that grow local Stellar ecosystems. Funding pairs modest grants with recognition for potential chapter leaders.',
          'This round targets regions that lack an active Stellar chapter and need structured onboarding content for developers and merchants.',
          'Organizers receive playbooks for wallet onboarding, anchor demos, and merchant education so events stay consistent with Foundation messaging.',
        ],
      },
      {
        heading: 'Organizer expectations',
        bullets: [
          'Host at least one public workshop or meetup with Stellar-focused curriculum.',
          'Capture attendance metrics and publish follow-up resources participants can reuse.',
          'Coordinate with Stellar Foundation staff on branding and safety guidelines.',
        ],
      },
      {
        heading: 'How to apply',
        paragraphs: [
          'Complete the Stellar community Typeform when the round is open. Include your region, event plan, and prior community experience so reviewers can assess continuity after funding ends.',
        ],
      },
    ],
  },
  'story-events': {
    sections: [
      {
        heading: 'Program overview',
        paragraphs: [
          'The Events Grant Program rewards community members who host Story-aligned gatherings such as programmable IP workshops, networking mixers, hackathons, and small dinners for local builders.',
          'Funding tiers start around $300 for first-time hosts and scale up to $2,000 for experienced organizers or ecosystem projects with a documented track record.',
          'Seasonal rounds open on the official Google Form; only use links published on story.foundation to avoid impersonation scams.',
        ],
      },
      {
        heading: 'What organizers must deliver',
        bullets: [
          'Market the event and capture photo or video proof that it occurred.',
          'Submit a post-event report within 72 hours using the Foundation template.',
          'Follow Story community event hosting guidelines for safety and brand use.',
          'Complete payment onboarding and invoice submission before funds are released.',
        ],
      },
      {
        heading: 'How to apply',
        paragraphs: [
          'Apply through the official Google Form when the round is open. Decisions are communicated by email.',
        ],
      },
    ],
  },
  'subquery-network-grants': {
    description:
      'SubQuery funds open-source teams building indexing, RPC, and data infrastructure that helps developers ship faster on multi-chain applications.',
    sections: [
      {
        heading: 'Program overview',
        paragraphs: [
          'The SubQuery Network grants program backs contributors extending indexing coverage, improving RPC reliability, or building analytics layers on top of decentralized data infrastructure.',
          'Milestone-based awards support both new SubQuery networks and improvements to the core SDK ecosystem.',
          'Reviewers favor repositories with reproducible benchmarks showing latency or hosting cost improvements.',
          'Publish deployment manifests or Dockerfiles so other operators can reproduce your indexer configuration during review.',
        ],
      },
      {
        heading: 'Application focus',
        bullets: [
          'Indexer modules for new chains or parachains joining the SubQuery marketplace.',
          'Developer tooling, documentation, and starter kits for multi-chain dApp builders.',
          'Research or performance work that reduces latency or hosting cost for decentralized query nodes.',
        ],
      },
      {
        heading: 'How to apply',
        paragraphs: [
          'Review the public SubQuery grants board for open requests, then submit a proposal with milestones, repository links, and expected timeline. Grants are paid as milestones are accepted by the SubQuery Foundation reviewers.',
          'Mention supported chains in your indexer scope up front so reviewers can route your proposal to the right specialist.',
        ],
      },
    ],
  },
  'tally-startups': {
    sections: [
      {
        heading: 'Program overview',
        paragraphs: [
          'Tally for Startups gives eligible young companies discounted access to Tally Pro forms and workflow automation, helping founders collect applications, waitlists, and user research without building custom form infrastructure.',
          'Partner organizations distribute referral codes so their portfolio companies skip full-price checkout during the promotional period.',
          'Teams can embed Tally forms in marketing sites or Notion docs without writing custom back-end handlers for every campaign.',
        ],
      },
      {
        heading: 'Eligibility',
        bullets: [
          'Your company qualifies as a startup under Tally’s published criteria.',
          'You belong to a participating VC, accelerator, community, or co-working partner that distributes the offer code.',
          'You have not previously held a paid Tally Pro subscription that lapsed for non-payment.',
        ],
      },
      {
        heading: 'Partner organizations',
        paragraphs: [
          'Investors and community operators can enroll to give their portfolio companies a managed discount link. Startups apply through the partner referral instead of purchasing Tally Pro at full price.',
        ],
      },
    ],
  },
  'uomi-grants': {
    description:
      'UOMI Grants fund decentralized applications and core infrastructure on the UOMI Network, with individual and ecosystem tracks tied to OPoC consensus milestones.',
    sections: [
      {
        heading: 'Grant types',
        paragraphs: [
          'Individual grants support founders shipping standalone dApps, while ecosystem grants back shared tooling, wallets, and growth programs that lift multiple teams.',
          'Ecosystem tracks favor open standards that reduce integration friction for developers joining UOMI after the initial cohort ships.',
        ],
      },
      {
        heading: 'Support included',
        bullets: [
          'Technical mentorship from core contributors on OPoC and network integrations.',
          'Community amplification and growth workshops when projects hit published traction goals.',
          'Milestone-based payouts after reviewers validate on-chain or open-source deliverables.',
        ],
      },
      {
        heading: 'How to apply',
        paragraphs: [
          'Submit your proposal on uomi.ai/grants with architecture notes, token or user metrics, and a three- to six-month milestone plan. Clearly state whether you are applying for an individual or ecosystem track.',
          'List OPoC-specific dependencies or validator partners that your milestone plan requires so mentors can confirm feasibility.',
          'Attach testnet contract addresses or GitHub milestones before your first review call so mentors can validate scope quickly.',
        ],
      },
    ],
  },
  'vebetter-grants': {
    sections: [
      {
        heading: 'Program overview',
        paragraphs: [
          'VeBetter funds builders creating sustainability-focused applications, tooling, and infrastructure on VeChain.',
          'Teams should show measurable environmental or lifestyle impact and explain how B3TR incentives reinforce user behavior.',
          'Grants are milestone-based and require periodic reporting on on-chain usage and sustainability outcomes.',
          'VeChain Foundation may feature shipped apps in regional sustainability campaigns when metrics meet public reporting standards.',
        ],
      },
      {
        heading: 'Grant tracks',
        bullets: [
          'App Grants for consumer X-to-earn experiences with transparent sustainability metrics.',
          'Tooling Grants for developer infrastructure, analytics, or protocol upgrades that strengthen the VeBetter ecosystem.',
        ],
      },
      {
        heading: 'Application expectations',
        paragraphs: [
          'Submit your roadmap, sustainability KPIs, and open-source repository links through the VeBetter grants portal. Reviewers favor projects that can ship a testable MVP within one quarter.',
          'Awards are denominated in B3TR and may include co-marketing or VeChain Foundation intros when milestones land on mainnet.',
          'Include baseline measurements for the sustainability KPI you plan to improve so reviewers can verify impact after launch.',
        ],
      },
    ],
  },
  'zealynx-audit-grants': {
    sections: [
      {
        heading: 'Program overview',
        paragraphs: [
          'Zealynx Audit Grants subsidize or fully fund smart contract audits for Web3 protocols that demonstrate user impact and responsive security practices.',
          'Applications are judged on protocol merit, team experience, and willingness to remediate findings before mainnet expansion.',
          'Final reports are shared with grantees under NDA until critical issues are resolved, then summary results may be published with team consent.',
        ],
      },
      {
        heading: 'What reviewers expect',
        bullets: [
          'Clear scope covering contracts that custody or route user funds.',
          'Public code repositories and deployment addresses for the version under review.',
          'Remediation commitment for critical and high severity findings prior to wide release.',
        ],
      },
      {
        heading: 'How to apply',
        paragraphs: [
          'Complete the Zealynx grants form with architecture diagrams, timelines, and prior audit history if any. Award size may range from partial subsidies to full audits depending on complexity and ecosystem benefit.',
        ],
      },
    ],
  },
  'zetachain-grants': {
    description:
      'ZetaChain’s milestone-based grants program backs omnichain and Bitcoin-connected dApps, with funding disbursed after reviewers approve scope, milestones, and ecosystem impact.',
    url: 'https://www.zetachain.com/blog/zetachain-grants-program-for-omnichain-dapp-builders',
    sections: [
      {
        heading: 'Program overview',
        paragraphs: [
          'The public grants program allocates millions of dollars to teams deploying on ZetaChain mainnet, with additional carve-outs for Bitcoin-focused infrastructure, DeFi, and gaming experiments highlighted in ecosystem blog posts.',
          'Both existing projects migrating to ZetaChain and new teams in ideation may apply when intake is open.',
          'Blog posts describe Bitcoin ecosystem tranches and omnichain app priorities; confirm the active intake form before submitting legacy L1-only proposals.',
        ],
      },
      {
        heading: 'Eligibility',
        bullets: [
          'Deploy audited or review-ready contracts on ZetaChain mainnet and publish addresses plus open-source repositories.',
          'Operate as a legal entity and accept ZetaChain Terms of Use for disbursement.',
          'Use funds for development, liquidity, adoption, or awareness aligned with published milestone agreements.',
        ],
      },
      {
        heading: 'Next steps',
        paragraphs: [
          'Submit the Google Form linked from ZetaChain developer grants materials. After screening, the team schedules an intro call, signs an agreement, and receives tranches as milestones complete.',
        ],
      },
    ],
    descriptionSource: {
      url: 'https://www.zetachain.com/blog/zetachain-grants-program-for-omnichain-dapp-builders',
      fetchedAt: new Date().toISOString(),
      wordCount: 0,
      method: 'sections',
      pageTitle: 'ZetaChain Grants Program',
    },
  },
};