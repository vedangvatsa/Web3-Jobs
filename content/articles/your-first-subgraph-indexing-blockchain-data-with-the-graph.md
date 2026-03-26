---

title: "Your First Subgraph: Indexing Blockchain Data with The Graph"
image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMHx8ZGF0YXxlbnwwfHx8fDE3NTUwMzYzNzV8MA&lib=rb-4.0.3"
description: "Learn how to build a subgraph using The Graph Protocol. This guide provides a step-by-step tutorial on how to index smart contract data and serve it via a."
category: "Getting Started"

publishedDate: "2026-03-11"
lastUpdated: "2026-03-15"
---

Building a decentralized application (dApp) involves two main components: writing smart contracts (the on-chain backend) and building a user interface (the off-chain frontend). A major challenge for dApp developers is getting data from the [blockchain](/what-is-a-blockchain) to display on the frontend. Reading data directly from a [smart contract](/what-are-smart-contracts) can be slow, inefficient, and limited.

This is the problem that **The Graph** solves. The Graph is a decentralized protocol for indexing and querying data from blockchains. It allows you to define which data you care about from a smart contract, how to process it, and then serves that data to your frontend via a fast and efficient **GraphQL API**.

Learning to build a "subgraph" is an essential skill for any full-stack [Web3](/what-is-web3) developer. This guide will walk you through the process.

### Why Do We Need Subgraphs?

Imagine you want to display a list of all the [NFTs](/what-are-nfts) a user owns from your collection. To do this by reading directly from the blockchain, you would have to:
1.  Look through every `Transfer` event ever emitted by your NFT contract.
2.  Filter them to find the ones where the user was the recipient.
3.  Keep track of which ones they later sent away.
4.  Finally, compile a list of the [tokens](/what-is-a-token) they currently own.

This is incredibly slow and complex to do on the client-side. A subgraph does all this work on a server and then provides you with a simple API to ask, "Hey, give me all the NFTs owned by this address."

### The Core Components of a Subgraph

A subgraph project consists of three main files:

1.  **The Subgraph Manifest (`subgraph.yaml`):** This is the configuration file. It tells The Graph which smart contracts to listen to (the `dataSource`), which events on those contracts to pay attention to, and which functions (called "handlers") to run when those events occur.

2.  **The Schema (`schema.graphql`):** This is a GraphQL schema file. You use it to define the shape of the data you want to store and query. For example, you might define an `NFT` entity with properties like `id`, `owner`, and `tokenURI`.

3.  **The Mappings (`src/mapping.ts`):** This is the code that transforms the blockchain data into the entities you defined in your schema. It's written in AssemblyScript (a subset of TypeScript). You write a "handler" function for each event you're interested in. When The Graph sees that event on the blockchain, it runs your handler function, which takes the event data, creates or updates your entities, and saves them to the database.

### Step-by-Step Guide to Building a Simple Subgraph

Let's imagine we want to build a subgraph for a simple ERC-721 NFT contract.

**Prerequisites:** You'll need to have Node.js and npm installed. Then, install The Graph CLI globally:
`npm install -g @graphprotocol/graph-cli`

**Step 1: Initialize the Subgraph**

The Graph CLI can initialize a new subgraph from an existing contract address. Find an NFT contract on a testnet like Sepolia Etherscan and use its address.

```bash
graph init --from-contract <CONTRACT_ADDRESS> --network sepolia my-nft-subgraph
```

The CLI will introspect the contract and generate a basic template for all three core files based on the contract's events.

**Step 2: Define Your Schema (`schema.graphql`)**

Let's define what data we want to save. We want to track each NFT and who currently owns it.

```graphql
type Token @entity {
  id: ID! # The token ID
  tokenURI: String!
  owner: User!
}

type User @entity {
  id: ID! # The user's address
  tokens: [Token!]! @derivedFrom(field: "owner")
}
```

*   `@entity`: This directive tells The Graph to save `Token` and `User` as top-level data entities.
*   `@derivedFrom`: This creates a relationship. The `tokens` field on the `User` entity is derived from the `owner` field on the `Token` entity.

**Step 3: Write the Mapping Logic (`src/mapping.ts`)**

The CLI will have created a boilerplate handler function for the `Transfer` event. We need to fill it in.

```typescript
import { Transfer as TransferEvent } from "../generated/MyNFT/MyNFT";
import { Token, User } from "../generated/schema";

export function handleTransfer(event: TransferEvent): void {
  // Find or create the User (the recipient of the NFT)
  let to = User.load(event.params.to.toHex());
  if (!to) {
    to = new User(event.params.to.toHex());
    to.save();
  }
  
  // Find or create the Token
  let tokenId = event.params.tokenId.toString();
  let token = Token.load(tokenId);
  if (!token) {
    token = new Token(tokenId);
    // You might need to call the contract to get the tokenURI
    // let contract = MyNFT.bind(event.address)
    // token.tokenURI = contract.tokenURI(event.params.tokenId)
    token.tokenURI = "/placeholder.json"; // Placeholder for simplicity
  }
  
  // Update the owner of the token
  token.owner = to.id;
  token.save();
}
```

This function is triggered every time a `Transfer` event happens. It creates a `User` entity for the new owner if one doesn't exist, creates a `Token` entity if it's the first time we've seen this token, and then updates the token's `owner` field to point to the new user.

**Step 4: Deploy the Subgraph**

1.  **Authenticate:** `graph auth --studio <YOUR_DEPLOY_KEY>`
2.  **Codegen & Build:** `graph codegen && graph build`
3.  **Deploy:** `graph deploy --studio <SUBGRAPH_NAME>`

After deploying to The Graph's hosted service (the "Subgraph Studio"), it will start indexing the data from your chosen contract. Once it's synced, you'll have a GraphQL endpoint that your dApp can use to instantly query for NFT and owner data.

Learning to build subgraphs is a fundamental step in becoming a full-stack Web3 developer. It's the bridge that connects your on-chain logic to your off-chain user experience, enabling you to build fast, rich, and data-intensive decentralized applications.

## The Web3 Opportunity

The Web3 sector is experiencing explosive growth, with demand far outpacing supply for qualified talent. Unlike traditional tech, Web3 offers unique advantages: higher compensation, equity opportunities, fully remote roles, and the chance to work on improving how technology.

## Market Context

The [Web3 job](/web3-jobs-for-beginners) market has fundamentally different dynamics than Web2, shaped by the decentralized nature of blockchain organizations and the global talent shortage that continues to define the industry.

**Compensation:** Web3 roles typically pay 20-40% higher than equivalent Web2 positions. Senior Solidity engineers regularly command $200,000-$350,000 in total compensation, while product managers and business development leads earn $150,000-$250,000. Packages frequently include token allocations alongside traditional equity.

**Remote-First Culture:** Most Web3 organizations operate fully or primarily remote, with teams distributed across multiple time zones. This structure opens opportunities for talent in regions traditionally underserved by tech hiring, from Southeast Asia to Latin America and Africa.

**Growth Trajectory:** Career progression happens faster in Web3 due to rapid company scaling and persistent talent shortage. It is common for mid-level professionals to reach senior or lead positions within 18-24 months of entering the space.

**Equity Upside:** Token and equity packages are standard, offering significant wealth-building potential for early team members at successful protocols.

## Step-by-Step Transition Strategy

### Step 1: Build Web3 Knowledge Foundation
Spend 4-8 weeks learning blockchain fundamentals. Understand:
- How blockchain technology works
- Different blockchain architectures
- Smart contracts and their use cases
- [DeFi](/what-is-defi), NFTs, and [DAOs](/what-is-a-dao)
- Current Web3 ecosystem and key players

### Step 2: Learn Relevant Skills
Depending on your target role:
- **Engineers:** [Solidity](/best-programming-languages-for-blockchain-development), JavaScript/TypeScript, Web3 libraries (ethers.js, web3.js)
- **Product Managers:** Token economics, protocol governance, user growth in Web3
- **Business Development:** Market analysis, partnership strategy, regulatory landscape
- **Community/Operations:** Community building, Discord management, governance

### Step 3: Build Your Portfolio
Create tangible proof of your Web3 expertise:
- Complete open-source contributions to Web3 projects
- Build a small DApp or smart contract
- Write about Web3 topics on Medium or Twitter
- Contribute to DAOs or community projects
- Participate in hackathons

### Step 4: Network in Web3
The Web3 community is incredibly accessible:
- Join Discord communities of projects you're interested in
- Attend Web3 conferences (Consensus, Devcon, ETHDenver)
- Engage on Twitter/X with Web3 builders and thought leaders
- Participate in governance forums
- Join local Web3 meetups

### Step 5: Apply Strategically
Target roles that leverage your existing expertise plus new Web3 knowledge:
- If you're a backend engineer, look for blockchain infrastructure roles
- If you're a PM, look for protocol product roles
- If you're in sales/business, look for Web3 business development

## Real-World Success Stories

### Developer to Smart Contract Engineer
Alex, a 5-year backend engineer at a FAANG company, spent 3 months learning Solidity while maintaining his day job. He contributed to an open-source protocol, caught the attention of a major DeFi project, and transitioned with a 50% salary increase and significant equity.

### Product Manager in Web3
Jessica, a PM from traditional finance, leveraged her domain expertise in DeFi. Her understanding of financial products combined with Web3 technology made her incredibly valuable. She found a role at a leading DeFi protocol within 4 weeks.

### Career Changer Success
Marcus left his corporate job to focus on Web3 for 6 months. Through consistent learning, networking, and [portfolio](/building-web3-portfolio) building, he landed a role leading Developer Relations at a major blockchain platform, with compensation far exceeding his previous role.

## Web3-Specific Challenges

**Volatility Risk:** The crypto market's inherent volatility can impact job stability, especially at early-stage startups with limited runway. Professionals entering Web3 should maintain 6-12 months of living expenses in reserve, negotiate base salaries in fiat currency rather than tokens, and ideally join projects with established revenue models or significant treasury backing.

**Regulatory Uncertainty:** The regulatory landscape for blockchain companies is still evolving across major jurisdictions. Before joining a project, verify that the team has competent legal counsel and is proactively engaging with regulators rather than operating in legal grey areas.

**Due Diligence:** Not all Web3 projects are legitimate. Research the founding team's track record, check audit reports for smart contracts, verify treasury holdings on-chain, and speak with current or former team members before accepting an offer.

**Learning Curve:** The technical learning curve can be steep, particularly for non-developers learning blockchain concepts for the first time. However, the Web3 community is remarkably open and supportive, with active Discord channels, free educational resources, and mentorship programs available across most major protocols.

## FAQ

**Q: Do I need to be a blockchain expert to work in Web3?**
A: No. The Web3 ecosystem needs far more than engineers. Marketing managers, community leads, product designers, legal counsel, operations specialists, and business development professionals are all in high demand. Your existing skills transfer directly — you simply need to layer on the Web3 context: how wallets work, what DAOs are, why decentralization matters. Most hiring managers value domain expertise combined with genuine curiosity about the space over pure blockchain knowledge.

**Q: How much can I earn in Web3?**
A: Web3 compensation consistently outpaces Web2 equivalents. Base salaries run 30–60% higher on average, with Solidity engineers and smart contract auditors commanding the largest premiums due to talent scarcity. Beyond base pay, total packages often include signing bonuses, equity in early-stage protocols, and token allocations that can appreciate significantly. Senior engineers at well-funded protocols regularly earn $200,000–$350,000 in total compensation. Even non-technical roles see meaningful premiums compared to equivalent Web2 positions.

**Q: Is it risky to transition to Web3?**
A: Every career transition carries risk, and Web3 is no exception given market volatility and project lifecycles. You can manage this risk systematically: target well-funded, established protocols with proven revenue rather than early-stage speculation; verify teams have track records; ensure your base salary is paid in fiat rather than entirely in tokens. Professionals who treat Web3 as a career move — not a get-rich-quick play — consistently build durable roles that survive market cycles.

**Q: How long does the transition take?**
A: Most professionals complete a meaningful Web3 transition in 2–6 months of deliberate effort. Engineers and product managers often move fastest because their core skills transfer directly — the learning curve is mainly tooling and protocol-specific knowledge. Non-technical roles like marketing and community management can transition in as little as 4–8 weeks with focused self-study. The key variable is how actively you engage: building a portfolio project or contributing to an open-source protocol accelerates the process significantly.

**Q: What if the crypto market crashes?**
A: Bear markets are historically the best time to enter Web3 professionally. When speculative hype recedes, teams refocus on building real products — meaning they prioritize talent over token price. Infrastructure companies, security firms, and developer tooling providers maintain steady hiring regardless of market conditions. The engineers who built during the 2018–2019 bear market are among the most sought-after professionals today. A market downturn reduces competition for roles and often produces better equity terms for new hires.

## Key Takeaways

- Web3 offers significant compensation premiums (20-40% above Web2 equivalents), accelerated career growth trajectories, and the opportunity to contribute to technology that is reshaping finance, governance, and digital ownership across industries globally.
- Most professionals complete a meaningful transition to Web3 within 2-6 months of focused effort, with engineers and product managers typically moving fastest because their core skills transfer directly.
- Your existing domain expertise is highly valuable in Web3. Rather than starting from scratch, focus on layering blockchain-specific context (wallets, smart contracts, tokenomics, DAOs) onto the skills you already have.
- Networking through Discord communities and Twitter engagement, combined with visible portfolio projects on GitHub, consistently outperforms formal certifications when it comes to landing Web3 roles.
- Join well-funded, established protocols with proven revenue to mitigate the volatility risk inherent in the sector. Negotiate base salaries in fiat currency.
- The Web3 community is remarkably open and supportive, with mentorship programs, free educational resources, and active developer communities across all major protocols.
