'use client';

import type { Job, Article, NewsItem } from '@/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Briefcase, BookOpen, Newspaper, Send, Smartphone } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { MediaCarousel } from './media-carousel';
import { LogoGridCarousel } from '@/components/logo-grid-carousel';
import { JobCard } from '@/components/job-card';
import { NewsCard } from '@/components/news-card';
import { ArticleCard } from '@/components/article-card';
import type { CompanyLogoMap } from '@/lib/job-logo-map';
import { getCompanySlug, getJobSlug } from '@/lib/job-slugs';
import { useRef } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  stats, companies, partnersLogos, mediaLogos, hiredCompanies,
  channels, caseStudies, communityPhotos, whatsappGroups,
  testimonials, resources,
} from '@/lib/community-data';

export function CommunityPageContent({ 
  latestJobs,
  latestArticles,
  latestNews,
  companyLogos = {},
}: { 
  latestJobs: Job[],
  latestArticles: Omit<Article, 'content'>[],
  latestNews: NewsItem[],
  companyLogos?: CompanyLogoMap,
}) {
  const plugin = useRef(
    Autoplay({ delay: 2000, stopOnInteraction: false })
  );

  const conversationCompanies = companies.filter(c => c.name !== 'Bitget' && c.name !== 'Binance');

  return (
    <div className="space-y-12 sm:space-y-16">
      
      {/* Hero Section */}
      <section className="w-full">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="text-center md:text-left">
            <h1 className="text-3xl sm:text-4xl font-bold mt-2 tracking-tight">Join Our 100k+ Global Community</h1>
            <p className="mt-4 text-muted-foreground text-sm sm:text-base leading-relaxed">
              Our community has over 100,000 Web3 professionals who share insights, find jobs, and discuss the latest in the decentralized world.
            </p>
            <a href="https://t.me/hashtagweb3" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="mt-6 w-full sm:w-auto">
                <Send className="mr-2 h-5 w-5"/> Join Discussion
              </Button>
            </a>
          </div>
          <LogoGridCarousel logos={conversationCompanies} delay={2500} />
        </div>
      </section>

      {/* Media Logos Carousel */}
      <section className="w-full">
        <MediaCarousel logos={mediaLogos} />
      </section>

      {/* Multi-Channel Presence */}
      <section className="w-full">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8">Multi-Channel Presence</h2>
        <Card className="mb-8 w-full sm:mb-10">
          <CardContent className="p-4 sm:p-6 md:p-8">
            <div className="grid grid-cols-2 gap-4 text-center sm:gap-8 md:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="p-2">
                  <p className="text-3xl font-bold text-foreground sm:text-4xl">{stat.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{stat.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:gap-x-12 lg:gap-y-10">
          {channels.map((channel, i) => (
            <div key={i} className="flex items-start gap-4 sm:gap-6">
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 sm:h-14 sm:w-14">
                  <channel.icon className="h-6 w-6 text-primary sm:h-7 sm:w-7" />
                </div>
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-semibold sm:text-lg">{channel.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">{channel.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      
      {/* Case Studies */}
      <section className="w-full">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">Case Studies</h2>
          <p className="text-muted-foreground text-sm sm:text-base">We have helped many companies find the right audience.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:items-stretch">
          {caseStudies.map((study) => (
            <Card key={study.title} className="flex h-full flex-col overflow-hidden border-border/70 bg-card shadow-none">
              <div className="relative h-48 w-full bg-muted/25 sm:h-56">
                <Image
                  src={study.image}
                  alt={`${study.title} - Hashtag Web3 case study`}
                  fill
                  className="object-contain p-2 sm:p-3"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  data-ai-hint={study.data_ai_hint}
                />
              </div>
              <CardHeader className="p-4 pb-2 sm:p-5">
                <CardTitle className="text-lg leading-snug sm:text-xl">{study.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow p-4 pt-0 sm:p-5 sm:pt-0">
                <ul className="list-disc space-y-1.5 pl-4 text-xs text-muted-foreground sm:pl-5 sm:text-sm">
                  {study.points.map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Regional WhatsApp Groups */}
      <section className="w-full">
        <Card className="w-full shadow-sm">
          <CardContent className="p-4 sm:p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-center">
              <div className="lg:col-span-1 text-center md:text-left">
                <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">Join Our Regional WhatsApp Groups</h3>
                <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">Connect with Web3 professionals in your region. Approval is based on your WhatsApp number country code.</p>
              </div>
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {whatsappGroups.map((group) => (
                  <a href={group.link} key={group.region} target="_blank" rel="noopener noreferrer" className="w-full">
                    <Button variant="outline" className="w-full text-xs sm:text-sm h-10 truncate justify-center">
                      <Smartphone className="mr-2 h-4 w-4 shrink-0" />
                      <span className="truncate">{group.region}</span>
                    </Button>
                  </a>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Community Moments */}
      <section className="w-full">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">Community Moments</h2>
          <p className="text-muted-foreground text-sm sm:text-base">Highlights from events, partnerships, and community activities.</p>
        </div>
        <Carousel 
          className="w-full"
          plugins={[plugin.current]}
          onMouseEnter={() => plugin.current.stop()}
          onMouseLeave={() => plugin.current.play()}
          opts={{ loop: true }}
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {communityPhotos.map((photo, index) => (
              <CarouselItem key={index} className="pl-2 md:pl-4 basis-1/2 sm:basis-1/2 lg:basis-1/3">
                <Card className="overflow-hidden shadow-sm">
                  <CardContent className="flex aspect-square items-center justify-center p-0">
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      width={500}
                      height={500}
                      className="object-cover w-full h-full"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>
      </section>

      {/* Promote with Hashtag Web3 */}
      <section className="w-full">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <LogoGridCarousel
            logos={partnersLogos}
            delay={3000}
            className="order-2 md:order-1"
          />
          <div className="order-1 md:order-2 text-center md:text-left">
            <h2 className="text-3xl sm:text-4xl font-bold mt-2">Promote with Hashtag Web3</h2>
            <p className="mt-4 text-muted-foreground text-sm sm:text-base leading-relaxed">
              Tap into our network of over 100,000 Web3 professionals. We help you connect with developers, investors, and early adopters through targeted campaigns, content collaborations, and community engagement.
            </p>
            <a href="https://t.me/web3jobs_rep" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="mt-6 w-full sm:w-auto">Contact Us <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </a>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="w-full">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-6">What Our Community Says</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:items-stretch">
          {testimonials.map((testimonial, i) => (
            <Card
              key={i}
              className="flex h-full flex-col border-border/70 bg-card shadow-none"
            >
              <CardContent className="flex h-full flex-col p-4 sm:p-5">
                <blockquote className="flex-1 text-sm leading-relaxed text-foreground/90">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
                <div className="mt-4 flex items-center gap-3 border-t border-border/60 pt-4">
                  <Image
                    src={testimonial.image}
                    alt={`Photo of ${testimonial.author}, ${testimonial.title}`}
                    width={40}
                    height={40}
                    className="h-10 w-10 shrink-0 rounded-full object-cover"
                    sizes="40px"
                  />
                  <div className="min-w-0 text-left">
                    <p className="truncate text-sm font-semibold leading-tight">{testimonial.author}</p>
                    <p className="truncate text-xs text-muted-foreground">{testimonial.title}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Hire with Hashtag Web3 */}
      <section className="w-full">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="text-center md:text-left">
            <h2 className="text-3xl sm:text-4xl font-bold mt-2">Hire with Hashtag Web3</h2>
            <p className="mt-4 text-muted-foreground text-sm sm:text-base leading-relaxed">
              We connect leading Web3 companies with our global network of over 100,000 crypto-native professionals. 
              Our platform is the go-to source for developers, marketers, and PMs looking for their next role in the decentralized economy.
            </p>
            <a href="https://t.me/web3jobs_rep" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="mt-6 w-full sm:w-auto">Post a Job <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </a>
          </div>
          <LogoGridCarousel logos={hiredCompanies} delay={3000} />
        </div>
      </section>
      
      {/* Explore Our Resources */}
      <section className="w-full">
        <div className="mb-4 text-center sm:mb-5">
          <h2 className="text-2xl font-bold sm:text-3xl">Explore Our Resources</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
            Free tools for Web3 professionals and hiring teams.
          </p>
        </div>
        <Card className="w-full border-border/70 bg-card shadow-none">
          <CardContent className="p-4 sm:p-6">
            <ul className="grid grid-cols-1 gap-x-6 gap-y-0.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {resources.map((resource) => (
                <li key={resource.href}>
                  <Link
                    href={resource.href}
                    className="group flex items-center gap-2 rounded-md py-2 text-sm text-foreground/90 transition-colors hover:text-foreground"
                  >
                    <resource.icon
                      className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground"
                      aria-hidden
                    />
                    <span className="min-w-0 truncate">{resource.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-4 border-t border-border/60 pt-4 text-center">
              <Link
                href="/resources"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                View all resources
                <ArrowRight className="ml-1 inline h-3.5 w-3.5" aria-hidden />
              </Link>
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Latest Jobs / News / Playbook Tabs */}
      <section className="w-full">
        <Tabs defaultValue="jobs" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-auto p-1">
            <TabsTrigger value="jobs" className="text-xs sm:text-sm py-2 px-1 sm:px-3 flex items-center justify-center">
              <Briefcase className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0"/>
              <span className="truncate">Latest Jobs</span>
            </TabsTrigger>
            <TabsTrigger value="news" className="text-xs sm:text-sm py-2 px-1 sm:px-3 flex items-center justify-center">
              <Newspaper className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0"/>
              <span className="truncate">Latest News</span>
            </TabsTrigger>
            <TabsTrigger value="playbook" className="text-xs sm:text-sm py-2 px-1 sm:px-3 flex items-center justify-center">
              <BookOpen className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0"/>
              <span className="truncate"><span className="hidden sm:inline">From the </span>Playbook</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="jobs" className="mt-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {latestJobs.map((job) => {
                const logo = companyLogos[getCompanySlug(job.company)];
                return (
                  <JobCard
                    key={getJobSlug(job)}
                    job={job}
                    logoUrl={logo?.logo}
                    faviconUrl={logo?.favicon}
                  />
                );
              })}
            </div>
            <Button variant="outline" className="mt-4 w-full" asChild>
              <Link href="/jobs">View all jobs <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </TabsContent>
          <TabsContent value="news" className="mt-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {latestNews.map((item, i) => (
                <NewsCard key={`${item.link}-${i}`} item={item} />
              ))}
            </div>
            <Button variant="outline" className="mt-4 w-full" asChild>
              <Link href="/news">View all news <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </TabsContent>
          <TabsContent value="playbook" className="mt-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {latestArticles.map((article) => (
                <ArticleCard
                  key={article.slug}
                  article={article}
                  variant="compact"
                  showDescription={false}
                />
              ))}
            </div>
            <Button variant="outline" className="mt-4 w-full" asChild>
              <Link href="/blog">View all articles <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </TabsContent>
        </Tabs>
      </section>

    </div>
  );
}
