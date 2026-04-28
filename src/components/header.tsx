
import { Button } from '@/components/ui/button';
import { Users, GraduationCap, Newspaper, Calculator, DollarSign, FileText, Globe, ListChecks, BookOpen, ChevronDown, Send, BrainCircuit, FileSignature, Briefcase, ClipboardEdit, UserMinus, Mic, Milestone, Smile, Scale, Building2, Library } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';
import type { SiteNavigationElement } from 'schema-dts';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { MobileNav } from './mobile-nav';

const mainNavLinks = [
  { href: "/", label: "Jobs", icon: Briefcase },
  { href: "/news", label: "News", icon: Newspaper },
  { href: "/community", label: "Community", icon: Users },
];

const resourceLinks = [
  { href: "/resources", label: "All Resources", icon: ListChecks },
  { href: "/companies", label: "Companies", icon: Building2 },
  { href: "/learn", label: "Learn Web3", icon: GraduationCap },
  { href: "/blog", label: "Playbook", icon: BookOpen },
  { href: "/glossary", label: "Glossary", icon: Library },
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

export function Header() {
  const siteUrl = 'https://hashtagweb3.com';
  const navigationSchema: SiteNavigationElement = {
    '@type': 'SiteNavigationElement',
    name: 'Main Navigation',
    about: 'Main navigation links for Hashtag Web3',
    hasPart: mainNavLinks.map(link => ({
      '@type': 'WebPage',
      name: link.label,
      url: link.href.startsWith('http') ? link.href : `${siteUrl}${link.href}`,
    }))
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/80 backdrop-blur-sm">
      <Script
        id="site-navigation-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(navigationSchema) }}
      />
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2" aria-label="Hashtag Web3 Homepage">
          <Image src="/logo/HashtagWeb3.png" alt="Hashtag Web3 Logo" width={140} height={24} className="h-6 w-auto" priority />
        </Link>

        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
          {mainNavLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground text-sm font-medium focus:outline-none">
              Resources <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64">
              <DropdownMenuLabel>Learn & Explore</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {resourceLinks.map(link => (
                <DropdownMenuItem key={link.label} asChild>
                  <Link href={link.href} target={link.target} rel={link.target ? "noopener noreferrer" : undefined} className="flex items-center gap-2">
                    <link.icon className="h-4 w-4 text-muted-foreground" />
                    {link.label}
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuLabel className="pt-2">For Employees</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {employeeLinks.map(link => (
                <DropdownMenuItem key={link.label} asChild>
                  <Link href={link.href} className="flex items-center gap-2">
                    <link.icon className="h-4 w-4 text-muted-foreground" />
                    {link.label}
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuLabel className="pt-2">For Employers</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {employerLinks.map(link => (
                <DropdownMenuItem key={link.label} asChild>
                  <Link href={link.href} className="flex items-center gap-2">
                    <link.icon className="h-4 w-4 text-muted-foreground" />
                    {link.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <a href="https://t.me/web3jobs_rep" target="_blank" rel="noopener noreferrer">
            <Button size="sm">Post a Job</Button>
          </a>
        </nav>

        <div className="lg:hidden">
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
