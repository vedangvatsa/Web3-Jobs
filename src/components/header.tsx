
'use client';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Menu, Linkedin, Twitter, Users, GraduationCap, Newspaper, Calculator, FileText, Globe, ListChecks, BookOpen, ChevronDown, Send, BrainCircuit, FileSignature, Rss, Briefcase, ClipboardEdit, UserMinus, Mic, Milestone, BarChart, Smile, Scale } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

export function Header() {
    const mainNavLinks = [
        { href: "/jobs", label: "Jobs", icon: Briefcase },
        { href: "/blog", label: "Playbook", icon: BookOpen },
        { href: "/news", label: "News", icon: Newspaper },
        { href: "/", label: "Community", icon: Users },
        { href: "https://academy.hashtagweb3.com/", label: "Academy", target: "_blank", icon: GraduationCap },
    ];

    const employeeLinks = [
        { href: "/interview-questions", label: "Interview Questions", icon: BookOpen },
        { href: "/web3-career-quiz", label: "Archetype Assessment", icon: BrainCircuit },
        { href: "/salary-calculator", label: "Salary Calculator", icon: Calculator },
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
        { href: "/tools/employee-milestones-tracker", label: "Milestones Tracker", icon: Milestone },
        { href: "/tools/employee-engagement-survey", label: "Engagement Survey", icon: Smile },
        { href: "/tools/work-life-balance-survey", label: "Work-Life Balance Survey", icon: Scale },
        { href: "/tools/company-culture-guide", label: "Company Culture Guide", icon: Users },
    ];

    const socialLinks = [
        { href: "https://x.com/hashtag_web3", label: "X", icon: Twitter, 'aria-label': 'Follow Hashtag Web3 on X' },
        { href: "https://linkedin.com/company/hashtagweb3", label: "LinkedIn", icon: Linkedin, 'aria-label': 'Follow Hashtag Web3 on LinkedIn' },
        { href: "https://t.me/hashtagweb3", label: "Telegram", icon: Send, 'aria-label': 'Join Hashtag Web3 on Telegram' },
    ]

    return (
        <header className="sticky top-0 z-30 w-full border-b bg-background/80 backdrop-blur-sm">
            <div className="container mx-auto flex h-14 items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-2" aria-label="Hashtag Web3 Homepage">
                    <Image src="/logo/HashtagWeb3.png" alt="Hashtag Web3 Logo" width={140} height={24} className="h-6 w-auto" priority />
                </Link>
                
                <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
                     {mainNavLinks.slice(0,3).map((link) => (
                         <Link
                            key={link.label}
                            href={link.href}
                            target={link.target}
                            rel={link.target ? "noopener noreferrer" : undefined}
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
                             <DropdownMenuLabel>For Employees</DropdownMenuLabel>
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

                     {mainNavLinks.slice(3).map((link) => (
                         <Link
                            key={link.label}
                            href={link.href}
                            target={link.target}
                            rel={link.target ? "noopener noreferrer" : undefined}
                            className="text-muted-foreground transition-colors hover:text-foreground"
                         >
                           {link.label}
                       </Link>
                    ))}

                    <div className="flex items-center gap-4">
                         {socialLinks.map((link) => (
                            <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" className="text-muted-foreground transition-colors hover:text-foreground" aria-label={link['aria-label']}>
                                <link.icon size={20} />
                                <span className="sr-only">{link.label}</span>
                            </a>
                        ))}
                    </div>
                    <a href="https://t.me/web3jobs_rep" target="_blank" rel="noopener noreferrer">
                        <Button size="sm">Post a Job</Button>
                    </a>
                </nav>

                <div className="lg:hidden">
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
                                        <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" className="text-muted-foreground transition-colors hover:text-foreground" aria-label={link['aria-label']}>
                                            <link.icon size={24} />
                                            <span className="sr-only">{link.label}</span>
                                        </a>
                                    ))}
                                </div>
                             </div>
                            <nav className="flex-grow flex flex-col p-4 overflow-y-auto">
                                <div className="flex-grow space-y-2">
                                 <SheetClose asChild>
                                    <a href="https://t.me/web3jobs_rep" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-3 rounded-lg text-base font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
                                        <Briefcase className="h-5 w-5" />
                                        <span>Post a Job</span>
                                    </a>
                                 </SheetClose>
                                {mainNavLinks.map((link) => (
                                    <SheetClose key={link.label} asChild>
                                         <Link
                                            href={link.href}
                                            target={link.target}
                                            rel={link.target ? "noopener noreferrer" : undefined}
                                            className="flex items-center gap-4 p-3 rounded-lg text-base font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                                        >
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
                                            <h4 className="px-2 py-1.5 text-sm font-semibold">For Employees</h4>
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
                </div>
            </div>
        </header>
    );
}
