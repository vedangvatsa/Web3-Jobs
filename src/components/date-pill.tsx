export function DatePill({ month, day }: { month: string; day: string }) {
  return (
    <div className="flex h-10 w-10 shrink-0 select-none flex-col items-center justify-center rounded-md border border-border/60 bg-muted/40 text-center">
      <span className="text-[10px] font-bold uppercase leading-none tracking-tight text-primary">
        {month}
      </span>
      <span className="mt-1 text-sm font-extrabold leading-none text-foreground">{day}</span>
    </div>
  );
}
