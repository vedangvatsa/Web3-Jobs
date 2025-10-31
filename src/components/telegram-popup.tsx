'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Rss } from 'lucide-react';
import Image from 'next/image';

export function TelegramPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasBeenShown = sessionStorage.getItem('telegramPopupShown');
    if (!hasBeenShown) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        sessionStorage.setItem('telegramPopupShown', 'true');
      }, 5000); // Show popup after 5 seconds

      return () => clearTimeout(timer);
    }
  }, []);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <div className="relative h-48 w-full">
            <Image 
                src="https://images.unsplash.com/photo-1611606063065-ee7946f07375?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHx0ZWxlZ3JhbXxlbnwwfHx8fDE3MTk0MjYwMDV8MA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Telegram jobs channel"
                fill
                className="object-cover"
                data-ai-hint="telegram social media"
            />
        </div>
        <div className="p-6 text-center">
            <DialogHeader>
                <DialogTitle className="text-2xl font-bold">Join the #1 Web3 Job Board</DialogTitle>
                <DialogDescription className="mt-2 text-muted-foreground">
                    Get instant access to thousands of Web3, crypto, and blockchain jobs from top companies, delivered directly to you.
                </DialogDescription>
            </DialogHeader>
            <div className="mt-6">
                <a href="https://t.me/web3hiring" target="_blank" rel="noopener noreferrer" className="w-full">
                    <Button size="lg" className="w-full text-lg">
                        <Rss className="mr-2 h-5 w-5" />
                        Join 58,000+ Subscribers
                    </Button>
                </a>
                <p className="text-xs text-muted-foreground mt-3">on Telegram</p>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
