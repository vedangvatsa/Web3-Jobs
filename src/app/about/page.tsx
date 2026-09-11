import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BookOpen, CheckCircle2, Radio, ShieldCheck } from 'lucide-react';
import { EditorialPageHero } from '@/components/editorial-page-hero';
import { PageShell } from '@/components/page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { channels, caseStudies, communityPhotos, stats } from '@/lib/community-data';

export const revalidate = 86400;

const standards = [
  { icon: ShieldCheck, title: 'Verified before visible', text: 'We check source quality, hiring signals, links, and duplicates before a role reaches the board.' },
  { icon: BookOpen, title: 'Useful context', text: 'The glossary, playbook, salary tools, and guides turn a listing into a better career decision.' },
  { icon: Radio, title: 'Open by default', text: 'Jobs, events, news, and definitions are available through the site, public APIs, and machine-readable feeds.' },
];

export default function AboutPage() {
  return (
    <main>
      <PageShell>
        <div className="site-container space-y-16 py-6 sm:space-y-20 sm:py-10">
          <EditorialPageHero
            eyebrow="About Hashtag Web3"
            title="Career infrastructure for an open internet."
            description="Hashtag Web3 connects builders, teams, and the wider Web3 community through verified work, practical career intelligence, and conversations that travel beyond the job board."
            image={communityPhotos[5].src}
            imageAlt={communityPhotos[5].alt}
          >
            <Link href="/jobs"><Button size="lg">Explore jobs <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
            <Link href="/community"><Button size="lg" variant="outline">See the community</Button></Link>
          </EditorialPageHero>

          <section className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
            <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm sm:p-9">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">The point of the platform</p>
              <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">Make the signal easier to find.</h2>
              <div className="mt-5 space-y-4 text-sm leading-7 text-muted-foreground sm:text-base">
                <p>Founded in 2022, Hashtag Web3 helps people navigate the decentralized economy without sorting through the same noise twice. We bring jobs, events, news, education, and practical tools into one useful layer.</p>
                <p>The community spans builders, operators, founders, recruiters, and curious people finding their way into Web3. The goal is simple: make the next good move more visible.</p>
              </div>
            </div>
            <div className="rounded-2xl bg-primary p-6 text-primary-foreground shadow-sm sm:p-9">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground/70">What we optimize for</p>
              <ul className="mt-6 space-y-5 text-sm leading-6">
                {['Less repetition, more useful context.', 'Real opportunities over vague promises.', 'A community that compounds knowledge.'].map((item) => <li key={item} className="flex gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />{item}</li>)}
              </ul>
            </div>
          </section>

          <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm sm:p-8">
            <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
              {stats.map((stat) => <div key={stat.label} className="border-l border-border pl-4"><p className="text-2xl font-bold text-primary sm:text-3xl">{stat.value}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{stat.label}</p></div>)}
            </div>
          </section>

          <section>
            <div className="mb-7 max-w-2xl"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">How we work</p><h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">A human editorial layer on top of a busy market.</h2></div>
            <div className="grid gap-5 md:grid-cols-3">{standards.map(({ icon: Icon, title, text }) => <Card key={title} className="shadow-sm"><CardContent className="p-6"><Icon className="h-6 w-6 text-primary" /><h3 className="mt-5 font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p></CardContent></Card>)}</div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
            <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">From the network</p><h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">Work gets better when the room gets wider.</h2><p className="mt-4 text-sm leading-7 text-muted-foreground">Our community work spans job distribution, media, events, and direct conversations with the teams building the ecosystem.</p></div>
            <div className="grid gap-4 sm:grid-cols-3">{caseStudies.map((study) => <div key={study.title} className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm"><div className="relative h-28"><Image src={study.image} alt={study.title} fill className="object-cover" sizes="(max-width: 640px) 100vw, 30vw" /></div><div className="p-4"><p className="text-sm font-semibold leading-5">{study.title}</p></div></div>)}</div>
          </section>

          <section className="rounded-2xl bg-muted/50 p-6 sm:p-9"><div className="grid gap-8 md:grid-cols-2"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Where people find us</p><h2 className="mt-3 text-2xl font-bold tracking-tight">One community, several useful doors.</h2></div><div className="grid gap-4 sm:grid-cols-2">{channels.slice(0, 4).map(({ icon: Icon, title, description }) => <div key={title} className="flex gap-3"><Icon className="mt-1 h-5 w-5 shrink-0 text-primary" /><div><h3 className="text-sm font-semibold">{title}</h3><p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p></div></div>)}</div></div></section>
        </div>
      </PageShell>
    </main>
  );
}
