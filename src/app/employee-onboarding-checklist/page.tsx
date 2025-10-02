'use client';

import * as React from 'react';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Users,
  Key,
  Laptop,
  BookOpen,
  Calendar,
  Briefcase,
  ArrowRight,
  ClipboardCheck,
  Share2,
} from 'lucide-react';
import { TransitioningHeadline } from '@/components/transitioning-headline';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import { Separator } from '@/components/ui/separator';
import { Rss } from 'lucide-react';

const checklistData = {
  sections: [
    {
      title: 'Phase 1: Pre-First Day (Preparation)',
      icon: Calendar,
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
      icon: Laptop,
      items: [
        'Hold a team welcome meeting and introductions.',
        'Assist with technical setup (Git, dev environment, VPN).',
        'Conduct an HR & admin onboarding session (payroll, benefits).',
        'Walk through the company’s communication tools and norms (async-first!).',
        'Have a 1-on-1 with their direct manager to set expectations.',
        'Give a high-level overview of the company roadmap.',
      ],
    },
    {
      title: 'Phase 3: Week 1 (Immersion)',
      icon: BookOpen,
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
      icon: Users,
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
      <Label htmlFor={id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
        {label}
      </Label>
    </div>
  );
}

export default function EmployeeOnboardingChecklistPage() {
    const headlines = [
        "Web3 Onboarding Checklist",
        "A Framework for Success",
        "Integrate Your New Hire",
        "From Day 1 to DAO Contributor"
    ];

    const { toast } = useToast();

    const handleDownloadPdf = () => {
        // PDF generation logic here...
    };

  return (
    <div className="flex flex-col min-h-screen bg-secondary/30">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 md:py-16">
          <section className="text-center mb-12 max-w-4xl mx-auto">
             <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                <ClipboardCheck className="h-10 w-10 text-primary" />
            </div>
            <TransitioningHeadline phrases={headlines} />
            <p className="mt-4 text-muted-foreground">The ultimate checklist for successfully onboarding new hires into a Web3 company or DAO.</p>
          </section>

          <div className="max-w-5xl mx-auto space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {checklistData.sections.map((section, sectionIndex) => (
                <Card key={section.title} className="flex flex-col">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <section.icon className="h-6 w-6 text-primary" />
                      </div>
                      <span>{section.title}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="space-y-2">
                      {section.items.map((item, itemIndex) => (
                        <ChecklistItem
                          key={itemIndex}
                          id={`item-${sectionIndex}-${itemIndex}`}
                          label={item}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
             
             <Card className="mt-12 col-span-full bg-primary/5 border-primary/20">
                <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                    <div className="flex-shrink-0 bg-primary/10 p-3 rounded-full hidden md:block">
                        <Briefcase className="h-8 w-8 text-primary"/>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-primary mb-1">Looking for Top Talent?</h3>
                        <p className="text-muted-foreground">Reach over 100,000 Web3 professionals across our global network. Post your job opening on the #1 Web3 job board.</p>
                    </div>
                    <a href="https://t.me/web3jobs_rep" target="_blank" rel="noopener noreferrer" className="flex-shrink-0 mt-4 md:mt-0">
                        <Button size="lg">
                            Post a Job <ArrowRight className="ml-2 h-4 w-4"/>
                        </Button>
                    </a>
                </CardContent>
            </Card>
            
            <div className="text-center pt-8">
                <p className="text-muted-foreground text-sm">Find this checklist useful?</p>
                <Link href="/blog" className="text-primary font-semibold hover:underline">
                    Explore our Web3 Playbook for more resources <ArrowRight className="inline h-4 w-4"/>
                </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
