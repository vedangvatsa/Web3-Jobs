
'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function ContentSecurity() {
  const pathname = usePathname();

  useEffect(() => {
    // These are the paths where content protection should be disabled
    const disabledPaths = ['/resume-builder', '/invoice-generator'];

    if (disabledPaths.includes(pathname)) {
      return; // Don't apply any restrictions on these pages
    }

    const preventDefault = (e: Event) => e.preventDefault();

    document.addEventListener('contextmenu', preventDefault);
    document.addEventListener('copy', preventDefault);
    document.addEventListener('selectstart', preventDefault);

    // Apply user-select none to body to prevent text selection
    document.body.style.webkitUserSelect = 'none';
    document.body.style.mozUserSelect = 'none';
    document.body.style.msUserSelect = 'none';
    document.body.style.userSelect = 'none';

    return () => {
      document.removeEventListener('contextmenu', preventDefault);
      document.removeEventListener('copy', preventDefault);
      document.removeEventListener('selectstart', preventDefault);

      // Clean up body style on component unmount
      document.body.style.webkitUserSelect = '';
      document.body.style.mozUserSelect = '';
      document.body.style.msUserSelect = '';
      document.body.style.userSelect = '';
    };
  }, [pathname]);

  return null;
}
