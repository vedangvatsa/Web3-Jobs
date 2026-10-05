---
title: Bitcoin Core Merged Fix for SIGHASH_SINGLE Signing Gap on September 25
ogTitle: "BITCOIN CORE MERGED FIX FOR SIGHASH_SINGLE SIGNING GAP ON SEPTEMBER 25"
description: Bitcoin Core merged PR #35984 on Sept. 25, 2026 to stop signing SIGHASH_SINGLE inputs that lack a matching output, leaving affected inputs unsigned while other inputs still sign.
image: /images/news/core-fix.jpg
imageCaption: "Golden Bitcoin coins arranged for a close photograph. Photo: Satheesh Sankaran via Wikimedia Commons (CC BY-SA 2.0)."
imageCreditUrl: https://commons.wikimedia.org/wiki/File:Bitcoin%20BTC%20Golden%20coins%208K%20wallpaper.jpg
category: News
data-ai-hint: golden bitcoin coins
publishedDate: '2026-10-05'
lastUpdated: '2026-10-05'
---

Bitcoin Core maintainers merged a signing fix into the master branch on Sept. 25, 2026, closing a narrow gap that left some partially signed transactions exposed to output substitution. The change, titled "skip signing SIGHASH_SINGLE inputs with no corresponding output," appears on [the pull request page](https://github.com/bitcoin/bitcoin/pull/35984), which names furszy as author and achow101 as the maintainer who merged it. [Bitcoin Optech flagged the update](https://bitcoinops.org/en/newsletters/2026/10/02/) in newsletter #425, published Oct. 2, and [CryptoSlate described the risk](https://cryptoslate.com/bitcoin-cores-new-fix-closes-gap-that-could-redirect-funds-without-stealing-keys/) in an Oct. 4 report.

The problem centers on SIGHASH_SINGLE, a signature mode that commits an input only to the output at the same index. When that output is missing, the signature commits to nothing at all, the developers wrote on [the pull request page](https://github.com/bitcoin/bitcoin/pull/35984). A signature produced in that state can stay valid even if outputs are later swapped, which opens a path for funds to move somewhere the signer did not approve.

No private keys are exposed by the flaw. The danger is redirection rather than theft, since someone able to shape the transaction around such a signature could change where the money goes without ever learning the owner's secret, in [the Oct. 4 account](https://cryptoslate.com/bitcoin-cores-new-fix-closes-gap-that-could-redirect-funds-without-stealing-keys/). Wallets and signing devices must therefore confirm that a valid signature actually binds the payment details shown to the user.

Legacy inputs face the sharpest version of the issue. With no matching output, legacy signing produces a signature over a fixed hash value, [the pull request explains](https://github.com/bitcoin/bitcoin/pull/35984). Such a signature could be reused against other unspent outputs held under the same key when the same structural conditions hold, as [noted in newsletter #425](https://bitcoinops.org/en/newsletters/2026/10/02/).

Segwit v0 inputs carry stronger built-in limits but are not fully safe in this corner. The signature still commits to the specific coin being spent and its amount, so it cannot be lifted onto an unrelated coin as freely. The destination output can still remain unbound, however, which leaves the authorization question open, CryptoSlate reported in [its Oct. 4 write-up](https://cryptoslate.com/bitcoin-cores-new-fix-closes-gap-that-could-redirect-funds-without-stealing-keys/).

The gap persisted because two signing paths behaved differently. SignTransaction(), the interface used for raw transactions, already refused these inputs. SignPSBTInput() did not, so requests arriving through walletprocesspsbt could still produce the risky signature, the developers explained on [the pull request page](https://github.com/bitcoin/bitcoin/pull/35984). Partially signed transactions are the standard way for software wallets, hardware devices, and offline signers to cooperate without sharing private keys, and that made the PSBT path the one that needed attention.

The fix moves the refusal into CreateSig, the shared routine that produces signatures for both paths. With the check in one place, legacy and segwit v0 inputs without a matching output are left unsigned regardless of which interface asked, while every other input in the same PSBT still signs normally, Optech said in [newsletter #425](https://bitcoinops.org/en/newsletters/2026/10/02/). The developers present that placement as protection for future callers as well, writing that any later signing path would inherit the same refusal automatically, as shown on [the pull request page](https://github.com/bitcoin/bitcoin/pull/35984).

The pull request marks itself as the fix for issue #35977 and drew review support before achow101 merged the single commit on Sept. 25. The author added that any future exception for the segwit v0 case should arrive as an explicit opt-in argument rather than by default, keeping it a deliberate choice, as recorded on [the pull request page](https://github.com/bitcoin/bitcoin/pull/35984).

The scope extends beyond one codebase because PSBT coordination is widespread. Builders hand transaction details to separate signers, and BIP174, the proposal defining the format, tells signers to reject modes they do not accept and recommends SIGHASH_ALL when nothing else is specified. The Core change matches that default by stopping the missing-output configuration before signing, according to [CryptoSlate's report](https://cryptoslate.com/bitcoin-cores-new-fix-closes-gap-that-could-redirect-funds-without-stealing-keys/).

Ordinary payments are unaffected. SIGHASH_ALL, the default mode, commits to all outputs and falls outside the patch. Only an input that explicitly requests SIGHASH_SINGLE while its matching output does not exist will come back unsigned, with the remaining inputs proceeding, as [explained in newsletter #425](https://bitcoinops.org/en/newsletters/2026/10/02/).

Timing is the open question. The Sept. 25 merge landed in the development branch, and published release listings had not identified a fixed version or a confirmed backport as of Oct. 4, in [the Oct. 4 article](https://cryptoslate.com/bitcoin-cores-new-fix-closes-gap-that-could-redirect-funds-without-stealing-keys/). Downstream software therefore enforces nothing new on its own yet.

Wallet providers and hardware-signer teams face the nearer-term decision. Each project must review its own handling of SIGHASH_SINGLE requests instead of waiting for a Core release to impose the same refusal from underneath, as [one closing assessment](https://cryptoslate.com/bitcoin-cores-new-fix-closes-gap-that-could-redirect-funds-without-stealing-keys/) put it. Teams that already default to SIGHASH_ALL per BIP174 have less to check, since the risky configuration arises only when software asks for the narrower mode without confirming that the matching output exists.
