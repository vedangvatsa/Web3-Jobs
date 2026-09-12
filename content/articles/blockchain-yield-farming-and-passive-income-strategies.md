---
title: Blockchain Yield Farming and Passive Income Strategies
image: /images/javier-quesada-qYfwGVNJqSA-unsplash.jpg
data-ai-hint: crypto yield farming
description: >-
  A practical explanation of DeFi yield farming, where the return comes from,
  and why fees, price exposure, and smart-contract risk matter more than a headline APY.
category: Educational
publishedDate: '2026-03-11'
lastUpdated: "2026-09-08"
---

Yield farming means placing crypto assets into a DeFi protocol in exchange for a return. The return may come from trading fees, borrowing interest, protocol-issued tokens, or a combination of those sources. The word "farming" can make the activity sound automatic. It rarely is. A yield position has moving prices, contract rules, transaction costs, and, in many cases, a reward paid in a volatile token.

The first useful question is not "What is the APY?" It is "Who pays this return, in what asset, and what risks am I taking to receive it?" A pool may show a large annualized number because it assumes a short-lived reward rate continues for a full year. That is an arithmetic projection, not a promise. If the reward token price falls, trading volume disappears, or the protocol changes its incentives, the realized return can look nothing like the displayed figure.

This article explains the mechanics behind common yield strategies. It is not investment advice. The purpose is to make the sources of return and loss visible before capital is committed.

## Liquidity providers make automated markets usable

Many decentralized exchanges use smart-contract pools rather than an order book. A liquidity provider deposits assets that traders can swap against. In a basic two-token pool, the deposit contains both assets at the pool's current ratio. In return, the provider receives a claim on their share of the pool.

Uniswap v2 documents this arrangement directly. Its [pool guide](https://docs.uniswap.org/contracts/v2/concepts/core-concepts/pools) says a pool holds two ERC-20 token balances, providers deposit the pair proportionally, and the pool mints liquidity tokens representing each provider's contribution. When a provider removes liquidity, those liquidity tokens are redeemed for the provider's share of the reserves and accrued fees.

For a simple constant-product market maker, the pool keeps the relationship `x * y = k`, where `x` and `y` are reserves of the two tokens. A trader who removes some of one asset must add enough of the other asset to preserve the rule after fees. The price moves as reserves change. A large trade against a shallow pool moves the price further than a small trade against a deep pool. Uniswap's [swap documentation](https://docs.uniswap.org/contracts/v2/concepts/core-concepts/swaps) explains that this automated market-maker mechanism gives users an immediate rate and slippage estimate instead of matching them against an order book.

The provider earns because swaps charge fees. In the v2 example, the documentation specifies a 0.3% fee paid by the trader and allocated proportionally to liquidity providers. That fee is the cleanest source of liquidity-provider yield: traders pay for the ability to exchange one asset for another. It is also variable. A pool with little trading activity produces little fee revenue, even if it holds a large deposit.

An LP token is not a separate bonus asset. It is a receipt for a claim on the pool. Its value changes with the pool's reserves, the prices of both assets, and earned fees. Treating it as cash-equivalent hides the exposure inside it.

## Price movement changes what an LP owns

Liquidity provision is not the same as holding the deposited assets separately. When traders buy one asset from a pool, they leave more of the other asset behind. The pool continuously rebalances the provider's position through trades.

Suppose a provider starts with equal dollar values of ETH and a stablecoin. If ETH rises in external markets, arbitrage traders buy ETH from the pool where it is temporarily cheaper and deposit stablecoins until the pool price catches up. The LP finishes with less ETH and more stablecoin than they started with. If ETH falls, the opposite pattern occurs: the LP ends with more ETH and less stablecoin.

The difference between the value of the LP position and the value of simply holding the original assets is usually called impermanent loss. The name can confuse. It is a comparison, not a refund that a protocol owes. It can shrink if relative prices return to their starting point, but a provider who withdraws after a large price change realizes the current value of the pool share. Fees may offset some or all of that difference. They may also fail to offset it.

You can see the economics without trusting a label. If a token's price doubles against the other token, a constant-product pool has sold some of the rising token along the way. The provider captured some upside, but not as much as a person who held the original amount of the rising token outside the pool. In return, the provider collected fees and supplied liquidity during the price move.

Concentrated-liquidity designs make this trade-off more active. In Uniswap v3 and v4, providers can choose a price range in which their capital is active. The [concentrated-liquidity guide](https://docs.uniswap.org/concepts/protocol/liquidity) explains that an out-of-range position is no longer active and does not earn fees until the price returns to its range. A narrow range can place more liquidity near the current price, but it requires monitoring and repositioning if the market moves. A broad range is less capital-efficient but needs less frequent adjustment.

That is why calling every LP position passive is inaccurate. A broad full-range position may be relatively hands-off, but it still carries price and contract risk. A narrow position is closer to an active market-making strategy. The provider must decide when to change ranges, when fees justify transaction costs, and whether the position's changing token mix still matches their view.

## Incentive rewards can add yield and add risk

Protocols sometimes distribute their own governance token or another reward token to attract deposits. This is commonly called liquidity mining. The extra tokens can be staked, sold, or reinvested, depending on the rules. They are separate from trading fees.

The distinction matters because the economic source is different. Fees come from users who trade. Incentive tokens come from the protocol's allocation or issuance schedule. A pool can show a high rate while real trading fees are low if most of the displayed return comes from new token emissions. Read the reward schedule, the token being paid, any lockup, and the conditions under which the rate can change.

Reward compounding is also not free. Claiming and swapping rewards incurs transaction costs and usually creates more price exposure. Reinvesting a reward token into the same protocol ties the position more closely to that protocol's token price. Reinvesting it into the LP position may increase the size of the original price risk. A displayed APY often assumes frequent compounding without subtracting those costs.

Some strategies take the LP receipt token and deposit it into another contract for additional rewards. This can stack fee income, incentive income, and sometimes lending income. It also stacks dependencies. The position now depends on the exchange pool, the receipt token's contract logic, the farm contract, the reward-token economics, the chain, and the wallet authorization used to enter each step. More layers do not automatically create a better return. They create more places for an assumption to fail.

## Lending yield is a different trade

In a lending market, suppliers deposit an asset into a pool and borrowers take that asset out after posting collateral. Borrowing interest is paid to suppliers after the protocol's rules and reserves are accounted for. Here, the source of yield is borrower demand rather than trading volume.

Lending removes the automatic two-asset rebalancing of a standard AMM position, but it introduces a different set of concerns. Supply rates can fall when utilization falls. Borrower collateral can lose value quickly. The protocol needs correct collateral parameters, price-oracle inputs, and liquidators who can act when accounts become unsafe.

The [Aave liquidation guide](https://aave.com/help/borrowing/liquidations) gives a concrete example of this system. It defines a health factor based on collateral value, a weighted liquidation threshold, and borrow value. When the health factor is below one, a liquidator can repay debt and receive collateral plus a liquidation bonus. This mechanism protects suppliers in the intended design, but it does not erase risks from bad oracle data, a market shock, software flaws, or a lack of effective liquidations during stressed conditions.

Borrowing to farm increases both potential return and potential loss. A borrower may deposit collateral, borrow another asset, provide that asset to a pool, and repeat the process. Their result then depends on several prices and interest rates at once. If the collateral declines or the borrowed asset rises, the health factor can deteriorate. A position can be liquidated even when the farm's displayed yield is positive. Do not call a leveraged loop passive income. It is an actively managed liability position.

## APR and APY describe different assumptions

APR is a simple annualized rate. If a protocol pays a rate of 10% APR and nothing is reinvested, the simple annual return on the stated principal is 10%, before price changes, fees, and taxes.

APY includes a compounding assumption. A 10% rate compounded periodically produces a higher annual percentage than a 10% simple rate. The more often rewards compound, the more the arithmetic projection increases. That formula says nothing about whether the reward asset keeps its price or whether compounding costs more than it adds.

Use the label as a starting point, then rebuild the estimate in assets you understand. Separate fee revenue from reward emissions. Convert both to the asset in which you measure your portfolio only after recognizing that conversion may change by the hour. Subtract gas, swap fees, bridge fees if any, and the cost of managing the position. Then stress-test the estimate with lower volume, lower reward-token prices, and an adverse move between the paired assets.

An annualized return calculated from one day's rewards is especially fragile. If a pool pays one dollar of rewards today on a small deposit, multiplying it by 365 describes a hypothetical year in which the rate, total deposits, reward-token price, and program rules do not change. DeFi conditions regularly change all of those inputs.

## A due-diligence process before depositing

Start with the simplest question: what contract will hold the assets? Read the official documentation, use the official interface, and confirm the contract address through more than one trusted channel. An audit can identify issues in a specific version of code, but it is not a guarantee that the contract is safe, that an upgrade will remain safe, or that the economic design is sound.

Next, identify who can change the system. Some contracts are immutable after deployment. Others use upgrade proxies, multisignature administrators, pausable functions, emergency withdrawals, or parameter controls. Those choices can be sensible, especially when a vulnerability needs a response, but they create trust assumptions. A user should know whether a team or governance process can change fee rates, reward schedules, contract code, or withdrawal conditions.

Check the asset itself. A token called USD is not automatically equivalent to a dollar. It can have issuer, collateral, redemption, freeze, bridge, or depegging risks. A wrapped asset adds custody or bridge assumptions. A newly issued reward token may have concentrated holdings, scheduled unlocks, or low liquidity. The pool's yield does not cancel those risks.

Keep a record of the position at entry. Note the assets and quantities deposited, their prices, the pool address, the chosen range if relevant, approvals granted, claim rules, and transaction hashes. This makes it possible to distinguish fee income from price movement later. Without an entry record, a changing token balance can look like yield when it is only the AMM rebalancing the position.

Use a small amount first. Confirm that deposits, withdrawals, reward claims, and approval revocation work as expected. Test the full exit path, not only the attractive entry screen. If a position requires several bridges, wrappers, farms, and locked tokens, map how each step unwinds before entering it.

## Yield is payment for a risk someone needs carried

There is no protocol mechanism that creates a stable high return without an economic source or a risk. Traders pay liquidity providers for execution. Borrowers pay lenders for capital. Protocols distribute tokens to attract deposits. The provider may take volatility, smart-contract, oracle, liquidity, governance, and operational risk in exchange.

That framing changes the decision. A modest fee yield on two assets you are already willing to hold may be understandable. A large advertised APY paid in a thinly traded reward token, behind multiple contracts and a leveraged borrowing loop, deserves a much higher standard of proof. The return should be explained in terms of cash flow, token issuance, price exposure, and the conditions under which you can exit.
