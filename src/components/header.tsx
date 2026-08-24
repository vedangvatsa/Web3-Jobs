import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';
import type { SiteNavigationElement } from 'schema-dts';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { MobileNav } from './mobile-nav';
import {
  MAIN_NAV_LINKS,
  RESOURCE_LINKS,
  EMPLOYEE_RESOURCES,
  EMPLOYER_RESOURCES,
} from '@/lib/nav-config';

export function Header() {
  const siteUrl = 'https://hashtagweb3.com';
  const navigationSchema: SiteNavigationElement = {
    '@type': 'SiteNavigationElement',
    name: 'Main Navigation',
    about: 'Main navigation links for Hashtag Web3',
    hasPart: MAIN_NAV_LINKS.map((link) => ({
      '@type': 'WebPage',
      name: link.label,
      url: link.href.startsWith('http') ? link.href : `${siteUrl}${link.href}`,
    })),
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background">
      <Script
        id="site-navigation-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(navigationSchema) }}
      />
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2" aria-label="Hashtag Web3 Homepage">
          <Image
            src="/logo/HashtagWeb3.png"
            alt="Hashtag Web3 Logo"
            width={140}
            height={24}
            className="h-6 w-auto"
            priority
          />
        </Link>

        <nav
          className="hidden lg:flex items-center gap-6 text-sm font-medium"
          aria-label="Main Navigation"
        >
          {MAIN_NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}

          <DropdownMenu>
            <DropdownMenuTrigger
              className="flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground text-sm font-medium focus:outline-none"
              aria-label="Toggle resources menu"
            >
              Resources <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" aria-label="Resources Dropdown">
              <DropdownMenuLabel>Learn & Explore</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {RESOURCE_LINKS.map((link) => {
                const IconComponent = link.icon;
                return (
                  <DropdownMenuItem key={link.label} asChild>
                    <Link href={link.href} className="flex items-center gap-2">
                      {IconComponent && <IconComponent className="h-4 w-4 text-muted-foreground" />}
                      {link.label}
                    </Link>
                  </DropdownMenuItem>
                );
              })}
              <DropdownMenuLabel className="pt-2">For Employees</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {EMPLOYEE_RESOURCES.map((link) => {
                const IconComponent = link.icon;
                return (
                  <DropdownMenuItem key={link.label} asChild>
                    <Link href={link.href} className="flex items-center gap-2">
                      {IconComponent && <IconComponent className="h-4 w-4 text-muted-foreground" />}
                      {link.label}
                    </Link>
                  </DropdownMenuItem>
                );
              })}
              <DropdownMenuLabel className="pt-2">For Employers</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {EMPLOYER_RESOURCES.map((link) => {
                const IconComponent = link.icon;
                return (
                  <DropdownMenuItem key={link.label} asChild>
                    <Link href={link.href} className="flex items-center gap-2">
                      {IconComponent && <IconComponent className="h-4 w-4 text-muted-foreground" />}
                      {link.label}
                    </Link>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <div className="flex items-center gap-3">
          <a href="https://t.me/web3jobs_rep" target="_blank" rel="noopener noreferrer">
            <Button size="sm" variant="default" className="shadow-sm font-semibold">
              Post a Job
            </Button>
          </a>
          <div className="lg:hidden">
            <MobileNav />
          </div>
        </div>
      </div>
    </header>
  );
}
