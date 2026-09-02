'use client';

import type { Job, Article, NewsItem } from '@/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Briefcase, BookOpen, Newspaper, Send, Smartphone } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import Image from 'next/image';
import { MediaCarousel } from './media-carousel';
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
  testimonials, resources, chunkArray,
} from '@/lib/community-data';

const CompactJobItem = ({ job }: { job: Job }) => (
  <a href={job.link} target="_blank" rel="noopener noreferrer" className="block p-3 rounded-lg hover:bg-secondary transition-colors text-left">
    <p className="font-semibold truncate text-sm">{job.title}</p>
    <p className="text-xs text-muted-foreground truncate">{job.company}</p>
  </a>
);

const CompactNewsItem = ({ item }: { item: NewsItem }) => (
  <a href={item.link} target="_blank" rel="noopener noreferrer" className="block p-3 rounded-lg hover:bg-secondary transition-colors text-left">
    <p className="font-semibold truncate text-sm">{item.title}</p>
    <p className="text-xs text-muted-foreground truncate">{item.source}</p>
  </a>
);

const CompactArticleItem = ({ article }: { article: Omit<Article, 'content'> }) => (
  <Link href={`/${article.slug}`} className="block p-3 rounded-lg hover:bg-secondary transition-colors text-left">
    <p className="font-semibold truncate text-sm">{article.title}</p>
    <p className="text-xs text-muted-foreground truncate">{article.category}</p>
  </Link>
);

export function CommunityPageContent({ 
  latestJobs,
  latestArticles,
  latestNews
}: { 
  latestJobs: Job[],
  latestArticles: Omit<Article, 'content'>[],
  latestNews: NewsItem[]
}) {
  const plugin = useRef(
    Autoplay({ delay: 2000, stopOnInteraction: false })
  );
  const companyCarouselPlugin = useRef(
    Autoplay({ delay: 2500, stopOnInteraction: false })
  );
  const partnersCarouselPlugin = useRef(
    Autoplay({ delay: 3000, stopOnInteraction: false })
  );
  const hiredCarouselPlugin = useRef(
    Autoplay({ delay: 3000, stopOnInteraction: false })
  );
  
  const conversationCompanies = companies.filter(c => c.name !== 'Bitget' && c.name !== 'Binance');

  const hiredCompaniesChunks = chunkArray(hiredCompanies, 12);
  const companyChunks = chunkArray(conversationCompanies, 12);
  const partnersLogosChunks = chunkArray(partnersLogos, 12);

  return (
    <div className="site-container space-y-12 sm:space-y-16">
      
      {/* Hero Section */}
      <section className="w-full">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="text-center md:text-left">
            <h1 className="text-3xl sm:text-4xl font-bold mt-2 tracking-tight">Join Our 100k+ Global Community</h1>
            <p className="mt-4 text-muted-foreground text-sm sm:text-base leading-relaxed">
              Our network is home to over 100,000 Web3 professionals who share insights, find jobs, and discuss the latest in the decentralized world. Join the conversation today.
            </p>
            <a href="https://t.me/hashtagweb3" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="mt-6 w-full sm:w-auto">
                <Send className="mr-2 h-5 w-5"/> Join Discussion
              </Button>
            </a>
          </div>
          <Carousel 
            className="w-full"
            plugins={[companyCarouselPlugin.current]}
            opts={{ loop: true }}
          >
            <CarouselContent>
              {companyChunks.map((chunk, i) => (
                <CarouselItem key={i}>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-4 p-2 sm:p-4">
                    {chunk.map((logo) => (
                      <div key={logo.name} className="relative h-14 sm:h-16 w-full flex items-center justify-center p-2 bg-background rounded-md shadow-sm border border-border/50" title={logo.name}>
                        <Image
                          src={logo.src}
                          alt={logo.alt}
                          fill
                          className="object-contain p-2"
                          sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, 16vw"
                          unoptimized={logo.src.toLowerCase().endsWith('.svg')}
                        />
                      </div>
                    ))}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </section>

      {/* Media Logos Carousel */}
      <section className="w-full">
        <MediaCarousel logos={mediaLogos} />
      </section>

      {/* Community Stats */}
      <section className="w-full">
        <Card className="w-full">
          <CardContent className="p-4 sm:p-6 md:p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 text-center">
              {stats.map((stat) => (
                <div key={stat.label} className="p-2">
                  <p className="text-3xl sm:text-4xl font-bold text-primary">{stat.value}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Multi-Channel Presence */}
      <section className="w-full">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8">Multi-Channel Presence</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-x-12 lg:gap-y-10">
          {channels.map((channel, i) => (
            <div key={i} className="flex gap-4 sm:gap-6 items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 sm:h-14 sm:w-14 rounded-lg bg-primary/10">
                  <channel.icon className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                </div>
              </div>
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-semibold">{channel.title}</h3>
                <p className="mt-1 text-muted-foreground text-xs sm:text-sm leading-relaxed">{channel.description}</p>
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
        <Carousel
          className="w-full"
          opts={{
            align: "start",
            loop: true,
          }}
          plugins={[Autoplay({ delay: 5000, stopOnInteraction: true })]}
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {caseStudies.map(study => (
              <CarouselItem key={study.title} className="pl-2 md:pl-4 sm:basis-1/2 lg:basis-1/3">
                <div className="h-full">
                  <Card className="overflow-hidden h-full flex flex-col shadow-sm">
                    <div className="relative h-48 sm:h-56 w-full">
                      <Image
                        src={study.image}
                        alt={`${study.title} - Hashtag Web3 case study`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        data-ai-hint={study.data_ai_hint}
                      />
                    </div>
                    <CardHeader className="p-4 sm:p-6 pb-2">
                      <CardTitle className="text-lg sm:text-xl">{study.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 pt-0 flex-grow">
                      <ul className="space-y-1.5 text-muted-foreground text-xs sm:text-sm list-disc pl-4 sm:pl-5">
                        {study.points.map((point, i) => <li key={i}>{point}</li>)}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden lg:flex" />
          <CarouselNext className="hidden lg:flex" />
        </Carousel>
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
          <Carousel 
            className="w-full order-2 md:order-1"
            plugins={[partnersCarouselPlugin.current]}
            opts={{ loop: true }}
          >
            <CarouselContent>
              {partnersLogosChunks.map((chunk, i) => (
                <CarouselItem key={i}>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-4 p-2 sm:p-4">
                    {chunk.map((logo) => (
                      <div key={logo.name} className="relative h-14 sm:h-16 w-full flex items-center justify-center p-2 bg-background rounded-md shadow-sm border border-border/50" title={logo.name}>
                        <Image
                          src={logo.src}
                          alt={logo.alt}
                          fill
                          className="object-contain p-2"
                          sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, 16vw"
                          unoptimized={logo.src.toLowerCase().endsWith('.svg')}
                        />
                      </div>
                    ))}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
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
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8">What Our Community Says</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {testimonials.map((testimonial, i) => (
            <Card key={i} className="shadow-sm flex flex-col">
              <CardContent className="p-6 sm:p-8 text-center flex-grow flex flex-col justify-center">
                <p className="font-medium italic text-base sm:text-lg">&quot;{testimonial.quote}&quot;</p>
              </CardContent>
              <CardFooter className="flex-col text-center pt-4 border-t bg-secondary/50 p-4 sm:p-6">
                <Image
                  src={testimonial.image}
                  alt={`Photo of ${testimonial.author}, ${testimonial.title} - Hashtag Web3 testimonial`}
                  width={64}
                  height={64}
                  className="rounded-full mx-auto mb-3 sm:mb-4 object-cover"
                  sizes="64px"
                />
                <p className="font-semibold text-sm sm:text-base">{testimonial.author}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">{testimonial.title}</p>
              </CardFooter>
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
          <Carousel 
            className="w-full"
            plugins={[hiredCarouselPlugin.current]}
            opts={{ loop: true }}
          >
            <CarouselContent>
              {hiredCompaniesChunks.map((chunk, i) => (
                <CarouselItem key={i}>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-4 p-2 sm:p-4">
                    {chunk.map((logo) => (
                      <div key={logo.name} className="relative h-14 sm:h-16 w-full flex items-center justify-center p-2 bg-background rounded-md shadow-sm border border-border/50" title={logo.name}>
                        <Image
                          src={logo.src}
                          alt={logo.alt}
                          fill
                          className="object-contain p-2"
                          sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, 16vw"
                          unoptimized={logo.src.toLowerCase().endsWith('.svg')}
                        />
                      </div>
                    ))}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </section>
      
      {/* Explore Our Resources */}
      <section className="w-full text-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-2">Explore Our Resources</h2>
        <p className="text-muted-foreground text-sm sm:text-base mb-6 sm:mb-8">A complete suite of free tools and resources for professionals and companies building in the decentralized economy.</p>
        <div className="flex flex-wrap justify-center gap-2">
          {resources.map((resource) => (
            <Button asChild variant="outline" key={resource.href} size="sm" className="h-9 sm:h-10 text-xs sm:text-sm">
              <Link href={resource.href}>
                <resource.icon className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                {resource.label}
              </Link>
            </Button>
          ))}
        </div>
      </section>

      {/* Latest Jobs / News / Playbook Tabs */}
      <section className="w-full">
        <Tabs defaultValue="jobs" className="w-full bg-card border rounded-lg p-3 sm:p-4">
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
            <div className="space-y-2">
              {latestJobs.slice(0, 10).map(job => <CompactJobItem key={job.id} job={job} />)}
            </div>
            <Button variant="outline" className="mt-4 w-full" asChild>
              <Link href="/jobs">View all jobs <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </TabsContent>
          <TabsContent value="news" className="mt-4">
            <div className="space-y-2">
              {latestNews.map((item, i) => <CompactNewsItem key={i} item={item} />)}
            </div>
            <Button variant="outline" className="mt-4 w-full" asChild>
              <Link href="/news">View all news <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </TabsContent>
          <TabsContent value="playbook" className="mt-4">
            <div className="space-y-2">
               {latestArticles.slice(0, 10).map(article => <CompactArticleItem key={article.slug} article={article} />)}
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
