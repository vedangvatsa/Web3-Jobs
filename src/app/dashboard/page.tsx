import type { Metadata } from 'next';
import { PageHeader } from '@/components/page-header';
import { PageShell } from '@/components/page-shell';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CommunityFeedBanner } from '@/components/community-feed-banner';
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
} from 'lucide-react';

export const dynamic = 'force-static';
export const revalidate = 3600;

const titleSegment = 'Web3 & Stablecoin On-Chain Dashboard';
const socialTitle = seoSocialTitle(titleSegment);
const desc =
  'Real-time on-chain macro intelligence tracking $280B+ stablecoin settlement volumes, Visa Onchain Analytics, RWA tokenized US Treasuries, and blockchain network velocity.';

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
            <PageHeader title="On-Chain & RWA Dashboard" />

            <div className="text-sm font-medium text-muted-foreground -mt-4 mb-6">
              Empirical on-chain settlement data synthesized from{' '}
              <a
                href="https://visaonchainanalytics.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground hover:underline"
              >
                Visa Onchain Analytics
              </a>
              ,{' '}
              <a
                href="https://app.rwa.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground hover:underline"
              >
                RWA.xyz
              </a>
              , and{' '}
              <a
                href="https://defillama.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground hover:underline"
              >
                DefiLlama
              </a>
              .
            </div>

            {/* Macro KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card className="border-border/70 bg-card shadow-none p-4">
                <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-2">
                  <span>Stablecoin Market Cap</span>
                  <CircleDollarSign className="h-4 w-4 text-emerald-500" />
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {data.overview.totalStablecoinMarketCap}
                </div>
                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <span className="text-emerald-500 font-medium">All-time record</span> across 215+ chains
                </div>
              </Card>

              <Card className="border-border/70 bg-card shadow-none p-4">
                <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-2">
                  <span>Visa Adjusted 30d Volume</span>
                  <Activity className="h-4 w-4 text-primary" />
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {data.overview.visaAdjustedVolume30d}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Filtered organic consumer & commercial flows
                </div>
              </Card>

              <Card className="border-border/70 bg-card shadow-none p-4">
                <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-2">
                  <span>Tokenized US Treasuries</span>
                  <Building2 className="h-4 w-4 text-amber-500" />
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {data.overview.tokenizedTreasuriesMarketCap}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Institutional on-chain yield (RWA.xyz)
                </div>
              </Card>

              <Card className="border-border/70 bg-card shadow-none p-4">
                <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-2">
                  <span>Active Payment Wallets</span>
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {data.overview.activePaymentAddresses30d}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Monthly unique sending addresses
                </div>
              </Card>
            </div>

            {/* Visual Bar Graphs: Stablecoin Dominance & Settlement Chains */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Stablecoin Market Share */}
              <Card className="border-border/70 bg-card shadow-none p-5">
                <CardHeader className="p-0 pb-4 border-b border-border/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-semibold text-foreground">
                        Stablecoin Supply Distribution
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Total circulating fiat-backed digital dollars
                      </p>
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                      Market Share
                    </span>
                  </div>
                </CardHeader>

                <div className="pt-4 space-y-3.5">
                  {data.topStablecoins.map((coin) => (
                    <div key={coin.symbol}>
                      <div className="flex items-baseline justify-between text-xs mb-1">
                        <span className="font-medium text-foreground">
                          {coin.name} ({coin.symbol})
                        </span>
                        <div className="space-x-2">
                          <span className="font-semibold text-foreground">{coin.amount}</span>
                          <span className="text-muted-foreground tabular-nums">({coin.share}%)</span>
                        </div>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted/60 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-500"
                          style={{ width: `${Math.min(coin.share, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Top Settlement Blockchains */}
              <Card className="border-border/70 bg-card shadow-none p-5">
                <CardHeader className="p-0 pb-4 border-b border-border/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-semibold text-foreground">
                        Top Settlement Blockchains
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Circulating stablecoins by base network
                      </p>
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                      Network Share
                    </span>
                  </div>
                </CardHeader>

                <div className="pt-4 space-y-3.5">
                  {data.topSettlementChains.map((chain) => (
                    <div key={chain.name}>
                      <div className="flex items-baseline justify-between text-xs mb-1">
                        <span className="font-medium text-foreground">{chain.name}</span>
                        <div className="space-x-2">
                          <span className="font-semibold text-foreground">{chain.amount}</span>
                          <span className="text-muted-foreground tabular-nums">({chain.share}%)</span>
                        </div>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted/60 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                          style={{ width: `${Math.min(chain.share, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Tokenized Treasuries Breakdown (RWA.xyz) */}
            <Card className="border-border/70 bg-card shadow-none p-5 mb-8">
              <CardHeader className="p-0 pb-4 border-b border-border/50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <CardTitle className="text-base font-semibold text-foreground">
                      Tokenized US Treasuries & Institutional Yield (RWA.xyz)
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Short-term government bond funds represented on public blockchains
                    </p>
                  </div>
                  <Button asChild variant="outline" size="sm" className="gap-1 text-xs shrink-0">
                    <a href="https://app.rwa.xyz/" target="_blank" rel="noopener noreferrer">
                      RWA.xyz Terminal <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </div>
              </CardHeader>

              <div className="pt-4 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border/50 text-muted-foreground uppercase tracking-wider font-semibold">
                      <th className="pb-2.5">Product Name</th>
                      <th className="pb-2.5">Manager / Issuer</th>
                      <th className="pb-2.5">Token</th>
                      <th className="pb-2.5">TVL</th>
                      <th className="pb-2.5">Market Share</th>
                      <th className="pb-2.5">Active Blockchains</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40 font-medium">
                    {data.tokenizedTreasuries.map((rwa) => (
                      <tr key={rwa.symbol} className="hover:bg-muted/20 transition-colors">
                        <td className="py-3 text-foreground font-semibold">{rwa.name}</td>
                        <td className="py-3 text-muted-foreground">{rwa.issuer}</td>
                        <td className="py-3">
                          <span className="rounded bg-primary/10 px-2 py-0.5 font-semibold text-primary">
                            {rwa.symbol}
                          </span>
                        </td>
                        <td className="py-3 text-foreground font-semibold">{rwa.tvl}</td>
                        <td className="py-3 text-foreground">{rwa.share}%</td>
                        <td className="py-3 text-muted-foreground">{rwa.chains}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Visa Onchain Analytics Deep Dive */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="border-border/70 bg-card shadow-none p-5 md:col-span-2">
                <CardHeader className="p-0 pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <CardTitle className="text-base font-semibold text-foreground">
                      Visa Onchain Analytics Methodology
                    </CardTitle>
                  </div>
                </CardHeader>
                <div className="text-xs text-muted-foreground space-y-3 leading-relaxed">
                  <p>
                    Standard blockchain explorers report gross stablecoin volumes exceeding $3–5 Trillion
                    per month, but over 80% of this traffic originates from automated arbitrage bots, DEX
                    liquidity routing, and exchange rebalancing loops.
                  </p>
                  <p>
                    Visa Onchain Analytics applies address-clustering models and heuristic filters to
                    isolate <strong className="text-foreground">organic payment volume</strong>, measuring
                    actual commercial settlement, merchant remittances, and consumer payments.
                  </p>
                  <div className="pt-2 flex flex-wrap gap-4 text-foreground font-semibold">
                    <div>
                      <span className="text-muted-foreground font-normal block">Adjusted 30d Volume:</span>
                      {data.visaAnalytics.adjustedMonthlyVolume}
                    </div>
                    <div>
                      <span className="text-muted-foreground font-normal block">Organic Volume Ratio:</span>
                      {data.visaAnalytics.organicVolumeRatio}
                    </div>
                    <div>
                      <span className="text-muted-foreground font-normal block">Institutional Run Rate:</span>
                      {data.visaAnalytics.institutionalSettlementRunRate}
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="border-border/70 bg-muted/20 shadow-none p-5 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">Verified Primary Sources</h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    Data is indexed and cross-verified continuously across institutional tracking endpoints.
                  </p>
                  <ul className="space-y-2 text-xs">
                    {data.sources.map((src) => (
                      <li key={src.url}>
                        <a
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-primary hover:underline font-medium"
                        >
                          <ArrowUpRight className="h-3 w-3" />
                          {src.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="text-[11px] text-muted-foreground pt-4 border-t border-border/50">
                  Last synchronized: {data.updatedAt.split('T')[0]}
                </div>
              </Card>
            </div>

            <CommunityFeedBanner variant="community" />
          </PageShell>
        </main>
      </div>
    </>
  );
}
