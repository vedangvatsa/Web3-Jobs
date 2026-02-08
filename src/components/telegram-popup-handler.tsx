'use client';

import { TelegramPopup } from '@/components/telegram-popup';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function TelegramPopupHandler() {
  const [showPopup, setShowPopup] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Do not show on the homepage or community page (they have their own CTAs)
    if (pathname === '/' || pathname === '/community') {
      return;
    }

    const timer = setTimeout(() => {
      const popupShown = sessionStorage.getItem('telegramPopupShown');
      if (!popupShown) {
        setShowPopup(true);
        sessionStorage.setItem('telegramPopupShown', 'true');
      }
    }, 5000); // 5-second delay

    return () => clearTimeout(timer);
  }, [pathname]);

  if (pathname === '/' || pathname === '/community') {
    return null;
  }

  return <TelegramPopup open={showPopup} onOpenChange={setShowPopup} />;
}
