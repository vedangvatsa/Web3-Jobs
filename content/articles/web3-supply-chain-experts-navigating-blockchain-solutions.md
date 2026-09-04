---
title: 'Web3 Supply Chain Experts: Working through Blockchain Solutions'
image: /images/thisisengineering-zBLtU0zbJcU-unsplash.jpg
data-ai-hint: supply chain logistics
description: >-
  A career guide for supply chain and logistics professionals moving into Web3. How shared ledgers, GS1 EPCIS events, smart contracts, and oracle-fed IoT are used in real pilots, what the tradeoffs are, and which roles to target.
category: Career Guides
publishedDate: '2026-03-11'
lastUpdated: "2026-09-04"
---

A Web3 supply chain expert combines logistics knowledge with blockchain and data standards to track goods from source to store on a shared ledger. The work is not about replacing trucks or scanners. It is about giving farmers, carriers, warehouses, and retailers one place to agree on what happened, when, and where.

This guide explains what the ledger does, who hires for it, how the pieces fit together, where pilots have succeeded or failed, and how to get started in the field.

## What it is

Web3 supply chain work uses a shared, append-only ledger to record handover events for physical goods. Hyperledger Fabric, documented at hyperledger-fabric.readthedocs.io, is the most common permissioned base. It hosts a ledger with two parts: the world state, which is the current value, and the transaction log, which is the update history. Members enroll through a Membership Service Provider, transact on channels that limit visibility, and enforce endorsement policies that say which organizations must sign an event before it is valid. Fabric is pluggable for consensus and does not require a cryptocurrency or mining.

Events are modeled with GS1 EPCIS 2.0 at ref.gs1.org/standards/epcis/2.0.1. Each event records what was involved, when it happened, where it happened, and why, using the Core Business Vocabulary for business steps and dispositions. The ledger stores the signed event or its hash. Large documents, images, and sensor logs stay off chain.

Smart contracts, called chaincode on Fabric, automate rules such as holding payment in escrow until a verified arrival event is written. Oracles bring outside facts such as GPS or temperature from IoT devices into the contract. Chainlink describes this as the oracle problem at chain.link/education-hub/oracle-problem: contracts are isolated by design and need a separate layer to bring in outside data without breaking consensus.

## Who it is for

**You have a logistics or operations background and want to add Web3.** You already know GTINs, SSCCs, bills of lading, and warehouse processes. Adding EPCIS modeling, basic chaincode or Solidity, and oracle patterns lets you design pilots that match how the floor actually works.

**You are an enterprise integrator.** You run SAP, Oracle, or Manhattan and need to publish shipment and receipt events without rebuilding the system. Your value is mapping existing fields to EPCIS and keeping the integration stable when the ledger changes.

**You are a product or engineering hire.** Teams building supply chain dApps need people who can write ledger logic, wire IoT feeds, and build dashboards that read ledger events and show lot genealogy or exception alerts.

If you only trade tokens and never handle a handover, this path is less direct. If you want to work on provenance, recall speed, or auditability, the mechanics below define the roles that hire.

## How it works

### Shared ledger instead of reconciled silos

Today a single shipment creates records in many places. The farm logs harvest, the pack house logs packing, the carrier logs pickup, customs logs clearance, the retailer logs receipt. When a recall hits, teams reconcile paper or email. Walmart described the prior method as one-step-up, one-step-back traceability that is often paper based, in its September 24, 2018 mandate at corporate.walmart.com.

A blockchain channel gives those parties one copy of the history. Once a valid transaction is ordered and committed it cannot be edited without a new visible transaction. That is why the ledger is described as tamper evident. It does not make a scan true, only that later changes are visible.

Fabric adds privacy controls that supply chains need. Companies that compete can share a network but keep some prices or volumes private using channels or private data collections. Only channel members see that channel's ledger.

### Products as identifiers and events as EPCIS messages

Goods are identified with GS1 keys: GTIN for trade items, GLN for locations, SSCC for logistics units. Those keys are encoded in barcodes or RFID. Each movement or transformation becomes an EPCIS event with the four dimensions above. EPCIS 2.0 added sensor data and certification extensions, which lets you carry temperature or organic claim detail in a standard way.

The common pattern is to scan or sense the goods, create an EPCIS event, sign it, and submit it through chaincode. Others query by SSCC or serialized GTIN. Using EPCIS first and anchoring second keeps data interoperable if you later change ledgers. GS1 states the same at gs1.org/standards/blockchain: standards let blockchain networks stay interoperable.

Tokens represent the custody idea. MediLedger, whose FDA DSCSA pilot report is at fda.gov/media/168283/download, treats each serialized saleable unit as a non-fungible token where custody is assigned to one trading partner at a time. The contract enforces that only the rightful holder can transfer it.

### Smart contracts for payments and compliance

Contracts hold the rules that used to live in letters of credit and emails. A typical escrow flow:

1. Importer deposits funds in a contract.
2. Exporter posts a shipped event with SSCC and EPCIS data.
3. An oracle posts a verified location reading.
4. The contract checks the endorsement policy and releases funds.

MediLedger added zero-knowledge proofs so transfers can be proved valid while hiding commercial detail. Transactions posted to the chain are obfuscated with zk-SNARKs, but the contract still enforces no double transfer and checks that the sender is the current custodian.

### Oracles and IoT that bring physical events on chain

A contract cannot see a truck. It sees a signed event that claims the truck arrived. That claim comes from handheld scanners, ERP APIs, and IoT devices such as reefer temperature loggers and pallet GPS trackers. A decentralized oracle network fetches the same fact from several sources, aggregates off chain, and submits one verified update on chain. Chainlink supply chain examples describe a pallet sensor proving it reached the correct address to trigger payment to the carrier.

Good pilots do not trust one device. They combine device attestation, multiple sources, and repeated signing so a single bad reading does not move money.

## Proven deployments and what they teach

### Walmart and IBM Food Trust

Walmart ran Hyperledger Fabric pilots with IBM in 2016 to 2017 for pork in China and mangoes to the US. The mango result is the one Walmart repeats: time to trace from store to farm fell from about seven days to 2.2 seconds. That figure appears in Walmart's September 24, 2018 leafy greens mandate and in IBM's December 2018 Food Trust fact sheet. The detailed case is at jbba.scholasticahq.com.

IBM announced Food Trust as generally available on IBM Cloud on October 8, 2018, built on Hyperledger Fabric and compatible with GS1. The launch fact sheet reported more than four million transactions, more than 350 SKUs, nearly three million packaged products traced, and about 50 partners putting data on the system. Walmart then required leafy green suppliers to capture end-to-end traceability on the same network by September 2019.

Takeaway for experts: the gain was narrower recall scope. Instead of pulling a whole category, the retailer could pull a single lot. Your design task is to make the lot identifier and its EPCIS events reliable at the farm and pack house.

### Walmart China and VeChainThor

Walmart China, with the China Chain-Store & Franchise Association, PwC, and VeChain, announced the Walmart China Blockchain Traceability Platform on June 25, 2019 at the China Products Safety Publicity Week seminar. The release at prnewswire.com stated the platform is built on VeChainThor and started with 23 product lines, with a plan to add 100 more by year end across meat, rice, mushrooms, and cooking oil. The plan targeted traceable fresh meat for 50 percent of packaged fresh meat sales and 40 percent for packaged vegetables.

In January 2024 VeChain reported the private network had passed 200 million transactions, while the public VeChainThor mainnet was separately reported at about 52 million. The network is private for Walmart China, not a public sector network.

Takeaway: a single large buyer can drive adoption where a neutral industry build struggles, because the buyer can set data requirements for its suppliers.

### De Beers Tracr

De Beers started Tracr in 2018 to track rough diamonds at source. It now runs as a private chain on AWS with participants using microservices to register stones. By 2024 nearly three million diamonds had been registered since 2022, with producers such as ODC and Mountain Province added. The platform is described by De Beers as a private Ethereum ledger plus AI matching that links rough scans at the mine to polished scans at the manufacturer.

On October 21, 2024 De Beers said Tracr would list single country of origin for all De Beers-sourced rough diamonds above 1 carat, about 0.5 carats polished, from early 2025, with rough-to-rough and rough-to-polished verification via Sarine scanning. The ORIGIN polished program launched in 2024 gives retailers the tracked journey for participating stones.

Takeaway: provenance is stronger when the identifier is tied to a physical measurement, such as diamond scan data, not just to a label that can be moved.

### MediLedger for pharma and the DSCSA

MediLedger, started by Chronicled in 2017, gathered manufacturers, wholesalers, dispensers, and standards bodies for the US Drug Supply Chain Security Act. The FDA requested pilots in early 2019 for the enhanced 2023 package-level tracing rules. The final report hosted by FDA concluded a single blockchain solution could meet throughput, speed, and cost needs when paired with GS1 EPCIS, and that privacy could be handled with zero-knowledge proofs while still enforcing business rules. The pilot used private EPCIS messaging between parties, a shared ledger for proofs, and zk-SNARKs to hide volume and pricing.

Takeaway: regulated supply chains care more about authorized trading partner checks and private data handling than about token price. The report also listed four gaps that still needed standards: messaging, system interoperability, APIs, and authorized partner identity.

### TradeLens and why it shut down

TradeLens, from Maersk and IBM via GTD Solution, launched in 2018 to store bills of lading, arrival times, and customs releases on a permissioned ledger. Maersk and IBM announced discontinuation on November 29, 2022, with shutdown by end of Q1 2023. The notice at maersk.com said the technology worked but full global industry collaboration was not achieved and commercial viability as an independent business was not reached.

Takeaway: network effects decide outcomes. A ledger is only useful if the carriers, ports, and customs you need are on it. Governance and neutrality matter as much as engineering.

### OriginTrail and SCAN

OriginTrail builds a Decentralized Knowledge Graph hosted by 2,200 plus nodes at the time of its 2.0 white paper. The TRAC token was launched in 2018 with a fixed supply of 500 million as an ERC-20. It pays node runners to host Knowledge Assets, serves as collateral, and supports delegation.

The Supplier Compliance Audit Network, SCAN, with members including Costco, Walmart, and Target, uses the DKG to secure factory audits and manage compliance data with selective sharing to programs such as the US Customs Trade Partnership Against Terrorism. OriginTrail reports SCAN helps secure about 40 percent of imports to the United States.

Takeaway: shared audit data can be a more practical first network than per-item tracking, because audits are fewer, higher value, and already shared among retailers.

## Pros and cons, honestly

**Where this work adds value:**

* Faster, narrower recalls. The mango pilot cut trace time from about seven days to 2.2 seconds, which lets teams pull a single lot instead of a whole product.
* Provable provenance for customers and regulators. De Beers shows country of origin for registered diamonds over 1 carat. Walmart China shows farm, inspection, and location history via QR codes.
* Less reconciliation. Signed EPCIS events on one history reduce the chase to align separate databases after a dispute.
* Automatable handoffs. Escrow contracts can release payment when a verified arrival event arrives, which cuts waiting for manual paperwork.
* Privacy with auditability when designed with proofs. MediLedger proved transfers can be validated while commercial detail stays hidden.

**Where it is constrained:**

* Garbage in, garbage out. The ledger makes records visible and permanent. It does not make a scan true. A false label scanned at the farm enters as a false but permanent record unless devices or sampling detect it.
* Oracle and device risk. GPS and temperature still need device attestation, key management, and aggregation across sources. A compromised scanner can trigger payment for goods that never arrived.
* Scale and cost. Global supply chains generate very high event volumes. Peers, endorsement, ordering, and storage cost to run. Public chain fees vary. GS1 and MediLedger both advise keeping full documents off chain and anchoring hashes and key fields.
* Adoption. TradeLens showed a sound build can fail if the parties you need do not join. Mapping legacy codes to GTIN, GLN, SSCC, and CBV remains integration work.
* Privacy tradeoff. Full transparency helps consumers but exposes pricing among competitors. Channels help on Fabric but add governance.
* Counterfeits outside the network. The OECD and European Union Intellectual Property Office estimated in Mapping Global Trade in Fakes 2025 that counterfeit and pirated goods were about 467 billion US dollars in 2021, which is 2.3 percent of global imports and 4.7 percent of EU imports, with about 60 percent of seizures arriving by mail. A ledger only tracks goods that enter the tracked network.

## How to get started

### If you are moving from logistics into Web3

1. Solidify the standards. Learn GTIN, GLN, SSCC, and EPCIS 2.0 event types at ref.gs1.org/standards/epcis/2.0.1 and the GS1 US blockchain guidance. Be able to write one object event, one aggregation event, and one sensor event with correct business step.
2. Run Fabric test network. The docs include a two-peer, one-orderer sample. Install one chaincode that handles a trade item and a shipment, set an endorsement policy that requires both shipper and receiver, and query by SSCC.
3. Add one oracle in a lab. Bring a mock GPS or temperature API through an oracle, aggregate two sources off chain, and submit one signed result to your contract. Test offline and duplicate scan cases.
4. Build one lane pilot on paper first. Choose a high recall cost SKU, define its identifiers and three EPCIS events, and walk through signed handover at each step. Then implement that lane with hashes on chain and full events in an EPCIS repository.
5. Measure before and after on the same lane: time to trace a lot, share of correct first capture, port dwell change, dispute time, and cost per event.

### If you are aiming for specific roles

* **Supply chain protocol developer.** You need Fabric chaincode in Go or Node.js or EVM contracts in Solidity, plus EPCIS JSON-LD and oracle integration. Show a repo with an EPCIS to ledger mapper and a verified arrival escrow test.
* **Web3 logistics consultant.** You need to map as-is flows, design the EPCIS to ledger mapping, and run the pilot with two suppliers. Show a one-page event model and a recall drill result.
* **Product manager for supply chain.** You own the dashboard that reads on-chain events and displays lot genealogy and alerts. Show how endorsement and privacy rules become clear UX and exception flows.
* **Analyst for compliance and provenance.** You query EPCIS and ledger proofs, cross-check certificates and origin claims, and flag mismatches. Show you can trace from QR scan to GTIN to EPCIS history without assuming the source scan was correct.

### What to collect for interviews

Record the lane, the identifiers, the three EPCIS events, the endorsement policy, the oracle setup, and the measured trace time. Keep a short video of scanning to event to ledger query. Teams hire for that loop more than for token diagrams.

## FAQ

**Does blockchain prove a product is genuine?**

No by itself. It proves the history for an identifier has not been rewritten and that transfers followed the contract rules. Whether the item is genuine depends on binding the item to the identifier with a hard-to-copy check such as a diamond scan, a serialized seal, or a lab result, plus sampling.

**Is Fabric the same as Ethereum?**

No. Fabric is permissioned with known members and channels, and has no required cryptocurrency. Ethereum is permissionless and uses ETH for gas. Both support smart contracts, but trust and cost differ.

**Why not put every field on chain?**

Cost and privacy. Full documents would be expensive and would expose pricing and volumes. Common practice is to keep the full EPCIS event in a repository, put the hash and key fields on chain, and link the two.

**What is the oracle problem in simple terms?**

The ledger cannot see outside itself. A separate oracle service brings in GPS or temperature. If that service is centralized or the device is spoofed, the contract will run correctly on wrong inputs. Pilots use multiple devices, signed data, and off-chain aggregation.

**What ended TradeLens if it worked technically?**

Adoption. Maersk and IBM said on November 29, 2022 that full industry collaboration was not achieved and commercial viability was not reached, so they withdrew the platform by end of Q1 2023. Competitors did not want to share data on a carrier-led network.

**How does a QR code fit?**

The QR encodes a GS1 Digital Link with GTIN plus serial or lot. Scanning resolves to an EPCIS or ledger query that returns the event history. The code is only a pointer. The signed event history is the proof.

**Do I need a token to run this?**

On Fabric no. On OriginTrail the DKG uses TRAC with a 500 million fixed supply to pay and collateralize nodes. On public chains you need the chain's gas token for writes even if your product token is separate.

**What scale of counterfeiting does this compete with?**

The OECD mapping for 2021 put counterfeit and pirated goods at about 467 billion US dollars, 2.3 percent of global imports, with small parcels and mail as the dominant channel. Any solution that only tracks bulk freight misses a large share.

## Next steps

Pick one SKU that is costly to recall, write its GTIN, SSCC, and three planned EPCIS events on one page, and run a tabletop where each handover is a signed EPCIS event on a Fabric test channel. Add one sensor and one oracle so a temperature or arrival condition can drive a contract action. Compare trace and reconciliation time before and after on the same lane. That measured loop is what turns a demo into a hiring signal or a purchase decision.

For source reading, use Hyperledger Fabric docs, GS1 EPCIS 2.0 and the GS1 US blockchain guidance, the Walmart September 24, 2018 mandate and IBM Food Trust October 8, 2018 release, the Walmart China June 25, 2019 VeChain release and VeChain January 2024 update, De Beers Tracr pages at debeersgroup.com, the FDA hosted MediLedger DSCSA pilot report, Maersk's November 29, 2022 TradeLens discontinuation notice, OriginTrail docs and 2.0 white paper, the Chainlink oracle problem explainer, and OECD Mapping Global Trade in Fakes 2025.

