
'use client';

import type { Job, Article, NewsItem } from '@/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Briefcase, BookOpen, Newspaper, Send, Smartphone } from 'lucide-react';
import { JobCard } from '@/components/job-card';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import Image from 'next/image';
import { MediaCarousel } from './media-carousel';
import { useState, useEffect, useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import type { WebSite } from 'schema-dts';
import Script from 'next/script';
import {
 Carousel,
 CarouselContent,
 CarouselItem,
 CarouselNext,
 CarouselPrevious,
} from"@/components/ui/carousel"
import Autoplay from"embla-carousel-autoplay"
import { NewsCard } from './news-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from"@/components/ui/tabs"
import {
  stats, companies, partnersLogos, mediaLogos, hiredCompanies,
  channels, caseStudies, communityPhotos, whatsappGroups,
  testimonials, resources, chunkArray,
} from '@/lib/community-data';


function ArticleCard({ article }: { article: Omit<Article, 'content'> }) {
 return (
  <Card className="flex flex-col transform transition-all duration-200 hover:-translate-y-1 hover:shadow-sm h-full bg-background border border-white/10">
   <Link href={`/${article.slug}`} className="block h-full flex flex-col">
    <div className="relative w-full h-40">
     <Image
      src={article.image}
      alt={`${article.title} - Hashtag Web3 article`}
      fill
      className="object-cover rounded-t-lg"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      data-ai-hint={`${article['data-ai-hint'] || ''}`}
     />
    </div>
    <CardHeader className="flex-grow">
     <p className="text-sm font-medium text-primary mb-1">{article.category}</p>
     <CardTitle className="text-lg leading-tight">{article.title}</CardTitle>
    </CardHeader>
   </Link>
  </Card>
 );
}

const CompactJobItem = ({ job }: { job: Job }) => (
 <a href={job.link} target="_blank" rel="noopener noreferrer" className="block p-3 rounded-lg hover:bg-secondary transition-colors text-center">
  <p className="font-semibold truncate text-sm">{job.title}</p>
  <p className="text-xs text-muted-foreground">{job.company}</p>
 </a>
);

const CompactNewsItem = ({ item }: { item: NewsItem }) => (
 <a href={item.link} target="_blank" rel="noopener noreferrer" className="block p-3 rounded-lg hover:bg-secondary transition-colors text-center">
  <p className="font-semibold truncate text-sm">{item.title}</p>
  <p className="text-xs text-muted-foreground">{item.source}</p>
 </a>
);

const CompactArticleItem = ({ article }: { article: Omit<Article, 'content'> }) => (
 <Link href={`/${article.slug}`} className="block p-3 rounded-lg hover:bg-secondary transition-colors text-center">
  <p className="font-semibold truncate text-sm">{article.title}</p>
  <p className="text-xs text-muted-foreground">{article.category}</p>
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
  <div className="py-16">
    <div className="container mx-auto px-4 md:py-16">
     
     <section className="mb-16">
      <div className="grid md:grid-cols-2 gap-8 items-center site-container">
        <div>
          <h2 className="text-4xl font-bold mt-2">Join Our 100k+ Global Community</h2>
          <p className="mt-4 text-muted-foreground">
            Our network is home to over 100,000 Web3 professionals who share insights, find jobs, and discuss the latest in the decentralized world. Join the conversation today.
          </p>
          <a href="https://t.me/hashtagweb3" target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="mt-6">
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
              <div className="grid grid-cols-4 grid-rows-3 gap-4 p-4">
              {chunk.map((logo) => (
               <div key={logo.name} className="relative h-16 w-full flex items-center justify-center p-2 bg-background rounded-md shadow-sm" title={logo.name}>
                <Image src={logo.src} alt={logo.alt} fill className="object-contain p-2" unoptimized/>
               </div>
              ))}
             </div>
            </CarouselItem>
           ))}
          </CarouselContent>
        </Carousel>
      </div>
     </section>

     <section className="mb-16">
       <div className="site-container px-8">
         <MediaCarousel logos={mediaLogos} />
       </div>
     </section>

     <section className="mb-16">
       <Card>
        <CardContent className="p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-4xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
       </Card>
     </section>

     <section className="mb-16">
       <h2 className="text-3xl font-bold text-center mb-8">Multi-Channel Presence</h2>
       <div className="site-container">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
           {channels.map((channel, i) => (
             <div key={i} className="flex gap-6">
               <div className="flex-shrink-0">
                 <div className="flex items-center justify-center h-14 w-14 rounded-lg bg-primary/10">
                   <channel.icon className="h-7 w-7 text-primary" />
                 </div>
               </div>
               <div>
                 <h3 className="text-lg font-semibold">{channel.title}</h3>
                 <p className="mt-1 text-muted-foreground text-sm leading-relaxed">{channel.description}</p>
               </div>
             </div>
           ))}
         </div>
       </div>
     </section>
     
     <section className="mb-16">
      <h2 className="text-3xl font-bold text-center mb-2">Case Studies</h2>
      <p className="text-center text-muted-foreground mb-8">We’ve helped many companies find the right audience.</p>
      <Carousel
        className="site-container"
        opts={{
          align:"start",
          loop: true,
        }}
        plugins={[Autoplay({ delay: 5000, stopOnInteraction: true })]}
      >
        <CarouselContent>
          {caseStudies.map(study => (
            <CarouselItem key={study.title} className="md:basis-1/2 lg:basis-1/3">
              <div className="p-1 h-full">
                <Card className="overflow-hidden h-full flex flex-col">
                  <div className="relative h-56 w-full">
                   <Image src={study.image} alt={`${study.title} - Hashtag Web3 case study`} fill className="object-cover" data-ai-hint={study.data_ai_hint} unoptimized/>
                  </div>
                  <CardHeader>
                    <CardTitle>{study.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <ul className="space-y-2 text-muted-foreground list-disc pl-5">
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

     <section className="mb-16">
      <Card>
         <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-center">
            <div className="lg:col-span-1 text-center md:text-left">
              <h3 className="text-xl font-bold text-foreground mb-2">Join Our Regional Whatsapp Groups</h3>
              <p className="text-muted-foreground text-sm">Connect with Web3 professionals in your region. Approval is based on your WhataApp number's country code.</p>
            </div>
            <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
              {whatsappGroups.map((group) => (
                <a href={group.link} key={group.region} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full">
                    <Smartphone className="mr-2 h-4 w-4" /> {group.region}
                  </Button>
                </a>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
     </section>

     <section className="mb-16">
      <h2 className="text-3xl font-bold text-center mb-2">Community Moments</h2>
      <p className="text-center text-muted-foreground mb-8">Highlights from events, partnerships, and community activities.</p>
      <Carousel 
       className="site-container"
       plugins={[plugin.current]}
       onMouseEnter={() => plugin.current.stop()}
       onMouseLeave={() => plugin.current.play()}
        opts={{
        loop: true,
       }}
      >
       <CarouselContent>
        {communityPhotos.map((photo, index) => (
         <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
          <div className="p-1">
           <Card className="overflow-hidden">
            <CardContent className="flex aspect-square items-center justify-center p-0">
             <Image
              src={photo.src}
              alt={photo.alt}
              width={500}
              height={500}
              className="object-cover w-full h-full"
              unoptimized
             />
            </CardContent>
           </Card>
          </div>
         </CarouselItem>
        ))}
       </CarouselContent>
       <CarouselPrevious className="hidden sm:flex" />
       <CarouselNext className="hidden sm:flex" />
      </Carousel>
     </section>

     <section className="py-16 px-4 rounded-lg">
      <div className="grid md:grid-cols-2 gap-8 items-center site-container">
        <Carousel 
          className="w-full"
          plugins={[partnersCarouselPlugin.current]}
          opts={{ loop: true }}
         >
          <CarouselContent>
           {partnersLogosChunks.map((chunk, i) => (
            <CarouselItem key={i}>
             <div className="grid grid-cols-4 grid-rows-3 gap-4 p-4">
              {chunk.map((logo) => (
               <div key={logo.name} className="relative h-16 w-full flex items-center justify-center p-2 bg-background rounded-md shadow-sm" title={logo.name}>
                <Image src={logo.src} alt={logo.alt} fill className="object-contain p-2" unoptimized/>
               </div>
              ))}
             </div>
            </CarouselItem>
           ))}
          </CarouselContent>
        </Carousel>
        <div>
          <h2 className="text-4xl font-bold mt-2">Promote with Hashtag Web3</h2>
          <p className="mt-4 text-muted-foreground">
            Tap into our network of over 100,000 Web3 professionals. We help you connect with developers, investors, and early adopters through targeted campaigns, content collaborations, and community engagement.
          </p>
          <a href="https://t.me/web3jobs_rep" target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="mt-6">Contact Us <ArrowRight className="ml-2" /></Button>
          </a>
        </div>
      </div>
     </section>

     <section className="mb-16">
      <h2 className="text-3xl font-bold text-center mb-8">What Our Community Says</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 site-container">
       {testimonials.map((testimonial, i) => (
         <Card key={i} className="shadow-sm flex flex-col">
          <CardContent className="p-8 text-center flex-grow flex flex-col justify-center">
            <p className="font-medium italic text-lg">“{testimonial.quote}”</p>
          </CardContent>
          <CardFooter className="flex-col text-center pt-4 border-t bg-secondary/50">
            <Image src={testimonial.image} alt={`Photo of ${testimonial.author}, ${testimonial.title} — Hashtag Web3 testimonial`} width={64} height={64} className="rounded-full mx-auto mb-4 object-cover" />
            <p className="font-semibold">{testimonial.author}</p>
            <p className="text-sm text-muted-foreground">{testimonial.title}</p>
          </CardFooter>
         </Card>
       ))}
      </div>
     </section>

     <section className="py-16 px-4 rounded-lg">
      <div className="grid md:grid-cols-2 gap-8 items-center site-container">
        <div>
          <h2 className="text-4xl font-bold mt-2">Hire with Hashtag Web3</h2>
          <p className="mt-4 text-muted-foreground">
            We connect leading Web3 companies with our global network of over 100,000 crypto-native professionals. 
            Our platform is the go-to source for developers, marketers, and PMs looking for their next role in the decentralized economy.
          </p>
          <a href="https://t.me/web3jobs_rep" target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="mt-6">Post a Job <ArrowRight className="ml-2" /></Button>
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
              <div className="grid grid-cols-4 grid-rows-3 gap-4">
              {chunk.map((logo) => (
               <div key={logo.name} className="relative h-16 w-full flex items-center justify-center p-2 bg-background rounded-md shadow-sm" title={logo.name}>
                <Image src={logo.src} alt={logo.alt} fill className="object-contain p-2" unoptimized/>
               </div>
              ))}
             </div>
            </CarouselItem>
           ))}
          </CarouselContent>
        </Carousel>
      </div>
     </section>
     
     <section className="py-16">
      <div className="site-container text-center">
        <h2 className="text-3xl font-bold mb-2">Explore Our Resources</h2>
        <p className="text-muted-foreground mb-8">A complete suite of free tools and resources for professionals and companies building in the decentralized economy.</p>
        <div className="flex flex-wrap justify-center gap-2">
          {resources.map((resource) => (
            <Button asChild variant="outline" key={resource.href}>
              <Link href={resource.href}>
                <resource.icon className="mr-2 h-4 w-4" />
                {resource.label}
              </Link>
            </Button>
          ))}
        </div>
      </div>
     </section>

    </div>
    
    <div className="mt-16">
      <div className="container mx-auto px-4">
        <Tabs defaultValue="jobs" className="w-full bg-card border rounded-lg p-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="jobs"><Briefcase className="mr-2 h-4 w-4"/>Latest Jobs</TabsTrigger>
            <TabsTrigger value="news"><Newspaper className="mr-2 h-4 w-4"/>Latest News</TabsTrigger>
            <TabsTrigger value="playbook"><BookOpen className="mr-2 h-4 w-4"/>From the Playbook</TabsTrigger>
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
      </div>
    </div>
   </div>
 );
}

  
