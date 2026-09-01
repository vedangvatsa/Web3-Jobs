import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const cache = JSON.parse(fs.readFileSync("content/jobs-cache.json", "utf8"));
const uniqueCompanies = [...new Set(cache.map(j => j.company))];

// Hardcoded company website map from lib/companies.ts
const OVERRIDES = {
  'nethermind': 'https://nethermind.io',
  'dydx': 'https://dydx.exchange',
  'matter-labs': 'https://matter-labs.io',
  'status': 'https://status.im',
  'ledger': 'https://ledger.com',
  'immutable': 'https://immutable.com',
  'gauntlet': 'https://gauntlet.xyz',
  'blockworks': 'https://blockworks.co',
  'ava-labs': 'https://avalabs.org',
  'hedera-hashgraph': 'https://hedera.com',
  'jito-foundation': 'https://jito.network',
  'jito': 'https://jito.network',
  'tenderly': 'https://tenderly.co',
  'flow-blockchain': 'https://flow.com',
  'shapeshift': 'https://shapeshift.com',
  'river-financial': 'https://river.com',
  'walletconnect': 'https://walletconnect.com',
  'solana-labs': 'https://solana.com',
  'merkle-science': 'https://merklescience.com',
  'zerion': 'https://zerion.io',
  'hyperbolic': 'https://hyperbolic.xyz',
  'switchboard': 'https://switchboard.xyz',
  'avalanche': 'https://avax.network',
  'nasdaq': 'https://nasdaq.com',
  'improbable': 'https://improbable.io',
  'sfox': 'https://sfox.com',
  'sonic': 'https://soniclabs.com',
  'bitvavo': 'https://bitvavo.com',
  'venice': 'https://venice.ai',
  'parity-technologies': 'https://www.parity.io',
  'blockaid': 'https://blockaid.io',
  'zone': 'https://zone.network',
  'altonomy': 'https://www.altonomy.com',
  'apex': 'https://apex.win',
  'cinch': 'https://cinch.co',
  'swipe-io': 'https://swipe.io',
  'alphapoint': 'https://alphapoint.com',
  'onmeta': 'https://onmeta.in',
  'rise': 'https://risework.co',
  'utila': 'https://utila.io',
  'bitpay': 'https://bitpay.com',
  'spearbit': 'https://spearbit.com',
  'gomining': 'https://gomining.com',
  'bitdeer': 'https://www.bitdeer.com',
  'crypto-finance': 'https://www.crypto-finance.com',
  'offchain-labs': 'https://www.offchain.io',
  'hut-8': 'https://hut8.com',
  'blockstream': 'https://blockstream.com',
  'riot-platforms': 'https://www.riotplatforms.com',
  'crypto-com': 'https://crypto.com',
  'straitsx': 'https://www.straitsx.com',
  'zero-hash': 'https://zerohash.com',
  'ajaib-crypto': 'https://ajaib.co.id',
  'digital-asset': 'https://www.digitalasset.com',
  'nexo': 'https://nexo.com',
  'fasset': 'https://fasset.com',
  'plasma': 'https://plasma.org',
  'sui-foundation': 'https://sui.io',
  'p2p-org': 'https://p2p.org',
  'validation-cloud': 'https://validationcloud.io',
  'woo-network': 'https://woo.org',
  'cryptio': 'https://cryptio.co',
  'luxor-technology': 'https://luxor.tech',
  'hyperliquid-labs': 'https://hyperliquid.xyz',
  'espresso-systems': 'https://www.espressosys.com',
  'aurora': 'https://aurora.dev',
  'coinjar': 'https://www.coinjar.com',
  'world-foundation': 'https://worldcoin.org',
  'apex-protocol': 'https://apex.exchange',
  'ethglobal': 'https://ethglobal.com',
  'chronicle-labs': 'https://chroniclelabs.org',
  'cow-dao': 'https://cow.fi',
  '21shares': 'https://21shares.com',
  'filecoin-foundation': 'https://fil.org',
  'zetachain': 'https://www.zetachain.com',
  'pyth-network': 'https://pyth.network',
  'paribu': 'https://www.paribu.com',
  'eclipse': 'https://www.eclipse.xyz',
  'saga': 'https://saga.xyz',
  'swissborg': 'https://swissborg.com',
  'plume-network': 'https://www.plumenetwork.xyz',
  'compound': 'https://compound.finance',
  'giottus': 'https://www.giottus.com',
  'bitoasis': 'https://bitoasis.net',
  'union': 'https://union.build',
  'coindcx': 'https://coindcx.com',
  'indodax': 'https://indodax.com',
  'starkware': 'https://starkware.co',
  'amina-bank': 'https://aminabank.com',
  'drivewealth': 'https://drivewealth.com',
  'prime-intellect': 'https://www.primeintellect.ai',
  'socket': 'https://socket.tech',
  'parallel': 'https://parallel.life',
  'fleek': 'https://fleek.xyz',
  'delphi-digital': 'https://delphidigital.io',
  'trezor': 'https://trezor.io',
  'across-protocol': 'https://across.to',
  'mudrex': 'https://mudrex.com',
  'bitfinex': 'https://www.bitfinex.com',
  'unocoin': 'https://www.unocoin.com',
  'zebpay': 'https://zebpay.com',
  'kalshi': 'https://kalshi.com',
  'toku': 'https://toku.com',
  'airtm': 'https://airtm.com',
  'the-tie': 'https://thetie.io',
  'stronghold': 'https://stronghold.co',
  'sei-labs': 'https://seilabs.io',
  'bastion': 'https://bastion.com',
  'beam': 'https://beam.online',
  'brale': 'https://brale.xyz',
  'caladan': 'https://caladan.xyz',
  'dakota': 'https://dakota.xyz',
  'elwood-technologies': 'https://elwood.io',
  'genies': 'https://genies.com',
  'groma': 'https://groma.com',
  'horizon': 'https://horizon.io',
  'injective-labs': 'https://injective.com',
  'jito-labs': 'https://jito.wtf',
  'localcoin': 'https://localcoinatm.com',
  'logos': 'https://logos.co',
  'molecule': 'https://molecule.to',
  'partisia-blockchain': 'https://partisiablockchain.com',
  'vesta': 'https://vestafinance.xyz',
  'yeet': 'https://yeet.com',
  'fuse-energy': 'https://fuseenergy.com',
  'breederdao': 'https://breederdao.io',
  'interchain-foundation': 'https://interchain.io',
  'ethena-labs': 'https://ethena.fi',
  'arbitrum-opco': 'https://arbitrum.io'
};

function createSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function getWebsite(company, slug) {
  if (OVERRIDES[slug]) return OVERRIDES[slug];
  const compJobs = cache.filter(j => j.company === company);
  const link = compJobs[0]?.link;
  if (link) {
    try {
      const u = new URL(link);
      if (!u.hostname.includes('ashbyhq') && !u.hostname.includes('greenhouse') && !u.hostname.includes('lever') && !u.hostname.includes('workable')) {
        return `${u.protocol}//${u.hostname}`;
      }
    } catch(e) {}
  }
  return `https://${slug}.com`;
}

async function run() {
  let downloaded = 0;
  for (const company of uniqueCompanies) {
    const slug = createSlug(company);
    const targetFile = path.join(process.cwd(), 'public/logo/companies', `${slug}.png`);
    
    if (!fs.existsSync(targetFile)) {
      const site = getWebsite(company, slug);
      try {
        const host = new URL(site).hostname;
        const favUrl = `https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${host}&size=128`;
        const res = await fetch(favUrl);
        if (res.ok) {
          const buffer = await res.buffer();
          if (buffer.length > 500) { // Valid image check
            fs.writeFileSync(targetFile, buffer);
            downloaded++;
            console.log(`Saved logo for ${company} (${slug}.png)`);
          }
        }
      } catch(e) {
        console.error(`Failed logo for ${company}:`, e.message);
      }
    }
  }
  console.log(`\nSuccessfully downloaded and saved ${downloaded} static company logos to public/logo/companies/!`);
}

run();
