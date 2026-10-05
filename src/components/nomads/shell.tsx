import { PageShell } from '@/components/page-shell';
import { PageHeader } from '@/components/page-header';

export function NomadShell({ children, title, location, actions, align = 'center' }: { children: React.ReactNode; title: string; location?: React.ReactNode; actions?: React.ReactNode; align?: 'left' | 'center' }) {
  return (
    <main id="main-content" className="nomad-toolkit min-w-0 flex-1 [color-scheme:light] dark:[color-scheme:dark]">
      <PageShell containerClassName="min-w-0">
        <PageHeader title={title} description={location} align={align} actions={actions} />
        {children}
      </PageShell>
    </main>
  );
}
