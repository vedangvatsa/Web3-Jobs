'use client';

import { useEffect } from 'react';
import clarity from '@microsoft/clarity';

const CLARITY_PROJECT_ID = 'yc68wsif01';

export function ClarityInit() {
  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      const allowedHosts = ['hashtagweb3.com', 'www.hashtagweb3.com'];
      if (allowedHosts.includes(window.location.hostname)) {
        clarity.init(CLARITY_PROJECT_ID);
      }
    }
  }, []);

  return null;
}
