import type { ElementType } from 'react';
import {
  Briefcase,
  Calendar,
  Newspaper,
  Users,
  Code2,
  ListChecks,
  Building2,
  GraduationCap,
  BookOpen,
  Library,
  BrainCircuit,
  Calculator,
  DollarSign,
  FileSignature,
  FileText,
  Globe,
  ClipboardEdit,
  Mic,
  UserMinus,
  Milestone,
  Smile,
  Scale,
  Twitter,
  Linkedin,
  Send,
  Instagram,
  Youtube,
  Mail,
} from 'lucide-react';

export interface NavLinkItem {
  href: string;
  label: string;
  icon?: ElementType;
  description?: string;
  target?: string;
  ariaLabel?: string;
}

export const MAIN_NAV_LINKS: NavLinkItem[] = [
  { href: '/', label: 'Jobs', icon: Briefcase },
  { href: '/events', label: 'Events', icon: Calendar },
  { href: '/news', label: 'News', icon: Newspaper },
  { href: '/community', label: 'Community', icon: Users },
];

export const RESOURCE_LINKS: NavLinkItem[] = [
  { href: '/resources', label: 'All Resources', icon: ListChecks },
  { href: '/companies', label: 'Companies', icon: Building2 },
  { href: '/learn', label: 'Learn Web3', icon: GraduationCap },
  { href: '/blog', label: 'Playbook', icon: BookOpen },
  { href: '/glossary', label: 'Glossary', icon: Library },
];

export const EMPLOYEE_RESOURCES: NavLinkItem[] = [
  {
    href: '/interview-questions',
    label: 'Interview Questions',
    icon: BookOpen,
    description: 'Practice with 200+ Web3 interview questions across technical and non-technical roles.',
  },
  {
    href: '/web3-career-quiz',
    label: 'Archetype Assessment',
    icon: BrainCircuit,
    description: 'Discover your Web3 personality and the career paths that match.',
  },
  {
    href: '/salary-calculator',
    label: 'Salary Calculator',
    icon: Calculator,
    description: 'Estimate your potential salary in the Web3 industry.',
  },
  {
    href: '/freelance-rates-by-industry',
    label: 'Freelance Rates by Industry',
    icon: DollarSign,
    description: 'Benchmark freelance hourly and project rates across industries and roles.',
  },
  {
    href: '/resume-builder',
    label: 'Resume Builder',
    icon: FileSignature,
    description: 'Craft a crypto-native resume that gets noticed by recruiters.',
  },
  {
    href: '/invoice-generator',
    label: 'Invoice Generator',
    icon: FileText,
    description: 'A free and simple invoice generator for Web3 freelancers.',
  },
  {
    href: '/digital-nomad-visas',
    label: 'Digital Nomad Visas',
    icon: Globe,
    description: 'A searchable list of visas for working remotely around the world.',
  },
  {
    href: '/remote-work-checklist',
    label: 'Remote Checklist',
    icon: ListChecks,
    description: 'Optimize your remote work setup for productivity and well-being.',
  },
];

export const EMPLOYER_RESOURCES: NavLinkItem[] = [
  {
    href: '/jd-builder',
    label: 'JD Builder',
    icon: ClipboardEdit,
    description: 'Craft the perfect job description to attract top Web3 talent.',
  },
  {
    href: '/offer-letter-customizer',
    label: 'Offer Letter Customizer',
    icon: FileSignature,
    description: 'Generate professional, customizable offer letters for new hires.',
  },
  {
    href: '/employee-onboarding-checklist',
    label: 'Onboarding Checklist',
    icon: ListChecks,
    description: 'Run a structured onboarding process for new Web3 hires.',
  },
  {
    href: '/interview-feedback-template',
    label: 'Interview Feedback',
    icon: Mic,
    description: 'Standardize your hiring process with structured feedback.',
  },
  {
    href: '/employee-exit-survey',
    label: 'Employee Exit Survey',
    icon: UserMinus,
    description: 'Gather valuable insights from departing team members.',
  },
  {
    href: '/employee-milestones-tracker',
    label: 'Milestones Tracker',
    icon: Milestone,
    description: 'Create structured 30-60-90 day plans for new employees.',
  },
  {
    href: '/employee-engagement-survey',
    label: 'Engagement Survey',
    icon: Smile,
    description: 'Quickly gauge team morale and satisfaction.',
  },
  {
    href: '/work-life-balance-survey',
    label: 'Work-Life Balance Survey',
    icon: Scale,
    description: 'Assess team workload and well-being to prevent burnout.',
  },
  {
    href: '/company-culture-guide',
    label: 'Company Culture Guide',
    icon: Users,
    description: "Define and document your company's values and ways of working.",
  },
];

export const SOCIAL_LINKS: NavLinkItem[] = [
  {
    href: 'https://x.com/hashtag_web3',
    label: 'X',
    icon: Twitter,
    ariaLabel: 'Follow Hashtag Web3 on X',
  },
  {
    href: 'https://linkedin.com/company/hashtagweb3',
    label: 'LinkedIn',
    icon: Linkedin,
    ariaLabel: 'Follow Hashtag Web3 on LinkedIn',
  },
  {
    href: 'https://t.me/hashtagweb3',
    label: 'Telegram',
    icon: Send,
    ariaLabel: 'Join Hashtag Web3 on Telegram',
  },
  {
    href: 'https://instagram.com/hashtagweb3',
    label: 'Instagram',
    icon: Instagram,
    ariaLabel: 'Follow Hashtag Web3 on Instagram',
  },
  {
    href: 'https://www.youtube.com/channel/UCr5WlEpTviHnnK856wG0EIg',
    label: 'YouTube',
    icon: Youtube,
    ariaLabel: 'Subscribe on YouTube',
  },
  {
    href: 'mailto:hi@hashtagweb3.com',
    label: 'Email',
    icon: Mail,
    ariaLabel: 'Email us',
  },
];

export const FOOTER_RESOURCES: Array<{ href: string; label: string }> = [
  { href: '/interview-questions', label: 'Interview Questions' },
  { href: '/web3-career-quiz', label: 'Archetype Assessment' },
  { href: '/salary-calculator', label: 'Salary Calculator' },
  { href: '/invoice-generator', label: 'Invoice Generator' },
  { href: '/resume-builder', label: 'Resume Builder' },
  { href: '/digital-nomad-visas', label: 'Digital Nomad Visas' },
  { href: '/remote-work-checklist', label: 'Remote Checklist' },
];

export const FOOTER_COMPANY: Array<{ href: string; label: string }> = [
  { href: '/about', label: 'About Us' },
  { href: '/contact', label: 'Contact Us' },
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/developers', label: 'Developer Portal & API' },
  { href: '/openapi.json', label: 'OpenAPI Spec' },
  { href: '/llms.txt', label: 'llms.txt' },
];

