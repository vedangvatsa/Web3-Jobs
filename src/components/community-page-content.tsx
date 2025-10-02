

'use client';

import { Header } from '@/components/header';
import { getAllArticles } from '@/lib/articles';
import { getJobs } from '@/lib/jobs';
import { getNewsFeed } from '@/lib/news';
import type { Job, Article, NewsItem } from '@/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Briefcase, BookOpen, Newspaper, Rss, MessageSquare, Linkedin, Twitter, Instagram, Mail, GraduationCap, Users, Award, BarChart, Mic, Calendar, Globe, BotMessageSquare, Send, Smartphone } from 'lucide-react';
import { JobCard } from '@/components/job-card';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import Image from 'next/image';
import { TransitioningHeadline } from '@/components/transitioning-headline';
import { MediaCarousel } from './media-carousel';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';


function ArticleCard({ article }: { article: Omit<Article, 'content'> }) {
  return (
    <Card className="flex flex-col transform transition-all duration-200 hover:-translate-y-1 hover:shadow-xl h-full">
      <Link href={`/${article.slug}`} className="block h-full flex flex-col">
        <div className="relative w-full h-40">
          <Image
            src={article.image}
            alt={`${article.title} - Hashtag Web3 article`}
            fill
            className="object-cover rounded-t-lg"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            data-ai-hint={`${article.slug.replace(/-/g, ' ')}`}
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

function NewsCard({ item }: { item: NewsItem }) {
    const [formattedDate, setFormattedDate] = useState('');

    useEffect(() => {
        setFormattedDate(new Date(item.pubDate).toLocaleDateString());
    }, [item.pubDate]);

    return (
        <Card className="bg-secondary/50 border-0">
            <CardContent className="p-4">
                <a href={item.link} target="_blank" rel="noopener noreferrer" className="block hover:bg-accent/20 rounded-md p-3">
                    <p className="text-xs text-primary font-semibold">{item.source}</p>
                    <h4 className="font-semibold leading-snug text-foreground">{item.title}</h4>
                    {formattedDate ? (
                        <p className="text-xs text-muted-foreground mt-1">{formattedDate}</p>
                    ) : (
                        <Skeleton className="h-4 w-20 mt-1" />
                    )}
                </a>
            </CardContent>
        </Card>
    );
}

const stats = [
    { value: '100,000+', label: 'Web3 Professionals' },
    { value: '55M+', label: 'Job Post Views' },
    { value: '40k', label: 'Avg. Listeners per Space' },
    { value: '35M+', label: 'LinkedIn Post Impressions' },
];

const companies = [
    { name: 'Algorand', src: '/logo/companies/algorand.png' },
    { name: 'Animoca Brands', src: '/logo/companies/Animoca-Brands.png' },
    { name: 'Aptos', src: '/logo/companies/aptos.png' },
    { name: 'Ava Labs', src: '/logo/companies/ava.png' },
    { name: 'Blackrock', src: '/logo/companies/blackrock.png' },
    { name: 'Bloomberg', src: '/logo/companies/bloomberg.png' },
    { name: 'Chainalysis', src: '/logo/companies/Chainalysis.png' },
    { name: 'Circle', src: '/logo/companies/circle.png' },
    { name: 'Citi', src: '/logo/companies/citi.png' },
    { name: 'Consensys', src: '/logo/companies/consensys.png' },
    { name: 'EY', src: '/logo/companies/ey.png' },
    { name: 'Gemini', src: '/logo/companies/gemini.png' },
    { name: 'Google', src: '/logo/companies/google.png' },
    { name: 'JP Morgan', src: '/logo/companies/JP_Morgan.png' },
    { name: 'KPMG', src: '/logo/companies/KPMG.png' },
    { name: 'McKinsey', src: '/logo/companies/mckinsey.png' },
    { name: 'Microsoft', src: '/logo/companies/microsoft.png' },
    { name: 'Polygon', src: '/logo/companies/polygon.png' },
    { name: 'PwC', src: '/logo/companies/pwc.png' },
    { name: 'R3', src: '/logo/companies/r3.png' },
    { name: 'Ripple', src: '/logo/companies/ripple.png' },
];

const partnersLogos = [
    { name: 'Altlayer', src: '/logo/partners/altlayer.png'},
    { name: 'BFF', src: '/logo/partners/bff.png'},
    { name: 'Coinfest', src: '/logo/partners/coinfest.png'},
    { name: 'Date', src: '/logo/partners/date.png'},
    { name: 'EDCON', src: '/logo/partners/edcon.png'},
    { name: 'ETHBrussels', src: '/logo/partners/ethbrussels.png'},
    { name: 'ETH Oxford', src: '/logo/partners/ETHOxford.png'},
    { name: 'ETHVietnam', src: '/logo/partners/ethvietnam.png'},
    { name: 'Harvard', src: '/logo/partners/harvard.png'},
    { name: 'IBW', src: '/logo/partners/ibw.png'},
    { name: 'IEEE', src: '/logo/partners/ieee.png'},
    { name: 'Istanbul', src: '/logo/partners/istanbul.png'},
    { name: 'Malaysia Blockchain Week', src: '/logo/partners/malaysiablockchainweek.png'},
    { name: 'Onepiece Labs', src: '/logo/partners/onepiece.png'},
    { name: 'PBS', src: '/logo/partners/pbs.png'},
    { name: 'Taipei Blockchain Week', src: '/logo/partners/taipeiblockchainweek.png'},
    { name: 'Token 2049', src: '/logo/partners/token2049.png'},
    { name: 'WBS', src: '/logo/partners/wbs.png'},
    { name: 'OBC', src: '/logo/partners/obc.png' },
    { name: 'ETH Enugu', src: '/logo/partners/ethenugu.png'},
    { name: 'FBS', src: '/logo/partners/fbs.png'},
    { name: 'LBS', src: '/logo/partners/lbs.png'},
    { name: 'The Metaverse Institute', src: '/logo/partners/The-Metaverse-Institute-partners-with-Hashtag-Web3.png'},
];

const mediaLogos = [
    { name: 'Business Standard', src: '/logo/media/business-standard.png' },
    { name: 'CoinEdition', src: '/logo/media/coinedition.png' },
    { name: 'Decrypt', src: '/logo/media/decrypt.png' },
    { name: 'Outlook', src: '/logo/media/outlook.png' },
    { name: 'TheStreet', src: '/logo/media/thestreet.svg' },
    { name: 'Yahoo', src: '/logo/media/yahoo.png' },
    { name: 'Barcelona', src: '/logo/media/barcelona.png' },
    { name: 'British', src: '/logo/media/british.png' },
    { name: 'England', src: '/logo/media/england.png' },
    { name: 'Korean', src: '/logo/media/korean.png' },
];

const hiredCompanies = [
    { name: 'Alemx', src: '/logo/job/alemx.png' },
    { name: 'Binance', src: '/logo/job/binance.png' },
    { name: 'Bitget', src: '/logo/job/bitget.png' },
    { name: 'Circle', src: '/logo/job/circle.png' },
    { name: 'Coinbase', src: '/logo/job/coinbase.png' },
    { name: 'DePHY', src: '/logo/job/dephy.png' },
    { name: 'dYdX', src: '/logo/job/dydx.png' },
    { name: 'Funtoken', src: '/logo/job/funtoken.png' },
    { name: 'Galxe', src: '/logo/job/galxe.png' },
    { name: 'Glassnode', src: '/logo/job/glassnode.png' },
    { name: 'Jaya Talent', src: '/logo/job/jayatalent.png' },
    { name: 'KCEX', src: '/logo/job/kcex.png' },
    { name: 'LBank', src: '/logo/job/lbank.png' },
    { name: 'LiquidX', src: '/logo/job/liquidx.png' },
    { name: 'Mercuryo', src: '/logo/job/mercuryo.png' },
    { name: 'Overmind', src: '/logo/job/overmind.png' },
    { name: 'Peanut', src: '/logo/job/peanut.png' },
    { name: 'Quantstamp', src: '/logo/job/quantstamp.png' },
    { name: 'Rho', src: '/logo/job/rho.png' },
    { name: 'Scallop', src: '/logo/job/scallop.png' },
    { name: 'Swell Network', src: '/logo/job/swell.png' },
    { name: 'Trilitech', src: '/logo/job/trilitech.png' },
    { name: 'Truflation', src: '/logo/job/truflation.png' },
    { name: 'VNTR', src: '/logo/job/vn.png' },
    { name: 'Watches.io', src: '/logo/job/watches.png' },
    { name: 'Zeebu', src: '/logo/job/zeebu.png' },
    { name: 'Zerion', src: '/logo/job/zerion.png' },
]

const channels = [
  { icon: Users, title: 'Networking Community', description: '21,000 member Telegram group with spam-bot-moderated topics for community-driven content.' },
  { icon: Twitter, title: 'Twitter & Spotify', description: 'Twitter Spaces with guests like a Pink Floyd member got up to 42k avg listeners. 50k tuned-in to our podcasts.' },
  { icon: Rss, title: 'Telegram Channels', description: '58,000 subscribers for Web3 job postings (one of the largest) and 13,000 for our news feed.' },
  { icon: Newspaper, title: 'Newsletter', description: 'Delivered to 15,000 subscribers, averaging 5,700 views per issue, primarily from Europe and Asia.' },
  { icon: BotMessageSquare, title: 'Social Messaging', description: 'Regional WhatsApp groups with over 26,000 members including top VCs and founders.' },
  { icon: Linkedin, title: 'Professional Social Circle', description: '35,000 followers on LinkedIn for broad professional outreach; 35M+ annual post impressions.' },
]

const caseStudies = [
  {
    title: 'Demo Day with Onepiece Labs & Sei',
    image: '/images/demodayonepiece.png',
    data_ai_hint: 'demo day',
    points: [
      'LinkedIn post received 953 likes.',
      'Telegram announcement reached 15,000 members.',
      'Telegram channel got 6,500 views.',
      'Amplified in Regional WhatsApp groups with 22,000 members.',
    ]
  },
  {
    title: 'Founder Interview with Obortech',
    image: '/images/obortechinterview.png',
    data_ai_hint: 'founder interview',
    points: [
        'LinkedIn announcement achieved 925 likes and 23,000 impressions.',
        'Telegram post received 5,700 views and 22 shares.',
        'Twitter post garnered around 12,000 views.',
        'Cross-promoted in regional WhatsApp groups to over 23,000 members.',
    ]
  },
    {
    title: 'AltLayer Rollup Day',
    image: '/images/altlayerrollupday.png',
    data_ai_hint: 'rollup day',
    points: [
        'LinkedIn post reached 28,000 followers with 600 likes and 50 comments.',
        'Pinned announcement sent to 18,000 members in our Telegram group.',
        'Broadcasted to 46,000 subscribers on our job channel.',
        'Cross-promoted in regional WhatsApp groups to 12,000 members.',
    ]
  }
]

const communityPhotos = [
    { src: '/logo/gallery/2025-08-14%2018.05.08-min.jpg', alt: 'Hashtag Web3 community event photo 1' },
    { src: '/logo/gallery/2025-08-14%2018.05.12-min.jpg', alt: 'Hashtag Web3 community event photo 2' },
    { src: '/logo/gallery/2025-08-14%2018.05.15-min.jpg', alt: 'Hashtag Web3 community event photo 3' },
    { src: '/logo/gallery/2025-08-14%2018.05.18-min.jpg', alt: 'Hashtag Web3 community event photo 4' },
    { src: '/logo/gallery/2025-08-14%2018.05.20-min.jpg', alt: 'Hashtag Web3 community event photo 5' },
    { src: '/logo/gallery/2025-08-14%2018.05.24-min.jpg', alt: 'Hashtag Web3 community event photo 6' },
    { src: '/logo/gallery/2025-08-14%2018.05.27-min.jpg', alt: 'Hashtag Web3 community event photo 7' },
    { src: '/logo/gallery/2025-08-14%2018.05.30-min.jpg', alt: 'Hashtag Web3 community event photo 8' },
    { src: '/logo/gallery/2025-08-14%2018.05.33-min.jpg', alt: 'Hashtag Web3 community event photo 9' },
    { src: '/logo/gallery/2025-08-14%2018.05.35-min.jpg', alt: 'Hashtag Web3 community event photo 10' },
    { src: '/logo/gallery/2025-08-14%2018.05.44-min.jpg', alt: 'Hashtag Web3 community event photo 11' },
    { src: '/logo/gallery/2025-08-14%2018.05.47-min.jpg', alt: 'Hashtag Web3 community event photo 12' },
    { src: '/logo/gallery/2025-08-14%2018.05.50-min.jpg', alt: 'Hashtag Web3 community event photo 13' },
    { src: '/logo/gallery/2025-08-14%2022.30.59.jpg', alt: 'Hashtag Web3 community event photo 14' },
    { src: '/logo/gallery/2025-08-14%2022.31.02.jpg', alt: 'Hashtag Web3 community event photo 15' },
    { src: '/logo/gallery/2025-08-14%2022.32.30.jpg', alt: 'Hashtag Web3 community event photo 16' },
    { src: '/logo/gallery/2025-08-14%2022.38.14.jpg', alt: 'Hashtag Web3 community event photo 17' },
    { src: '/logo/gallery/2025-08-14%2022.38.17.jpg', alt: 'Hashtag Web3 community event photo 18' }
];

const whatsappGroups = [
    { region: 'Europe', link: 'https://chat.whatsapp.com/JrUfhcam2piAb1MHtfBNKB' },
    { region: 'North America', link: 'https://chat.whatsapp.com/HT7gVlIjNDEFyT7QX3opiM' },
    { region: 'Africa', link: 'https://chat.whatsapp.com/Hb4kyFWPkxgGxwSTUSWAqM' },
    { region: 'Asia (Excl. India)', link: 'https://chat.whatsapp.com/HHL6j40XlF6GefkOimSltG' },
    { region: 'South America', link: 'https://chat.whatsapp.com/CLIkN0RbHoxLBtJo9DIpBD' },
    { region: 'India', link: 'https://chat.whatsapp.com/JrUfhcam2piAb1MHtfBNKB' },
];

const headlines = [
    "Connecting The Web3 Ecosystem",
    "A Thriving Global Network",
    "Unparalleled Reach & Value",
    "Your Partner in Growth"
];

export function CommunityPageContent({ 
    latestJobs,
    latestArticles,
    latestNews
}: { 
    latestJobs: Job[],
    latestArticles: Omit<Article, 'content'>[],
    latestNews: NewsItem[]
}) {

  return (
    <>
        <div className="container mx-auto px-4 py-8 md:py-16">
          
          <section className="text-center mb-16 max-w-4xl mx-auto">
             <TransitioningHeadline phrases={headlines} />
          </section>

          <section className="mb-16">
             <Card className="bg-secondary/40 border-0 shadow-lg">
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

          <section className="mb-16 bg-white rounded-lg py-8">
             <div className="max-w-6xl mx-auto px-4">
                 <h3 className="text-center text-sm font-semibold text-muted-foreground tracking-wider uppercase mb-6">
                    Our global network includes industry leaders from
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-x-8 gap-y-6 items-center justify-center">
                    {companies.map((logo) => (
                        <div key={logo.name} className="relative h-12 w-full" title={logo.name}>
                            <Image src={logo.src} alt={`Logo of ${logo.name}, a Hashtag Web3 network company`} fill className="object-contain" unoptimized/>
                        </div>
                    ))}
                </div>
                <p className="text-center text-xs text-muted-foreground mt-6">and many more...</p>
             </div>
          </section>

          <section className="mb-16">
            <h2 className="text-3xl font-bold text-center text-primary mb-8">Multi-Channel Presence</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {channels.map((channel) => (
                <Card key={channel.title} className="text-center">
                    <CardHeader>
                        <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
                            <channel.icon className="h-8 w-8 text-primary" />
                        </div>
                        <CardTitle className="pt-2">{channel.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">{channel.description}</p>
                    </CardContent>
                </Card>
              ))}
            </div>
          </section>

           <section className="mb-16">
            <Card className="bg-secondary/40 border-dashed">
              <CardContent className="p-8 text-center">
                <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
                  <MessageSquare className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-primary mb-2">Join the Conversation</h3>
                <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                  Our main Telegram group is a vibrant hub for Web3 professionals to network, share insights, and discuss the latest trends.
                </p>
                <a href="https://t.me/hashtagweb3" target="_blank" rel="noopener noreferrer" className="inline-block">
                  <Button size="lg">
                    <Send className="mr-2 h-5 w-5" />
                    Discussion & Updates Group on Telegram
                  </Button>
                </a>
              </CardContent>
            </Card>
          </section>
          
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-center text-primary mb-2">Case Studies</h2>
            <p className="text-center text-muted-foreground mb-8">We’ve helped many companies find the right audience.</p>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {caseStudies.map(study => (
                <Card key={study.title} className="overflow-hidden">
                   <div className="relative h-56 w-full">
                     <Image src={study.image} alt={`${study.title} - Hashtag Web3 case study`} fill className="object-cover" data-ai-hint={study.data_ai_hint} unoptimized/>
                   </div>
                   <CardHeader>
                        <CardTitle>{study.title}</CardTitle>
                   </CardHeader>
                   <CardContent>
                        <ul className="space-y-2 text-muted-foreground list-disc pl-5">
                            {study.points.map((point, i) => <li key={i}>{point}</li>)}
                        </ul>
                   </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-3xl font-bold text-center text-primary mb-2">Join Our Regional WhatsApp Groups</h2>
            <p className="text-center text-muted-foreground mb-8 max-w-3xl mx-auto">Connect with awesome Web3 folks in your region. Please note: You will only be approved for the group that matches your WhatsApp number's country code.</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {whatsappGroups.map((group) => (
                <a href={group.link} key={group.region} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full h-12 text-base">
                    <Smartphone className="mr-2 h-5 w-5" /> {group.region}
                  </Button>
                </a>
              ))}
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-3xl font-bold text-center text-primary mb-2">Community Moments</h2>
            <p className="text-center text-muted-foreground mb-8">Highlights from events, partnerships, and community activities.</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {communityPhotos.map((photo, index) => (
                <div key={index} className="group relative aspect-square overflow-hidden rounded-lg">
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          </section>

          <section className="mb-16">
             <div className="max-w-6xl mx-auto px-8">
                <MediaCarousel logos={mediaLogos} />
             </div>
          </section>

           <section className="mb-16">
                <Card className="bg-secondary/40 border-0 shadow-lg max-w-3xl mx-auto">
                    <CardContent className="p-8 text-center">
                        <p className="text-xl font-medium italic">“Their Web3 Jobs Telegram channel has proven to be the most effective Web3 job board I’ve come across. Its real-time updates allow me to apply to new opportunities the moment they are available on the market, significantly improving the visibility of my applications.”</p>
                        <div className="mt-6 mb-2">
                            <Image src="/logo/quotes/suki.png" alt="Photo of Suki Cheung" width={64} height={64} className="rounded-full mx-auto" />
                        </div>
                        <p className="font-semibold">Suki Cheung</p>
                        <p className="text-sm text-muted-foreground">Community Lead, Trust Wallet</p>
                    </CardContent>
                </Card>
            </section>
          
          <section className="mb-16 bg-white rounded-lg py-8">
             <div className="max-w-6xl mx-auto px-8">
                 <h3 className="text-center text-sm font-semibold text-muted-foreground tracking-wider uppercase mb-6">Partners</h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-x-12 gap-y-8 items-center justify-center">
                    {partnersLogos.map((logo) => (
                        <div key={logo.name} className="relative h-12 w-full" title={logo.name}>
                            <Image src={logo.src} alt={`Logo of ${logo.name}, a Hashtag Web3 partner`} fill className="object-contain" unoptimized />
                        </div>
                    ))}
                </div>
             </div>
          </section>

            <section className="mb-16">
                <Card className="bg-secondary/40 border-0 shadow-lg max-w-3xl mx-auto">
                    <CardContent className="p-8 text-center">
                        <p className="text-2xl font-medium italic">“We’ve got many mails, there’s a new one per 5 mins”</p>
                         <div className="mt-6 mb-2">
                            <Image src="/logo/quotes/kris.png" alt="Photo of Kris Lai" width={64} height={64} className="rounded-full mx-auto" />
                        </div>
                        <p className="font-semibold">Kris Lai</p>
                        <p className="text-sm text-muted-foreground">CEO, Scallop</p>
                    </CardContent>
                </Card>
            </section>

          <section className="mb-16 bg-white rounded-lg py-8">
             <div className="max-w-6xl mx-auto px-8">
                 <h3 className="text-center text-sm font-semibold text-muted-foreground tracking-wider uppercase mb-6">Job roles promoted for</h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-x-10 gap-y-8 items-center justify-center">
                    {hiredCompanies.map((logo) => (
                        <div key={logo.name} className="relative h-12 w-full" title={logo.name}>
                            <Image src={logo.src} alt={`Logo of ${logo.name}, a company hiring on Hashtag Web3`} fill className="object-contain" unoptimized/>
                        </div>
                    ))}
                </div>
                <p className="text-center text-xs text-muted-foreground mt-6">and many more...</p>
             </div>
          </section>

          <section className="mb-16">
                <Card className="bg-secondary/40 border-0 shadow-lg max-w-3xl mx-auto">
                    <CardContent className="p-8 text-center">
                        <p className="text-xl font-medium italic">“Our agency has been using the job board for the past year, and we’ve tripled our speed in closing roles thanks to their high-quality talent pool.”</p>
                        <div className="mt-6 mb-2">
                            <Image src="/logo/quotes/zhanna.png" alt="Photo of Zhanna Manzyk" width={64} height={64} className="rounded-full mx-auto" />
                        </div>
                        <p className="font-semibold">Zhanna Manzyk</p>
                        <p className="text-sm text-muted-foreground">CEO, Jaya Talent</p>
                    </CardContent>
                </Card>
            </section>

          <section className="text-center py-16 bg-primary/5 rounded-lg">
             <h2 className="text-3xl font-bold text-primary mb-2">Connect with our representative</h2>
             <p className="text-muted-foreground mb-8">Share your requirements, and we’ll recommend the most effective strategy.</p>
             <div className="flex justify-center gap-4">
                <a href="https://t.me/web3jobs_rep" target="_blank" rel="noopener noreferrer">
                    <Button size="lg">
                        <Send className="mr-2 h-5 w-5"/> Contact on Telegram
                    </Button>
                </a>
             </div>
          </section>

        </div>
        <div className="py-16 bg-secondary/40 mt-16">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                     <div className="lg:col-span-3">
                         <section>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-3xl font-bold text-primary flex items-center gap-3"><BookOpen /> From the Playbook</h2>
                                <Button variant="ghost" asChild>
                                <Link href="/blog">View all articles <ArrowRight className="ml-2 h-4 w-4" /></Link>
                                </Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {latestArticles.map(article => <ArticleCard key={article.slug} article={article} />)}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
      </>
  );
}

    

  


