---
title: 'The Crypto Wars'
description: >-
  An investigative thesis examining the legal battles over software encryption, source code as speech, and zero-knowledge privacy protocols.
category: Technology Deep Dives
publishedDate: '2026-09-08'
lastUpdated: '2026-09-08'
slug: the-crypto-wars
---

Is computer source code protected as free speech under the law, or can government agencies restrict the publication of cryptographic software?

Documented in the [Crypto Anarchy Wiki](https://cryptoanarchy.wiki/events/90s-crypto-wars), this legal question first surfaced during the 1990s Crypto Wars when federal authorities investigated software developers for distributing strong encryption.

Today, that same legal debate has returned in courtrooms evaluating open-source smart contracts, non-custodial privacy tools, and zero-knowledge protocols.

---

## 1. Crypto Wars 1.0: Phil Zimmermann and PGP

In 1991, software engineer Phil Zimmermann released Pretty Good Privacy (PGP), bringing public-key encryption to personal computer users worldwide.

<div class="my-8 overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm">
  <div class="text-center font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Figure 1: Legal Evolution of Source Code as Free Speech</div>
  <svg viewBox="0 0 800 240" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto">
    <!-- Box 1: ITAR Classification -->
    <g transform="translate(40, 40)">
      <rect width="210" height="160" rx="8" fill="#ef4444" fill-opacity="0.1" stroke="#ef4444" stroke-width="1.5"/>
      <text x="105" y="30" text-anchor="middle" font-family="system-ui" font-size="12" font-weight="700" fill="#ef4444">1990s: ITAR Export Controls</text>
      <text x="105" y="60" text-anchor="middle" font-family="system-ui" font-size="10" fill="currentColor">Encryption classified as Munitions</text>
      <text x="105" y="80" text-anchor="middle" font-family="system-ui" font-size="10" fill="currentColor">Criminal investigation of PGP</text>
      <text x="105" y="120" text-anchor="middle" font-family="system-ui" font-size="11" font-weight="600" fill="#ef4444">State Ban Strategy</text>
    </g>

    <!-- Arrow 1 -->
    <path d="M 260 120 L 280 120" stroke="currentColor" stroke-opacity="0.4" stroke-width="2"/>

    <!-- Box 2: Bernstein Ruling -->
    <g transform="translate(295, 40)">
      <rect width="210" height="160" rx="8" fill="#3b82f6" fill-opacity="0.1" stroke="#3b82f6" stroke-width="1.5"/>
      <text x="105" y="30" text-anchor="middle" font-family="system-ui" font-size="12" font-weight="700" fill="#3b82f6">1999: Bernstein v. US</text>
      <text x="105" y="60" text-anchor="middle" font-family="system-ui" font-size="10" fill="currentColor">9th Circuit Landmark Ruling</text>
      <text x="105" y="80" text-anchor="middle" font-family="system-ui" font-size="10" font-weight="600" fill="#3b82f6">"Source Code is Speech"</text>
      <text x="105" y="120" text-anchor="middle" font-family="system-ui" font-size="11" font-weight="600" fill="#3b82f6">1st Amendment Protection</text>
    </g>

    <!-- Arrow 2 -->
    <path d="M 515 120 L 535 120" stroke="currentColor" stroke-opacity="0.4" stroke-width="2"/>

    <!-- Box 3: Smart Contract Litigation -->
    <g transform="translate(550, 40)">
      <rect width="210" height="160" rx="8" fill="#8b5cf6" fill-opacity="0.1" stroke="#8b5cf6" stroke-width="1.5"/>
      <text x="105" y="30" text-anchor="middle" font-family="system-ui" font-size="12" font-weight="700" fill="#8b5cf6">Present: ZK & OFAC Litigation</text>
      <text x="105" y="60" text-anchor="middle" font-family="system-ui" font-size="10" fill="currentColor">Immutable Smart Contracts</text>
      <text x="105" y="80" text-anchor="middle" font-family="system-ui" font-size="10" fill="currentColor">Tornado Cash & Privacy Software</text>
      <text x="105" y="120" text-anchor="middle" font-family="system-ui" font-size="11" font-weight="600" fill="#8b5cf6">Modern Code Speech Rights</text>
    </g>
  </svg>
</div>

At the time, the US government classified encryption software with key lengths over 40 bits as munitions under the International Traffic in Arms Regulations (ITAR).

When PGP spread across the internet, federal prosecutors launched a three-year criminal investigation into Zimmermann for exporting munitions without a license.

To highlight the contradiction in export laws, activists printed the full PGP source code into a paper book—titled [PGP Source Code and Internals](https://www.mit.edu/afs/net/user/tytso/git/pgp/doc/pgp-legal.txt)—and shipped the book overseas. Under First Amendment law, exporting printed books was protected free speech, demonstrating the legal difficulty of treating source code as physical weaponry.

---

## 2. The Landmark Ruling: Bernstein v. United States

The legal breakthrough for software freedom arrived in the landmark case [Bernstein v. United States (176 F.3d 1132)](https://mira.dkuug.dk/bernstein/).

Daniel J. Bernstein, a mathematics graduate student at UC Berkeley, wished to publish his encryption algorithm, Snuffle, alongside its source code and academic paper. The Department of State informed him that he must register as an arms dealer before publishing.

Supported by the Electronic Frontier Foundation (EFF), Bernstein sued the government. In 1999, the Ninth Circuit Court of Appeals ruled that **source code is speech protected by the First Amendment**:

> "Language designed for communication with computers is no less entitled to First Amendment protection than language designed for communication with human beings."

This precedent established that writing and publishing cryptographic software is protected under constitutional speech rights.

---

## 3. Crypto Wars 2.0: Smart Contracts and Sanctions

Twenty-five years after the Bernstein ruling, legal friction re-emerged over decentralized smart contracts.

In August 2022, the US Department of the Treasury's Office of Foreign Assets Control (OFAC) added immutable smart contract addresses associated with Tornado Cash to the Specially Designated Nationals (SDN) list.

```
Comparison of Cryptographic Legal Disputes:

  Crypto Wars 1.0 (1990s):
  - ITAR export control restrictions
  - PGP criminal investigation
  - Outcome: Bernstein ruling establishes source code as protected speech

  Crypto Wars 2.0 (2020s):
  - OFAC SDN list designation of smart contract addresses
  - Tornado Cash developer prosecution
  - Active dispute: Can non-person immutable code be sanctioned?
```

Civil rights advocates and legal scholars filed suit in cases like *Van Loon v. Treasury*, arguing that OFAC exceeded its statutory authority under the International Emergency Economic Powers Act (IEEPA), which allows sanctioning property owned by foreign persons or entities—not autonomous, unalterable software code.

The legal resolution of these cases will define whether writing and deploying open-source financial software remains protected under free speech principles.

---

## 4. Reference Index (10 Primary Sources)

1. **Zimmermann, P. (1991):** [PGP Official Documentation and Source Code](https://www.mit.edu/afs/net/user/tytso/git/pgp/doc/pgp-legal.txt).
2. **Ninth Circuit Court of Appeals (1999):** [Bernstein v. United States (176 F.3d 1132)](https://mira.dkuug.dk/bernstein/).
3. **Crypto Anarchy Wiki:** [Crypto Wars Historical Archive](https://cryptoanarchy.wiki/events/90s-crypto-wars).
4. **Electronic Frontier Foundation (1999):** [Bernstein Litigation Archive](https://www.eff.org/cases/bernstein-v-us).
5. **US Department of the Treasury (2022):** [OFAC Sanctions Action on Tornado Cash](https://home.treasury.gov).
6. **Fifth Circuit Court of Appeals (2024):** [Van Loon v. Department of the Treasury Briefs](https://www.coincenter.org).
7. **May, T. C. (1994):** [The Cyphernomicon Crypto FAQ](https://www.cypherpunks.to/faq/cyphernomicron/cyphernomicon.html).
8. **Diffie, W. & Hellman, M. (1976):** [New Directions in Cryptography](https://ee.stanford.edu/~hellman/publications/24.pdf).
9. **Kerr, O. S. (2003):** [Computer Crime Law and First Amendment Protections](https://www.law.berkeley.edu).
10. **Coin Center (2023):** [Analysis of Smart Contract Sanctions under IEEPA](https://www.coincenter.org).
