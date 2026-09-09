import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { PageShell } from "@/components/page-shell";
import { ContactForm } from "@/components/contact-form";

export const revalidate = 86400; // 24 hours

export const metadata: Metadata = {
  title: "Contact Us | Partnerships, Support & Developer Inquiries",
  description:
    "Connect with the Hashtag Web3 team for event partnerships, hiring campaigns, API integrations, and community support.",
  alternates: {
    canonical: "https://hashtagweb3.com/contact",
  },
  openGraph: {
    title: "Contact Us",
    description:
      "Direct communication channels for event partnerships, employer hiring campaigns, developer API integrations, and community support.",
    url: "https://hashtagweb3.com/contact",
    siteName: "Hashtag Web3",
    locale: "en_US",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Contact Hashtag Web3" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Us",
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
          <div className="site-container space-y-12">
            
            {/* Header */}
            <PageHeader
              title="Contact Us"
              description="Reach out for event partnerships, employer hiring campaigns, developer API integrations, or media inquiries."
            />

            {/* Direct Contact Methods */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border rounded-xl p-6 bg-card space-y-3">
                <h2 className="font-bold text-lg text-foreground">Partnerships &amp; Events</h2>
                <p className="text-sm text-muted-foreground">
                  Conference promotions, community discounts, and media partnerships.
                </p>
                <div className="pt-2 text-sm font-medium space-y-1">
                  <div>
                    <a href="mailto:contact@hashtagweb3.com?subject=Partnership%20Inquiry" className="text-primary hover:underline">
                      contact@hashtagweb3.com
                    </a>
                  </div>
                  <div>
                    <a href="https://t.me/web3jobs_rep" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                      Telegram: @web3jobs_rep
                    </a>
                  </div>
                </div>
              </div>

              <div className="border rounded-xl p-6 bg-card space-y-3">
                <h2 className="font-bold text-lg text-foreground">Hiring &amp; Job Board</h2>
                <p className="text-sm text-muted-foreground">
                  Distribute Web3 openings across our candidate network and job board.
                </p>
                <div className="pt-2 text-sm font-medium space-y-1">
                  <div>
                    <a href="mailto:contact@hashtagweb3.com?subject=Hiring%20Inquiry" className="text-primary hover:underline">
                      contact@hashtagweb3.com
                    </a>
                  </div>
                  <div>
                    <Link href="/jobs" className="text-muted-foreground hover:text-foreground">
                      Browse Live Jobs →
                    </Link>
                  </div>
                </div>
              </div>

              <div className="border rounded-xl p-6 bg-card space-y-3">
                <h2 className="font-bold text-lg text-foreground">Developers &amp; API</h2>
                <p className="text-sm text-muted-foreground">
                  REST endpoints, OpenAPI schemas, and Model Context Protocol servers.
                </p>
                <div className="pt-2 text-sm font-medium space-y-1">
                  <div>
                    <a href="mailto:dev@hashtagweb3.com?subject=API%20Inquiry" className="text-primary hover:underline">
                      dev@hashtagweb3.com
                    </a>
                  </div>
                  <div>
                    <Link href="/developers" className="text-muted-foreground hover:text-foreground">
                      Developer Docs →
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Form */}
            <div className="pt-4">
              <ContactForm />
            </div>

            {/* Social & Community Links */}
            <div className="border-t pt-8 space-y-4">
              <h2 className="font-bold text-lg text-foreground">Official Channels</h2>
              <div className="flex flex-wrap gap-6 text-sm">
                <a href="https://t.me/web3hiring" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                  Telegram Channel (@web3hiring)
                </a>
                <a href="https://x.com/hashtag_web3" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                  X / Twitter (@hashtag_web3)
                </a>
                <a href="https://linkedin.com/company/hashtagweb3" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                  LinkedIn (hashtagweb3)
                </a>
                <a href="https://hashtagweb3.com/logo/HashtagWeb3.png" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                  Brand Assets (Logo PNG)
                </a>
              </div>
            </div>

          </div>
        </PageShell>
      </main>
    </div>
  );
}
