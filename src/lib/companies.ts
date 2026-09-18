import type { Company, Job } from '@/types';
import { getJobs } from './jobs';
import { loadStaticJson } from './load-static-json';
import { COMPANY_RICH_ABOUT } from './company-profiles';
import { cleanJobLocation } from './job-location';

interface CompanyContent {
 website?: string;
}

/**
 * Known ATS/job board hostnames that should NOT be used as company websites
 */
const ATS_HOSTNAMES = new Set([
 'jobs.gohire.io', 'gohire.io',
 'jobs.lever.co', 'jobs.ashbyhq.com', 'job-boards.greenhouse.io',
 'boards.greenhouse.io', 'coinbase.getro.com', 'jobs.multicoin.capital',
 'jobs.solana.com', 'jobs.dragonfly.xyz', 'www.linkedin.com',
 'circle.wd1.myworkdayjobs.com', 'apply.workable.com',
 'jobs.smartrecruiters.com', 'getro.com', 'ats.rippling.com',
 'www.comeet.com', 'wellfound.com',
 'in.linkedin.com', 'sg.linkedin.com', 'il.linkedin.com',
 'de.linkedin.com', 'my.linkedin.com', 'eg.linkedin.com',
 'careers.tangem.com', 'jobs-us.pwc.com', 'careers.franklintempleton.com',
]);

const ATS_HOSTNAME_SUFFIXES = [
 '.gohire.io', '.ashbyhq.com', '.bamboohr.com', '.breezy.hr', '.comeet.com',
 '.greenhouse.io', '.lever.co', '.myworkdayjobs.com', '.rippling.com',
 '.smartrecruiters.com', '.teamtailor.com', '.traffit.com', '.workable.com',
];

function isAtsHostname(hostname: string): boolean {
 const normalized = hostname.toLowerCase();
 if (
   normalized.includes('notion.site') ||
   normalized.includes('zohorecruit') ||
   normalized.includes('greetinghr.com') ||
   normalized.includes('hibob.com') ||
   normalized.includes('deel.com') ||
   normalized.includes('herp.careers') ||
   normalized.includes('omnihr.co') ||
   normalized.includes('freshteam.com') ||
   normalized.includes('instahyre.com') ||
   normalized.includes('hurma.work') ||
   normalized.includes('jobs.hashed.com')
 ) {
   return true;
 }
 return ATS_HOSTNAMES.has(normalized)
  || ATS_HOSTNAME_SUFFIXES.some((suffix) => normalized.endsWith(suffix));
}

function sanitizeCompanyDomain(url: URL): string {
  let hostname = url.hostname.toLowerCase();
  // Strip subdomains like careers., recruit., jobs., job., career. if followed by root domain
  const parts = hostname.split('.');
  if (parts.length >= 3 && ['careers', 'recruit', 'jobs', 'job', 'career', 'project'].includes(parts[0])) {
    hostname = parts.slice(1).join('.');
  }
  return `${url.protocol}//${hostname}`;
}

/**
 * Hardcoded website overrides for major Web3 companies
 * whose job posts point to standard ATS boards.
 */
const COMPANY_WEBSITE_OVERRIDES: Record<string, string> = {
  '1inch': 'https://1inch.com',
  '1inch-network': 'https://1inch.com',
  'agora': 'https://www.agora.finance',
  'agora-finance': 'https://www.agora.finance',
 'optimism': 'https://www.oplabs.co',
 'op-labs': 'https://www.oplabs.co',
 'oplabs': 'https://www.oplabs.co',
 'block': 'https://block.xyz',
 'a16z': 'https://a16z.com',
 'a16z-crypto': 'https://a16zcrypto.com',
 'zama': 'https://zama.ai',
 'tether': 'https://tether.to',
 'etoro': 'https://etoro.com',
 'streamingfast': 'https://streamingfast.io',
 'etherscan': 'https://etherscan.io',
 'caladan': 'https://caladan.com',
 'ethereum-institutional': 'https://ethereuminstitutional.org',
 'openzeppelin': 'https://openzeppelin.com',
 'ripple': 'https://ripple.com',
 'complyadvantage': 'https://complyadvantage.com',
 'starknet': 'https://www.starknet.org',
 'foundation': 'https://buildwithfoundation.com',
 'jejememe': 'https://jejememe.com',
 'hyperithm': 'https://hyperithm.jp',
 'injective-labs': 'https://injective.com',
 'injective': 'https://injective.com',
 'loco': 'https://loco.gg',
 'merkle-trade': 'https://merkle.trade',
 'oneplanet': 'https://oneplanetnft.io',
 'subzero-labs': 'https://subzerolabs.org',
 'taiko-labs': 'https://taiko.xyz',
 'taiko': 'https://taiko.xyz',
 'aptos-labs': 'https://aptoslabs.com',
 'covalent': 'https://covalenthq.com',
 'halliday': 'https://halliday.xyz',
 'mythical-games': 'https://mythicalgames.com',
 'dfns': 'https://dfns.co',
 'stockal': 'https://stockal.com',
 'whitebit': 'https://whitebit.com',
 'hyperbolic-ai-web3': 'https://hyperbolic.xyz',
 'consensys-metamask': 'https://consensys.io',
 'arbitrum-offchain-labs': 'https://offchainlabs.com',
 'kalshi': 'https://kalshi.com',
 'cyber': 'https://cyber.co',
 'aztec-labs-privacy-l2': 'https://aztec.network',
 'aztec-labs': 'https://aztec.network',
 'dune': 'https://dune.com',
 'dune-analytics': 'https://dune.com',
 'dr-now': 'https://doctornow.co.kr',
 'drnow': 'https://doctornow.co.kr',
 'vivident': 'https://vivident.xyz',
 'tangem': 'https://tangem.com',
 'kappa-lab': 'https://kappalab.io',
 'kappa-lab-ltd': 'https://kappalab.io',
 'kappalab': 'https://kappalab.io',
 'kappalab-ltd': 'https://kappalab.io',
 'kucoin': 'https://www.kucoin.com',
 'revolut': 'https://www.revolut.com',
 'wintermute': 'https://wintermute.com',
 'wintermute-trading': 'https://wintermute.com',
 'sky-mavis': 'https://skymavis.com',
 'monad-foundation': 'https://monad.xyz',
 'monad': 'https://monad.xyz',
 'monad-labs': 'https://monad.xyz',
 'digitalassetcorp': 'https://digitalasset.com',
 'alpen-labs': 'https://alpenlabs.io',
 'alpenlabs': 'https://alpenlabs.io',
 'meow': 'https://meow.com',
 'gsr': 'https://gsr.io',
 'gsr-markets': 'https://gsr.io',
 'gsrmarkets': 'https://gsr.io',
 'biti': 'https://biti.com',
 'xapo-bank': 'https://xapobank.com',
 'xapo': 'https://xapobank.com',
 'xapo61': 'https://xapobank.com',
 'ondo-finance': 'https://ondo.finance',
 'consensys': 'https://consensys.io',
 'zeta': 'https://zetachain.com',
 'ondo': 'https://ondo.finance',
 'ondofinance': 'https://ondo.finance',
 'toku': 'https://toku.com',
 'animoca': 'https://animocabrands.com',
 'animoca-brands': 'https://animocabrands.com',
 'animocabrands': 'https://animocabrands.com',
 'swan': 'https://swanbitcoin.com',
 'bnb-chain': 'https://www.bnbchain.org',
 'bnbchain': 'https://www.bnbchain.org',
 'pioneer-services': 'https://www.bnbchain.org',
 'pancakeswap': 'https://pancakeswap.finance',
 'aster': 'https://www.asterdex.com',
 'asterdex': 'https://www.asterdex.com',
 'delta': 'https://www.delta.exchange',
 'delta-exchange': 'https://www.delta.exchange',
 'hashkey': 'https://group.hashkey.com',
 'hashkey-group': 'https://group.hashkey.com',
 'osl': 'https://osl.com',
 'matrixport': 'https://www.matrixport.com',
 'the-sandbox': 'https://www.sandbox.game',
 'sandbox': 'https://www.sandbox.game',
 'moca-network': 'https://www.mocaverse.xyz',
 'mocaverse': 'https://www.mocaverse.xyz',
 'bitflyer': 'https://bitflyer.com',
 'coincheck': 'https://coincheck.com',
 'gmo-coin': 'https://coin.gmo.jp',
 'sbi-vc-trade': 'https://www.sbivc.co.jp',
 'mercoin': 'https://about.mercoin.com',
 'rakuten-wallet': 'https://www.rakuten-wallet.co.jp',
 'bitbank': 'https://bitbank.cc',
 'bittrade': 'https://www.bittrade.co.jp',
 'zaif': 'https://zaif.jp',
 'bitpoint': 'https://www.bitpoint.co.jp',
 'dmm-bitcoin': 'https://bitcoin.dmm.com',
 'foundry': 'https://foundrydigital.com',
 'grayscale': 'https://grayscale.com',
 'grayscale-investments': 'https://grayscale.com',
 'bitget': 'https://www.bitget.com',
 'ambergroup': 'https://www.ambergroup.io',
 'amber-group': 'https://www.ambergroup.io',
 'kiln': 'https://www.kiln.fi',
 'ramp-network': 'https://ramp.network',
 'everstake': 'https://everstake.one',
 'coinmarketcap': 'https://coinmarketcap.com',
 'cointelegraph': 'https://cointelegraph.com',
 'beincrypto': 'https://beincrypto.com',
 'the-block': 'https://www.theblock.co',
 'theblock': 'https://www.theblock.co',
 'trm-labs': 'https://www.trmlabs.com',
 'trmlabs': 'https://www.trmlabs.com',
 'particle-network': 'https://particle.network',
 'particle': 'https://particle.network',
 'hashport': 'https://hashport.io',
 'ginco': 'https://www.ginco.co.jp',
 'valr': 'https://www.valr.com',
 'yellow-card': 'https://yellowcard.io',
 'yellowcard': 'https://yellowcard.io',
 'bitnob': 'https://bitnob.com',
 'bitmama': 'https://bitmama.io',
 'quidax': 'https://www.quidax.io',
 'canza-finance': 'https://www.canzafinance.com',
 'fonbnk': 'https://www.fonbnk.com',
 'nestcoin': 'https://www.nestcoin.com',
 'nala': 'https://www.nala.com',
 'kotani-pay': 'https://kotani.co',
 'aza-finance': 'https://azafinance.com',
 'flutterwave': 'https://flutterwave.com',
 'paystack': 'https://paystack.com',
 'chipper-cash': 'https://www.chippercash.com',
 'chippercash': 'https://www.chippercash.com',
 'certik': 'https://certik.com',
 'impossiblecloud': 'https://impossiblecloud.com',
 'veda': 'https://veda.tech',
 'gate': 'https://gate.io',
 'gateio': 'https://gate.io',
 'gemini': 'https://gemini.com',
 'skymavis': 'https://skymavis.com',
 'shakepay': 'https://shakepay.com',
 'bitpanda': 'https://bitpanda.com',
 'bitso': 'https://bitso.com',
 'luno': 'https://luno.com',
 'bob': 'https://gobob.xyz',
 'delphi': 'https://delphidigital.io',
 'avalabs': 'https://avax.network',
 'parity': 'https://parity.io',
 'sei-labs': 'https://sei.io',
 'symbiotic-restaking': 'https://symbiotic.fi',
 'wynd-labs': 'https://www.wyndlabs.ai',
 'grass-wynd-labs-depin': 'https://www.wyndlabs.ai',
 'wynd-network': 'https://www.wyndlabs.ai',
 'liminal': 'https://www.liminalcustody.com',
 'liminal-custody': 'https://www.liminalcustody.com',
 'liminal-custody-tech': 'https://www.liminalcustody.com',
 'strategy': 'https://www.strategy.com',
 'microstrategy': 'https://www.strategy.com',
 'pwc': 'https://www.pwc.com',
 'pricewaterhousecoopers': 'https://www.pwc.com',
 'franklin-templeton': 'https://www.franklintempleton.com',
 'artemis': 'https://artemis.xyz',
 'safe': 'https://safe.global',
 'orderly': 'https://orderly.network',
 'navi': 'https://naviprotocol.io',
 'xhunt': 'https://xhunt.ai',
 'wincent': 'https://wincent.io',
 'moonpay': 'https://moonpay.com',
 'magiceden': 'https://magiceden.io',
 'phantom': 'https://phantom.app',
 'circle': 'https://circle.com',
 'ramp': 'https://ramp.network',
 'coingecko': 'https://coingecko.com',
 'bitgo': 'https://bitgo.com',
 'helius': 'https://helius.dev',
 'mystenlabs': 'https://mystenlabs.com',
 'mysten': 'https://mystenlabs.com',
 'securitize': 'https://securitize.io',
 'paxos': 'https://paxos.com',
 'elliptic': 'https://elliptic.co',
 'anchorage': 'https://anchorage.com',
 'fireblocks': 'https://fireblocks.com',
 'brave': 'https://brave.com',
 'layerzero': 'https://layerzero.network',
 'layerzerolabs': 'https://layerzero.network',
 'zksync': 'https://zksync.io',
 'offchainlabs': 'https://offchainlabs.com',
 'arbitrum': 'https://arbitrum.io',
 'jito-labs': 'https://jito.network',
 'opensea': 'https://opensea.io',
 'aptoslabs': 'https://aptoslabs.com',
 'aptos': 'https://aptoslabs.com',
 'bastion': 'https://bastion.com',
 'worldcoin': 'https://worldcoin.org',
 'morpho': 'https://morpho.org',
 'morpho-labs': 'https://morpho.org',
 'alchemy': 'https://alchemy.com',
 'talos': 'https://talos.com',
 'talos-trading': 'https://talos.com',
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
 'coinflow': 'https://coinflow.cash',
 'oasis-network': 'https://oasisprotocol.org',
 'figure': 'https://www.figure.com',
 'figure-technologies': 'https://www.figure.com',
 'aligned-layer': 'https://www.aligned.team',
 'aligned': 'https://www.aligned.team',
 'bullish': 'https://bullish.com',
 'coindesk': 'https://www.coindesk.com',
 'vana': 'https://www.vana.org',
 'gelato-network': 'https://www.gelato.network',
 'weex': 'https://www.weex.com',
 'impossible-cloud': 'https://www.impossiblecloud.com',
 'bitkub': 'https://www.bitkub.com',
 'bob-build-on-bitcoin': 'https://www.gobob.xyz',
 'wincent-market-maker': 'https://wincent.com',
 'navi-protocol': 'https://www.naviprotocol.io',
 'artemis-analytics': 'https://artemis.xyz',
 'uniswap-labs': 'https://uniswap.org',
 'xt-com-exchange': 'https://www.xt.com',
 'marketnode': 'https://www.marketnode.com',
 'szns': 'https://szns.io',
 'impossible-finance': 'https://impossible.finance',
 'ritual': 'https://ritual.net',
 'nomic-foundation': 'https://nomic.foundation',
 'nomic': 'https://nomic.foundation',
 'nomicfoundation': 'https://nomic.foundation',
 'mantra-chain': 'https://www.mantrachain.io',
 'lightning-labs': 'https://lightning.engineering',
 'turnkey': 'https://www.turnkey.com',
 'swan-bitcoin': 'https://www.swanbitcoin.com',
 'allium': 'https://www.allium.so',
 'solflare': 'https://solflare.com',
 'fun-xyz': 'https://fun.xyz',
 'coinhako': 'https://www.coinhako.com',
 'ether-fi': 'https://www.ether.fi',
 'ndax': 'https://ndax.io',
 'keyrock': 'https://keyrock.com',
 'harmony': 'https://harmony.one',
 'somnia': 'https://somnia.network',
 'bitcoin-com': 'https://www.bitcoin.com',
 'grvt': 'https://grvt.io',
 '0g-labs': 'https://0g.ai',
 'crystal-intelligence': 'https://crystalintelligence.com',
 'category-labs': 'https://category.xyz',
 'strike': 'https://strike.me',
 'braiins': 'https://braiins.com',
 'waterfall': 'https://waterfall.network',
 'uphold': 'https://uphold.com',
 'daylight': 'https://daylight.xyz',
 'coinme': 'https://coinme.com',
 'telcoin': 'https://telcoin.com',
 'anza': 'https://anza.xyz',
 'doublezero': 'https://doublezero.xyz',
 'syndica': 'https://syndica.io',
 'provable-aleo': 'https://provable.com',
 'symbiotic': 'https://symbiotic.fi',
 'starknet-foundation': 'https://starknet.io',
 'ethereum-foundation': 'https://ethereum.org',
 'copper-co': 'https://copper.co',
 
 'serotonin': 'https://serotonin.co',
 'io-global': 'https://iohk.io',
 'aztec': 'https://aztec.network',
 'goldsky': 'https://goldsky.com',
 'newton': 'https://www.newton.co',
 'renegade': 'https://renegade.fi',
 'sahara-ai': 'https://saharaai.com',
 'stargate-foundation': 'https://stargate.finance',
 'superstate': 'https://superstate.co',
 'relay': 'https://relay.link',
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
 'fleek': 'https://www.fleek.sh',
 'lens-protocol': 'https://lens.xyz',
 'delphi-digital': 'https://delphidigital.io',
 'trezor': 'https://trezor.io',
 'across-protocol': 'https://across.to',
 'mudrex': 'https://mudrex.com',
 'bitfinex': 'https://www.bitfinex.com',
 'unocoin': 'https://www.unocoin.com',
 'zebpay': 'https://zebpay.com',
};

/**
 * Create a URL-safe slug from company name
 */
function createSlug(companyName: string): string {
 return companyName
  .toLowerCase()
  .replace(/[’'"]/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .replace(/-+/g, '-');
}

function buildListingDescription(companyName: string, jobs: Job[]): string {
 const countLabel = jobs.length === 1 ? '1 active role' : `${jobs.length} active roles`;
 const titles = [...new Set(jobs.map((job) => job.title.trim()).filter(Boolean))].slice(0, 3);
 const locations = [...new Set(jobs.map((job) => cleanJobLocation(job.location)).filter((value): value is string => Boolean(value) && value !== 'Remote'))].slice(0, 3);

 if (titles.length === 0) {
  return `${companyName} currently has no active roles listed on Hashtag Web3.`;
 }

 const titleSummary = `Current openings include ${titles.join(', ')}.`;
 const locationSummary = locations.length > 0
  ? ` Listed locations include ${locations.join(', ')}.`
  : '';

 return `${companyName} has ${countLabel} listed on Hashtag Web3. ${titleSummary}${locationSummary}`;
}

function buildRichDescription(companyName: string, jobs: Job[], rich: string): string {
 return rich;
}

function getSafeProfileWebsite(value: unknown): string | undefined {
 if (typeof value !== 'string' || !value.trim()) return undefined;

 try {
  const url = new URL(value.trim());
  if (!['http:', 'https:'].includes(url.protocol) || isAtsHostname(url.hostname)) {
   return undefined;
  }
  return value.trim();
 } catch {
  return undefined;
 }
}

type CompanyProfileRow = { website?: string; description?: string };

interface PrecomputedCompany {
  slug: string;
  name: string;
  website: string;
  description: string;
  jobCount: number;
  lastUpdated: string;
  jobIds: string[];
}

let companyProfilesMap: Record<string, CompanyProfileRow> | null = null;
let companiesRuntimeMap: Record<string, PrecomputedCompany> | null = null;
let companiesCatalogLoad: Promise<void> | null = null;

async function ensureCompaniesCatalog(): Promise<void> {
  if (companyProfilesMap && companiesRuntimeMap) return;
  if (!companiesCatalogLoad) {
    companiesCatalogLoad = Promise.all([
      loadStaticJson<Record<string, PrecomputedCompany>>('companies-runtime.json'),
      loadStaticJson<Record<string, CompanyProfileRow>>('company-profiles-runtime.json'),
    ])
      .then(([runtime, profiles]) => {
        companiesRuntimeMap = runtime || {};
        companyProfilesMap = profiles || {};
      })
      .catch(() => {
        companiesRuntimeMap = {};
        companyProfilesMap = {};
      });
  }
  await companiesCatalogLoad;
}

async function loadCompanyContent(slug: string): Promise<{ website?: string; description?: string } | null> {
  await ensureCompaniesCatalog();
  const profile = companyProfilesMap![slug.toLowerCase().trim()];
  if (!profile) return null;
  const website = getSafeProfileWebsite(profile.website);
  return {
    ...(website && { website }),
    ...(profile.description && { description: profile.description }),
  };
}

/**
 * Normalize company name for matching
 */
function normalizeCompanyName(name: string): string {
  const lower = name.toLowerCase().trim();
  if (lower.includes('offchain') || lower.includes('arbitrum')) {
    return 'arbitrum';
  }
  if (lower.includes('aztec')) {
    return 'aztec';
  }
  if (lower.includes('symbiotic')) {
    return 'symbiotic';
  }
  if (lower.includes('wynd')) {
    return 'wynd-labs';
  }
  if (lower.includes('helius')) {
    return 'helius';
  }
  if (lower.includes('liminal')) {
    return 'liminal';
  }
  if (lower === 'strategy' || lower === 'microstrategy' || lower.includes('microstrategy')) {
    return 'strategy';
  }
  if (lower === 'pwc' || lower.includes('pricewaterhousecoopers') || lower.startsWith('pwc ')) {
    return 'pwc';
  }
  if (lower.includes('franklin') || lower.includes('templeton')) {
    return 'franklin-templeton';
  }
  if (lower.startsWith('ritual') || lower.includes('ritual')) {
    return 'ritual';
  }
  if (lower.includes('nomic')) {
    return 'nomic-foundation';
  }
  if (lower === 'a16z' || lower.includes('a16z')) {
    return 'a16z-crypto';
  }
  if (lower.includes('apex')) {
    return 'apex-protocol';
  }
  if (lower.includes('injective')) {
    return 'injective-labs';
  }
  if (lower.includes('jito')) {
    return 'jito-labs';
  }
  if (lower.includes('uniswap')) {
    return 'uniswap-labs';
  }
  if (lower.includes('certik')) {
    return 'certik';
  }
  return name
   .toLowerCase()
   .replace(/\s+inc\.?$/i, '')
   .replace(/\s+ltd\.?$/i, '')
   .replace(/\s+llc\.?$/i, '')
   .replace(/\s+corp\.?$/i, '')
   .replace(/\s+labs?$/i, '')
   .replace(/[^a-z0-9]/g, '')
   .trim();
}

function resolveCanonicalCompanyName(normalized: string, originalName: string): string {
  if (normalized === 'arbitrum') return 'Offchain Labs';
  if (normalized === 'aztec') return 'Aztec Labs';
  if (normalized === 'symbiotic') return 'Symbiotic';
  if (normalized === 'wynd-labs') return 'Wynd Labs';
  if (normalized === 'helius') return 'Helius';
  if (normalized === 'liminal') return 'Liminal Custody';
  if (normalized === 'strategy') return 'Strategy';
  if (normalized === 'pwc') return 'PwC';
  if (normalized === 'franklin-templeton') return 'Franklin Templeton';
  if (normalized === 'ritual') return 'Ritual';
  if (normalized === 'nomic-foundation') return 'Nomic Foundation';
  if (normalized === 'op-labs' || normalized === 'oplabs') return 'Optimism';
  if (normalized === 'a16z-crypto') return 'a16z crypto';
  if (normalized === 'apex-protocol') return 'ApeX Protocol';
  if (normalized === 'injective-labs') return 'Injective Labs';
  if (normalized === 'jito-labs') return 'Jito Labs';
  if (normalized === 'uniswap-labs') return 'Uniswap Labs';
  if (normalized === 'certik') return 'CertiK';
  return originalName;
}

/**
 * Extract unique companies from precomputed runtime data
 */
export async function getCompanies(): Promise<Company[]> {
  await ensureCompaniesCatalog();
  const list = Object.values(companiesRuntimeMap!).sort((a, b) => b.jobCount - a.jobCount);
  return list.map((pre) => ({
    slug: pre.slug,
    name: pre.name,
    website: pre.website,
    description: pre.description,
    jobCount: pre.jobCount,
    lastUpdated: pre.lastUpdated,
    jobs: [],
  }));
}

/**
 * Get a single company by slug using precomputed runtime data
 */
export async function getCompanyBySlug(slug: string): Promise<Company | null> {
  await ensureCompaniesCatalog();
  const norm = slug.toLowerCase().trim();
  const pre = companiesRuntimeMap![norm] || companiesRuntimeMap![norm.replace(/-labs$|-foundation$|-crypto$/, '')];
  if (pre) {
    const jobs = await getJobs();
    const idSet = new Set(pre.jobIds);
    const companyJobs = jobs.filter((j) => (j.id && idSet.has(j.id)) || (Boolean(j.slug) && idSet.has(j.slug!)) || idSet.has(j.link));

    return {
      slug: pre.slug,
      name: pre.name,
      website: pre.website,
      description: pre.description,
      jobCount: pre.jobCount,
      lastUpdated: pre.lastUpdated,
      jobs: companyJobs,
    };
  }

  const content = (await loadCompanyContent(slug)) || (await loadCompanyContent(slug.replace(/-labs$|-foundation$|-crypto$/, '')));
  const richDesc = COMPANY_RICH_ABOUT[slug] || COMPANY_RICH_ABOUT[slug.replace(/-labs$|-foundation$|-crypto$/, '')];
  
  if (content || richDesc || COMPANY_WEBSITE_OVERRIDES[slug]) {
    const formattedName = slug
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
    const website = COMPANY_WEBSITE_OVERRIDES[slug] || content?.website || `https://${slug.replace(/-labs$|-foundation$|-crypto$/, '')}.com`;
    const description = richDesc || content?.description || `${formattedName} is a leading Web3 & blockchain organization. There are currently no active job openings listed.`;
    
    return {
      slug,
      name: formattedName,
      website,
      jobCount: 0,
      jobs: [],
      lastUpdated: new Date().toISOString(),
      description,
    };
  }

  return null;
}
