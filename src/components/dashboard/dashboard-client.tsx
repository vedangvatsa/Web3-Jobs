'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { PageShell } from '@/components/page-shell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { DashboardMetrics } from '@/lib/dashboard';
import { ExternalLink } from 'lucide-react';

interface DashboardClientProps {
  data: DashboardMetrics;
}

export function DashboardClient({ data }: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'agentic' | 'lending' | 'transactions' | 'markets'>('overview');

  const formattedDate = data.updatedAt ? data.updatedAt.split('T')[0] : 'Daily Sync';

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1" data-dashboard-page>
        <PageShell>
          {/* Header with live feed provenance */}
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-3 mb-4 border-b border-border/60">
            <div>
              <PageHeader title="Web3 & On-Chain Intelligence" />
              <p className="text-xs text-muted-foreground -mt-3">
                Empirical on-chain analytics across Stablecoins, Agentic Payments, Lending, DEXs & RWA Yield
              </p>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground shrink-0">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Sync
              </span>
              <span>•</span>
              <span>Last updated: {formattedDate}</span>
            </div>
          </div>

          {/* Clean Segmented Tab Switcher (Matching our site design) */}
          <div className="flex items-center gap-1.5 p-1 bg-muted/40 rounded-lg border border-border/60 w-fit mb-4 overflow-x-auto max-w-full text-xs font-semibold">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-md transition-all shrink-0 ${
                activeTab === 'overview'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Overview & Macro
            </button>
            <button
              onClick={() => setActiveTab('agentic')}
              className={`px-3 py-1.5 rounded-md transition-all shrink-0 flex items-center gap-1.5 ${
                activeTab === 'agentic'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span>Agentic Payments</span>
              <span className="text-[10px] px-1 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold">New</span>
            </button>
            <button
              onClick={() => setActiveTab('lending')}
              className={`px-3 py-1.5 rounded-md transition-all shrink-0 ${
                activeTab === 'lending'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Stablecoin Lending
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-3 py-1.5 rounded-md transition-all shrink-0 ${
                activeTab === 'transactions'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Signal vs Noise
            </button>
            <button
              onClick={() => setActiveTab('markets')}
              className={`px-3 py-1.5 rounded-md transition-all shrink-0 ${
                activeTab === 'markets'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              DEXs & Fees
            </button>
          </div>

          {/* 1. OVERVIEW & MACRO TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Dense 6-Metric Macro KPI Grid with Explicit Cadence Notes */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                <div className="rounded-lg border border-border/70 bg-card p-3 shadow-none">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                    <span>Stablecoins</span>
                    <span className="text-[9px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1 rounded">Live</span>
                  </div>
                  <div className="text-lg font-bold text-foreground leading-tight">
                    {data.overview.totalStablecoinMarketCap.replace(' Billion', 'B')}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1">
                    ATH · 215+ chains
                  </div>
                </div>

                <div className="rounded-lg border border-border/70 bg-card p-3 shadow-none">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                    <span>Agentic Volume</span>
                    <span className="text-[9px] font-medium text-blue-600 dark:text-blue-400 bg-blue-500/10 px-1 rounded">Visa</span>
                  </div>
                  <div className="text-lg font-bold text-foreground leading-tight">
                    {data.agenticPayments?.totalVolume || '$59.21M'}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1">
                    303M+ micropayments
                  </div>
                </div>

                <div className="rounded-lg border border-border/70 bg-card p-3 shadow-none">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                    <span>Lending Borrows</span>
                    <span className="text-[9px] font-medium text-muted-foreground">Visa</span>
                  </div>
                  <div className="text-lg font-bold text-foreground leading-tight">
                    {data.stablecoinLending?.totalBorrowed || '$755.1B'}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1">
                    $16.58B outstanding
                  </div>
                </div>

                <div className="rounded-lg border border-border/70 bg-card p-3 shadow-none">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                    <span>RWA Treasuries</span>
                    <span className="text-[9px] font-medium text-muted-foreground">Daily</span>
                  </div>
                  <div className="text-lg font-bold text-foreground leading-tight">
                    {data.overview.tokenizedTreasuriesMarketCap.replace(' Billion', 'B')}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1">
                    Updated: {formattedDate}
                  </div>
                </div>

                <div className="rounded-lg border border-border/70 bg-card p-3 shadow-none">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                    <span>24h DEX Volume</span>
                    <span className="text-[9px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1 rounded">Live</span>
                  </div>
                  <div className="text-lg font-bold text-foreground leading-tight">
                    {data.overview.dex24hVolume}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1">
                    Rolling 24 hours
                  </div>
                </div>

                <div className="rounded-lg border border-border/70 bg-card p-3 shadow-none">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                    <span>Total DeFi TVL</span>
                    <span className="text-[9px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1 rounded">Live</span>
                  </div>
                  <div className="text-lg font-bold text-foreground leading-tight">
                    {data.overview.totalDeFiTvl}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1">
                    L1 & L2 capital
                  </div>
                </div>
              </div>

              {/* Row 1: Stablecoins & Settlement Chains */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
                {/* Stablecoins Card */}
                <Card className="border-border/70 bg-card shadow-none p-4">
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-border/50">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <h3 className="text-sm font-semibold text-foreground">Stablecoin Market Share</h3>
                      <span className="text-[10px] font-medium text-muted-foreground bg-muted/60 px-1.5 py-0.2 rounded">Live DefiLlama</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground tabular-nums">
                      Total: {data.overview.totalStablecoinMarketCap}
                    </span>
                  </div>

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

                {/* Settlement Chains Card */}
                <Card className="border-border/70 bg-card shadow-none p-4">
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-border/50">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-500" />
                      <h3 className="text-sm font-semibold text-foreground">Top Settlement Blockchains</h3>
                      <span className="text-[10px] font-medium text-muted-foreground bg-muted/60 px-1.5 py-0.2 rounded">Live DefiLlama</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground">Stablecoin Velocity</span>
                  </div>

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

              {/* Row 2: RWA Tokenized Treasuries & Visa Filter Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
                <Card className="border-border/70 bg-card shadow-none p-4 lg:col-span-2">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/50">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-foreground">
                        Tokenized US Treasuries & Yield (RWA.xyz)
                      </h3>
                      <span className="text-[10px] text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded">
                        Last updated: {formattedDate}
                      </span>
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

                <Card className="border-border/70 bg-card shadow-none p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/50">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-semibold text-foreground">Visa Bot Filter</h3>
                        <span className="text-[10px] text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded">
                          Monthly
                        </span>
                      </div>
                      <Button asChild variant="ghost" size="sm" className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground gap-1">
                        <a href="https://visaonchainanalytics.com/" target="_blank" rel="noopener noreferrer">
                          Visa <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      </Button>
                    </div>

                    <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">
                      Isolates genuine merchant remittances and consumer flows from MEV bot loops.
                    </p>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between p-2 rounded bg-muted/30 border border-border/40">
                        <span className="text-muted-foreground">Adjusted 30d Volume:</span>
                        <span className="font-bold text-foreground">{data.overview.visaAdjustedVolume30d}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded bg-muted/30 border border-border/40">
                        <span className="text-muted-foreground">All-Time Organic Volume:</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{data.transactionsSignal?.adjustedVolume || '$8.96T'}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded bg-muted/30 border border-border/40">
                        <span className="text-muted-foreground">Bot Filter Ratio:</span>
                        <span className="font-bold text-muted-foreground">{data.transactionsSignal?.botFilteredRatio || '97.6%'}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded bg-muted/30 border border-border/40">
                        <span className="text-muted-foreground">Active Payment Wallets:</span>
                        <span className="font-bold text-foreground">{data.overview.activePaymentAddresses30d}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-border/40 flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>Source: Visa Onchain Analytics</span>
                    <button onClick={() => setActiveTab('transactions')} className="hover:underline text-primary">
                      Deep Dive →
                    </button>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* 2. AGENTIC PAYMENTS TAB (Directly from https://visaonchainanalytics.com/agentic-payments) */}
          {activeTab === 'agentic' && data.agenticPayments && (
            <div className="space-y-4">
              {/* Agentic KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                <div className="rounded-lg border border-border/70 bg-card p-3 shadow-none">
                  <div className="text-[11px] text-muted-foreground mb-1">Total Volume</div>
                  <div className="text-lg font-bold text-foreground leading-tight">{data.agenticPayments.totalVolume}</div>
                  <div className="text-[10px] text-muted-foreground mt-1">Autonomous payments</div>
                </div>
                <div className="rounded-lg border border-border/70 bg-card p-3 shadow-none">
                  <div className="text-[11px] text-muted-foreground mb-1">Organic Volume</div>
                  <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 leading-tight">{data.agenticPayments.organicVolume}</div>
                  <div className="text-[10px] text-muted-foreground mt-1">Filtered utility volume</div>
                </div>
                <div className="rounded-lg border border-border/70 bg-card p-3 shadow-none">
                  <div className="text-[11px] text-muted-foreground mb-1">Median Txn Size</div>
                  <div className="text-lg font-bold text-foreground leading-tight">{data.agenticPayments.medianTxnSize}</div>
                  <div className="text-[10px] text-muted-foreground mt-1">Micropayment baseline</div>
                </div>
                <div className="rounded-lg border border-border/70 bg-card p-3 shadow-none">
                  <div className="text-[11px] text-muted-foreground mb-1">Total Transactions</div>
                  <div className="text-lg font-bold text-foreground leading-tight">{data.agenticPayments.totalTransactions}</div>
                  <div className="text-[10px] text-muted-foreground mt-1">Machine txns</div>
                </div>
                <div className="rounded-lg border border-border/70 bg-card p-3 shadow-none">
                  <div className="text-[11px] text-muted-foreground mb-1">Buyer Wallets</div>
                  <div className="text-lg font-bold text-foreground leading-tight">{data.agenticPayments.buyerWallets}</div>
                  <div className="text-[10px] text-muted-foreground mt-1">Autonomous agents</div>
                </div>
                <div className="rounded-lg border border-border/70 bg-card p-3 shadow-none">
                  <div className="text-[11px] text-muted-foreground mb-1">Merchant Wallets</div>
                  <div className="text-lg font-bold text-foreground leading-tight">{data.agenticPayments.merchantWallets}</div>
                  <div className="text-[10px] text-muted-foreground mt-1">Service & API providers</div>
                </div>
              </div>

              {/* Protocol Comparison & Service Categories */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
                {/* Protocol Market Share */}
                <Card className="border-border/70 bg-card shadow-none p-4">
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-border/50">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-foreground">Protocol Market Share (x402 vs MPP)</h3>
                    </div>
                    <span className="text-[11px] text-muted-foreground">Source: Visa Onchain Analytics</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-border/40 text-muted-foreground text-[10px] uppercase tracking-wider font-semibold">
                          <th className="py-1.5">Protocol</th>
                          <th className="py-1.5 text-right">Volume</th>
                          <th className="py-1.5 text-right">Transactions</th>
                          <th className="py-1.5 text-right">Median Txn</th>
                          <th className="py-1.5 text-right">Share</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/20 font-medium">
                        {data.agenticPayments.protocolBreakdown.map((p) => (
                          <tr key={p.protocol} className="hover:bg-muted/30 transition-colors">
                            <td className="py-2.5 text-foreground font-semibold">
                              <span className="w-2 h-2 rounded-full inline-block mr-1.5" style={{ backgroundColor: p.color || '#3b82f6' }} />
                              {p.protocol}
                            </td>
                            <td className="py-2.5 text-right font-semibold text-foreground">{p.totalVolume}</td>
                            <td className="py-2.5 text-right text-muted-foreground">{p.transactions}</td>
                            <td className="py-2.5 text-right text-emerald-600 dark:text-emerald-400 font-semibold">{p.medianTxn}</td>
                            <td className="py-2.5 text-right text-foreground font-bold">{p.share}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <p className="text-[11px] text-muted-foreground mt-3 pt-3 border-t border-border/40 leading-relaxed">
                    <strong>x402 Protocol</strong> powers HTTP 402 payment required primitives for direct API requests, while <strong>MPP (Machine Payments)</strong> handles streaming state channels.
                  </p>
                </Card>

                {/* Service Categories Breakdown */}
                <Card className="border-border/70 bg-card shadow-none p-4">
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-border/50">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-foreground">Agent Consumption by Service Category</h3>
                    </div>
                    <span className="text-[11px] text-muted-foreground">30d Labeled Volume</span>
                  </div>

                  {/* Stacked Proportional Bar */}
                  <div className="h-3 w-full rounded-md overflow-hidden flex bg-muted/40 mb-3.5">
                    {data.agenticPayments.serviceCategories.map((cat) => (
                      <div
                        key={cat.name}
                        style={{
                          width: `${Math.max(cat.share, 1.5)}%`,
                          backgroundColor: cat.color || '#3b82f6',
                        }}
                        title={`${cat.name}: ${cat.share}%`}
                        className="h-full border-r border-background/20 last:border-none transition-all hover:opacity-85"
                      />
                    ))}
                  </div>

                  <div className="divide-y divide-border/20 text-xs font-medium">
                    {data.agenticPayments.serviceCategories.map((cat) => (
                      <div key={cat.name} className="py-1.5 flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color || '#3b82f6' }} />
                          <span className="font-semibold text-foreground truncate">{cat.name}</span>
                        </div>
                        <span className="font-bold text-foreground shrink-0 tabular-nums">{cat.share}%</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* 3. STABLECOIN LENDING TAB (Directly from https://visaonchainanalytics.com/lending) */}
          {activeTab === 'lending' && data.stablecoinLending && (
            <div className="space-y-4">
              {/* Lending KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                <div className="rounded-lg border border-border/70 bg-card p-3 shadow-none">
                  <div className="text-[11px] text-muted-foreground mb-1">Total Borrowed</div>
                  <div className="text-lg font-bold text-foreground leading-tight">{data.stablecoinLending.totalBorrowed}</div>
                  <div className="text-[10px] text-muted-foreground mt-1">All-time loan volume</div>
                </div>
                <div className="rounded-lg border border-border/70 bg-card p-3 shadow-none">
                  <div className="text-[11px] text-muted-foreground mb-1">Total Repaid</div>
                  <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 leading-tight">{data.stablecoinLending.totalRepaid}</div>
                  <div className="text-[10px] text-muted-foreground mt-1">Healthy repayment cycle</div>
                </div>
                <div className="rounded-lg border border-border/70 bg-card p-3 shadow-none">
                  <div className="text-[11px] text-muted-foreground mb-1">Outstanding Loans</div>
                  <div className="text-lg font-bold text-primary leading-tight">{data.stablecoinLending.outstandingLoans}</div>
                  <div className="text-[10px] text-muted-foreground mt-1">Active borrowed debt</div>
                </div>
                <div className="rounded-lg border border-border/70 bg-card p-3 shadow-none">
                  <div className="text-[11px] text-muted-foreground mb-1">Total Borrows Count</div>
                  <div className="text-lg font-bold text-foreground leading-tight">{data.stablecoinLending.totalBorrowsCount}</div>
                  <div className="text-[10px] text-muted-foreground mt-1">Individual loan contracts</div>
                </div>
                <div className="rounded-lg border border-border/70 bg-card p-3 shadow-none">
                  <div className="text-[11px] text-muted-foreground mb-1">Avg Daily Loan Size</div>
                  <div className="text-lg font-bold text-foreground leading-tight">{data.stablecoinLending.avgDailyLoanSize}</div>
                  <div className="text-[10px] text-muted-foreground mt-1">Mean loan denomination</div>
                </div>
              </div>

              {/* Protocol Share & Borrowed Coins */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
                {/* Top Protocols */}
                <Card className="border-border/70 bg-card shadow-none p-4">
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-border/50">
                    <h3 className="text-sm font-semibold text-foreground">Top Lending Protocols by Loan Volume</h3>
                    <span className="text-[11px] text-muted-foreground">Visa Benchmark</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-border/40 text-muted-foreground text-[10px] uppercase tracking-wider font-semibold">
                          <th className="py-1.5">Protocol</th>
                          <th className="py-1.5">Chains</th>
                          <th className="py-1.5 text-right">Loan Volume</th>
                          <th className="py-1.5 text-right">Share</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/20 font-medium">
                        {data.stablecoinLending.topProtocols.map((proto) => (
                          <tr key={proto.name} className="hover:bg-muted/30 transition-colors">
                            <td className="py-2.5 text-foreground font-semibold">
                              <span className="w-2 h-2 rounded-full inline-block mr-1.5" style={{ backgroundColor: proto.color || '#8b5cf6' }} />
                              {proto.name}
                            </td>
                            <td className="py-2.5 text-muted-foreground text-[11px]">{proto.chains}</td>
                            <td className="py-2.5 text-right text-foreground font-semibold">{proto.volume}</td>
                            <td className="py-2.5 text-right font-bold text-foreground">{proto.share}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>

                {/* Top Stablecoins Borrowed */}
                <Card className="border-border/70 bg-card shadow-none p-4">
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-border/50">
                    <h3 className="text-sm font-semibold text-foreground">Most Borrowed Stablecoins</h3>
                    <span className="text-[11px] text-muted-foreground">Loan Volume Share</span>
                  </div>

                  <div className="h-3 w-full rounded-md overflow-hidden flex bg-muted/40 mb-3.5">
                    {data.stablecoinLending.topStablecoinsBorrowed.map((coin) => (
                      <div
                        key={coin.symbol}
                        style={{
                          width: `${Math.max(coin.share, 2)}%`,
                          backgroundColor: coin.color || '#2775ca',
                        }}
                        title={`${coin.symbol}: ${coin.share}% (${coin.volume})`}
                        className="h-full border-r border-background/20 last:border-none transition-all hover:opacity-85"
                      />
                    ))}
                  </div>

                  <div className="divide-y divide-border/20 text-xs font-medium">
                    {data.stablecoinLending.topStablecoinsBorrowed.map((coin) => (
                      <div key={coin.symbol} className="py-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: coin.color || '#2775ca' }} />
                          <span className="font-bold text-foreground">{coin.symbol}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold text-foreground mr-2">{coin.volume}</span>
                          <span className="text-muted-foreground font-bold">{coin.share}%</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="text-[11px] text-muted-foreground mt-4 pt-3 border-t border-border/40 leading-relaxed">
                    <strong>USDC</strong> dominates institutional lending collateral and leverage on Aave and Compound, while <strong>USDT</strong> dominates BSC and peer-to-peer liquidity markets.
                  </p>
                </Card>
              </div>
            </div>
          )}

          {/* 4. SIGNAL VS NOISE / TRANSACTIONS TAB (Directly from https://visaonchainanalytics.com/transactions) */}
          {activeTab === 'transactions' && data.transactionsSignal && (
            <div className="space-y-4">
              {/* Transactions Comparison Header */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="rounded-lg border border-border/70 bg-card p-3 shadow-none">
                  <div className="text-[11px] text-muted-foreground mb-1">Gross Unadjusted Volume</div>
                  <div className="text-lg font-bold text-muted-foreground leading-tight">{data.transactionsSignal.totalGrossVolume}</div>
                  <div className="text-[10px] text-muted-foreground mt-1">Includes bot & wash trading</div>
                </div>
                <div className="rounded-lg border border-border/70 bg-card p-3 shadow-none">
                  <div className="text-[11px] text-muted-foreground mb-1">Adjusted Organic Volume</div>
                  <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 leading-tight">{data.transactionsSignal.adjustedVolume}</div>
                  <div className="text-[10px] text-muted-foreground mt-1">True economic transfer</div>
                </div>
                <div className="rounded-lg border border-border/70 bg-card p-3 shadow-none">
                  <div className="text-[11px] text-muted-foreground mb-1">Retail Payments (&lt;$250)</div>
                  <div className="text-lg font-bold text-foreground leading-tight">{data.transactionsSignal.retailAdjustedVolume}</div>
                  <div className="text-[10px] text-muted-foreground mt-1">{data.transactionsSignal.retailAdjustedCount} retail txns</div>
                </div>
                <div className="rounded-lg border border-border/70 bg-card p-3 shadow-none">
                  <div className="text-[11px] text-muted-foreground mb-1">Sub-$100 Transfer Share</div>
                  <div className="text-lg font-bold text-foreground leading-tight">{data.transactionsSignal.sub100DollarTransferRatio}</div>
                  <div className="text-[10px] text-muted-foreground mt-1">29.39B micropayments</div>
                </div>
              </div>

              {/* Top Organic Pairs */}
              <Card className="border-border/70 bg-card shadow-none p-4">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-border/50">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Top Organic Settlement Pairs (Adjusted All-Time)</h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Filtered by Visa address clustering heuristics</p>
                  </div>
                  <span className="text-[11px] text-muted-foreground">Cumulative Volume</span>
                </div>

                <div className="h-3 w-full rounded-md overflow-hidden flex bg-muted/40 mb-3.5">
                  {data.transactionsSignal.topPairsAdjusted.map((pair) => (
                    <div
                      key={pair.pair}
                      style={{
                        width: `${Math.max(pair.share, 2)}%`,
                        backgroundColor: pair.color || '#3b82f6',
                      }}
                      title={`${pair.pair}: ${pair.share}% (${pair.volume})`}
                      className="h-full border-r border-background/20 last:border-none transition-all hover:opacity-85"
                    />
                  ))}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-border/40 text-muted-foreground text-[10px] uppercase tracking-wider font-semibold">
                        <th className="py-1.5">Asset & Blockchain Pair</th>
                        <th className="py-1.5 text-right">Adjusted Volume</th>
                        <th className="py-1.5 text-right">Transactions</th>
                        <th className="py-1.5 text-right">Market Share</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20 font-medium">
                      {data.transactionsSignal.topPairsAdjusted.map((pair) => (
                        <tr key={pair.pair} className="hover:bg-muted/30 transition-colors">
                          <td className="py-2.5 text-foreground font-semibold">
                            <span className="w-2 h-2 rounded-full inline-block mr-1.5" style={{ backgroundColor: pair.color || '#3b82f6' }} />
                            {pair.pair}
                          </td>
                          <td className="py-2.5 text-right font-semibold text-foreground">{pair.volume}</td>
                          <td className="py-2.5 text-right text-muted-foreground">{pair.txns}</td>
                          <td className="py-2.5 text-right font-bold text-foreground">{pair.share}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* 5. MARKETS, DEXS & SECURITY TAB */}
          {activeTab === 'markets' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {/* DEXs */}
                <Card className="border-border/70 bg-card shadow-none p-4">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/50">
                    <h3 className="text-sm font-semibold text-foreground">Top DEXs (24h Volume)</h3>
                    <span className="text-[11px] text-muted-foreground font-medium">24h: {data.overview.dex24hVolume}</span>
                  </div>

                  <div className="divide-y divide-border/20 text-xs font-medium">
                    {data.topDexs?.map((dex) => (
                      <div key={dex.name} className="py-2 flex items-center justify-between hover:bg-muted/20 px-1 rounded transition-colors">
                        <div className="min-w-0 pr-2">
                          <div className="font-semibold text-foreground truncate">{dex.name}</div>
                          <div className="text-[10px] text-muted-foreground truncate">{dex.chains.join(', ') || 'Multi-chain'}</div>
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

                {/* Fees */}
                <Card className="border-border/70 bg-card shadow-none p-4">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/50">
                    <h3 className="text-sm font-semibold text-foreground">Top Protocol Fees (24h)</h3>
                    <span className="text-[11px] text-muted-foreground font-medium">24h: {data.overview.fees24h}</span>
                  </div>

                  <div className="divide-y divide-border/20 text-xs font-medium">
                    {data.topFeeGenerators?.map((fee) => (
                      <div key={fee.name} className="py-2 flex items-center justify-between hover:bg-muted/20 px-1 rounded transition-colors">
                        <div className="min-w-0 pr-2">
                          <div className="font-semibold text-foreground truncate">{fee.name}</div>
                          <div className="text-[10px] text-muted-foreground truncate">{fee.category}</div>
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

                {/* DeFi Sectors */}
                <Card className="border-border/70 bg-card shadow-none p-4">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/50">
                    <h3 className="text-sm font-semibold text-foreground">DeFi Sectors by Capital</h3>
                    <span className="text-[11px] text-muted-foreground font-medium">TVL Share</span>
                  </div>

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
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color || '#3b82f6' }} />
                          <span className="font-semibold text-foreground truncate">{s.name}</span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-semibold text-foreground">{s.tvl}</span>
                          <span className="text-muted-foreground text-[11px] ml-1.5 tabular-nums">{s.share}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Exploits Table */}
              <Card className="border-border/70 bg-card shadow-none p-4">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/50">
                  <h3 className="text-sm font-semibold text-foreground">Recent Web3 Security Exploits (DefiLlama Security)</h3>
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
                          <td className="py-2 text-foreground font-semibold">{hack.name}</td>
                          <td className="py-2 text-muted-foreground text-[11px]">{hack.date}</td>
                          <td className="py-2 text-muted-foreground text-[11px]">
                            <span className="rounded bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-medium text-rose-600 dark:text-rose-400">
                              {hack.technique}
                            </span>
                          </td>
                          <td className="py-2 text-right text-rose-600 dark:text-rose-400 font-semibold tabular-nums">{hack.amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* Primary Sources Strip (Universal) */}
          <div className="mt-6 pt-4 border-t border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-muted-foreground">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-semibold text-foreground">Verified Data Sources:</span>
              {data.sources.map((src) => (
                <a
                  key={src.url}
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline text-primary"
                >
                  {src.name} ↗
                </a>
              ))}
            </div>
            <div>
              Cadence: Daily live sync & empirical on-chain queries
            </div>
          </div>
        </PageShell>
      </main>
    </div>
  );
}
