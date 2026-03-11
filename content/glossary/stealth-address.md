---
term: "Stealth Address"
slug: "stealth-address"
category: "privacy"
difficulty: "Advanced"
image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80"
description: "A privacy mechanism where unique receiving addresses are created for each transaction, preventing observers from linking payments to a single wallet or identity."
relatedTerms: ["privacy", "monero", "anonymity", "address"]
synonyms: ["one-time address", "ephemeral address", "privacy address"]
---

Stealth Address refers to a privacy mechanism that generates a unique, one-time receiving address for each transaction, preventing observers from linking multiple payments to a single wallet or identity. Unlike standard blockchain transactions where repeated payments to the same address create a visible trail, stealth addresses ensure that each incoming transaction appears to go to a completely different destination, even though the recipient can claim all funds using their private key. Monero pioneered this technology and uses stealth addresses by default for all transactions, while Ethereum is actively implementing similar functionality through EIP-5564. Privacy-focused blockchain transactions have grown significantly, with Monero processing over 30,000 daily transactions on average in early 2025 (according to Moneroblocks). As regulatory scrutiny around blockchain surveillance increases, professionals who understand privacy-preserving technologies like stealth addresses are increasingly sought after by compliance teams, wallet developers, and privacy-focused protocol teams.

## Stealth Address Mechanics

How they work:

**Setup**: Receiver publishes stealth public key (separate from spending public key).

**Payment**: Sender derives unique stealth address from receiver's stealth key + ephemeral secret.

**Transaction**: Sender sends payment to stealth address.

**Ephemeral Key**: Sender includes ephemeral public key in transaction (needed for receiver to identify payment).

**Receiver**: Receiver computes shared secret from ephemeral key + spending key. Derives stealth address. Checks if received payment to that address. If yes, receives payment.

**Unlinking**: Observer can't link multiple stealth addresses to same receiver.

Stealth addresses enable unlinkable payments.

## Stealth Address Example

Concrete example:

**Receiver Setup**:
- Spending key: sk
- Stealth key: spk (derived from sk)
- Publishes: spk

**Sender Payment**:
- Generates ephemeral secret: r
- Derives stealth address: hash(r * spk + receiver_identifier)
- Sends 1 ETH to stealth address
- Includes r (ephemeral public key) in transaction

**Receiver Receives**:
- Scans transactions seeing ephemeral key r
- Computes: hash(sk * r + receiver_identifier)
- Checks if received ETH to this address
- If yes, can spend using sk

Observer sees multiple stealth addresses. Can't link them to receiver.

## Privacy Advantages

Benefits:

**Payment Unlinking**: Observer can't link multiple payments to same wallet.

**Recipient Privacy**: Sender doesn't expose recipient address publicly.

**Address Reuse Prevention**: Each payment uses new address (prevents address reuse dangers).

**Lightweight**: No heavy computation required (unlike zk-proofs).

**Scalable**: Can implement at application layer without protocol changes.

Stealth addresses are practical privacy tool.

## Stealth Address Challenges

Obstacles:

**Scanning**: Receiver must scan blockchain identifying their stealth addresses. Computational cost.

**Metadata**: Transaction metadata (sender, amount, time) still visible.

**Linking Receiver**: If receiver sends payment, sender address linkable.

**Adoption**: Requires sender and receiver using same implementation.

**Privacy-Aware Design**: Users must understand to get benefits.

Stealth addresses provide privacy but not complete anonymity.

## Monero Implementation

Real stealth addresses:

**RingCT**: Monero uses stealth addresses + ring signatures for privacy.

**Confidential Transactions**: Hide transaction amounts.

**Ring Signatures**: Hide sender among decoys.

**Combination**: Together enable private transactions on Monero.

Monero demonstrates practical stealth address implementation.

## Proposed Ethereum Implementation

Emerging on Ethereum:

**EIP-5564**: Stealth address standard for Ethereum.

**Implementation**: Tools like Umbra enable stealth addresses on Ethereum.

**Privacy Layer**: Adds privacy layer on top of transparent Ethereum.

**Sender Knows Recipient**: Sender still knows who receiving (not anonymous to sender).

Ethereum slowly adopting stealth addresses for privacy.

## Stealth Address Limitations

Important constraints:

**Metadata Privacy**: Stealth addresses hide only recipient identity. Sender address, amount, and timing still visible on blockchain. Observer can see "some transaction happened" but not to whom.

**Sender Privacy**: Receiver knows sender's address (sender must know receiver's stealth key, but reverse doesn't work). Asymmetric privacy.

**Onchain Footprint**: While recipient privacy improved, stealth address transactions still onchain. Forensic analysis might identify patterns.

**Exchange Integration**: Most exchanges don't support stealth addresses. Sending to stealth address then exchanging back to known address defeats privacy.

**Regulatory**: Privacy features might face regulatory scrutiny. Some jurisdictions restrict privacy-enabling technology.

Stealth addresses improve privacy but don't guarantee complete anonymity.

## Stealth Address Adoption

Current landscape:

**Ethereum Slow Adoption**: EIP-5564 proposed but not yet implemented. Only limited tools (Umbra) support stealth addresses.

**Monero Native**: Monero pioneered stealth addresses. Now standard feature.

**Emerging Support**: Some wallets adding stealth address support. Vitalik advocated for Ethereum adoption.

**Privacy Demand**: Growing privacy demand driving adoption. Regulatory pressure also driving development.

**Performance**: Scanning broadcasts require computation. Better solutions needed for mainstream adoption.

Stealth addresses slowly gaining adoption as privacy demands increase.

## Career Opportunities

Privacy infrastructure creates roles:

**Privacy Researchers** studying privacy mechanisms earn $130,000-$320,000+.

**Cryptography Engineers** implementing stealth addresses earn $120,000-$300,000+.

**Smart Contract Developers** building privacy contracts earn $100,000-$250,000+.

**Full Stack Privacy Engineers** implementing end-to-end privacy earn $130,000-$320,000+.

**Security Engineers** auditing privacy systems earn $120,000-$300,000+.

**Privacy Product Managers** designing privacy UX earn $110,000-$280,000+.

## Best Practices

Using stealth addresses:

**Understand Limitations**: Stealth addresses don't hide transaction metadata.

**Combine Methods**: Combine with other privacy methods (mixers, etc) for better privacy.

**Use Reputable Implementations**: Use audited, proven stealth address implementations.

**Avoid Linking**: Don't link stealth address to known identity.

**Monitor Privacy**: Privacy depends on proper implementation. Stay informed.

## The Future of Stealth Addresses

Privacy evolution:

**Wider Adoption**: More protocols implementing stealth addresses.

**Scanning Solutions**: Better scanning mechanisms reducing receiver computation.

**Metadata Privacy**: Combining with other techniques hiding metadata.

**Social Recovery**: Stealth addresses combined with smart contract recovery.

**Threshold Cryptography**: Multiple recipients sharing stealth address.

## Receive Payments Privately

Stealth addresses enable private receiving while maintaining public blockchain transparency. Understanding stealth addresses helps you evaluate privacy solutions. If you're interested in privacy or cryptography, explore [privacy careers](/) at privacy projects and teams. These roles focus on building practical privacy infrastructure.
