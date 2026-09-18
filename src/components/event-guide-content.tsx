import type { EventEditorialArticle } from '@/lib/events';

type EventGuideContentProps = {
  editorial: EventEditorialArticle;
  speakerSummary?: string;
};

type Block =
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] };

function splitParagraphIntoBlocks(paragraph: string): Block[] {
  const lines = paragraph.split('\n');
  const blocks: Block[] = [];
  let currentBullets: string[] = [];
  let currentTextLines: string[] = [];

  const flushBullets = () => {
    if (currentBullets.length > 0) {
      blocks.push({ type: 'ul', items: [...currentBullets] });
      currentBullets = [];
    }
  };

  const flushText = () => {
    if (currentTextLines.length > 0) {
      blocks.push({ type: 'p', text: currentTextLines.join('\n') });
      currentTextLines = [];
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (/^[-*•·▪–—]\s+/.test(trimmed)) {
      flushText();
      currentBullets.push(trimmed.replace(/^[-*•·▪–—]\s+/, ''));
    } else {
      flushBullets();
      currentTextLines.push(line);
    }
  }

  flushBullets();
  flushText();
  return blocks;
}

export function EventGuideContent({ editorial, speakerSummary }: EventGuideContentProps) {
  return (
    <section className="mt-8 max-w-none space-y-10 font-sans text-base text-muted-foreground">
      <p className="text-base leading-relaxed whitespace-pre-line">{editorial.summaryLead}</p>

      {editorial.sections.map((section, idx) => (
        <section key={idx} className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            {section.heading}
          </h2>
          <div className="space-y-4 text-base leading-relaxed">
            {section.content.map((paragraph, pIdx) => {
              const blocks = splitParagraphIntoBlocks(paragraph);
              return (
                <div key={pIdx} className="space-y-3">
                  {blocks.map((block, bIdx) => {
                    if (block.type === 'ul') {
                      return (
                        <ul key={bIdx} className="my-2 list-disc space-y-1.5 pl-5 marker:text-muted-foreground/70">
                          {block.items.map((item, itemIdx) => (
                            <li key={itemIdx} className="leading-relaxed">
                              {item}
                            </li>
                          ))}
                        </ul>
                      );
                    }
                    return (
                      <p key={bIdx} className="whitespace-pre-line leading-relaxed">
                        {block.text}
                      </p>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </section>
      ))}

      {speakerSummary && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">Speakers &amp; Program</h2>
          <p className="text-base leading-relaxed whitespace-pre-line">{speakerSummary}</p>
        </section>
      )}
    </section>
  );
}

