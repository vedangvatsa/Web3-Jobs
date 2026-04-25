'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Send, Users, Zap, ArrowRight, Rss } from 'lucide-react';
import { SITE_STATS } from '@/lib/constants';

interface TelegramPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TelegramPopup({ open, onOpenChange }: TelegramPopupProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[380px] rounded-xl border bg-card/95 backdrop-blur-md shadow-xl p-0 gap-0 overflow-hidden">
        {/* Top accent bar — subtle gradient strip */}
        <div className="h-1 w-full bg-gradient-to-r from-primary via-accent to-primary" />

        <div className="px-6 pt-5 pb-6 space-y-5">
          {/* Header */}
          <DialogHeader className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="bg-primary/10 rounded-full p-2.5">
                <Rss className="h-5 w-5 text-primary" />
              </div>
              <div>
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  Telegram Channel
                </span>
                <DialogTitle className="text-lg font-bold text-foreground leading-tight">
                  Never miss an opportunity
                </DialogTitle>
              </div>
            </div>
            <DialogDescription className="text-sm text-muted-foreground">
              Get curated Web3 jobs delivered to your phone daily.
            </DialogDescription>
          </DialogHeader>

          {/* Stats row */}
          <div className="flex items-center gap-5 text-sm">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Users className="h-3.5 w-3.5 text-primary" />
              <span className="font-semibold text-foreground">{SITE_STATS.telegramSubscribersFormatted}</span> members
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Zap className="h-3.5 w-3.5 text-primary" />
              Updated daily
            </span>
          </div>

          {/* CTA */}
          <a
            href={SITE_STATS.telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Button className="w-full h-11 text-sm font-semibold group" size="lg">
              <Send className="mr-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              Join Channel
              <ArrowRight className="ml-auto h-4 w-4 opacity-60 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </a>

          <button
            onClick={() => onOpenChange(false)}
            className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors py-0.5"
          >
            Maybe later
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
