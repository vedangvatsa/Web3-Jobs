/**
 * Keyword classifier for crypto/web3 job titles and descriptions (ATS refresh + audits).
 */
const WEB3_TERMS = [
  'web3',
  'web 3',
  'blockchain',
  'crypto',
  'cryptocurrency',
  'bitcoin',
  'btc',
  'ethereum',
  'solana',
  'defi',
  'de-fi',
  'nft',
  'smart contract',
  'solidity',
  'zero knowledge',
  'zk-',
  ' zk ',
  'layer 2',
  'layer2',
  'l2 ',
  'on-chain',
  'onchain',
  'tokenization',
  'tokenisation',
  'digital asset',
  'stablecoin',
  'metamask',
  'dapp',
  'dapps',
  'decentralized',
  'decentralised',
  'validator',
  'staking',
  'rollup',
  'mev',
  'dex',
  'dao',
  'cefi',
  'web3.',
];

function scoreWeb3(text: string): { score: number; terms: string[] } {
  const lower = text.toLowerCase();
  const terms: string[] = [];
  let score = 0;
  for (const term of WEB3_TERMS) {
    if (lower.includes(term)) {
      terms.push(term);
      score += term.length > 6 || term.includes(' ') ? 2 : 1;
    }
  }
  if (/\b(solidity|defi|blockchain|web3|smart contract)\b/i.test(text)) score += 2;
  return { score, terms: [...new Set(terms)] };
}

export type Web3JobClassification = { web3: boolean; score: number; terms: string[] };

export function isWeb3Job(title: string, body: string): Web3JobClassification {
  const titleScore = scoreWeb3(title);
  const bodyScore = scoreWeb3(body);
  const score = titleScore.score * 2 + bodyScore.score;
  const terms = [...new Set([...titleScore.terms, ...bodyScore.terms])];
  const web3 = score >= 3 || (titleScore.score >= 2 && bodyScore.score >= 1);
  return { web3, score, terms };
}

/** @param mode strict = higher bar for mixed traditional employers (e.g. consulting banks). */
export function passesWeb3TitleFilter(
  mode: boolean | 'strict' | undefined,
  title: string,
  body: string,
): boolean {
  if (!mode) return true;
  const { web3, score } = isWeb3Job(title, body);
  if (!web3) return false;
  if (mode === 'strict') return score >= 6;
  return true;
}