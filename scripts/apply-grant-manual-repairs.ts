#!/usr/bin/env tsx
/**
 * Curated body copy for grants where automated scraping returns garbage or thin content.
 * Usage: npx tsx scripts/apply-grant-manual-repairs.ts [--apply]
 */
import fs from 'node:fs';
import path from 'node:path';
import type { GrantProgram } from '../src/types';
import { countStoredGrantWords } from '../src/lib/grant-editorial';
const GRANTS_PATH = path.join(process.cwd(), 'content/grants/grants.json');
const apply = process.argv.includes('--apply');

type Repair = Partial<Pick<GrantProgram, 'name' | 'provider' | 'description' | 'url' | 'ecosystem' | 'amount' | 'sections' | 'descriptionSource'>>;

const repairs: Record<string, Repair> = {
  'aave-grants': {
    description:
      'Aave Grants DAO funds community ideas that grow the Aave ecosystem through milestone grants reviewed on a rolling basis.',
    sections: [
      {
        heading: 'Program overview',
        paragraphs: [
          'Aave Grants DAO is funded through Aave DAO governance and supports developers, integrations, audits, and community programs that strengthen the protocol.',
          'Applications are reviewed monthly with no fixed cohort deadline.',
        ],
      },
      {
        heading: 'Frequently asked questions',
        paragraphs: [
          'What is Aave Grants DAO?\n\nIt is a community grants program focused on growing the Aave ecosystem by funding vetted ideas, projects, and teams.',
          'Does AGD fund Lens grants?\n\nNo. Lens runs a separate grants process through Aave Companies.',
          'How do I claim milestone payments?\n\nUse the official claim form linked from AGD after each approved milestone is delivered.',
        ],
      },
      {
        heading: 'How to apply',
        paragraphs: [
          'Submit a rolling application on aavegrants.org. You should receive a response within about one month.',
          'Check your inbox for “Congratulations & AGD Next Steps” to confirm receipt; follow up through official AGD channels if you have not heard back after one month.',
        ],
      },
    ],
  },
  '0g-growth': {
    url: 'https://www.0gfoundation.ai/ecosystem',
  },
  'aptos-payments-grants': {
    description:
      'The Aptos Payments grant track offers up to $150,000 in milestone-based funding for teams building next-generation payment infrastructure on Aptos, plus ecosystem amplification.',
    sections: [
      {
        heading: 'Program overview',
        paragraphs: [
          'Aptos targets instant, borderless, programmable payments with native stablecoin support and high throughput for consumer and B2B flows.',
          'Grantees receive hands-on support from the Aptos team when milestones align with the payments use-case roadmap.',
        ],
      },
      {
        heading: 'What reviewers look for',
        bullets: [
          'Payment applications that reduce settlement friction across borders or apps.',
          'Infrastructure that improves stablecoin liquidity, onboarding, or treasury flows on Aptos.',
          'Teams that can ship measurable transaction or user volume within agreed milestones.',
        ],
      },
      {
        heading: 'How to apply',
        paragraphs: [
          'Start from the Aptos payments use-case page and follow links to the active grants intake for milestone templates and reviewer contacts.',
          'Include live testnet or mainnet metrics, compliance considerations, and integration plans with Aptos stablecoin rails when you submit.',
        ],
      },
    ],
  },
  'doublezero-grants': {
    sections: [
      {
        heading: 'Program overview',
        paragraphs: [
          'DoubleZero is built for high-performance distributed systems. The grants program funds tooling, observability, and experiments that help the network operate and stay understandable to stakeholders.',
          'Grants are milestone-based subsidies meant to reduce friction, not to fund long-term headcount.',
        ],
      },
      {
        heading: 'What grants fund',
        bullets: [
          'Network tooling such as dashboards, topology views, and observability stacks.',
          'Projects that complement core development without duplicating foundation work.',
          'Responses to published RFPs or clearly scoped open proposals.',
        ],
      },
      {
        heading: 'Grant FAQ',
        paragraphs: [
          'Where do grants come from?\n\nGrants are paid from the DoubleZero Token Treasury for independent teams advancing decentralization, security, and usability.',
          'What format do milestones use?\n\nEach grant uses predefined deliverables, success criteria, and timelines agreed before funds disburse.',
        ],
      },
    ],
  },
  'pooltogether-grants': {
    description:
      'PoolGrants is a community-led grants committee that funds work aligned with the PoolTogether no-loss savings protocol. Builders can apply for milestones spanning protocol development, integrations, education, audits, and ecosystem tooling.',
    url: 'https://docs.pooltogether.com/pooltogether/guides/getting-involved',
    ecosystem: 'Ethereum',
    sections: [
      {
        heading: 'Program overview',
        paragraphs: [
          'PoolTogether is governed by POOL token holders rather than a single company. PoolGrants channels community funding toward proposals that grow usage, security, and integrations around the protocol.',
          'The committee accepts rolling applications and publishes requests for proposals when it wants help in specific areas. Teams are encouraged to coordinate through the official PoolTogether governance forum before submitting larger efforts.',
        ],
      },
      {
        heading: 'What can be funded',
        paragraphs: ['Reviewers prioritize efforts that ship open, measurable value to depositors, integrators, or governance participants.'],
        bullets: [
          'Core protocol development and higher-layer protocols that build on PoolTogether.',
          'Applications, front ends, and yield sources that integrate PoolTogether.',
          'Developer tooling, documentation, and testing infrastructure.',
          'Marketing, education, and referral programs that expand awareness responsibly.',
          'Committees, sub-DAOs, and working groups that serve the PoolTogether ecosystem.',
          'Security reviews and code audits for integrations touching user funds.',
        ],
      },
      {
        heading: 'How to apply',
        paragraphs: [
          'Start on the official user documentation page for contributing to PoolTogether, then follow the grant links from there to the current application channel.',
          'You can also coordinate larger budgets through PT Budget Requests or ongoing contributor rewards via Coordinape when a grant is not the right fit.',
        ],
      },
    ],
    descriptionSource: {
      url: 'https://docs.pooltogether.com/pooltogether/guides/getting-involved',
      fetchedAt: new Date().toISOString(),
      wordCount: 0,
      method: 'sections',
      pageTitle: 'PoolTogether Grants',
    },
  },
  'stacks-foundation': {
    provider: 'Stacks Foundation',
    ecosystem: 'Bitcoin',
    url: 'https://stacks.foundation/grants',
    description:
      'The Stacks Foundation funds builders advancing a Bitcoin-secured Web3 through the Stacks Endowment, community DeGrants, and coordinated security bounties across core ecosystem teams.',
    sections: [
      {
        heading: 'Program overview',
        paragraphs: [
          'Stacks Foundation grant programs back open internet infrastructure on Stacks, with a focus on builders, researchers, and community organizers.',
          'Funding options include Stacks Endowment Grants for staged project work and DeGrants, a community-led process where members direct smaller awards to ideas they want to see shipped.',
        ],
      },
      {
        heading: 'Stacks Endowment Grants',
        paragraphs: [
          'The endowment publishes tracks for teams getting started, builders shipping products, and community programs that grow adoption. Active awards and milestones are listed on the Stacks Endowment site.',
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
    descriptionSource: {
      url: 'https://stacks.foundation/grants',
      fetchedAt: new Date().toISOString(),
      wordCount: 0,
      method: 'sections',
      pageTitle: 'Stacks Foundation Grants',
    },
  },
  'eth-audit-subsidy': {
    description:
      'A joint initiative with audit providers to subsidize security reviews for Ethereum builders. Accepted teams receive up to 30% off audit quotes on the Areta marketplace, drawn from a $1 million subsidy pool.',
    sections: [
      {
        heading: 'Program overview',
        paragraphs: [
          'Professional audits are a best practice, but cost often blocks early teams. This subsidy reduces the price of audit offers listed on the platform after you are accepted into a monthly cohort.',
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
    descriptionSource: {
      url: 'https://areta.fillout.com/t/bFJzDt3p1rus',
      fetchedAt: new Date().toISOString(),
      wordCount: 0,
      method: 'sections',
      pageTitle: 'Ethereum Audit Subsidy Program',
    },
  },
  'algolia-startups': {
    sections: [
      {
        heading: 'Program overview',
        paragraphs: [
          'The Algolia Startup Program bundles $10,000 in search and discovery credits for eligible young companies, plus perks from partner SaaS vendors and access to Algolia’s founder community.',
          'Credits cover core search, vector search, recommend, A/B testing, and personalization APIs so you can ship discovery features without front-loading infrastructure cost.',
        ],
      },
      {
        heading: 'Program perks',
        bullets: [
          '$10,000 in Algolia credits during the first 12 months after approval.',
          'Partner credits for tools such as Datadog and Notion.',
          'Priority support and early access to new Algolia features.',
          'Opportunities to be featured in Algolia marketing content.',
        ],
      },
      {
        heading: 'Frequently asked questions',
        paragraphs: [
          'Who is eligible for the Algolia Startup Program?\n\nStartups under seven years old that have raised less than $15M and are not current paid Algolia customers may apply.',
          'How much credit does an approved startup receive?\n\nApproved companies receive $10,000 in Algolia credits to use within 12 months of acceptance.',
          'When do unused credits expire?\n\nAny unused balance lapses 12 months after approval.',
          'What happens if we spend all credits before the 12-month window ends?\n\nUsage reverts to standard pricing. The application owner is responsible for monitoring consumption in the dashboard.',
          'Can existing paying Algolia customers join?\n\nNo. The program is limited to new or free-tier teams that meet the funding and age requirements.',
          'Is approval guaranteed once we apply?\n\nNo. Applications are reviewed against eligibility rules and product fit.',
          'Can we apply if we previously redeemed another Algolia coupon?\n\nNo. Prior coupon redemptions disqualify a team from this startup offer.',
          'Are credits transferable?\n\nNo. Credits are tied to the approved application and expire after 12 months if unused.',
          'How do we contact the startup team?\n\nEmail startups@algolia.com.',
        ],
      },
    ],
  },
  'jetbrains-startups': {
    sections: [
      {
        heading: 'Program overview',
        paragraphs: [
          'Eligible startups receive 50% off up to 10 IDE or All Products Pack subscriptions and up to 10 paid team or learning tool subscriptions over five years.',
          'Companies must be privately owned, less than five years old, and have a public website or comparable online presence.',
        ],
      },
      {
        heading: 'What you get',
        bullets: [
          '50% discount on JetBrains IDEs, the All Products Pack, and team or learning tools.',
          'JetBrains AI credits included in the All Products Pack subscription.',
          'Access to startup events and partner offers from incubators and VCs in the JetBrains network.',
        ],
      },
      {
        heading: 'Frequently asked questions',
        paragraphs: [
          'What is the difference between the Startup Program and the Partner Program?\n\nThe Startup Program gives eligible companies a direct 50% discount on up to 10 IDE or All Products Pack subscriptions plus up to 10 team or learning tools over five years. The Partner Program is for incubators, accelerators, and VCs that receive six months of free licenses before switching their portfolio companies to the standard startup discount.',
          'How long does application review take?\n\nStartup applications are reviewed within about 48 hours. Partner applications are reviewed within about seven days.',
          'Can we receive the startup discount more than once?\n\nNo. Each eligible organization may receive the Startup Program discount only once, and it cannot be extended to subsidiaries.',
          'When does the discount expire?\n\nFive years after approval or once you reach the license caps (10 IDE/APP and 10 team or learning subscriptions).',
          'Do we need to reapply for additional licenses?\n\nNo. Approved startups can purchase more eligible licenses through the store and the discount applies automatically at checkout, within the published caps.',
          'Can the discount apply to floating or team-wide IDE licenses?\n\nNo. IDE licenses are per user and the startup discount does not cover floating license models.',
          'Can we combine the startup discount with other JetBrains promotions?\n\nNo. The Startup Program discount cannot be stacked with other offers.',
        ],
      },
    ],
  },
  'velas-grants': {
    sections: [
      {
        heading: 'Program overview',
        paragraphs: [
          'Velas funds open-source dApps and tooling on its EVM-compatible chain with Solana-style performance. Grants can reach up to $100,000 per project, with additional AWS credits for selected teams.',
        ],
      },
      {
        heading: 'Investment focus',
        bullets: [
          'Educational games that onboard newcomers to blockchain.',
          'High-tech gaming or AI + blockchain experiments.',
          'dApps connecting Velas to traditional sectors such as banking or healthcare.',
          'Adoption tooling that brings mainstream users on-chain.',
        ],
      },
      {
        heading: 'Application process',
        bullets: [
          'Submit one team application with portfolio and contact details for every contributor.',
          'Expect an initial review within 14 working days.',
          'Successful teams align milestones, payment schedule, and deliverable expectations with the Velas grants team.',
        ],
      },
      {
        heading: 'Frequently asked questions',
        paragraphs: [
          'Who can apply?\n\nAny qualified specialist or team that delivers measurable benefits to the Velas ecosystem.',
          'When can we apply?\n\nApplications are open on a rolling basis through the official Velas grants form.',
          'What language should we use?\n\nSubmit proposals in English and maintain professional conduct throughout the program.',
          'Can we suggest improvements to the program?\n\nYes. Send feedback to info@velas.com.',
          'How large are grants?\n\nRewards scale with difficulty and ecosystem priority, up to $100,000 per project.',
          'Why build on Velas?\n\nVelas combines Ethereum-compatible development with high throughput, low fees, and Solana-style Web3 libraries.',
          'What counts as a decentralized application?\n\nA dApp must run on the Velas blockchain and deliver user-facing on-chain functionality.',
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
  'certik-and-yzi': {
    url: 'https://www.certik.com/',
    description:
      'CertiK and YZi Labs set aside $1 million in audit subsidies for startups in the EASY Residency incubation program, helping Web3, AI, and biotech teams ship with security reviews earlier in the roadmap.',
    sections: [
      {
        heading: 'Program overview',
        paragraphs: [
          'EASY Residency participants can access subsidized smart contract and protocol audits through CertiK rather than deferring security work until after launch.',
          'The partnership focuses on teams that need third-party review before handling user funds, governance tokens, or agentic automation with on-chain settlement.',
          'Subsidies are allocated per cohort and tied to milestone acceptance so audits happen before high-risk features go live.',
        ],
      },
      {
        heading: 'Who qualifies',
        bullets: [
          'Companies accepted into the EASY Residency incubation cohort.',
          'Projects building Web3, AI, or biotech products that require formal audit coverage.',
          'Teams willing to publish remediation plans for critical or high findings before mainnet release.',
        ],
      },
      {
        heading: 'How it works',
        paragraphs: [
          'Residency operators coordinate scope with CertiK reviewers, then teams receive an audit proposal aligned to launch milestones. Funding flows once both parties sign the statement of work and the project commits to fixing critical issues before deployment.',
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
        ],
      },
    ],
  },
  'kava-grants': {
    url: 'https://www.kava.io/grants',
    sections: [
      {
        heading: 'Program overview',
        paragraphs: [
          'Kava’s on-chain grants program distributes up to 200 million KAVA to teams that deploy applications on the network and hit transparent incentive milestones.',
          'Kava combines Cosmos SDK interoperability with an Ethereum-compatible execution environment, so teams can port Solidity contracts or build natively with Cosmos tooling.',
          'Rewards are published on-chain, making it easy for the community to audit who qualified and which milestones were met.',
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
  'aurora-grants': {
    description:
      'Aurora’s partner program helps teams launch on the NEAR-based EVM chain with mentorship, marketing support, business development intros, and ecosystem introductions.',
    sections: [
      {
        heading: 'Program overview',
        paragraphs: [
          'Aurora Labs supports builders who want to deploy Ethereum-compatible contracts with NEAR-grade finality. Partners receive guidance on go-to-market, liquidity, and integrations with other Aurora ecosystem projects.',
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
          'The program is rolling; projects already live on Aurora can request incremental support when they prepare major upgrades or cross-chain launches.',
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
  'vebetter-grants': {
    amount: 'Up to $50,000 in B3TR tokens',
    url: 'https://vebetter.com/grants',
    sections: [
      {
        heading: 'Program overview',
        paragraphs: [
          'VeBetter funds builders creating sustainability-focused applications, tooling, and infrastructure on VeChain.',
          'Teams should show measurable environmental or lifestyle impact and explain how B3TR incentives reinforce user behavior.',
          'Grants are milestone-based and require periodic reporting on on-chain usage and sustainability outcomes.',
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
  'story-events': {
    description:
      'Story Foundation micro-grants for local workshops, meetups, and hackathons that grow programmable IP adoption. Seasonal rounds fund community-run events with post-event reporting requirements.',
    sections: [
      {
        heading: 'Program overview',
        paragraphs: [
          'The Events Grant Program rewards community members who host Story-aligned gatherings such as programmable IP workshops, networking mixers, hackathons, and small dinners for local builders.',
          'Funding tiers start around $300 for first-time hosts and scale up to $2,000 for experienced organizers or ecosystem projects with a documented track record.',
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
          'Apply through the official Google Form when the round is open. Decisions are communicated by email. Impersonation scams are common, so verify that outreach comes from Story Foundation channels listed on story.foundation.',
        ],
      },
    ],
    descriptionSource: {
      url: 'https://forms.gle/A4izh9etAnXH4NU79',
      fetchedAt: new Date().toISOString(),
      wordCount: 0,
      method: 'sections',
      pageTitle: 'Story Events Grant Program',
    },
  },
  filliquid: {
    description:
      'The FILLiquid Foundation FIG Grant Program funds DeFi builders on Filecoin with 20 million FIG tokens for FVM applications, cross-chain staking, lending infrastructure, and regional community growth.',
    sections: [
      {
        heading: 'Program overview',
        paragraphs: [
          'The program offers non-dilutive, milestone-based FIG token awards for teams shipping on the Filecoin Virtual Machine and FILLiquid cross-chain stack.',
          'Reviewers prioritize open, composable DeFi that increases FIL utilization for storage providers and holders.',
          'Awards scale with scope from protocol work through community programs that measurably grow FIL DeFi usage.',
        ],
      },
      {
        heading: 'Funding focus areas',
        bullets: [
          'Protocol infrastructure and FIT staking certificate scenarios.',
          'Cross-chain bridges and integrations (for example BNB Chain and Ethereum).',
          'Community and regional growth programs with measurable adoption.',
        ],
      },
      {
        heading: 'How to apply',
        paragraphs: [
          'Follow the official FIG Grant post linked on this page for the active intake form and milestone template.',
        ],
      },
    ],
  },
  'coti-web4-grant': {
    sections: [
      {
        heading: 'Program overview',
        paragraphs: [
          'COTI runs usage-based grant cycles for autonomous agents rather than human application committees.',
          'Agents earn $COTI every 14 days from a shared pool proportional to encrypted on-chain activity.',
          'Starter gas and tooling ship through coti-skills, coti-mcp, and the private messaging SDK.',
        ],
      },
      {
        heading: 'How it works',
        paragraphs: [
          'Epochs run on a 14-day cadence with a shared reward pool. Agents install skills or the SDK, claim starter gas, perform private on-chain actions, then claim proportional rewards when an epoch closes.',
          'Usage units accrue from encrypted messaging, private transactions, and other measurable network activity published in the open-source skills repository.',
        ],
      },
      {
        heading: 'Builder requirements',
        bullets: [
          'Agents must integrate through the published skills library or MCP server.',
          'Wallets must be created or imported using the documented account-setup flow.',
          'Teams should publish reproducible deployment steps for reviewers.',
        ],
      },
      {
        heading: 'How to apply',
        paragraphs: [
          'Deploy an agent using the public COTI skills repositories, then follow the starter-grant flow documented in the Web4 grant announcement linked from this page.',
        ],
      },
    ],
  },
  'cronos-grants': {
    sections: [
      {
        heading: 'Program overview',
        paragraphs: [
          'Cronos Ecosystem Grants bootstrap early-stage teams building on Cronos with milestone funding and engineering support from Cronos Labs.',
          'Applicants should show how their roadmap grows users, liquidity, or developer adoption on Cronos.',
        ],
      },
      {
        heading: 'Benefits',
        bullets: [
          'Milestone grants based on team quality, execution, and ecosystem contribution.',
          'Technical support from Cronos developers during MVP delivery.',
          'Marketing amplification and partner introductions when milestones land.',
        ],
      },
      {
        heading: 'How to apply',
        paragraphs: [
          'Submit the official Cronos Ecosystem Grant Airtable form with team background, milestones, and on-chain deployment plans.',
          'Shortlisted teams complete diligence, an interview with Cronos Labs, and a signed milestone agreement before funds disburse.',
        ],
      },
    ],
  },
  'x1-ecochain-grant': {
    amount: '$25,000 – $400,000',
    sections: [
      {
        heading: 'Program overview',
        paragraphs: [
          'X1 EcoChain runs a $5 million ecosystem fund for energy-efficient DePIN, infrastructure, and consumer apps on its Proof-of-Nodes L1. Grants combine cash, infra credits, and go-to-market support with milestone-based payouts.',
        ],
      },
      {
        heading: 'Eligibility',
        bullets: [
          'DePIN pilots using home or edge nodes with verifiable on-chain activity.',
          'Pre-launch teams with a 90–120 day path to testnet or mainnet.',
          'AI, infrastructure, or developer tooling with measurable adoption targets.',
          'Consumer, social, or gaming products that drive transaction volume on X1.',
        ],
      },
      {
        heading: 'Frequently asked questions',
        paragraphs: [
          'How do we apply?\n\nComplete the short application with your deck and 90–120 day plan. Triage typically happens within 72 hours.',
          'Can grants be combined with infra credits?\n\nYes, when the roadmap justifies both non-dilutive funding and subsidized compute or gas.',
          'How are credits sized?\n\nCredits are scoped during agreement signing based on expected usage and milestones.',
          'How long do agreements run?\n\nMost awards span three to six months, with extensions when performance warrants it.',
          'How are payouts structured?\n\nMilestone tranches in stablecoins before token generation, then in X1 afterward, subject to KYB/KYC checks.',
          'Can existing ecosystem teams apply?\n\nYes. Prior applicants and partners are eligible if they meet impact and security requirements.',
          'What happens if milestones slip?\n\nThe program may pause funding, re-scope deliverables, or reclaim unused credits until a remediation plan is approved.',
        ],
      },
    ],
  },
};

function main() {
  const grants: GrantProgram[] = JSON.parse(fs.readFileSync(GRANTS_PATH, 'utf-8'));
  let updated = 0;
  for (const grant of grants) {
    const patch = repairs[grant.id];
    if (!patch) continue;
    Object.assign(grant, patch);
    if (patch.sections?.length) {
      grant.descriptionSource = {
        url: grant.url,
        fetchedAt: new Date().toISOString(),
        wordCount: countStoredGrantWords(grant),
        method: 'curated-official-summary',
        pageTitle: grant.name,
      };
    } else if (grant.descriptionSource) {
      grant.descriptionSource.wordCount = countStoredGrantWords(grant);
      grant.descriptionSource.fetchedAt = new Date().toISOString();
    }
    updated++;
  }
  console.log(`Applied manual repairs to ${updated} grants`);
  if (apply) {
    fs.writeFileSync(GRANTS_PATH, `${JSON.stringify(grants, null, 2)}\n`);
    console.log(`Wrote ${GRANTS_PATH}`);
  }
}

main();