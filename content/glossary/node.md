---
term: "Node"
slug: "node"
category: "Technical"
difficulty: "Intermediate"
image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&h=600&fit=crop"
imageAlt: "Network servers and distributed systems representing blockchain nodes"
description: "A computer that connects to a blockchain network, maintaining a copy of the distributed ledger and validating transactions. The fundamental building blocks of blockchain infrastructure."
relatedTerms: ["blockchain", "mining", "consensus-mechanism"]
synonyms: ["network node", "blockchain node", "validator"]
---

A node is any computer that connects to a blockchain network and participates in maintaining the distributed ledger. Nodes store copies of the blockchain, validate transactions and blocks, and relay information to other nodes. They form the decentralized infrastructure that makes blockchains work without central authorities. Understanding nodes is fundamental to grasping how blockchains achieve decentralization and trustlessness.

## Full Nodes vs Light Nodes

Full nodes download and validate the entire blockchain from genesis to the present. They independently verify every transaction and block ever created, ensuring the rules are followed without trusting anyone else. Running a full node provides maximum security and privacy—you verify everything yourself rather than trusting third-party services.

Light nodes (SPV or simplified payment verification nodes) download only block headers rather than complete blocks. They can verify that transactions exist in blocks but can't independently validate all blockchain rules. Light nodes require less storage and bandwidth, making them practical for mobile devices and lower-powered computers, though they sacrifice some security and privacy.

Archive nodes are full nodes that store additional historical state data, not just current state. They can answer queries about any past state of the blockchain. Most full nodes only keep recent state to save storage. Archive nodes require massive storage—Ethereum archive nodes need several terabytes—but enable block explorers, analytics, and historical queries.

## Why Run a Node

Running your own node ensures you don't have to trust anyone else about blockchain state. When checking your balance or broadcasting transactions through your node, you know the information is accurate because you verified it yourself. Third-party services could lie about your balance, show fake transactions, or censor your broadcasts.

Privacy is another motivation. When using someone else's node, they see your transaction activity and can link it to your IP address. Running your own node prevents this surveillance. You query your own database and broadcast transactions without revealing your activity to third parties.

Supporting the network motivates altruistic node operators. More nodes mean greater decentralization and censorship resistance. If only a few entities ran nodes, they could collude to change rules or censor transactions. A distributed network of thousands of independently operated nodes makes such attacks practically impossible.

## Technical Requirements

Bitcoin full nodes require modest resources—around 500GB of storage, decent internet bandwidth, and basic computing power. Any modern computer can run Bitcoin Core. Ethereum full nodes need more resources—2TB+ for archive nodes, though regular full nodes use less. Faster SSDs and good internet connections improve sync times.

Operating system choice affects node operation. Most nodes run on Linux for stability and efficiency. Windows and macOS work but with potentially higher resource usage. Cloud servers from AWS, Digital Ocean, or Hetzner offer an alternative to home hardware, though this somewhat centralizes infrastructure and introduces trust in the hosting provider.

## Setting Up a Node

Running a Bitcoin node starts with downloading Bitcoin Core from bitcoin.org, verifying signatures for security, and launching the software. Initial sync takes hours or days as the node downloads and validates the entire blockchain history. Once synced, the node updates continuously as new blocks arrive.

Ethereum nodes offer multiple client options: Geth, Nethermind, Besu, Erigon. Client diversity strengthens the network—if one client has a bug, other clients continue operating correctly. Setting up an Ethereum node requires choosing a client, configuring it, and syncing the blockchain. Checkpoint sync enables faster initial setup.

## Validator Nodes

On proof-of-stake blockchains like post-merge Ethereum, validator nodes go beyond passive validation to actively propose and attest to blocks. Running a validator requires staking tokens (32 ETH for Ethereum) and maintaining very high uptime. Validators earn rewards for honest participation but risk slashing—loss of stake—for misbehavior or downtime.

Validator responsibilities include proposing new blocks when selected, attesting to other blocks' validity, and participating in protocol governance. The technical requirements exceed regular full nodes—validators need extremely reliable hardware, redundant internet connections, and monitoring systems to prevent downtime that could result in lost funds.

## Mining Nodes

Proof-of-work mining nodes perform all full node functions plus the additional work of trying to solve the cryptographic puzzle to create new blocks. Mining nodes need specialized hardware (ASICs for Bitcoin, GPUs historically for Ethereum) and significant electricity. They're economically motivated—mining rewards and transaction fees compensate for costs.

Mining nodes cluster in regions with cheap electricity. Industrial mining operations run thousands of machines in dedicated facilities. This mining centralization raises concerns about decentralization, though geographic distribution and switching costs between pools provide some protection against centralized control.

## RPC Nodes

RPC (Remote Procedure Call) nodes provide API access for applications to query blockchain data and submit transactions. Projects like Infura and Alchemy run RPC node infrastructure that dApps use instead of requiring each user to run their own node. This improves user experience but creates centralization—many apps depend on a few RPC providers.

Running your own RPC node for application development ensures reliability and avoids rate limits. The setup resembles regular full nodes but with RPC ports open and potentially load balancing if serving many users. Open-source tools like Erigon optimize for fast RPC responses with efficient data indexing.

## Pruned Nodes

Pruned full nodes validate everything but delete old blockchain data to save storage. They keep only recent blocks and current state, sufficient for validating new transactions and blocks. Pruned Bitcoin nodes use around 10GB instead of 500GB+. They provide most full node benefits with minimal storage requirements.

The tradeoff is inability to serve historical blockchain data to other nodes. Pruned nodes can't help new nodes bootstrap by providing old blocks. Networks need sufficient unpruned nodes to enable new nodes to sync. For personal use, pruned nodes offer an excellent balance of security, privacy, and resource requirements.

## Network Topology

Nodes connect in a peer-to-peer mesh topology. When your node starts, it connects to several peer nodes. It learns about other nodes from its peers and maintains ongoing connections to 8-125 peers typically. This mesh network ensures information propagates quickly—new transactions and blocks spread to all nodes within seconds.

Network topology affects privacy and reliability. If all your peers are controlled by an attacker, they could present a false view of the blockchain (eclipse attack). Using diverse peers from different networks and jurisdictions improves security. Some users connect through Tor for privacy, accepting reduced performance for anonymity.

## Sybil Attack Resistance

Blockchains must resist Sybil attacks where attackers create many fake nodes to gain influence. Proof-of-work and proof-of-stake make Sybil attacks expensive—you need real hash power or staked capital, not just many computers. Regular non-mining nodes don't prevent Sybil attacks but don't need to—they validate independently regardless of how many fake nodes exist.

This design elegantly separates validation from consensus. Anyone can run a validating node to verify blockchain state. Determining which chain is correct and creating new blocks requires economic resources (mining hardware or staked tokens), preventing cheap Sybil attacks.

## Node Diversity

Client software diversity strengthens blockchain resilience. If everyone runs identical software, a single bug affects the entire network. Ethereum explicitly promotes multiple client implementations in different programming languages. When a consensus bug is found in one client, other clients maintain network operation.

Geographic and jurisdictional diversity also matters. Nodes spread across many countries resist censorship—no single government can shut down the network. Home users running nodes in their basements contribute more to decentralization than large data center clusters, even if the latter are more powerful.

## Economic Incentives

Most nodes receive no direct financial compensation beyond the benefits of self-sovereignty and privacy. This creates a free-rider problem—everyone benefits from a decentralized network, but running nodes costs money. Despite this, thousands voluntarily run unprofitable nodes due to ideological commitment or business needs.

Some projects experiment with node incentives. Storage networks like Filecoin pay nodes for providing storage. Infrastructure tokens reward node operators. These incentive structures can increase node counts but may also attract mercenary behavior where operators shut down nodes if rewards decrease.

## Career Opportunities

Node operation skills matter for various blockchain careers. DevOps engineers specialize in running reliable node infrastructure for applications and services. Infrastructure companies need expertise in node deployment, monitoring, and optimization. Understanding node operations is essential for protocol developers building blockchain clients.

Consulting opportunities exist helping institutions run nodes for custody, compliance, or network participation. As more traditional organizations enter blockchain, demand for node operation expertise grows. The skills transfer between blockchains—once you understand running Bitcoin nodes, Ethereum or other blockchain nodes become manageable. Expertise in node reliability, security, and optimization remains valuable across the ecosystem.
