import Link from 'next/link';
import { cloneElement, useId } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollableRegion } from './scrollable-region';
import { FilterSelect } from '@/components/ui/filter-select';
export { FilterSelect } from '@/components/ui/filter-select';
import type { CitySummary } from '@/lib/nomads/types';

export const inputStyle = 'h-11 min-h-11 w-full min-w-0 rounded-md border border-input bg-background px-3 py-2 text-base text-foreground shadow-none ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm';
export const buttonStyle = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
export const primaryButtonStyle = cn(buttonStyle, 'border-primary bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground');

export function NomadPanel({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <Card className={cn('min-w-0 border-border/70 p-4 shadow-none sm:p-6', className)} {...props}>{children}</Card>;
}
export function Field({ label, children, hint, className }: { label: string; children: React.ReactElement<{ id?: string; 'aria-describedby'?: string }>; hint?: string; className?: string }) {
  const generatedId = useId();
  const id = children.props.id || generatedId;
  const describedBy = [children.props['aria-describedby'], hint ? `${id}-hint` : undefined].filter(Boolean).join(' ') || undefined;
  return <div className={cn('flex min-w-0 flex-col gap-2 text-sm', className)}>
    <label htmlFor={id} className="font-medium">{label}</label>
    {children.type === 'input' ? <Input {...children.props as React.ComponentProps<'input'>} id={id} aria-describedby={describedBy} /> : cloneElement(children, { id, 'aria-describedby': describedBy })}
    {hint && <span id={`${id}-hint`} className="text-xs leading-relaxed text-muted-foreground">{hint}</span>}
  </div>;
}
export function CitySelect({ cities, label, value, onChange, exclude, emptyLabel }: { cities: CitySummary[]; label: string; value: string; onChange: (value: string) => void; exclude?: string; emptyLabel?: string }) {
  return <Field label={label}><FilterSelect aria-label={label} value={value} onValueChange={onChange}>{emptyLabel && <option value="">{emptyLabel}</option>}{[...cities].sort((a, b) => a.name.localeCompare(b.name)).filter(city => city.slug !== exclude).map(city => <option key={city.slug} value={city.slug}>{city.name}, {city.country}</option>)}</FilterSelect></Field>;
}
export function MetricCard({ label, value, detail }: { label: string; value: React.ReactNode; detail?: string }) {
  return <div className="min-w-0 rounded-lg border border-border/70 bg-card p-4 text-card-foreground last:odd:col-span-2 lg:last:odd:col-span-1"><dt className="text-xs font-medium leading-relaxed text-muted-foreground">{label}</dt><dd className="mt-2 break-words text-2xl font-semibold tracking-tight tabular-nums">{value}</dd>{detail && <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{detail}</p>}</div>;
}
export function TableFrame({ children, label }: { children: React.ReactNode; label: string }) {
  return <ScrollableRegion label={label}>{children}</ScrollableRegion>;
}
export const tableStyle = 'w-full text-left text-sm [&_th]:px-4 [&_th]:py-3 [&_thead_th]:whitespace-nowrap [&_thead_th]:bg-muted/40 [&_thead_th]:text-xs [&_thead_th]:font-semibold [&_thead_th]:text-muted-foreground [&_tbody_th]:font-medium [&_tbody_th]:text-foreground [&_td]:px-4 [&_td]:py-3 [&_tbody_tr]:border-t [&_tbody_tr]:border-border/70 [&_tbody_tr]:transition-colors [&_tbody_tr:hover]:bg-muted/30 [&_a]:underline-offset-4 [&_a:hover]:underline [&_a:focus-visible]:outline-none [&_a:focus-visible]:ring-2 [&_a:focus-visible]:ring-ring';
export function EmptyResults({ children, onReset }: { children?: React.ReactNode; onReset?: () => void }) {
  return <div role="status" className="rounded-lg border border-dashed px-6 py-14 text-center"><p className="text-lg font-medium">{children || 'No matches for these filters.'}</p><p className="mt-2 text-sm text-muted-foreground">Try adjusting your search or filters.</p>{onReset && <button className={cn(buttonStyle, 'mt-4')} onClick={onReset}>Clear filters</button>}</div>;
}
export function SourceNote({ children }: { children: React.ReactNode }) {
  return <div className="mt-8 border-t pt-4 text-xs leading-relaxed text-muted-foreground">{children}</div>;
}
export function ResourceLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <Link href={href} prefetch={false} className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline">{children}<ArrowUpRight className="h-3.5 w-3.5" aria-hidden /></Link>;
}
