---
title: Who's in Charge? Governing Agentic AI Systems
image: /images/anton-maksimov-5642-su-MSzGw5V0ui8-unsplash.jpg
data-ai-hint: ai governance robot
description: >-
  A practical framework for assigning authority, constraining actions, testing
  risks, and responding to failures in agentic AI systems.
category: Industry Insights
publishedDate: '2026-03-11'
lastUpdated: "2026-09-12"
---

An agentic AI system is software that can pursue a task through several steps: it receives a goal, selects or calls tools, reads results, and decides what to do next. The model is only one part of that system. The surrounding application may give it access to customer records, a code repository, a browser, an email account, a payment API, or a wallet. Governance is the set of decisions and technical controls that determine who may grant that authority, what the agent may do, how its actions are checked, and who must act when it fails.

This guide is for product owners, security engineers, protocol contributors, and operators who are considering agents that can affect money, access, data, or external systems. It is not a case for treating every chatbot as a regulated high-risk system. A drafting assistant with no external tools needs a different control set from an agent that can submit transactions from a treasury or change cloud infrastructure. The [OECD definition of an AI system](https://oecd.ai/en/ai-principles) recognizes that systems vary in autonomy and adaptiveness after deployment. Governance should vary with the authority actually delegated, the possible harm, and the ability to reverse an action.

## What must be governed

An agent does not need consciousness or independent legal status to create an accountability problem. A person or organization decides its purpose, deploys it, connects its tools, sets its budgets, and accepts or ignores its outputs. Those choices identify accountable humans and legal entities. Calling a system autonomous must not obscure that chain of delegation.

Start by describing the complete action path rather than the model in isolation:

1. **Goal and trigger.** Who can instruct the agent, and can a webhook, schedule, or another agent start work without a person present?
2. **Context.** What prompts, documents, memories, API responses, and third-party web content can influence its next step?
3. **Decision.** Which model, version, system prompt, planner, and policy rules were in effect?
4. **Action.** Which tools can it call, with which parameters, credentials, rate limits, spending limits, and destinations?
5. **Effect and recovery.** What changes outside the system, how quickly can they be detected, and can they be reversed, paused, or compensated?

This inventory exposes risks that a model evaluation alone will miss. An agent that can read untrusted support tickets and call an administrative API has a different attack surface from one that only summarizes the same tickets. A persuasive model output is not itself a security incident; an unvalidated output that becomes a database query, a payment instruction, or a smart-contract call can be.

The [NIST AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework) is voluntary guidance for managing risks to people, organizations, and society through AI design, development, use, and evaluation. Its four functions, Govern, Map, Measure, and Manage, are useful here because they make governance a continuing operating practice rather than a one-time model approval. NIST's [Generative AI Profile](https://doi.org/10.6028/NIST.AI.600-1) also identifies risks relevant to systems that generate or act on content, including confabulation, data privacy, information integrity, and harmful bias.

## Assign authority before granting access

Every production agent needs a named business owner and a named technical owner. The business owner accepts the intended use, the affected users, the financial or operational exposure, and the conditions under which the agent should stop. The technical owner maintains the implementation, dependencies, evaluation evidence, logging, and emergency controls. Security, privacy, legal, and domain specialists should review systems when their risk area is involved, but a committee is not an owner. An incident cannot wait for an ambiguous vote.

Write an authority matrix that names the humans or roles allowed to do each of the following: change the system prompt or model; add a tool; issue or rotate credentials; alter a policy or spending limit; approve an exceptional action; pause the service; and declare recovery complete. Keep the matrix with the system record and require review when an integration or permission changes.

Separate policy from execution. A protocol governance vote may establish that a treasury agent may keep a target allocation, for example. That vote should not give an LLM an unrestricted signing key. The executable policy should instead define an allowlist of assets and venues, maximum order size, maximum price deviation, daily loss or exposure limits, required price sources, and the signatures needed above each threshold. The agent may propose a transaction inside those bounds; a policy engine, smart contract, or human approver decides whether the transaction is authorized.

Least privilege is the practical baseline. Give an agent a narrow service identity, not a shared administrator account. Use separate credentials for reading, staging, and production. Scope API tokens to individual tools and endpoints; set expiration, quotas, destination allowlists, and transaction value limits; and remove access when a task or deployment ends. For wallet operations, do not put a seed phrase or broad signing key in an agent's prompt, memory, or environment. A dedicated signer or multisignature policy can verify the requested transaction against independently defined limits before it signs.

## Design controls around the action boundary

The model should not be the final authorization point for consequential actions. Put deterministic checks between a model's proposed tool call and the tool's effect. A useful action gateway validates the caller identity, schema, parameters, policy version, destination, and current budget. It can reject calls outside the approved tool set even when the model has been manipulated into asking for them.

Treat all retrieved content as data, not instructions. A webpage, a document in a retrieval system, a calendar invitation, or an API response may contain text intended to redirect the agent. OWASP identifies prompt injection, insecure output handling, excessive agency, and overreliance as material risks in LLM applications in its [Top 10 guidance](https://owasp.org/www-project-top-10-for-large-language-model-applications/). The appropriate response is not a prompt that tells the model to ignore malicious text. Isolate untrusted content, label its source, do not let it directly choose tools or credentials, and validate every external action outside the model.

For actions that create irreversible consequences, use staged execution. A code agent can open a pull request but cannot merge it. A customer-service agent can draft a refund but cannot release funds above a limit. A trading agent can assemble a transaction but must obtain a policy-engine approval or designated signer. Staging adds delay and operating cost, but it keeps a plausible sentence from becoming an irreversible action.

Human oversight must be designed for the actual workflow. A person who receives hundreds of opaque approval prompts will either rubber-stamp them or block useful work. Show the reviewer the intended action, inputs and source provenance, policy checks, material alternatives, value at risk, and the exact irreversible effect. Route only decisions that a trained reviewer can meaningfully assess, set a response deadline, and define a safe default when the deadline passes. Under the EU AI Act, high-risk AI systems must be designed so that natural persons can effectively oversee them, including the ability to intervene or interrupt the system through a stop button or similar procedure; see [Article 14 of Regulation (EU) 2024/1689](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=OJ:L_202401689).

## Map risks to evidence and tests

Risk mapping should begin with a concrete scenario: an attacker places instructions in a document, the agent retrieves them, the agent calls a tool with elevated access, and the tool changes a production setting. For each scenario, record the affected people or assets, preconditions, likely controls, residual risk, owner, and evidence that the control works. This gives a team something reviewable instead of a generic statement that the system is safe.

Test the whole agent loop in an environment that resembles production. Include adversarial documents and tool outputs, ambiguous user requests, malformed arguments, stale or conflicting data, unexpected tool failures, account compromise, and model-provider outages. Measure more than task completion. Track unauthorized tool-call attempts blocked by the gateway, approval overrides, policy violations, false approvals and false rejections, latency to pause, recovery time, and cost or transaction exposure. Re-run the tests after changing a model, system prompt, retrieval corpus, tool schema, policy, or authentication method.

Keep a release record that can answer basic forensic questions: which model and prompt versions ran; which tools and permissions were available; which policy authorized an action; what inputs materially influenced it; what action was proposed and executed; and who approved an exception. Logs need integrity protection and access controls because they can contain personal data, secrets, or sensitive business content. Retention should be justified by incident, legal, and audit needs rather than assumed to be indefinite.

For high-risk uses in the EU, documentation and logs are legal requirements rather than optional engineering artifacts. The AI Act's requirements include risk management, data and data-governance measures, technical documentation, automatic record-keeping, transparency, human oversight, accuracy, robustness, and cybersecurity in [Articles 9 through 15](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=OJ:L_202401689). Whether a particular agent is in scope or high risk depends on its intended purpose and deployment. Recruiting, worker management, credit decisions, certain public services, and safety components are among the use cases listed in Annex III; a general-purpose agent is not automatically high risk because it uses a language model.

## Use Web3 mechanisms for the controls they can actually provide

Blockchains and DAOs can be useful governance components, but neither supplies judgment, secure inputs, or legal accountability by itself. An on-chain record can make a submitted transaction history difficult to alter under the network's security assumptions. It cannot prove that an off-chain market price was correct, that an agent read the intended document, or that a token vote represented informed consent. A public log may also be inappropriate for prompts, customer data, or confidential security events.

For a DeFi treasury agent, a practical arrangement is a layered one:

1. A DAO or designated governance body adopts the risk mandate and selects accountable operators.
2. A versioned on-chain policy contract enforces objective constraints such as allowed assets, venue allowlists, caps, time locks, and multisignature thresholds.
3. The agent has an off-chain service identity that can propose a transaction only through that contract or a constrained transaction builder.
4. Independent monitoring watches executed transactions, policy changes, oracle conditions, and anomalous proposals; a separate emergency authority can pause or reduce permissions.
5. Post-incident review connects the proposal, approvals, on-chain execution, and off-chain logs without publishing secrets.

Cryptographic proofs can reduce what an auditor needs to trust, but the claim must be precise. A zero-knowledge proof might show that a transaction satisfies a formally encoded range, balance, or allowlist constraint without revealing a private input. It does not show that the encoded constraint was the right risk policy, that the oracle input was truthful, or that the agent's reasoning was fair. Likewise, a signed provenance record can bind a tool response to a key, but it does not establish that the source was accurate. Treat cryptography as evidence about a stated predicate, not evidence that the whole system behaved responsibly.

DAO voting needs its own threat model. Concentrated voting power, low turnout, rushed proposals, governance-token borrowing, and compromised delegates can make a nominally decentralized control weak. For emergency changes, use a narrowly scoped guardian authority with a short expiry, clear public notice, and subsequent ratification or review. For ordinary risk-policy changes, a time lock gives monitors and users an opportunity to inspect the effect before it becomes active.

## Run governance as an operating process

Use the NIST functions as a small operating cycle:

1. **Govern:** assign owners, define risk appetite, establish escalation paths, train reviewers, and approve the authority matrix.
2. **Map:** document the intended use, people affected, data flows, tools, dependencies, jurisdictions, failure modes, and reversibility of actions.
3. **Measure:** run task, safety, security, and fairness evaluations; red-team prompt injection and tool misuse; and collect production signals against defined thresholds.
4. **Manage:** restrict, redesign, monitor, pause, or retire the agent when measured risk exceeds the approved limit.

The [OECD AI Principles](https://oecd.ai/en/ai-principles) supply a useful policy check across this process: human rights and fairness, privacy, transparency and explainability, robustness, security and safety, and accountability. They are not a compliance checklist. They require a team to state which people may be harmed, what evidence is available, and which actor is responsible for correcting a failure.

Prepare incident response before allowing consequential actions. Define severity levels, a 24-hour contact path for the technical and business owners, the method for revoking credentials, the pause procedure, evidence preservation, user or counterparty notification duties, and the criteria for restoring service. Drill the process. A kill switch that requires a missing key holder, an unavailable administrator, or a disputed DAO vote is not a dependable emergency control.

## A practical first deployment

For a new agent, begin with one bounded workflow and no authority to make irreversible changes. Build a test environment with fake accounts or testnet assets. Give the agent read-only access first, then allow it to create drafts or proposals, then add a low-value action with deterministic constraints. Expand access only after the corresponding tests, monitoring, ownership, and recovery path exist.

A minimum launch packet should include the intended use and prohibited uses; owners and approval roles; model, prompt, and tool versions; a data-flow diagram; permission inventory; evaluation and red-team results; policy thresholds; dashboard and alert definitions; incident runbook; and a scheduled review date. Revisit the packet after each material change. Replacing a model or adding a browser connector can change the system's behavior and authority enough to require a new approval.

## FAQ

### Can a DAO be accountable for an AI agent?

A DAO can set protocol rules, vote on budgets, and operate smart-contract controls. Legal responsibility depends on the jurisdiction, the people and entities involved, and the activity. For operational purposes, name individual or organizational owners for deployment, security response, and permissions even if a DAO sets the high-level mandate. A governance token does not respond to an incident.

### Is an audit trail enough to govern an agent?

No. A log supports reconstruction and accountability after an event, but it does not prevent an agent from making an unsafe call. Pair logs with constrained identities, action gateways, policy checks, approval paths, monitoring, and a tested pause mechanism.

### Should every action require human approval?

No. Approval is most useful when the action is high impact, novel, outside an approved pattern, or hard to reverse. Repetitive low-risk actions can be automated within narrow, monitored limits. If a reviewer cannot evaluate the action from the information shown, adding an approval button only transfers risk without meaningful control.

### What is the first control to add to an agent with tools?

Remove broad credentials and place an authorization layer between the agent and every consequential tool. Require a typed action schema and enforce allowlists, parameter bounds, budgets, and destination restrictions there. This reduces the damage possible from a bad model output, a prompt injection, or a compromised session.
