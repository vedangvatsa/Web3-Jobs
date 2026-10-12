---
title: Tether blacklists four THORChain vaults, then reverses within hours
ogTitle: "TETHER BLACKLISTS FOUR THORCHAIN VAULTS, THEN REVERSES"
description: Tether blacklisted four THORChain Tron vaults holding about 1.45 million USDT on Oct. 9, freezing most of the protocol's Tron funds for about two hours before lifting the block with balances intact and swaps resuming.
image: /images/news/thorchain-freeze.jpg
imageCaption: "A bitcoin ATM in Prague. Photo: Perituss via Wikimedia Commons (CC0)."
imageCreditUrl: https://commons.wikimedia.org/wiki/File:Bitcoin_ATM_Prague.jpg
category: News
data-ai-hint: bitcoin atm machine
publishedDate: '2026-10-12'
lastUpdated: '2026-10-12'
---

Tether blacklisted four THORChain vault addresses on the Tron network on Oct. 9, freezing a combined balance of about 1.45 million USDT, then lifted the block the same afternoon with funds intact. The four vaults held 93 percent of the protocol's Tron USDT, forcing a pause in Tron swaps, signing and liquidity-provider operations until the blacklist cleared.

The freeze landed at 13:36 UTC at Tron block 86958330, and about $363,000 in payouts queued behind it, [per an Oct. 9 timeline](https://cryptoslate.com/tether-freezes-1-4m-in-tron-vaults-and-thorchain-stalls/) citing researcher Khal. Four of the protocol's six Tron vaults were affected. Trading on the Tron route halted about 27 minutes after the blocklist appeared. The blacklist lifted at 15:30 UTC, THORChain technical co-founder Chad Barraford flagged the all-clear at 15:35, and swaps resumed at 15:58, according to the same [report](https://cryptoslate.com/tether-freezes-1-4m-in-tron-vaults-and-thorchain-stalls/).

"We don't know why this choice was made and have had no comms with USDT before this action and are actively reaching out to have a conversation," Barraford wrote on X on Friday, as [Cointelegraph quoted](https://cointelegraph.com/news/thorchain-tether-freezing-usdt-addresses). "We hope that this was made in error / misunderstanding." About two hours later he reported trading would resume after the unfreeze, the [report added](https://cointelegraph.com/news/thorchain-tether-freezing-usdt-addresses).

## Collateral damage thesis

Khal argued the vaults may have been caught in a broader sweep covering roughly 30 other wallets rather than targeted deliberately. Nineteen other wallets frozen in the same action stayed blacklisted after the four THORChain vaults came off, Crypto Briefing [reported](https://cryptobriefing.com/tether-freezes-usdt-thorchain-vaults-tron/) on Oct. 9. That split supports the collateral reading without confirming it, since Tether gave no reason for either the freeze or the reversal.

Both companies were contacted for comment and gave no immediate response, [per the Oct. 9 report](https://cointelegraph.com/news/thorchain-tether-freezing-usdt-addresses). Tether's standing policy follows the OFAC list as a general matter, but the company stated no cause for this specific action, and the cause remains unclear.

## Two layers of control

The incident exposes a split in how the protocol works. THORChain's vault documentation describes accounts managed by validator nodes that hold assets on outside blockchains and handle incoming funds and outgoing transactions. Spreading signing authority across validators decides who can authorize a payment, but the tokens inside those accounts stay subject to their issuer's restrictions, CryptoSlate [explained](https://cryptoslate.com/tether-freezes-1-4m-in-tron-vaults-and-thorchain-stalls/).

THORChain drew a related line on Oct. 1. Node operators can pause a chain or the whole protocol for safety, but they cannot selectively remove an individual swap, the protocol said in a blog recap the same [report](https://cryptoslate.com/tether-freezes-1-4m-in-tron-vaults-and-thorchain-stalls/) cites. Tether, meanwhile, says its wallet-freezing policy follows the OFAC sanctions list and extends to secondary-market wallets. The operational dependency stays: distributing the authority to sign transactions does not remove Tether's ability to freeze the USDT sitting in the accounts those transactions use.

The timing added scrutiny. On Oct. 8, THORChain's September trading surge coincided with Bitget-hack-linked activity, and the protocol refused to selectively block addresses, CryptoSlate [noted](https://cryptoslate.com/tether-freezes-1-4m-in-tron-vaults-and-thorchain-stalls/) in the same piece. The Oct. 9 piece, by editor-in-chief Liam Wright, framed its conclusion as an issuer-control lesson: decentralized signing cannot remove USDT issuer controls. Crypto Briefing's version, by Estefano Gomez, matched the vault count, the balance and the reversal time, while Cointelegraph's, by Turner Wright, carried the Barraford quotes and the no-response note.

The figures need one rounding note. One headline says $1.4 million while its body and the other two accounts all say about 1.45 million USDT. Timing labels also differ by anchor: two hours to Barraford's resume notice, three to restarted swaps. The sequence itself is consistent across all three readable accounts: freeze at 13:36, lift at 15:30, notice at 15:35, swaps at 15:58, balances whole.

The scope needs the same care. Headlines saying THORChain stalled overstate it. What stopped was the Tron route: cross-chain swaps, transaction signing, deposits and liquidity-provider actions on Tron. The rest of the network kept moving.
