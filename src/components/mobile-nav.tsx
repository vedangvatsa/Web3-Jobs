'use client';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Menu, Users } from 'lucide-react';
import Link from 'next/link';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { trackCTAClick, trackOutboundClick } from '@/lib/posthog';
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
        <Button variant="ghost" size="icon">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] flex flex-col bg-card p-0">
        <div className="p-4 flex items-center justify-center border-b bg-secondary/50">
          <div className="flex items-center gap-6">
            {SOCIAL_LINKS.map((link) => {
              const IconComponent = link.icon;
              return (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackOutboundClick(link.href, link.label)}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={link.ariaLabel || link.label}
                >
                  {IconComponent && <IconComponent size={24} />}
                  <span className="sr-only">{link.label}</span>
                </a>
              );
            })}
          </div>
        </div>
        <nav className="flex-grow flex flex-col p-4 overflow-y-auto">
          <div className="flex-grow space-y-2">
            <SheetClose asChild>
              <a
                href="https://t.me/web3jobs_rep"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackCTAClick('post_a_job', 'https://t.me/web3jobs_rep')}
              >
                <Button className="w-full">Post a Job</Button>
              </a>
            </SheetClose>
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
                            className="flex items-center gap-3 p-2 rounded-lg text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
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
                            className="flex items-center gap-3 p-2 rounded-lg text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
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
                            className="flex items-center gap-3 p-2 rounded-lg text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
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
      </SheetContent>
    </Sheet>
  );
}
