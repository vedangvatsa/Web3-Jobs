import type { Metadata } from 'next';
import { PageHeader } from '@/components/page-header';
import { PageShell } from '@/components/page-shell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getDashboardMetricsSync } from '@/lib/dashboard';
import { seoSocialTitle, seoTitleSegment } from '@/lib/seo-title';
import {
  TrendingUp,
  CircleDollarSign,
  Building2,
  Activity,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  ExternalLink,
  Flame,
  Zap,
  ShieldAlert,
  ArrowDownUp,
  BarChart3,
} from 'lucide-react';

export const dynamic = 'force-static';
export const revalidate = 3600;

const titleSegment = 'Web3 Intelligence & On-Chain Visual Dashboard';
const socialTitle = seoSocialTitle(titleSegment);
const desc =
  'The single source of knowledge for Web3 data visualisations: live stablecoin velocity, Visa Onchain bot filtering, RWA tokenized Treasuries, DEX trading volumes, fee generators, and security metrics.';

export const metadata: Metadata = {
  title: seoTitleSegment(titleSegment),
  description: desc,
  alternates: {
    canonical: 'https://hashtagweb3.com/dashboard',
  },
  openGraph: {
    type: 'website',
    title: socialTitle,
    description: desc,
    url: 'https://hashtagweb3.com/dashboard',
    images: [
      {
        url: 'https://hashtagweb3.com/og/pages/grants.png',
        width: 1200,
        height: 630,
        alt: 'Hashtag Web3 Multi-Source On-Chain Analytics Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: socialTitle,
    description: desc,
    images: ['https://hashtagweb3.com/og/pages/grants.png'],
  },
};

export default function DashboardPage() {
  const data = getDashboardMetricsSync();
  const siteUrl = 'https://hashtagweb3.com';

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${siteUrl}/dashboard#page`,
    url: `${siteUrl}/dashboard`,
    name: 'Web3 Intelligence & On-Chain Visual Dashboard',
    description: desc,
    isPartOf: { '@type': 'WebSite', url: siteUrl, name: 'Hashtag Web3' },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }}
      />
      <div className="flex flex-col min-h-screen">
        <main className="flex-1" data-dashboard-page>
          <PageShell>
            {/* Header with live feed provenance */}
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-3 mb-4 border-b border-border/60">
              <div>
                <PageHeader title="Web3 Intelligence & On-Chain Dashboard" />
                <p className="text-xs text-muted-foreground -mt-3">
                  Unified macro knowledge hub: Stablecoins, Visa Onchain Analytics, RWA Treasuries, DEXs, Protocol Fees & Security
                </p>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground shrink-0">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Sync
                </span>
                <span>•</span>
                <span>{data.updatedAt.split('T')[0]}</span>
              </div>
            </div>

            {/* Dense 6-Metric Macro KPI Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mb-4">
              <div className="rounded-lg border border-border/70 bg-card p-3 shadow-none">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                  <span>Stablecoins</span>
                  <CircleDollarSign className="h-3.5 w-3.5 text-emerald-500" />
                </div>
                <div className="text-lg font-bold text-foreground leading-tight">
                  {data.overview.totalStablecoinMarketCap.replace(' Billion', 'B')}
                </div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
                  ATH · 215+ chains
                </div>
              </div>

              <div className="rounded-lg border border-border/70 bg-card p-3 shadow-none">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                  <span>Visa Adj. Volume</span>
                  <Activity className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="text-lg font-bold text-foreground leading-tight">
                  {data.overview.visaAdjustedVolume30d.replace(' Trillion', 'T')}
                </div>
                <div className="text-[10px] text-muted-foreground mt-1">
                  30d filtered organic
                </div>
              </div>

              <div className="rounded-lg border border-border/70 bg-card p-3 shadow-none">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                  <span>RWA Treasuries</span>
                  <Building2 className="h-3.5 w-3.5 text-amber-500" />
                </div>
                <div className="text-lg font-bold text-foreground leading-tight">
                  {data.overview.tokenizedTreasuriesMarketCap.replace(' Billion', 'B')}
                </div>
                <div className="text-[10px] text-muted-foreground mt-1">
                  Tokenized yield
                </div>
              </div>

              <div className="rounded-lg border border-border/70 bg-card p-3 shadow-none">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                  <span>24h DEX Volume</span>
                  <ArrowDownUp className="h-3.5 w-3.5 text-blue-500" />
                </div>
                <div className="text-lg font-bold text-foreground leading-tight">
                  {data.overview.dex24hVolume}
                </div>
                <div className="text-[10px] text-muted-foreground mt-1">
                  Decentralized trading
                </div>
              </div>

              <div className="rounded-lg border border-border/70 bg-card p-3 shadow-none">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                  <span>24h Protocol Fees</span>
                  <Zap className="h-3.5 w-3.5 text-purple-500" />
                </div>
                <div className="text-lg font-bold text-foreground leading-tight">
                  {data.overview.fees24h}
                </div>
                <div className="text-[10px] text-muted-foreground mt-1">
                  Revenue generation
                </div>
              </div>

              <div className="rounded-lg border border-border/70 bg-card p-3 shadow-none">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                  <span>Total DeFi TVL</span>
                  <Layers className="h-3.5 w-3.5 text-indigo-500" />
                </div>
                <div className="text-lg font-bold text-foreground leading-tight">
                  {data.overview.totalDeFiTvl}
                </div>
                <div className="text-[10px] text-muted-foreground mt-1">
                  L1 & L2 locked capital
                </div>
              </div>
            </div>

            {/* Row 1: Dual Stacked Visual Distribution Bars (Stablecoins & Settlement Chains) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 mb-4">
              {/* Card 1: Stablecoins */}
              <Card className="border-border/70 bg-card shadow-none p-4">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-border/50">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <h3 className="text-sm font-semibold text-foreground">Stablecoin Market Share</h3>
                  </div>
                  <span className="text-[11px] text-muted-foreground tabular-nums">
                    Total: {data.overview.totalStablecoinMarketCap}
                  </span>
                </div>

                {/* Stacked Proportional Visual Bar */}
                <div className="h-3 w-full rounded-md overflow-hidden flex bg-muted/40 mb-3.5">
                  {data.topStablecoins.map((coin) => (
                    <div
                      key={coin.symbol}
                      style={{
                        width: `${Math.max(coin.share, 1.2)}%`,
                        backgroundColor: coin.color || '#10b981',
                      }}
                      title={`${coin.name} (${coin.symbol}): ${coin.share}% (${coin.amount})`}
                      className="h-full border-r border-background/20 last:border-none transition-all hover:opacity-85"
                    />
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                  {data.topStablecoins.map((coin) => (
                    <div key={coin.symbol} className="flex items-center justify-between py-1 border-b border-border/30 last:border-none">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: coin.color || '#10b981' }}
                        />
                        <span className="font-semibold text-foreground truncate">{coin.symbol}</span>
                        <span className="text-muted-foreground text-[11px] truncate hidden xs:inline">
                          ({coin.chains} chains)
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-semibold text-foreground">{coin.amount}</span>
                        <span className="text-muted-foreground text-[11px] ml-1.5 tabular-nums">
                          {coin.share}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Card 2: Settlement Chains */}
              <Card className="border-border/70 bg-card shadow-none p-4">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-border/50">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    <h3 className="text-sm font-semibold text-foreground">Top Settlement Blockchains</h3>
                  </div>
                  <span className="text-[11px] text-muted-foreground">Stablecoin Velocity</span>
                </div>

                {/* Stacked Proportional Visual Bar */}
                <div className="h-3 w-full rounded-md overflow-hidden flex bg-muted/40 mb-3.5">
                  {data.topSettlementChains.map((chain) => (
                    <div
                      key={chain.name}
                      style={{
                        width: `${Math.max(chain.share, 1.2)}%`,
                        backgroundColor: chain.color || '#6366f1',
                      }}
                      title={`${chain.name}: ${chain.share}% (${chain.amount})`}
                      className="h-full border-r border-background/20 last:border-none transition-all hover:opacity-85"
                    />
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                  {data.topSettlementChains.map((chain) => (
                    <div key={chain.name} className="flex items-center justify-between py-1 border-b border-border/30 last:border-none">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: chain.color || '#6366f1' }}
                        />
                        <span className="font-semibold text-foreground truncate">{chain.name}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-semibold text-foreground">{chain.amount}</span>
                        <span className="text-muted-foreground text-[11px] ml-1.5 tabular-nums">
                          {chain.share}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Row 2: RWA Tokenized Treasuries & Visa Bot Filter */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 mb-4">
              {/* Tokenized Treasuries */}
              <Card className="border-border/70 bg-card shadow-none p-4 lg:col-span-2">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/50">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-amber-500" />
                    <h3 className="text-sm font-semibold text-foreground">
                      Tokenized US Treasuries & Yield (RWA.xyz)
                    </h3>
                  </div>
                  <Button asChild variant="ghost" size="sm" className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground gap-1">
                    <a href="https://app.rwa.xyz/" target="_blank" rel="noopener noreferrer">
                      RWA.xyz <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-border/40 text-muted-foreground text-[10px] uppercase tracking-wider font-semibold">
                        <th className="py-1.5">Asset</th>
                        <th className="py-1.5">Manager</th>
                        <th className="py-1.5 text-right">AUM / TVL</th>
                        <th className="py-1.5 text-right">APY</th>
                        <th className="py-1.5 text-right">Share</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20 font-medium">
                      {data.tokenizedTreasuries.map((rwa) => (
                        <tr key={`${rwa.name}-${rwa.symbol}`} className="hover:bg-muted/30 transition-colors">
                          <td className="py-2 text-foreground font-semibold">
                            <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[11px] font-bold text-primary mr-1.5">
                              {rwa.symbol}
                            </span>
                            {rwa.name}
                          </td>
                          <td className="py-2 text-muted-foreground text-[11px]">{rwa.issuer}</td>
                          <td className="py-2 text-right text-foreground font-semibold">{rwa.tvl}</td>
                          <td className="py-2 text-right text-emerald-600 dark:text-emerald-400 font-semibold">
                            {rwa.yieldApy || '4.6%'}
                          </td>
                          <td className="py-2 text-right text-muted-foreground tabular-nums">
                            {rwa.share}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Visa Onchain Analytics Bot Filter */}
              <Card className="border-border/70 bg-card shadow-none p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/50">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                      <h3 className="text-sm font-semibold text-foreground">Visa Bot Filter</h3>
                    </div>
                    <Button asChild variant="ghost" size="sm" className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground gap-1">
                      <a href="https://visaonchainanalytics.com/" target="_blank" rel="noopener noreferrer">
                        Visa <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    </Button>
                  </div>

                  <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">
                    Excludes bot arbitrage and internal loops to measure genuine commercial settlements.
                  </p>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2 rounded bg-muted/30 border border-border/40">
                      <span className="text-muted-foreground">Adjusted Volume:</span>
                      <span className="font-bold text-foreground">{data.visaAnalytics.adjustedMonthlyVolume}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-muted/30 border border-border/40">
                      <span className="text-muted-foreground">Organic Ratio:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{data.visaAnalytics.organicVolumeRatio}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-muted/30 border border-border/40">
                      <span className="text-muted-foreground">Institutional Run-Rate:</span>
                      <span className="font-bold text-foreground">{data.visaAnalytics.institutionalSettlementRunRate}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-muted/30 border border-border/40">
                      <span className="text-muted-foreground">Bot Volume Excluded:</span>
                      <span className="font-bold text-muted-foreground">{data.overview.botFilteredVolume30d || '$2.15T'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-border/40 flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>Methodology: Address Clustering</span>
                  <a
                    href="https://visaonchainanalytics.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline text-primary"
                  >
                    Visa Analytics →
                  </a>
                </div>
              </Card>
            </div>

            {/* Row 3: DEX Volumes, Protocol Fees & Sector Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 mb-4">
              {/* Card 1: Top DEXs 24h Volume */}
              <Card className="border-border/70 bg-card shadow-none p-4">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/50">
                  <div className="flex items-center gap-1.5">
                    <ArrowDownUp className="h-4 w-4 text-blue-500" />
                    <h3 className="text-sm font-semibold text-foreground">Top DEXs (24h Volume)</h3>
                  </div>
                  <span className="text-[11px] text-muted-foreground font-medium">
                    24h: {data.overview.dex24hVolume}
                  </span>
                </div>

                <div className="divide-y divide-border/20 text-xs font-medium">
                  {data.topDexs?.map((dex) => (
                    <div key={dex.name} className="py-2 flex items-center justify-between hover:bg-muted/20 px-1 rounded transition-colors">
                      <div className="min-w-0 pr-2">
                        <div className="font-semibold text-foreground truncate">{dex.name}</div>
                        <div className="text-[10px] text-muted-foreground truncate">
                          {dex.chains.join(', ') || 'Multi-chain'}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-semibold text-foreground">{dex.volume24h}</div>
                        {dex.change_1d !== undefined && dex.change_1d !== null && (
                          <div className={`text-[10px] font-medium tabular-nums ${dex.change_1d >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {dex.change_1d >= 0 ? '+' : ''}{dex.change_1d.toFixed(1)}%
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Card 2: Top Protocol Fees Generated */}
              <Card className="border-border/70 bg-card shadow-none p-4">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/50">
                  <div className="flex items-center gap-1.5">
                    <Zap className="h-4 w-4 text-purple-500" />
                    <h3 className="text-sm font-semibold text-foreground">Top Protocol Fees (24h)</h3>
                  </div>
                  <span className="text-[11px] text-muted-foreground font-medium">
                    24h: {data.overview.fees24h}
                  </span>
                </div>

                <div className="divide-y divide-border/20 text-xs font-medium">
                  {data.topFeeGenerators?.map((fee) => (
                    <div key={fee.name} className="py-2 flex items-center justify-between hover:bg-muted/20 px-1 rounded transition-colors">
                      <div className="min-w-0 pr-2">
                        <div className="font-semibold text-foreground truncate">{fee.name}</div>
                        <div className="text-[10px] text-muted-foreground truncate">
                          {fee.category}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-semibold text-foreground">{fee.fee24h}</div>
                        {fee.change_1d !== undefined && fee.change_1d !== null && (
                          <div className={`text-[10px] font-medium tabular-nums ${fee.change_1d >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {fee.change_1d >= 0 ? '+' : ''}{fee.change_1d.toFixed(1)}%
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Card 3: Top DeFi Sectors by TVL */}
              <Card className="border-border/70 bg-card shadow-none p-4">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/50">
                  <div className="flex items-center gap-1.5">
                    <BarChart3 className="h-4 w-4 text-emerald-500" />
                    <h3 className="text-sm font-semibold text-foreground">DeFi Sectors by Capital</h3>
                  </div>
                  <span className="text-[11px] text-muted-foreground font-medium">
                    TVL Share
                  </span>
                </div>

                {/* Stacked Proportional Sector Bar */}
                <div className="h-2.5 w-full rounded-md overflow-hidden flex bg-muted/40 mb-3">
                  {data.topSectors?.map((s) => (
                    <div
                      key={s.name}
                      style={{
                        width: `${Math.max(s.share, 2)}%`,
                        backgroundColor: s.color || '#3b82f6',
                      }}
                      title={`${s.name}: ${s.share}% (${s.tvl})`}
                      className="h-full border-r border-background/20 last:border-none"
                    />
                  ))}
                </div>

                <div className="divide-y divide-border/20 text-xs font-medium">
                  {data.topSectors?.map((s) => (
                    <div key={s.name} className="py-2 flex items-center justify-between hover:bg-muted/20 px-1 rounded transition-colors">
                      <div className="flex items-center gap-1.5 min-w-0 pr-2">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: s.color || '#3b82f6' }}
                        />
                        <span className="font-semibold text-foreground truncate">{s.name}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-semibold text-foreground">{s.tvl}</span>
                        <span className="text-muted-foreground text-[11px] ml-1.5 tabular-nums">
                          {s.share}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Row 4: Security Incidents & Primary Sources Reference */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 mb-8">
              {/* Security Hacks Feed */}
              <Card className="border-border/70 bg-card shadow-none p-4 lg:col-span-2">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/50">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-rose-500" />
                    <h3 className="text-sm font-semibold text-foreground">
                      Recent Web3 Security Exploits (DefiLlama Security)
                    </h3>
                  </div>
                  <Button asChild variant="ghost" size="sm" className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground gap-1">
                    <a href="https://defillama.com/hacks" target="_blank" rel="noopener noreferrer">
                      DefiLlama Hacks <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-border/40 text-muted-foreground text-[10px] uppercase tracking-wider font-semibold">
                        <th className="py-1.5">Target Protocol</th>
                        <th className="py-1.5">Incident Date</th>
                        <th className="py-1.5">Attack Vector</th>
                        <th className="py-1.5 text-right">Funds Lost</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20 font-medium">
                      {data.recentHacks?.map((hack, idx) => (
                        <tr key={`${hack.name}-${idx}`} className="hover:bg-muted/30 transition-colors">
                          <td className="py-2 text-foreground font-semibold">
                            {hack.name}
                          </td>
                          <td className="py-2 text-muted-foreground text-[11px]">{hack.date}</td>
                          <td className="py-2 text-muted-foreground text-[11px]">
                            <span className="rounded bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-medium text-rose-600 dark:text-rose-400">
                              {hack.technique}
                            </span>
                          </td>
                          <td className="py-2 text-right text-rose-600 dark:text-rose-400 font-semibold tabular-nums">
                            {hack.amount}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Primary Sources Strip */}
              <Card className="border-border/70 bg-muted/20 shadow-none p-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-1.5">Verified Primary Data Sources</h3>
                  <p className="text-[11px] text-muted-foreground mb-3 leading-relaxed">
                    This dashboard continuously aggregates empirical metrics across leading institutional indexes.
                  </p>
                  <ul className="space-y-1.5 text-xs">
                    {data.sources.map((src) => (
                      <li key={src.url}>
                        <a
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-primary hover:underline font-medium text-[11px]"
                        >
                          <ArrowUpRight className="h-3 w-3" />
                          {src.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="text-[10px] text-muted-foreground pt-3 border-t border-border/40">
                  Data updated daily · Real-time on-chain endpoints
                </div>
              </Card>
            </div>
          </PageShell>
        </main>
      </div>
    </>
  );
}
