
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

const mediaLogos = [
    { name: 'media-0', src: '/logo/media/0df9cd95ce02d767feb771e713b387514e9b6590.png' },
    { name: 'media-1', src: '/logo/media/1ce9a019ef58063c68fd5f64d36199068838804e.png' },
    { name: 'media-2', src: '/logo/media/2c3fa745faeb2bd3a97ef271a7210d82b8f193fb.png' },
    { name: 'media-3', src: '/logo/media/2d6ff9bae82b907d41d85b0e2b145a4202f656ba.png' },
    { name: 'media-4', src: '/logo/media/2eaefd517b11a4f8139fa0998f0321073e6aaa26.png' },
    { name: 'media-5', src: '/logo/media/3f5ed1e4e5acf2a1aa699648e9a8284f895f5b9e.png' },
    { name: 'media-6', src: '/logo/media/7c7a5cb7d0a5dde8c873b68c2fa7a5748a9f2821.png' },
    { name: 'media-7', src: '/logo/media/9f54a3a611014d6c5b03d4e87059095e1710c84c.png' },
    { name: 'media-8', src: '/logo/media/13b366f03bf16e31432f997be9d974ace71f5483.png' },
    { name: 'media-9', src: '/logo/media/14b6543adc2530b43e59f255852262af6294a874.png' },
    { name: 'media-10', src: '/logo/media/47a5b11c5f367ffff6d46d4eeff2020ba76b4ec2.png' },
    { name: 'media-11', src: '/logo/media/60db47ab2a1ee5695d364da223d9267d15a68733.png' },
    { name: 'media-12', src: '/logo/media/61f451fcff223b9ec852f65ee7232906e1e6bfe1.png' },
    { name: 'media-13', src: '/logo/media/454f781c4d44411f1cfb964a8e1e6b5768ec883c.png' },
    { name: 'media-14', src: '/logo/media/543ac1c6ea4d10859ddb62f62a7932d9c3318005.png' },
    { name: 'media-15', src: '/logo/media/564b865018722f2f3f1f43875bc4112822bacbe4.png' },
    { name: 'media-16', src: '/logo/media/565e76c27070ab0c4da9be1dc106d777c910a938.png' },
    { name: 'media-17', src: '/logo/media/653a53899adfcbeafc81de62baa881d1c2d27c5a.png' },
    { name: 'media-18', src: '/logo/media/914ed4188944a17b5f4b541374670571c6316e69.png' },
    { name: 'media-19', src: '/logo/media/2038d630d6fdd84ee6b82d19374e8c1dedd4bc25.png' },
    { name: 'media-20', src: '/logo/media/5295a00d73a662c02e46e2c6d01fdd59a8250ffa.png' },
    { name: 'media-21', src: '/logo/media/7412a040ffa99d458d711f293b7f4ec8aae67fb4.png' },
    { name: 'media-22', src: '/logo/media/599823393b4fadc2f1c9d50b93027ebfc2f6a1f4.png' },
    { name: 'media-23', src: '/logo/media/a75e3d52b7b04cb4c7a52d6cbc2f62e4976e38ec.png' },
    { name: 'media-24', src: '/logo/media/a87caeb08ded3f7dfb78586def381c2660ebd362.png' },
    { name: 'media-25', src: '/logo/media/a96dc8c251ff32063535679a0de8bef0d74e865e.png' },
    { name: 'media-26', src: '/logo/media/a2007f6f9ccc4f08bf6b72f304f9035546d523ec.png' },
    { name: 'media-27', src: '/logo/media/ab398280457925b507d0a326afeaa805fcdce44f.png' },
    { name: 'media-28', src: '/logo/media/b4b3e299ec3e8ca0006c5da7ae64cb64662bcfc2.png' },
    { name: 'media-29', src: '/logo/media/b4be4520b04c9259cf99e85be4be79aa7ac536d6.png' },
    { name: 'media-30', src: '/logo/media/bacc530863613b9324c1cc7e82a54fa3148edb98.png' },
    { name: 'media-31', src: '/logo/media/da7cff558c507e346c999223832c127a6ea96d5b.png' },
    { name: 'media-32', src: '/logo/media/decc1fcda37e13f7000b974cf66fa5285d7417e0.png' },
    { name: 'media-33', src: '/logo/media/e4f8dbfe5586e79cba894b2d15c00a70d3254ea2.png' },
    { name: 'media-34', src: '/logo/media/e5e35aa3421404362c95a346d0f514d946611f90.png' },
    { name: 'media-35', src: '/logo/media/e43df0a520f87e2398f60a37a2d6d942117be644.png' },
    { name: 'media-36', src: '/logo/media/e66de1e638ae92a896922fa50b25417a3ca95aa7.png' },
    { name: 'media-37', src: '/logo/media/e156110f2796b1b6bd7db2be08c985b66a7e1308.png' },
    { name: 'media-38', src: '/logo/media/f76f8b0b56265c2227186f7cafb3b3a3dfb55437.png' },
    { name: 'media-39', src: '/logo/media/f430e277178ec58fc097a3078c13028fabf80403.png' },
    { name: 'media-40', src: '/logo/media/fa66e3f8d7cff979cba7ec1d7ad575212a1b8f3d.png' },
    { name: 'media-41', src: '/logo/media/fb4bf9ef0e989c9795e066c4502ba75b3a567467.png' },
    { name: 'media-42', src: '/logo/media/fd7e246f812a15af9fe590ce48ab163ceccee6f8.png' },
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
          
          <section className="mb-16 bg-white rounded-lg py-8">
             <div className="max-w-5xl mx-auto">
                 <h3 className="text-center text-sm font-semibold text-muted-foreground tracking-wider uppercase mb-6">As seen on</h3>
                <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
                    {mediaLogos.map((logo) => (
                        <div key={logo.name} className="relative h-6 w-32" title={logo.name}>
                            <Image src={logo.src} alt={logo.name} fill className="object-contain" unoptimized/>
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

    
