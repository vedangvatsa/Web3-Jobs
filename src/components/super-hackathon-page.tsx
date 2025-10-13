
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Trophy, Calendar, ArrowRight, Rss, Briefcase, Check, Sparkles, Star, Target, GitBranch, Cloud, Send, Users } from 'lucide-react';
import Image from 'next/image';

const partnersLogos = [
    { name: 'Google Cloud', src: 'https://hackathon.superprotocol.com/super-ecosystem/partners/google-cloud.svg', alt: 'Google Cloud logo'},
    { name: 'Fenbushi Capital', src: 'https://hackathon.superprotocol.com/super-ecosystem/partners/fenbushi-capital.svg', alt: 'Fenbushi Capital logo'},
    { name: 'Capital', src: 'https://hackathon.superprotocol.com/super-ecosystem/partners/capital.svg', alt: 'Capital.com logo'},
    { name: 'Zemu', src: 'https://hackathon.superprotocol.com/super-ecosystem/partners/zemu.svg', alt: 'Zemu logo'},
    { name: 'Vana', src: 'https://hackathon.superprotocol.com/super-ecosystem/partners/vana.svg', alt: 'Vana logo'},
    { name: 'Generative Ventures', src: 'https://hackathon.superprotocol.com/super-ecosystem/partners/generative-ventures.svg', alt: 'Generative Ventures logo'},
    { name: 'ICODA', src: 'https://hackathon.superprotocol.com/super-ecosystem/partners/icoda.svg', alt: 'ICODA logo'},
];

const timelineEvents = [
    { date: 'Sep 18', title: 'Early Registration' },
    { date: 'Oct 13', title: 'Submissions Begin' },
    { date: 'Oct 31', title: 'Submissions End' },
    { date: 'Nov 7', title: 'Evaluation & Winners' },
    { date: 'Nov 28', title: 'Prize Claim Deadline' },
];

const participationSteps = [
    { title: 'Choose dApp', description: 'Select an open-source dApp to migrate.', icon: GitBranch },
    { title: 'Deploy to opBNB', description: 'Migrate and deploy your chosen dApp to the opBNB network.', icon: Cloud },
    { title: 'Connect Oracles', description: 'Integrate confidential oracle data feeds into your dApp.', icon: Rss },
    { title: 'Submit Project', description: 'Submit your project through the official hackathon portal.', icon: Send },
    { title: 'Grow Adoption', description: 'Bring friends and generate on-chain activity to climb the leaderboard.', icon: Users },
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
                      Build your dApp on opBNB, earn up to $20,000 USDT, and gain visibility among leading Web3 investors and partners.
                  </p>
                  <div className="flex justify-center items-center gap-4 md:gap-8 mb-8 text-lg font-semibold flex-wrap">
                      <div className="flex items-center gap-2"><Trophy className="text-primary"/><span>$20,000 USDT Prize Pool</span></div>
                      <div className="flex items-center gap-2"><Calendar className="text-primary"/><span>Oct 13-31, 2025</span></div>
                  </div>
                  <a href="https://bit.ly/SuperHackathon" target="_blank" rel="noopener noreferrer">
                      <Button size="lg" className="text-lg py-3 px-10 shadow-lg transition-transform hover:scale-105">
                          Enter Now <ArrowRight className="ml-2"/>
                      </Button>
                  </a>
                  <p className="mt-4 text-sm text-primary/80">The hackathon is live. Early submissions have a distinct advantage!</p>
                </div>
            </CardContent>
          </Card>

          <div className="my-16 text-center">
            <h2 className="text-3xl font-bold mb-4">About the Super Hackathon</h2>
            <p className="max-w-4xl mx-auto text-muted-foreground">The Super Hackathon is a global Web3 event designed to demonstrate the scalability and security of Super Protocol’s cloud under real on-chain load. Participants will migrate existing open-source dApps to opBNB, integrate confidential oracle data feeds, and generate verifiable transactions to stress-test performance.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 my-16">
            <Card>
              <CardHeader>
                <CardTitle>About Super Protocol</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Super Protocol is a confidential Web3 AI cloud that brings together the power of blockchain and confidential computing. It provides a secure, decentralized environment for developers to deploy applications and AI workloads without relying on centralized providers, ensuring data privacy and verifiable execution inside hardware-based Trusted Execution Environments (TEEs).</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Confidential Oracles</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Built on Chainlink Data Feeds and executed inside TEEs, confidential oracles offer major improvements in speed and cost efficiency. A single Super Protocol node can handle the workload of about 1,000 traditional oracle nodes, keeping data and computations private while remaining verifiable on-chain.</p>
              </CardContent>
            </Card>
          </div>
          
            <div className="my-16 text-center">
                <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">Hackathon Powered By</h3>
                <div className="flex justify-center items-center p-4 bg-gray-900 rounded-lg max-w-sm mx-auto h-32" title="BNB Chain">
                    <div className="relative h-20 w-full">
                        <Image
                          src="https://hackathon.superprotocol.com/super-ecosystem/partners/bnb-chain.svg"
                          alt="BNB Chain Logo"
                          fill
                          className="object-contain"
                          unoptimized
                        />
                    </div>
                </div>
            </div>

           <div className="my-16 text-center">
            <h2 className="text-3xl font-bold mb-4">Partners & Friends</h2>
            <p className="text-muted-foreground -mt-4 mb-8">Hashtag Web3 is a proud community partner for this event.</p>
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

            <div className="my-16 text-center">
                <h2 className="text-3xl font-bold mb-4">How to Participate</h2>
                <p className="max-w-3xl mx-auto text-muted-foreground mb-12">Follow these five steps to take part in the Super Hackathon. From choosing an open-source dApp to growing adoption, the process is simple and transparent.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
                    {participationSteps.map((step, index) => (
                        <div key={step.title} className="flex flex-col items-center">
                            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 border-2 border-primary/20 mb-4">
                                <step.icon className="h-8 w-8 text-primary" />
                            </div>
                            <h4 className="font-semibold text-lg">{`STEP ${index + 1}`}</h4>
                            <p className="text-muted-foreground text-sm">{step.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="my-16">
              <h2 className="text-3xl font-bold text-center mb-8">Evaluation Criteria</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <Card>
                    <CardHeader><Star className="mx-auto h-8 w-8 text-primary"/><CardTitle className="mt-2">Unique dApp Bonus</CardTitle></CardHeader>
                    <CardContent><p className="text-muted-foreground">Be the first team to submit a specific dApp and earn a 100-point bonus.</p></CardContent>
                </Card>
                <Card>
                    <CardHeader><Sparkles className="mx-auto h-8 w-8 text-primary"/><CardTitle className="mt-2">Deployment Points</CardTitle></CardHeader>
                    <CardContent><p className="text-muted-foreground">Earn 100 points for each successfully deployed and confirmed contract on opBNB.</p></CardContent>
                </Card>
                <Card>
                    <CardHeader><Target className="mx-auto h-8 w-8 text-primary"/><CardTitle className="mt-2">Transaction Activity</CardTitle></CardHeader>
                    <CardContent><p className="text-muted-foreground">Generate on-chain transactions to earn up to 100 points, with 10M+ transactions earning the maximum score.</p></CardContent>
                </Card>
              </div>
          </div>


          <div className="my-16">
            <h2 className="text-3xl font-bold text-center mb-8">Timeline</h2>
            <div className="relative max-w-5xl mx-auto">
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2 hidden md:block"></div>
                {timelineEvents.map((event, i) => (
                    <div key={event.title} className="relative mb-8 md:mb-0">
                        <div className="flex items-center md:justify-center md:[&>*:nth-child(1)]:w-1/2 md:[&>*:nth-child(3)]:w-1/2">
                            <div className={`hidden md:block ${i % 2 !== 0 ? 'pr-8 text-right' : ''}`}>
                               {i % 2 !== 0 && (
                                <Card className="md:ml-auto md:max-w-sm">
                                    <CardContent className="p-4">
                                        <p className="text-sm text-primary font-semibold">{event.date}</p>
                                        <p className="font-bold mt-1">{event.title}</p>
                                    </CardContent>
                                </Card>
                               )}
                            </div>
                            <div className="hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground text-2xl font-bold shadow-lg z-10">{i+1}</div>
                            <div className={`md:pl-8 ${i % 2 === 0 ? '' : 'hidden md:block'}`}>
                               <Card className={`md:ml-4 ${i % 2 === 0 ? '' : 'invisible'}`}>
                                    <CardContent className="p-4">
                                        <p className="text-sm text-primary font-semibold">{event.date}</p>
                                        <p className="font-bold mt-1">{event.title}</p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
          </div>

          <Card className="my-16">
            <CardHeader>
              <CardTitle className="text-center text-2xl text-primary">Prize Pool: $20,000 USDT</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 max-w-md mx-auto">
                <li className="flex justify-between items-center text-lg p-3 bg-primary/10 rounded-md"><strong>1st Place</strong><span className="font-bold text-primary">$8,000</span></li>
                <li className="flex justify-between items-center text-lg p-3 bg-secondary rounded-md"><strong>2nd Place</strong><span className="font-bold text-foreground">$4,000</span></li>
                <li className="flex justify-between items-center text-lg p-3 bg-secondary rounded-md"><strong>3rd Place</strong><span className="font-bold text-foreground">$3,000</span></li>
                <li className="flex justify-between items-center text-lg p-3 bg-secondary rounded-md"><strong>4th–10th Place</strong><span className="font-bold">$714 each</span></li>
              </ul>
            </CardContent>
          </Card>
          
          <div className="my-16">
              <h2 className="text-3xl font-bold text-center mb-8">Eligibility Requirements</h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  "dApp must use Chainlink Data Feeds in its on-chain logic.",
                  "Original dApp must be open-source and publicly deployed before Sep 1, 2025.",
                  "Both original and migrated contracts must be verified on a block explorer.",
                  "Migration should require minimal code changes (<5% of original codebase).",
                  "Frontend is optional; evaluation is based on on-chain activity.",
                  "Project license must allow forking (e.g., MIT, Apache 2.0, GPL)."
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 p-4 rounded-lg bg-card border">
                    <Check className="h-5 w-5 text-green-500 mt-1 shrink-0"/>
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
          </div>

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
