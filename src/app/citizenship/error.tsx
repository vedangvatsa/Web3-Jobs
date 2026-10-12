'use client';
import { NomadShell } from '@/components/nomads/shell';
import { NomadPanel, ResourceLink } from '@/components/nomads/ui';
import { Button } from '@/components/ui/button';

export default function CitizenshipError({ reset }: { reset: () => void }) {
  return <NomadShell title="Citizenship resource unavailable"><NomadPanel role="alert"><p>The citizenship page could not be loaded. Retry, or return to the directory.</p><div className="mt-4 flex flex-wrap gap-4"><Button variant="outline" className="h-auto min-h-11 whitespace-normal" onClick={reset}>Retry citizenship page</Button><ResourceLink href="/citizenship">Citizenship directory</ResourceLink></div></NomadPanel></NomadShell>;
}
