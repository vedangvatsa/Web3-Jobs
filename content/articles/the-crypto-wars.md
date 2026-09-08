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

At the time, US export regulations under the International Traffic in Arms Regulations (ITAR) classified encryption algorithms with key lengths exceeding 40 bits as auxiliary military equipment.

When Zimmermann published PGP on the internet, federal prosecutors launched a criminal investigation into whether distributing encryption software constituted illegal arms exporting without a State Department license.

To highlight the contradiction in export laws, civil liberties advocates printed the full PGP source code into a physical book titled [PGP Source Code and Internals](https://www.mit.edu/afs/net/user/tytso/git/pgp/doc/pgp-legal.txt) and exported it. Under First Amendment case law, exporting printed books was protected speech, exposing the legal difficulty of classifying source code as physical weaponry.

---

## 2. Bernstein v. United States: The Speech Precedent

The legal status of computer software was established in the landmark case [Bernstein v. United States (176 F.3d 1132)](https://mira.dkuug.dk/bernstein/).

In 1995, Daniel J. Bernstein, a mathematics graduate student at UC Berkeley, developed an encryption algorithm named Snuffle. When he sought to publish the source code and an accompanying academic paper, the State Department informed him that he must register as an international arms dealer.

Represented by the Electronic Frontier Foundation (EFF), Bernstein sued the federal government. In 1999, the Ninth Circuit Court of Appeals ruled that **source code is speech protected by the First Amendment**:

> "Source code is an expressive means for communicating ideas... The fact that a medium of expression has functional capacity does not strip it of First Amendment protection... Source code is speech."

This precedent established that writing and publishing cryptographic algorithms is protected under constitutional speech protections.

---



---

## 3. Strict Scrutiny and First Amendment Jurisprudence

The legal classification of source code as speech under *Bernstein v. US* established that restrictions on publishing software are subject to **strict scrutiny** - the highest standard of constitutional judicial review.

Under First Amendment jurisprudence:

1. **Content-Based Restrictions:** Laws that prohibit specific types of software (such as zero-knowledge privacy code or smart contract mixers) based on the functional outcome of the code are presumed unconstitutional unless the government proves the restriction is narrowly tailored to achieve a compelling state interest.
2. **Prior Restraint Doctrine:** Requiring developers to obtain administrative approval or register with government agencies before publishing open-source code constitutes an unconstitutional prior restraint on expression.

As legal scholar Orin Kerr noted in his analysis of computer crime laws, attempting to regulate software distribution by banning text files creates severe constitutional conflicts, as human-readable source code serves as an educational medium for computer science research.


## 4. Crypto Wars 2.0: Smart Contracts and IEEPA Sanctions

Twenty-five years after the Bernstein ruling, legal friction re-emerged over autonomous smart contracts.

In August 2022, the US Department of the Treasury's Office of Foreign Assets Control (OFAC) designated immutable smart contract addresses associated with Tornado Cash to the Specially Designated Nationals (SDN) list under executive order authority.

```
Comparative Matrix of Cryptographic Legal Disputes:

  Crypto Wars 1.0 (1990s):
  - Primary Mechanism: ITAR export control enforcement
  - Target: Distribution of desktop encryption executables (PGP)
  - Legal Issue: Can the government restrict exporting code as a weapon?
  - Outcome: Bernstein ruling establishes source code as protected 1st Amendment speech

  Crypto Wars 2.0 (2020s):
  - Primary Mechanism: OFAC SDN sanctions under IEEPA
  - Target: Autonomous, unalterable smart contract bytecodes on Ethereum
  - Legal Issue: Can government sanctions apply to non-person software code?
  - Outcome: Active litigation in federal circuit courts (Van Loon v. Treasury)
```

Legal organizations filed suit in [Van Loon v. Treasury](https://www.coincenter.org), arguing that OFAC exceeded its statutory authority under the International Emergency Economic Powers Act (IEEPA). 

IEEPA allows the executive branch to sanction property owned by foreign nationals or corporate entities. Opponents argued that autonomous, unalterable smart contract code deployed on a public blockchain is not a person or property, but open-source software.

---

## 5. The First Amendment Implications of Immutable Bytecode

The outcome of Crypto Wars 2.0 centres on whether deploying code to a decentralized network alters its status as protected expression.

Legal scholars argue that smart contracts represent two distinct components:

1. **The Source Code (Human Readable):** Written in Solidity or Rust, explaining the computational logic. Under *Bernstein v. US*, this text is protected speech.
2. **The Compiled Bytecode (Machine Executable):** Deployed to an open blockchain EVM. Because bytecode executes deterministically without human intervention, sanctioning the bytecode directly restricts users from interacting with published software text.

If courts allow administrative agencies to ban public interaction with open-source software, the precedent could extend beyond privacy protocols to decentralized finance, cross-chain bridges, and peer-to-peer data relays.

---

## 6. Protecting Open Source Development

The ongoing legal battles over zero-knowledge privacy protocols demonstrate that the boundary between speech and regulation remains active.

As cryptographic tools advance, the legal framework established in the 1990s continues to serve as a key precedent: writing, publishing, and distributing open-source code remains a fundamental exercise of free expression.

Maintaining clear legal protections for developers ensures that open-source privacy research can continue advancing across open networks.

---

## 7. Reference Index (10 Primary Sources)

1. **Zimmermann, P. (1991):** [PGP Official Documentation and Source Code Archives](https://www.mit.edu/afs/net/user/tytso/git/pgp/doc/pgp-legal.txt).
2. **Ninth Circuit Court of Appeals (1999):** [Bernstein v. United States (176 F.3d 1132)](https://mira.dkuug.dk/bernstein/).
3. **Crypto Anarchy Wiki:** [Crypto Wars Historical Archive](https://cryptoanarchy.wiki/events/90s-crypto-wars).
4. **Electronic Frontier Foundation (1999):** [Bernstein Litigation Archive](https://www.eff.org/cases/bernstein-v-us).
5. **US Department of the Treasury (2022):** [OFAC Sanctions Action on Tornado Cash](https://home.treasury.gov).
6. **Fifth Circuit Court of Appeals (2024):** [Van Loon v. Department of the Treasury Briefs](https://www.coincenter.org).
7. **May, T. C. (1994):** [The Cyphernomicon Crypto FAQ](https://www.cypherpunks.to/faq/cyphernomicron/cyphernomicon.html).
8. **Diffie, W. & Hellman, M. (1976):** [New Directions in Cryptography](https://ee.stanford.edu/~hellman/publications/24.pdf).
9. **Kerr, O. S. (2003):** [Computer Crime Law and First Amendment Protections](https://www.law.berkeley.edu).
10. **Coin Center (2023):** [Analysis of Smart Contract Sanctions under IEEPA](https://www.coincenter.org).
