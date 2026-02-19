
'use client';

import { Header } from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { 
    Users, 
    GraduationCap, 
    BookOpen, 
    BrainCircuit, 
    Calculator, 
    FileSignature, 
    FileText, 
    Globe, 
    ListChecks, 
    ClipboardEdit, 
    Mic, 
    UserMinus, 
    Milestone, 
    Smile, 
    Scale,
    ArrowRight
} from 'lucide-react';
import { TransitioningHeadline } from '@/components/transitioning-headline';
import { Button } from '@/components/ui/button';

const employeeResources = [
    { href: "/interview-questions", label: "Interview Questions", icon: BookOpen, description: "Ace your next Web3 interview with our comprehensive question bank." },
    { href: "/web3-career-quiz", label: "Archetype Assessment", icon: BrainCircuit, description: "Discover your Web3 personality and the career paths that match." },
    { href: "/salary-calculator", label: "Salary Calculator", icon: Calculator, description: "Estimate your potential salary in the Web3 industry." },
    { href: "/resume-builder", label: "Resume Builder", icon: FileSignature, description: "Craft a crypto-native resume that gets you noticed by recruiters." },
    { href: "/invoice-generator", label: "Invoice Generator", icon: FileText, description: "A free and simple invoice generator for Web3 freelancers." },
    { href: "/digital-nomad-visas", label: "Digital Nomad Visas", icon: Globe, description: "A searchable list of visas for working remotely around the world." },
    { href: "/remote-work-checklist", label: "Remote Checklist", icon: ListChecks, description: "Optimize your remote work setup for productivity and well-being." },
];

const employerResources = [
    { href: "/jd-builder", label: "JD Builder", icon: ClipboardEdit, description: "Craft the perfect job description to attract top Web3 talent." },
    { href: "/offer-letter-customizer", label: "Offer Letter Customizer", icon: FileSignature, description: "Generate professional, customizable offer letters for new hires." },
    { href: "/employee-onboarding-checklist", label: "Onboarding Checklist", icon: ListChecks, description: "A comprehensive checklist for successfully onboarding new Web3 hires." },
    { href: "/interview-feedback-template", label: "Interview Feedback", icon: Mic, description: "Standardize your hiring process with our structured feedback template." },
    { href: "/employee-exit-survey", label: "Employee Exit Survey", icon: UserMinus, description: "Gather valuable insights from departing team members." },
    { href: "/employee-milestones-tracker", label: "Milestones Tracker", icon: Milestone, description: "Create structured 30-60-90 day plans for new employees." },
    { href: "/employee-engagement-survey", label: "Engagement Survey", icon: Smile, description: "Quickly gauge team morale and satisfaction with our pulse survey." },
    { href: "/work-life-balance-survey", label: "Work-Life Balance Survey", icon: Scale, description: "Assess team workload and well-being to prevent burnout." },
    { href: "/company-culture-guide", label: "Company Culture Guide", icon: Users, description: "Define and document your company's values and ways of working." },
];

const ResourceCard = ({ href, label, icon: Icon, description }: { href: string; label: string; icon: React.ElementType; description: string; }) => (
    <Link href={href} className="block h-full">
        <Card className="h-full transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                        <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>{label}</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    </Link>
);

export default function ResourcesPage() {
    const headlines = [
        "Web3 Career Resources",
        "Tools for Builders",
        "Your Professional Toolkit",
        "Level Up Your Career"
    ];

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">
                <div className="container mx-auto px-4 py-8 md:py-16">
                    <section className="text-center mb-12 max-w-4xl mx-auto">
                        <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                          <GraduationCap className="h-10 w-10 text-primary" />
                        </div>
                        <h1 className="sr-only">Free Web3 Career Tools</h1>
                        <TransitioningHeadline phrases={headlines} />
                         <p className="mt-4 text-muted-foreground">
                            A complete suite of free tools and resources for professionals and companies building in the decentralized economy.
                        </p>
                    </section>

                    <div className="max-w-7xl mx-auto space-y-16">
                        <div>
                            <h2 className="text-3xl font-bold text-center mb-8">For Professionals & Job Seekers</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {employeeResources.map(tool => <ResourceCard key={tool.label} {...tool} />)}
                            </div>
                        </div>

                        <div>
                            <h2 className="text-3xl font-bold text-center mb-8">For Employers & Hiring Managers</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {employerResources.map(tool => <ResourceCard key={tool.label} {...tool} />)}
                            </div>
                        </div>
                    </div>
                    
                    <Card className="mt-16 max-w-5xl mx-auto bg-primary/5 border-primary/20">
                        <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                            <div>
                                <h3 className="text-xl font-bold text-primary mb-1">Looking for a Web3 Job?</h3>
                                <p className="text-muted-foreground">Now that you have the resources, find the perfect role on the #1 Web3 job board.</p>
                            </div>
                            <Link href="/jobs" className="flex-shrink-0 mt-4 md:mt-0">
                                <Button size="lg">
                                    Explore Jobs <ArrowRight className="ml-2 h-4 w-4"/>
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                </div>
            </main>
        </div>
    );
}
