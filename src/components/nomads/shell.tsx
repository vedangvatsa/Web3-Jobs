import { PageShell } from '@/components/page-shell';
import { PageHeader } from '@/components/page-header';
import { cn } from '@/lib/utils';
import { NomadNavigation } from './navigation';

export function NomadShell({ children, title, location, actions, align = 'center' }: { children: React.ReactNode; title: string; location?: React.ReactNode; actions?: React.ReactNode; align?: 'left' | 'center' }) {
  return (
    <main id="main-content" className="nomad-toolkit min-w-0 flex-1 [color-scheme:light] dark:[color-scheme:dark]">
      <PageShell containerClassName="min-w-0">
        <div className={cn('mb-5 flex flex-col gap-3', align === 'left' && 'sm:flex-row sm:items-end sm:justify-between')}>
          <PageHeader title={title} description={location} align={align} className={cn('mb-0 min-w-0 md:mb-0', align === 'left' && '[&>p]:mx-0')} />
          {actions && <div className={cn('flex shrink-0 flex-wrap gap-2', align === 'center' ? 'justify-center' : 'sm:justify-end')}>{actions}</div>}
        </div>
        <NomadNavigation />
        {children}
      </PageShell>
    </main>
  );
}
