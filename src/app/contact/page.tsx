import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, BriefcaseBusiness, Code2, Handshake, Send } from 'lucide-react';
import { EditorialPageHero } from '@/components/editorial-page-hero';
import { PageShell } from '@/components/page-shell';
import { ContactForm } from '@/components/contact-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { communityPhotos } from '@/lib/community-data';

export const revalidate = 86400;

export const metadata: Metadata = {
  title: 'Contact Us | Partnerships, Support & Developer Inquiries',
  description: 'Connect with the Hashtag Web3 team for event partnerships, hiring campaigns, API integrations, and community support.',
  alternates: { canonical: 'https://hashtagweb3.com/contact' },
  openGraph: { title: 'Contact Hashtag Web3', description: 'Direct communication channels for partnerships, hiring campaigns, API integrations, and community support.', url: 'https://hashtagweb3.com/contact', siteName: 'Hashtag Web3', type: 'website', images: [{ url: 'https://hashtagweb3.com/api/og?type=default&title=Contact%20Hashtag%20Web3', width: 1200, height: 630, alt: 'Contact Hashtag Web3' }] },
};

const routes = [
  { icon: Handshake, title: 'Partnerships & events', text: 'Conference promotions, community discounts, media partnerships, and collaborations.', email: 'contact@hashtagweb3.com', subject: 'Partnership Inquiry' },
  { icon: BriefcaseBusiness, title: 'Hiring & distribution', text: 'Reach Web3 candidates through the job board and our community channels.', email: 'contact@hashtagweb3.com', subject: 'Hiring Inquiry' },
  { icon: Code2, title: 'Developers & API', text: 'Questions about REST endpoints, OpenAPI schemas, feeds, or agent integrations.', email: 'dev@hashtagweb3.com', subject: 'API Inquiry' },
];

export default function ContactPage() {
  const schemaData = { '@context': 'https://schema.org', '@type': 'ContactPage', name: 'Contact Hashtag Web3', url: 'https://hashtagweb3.com/contact', description: 'Contact information and inquiry channels for Hashtag Web3 partnerships, hiring campaigns, and developer API support.' };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }} />
      <PageShell>
        <div className="site-container space-y-14 py-6 sm:space-y-18 sm:py-10">
          <EditorialPageHero eyebrow="Contact Hashtag Web3" title="Bring the right question to the right room." description="Tell us what you are building, hiring for, or trying to connect. We will route it to the team closest to the work." image={communityPhotos[10].src} imageAlt={communityPhotos[10].alt}>
            <a href="mailto:contact@hashtagweb3.com"><Button size="lg">Email the team <ArrowUpRight className="ml-2 h-4 w-4" /></Button></a>
            <a href="https://t.me/web3jobs_rep" target="_blank" rel="noopener noreferrer"><Button size="lg" variant="outline"><Send className="mr-2 h-4 w-4" /> Telegram</Button></a>
          </EditorialPageHero>

          <section className="grid gap-5 md:grid-cols-3">{routes.map(({ icon: Icon, title, text, email, subject }) => <Card key={title} className="shadow-sm"><CardContent className="p-6"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><Icon className="h-5 w-5 text-primary" /></div><h2 className="mt-5 font-semibold">{title}</h2><p className="mt-2 min-h-12 text-sm leading-6 text-muted-foreground">{text}</p><a href={`mailto:${email}?subject=${encodeURIComponent(subject)}`} className="mt-5 inline-flex items-center text-sm font-semibold text-primary hover:underline">{email}<ArrowUpRight className="ml-1 h-3.5 w-3.5" /></a></CardContent></Card>)}</section>

          <section className="grid gap-8 lg:grid-cols-[.72fr_1.28fr] lg:items-start">
            <div className="rounded-2xl bg-muted/50 p-6 sm:p-8"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Start here</p><h2 className="mt-3 text-2xl font-bold tracking-tight">A short note is enough.</h2><p className="mt-4 text-sm leading-7 text-muted-foreground">Include your organization, the outcome you want, and the best way to reach you. For hiring or partnership requests, links and dates help us move faster.</p><div className="mt-6 space-y-3 text-sm"><Link href="/community" className="flex items-center justify-between rounded-lg border border-border/70 bg-background p-3 font-medium hover:border-primary">See our community <ArrowUpRight className="h-4 w-4 text-primary" /></Link><Link href="/jobs" className="flex items-center justify-between rounded-lg border border-border/70 bg-background p-3 font-medium hover:border-primary">Browse live jobs <ArrowUpRight className="h-4 w-4 text-primary" /></Link></div></div>
            <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm sm:p-8"><ContactForm /></div>
          </section>

          <section className="grid gap-6 border-t border-border/70 pt-10 sm:grid-cols-[.65fr_1.35fr] sm:items-center"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Official channels</p><h2 className="mt-3 text-xl font-bold">Keep the conversation moving.</h2></div><div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground"><a href="https://t.me/web3hiring" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">Telegram channel</a><a href="https://x.com/hashtag_web3" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">X / Twitter</a><a href="https://linkedin.com/company/hashtagweb3" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">LinkedIn</a><a href="https://hashtagweb3.com/logo/HashtagWeb3.png" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">Brand assets</a></div></section>
        </div>
      </PageShell>
    </main>
  );
}
