import urllib.request
import json
import sys

companies = [
  "aethir", "chainalysis", "circle", "dydx", "wintermute", "wormhole", "celestia", "mantle", "bitstamp", "halborn", "xapo", "ankr", "ondo", "scroll", "flashbots", "arweave", "tensor", "hashflow", "monad", "lido", "pendle", "euler", "across", "nomic", "near", "polkadot",
  "coinbase", "binance", "kraken", "gemini", "bitfinex", "bybit", "okx", "kucoin", "gate", "htx", "bitget", "mexc",
  "uniswap", "aave", "compound", "sushiswap", "pancakeswap", "curve", "yearn", "balancer", "synthetix", "maker",
  "chainlink", "the-graph", "render", "filecoin", "helium", "akash", "theta", "livepeer",
  "opensea", "magic-eden", "blur", "rarible", "foundation", "zora",
  "metamask", "phantom", "trust-wallet", "ledger", "trezor", "safe", "exodus", "rainbow", "argent",
  "polygon", "avalanche", "solana", "sui", "aptos", "sei", "injective", "cosmos", "starknet", "zksync", "optimism", "base", "arbitrum", "linea",
  "consensys", "alchemy", "infura", "moralis", "thirdweb", "hardhat", "foundry", "remix", "truffle",
  "fireblocks", "bitgo", "anchorage", "copper", "paxos", "securitize",
  "ripple", "stellar", "tron", "cardano", "algorand", "tezos", "iota", "near-protocol", "flow", "fantom", "celo", "mina", "harmony", "aurora",
  "immutable", "animoca", "sandbox", "decentraland", "axie", "gala", "stepn",
  "eigenlayer", "celestia-labs", "monad-labs", "mysten-labs", "aptos-labs", "ava-labs", "offchain-labs", "op-labs",
  "nansen", "dune", "glassnode", "messari", "coinmetrics", "tokenterminal",
  "grayscale", "galaxy", "pantera", "a16z", "paradigm", "polychain", "variant", "dragonfly", "multicoin",
  "brave", "blockstack", "stacks",
  "worldcoin", "world", "tools-for-humanity",
  "bittensor", "ritual", "io-net",
  "ethena", "morpho", "maple", "centrifuge", "goldfinch", "clearpool",
  "pyth", "hyperlane", "axelar",
  "dapper", "yuga", "pudgy", "azuki",
  "certik", "trail-of-bits", "openzeppelin", "immunefi",
  "coingecko", "coinmarketcap", "coindesk", "cointelegraph", "theblock", "decrypt",
  "nexo", "celsius", "blockfi", "ledn", "youhodler",
  "bitpay", "moonpay", "ramp", "transak", "simplex", "wyre", "sardine",
  "ton", "toncoin", "wallet-ton",
  "swissborg", "bitpanda",
  "neon", "neon-evm", "mantra", "orderly", "backpack",
  "turnkey", "privy", "dynamic", "web3auth", "magic", "particle",
  "elliptic", "trm", "merkle-science",
  "blockdaemon", "figment", "chorus-one", "everstake", "stakefish", "p2p",
  "quicknode", "helius", "syndica", "jito", "marinade",
  "sorare", "chiliz", "socios",
  "matter-labs", "starkware", "consensys-software", "parcl", "kamino", "drift", "jupiter"
]

def check_bamboo(slug):
    url = f"https://{slug}.bamboohr.com/jobs/embed2.json"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        res = urllib.request.urlopen(req, timeout=3)
        data = json.loads(res.read())
        return len(data)
    except:
        return 0

def check_pinpoint(slug):
    url = f"https://{slug}.pinpointhq.com/jobs.json"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        res = urllib.request.urlopen(req, timeout=3)
        data = json.loads(res.read())
        return len(data.get('data', []))
    except:
        return 0

print("Checking BambooHR...")
for c in companies:
    count = check_bamboo(c)
    if count > 0:
        print(f"  ✅ BambooHR: {c} ({count} jobs)")

print("Checking Pinpoint...")
for c in companies:
    count = check_pinpoint(c)
    if count > 0:
        print(f"  ✅ Pinpoint: {c} ({count} jobs)")

