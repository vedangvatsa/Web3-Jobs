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
  { icon: Radio, title: 'Open by default', text: 'Jobs, events, news, and definitions are available through the site and public machine-readable catalogues.' },
];

export default function AboutPage() {
  return (
    <main>
      <PageShell>
        <div className="space-y-16 py-6 sm:space-y-20 sm:py-10">
          <EditorialPageHero
            eyebrow="About Hashtag Web3"
            title="A community for people working in Web3."
            description="Hashtag Web3 brings together jobs, career resources, industry news and events for blockchain professionals, hiring teams and people exploring their first role in the industry."
            image={communityPhotos[5].src}
            imageAlt={communityPhotos[5].alt}
          >
            <Button asChild size="lg"><Link href="/jobs">Explore jobs <ArrowRight className="ml-2 h-4 w-4" aria-hidden /></Link></Button>
            <Button asChild size="lg" variant="outline"><Link href="/community">See the community</Link></Button>
          </EditorialPageHero>

          <section className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
            <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm sm:p-9">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">The point of the platform</p>
              <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">Careers, learning and conversation.</h2>
              <div className="mt-5 space-y-4 text-sm leading-7 text-muted-foreground sm:text-base">
                <p>Founded in 2022, Hashtag Web3 connects developers, marketers, product managers, founders, recruiters and other professionals working across blockchain and crypto.</p>
                <p>Our job board helps people discover roles, while our guides and tools support the work around an application: understanding a role, preparing for interviews, building a resume and discussing compensation.</p>
                <p>Beyond the website, members share opportunities and ideas through Telegram, regional WhatsApp groups, LinkedIn, X Spaces and podcasts. Our <Link href="/community" className="underline underline-offset-4">community page</Link> brings those conversations, resources and ways to join together.</p>
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
            <h2 className="mb-6 text-xl font-semibold">Community reach</h2>
            <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
              {stats.map((stat) => <div key={stat.label} className="border-l border-border pl-4"><p className="text-2xl font-bold text-primary sm:text-3xl">{stat.value}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{stat.label}</p></div>)}
            </div>
          </section>

          <section>
            <div className="mb-7 max-w-2xl"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">How we work</p><h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">Source checks and practical context.</h2></div>
            <div className="grid gap-5 md:grid-cols-3">{standards.map(({ icon: Icon, title, text }) => <Card key={title} className="shadow-sm"><CardContent className="p-6"><Icon className="h-6 w-6 text-primary" /><h3 className="mt-5 font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p></CardContent></Card>)}</div>
          </section>

          <section aria-labelledby="about-collaborations">
            <div className="mb-8 max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Community collaborations</p>
              <h2 id="about-collaborations" className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">Demo days, founder interviews and events.</h2>
              <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">Our work with teams includes event promotion, content collaborations and conversations with founders. These examples and their reported results come from our community case studies.</p>
            </div>
            <div className="divide-y divide-border">
              {caseStudies.map((study) => (
                <article key={study.title} className="grid gap-6 py-8 first:pt-0 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] md:gap-10">
                  <div className="relative aspect-[3/2] overflow-hidden rounded-xl bg-muted">
                    <Image src={study.image} alt={study.title} fill className="object-contain" sizes="(max-width: 768px) 100vw, 40vw" />
                  </div>
                  <div className="self-center">
                    <h3 className="text-xl font-semibold sm:text-2xl">{study.title}</h3>
                    <ul className="mt-5 list-disc space-y-3 pl-5 text-sm leading-7 text-muted-foreground sm:text-base">
                      {study.points.map(point => <li key={point}>{point}</li>)}
                    </ul>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-2xl bg-muted/50 p-6 sm:p-9" aria-labelledby="about-channels">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Where people find us</p>
              <h2 id="about-channels" className="mt-3 text-2xl font-bold tracking-tight">A conversation beyond the job board.</h2>
              <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">Members use our channels to follow job openings and industry news, discuss their work, and meet people in their region. The community directory includes WhatsApp groups for Europe, North America, Africa, Asia, South America and India.</p>
            </div>
            <div className="mt-8 grid gap-x-10 gap-y-7 sm:grid-cols-2">
              {channels.filter(channel => channel.title !== 'Newsletter').map(({ icon: Icon, title, description }) => (
                <div key={title} className="flex gap-3">
                  <Icon className="mt-1 h-5 w-5 shrink-0 text-primary" aria-hidden />
                  <div><h3 className="text-base font-semibold">{title}</h3><p className="mt-2 text-sm leading-7 text-muted-foreground">{description}</p></div>
                </div>
              ))}
            </div>
            <Link href="/community" className="mt-7 inline-flex min-h-11 items-center gap-2 font-medium underline underline-offset-4">Find a community channel <ArrowRight className="h-4 w-4" aria-hidden /></Link>
          </section>

          <section className="grid gap-10 border-t border-border pt-10 md:grid-cols-2" aria-labelledby="about-participate">
            <div>
              <h2 id="about-participate" className="text-2xl font-bold tracking-tight">For professionals and hiring teams.</h2>
              <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">Explore opportunities on the <Link href="/jobs" className="underline underline-offset-4">job board</Link>, prepare with our <Link href="/resources" className="underline underline-offset-4">career resources</Link>, or find a conference and side event in the <Link href="/events" className="underline underline-offset-4">event directory</Link>.</p>
              <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">Hiring teams and organizers can contact us about job distribution, targeted campaigns, content collaborations and event promotion.</p>
            </div>
            <div className="self-center">
              <h3 className="text-xl font-semibold">Talk to Hashtag Web3</h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">Share the role you are hiring for, the event you are organizing, or the collaboration you have in mind.</p>
              <div className="mt-5 flex flex-wrap gap-4">
                <Button asChild><a href="https://t.me/web3jobs_rep" target="_blank" rel="noopener noreferrer">Contact on Telegram <ArrowRight className="ml-2 h-4 w-4" aria-hidden /></a></Button>
                <Button asChild variant="outline"><Link href="/contact">Contact details</Link></Button>
              </div>
            </div>
          </section>
        </div>
      </PageShell>
    </main>
  );
}
