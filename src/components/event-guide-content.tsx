import React, { type ReactNode } from 'react';
import type { EventEditorialArticle } from '@/lib/events';
import { splitEventDescriptionBlocks, type EventDescriptionBlock } from '@/lib/event-description-blocks';
import { renderDescriptionInline as renderTextWithLinks } from '@/lib/description-inline';

function renderBlocks(blocks: EventDescriptionBlock[]): ReactNode {
  return blocks.map((block, index) => {
    if (block.type === 'ul') return (
      <ul key={index} className="my-2 list-disc space-y-1.5 pl-5 marker:text-muted-foreground/70">
        {block.items.map((item, i) => <li key={i} className="whitespace-pre-line leading-relaxed">
          {renderTextWithLinks(item)}{block.children?.[i] && renderBlocks(block.children[i])}
        </li>)}
      </ul>
    );
    if (block.type === 'ol') return (
      <ol key={index} start={block.items[0].number} className="my-2 list-decimal space-y-1.5 pl-5 marker:text-muted-foreground/70">
        {block.items.map((item, i) => <li key={i} value={item.number} className="whitespace-pre-line leading-relaxed">
          {renderTextWithLinks(item.text)}{block.children?.[i] && renderBlocks(block.children[i])}
        </li>)}
      </ol>
    );
    if (block.type === 'heading') return <h3 key={index} className="text-lg font-semibold text-foreground">{renderTextWithLinks(block.text)}</h3>;
    if (block.type === 'agenda') return <p key={index} className="border-l-2 border-border pl-4 leading-relaxed">{renderTextWithLinks(block.text)}</p>;
    if (block.type === 'code') return <pre key={index} className="max-w-full overflow-x-auto whitespace-pre rounded-md bg-muted p-4 text-sm"><code>{block.text}</code></pre>;
    if (block.type === 'quote') return <blockquote key={index} className="pl-5 italic whitespace-pre-line leading-relaxed">{renderTextWithLinks(block.text)}</blockquote>;
    return <p key={index} className="whitespace-pre-line leading-relaxed">{renderTextWithLinks(block.text)}</p>;
  });
}

type EventGuideContentProps = {
  editorial: EventEditorialArticle;
  speakerSummary?: string;
  officialUrl?: string;
};

export function EventGuideContent({ editorial, speakerSummary, officialUrl }: EventGuideContentProps) {
  return (
    <section data-event-description data-content-status={editorial.descriptionStatus} className="mt-8 min-w-0 w-full space-y-10 break-words font-sans text-base text-muted-foreground [overflow-wrap:anywhere]">
      {editorial.summaryLead.trim() ? (
        <p className="text-base leading-relaxed whitespace-pre-line">{renderTextWithLinks(editorial.summaryLead)}</p>
      ) : null}

      {editorial.descriptionStatus === 'unavailable' && (
        <section className="space-y-3">
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">Event description</h2>
          <p>An organizer description has not been verified for this event.</p>
          {officialUrl && <p><a href={officialUrl} target="_blank" rel="noopener noreferrer" className="text-foreground underline underline-offset-4">View the organizer&apos;s event page</a></p>}
        </section>
      )}

      {editorial.sections.map((section, idx) => (
        <section key={idx} className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            {renderTextWithLinks(section.heading)}
          </h2>
          <div className="space-y-4 text-base leading-relaxed">
            {section.content.map((paragraph, pIdx) => {
              const blocks = splitEventDescriptionBlocks(paragraph);
              return (
                <div key={pIdx} className="space-y-3">
                  {renderBlocks(blocks)}
                </div>
              );
            })}
          </div>
        </section>
      ))}

      {speakerSummary && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">Speakers &amp; Program</h2>
          <p className="text-base leading-relaxed whitespace-pre-line">{renderTextWithLinks(speakerSummary)}</p>
        </section>
      )}

    </section>
  );
}
