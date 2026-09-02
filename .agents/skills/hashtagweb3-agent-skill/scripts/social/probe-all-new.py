import urllib.request
import json
import sys
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

new_slugs = [
  "scroll-tech", "berachain", "blast", "taiko", "zora-co", "syndicate", "farcaster", "warpcast", 
  "lens", "lens-protocol", "aave-companies", "stani", "gitcoin", "biconomy", "safe-global", 
  "gnosis-safe", "argent-hq", "braavos", "10kx", "electric-capital", "framework-ventures",
  "delphi-labs", "jump-crypto", "wintermute-trading", "falconx", "gsr", "b2c2", "cumberland",
  "matterlabs", "offchainlabs", "optimism-foundation", "starkware-industries", "fuel-labs",
  "celestia-org", "eigen-labs", "eigenlayer", "espresso-sys", "succinct-labs", "risczero",
  "axiom", "brevis", "polyhedra", "layerzero-labs", "wormhole-crypto", "axelar-network",
  "hyperlane-xyz", "lz-labs", "aptos-foundation", "sui-foundation", "mystenlabs",
  "solana-foundation", "jito-foundation", "marinade", "marginfi", "kamino-finance",
  "tensor-hq", "magic-eden-hq", "phantom-app", "backpack-app", "coral", "pyth-network",
  "douro-labs", "switchboard", "monad-xyz", "sei-labs", "sei-foundation", "injective-labs",
  "berachain-foundation", "movement-labs", "eclipse-fi", "eclipse-builder", "altlayer",
  "dydx-foundation", "dydx-trading", "uniswap-labs", "uniswap-foundation", "makerdao", 
  "sky-ecosystem", "lido-finance", "puffer-finance", "ether-fi", "kelp-dao", "renzoprotocol",
  "ethena-labs", "pendle-fi", "ondo-finance", "superstate", "mountain-protocol", "sec-yield",
  "frax-finance", "curve-fi", "crv", "yearn-finance", "synthetix-io", "thales", "kwenta",
  "gmx", "hyperliquid", "vertex-protocol", "aevo", "rabby", "debank", "zerion-io", "zapper-fi",
  "1inch-network", "paraswap-io", "cow-protocol", "matcha", "0xlabs", "nansen-ai", "dune-analytics",
  "messari-crypto", "tokenterminal", "defillama", "coingecko-hq", "coinmarketcap-hq",
  "arkham-intelligence", "chainalysis-inc", "elliptic-co", "trm-labs", "certik-org",
  "trailofbits", "openzeppelin-hq", "halborn-inc", "immunefi-inc", "zellic", "code4rena",
  "yugalabs", "dapperlabs", "animocabrands", "sky-mavis", "immutable-hq", "gala-games",
  "sorare-hq", "stepn-app", "find-satoshi", "chiliz-hq", "socios-hq", "pudgypenguins",
  "azuki-zen", "proof-xyz", "worldcoin-org", "toolsforhumanity", "bittensor-org", "opentensor",
  "ritual-net", "io-net", "aethir-hq", "golem-network", "akash-network", "render-network",
  "helium-inc", "nova-labs", "arweave-org", "forward-research", "filecoin-foundation",
  "protocol-labs", "livepeer-org", "the-graph-foundation", "edge-and-node", "ceramic-network",
  "lit-protocol", "biconomy-hq", "particle-network", "privy-inc", "dynamic-xyz", "turnkey-hq",
  "web3auth-hq", "magic-labs", "alchemy-insights", "infura-io", "quicknode-inc", "blockdaemon-inc",
  "figment-inc", "chorusone", "p2p-org", "stakefish", "everstake", "kraken-exchange",
  "gemini-trust", "okcoin", "kucoin-exchange", "gate-technology", "htx-exchange", "bitget-exchange",
  "mexc-global", "bybit-exchange", "deribit", "bitmex", "bitstamp-ltd", "luno-money", "coincheck",
  "bitvavo-hq", "swissborg-hq", "nexo-finance", "ledn-inc", "youhodler-hq", "moonpay-hq",
  "ramp-network", "transak-hq", "simplex-cc", "sardine-ai", "plaid-inc", "stripe-crypto",
  "paypal-crypto", "circle-inc", "tether-operations", "paxos-trust", "securitize-io",
  "oasis-network", "rose-foundation", "chia-network", "kadena-llc", "mina-foundation",
  "o1labs", "harmony-one", "nervos-network", "vechain-foundation", "hedera-hashgraph",
  "swirlds-labs", "algorand-foundation", "algorand-inc", "tezos-foundation", "trilitech",
  "nomadic-labs", "iota-foundation", "stellar-development", "ripple-labs", "tron-foundation",
  "berachain", "abstract", "abstract-chain", "monad", "initia", "movement", "succinct", "axiom", "espresso"
]

def req(url):
    try:
        r = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        res = urllib.request.urlopen(r, context=ctx, timeout=3)
        return json.loads(res.read())
    except Exception as e:
        return None

print("Probing Greenhouse...")
for s in new_slugs:
    d = req(f"https://boards-api.greenhouse.io/v1/boards/{s}/jobs?content=false")
    if d and 'jobs' in d and len(d['jobs']) > 0:
        print(f"  ✅ Greenhouse: {s} ({len(d['jobs'])} jobs)")

print("Probing Lever...")
for s in new_slugs:
    d = req(f"https://api.lever.co/v0/postings/{s}?mode=json")
    if isinstance(d, list) and len(d) > 0:
        print(f"  ✅ Lever: {s} ({len(d)} jobs)")

print("Probing Ashby...")
for s in new_slugs:
    d = req(f"https://api.ashbyhq.com/posting-api/job-board/{s}")
    if d and 'jobs' in d and len(d['jobs']) > 0:
        print(f"  ✅ Ashby: {s} ({len(d['jobs'])} jobs)")

print("Probing Workable...")
for s in new_slugs:
    d = req(f"https://apply.workable.com/api/v1/widget/accounts/{s}")
    if d and 'jobs' in d and len(d['jobs']) > 0:
        print(f"  ✅ Workable: {s} ({len(d['jobs'])} jobs)")

print("Probing Recruitee...")
for s in new_slugs:
    d = req(f"https://{s}.recruitee.com/api/offers")
    if d and 'offers' in d and len(d['offers']) > 0:
        print(f"  ✅ Recruitee: {s} ({len(d['offers'])} jobs)")

