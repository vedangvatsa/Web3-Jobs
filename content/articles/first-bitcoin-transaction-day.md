---
title: 'First Bitcoin Transaction Day Explained'
description: >-
  On January 12, 2009, Satoshi Nakamoto sent 10 BTC to Hal Finney in Bitcoin
  block 170. This article explains the record, the people, and its limits.
image: /images/dayne-topkin-y5_mFlLMwJk-unsplash.jpg
category: Industry Insights
data-ai-hint: bitcoin transaction
publishedDate: '2026-03-11'
lastUpdated: "2026-09-12"
---

On January 12, 2009, a transaction in Bitcoin block 170 transferred 10 BTC from an early address controlled by Satoshi Nakamoto to an address associated with Hal Finney. The [block record](https://blockstream.info/block/00000000d1145790a8694403d4063f323d499e655c83426834d4ce2f8dd4a2ee) and its [transaction record](https://blockstream.info/tx/f4184fc596403b9d638783cf57adfe4c75c605f6356fbc91338530e9831e9e16) preserve the technical evidence: a transaction, its inputs and outputs, the block that included it, and the block's timestamp.

The transfer is often called the first Bitcoin transaction. That shorthand needs care. Bitcoin's first block already contained a coinbase transaction that created its block subsidy, and early software may have been tested in ways the public record cannot completely explain. The defensible claim is narrower: this is the first widely documented transfer from Satoshi to another person on the live Bitcoin chain. Finney later wrote that he was the recipient of the first transaction, a 10-coin test sent by Satoshi. His [first-person account](https://bitcointalk.org/index.php?topic=155054.msg1643833#msg1643833), published in 2013, connects the chain record to the people who ran the early software.

The date is remembered as First Bitcoin Transaction Day because it offers a compact answer to a larger question: when did Bitcoin become more than a design and a program running for its creator? The answer is not that a single transfer proved every part of Bitcoin's future. It is that two early participants used the network's rules to create, broadcast, include, and receive a transfer without a bank maintaining the ledger.

## The system that had just launched

Satoshi's [Bitcoin white paper](https://bitcoin.org/bitcoin.pdf), dated October 31, 2008, proposed a peer-to-peer electronic cash system. It described a chain of digitally signed transactions, a public history of proof-of-work, and a rule under which nodes accept the longest valid chain as evidence of the sequence of events. The paper did not promise anonymity, instant settlement, or a stable market value. It described a mechanism for ordering transactions and resisting double spending without a trusted central operator.

On January 8, 2009, Satoshi announced version 0.1 of the software to the cryptography mailing list. In the [release message](https://www.metzdowd.com/pipermail/cryptography/2009-January/014994.html), Satoshi called the software alpha and experimental, said the network state might need to be restarted, and explained that users could generate coins by running a node. The message also described two ways of sending money: directly to an online recipient's IP address or to a Bitcoin address derived from a public key.

That announcement gives useful context to the transfer four days later. Bitcoin was not a mature payment network with merchants, exchanges, mobile wallets, or a formal development organization. It was newly released Windows software and a very small network. Satoshi's own warning that it was experimental is part of the historical record and should temper later accounts that treat the early chain as a finished financial system.

The genesis block, now identified as height zero, was mined on January 3. It is special in Bitcoin's history and code. The original block subsidy cannot be spent in the ordinary way, and it should not be confused with a payment between two participants. Subsequent mined blocks produced spendable outputs after the protocol's maturity rule. The January 12 transfer drew on that early supply and demonstrated a transfer to another participant rather than merely the creation of a mining reward.

## What the block shows

Bitcoin uses an append-only chain of blocks. Each block contains a header that refers to the preceding block, plus a list of transactions. A transaction spends earlier unspent outputs and creates new outputs. An output typically specifies conditions, expressed in script, that a future spender must satisfy. In the usual early form, the conditions were tied to a public key and a valid digital signature from the corresponding private key.

Block 170 has the hash `00000000d1145790a8694403d4063f323d499e655c83426834d4ce2f8dd4a2ee`. Its explorer page identifies the block height, timestamp, proof-of-work details, and two transactions. One is the block's coinbase transaction, which paid the miner's subsidy. The other has transaction ID `f4184fc596403b9d638783cf57adfe4c75c605f6356fbc91338530e9831e9e16` and includes the 10 BTC output associated with Finney's receipt.

The chain record can establish some things directly. It establishes that this transaction was included in a particular block in the chain followed by the explorer. It shows the amount encoded in the output, the transaction's prior outputs, and the script data that made the output spendable under Bitcoin's rules. It does not put human names inside the transaction. Bitcoin addresses and public keys are identifiers in a cryptographic system, not passports.

The attribution to Satoshi and Finney comes from evidence beyond the raw transaction: the surrounding early correspondence, Finney's later account, and the established historical association of the addresses. It is good practice to distinguish those layers. A block explorer is strong evidence for the on-chain transaction. It is not, by itself, proof of a person's legal identity or a complete account of what the participants said to one another.

Bitcoin's timestamp also deserves a qualification. Blocks carry a timestamp supplied by the miner and checked by nodes against consensus rules; it is not the same as a cryptographically certified wall-clock receipt from a central timekeeper. In a chain this early, the historical date is clear enough for the anniversary, but precision about the exact moment should not be overstated. The meaningful technical fact is the confirmed ordering: the transaction was included in block 170 after the outputs it spent and before the blocks that followed it.

The record also has a narrow technical meaning. A block explorer presents a readable index of data from the chain, but the Bitcoin protocol does not depend on any one explorer to make the transfer valid. Nodes validate blocks and transactions against their own software and the consensus rules. The [Bitcoin developer guide on transactions](https://developer.bitcoin.org/devguide/transactions.html) describes the model in terms of unspent outputs, signatures, and scripts rather than account balances maintained by an operator. An explorer is useful for inspection; it is not the authority that created the history.

Early transaction formats should not be mistaken for a complete description of present-day Bitcoin use. The network later gained new script capabilities and wallet practices, while the historical transaction remains a record from the software's first days. Reading block 170 with current wallet labels, price charts, or exchange conventions can add context, but those later tools do not change what was actually encoded in the transaction or what Finney said happened around it.

## Hal Finney's account

Hal Finney was already known in cryptography before Bitcoin. In his 2013 post, he wrote that he had worked on an early version of PGP, was one of PGP Corporation's first hires, participated in the Cypherpunks, and operated an early cryptographically based anonymous remailer. He also described an earlier proof-of-work currency experiment called RPOW. Those details explain why Bitcoin's proposal caught his attention; they do not identify him as Bitcoin's creator or establish any claim about Satoshi's identity.

Finney said that he downloaded the software when Satoshi announced its first release, believed he was the first person besides Satoshi to run it, mined a block in the seventies, and received the 10 coins as a test. He wrote that he and Satoshi exchanged emails over the following days, with Finney reporting bugs and Satoshi fixing them. This is valuable evidence because it is a participant describing the practical work around the public transaction, but it remains a retrospective account. It should be attributed to Finney, rather than turned into invented dialogue or a precise reconstruction of every interaction.

His post also describes a small and fragile operation. He recalled that the difficulty was one, that an ordinary CPU could find blocks, and that he eventually turned his node off because his computer ran hot and the fan noise bothered him. Such details make the first transfer easier to understand: it happened before specialized mining, before Bitcoin's public market infrastructure, and before the network had a large, independent operator base.

Satoshi's identity remains unverified. The name was used in the white paper, software release, and mailing-list correspondence, but the public evidence does not establish whether it referred to one person or a group. The history of the 10 BTC transfer does not resolve that question. It shows an address conventionally attributed to Satoshi sending value to Finney; it does not reveal the sender's real-world identity.

## What had to work

The transaction rested on several pieces of the design described in the white paper. First, there had to be a spendable output created by mining and mature under the protocol's rules. Second, the sender had to construct a transaction that named prior outputs and specified new output conditions. Third, the sender had to authorize that spend with a valid signature. A node that received the transaction could check the signature and verify that the inputs had not already been spent in the chain it accepted.

The transaction then needed distribution and confirmation. Nodes relayed valid transactions to peers. A miner selected transactions for a candidate block and performed proof-of-work: repeatedly varying header data to find a hash that met the network target. Once a valid block was broadcast, other nodes independently checked its proof-of-work and transactions. If valid, they could extend the chain from it. The record of a payment was therefore not a message retained by a sender and receiver alone; it was part of a shared chain that other nodes could validate.

Proof-of-work did not make the transfer irreversible in a magical instant. Bitcoin's security model uses accumulated work on later blocks. The white paper explains that an attacker's chance of catching up falls as honest nodes add blocks, subject to assumptions about the attacker and network. In the first days, the network's tiny scale meant practical conditions differed sharply from those of a later global network. It is more accurate to say the transfer exercised the intended mechanism than to say it settled an unlimited amount of value with modern levels of assurance.

The transaction also demonstrates the distinction between possession and identity. Control of Bitcoin is exercised through private keys and transaction signatures, not by a bank's account-recovery process. This enabled a participant to receive value using a public identifier, but it also put key protection directly on the user. The original release message advised users how to connect and generate blocks; the security practices now associated with wallets, hardware signing devices, multisignature controls, and backups developed later as usage and stakes changed.

## A test was different from a payment business

The transfer exercised a network rule, but it did not create the surrounding services people now associate with paying in bitcoin. There was no exchange rate mechanism in the protocol, no card network, no customer-service desk, and no identity-verification provider. The white paper's proposal concerned a peer-to-peer chain of signed transactions and proof-of-work. It did not prescribe a company, an issuer, or a way to reverse a mistaken transfer. Those absences help explain both the appeal of the design and the practical burden placed on early participants.

Finney's account gives the 10 BTC a purpose that a block alone cannot show: he called it a test transaction. That attribution is more precise than calling it a purchase, gift, salary payment, or investment. The output amount is visible on-chain; the legal or social meaning of a transfer generally is not. The distinction still applies when reading modern chain activity. An address moving coins can reflect a sale, collateral movement, internal custody operation, protocol action, or a test, and the raw transaction will rarely settle that question by itself.

The early release also made room for failure. Satoshi wrote that version 0.1 was experimental and that the network could need to restart. That context makes block 170 a record of a prototype being tried by a second participant, rather than evidence that the system's long-term operation had already been demonstrated. The historic interest lies partly in that modesty: a public proposal had become software, a user besides its author had run it, and the chain retained a trace of their test.

## Myths around the anniversary

The most common myth is that this was Bitcoin's first transaction in every sense. It was not. A coinbase transaction is created in every mined block, including the genesis block. The January 12 event is notable because it is a transfer to another person and is supported by Finney's account, not because no transaction object existed before it.

Another myth is that the 10 BTC had a market price at the time comparable to a later exchange quotation. There was no established liquid market price in January 2009. Assigning a present-day value to the transfer can make an interesting headline, but it confuses historical context with a later price. The participants were testing software, not conducting a retail purchase at an externally quoted rate.

It is also misleading to imagine that the transaction instantly made Bitcoin decentralized in the full social sense. The software's rules were designed to let independent participants validate and extend the chain, but a network with only a few early users had concentrated knowledge and capacity. Decentralization is not a ceremony that happens when a second person receives coins. It is a property shaped over time by independent nodes, miners, developers, users, implementations, and the ability of participants to verify rules for themselves.

Finally, the transaction does not prove that all later uses of cryptocurrency follow from Satoshi's original intentions. Bitcoin's white paper describes a specific electronic-cash system. Later networks, tokens, exchanges, custody arrangements, and applications use different designs and make different trade-offs. The historical transfer is best understood within the system it actually tested.

## Why the record still helps explain Bitcoin

The 10 BTC transfer remains a useful teaching example because the sources are unusually direct. The white paper explains the proposed mechanism. Satoshi's release email shows that working software was offered publicly as alpha. Block 170 and the transaction record show the on-chain event. Finney's own account identifies himself as the recipient and describes the short exchange that surrounded it. Readers can inspect each layer without relying only on a commemorative summary.

It also illustrates a continuing discipline for blockchain claims: separate what is written on-chain from what people infer about it. A transaction can show an amount, address, script, and position in a block. It may not show a person's identity, motive, contractual terms, or whether a transfer represents a sale, gift, test, or internal movement. The strongest historical accounts make those boundaries clear.

January 12 is therefore not a birthday for every idea later associated with crypto. It marks a small, verifiable test between two early participants in a network that had only just become public. The block remains available for inspection, and Finney's account preserves the human context: a new program, bug reports, a 10-coin test, and a second person running the software.
