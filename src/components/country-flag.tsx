import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CountryFlag({ code, emoji, className }: { code?: string | null; emoji?: string; className?: string }) {
  const flag = emoji || (code && /^[a-z]{2}$/i.test(code) ? String.fromCodePoint(...code.toUpperCase().split('').map(letter => 127397 + letter.charCodeAt(0))) : null);
  return <span data-country-flag={code || ''} aria-hidden="true" className={cn('inline-flex h-6 w-7 shrink-0 items-center justify-center text-xl leading-none', className)}>{flag || <Globe className="h-4 w-4 text-muted-foreground" />}</span>;
}
