---
title: Filecoin Explained
description: >-
  What Filecoin is, how deals, sectors, and proofs work, how FIL is used and
  minted, where it fits versus S3, Arweave, and IPFS pinning, and how to store,
  retrieve, and build on it.
category: Technology Deep Dives
image: /images/chris-ried-ieic5Tq8YMk-unsplash.jpg
data-ai-hint: decentralized storage network
publishedDate: '2026-03-11'
lastUpdated: '2026-09-04'
---

Filecoin is a peer-to-peer network that pays independent storage providers to store your data and proves on chain that the data is still there. It adds an incentive and verification layer on top of IPFS content addressing, so you can keep data for months or years without trusting a single cloud company.

If you need verifiable, long-term storage with cryptographic guarantees, Filecoin is worth understanding. If you need millisecond latency for a hot database, a managed S3 service will serve you better. This guide explains how Filecoin works, where it helps, where it does not, and how to start using it today.

## What Filecoin is

Filecoin lets anyone act as a client who pays to store data or as a storage provider who sells disk space and bandwidth. Pricing and availability are set by an open market, not by a single vendor. Deals between clients and providers are recorded on the Filecoin blockchain, which tracks promises, collateral, and proofs. The data itself is not stored on the blockchain, only the record that a deal exists and the proofs that storage is being honoured.

The network was built by Protocol Labs, founded by Juan Benet, the team behind IPFS. Filecoin raised about $205 million in a 2017 token sale and launched mainnet on October 15, 2020 at block 148,888 after a series of testnets. As of 2026, the network advertises about 1.95 EiB of storage capacity, more than 480 clients with over 1 TiB of active data, and more than 5,000 smart contracts deployed through the Filecoin Virtual Machine. You can verify capacity, clients, and contract counts on the homepage at [filecoin.io](https://filecoin.io) and in explorers like [Filfox](https://filfox.info) and [Beryx](https://beryx.io).

Most Filecoin nodes also speak IPFS. IPFS addresses files by what they contain, using a Content Identifier (CID), rather than where they live. Filecoin makes that CID durable by paying providers to keep sealed copies and to prove they still have them. You can read the high-level model at [docs.filecoin.io/getting-started/what-is-filecoin](https://docs.filecoin.io/getting-started/what-is-filecoin) and [filecoin.io/learn](https://www.filecoin.io/learn).

## Who Filecoin is for

Filecoin fits teams that need durability, auditability, and independence from a single provider.

**Good fit:**

- Web3 teams that store NFT images, metadata, and frontend assets where a broken HTTPS link would break the product. Services like NFT.Storage used Filecoin as the persistence layer behind IPFS CIDs.
- Archivists and researchers who keep large datasets, logs, or cultural records for years. The Internet Archive, Smithsonian, MIT Open Learning, and Starling Lab have published datasets on Filecoin for this reason.
- Builders who need programmable storage. With smart contracts on Filecoin you can automate deal renewal, payments, and access logic.
- Data owners who want to verify storage rather than trust invoices. CIDs plus on-chain proofs let any third party check integrity.

**Poor fit:**

- Hot application workloads that need fast, consistent reads with single-digit millisecond latency and fine-grained access control. Retrieval on Filecoin can be seconds to hours unless you add a caching or warm-storage layer.
- Small, constantly changing objects where per-object deal negotiation is overkill. An S3-compatible hot store or a pinning service is simpler.
- Teams unwilling to handle market mechanics, token volatility, or key management for deals. Managed onramps help, but you still choose providers and track deal expiration.

If you are evaluating Filecoin for a job, think of roles like storage integrator, protocol engineer, or gateway operator. You should be comfortable running nodes, reading logs, and measuring retrieval latency across regions.

## How Filecoin works

### The storage model: providers, deals, sectors

Filecoin organizes storage around three ideas, documented at [docs.filecoin.io/getting-started/what-is-filecoin/storage-model](https://docs.filecoin.io/getting-started/what-is-filecoin/storage-model):

- **Providers.** Storage providers (SPs) store data long term and submit proofs. Retrieval providers (RPs) focus on fast delivery. Many SPs do both, but the roles are distinct.
- **Deals.** A deal is a contract that states data size, price, duration, and collateral. Clients and providers negotiate off chain first, then publish the agreed deal on chain for verification. Deal durations have historically ranged from about 180 to 540 days, with extension possible, and current bounds are enforced by the market actors and the clients you use.
- **Sectors.** Sectors are the basic units of provable storage. Providers must place client data, packaged as a CAR file (Content Addressable Archive), into sealed sectors that are typically 32 GiB or 64 GiB. They can extend sector lifetimes before expiry.

Tools for data preparation include CLIs such as Singularity and the data-prep-tools repo, which pack files into CARs and generate PieceCIDs. Market software such as Boost or Curio handles deal acceptance, CAR transfer, and the sealing pipeline that prepares sectors for proving.

### Proofs: PoRep and PoSt

Filecoin does not trust claims. It checks them.

- **Proof of Replication (PoRep).** At the start of a deal, the provider seals the sector. Sealing creates a unique encoding bound to the data, the provider identity, and the time of sealing (SealRandomness from the chain). The provider then compresses the encoding into a zk-SNARK and submits it. This shows the network that a distinct physical copy exists for that provider, not just a pointer to someone else's copy. Details are at [docs.filecoin.io/basics/the-blockchain/proofs](https://docs.filecoin.io/basics/the-blockchain/proofs) and in the Filecoin spec.
- **Proof of Spacetime (PoSt).** After sealing, the provider must keep proving it still holds the data. Filecoin uses two challenges:
  - **WindowPoSt** checks every sector in rolling 30-minute windows across a proving period. Missed windows can lead to faults and slashing.
  - **WinningPoSt** is a small sample the elected block proposer supplies to earn the right to produce a block.

Both proofs are SNARKs. Failed proofs reduce storage power and can burn part of the provider's pledged collateral to the burn address f099.

### Blockchain, consensus, and nodes

The Filecoin chain is a chain of tipsets, sets of blocks at the same height that allow multiple providers to produce blocks in one epoch. System actors on chain manage miners, power, markets, rewards, and the verified registry.

Consensus is Expected Consensus, a Byzantine fault-tolerant leader election where chance of winning is proportional to provable storage power, not hash power. Drand supplies the randomness beacon. Active node implementations include Lotus (Go), Venus, and Forest. You can track chain health at [status.filecoin.io](https://status.filecoin.io) and [dashboard.starboard.ventures](https://dashboard.starboard.ventures).

### FIL: utility, minting, collateral, and slashing

FIL is the native currency. Clients pay FIL to store and retrieve. Providers lock FIL as pledge collateral proportional to the storage they commit, earn FIL block rewards for correct proofs, and risk slashing if they fail.

Supply rules are set out at [docs.filecoin.io/getting-started/what-is-filecoin/crypto-economics](https://docs.filecoin.io/getting-started/what-is-filecoin/crypto-economics):

- Maximum supply is 2 billion FIL.
- Up to 770 million FIL mint through baseline minting, which only fully releases if the network reaches about a yottabyte of storage within 20 years, roughly 1,000 times current cloud capacity.
- 330 million FIL mint through simple minting on a six-year half-life, with about 97 percent expected over 30 years.
- 300 million FIL sits in a mining reserve for future models.
- 75 percent of block rewards vest linearly over 180 days, 25 percent is immediately available. If a provider has fee debt, immediate rewards first pay that debt. Early investor and team allocations vested over three to six years after mainnet.

Collateral types include initial pledge per sector, block rewards used as collateral, and deal collateral posted per deal. Current per-sector pledge can be read on explorers such as Filfox. When WindowPoSt is missed or sectors go faulty, the protocol slashes pledge and reduces power. Gas is also burned on sector commitments and messages, so not all FIL minted stays in circulation.

### Filecoin Virtual Machine (FVM)

The FVM adds programmability. It launched on March 14, 2023 at epoch 2,683,348 and is built as a WASM runtime that supports native actors and EVM-compatibility through the Filecoin EVM (FEVM). Developers use Solidity or other languages with tools like Hardhat, Foundry, and Remix via Filecoin Solidity libraries.

What it enables:

- Smart contracts that create and manage deals, handle renewal logic, escrow FIL, and tie storage to other on-chain conditions.
- Data DAOs, perpetual storage, staking and leasing protocols, replication and repair workers, and cross-chain bridges.
- Direct integration patterns where an app contract on Filecoin talks to a client contract that governs who can write or pay for storage.

Start at the FVM docs at [docs.filecoin.io/smart-contracts/fundamentals/the-filecoin-virtual-machine](https://docs.filecoin.io/smart-contracts/fundamentals/the-filecoin-virtual-machine) and [fvm.filecoin.io](https://fvm.filecoin.io).

### Filecoin Plus (Fil+): verified useful data

Filecoin Plus tries to fill the network with data that people value, not just capacity. Notaries and allocators review clients and grant DataCap. When clients spend DataCap in a deal, the provider gets about 10 times the quality-adjusted power (QAP) compared to unverified data, which means more block reward weight for the same raw bytes. This lowers effective cost for verified clients and signals that the data matters. Learn the flow at [docs.filecoin.io/getting-started/how-storage-works/filecoin-plus](https://docs.filecoin.io/getting-started/how-storage-works/filecoin-plus).

### Retrieval

Storage is only half the story. Retrieval speed depends on whether an unsealed copy is kept, which endpoint you use, and how your client finds providers.

- If you stored through Filecoin Onchain Cloud or Synapse SDK, follow the [FOC retrieval docs](https://docs.filecoin.cloud/core-concepts/retrieval).
- If you used Fil One, you fetch through its S3-compatible endpoint as you would with object storage.
- For CID-addressed data, use discovery via the InterPlanetary Network Indexer at [cid.contact](https://cid.contact) and fetch with tooling like Lassie (`lassie fetch <CID>`), or via a provider's HTTP `/ipfs/<CID>` or `/piece/<PieceCID>` endpoint. Details are at [docs.filecoin.io/getting-started/what-is-filecoin/retrieval](https://docs.filecoin.io/getting-started/what-is-filecoin/retrieval).

Historically, cold Filecoin retrieval could take minutes to hours because data had to be unsealed. Hot layers have narrowed that gap. Learn more about recent improvements below.

### What changed in 2025 and 2026

Filecoin shifted from bootstrapping raw capacity to paid, verifiable services.

- **NV25 Teep (April 2025)** simplified provider economics, reduced onboarding costs via FIP-0100, brought EIP-1153 transient storage to FEVM, and removed the Batch Balancer fee. See the NV25 notes at [filecoin.io/blog](https://filecoin.io/blog/filecoin-in-2025-year-in-review).
- **F3 Fast Finality (2025)** cut finality from about 7.5 hours to a few minutes, roughly a 450 times improvement. This makes payments, bridges, and app interactions more practical.
- **Proof of Data Possession (PDP) (May 2025)** added hot-storage proofs for data that must be available immediately, useful for retrieval services, frontends, and AI datasets.
- **Filecoin Onchain Cloud (launched November 2025)** bundles verifiable storage, fast retrieval, and programmable payments. Building blocks include Synapse SDK for uploads and discovery, Filecoin Pin for on-chain IPFS pinning, Filecoin Pay for token-agnostic settlement, Warm Storage for Filecoin-backed hot data backed by PDP, and Filecoin Beam for moving data between on-chain and off-chain systems. Early testnet stats reported about 170 unique wallets making about 4,000 on-chain deals through 30 plus service providers, with more than 500 developers using Synapse. Integrations include ENS, Safe, Monad, KYVE, and cross-chain links such as Avalanche C-Chain to Filecoin.

These pieces matter because they address the two critiques Filecoin heard most: finality was slow and retrieval was not prod grade for hot apps.

## Pros and cons, honestly

No system wins on every axis. Compare against hyperscale object storage, Arweave permanence, and Storj or Sia for S3-compatible distribution.

**Strengths:**

- Verifiable durability without trusting one operator. CIDs prove what you stored, PoRep and WindowPoSt prove it is still stored, and deals plus slashing make it costly to lie.
- Global redundancy and permissionless entry. Any qualified provider can add capacity, and clients can pick providers based on history and fault record rather than brand.
- Open pricing and composability with IPFS. You can address data once as a CID, pin it for fast access, and also create a long-term Filecoin deal from the same CAR.
- Programmability through FVM. Contracts can automate deal making, renewal, and payment splits that would be manual with a traditional cloud bill.
- Proven at scale for archives and Web3 media. Cultural and scientific datasets plus NFT media have been onboarded at petabyte scale through specialized onramps.

**Tradeoffs:**

- Retrieval is not S3 by default. Cold sectors need unsealing, and tail latency varies by provider bandwidth and region. You need a warm layer, CDN, or provider-side cache for user-facing reads. FOC Warm Storage and services like Storacha and Saturn target this, but you must design for it.
- Operational complexity. You manage key custody, deal renewal, CAR preparation, gas budgeting, pledge collateral, and provider selection or onramp choice. Misconfiguration can leave data with expiring power.
- Token exposure. FIL funds collateral, gas, and deals. Price moves affect effective cost. Most providers and clients hedge or use stable payment rails like Filecoin Pay or the FIL-backed USDFC where available.
- Throughput and cost structure. Sealing is compute heavy, sector commitments burn gas, and chain fees fluctuate. Small, frequently updated objects are cheaper to keep in a hot object store and back up to Filecoin rather than rewriting Filecoin sectors for every edit.
- No delete guarantee for public data. If you publish a CID broadly and someone pins it, you cannot force removal by ending your own deal. Encrypt before upload if you need privacy.
- Tooling is improving but still smaller than AWS or GCP. Enterprise features like SOC 2, HIPAA, and 24-hour support exist through specific onramps and providers such as Akave, Storacha, Lighthouse, and Fil One, but you must vet coverage provider by provider.

A common production pattern in 2026 is hybrid: keep hot assets behind an IPFS gateway or S3 endpoint (Pinata, Storacha, Fil One, Akave), keep a Filecoin deal as the cold, provable backup, and use Arweave only for the small subset that must never change.

## How to use and get started

Pick the path that matches your need for control and speed. All options ultimately create the same primitives, deals and CIDs, but they differ in who runs the plumbing.

### Choose a path

- **Fastest to try: managed onramp.** Use Lighthouse, Storacha, Akave, or Pinata. You upload via web UI or SDK, the service packs CARs, negotiates deals, and gives you a CID. Good for NFT media, app assets, and first experiments.
- **S3 replacement without learning deals: Fil One.** Point your S3 SDK at the Fil One endpoint. You get flat per-terabyte pricing with no egress fees and Filecoin-backed integrity. See [fil.one](https://fil.one).
- **Verifiable and programmable: Filecoin Onchain Cloud with Synapse SDK.** Use Synapse to store with Warm Storage, prove with PDP, and settle with Filecoin Pay. Good for dApps that need on-chain verification and automatic payments. Docs at [docs.filecoin.cloud](https://docs.filecoin.cloud).
- **Full control: direct deals with Curio or Boost and Lotus.** Run your own provider stack, import CARs with Singularity, set pricing in Boost or Curio, and monitor proving. Needed if you sell capacity or have strict provider or compliance requirements.

### First upload in an afternoon

1. Install tooling and create addresses.
   - For managed quick start: create an account on Lighthouse or Storacha, generate an API key, and install their CLI or JS SDK.
   - For Onchain Cloud: install Node.js, add `@filoz/synapse-sdk`, and set up a wallet with a small amount of FIL for gas. Follow the Synapse quickstart at [docs.filecoin.cloud](https://docs.filecoin.cloud).
   - For direct path: install Lotus and Curio, generate an f1 or f410 wallet, and fund it. Pledge at least one 32 GiB sector worth of collateral as shown on Filfox before committing.

2. Prepare one dataset properly.
   - Put files in a folder, pack to CAR, and note the PieceCID and root CID.
   - Example with Singularity for direct deals, or with an onramp SDK where this is automatic:
     - `singularity deal create --price 0 --duration 360d ./data.car`
   - Verify the CID locally: recompute sha2-256 for a block and confirm it matches the CID multihash. Keep the CAR, CID, and PieceCID together in your catalog.

3. Create a deal and watch it land.
   - Through an onramp: upload and confirm the deal id appears in their dashboard.
   - Through Synapse or Fil One: call the SDK upload and poll the deal status until it is sealed and active.
   - Through direct deals: propose the deal from Lotus or Curio, then track sealing and activation on chain.
   - Check the deal on chain via Filfox or Beryx by searching your client address or PieceCID. Confirm state moves from pre-commit to proven and that WindowPoSt is healthy.

4. Test retrieval before you call it done.
   - Try `lassie fetch <CID>` and also fetch via your chosen gateway or S3 endpoint.
   - Measure time to first byte and total time from at least two regions. Log CID, provider id, and retrieval endpoint.
   - For cold data, keep an unsealed copy with your provider or cache via a warm layer so a second retrieval does not require unsealing.

5. Harden for production.
   - Replicate across two or three providers, or rely on an onramp that already replicates. Record each provider id and deal expiry.
   - Set calendar reminders for deal renewal 30 days before expiry. With FVM you can add a contract that renews automatically, but test it on testnet first.
   - Put a Filecoin Plus plan together if you hold large, valuable datasets. Apply through an allocator for DataCap and use it for new deals to lower effective cost.
   - Track health: WindowPoSt success, deal expiry, balance for gas and pledge, and gateway p95 latency. Alerts on missed WindowPoSt windows are non-negotiable.

### Costs to model

Price is market driven. On public onramps, small pins and deals often list at cents per GiB plus gas, while raw deal capacity can be quoted below $1 per TiB per month on spot markets. Do not budget on at-rest price alone. Include CAR preparation compute, pledge lockup, chain gas for commitments, retrieval bandwidth, and egress through your gateway. Start with a 1 TiB pilot, record real spend for storage, sealing gas, and two full retrievals, then extrapolate.

### Retrieval checklist

- Use content routing via [cid.contact](https://cid.contact) to find providers advertising your CID.
- Prefer HTTP retrieval endpoints (`/ipfs/<CID>` or `/piece/<PieceCID>`) offered by your onramp or provider.
- Keep Lassie or a gateway fallback ready. Do not hardcode one gateway.
- If reads are frequent, front with Fil One, Storacha hot retrieval, or a CDN and treat the sealed Filecoin copy as the proof.

## Frequently asked questions

**How is Filecoin different from IPFS?**

IPFS gives you content addressing and peer-to-peer transport. A CID proves what bytes you want, but IPFS alone does not promise anyone will keep them. Filecoin adds storage deals and daily proofs that providers are keeping a sealed copy. Most Filecoin nodes also run IPFS, so you can pin a hot copy for fast reads while Filecoin holds the provable cold copy. See the roles at [docs.filecoin.io/getting-started/what-is-filecoin](https://docs.filecoin.io/getting-started/what-is-filecoin).

**What do PoRep and PoSt actually do?**

PoRep convinces the chain that a provider made a unique, provider-specific copy at sealing time by encoding data with seal randomness and compressing the proof to a SNARK. PoSt then proves the copy is still there over time. WindowPoSt checks all sectors in 30-minute windows, WinningPoSt lets an elected provider propose a block. Both reject fake claims and expose cheaters to slashing.

**What size are sectors and what deal lengths should I expect?**

Sectors are typically 32 GiB or 64 GiB. Deals are published on chain with negotiated durations. Common published ranges are 180 to 540 days, with extensions possible through current market actors. Your chosen onramp or client may enforce narrower minima or maxima, so check its docs before uploading.

**Is FIL the only way to pay?**

The protocol settles in FIL, but product layers add stable rails. Filecoin Pay supports token-agnostic settlement for Onchain Cloud services, and FIL-backed USDFC is used by some workflows to denominate costs in stable terms while the network still uses FIL underneath. Direct deals and pledge always require FIL in your wallet.

**Is data private on Filecoin?**

No by default. Protocol data is not encrypted at rest in a way that hides it from the provider. If you need privacy, encrypt client side before CAR preparation and manage keys outside the storage network. Verify SDK settings if you use Storj-style encryption elsewhere, but do not assume Filecoin encrypts for you.

**Why not put everything on Arweave or on Storj instead?**

Different guarantees. Arweave aims for permanent, pay-once storage backed by an endowment, which is ideal for immutable roots but wasteful for mutable or large hot data. Storj and similar S3-compatible networks offer familiar hot performance with erasure coding and often lower operational overhead. Filecoin gives you on-chain proof of continuous storage and a market for long-term capacity. Many teams keep hot files in Storj or an IPFS pinning layer, keep the provable archive in Filecoin, and keep only the tiny permanent subset in Arweave.

**Do I need to run Lotus to use Filecoin?**

No for storing. Use an onramp, Fil One, or Synapse and you never touch Lotus. Run Lotus or Curio only if you provide storage, need custom deal logic, or want full node verification.

**What should I monitor in production?**

Follow power and faults on Filfox or Beryx, WindowPoSt success per provider, days until deal or sector expiry, FIL balance for gas and pledge, and retrieval TTFB by region. Keep an index that maps app object id to CID to PieceCID to provider deal id so you can trace from feature to chain in one query.

## Next steps

Do one full loop with a dataset you care about. Pack it as a CAR, upload once through Fil One or an onramp, once through Synapse Warm Storage, note both CIDs and PieceCIDs, compare sealing time and first retrieval time, and record exact spend including gas. Then add a second provider and an automated renewal check. That small pilot answers the durability, speed, and cost questions that matter in interviews and in production.

For deeper reading, start with the official overview at [filecoin.io/learn](https://www.filecoin.io/learn), the storage and retrieval pages at [docs.filecoin.io](https://docs.filecoin.io), the FVM fundamentals, and the 2025 year in review at [filecoin.io/blog/filecoin-in-2025-year-in-review](https://filecoin.io/blog/filecoin-in-2025-year-in-review). For live network state, use Filfox, Beryx, and the Starboard dashboard.
