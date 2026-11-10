/**
 * Shared quality gate and geo helpers for Luma imports.
 *
 * Used by scripts/sync-luma-crypto-events.ts (geo hub sync) and
 * scripts/sync-luma-discover-cities.ts (per-city discover pages).
 */
import { normalizeCountry } from '../../src/lib/events';

export const SPAMMY =
  /earn (crypto|money|income)|passive income|get rich|financial freedom|trading signal|forex|scam|live zoom|webinar|100x|millionaire|double your|guaranteed (profit|return)/i;
export const NON_WEB3 =
  /bodywork|breakup|badminton|pilates|pottery|baking|cooking class|ibm storage|user group event|keychains|film festival|mental health|climate action|charcha|impact-|viksit bharat|career crisis|international generalist|nyfw|jrat qvc|finissage|wellness & networking|ripple making|for kids|for families|children|toddler|outdoor workout|reform room|wind take you|data jam|electronics and computing|ssis|culture club|bestie|charming|yoga|meditation retreat|dog walk|cat cafe/i;
export const WEB3_VOCAB =
  /crypto|bitcoin|btc\b|ethereum|\beth\b|ethglobal|ethcc|blockchain|web ?3|defi|nfts?|solana|dao|token2049|xrp|ripple|zk\b|zksync|zero.?knowledge|superteam|pragma|hyperliquid|onchain|on-chain|lido|polygon|arbitrum|optimism|base chain|coinbase|binance|airdrop|wallet|dapp|smart contract|layer ?2|metaverse|gamefi|staking|yield|digital asset|decentralized|cardano|cosmos|polkadot|monad|aptos|\bsui\b|chainlink|devcon|breakpoint|kbw|ibw|unchained|founders? dinner|vip dinner|afterparty|rooftop|networking|mixer|side event|coworking|co-working|launchpad|happy hour|lounge|meetup|hackathon|hacker ?house|builder ?house|buidl|solidity|uniswap|aave|makerdao|starknet|near protocol|near\b|toncoin|\bton\b|encode|trading|stablecoin|perp|dex\b|rwa|depin|vc\b|investor|capital|finance onchain|tradfi|web3/i;

export const WEB3_STRONG =
  /crypto|cryptocurrency|bitcoin|btc\b|ethereum|\beth\b|ethglobal|ethcc|blockchain|web ?3|defi|nfts?|solana|dao\b|token2049|xrp\b|ripple|zk\b|zksync|superteam|pragma\b|hyperliquid|onchain|on-chain|polygon|arbitrum|optimism|coinbase|binance|airdrop|wallet|smart contract|layer ?2|starknet|monad\b|aptos|\bsui\b|chainlink|devcon|breakpoint|kbw|ibw|unchained|hackathon|hacker ?house|builder ?house|buidl|solidity|uniswap|aave|makerdao|near protocol|\bnear\b|toncoin|encode club|founders? dinner|afterparty|side event|coworking.*web3|web3.*coworking|tradfi.*onchain|onchain.*finance|perp|dex\b|rwa\b|depin|stablecoin|digital asset|decentralized finance|metamask|trezor|bitcoin only|lightning network/i;

export const WEAK_ONLY =
  /networking|mixer|happy hour|meetup|investor|vc\b|venture capital|capital forum|biotech|k-pop|mahj|margs|corgi|working moms|movie night|kindergarten|stripe developer|ruby coworking|cyber ladies|autonomy in motion|drone|uav|hardware meetup|lp series|realtor|junk-a-haulics|geo meetup|coworking day|female founders circle|life sciences|parent mixer|top golf|neurotech(?!.*web3)|financial networking|broker happy hour|code & coffee/i;

/**
 * Crypto vocabulary Luma uses in event titles and organiser copy: exchange and
 * infrastructure brands, protocol names and non-English spellings. The category
 * pages tag loosely, so the organiser copy is checked as well as the title.
 */
export const CRYPTO_CONTEXT =
  /binance|\bbnb\b|okx|mexc|bitget|bybit|bitfinex|kraken|bitstamp|kucoin|\bhtx\b|gate\.io|crypto\.com|\bbnb\b|tether|\busdt\b|\busdc\b|\badai\b|fdusd|p2p\.?(?:org|me)|coincover|nexchange|fireblocks|halborn|pubkey|canton network|building on canton|avalanche|neo[- ]?cypherpunk|uniswap|uni ?tour|kyber|celestia|osmosis|eigenlayer|eigenfi|ether\.?fi|zkevm|zero knowledge|restaking|restake|paymaster|memecoin|\bape\b|opensea|magic eden|walletconnect|phantom wallet|bitdevs|\bbird\b|\bnest\b|cypherpunk|satoshi|\bhalving\b|proof of stake|proof of work|testnet|mainnet|hard fork|\btoken\b|tokens|tokeni[sz]|digital asset|virtual asset|decentrali[sz]|\bdefi\b|\bnft\b|\bdao\b|web ?3|blockchain|smart contract|on[- ]?chain|\bdapp|airdrop|\bico\b|\bido\b|launchpad|ledger|trezor|metamask|chainlink|\bpolkadot\b|\bcardano\b|\bcosmos\b|\baptos\b|\bsui\b|\bmonad\b|\bnear\b|\bton\b|\btaproot\b|\bsegwit\b|\bln\b|\bltc\b|\beth\b|\bbtc\b|\bxrp\b|\bxlm\b|\bxtz\b|\balgo\b|\bhbar\b|\bfil\b|\bflow\b|\bnear\b|暗号資産|暗号通貨|暗号資産|加密货币|加密貨幣|加密资产|加密資產|虚拟资产|虚拟資產|虛擬資產|數位資產|數字資產|數字资产|區塊鏈|区块链|比特币|比特币|トークン|비트코인|암호화폐|블록체인|kripto|kryptowährung|kryptowährungen|kritowährung|cripto|criptomoeda|cripto's? currencies|criptoativo|criptocurrency|cripto's?|cripto\b|cryptos?\b|крипто|kripto|kriptograf|mittelkrypto/i;

export type LumaGeo = {
  city?: string | null;
  country?: string;
  country_code?: string;
  full_address?: string;
  address?: string;
  short_address?: string;
  sublocality?: string;
  region?: string;
  city_state?: string;
  postal_code?: string;
  mode?: string;
};

export type LumaApiEvent = {
  api_id: string;
  name: string;
  start_at: string;
  end_at?: string;
  url: string;
  cover_url?: string | null;
  social_image_url?: string | null;
  location_type?: string;
  visibility?: string;
  geo_address_info?: LumaGeo;
  geo_address_visibility?: string;
  timezone?: string;
  calendar_api_id?: string;
  coordinate?: { latitude?: number; longitude?: number };
};

/** True when the title or organiser copy carries an explicit Web3/crypto signal. */
export function hasWeb3Signal(value: string): boolean {
  return WEB3_STRONG.test(value) || CRYPTO_CONTEXT.test(value);
}

/**
 * Reject spam, off-topic and weak-only listings before they reach the catalog.
 * The organiser copy is optional: when present it can supply the Web3 signal.
 */
export function passesQuality(e: LumaApiEvent, description?: string): boolean {
  const name = e.name || '';
  const body = description || '';
  if (SPAMMY.test(name) || SPAMMY.test(body)) return false;
  if (NON_WEB3.test(name)) return false;
  const signal = hasWeb3Signal(name) || (body ? hasWeb3Signal(body) : false);
  if (!signal) return false;
  if (WEAK_ONLY.test(name) && !hasWeb3Signal(name)) return false;
  if (e.location_type === 'online' && !/\b(zoom|online|virtual)\b/i.test(name)) return false;
  if (/participant list/i.test(name)) return false;
  return true;
}

export const LUMA_CITY_ALIASES: Record<string, string> = {
  'krung thep maha nakhon': 'Bangkok',
  'krung thep': 'Bangkok',
  'กรุงเทพมหานคร': 'Bangkok',
  'hong kong island': 'Hong Kong',
  kowloon: 'Hong Kong',
};

/** Luma often leaves geo.city null; locality lives in region, sublocality, or full_address. */
export function extractLumaCity(geo: LumaGeo): string {
  if (geo.city?.trim()) return geo.city.trim();
  const country = (geo.country || '').trim();
  const countryCode = geo.country_code?.toUpperCase();
  if (country === 'Hong Kong' || countryCode === 'HK') return 'Hong Kong';

  for (const key of [geo.city_state?.split(',')[0], geo.sublocality, geo.region]) {
    if (!key?.trim()) continue;
    const normalized = key.trim().toLowerCase();
    if (LUMA_CITY_ALIASES[normalized]) return LUMA_CITY_ALIASES[normalized];
    if (normalized.includes('krung thep')) return 'Bangkok';
  }

  const full = geo.full_address || geo.address || '';
  if (/krung thep maha nakhon|กรุงเทพ/i.test(full)) return 'Bangkok';
  if (/,\s*central,\s*hong kong|\bwan chai\b|\btsim sha tsui\b|,\s*kowloon\b/i.test(full)) return 'Hong Kong';
  if (country === 'Thailand' && /\bbangkok\b/i.test(full)) return 'Bangkok';

  return '';
}

export const LUMA_VIRTUAL_LOCATION: Record<string, string> = {
  online: 'Online',
  virtual: 'Online',
  discord: 'Online (Discord)',
  zoom: 'Online (Zoom)',
  meet: 'Online (Google Meet)',
};

export function lumaVirtualLocationLabel(e: LumaApiEvent): string | null {
  const type = (e.location_type || '').toLowerCase();
  return LUMA_VIRTUAL_LOCATION[type] ?? null;
}

export function buildLocation(e: LumaApiEvent): { city: string; country: string; location: string } {
  const virtual = lumaVirtualLocationLabel(e);
  if (virtual) {
    return { city: '', country: '', location: virtual };
  }
  const geo = e.geo_address_info || {};
  const city = extractLumaCity(geo);
  const country = normalizeCountry(geo.country || geo.country_code || '');
  const venue = (geo.full_address || geo.address || '').trim();
  const location =
    venue || (city && country ? `${city}, ${country}` : city || country || 'TBA');
  return { city, country, location };
}
