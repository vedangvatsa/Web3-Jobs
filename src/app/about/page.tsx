import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/page-header';

export const revalidate = 86400; // 24 hours

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <div className="container mx-auto page-section px-4">
          <div className="site-container space-y-12">
            
            {/* Header */}
            <section className="text-center">
              <PageHeader
                title="About Hashtag Web3"
                description="Empowering the decentralized workforce by connecting top builders with transformative blockchain opportunities."
              />
            </section>

            {/* Mission & Overview */}
            <section className="bg-card border rounded-2xl p-6 sm:p-10 shadow-sm space-y-6">
              <div className="text-primary font-semibold text-sm uppercase tracking-wider">
                Our Mission
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                Building the Career Infrastructure for the Decentralized Economy
              </h2>
              <p className="text-muted-foreground leading-relaxed text-base sm:text-lg">
                Founded in 2022, Hashtag Web3 (hashtagweb3.com) is the premier Web3 job board, career intelligence network, and developer resource platform. As the digital economy transitions from centralized walled gardens to open, verifiable blockchain networks, hiring demands are shifting rapidly. We bridge the talent gap between elite builders and pioneering blockchain protocols, DeFi foundations, DAOs, and crypto enterprises.
              </p>
              <p className="text-muted-foreground leading-relaxed text-base sm:text-lg">
                Today, Hashtag Web3 is trusted by over 60,000 active community members across Telegram, Discord, and LinkedIn. We list thousands of verified remote and on-site opportunities in Solidity, Rust, Zero-Knowledge engineering, smart contract security auditing, protocol architecture, tokenomics design, and crypto marketing.
              </p>
            </section>

            {/* Platform Numbers & Highlights */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <Card className="text-center p-6 flex flex-col justify-center min-h-[140px] shadow-sm">
                <CardContent className="p-0">
                  <p className="text-3xl sm:text-4xl font-bold text-foreground">60,000+</p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-2">Community Members</p>
                </CardContent>
              </Card>
              <Card className="text-center p-6 flex flex-col justify-center min-h-[140px] shadow-sm">
                <CardContent className="p-0">
                  <p className="text-3xl sm:text-4xl font-bold text-foreground">3,000+</p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-2">Web3 Jobs Indexed</p>
                </CardContent>
              </Card>
              <Card className="text-center p-6 flex flex-col justify-center min-h-[140px] shadow-sm">
                <CardContent className="p-0">
                  <p className="text-3xl sm:text-4xl font-bold text-foreground">150+</p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-2">Hiring Partners</p>
                </CardContent>
              </Card>
              <Card className="text-center p-6 flex flex-col justify-center min-h-[140px] shadow-sm">
                <CardContent className="p-0">
                  <p className="text-3xl sm:text-4xl font-bold text-foreground">500+</p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-2">Guides & Tutorials</p>
                </CardContent>
              </Card>
            </section>

            {/* Editorial Standards & Job Verification */}
            <section className="space-y-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                Our Verification & Editorial Standards
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 pt-8 shadow-sm">
                  <CardContent className="p-0 space-y-2">
                    <h3 className="font-bold text-lg text-foreground">Spam-Free Job Curation</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Every job posting is verified against legitimate corporate domain records, active protocol repositories, and confirmed hiring managers to eliminate scams and duplicate postings.
                    </p>
                  </CardContent>
                </Card>
                <Card className="p-6 pt-8 shadow-sm">
                  <CardContent className="p-0 space-y-2">
                    <h3 className="font-bold text-lg text-foreground">Technical Rigor</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Our 200+ term Web3 glossary and 47-lesson educational modules are written by active blockchain engineers, auditing professionals, and decentralized finance specialists.
                    </p>
                  </CardContent>
                </Card>
                <Card className="p-6 pt-8 shadow-sm">
                  <CardContent className="p-0 space-y-2">
                    <h3 className="font-bold text-lg text-foreground">Open Access & API First</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      We believe in open information architecture. All job data, industry news, and glossary definitions are available to humans and AI agents via public REST APIs and OpenAPI specs.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* CTA */}
            <section className="bg-primary/5 border border-primary/20 rounded-2xl p-8 text-center space-y-4">
              <h2 className="text-2xl font-bold text-foreground">Join the Leading Web3 Talent Network</h2>
              <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto">
                Whether you are looking to hire senior Solidity talent or seeking your next remote Web3 role, Hashtag Web3 gives you the tools to succeed.
              </p>
              <div className="flex flex-wrap justify-center gap-4 pt-2">
                <Link href="/jobs" className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors">
                  Explore Jobs <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link href="/contact" className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors">
                  Contact Us
                </Link>
              </div>
            </section>

          </div>
        </div>
      </main>
    </div>
  );
}
