"use client";

import { useEffect, useState } from"react";
import { usePathname } from"next/navigation";
import { X } from 'lucide-react';

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
      <div className="relative bg-background border rounded-lg shadow-lg w-full max-w-sm px-6 py-5">
        <button
          onClick={dismiss}
          className="absolute top-3.5 right-3.5 text-muted-foreground hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        <p className="text-lg font-semibold tracking-tight text-center pt-1">
          Discover more from Hashtag Web3
        </p>

        <div className="mt-4 space-y-2.5">
          <a
            href="https://t.me/web3hiring?utm_source=hashtagweb3&utm_medium=popup&utm_campaign=promo"
            target="_blank"
            rel="noopener noreferrer"
            onClick={dismiss}
            className="block w-full text-center text-sm font-medium py-2 px-4 rounded-md bg-foreground text-background hover:opacity-90 transition-opacity"
          >
            Web3 Job Feed
          </a>
          <a
            href="https://t.me/web3newsfeed?utm_source=hashtagweb3&utm_medium=popup&utm_campaign=promo"
            target="_blank"
            rel="noopener noreferrer"
            onClick={dismiss}
            className="block w-full text-center text-sm font-medium py-2 px-4 rounded-md border hover:bg-muted transition-colors"
          >
            Web3 News Feed
          </a>
          <a
            href="https://t.me/hashtagweb3?utm_source=hashtagweb3&utm_medium=popup&utm_campaign=promo"
            target="_blank"
            rel="noopener noreferrer"
            onClick={dismiss}
            className="block w-full text-center text-sm font-medium py-2 px-4 rounded-md border hover:bg-muted transition-colors"
          >
            Web3 Networking Group
          </a>
        </div>
      </div>
    </div>
  );
}
