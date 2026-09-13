'use client';

import { useEffect } from 'react';

const CLARITY_PROJECT_ID = 'yc68wsif01';

export function ClarityInit() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;

    const allowedHosts = ['hashtagweb3.com', 'www.hashtagweb3.com'];
    if (!allowedHosts.includes(window.location.hostname)) return;

    const initialize = () => {
      void import('@microsoft/clarity').then(({ default: clarity }) => {
        clarity.init(CLARITY_PROJECT_ID);
      });
    };

    if (document.readyState === 'complete') {
      initialize();
      return;
    }

    window.addEventListener('load', initialize, { once: true });
    return () => window.removeEventListener('load', initialize);
  }, []);

  return null;
}
