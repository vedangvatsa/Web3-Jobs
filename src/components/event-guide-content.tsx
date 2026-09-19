import type { ReactNode } from 'react';
import type { EventEditorialArticle } from '@/lib/events';

const INLINE_URL_RE = /https?:\/\/[^\s<>"']+/g;

function renderTextWithLinks(text: string): ReactNode {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  for (const match of text.matchAll(INLINE_URL_RE)) {
    const url = match[0];
    const index = match.index ?? 0;
    if (index > lastIndex) {
      nodes.push(text.slice(lastIndex, index));
    }
    nodes.push(
      <a
        key={`${index}-${url}`}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-foreground underline underline-offset-4"
      >
        {url}
      </a>,
    );
    lastIndex = index + url.length;
  }
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }
  return nodes.length === 1 ? nodes[0] : nodes;
}

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
    if (/^(?:[-*•·▪–—]|\d+[.)])\s*/.test(trimmed) && trimmed.length > 1) {
      flushText();
      currentBullets.push(trimmed.replace(/^(?:[-*•·▪–—]|\d+[.)])\s*/, ''));
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
    <section className="mt-8 w-full space-y-10 font-sans text-base text-muted-foreground">
      <p className="text-base leading-relaxed whitespace-pre-line">{renderTextWithLinks(editorial.summaryLead)}</p>

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
                              {renderTextWithLinks(item)}
                            </li>
                          ))}
                        </ul>
                      );
                    }
                    return (
                      <p key={bIdx} className="whitespace-pre-line leading-relaxed">
                        {renderTextWithLinks(block.text)}
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
          <p className="text-base leading-relaxed whitespace-pre-line">{renderTextWithLinks(speakerSummary)}</p>
        </section>
      )}
    </section>
  );
}

