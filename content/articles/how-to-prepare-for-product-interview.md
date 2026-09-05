---
title: How to Prepare for a Product Interview
data-ai-hint: product manager interview whiteboard
description: >-
  A practical guide to preparing for product manager interviews in 2026, with
  specific steps for product sense, analytical and execution rounds, behavioral
  stories, technical fluency, and Web3 checks on tokenomics, governance, and
  security.
category: Career Guides
publishedDate: '2026-03-11'
lastUpdated: "2026-09-05"
---
## What a product interview actually tests

A product interview checks whether you can define the right problem, choose what to build, and know if it worked. In 2026 most companies run a sequence of filters: resume screen, recruiter screen, a product sense phone screen, then an onsite loop where you work through cases with a PM watching how you think. For Web3 roles the same sequence applies, but the loop adds questions on token design, governance, and security trade-offs.

Expect four core areas: product sense and design, analytical thinking and execution, behavioral leadership, and technical fluency. Senior loops add strategy and portfolio thinking. You need to pass each area separately. Strength in product sense does not cancel a weak score on metrics or leadership.

## Who this guide is for

This guide is for product managers, associate PMs, and Web3 PM candidates who want a checklist they can verify against official sources, not a list of slogans.

It fits you if you:

- Have shipped or co-shipped a product or feature with engineers and designers, even at small scale
- Can talk about users, trade-offs, and metrics with specifics, not generalities
- Have 4 to 8 weeks to prepare, with 10 to 15 hours per week
- Want to interview for Web2 and Web3 product roles and need to cover the extra Web3 layer

It is not for you if you are looking for tricks to memorize the night before. Interviewers in 2026 probe for how you reason and how you handle pushback. Frameworks help you stay organized, but memorized answers are scored down.

## How the process works in 2026

Most teams follow the same pipeline, with different weight by company.

1. **Resume and portfolio screen.**Automated parsing plus a recruiter scan. They look for impact with numbers, product area ownership, and links to launches. A one-page case where you show problem, decision, shipped change, and measured result beats a longer resume with no metrics.

2.**Recruiter screen, 30 minutes.**The recruiter checks level fit, motivation for that company, and compensation band. Be ready to walk through your resume in two minutes and to answer why this company and why this product area. You should also have informed questions about the team, scope, and how success is measured. At Meta this screen sets your level from IC4 to IC7, which sets the difficulty of later rounds. See Meta Careers preparing for your PM interview.

3.**PM phone screen, 45 minutes.**Usually one product sense question, such as how you would improve a specific product. This is a gate. About half of candidates are filtered here. You have 35 to 40 minutes to structure the problem and 5 minutes for your questions.

4.**Onsite loop, 3 to 4 rounds, 45 minutes each.**The standard loop includes Product Sense, Analytical Thinking which some companies still call Execution, and Leadership and Drive or Behavioral. For staff level or manager level many companies add a fourth round. At Meta that fourth round now focuses on AI product thinking for IC6 and above. At Google the onsite includes Product Sense, Strategy, and Leadership and Collaboration. Each interviewer submits an independent scorecard. A hiring committee decides. Interviewers do not make the final call.

5.**Timeline.**Recruiter to phone screen is 1 to 2 weeks. Phone screen to onsite is 2 to 3 weeks. Committee review after onsite is 1 to 2 weeks. End to end is often 4 to 6 weeks. Meta moves on the faster side of that range, Google on the slower side due to committee review.**Scoring you should know.**Meta scores each round 1 to 4, where 3 is hire and 4 is strong hire. You need an average around 3 or higher, and a 2 in product sense is hard to offset even with a 4 elsewhere because product sense is weighted most. Google scores onsite rounds 1 to 5, with product sense and strategy each about 35 percent of the onsite weight, leadership about 20 percent, and recruiter signal about 10 percent, and expects a weighted average near 3.8 to advance. Borderline scores trigger a second review.

## What to master for product sense and product design

This is the most weighted round. You are given an open prompt like how you would improve Facebook Marketplace or design a product to help people find local events. Interviewers score process, not the final idea.

A structure that matches how interviewers are trained, with credit to Lewis Lin for CIRCLES:

-**C - Comprehend the situation.**Restate the prompt. Clarify the goal and constraints. Is this about growth, retention, or new user activation. Ask two or three scoping questions, then make explicit assumptions.
-**I - Identify the customer.**Name two or three segments, pick one, and say why. Avoid all users. For Web3, name segments like crypto natives, developers, new users, and traders and collectors, and pick one.
-**R - Report needs and pain points.**List the jobs or pains for your chosen segment. Go beyond surface traits to underlying needs. Prioritize one pain to solve.
-**C - Cut through prioritization.**State the filter you will use to pick a problem or user. Impact on north star, severity, frequency, and strategic fit are common.
-**L - List solutions.**Generate three distinct options. Make them different in scope and risk. One quick win, one core improvement, one bolder bet is a simple way to show range.
-**E - Evaluate trade-offs.**For each solution note effort, impact, risk, and what you would not do. For Web3 include security review, audit time, and governance path.
-**S - Summarize the recommendation.**State your MVP, what you would measure, and the next experiment.

Timing that works in a 35 minute round: 2 to 3 minutes to clarify, 5 to 7 minutes on users and pains, 10 to 12 minutes to generate and evaluate solutions, 5 to 7 minutes to prioritize and define an MVP, 5 to 8 minutes for metrics and trade-offs. If you skip users and pains and jump to features, most rubrics score you as a 2.

Practice with real prompts you can verify: How would you improve Instagram Explore, how would you redesign Facebook Groups discovery to grow daily active users by 10 percent in three months, how would you improve YouTube for creators. For Web3: How would you decide which token to list in a consumer crypto app, how would you improve onboarding for a DeFi product, how would you design a feature to help small businesses grow on a decentralized marketplace. See Exponent for Web3 product prompts and the Meta Product Sense guide for the official rubric dimensions: user identification, pain point analysis, creative solutions, prioritization, metrics, and trade-off awareness.

## What to master for analytical thinking and execution

This round gives you something that already exists and asks you to measure, debug, or decide. Where product sense asks you to build, this round asks you to think like a scientist.**Metric decomposition.**Pick any feature and build a tree. Start with a north star, then break it into input metrics, output metrics, and guardrail metrics. Example for a wallet: north star could be weekly transacting wallets, inputs could be wallet connection success rate and swap completion rate, outputs could be transaction volume and fee revenue, guardrails could be failed transaction rate and support tickets about stuck transactions. Interviewers want you to name the tree before you name a single solution.**Diagnosis.**When a metric moves, do not jump to a cause. Build a hypothesis tree and isolate variables. Segment by platform, region, user cohort, acquisition channel, and product surface. At Meta a typical question is Facebook Groups engagement dropped 15 percent week over week, diagnose it. A strong answer walks through seasonals, releases, measurement changes, and competitor moves before recommending an action. At Google a common prompt is a metric dropped after a ranking change. The interviewer scores how you create structure from little data, not SQL syntax.**Experiment design.**Be ready to design a valid A/B test: hypothesis, randomization unit, control, sample size thinking, duration, success metric, guardrails, and risks like network effects, novelty effects, and selection bias. Also be ready for trade-off questions: an A/B test shows plus 3 percent DAU but minus 2 percent revenue, what do you do. A strong answer weighs short term revenue against retention and explains when to ship, iterate, or kill.**Frameworks that help, if you use them lightly:**-**AARRR**for lifecycle metrics: Acquisition, Activation, Retention, Referral, Revenue. Or**AARM**which many PMs use as Acquisition, Activation, Retention, Monetization.
-**HEART**for product experience: Happiness, Engagement, Adoption, Retention, Task success.
-**RICE**or**ICE**for prioritization: Reach, Impact, Confidence, Effort. State your scores with reasons, not just numbers.

Practice two cases per week with real data from a product you use. Define the metric tree on paper, then rehearse the diagnosis out loud.

## What to master for estimation and market sizing

Estimation is often part of the analytical round or a short standalone question. Interviewers score assumption hygiene, not arithmetic.

Two patterns cover most questions:

-**Market size.**How many daily active users would a new product have. Start from a population, filter to the relevant segment, apply adoption and frequency, and sanity check at the end.
-**Internal metric sizing.**How many swaps per day does a wallet do, or how much storage does a feed use. Start from users and workflows, not from global totals.

Lewis Lin publishes a cheat sheet of inputs many candidates use as anchors: US population and city populations, global population by region, GDP and income medians, smartphone penetration, and internet users by region. Use it to set defendable assumptions, then show your math in a clean funnel. Always state where you are uncertain and how you would validate with data after the interview.

## What to master for behavioral and leadership

Meta calls this Leadership and Drive, Google calls it Leadership and Collaboration, Amazon scores it against Leadership Principles. The format is the same: structured stories with specifics and measured outcomes.

Use**STAR**: Situation, Task, Action, Result. Keep each story to about 90 seconds to 3 minutes. Add the nuance that interviewers actually probe for:

-**Influence without authority.**How you moved engineers, designers, data scientists, and community members when you owned the outcome but not the people. Name who was involved and what each group cared about.
-**Ownership.**What you did without being asked, and where you took blame for a miss.
-**Ambiguity and resilience.**How you made a decision with incomplete data, what you did when requirements changed mid sprint, how you handled a fail.
-**Trade-off between speed and quality.**How you cut scope, what you protected, and why.

Prepare five stories that cover: a product decision with incomplete data, a conflict you resolved, a time you simplified a complex plan, a deadline you met by cutting scope, and a failure you learned from. For each, write the metric you will quote: retention change, activation lift, failed transaction rate cut, time to ship down from 6 weeks to 3. Avoid vague claims like I led a cross functional initiative without naming the conflict and the result.

Lewis Lin also describes**DIGS**for leadership stories: Dramatize the stakes, Indicate alternatives you considered, Go through what you did, Summarize the theme and lesson. Use whichever structure keeps you concise.

## What to master for technical fluency as a PM

You are not expected to write production contracts under time pressure, but you are expected to show you can talk to engineering without slowing the team.

Be able to:

- Sketch a high level flow for your proposed feature: client, backend or on-chain contract, off-chain indexer, and where data lives
- Talk through trade-offs plainly: build versus buy, on-chain versus off-chain, sync versus async
- Name failure states: what the interface shows when a transaction is pending, reverted, or dropped, and who monitors after launch
- Explain a technical choice in user terms. For example, storing state on chain costs gas and persists, while storing logs as events costs about 375 gas plus 8 per byte and is cheaper for history.

## What to add for Web3 product interviews

Web3 product interviews keep the same four areas and add a layer that tests whether you think in protocols, incentives, and public trade-offs. Hiring managers from protocols like Uniswap Labs, Aave, Chainlink, and Coinbase consistently filter for four things: crypto-native fluency, product judgment under public scrutiny, incentive design, and security awareness.

### 1. How Web3 product work differs

-**From users to owners.**Users are often token holders with governance rights. The feedback loop is not a private survey. It is a public forum with many voices, and large holders can sway outcomes.
-**From private roadmap to community governance.**Major changes may need a proposal, temperature check, and on-chain vote. You will write proposals on forums like Discourse, run Snapshot signaling votes, and accept that the community can reject or modify your plan. Timelocks and quorum thresholds are part of the product path.
-**From private data to public data.**On-chain activity, contract code, and token movements are visible to all. Tools like Etherscan, Dune Analytics, and DefiLlama are your product analytics stack along with off-chain signals like Discord and support tickets.
-**From competitive moat to composability.**Competitors can fork your code. Advantage comes from liquidity depth, integrations, brand trust, and community, not from keeping code private.
-**From reversible deploys to harder-to-reverse contracts.**A smart contract release is not a normal backend deploy. Once deployed, code may be immutable or upgradeable through a proxy with governance. Solidity 0.8.x added built-in overflow checks, but it does not fix access control, oracle risk, or incentive flaws. Audits freeze scope and add weeks.

If you suggest a chain, justify the trade-off. Ethereum mainnet chain ID 1 offers the deepest liquidity and security and higher fees. Arbitrum, Optimism, Base, and Polygon offer lower user cost, different ecosystem depth, bridge risk, sequencer assumptions, and tooling. See Ethereum docs for chain identifiers and the project docs for bridge and sequencer models before you recommend.

### 2. Tokenomics as product design

Token design affects user behavior directly. Be ready to discuss:

-**Token types:**utility tokens that pay for a service like gas or oracle calls, security tokens that represent ownership and fall under securities rules, governance tokens that grant voting rights such as COMP, UNI, and AAVE. Many tokens blend functions.
-**Distribution and supply:**fixed versus inflationary, initial distribution, airdrops, and emission schedules. A fast emission can bootstrap growth then create sell pressure.
-**Vesting and lockups:**how team, investor, and community allocations vest over time. Short vesting can align early growth but risks concentration. Longer vesting aligns long term.
-**Staking and ve-tokenomics:**vote-escrowed models where locking tokens increases voting weight and rewards, pioneered by Curve. Discuss how lock duration affects commitment and how it changes governance power.
-**Incentives and sustainability:**how you reward liquidity, activity, or contribution without creating farm-and-dump loops. Mention fee sharing, buybacks, or staking rewards only if you can explain the source of value.
-**Value capture and risk:**how value flows to holders, what causes death spirals, and how you would monitor token velocity and holder concentration.

An interview prompt you will see is to design healthy market dynamics for token trading between buyers and sellers. A strong answer covers liquidity, spread, oracle integrity, and abuse resistance, not just a feature list.

### 3. Governance you can whiteboard

Know the basic stack: Governor contract for proposals, Timelock for delay between passing and execution, token with delegation support such as ERC-20Votes, off-chain Discourse for discussion, Snapshot for gasless signaling, and an on-chain frontend for votes. Then discuss trade-offs:

- Voter apathy addressed by delegation and vote incentives
- Plutocracy risk measured by voting power Gini coefficient
- Ambush attacks addressed by quorum thresholds and timelows that allow a pause
- Emergency paths that can bypass normal flow, with clear limits

A typical question is how you would handle a harmful governance proposal. A strong answer does not say you would run an A/B test on sentiment. It models the impact on voter concentration, writes a data-backed counterproposal with Dune queries, educates the community, and respects the final vote while noting timelock options. See Compound, Uniswap, and Aave governance docs for the official flow.

### 4. Security as a product requirement

Interviewers treat security as the primary filter for Web3 PMs. Walk through:

-**Before launch:**scope freeze for auditors, bug bounty, tests and fuzzing, access control checks
-**Launch constraints:**upgrade pattern choice. Transparent proxy versus UUPS. State layout risk and storage collisions in both. Whether a pause function exists. Gas cost per user action. If gas is high, can you batch or use a layer 2.
-**After launch:**monitoring for abnormal withdrawals, oracle changes, and contract events. Who watches. What triggers a pause. How you communicate without publishing exploit details too early. How you remediate and write a public postmortem.

Be ready for an exploit question: walk through detect, triage, contain, communicate, remediate. Note that an immutable contract can be the right choice for trust minimization but it limits your containment options.

### 5. Metrics that matter for protocols

Do not default to DAU and funnels only. For protocols interviewers expect:

- On-chain: active wallets, transaction count, retention by cohort, volume, total value locked, fee revenue, failed transaction rate, wallet connection success rate
- Network health: validator decentralization, finality time, liquidation waterfall speed, collateralization ratio floor for stablecoins, staking APR versus validator churn
- Governance: participation rate, but more important voting power concentration and quorum manipulation risk, proposal pass rate, time from proposal to execution
- Community health: active contributors not just total members, organic content by non-team members

When you define success for a swap fee change or a bridge, tie it to both user impact and protocol health. State your north star and two guardrails.

## How to prepare: a plan you can follow

Adjust the hours, but keep the order. This assumes 10 to 15 hours per week.**Weeks 1 to 2: foundations and setup.**Read the Meta Careers PM prep page, Lewis Lin on CIRCLES and RICE, and Exponent on Web3 product. Set up a portfolio hub: a short writing page, a Dune dashboard, and a GitHub with a small product case. Start using the products you will be asked about. For Web3, set up a wallet such as MetaMask, try a swap on Uniswap or another DEX with a small test amount, bridge a small amount and note where the experience feels unsafe, read a governance proposal, and explore Etherscan. Pick three protocols and write a one page critique for each: who the users are, what job it does, key metrics, what you would change, and why.**Weeks 3 to 4: product sense fluency.**Do 4 to 5 timed product sense cases per week. Use the CIRCLES structure without reading it verbatim. For each case write a one page debrief that notes user choice, pain chosen, solutions considered, and trade-offs. Record yourself for 2 minutes on why you picked that user and pain. If you cannot explain it, you cannot defend it. Add one Web3 case per week such as token listing, wallet onboarding, or chain choice.**Weeks 5 to 6: analytical and security depth.**Build 3 metric trees from scratch for products you use. Practice diagnosis daily: pick a real metric move you see in public dashboards and build a hypothesis tree. Read two audit reports or postmortems and note what the PM should have gated. Work through one governance case: take a real proposal, model who benefits, who pays, and how voting power shifts. Run Slither or read a security checklist even if you are not the engineer, so you can name the checks.**Weeks 7 to 8: interview simulation.**Do two full mocks per week where you talk while you solve. Mix one Web2 product improve prompt and one Web3 token or governance prompt. Time to 35 minutes for product sense, 30 for analytical. Record and review for long silent gaps and for hedging language. Refine five STAR stories to 90 seconds each. For each story write the metric you will quote and the alternative you considered.

Daily habit that helps most candidates: 35 minutes solving, 15 minutes writing the trade-off note, one small improvement to your portfolio artifact.

## Before, during, and after the interview**Before.**Research the company's chain, contracts, and recent governance votes. Read the job description line by line and map each requirement to a case or commit in your portfolio. Test your setup for remote rounds: camera, mic, shared doc, and a clean file you can open quickly. Prepare three good questions, such as what the typical review cycle looks like before a contract hits testnet, how product decisions that need governance are scheduled, and how the team measures success for this role in the first 90 days.**During.**State your assumptions out loud and keep your structure visible. Say I will pick new users because activation is the current constraint, here is the pain I prioritize, here are three solutions, here is what I would not do and why. When you call another system or contract, state the risk: I would pause this flow if a pause exists, I would put this behind a timelock, I would add an oracle health check. If you do not know, say so plainly and show how you would find out: I have not used that proxy variant, here is how I would check the OpenZeppelin docs and test for storage collision. Interviewers score honesty and debugging higher than a forced answer.**After.**Send a short thank you within 24 hours. Restate one specific topic you discussed and your next step if any. If the timeline passes, send a brief follow-up that references the stage you are in.

## Common red flags to avoid

- You jump to features before you name the user and the pain. This is the most common reason for a 2 in product sense.
- You treat Web3 metrics like SaaS metrics only. If you answer a protocol health question with DAU and funnels and never mention TVL, failed transaction rate, governance concentration, or security guardrails, you signal you have not internalized incentives.
- You cannot discuss tokenomics without hand waving. If you cannot contrast utility versus governance versus security tokens, explain vesting, or name a risk like plutocratic capture, you will not pass a Web3 product round.
- You ignore trade-offs. Every product decision has a cost. If you present an idea as purely positive without noting gas cost, audit delay, or community coordination cost, the panel will mark shallow thinking.
- You have not used the product. If you answer how to improve a wallet or an L2 app without having completed a swap, a bridge, and a governance read, it shows quickly. Web3 interviewers often ask which wallet you use, which RPC provider, and what you noticed in the flow.
- Poor communication: long silent working, jumping to code or contract details before the problem is framed, or claiming certainty where you should state an assumption and a test.

## Pros and cons to weigh**Pros of the standard product loop:**- Shows how you think and collaborate under time pressure, which predicts close work on the job
- Tests distinct skills separately, so a hiring committee gets a fuller picture than a single long case
- Rubrics make scoring more consistent than gut feel**Cons:**- Rewards recall and speed, which can favor recent interview prep over seasoned building
- Small slips in one round can be over-scored if the rubric is weak or the interviewer is rushed
- Web3 governance and security trade-offs are hard to assess in 45 minutes, so strong candidates can be cut on a narrow prompt**Pros of more open Web3-heavy loops:**- Closer to real work: you read proposals, check on-chain data, and write a clear recommendation for a community
- Lets you show community work: forum posts, Dune dashboards, and grant or governance contributions count as proof**Cons:**- Takes more unpaid time and is easier to delegate to tools, so reviewers now probe harder in a live follow-up where you must defend your take without notes
- Public scrutiny is higher. Your past posts and votes are visible, which helps if they are thoughtful and hurts if they are shallow

## FAQ**How many product cases should I practice?**Aim for 30 to 50 cases across the main types: product design, product improvement, metrics and diagnosis, estimation, and behavioral. That range covers most onsite banks if you also write a short debrief for each and can explain your choice without notes. Quality of debrief matters more than count.**How long does a real product interview take?**Most loops run 45 minutes per round, with 3 to 4 rounds onsite plus a 30 minute recruiter screen and a 45 minute phone screen. Expect 2 to 7 days between stages if scheduling is smooth, and 4 to 6 weeks from first contact to decision.**Do I need to code for a PM interview?**No. You do not need to write production Solidity, but you should be able to read a contract interface, explain what a function does, what events it emits, and what the upgrade and pause options are. Technical fluency is judged as clear trade-off thinking, not syntax recall.**Solidity or Rust first for Web3 PM prep?**Start with Solidity. Most new apps in 2026 deploy to an EVM chain or an EVM layer 2 first, and the job market reflects that. Add Rust after you can discuss EVM trade-offs and read basic contracts, especially if you target Solana or chain infrastructure.**Hardhat or Foundry for portfolio work?**Pick one and ship. Foundry is fast, tests are in Solidity, and fuzz is built in. Hardhat has a wider plugin ecosystem. Hardhat 3 runs Foundry-compatible Solidity tests, so many teams use both. For a PM portfolio, what matters is that you can show a deployed address on Sepolia with verified source, a README with how to run tests, and a note on what you would improve.**Which network should I use for a demo?**Sepolia, chain ID 11155111. It is the Ethereum general application testnet with broad faucet and tooling support. Hoodi is for validator testing. Holesky was shut down in September 2025.**What if I get stuck on a question?**Pause and state what you know. Offer two interpretations and walk through each. Ask for a hint. It is better to say I have not shipped that exact flow, here is how I would check the docs and test it, than to invent detail. Interviewers show in debriefs that they score debugging and assumption hygiene higher than bluffing.**How do I show Web3 motivation without sounding generic?**
Reference specifics: a protocol you use weekly, a governance vote you read or participated in, a Dune query you built, a bug or UX risk you noticed on a bridge, and a post or contribution you made. Weak answers talk about token prices or vague claims about where finance is headed. Strong answers name a problem that decentralization solves for your target user and how you would test it.

## Further reading

Check the primary sources behind the claims in this guide:

- Meta Careers at metacareers.com: preparing for your PM interview, onsite prep
- Lewis Lin at lewis-lin.com: CIRCLES Method for product design, RICE for prioritization, AARRR and AARM for metrics, Interview Math cheat sheet and DIGS for leadership stories
- Exponent at tryexponent.com: Web3 product management guide and PM interview questions
- Blockchain Council at blockchain-council.org: blockchain product manager interview tips for Web3 roles
- Ethereum docs at ethereum.org: accounts, transactions, gas, and chain identifiers
- Solidity docs at docs.soliditylang.org: language reference, security considerations, and visibility and data location
- OpenZeppelin docs at docs.openzeppelin.com: ERC-20, ERC-721, upgrade proxies and ReentrancyGuard
- The Graph docs at thegraph.com: subgraphs and indexing for dApps
- Scaffold-ETH 2 at docs.scaffoldeth.io: Next.js plus Wagmi plus Viem starter for a portfolio dApp
- Dune Analytics at dune.com and DefiLlama at defillama.com: on-chain data for dashboards and metric practice

If you can explain each choice in your portfolio without notes, handle a live edit that adds a guardrail metric or a timelock, and walk through a STAR story with a number and a lesson, you are ready for most product interviews in 2026.

## Verifiable Primary Sources & References

1. [Ethereum EIP-20 Token Standard Specification](https://eips.ethereum.org/EIPS/eip-20)
2. [Ethereum EIP-721 Non-Fungible Token Standard Specification](https://eips.ethereum.org/EIPS/eip-721)
3. [Ethereum Official Yellow Paper & Protocol Specification](https://ethereum.github.io/yellowpaper/paper.pdf)
4. [Ethereum Consensus Specs & Proof of Stake Architecture](https://github.com/ethereum/consensus-specs)
5. [Solidity Compiler Official Documentation & Language Spec](https://docs.soliditylang.org/)
6. [OpenZeppelin Smart Contract Standard Libraries & Security Audits](https://docs.openzeppelin.com/)
7. [Foundry Book Development & Testing Framework Documentation](https://book.getfoundry.sh/)
8. [Hardhat Ethereum Development Environment Documentation](https://hardhat.org/docs)
9. [Viem TypeScript Interface for Ethereum Specification](https://viem.sh/docs/getting-started)
10. [Ethers.js Complete Web3 Library Documentation](https://docs.ethers.org/)
