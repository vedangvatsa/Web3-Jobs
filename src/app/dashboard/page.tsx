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
  Percent,
} from 'lucide-react';

export const dynamic = 'force-static';
export const revalidate = 3600;

const titleSegment = 'Web3 & Stablecoin On-Chain Dashboard';
const socialTitle = seoSocialTitle(titleSegment);
const desc =
  'Compact real-time on-chain macro intelligence tracking $280B+ stablecoins, Visa Onchain Analytics, RWA tokenized Treasuries, and blockchain network velocity.';

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
        alt: 'Hashtag Web3 On-Chain Analytics Dashboard',
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
    name: 'Web3 & Stablecoin On-Chain Dashboard',
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
            {/* Header with inline provenance bar */}
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-3 mb-4 border-b border-border/60">
              <div>
                <PageHeader title="On-Chain & RWA Dashboard" />
                <p className="text-xs text-muted-foreground -mt-3">
                  Live institutional data synthesized from Visa Onchain Analytics, RWA.xyz, and DefiLlama
                </p>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground shrink-0">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Feeds
                </span>
                <span>•</span>
                <span>{data.updatedAt.split('T')[0]}</span>
              </div>
            </div>

            {/* Dense 6-Metric KPI Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mb-4">
              <div className="rounded-lg border border-border/70 bg-card p-3 shadow-none">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                  <span>Stablecoin Cap</span>
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
                  Institutional yield
                </div>
              </div>

              <div className="rounded-lg border border-border/70 bg-card p-3 shadow-none">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                  <span>Active Payers</span>
                  <TrendingUp className="h-3.5 w-3.5 text-blue-500" />
                </div>
                <div className="text-lg font-bold text-foreground leading-tight">
                  {data.overview.activePaymentAddresses30d.replace(' Million', 'M')}
                </div>
                <div className="text-[10px] text-muted-foreground mt-1">
                  Unique senders 30d
                </div>
              </div>

              <div className="rounded-lg border border-border/70 bg-card p-3 shadow-none">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                  <span>Bot Traffic Filter</span>
                  <ShieldCheck className="h-3.5 w-3.5 text-purple-500" />
                </div>
                <div className="text-lg font-bold text-foreground leading-tight">
                  {data.visaAnalytics.botFilteredRatio || '54.6%'}
                </div>
                <div className="text-[10px] text-muted-foreground mt-1">
                  Filtered non-organic
                </div>
              </div>

              <div className="rounded-lg border border-border/70 bg-card p-3 shadow-none">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                  <span>Top DeFi TVL</span>
                  <Layers className="h-3.5 w-3.5 text-indigo-500" />
                </div>
                <div className="text-lg font-bold text-foreground leading-tight">
                  {data.overview.totalDeFiTvl || '$56.4B'}
                </div>
                <div className="text-[10px] text-muted-foreground mt-1">
                  L1 & L2 locked capital
                </div>
              </div>
            </div>

            {/* Macro Visualizations: Segmented Distribution Bar & Dual Compact Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 mb-4">
              {/* Card 1: Stablecoins with Stacked Visual Bar */}
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

                {/* Stacked Visual Bar */}
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

                {/* Compact 2-column or list view of coins */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs">
                  {data.topStablecoins.map((coin) => (
                    <div key={coin.symbol} className="flex items-center justify-between py-1 border-b border-border/30 last:border-none">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: coin.color || '#10b981' }}
                        />
                        <span className="font-semibold text-foreground truncate">{coin.symbol}</span>
                        <span className="text-muted-foreground text-[11px] truncate hidden xs:inline">
                          ({coin.chains} ch)
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

              {/* Card 2: Settlement Blockchains with Stacked Visual Bar */}
              <Card className="border-border/70 bg-card shadow-none p-4">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-border/50">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    <h3 className="text-sm font-semibold text-foreground">Top Settlement Blockchains</h3>
                  </div>
                  <span className="text-[11px] text-muted-foreground">Stablecoin Velocity</span>
                </div>

                {/* Stacked Visual Bar */}
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

                {/* Compact list of chains */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs">
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

            {/* Tokenized Treasuries (RWA.xyz) & Visa Filter Metrics in 2 Dense Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 mb-4">
              {/* Left: Tokenized US Treasuries Table (Dense) */}
              <Card className="border-border/70 bg-card shadow-none p-4 lg:col-span-2">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/50">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-amber-500" />
                    <h3 className="text-sm font-semibold text-foreground">
                      Tokenized US Treasuries (RWA.xyz)
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

              {/* Right: Visa Onchain Analytics & Methodology (Dense Box) */}
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
                  <span>Sources: Visa · RWA.xyz · DefiLlama</span>
                  <a
                    href="https://visaonchainanalytics.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline text-primary"
                  >
                    Methodology →
                  </a>
                </div>
              </Card>
            </div>
          </PageShell>
        </main>
      </div>
    </>
  );
}
