---
term: Zero-Coupon Bond
slug: zero-coupon-bond
category: defi
difficulty: Intermediate
image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=80'
description: >-
  A financial instrument that pays no interest during its term but is sold at a
  significant discount to its face value, with profit made on the difference
  (redemption yield).
relatedTerms:
  - fixed-income
  - defi
  - bonds
  - yield
synonyms:
  - zero-coupon
  - deep-discount bond
  - bullet bond
lastUpdated: 2026-09-04
---

## Definition

A zero-coupon bond is a debt instrument that does not make periodic interest payments. Instead, it is issued or bought below its face value and pays that face value on a stated maturity date. The difference between the purchase price and the maturity payment is the investor's return, assuming the issuer pays as promised.

For example, a bond that pays $1,000 in three years might sell for $850 today. An investor who holds it to maturity receives $1,000. Its return accumulates in the bond's price.

Annualized yield is `(face value / purchase price)^(1 / years) - 1`. Yield is not a guarantee if the bond is sold early or the issuer does not pay.

## How It Works

An issuer borrows money by selling the bond. The issuer sets a maturity date and a face value, also called par value. The market price reflects the time until payment, prevailing interest rates, the issuer's credit risk, expected inflation, and demand for the bond. A safer issuer or a shorter maturity often requires a smaller discount than a riskier or longer-dated obligation.

After issuance, the holder can keep the bond or sell it. If market interest rates rise, newly issued bonds may offer better returns, so an existing zero-coupon bond generally becomes less valuable. The effect is often stronger for a zero-coupon bond than for a similar coupon bond because all of its cash flow arrives at maturity. This sensitivity to rates is called duration risk.

In DeFi, a yield-bearing asset can be split into a principal claim and a yield claim for a fixed expiry. The principal token represents the right to redeem a defined amount of the underlying asset at expiry, subject to the protocol and underlying asset performing as designed. If it trades below that redemption value, its price behavior resembles a zero-coupon bond. The yield token receives the variable yield generated before expiry.

## Concrete Example

Suppose an issuer sells a one-year zero-coupon bond with a $1,000 face value for $925. A buyer pays $925 today and receives $1,000 at maturity if the issuer remains solvent. The simple one-year return is $75 divided by $925, or about 8.1 percent. If the buyer needs cash after six months and rates have risen, the market may value the bond at $900. Selling then realizes a loss even though the stated maturity value remains $1,000.

For an on-chain example, consider a tokenized vault share expected to be redeemable for 1 staked ETH at a fixed expiry. A protocol splits the position into a principal token and a yield token. If the principal token trades for 0.96 ETH, a buyer can pay 0.96 ETH and redeem 1 ETH at expiry, provided the vault and protocol meet their obligations. The 0.04 ETH difference reflects the market's implied fixed return and its assessment of risk.

## Limitations and Risks

The issuer can default or restructure its debt. In traditional finance this is credit risk. In DeFi, comparable risks include a smart-contract exploit, a failure of the underlying yield source, depegging of the underlying asset, or a protocol rule that changes expected redemption. A token that resembles a bond is not necessarily a legal debt claim against an issuer.

Zero-coupon bonds can move sharply when interest rates change. Longer maturities are usually more sensitive. Inflation can also reduce the purchasing power of the final payment. There may be little secondary-market liquidity, which can force a holder to sell at a discount before maturity.

Tax treatment can be unintuitive. Some jurisdictions tax accrued interest on a zero-coupon bond before the holder receives cash. Tokenized positions may have separate tax and legal treatment. Terms, collateral, redemption conditions, and local rules matter.

## Relevant Distinctions

A coupon bond pays stated interest during its life and then returns principal at maturity. A zero-coupon bond has one promised payment at maturity. A discount bond is any bond trading below face value. It may still pay coupons, so not every discount bond is zero-coupon.

The price of a DeFi principal token can resemble a zero-coupon bond, but the structure differs. A government or corporate bond is usually a contractual debt obligation. A principal token is often a contract claim on an asset or vault position. Its settlement depends on code, oracle inputs where used, custody, and the underlying protocol, rather than only an issuer's ability to pay.
