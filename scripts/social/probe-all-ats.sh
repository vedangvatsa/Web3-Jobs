#!/bin/bash
# Probe Greenhouse, Lever, Ashby, Workable, SmartRecruiters, Recruitee, and BambooHR
# for Web3/crypto companies with active job boards.

echo "=== GREENHOUSE ==="
for slug in chainalysis circleinternetfinancial dydx wintermute trmlabs wormhole yugalabs unstoppabledomains bakkt bitstamp halborn talos ankr chainlinklabs filecoin lukka marathon moonbeam sygnum xapo spire crossmint kucoin htx rabbithole notional synthetix aavelabs lidofinance euler pendle across nomicfoundation reclaim mantra ondo ondofinance arweave hashflow fhenixio aethir io-net ionet hyperlane scroll scrollio stackrlabs altlayer tensor tensorhq borderless marginfi parcl jito-labs cubist zksync matrixport matrixone biconomy0 astar hashkey hashkeygroup swirlds mina propellerheads flashbots succinct risczero bonsai-labs polyhedra herodotus ethereumfoundation web3foundation solana-labs solanalabs substrate polkadot parity partisiablockchain moonriver cosmossdk; do
  COUNT=$(curl -s --connect-timeout 3 "https://boards-api.greenhouse.io/v1/boards/$slug/jobs?content=false" 2>/dev/null | python3 -c "import json,sys; d=json.load(sys.stdin); print(len(d.get('jobs',[])))" 2>/dev/null)
  if [ "$COUNT" != "" ] && [ "$COUNT" != "0" ]; then
    echo "  ✅ greenhouse/$slug: $COUNT jobs"
  fi
done

echo ""
echo "=== LEVER ==="
for slug in chainalysis circle dydx wintermute trmlabs wormhole phantom mantle matterlabs chainstack trueanomaly bitstamp halborn lukka bakkt anchorage anchoragedigital unstoppabledomains celestia worldcoin world talos crossmint bitpay xapo yuga yogalabs kucoin htx synthetix ankr arweave aethir ionet hyperlane marginfi tensor hashflow ondo ondoboard scroll altlayer flashbots risczero polyhedra herodotus filecoinproject polkadot; do
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
echo "=== ASHBY ==="
for slug in Chainalysis Circle dYdX Wintermute TRMLabs Wormhole World Mantle MatterLabs Celestia Halborn Talos Crossmint YugaLabs Bakkt Lido Pendle Across NomicFoundation EulerFinance Bitstamp UnstoppableDomains Xapo FlashBots AltLayer Scroll Ondo Arweave Tensor Aethir Ionet Hyperlane RiscZero Polyhedra Herodotus Filecoin; do
  COUNT=$(curl -s --connect-timeout 3 "https://api.ashbyhq.com/posting-api/job-board/$slug" 2>/dev/null | python3 -c "import json,sys; d=json.load(sys.stdin); print(len(d.get('jobs',[])))" 2>/dev/null)
  if [ "$COUNT" != "" ] && [ "$COUNT" != "0" ]; then
    echo "  ✅ ashby/$slug: $COUNT jobs"
  fi
done

echo ""
echo "=== WORKABLE ==="
# Workable public API: https://COMPANY.workable.com/api/v3/accounts/COMPANY/jobs (requires subdomain)
for slug in chainalysis circle dydx wintermute wormhole halborn talos bitstamp xapo kucoin ankr arweave ondo scroll flashbots mantle celestia filecoin; do
  COUNT=$(curl -s --connect-timeout 3 "https://apply.workable.com/api/v1/widget/accounts/$slug" 2>/dev/null | python3 -c "import json,sys; d=json.load(sys.stdin); print(len(d.get('jobs',[])))" 2>/dev/null)
  if [ "$COUNT" != "" ] && [ "$COUNT" != "0" ]; then
    echo "  ✅ workable/$slug: $COUNT jobs"
  fi
done

echo ""
echo "=== SMARTRECRUITERS ==="
# SmartRecruiters public API
for slug in Chainalysis Circle Wintermute Bitstamp Ankr Ondo Scroll; do
  COUNT=$(curl -s --connect-timeout 3 "https://api.smartrecruiters.com/v1/companies/$slug/postings" 2>/dev/null | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('totalFound', 0))" 2>/dev/null)
  if [ "$COUNT" != "" ] && [ "$COUNT" != "0" ]; then
    echo "  ✅ smartrecruiters/$slug: $COUNT jobs"
  fi
done

echo ""
echo "=== BAMBOOHR ==="
# BambooHR public job board API
for slug in chainalysis circle wintermute bitstamp xapo ankr ondo scroll flashbots; do
  COUNT=$(curl -s --connect-timeout 3 "https://$slug.bamboohr.com/api/gateway.php/$slug/v1/applicant_tracking/jobs" 2>/dev/null | python3 -c "import json,sys; d=json.load(sys.stdin); print(len(d.get('result',[])))" 2>/dev/null)
  if [ "$COUNT" != "" ] && [ "$COUNT" != "0" ]; then
    echo "  ✅ bamboohr/$slug: $COUNT jobs"
  fi
done

echo ""
echo "=== RECRUITEE ==="
# Recruitee public API: https://COMPANY.recruitee.com/api/offers
for slug in chainalysis circle wintermute bitstamp xapo ankr ondo scroll; do
  COUNT=$(curl -s --connect-timeout 3 "https://$slug.recruitee.com/api/offers" 2>/dev/null | python3 -c "import json,sys; d=json.load(sys.stdin); print(len(d.get('offers',[])))" 2>/dev/null)
  if [ "$COUNT" != "" ] && [ "$COUNT" != "0" ]; then
    echo "  ✅ recruitee/$slug: $COUNT jobs"
  fi
done

echo ""
echo "=== DONE ==="
