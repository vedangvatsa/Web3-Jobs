'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPopupField } from '@/lib/popup-narrative';
import { POPUP_TYPE_LABELS } from '@/lib/popups';
import type { Popup } from '@/types/popup';

export function PopupCard({ popup }: { popup: Popup }) {
  return (
    <Link href={`/${popup.slug}`} className="block h-full">
      <Card className="flex h-full flex-col border-border/70 bg-card shadow-none transition-colors hover:border-foreground/25">
        <CardHeader className="flex flex-row items-start gap-3 px-4 pb-2 pt-4">
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border/60 bg-muted/40">
            {popup.image ? (
              <Image
                src={popup.image}
                alt=""
                width={44}
                height={44}
                className="h-full w-full object-cover"
                unoptimized
              />
            ) : (
              <span className="text-sm font-semibold text-muted-foreground">
                {popup.name.slice(0, 1)}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="line-clamp-2 text-base font-semibold leading-snug">
              {popup.name}
            </CardTitle>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {formatPopupField(popup.location)}
            </p>
          </div>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col px-4 pb-4 pt-1">
          <p className="line-clamp-3 text-xs leading-relaxed text-muted-foreground">
            {formatPopupField(popup.summary)}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <Badge variant="outline" className="text-[10px] font-normal">
              {POPUP_TYPE_LABELS[popup.type]}
            </Badge>
            {popup.themes.slice(0, 2).map((theme) => (
              <Badge key={theme} variant="secondary" className="text-[10px] font-normal">
                {theme}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
