'use client';

import Script from 'next/script';
import { useEffect } from 'react';

declare global {
  interface Window {
    twttr?: {
      widgets: {
        load: (element?: HTMLElement) => void;
      };
    };
  }
}

function loadTwitterWidgets() {
  window.twttr?.widgets?.load();
}

/** Hydrates `blockquote.twitter-tweet` markup after X widgets.js loads. */
export function TwitterWidgetsLoader() {
  useEffect(() => {
    loadTwitterWidgets();
  }, []);

  return (
    <Script
      id="twitter-widgets"
      src="https://platform.twitter.com/widgets.js"
      strategy="lazyOnload"
      onLoad={loadTwitterWidgets}
    />
  );
}
