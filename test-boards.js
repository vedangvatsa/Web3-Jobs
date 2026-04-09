const ghUrl = name => `https://boards-api.greenhouse.io/v1/boards/${name}/jobs?content=false`;
const lvUrl = name => `https://api.lever.co/v0/postings/${name}?mode=json`;

const boards = [
  'polygon', 'polygontechnology', 'opensea', 'optimism', 'chainlink', 'chainlinklabs', 'smartcontract',
  'matterlabs', 'zksync', 'circle', 'paxos', 'yugalabs', 'starkware', 'wintermute', 'dydx',
  'dydxopsdao', 'aave', 'gitcoin', 'protocollabs', 'filecoin', 'offchainlabs', 'arbitrum',
  'messari', 'dune', 'duneanalytics', 'zora', 'scroll', 'aztec', 'magic', 'magiclabs'
];

async function check() {
  for (const b of boards) {
    try {
      const gRes = await fetch(ghUrl(b));
      if (gRes.ok) console.log(`GH: ${b} exists`);
    } catch {}
    try {
      const lRes = await fetch(lvUrl(b));
      if (lRes.ok) console.log(`LV: ${b} exists`);
    } catch {}
  }
}
check();
