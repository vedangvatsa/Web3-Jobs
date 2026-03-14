'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import { Send } from 'lucide-react';

interface TelegramPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TelegramPopup({ open, onOpenChange }: TelegramPopupProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <VisuallyHidden>
          <DialogTitle>Telegram Channel Invitation</DialogTitle>
          <DialogDescription>
            Join our Telegram channel to get instant job alerts
          </DialogDescription>
        </VisuallyHidden>
        <div className="flex flex-col items-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 mb-4 shadow-lg">
            <Send className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-center text-2xl font-bold">Never Miss an Opportunity</h2>
          <p className="text-center text-base pt-2 text-muted-foreground">
            Join our Telegram channel with over 60,000 subscribers to get instant alerts for the latest Web3 jobs.
          </p>
        </div>
        <a href="https://t.me/web3hiring" target="_blank" rel="noopener noreferrer" className="w-full">
          <Button size="lg" className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
            Join Telegram Channel <Send className="ml-2 h-4 w-4" />
          </Button>
        </a>
      </DialogContent>
    </Dialog>
  );
}
