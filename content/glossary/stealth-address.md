---
term: Stealth Address
slug: stealth-address
category: security
difficulty: Advanced
image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80'
description: >-
  A privacy mechanism where unique receiving addresses are created for each
  transaction, preventing observers from linking payments to a single wallet or
  identity.
relatedTerms:
  - privacy
  - monero
  - anonymity
  - address
synonyms:
  - one-time address
  - ephemeral address
  - privacy address
---

Stealth Address refers to a privacy mechanism that generates a unique, one-time receiving address for each transaction, preventing observers from linking multiple payments to a single wallet or identity. Unlike standard blockchain transactions where repeated payments to the same address create a visible trail, stealth addresses ensure that each incoming transaction appears to go to a completely different destination, even though the recipient can claim all funds using their private key. Monero pioneered this technology and uses stealth addresses by default for all transactions, while Ethereum is implementing similar functionality through EIP-5564. 

## Stealth Address Mechanics

How they work:

- **Setup**: Receiver publishes stealth public key (separate from spending public key).

- **Payment**: Sender derives unique stealth address from receiver's stealth key and ephemeral secret.

- **Transaction**: Sender sends payment to stealth address.

- **Ephemeral Key**: Sender includes ephemeral public key in transaction, needed for receiver to identify payment.

- **Receiver**: Receiver computes shared secret from ephemeral key and spending key. Derives stealth address. Checks if received payment to that address. If yes, receives payment.

- **Unlinking**: Observer cannot link multiple stealth addresses to the same receiver.

Stealth addresses enable unlinkable payments.

## Stealth Address Example

Concrete example:

- **Receiver Setup**:
- Spending key: sk
- Stealth key: spk (derived from sk)
- Publishes: spk

- **Sender Payment**:
- Generates ephemeral secret: r
- Derives stealth address: hash(r * spk + receiver_identifier)
- Sends 1 ETH to stealth address
- Includes r (ephemeral public key) in transaction

- **Receiver Receives**:
- Scans transactions seeing ephemeral key r
- Computes: hash(sk * r + receiver_identifier)
- Checks if received ETH to this address
- If yes, can spend using sk

Observer sees multiple stealth addresses and cannot link them to the receiver.

## Privacy Advantages

Benefits:

- **Payment Unlinking**: Observer cannot link multiple payments to the same wallet.

- **Recipient Privacy**: Sender does not expose recipient address publicly.

- **Address Reuse Prevention**: Each payment uses a new address, preventing address reuse dangers.

- **Lightweight**: No heavy computation required, unlike zk-proofs.

- **Scalable**: Can implement at application layer without protocol changes.

Stealth addresses are a practical privacy tool.

## Stealth Address Challenges

Obstacles:

- **Scanning**: Receiver must scan blockchain identifying their stealth addresses, which incurs computational cost.

- **Metadata**: Transaction metadata (sender, amount, time) is still visible.

- **Linking Receiver**: If the receiver sends payment, sender address is linkable.

- **Adoption**: Requires sender and receiver to use the same implementation.

- **Privacy-Aware Design**: Users must understand how to get benefits.

Stealth addresses provide privacy but not complete anonymity.

## Monero Implementation

Real stealth addresses:

- **RingCT**: Monero uses stealth addresses and ring signatures for privacy.

- **Confidential Transactions**: Hide transaction amounts.

- **Ring Signatures**: Hide sender among decoys.

- **Combination**: Together enable private transactions on Monero.

Monero demonstrates practical stealth address implementation.

## Proposed Ethereum Implementation

Emerging on Ethereum:

- **EIP-5564**: Stealth address standard for Ethereum.

- **Implementation**: Tools like Umbra enable stealth addresses on Ethereum.

- **Privacy Layer**: Adds a privacy layer on top of transparent Ethereum.

- **Sender Knows Recipient**: Sender still knows who is receiving, which is not anonymous to the sender.

Ethereum is adopting stealth addresses for privacy.

## Stealth Address Limitations

Important constraints:

- **Metadata Privacy**: Stealth addresses hide only recipient identity. Sender address, amount, and timing are still visible on the blockchain.

- **Sender Privacy**: Receiver knows sender's address. Sender must know receiver's stealth key, but the reverse does not work.

- **Onchain Footprint**: While recipient privacy is improved, stealth address transactions are still onchain. Forensic analysis might identify patterns.

- **Exchange Integration**: Most exchanges do not support stealth addresses. Sending to a stealth address and then exchanging back to a known address defeats privacy.

- **Regulatory**: Privacy features might face regulatory scrutiny. Some jurisdictions restrict privacy-enabling technology.

Stealth addresses improve privacy but do not guarantee complete anonymity.

## Stealth Address Adoption

Current status:

- **Ethereum Slow Adoption**: EIP-5564 proposed but not yet implemented. Only limited tools like Umbra support stealth addresses.

- **Monero Native**: Monero pioneered stealth addresses, which are now a standard feature.

- **Emerging Support**: Some wallets are adding stealth address support. Vitalik Buterin has advocated for Ethereum adoption.

- **Privacy Demand**: Growing privacy demand is driving adoption. Regulatory pressure is also driving development.

- **Performance**: Scanning broadcasts require computation. Better solutions are needed for mainstream adoption.

Stealth addresses are slowly gaining adoption as privacy demands increase.

## Career Opportunities

Privacy infrastructure creates roles:

- **Privacy Researchers** study privacy mechanisms.

- **Cryptography Engineers** implement stealth addresses.

- **Smart Contract Developers** build privacy contracts.

- **Full Stack Privacy Engineers** implement end-to-end privacy.

- **Security Engineers** audit privacy systems.

- **Privacy Product Managers** design privacy user experiences.

## Best Practices

Using stealth addresses:

- **Understand Limitations**: Stealth addresses do not hide transaction metadata.

- **Combine Methods**: Combine with other privacy methods for better privacy.

- **Use Reputable Implementations**: Use audited, proven stealth address implementations.

- **Avoid Linking**: Do not link stealth address to known identity.

- **Monitor Privacy**: Privacy depends on proper implementation. Stay informed.

## The Future of Stealth Addresses

Privacy evolution:

- **Wider Adoption**: More protocols are implementing stealth addresses.

- **Scanning Solutions**: Better scanning mechanisms are reducing receiver computation.

- **Metadata Privacy**: Combining with other techniques to hide metadata.

- **Social Recovery**: Stealth addresses combined with smart contract recovery.

- **Threshold Cryptography**: Multiple recipients sharing a stealth address.

## Receive Payments Privately

Stealth addresses enable private receiving while maintaining public blockchain transparency. Understanding stealth addresses helps you evaluate privacy solutions. If you're interested in privacy or cryptography, explore privacy careers at privacy projects and teams. These roles focus on building practical privacy infrastructure.
