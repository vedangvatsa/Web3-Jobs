import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';
import type { SiteNavigationElement, WithContext } from 'schema-dts';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { MobileNav } from './mobile-nav';
import { PostNavCta } from './post-nav-cta';
import {
  MAIN_NAV_LINKS,
  SITELINK_NAVIGATION_ITEMS,
  RESOURCE_LINKS,
  EMPLOYEE_RESOURCES,
  EMPLOYER_RESOURCES,
} from '@/lib/nav-config';

export function Header() {
  const siteUrl = 'https://hashtagweb3.com';
  const navigationSchema: WithContext<SiteNavigationElement> = {
    '@context': 'https://schema.org',
    '@type': 'SiteNavigationElement',
    name: 'Main Navigation',
    about: 'Primary navigation and sitelinks for Hashtag Web3',
    hasPart: SITELINK_NAVIGATION_ITEMS.map((link) => ({
      '@type': 'WebPage',
      name: link.label,
      description: link.description,
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
      <div className="site-container flex h-14 items-center justify-between gap-2 lg:grid lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-6">
        <Link href="/" className="flex min-h-11 shrink-0 items-center justify-self-start rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" aria-label="Hashtag Web3 Homepage">
          <Image
            src="/logo/HashtagWeb3.png"
            alt="Hashtag Web3 Logo"
            width={144}
            height={48}
            className="h-6 w-[72px] object-contain dark:invert"
            priority
          />
        </Link>

        <nav
          className="hidden items-center justify-self-center gap-6 whitespace-nowrap text-sm font-medium lg:flex"
          aria-label="Main Navigation"
        >
          {MAIN_NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="inline-flex min-h-11 items-center rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {link.label}
            </Link>
          ))}

          <DropdownMenu modal={false}>
            <DropdownMenuTrigger
              className="flex min-h-11 items-center gap-1 rounded-sm text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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

        <div className="flex shrink-0 items-center justify-end justify-self-end gap-2">
          <div className="h-11 w-32 shrink-0" data-header-action-slot>
            <PostNavCta />
          </div>
          <div className="lg:hidden">
            <MobileNav />
          </div>
        </div>
      </div>
    </header>
  );
}
