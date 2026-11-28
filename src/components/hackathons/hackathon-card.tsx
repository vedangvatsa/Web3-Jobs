'use client';

import { useState } from 'react';
import type { Hackathon } from '@/types';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

function getDomain(urlStr: string): string | null {
  try {
    const parsed = new URL(urlStr);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

export function HackathonCard({ hackathon }: { hackathon: Hackathon }) {
  const domain = getDomain(hackathon.url);
  const [srcAttempt, setSrcAttempt] = useState(0);

  const initial = (hackathon.ecosystem || hackathon.organizer || 'W3').trim().slice(0, 2).toUpperCase();

  const faviconUrls = domain
    ? [
        `https://icons.duckduckgo.com/ip3/${domain}.ico`,
        `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
      ]
    : [];

  const currentFavicon = srcAttempt < faviconUrls.length ? faviconUrls[srcAttempt] : null;

  const handleNextAttempt = () => {
    setSrcAttempt((prev) => prev + 1);
  };

  return (
    <a
      href={hackathon.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block h-full min-w-0"
    >
      <Card className="flex h-full min-w-0 flex-col border-border/70 bg-card shadow-none hover:border-foreground/25">
        <CardHeader className="px-4 pb-3 pt-4 min-w-0">
          <div className="flex min-w-0 items-start gap-3">
            <div className="h-10 w-10 shrink-0 flex items-center justify-center bg-transparent overflow-hidden">
              {currentFavicon ? (
                <img
                  key={currentFavicon}
                  src={currentFavicon}
                  alt={`${hackathon.organizer} favicon`}
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-sm object-contain"
                  loading="lazy"
                  onError={handleNextAttempt}
                  onLoad={(e) => {
                    const img = e.currentTarget;
                    if (img.naturalWidth > 0 && img.naturalWidth <= 16 && img.naturalHeight <= 16) {
                      handleNextAttempt();
                    }
                  }}
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-muted/40 font-bold text-foreground/70 select-none text-xs">
                  <span>{initial}</span>
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle
                className="text-base leading-snug font-semibold line-clamp-2"
                title={hackathon.title}
              >
                {hackathon.title}
              </CardTitle>
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {hackathon.organizer}
              </p>
              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground truncate">
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                  {hackathon.prizePool}
                </span>
                <span className="text-muted-foreground/60 shrink-0">•</span>
                <span className="truncate">{hackathon.format}</span>
                {hackathon.submissionPeriod && (
                  <>
                    <span className="text-muted-foreground/60 shrink-0">•</span>
                    <span className="truncate">{hackathon.submissionPeriod}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>
    </a>
  );
}
