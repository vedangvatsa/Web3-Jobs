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
import { ArrowRight, FileText } from 'lucide-react';
import { ToolUsageTracker } from '@/components/tracking/tool-usage-tracker';
import { useMemo, useState } from 'react';
import { PageHeader } from "@/components/page-header";

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
  industry: 'Video & Creative Production',
  hourlyMin: 35,
  hourlyMax: 140,
  project: '$500 - $15,000+',
  roles: 'Video Editing, Animation, Short-form Creative',
 },
];

const experienceMultipliers: Record<string, number> = {
 '0-1': 0.8,
 '2-4': 1.0,
 '5-8': 1.25,
 '9+': 1.55,
};

const regionMultipliers: Record<string, number> = {
 'north-america': 1.25,
 europe: 1.1,
 apac: 0.9,
 latam: 0.75,
 africa: 0.7,
};

const modelMultipliers: Record<string, number> = {
 hourly: 1,
 retainer: 0.9,
 urgent: 1.2,
};

export default function FreelanceRatesByIndustryPage() {
 const [industry, setIndustry] = useState('software');
 const [experience, setExperience] = useState('2-4');
 const [region, setRegion] = useState('north-america');
 const [engagementModel, setEngagementModel] = useState('hourly');
 const [hours, setHours] = useState(40);

 const selectedIndustry = rateRows.find((row) => row.key === industry) ?? rateRows[0];

 const estimate = useMemo(() => {
  const multiplier =
   experienceMultipliers[experience] *
   regionMultipliers[region] *
   modelMultipliers[engagementModel];

  const hourlyLow = Math.round(selectedIndustry.hourlyMin * multiplier);
  const hourlyHigh = Math.round(selectedIndustry.hourlyMax * multiplier);
  const projectLow = hourlyLow * hours;
  const projectHigh = hourlyHigh * hours;

  return {
   hourlyLow,
   hourlyHigh,
   projectLow,
   projectHigh,
  };
 }, [selectedIndustry, experience, region, engagementModel, hours]);

 const datasetSchema = {
  '@context': 'https://schema.org',
  '@type': 'Dataset',
  name: 'Freelance Rates by Industry 2026',
  description: 'Benchmark hourly and project rates for freelancers across 6 industries including software development, design, marketing, content writing, operations, and video production. Includes experience and region multipliers.',
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
  hasPart: rateRows.map(row => ({
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

    <div className="container mx-auto px-4 page-section">
     <section className="text-center mb-12 site-container">
      
      <PageHeader title="Freelance Rates by Industry" />
      <p className="mt-4 text-muted-foreground">
       Compare benchmark ranges by industry and estimate your pricing by experience,
       region, and project scope.
      </p>
      <Badge variant="secondary" className="mt-4">
       2026 Benchmarks
      </Badge>
     </section>

    <section className="site-container">
     <h2 className="sr-only">Freelance rate calculator and benchmarks</h2>
     <div className="mb-8 grid gap-6 md:grid-cols-2">
      <Card>
       <CardHeader>
        <CardTitle>Rate Estimator</CardTitle>
       </CardHeader>
       <CardContent className="space-y-5">
        <div className="space-y-2">
         <Label>Industry</Label>
         <Select value={industry} onValueChange={setIndustry}>
          <SelectTrigger>
           <SelectValue placeholder="Select industry" />
          </SelectTrigger>
          <SelectContent>
           {rateRows.map((row) => (
            <SelectItem key={row.key} value={row.key}>
             {row.industry}
            </SelectItem>
           ))}
          </SelectContent>
         </Select>
        </div>

        <div className="space-y-2">
         <Label>Experience</Label>
         <Select value={experience} onValueChange={setExperience}>
          <SelectTrigger>
           <SelectValue placeholder="Select experience" />
          </SelectTrigger>
          <SelectContent>
           <SelectItem value="0-1">0-1 years</SelectItem>
           <SelectItem value="2-4">2-4 years</SelectItem>
           <SelectItem value="5-8">5-8 years</SelectItem>
           <SelectItem value="9+">9+ years</SelectItem>
          </SelectContent>
         </Select>
        </div>

        <div className="space-y-2">
         <Label>Region</Label>
         <Select value={region} onValueChange={setRegion}>
          <SelectTrigger>
           <SelectValue placeholder="Select region" />
          </SelectTrigger>
          <SelectContent>
           <SelectItem value="north-america">North America</SelectItem>
           <SelectItem value="europe">Europe</SelectItem>
           <SelectItem value="apac">APAC</SelectItem>
           <SelectItem value="latam">LATAM</SelectItem>
           <SelectItem value="africa">Africa</SelectItem>
          </SelectContent>
         </Select>
        </div>

        <div className="space-y-2">
         <Label>Engagement model</Label>
         <Select value={engagementModel} onValueChange={setEngagementModel}>
          <SelectTrigger>
           <SelectValue placeholder="Select model" />
          </SelectTrigger>
          <SelectContent>
           <SelectItem value="hourly">Standard hourly</SelectItem>
           <SelectItem value="retainer">Monthly retainer</SelectItem>
           <SelectItem value="urgent">Urgent / rush delivery</SelectItem>
          </SelectContent>
         </Select>
        </div>

        <div className="space-y-3">
         <Label>Estimated project hours: {hours}</Label>
         <Slider
          min={10}
          max={200}
          step={5}
          value={[hours]}
          onValueChange={(values) => setHours(values[0])}
         />
        </div>
       </CardContent>
      </Card>

      <Card>
       <CardHeader>
        <CardTitle>Estimated pricing range</CardTitle>
       </CardHeader>
       <CardContent className="space-y-4">
        <div className="rounded-lg border bg-primary/5 p-4">
         <p className="text-sm text-muted-foreground">Hourly range</p>
         <p className="text-2xl font-bold">
          ${estimate.hourlyLow} - ${estimate.hourlyHigh} / hr
         </p>
        </div>
        <div className="rounded-lg border bg-primary/5 p-4">
         <p className="text-sm text-muted-foreground">Project range ({hours}h)</p>
         <p className="text-2xl font-bold">
          ${estimate.projectLow.toLocaleString()} - ${estimate.projectHigh.toLocaleString()}
         </p>
        </div>
        <div className="text-sm text-muted-foreground space-y-1">
         <p>Industry baseline: ${selectedIndustry.hourlyMin} - ${selectedIndustry.hourlyMax} / hr</p>
         <p>Calculation = baseline × experience × region × engagement model</p>
        </div>
       </CardContent>
      </Card>
     </div>

     <Card>
      <CardHeader>
       <CardTitle>Industry Rate Benchmarks</CardTitle>
      </CardHeader>
      <CardContent>
       <div className="overflow-x-auto">
        <table className="w-full text-sm">
         <caption className="sr-only">Freelance hourly and project rate benchmarks by industry</caption>
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
            <td className="py-3 pr-4">${row.hourlyMin} - ${row.hourlyMax}/hr</td>
            <td className="py-3 pr-4">{row.project}</td>
            <td className="py-3">{row.roles}</td>
           </tr>
          ))}
         </tbody>
        </table>
       </div>

       <p className="mt-5 text-xs text-muted-foreground">
        Note: Benchmarks are directional and should be adjusted for deliverable complexity,
        revision scope, timezone overlap, and payment terms.
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

     <Card className="mt-8">
      <CardHeader>
       <CardTitle>Frequently Asked Questions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 text-sm text-muted-foreground">
       <div>
        <h3 className="font-semibold text-foreground">How do I estimate my freelance hourly rate?</h3>
        <p className="mt-1">Set an annual income target, divide by realistic billable hours, then adjust for experience, demand, and complexity.</p>
       </div>
       <div>
        <h3 className="font-semibold text-foreground">Should I charge hourly or per project?</h3>
        <p className="mt-1">Charge hourly when scope is fluid. Charge per project when scope and outputs are defined.</p>
       </div>
       <div>
        <h3 className="font-semibold text-foreground">Why do rates vary by region?</h3>
        <p className="mt-1">Rates move with local demand, purchasing power, talent supply, and client budgets. Specialized skills still command a premium globally.</p>
       </div>
      </CardContent>
     </Card>

     <Card className="mt-10 site-container bg-muted/30 border shadow-none">
      <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
       <div>
        <h3 className="text-xl font-bold text-foreground mb-1">Looking for a Web3 Job?</h3>
        <p className="text-muted-foreground">Now that you have pricing benchmarks, find high-intent roles on the #1 Web3 job board.</p>
       </div>
       <Link href="/jobs" className="flex-shrink-0 mt-4 md:mt-0">
        <Button size="lg">
         Explore Jobs <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
       </Link>
      </CardContent>
     </Card>
    </section>
    </div>
   </main>
  </div>
 );
}
