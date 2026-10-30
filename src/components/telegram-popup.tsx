"use client";

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Facebook, Linkedin, X } from 'lucide-react';
import { XBrandIcon } from '@/components/x-brand-icon';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function PromoPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === '/') return;
    if (localStorage.getItem('hw3_popup_dismissed')) return;
    const t = setTimeout(() => setIsOpen(true), 5000);
    return () => clearTimeout(t);
  }, [pathname]);

  const dismiss = () => {
    setIsOpen(false);
    localStorage.setItem('hw3_popup_dismissed', 'true');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={dismiss} aria-hidden="true" />
      <div
        className="relative w-full max-w-sm rounded-lg border border-border bg-card px-6 py-5 text-card-foreground shadow-lg"
        role="dialog"
        aria-labelledby="promo-popup-title"
      >
        <button
          type="button"
          onClick={dismiss}
          className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'absolute right-2 top-2 h-9 w-9 text-muted-foreground')}
          aria-label="Close"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        <p id="promo-popup-title" className="pt-1 text-center text-lg font-semibold tracking-tight text-zinc-900">
          Discover more from Hashtag Web3
        </p>

        <div className="mt-4 space-y-2.5">
          <a
            href="https://t.me/web3hiring"
            target="_blank"
            rel="noopener noreferrer"
            onClick={dismiss}
            className={cn(
              buttonVariants({ variant: 'default' }),
              'h-10 w-full bg-zinc-900 text-white hover:bg-zinc-800'
            )}
          >
            Web3 Jobs Feed
          </a>
          <a
            href="https://t.me/eventsweb3"
            target="_blank"
            rel="noopener noreferrer"
            onClick={dismiss}
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'h-10 w-full border-zinc-200 text-zinc-900 hover:bg-zinc-50 hover:text-zinc-900'
            )}
          >
            Web3 Events Feed
          </a>
          <a
            href="https://t.me/web3newsfeed"
            target="_blank"
            rel="noopener noreferrer"
            onClick={dismiss}
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'h-10 w-full border-zinc-200 text-zinc-900 hover:bg-zinc-50 hover:text-zinc-900'
            )}
          >
            Web3 News Feed
          </a>
          <a
            href="https://t.me/hashtagweb3"
            target="_blank"
            rel="noopener noreferrer"
            onClick={dismiss}
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'h-10 w-full border-zinc-200 text-zinc-900 hover:bg-zinc-50 hover:text-zinc-900'
            )}
          >
            Web3 Networking Group
          </a>
        </div>

        <div className="mt-4 flex items-center justify-center gap-4 border-t border-zinc-100 pt-3.5">
          <a
            href="https://www.linkedin.com/company/hashtagweb3"
            target="_blank"
            rel="noopener noreferrer"
            onClick={dismiss}
            className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
            aria-label="Follow us on LinkedIn"
          >
            <Linkedin size={18} />
            <span className="sr-only">LinkedIn</span>
          </a>
          <a
            href="https://x.com/hashtag_web3"
            target="_blank"
            rel="noopener noreferrer"
            onClick={dismiss}
            className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
            aria-label="Follow us on X"
          >
            <XBrandIcon size={18} />
            <span className="sr-only">X (formerly Twitter)</span>
          </a>
          <a
            href="https://www.facebook.com/hashtagweb3"
            target="_blank"
            rel="noopener noreferrer"
            onClick={dismiss}
            className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
            aria-label="Follow us on Facebook"
          >
            <Facebook size={18} />
            <span className="sr-only">Facebook</span>
          </a>
        </div>
      </div>
    </div>
  );
}
