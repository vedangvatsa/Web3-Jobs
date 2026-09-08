import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { PageShell } from "@/components/page-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ContactForm } from "@/components/contact-form";
import {
  Mail,
  Send,
  Calendar,
  Briefcase,
  Terminal,
  Download,
  Clock,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Globe,
  Share2,
} from "lucide-react";

export const revalidate = 86400; // 24 hours

export const metadata: Metadata = {
  title: "Contact Hashtag Web3 | Partnerships, Support & Developer Inquiries",
  description:
    "Connect with the Hashtag Web3 team for event partnerships, hiring campaigns, API integrations, and community support.",
  alternates: {
    canonical: "https://hashtagweb3.com/contact",
  },
  openGraph: {
    title: "Contact Hashtag Web3",
    description:
      "Direct communication channels for event partnerships, employer hiring campaigns, developer API integrations, and community support.",
    url: "https://hashtagweb3.com/contact",
    siteName: "Hashtag Web3",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Contact Hashtag Web3",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Hashtag Web3",
    description:
      "Direct communication channels for event partnerships, employer hiring campaigns, and API integrations.",
    images: ["/og-image.png"],
    creator: "@hashtag_web3",
  },
};

export default function ContactPage() {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact Hashtag Web3",
    url: "https://hashtagweb3.com/contact",
    description:
      "Contact information and inquiry channels for Hashtag Web3 partnerships, hiring campaigns, and developer API support.",
    mainEntity: {
      "@type": "Organization",
      name: "Hashtag Web3",
      url: "https://hashtagweb3.com",
      logo: "https://hashtagweb3.com/logo.png",
      sameAs: [
        "https://x.com/hashtag_web3",
        "https://linkedin.com/company/hashtagweb3",
        "https://t.me/web3hiring",
      ],
      contactPoint: [
        {
          "@type": "ContactPoint",
          email: "contact@hashtagweb3.com",
          contactType: "customer support and partnerships",
          availableLanguage: ["English"],
        },
        {
          "@type": "ContactPoint",
          email: "dev@hashtagweb3.com",
          contactType: "technical and API support",
          availableLanguage: ["English"],
        },
      ],
    },
  };

  return (
    <div className="flex flex-col min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      <main className="flex-1">
        <PageShell>
          <div className="site-container space-y-12 py-4">

            {/* Header */}
            <section className="text-center space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Verified Direct Channels</span>
              </div>
              <PageHeader
                title="Get in Touch with Hashtag Web3"
                description="Connect with our team for event and media partnerships, talent hiring campaigns, developer API integrations, or general platform inquiries."
              />
            </section>

            {/* Direct Channel Cards */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* Card 1: Partnerships */}
              <Card className="flex flex-col justify-between border shadow-xs hover:border-primary/40 transition-colors">
                <CardHeader className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <Badge variant="secondary" className="text-xs font-normal">
                      Alex | Partnerships
                    </Badge>
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold">Event &amp; Media Partnerships</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground mt-1">
                      Collaborate on conference promotions, exclusive community discount codes, and media partner exchanges.
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                  <div className="space-y-2 text-sm">
                    <a
                      href="mailto:contact@hashtagweb3.com?subject=Partnership%20Inquiry"
                      className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/30 hover:bg-muted transition-colors text-foreground font-medium text-xs sm:text-sm"
                    >
                      <span className="flex items-center gap-2 truncate">
                        <Mail className="h-4 w-4 text-primary shrink-0" />
                        <span className="truncate">contact@hashtagweb3.com</span>
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    </a>

                    <a
                      href="https://t.me/web3jobs_rep"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/30 hover:bg-muted transition-colors text-foreground font-medium text-xs sm:text-sm"
                    >
                      <span className="flex items-center gap-2 truncate">
                        <Send className="h-4 w-4 text-[#229ED9] shrink-0" />
                        <span className="truncate">@web3jobs_rep (Telegram)</span>
                      </span>
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    </a>
                  </div>

                  <div className="pt-2 border-t flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>Response time: Under 24 hours</span>
                  </div>
                </CardContent>
              </Card>

              {/* Card 2: Hiring & Talent */}
              <Card className="flex flex-col justify-between border shadow-xs hover:border-primary/40 transition-colors">
                <CardHeader className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Briefcase className="h-5 w-5" />
                    </div>
                    <Badge variant="secondary" className="text-xs font-normal">
                      Talent &amp; Employers
                    </Badge>
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold">Hiring &amp; Job Postings</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground mt-1">
                      Distribute roles across our 100k+ member job board, 60k+ subscriber Telegram channel, and newsletter.
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                  <div className="space-y-2 text-sm">
                    <Link
                      href="/jobs"
                      className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/30 hover:bg-muted transition-colors text-foreground font-medium text-xs sm:text-sm"
                    >
                      <span className="flex items-center gap-2 truncate">
                        <Globe className="h-4 w-4 text-primary shrink-0" />
                        <span className="truncate">Browse Live Job Board</span>
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    </Link>

                    <a
                      href="https://t.me/web3jobs_rep"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/30 hover:bg-muted transition-colors text-foreground font-medium text-xs sm:text-sm"
                    >
                      <span className="flex items-center gap-2 truncate">
                        <Send className="h-4 w-4 text-[#229ED9] shrink-0" />
                        <span className="truncate">Recruiter Direct Desk</span>
                      </span>
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    </a>
                  </div>

                  <div className="pt-2 border-t flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>Activation: Same-day turnaround</span>
                  </div>
                </CardContent>
              </Card>

              {/* Card 3: Developer & API */}
              <Card className="flex flex-col justify-between border shadow-xs hover:border-primary/40 transition-colors">
                <CardHeader className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Terminal className="h-5 w-5" />
                    </div>
                    <Badge variant="secondary" className="text-xs font-normal">
                      Technical &amp; MCP
                    </Badge>
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold">Developer &amp; API Support</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground mt-1">
                      Integrate machine-readable REST endpoints, OpenAPI 3.1 schemas, and Model Context Protocol servers.
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                  <div className="space-y-2 text-sm">
                    <Link
                      href="/developers"
                      className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/30 hover:bg-muted transition-colors text-foreground font-medium text-xs sm:text-sm"
                    >
                      <span className="flex items-center gap-2 truncate">
                        <Terminal className="h-4 w-4 text-primary shrink-0" />
                        <span className="truncate">Developer Documentation</span>
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    </Link>

                    <a
                      href="mailto:dev@hashtagweb3.com?subject=API%20Inquiry"
                      className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/30 hover:bg-muted transition-colors text-foreground font-medium text-xs sm:text-sm"
                    >
                      <span className="flex items-center gap-2 truncate">
                        <Mail className="h-4 w-4 text-primary shrink-0" />
                        <span className="truncate">dev@hashtagweb3.com</span>
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    </a>
                  </div>

                  <div className="pt-2 border-t flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>Sandbox: No API key required</span>
                  </div>
                </CardContent>
              </Card>

            </section>

            {/* Brand Assets & Partner Media Kit Banner */}
            <section className="bg-card border rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-1.5 max-w-2xl">
                  <div className="inline-flex items-center gap-1.5 text-xs font-medium text-primary uppercase tracking-wide">
                    <Download className="h-3.5 w-3.5" />
                    <span>Media &amp; Conference Assets</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                    Brand Assets &amp; Official Logos
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Official high-resolution logos, transparent PNGs, and platform metrics for conference booklets, partner directories, and press announcements.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href="https://hashtagweb3.com/logo/HashtagWeb3.png"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="default" size="sm" className="gap-2">
                      <Download className="h-4 w-4" />
                      <span>Download Logo (PNG)</span>
                    </Button>
                  </a>
                  <Link href="/community">
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <span>Community Stats</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                  <a href="/openapi.json" target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground">
                      <span>openapi.json</span>
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </a>
                </div>
              </div>
            </section>

            {/* Interactive Message Dispatch Form */}
            <section className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                  Send a Direct Inquiry
                </h2>
                <p className="text-sm text-muted-foreground">
                  Draft your message below to immediately launch your email client or copy formatted text.
                </p>
              </div>
              <ContactForm />
            </section>

            {/* Verified Community Channels Grid */}
            <section className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                  Verified Social &amp; Community Channels
                </h2>
                <p className="text-sm text-muted-foreground">
                  Join our official networks across Telegram, LinkedIn, X, and WhatsApp.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <a
                  href="https://t.me/web3hiring"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 rounded-xl border bg-card hover:border-primary/50 transition-all group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Send className="h-5 w-5 text-[#229ED9]" />
                    <Badge variant="outline" className="text-[10px]">60k+ Subs</Badge>
                  </div>
                  <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                    Telegram Jobs Feed
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    t.me/web3hiring
                  </p>
                </a>

                <a
                  href="https://t.me/web3jobs_rep"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 rounded-xl border bg-card hover:border-primary/50 transition-all group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Send className="h-5 w-5 text-[#229ED9]" />
                    <Badge variant="outline" className="text-[10px]">Direct</Badge>
                  </div>
                  <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                    Partnership Telegram
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    t.me/web3jobs_rep
                  </p>
                </a>

                <a
                  href="https://x.com/hashtag_web3"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 rounded-xl border bg-card hover:border-primary/50 transition-all group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Share2 className="h-5 w-5 text-foreground" />
                    <Badge variant="outline" className="text-[10px]">20k-40k Live</Badge>
                  </div>
                  <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                    X (Twitter) Spaces
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    @hashtag_web3
                  </p>
                </a>

                <a
                  href="https://linkedin.com/company/hashtagweb3"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 rounded-xl border bg-card hover:border-primary/50 transition-all group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Globe className="h-5 w-5 text-[#0A66C2]" />
                    <Badge variant="outline" className="text-[10px]">26M Views</Badge>
                  </div>
                  <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                    LinkedIn Network
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    hashtagweb3
                  </p>
                </a>
              </div>
            </section>

            {/* Frequently Asked Questions */}
            <section className="bg-card border rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                  Frequently Asked Questions
                </h2>
                <p className="text-sm text-muted-foreground">
                  Common questions about partnerships, listing jobs, response SLAs, and API access.
                </p>
              </div>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-left font-semibold text-sm sm:text-base">
                    How quickly does the Hashtag Web3 team reply?
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                    General email inquiries to contact@hashtagweb3.com receive a reply within 24 hours on business days. Direct messages to our Telegram lead desk (@web3jobs_rep) are monitored continuously and typically answered within a few hours.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger className="text-left font-semibold text-sm sm:text-base">
                    What are the standard terms for event and media partnerships?
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                    We support conferences, hackathons, and blockchain weeks by broadcasting the event and exclusive discount codes across our 100k+ member builder network. In exchange, we request our logo in the event partner section with a backlink, an exclusive community discount code, and complimentary passes for our team or member giveaways.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger className="text-left font-semibold text-sm sm:text-base">
                    How do employers post jobs or activate custom hiring campaigns?
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                    Companies can submit job openings directly or reach out via contact@hashtagweb3.com for sponsored listings, featured Telegram broadcasts, and talent alerts distributed to verified Web3 candidates.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger className="text-left font-semibold text-sm sm:text-base">
                    Where can developers access the public REST API and MCP endpoints?
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                    All public endpoints, OpenAPI 3.1 specifications, and Model Context Protocol servers are documented on our Developer Portal at hashtagweb3.com/developers. Zero-auth sandbox endpoints are also available for immediate agent testing.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </section>

          </div>
        </PageShell>
      </main>
    </div>
  );
}
