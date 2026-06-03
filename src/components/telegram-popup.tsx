"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Send, Globe, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PromoPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem("hashtagweb3_promo_popup_dismissed");
    if (isDismissed) return;

    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 5000); // 5 seconds delay

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsOpen(false);
    localStorage.setItem("hashtagweb3_promo_popup_dismissed", "true");
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleDismiss}
          className="absolute inset-0 bg-black/40"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 8 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative z-10 w-full max-w-lg overflow-hidden rounded-xl border bg-background p-6 shadow-xl md:p-8"
        >
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus:outline-none"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Header */}
          <div className="mb-6">
            <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Stay ahead in Web3
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
              Get daily job alerts on Telegram, or turn your resume into a personal website.
            </p>
          </div>

          {/* Two cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Telegram Job Feed */}
            <div className="flex flex-col justify-between rounded-lg border bg-card p-4 hover:border-foreground/20 transition-all duration-200">
              <div>
                <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
                  <Send className="h-4 w-4 text-sky-500" />
                  <span>Job Feed</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  Join <b>60,000+</b> subscribers getting daily Web3 jobs on Telegram. No spam.
                </p>
              </div>
              <div className="mt-4">
                <a
                  href="https://t.me/web3hiring?utm_source=hashtagweb3&utm_medium=popup&utm_campaign=promo_popup"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleDismiss}
                >
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full h-8 text-xs border-slate-200 dark:border-slate-800 hover:bg-muted font-medium flex items-center justify-center gap-1"
                  >
                    Join @web3hiring
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </a>
              </div>
            </div>

            {/* CV in Bio */}
            <div className="flex flex-col justify-between rounded-lg border bg-card p-4 hover:border-foreground/20 transition-all duration-200">
              <div>
                <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
                  <Globe className="h-4 w-4 text-indigo-500" />
                  <span>CV to Website</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  Turn your resume into a clean portfolio website on <b>cvin.bio</b> in seconds.
                </p>
              </div>
              <div className="mt-4">
                <a
                  href="https://cvin.bio/?utm_source=hashtagweb3&utm_medium=popup&utm_campaign=promo_popup"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleDismiss}
                >
                  <Button
                    size="sm"
                    className="w-full h-8 text-xs bg-foreground text-background hover:bg-foreground/90 font-medium flex items-center justify-center gap-1 shadow-sm"
                  >
                    Build Website
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </a>
              </div>
            </div>
          </div>

          {/* Dismiss */}
          <div className="mt-6 text-center">
            <button
              onClick={handleDismiss}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors hover:underline underline-offset-2"
            >
              Skip for now
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
