'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { ToolUsageTracker } from '@/components/tracking/tool-usage-tracker';
import { PageHeader } from '@/components/page-header';
import { PageShell } from '@/components/page-shell';
import { CtaBanner } from '@/components/cta-banner';

const checklistData = {
  sections: [
    {
      title: 'Phase 1: Pre-First Day (Preparation)',
      items: [
        'Send welcome email with first-day logistics (start time, schedule).',
        'Ship hardware (laptop, monitor) & company swag.',
        'Grant access to core systems (email, Slack/Discord, Notion).',
        'Assign an "onboarding buddy" or mentor.',
        'Share pre-reading materials: company vision, whitepaper, and key articles.',
        'Send crypto wallet setup guide and security best practices.',
      ],
    },
    {
      title: 'Phase 2: Day 1 (Welcome & Setup)',
      items: [
        'Hold a team welcome meeting and introductions.',
        'Assist with technical setup (Git, dev environment, VPN).',
        'Conduct an HR & admin onboarding session (payroll, benefits).',
        "Walk through the company's communication tools and norms (async-first!).",
        'Have a 1-on-1 with their direct manager to set expectations.',
        'Give a high-level overview of the company roadmap.',
      ],
    },
    {
      title: 'Phase 3: Week 1 (Immersion)',
      items: [
        'Schedule 1-on-1s with key team members across departments.',
        'Provide a curated "rabbit hole" list of essential podcasts/articles.',
        'Assign their first small, achievable task to get an early win.',
        'Invite them to all relevant team and community calls.',
        'Give them a small crypto budget to use the company\'s own product.',
        'Review security policies, especially private key management.',
      ],
    },
    {
      title: 'Phase 4: First 30 Days (Integration)',
      items: [
        'Co-create a 30-60-90 day plan with clear goals.',
        'Involve them in a core project or feature sprint.',
        'Encourage their first public contribution (e.g., Discord message, blog post).',
        'Conduct a 30-day check-in to gather feedback on the onboarding process.',
        'Explain the protocol\'s governance process and how to participate.',
        'Ensure they understand the company\'s tokenomics and vesting schedule.',
      ],
    },
  ],
};

function ChecklistItem({ id, label }: { id: string; label: string }) {
  return (
    <div className="flex items-center space-x-3 p-3 rounded-lg transition-colors hover:bg-secondary/50">
      <Checkbox id={id} />
      <Label
        htmlFor={id}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
      >
        {label}
      </Label>
    </div>
  );
}

export default function EmployeeOnboardingChecklistPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <ToolUsageTracker toolName="Employee Onboarding Checklist" />
        <PageShell>
          <section className="text-center mb-8">
            <div className="site-container">
              <PageHeader
                title="Web3 Onboarding Checklist"
                description="A practical onboarding checklist for Web3 teams, from pre-boarding to 90-day execution."
              />
            </div>
          </section>

          <div className="site-container space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {checklistData.sections.map((section) => (
                <Card key={section.title} className="flex flex-col border-border/70 bg-card shadow-none">
                  <CardHeader>
                    <CardTitle className="text-base">{section.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="space-y-1.5">
                      {section.items.map((item, itemIndex) => (
                        <ChecklistItem
                          key={itemIndex}
                          id={`item-${section.title}-${itemIndex}`}
                          label={item}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <CtaBanner
              variant="hire"
              title="Looking for Top Talent?"
              buttonText="Post a Job"
              className="col-span-full"
            />

            <div className="text-center pt-4">
              <p className="text-muted-foreground text-xs">Find this checklist useful?</p>
              <Link href="/blog" className="text-primary text-xs font-semibold hover:underline">
                Explore our Web3 Playbook for more resources <ArrowRight className="inline h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </PageShell>
      </main>
    </div>
  );
}
