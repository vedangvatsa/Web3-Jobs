---
title: >-
  Supply Chain Blockchain Explained: How Shared Ledgers Track Goods From Source
  to Store
image: /images/thisisengineering-zBLtU0zbJcU-unsplash.jpg
data-ai-hint: supply chain logistics
description: >-
  How blockchain tracks goods across supply chains, from tokenized products and
  GS1 EPCIS events to smart contract payments and oracle-fed IoT data. Real
  deployments, tradeoffs, and how to get started.
category: Technology Deep Dives
publishedDate: '2026-03-11'
lastUpdated: "2026-09-04"
---
A supply chain blockchain is a shared, append-only ledger that records where a product has been, who handled it, and what happened to it at each step. Instead of each company keeping a separate database, participants write standardized events to one ledger that no single party can rewrite. That record is then used to prove provenance, speed recalls, and automate payments when conditions are met.

It does not replace scanners, ERPs, or trucks. It gives those systems a common place to agree on history.

## What it is

Supply chain blockchain work has two parts. The physical flow moves the goods. The information flow records_gs events about the goods. Blockchain handles the second part.

Most production deployments use permissioned ledgers. Hyperledger Fabric, documented at hyperledger-fabric.readthedocs.io, is the common example. It is open source, hosted by the Linux Foundation since 2015, and is designed for known participants. Members enroll through a Membership Service Provider, transact on channels that limit who sees what, and enforce an endorsement policy that says which organizations must sign a transaction before it is valid. Fabric does not require a native cryptocurrency or mining. Consensus is pluggable, and chaincode, which is Fabric's name for smart contracts, is installed on peers and committed to a channel.

Public ledgers are also used, often for open verification. The most cited examples combine a public or permissioned chain with GS1 standards, especially EPCIS 2.0 at gs1.org/standards/epcis, which defines the shared language for visibility events.

In both models the ledger stores proofs and state changes. Large files, images, and sensor logs stay off chain. The chain stores hashes, identifiers, and the events that prove custody changed under agreed rules.

## Who it is for

**Operators who move or sell physical goods.**That includes farmers, manufacturers, logistics providers, cold chain operators, customs brokers, distributors, and retailers who need to answer where a lot came from and where it is now. If you handle recalls, audits, or sustainability claims, this is your primary use case.**Enterprise teams who integrate ERPs and WMS.**You already run SAP, Oracle, or Manhattan. You need to publish shipment, receipt, and transformation events without rebuilding those systems. GS1 identifiers and EPCIS messages are how you keep the integration stable.**Builders of supply chain applications.**Protocol developers write ledger logic and connect IoT devices. Product managers build dashboards that read ledger events and present inventory or compliance views. Web3 logistics consultants guide pilots and measure whether the ledger saves time or cost.**Career switchers with logistics background.**You bring domain knowledge about bills of lading, GTINs, SSCCs, and warehouse processes. You add basic smart contract and data standards skill to design pilots that reflect how the warehouse actually works.

If you never touch a physical handover, you can use the concepts without running a node. If you are responsible for provenance or recall speed, the sections below affect architecture and vendor choice.

## How it works

### 1. A shared ledger replaces reconciled silos

Today a mango or a carton of medicine generates records in many places. The farm logs harvest, the pack house logs packing, the carrier logs pickup, customs logs clearance, the retailer logs receipt. Each record lives in a different system. When something goes wrong, people chase paper or emails to align them. Walmart summarized the prior method as one-step-up, one-step-back traceability that is often paper based, in its September 24, 2018 press release at corporate.walmart.com.

A blockchain channel gives those parties one copy of the history. Each participant holds a peer that keeps the world state, which is the current value, and the transaction log, which is the update history. The ledger is append only. Once a valid transaction is ordered and committed, it cannot be edited without creating a new transaction that is also visible. That is the source of the tamper-evident claim. It does not mean data is true. It means later changes are visible.

Fabric adds privacy controls that matter for supply chains. Companies that compete can share a network but keep some prices or volumes private using channels or private data collections. Only members of a channel see its ledger.

### 2. Products as identifiers and events as EPCIS messages

Goods are identified with GS1 keys so systems can talk to each other. Common keys are GTIN for trade items, GLN for locations, and SSCC for logistics units. Those keys are encoded in barcodes or RFID via GS1 AIDC standards.

Movement and transformation are expressed as EPCIS events. The GS1 US guidance, Applying GS1 Standards for Supply Chain Visibility in Blockchain, and the EPCIS 2.0 standard at ref.gs1.org/standards/epcis/2.0.1 describe four dimensions for each event: what was involved, when it happened, where it happened, and why, which is the business step and disposition. The Core Business Vocabulary provides the allowed values for step and disposition. EPCIS also carries extensions for sensor data, lot and serial numbers, and certification details added in version 2.0.

On a blockchain the pattern is simple. A company scans or senses the goods, creates an EPCIS event, signs it, and submits it to the ledger through chaincode or a smart contract. Others can query the event history for a given SSCC or serialized GTIN. Using EPCIS first, then anchoring it on chain, keeps the data interoperable even if the ledger changes later. GS1 notes the same point at gs1.org/standards/blockchain: standards let blockchain networks scale and stay interoperable.

Tokens are used for two things. A fungible token may represent a lot or an amount. A non-fungible record often represents a serialized item or a sealed sector of provenance data. The MediLedger design, for example, treats each serialized saleable unit as a non-fungible token with custody assigned to a trading partner. The smart contract enforces that only one party holds legal ownership at a time.

### 3. Smart contracts automate rules and payments

Smart contracts hold the business rules that used to live in emails and letters of credit. A contract can say funds sit in escrow until a verified arrival event is written, or that a certificate must be present before a shipment can be marked as received.

A common logistics pattern looks like this:

1. An importer deposits funds in a smart contract escrow.
2. The exporter ships goods and posts a shipped event with SSCC and EPCIS data.
3. An oracle posts a verified location or temperature reading.
4. The contract checks the endorsement policy, verifies the condition, and releases payment.

The contract does not see the truck. It sees a signed event that claims the truck arrived. Whether that claim is reliable depends on the oracle and the sensor, which is where the next section matters.

MediLedger, whose FDA DSCSA pilot report is at fda.gov/media/168283/download, adds zero-knowledge proofs for privacy. Transactions posted to the chain are obfuscated so business intelligence is not revealed, while still proving that ownership transferred from the rightful holder. The chain enforces no double transfer, and private EPCIS messages carry the confidential detail between the two parties.

### 4. Oracles and IoT connect the physical to the digital

Blockchains are isolated by design. They cannot fetch GPS or temperature on their own. An oracle is the middleware that brings outside data in and carries proofs or payments out. Chainlink describes this as the oracle problem at chain.link/education-hub/oracle-problem: deterministic contracts need outside facts to be useful, but outside facts must be delivered without breaking consensus.

In supply chains the outside facts come from IoT devices, handheld scanners, and ERP APIs. A temperature logger in a reefer container or a GPS tracker on a pallet sends data via API. A decentralized oracle network fetches the data from several sources, aggregates it off chain, and submits one verified update on chain. Chainlink's supply chain examples describe the same flow: a pallet sensor proves it reached the correct address, that proof triggers a contract that releases payment to the carrier.

Decentralization at the oracle layer matters. A single device can fail or be spoofed. Good pilots combine device attestation, multiple data sources, and repeated signing so a bad reading does not automatically move money.

## Real deployments and what they teach

Numbers below come from official releases or audited pilot reports, not marketing estimates.

### Walmart and IBM Food Trust: mangoes and leafy greens

Walmart ran two Hyperledger Fabric pilots with IBM in 2016 to 2017, one for pork in China and one for mangoes from Central and South America to the US. The mango pilot is the one Walmart cites most. The time to trace a mango from store to farm fell from about seven days using the old method to 2.2 seconds on the blockchain pilot. Walmart published that result in its September 24, 2018 mandate to leafy green suppliers and IBM repeated it at the December 2018 Food Trust launch. The shared report is hosted at jbba.scholasticahq.com as Food Traceability on Blockchain: Walmart's Pork and Mango Pilots with IBM.

On October 8, 2018, IBM announced IBM Food Trust as generally available on IBM Cloud, built on Hyperledger Fabric and compatible with GS1 standards. The fact sheet reported more than four million transactions, more than 350 SKUs tracked, nearly three million packaged products traced, and about 50 partners putting data on the system. Walmart then required leafy green suppliers to capture end-to-end traceability on the same network by September 2019. France's Carrefour also joined, which extended tracked food to European stores.

Lesson: the benefit was recall scope and speed. Yiannas, then Walmart VP of Food Safety, said the range of a recall could be narrowed to specific lots instead of pulling a whole category, which cuts waste and cost. The cost was onboarding suppliers to capture data at the farm and pack house with handheld systems.

### Walmart China and VeChainThor: scale on a public chain variant

Walmart China, with the China Chain-Store & Franchise Association, PwC, and VeChain, announced the Walmart China Blockchain Traceability Platform at the June 25, 2019 China Products Safety Publicity Week seminar. The release at prnewswire.com stated the platform is built on VeChainThor and listed 23 product lines at launch, with a plan to add 100 more by year end across more than 10 categories including fresh meat, rice, mushrooms, and cooking oil. By early 2020 the target was traceable fresh meat to account for 50 percent of packaged fresh meat sales and similar targets for vegetables and seafood.

In January 2024 VeChain reported the private Walmart China traceability network had passed 200 million transactions. The network is private and built on VeChainThor, while VeChain's public mainnet volume was reported separately at about 52 million at that time. The milestone shows a working throughput level that many pilots never reach, but it is a permissioned deployment for one retailer, not a sector-wide network.

Lesson: a single large buyer can drive adoption where a neutral industry effort struggles, because the buyer can set data requirements for its suppliers.

### De Beers Tracr: diamonds from mine to retail

De Beers started Tracr in 2018 as an R&D project to track rough diamonds at source. It now runs as a private chain on AWS with participants using JavaScript, REST, and Python microservices to register goods. De Beers describes the stack as a cloud-based private Ethereum ledger plus AI matching that links rough scans at the mine to polished scans at the manufacturer.

Scale is public. De Beers stated in 2022 that Tracr could register one million diamonds per week, and by 2024 nearly three million individual diamonds had been registered since 2022, with producers such as ODC and Mountain Province added. On October 21, 2024 De Beers said Tracr would list single country of origin for all De Beers-sourced rough diamonds above 1 carat, which is about 0.5 carats polished, from early 2025, with verification work underway via rough-to-rough and rough-to-polished scanning with Sarine Technologies. The ORIGIN polished program launched in 2024 gives retailers the tracked journey for participating stones.

Lesson: provenance works best when the identifier is tied to a physical measurement, in this case diamond scans and grading data, and not just to a label that can be moved between stones.

### MediLedger: pharma and the US DSCSA

The MediLedger project, started by Chronicled in 2017, gathered manufacturers, wholesalers, dispensers, logistics firms, and standards bodies to test blockchain for the Drug Supply Chain Security Act. The FDA requested pilots in early 2019 for the enhanced 2023 package-level tracing rules. The MediLedger final report, hosted by FDA, concluded a single blockchain solution could meet throughput, speed, and cost needs when paired with GS1 EPCIS messaging, and that privacy could be handled with zero-knowledge proofs while still enforcing business rules on chain. The pilot used private messaging for EPCIS between trading partners, a shared ledger for proofs, and zk-SNARKs to hide business data while proving ownership transfers were valid.

Lesson: regulated supply chains care more about authorized trading partner checks and private data handling than about token price. The report also notes four areas where standards were still missing at the time: messaging, system interoperability, APIs, and authorized partner identity.

### TradeLens: why a well-built platform can still fail

TradeLens was announced in 2018 by Maersk and IBM through GTD Solution as a permissioned blockchain for global shipping. It stored documents such as bills of lading, arrival times, and customs releases so all parties in a shipment could see the same record in near real time.

Maersk and IBM announced discontinuation on November 29, 2022, with the platform to go offline by end of Q1 2023. The statement at maersk.com said the technology worked but full global industry collaboration was not achieved and commercial viability as an independent business was not reached. Coverage at Reuters, Computerworld, and Supply Chain Dive on November 29 to 30, 2022 noted the same point: competitors were reluctant to put data on a platform run by the largest carrier, even with a neutral pitch.

Lesson: network effects decide outcomes. A supply chain ledger is only useful if the parties you need to coordinate with are on it. Governance and neutrality matter as much as throughput.

### OriginTrail and SCAN: audits and knowledge graphs

OriginTrail builds a Decentralized Knowledge Graph, hosted by 2,200 plus DKG nodes at the time of its 2.0 white paper, and anchored on Ethereum, Polygon, and Gnosis with its own Polkadot parachain. The utility token TRAC was launched in 2018 with a fixed supply of 500 million as an ERC-20 on Ethereum. It is used to pay node runners for hosting and replicating Knowledge Assets, as collateral for nodes, and for delegation.

A supply chain example is the Supplier Compliance Audit Network, known as SCAN, whose members include Costco, Walmart, and Target. SCAN uses the DKG to secure audits and manage factory compliance data with privacy controls, sharing selectively with programs such as the US Customs Trade Partnership Against Terrorism. OriginTrail reports SCAN helps secure about 40 percent of imports to the United States. That is an adoption signal for a shared audit layer rather than for per-item tracking.

## Pros and cons, honestly**Where the shared ledger helps:**

* Recall speed and precision. Walmart's pilot showed trace time for mangoes fell from about seven days to 2.2 seconds, which lets a retailer pull a narrow lot instead of a whole product line.
* Provenance you can show a customer or regulator. De Beers Tracr gives country of origin for registered diamonds over 1 carat. Walmart China lets shoppers scan a QR code for source farm, inspection report, and location history.
* Fewer reconciliations. EPCIS events on one ledger reduce the back-and-forth to align separate databases after a dispute.
* Automatable handoffs. Smart contracts can hold escrow and release payment when a verified arrival event arrives, which removes waiting for a letter of credit and manual paperwork.
* Audit and privacy balance when built correctly. MediLedger showed you can prove a transfer was valid with zk proofs while hiding volume and pricing from others on the same ledger.

**Where it costs or limits:**

* Garbage in, garbage out. The ledger makes records visible and immutable. It does not make a scan true. A fake label scanned at the farm enters the chain as a false but permanent record unless sensors, attestations, or sampling detect it.
* The oracle problem stays hard. GPS, temperature, and certificate checks need reliable devices, key management, and aggregation across multiple sources. One compromised scanner can trigger payment for goods that never arrived.
* Throughput and cost at scale. Global supply chains produce very large numbers of events. Hyperledger Fabric avoids mining cost, but peers, endorsement, ordering, and storage still cost to run. Public chain fees and latency also vary. MediLedger and GS1 both warn to reuse EPCIS and to keep raw documents off chain and only anchor proofs.
* Adoption and standards gap. TradeLens showed a viable technical build can fail if carriers, ports, and customs do not join. Common identifiers and vocabularies help, but many firms still use custom codes that need mapping.
* Privacy tradeoff. Full transparency helps consumers but hurts pricing confidentiality between competitors. Channels and private data help on Fabric, but they add governance overhead.
* No single vendor owns compliance. Keeping EPCIS, GTIN, GLN, SSCC, and CBV mappings correct across systems is still integration work. The October 2025 OECD report Mapping Global Trade in Fakes 2025 estimated counterfeit and pirated goods at about 467 billion US dollars in 2021, which is 2.3 percent of global imports and 4.7 percent of EU imports. A ledger helps prove provenance, but it does not stop counterfeits that never enter the tracked network.

**Tradeoff summary**

| Choice | Gain | Cost |
| --- | --- | --- |
| Permissioned ledger such as Hyperledger Fabric | Privacy via channels, pluggable consensus, no token mining, control over members | Smaller network, must recruit members, you run peers and ordering |
| Public or hybrid such as VeChainThor for Walmart China | Open verification via shared chain, easier consumer QR checks | Fee volatility, data kept private on top of public base needs design |
| Anchoring EPCIS events only, keep payloads off chain | Lower chain load, keeps GS1 interoperability | Need separate storage and discovery layer for full documents |
| On-chain smart contract escrow | Automatic payment on verified delivery | Depends on oracle reliability, needs fallback for exceptions |
| Decentralized knowledge graph such as OriginTrail DKG | Reusable audit and traceability knowledge assets across partners | Token and node operation overhead, still needs source data governance |

## How to use it and how to get started

### If you run a supply chain and want a pilot

1. Pick one product and one lane. Walmart started with one fruit lane, not the whole catalog. Choose a high recall cost product where lot-level traceability pays for the work.
2. Map identifiers first. Assign GTIN for the trade item, SSCC for the logistics unit, GLN for each location, and define which EPCIS events you need: object, aggregation, transaction, and sensor events. Use the CBV lists for business step and disposition so partners share the same values.
3. Decide ledger type and who runs nodes. If competitors must share data, a permissioned Fabric network with channels per relationship is a practical start. If consumer verification matters most, a private network anchored to a public chain gives a simple QR scan story.
4. Define endorsement and write policy. Decide which organizations must sign a received event before it counts. Keep the policy small at first so throughput stays high.
5. Choose oracles and devices. For a container, combine a GPS tracker and a separate carrier feed. For cold chain, add a calibrated temperature logger and require two sources to agree before payment triggers. Test failure modes such as device offline, late message, or duplicate scan.
6. Keep raw data off chain. Store EPCIS XML or JSON-LD in your existing store or EPCIS repository, put the hash and key event fields on chain, and link the two. That keeps cost down and keeps GS1 query interfaces usable.
7. Measure what matters. Time to trace a lot, share of accurate EPCIS events on first capture, port and border delay change, dispute resolution time, and cost per event. Walmart's mango metric, seven days to 2.2 seconds, is the model for a before and after target.

### If you are a builder

Prerequisites are basic smart contract skill plus GS1 and EDI comfort. You will read EPCIS JSON-LD and call chaincode, not just write Solidity.

1. Read the core specs. Start with Fabric introduction and chaincode lifecycle at hyperledger-fabric.readthedocs.io, the EPCIS 2.0 standard at ref.gs1.org/standards/epcis/2.0.1, and the GS1 US guide Applying GS1 Standards for Supply Chain Visibility in Blockchain. Then read the Chainlink oracle problem explainer at chain.link/education-hub/oracle-problem for device patterns.
2. Run Fabric test network. The docs include a test network with two peers and one ordering node. Install one chaincode that handles two asset types: a trade item and a shipment. Implement endorse, transfer, and verify functions and set an endorsement policy that requires both shipper and receiver.
3. Model events as GS1 EPCIS. Produce events with what, when, where, and why populated from CBV. Use GS1 Digital Link for QR codes so scanning returns a GS1 identifier that resolves to the EPCIS repository.
4. Add an oracle in a lab. Use a simple REST adapter that brings GPS or temperature from a mock API into your chaincode via Chainlink or a custom oracle. Aggregate two sources off chain and submit one signed result. Test retries and signing keys.
5. Evaluate existing networks before building new. For pharma check MediLedger docs at mediledger.readthedocs.io and the FDA pilot report. For food retail check IBM Food Trust architecture notes. For audits check OriginTrail docs at docs.origintrail.io. Reusing a network avoids recruiting peers from scratch.

### Career paths that use this stack

* **Supply chain protocol developer.** You build Fabric chaincode or EVM contracts for shipments, handle EPCIS parsing, and wire IoT data through oracles. You need Go, Node.js, or Solidity, plus GS1 identifiers and event modeling.
* **Web3 logistics consultant.** You map as-is processes, design the EPCIS to ledger mapping, and run pilots with a few suppliers. You need change management skill and a way to measure recall or dwell time improvement.
* **Product manager with supply chain focus.** You own the dashboard that reads on-chain events and displays lot genealogy, sensor alerts, and exception workflows. You need to translate endorsement and privacy rules into clear UX.
* **Analyst for compliance and provenance.**You review chain data against certificates, country of origin claims, and audit records, and flag mismatches. You need to know how to query an EPCIS repository and how to read a ledger proof without assuming the source data was correct.

## FAQ**Does blockchain prove a product is genuine?**No directly. It proves the history attached to an identifier has not been rewritten and that transfers followed the contract rules. Whether the item is genuine still depends on binding the physical item to the identifier with a hard-to-copy link such as a diamond scan, a serialized seal, or a certified lab result, plus sampling to catch substitution.**Is Hyperledger Fabric the same as Ethereum?**No. Fabric is permissioned, members are known and enroll via a Membership Service Provider, data can be kept private on channels, and there is no required cryptocurrency. Ethereum is permissionless and uses ETH for gas. Both support smart contracts, but their trust and cost models differ.**Why not put every scan on a public chain?**Cost and privacy. Global supply chains produce very high event volumes. Writing every field to a public chain would be expensive and would expose pricing and volumes to competitors. Common practice is to store the full EPCIS event privately, put a hash and key fields on chain, and keep the event available through a repository that enforces access control.**What is the oracle problem in plain terms?**The ledger cannot see outside itself. It needs a separate service, the oracle, to bring in GPS, temperature, or customs clearance data. If that service is centralized or the device is compromised, the ledger will execute correctly on wrong inputs. Pilots address this with multiple devices, signed data, and off-chain aggregation before one value is written on chain.**What stopped TradeLens if the technology worked?**Adoption. Shipping lines, ports, and regulators that compete with Maersk did not want to put commercial data on a carrier-led platform despite the neutral pitch. Maersk and IBM said on November 29, 2022 that full industry collaboration was not achieved and commercial viability was not reached, so the platform was withdrawn by end of Q1 2023.**How does a QR code fit in?**The QR code encodes a GS1 identifier, often a Digital Link that includes the GTIN and a serial or lot number. Scanning resolves to an EPCIS repository or a ledger query that returns provenance events. The code itself is not the trust. The signed event history behind it is.**Do I need a token to run a supply chain blockchain?**On Fabric you do not. Chaincode is called by enrolled clients and ordered by the ordering service without a token. On OriginTrail the DKG uses TRAC for paying node runners, staking as collateral, and delegation, with a fixed supply of 500 million. On public chains you need the chain's gas token for writes, even if your product token is separate.**What should I watch for with counterfeits?**

The OECD and European Union Intellectual Property Office estimated in Mapping Global Trade in Fakes 2025 that counterfeit and pirated goods were about 467 billion US dollars in 2021, which is 2.3 percent of global imports. About 60 percent of seized items arrived by mail and small parcels are the dominant channel. That means any solution that only tracks bulk shipments will miss a large part of illicit flow.

## Next steps

Start narrow. Choose one SKU that is costly to recall, map its GTIN, SSCC, and planned EPCIS events in a one-page event model, and run a tabletop where each handover is a signed EPCIS event on a Fabric test channel. Then add one sensor and one oracle so a temperature or arrival condition can trigger a contract action. Compare trace time and reconciliation time before and after on the same lane. That proof is what decides whether to add a second lane or a second partner.

For reading, use the official sources cited above: Hyperledger Fabric docs for permissioning and chaincode, GS1 EPCIS and the GS1 US blockchain guidance for event structure, the Walmart September 24, 2018 press release and IBM Food Trust October 8, 2018 release for the food pilot, the Walmart China June 25, 2019 VeChain release and VeChain's January 2024 update for the China scale case, De Beers group news for Tracr at debeersgroup.com, the FDA hosted MediLedger pilot report, Maersk's November 29, 2022 TradeLens discontinuation notice, the OriginTrail 2.0 white paper and docs.origintrail.io for DKG and TRAC, the Chainlink oracle problem page, and OECD Mapping Global Trade in Fakes 2025 for the counterfeit baseline.

## Verifiable Primary Sources & References

1. [Ethereum EIP-20 Token Standard Specification](https://eips.ethereum.org/EIPS/eip-20)
2. [Ethereum EIP-721 Non-Fungible Token Standard Specification](https://eips.ethereum.org/EIPS/eip-721)
3. [Ethereum Official Yellow Paper & Protocol Specification](https://ethereum.github.io/yellowpaper/paper.pdf)
4. [Ethereum Consensus Specs & Proof of Stake Architecture](https://github.com/ethereum/consensus-specs)
5. [Solidity Compiler Official Documentation & Language Spec](https://docs.soliditylang.org/)
6. [Aave v3 Technical Protocol Architecture Documentation](https://docs.aave.com/developers/)
7. [Chainlink Decentralized Oracle Networks Architecture Whitepaper](https://chain.link/whitepaper)
8. [Base Layer 2 Network Official Documentation](https://docs.base.org/)
9. [Solana Core Architecture Documentation](https://docs.solana.com/)
10. [Polygon Protocol Architecture Documentation](https://docs.polygon.technology/)
