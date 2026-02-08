'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ArrowRight, Rss } from 'lucide-react';

interface TelegramPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TelegramPopup({ open, onOpenChange }: TelegramPopupProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-4">
              <Rss className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center text-xl font-bold">Never Miss an Opportunity</DialogTitle>
          <DialogDescription className="text-center">
            Join our Telegram channel with over 60,000 subscribers to get instant alerts for the latest Web3 jobs.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <a href="https://t.me/web3hiring" target="_blank" rel="noopener noreferrer" className="w-full">
            <Button size="lg" className="w-full">
              Join Job Feed <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
