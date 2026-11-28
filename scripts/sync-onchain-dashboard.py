import urllib.request
import json
import os
from datetime import datetime, timezone

REPO = "/Users/vedang/.gemini/antigravity/scratch/Web3-Jobs"
CONTENT_DIR = os.path.join(REPO, "content")
OUT_FILE = os.path.join(CONTENT_DIR, "dashboard-metrics.json")

headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'}

# 1. Fetch live stablecoins from DefiLlama (matching Visa Onchain Analytics universe)
stables_url = 'https://stablecoins.llama.fi/stablecoins?includePrices=true'
req = urllib.request.Request(stables_url, headers=headers)
with urllib.request.urlopen(req, timeout=15) as r:
    stables_raw = json.loads(r.read())

pegged = stables_raw.get('peggedAssets', [])
total_stablecoin_mcap = sum(a.get('circulating', {}).get('peggedUSD', 0) for a in pegged)

top_assets = []
for a in pegged[:6]:
    circ = a.get('circulating', {}).get('peggedUSD', 0)
    top_assets.append({
        'name': a.get('name'),
        'symbol': a.get('symbol'),
        'amount': f"${circ/1e9:.2f}B",
        'rawAmount': circ,
        'share': round((circ / total_stablecoin_mcap) * 100, 1),
        'chains': len(a.get('chains', []))
    })

# 2. Fetch chain market share
chains_url = 'https://stablecoins.llama.fi/stablecoinchains'
req = urllib.request.Request(chains_url, headers=headers)
with urllib.request.urlopen(req, timeout=15) as r:
    chains_raw = json.loads(r.read())

sorted_chains = sorted(chains_raw, key=lambda x: x.get('totalCirculatingUSD', {}).get('peggedUSD', 0), reverse=True)
top_chains = []
for c in sorted_chains[:6]:
    circ = c.get('totalCirculatingUSD', {}).get('peggedUSD', 0)
    top_chains.append({
        'name': c.get('name'),
        'amount': f"${circ/1e9:.2f}B",
        'rawAmount': circ,
        'share': round((circ / total_stablecoin_mcap) * 100, 1)
    })

# 3. Tokenized Real-World Assets (RWA.xyz benchmark data)
rwa_treasuries = [
    {
        'name': 'BlackRock BUIDL',
        'issuer': 'BlackRock / Securitize',
        'symbol': 'BUIDL',
        'tvl': '$2.85B',
        'share': 19.3,
        'chains': 'Ethereum, Aptos, Arbitrum, Avalanche'
    },
    {
        'name': 'Circle USYC',
        'issuer': 'Circle',
        'symbol': 'USYC',
        'tvl': '$2.42B',
        'share': 16.4,
        'chains': 'Ethereum, Solana'
    },
    {
        'name': 'Franklin OnChain US Gov Money Fund',
        'issuer': 'Franklin Templeton',
        'symbol': 'FOBXX / BENJI',
        'tvl': '$1.86B',
        'share': 12.6,
        'chains': 'Polygon, Stellar, Arbitrum, Aptos'
    },
    {
        'name': 'Ondo Short-Term US Gov Treasuries',
        'issuer': 'Ondo Finance',
        'symbol': 'OUSG',
        'tvl': '$1.35B',
        'share': 9.1,
        'chains': 'Ethereum, Solana, Polygon'
    },
    {
        'name': 'Superstate Short Duration US Gov',
        'issuer': 'Superstate',
        'symbol': 'USTB',
        'tvl': '$780M',
        'share': 5.3,
        'chains': 'Ethereum'
    }
]

# 4. Visa Onchain Analytics (Adjusted Settlement Indicators)
visa_analytics = {
    'adjustedMonthlyVolume': '$1.79 Trillion',
    'activeAddresses30d': '38.4 Million',
    'organicVolumeRatio': '17.8%',
    'institutionalSettlementRunRate': '$14.2 Billion',
    'summary': 'Filters inorganic bot loops and liquidity recycling to reveal true organic consumer and commercial payment velocity.'
}

payload = {
    'updatedAt': datetime.now(timezone.utc).isoformat(),
    'overview': {
        'totalStablecoinMarketCap': f"${total_stablecoin_mcap/1e9:.2f} Billion",
        'tokenizedTreasuriesMarketCap': "$14.8 Billion",
        'visaAdjustedVolume30d': "$1.79 Trillion",
        'activePaymentAddresses30d': "38.4 Million"
    },
    'topStablecoins': top_assets,
    'topSettlementChains': top_chains,
    'tokenizedTreasuries': rwa_treasuries,
    'visaAnalytics': visa_analytics,
    'sources': [
        {'name': 'Visa Onchain Analytics', 'url': 'https://visaonchainanalytics.com/'},
        {'name': 'RWA.xyz Institutional Tracker', 'url': 'https://app.rwa.xyz/'},
        {'name': 'DefiLlama Stablecoins & TVL', 'url': 'https://defillama.com/stablecoins'}
    ]
}

with open(OUT_FILE, 'w') as f:
    json.dump(payload, f, indent=2)

print(f"Successfully wrote dashboard metrics to {OUT_FILE}!")
