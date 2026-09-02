#!/bin/bash
# Mass-probe CoinGecko top projects across ALL ATS platforms
# Focus on real protocols/companies, skip memecoins and stablecoins

# These are the CoinGecko-sourced company slugs we DON'T already have in the pipeline
# Format: slug variations to try

echo "=== GREENHOUSE (CoinGecko projects) ==="
for slug in hyperliquid cardano toncoin aethir filecoin aptos jupiter flare vechain pudgypenguins pancakeswap chiliz aerodrome celestia monad curvedao etherfi layerzero optimism pendle pyth gnosis conflux lido starknet thegraph ethereumnamens jito axieinfinity raydium compound sandbox akashnetwork thorchain gala story sonic decentraland zksync arweave helium eigenlayer immutable convexfinance origintrail dydxchain 1inch multiversx instadapp reserverights aethir chainlinklabs worldcoin dydxfoundation mantra ondo ondofinance hashflow fhenix reclaim substrate tezos neo iota megaeth; do
  COUNT=$(curl -s --connect-timeout 3 "https://boards-api.greenhouse.io/v1/boards/$slug/jobs?content=false" 2>/dev/null | python3 -c "import json,sys; d=json.load(sys.stdin); print(len(d.get('jobs',[])))" 2>/dev/null)
  if [ "$COUNT" != "" ] && [ "$COUNT" != "0" ]; then
    echo "  ✅ greenhouse/$slug: $COUNT jobs"
  fi
done

echo ""
echo "=== LEVER (CoinGecko projects) ==="
for slug in hyperliquid cardano toncoin aethir filecoin aptos jupiter flare vechain pudgypenguins pancakeswap chiliz aerodrome celestia monad curvedao etherfi layerzero optimism pendle pyth gnosis conflux lido starknet thegraph jito axieinfinity raydium compound thorchain gala story sonic decentraland zksync arweave helium eigenlayer immutable origintrail dydx 1inch multiversx instadapp reserverights chainlink worldcoin mantra ondo hashflow fhenix tezos neo iota megaeth bittensor nexo kaia io-net alchemy aave morpho render maple jupiter-exchange sui polygon osmosis neon algorand flow aptos-labs harmony aurora linea fantom celo mina astar hashkey partisia; do
  RESP=$(curl -s --connect-timeout 3 "https://api.lever.co/v0/postings/$slug?mode=json" 2>/dev/null)
  IS_ARRAY=$(echo "$RESP" | python3 -c "import json,sys; d=json.load(sys.stdin); print('yes' if isinstance(d, list) else 'no')" 2>/dev/null)
  if [ "$IS_ARRAY" = "yes" ]; then
    COUNT=$(echo "$RESP" | python3 -c "import json,sys; d=json.load(sys.stdin); print(len(d))" 2>/dev/null)
    if [ "$COUNT" != "0" ]; then
      echo "  ✅ lever/$slug: $COUNT jobs"
    fi
  fi
done

echo ""
echo "=== ASHBY (CoinGecko projects) ==="
for slug in Hyperliquid hyperliquid Cardano Toncoin Aethir aethir Filecoin filecoin Aptos aptos Jupiter jupiter Flare flare VeChain PudgyPenguins PancakeSwap Chiliz chiliz Aerodrome aerodrome Celestia celestia Monad monad CurveDAO Etherfi etherfi LayerZero Optimism optimism Pendle pendle Pyth pyth Gnosis gnosis Conflux conflux Lido lido Starknet starknet TheGraph thegraph Jito jito AxieInfinity Raydium raydium Compound compound THORChain thorchain Gala gala Story story Sonic sonic Decentraland decentraland ZKsync zksync Arweave arweave Helium helium EigenLayer eigenlayer Immutable immutable OriginTrail dYdX 1inch MultiversX multiversx Instadapp instadapp Chainlink chainlink Worldcoin worldcoin Mantra mantra Ondo ondo Hashflow hashflow Tezos tezos NEO neo IOTA iota MegaETH megaeth Bittensor bittensor Nexo nexo Kaia kaia Aave aave Morpho morpho Render render MapleFinance Jupiter-exchange Sui sui Polygon polygon Algorand algorand Flow flow Harmony harmony Aurora aurora Linea linea Fantom fantom Celo celo Mina mina; do
  COUNT=$(curl -s --connect-timeout 3 "https://api.ashbyhq.com/posting-api/job-board/$slug" 2>/dev/null | python3 -c "import json,sys; d=json.load(sys.stdin); print(len(d.get('jobs',[])))" 2>/dev/null)
  if [ "$COUNT" != "" ] && [ "$COUNT" != "0" ]; then
    echo "  ✅ ashby/$slug: $COUNT jobs"
  fi
done

echo ""
echo "=== WORKABLE (CoinGecko projects) ==="
for slug in hyperliquid cardano toncoin aethir filecoin aptos jupiter flare vechain pancakeswap chiliz celestia monad etherfi layerzero optimism pendle pyth gnosis lido starknet thegraph jito raydium compound thorchain gala story decentraland zksync arweave helium eigenlayer immutable chainlink worldcoin mantra ondo hashflow tezos neo iota megaeth bittensor nexo kaia aave morpho render maple sui algorand flow harmony aurora linea fantom celo mina; do
  COUNT=$(curl -s --connect-timeout 3 "https://apply.workable.com/api/v1/widget/accounts/$slug" 2>/dev/null | python3 -c "import json,sys; d=json.load(sys.stdin); print(len(d.get('jobs',[])))" 2>/dev/null)
  if [ "$COUNT" != "" ] && [ "$COUNT" != "0" ]; then
    echo "  ✅ workable/$slug: $COUNT jobs"
  fi
done

echo ""
echo "=== RECRUITEE (CoinGecko projects) ==="
for slug in hyperliquid cardano toncoin aethir filecoin aptos jupiter flare vechain pancakeswap chiliz celestia monad etherfi layerzero optimism pendle pyth gnosis lido starknet thegraph jito raydium compound thorchain gala story decentraland zksync arweave helium eigenlayer immutable chainlink worldcoin ondo hashflow tezos neo iota bittensor nexo aave morpho render maple sui algorand flow harmony aurora linea fantom celo mina; do
  COUNT=$(curl -s --connect-timeout 3 "https://$slug.recruitee.com/api/offers" 2>/dev/null | python3 -c "import json,sys; d=json.load(sys.stdin); print(len(d.get('offers',[])))" 2>/dev/null)
  if [ "$COUNT" != "" ] && [ "$COUNT" != "0" ]; then
    echo "  ✅ recruitee/$slug: $COUNT jobs"
  fi
done

echo ""
echo "=== DONE (CoinGecko mass probe) ==="
