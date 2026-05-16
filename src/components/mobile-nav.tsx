
'use client';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Menu, Linkedin, Twitter, Users, GraduationCap, Newspaper, Calculator, DollarSign, FileText, Globe, ListChecks, BookOpen, Send, BrainCircuit, FileSignature, Rss, Briefcase, ClipboardEdit, UserMinus, Mic, Milestone, BarChart, Smile, Scale, Building2, Library, Calendar } from 'lucide-react';
import Link from 'next/link';
import {
 Accordion,
 AccordionContent,
 AccordionItem,
 AccordionTrigger,
} from "@/components/ui/accordion"
import { trackCTAClick, trackOutboundClick } from '@/lib/posthog'

const mainNavLinks: Array<{ href: string; label: string; icon: any; target?: string }> = [
 { href: "/", label: "Jobs", icon: Briefcase },
 { href: "/events", label: "Events", icon: Calendar },
 { href: "/news", label: "News", icon: Newspaper },
 { href: "/community", label: "Community", icon: Users },
];

const resourceLinks = [
 { href: "/resources", label: "All Resources", icon: ListChecks },
 { href: "/companies", label: "Companies", icon: Building2 },
 { href: "/blog", label: "Playbook", icon: BookOpen },
 { href: "/glossary", label: "Glossary", icon: Library },
 { href: "https://academy.hashtagweb3.com/", label: "Academy", target: "_blank", icon: GraduationCap },
];

const employeeLinks = [
 { href: "/interview-questions", label: "Interview Questions", icon: BookOpen },
 { href: "/web3-career-quiz", label: "Archetype Assessment", icon: BrainCircuit },
 { href: "/salary-calculator", label: "Salary Calculator", icon: Calculator },
 { href: "/freelance-rates-by-industry", label: "Freelance Rates by Industry", icon: DollarSign },
 { href: "/resume-builder", label: "Resume Builder", icon: FileSignature },
 { href: "/invoice-generator", label: "Invoice Generator", icon: FileText },
 { href: "/digital-nomad-visas", label: "Digital Nomad Visas", icon: Globe },
 { href: "/remote-work-checklist", label: "Remote Checklist", icon: ListChecks },
];

const employerLinks = [
 { href: "/jd-builder", label: "JD Builder", icon: ClipboardEdit },
 { href: "/offer-letter-customizer", label: "Offer Letter Customizer", icon: FileSignature },
 { href: "/employee-onboarding-checklist", label: "Onboarding Checklist", icon: ListChecks },
 { href: "/interview-feedback-template", label: "Interview Feedback", icon: Mic },
 { href: "/employee-exit-survey", label: "Employee Exit Survey", icon: UserMinus },
 { href: "/employee-milestones-tracker", label: "Milestones Tracker", icon: Milestone },
 { href: "/employee-engagement-survey", label: "Engagement Survey", icon: Smile },
 { href: "/work-life-balance-survey", label: "Work-Life Balance Survey", icon: Scale },
 { href: "/company-culture-guide", label: "Company Culture Guide", icon: Users },
];

const socialLinks = [
 { href: "https://x.com/hashtag_web3", label: "X", icon: Twitter, 'aria-label': 'Follow Hashtag Web3 on X' },
 { href: "https://linkedin.com/company/hashtagweb3", label: "LinkedIn", icon: Linkedin, 'aria-label': 'Follow Hashtag Web3 on LinkedIn' },
 { href: "https://t.me/hashtagweb3", label: "Telegram", icon: Send, 'aria-label': 'Join Hashtag Web3 on Telegram' },
];

export function MobileNav() {
 return (
  <Sheet>
   <SheetTrigger asChild>
    <Button variant="ghost" size="icon">
     <Menu className="h-6 w-6" />
     <span className="sr-only">Toggle navigation menu</span>
    </Button>
   </SheetTrigger>
   <SheetContent side="right" className="w-[300px] flex flex-col bg-card p-0">
    <div className="p-4 flex items-center justify-center border-b bg-secondary/50">
     <div className="flex items-center gap-6">
      {socialLinks.map((link) => (
       <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" onClick={() => trackOutboundClick(link.href, link.label)} className="text-muted-foreground transition-colors hover:text-foreground" aria-label={link['aria-label']}>
        <link.icon size={24} />
        <span className="sr-only">{link.label}</span>
       </a>
      ))}
     </div>
    </div>
    <nav className="flex-grow flex flex-col p-4 overflow-y-auto">
     <div className="flex-grow space-y-2">
      <SheetClose asChild>
       <a href="https://t.me/web3jobs_rep" target="_blank" rel="noopener noreferrer" onClick={() => trackCTAClick('post_a_job', 'https://t.me/web3jobs_rep')}>
        <Button className="w-full">Post a Job</Button>
       </a>
      </SheetClose>
      {mainNavLinks.map((link) => (
       <SheetClose key={link.label} asChild>
        <Link href={link.href} target={link.target} rel={link.target ? "noopener noreferrer" : undefined} className="flex items-center gap-4 p-3 rounded-lg text-base font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
         <link.icon className="h-5 w-5" />
         <span>{link.label}</span>
        </Link>
       </SheetClose>
      ))}
      <Accordion type="single" collapsible className="w-full">
       <AccordionItem value="resources" className="border-b-0">
        <AccordionTrigger className="flex items-center gap-4 p-3 rounded-lg text-base font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground no-underline [&[data-state=open]>svg]:rotate-180">
         <div className="flex items-center gap-4">
          <Users className="h-5 w-5" />
          <span>Resources</span>
         </div>
        </AccordionTrigger>
        <AccordionContent className="pl-4">
         <h4 className="px-2 py-1.5 text-sm font-semibold">Learn & Explore</h4>
         <div className="flex flex-col space-y-1 mt-1">
          {resourceLinks.map(link => (
           <SheetClose key={link.label} asChild>
            <Link href={link.href} target={link.target} rel={link.target ? "noopener noreferrer" : undefined} className="flex items-center gap-3 p-2 rounded-lg text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
             <link.icon className="h-4 w-4" />
             {link.label}
            </Link>
           </SheetClose>
          ))}
         </div>
         <h4 className="px-2 py-1.5 mt-2 text-sm font-semibold">For Employees</h4>
         <div className="flex flex-col space-y-1 mt-1">
          {employeeLinks.map(link => (
           <SheetClose key={link.label} asChild>
            <Link href={link.href} className="flex items-center gap-3 p-2 rounded-lg text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
             <link.icon className="h-4 w-4" />
             {link.label}
            </Link>
           </SheetClose>
          ))}
         </div>
         <h4 className="px-2 py-1.5 mt-2 text-sm font-semibold">For Employers</h4>
         <div className="flex flex-col space-y-1 mt-1">
          {employerLinks.map(link => (
           <SheetClose key={link.label} asChild>
            <Link href={link.href} className="flex items-center gap-3 p-2 rounded-lg text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
             <link.icon className="h-4 w-4" />
             {link.label}
            </Link>
           </SheetClose>
          ))}
         </div>
        </AccordionContent>
       </AccordionItem>
      </Accordion>
     </div>
    </nav>
   </SheetContent>
  </Sheet>
 );
}
