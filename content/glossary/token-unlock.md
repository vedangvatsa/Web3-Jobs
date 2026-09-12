---
term: Token Unlock
slug: token-unlock
category: governance
difficulty: Beginner
image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=80'
description: >-
  The release of previously locked or vested tokens according to a predetermined
  schedule, often affecting token supply, circulating supply, and market price
  dynamics.
relatedTerms:
  - vesting
  - tokenomics
  - governance-token
  - supply
synonyms:
  - token release
  - vesting schedule
  - token vesting
lastUpdated: 2026-09-04
---

Token unlock is the point at which restricted tokens become transferable or otherwise usable by their holder. Projects restrict allocations for founders, employees, investors, advisors, foundations, and ecosystem programs. The rules may be set by a vesting schedule, token contract, or legal agreement.

An unlock does not mean tokens were newly created. It changes the holder's access to tokens that may already be part of the total supply. It can increase the circulating supply if the previously restricted tokens can now be transferred and sold. The effect on reported circulating supply depends on the data provider's definition and whether the tokens are actually under a transfer restriction.

## How it works

A schedule defines an allocation, a start date, an optional cliff, and a release rate. A cliff is an initial period during which no tokens vest. After the cliff, tokens may unlock all at once or vest gradually each day, month, quarter, or block. A schedule can also have several releases.

For an on-chain schedule, a vesting contract holds tokens and records how much a beneficiary can claim at each time. The beneficiary calls a claim function, which transfers the vested amount. Some contracts transfer tokens automatically, while others make the holder claim. A contract can enforce a lock because it controls the token balance until release.

Not every restriction is enforced on-chain. An investor may receive tokens in a normal wallet but sign a contractual lockup. In that case, the token remains technically transferable. Enforcement depends on the agreement and the parties, not on the token contract. A project can also use multisignature custody to hold a restricted allocation, which adds operational controls but is not identical to cryptographic vesting.

Projects often give different groups different schedules. A community distribution may be available immediately. A team allocation may have a one-year cliff followed by monthly vesting. A foundation may receive a controlled treasury allocation that is not sold but can be used for grants, liquidity, or operations. To understand an unlock, the allocation category and the actual transfer restriction matter as much as the calendar date.

## Concrete example

A project has a fixed supply of 100 million tokens. It assigns 20 million to its team under a four-year schedule with a one-year cliff and then monthly vesting. During the first year, team members can claim none of those tokens. At the one-year date, 5 million tokens become vested if the schedule releases one quarter at the cliff. The remaining 15 million vest in 36 equal monthly portions, about 416,667 tokens per month.

The 5 million token event is called an unlock. It does not require team members to sell. Some may keep the tokens, use them for governance, or leave them unclaimed. If the vesting contract transfers them into personal wallets, observers can see the claims on-chain. If the restriction is contractual, public data may show the allocation but not prove whether a holder transferred it.

## Limitations and risks

Unlock dates alone do not predict a token's price. Markets may have already priced in a public schedule. Holders may not sell, may have hedged exposure, or may be unable to sell much without moving a thin market. Demand, liquidity, market conditions, token utility, and expectations about future supply all affect the result.

Reported numbers can be misleading. Total supply, max supply, circulating supply, vested supply, unlocked supply, and claimed supply are different measures. A dashboard may call an allocation "unlocked" because it is no longer contractually restricted, while another may exclude it from circulating supply because the foundation still controls it. The underlying token contract and official allocation documents are more informative than a single percentage.

Schedules can change. Governance or a company may amend an agreement, move tokens between wallets, extend a lock, or advance a release. Contract upgrade authority, multisignature control, and unclear documentation create additional risk. A vesting contract can also contain implementation bugs or privileged functions that let an administrator alter recipients or dates.

## Relevant distinctions

Vesting is the process by which a holder earns the right to tokens over time or after conditions are met. An unlock is the release event that makes a vested amount accessible. The terms are often used loosely, but a token can vest before it can be transferred if there is a further lock.

A cliff is not an ongoing vesting rate. It is the initial no-release period. A cliff release may be immediate and large, while linear vesting releases equal portions over time. A revocable grant can be different again, because unvested tokens may return to the issuer when a contributor leaves.

An unlock also differs from an emissions schedule. Emissions describe new tokens entering supply through mining, staking rewards, or issuance. Unlocks generally release an existing allocation that was already counted in total supply.
