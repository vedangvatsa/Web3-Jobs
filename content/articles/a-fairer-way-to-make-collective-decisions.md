---
title: 'Quadratic Funding for Public Goods'
image: /images/anton-maksimov-5642-su-MSzGw5V0ui8-unsplash.jpg
data-ai-hint: fairness balance scale
description: >-
  Quadratic funding matches support from many contributors more strongly than
  one large donation, with important limits around identity and collusion.
category: Industry Insights
publishedDate: '2026-03-11'
lastUpdated: "2026-09-12"
---

Public goods create an awkward funding problem. A library, an open-source dependency, public research, or a local park may benefit many people. Each person may value the result while having little reason to pay enough to cover the whole cost. If nobody else pays, a small contribution can look pointless. If one wealthy patron pays, the project may exist, but the decision reflects that patron's priorities more than the community's.

Quadratic funding is a rule for handling that problem. It combines direct contributions with a matching pool and gives extra weight to the breadth of support. The mechanism was formalized by Vitalik Buterin, Zoe Hitzig, and E. Glen Weyl in ["A Flexible Design for Funding Public Goods"](https://arxiv.org/abs/1809.06421). Their proposal is not a claim that every group decision becomes fair once it uses a square root. It is a way to allocate a limited subsidy when a project has many distinct people willing to support it.

The word "quadratic" can make the idea sound more complicated than it is. The important question is simple: do ten people giving a dollar each show something different from one person giving ten dollars? Ordinary donation totals treat the two cases as identical. Quadratic funding does not. It treats broad support as evidence that a project creates value for more than one donor.

## The Funding Problem It Tries to Address

Direct donations work well for some things. A person can buy a book, pay a freelancer, or subscribe to a service and receive a private benefit. The payment and the benefit line up. Public goods do not line up that neatly. Someone may rely on a free software library without paying the maintainer. A reader may use documentation without contributing. A resident may enjoy clean public space even if another resident funded the work.

Markets are not useless in these cases. They often support public goods through subscriptions, consulting, sponsorship, taxes, foundations, and grants. Each route makes a choice about who pays and who decides. A grant committee can fund work that has no near-term business model. It can also become a narrow point of judgment. A large donor can act quickly. That donor can also choose projects that are personally visible or politically attractive.

Quadratic funding changes the allocation of a separate matching pool. It does not create the pool from nothing. A foundation, a protocol treasury, a government program, or another sponsor must still decide to supply money and set rules for the round. That sponsor remains important. The mechanism changes what happens after the pool exists.

Gitcoin describes the practical version plainly: people crowdfund small contributions to projects, while grant programs, governments, or philanthropists provide the matching funds. Its [quadratic funding documentation](https://support.gitcoin.co/gitcoin-knowledge-base/gitcoin-grants/general-questions/whats-quadratic-funding.md) emphasizes the number of participants alongside contribution amount. That qualification is essential. QF does not ignore money. It makes each additional dollar from the same person add less matching influence than a dollar from a new contributor.

## The Formula and What It Counts

For a project with contributions `c1`, `c2`, through `cn`, the ideal total funding is:

```text
(sqrt(c1) + sqrt(c2) + ... + sqrt(cn))^2
```

The direct donations have already been paid. The preliminary matching amount is therefore:

```text
(sqrt(c1) + sqrt(c2) + ... + sqrt(cn))^2 - (c1 + c2 + ... + cn)
```

Buterin's [primer on quadratic payments](https://vitalik.eth.limo/general/2019/12/07/quadratic.html) walks through this form and explains why the difference comes from a central subsidy. In a real round, the preliminary matches across all projects will often exceed the available pool. The organizer then scales the matches down, applies caps, or adds other round rules. The formula identifies relative demand for subsidy. It does not guarantee an unlimited payment.

Consider two projects. Project A receives one $10 contribution. Project B receives ten $1 contributions. Both collected $10 directly.

For Project A, the square-root sum is `sqrt(10)`, so the squared result is $10. Its preliminary match is $0.

For Project B, each square root is `sqrt(1) = 1`. The sum is 10, and the squared result is $100. Its preliminary match is $90.

If the only available matching money is $90 and these are the only two projects, Project B can receive the whole pool and finish with $100. Project A keeps its $10 direct contribution. The outcome is not saying that a dollar from each of ten people is worth ten times as much as a dollar from one person. It says that the match should respond to the number of people who found the project worth supporting.

Amounts still matter. Suppose Project C receives four contributions of $25. The square-root sum is `4 x 5 = 20`, and the preliminary total is $400. Its direct amount is $100, so the preliminary match is $300. A contributor can express stronger support by contributing more. The increasing cost comes from trying to buy the same matching influence alone. Under this formula, a larger number of independent contributors is the cheaper way to show broad demand.

## A Matching Pool Has to Be Finite

The ideal formula can promise more subsidy than an actual fund has. That is expected, not a defect. The original paper explicitly describes the amount received as proportional to the square of the sum of square roots. Its model also considers changes that limit cost and address collusion.

An organizer can first calculate each project's preliminary match. It can then calculate the sum of all preliminary matches. If the pool is smaller, each project receives the same fraction of its preliminary match. A project that represented 5 percent of the preliminary match demand receives 5 percent of the available pool. This approach preserves the formula's relative ordering while keeping the budget fixed.

That rule creates incentives that organizers need to understand. A contributor has two effects. Their direct payment increases the project's cash. It also affects the project's claim on the match. The first contribution from a new participant can have a large impact. Repeated contributions from an existing participant have a smaller marginal effect on the matching calculation. The result favors projects that can attract many people, which may be appropriate for a community grant round and less appropriate for a narrow technical task that only a small group can evaluate.

The matching source can also shape the round. A city may want to privilege local residents. A software ecosystem may want to support tools used by its developers. A foundation may exclude projects that it cannot legally fund. These are governance choices, not properties of the equation. Publishing them before the round gives contributors a chance to assess what their donations can influence.

## Identity Is Part of the Mechanism

Quadratic funding assumes that contributions come from meaningfully distinct participants. Without that assumption, one actor can divide $10 among ten accounts and claim the match intended for ten people. The mechanism then starts to behave like ordinary matching with extra steps.

This is a Sybil attack: one person or coordinated group creates many identities to appear broader than it is. It is not a minor implementation detail. The mathematical benefit of QF depends on the cost of creating those identities. A round with no resistance gives a well-resourced attacker a direct path to capture matching funds.

No identity system perfectly proves one account equals one human. People have privacy needs, shared devices, changing wallets, and legitimate reasons to use more than one account. The practical goal is narrower. Make fake multiplicity expensive enough that it is not worthwhile for the amount at stake, while avoiding a verification process so invasive that ordinary contributors leave.

Human Passport, formerly Gitcoin Passport, is one example of an approach built for this setting. Its [developer documentation](https://docs.passport.xyz/) says that users can accumulate signals from activities such as KYC, biometrics, web activity, and web-of-trust data, then present a score or individual verification to an application. That is not proof of unique humanity in a philosophical sense. It is a risk signal with trade-offs around coverage, privacy, false positives, and the data sources it accepts.

Other rounds can use allowlists, local community verification, contribution history, staking, audits, or manual review. Each creates a different error. An open round may admit fake accounts. A strict round may exclude people who lack documents, social accounts, or the patience for checks. A fair procedure must say which error it is trying to reduce and who bears the cost.

## Collusion Is a Separate Problem

Sybil resistance deals with one person pretending to be many people. Collusion deals with many real people coordinating to manipulate a match. A project could reimburse contributors offchain, buy small donations, or organize a group whose interest is in the subsidy rather than the work. The accounts may all belong to real humans, so an identity score alone cannot settle the issue.

This does not make the mechanism useless. It means a QF round needs rules beyond the formula. A sponsor can publish project eligibility criteria, require disclosure from grantees, audit suspicious contribution patterns, delay payouts, cap matching for new projects, or reserve the right to remove a project that violates the terms. Those controls introduce discretion. The alternative is pretending that an automated allocation rule has no governance.

The trade-off should be visible. Heavy review can protect the pool while making the process slow and dependent on reviewers. Light review can keep access open while accepting a higher risk of manipulation. The appropriate balance depends on the size of the pool, the stakes of the projects, and the community's tolerance for error.

Privacy creates another tension. A round that records every donation publicly makes auditing easier, yet it can expose contributors' political, professional, or personal interests. A system that hides contributors better may need other ways to detect abuse. There is no universal answer. What matters is that participants know whether their donations, identity signals, and project affiliations will be public, shared with reviewers, or retained after the round.

## Where Quadratic Funding Fits

QF is most plausible where a community can identify a shared pool and where many people can make small, informed contributions. Open-source tools, local projects, community education, research, public-interest media, and ecosystem infrastructure are common examples. The method is less useful when a single expert must make a high-stakes technical judgment, when contributors cannot evaluate the project at all, or when the matching sponsor should make a direct accountable decision.

It also cannot decide whether a project is good. Many contributions can signal broad enthusiasm, social pressure, a strong campaign, or a well-known brand. They do not prove technical quality, need, or long-term impact. Organizers can combine QF with eligibility review, milestone payments, public reporting, or retrospective evaluation. Doing so changes the mechanism, but that is often better than treating contribution counts as an oracle.

The original research calls quadratic funding a design for public-goods provision under stated assumptions. Those assumptions are the point. QF becomes fairer than a donor-dominated match when distinct people can participate, collusion is constrained, the matching pool is governed openly, and the community agrees that broad support should carry extra weight. Outside those conditions, the same equation can amplify a campaign rather than a public preference.

## A Concrete Test Before Running a Round

Before adopting quadratic funding, a sponsor should be able to answer a short set of concrete questions in plain language. Who supplies the matching pool? Who can create a project? Who can donate? How is a person or account assessed for Sybil risk? What data is collected? How are suspicious donations handled? Is matching scaled, capped, or filtered? Can a project appeal a decision? When does the sponsor release funds?

If those answers are missing, the formula is carrying more authority than it deserves. If they are published and enforced consistently, QF gives a group a legible way to fund work that many people value a little. That is the real contribution of the method. It does not eliminate power. It changes the point at which power enters the funding decision and makes the resulting rule possible to inspect.
