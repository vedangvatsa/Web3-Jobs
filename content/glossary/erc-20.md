---
term: "ERC-20"
slug: "erc-20"
category: "Protocols & Standards"
difficulty: "Intermediate"
image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&h=600&fit=crop"
imageAlt: "Token standards and Ethereum protocol visualization"
description: "The technical standard for fungible tokens on Ethereum. Defines a common interface that enables any ERC-20 token to work seamlessly with wallets, exchanges, and dApps."
relatedTerms: ["token", "ethereum", "smart-contract"]
synonyms: ["Ethereum token standard", "fungible token standard"]
---

ERC-20 is the technical standard for fungible tokens on the Ethereum blockchain. Proposed in 2015 and finalized in 2017, it defines a common set of rules that Ethereum tokens must follow, ensuring they work consistently with wallets, exchanges, and decentralized applications. This standardization enabled the explosive growth of ICOs, DeFi protocols, and the broader token economy by creating interoperability across the Ethereum ecosystem.

## Understanding Token Standards

Before ERC-20, every token project implemented tokens differently. Wallets and exchanges needed custom code to support each new token. This fragmentation limited adoption—supporting thousands of unique token implementations was impractical. ERC-20 solved this by establishing a common interface that all conforming tokens share.

The "ERC" stands for Ethereum Request for Comment, Ethereum's process for proposing standards. The number 20 simply identifies this specific proposal. Once tokens implement the ERC-20 standard, any ERC-20-compatible wallet or application can interact with them without custom integration.

## The Six Required Functions

ERC-20 defines six mandatory functions that tokens must implement. `totalSupply()` returns the total token supply. `balanceOf(address)` returns a specific address's token balance. `transfer(to, amount)` sends tokens from your address to another. These three functions enable basic token operations.

`approve(spender, amount)` authorizes another address to spend tokens on your behalf. `allowance(owner, spender)` checks how much an approved spender can still spend. `transferFrom(from, to, amount)` lets approved addresses transfer tokens. These approval functions enable smart contracts to interact with tokens on users' behalf—crucial for DeFi protocols.

## Events and Transparency

ERC-20 requires two events: `Transfer` emitted when tokens move between addresses, and `Approval` emitted when spending allowances are set. Events create transparent logs of all token activity. Block explorers use these events to show transaction histories. DeFi protocols listen for events to trigger actions based on token movements.

Events don't change blockchain state—they're informational. But they're essential for tracking token activity efficiently. Querying blockchain state for every token movement would be slow and expensive. Events provide an indexed, searchable record of what happened on-chain.

## The Approve/TransferFrom Pattern

The approve and transferFrom mechanism enables complex smart contract interactions. When using a decentralized exchange, you first approve the exchange contract to spend your tokens, then the exchange transfers tokens during trades. This two-step process prevents contracts from arbitrarily taking your tokens—you explicitly authorize spending limits.

This pattern has security implications. If you approve unlimited spending and the contract has a vulnerability or turns malicious, your entire token balance is at risk. Many users grant excessive approvals rather than setting specific amounts, creating security vulnerabilities. Tools like Etherscan's token approval checker help users review and revoke dangerous approvals.

## Fungibility and Interchangeability

ERC-20 tokens are fungible—each token is identical and interchangeable. One USDC is exactly equal to any other USDC. This makes them perfect for currencies, governance tokens, and commodities. Fungibility contrasts with NFTs (ERC-721) where each token is unique.

The math is simple addition and subtraction. Wallets don't track individual token "coins"—they sum up balance. When you send 10 tokens, it doesn't matter which specific tokens; they're all equivalent. This simplicity enables efficient calculations and makes ERC-20 ideal for financial applications.

## Extensions and Optional Features

While six functions are mandatory, ERC-20 includes optional additions. `name`, `symbol`, and `decimals` provide metadata about the token. These aren't required but are universally implemented—they make tokens human-readable in wallets and interfaces. Without them, users would see cryptic contract addresses instead of familiar names like "Dai" or "USDC."

Decimals typically equal 18, matching Ethereum's precision. This means token amounts are stored as integers with 18 implied decimal places. 1 token is stored as 1000000000000000000. This avoids floating-point arithmetic issues while enabling precise fractional amounts—you can send 0.000000000000000001 tokens.

## Security Considerations

ERC-20's simplicity has some security gaps. The standard doesn't prevent sending tokens to contracts that can't handle them—tokens sent to the wrong contract might be lost forever. The approve mechanism can allow malicious contracts to drain approved amounts. Race conditions in approve/transferFrom can be exploited by watching the mempool.

ERC-223 and ERC-777 addressed some limitations with enhanced security and functionality. However, ERC-20's network effects proved too strong—most projects stick with the simpler, proven standard despite its imperfections. The ecosystem understands ERC-20's quirks and has developed patterns to work around them safely.

## Token Economics and Supply

ERC-20 doesn't dictate token economics—supply can be fixed, inflationary, or deflationary. Bitcoin has a fixed 21 million cap; some tokens mint new supply indefinitely. ERC-20 just tracks whatever supply exists; economic policy is up to the project implementing the token.

Mint and burn functions are common extensions. Minting creates new tokens, increasing supply. Burning destroys tokens, decreasing supply. While not part of the base ERC-20 standard, most token contracts include these functions for supply management. Governance tokens often use burning to create deflationary pressure.

## Impact on ICOs and Fundraising

ERC-20 enabled the ICO boom of 2017. Projects could easily create tokens and sell them to raise funds. Investors could store all their tokens in ERC-20 wallets and trade on exchanges supporting the standard. This dramatically lowered barriers to blockchain fundraising.

While many ICOs were legitimate projects or scams, ERC-20's role was neutral—it just provided infrastructure. The standard itself is sound; misuse by bad actors doesn't reflect on the technology. ERC-20 continues enabling legitimate token launches for governance, utility, and funding.

## DeFi and Composability

DeFi's explosive growth built on ERC-20's standardization. Every DeFi protocol can integrate any ERC-20 token without custom code. This composability—protocols combining like Lego blocks—creates incredible innovation. A new yield farming strategy can immediately work with thousands of existing tokens.

Automated market makers like Uniswap treat all ERC-20 tokens identically. Lending protocols like Aave can support any token as collateral. This interoperability is DeFi's superpower, enabled by ERC-20 standardization. Without it, each token would need specific integration, severely limiting DeFi's scope and innovation speed.

## Stablecoins and Real-World Assets

Major stablecoins (USDC, USDT, DAI) are ERC-20 tokens. This common standard enables them to work everywhere in the Ethereum ecosystem. You can use USDC across hundreds of protocols without anyone caring that Circle issued it versus Coinbase's USDC—the standard makes them functionally identical.

Tokenized real-world assets increasingly use ERC-20—representing company shares, real estate, commodities, or bonds as blockchain tokens. The standard's maturity and universal support make it the default choice for any fungible asset tokenization, bringing traditional assets onto blockchain rails.

## Gas Optimization

ERC-20 operations consume gas. Simple transfers cost around 50,000-70,000 gas. Approve operations cost slightly less. When gas prices spike, token transfers become expensive. Projects optimize contracts to minimize gas consumption, but baseline costs remain due to the operations required.

Layer 2 solutions and alternative chains address gas costs. Optimistic rollups and ZK-rollups support ERC-20 tokens with much lower fees. Polygon, Arbitrum, and similar networks provide Ethereum compatibility with minimal costs. The standard works identically across these environments—a major advantage of standardization.

## Wrapped Assets

Wrapped Bitcoin (WBTC) and other wrapped assets use ERC-20 to bring non-Ethereum assets to Ethereum. WBTC represents Bitcoin as an ERC-20 token, enabling Bitcoin to work in DeFi protocols. This bridging expands what assets can participate in Ethereum's ecosystem while maintaining the benefits of standardization.

The wrapping process involves custody—Bitcoin is locked, and equivalent WBTC is minted. Unwrapping does the reverse. While this introduces custodial trust, it's a practical solution for cross-chain interoperability that leverages ERC-20's universal compatibility.

## Regulatory Implications

Regulators sometimes classify ERC-20 tokens as securities depending on their use case and how they're sold. The technical standard is neutral—it can represent anything from currencies to securities to utility. Projects must consider regulatory implications beyond technical implementation.

This legal uncertainty affects ERC-20 adoption by traditional institutions. Many want blockchain benefits but need regulatory clarity. As frameworks develop, ERC-20's role as infrastructure becomes clearer—it's a tool that can implement compliant or non-compliant systems depending on how it's used.

## Evolution and Future

While ERC-20 remains dominant, newer standards address its limitations. ERC-777 adds hooks for contracts to react to incoming tokens. ERC-1363 enables single-transaction approval and transfer. Account abstraction proposals could eliminate approve/transferFrom complexity. Yet ERC-20's simplicity and network effects keep it relevant.

The standard will likely persist for decades. Too much infrastructure depends on it to replace wholesale. Instead, improvements layer on top while maintaining backward compatibility. This evolutionary approach preserves existing ecosystems while enabling innovation.

## Career Applications

ERC-20 expertise is fundamental for blockchain developers. Every smart contract interacting with tokens uses these interfaces. Auditors frequently review ERC-20 implementations for security issues. Protocol designers must understand the standard's capabilities and limitations when architecting token economics.

Financial professionals entering crypto need to understand ERC-20 for custody, trading, and regulatory compliance. Product managers designing token-based applications require knowledge of what the standard enables and constrains. As tokenization expands into traditional assets and industries, professionals who deeply understand ERC-20 mechanics and best practices will find opportunities across the converging worlds of traditional and blockchain finance.
