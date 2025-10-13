
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Trophy, Calendar, Users, Code, Plus, ChevronRight, BarChart } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const partners = [
  { name: 'BNB Chain', src: '/logo/partners/bnb-chain.png', alt: 'BNB Chain logo' },
  { name: 'Google Cloud', src: '/logo/partners/google-cloud.png', alt: 'Google Cloud logo' },
  { name: 'Fenbushi Capital', src: '/logo/partners/fenbushi-capital.png', alt: 'Fenbushi Capital logo' },
  { name: 'Capital', src: '/logo/partners/capital.png', alt: 'Capital logo' },
  { name: 'Zemu', src: '/logo/partners/zemu.png', alt: 'Zemu logo' },
  { name: 'Vana', src: '/logo/partners/vana.png', alt: 'Vana logo' },
  { name: 'Generative Ventures', src: '/logo/partners/generative ventures.png', alt: 'Generative Ventures logo' },
  { name: 'Icoda', src: '/logo/partners/icoda.png', alt: 'Icoda logo' },
];

const faqItems = [
  {
    question: "Do I need to build a dApp from scratch?",
    answer: "No, the hackathon is focused on migrating existing open-source dApps to opBNB. You can also build from scratch if you prefer, as long as it meets the eligibility criteria."
  },
  {
    question: "How do I migrate dApps and integrate the data feeds?",
    answer: "The process involves deploying the dApp's smart contracts to the opBNB network and updating any frontend configurations. Super Protocol provides detailed guides and confidential oracle examples to assist with integration."
  },
  {
    question: "Is a frontend required?",
    answer: "Frontends are welcome and encouraged for a better user experience, but they are optional. The evaluation and scoring are based solely on the deployed smart contracts and their on-chain activity."
  },
  {
    question: "Which networks are supported for migration?",
    answer: "The original dApp must have been publicly deployed before September 1, 2025, on Ethereum, Polygon, or BNB Chain."
  },
  {
    question: "Can one team submit multiple projects?",
    answer: "Yes, teams may submit multiple unique dApps. However, each submission must have a different original contract address to qualify as unique. Duplicate projects from the same team are not allowed."
  },
  {
    question: "How does scoring work?",
    answer: "Scoring is based on three factors: a 100-point bonus for being the first team to submit a unique dApp, 100 points for each successfully deployed contract on opBNB, and an activity score from 1-100 based on the total number of successful transactions generated."
  }
];

export default function SuperHackathonPage() {
  return (
    <div className="bg-background text-foreground">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 text-center text-white overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900 via-purple-900 to-black opacity-80"></div>
           <Image
              src="/images/nasa-Q1p7bh3SHj8-unsplash.jpg"
              alt="Cosmic background"
              fill
              className="object-cover z-0"
              priority
            />
          <div className="container relative z-10">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-4">
              The Super Hackathon
            </h1>
            <p className="max-w-3xl mx-auto text-lg md:text-xl text-slate-300 mb-8">
              Build your dApp, earn up to $20,000 USDT, and gain visibility among leading Web3 investors and partners.
            </p>
            <div className="flex justify-center items-center gap-4 md:gap-8 mb-8 text-lg font-semibold">
                <div className="flex items-center gap-2"><Trophy className="text-yellow-400"/><span>$20,000 USDT Prize Pool</span></div>
                <div className="flex items-center gap-2"><Calendar className="text-yellow-400"/><span>Oct 13-31, 2025</span></div>
            </div>
            <a href="https://bit.ly/SuperHackathon" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="bg-yellow-400 text-black hover:bg-yellow-500 text-lg py-3 px-10">
                Enter Now <ArrowRight className="ml-2"/>
              </Button>
            </a>
            <p className="mt-4 text-sm text-yellow-300">The hackathon is live. Early submissions have an edge!</p>
          </div>
        </section>

        {/* About Section */}
        <section className="py-16 md:py-24 bg-secondary/30">
          <div className="container">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-4">About the Hackathon</h2>
                <p className="text-muted-foreground mb-4">
                  The Super Hackathon is a global Web3 event designed to demonstrate the scalability and security of Super Protocol’s cloud under real on-chain load. Participants will migrate existing open-source dApps to opBNB, integrate confidential oracle data feeds, and generate verifiable transactions to stress-test performance. The goal is to showcase how real-world decentralized services can operate efficiently, privately, and transparently at scale.
                </p>
                <h3 className="text-2xl font-bold mt-8 mb-4">About Super Protocol</h3>
                 <p className="text-muted-foreground">
                  Super Protocol is a confidential Web3 AI cloud that combines the power of blockchain with confidential computing. It provides developers a secure, decentralized environment to deploy applications and AI workloads without relying on centralized providers, ensuring data privacy and verifiable execution.
                </p>
              </div>
              <div className="p-8 bg-card rounded-lg shadow-lg">
                <h3 className="font-bold text-xl mb-4">Timeline</h3>
                <ol className="relative border-l border-primary/20">                  
                    <li className="mb-10 ml-6">            
                        <span className="absolute flex items-center justify-center w-6 h-6 bg-primary/20 rounded-full -left-3 ring-8 ring-background">
                            <Calendar className="w-3 h-3 text-primary" />
                        </span>
                        <h4 className="flex items-center mb-1 text-lg font-semibold">Early Registration</h4>
                        <time className="block mb-2 text-sm font-normal leading-none text-muted-foreground">September 18, 2025</time>
                    </li>
                    <li className="mb-10 ml-6">
                        <span className="absolute flex items-center justify-center w-6 h-6 bg-primary/20 rounded-full -left-3 ring-8 ring-background">
                            <Code className="w-3 h-3 text-primary" />
                        </span>
                        <h4 className="mb-1 text-lg font-semibold">Submissions Open</h4>
                        <time className="block mb-2 text-sm font-normal leading-none text-muted-foreground">October 13, 2025</time>
                    </li>
                    <li className="mb-10 ml-6">
                        <span className="absolute flex items-center justify-center w-6 h-6 bg-primary/20 rounded-full -left-3 ring-8 ring-background">
                            <BarChart className="w-3 h-3 text-primary" />
                        </span>
                        <h4 className="mb-1 text-lg font-semibold">Evaluation Period</h4>
                        <time className="block mb-2 text-sm font-normal leading-none text-muted-foreground">October 31, 2025</time>
                    </li>
                    <li className="ml-6">
                        <span className="absolute flex items-center justify-center w-6 h-6 bg-primary/20 rounded-full -left-3 ring-8 ring-background">
                            <Trophy className="w-3 h-3 text-primary" />
                        </span>
                         <h4 className="mb-1 text-lg font-semibold">Prize Claim</h4>
                        <time className="block mb-2 text-sm font-normal leading-none text-muted-foreground">November 7 - 28, 2025</time>
                    </li>
                </ol>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section className="py-16 md:py-24">
            <div className="container text-center">
                <h2 className="text-3xl font-bold mb-12">How It Works</h2>
                <div className="grid md:grid-cols-3 gap-8 text-left">
                    <Card>
                        <CardHeader><CardTitle>1. Choose & Migrate</CardTitle></CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Select an open-source dApp from Ethereum, Polygon, or BNB Chain that uses Chainlink Data Feeds. The migration should require minimal code changes (&lt;5%).</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader><CardTitle>2. Deploy to opBNB</CardTitle></CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Deploy your migrated, verified contract to the opBNB network between Oct 13 and Oct 31, 2025. Use your own infrastructure for testing and deployment.</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader><CardTitle>3. Submit & Compete</CardTitle></CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Submit your project through the official hackathon portal. Earn points for unique dApps, deployments, and on-chain transaction volume.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>

        {/* Scoring and Prizes Section */}
        <section className="py-16 md:py-24 bg-secondary/30">
            <div className="container">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-3xl font-bold mb-4">Scoring & Prizes</h2>
                        <p className="text-muted-foreground mb-6">Points are awarded based on a combination of deployment, transaction activity, and a special bonus for unique submissions. The top 10 teams will share a prize pool of $20,000 USDT.</p>
                        <div className="space-y-4">
                           <div className="flex items-center gap-4 p-4 bg-background rounded-lg">
                                <span className="text-2xl font-bold text-primary">100</span>
                                <div>
                                    <h4 className="font-semibold">Points per Deployed dApp</h4>
                                    <p className="text-sm text-muted-foreground">Each successfully confirmed contract earns points for your team.</p>
                                </div>
                            </div>
                             <div className="flex items-center gap-4 p-4 bg-background rounded-lg">
                                <span className="text-2xl font-bold text-primary">100</span>
                                <div>
                                    <h4 className="font-semibold">Bonus for Unique dApp</h4>
                                    <p className="text-sm text-muted-foreground">Be the first to submit a specific dApp and get a uniqueness bonus.</p>
                                </div>
                            </div>
                             <div className="flex items-center gap-4 p-4 bg-background rounded-lg">
                                <span className="text-2xl font-bold text-primary">1-100</span>
                                <div>
                                    <h4 className="font-semibold">Points for Transactions</h4>
                                    <p className="text-sm text-muted-foreground">Generate on-chain activity to earn points based on transaction volume.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                     <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-center text-2xl text-primary">Prize Pool: $20,000 USDT</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3">
                                <li className="flex justify-between items-center text-lg p-3 bg-yellow-400/20 rounded-md"><strong>1st Place</strong><span className="font-bold text-yellow-600">$8,000</span></li>
                                <li className="flex justify-between items-center text-lg p-3 bg-gray-300/20 rounded-md"><strong>2nd Place</strong><span className="font-bold text-gray-500">$4,000</span></li>
                                <li className="flex justify-between items-center text-lg p-3 bg-orange-400/20 rounded-md"><strong>3rd Place</strong><span className="font-bold text-orange-600">$3,000</span></li>
                                <li className="flex justify-between items-center text-lg p-3 bg-blue-300/10 rounded-md"><strong>4th–10th Place</strong><span className="font-bold">$714 each</span></li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>

        {/* Partners Section */}
        <section className="py-16 md:py-24">
          <div className="container text-center">
            <h2 className="text-3xl font-bold mb-4">Hackathon Partners</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-10">
              Industry leaders supporting the growth and adoption of Super Protocol.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
              {partners.map(partner => (
                <div key={partner.name} className="relative h-16 w-full grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all duration-300">
                  <Image src={partner.src} alt={partner.alt} fill className="object-contain" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 md:py-24 bg-secondary/30">
          <div className="container max-w-4xl">
            <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((item, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                  <AccordionTrigger className="text-lg text-left">{item.question}</AccordionTrigger>
                  <AccordionContent className="text-base text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 text-center">
          <div className="container">
            <h2 className="text-3xl font-bold">Ready to Build?</h2>
            <p className="text-muted-foreground mt-2 mb-6 max-w-xl mx-auto">
              Join the Super Hackathon today, showcase your skills, and compete for the $20,000 prize pool.
            </p>
             <a href="https://bit.ly/SuperHackathon" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg py-3 px-10">
                Register Now <ChevronRight className="ml-2"/>
              </Button>
            </a>
          </div>
        </section>

      </main>
    </div>
  );
}
