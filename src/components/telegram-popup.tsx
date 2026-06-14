"use client";

import { useEffect, useState } from"react";
import { usePathname } from"next/navigation";

export function PromoPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (pathname ==="/") return;
    if (localStorage.getItem("hw3_popup_dismissed")) return;
    const t = setTimeout(() => setIsOpen(true), 5000);
    return () => clearTimeout(t);
  }, [pathname]);

  const dismiss = () => {
    setIsOpen(false);
    localStorage.setItem("hw3_popup_dismissed","true");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={dismiss} />
      <div className="relative bg-background border rounded-lg shadow-lg w-full max-w-sm p-6">
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground text-lg leading-none"
          aria-label="Close"
        >
          ✕
        </button>

        <p className="text-lg font-semibold tracking-tight">
          Discover more from Hashtag Web3
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Daily Web3 jobs. 60,000+ subscribers.
        </p>

        <div className="mt-5 space-y-2.5">
          <a
            href="https://t.me/web3hiring?utm_source=hashtagweb3&utm_medium=popup&utm_campaign=promo"
            target="_blank"
            rel="noopener noreferrer"
            onClick={dismiss}
            className="block w-full text-center text-sm font-medium py-2 px-4 rounded-md bg-foreground text-background hover:opacity-90 transition-opacity"
          >
            Join on Telegram
          </a>
          <a
            href="https://cvin.bio/?utm_source=hashtagweb3&utm_medium=popup&utm_campaign=promo"
            target="_blank"
            rel="noopener noreferrer"
            onClick={dismiss}
            className="block w-full text-center text-sm font-medium py-2 px-4 rounded-md border hover:bg-muted transition-colors"
          >
            Make your CV a website
          </a>
        </div>

        <button
          onClick={dismiss}
          className="block mx-auto mt-4 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          No thanks
        </button>
      </div>
    </div>
  );
}
