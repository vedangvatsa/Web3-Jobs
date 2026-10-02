'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, Compass } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { NOMAD_TOOLS } from '@/lib/nomads/routes';
import { cn } from '@/lib/utils';

export function NomadNavigation() {
  const pathname = usePathname();
  const main = NOMAD_TOOLS.filter(tool => ['cities', 'places', 'compare', 'cost-of-living', 'visas'].includes(tool.key));
  const mobilePrimary = new Set(['cities', 'places', 'compare']);
  const overflow = NOMAD_TOOLS.filter(tool => !mobilePrimary.has(tool.key));
  const cityGuide = !NOMAD_TOOLS.some(tool => tool.href === pathname);
  const active = (href: string) => pathname === href || (href === '/nomads' && cityGuide);
  const activeOverflow = overflow.find(tool => active(tool.href));
  return (
    <nav aria-label="Nomad toolkit" className="nomad-navigation sticky top-14 z-20 mb-7 flex min-w-0 items-center gap-1 border-y border-border/70 bg-background">
      <Compass className="mx-2 hidden h-4 w-4 shrink-0 text-muted-foreground lg:block" aria-hidden />
      <div className="flex min-w-0 flex-1 gap-0.5 sm:gap-1">
        {main.map(tool => <Link key={tool.key} href={tool.href} prefetch={false} aria-current={active(tool.href) ? 'page' : undefined} className={cn(
          'min-h-12 shrink-0 items-center whitespace-nowrap border-b-2 px-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:px-3',
          mobilePrimary.has(tool.key) ? 'inline-flex' : 'hidden sm:inline-flex',
          active(tool.href) ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground',
        )}>{tool.label}</Link>)}
      </div>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger aria-label="More nomad tools" className={cn(
          'flex min-h-12 shrink-0 items-center gap-1 border-b-2 px-2.5 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:px-3',
          activeOverflow ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground',
          activeOverflow && main.includes(activeOverflow) && 'sm:border-transparent sm:text-muted-foreground',
        )}>More<ChevronDown className="h-4 w-4" aria-hidden /></DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="max-h-[70vh] w-64 max-w-[calc(100vw-2rem)] overflow-y-auto">
          {['Explore', 'Plan your stay', 'Money & resources'].map((group, index) => <div key={group}>
            {index > 0 && <DropdownMenuSeparator />}
            <DropdownMenuLabel>{group}</DropdownMenuLabel>
            {overflow.filter(tool => tool.group === group).map(tool => <DropdownMenuItem asChild key={tool.key} className={cn(main.includes(tool) && 'sm:hidden')}>
              <Link href={tool.href} prefetch={false} aria-current={active(tool.href) ? 'page' : undefined} className={cn('min-h-11', active(tool.href) && 'bg-muted font-semibold')}>{tool.label}</Link>
            </DropdownMenuItem>)}
          </div>)}
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );
}
