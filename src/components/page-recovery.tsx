import React from 'react';

export function PageRecovery() {
  // Leave before React bootstraps the fallback layout; no-JS browsers use the meta refresh.
  return <>
    <noscript dangerouslySetInnerHTML={{ __html: '<meta http-equiv="refresh" content="0;url=/">' }} />
    <script dangerouslySetInnerHTML={{ __html: "window.location.replace('/');" }} />
  </>;
}
