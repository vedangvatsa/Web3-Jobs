'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Send, Zap, Users } from 'lucide-react';
import { SITE_STATS } from '@/lib/constants';

interface TelegramPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TelegramPopup({ open, onOpenChange }: TelegramPopupProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Get jobs in your pocket</DialogTitle>
          <DialogDescription>
            Real-time alerts from our 60K+ subscriber community.
          </DialogDescription>
        </DialogHeader>

        {/* Social proof row */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            {SITE_STATS.telegramSubscribersFormatted} members
          </span>
          <span className="flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5" />
            Updated daily
          </span>
        </div>

        {/* CTA */}
        <div className="space-y-3 pt-1">
          <a href={SITE_STATS.telegramUrl} target="_blank" rel="noopener noreferrer" className="block">
            <Button className="w-full">
              Join Telegram <Send className="ml-2 h-3.5 w-3.5" />
            </Button>
          </a>

          <button
            onClick={() => onOpenChange(false)}
            className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Maybe later
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
