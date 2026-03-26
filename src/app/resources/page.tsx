
import { Header } from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import {
    Users,
    GraduationCap,
    BookOpen,
    BrainCircuit,
    Calculator,
    DollarSign,
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
    ArrowRight,
    Lightbulb,
    CheckSquare,
    AlertTriangle,
    Wrench,
    ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAllResourcePages } from '@/lib/pseo';
import { Metadata } from 'next';
import type { ResourcePage } from '@/types/pseo';

export const metadata: Metadata = {
    title: 'Free Web3 Career Tools and Resources | Hashtag Web3',
    description: 'A complete suite of free tools and resources for professionals and companies building in the decentralized economy.',
};

const employeeResources = [
    { href: "/interview-questions", label: "Interview Questions", icon: BookOpen, description: "Practice with 200+ Web3 interview questions across technical and non-technical roles." },
    { href: "/web3-career-quiz", label: "Archetype Assessment", icon: BrainCircuit, description: "Discover your Web3 personality and the career paths that match." },
    { href: "/salary-calculator", label: "Salary Calculator", icon: Calculator, description: "Estimate your potential salary in the Web3 industry." },
    { href: "/freelance-rates-by-industry", label: "Freelance Rates by Industry", icon: DollarSign, description: "Benchmark freelance hourly and project rates across industries and roles." },
    { href: "/resume-builder", label: "Resume Builder", icon: FileSignature, description: "Craft a crypto-native resume that gets you noticed by recruiters." },
    { href: "/invoice-generator", label: "Invoice Generator", icon: FileText, description: "A free and simple invoice generator for Web3 freelancers." },
    { href: "/digital-nomad-visas", label: "Digital Nomad Visas", icon: Globe, description: "A searchable list of visas for working remotely around the world." },
    { href: "/remote-work-checklist", label: "Remote Checklist", icon: ListChecks, description: "Optimize your remote work setup for productivity and well-being." },
];

const employerResources = [
    { href: "/jd-builder", label: "JD Builder", icon: ClipboardEdit, description: "Craft the perfect job description to attract top Web3 talent." },
    { href: "/offer-letter-customizer", label: "Offer Letter Customizer", icon: FileSignature, description: "Generate professional, customizable offer letters for new hires." },
    { href: "/employee-onboarding-checklist", label: "Onboarding Checklist", icon: ListChecks, description: "Run a structured onboarding process for new Web3 hires." },
    { href: "/interview-feedback-template", label: "Interview Feedback", icon: Mic, description: "Standardize your hiring process with our structured feedback template." },
    { href: "/employee-exit-survey", label: "Employee Exit Survey", icon: UserMinus, description: "Gather valuable insights from departing team members." },
    { href: "/employee-milestones-tracker", label: "Milestones Tracker", icon: Milestone, description: "Create structured 30-60-90 day plans for new employees." },
    { href: "/employee-engagement-survey", label: "Engagement Survey", icon: Smile, description: "Quickly gauge team morale and satisfaction with our pulse survey." },
    { href: "/work-life-balance-survey", label: "Work-Life Balance Survey", icon: Scale, description: "Assess team workload and well-being to prevent burnout." },
    { href: "/company-culture-guide", label: "Company Culture Guide", icon: Users, description: "Define and document your company's values and ways of working." },
];

const contentTypeConfig: Record<string, { label: string; icon: React.ElementType }> = {
    ideas:     { label: "Project Ideas",      icon: Lightbulb },
    checklists:{ label: "Checklist",          icon: CheckSquare },
    mistakes:  { label: "Common Mistakes",    icon: AlertTriangle },
    tools:     { label: "Tool Guide",         icon: Wrench },
    guides:    { label: "Guide",              icon: BookOpen },
};

// Niche display names
const nicheLabels: Record<string, string> = {
    'solidity-developer':       'Solidity Developer',
    'web3-frontend-developer':  'Web3 Frontend Developer',
    'blockchain-engineer':      'Blockchain Engineer',
    'nft-developer':            'NFT Developer',
    'defi-developer':           'DeFi Developer',
    'solana-developer':         'Solana Developer',
    'gamefi-developer':         'GameFi Developer',
    'zk-engineer':              'ZK Engineer',
    'smart-contract-auditor':   'Smart Contract Auditor',
    'web3-product-manager':     'Web3 Product Manager',
    'web3-community-manager':   'Web3 Community Manager',
    'web3-marketer':            'Web3 Marketer',
    'web3-devrel':              'Web3 DevRel',
    'tokenomics-designer':      'Tokenomics Designer',
    'dao-contributor':          'DAO Contributor',
};

const ResourceCard = ({ href, label, icon: Icon, description }: { href: string; label: string; icon: React.ElementType; description: string }) => (
    <Link href={href} className="block h-full">
        <Card className="h-full transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
            <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg shrink-0">
                        <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-sm font-semibold leading-tight">{label}</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
            </CardContent>
        </Card>
    </Link>
);

function NicheResourceGroup({ niche, pages }: { niche: string; pages: ResourcePage[] }) {
    const label = nicheLabels[niche] ?? niche.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    return (
        <div className="border rounded-lg p-5">
            <h3 className="font-semibold text-sm mb-3">{label}</h3>
            <ul className="space-y-1">
                {pages.map(page => {
                    const config = contentTypeConfig[page.meta.contentType] ?? { label: page.meta.contentType, icon: BookOpen };
                    const Icon = config.icon;
                    // Use page title, but strip the niche suffix to keep it concise
                    const nicheLabel = nicheLabels[niche] ?? niche.replace(/-/g, ' ');
                    const displayTitle = page.seo.title
                        .replace(new RegExp(`\\s*(for\\s+)?${nicheLabel}s?\\s*$`, 'i'), '')
                        .replace(/\s+$/, '');
                    return (
                        <li key={page.seo.canonicalSlug}>
                            <Link
                                href={`/${page.seo.canonicalSlug}`}
                                className="flex items-center gap-2 text-sm py-1 px-2 rounded-md hover:bg-muted transition-colors group"
                            >
                                <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                <span className="text-muted-foreground group-hover:text-foreground transition-colors">{displayTitle || page.seo.title}</span>
                                <ChevronRight className="h-3 w-3 text-muted-foreground/50 ml-auto shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

export default function ResourcesPage() {
    const allResources = getAllResourcePages();

    // Group by niche, then sort niches by number of resources (most first)
    const resourcesByNiche = allResources.reduce((acc, resource) => {
        const niche = resource.meta.niche;
        if (!acc[niche]) acc[niche] = [];
        acc[niche].push(resource);
        return acc;
    }, {} as Record<string, ResourcePage[]>);

    const sortedNiches = Object.entries(resourcesByNiche).sort((a, b) => b[1].length - a[1].length);

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">
                <div className="container mx-auto px-4 py-8 md:py-16">

                    {/* Hero */}
                    <section className="text-center mb-12 max-w-3xl mx-auto">
                        <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                            <GraduationCap className="h-10 w-10 text-primary" />
                        </div>
                        <h1 className="text-4xl font-bold mb-3">Web3 Career Resources</h1>
                        <p className="text-muted-foreground">
                            Free tools and guides for professionals building in the decentralized economy.
                        </p>
                    </section>

                    <div className="max-w-7xl mx-auto space-y-16">

                        {/* Role-specific pSEO resources: by niche */}
                        {sortedNiches.length > 0 && (
                            <section>
                                <div className="mb-6">
                                    <h2 className="text-2xl font-bold mb-1">For Web3 Builders</h2>
                                    <p className="text-sm text-muted-foreground">
                                        Role-specific guides, checklists, and tool recommendations.
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {sortedNiches.map(([niche, pages]) => (
                                        <NicheResourceGroup key={niche} niche={niche} pages={pages} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* For Professionals */}
                        <section>
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold mb-1">For Job Seekers</h2>
                                <p className="text-sm text-muted-foreground">
                                    Tools to help you find, land, and thrive in a Web3 role.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {employeeResources.map(tool => <ResourceCard key={tool.label} {...tool} />)}
                            </div>
                        </section>

                        {/* For Employers */}
                        <section>
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold mb-1">For Hiring Teams</h2>
                                <p className="text-sm text-muted-foreground">
                                    Templates and tools to hire, onboard, and retain Web3 talent.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {employerResources.map(tool => <ResourceCard key={tool.label} {...tool} />)}
                            </div>
                        </section>

                    </div>

                    {/* CTA */}
                    <Card className="mt-16 max-w-4xl mx-auto bg-primary/5 border-primary/20">
                        <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                            <div>
                                <h3 className="text-lg font-bold text-primary mb-1">Looking for a Web3 Job?</h3>
                                <p className="text-sm text-muted-foreground">Now that you have the resources, find the perfect role on the #1 Web3 job board.</p>
                            </div>
                            <Link href="/jobs" className="flex-shrink-0">
                                <Button size="lg">
                                    Explore Jobs <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                </div>
            </main>
        </div>
    );
}
