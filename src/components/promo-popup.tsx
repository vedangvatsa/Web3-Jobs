'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import Image from 'next/image';
import Link from 'next/link';

export function PromoPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasBeenShown = sessionStorage.getItem('promoPopupShown');
    if (!hasBeenShown) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        sessionStorage.setItem('promoPopupShown', 'true');
      }, 3000); // Delay opening for 3 seconds

      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="p-0 border-0 max-w-3xl bg-transparent shadow-2xl">
        <DialogTitle className="sr-only">Super Hackathon Promotion</DialogTitle>
        <DialogDescription className="sr-only">A promotional image for the Super Hackathon. Click to learn more.</DialogDescription>
        <Link href="https://bit.ly/SuperHackathon" passHref legacyBehavior>
          <a target="_blank" rel="noopener noreferrer" className="block cursor-pointer">
            <Image
              src="/logo/promo/Super_Hackathon.jpeg"
              alt="Super Hackathon Promotion"
              width={600}
              height={600}
              className="rounded-lg w-full h-auto"
            />
          </a>
        </Link>
      </DialogContent>
    </Dialog>
  );
}
