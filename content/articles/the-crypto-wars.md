---
title: 'The Crypto Wars'
description: >-
  An investigative thesis examining the legal battles over software encryption, source code as speech, and zero-knowledge privacy protocols.
category: Technology Deep Dives
publishedDate: '2026-09-08'
lastUpdated: "2026-09-08"
slug: the-crypto-wars
---

Is computer source code protected as free speech under constitutional law, or can sovereign government agencies restrict the publication and execution of cryptographic software?

Documented in the [Crypto Anarchy Wiki](https://cryptoanarchy.wiki/#events), this defining legal question first surfaced during the 1990s Crypto Wars when federal authorities launched criminal investigations against software engineers for distributing strong encryption tools on global networks.

Today, that identical legal battle has re-emerged across modern federal courtrooms evaluating open-source smart contracts, non-custodial privacy protocols, and zero-knowledge financial tools.

---

## 1. Crypto Wars 1.0: Phil Zimmermann and PGP Export Enforcement

In 1991, software engineer Phil Zimmermann published Pretty Good Privacy (PGP), making public-key encryption software accessible to individual personal computer users worldwide.

<div class="my-8 overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm">
div class="text-center font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Figure 1: Legal Evolution of Source Code as Free Speech</div>
svg viewBox="0 0 800 240" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto">

g transform="translate(40, 40)">
rect width="210" height="160" rx="8" fill="#ef4444" fill-opacity="0.1" stroke="#ef4444" stroke-width="1.5"/>
text x="105" y="30" text-anchor="middle" font-family="system-ui" font-size="12" font-weight="700" fill="#ef4444">1990s: ITAR Export Controls</text>
text x="105" y="60" text-anchor="middle" font-family="system-ui" font-size="10" fill="currentColor">Encryption classified as Munitions</text>
text x="105" y="80" text-anchor="middle" font-family="system-ui" font-size="10" fill="currentColor">Criminal investigation of PGP</text>
text x="105" y="120" text-anchor="middle" font-family="system-ui" font-size="11" font-weight="600" fill="#ef4444">State Ban Strategy</text>
/g>


path d="M 260 120 L 280 120" stroke="currentColor" stroke-opacity="0.4" stroke-width="2"/>


g transform="translate(295, 40)">
rect width="210" height="160" rx="8" fill="#3b82f6" fill-opacity="0.1" stroke="#3b82f6" stroke-width="1.5"/>
text x="105" y="30" text-anchor="middle" font-family="system-ui" font-size="12" font-weight="700" fill="#3b82f6">1999: Bernstein v. US</text>
text x="105" y="60" text-anchor="middle" font-family="system-ui" font-size="10" fill="currentColor">9th Circuit Landmark Ruling</text>
text x="105" y="80" text-anchor="middle" font-family="system-ui" font-size="10" fill="currentColor">"Source Code is Speech"</text>
text x="105" y="120" text-anchor="middle" font-family="system-ui" font-size="11" font-weight="600" fill="#3b82f6">1st Amendment Protection</text>
/g>


path d="M 515 120 L 535 120" stroke="currentColor" stroke-opacity="0.4" stroke-width="2"/>


g transform="translate(550, 40)">
rect width="210" height="160" rx="8" fill="#8b5cf6" fill-opacity="0.1" stroke="#8b5cf6" stroke-width="1.5"/>
text x="105" y="30" text-anchor="middle" font-family="system-ui" font-size="12" font-weight="700" fill="#8b5cf6">Present: ZK & OFAC Litigation</text>
text x="105" y="60" text-anchor="middle" font-family="system-ui" font-size="10" fill="currentColor">Immutable Smart Contracts</text>
text x="105" y="80" text-anchor="middle" font-family="system-ui" font-size="10" fill="currentColor">Tornado Cash & Privacy Software</text>
text x="105" y="120" text-anchor="middle" font-family="system-ui" font-size="11" font-weight="600" fill="#8b5cf6">Modern Code Speech Rights</text>
/g>
/svg>
</div>

At the time, US federal export regulations under the International Traffic in Arms Regulations (ITAR) classified encryption algorithms with key lengths exceeding 40 bits as auxiliary military equipment.

When Zimmermann uploaded PGP to usenet groups, federal prosecutors initiated a multi-year grand jury investigation into whether publishing encryption software constituted illegal arms exporting without a State Department license.

To expose the legal contradiction of export restrictions, civil liberties activists printed the full PGP source code in a book titled [PGP Source Code and Internals](https://www.mit.edu/afs/net/user/tytso/git/pgp/doc/pgp-legal.txt) and exported physical copies globally. Under established First Amendment jurisprudence, exporting printed books was constitutionally protected speech, revealing the impossibility of treating source code as physical weaponry.

During this period, federal law enforcement also proposed mandatory hardware key escrow through the Clipper Chip initiative. The Clipper Chip was a dedicated microchip designed by the National Security Agency (NSA) for telecommunications devices. It utilized the Skipjack encryption algorithm and contained a built-in backdoor key held in escrow by federal agencies. The initiative faced widespread opposition from computer scientists, who demonstrated that mandatory key escrow created single points of failure vulnerable to unauthorized access and security breaches.

Furthermore, cypherpunks utilized early electronic mailing lists to coordinate legal defense strategies and publish cryptographic tools. Luminaries like Timothy C. May, Eric Hughes, and John Gilmore argued that privacy was essential for an open society in the digital age. In his 1993 document [A Cypherpunk's Manifesto](https://www.activism.net/cypherpunk/manifesto.html), Eric Hughes articulated that privacy is not secrecy, but the power to selectively reveal oneself to the world. This philosophical foundation framed strong cryptography as a fundamental civil liberty rather than a threat to national security.

---

## 2. Bernstein v. United States: The Speech Precedent

The constitutional status of software source code was formally established in the landmark case [Bernstein v. United States (176 F.3d 1132)](https://mira.dkuug.dk/bernstein/).

In 1995, Daniel J. Bernstein, a mathematics graduate student at UC Berkeley, authored an encryption algorithm named Snuffle. When he sought to publish the source code alongside an academic paper explaining its operation, the State Department informed him that he must register as an international arms dealer.

Represented by the Electronic Frontier Foundation (EFF), Bernstein sued the federal government. In 1999, the Ninth Circuit Court of Appeals issued a historic ruling establishing that **source code is speech protected by the First Amendment**:

> "Source code is an expressive means for communicating ideas... The fact that a medium of expression has functional capacity does not strip it of First Amendment protection... Source code is speech."

This legal precedent established that writing, publishing, and sharing cryptographic algorithms is protected under constitutional speech guarantees.

The Bernstein decision recognized that programming languages are functional systems of communication used by scientists, mathematicians, and engineers to express complex ideas. By classifying source code as expressive speech, the court restricted the government's ability to impose prior restraints on software publication. This ruling formed the legal foundation that enabled the expansion of global e-commerce, web browsers, and encrypted communications throughout the early 2000s.

Additional legal challenges reinforced these protections. In *Junger v. Daley (2000)*, the Sixth Circuit Court of Appeals held that computer source code is protected under the First Amendment because it is an expressive medium for scientific communication. These combined court decisions effectively ended ITAR restrictions on commercial encryption software, allowing open-source cryptography to proliferate across global software applications.

---

## 3. Crypto Wars 2.0: Smart Contracts and IEEPA Sanctions

Twenty-five years after the Bernstein precedent, legal battles over cryptographic code returned in federal courtrooms.

In August 2022, the US Department of the Treasury's Office of Foreign Assets Control (OFAC) designated immutable smart contract addresses associated with Tornado Cash to the Specially Designated Nationals (SDN) list under executive authority.

<div class="my-8 overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm">
div class="text-center font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Figure 2: Human-Readable Source Code vs Compiled Bytecode Execution</div>
svg viewBox="0 0 800 220" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto">

g transform="translate(60, 20)">
rect width="300" height="180" rx="8" fill="#3b82f6" fill-opacity="0.1" stroke="#3b82f6" stroke-width="1.5"/>
text x="150" y="35" text-anchor="middle" font-family="system-ui" font-size="12" font-weight="700" fill="#3b82f6">Human-Readable Source Code</text>
text x="150" y="70" text-anchor="middle" font-family="system-ui" font-size="10" fill="currentColor">Solidity / Rust Protocol Text</text>
text x="150" y="95" text-anchor="middle" font-family="system-ui" font-size="10" font-weight="600" fill="#10b981">Protected Under Bernstein v. US</text>
text x="150" y="140" text-anchor="middle" font-family="system-ui" font-size="11" font-weight="700" fill="#3b82f6">1st Amendment Speech Rights</text>
/g>


line x1="380" y1="110" x2="420" y2="110" stroke="currentColor" stroke-opacity="0.4" stroke-width="2"/>


g transform="translate(440, 20)">
rect width="300" height="180" rx="8" fill="#8b5cf6" fill-opacity="0.1" stroke="#8b5cf6" stroke-width="1.5"/>
text x="150" y="35" text-anchor="middle" font-family="system-ui" font-size="12" font-weight="700" fill="#8b5cf6">Compiled On-Chain Bytecode</text>
text x="150" y="70" text-anchor="middle" font-family="system-ui" font-size="10" fill="currentColor">Autonomous Machine Instructions</text>
text x="150" y="95" text-anchor="middle" font-family="system-ui" font-size="10" font-weight="600" fill="#ef4444">Targeted by Executive Sanctions</text>
text x="150" y="140" text-anchor="middle" font-family="system-ui" font-size="11" font-weight="700" fill="#8b5cf6">Active Legal Dispute (Van Loon v. Treasury)</text>
/g>
/svg>
</div>

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

In response, developers and open-source advocates filed suit in [Van Loon v. Treasury](https://www.coincenter.org), arguing that OFAC exceeded its statutory mandate under the International Emergency Economic Powers Act (IEEPA).

Under IEEPA statutes, administrative agencies may sanction property interest held by foreign nationals or designated corporate entities. Plaintiffs demonstrated that autonomous smart contracts deployed on Ethereum are unalterable computer programs holding no corporate entity structure, management board, or foreign property ownership.

The designation of Tornado Cash marked the first time OFAC sanctioned open-source software code rather than a person or corporate entity. Unlike traditional financial institutions or centralized exchanges, Tornado Cash consists of immutable Ethereum smart contracts that run autonomously without human management. Because the contract ownership keys were permanently burned (sent to a zero address), no individual or company retains control over the deployed code.

Legal briefs submitted by crypto policy organizations like Coin Center emphasized that sanctioning non-property code sets a dangerous administrative precedent. If an administrative agency can restrict citizens from interacting with unowned, autonomous software, executive power could be expanded to block access to any open-source protocol deemed contrary to government interests.

---

## 4. First Amendment Protections for Autonomous Bytecode

The core controversy of Crypto Wars 2.0 examines whether deploying source code to a decentralized execution environment removes its First Amendment protection.

Legal scholars analyze smart contracts as consisting of two connected representations:

1. **Human-Readable Source Code:** Written in high-level languages like Solidity or Rust, communicating mathematical and logic operations. Under *Bernstein v. US*, this text is explicitly protected speech.
2. **Machine-Executable Bytecode:** Compiled EVM bytecode stored immutably on a public blockchain. Because compiled bytecode executes deterministically without human intermediaries, penalizing users for interacting with bytecode effectively prohibits access to published software text.

If federal courts allow executive agencies to prohibit interaction with open-source software, the precedent could extend beyond privacy protocols to decentralized exchanges, lending algorithms, and cross-chain messaging bridges.

Furthermore, criminal indictments against open-source developers create a chilling effect across computer science research. When software developers face criminal liability for writing code that third parties subsequently misuse, developers are deterred from publishing privacy-preserving algorithms. This legal conflict threatens fundamental open-source development principles that underpin modern software infrastructure.

The distinction between writing code and operating an illegal financial service is central to ongoing litigation. Open-source developers who publish code do not take custody of user assets, process transactions manually, or manage user funds. Treating developer publishing as financial intermediation fundamentally misinterprets how autonomous software protocols operate.

---

## 5. Protecting Open Source Software Development

The modern litigation surrounding zero-knowledge privacy protocols proves that the boundary between individual digital expression and state regulatory oversight remains highly contested.

As privacy protocols advance, the legal foundation established in the 1990s continues to serve as an essential defense: creating, publishing, and sharing open-source code is a fundamental exercise of free expression.

Preserving explicit constitutional protections for software developers ensures that open-source privacy research and decentralized software infrastructure can continue advancing globally.

The resolution of Crypto Wars 2.0 will determine whether digital privacy tools remain accessible to citizens worldwide. Just as the resolution of Crypto Wars 1.0 enabled secure global web commerce, protecting developer speech rights today ensures that future generations can build transparent, sovereign, and privacy-respecting digital systems.

Software developers, legal scholars, and civil liberties advocates continue to push for explicit legislative protections for open-source protocol authors. Ensuring that non-custodial developers are protected from administrative overreach is essential for maintaining technological innovation, scientific inquiry, and individual digital rights in the 21st century.
