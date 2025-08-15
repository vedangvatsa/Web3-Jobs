
'use client';

import { Header } from '@/components/header';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Rss, MessageSquare, Linkedin, Twitter, Instagram, Mail, GraduationCap, Users, Newspaper, Award, BarChart, Mic, Calendar, Globe, BotMessageSquare, Send } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const stats = [
  { value: '100,000+', label: 'Web3 Professionals' },
  { value: '55M+', label: 'Job Board Views' },
  { value: '40k', label: 'Avg. Listeners per Space' },
  { value: '35M', label: 'Annual LinkedIn Impressions' },
];

const companies = [
  { name: 'JP Morgan', src: '/logo/JP_Morgan.png' },
  { name: 'Binance', src: '/logo/binance.png' },
  { name: 'Aptos', src: '/logo/aptos.png' },
  { name: 'Ripple', src: '/logo/ripple.png' },
  { name: 'Consensys', src: '/logo/consensys.png' },
  { name: 'Microsoft', src: '/logo/microsoft.png' },
  { name: 'Citi', src: '/logo/citi.png' },
  { name: 'Blackrock', src: '/logo/blackrock.png' },
  { name: 'Polygon', src: '/logo/polygon.png' },
  { name: 'EY', src: '/logo/ey.png' },
  { name: 'Google', src: '/logo/google.png' },
];

const partnersLogos = [
    { name: 'ETH Oxford', src: '/logo/partners/ETHOxford.png'},
    { name: 'Token 2049', src: '/logo/partners/token2049.png'},
    { name: 'Malaysia Blockchain Week', src: '/logo/partners/malaysiablockchainweek.png'},
    { name: 'Taipei Blockchain Week', src: '/logo/partners/taipeiblockchainweek.png'},
    { name: 'EDCON', src: '/logo/partners/edcon.png'},
    { name: 'ETHBrussels', src: '/logo/partners/ethbrussels.png'},
    { name: 'ETHVietnam', src: '/logo/partners/ethvietnam.png'},
    { name: 'IEEE', src: '/logo/partners/ieee.png'},
    { name: 'Istanbul Blockchain Week', src: '/logo/partners/istanbul.png'},
    { name: 'Harvard', src: '/logo/partners/harvard.png'},
    { name: 'Onepiece Labs', src: '/logo/partners/onepiece-labs.png'},
    { name: 'PBS', src: '/logo/partners/pbs.png'},
    { name: 'Kucoin', src: '/logo/partners/kucoin.png'},
    { name: 'Gate.io', src: '/logo/partners/gateio.png'},
    { name: 'Bitget', src: '/logo/partners/bitget.png'},
    { name: 'Manta Network', src: '/logo/partners/manta-network.png'},
    { name: 'Swell Network', src: '/logo/partners/swell.png'},
];

const promotedContent = [
    { name: 'Kucoin', src: '/logo/kucoin.png'},
    { name: 'Gate.io', src: '/logo/gateio.png'},
    { name: 'Bitget', src: '/logo/bitget.png'},
    { name: 'Onepiece Labs', src: '/logo/onepiece-labs.png'},
    { name: 'Manta Network', src: '/logo/manta-network.png'},
]

const hiredCompanies = [
    { name: 'Swell Network', src: '/logo/swell.png' },
    { name: 'Circle', src: '/logo/circle.png' },
    { name: 'Glassnode', src: '/logo/glassnode.png' },
    { name: 'LiquidX', src: '/logo/liquidx.png' },
    { name: 'Truflation', src: '/logo/truflation.png' },
    { name: 'DePHY', src: '/logo/dephy.png' },
    { name: 'dYdX', src: '/logo/dydx.png' },
    { name: 'LBank', src: '/logo/lbank.png' },
    { name: 'Zerion', src: '/logo/zerion.png' },
    { name: 'Mercuryo', src: '/logo/mercuryo.png' },
    { name: 'Watches.io', src: '/logo/watches.png' },
    { name: 'Koii', src: '/logo/koii.png' },
    { name: 'Zeebu', src: '/logo/zeebu.png' },
    { name: 'VNTR', src: '/logo/vntr.png' },
    { name: 'Scallop', src: '/logo/scallop.png' },
    { name: 'Quantstamp', src: '/logo/quantstamp.png' },
    { name: 'Overmind', src: '/logo/overmind.png' },
    { name: 'KCEX', src: '/logo/kcex.png' },
    { name: 'Galxe', src: '/logo/galxe.png' },
    { name: 'Jaya Talent', src: '/logo/jayatalent.png' },
    { name: 'Funtoken', src: '/logo/funtoken.png' },
    { name: 'Alemx', src: '/logo/alemx.png' },
    { name: 'Peanut', src: '/logo/peanut.png' },
    { name: 'Trilitech', src: '/logo/trilitech.png' },
]

const channels = [
  { icon: Users, title: 'Networking Community', description: '19,000 member Telegram group with spam-bot-moderated topics for community-driven content.' },
  { icon: Twitter, title: 'Twitter & Spotify', description: 'Twitter Spaces with guests like a Pink Floyd member got up to 42k avg listeners. 50k tuned-in to our podcasts.' },
  { icon: Rss, title: 'Telegram Channels', description: '54,000 subscribers for Web3 job postings (one of the largest) and 11,000 for our news feed.' },
  { icon: Newspaper, title: 'Newsletter', description: 'Delivered to 15,000 subscribers, averaging 5,700 views per issue, primarily from Europe and Asia.' },
  { icon: BotMessageSquare, title: 'Social Messaging', description: 'Regional WhatsApp groups with over 26,000 members including top VCs and founders.' },
  { icon: Linkedin, title: 'Professional Social Circle', description: '31,000 followers on LinkedIn for broad professional outreach; 35 million annual post impressions.' },
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

export default function CommunityPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 md:py-16">
          
          <section className="text-center mb-16 max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-primary">
              Connecting The Web3 Ecosystem
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground">
              Hashtag Web3 is more than a platform; it's a thriving ecosystem. Discover how our interconnected network of communities, news channels, and educational resources creates unparalleled value for Web3 professionals and projects.
            </p>
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

          <section className="mb-16">
            <h2 className="text-center text-sm font-semibold text-muted-foreground tracking-wider uppercase mb-6">
                Our global network includes industry leaders from
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
                {companies.map((logo) => (
                    <div key={logo.name} className="relative h-6 w-28" title={logo.name}>
                        <Image src={logo.src} alt={`${logo.name} logo`} fill className="object-contain" unoptimized/>
                    </div>
                ))}
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
            <h2 className="text-3xl font-bold text-center text-primary mb-2">Case Studies</h2>
            <p className="text-center text-muted-foreground mb-8">We’ve helped many companies find the right audience.</p>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {caseStudies.map(study => (
                <Card key={study.title} className="overflow-hidden">
                   <div className="relative h-56 w-full">
                     <Image src={study.image} alt={study.title} fill className="object-cover" data-ai-hint={study.data_ai_hint} unoptimized/>
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

          <section className="mb-16 bg-white rounded-lg py-8">
             <div className="max-w-4xl mx-auto">
                 <h3 className="text-center text-sm font-semibold text-muted-foreground tracking-wider uppercase mb-6">Partners</h3>
                <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
                    {partnersLogos.map((logo) => (
                        <div key={logo.name} className="relative h-10 w-36" title={logo.name}>
                            <img src={logo.src} alt={`${logo.name} logo`} className="object-contain w-full h-full" />
                        </div>
                    ))}
                </div>
             </div>
          </section>

            <section className="mb-16">
                <Card className="bg-secondary/40 border-0 shadow-lg max-w-3xl mx-auto">
                    <CardContent className="p-8 text-center">
                        <p className="text-2xl font-medium italic">“We’ve got many mails, there’s a new one per 5 mins”</p>
                        <p className="mt-4 font-semibold">Kris Lai</p>
                        <p className="text-sm text-muted-foreground">CEO, Scallop</p>
                    </CardContent>
                </Card>
            </section>

            <section className="mb-16 bg-secondary/40 rounded-lg p-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-primary mb-2">Stay Ahead with Our News Feed</h2>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  Get the latest updates, trends, and insights from the Web3 space. Join over 11,000 subscribers on our Telegram channel.
                </p>
                <a href="https://t.me/web3newsfeed" target="_blank" rel="noopener noreferrer">
                  <Button size="lg">
                    <Newspaper className="mr-2 h-5 w-5"/>
                    Join News Feed
                  </Button>
                </a>
              </div>
            </section>
          
          <section className="mb-16 bg-white rounded-lg py-8">
             <div className="max-w-5xl mx-auto">
                 <h3 className="text-center text-sm font-semibold text-muted-foreground tracking-wider uppercase mb-6">Job roles promoted for</h3>
                <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
                    {hiredCompanies.map((logo) => (
                        <div key={logo.name} className="relative h-6 w-32" title={logo.name}>
                            <Image src={logo.src} alt={`${logo.name} logo`} fill className="object-contain" unoptimized/>
                        </div>
                    ))}
                </div>
             </div>
          </section>

          <section className="mb-16">
                <Card className="bg-secondary/40 border-0 shadow-lg max-w-3xl mx-auto">
                    <CardContent className="p-8 text-center">
                        <p className="text-xl font-medium italic">“Our agency has been using the job board for the past year, and we’ve tripled our speed in closing roles thanks to their high-quality talent pool.”</p>
                        <p className="mt-4 font-semibold">Zhanna Manzyk</p>
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
      </main>
    </div>
  );
}

    