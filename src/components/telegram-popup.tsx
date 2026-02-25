'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ArrowRight, Send } from 'lucide-react';

interface TelegramPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TelegramPopup({ open, onOpenChange }: TelegramPopupProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 mb-4 shadow-lg">
            <Send className="h-8 w-8 text-white" />
          </div>
          <DialogTitle className="text-center text-2xl font-bold">Never Miss an Opportunity</DialogTitle>
          <DialogDescription className="text-center text-base pt-2">
            Join 60,000+ Web3 professionals on Telegram for instant job alerts.
          </DialogDescription>
        </DialogHeader>
        <a href="https://t.me/web3hiring" target="_blank" rel="noopener noreferrer" className="w-full">
          <Button size="lg" className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
            Join Telegram Channel <Send className="ml-2 h-4 w-4" />
          </Button>
        </a>
      </DialogContent>
    </Dialog>
  );
}
