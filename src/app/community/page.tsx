
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Rss, MessageSquare, Linkedin, Twitter, Instagram, Mail, GraduationCap } from 'lucide-react';
import Link from 'next/link';

const communityLinks = [
  {
    href: 'https://t.me/web3hiring',
    label: 'Telegram Job Feed',
    description: 'Join 56,000+ subscribers for the latest job postings delivered directly to you.',
    icon: Rss,
  },
  {
    href: 'https://t.me/hashtagweb3',
    label: 'Telegram Discussion',
    description: 'Chat with other Web3 professionals, ask questions, and share insights.',
    icon: MessageSquare,
  },
  {
    href: 'https://x.com/hashtag_web3',
    label: 'X (formerly Twitter)',
    description: 'Follow us for real-time updates, industry news, and cultural commentary.',
    icon: Twitter,
  },
  {
    href: 'https://linkedin.com/company/hashtagweb3',
    label: 'LinkedIn',
    description: 'Connect with our professional network and see company updates.',
    icon: Linkedin,
  },
  {
    href: 'https://instagram.com/hashtagweb3',
    label: 'Instagram',
    description: 'Get a behind-the-scenes look at the Web3 world.',
    icon: Instagram,
  },
    {
    href: 'https://academy.hashtagweb3.com/',
    label: 'Web3 Academy',
    description: 'Level up your skills with our curated courses and educational content.',
    icon: GraduationCap,
  },
  {
    href: 'mailto:hi@hashtagweb3.com',
    label: 'Email Us',
    description: 'Have a question or want to partner with us? Get in touch.',
    icon: Mail,
  },
];

export default function CommunityPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <section className="text-center mb-12 max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary">
              Join The Hashtag Web3 Community
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Connect with us across our channels. Whether you're looking for a job, seeking to learn, or wanting to network, there's a place for you.
            </p>
          </section>

          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            {communityLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Card className="h-full transform transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:border-primary/20">
                  <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <link.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                          <CardTitle>{link.label}</CardTitle>
                          <CardDescription className="pt-1">{link.description}</CardDescription>
                      </div>
                  </CardHeader>
                </Card>
              </a>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
