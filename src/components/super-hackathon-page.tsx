
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Trophy, Calendar, ArrowRight, Rss, Briefcase, Check, Sparkles, Star } from 'lucide-react';
import Image from 'next/image';

const partnersLogos = [
    { name: 'BNB Chain', src: 'https://hackathon.superprotocol.com/super-ecosystem/partners/bnb-chain.svg', alt: 'BNB Chain logo'},
    { name: 'Google Cloud', src: 'https://hackathon.superprotocol.com/super-ecosystem/partners/google-cloud.svg', alt: 'Google Cloud logo'},
    { name: 'Fenbushi Capital', src: 'https://hackathon.superprotocol.com/super-ecosystem/partners/fenbushi-capital.svg', alt: 'Fenbushi Capital logo'},
    { name: 'Capital', src: 'https://hackathon.superprotocol.com/super-ecosystem/partners/capital.svg', alt: 'Capital.com logo'},
    { name: 'Zemu', src: 'https://hackathon.superprotocol.com/super-ecosystem/partners/zemu.svg', alt: 'Zemu logo'},
    { name: 'Vana', src: 'https://hackathon.superprotocol.com/super-ecosystem/partners/vana.svg', alt: 'Vana logo'},
    { name: 'Generative Ventures', src: 'https://hackathon.superprotocol.com/super-ecosystem/partners/generative-ventures.svg', alt: 'Generative Ventures logo'},
    { name: 'ICODA', src: 'https://hackathon.superprotocol.com/super-ecosystem/partners/icoda.svg', alt: 'ICODA logo'},
];

export function SuperHackathonPageContent() {
    return (
        <div className="not-prose">
          <div className="mb-8 overflow-hidden rounded-lg shadow-xl">
            <Image
              src="/logo/promo/Super_Hackathon.jpeg"
              alt="Super Hackathon Banner"
              width={1200}
              height={630}
              className="w-full h-auto"
              priority
            />
          </div>
          <Card className="mb-12 text-center bg-secondary/30 border-primary/20 overflow-hidden">
            <CardContent className="p-8 relative">
                <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[bottom_1px_center] dark:bg-grid-slate-400/[0.05] dark:bg-bottom"></div>
                <div className="relative z-10">
                  <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-4 text-primary">
                      The Super Hackathon
                  </h1>
                  <p className="max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground mb-8">
                      Build your dApp, earn up to $20,000 USDT, and gain visibility among leading Web3 investors and partners.
                  </p>
                  <div className="flex justify-center items-center gap-4 md:gap-8 mb-8 text-lg font-semibold flex-wrap">
                      <div className="flex items-center gap-2"><Trophy className="text-yellow-400"/><span>$20,000 USDT Prize Pool</span></div>
                      <div className="flex items-center gap-2"><Calendar className="text-yellow-400"/><span>Oct 13-31, 2025</span></div>
                  </div>
                  <a href="https://bit.ly/SuperHackathon" target="_blank" rel="noopener noreferrer">
                      <Button size="lg" className="bg-yellow-400 text-black hover:bg-yellow-500 text-lg py-3 px-10 shadow-lg transition-transform hover:scale-105">
                          Enter Now <ArrowRight className="ml-2"/>
                      </Button>
                  </a>
                  <p className="mt-4 text-sm text-yellow-500 dark:text-yellow-300">The hackathon is live. Early submissions have an edge!</p>
                </div>
            </CardContent>
          </Card>

          <div className="my-16 text-center">
            <h2 className="text-3xl font-bold mb-4">About the Super Hackathon</h2>
            <p className="max-w-4xl mx-auto text-muted-foreground">The Super Hackathon is a global competition to demonstrate how easily dApps can scale on opBNB with Super Protocol. It’s a live stress test — proving real-world performance and reliability.</p>
          </div>
          
           <div className="my-16">
            <h2 className="text-3xl font-bold text-center mb-8">Friends of Super</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
                    {partnersLogos.map((logo) => (
                        <div key={logo.name} className="flex justify-center items-center p-4 bg-gray-900 rounded-lg h-24" title={logo.name}>
                            <div className="relative h-12 w-full">
                                <Image
                                  src={logo.src}
                                  alt={logo.alt}
                                  fill
                                  className="object-contain"
                                  unoptimized
                                />
                            </div>
                        </div>
                    ))}
                </div>
           </div>

          <div className="grid md:grid-cols-2 gap-8 my-16">
            <Card>
              <CardHeader>
                <CardTitle>Super Protocol</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">A confidential Web3 AI cloud that provides a secure, decentralized environment to deploy applications and AI workloads without relying on centralized providers. By running inside Trusted Execution Environments (TEEs), Super Protocol ensures that code and data remain private and verifiable.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Confidential Oracles</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Built on Chainlink Data Feeds and executed inside TEEs, they keep all data and computations private while remaining verifiable on-chain, offering major improvements in speed and cost efficiency compared to traditional oracles.</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="my-16">
              <h2 className="text-3xl font-bold text-center mb-8">Key Requirements</h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  "dApp must use Chainlink Data Feeds.",
                  "Must be open-source and deployed before Sep 1, 2025.",
                  "Contracts must be verified on a block explorer.",
                  "Migration should require minimal code changes (<5%).",
                  "Frontend is optional; evaluation is on-chain.",
                  "License must allow forking (MIT, Apache, GPL)."
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 p-4 rounded-lg bg-card border">
                    <Check className="h-5 w-5 text-green-500 mt-1 shrink-0"/>
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
          </div>
          
          <div className="my-16">
              <h2 className="text-3xl font-bold text-center mb-8">Scoring System</h2>
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <Card>
                    <CardHeader><Star className="mx-auto h-8 w-8 text-yellow-400"/><CardTitle className="mt-2">Unique dApp Bonus</CardTitle></CardHeader>
                    <CardContent><p className="text-muted-foreground">Be the first to submit a specific dApp and earn 100 bonus points.</p></CardContent>
                </Card>
                <Card>
                    <CardHeader><Sparkles className="mx-auto h-8 w-8 text-blue-400"/><CardTitle className="mt-2">Deployment Points</CardTitle></CardHeader>
                    <CardContent><p className="text-muted-foreground">Earn 100 points for each successfully deployed and confirmed contract on opBNB.</p></CardContent>
                </Card>
                <Card>
                    <CardHeader><Briefcase className="mx-auto h-8 w-8 text-green-400"/><CardTitle className="mt-2">Transaction Activity</CardTitle></CardHeader>
                    <CardContent><p className="text-muted-foreground">Earn up to 100 points based on the number of successful transactions your dApp generates.</p></CardContent>
                </Card>
              </div>
          </div>

          <Card className="my-16">
            <CardHeader>
              <CardTitle className="text-center text-2xl text-primary">Prize Pool: $20,000 USDT</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 max-w-md mx-auto">
                <li className="flex justify-between items-center text-lg p-3 bg-yellow-400/20 rounded-md"><strong>1st Place</strong><span className="font-bold text-yellow-600">$8,000</span></li>
                <li className="flex justify-between items-center text-lg p-3 bg-gray-300/20 rounded-md"><strong>2nd Place</strong><span className="font-bold text-gray-500">$4,000</span></li>
                <li className="flex justify-between items-center text-lg p-3 bg-orange-400/20 rounded-md"><strong>3rd Place</strong><span className="font-bold text-orange-600">$3,000</span></li>
                <li className="flex justify-between items-center text-lg p-3 bg-blue-300/10 rounded-md"><strong>4th–10th Place</strong><span className="font-bold">$714 each</span></li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mt-12 col-span-full bg-primary/5 border-primary/20">
            <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                <div className="flex-shrink-0 bg-primary/10 p-3 rounded-full hidden md:block">
                    <Rss className="h-8 w-8 text-primary"/>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-primary mb-1">Ready to Build and Win?</h3>
                    <p className="text-muted-foreground">The hackathon is live. Early submissions have a distinct advantage. Start building now to claim your spot on the leaderboard.</p>
                </div>
                <a href="https://bit.ly/SuperHackathon" target="_blank" rel="noopener noreferrer" className="flex-shrink-0 mt-4 md:mt-0">
                    <Button size="lg">
                        Enter Hackathon <ArrowRight className="ml-2 h-4 w-4"/>
                    </Button>
                </a>
            </CardContent>
          </Card>
        </div>
    );
}
