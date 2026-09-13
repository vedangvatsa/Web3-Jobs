---
title: Indexing Blockchain Data with The Graph
ogTitle: "INDEXING BLOCKCHAIN DATA WITH THE GRAPH"
image: /images/articles/charts/the-graph-indexing-pipeline.svg
description: A comprehensive technical guide to blockchain indexing with The Graph, exploring Graph Node architecture, AssemblyScript WASM mappings, GraphQL schemas, and decentralized GRT query markets.
category: Getting Started
publishedDate: "2026-03-11"
lastUpdated: "2026-09-13"
tags:
  - The Graph
  - Subgraphs
  - Blockchain Indexing
  - GraphQL
  - Web3 Development
  - Smart Contracts
---
# Indexing Blockchain Data with The Graph

Modern web applications rely upon relational databases, document stores, and search indexes to serve responsive user interfaces. When a user navigates to an e-commerce platform or social media dashboard, backend systems query indexed PostgreSQL, Redis, or Elasticsearch clusters, returning user profiles, transaction histories, and real-time feeds in tens of milliseconds.

In public blockchain architectures, this relational data tier is completely absent. Blockchains like the [Ethereum Foundation](https://ethereum.org) execution layer, [Solana Protocol](https://solana.com), [Arbitrum Layer 2](https://arbitrum.io), and [Base Protocol](https://base.org) are optimized for transactional consensus and chronological block production, not for flexible data querying. State is recorded inside cryptographic Merkle Patricia Tries and append-only event logs, organized strictly by sequential block height.

Attempting to answer a standard consumer web query, such as "Show all active liquidity positions held by Alice across [Uniswap v3](https://uniswap.org), along with her historical trading volume and total fees earned over the past 30 days", using native JSON-RPC calls (`eth_call` and `eth_getLogs`) is technically impractical. An application would need to iterate through millions of historical blocks, make thousands of rate-limited network calls, unpack raw hex calldata, and reconstruct protocol state client-side in the user web browser.

**The Graph Protocol ** resolves this fundamental data barrier. Designed as an open-source decentralized indexing and query protocol, The Graph allows software engineers to build and deploy open APIs called ** Subgraphs**. Subgraphs read event logs directly from blockchain execution nodes, process that data through WebAssembly mapping functions, store relational entities in high-performance databases, and expose deterministic [GraphQL](https://graphql.org) endpoints to frontend applications. This masterclass provides an exhaustive architectural and implementation guide to building, testing, optimizing, and deploying subgraphs on The Graph decentralized network.

```
+-----------------------------------------------------------------------------------+
|                        THE BLOCKCHAIN DATA PIPELINE GAP                           |
+-----------------------------------------------------------------------------------+
|  Raw Blockchain Layer (Sequential & Unindexed)                                    |
|  [Block 19,000,001] -> [Block 19,000,002] -> ... -> [Block 19,000,500]           |
|  

- Data locked in raw hexadecimal transaction receipts and event logs             |
|  

- JSON-RPC nodes rate-limit complex range queries (`eth_getLogs`)                |
|                                                                                   |
|  ============================== THE SOLUTION ==================================  |
|            THE GRAPH DECENTRALIZED INDEXING ENGINE (GRAPH NODE)                   |
|  1. Ingestion: Streams raw RPC / Firehose block logs                              |
|  2. Mapping: Executes AssemblyScript handlers inside WebAssembly (WASM) sandbox  |
|  3. Entity Store: Writes structured relational data to PostgreSQL                 |
|  4. Query Interface: Serves sub-millisecond GraphQL queries to frontend dApps    |
|                                                                                   |
|  ============================= THE FRONTEND ===================================  |
|  Frontend Applications: Uniswap, Aave, Synthetix, [OpenSea Marketplace](https://opensea.io), and Balancer               |
+-----------------------------------------------------------------------------------+
```

---

## The Blockchain Data Dilemma: Why Direct RPC Calls Fail

To understand why dedicated indexing middleware is mandatory for decentralized application engineering, one must evaluate the operational constraints of standard blockchain full nodes:

```
+---------------------------------------------------------------------------------+
|                       DIRECT RPC VS INDEXED SUBGRAPH QUERIES                    |
+-----------------------+-----------------------------+---------------------------+
| Query Dimension       | Direct JSON-RPC Node        | The Graph Subgraph        |
+-----------------------+-----------------------------+---------------------------+
| Query Paradigm        | Sequential block scan       | Relational GraphQL schema |
| Network Latency       | 15 - 45 seconds (multi-call)| 20 - 80 milliseconds      |
| Computation Location  | Client browser JavaScript   | Server-side PostgreSQL    |
| Historical Aggregation| Manual state reconstruction | Automated precomputed     |
| (Volume, OHLCV)       | across block loops          | entity accumulators       |
| Chain Reorganizations | Client state breaks or      | Deterministic automated   |
| (Reorgs)              | displays ghost balances     | rollback handling in node |
+-----------------------+-----------------------------+---------------------------+
```

### 1. The Cost of Primitive RPC Range Queries

When an application queries historical data via an Ethereum JSON-RPC client like [Geth](https://geth.ethereum.org), [Erigon](https://github.com/ledgerwatch/erigon), or [Reth](https://github.com/paradigmxyz/reth), the node must search the transaction receipt bloom filters for every single block in the requested range. 

If an application requests logs across a 500,000-block window (approximately 70 days on Ethereum mainnet), commercial infrastructure providers like [Infura](https://www.infura.io) and [Alchemy](https://www.alchemy.com) will reject the request with a timeout or payload-size-exceeded error (`query returned more than 10000 results`). 

### 2. The Chain Reorganization Vulnerability

Blockchains frequently experience short-lived forks known as **chain reorganizations (reorgs)**. During a reorg, blocks that were temporarily accepted at height $N$ are replaced by a longer, competing chain branch. 

If a client-side frontend naively processes an event log from a block that is subsequently orphaned, the user interface will display corrupted balances or confirmed trades that never legally occurred on the canonical ledger. 

Graph Node resolves this by tracking block confirmations and maintaining internal undo logs. If an execution client detects a reorg, Graph Node automatically rolls back entity mutations in PostgreSQL to the common ancestor block, replaying only the canonical branch events.

---

## Anatomy of a Subgraph: The Three Core Components

A subgraph is composed of three interconnected files that define what data to extract, how to structure it, and how to transform it:

```
+---------------------------------------------------------------------------------+
|                            ANATOMY OF A SUBGRAPH                                |
+---------------------------------------------------------------------------------+
|  1. Subgraph Manifest (subgraph.yaml):                                          |
|     

- Declares data sources, target network, smart contract address, ABI,       |
|       start block height, and event-to-handler function mappings.               |
|                                                                                 |
|  2. GraphQL Schema (schema.graphql):                                            |
|     

- Defines the data entities, field types (BigInt, BigDecimal, Bytes,        |
|       String), entity relationships (@derivedFrom), and search directives.      |
|                                                                                 |
|  3. AssemblyScript Mappings (src/mapping.ts):                                   |
|     

- High-performance, strictly typed TypeScript-like code compiled to        |
|       WebAssembly (WASM). Unpacks event parameters and saves entity records.    |
+---------------------------------------------------------------------------------+
```

### 1. The Subgraph Manifest (`subgraph.yaml`)

The manifest serves as the operational blueprint for Graph Node, specifying which contracts to listen to and which events trigger mapping execution:

```yaml
specVersion: 0.0.5
schema:
  file: ./schema.graphql
dataSources:
  - kind: ethereum
    name: Factory
    network: mainnet
    source:
      address: "0x1F98431c8aD98523631AE4a59f267346ea31F984"
      abi: Factory
      startBlock: 12369621
    mapping:
      kind: ethereum/events
      apiVersion: 0.0.7
      language: wasm/assemblyscript
      entities:
        - Pool
        - Token
      abis:
        - name: Factory
          file: ./abis/factory.json
        - name: ERC20
          file: ./abis/ERC20.json
      eventHandlers:
        - event: PoolCreated(indexed address,indexed address,indexed uint24,int24,address)
          handler: handlePoolCreated
      file: ./src/factory.ts
```

### 2. The GraphQL Schema (`schema.graphql`)

The schema defines the relational data model. Entities represent database tables, decorated with the `@entity` directive:

```graphql
type Token @entity {
  id: Bytes!                   # Contract address
  symbol: String!
  name: String!
  decimals: BigInt!
  totalSupply: BigInt!
  tradeVolumeUSD: BigDecimal!
  txCount: BigInt!
}

type Pool @entity {
  id: Bytes!                   # Pool contract address
  createdAtTimestamp: BigInt!
  createdAtBlockNumber: BigInt!
  token0: Token!               # Foreign key relationship
  token1: Token!
  feeTier: BigInt!
  liquidity: BigInt!
  totalValueLockedUSD: BigDecimal!
  swaps: [Swap!]! @derivedFrom(field: "pool")
}

type Swap @entity(immutable: true) {
  id: Bytes!                   # Transaction hash + log index
  pool: Pool!
  sender: Bytes!
  recipient: Bytes!
  amount0: BigDecimal!
  amount1: BigDecimal!
  amountUSD: BigDecimal!
  timestamp: BigInt!
}
```

*Architectural Tip*: Using `@entity(immutable: true)` on historical events like `Swap` or `Transfer` instructs Graph Node that once saved, this record will never be modified. This enables massive database write optimizations, bypassing PostgreSQL row versioning.

### 3. AssemblyScript Mappings (`src/mapping.ts`)

AssemblyScript is a strict subset of TypeScript that compiles directly to WebAssembly bytecode. It executes within a sandboxed runtime inside Graph Node, guaranteeing deterministic execution across all network indexers:

```typescript
import { BigInt, BigDecimal } from "@graphprotocol/graph-ts";
import { Swap as SwapEvent } from "../generated/templates/Pool/Pool";
import { Pool, Swap, Token } from "../generated/schema";

export function handleSwap(event: SwapEvent): void {
/ Load the target Pool entity from the database
  let pool = Pool.load(event.address);
  if (pool == null) return;

/ Derive unique identifier: transaction hash concatenated with event log index
  let swapId = event.transaction.hash.concatI32(event.logIndex.toI32());
  let swap = new Swap(swapId);

  swap.pool = pool.id;
  swap.sender = event.params.sender;
  swap.recipient = event.params.recipient;
  swap.amount0 = event.params.amount0.toBigDecimal();
  swap.amount1 = event.params.amount1.toBigDecimal();
  swap.timestamp = event.block.timestamp;

/ Calculate USD valuation using oracle reference feeds (omitted for brevity)
  let derivedUSD = BigDecimal.fromString("0");
  swap.amountUSD = derivedUSD;

/ Persist the immutable event record
  swap.save();

/ Update cumulative pool state
  pool.liquidity = pool.liquidity.plus(event.params.amount0.abs());
  pool.save();
}
```

---

## Hands-On Tutorial: Building a Decentralized Exchange Subgraph

To understand the complete development lifecycle, follow this step-by-step tutorial building a production-grade subgraph using [Graph CLI](https://github.com/graphprotocol/graph-tooling).

```
+---------------------------------------------------------------------------------+
|                       SUBGRAPH DEVELOPMENT WORKFLOW                             |
+---------------------------------------------------------------------------------+
| 1. Initialize Project: npx @graphprotocol/graph-cli init                        |
| 2. Define Entities: Edit schema.graphql with relational models                  |
| 3. Generate Code: graph codegen (Generates type-safe AssemblyScript models)     |
| 4. Implement Mappings: Write business transformation logic in src/mapping.ts   |
| 5. Compile WASM: graph build                                                    |
| 6. Deploy to Studio: graph deploy --studio my-subgraph                           |
+---------------------------------------------------------------------------------+
```

### Step 1: Initialize the Project via Graph CLI

Ensure you have [Node.js](https://nodejs.org) installed. Initialize a new subgraph scaffolding targeting a deployed contract:

```bash
npm install -g @graphprotocol/graph-cli

graph init   --product subgraph-studio   --from-contract 0x1F98431c8aD98523631AE4a59f267346ea31F984   --network mainnet   --contract-name Factory   --index-events   uniswap-v3-subgraph
```

### Step 2: Code Generation

Whenever you modify `schema.graphql` or contract ABIs in `subgraph.yaml`, run the code generator to produce type-safe AssemblyScript wrapper classes:

```bash
graph codegen
```

This compiles your smart contract ABIs verified on [Etherscan](https://etherscan.io) into strongly typed entity wrappers under `generated/`, preventing runtime null-pointer exceptions and type mismatches.

### Step 3: Dynamic Data Sources (Templates)

In protocols like Uniswap or [Aave](https://aave.com), a single master Factory contract dynamically deploys hundreds of independent pool contracts. 

A subgraph cannot know the addresses of these future contracts at build time. To index dynamically deployed contracts, The Graph provides **Data Source Templates**.

In `subgraph.yaml`:
```yaml
templates:
  - kind: ethereum/contract
    name: Pool
    network: mainnet
    source:
      abi: Pool
    mapping:
      kind: ethereum/events
      apiVersion: 0.0.7
      language: wasm/assemblyscript
      file: ./src/pool.ts
      entities:
        - Pool
        - Swap
      abis:
        - name: Pool
          file: ./abis/pool.json
      eventHandlers:
        - event: Swap(indexed address,indexed address,int256,int256,uint160,uint128,int24)
          handler: handleSwap
```

When the Factory contract emits a `PoolCreated` event, the mapping handler programmatically instantiates the template:

```typescript
import { PoolCreated } from "../generated/Factory/Factory";
import { Pool as PoolTemplate } from "../generated/templates";
import { Pool } from "../generated/schema";

export function handlePoolCreated(event: PoolCreated): void {
/ 1. Create and save the new Pool entity
  let pool = new Pool(event.params.pool);
  pool.token0 = event.params.token0;
  pool.token1 = event.params.token1;
  pool.feeTier = BigInt.fromI32(event.params.fee);
  pool.createdAtTimestamp = event.block.timestamp;
  pool.createdAtBlockNumber = event.block.number;
  pool.save();

/ 2. Instruct Graph Node to start listening to the new pool address immediately!
  PoolTemplate.create(event.params.pool);
}
```

---

## Querying Subgraphs via GraphQL

Once indexed, frontend client applications query data using standard GraphQL syntax over HTTP POST requests:

```graphql
# Query: Fetch top 5 pools by Total Value Locked and their latest 3 swaps
query GetTopPools {
  pools(first: 5, orderBy: totalValueLockedUSD, orderDirection: desc) {
    id
    totalValueLockedUSD
    token0 {
      symbol
      decimals
    }
    token1 {
      symbol
      decimals
    }
    swaps(first: 3, orderBy: timestamp, orderDirection: desc) {
      amountUSD
      timestamp
      sender
    }
  }
}
```

Frontend integration utilizing libraries such as [Apollo Client](https://www.apollographql.com/docs/react/), [urql](https://formidable.com/open-source/urql/), and [Wagmi React Hooks](https://wagmi.sh), connected via [Viem](https://viem.sh) and [Ethers.js](https://docs.ethers.org) allows React components to bind directly to reactive GraphQL queries, updating the UI in real time as new blocks confirm on-chain.

---

## The Decentralized Network Economy: The GRT Work-Token Model

Historically, The Graph operated a centralized Hosted Service where subgraphs were hosted for free on AWS servers managed by [Edge & Node](https://edgeandnode.com). 

Today, The Graph has transitioned completely to a **Decentralized Query Network ** settled on [Arbitrum One](https://arbitrum.io). The network coordinates independent actors through the ** Graph Token (GRT)** work-token economic model:

```
+---------------------------------------------------------------------------------+
|                       THE GRAPH DECENTRALIZED QUERY MARKET                      |
+---------------------------------------------------------------------------------+
|  1. Indexers (Node Operators):                                                  |
|     

- Stake minimum 100,000 GRT to participate in the network                   |
|     

- Operate enterprise hardware (PostgreSQL, Graph Node, Firehose RPC)        |
|     

- Earn query fees (in GRT) and new issuance indexing rewards                |
|                                                                                 |
|  2. Curators (Sub-Graph Evaluators):                                            |
|     

- Deposit GRT into bonding curves for high-utility subgraphs                |
|     

- Earn a percentage of all query fees generated by that subgraph            |
|     

- Signals to Indexers which subgraphs are economically worth indexing       |
|                                                                                 |
|  3. Delegators (Network Supporters):                                            |
|     

- Delegate GRT to reputable Indexers without running technical hardware     |
|     

- Earn a share of Indexer query fees and inflationary rewards               |
|                                                                                 |
|  4. Consumers (DApps & End Users):                                              |
|     

- Pay micropayments for individual GraphQL queries via state channels       |
+---------------------------------------------------------------------------------+
```

### Micro-Query Fee Settlement via State Channels

To query the decentralized network, applications pre-fund an API key with GRT on Arbitrum. 

When a user browser sends a GraphQL query, the query payload passes through an **Indexer Gateway**. The gateway routes the query to an Indexer advertising the lowest latency, exchanging a cryptographically signed query receipt via state channels. This micropayment channel ensures that Indexers receive fractional payments (e.g. $\$0.0001$ per query) without incurring on-chain transaction fees for every search.

---

## Advanced Optimization: Firehose, Substreams, and Streaming

For high-throughput blockchains such as [Solana Protocol](https://solana.com), [Avalanche Network](https://avax.network), or [Polygon](https://polygon.technology), processing hundreds of transactions per second through classical JSON-RPC polling causes severe indexing lag. 

To overcome this bottleneck, [StreamingFast](https://www.streamingfast.io) and The Graph engineered **Firehose ** and ** Substreams**:

```
+---------------------------------------------------------------------------------+
|                        FIREHOSE & SUBSTREAMS ARCHITECTURE                       |
+---------------------------------------------------------------------------------+
| Standard JSON-RPC Polling:                                                      |
| Graph Node <--- HTTP Request (Poll) ---> RPC Node (High Latency, Slow Polling)  |
|                                                                                 |
| StreamingFast Firehose:                                                         |
| Flat Files on Disk ---> Binary gRPC Stream ---> Graph Node (100x Faster Sync)   |
|                                                                                 |
| Substreams (Rust + Parallel Compute):                                           |
| Parallelized Rust modules process blocks concurrently across cloud clusters,    |
| shrinking subgraph initial sync times from 3 weeks to under 4 hours!            |
+---------------------------------------------------------------------------------+
```

- **Firehose**: Bypasses the JSON-RPC interface entirely. It extracts execution data directly from the consensus client engine into flat binary files stored on local disks, streaming block files over high-speed gRPC streams at hardware bus speeds.
- **Substreams**: Enables developers to write indexing modules in [Rust](https://www.rust-lang.org). Substreams process blocks in parallel across elastic compute clusters, executing streaming transforms that are subsequently piped directly into subgraphs or downstream SQL databases.

---

---

## Unit Testing Subgraphs with the Matchstick Framework

In production smart contract engineering, testing pipelines are non-negotiable. Subgraph mapping logic requires equal testing rigor to prevent unhandled exceptions from halting indexing pipelines mid-stream.

Developed by [LimeChain](https://limechain.tech) and officially supported by The Graph, the [Matchstick Testing Framework](https://github.com/LimeChain/matchstick) provides a native sandboxed environment for unit-testing AssemblyScript mapping handlers directly in memory.

```
+---------------------------------------------------------------------------------+
|                       MATCHSTICK UNIT TESTING PIPELINE                          |
+---------------------------------------------------------------------------------+
| 1. Mock Event Generation: Create synthetic SwapEvent with mocked parameters     |
| 2. Execute Handler: Invoke handleSwap(mockEvent) in sandboxed WASM runtime      |
| 3. Assert Database State: assert.fieldEquals("Pool", poolId, "liquidity", "...")|
| 4. Mock Smart Contract Calls: createMockedFunction() simulates eth_call responses|
| 5. Automated CI/CD: Run tests in GitHub Actions prior to Subgraph Studio deploy |
+---------------------------------------------------------------------------------+
```

Below is a production Matchstick test verifying that a pool entity updates correctly upon receiving an event:

```typescript
import { test, assert, clearStore, describe, afterEach } from "matchstick-as/assembly/index";
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { handlePoolCreated } from "../src/factory";
import { createPoolCreatedEvent } from "./mocks/factory-helper";

describe("Factory Event Handlers", () => {
  afterEach(() => {
    clearStore();
  });

  test("Should create and persist new Pool entity upon PoolCreated event", () => {
    let token0 = Address.fromString("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"); // USDC
    let token1 = Address.fromString("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"); // WETH
    let poolAddress = Address.fromString("0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640");
    let fee = 500;

    let newPoolEvent = createPoolCreatedEvent(token0, token1, fee, poolAddress);
    handlePoolCreated(newPoolEvent);

/ Assert that the Pool entity exists in the PostgreSQL entity store
    assert.fieldEquals("Pool", poolAddress.toHexString(), "feeTier", "500");
    assert.fieldEquals("Pool", poolAddress.toHexString(), "token0", token0.toHexString());
    assert.fieldEquals("Pool", poolAddress.toHexString(), "token1", token1.toHexString());
  });
});
```

Integrating Matchstick tests into [GitHub Actions](https://github.com/features/actions) guarantees that pull requests cannot introduce regressions into production indexing pipelines.

---

## Indexer Operations and GRT Staking Economics

Running an enterprise Indexer on The Graph decentralized query network is a sophisticated infrastructure business:
- **Hardware Profile**: Enterprise indexers run high-performance [PostgreSQL](https://www.postgresql.org) clusters paired with dedicated archive nodes across [Arbitrum Foundation](https://arbitrum.foundation), [Ethereum](https://ethereum.org), [Optimism](https://optimism.io), and [Polygon](https://polygon.technology).
- **Staking Mechanics**: Indexers stake a minimum of 100,000 GRT to participate. If an Indexer serves intentionally falsified query responses, the Fisherman and Arbitration Charter can slash their staked capital.
- **Delegation Management**: Token holders delegate GRT to top-performing Indexers, boosting their effective query capacity. Indexers set an indexing reward cut and a query fee cut, competing on performance metrics and query response latencies.

## Subgraph Developer Ecosystem and Best Practices

To build enterprise-grade subgraphs that synchronize efficiently and resist indexing crashes, developers follow established production guidelines:

```
+-----------------------------------------------------------------------------------+
|                     SUBGRAPH PERFORMANCE AUDIT CHECKLIST                          |
+-------------------+-----------------------+---------------------------------------+
| Practice Area     | Common Mistake        | Recommended Implementation            |
+-------------------+-----------------------+---------------------------------------+
| Event vs Call     | Indexing internal     | Avoid callHandlers; use eventHandlers |
| Handlers          | function traces       | which evaluate 100x faster            |
| Entity Lookups    | Calling Entity.load() | Cache entities in memory variables;   |
|                   | inside tight loops    | batch database reads and writes       |
| Immutability      | Marking dynamic state | Use @entity(immutable: true) for logs |
| Flags             | as mutable            | to enable accelerated database inserts|
| Start Block       | Defaulting startBlock | Set startBlock to the exact contract  |
| Configuration     | to block 0            | deployment height to skip empty scans |
| Derived Fields    | Storing massive arrays| Use @derivedFrom on parent entities   |
|                   | of entity IDs         | to avoid array memory overflow        |
+-------------------+-----------------------+---------------------------------------+
```

### Essential Tooling & Reference Hubs

- [The Graph Documentation](https://thegraph.com/docs): Canonical documentation covering Subgraph Studio, Graph CLI, AssemblyScript API, and migration guides.
- [The Graph Explorer](https://thegraph.com/explorer): Discover thousands of open-source, production-tested subgraphs deployed by protocols like [Uniswap](https://uniswap.org), [Aave](https://aave.com), [Synthetix](https://synthetix.io), [Compound Finance](https://compound.finance), [Curve Finance](https://curve.fi), [Balancer](https://balancer.fi), [MakerDAO](https://makerdao.com), and [Sushiswap](https://sushi.com).
- [Graph Tooling Repository](https://github.com/graphprotocol/graph-tooling): The open-source home of Graph CLI and Graph TypeScript compiler.
- [StreamingFast Substreams Docs](https://substreams.streamingfast.io): Comprehensive guides for authoring parallel Rust data processing pipelines.

By decoupling raw blockchain consensus from client-side data consumption, The Graph provides the relational foundation that enables decentralized applications to deliver the speed, analyzed on platforms like [DefiLlama](https://defillama.com), [Dune Analytics](https://dune.com), and [Nansen](https://nansen.ai), while integrating with decentralized storage rails from [Arweave](https://arweave.org), [Filecoin](https://fil.org), [Pinata](https://www.pinata.cloud), and [Chainlink Oracles](https://chain.link). reliability, and rich user experiences demanded by the modern internet.
