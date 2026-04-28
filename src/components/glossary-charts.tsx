'use client';

/**
 * McKinsey-style SVG charts for glossary terms.
 * All data is fact-checked and from verifiable sources.
 */

interface BarChartData {
 label: string;
 value: number;
 color?: string;
}

interface BarChartProps {
 title: string;
 source: string;
 data: BarChartData[];
 unit?: string;
 maxValue?: number;
}

function BarChart({ title, source, data, unit = '', maxValue }: BarChartProps) {
 const max = maxValue || Math.max(...data.map(d => d.value)) * 1.1;
 const barHeight = 32;
 const gap = 12;
 const labelWidth = 140;
 const chartWidth = 500;
 const svgHeight = data.length * (barHeight + gap) + 60;
 const colors = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#1d4ed8', '#1e40af'];

 return (
  <div className="my-8 p-6 border rounded-lg bg-card">
   <h3 className="text-lg font-bold mb-1">{title}</h3>
   <p className="text-xs text-muted-foreground mb-4">Source: {source}</p>
   <svg viewBox={`0 0 ${labelWidth + chartWidth + 80} ${svgHeight}`} className="w-full" role="img" aria-label={title}>
    {data.map((d, i) => {
     const y = i * (barHeight + gap) + 10;
     const barW = (d.value / max) * chartWidth;
     const color = d.color || colors[i % colors.length];
     return (
      <g key={d.label}>
       <text x={labelWidth - 8} y={y + barHeight / 2 + 5} textAnchor="end" fontSize="12" fill="currentColor" className="fill-foreground">
        {d.label}
       </text>
       <rect x={labelWidth} y={y} width={barW} height={barHeight} rx={4} fill={color} opacity={0.85} />
       <text x={labelWidth + barW + 8} y={y + barHeight / 2 + 5} fontSize="12" fill="currentColor" className="fill-muted-foreground">
        {d.value.toLocaleString()}{unit}
       </text>
      </g>
     );
    })}
   </svg>
  </div>
 );
}

interface ComparisonTableProps {
 title: string;
 source: string;
 headers: string[];
 rows: string[][];
}

function ComparisonTable({ title, source, headers, rows }: ComparisonTableProps) {
 return (
  <div className="my-8 p-6 border rounded-lg bg-card">
   <h3 className="text-lg font-bold mb-1">{title}</h3>
   <p className="text-xs text-muted-foreground mb-4">Source: {source}</p>
   <div className="overflow-x-auto">
    <table className="w-full text-sm">
     <thead>
      <tr className="border-b-2 border-primary/20">
       {headers.map(h => (
        <th key={h} className="text-left py-2 px-3 font-semibold">{h}</th>
       ))}
      </tr>
     </thead>
     <tbody>
      {rows.map((row, i) => (
       <tr key={i} className="border-b border-muted">
        {row.map((cell, j) => (
         <td key={j} className={`py-2 px-3 ${j === 0 ? 'font-medium' : ''}`}>{cell}</td>
        ))}
       </tr>
      ))}
     </tbody>
    </table>
   </div>
  </div>
 );
}

/**
 * Chart data for specific glossary terms.
 * ALL data must be verifiable from public sources.
 */
const TERM_CHARTS: Record<string, JSX.Element[]> = {
 'blockchain': [
  <BarChart
   key="tps"
   title="Network Transaction Throughput (TPS)"
   source="Official documentation, 2024-2025"
   data={[
    { label: 'Solana', value: 4000 },
    { label: 'Sui', value: 2500 },
    { label: 'Avalanche', value: 4500 },
    { label: 'Polygon PoS', value: 700 },
    { label: 'Ethereum L1', value: 30 },
    { label: 'Bitcoin', value: 7 },
   ]}
   unit=" TPS"
  />,
  <ComparisonTable
   key="compare"
   title="Blockchain Consensus Comparison"
   source="Protocol documentation"
   headers={['Network', 'Consensus', 'Finality', 'Validators']}
   rows={[
    ['Bitcoin', 'Proof of Work', '~60 min', '~17,000 nodes'],
    ['Ethereum', 'Proof of Stake', '~13 min', '~1M validators'],
    ['Solana', 'Proof of History + PoS', '~0.4s', '~1,900'],
    ['Avalanche', 'Snowman Consensus', '~1s', '~1,700'],
    ['Polygon PoS', 'PoS (Tendermint)', '~2s', '~100'],
   ]}
  />,
 ],
 'consensus-layer': [
  <ComparisonTable
   key="consensus"
   title="Consensus Mechanism Tradeoffs"
   source="Protocol specifications"
   headers={['Mechanism', 'Security Model', 'Energy Use', 'Throughput']}
   rows={[
    ['Proof of Work', 'Computational cost', 'Very High', 'Low (7-30 TPS)'],
    ['Proof of Stake', 'Economic stake', 'Low', 'Medium (30-100 TPS)'],
    ['DPoS', 'Delegated stake', 'Low', 'High (1000+ TPS)'],
    ['PBFT', 'Voting rounds', 'Low', 'High (1000+ TPS)'],
    ['Proof of History', 'Verifiable delay', 'Medium', 'Very High (4000+ TPS)'],
   ]}
  />,
 ],
 'airdrop': [
  <BarChart
   key="airdrops"
   title="Notable Airdrop Values at Distribution"
   source="On-chain data, token prices at distribution"
   data={[
    { label: 'Uniswap (2020)', value: 1200 },
    { label: 'ENS (2021)', value: 5000 },
    { label: 'Optimism (2022)', value: 700 },
    { label: 'Arbitrum (2023)', value: 2000 },
    { label: 'Jito (2023)', value: 9000 },
    { label: 'Jupiter (2024)', value: 600 },
   ]}
   unit=" USD avg"
  />,
 ],
 'amm': [
  <BarChart
   key="amm-tvl"
   title="Top DEX Protocols by TVL (April 2025)"
   source="DefiLlama"
   data={[
    { label: 'Uniswap', value: 5200 },
    { label: 'Curve', value: 2100 },
    { label: 'Raydium', value: 1800 },
    { label: 'PancakeSwap', value: 1600 },
    { label: 'Aerodrome', value: 1400 },
   ]}
   unit="M"
  />,
 ],
 'smart-contract': [
  <ComparisonTable
   key="langs"
   title="Smart Contract Languages by Ecosystem"
   source="Developer documentation"
   headers={['Language', 'Blockchain', 'Type System', 'Turing Complete']}
   rows={[
    ['Solidity', 'Ethereum, L2s', 'Static', 'Yes'],
    ['Vyper', 'Ethereum', 'Static', 'Yes (limited)'],
    ['Rust', 'Solana, Near', 'Static', 'Yes'],
    ['Move', 'Sui, Aptos', 'Static, linear', 'Yes'],
    ['Cairo', 'StarkNet', 'Static', 'Yes'],
    ['Plutus', 'Cardano', 'Functional', 'Yes'],
   ]}
  />,
 ],
 'defi': [
  <BarChart
   key="defi-categories"
   title="DeFi TVL by Category (April 2025)"
   source="DefiLlama"
   data={[
    { label: 'Liquid Staking', value: 35000 },
    { label: 'Lending', value: 28000 },
    { label: 'DEXs', value: 18000 },
    { label: 'Bridge', value: 8000 },
    { label: 'CDP', value: 7000 },
    { label: 'Yield', value: 5000 },
   ]}
   unit="M"
  />,
 ],
 'liquidity-mining': [
  <ComparisonTable
   key="yields"
   title="Liquidity Mining Reward Structures"
   source="Protocol documentation"
   headers={['Protocol', 'Reward Token', 'Emission Model', 'Vesting']}
   rows={[
    ['Compound', 'COMP', 'Fixed daily rate', 'None'],
    ['Uniswap V3', 'UNI (historical)', 'Per-pool allocation', 'None'],
    ['Curve', 'CRV', 'Gauge-weighted', '1yr linear'],
    ['Aave', 'AAVE', 'Safety module staking', 'None'],
    ['Sushiswap', 'SUSHI', 'Block rewards', '6mo lock (2/3)'],
   ]}
  />,
 ],
 'proof-of-stake': [
  <BarChart
   key="staking"
   title="ETH Staked Over Time (millions)"
   source="Etherscan beacon chain data"
   data={[
    { label: 'Dec 2020', value: 1 },
    { label: 'Dec 2021', value: 8 },
    { label: 'Dec 2022', value: 15 },
    { label: 'Dec 2023', value: 28 },
    { label: 'Dec 2024', value: 34 },
   ]}
   unit="M ETH"
  />,
 ],
 'dao': [
  <ComparisonTable
   key="daos"
   title="Major DAO Treasuries"
   source="DeepDAO, on-chain data (Q1 2025)"
   headers={['DAO', 'Treasury', 'Members', 'Governance']}
   rows={[
    ['Uniswap', '~$2.5B', '350K+', 'Token voting'],
    ['Arbitrum', '~$3.5B', '600K+', 'Token voting + council'],
    ['Lido', '~$400M', '30K+', 'Token voting'],
    ['Aave', '~$200M', '150K+', 'Token voting'],
    ['MakerDAO', '~$1.2B', '80K+', 'Token voting + delegates'],
   ]}
  />,
 ],
 'nft': [
  <BarChart
   key="nft-volume"
   title="Monthly NFT Trading Volume 2024 (USD Millions)"
   source="DappRadar, The Block"
   data={[
    { label: 'Jan 2024', value: 900 },
    { label: 'Mar 2024', value: 1200 },
    { label: 'Jun 2024', value: 500 },
    { label: 'Sep 2024', value: 400 },
    { label: 'Dec 2024', value: 700 },
   ]}
   unit="M"
  />,
 ],
};

export function GlossaryCharts({ termSlug }: { termSlug: string }) {
 const charts = TERM_CHARTS[termSlug];
 if (!charts || charts.length === 0) return null;

 return (
  <div className="mt-8 mb-4">
   <div className="flex items-center gap-2 mb-4">
    <div className="h-px flex-1 bg-border" />
    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Data & Analysis</span>
    <div className="h-px flex-1 bg-border" />
   </div>
   {charts}
  </div>
 );
}
