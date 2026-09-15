import { PageShell } from '@/components/page-shell';
import { PopupDetailView } from '@/components/popup-detail-view';
import type { Popup } from '@/types/popup';

export function PopupDetailPage({ popup }: { popup: Popup }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-1">
        <PageShell>
          <PopupDetailView popup={popup} />
        </PageShell>
      </main>
    </div>
  );
}
