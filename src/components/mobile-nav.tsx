'use client';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Menu, Users } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { trackOutboundClick } from '@/lib/posthog';
import {
  MAIN_NAV_LINKS,
  RESOURCE_LINKS,
  EMPLOYEE_RESOURCES,
  EMPLOYER_RESOURCES,
  SOCIAL_LINKS,
} from '@/lib/nav-config';

export function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-11 w-11 flex-col gap-0.5 [&_svg]:size-5" aria-label="Toggle navigation menu">
          <Menu aria-hidden="true" />
          <span className="text-[10px] leading-3">Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex w-[min(300px,100vw)] max-w-full flex-col bg-card p-0 [&>button]:right-2 [&>button]:top-2 [&>button]:flex [&>button]:h-11 [&>button]:w-11 [&>button]:items-center [&>button]:justify-center">
        <SheetHeader className="p-4 border-b flex flex-row items-center justify-between space-y-0 pr-12">
          <SheetTitle className="sr-only">Mobile Navigation</SheetTitle>
          <SheetDescription className="sr-only">Hashtag Web3 Navigation Menu</SheetDescription>
          <SheetClose asChild>
            <Link href="/" className="flex min-h-11 items-center rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" aria-label="Hashtag Web3 Homepage">
              <Image
                src="/logo/HashtagWeb3.png"
                alt="Hashtag Web3 Logo"
                width={144}
                height={48}
                className="h-5 w-[60px] object-contain dark:invert"
              />
            </Link>
          </SheetClose>
        </SheetHeader>
        <nav className="flex-grow flex flex-col p-4 overflow-y-auto">
          <div className="flex-grow space-y-2">
            {MAIN_NAV_LINKS.map((link) => {
              const IconComponent = link.icon;
              return (
                <SheetClose key={link.label} asChild>
                  <Link
                    href={link.href}
                    target={link.target}
                    rel={link.target ? 'noopener noreferrer' : undefined}
                    className="flex items-center gap-4 p-3 rounded-lg text-base font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    {IconComponent && <IconComponent className="h-5 w-5" />}
                    <span>{link.label}</span>
                  </Link>
                </SheetClose>
              );
            })}
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="resources" className="border-b-0">
                <AccordionTrigger className="flex items-center gap-4 p-3 rounded-lg text-base font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground no-underline [&[data-state=open]>svg]:rotate-180">
                  <div className="flex items-center gap-4">
                    <Users className="h-5 w-5" />
                    <span>Resources</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pl-4">
                  <h4 className="px-2 py-1.5 text-sm font-semibold">Learn & Explore</h4>
                  <div className="flex flex-col space-y-1 mt-1">
                    {RESOURCE_LINKS.map((link) => {
                      const IconComponent = link.icon;
                      return (
                        <SheetClose key={link.label} asChild>
                          <Link
                            href={link.href}
                            target={link.target}
                            rel={link.target ? 'noopener noreferrer' : undefined}
                            className="flex min-h-11 items-center gap-3 p-2 rounded-lg text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                          >
                            {IconComponent && <IconComponent className="h-4 w-4" />}
                            {link.label}
                          </Link>
                        </SheetClose>
                      );
                    })}
                  </div>
                  <h4 className="px-2 py-1.5 mt-2 text-sm font-semibold">For Employees</h4>
                  <div className="flex flex-col space-y-1 mt-1">
                    {EMPLOYEE_RESOURCES.map((link) => {
                      const IconComponent = link.icon;
                      return (
                        <SheetClose key={link.label} asChild>
                          <Link
                            href={link.href}
                            className="flex min-h-11 items-center gap-3 p-2 rounded-lg text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                          >
                            {IconComponent && <IconComponent className="h-4 w-4" />}
                            {link.label}
                          </Link>
                        </SheetClose>
                      );
                    })}
                  </div>
                  <h4 className="px-2 py-1.5 mt-2 text-sm font-semibold">For Employers</h4>
                  <div className="flex flex-col space-y-1 mt-1">
                    {EMPLOYER_RESOURCES.map((link) => {
                      const IconComponent = link.icon;
                      return (
                        <SheetClose key={link.label} asChild>
                          <Link
                            href={link.href}
                            className="flex min-h-11 items-center gap-3 p-2 rounded-lg text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                          >
                            {IconComponent && <IconComponent className="h-4 w-4" />}
                            {link.label}
                          </Link>
                        </SheetClose>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </nav>
        <div className="p-4 border-t bg-secondary/30 mt-auto">
          <div className="flex flex-wrap items-center justify-center">
            {SOCIAL_LINKS.map((link) => {
              const IconComponent = link.icon;
              return (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackOutboundClick(link.href, link.label)}
                  className="flex h-11 w-11 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={link.ariaLabel || link.label}
                >
                  {IconComponent && <IconComponent className="h-5 w-5" />}
                  <span className="sr-only">{link.label}</span>
                </a>
              );
            })}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
