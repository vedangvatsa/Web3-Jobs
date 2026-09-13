---
title: 'Quadratic Funding for Public Goods'
ogTitle: "QUADRATIC FUNDING FOR PUBLIC GOODS"
image: /images/anton-maksimov-5642-su-MSzGw5V0ui8-unsplash.jpg
data-ai-hint: fairness balance scale
description: >-
  A deep dive into Quadratic Funding, the new mechanism that uses a matching
  pool to amplify the power of small community donations, creating a more.
category: Industry Insights
publishedDate: '2026-03-11'
lastUpdated: "2026-09-13"
---

Quadratic funding is a rule for dividing a fixed matching pool among projects. It gives extra weight to broad support: many small donations can earn more matching money than the same dollar total from one donor. It is most often discussed for public goods such as open-source software, research, documentation, local projects, and shared infrastructure.

The mechanism does not decide whether a project is good. It measures a particular signal: how many independently verified people chose to support it, and by how much. That makes its assumptions and defenses as important as the formula.

## Why ordinary donations miss a public-good problem

Economists call something a public good when people can benefit without being easily excluded and one person's use does not substantially reduce another's. Street lighting is a standard example. In software, a security library, a specification, a public RPC endpoint, or good documentation can have similar features. A company may depend on it without paying the maintainer.

This creates a free-rider problem. Each person may prefer the good to exist, but their individual reason to pay is weak because they can expect others to pay. The [Stanford Encyclopedia of Philosophy entry on public goods](https://plato.stanford.edu/entries/public-goods/) explains the underlying collective-action problem and why voluntary provision can be below what a group wants.

Private donations still fund useful work. Grants, government procurement, philanthropy, sponsorship, and subscriptions each have a role. They also give different people control. A foundation can select excellent work, but its staff and donors determine the allocation. A popularity contest can show broad interest, but it may not pay for an unpopular security fix that is necessary. Quadratic funding is one allocation tool, not a replacement for every funding model.

## The rule in plain numbers

For each project, quadratic funding first adds the square root of every contribution. It then squares that sum. In its ideal form, the amount from the matching pool is based on that result minus the direct donations, adjusted so every project's match fits within the available pool.

The original paper, ["Liberal Radicalism," by Vitalik Buterin, Zoe Hitzig, and E. Glen Weyl](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=3243656), presents the mechanism as a way to finance public goods. A compact expression is:

`match for project i is proportional to (sum of sqrt(contribution)) squared, minus direct contributions`

The square root is the important part. A larger gift still counts more, but its extra influence grows slowly. A $100 gift contributes 10 to the square-root sum. Four $25 gifts contribute 20 in total because each contributes 5. When the final sum is squared, the difference becomes large.

Consider two projects before the pool is scaled. Project Cedar gets one $100 donation. Its score is `(sqrt(100))^2 = 100`, leaving no theoretical match after its direct donation. Project River gets one hundred $1 donations. Its score is `(100 x sqrt(1))^2 = 10,000`. After subtracting its $100 in direct donations, its theoretical match is 9,900.

Real rounds cannot pay 9,900 dollars for every 100-dollar project. The matching pool may be $20,000, while theoretical matches across all projects could total millions. The operator therefore scales the calculated matches down proportionally or uses a specified budget-cap method. The example illustrates the preference signal, not a promise about a final payout.

## What the mechanism is trying to measure

Quadratic funding treats a contribution as two signals. The amount says something about intensity. The number of contributors says something about breadth. The formula assumes that many separate people making small sacrifices is evidence that a project serves a wider group than a large payment from one person.

That assumption can be reasonable for public goods. If fifty developers each give a small amount to a widely used testing tool, their gifts may reveal demand that a procurement process missed. The matching pool turns that distributed signal into more money for the maintainer.

It is not a general rule for every decision. A hospital buying an MRI should not allocate its budget based on micro-donations. A security council responding to an exploit needs accountable authority and speed. A research fund may need peer review to identify work whose value will not be obvious to a large immediate audience. Quadratic funding works best when a group wants to surface broad preferences and can accept the cost of identity checks and round administration.

## A matching pool is money with governance around it

The pool does not appear automatically. A foundation, protocol treasury, company, city, or donor supplies it. That party must decide the total amount, eligible projects, donation currency, review process, dispute handling, and payout terms. Those decisions shape results as much as the equation does.

Suppose a round admits only projects with a GitHub repository, an existing user base, and a wallet older than six months. That may reduce fraud. It may also exclude local mutual-aid groups and first-time maintainers. Suppose a round allows any project to apply. It may accept more experimental work, but reviewers and donors must sort through more low-quality or deceptive applications.

Gitcoin's [Grants Stack documentation](https://docs.gitcoin.co/gitcoin-grants-stack) describes configurable rounds built with Allo Protocol, including application and donation processes. Configurability is useful, but it means a result cannot be evaluated from the label "quadratic funding" alone. Readers need the round rules, eligible-project list, matching-pool size, identity policy, and final allocation method.

A careful operator publishes those items before donations begin. It also says whether direct donations go immediately to projects or remain refundable until review, how it handles disqualified projects, and who can change the rules. A public dashboard without these policies can make a discretionary process look more automatic than it is.

## Sybil attacks attack the signal, not the arithmetic

The main vulnerability is sybil behavior. Because the formula rewards many contributors, a person who controls many accounts can make one preference look like many. They may split a $100 donation among one hundred wallets, ask collaborators to donate and reimburse them, or build automated identities that meet weak eligibility checks.

No public blockchain can infer one person from one address. Wallet addresses are cheap to create. The [Ethereum account documentation](https://ethereum.org/en/developers/docs/accounts/) explains that accounts can be created without a central registration process. This is a feature for permissionless participation, but it prevents a raw wallet count from being a trustworthy count of people.

Rounds use several defenses. A minimum contribution makes mass accounts more expensive, though it also deters low-income donors. Passport-style scores combine evidence from outside systems, such as account age or verified credentials. Reviewers look for suspicious donation patterns. Algorithms can downweight clusters of linked accounts. Community reporting can flag projects with fake activity.

Gitcoin Passport, now documented as [Human Passport](https://docs.passport.xyz/), describes a score assembled from "stamps" that are intended to provide sybil resistance. Such a score is evidence, not a proof of human uniqueness. It may exclude people without the required accounts or documentation, and it can create privacy risks if users must connect more data to participate.

The design question is therefore not "how do we eliminate sybils?" It is "how much manipulation can this pool tolerate, what exclusion cost will we accept, and how will we explain both?" A small local round may use in-person verification. A global online round may accept some fraud as the price of accessibility. The choice should be explicit.

## Collusion and popularity are separate problems

Distinct people can still coordinate dishonestly. A project might refund donations off-chain, offer token rewards larger than the gift, or form a reciprocal ring with other projects. Those contributors are real people, so basic sybil checks will not catch the behavior. Operators need rules against reimbursement and inducement, monitoring, and a way to investigate credible reports.

Popularity is not fraud, but it affects outcomes. Projects with active social audiences may collect more small gifts than quiet maintenance work. A translation project, accessibility patch, or dependency upgrade may benefit thousands while being hard to explain in a campaign. Quadratic funding can improve on one-donor-one-winner allocation while still favoring groups with time, networks, and communications skill.

This is why rounds often combine mechanisms. A technical-review grant can pay for security work. A quadratic round can distribute a community pool. A steward program can fund work that has no donor base yet. Separating these budgets lets each method address a problem it can actually measure.

## Direct donations and matching money mean different things

In a typical round, a project receives two flows: direct gifts from contributors and a match from the shared pool. Direct gifts show that specific people chose to pay. The match is a social subsidy based on the round's rule. A project with small direct donations may receive a large match, which is the intended effect when broad support is real.

This distinction should appear in project reporting. "Raised $2,000" can be misleading if $1,800 was matching money. Report direct donations, matching allocation, fees, currency conversion, and payout status separately. If the pool is held in a volatile asset, publish the conversion date and method. If funds are in a multisignature wallet, publish the signing policy and payout transactions where appropriate.

On-chain transparency helps with some of this. It can show transfers and contract calls. It does not prove that a project spent money well, that an off-chain donor was not reimbursed, or that a recipient controlled the wallet used for payout. Reporting still needs plain-language budgets, milestones, and contact information.

## An example of round design

Imagine a $50,000 round for open-source developer tools. The sponsor sets aside $45,000 for matching and $5,000 for administration, review, and an appeal reserve. Applicants must maintain a public repository, describe the software's users, disclose past grants, and accept payment to a wallet controlled by named maintainers.

The round lasts two weeks. Donors can give at least $1. Each donor must meet a published Human Passport threshold, but the operator also allows an appeal route for contributors who cannot use a particular social platform. The contract records donations. A monitoring report flags patterns such as a group of new wallets funding only one project within minutes of receiving funds from the same source.

After the donation period, an independent reviewer examines flags under a published standard. A project can respond before a decision. The operator publishes direct donations, the unscaled formula outputs, any sybil or collusion adjustments, the scaling factor, final matches, and payout transaction links. Disqualified donations and unclaimed funds have a stated destination.

This process is not frictionless. It costs money and requires judgment. It is, however, inspectable. A donor can see that the outcome was produced by more than an attractive formula on a landing page.

## How to read a quadratic-funding result

Start with the pool. Who supplied it, and what authority approved it? Then read eligibility rules. A round aimed at Ethereum infrastructure is not a neutral sample of all public goods. Look at identity requirements and whether they were applied before or after donations. Post-hoc rule changes are a warning sign even if they address real abuse.

Next, compare direct donations and matches. Large gaps are not automatically suspicious. They are often the purpose of quadratic funding. Ask whether the project had broad support from sufficiently independent contributors and whether the adjustment process is documented. Review the payout record and the project's stated plan for the money.

Finally, keep the claim modest. A quadratic round can reveal one bounded form of community preference under its rules. It cannot establish that the winners are objectively the most valuable projects, that every participant had equal ability to contribute, or that public funding should always follow donations. Its fairness comes from a transparent choice about whose small contributions receive extra weight, not from mathematics alone.

For communities funding shared work, that is still a useful option. It makes a donor base visible, turns distributed support into a larger allocation, and forces operators to state how identity, fraud, and discretion are handled. Those operational details determine whether the mechanism earns trust.
