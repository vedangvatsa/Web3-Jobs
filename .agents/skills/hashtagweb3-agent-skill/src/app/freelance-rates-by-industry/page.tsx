'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { ArrowRight } from 'lucide-react';
import { ToolUsageTracker } from '@/components/tracking/tool-usage-tracker';
import { useMemo, useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { PageShell } from '@/components/page-shell';

const rateRows = [
  {
    key: 'software',
    industry: 'Software Development',
    hourlyMin: 50,
    hourlyMax: 150,
    project: '$2,000 - $25,000+',
    roles: 'Frontend, Backend, Full Stack, Smart Contract',
  },
  {
    key: 'design',
    industry: 'Design',
    hourlyMin: 35,
    hourlyMax: 120,
    project: '$800 - $12,000+',
    roles: 'UI/UX, Brand, Product Design, Motion',
  },
  {
    key: 'marketing',
    industry: 'Marketing',
    hourlyMin: 30,
    hourlyMax: 110,
    project: '$600 - $10,000+',
    roles: 'Performance, SEO, Growth, Content Marketing',
  },
  {
    key: 'content',
    industry: 'Content & Writing',
    hourlyMin: 25,
    hourlyMax: 90,
    project: '$150 - $5,000+',
    roles: 'Blog Writing, Technical Writing, Copywriting',
  },
  {
    key: 'ops',
    industry: 'Operations & Virtual Support',
    hourlyMin: 15,
    hourlyMax: 55,
    project: '$200 - $3,500+',
    roles: 'Admin, Customer Support, Research, PMO Support',
  },
  {
    key: 'video',
    industry: 'Video & Animation',
    hourlyMin: 35,
    hourlyMax: 125,
    project: '$500 - $15,000+',
    roles: 'Video Editing, Motion Graphics, 3D Animation',
  },
];

const experienceMultipliers: Record<string, { label: string; multiplier: number }> = {
  entry: { label: 'Entry / Junior', multiplier: 0.8 },
  mid: { label: 'Mid-Level', multiplier: 1.0 },
  senior: { label: 'Senior', multiplier: 1.35 },
  lead: { label: 'Lead / Principal', multiplier: 1.7 },
};

const regionMultipliers: Record<string, { label: string; multiplier: number }> = {
  us_ca: { label: 'US & Canada', multiplier: 1.25 },
  weur: { label: 'Western Europe', multiplier: 1.1 },
  eeur: { label: 'Eastern Europe & LATAM', multiplier: 0.85 },
  apac: { label: 'APAC (excl. ANZ/SG)', multiplier: 0.75 },
  anz_sg: { label: 'ANZ & Singapore', multiplier: 1.15 },
};

export default function FreelanceRatesPage() {
  const [selectedIndustry, setSelectedIndustry] = useState<string>('software');
  const [selectedExp, setSelectedExp] = useState<string>('mid');
  const [selectedRegion, setSelectedRegion] = useState<string>('us_ca');
  const [scopeLevel, setScopeLevel] = useState<number>(2);

  const activeRow = useMemo(
    () => rateRows.find((r) => r.key === selectedIndustry) ?? rateRows[0],
    [selectedIndustry]
  );

  const expObj = experienceMultipliers[selectedExp] ?? experienceMultipliers.mid;
  const regObj = regionMultipliers[selectedRegion] ?? regionMultipliers.us_ca;

  const estimatedHourlyMin = Math.round(activeRow.hourlyMin * expObj.multiplier * regObj.multiplier);
  const estimatedHourlyMax = Math.round(activeRow.hourlyMax * expObj.multiplier * regObj.multiplier);

  const scopeMultipliers = [0.4, 1.0, 2.5];
  const scopeLabels = ['Small sprint (1-2 weeks)', 'Standard build (2-6 weeks)', 'Complex delivery (6-12+ weeks)'];
  const projectBaseMin = activeRow.hourlyMin * 30 * (scopeMultipliers[scopeLevel - 1] ?? 1.0);
  const projectBaseMax = activeRow.hourlyMax * 50 * (scopeMultipliers[scopeLevel - 1] ?? 1.0);

  const estimatedProjectMin = Math.round(projectBaseMin * expObj.multiplier * regObj.multiplier);
  const estimatedProjectMax = Math.round(projectBaseMax * expObj.multiplier * regObj.multiplier);

  const datasetSchema = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: 'Freelance Rates by Industry 2026',
    description:
      'Benchmark hourly and project rates for freelancers across 6 industries including software development, design, marketing, content writing, operations, and video production. Includes experience and region multipliers.',
    url: 'https://hashtagweb3.com/freelance-rates-by-industry',
    publisher: {
      '@type': 'Organization',
      name: 'Hashtag Web3',
      url: 'https://hashtagweb3.com',
    },
    temporalCoverage: '2026',
    variableMeasured: [
      { '@type': 'PropertyValue', name: 'Hourly Rate (USD)', minValue: 15, maxValue: 150 },
      { '@type': 'PropertyValue', name: 'Project Rate (USD)', description: 'Per-project fee range' },
    ],
    distribution: {
      '@type': 'DataDownload',
      encodingFormat: 'text/html',
      contentUrl: 'https://hashtagweb3.com/freelance-rates-by-industry',
    },
    hasPart: rateRows.map((row) => ({
      '@type': 'Dataset',
      name: `${row.industry} Freelance Rates`,
      description: `Hourly rate range $${row.hourlyMin}-$${row.hourlyMax}/hr for ${row.roles}.`,
    })),
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetSchema) }}
      />
      <main className="flex-1">
        <ToolUsageTracker toolName="Freelance Rates by Industry" />
        <PageShell>
          <section className="text-center mb-8">
            <div className="site-container">
              <PageHeader
                title="Freelance Rates by Industry"
                description="Compare benchmark ranges by industry and estimate your pricing by experience, region, and project scope."
              />
              <Badge variant="secondary" className="mt-3">
                2026 Benchmarks
              </Badge>
            </div>
          </section>

          <section className="site-container">
            <h2 className="sr-only">Freelance rate calculator and benchmarks</h2>
            <div className="mb-8 grid gap-6 md:grid-cols-2">
              <Card className="border-border/70 bg-card shadow-none">
                <CardHeader>
                  <CardTitle>Rate Estimator</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <Label>Industry</Label>
                    <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {rateRows.map((r) => (
                          <SelectItem key={r.key} value={r.key}>
                            {r.industry}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Experience Level</Label>
                    <Select value={selectedExp} onValueChange={setSelectedExp}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select experience" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(experienceMultipliers).map(([k, v]) => (
                          <SelectItem key={k} value={k}>
                            {v.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Client / Regional Market</Label>
                    <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select market" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(regionMultipliers).map(([k, v]) => (
                          <SelectItem key={k} value={k}>
                            {v.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <Label>Project Scope Depth</Label>
                      <span className="text-xs text-muted-foreground">{scopeLabels[scopeLevel - 1]}</span>
                    </div>
                    <Slider
                      min={1}
                      max={3}
                      step={1}
                      value={[scopeLevel]}
                      onValueChange={(vals) => setScopeLevel(vals[0] ?? 2)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/70 bg-card shadow-none">
                <CardHeader>
                  <CardTitle>Estimated Pricing Range</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="rounded-lg border border-border/70 bg-muted/20 p-4">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Estimated Hourly Rate
                    </p>
                    <p className="mt-1 text-3xl font-extrabold text-foreground">
                      ${estimatedHourlyMin} - ${estimatedHourlyMax}{' '}
                      <span className="text-sm font-normal text-muted-foreground">/ hr</span>
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Adjusted for {expObj.label.toLowerCase()} talent in {regObj.label}.
                    </p>
                  </div>

                  <div className="rounded-lg border border-border/70 bg-muted/20 p-4">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Estimated Fixed-Price Scope
                    </p>
                    <p className="mt-1 text-3xl font-extrabold text-foreground">
                      ${estimatedProjectMin.toLocaleString()} - ${estimatedProjectMax.toLocaleString()}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Based on typical {scopeLabels[scopeLevel - 1]?.toLowerCase()} deliveries.
                    </p>
                  </div>

                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p>Common roles: {activeRow.roles}</p>
                    <p>Rates assume USD settlement. On-chain/token components should be priced at spot with volatility buffers.</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mb-8">
              <Card className="border-border/70 bg-card shadow-none">
                <CardHeader>
                  <CardTitle>Industry Baseline Comparison (2026)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b text-xs uppercase text-muted-foreground">
                          <th className="py-3 pr-4">Industry</th>
                          <th className="py-3 px-4">Typical Hourly Range</th>
                          <th className="py-3 px-4">Typical Project Range</th>
                          <th className="py-3 pl-4">Covered Roles</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rateRows.map((r) => (
                          <tr key={r.key} className="border-b last:border-0 hover:bg-muted/10">
                            <td className="py-3 pr-4 font-medium text-foreground">{r.industry}</td>
                            <td className="py-3 px-4">
                              ${r.hourlyMin} - ${r.hourlyMax} / hr
                            </td>
                            <td className="py-3 px-4">{r.project}</td>
                            <td className="py-3 pl-4 text-xs text-muted-foreground">{r.roles}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-8 border-border/70 bg-card shadow-none">
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 text-sm text-muted-foreground">
                <div>
                  <h3 className="font-semibold text-foreground">How do I estimate my freelance hourly rate?</h3>
                  <p className="mt-1">
                    Set an annual income target, divide by realistic billable hours, then adjust for experience, demand, and complexity.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Should I charge hourly or per project?</h3>
                  <p className="mt-1">
                    Charge hourly when scope is fluid. Charge per project when scope and outputs are defined.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Why do rates vary by region?</h3>
                  <p className="mt-1">
                    Rates move with local demand, purchasing power, talent supply, and client budgets. Specialized skills still command a premium globally.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-10 border border-border/70 bg-card/60 shadow-none">
              <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-1">Looking for a Web3 Job?</h3>
                  <p className="text-muted-foreground text-sm">
                    Now that you have pricing benchmarks, find high-intent roles on the #1 Web3 job board.
                  </p>
                </div>
                <Link href="/" className="flex-shrink-0 mt-4 md:mt-0">
                  <Button size="lg">
                    Explore Jobs <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </section>
        </PageShell>
      </main>
    </div>
  );
}
