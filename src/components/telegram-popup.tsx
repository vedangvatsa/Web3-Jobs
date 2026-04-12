'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Send, Users, Zap, ArrowRight } from 'lucide-react';
import { SITE_STATS } from '@/lib/constants';

interface TelegramPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TelegramPopup({ open, onOpenChange }: TelegramPopupProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[360px] p-0 gap-0 overflow-hidden border-0 shadow-2xl">
        {/* Accent header strip */}
        <div className="bg-primary px-6 pt-6 pb-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-white/20 rounded-md p-1.5">
              <Send className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-xs font-medium text-primary-foreground/80 uppercase tracking-wider">
              Telegram Channel
            </span>
          </div>
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-xl font-bold text-primary-foreground">
              Never miss an opportunity
            </DialogTitle>
            <DialogDescription className="text-sm text-primary-foreground/70">
              Get curated Web3 jobs delivered to your phone daily.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Stats */}
          <div className="flex items-center gap-6 text-sm">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Users className="h-3.5 w-3.5 text-primary" />
              <span className="font-medium text-foreground">{SITE_STATS.telegramSubscribersFormatted}</span> members
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
            <Button className="w-full h-11 text-sm font-semibold" size="lg">
              Join Channel
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </a>

          <button
            onClick={() => onOpenChange(false)}
            className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
          >
            Maybe later
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
