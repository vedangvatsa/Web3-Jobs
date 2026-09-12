---
title: A Guide to Stablecoins
description: >-
  Stablecoins are central to crypto markets and DeFi, but their designs and
  risks differ sharply. Learn how the main stablecoin models work and what to assess before using them.
category: Technology Deep Dives
data-ai-hint: cryptocurrency defi
publishedDate: '2026-03-11'
lastUpdated: "2026-09-12"
---
## Stablecoins: What Supports the Peg, and What Can Break It

Stablecoins are cryptocurrencies designed to target a relatively consistent value, often one U.S. dollar. That target gives them a practical role in markets where many other cryptoassets can move sharply in price. Within decentralized finance ([DeFi](/what-is-defi)), they can be used as a medium of exchange, a unit of account, and a place to hold value without converting out of the crypto ecosystem.

Those functions can make stablecoins look interchangeable. They are not. A token's name and target price say little about the mechanism behind it, the party a holder must rely on, or the conditions under which the token can be redeemed. The relevant question is not simply whether a stablecoin is described as dollar-pegged. It is what is meant to make one token worth one dollar, and what happens when that mechanism is tested.

The three broad models below approach that problem differently. Fiat-collateralized tokens rely on off-chain reserves and a centralized issuer. Crypto-collateralized tokens use cryptoassets locked on-chain and generally require more collateral than the stablecoins issued against it. Algorithmic tokens seek to manage supply through incentives rather than conventional collateral. Each model exchanges one form of risk for another.

| Stablecoin type | Examples discussed here | Intended source of stability | Central trade-off |
| --- | --- | --- | --- |
| Fiat-collateralized, or off-chain collateralized | Tether (USDT), USD Coin (USDC), PayPal USD (PYUSD) | Issuer-held reserves and 1:1 redemption | Simplicity and liquidity depend on an issuer, its reserves, and its redemption process. |
| Crypto-collateralized, or on-chain collateralized | Dai (DAI) | Excess crypto collateral, economic incentives, and liquidations | Greater on-chain visibility comes with volatile collateral, liquidations, and capital inefficiency. |
| Algorithmic, or under-collateralized | TerraUSD (UST) and its LUNA model | Supply adjustments and arbitrage incentives | Capital efficiency depends on confidence that the incentives will continue to work. |

### Start with the redemption path

A stablecoin's market price can be close to its target for different reasons. In a fiat-collateralized model, the central promise is normally redemption: a holder should be able to exchange a token for the corresponding amount of fiat currency. In a crypto-collateralized model, the system instead depends on the value of assets locked in smart contracts and on rules for handling a shortfall. In an algorithmic model, it depends on participants responding to a price difference in the way the design expects.

That distinction matters most when demand changes. A stablecoin can trade near one dollar in ordinary conditions without revealing much about how its safeguards would perform under pressure. For a user, the mechanism determines the questions worth asking. Is there an identifiable issuer? What supports redemption? Is the backing held off-chain or visible on-chain? Could a decline in collateral trigger liquidation? Is the peg based largely on an incentive to trade one token for another?

These are not abstract design questions. They describe who carries the risk. With an issuer-backed coin, holders rely on the issuer and its reserves. With an on-chain collateralized coin, users and the system absorb the effects of volatility and liquidation rules. With an algorithmic coin, holders rely heavily on confidence in a feedback loop. The target price is the same; the path to it is not.

### Fiat-collateralized stablecoins: a claim on reserves

Fiat-collateralized stablecoins are the most prevalent and straightforward category. Examples include Tether (USDT), issued by Tether Limited; USD Coin (USDC), issued by Circle; and PayPal USD (PYUSD), issued by PayPal. Each is described as pegged to the U.S. dollar.

The basic model is familiar. Tokens in circulation are theoretically matched by equivalent real-world assets held in reserve by a centralized entity. For a dollar-pegged stablecoin, those reserves typically consist of cash, U.S. Treasury bills, and other low-risk, liquid assets. A user can exchange fiat currency with the issuer to mint corresponding [tokens](/what-is-a-token). When tokens are redeemed, they are burned and the user reclaims fiat currency.

The 1:1 redemption promise is the key link between the token and its target value. If users expect to be able to exchange one USDT or one USDC for one U.S. dollar, that expectation helps support a stable market price. The mechanism is comparatively easy to describe because the backing is not another volatile cryptoasset and because the issuer, rather than an automated collateral system, manages issuance and redemption.

That simplicity is a genuine advantage, but it should not be mistaken for an absence of risk. The holder is depending on a centralized issuer to manage reserves and fulfill redemptions. The quality, composition, and liquidity of reserves therefore matter. The relevant issue is not merely whether reserves exist in principle, but whether they can support the issuer's redemption promise when needed.

Transparency is part of that assessment. The specific composition and quality of reserves may not be fully transparent, and past concerns about Tether's backing illustrate why holders discuss "reserve risk." An analyst should distinguish a statement that a stablecoin is backed from an understanding of what that backing is intended to consist of. Cash, U.S. Treasury bills, and other low-risk, liquid assets are not identical categories, even though each may be included in a reserve description.

Centralization also has an operational consequence. Centralized issuers can freeze funds and blacklist addresses linked to illicit activities. That capacity may be relevant to compliance, but it is a trade-off for users who expect the censorship resistance associated with cryptocurrencies. A token may move on a blockchain while still being subject to the issuer's controls. The [Web3](/what-is-web3) label does not remove that dependence.

The model's strengths remain practical. Its issuance and redemption logic is direct, and USDT and USDC are among the most widely used stablecoins. They form trading pairs on centralized and decentralized exchanges, which makes liquidity an important part of their utility. Still, liquidity is not a substitute for examining the reserve and issuer relationship. A convenient token for a trade may not present the same considerations as a long-term balance held through a period of market stress.

### Crypto-collateralized stablecoins: visible backing, volatile inputs

Crypto-collateralized stablecoins try to combine price stability with a more on-chain structure. Dai (DAI), associated with MakerDAO and pegged to the U.S. dollar, is the example considered here. Rather than depositing fiat with a conventional issuer, users lock cryptocurrency assets such as [ETH](/what-is-ethereum) or WBTC into a [smart contract](/what-are-smart-contracts) vault to create stablecoins.

The crucial feature is over-collateralization. Users deposit collateral worth more than the stablecoins they mint. If someone wants to mint a given amount of DAI, the collateral they lock must be worth more than that amount. The excess is a buffer against price changes in the collateral. It is also why the model is capital inefficient: substantial value has to remain locked rather than being available for another use.

The peg is supported by economic incentives and automated liquidation. If the value of a user's collateral falls below a specified threshold, often called the liquidation ratio, the system sells the collateral in an auction to repay the borrowed stablecoins. The intended purpose is to keep the system solvent despite volatility in the assets used as backing.

This structure changes the nature of the backing, not the need for it. The collateral can be inspected through the [blockchain](/what-is-a-blockchain) and the smart contracts that govern it, giving users a degree of on-chain transparency that differs from an issuer-held reserve. In principle, people can examine the contracts and verify the collateral backing the stablecoin in real time. The model does not require holders to rely on a centralized issuer in the same way as a fiat-collateralized token, which can improve censorship resistance.

But public visibility does not make the system simple. A holder or borrower must understand that the backing is itself volatile. A sharp decline in the collateral's price can bring multiple positions toward their liquidation thresholds at once. That can produce a cascade of liquidations and put the peg at risk. The buffer is designed for volatility, but the buffer is not free: it is supplied by users who must lock more value than they receive in stablecoins.

For that reason, crypto-collateralized stablecoins ask users to evaluate both the token and the mechanism around it. A person holding the stablecoin is exposed to the system's ability to manage collateral and liquidations. A person minting it also faces the direct possibility that a falling collateral value will trigger liquidation. The distinction between holding and borrowing should not be ignored, even though both depend on the same system remaining solvent.

### Algorithmic stablecoins: the confidence loop

Algorithmic stablecoins are the most experimental and high-risk category described here. They seek to maintain a peg through algorithms that adjust token supply, rather than through conventional collateral. Their appeal is capital efficiency: they require little to no collateral, so they do not require users to lock a larger pool of assets behind each token. In theory, the absence of external assets or centralized custodians can also make them the most decentralized form of stablecoin.

TerraUSD (UST) used a dual-token system with the seigniorage token LUNA for peg maintenance. In this kind of design, there are generally two tokens: the stablecoin and a volatile seigniorage token. The system permits an exchange of one unit of the stablecoin for one dollar's worth of the seigniorage token, and the reverse exchange.

The intended incentives are straightforward on paper. If the stablecoin trades above one dollar, users are motivated to burn the seigniorage token and mint stablecoins. More stablecoin supply is meant to lower the price toward the peg. If the stablecoin trades below one dollar, users are encouraged to burn the stablecoin in exchange for one dollar's worth of the seigniorage token. Reducing supply is meant to raise the stablecoin's price.

The design depends on arbitrage and on the belief that the exchange mechanism will remain meaningful. That is a much thinner foundation than a direct reserve claim or an over-collateralized vault. It relies on people treating the seigniorage token as valuable enough to accept when the stablecoin is under pressure.

This is where reflexivity becomes the central risk. If confidence in the peg falls, holders may seek to exchange the stablecoin for the seigniorage token. That can increase the seigniorage token's supply and contribute to a fall in its price. As its price falls, confidence in the mechanism can weaken further. The resulting feedback loop is often described as a death spiral.

The model is therefore not simply a more efficient version of collateralized stablecoins. It substitutes confidence and game theory for conventional backing. No purely algorithmic stablecoin has maintained long-term sustainability, making this part of DeFi highly experimental and risky. A user should treat a stated peg in such a system as a mechanism under continuous pressure, not as an assurance that the target value will hold.

### A practical way to assess the trade-offs

Stablecoin risk is easiest to evaluate by following the claim a holder is making. With a fiat-collateralized token, the claim is effectively tied to the issuer's ability to redeem tokens against off-chain reserves. The first questions are who holds the reserves, what the reserves are stated to include, and whether the issuer can perform redemption. Centralization, reserve quality, limited transparency, and the ability to freeze or blacklist addresses are part of the same package rather than separate footnotes.

With a crypto-collateralized token, the analysis shifts to the collateral system. Users should understand that the stablecoin is backed by assets that can decline in price, that those assets are locked at more than the amount borrowed, and that the system may liquidate them when a threshold is crossed. On-chain transparency can make the rules and collateral observable, but it does not remove collateral risk or the cost of over-collateralization.

With an algorithmic token, the principal question is whether the supply-adjustment incentive can remain credible when holders want to leave. The mechanism may work while arbitrage is attractive and confidence is intact. Its weakness is most apparent when those assumptions no longer reinforce one another. The prospect of capital efficiency should be weighed against that reflexive failure mode.

The purpose also matters. Someone using a stablecoin briefly to settle a trade is making a different decision from someone holding it as a store of value, or from someone minting a crypto-collateralized token against ETH or WBTC. A short transaction does not eliminate issuer, reserve, collateral, or algorithmic risk; it may simply reduce the time exposed to it. Longer use gives the quality of the underlying mechanism more weight.

No category is automatically "safe" because it targets one dollar. Fiat-collateralized stablecoins offer a direct and widely used model, but require trust in an issuer and its reserves. Crypto-collateralized stablecoins make their backing and rules more visible on-chain, but require volatile assets, liquidation processes, and excess collateral. Algorithmic stablecoins offer a more capital-efficient design in theory, but place far more weight on confidence in an incentive system. The useful comparison is not between labels. It is between the specific source of stability and the specific way it can fail.
