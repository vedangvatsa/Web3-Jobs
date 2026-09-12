---
title: Blockchain Hackathon Preparation and Winning Strategies
image: /images/nasa-1lfI7wkGWZ4-unsplash.jpg
data-ai-hint: hackathon team coding
description: >-
  Prepare for a blockchain hackathon by reading the rules, choosing a buildable
  problem, testing the contract boundary, documenting your work, and showing a
  complete demo.
category: Educational
publishedDate: '2026-03-11'
lastUpdated: "2026-09-12"
---

A blockchain hackathon is a constrained build and submission exercise. The constraint is the point. You have limited time, unfamiliar APIs, changing requirements, teammates with different habits, sponsor tracks, and a final submission that must explain a working result. A good hackathon project is small enough to finish, clear enough to demonstrate, and honest about what it does not solve.

Do not assume every event uses the same schedule, prize rules, team limits, or treatment of pre-existing code. Read the event page, submission form, and rules for the exact event before choosing an idea. For example, the [ETHGlobal Cannes 2026 page](https://ethglobal.com/events/cannes2026) listed a three-day in-person event, protocol partners, technical workshops, mentors, and sponsor prizes. Those details describe that event, not a permanent template for every blockchain hackathon.

Rules can affect the work more than the technology choice. ETHGlobal's [event rules](https://ethglobal.com/rules) distinguish a Classic "From Scratch" track, where project-specific code, designs, and assets must begin when hacking starts, from continuity tracks that allow work on an existing codebase under disclosure conditions. The rules require version control throughout the event and warn that a repository consisting of a single large commit can be presumed ineligible until proven otherwise. A strong demo cannot repair a submission that violates the relevant track rules.

## Pick the Event Before the Stack

Start with the published brief. Save the application deadline, kickoff time, submission deadline, required fields, judging process, sponsor tracks, API terms, code-of-conduct rules, and any requirement for an in-person check-in. Put the source links in a team document. Organizers can change pages, and teammates should not rely on one person's memory of a Discord message.

Read each bounty as a specification. Write down the required product, technical integration, network, contract, SDK, proof, and submission material. A sponsor may ask for a deployed integration, a particular API call, an open-source repository, a video, or a written explanation. If the wording is unclear, ask the sponsor mentor before committing the project to that track. "Uses the protocol" is not a specification.

Pick an event that fits the work you can actually do. An in-person event rewards rapid conversation with mentors and teammates, but it also has travel and time-zone constraints. An online event gives more location flexibility but requires deliberate async coordination. A new developer can still enter either setting. ETHGlobal's rules describe its events as collaboration and learning spaces, and its published event pages include beginner workshops and team-formation sessions. Take advantage of those structures rather than waiting until the first evening to find a team or choose a tool.

Do not choose an idea because a prize amount looks large. A sponsor track may be technically narrow, and a rushed integration can add failure points. Choose a track when its required component makes the product clearer or gives the project a useful capability. If your best idea does not need the sponsor's protocol, do not force it into the architecture merely to qualify for a bounty.

## Set Up Before Hacking Starts

Preparation does not mean writing project-specific code before a from-scratch event permits it. It means learning the tools, securing accounts, and removing avoidable installation failures. The boundary matters. A generic local development setup, a practice contract written before the event, and a general-purpose wallet configuration are different from a polished application built around the eventual hackathon prompt. If the event has strict rules, ask organizers where they draw that line.

Install the toolchain on the machine you will use. Confirm that Node.js, your package manager, Git, a code editor, and the contract framework launch correctly. Create a disposable local practice project. Compile a contract, run tests, start a local chain, connect a browser wallet, and deploy a simple contract to a test network. Do this days before the event, when an RPC problem or operating-system permission issue is cheap to fix.

Foundry is one common Solidity-first toolchain. Its [getting-started guide](https://getfoundry.sh/introduction/getting-started/) documents `forge` for building, testing, debugging, deploying, and verifying; `cast` for contract interactions and chain queries; and `anvil` for a local Ethereum node. You do not need to adopt every tool at once. You do need a path from contract source to repeatable test to deployment before the project has an audience waiting.

Set up test wallets with no valuable funds. Keep seed phrases and private keys out of chat, screenshots, repositories, and slide decks. Give each teammate their own development account when possible. Add `.env` files to `.gitignore`, commit an `.env.example` with variable names only, and check the staged diff before the first push. A leaked test key can still create confusion, expose an API account, or teach careless habits.

Make a short team starter pack:

- A repository with the license, README skeleton, formatter, linter, and CI command that your track permits.
- A document containing the event rules, sponsor links, RPC endpoints, testnet faucets, contract addresses, and support channels.
- A task board with columns for blocked, ready, in progress, review, and done.
- A shared note for decisions, including network choice, contract address, deployment command, and changes to the demo flow.
- A communication channel with a named owner for the submission form and an agreed time to check it before the deadline.

Keep this preparation generic when rules require a fresh build. The goal is to avoid spending the opening hours reinstalling dependencies, not to conceal pre-existing project work.

## Form a Team Around Responsibilities

A team needs coverage, not a list of titles. Someone must own the contract boundary. Someone must make the user path work in the interface. Someone must handle product decisions and the submission. One person can cover more than one responsibility. A four-person team with no owner for the demo can still miss the deadline.

Talk about working style before assigning tickets. Ask what each person has shipped, what they want to learn, when they will sleep, what they can own without supervision, and how they prefer to receive feedback. Agree on a default communication method. A team that needs a vote for every small change will lose time. A team with no decision process will build incompatible pieces.

Choose a technical lead for each system boundary. The contract lead owns interfaces, deployment, tests, and contract addresses. The frontend lead owns wallet flow, network handling, loading states, errors, and the demo path. The product or design lead owns the user problem, screen order, copy, submission description, and pitch. If there is a backend, indexing, or data component, assign its data source and operational limit to one person. Put names next to each responsibility in the shared note.

Use a written interface between tasks. If the contract exposes `createClaim`, `claim`, and `cancel`, record the parameter types, emitted events, access rules, expected reverts, and deployed address. The frontend should not learn an ABI by reading unreviewed contract code halfway through the night. The contract developer should not change a function name without telling the person preparing the demo.

Keep branches small and review changes that affect shared interfaces. Git history is part of the record. ETHGlobal's rules state that continuity submissions must document pre-existing work in the repository history, video, and description, and that new work must remain open source. Even where an organizer does not impose that policy, legible commits make it easier to explain what the team built and recover from a broken merge.

## Turn an Idea Into a Narrow User Flow

Start with a person and a moment. "A marketplace for everything" is not a user flow. "A community treasurer needs two signers to release a small testnet grant" is a user flow. "A collector wants to prove they hold a particular credential without displaying every wallet holding" is a user flow. "A user needs to revoke a stale token approval after seeing the spender address" is a user flow.

Write one sentence that names the user, their action, and the result. Then write the smallest sequence that makes the result happen. For a grant tool, the sequence might be: a proposer creates a test request, designated signers approve it, and the contract records that the payment is available. The first demo does not need proposals, voting delegation, fiat payments, mobile notifications, analytics, social profiles, multiple chains, a token, and a DAO governance system.

Draw the sequence on paper before opening a new repository. Mark each step as onchain, offchain, or user-provided. This exposes needless smart contracts. A public leaderboard may need event indexing but no token. A private note application may need encryption and ordinary storage, not a public chain. A payment escrow may need contract state, while a project directory may only need verified addresses and a searchable index.

Define a "must work" list of two or three actions. Each action should produce visible evidence. A user connects a wallet on the right network. A user sends one transaction. The interface reads the resulting state or event and updates. Anything outside that sequence is optional. Optional features are only added after the required path works on a second machine or wallet.

State the trust boundary in the README. If a server signs a message, say so. If an offchain index controls what appears in a list, say so. If a contract administrator can pause or change a setting, name that permission. If a testnet deployment uses mock assets, say that it cannot be treated as a live financial product. Clear limits are evidence of judgment, not an admission of failure.

## Build the Vertical Slice First

Build one complete path through the project before splitting into polish work. For an EVM application, that means a minimal contract, a deployment, a frontend call, a wallet signature, a transaction receipt, and a visible result. The UI can be plain. The contract can have a narrow feature set. The path must work from a fresh browser session.

Create the contract interface early, then write tests before adding a large frontend. A contract that compiles is not ready for a demo. Ethereum's [smart-contract testing guide](https://ethereum.org/developers/docs/smart-contracts/testing/) says testing before mainnet deployment is a minimum security requirement because deployed code is difficult to change and an attacker may discover an error first. The same discipline matters on a hackathon testnet. A failed demo transaction wastes time and confuses judges even when no real funds are at risk.

Write tests for the intended call and the prohibited calls. If only a grant recipient can claim, test the recipient claim and a non-recipient rejection. If a claim can happen once, test a second claim. If an action has a deadline, test before, at, and after the deadline. If the contract calls another contract, test the external-call failure path. These cases are usually faster to write than to explain away during a live demo.

Use a local development network while the interface is changing rapidly. Ethereum's [development-network guide](https://ethereum.org/developers/docs/development-networks/) notes that local chains can seed deterministic accounts, create blocks immediately, and offer debugging tools. Deploy to the event's testnet once the local path works. Save the network, RPC URL name, deployed address, transaction hash, compiler settings, and contract verification status in the project note.

Avoid inventing foundational code under time pressure. OpenZeppelin Contracts provides maintained implementations of common token standards and permission patterns. Its [documentation](https://docs.openzeppelin.com/contracts/5.x/) recommends importing installed library code rather than copy-pasting it from a web page. Use a tagged release, understand inherited behavior, and add only the project-specific logic. Do not add an ERC-20 or ERC-721 merely because the library makes deployment easy. Every extra asset and permission adds states that need tests and explanation.

Keep a deliberate code freeze. When the vertical slice works, stop changing the contract interface unless a defect blocks the required user flow. At that point, improve error messages, empty states, transaction pending states, and the visual path the demo will use. A half-built feature added near submission time is more likely to break a working path than improve the project.

## Use Mentors and Workshops as Engineering Inputs

Sponsor workshops are useful when they answer a current technical question. Attend the session for the exact SDK, network, or protocol your project uses. Take notes on setup steps, version requirements, test endpoints, and known constraints. Then test the integration immediately. A workshop watched without touching the code can leave a team with false confidence.

Ask mentors concise questions that include context. "Our contract calls this method on this network, the transaction reverts with this error, and we expected this state change. Which assumption should we check first?" gives a mentor something actionable. "Our project is broken" does not. Bring the contract address, repository branch, error text, and minimal reproduction. If you changed the code after asking, say so before they inspect it.

Mentors can explain an API or a protocol's intended flow. They cannot replace your threat model. A sponsor integration that meets bounty criteria may still expose a bad approval flow, an unchecked return value, or an administrator permission that the team has not documented. Keep the project's security boundary under your own review.

Respect the event community while asking for help. ETHGlobal's code of conduct requires respect and courtesy from attendees, sponsors, judges, mentors, volunteers, and organizers, and it gives organizers authority to respond to violations [in the published rules](https://ethglobal.com/rules). Treat mentors as collaborators with limited time. Share a clear problem, test the advice, and report back on the result.

## Prepare the Submission Before the Final Hour

Open the submission form early and fill in every field you can verify. Submission systems often require a project name, short description, repository, demo link, team members, tracks, contract address, and screenshots. Do not leave the first form submission to the final minutes, when a video upload, account permission, or teammate confirmation can block the team.

The project description should name the user problem, the complete action demonstrated, the technical components, and the limits. Avoid claims that the project is secure, decentralized, production-ready, or ready to manage user funds unless the team has evidence for each claim. If it is a testnet prototype, say that. If data comes from a mock or a centralized service, say that. If a sponsor integration only covers one contract method, name the method.

Document the repository so a judge can run it without a private conversation. Include installation commands, environment variable names, local test commands, network configuration, deployment steps, and the public testnet contract address. State the supported wallet and browser if the demo depends on them. Keep a fallback mode in which the app can display the existing deployment and transaction hashes even if a faucet or RPC endpoint is unavailable.

Video should show a complete sequence, not a slideshow of browser tabs. Start with the user problem. Show the application in a fresh state. Connect a wallet and show the required network. Complete the core action. Wait for the transaction result or show a prepared completed transaction with the explorer link. Show the updated state. End with the repository and contract address. If live network conditions are unreliable, record the working sequence before the final presentation and keep a local demonstration ready.

Do not hide awkward details in the pitch. Explain the permission model, mock data, testnet status, offchain dependency, and unbuilt feature in one direct sentence. A judge can distinguish an intentional prototype boundary from a team that does not understand its own system. The best response to a hard question is evidence: a test, contract source, transaction hash, architecture diagram, or known limitation.

## Keep Work After the Event

The project can remain useful even without a prize. Clean the README after the event. Replace temporary secrets and expired endpoints. Tag the submission commit. Write a short changelog that separates what worked in the demo, what was mocked, what remains unsafe, and what you would change with more time. A future collaborator should not have to reconstruct the hackathon from abandoned branches and chat messages.

If you continue the project, re-evaluate its threat model before moving from a testnet to a network with valuable assets. Ethereum's testing documentation warns that testing cannot guarantee functional correctness for every possible input and that independent review, audit work, or a bug bounty can add scrutiny. A test suite from a weekend is a starting point for more work, not a release certificate.

Keep the ownership terms in view as well. ETHGlobal's rules say participants own developments made during the event, while third-party materials such as partner APIs remain subject to their owners' licenses and terms. The same rules say ideas may be shared freely at the event and that participants decide what information to disclose. Read the license of every dependency and document any third-party service the project requires before presenting it as reusable open-source work.
