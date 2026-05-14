import urllib.request
import sys
import xml.etree.ElementTree as ET

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

def check_personio(slug):
    url = f"https://{slug}.jobs.personio.de/xml"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        res = urllib.request.urlopen(req, timeout=3)
        content = res.read()
        root = ET.fromstring(content)
        jobs = list(root.findall('.//position'))
        return len(jobs)
    except Exception as e:
        return 0

print("Checking Personio...")
for c in companies:
    count = check_personio(c)
    if count > 0:
        print(f"  ✅ Personio: {c} ({count} jobs)")

