import type { EventEditorialArticle } from '@/lib/events';

type EventGuideContentProps = {
  editorial: EventEditorialArticle;
  speakerSummary?: string;
};

export function EventGuideContent({ editorial, speakerSummary }: EventGuideContentProps) {
  return (
    <section className="mt-8 max-w-none space-y-10 font-sans text-base text-muted-foreground">
      <p className="text-base leading-relaxed">{editorial.summaryLead}</p>

      {editorial.sections.map((section, idx) => (
        <section key={idx} className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            {section.heading}
          </h2>
          <div className="space-y-4 text-base leading-relaxed">
            {section.content.map((paragraph, pIdx) => (
              <p key={pIdx}>{paragraph}</p>
            ))}
          </div>
        </section>
      ))}

      {speakerSummary && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">Speakers &amp; Program</h2>
          <p className="text-base leading-relaxed">{speakerSummary}</p>
        </section>
      )}
    </section>
  );
}
