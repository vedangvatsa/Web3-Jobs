import { Header } from '@/components/header';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, DollarSign, FileText } from 'lucide-react';
import { ToolUsageTracker } from '@/components/tracking/tool-usage-tracker';

const rateRows = [
  {
    industry: 'Software Development',
    hourly: '$50 - $150/hr',
    project: '$2,000 - $25,000+',
    roles: 'Frontend, Backend, Full Stack, Smart Contract',
  },
  {
    industry: 'Design',
    hourly: '$35 - $120/hr',
    project: '$800 - $12,000+',
    roles: 'UI/UX, Brand, Product Design, Motion',
  },
  {
    industry: 'Marketing',
    hourly: '$30 - $110/hr',
    project: '$600 - $10,000+',
    roles: 'Performance, SEO, Growth, Content Marketing',
  },
  {
    industry: 'Content & Writing',
    hourly: '$25 - $90/hr',
    project: '$150 - $5,000+',
    roles: 'Blog Writing, Technical Writing, Copywriting',
  },
  {
    industry: 'Operations & Virtual Support',
    hourly: '$15 - $55/hr',
    project: '$200 - $3,500+',
    roles: 'Admin, Customer Support, Research, PMO Support',
  },
  {
    industry: 'Video & Creative Production',
    hourly: '$35 - $140/hr',
    project: '$500 - $15,000+',
    roles: 'Video Editing, Animation, Short-form Creative',
  },
];

export default function FreelanceRatesByIndustryPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <ToolUsageTracker toolName="Freelance Rates by Industry" />

        <section className="border-b">
          <div className="container mx-auto max-w-6xl px-4 py-12 md:py-16">
            <div className="max-w-3xl">
              <Badge variant="secondary" className="mb-4">
                2026 Benchmarks
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
                Freelance Rates by Industry
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                Use these ranges to price your services, evaluate proposals, and negotiate better.
                Rates vary by experience, complexity, delivery speed, and niche specialization.
              </p>
            </div>
          </div>
        </section>

        <section className="container mx-auto max-w-6xl px-4 py-10 md:py-14">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Industry Rate Benchmarks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="py-3 pr-4 font-semibold">Industry</th>
                      <th className="py-3 pr-4 font-semibold">Typical Hourly Rate</th>
                      <th className="py-3 pr-4 font-semibold">Typical Project Range</th>
                      <th className="py-3 font-semibold">Common Roles</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rateRows.map((row) => (
                      <tr key={row.industry} className="border-b align-top">
                        <td className="py-3 pr-4 font-medium">{row.industry}</td>
                        <td className="py-3 pr-4">{row.hourly}</td>
                        <td className="py-3 pr-4">{row.project}</td>
                        <td className="py-3">{row.roles}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="mt-5 text-xs text-muted-foreground">
                Note: These are directional market ranges compiled from public freelance marketplaces,
                independent consultant pricing pages, and agency benchmarks.
              </p>
            </CardContent>
          </Card>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>How to price your freelance work</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>1) Set a base rate using your target annual income and billable hours.</p>
                <p>2) Add a premium for speed, niche expertise, or high-risk deliverables.</p>
                <p>3) Prefer project pricing when scope is clear and value is measurable.</p>
                <p>4) Reprice every quarter based on demand and delivery performance.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Freelancer tools</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/invoice-generator" className="block">
                  <Button variant="outline" className="w-full justify-between">
                    Invoice Generator
                    <FileText className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/salary-calculator" className="block">
                  <Button variant="outline" className="w-full justify-between">
                    Salary Calculator
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/resources" className="block">
                  <Button className="w-full justify-between">
                    Back to all resources
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
