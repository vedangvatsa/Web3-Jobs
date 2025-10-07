'use client';

import { Instagram, Linkedin, Mail, Twitter, Send } from 'lucide-react';
import Link from 'next/link';
import type { Article } from '@/types';

export function FooterContent({ latestArticles }: { latestArticles: Omit<Article, 'content'>[] }) {
  const resourceLinks = [
    { href: "/interview-questions", label: "Interview Questions" },
    { href: "/web3-career-quiz", label: "Archetype Assessment" },
    { href: "/salary-calculator", label: "Salary Calculator" },
    { href: "/invoice-generator", label: "Invoice Generator" },
    { href: "/resume-builder", label: "Resume Builder" },
    { href: "/digital-nomad-visas", label: "Digital Nomad Visas" },
    { href: "/remote-work-checklist", label: "Remote Checklist" },
  ];

  return (
    <footer className="w-full border-t bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <h3 className="text-xl font-bold tracking-tight text-foreground">
              Hashtag Web3
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              The best place for top talent to discover exclusive opportunities at leading Web3 companies.
            </p>
             <div className="flex gap-5 mt-4">
              <a href="https://linkedin.com/company/hashtagweb3" target="_blank" rel="noopener noreferrer" className="text-muted-foreground transition-colors hover:text-foreground" aria-label="Follow us on LinkedIn">
                <Linkedin size={20} />
                <span className="sr-only">LinkedIn</span>
              </a>
              <a href="https://x.com/hashtag_web3" target="_blank" rel="noopener noreferrer" className="text-muted-foreground transition-colors hover:text-foreground" aria-label="Follow us on X">
                <Twitter size={20} />
                <span className="sr-only">X (formerly Twitter)</span>
              </a>
              <a href="https://t.me/hashtagweb3" target="_blank" rel="noopener noreferrer" className="text-muted-foreground transition-colors hover:text-foreground" aria-label="Join us on Telegram">
                <Send size={20} />
                <span className="sr-only">Telegram</span>
              </a>
              <a href="https://instagram.com/hashtagweb3" target="_blank" rel="noopener noreferrer" className="text-muted-foreground transition-colors hover:text-foreground" aria-label="Follow us on Instagram">
                <Instagram size={20} />
                <span className="sr-only">Instagram</span>
              </a>
               <a href="mailto:hi@hashtagweb3.com" className="text-muted-foreground transition-colors hover:text-foreground" aria-label="Email us">
                <Mail size={20} />
                <span className="sr-only">Email</span>
              </a>
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <h4 className="font-semibold text-foreground mb-3">Resources</h4>
            <ul className="space-y-2">
              {resourceLinks.map(link => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-1">
             <h4 className="font-semibold text-foreground mb-3">Recent from the Playbook</h4>
             <ul className="space-y-2">
              {latestArticles.map(article => (
                <li key={article.slug}>
                   <Link href={`/${article.slug}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {article.title}
                  </Link>
                </li>
              ))}
                 <li>
                    <Link href="/blog" className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
                        View all &rarr;
                    </Link>
                 </li>
            </ul>
          </div>

        </div>
      </div>
    </footer>
  );
}
