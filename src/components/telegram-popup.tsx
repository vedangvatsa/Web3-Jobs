'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import { Send, Zap, Users } from 'lucide-react';

interface TelegramPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TelegramPopup({ open, onOpenChange }: TelegramPopupProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm p-0 overflow-hidden border-0 shadow-2xl">
        <VisuallyHidden>
          <DialogTitle>Telegram Channel Invitation</DialogTitle>
          <DialogDescription>
            Join our Telegram channel to get instant job alerts
          </DialogDescription>
        </VisuallyHidden>

        {/* Top accent bar */}
        <div className="h-1 bg-primary w-full" />

        <div className="px-6 pt-5 pb-6 space-y-5">
          {/* Header */}
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight">Get jobs in your pocket</h2>
            <p className="text-sm text-muted-foreground">
              Real-time alerts from 60K+ subscribers.
            </p>
          </div>

          {/* Social proof row */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              60,000+ members
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5" />
              Updated daily
            </span>
          </div>

          {/* CTA */}
          <a href="https://t.me/web3hiring" target="_blank" rel="noopener noreferrer" className="block">
            <Button size="default" className="w-full">
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
